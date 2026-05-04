import * as oidc from "openid-client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import { GetCurrentAuthUserResponse } from "@workspace/api-zod";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  clearSession,
  getGoogleOidcConfig,
  getSessionId,
  createSession,
  deleteSession,
  SESSION_COOKIE,
  setSessionCookie,
  getSafeReturnTo,
  upsertGoogleUser,
  type SessionData,
} from "../lib/auth";
import {
  authRateLimit,
  loginRateLimit,
  recordFailedLogin,
  clearFailedLogins,
  isAccountLocked,
  checkEmailRateLimit,
  clearEmailRateLimit,
} from "../lib/rateLimit";
import { CSRF_COOKIE } from "../lib/csrf";

const OIDC_COOKIE_TTL = 10 * 60 * 1000;
const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const router: IRouter = Router();

function getOrigin(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  return `${proto}://${host}`;
}

function setOidcCookie(res: Response, name: string, value: string) {
  res.cookie(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OIDC_COOKIE_TTL,
  });
}

async function invalidateAllUserSessions(userId: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
}

router.get("/auth/csrf", (_req: Request, res: Response) => {
  const token = _req.cookies?.[CSRF_COOKIE] ?? "";
  res.json({ csrfToken: token });
});

router.get("/auth/user", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: req.isAuthenticated() ? req.user : null,
    }),
  );
});

router.post("/auth/register", authRateLimit, async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters." });
    return;
  }
  const emailLower = (email as string).toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
    res.status(400).json({ error: "Invalid email address." });
    return;
  }

  const emailCheck = checkEmailRateLimit(emailLower);
  if (!emailCheck.allowed) {
    res.status(429).json({ error: "Too many registration attempts for this email. Try again later." });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, emailLower));
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const [user] = await db
    .insert(usersTable)
    .values({
      email: emailLower,
      passwordHash,
      emailVerified: false,
      firstName: (firstName as string | undefined) ?? null,
      lastName: (lastName as string | undefined) ?? null,
    })
    .returning();

  const sessionData: SessionData = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  res.status(201).json({ user: sessionData.user });
});

router.post("/auth/login", loginRateLimit, async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const emailLower = (email as string).toLowerCase().trim();

  const emailCheck = checkEmailRateLimit(emailLower);
  if (!emailCheck.allowed) {
    res.status(429).json({ error: "Too many login attempts for this email. Try again later." });
    return;
  }

  const lockStatus = await isAccountLocked(emailLower);
  if (lockStatus.locked) {
    const mins = lockStatus.until
      ? Math.ceil((lockStatus.until.getTime() - Date.now()) / 60000)
      : 15;
    res.status(429).json({ error: `Account locked. Try again in ${mins} minute${mins === 1 ? "" : "s"}.` });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, emailLower));

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  const valid = await bcrypt.compare(password as string, user.passwordHash);
  if (!valid) {
    const { locked, attemptsLeft } = await recordFailedLogin(emailLower);
    if (locked) {
      res.status(429).json({ error: "Too many failed attempts. Account locked for 15 minutes." });
    } else {
      res.status(401).json({ error: `Invalid email or password. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.` });
    }
    return;
  }

  await clearFailedLogins(emailLower);
  clearEmailRateLimit(emailLower);

  const sessionData: SessionData = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  res.json({ user: sessionData.user });
});

router.post("/auth/change-password", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Must be logged in to change password." });
    return;
  }

  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "currentPassword and newPassword are required." });
    return;
  }
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    res.status(400).json({ error: "New password must be at least 8 characters." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user?.passwordHash) {
    res.status(400).json({ error: "This account uses Google sign-in. Password change is not available." });
    return;
  }

  const valid = await bcrypt.compare(currentPassword as string, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Current password is incorrect." });
    return;
  }

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await db
    .update(usersTable)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(usersTable.id, user.id));

  // Invalidate ALL sessions including current — user must re-authenticate
  await invalidateAllUserSessions(user.id);
  res.clearCookie(SESSION_COOKIE, { path: "/" });

  res.json({ success: true });
});

