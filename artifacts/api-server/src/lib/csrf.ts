import crypto from "crypto";
import { type Request, type Response, type NextFunction } from "express";

export const CSRF_COOKIE = "csrf_token";
export const CSRF_HEADER = "x-csrf-token";
const CSRF_TTL = 24 * 60 * 60 * 1000; // 24 hours

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Issues a CSRF token cookie on GET requests if one is missing or expired.
 * Safe (GET/HEAD/OPTIONS) methods are always allowed through.
 * Mutating methods (POST/PUT/PATCH/DELETE) must present the token
 * in the X-CSRF-Token header matching the cookie value.
 *
 * Routes that use OAuth redirects (GET only) are unaffected.
 * Login/register/logout are JSON endpoints so the frontend can send the header.
 */
export function csrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Always issue/refresh cookie so frontend can read it
  let token = req.cookies?.[CSRF_COOKIE] as string | undefined;
  if (!token) {
    token = generateToken();
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false, // Must be readable by JS
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: CSRF_TTL,
    });
  }

  // Safe methods pass through
  const safeMethod = /^(GET|HEAD|OPTIONS)$/i.test(req.method);
  if (safeMethod) {
    next();
    return;
  }

  // Skip CSRF for OAuth callback (initiated by Google redirect, not our JS)
  if (req.path === "/auth/google/callback") {
    next();
    return;
  }

  const headerToken = req.headers[CSRF_HEADER] as string | undefined;
  if (!headerToken || headerToken !== token) {
    res.status(403).json({ error: "Invalid or missing CSRF token." });
    return;
  }

  next();
}
