import rateLimit from "express-rate-limit";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// Per-IP rate limit on auth endpoints: 20 req/15min
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TOO_MANY_REQUESTS", message: "Too many requests, try again in 15 minutes." },
  keyGenerator: (req) => req.ip ?? "unknown",
  skip: () => process.env.NODE_ENV === "development",
});

// Strict login rate limit: 5 req/15min per IP
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TOO_MANY_REQUESTS", message: "Too many login attempts, try again in 15 minutes." },
  keyGenerator: (req) => req.ip ?? "unknown",
  skip: () => process.env.NODE_ENV === "development",
});

// Per-email in-memory tracker for login attempts (complements per-IP).
// Note: resets on process restart and is not shared across multiple instances.
// For production multi-instance deployments, replace with a DB or Redis-backed store.
const emailAttemptMap = new Map<string, { count: number; resetAt: number }>();
const EMAIL_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_MAX_ATTEMPTS = 10;

export function checkEmailRateLimit(email: string): { allowed: boolean; resetAt?: Date } {
  const now = Date.now();
  const entry = emailAttemptMap.get(email);
  if (!entry || now > entry.resetAt) {
    emailAttemptMap.set(email, { count: 1, resetAt: now + EMAIL_WINDOW_MS });
    return { allowed: true };
  }
  entry.count += 1;
  if (entry.count > EMAIL_MAX_ATTEMPTS) {
    return { allowed: false, resetAt: new Date(entry.resetAt) };
  }
  return { allowed: true };
}

export function clearEmailRateLimit(email: string): void {
  emailAttemptMap.delete(email);
}

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function recordFailedLogin(email: string): Promise<{ locked: boolean; attemptsLeft: number }> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user) return { locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS };

  const attempts = (user.loginAttempts ?? 0) + 1;
  const locked = attempts >= MAX_LOGIN_ATTEMPTS;
  const lockedUntil = locked ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;

  await db
    .update(usersTable)
    .set({ loginAttempts: attempts, lockedUntil: lockedUntil ?? undefined, updatedAt: new Date() })
    .where(eq(usersTable.email, email));

  return { locked, attemptsLeft: Math.max(0, MAX_LOGIN_ATTEMPTS - attempts) };
}

export async function clearFailedLogins(email: string): Promise<void> {
  await db
    .update(usersTable)
    .set({ loginAttempts: 0, lockedUntil: null, updatedAt: new Date() })
    .where(eq(usersTable.email, email));
}

export async function isAccountLocked(email: string): Promise<{ locked: boolean; until?: Date }> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user?.lockedUntil) return { locked: false };
  if (user.lockedUntil > new Date()) return { locked: true, until: user.lockedUntil };

  // Lockout expired — clear it
  await db
    .update(usersTable)
    .set({ loginAttempts: 0, lockedUntil: null, updatedAt: new Date() })
    .where(eq(usersTable.email, email));

  return { locked: false };
}