router.post("/auth/forgot-password", authRateLimit, async (req: Request, res: Response) => {
  const { email } = req.body ?? {};
  if (!email) {
    res.status(400).json({ error: "Email is required." });
    return;
  }

  const emailLower = (email as string).toLowerCase().trim();

  // Always respond 200 to avoid email enumeration
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, emailLower));
  if (user && user.passwordHash) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await db
      .update(usersTable)
      .set({ passwordResetToken: token, passwordResetExpiry: expiry, updatedAt: new Date() })
      .where(eq(usersTable.id, user.id));

    // TODO: send email with link /harmony-hub/?reset_token=<token>
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] Password reset token for ${emailLower}: ${token}`);
    }
  }

  res.json({ message: "If that email is registered, a reset link has been sent." });
});

router.post("/auth/reset-password", authRateLimit, async (req: Request, res: Response) => {
  const { token, newPassword } = req.body ?? {};
  if (!token || !newPassword) {
    res.status(400).json({ error: "token and newPassword are required." });
    return;
  }
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters." });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.passwordResetToken, token as string));

  if (!user || !user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
    res.status(400).json({ error: "Invalid or expired reset token." });
    return;
  }

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await db
    .update(usersTable)
    .set({
      passwordHash: newHash,
      passwordResetToken: null,
      passwordResetExpiry: null,
      loginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, user.id));

  // Invalidate all sessions after password reset
  await invalidateAllUserSessions(user.id);

  res.json({ success: true });
});

router.get("/auth/google", authRateLimit, async (req: Request, res: Response) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    res.status(503).json({ error: "Google OAuth is not configured." });
    return;
  }

  try {
    const config = await getGoogleOidcConfig();
    const callbackUrl = `${getOrigin(req)}/api/auth/google/callback`;
    const returnTo = getSafeReturnTo(req.query.returnTo);

    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const codeVerifier = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

    const redirectTo = oidc.buildAuthorizationUrl(config, {
      redirect_uri: callbackUrl,
      scope: "openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/photoslibrary.readonly",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
      nonce,
      access_type: "offline",
      prompt: "consent",
    });

    setOidcCookie(res, "g_code_verifier", codeVerifier);
    setOidcCookie(res, "g_nonce", nonce);
    setOidcCookie(res, "g_state", state);
    setOidcCookie(res, "g_return_to", returnTo);

    res.redirect(redirectTo.href);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(503).json({ error: "Google OAuth unavailable: " + msg });
  }
});

router.get("/auth/google/callback", async (req: Request, res: Response) => {
  const codeVerifier = req.cookies?.g_code_verifier;
  const nonce = req.cookies?.g_nonce;
  const expectedState = req.cookies?.g_state;
  const returnTo = getSafeReturnTo(req.cookies?.g_return_to);

  res.clearCookie("g_code_verifier", { path: "/" });
  res.clearCookie("g_nonce", { path: "/" });
  res.clearCookie("g_state", { path: "/" });
  res.clearCookie("g_return_to", { path: "/" });

  if (!codeVerifier || !expectedState) {
    res.redirect("/harmony-hub/?auth_error=invalid_state");
    return;
  }

  try {
    const config = await getGoogleOidcConfig();
    const callbackUrl = `${getOrigin(req)}/api/auth/google/callback`;
    const currentUrl = new URL(
      `${callbackUrl}?${new URL(req.url, `http://${req.headers.host}`).searchParams}`,
    );

    const tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedNonce: nonce,
      expectedState,
      idTokenExpected: true,
    });

    const claims = tokens.claims();
    if (!claims) {
      res.redirect("/harmony-hub/?auth_error=no_claims");
      return;
    }

    const dbUser = await upsertGoogleUser(claims as unknown as Record<string, unknown>);

    const sessionData: SessionData = {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        profileImageUrl: dbUser.profileImageUrl,
      },
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expiresIn()
        ? Math.floor(Date.now() / 1000) + tokens.expiresIn()!
        : undefined,
    };

    const sid = await createSession(sessionData);
    setSessionCookie(res, sid);
    res.redirect(returnTo);
  } catch {
    res.redirect("/harmony-hub/?auth_error=oauth_failed");
  }
});

router.post("/auth/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  if (sid) await deleteSession(sid);
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.json({ success: true });
});

router.get("/login", (_req: Request, res: Response) => {
  res.redirect("/harmony-hub/");
});

export default router;
