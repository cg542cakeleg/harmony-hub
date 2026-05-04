import { type Request, type Response, type NextFunction } from "express";
import type { AuthUser } from "@workspace/api-zod";
import { clearSession, getSessionId, getSession, setSessionCookie } from "../lib/auth";

declare global {
  namespace Express {
    interface User extends AuthUser {}

    interface Request {
      isAuthenticated(): this is AuthedRequest;
      user?: User | undefined;
    }

    export interface AuthedRequest {
      user: User;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.isAuthenticated = function (this: Request) {
    return this.user != null;
  } as Request["isAuthenticated"];

  const sid = getSessionId(req);
  if (!sid) {
    next();
    return;
  }

  try {
    const session = await getSession(sid);
    if (!session?.user?.id) {
      await clearSession(res, sid);
      next();
      return;
    }

    req.user = session.user;

    // Refresh cookie on every authenticated request (true sliding session)
    setSessionCookie(res, sid);
  } catch (err) {
    console.error("[authMiddleware] session lookup failed:", err);
    // Don't crash the request — just treat as unauthenticated
    res.clearCookie("sid", { path: "/" });
  }

  next();
}
