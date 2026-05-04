import * as oidcClient from "openid-client";
import crypto from "crypto";
import { type Request, type Response } from "express";
import { db, sessionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { AuthUser } from "@workspace/api-zod";

export const SESSION_COOKIE = "sid";
export const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days ms

// Google OIDC issuer
export const GOOGLE_ISSUER = "https://accounts.google.com";

export interface SessionData {
  user: AuthUser;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

let googleOidcConfig: oidcClient.Configuration | null = null;

export async function getGoogleOidcConfig(): Promise<oidcClient.Configuration> {
  if (!googleOidcConfig) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set for Google OAuth");
    }
    googleOidcConfig = await oidcClient.discovery(
      new URL(GOOGLE_ISSUER),
      clientId,
      clientSecret,
    );
  }
  return googleOidcConfig;
}

export async function createSession(data: SessionData): Promise<string> {
  const sid = crypto.randomBytes(32).toString("hex");
  await db.insert(sessionsTable).values({
    sid,
    sess: data as unknown as Record<string, unknown>,
    expire: new Date(Date.now() + SESSION_TTL),
    userId: data.user.id,
  });
  return sid;
}

export async function getSession(sid: string): Promise<SessionData | null> {
  const [row] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.sid, sid));

  if (!row || row.expire < new Date()) {
    if (row) await deleteSession(sid);
    return null;
  }

  // Slide expiry on access
  await db
    .update(sessionsTable)
    .set({ expire: new Date(Date.now() + SESSION_TTL) })
    .where(eq(sessionsTable.sid, sid));

  return row.sess as unknown as SessionData;
}

export async function updateSession(sid: string, data: SessionData): Promise<void> {
  await db
    .update(sessionsTable)
    .set({
      sess: data as unknown as Record<string, unknown>,
      expire: new Date(Date.now() + SESSION_TTL),
    })
    .where(eq(sessionsTable.sid, sid));
}

export async function deleteSession(sid: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.sid, sid));
}

export async function clearSession(res: Response, sid?: string): Promise<void> {
  if (sid) await deleteSession(sid);
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export function getSessionId(req: Request): string | undefined {
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.cookies?.[SESSION_COOKIE];
}

export function setSessionCookie(res: Response, sid: string): void {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export function getSafeReturnTo(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/harmony-hub/";
  }
  return value;
}

export async function upsertGoogleUser(claims: Record<string, unknown>) {
  const googleId = claims.sub as string;
  const email = claims.email as string | undefined;

  // Try find by googleId first, then by email
  let existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.googleId, googleId))
    .then(r => r[0]);

  if (!existing && email) {
    existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .then(r => r[0]);
  }

  const userData = {
    googleId,
    email: email ?? null,
    firstName: (claims.given_name as string) || (claims.first_name as string) || null,
    lastName: (claims.family_name as string) || (claims.last_name as string) || null,
    profileImageUrl: (claims.picture as string) || (claims.profile_image_url as string) || null,
    emailVerified: (claims.email_verified as boolean) ?? false,
  };

  if (existing) {
    const [updated] = await db
      .update(usersTable)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(usersTable.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(usersTable)
    .values(userData)
    .returning();
  return created;
}
