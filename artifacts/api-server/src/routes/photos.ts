import { Router, type Request, type Response } from "express";
import * as oidc from "openid-client";
import {
  getSession,
  getSessionId,
  updateSession,
  getGoogleOidcConfig,
  type SessionData,
} from "../lib/auth";

const router = Router();

const PHOTOS_BASE = "https://photoslibrary.googleapis.com/v1";

async function getAuthedToken(
  req: Request,
): Promise<{ accessToken: string; sid: string } | null> {
  const sid = getSessionId(req);
  if (!sid) return null;

  const session = await getSession(sid);
  if (!session?.access_token) return null;

  let accessToken = session.access_token;
  const now = Math.floor(Date.now() / 1000);

  if (session.expires_at && session.expires_at < now + 60 && session.refresh_token) {
    try {
      const config = await getGoogleOidcConfig();
      const refreshed = await oidc.refreshTokenGrant(config, session.refresh_token);
      accessToken = refreshed.access_token!;
      const updated: SessionData = {
        ...session,
        access_token: accessToken,
        refresh_token: refreshed.refresh_token ?? session.refresh_token,
        expires_at: refreshed.expiresIn()
          ? Math.floor(Date.now() / 1000) + refreshed.expiresIn()!
          : session.expires_at,
      };
      await updateSession(sid, updated);
    } catch {
      return null;
    }
  }

  return { accessToken, sid };
}

function classifyPhotosError(status: number, body: string): { code: string; message: string; httpStatus: number } {
  if (status === 401) {
    return { code: "TOKEN_EXPIRED", message: "Google token expired. Please sign in with Google again.", httpStatus: 401 };
  }
  if (status === 403 || body.includes("PERMISSION_DENIED") || body.includes("insufficientPermissions")) {
    return { code: "INSUFFICIENT_SCOPE", message: "Google Photos permission not granted. Please sign in with Google again to allow Photos access.", httpStatus: 403 };
  }
  return { code: "PHOTOS_API_ERROR", message: `Google Photos API error (${status})`, httpStatus: 502 };
}

router.get("/photos/status", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.json({ hasPhotosAccess: false });
    return;
  }
  const authed = await getAuthedToken(req);
  res.json({ hasPhotosAccess: !!authed });
});

router.get("/photos/albums", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "NOT_AUTHENTICATED", message: "Not authenticated." });
    return;
  }

  const authed = await getAuthedToken(req);
  if (!authed) {
    res.status(403).json({ error: "NO_GOOGLE_TOKEN", message: "No Google Photos access. Please sign in with Google." });
    return;
  }

  try {
    const response = await fetch(`${PHOTOS_BASE}/albums?pageSize=20`, {
      headers: { Authorization: `Bearer ${authed.accessToken}` },
    });
    const text = await response.text();

    if (!response.ok) {
      const classified = classifyPhotosError(response.status, text);
      res.status(classified.httpStatus).json({ error: classified.code, message: classified.message });
      return;
    }

    const body = JSON.parse(text) as {
      albums?: {
        id: string;
        title?: string;
        coverPhotoBaseUrl?: string;
        coverPhotoMediaItemId?: string;
        mediaItemsCount?: string;
        productUrl?: string;
      }[];
    };

    const albums = (body.albums ?? []).map(a => ({
      id: a.id,
      title: a.title ?? "Untitled Album",
      coverPhotoBaseUrl: a.coverPhotoBaseUrl ?? null,
      mediaItemsCount: parseInt(a.mediaItemsCount ?? "0", 10),
      productUrl: a.productUrl ?? null,
    }));

    res.json({ albums });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: "PHOTOS_API_ERROR", message: msg });
  }
});

router.get("/photos/albums/:albumId", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "NOT_AUTHENTICATED", message: "Not authenticated." });
    return;
  }

  const authed = await getAuthedToken(req);
  if (!authed) {
    res.status(403).json({ error: "NO_GOOGLE_TOKEN", message: "No Google Photos access. Please sign in with Google." });
    return;
  }

  const { albumId } = req.params;
  const pageSize = Math.min(parseInt((req.query.pageSize as string) ?? "50", 10), 100);

  try {
    const response = await fetch(`${PHOTOS_BASE}/mediaItems:search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authed.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ albumId, pageSize }),
    });
    const text = await response.text();

    if (!response.ok) {
      const classified = classifyPhotosError(response.status, text);
      res.status(classified.httpStatus).json({ error: classified.code, message: classified.message });
      return;
    }

    const body = JSON.parse(text) as {
      mediaItems?: {
        id: string;
        baseUrl?: string;
        filename?: string;
        mediaMetadata?: { creationTime?: string; width?: string; height?: string };
        mimeType?: string;
      }[];
    };

    const mediaItems = (body.mediaItems ?? [])
      .filter(m => m.mimeType?.startsWith("image/"))
      .map(m => ({
        id: m.id,
        baseUrl: m.baseUrl ?? null,
        filename: m.filename ?? "photo.jpg",
        createdAt: m.mediaMetadata?.creationTime ?? null,
        width: parseInt(m.mediaMetadata?.width ?? "0", 10),
        height: parseInt(m.mediaMetadata?.height ?? "0", 10),
      }));

    res.json({ mediaItems });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: "PHOTOS_API_ERROR", message: msg });
  }
});

export default router;
