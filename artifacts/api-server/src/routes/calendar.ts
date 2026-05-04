import { Router, type Request, type Response } from "express";
import { google } from "googleapis";
import * as oidc from "openid-client";
import {
  getSession,
  getSessionId,
  updateSession,
  getGoogleOidcConfig,
  type SessionData,
} from "../lib/auth";

const router = Router();

interface GoogleCalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  color: string;
  source: "google";
  googleId: string;
  allDay: boolean;
}

async function getAuthedCalendar(
  req: Request,
): Promise<{ calendar: ReturnType<typeof google.calendar>; sid: string } | null> {
  const sid = getSessionId(req);
  if (!sid) return null;

  const session = await getSession(sid);
  if (!session?.access_token) return null;

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

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
        expires_at: refreshed.expiresIn()
          ? Math.floor(Date.now() / 1000) + refreshed.expiresIn()!
          : session.expires_at,
      };
      await updateSession(sid, updated);
    } catch {
      return null;
    }
  }

  oauth2.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: "v3", auth: oauth2 });
  return { calendar, sid };
}

function googleEventToLocal(ev: {
  id?: string | null;
  summary?: string | null;
  start?: { dateTime?: string | null; date?: string | null } | null;
  colorId?: string | null;
}): GoogleCalendarEvent {
  const colorMap: Record<string, string> = {
    "1": "#a4bdfc",
    "2": "#7ae28c",
    "3": "#dbadff",
    "4": "#ff887c",
    "5": "#fbd75b",
    "6": "#ffb878",
    "7": "#46d6db",
    "8": "#e1e1e1",
    "9": "#5484ed",
    "10": "#51b749",
    "11": "#dc2127",
  };

  const startRaw = ev.start?.dateTime ?? ev.start?.date ?? "";
  const allDay = !ev.start?.dateTime;
  let date = "";
  let time = "";

  if (startRaw) {
    const d = new Date(startRaw);
    date = d.toISOString().split("T")[0];
    if (!allDay) {
      time = d.toTimeString().slice(0, 5);
    }
  }

  return {
    id: `gcal_${ev.id ?? ""}`,
    title: ev.summary ?? "(No title)",
    date,
    time,
    color: ev.colorId ? (colorMap[ev.colorId] ?? "#1A33FF") : "#1A33FF",
    source: "google",
    googleId: ev.id ?? "",
    allDay,
  };
}

router.get("/calendar/sync", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }

  const authed = await getAuthedCalendar(req);
  if (!authed) {
    res.status(403).json({
      error: "NO_GOOGLE_TOKEN",
      message: "No Google Calendar access. Please sign in with Google to enable calendar sync.",
    });
    return;
  }

  const { calendar } = authed;

  try {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: thirtyDaysLater.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 100,
    });

    const items = response.data.items ?? [];
    const events: GoogleCalendarEvent[] = items
      .filter((ev) => ev.id && (ev.start?.dateTime || ev.start?.date))
      .map(googleEventToLocal);

    res.json({ events, syncedAt: new Date().toISOString() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("401") || msg.includes("invalid_grant")) {
      res.status(401).json({
        error: "TOKEN_EXPIRED",
        message: "Google token expired. Please sign in with Google again.",
      });
    } else {
      res.status(502).json({ error: "CALENDAR_API_ERROR", message: msg });
    }
  }
});

router.post("/calendar/push", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }

  const authed = await getAuthedCalendar(req);
  if (!authed) {
    res.status(403).json({
      error: "NO_GOOGLE_TOKEN",
      message: "No Google Calendar access. Please sign in with Google to push events.",
    });
    return;
  }

  const { calendar } = authed;
  const { title, date, time } = req.body ?? {};

  if (!title || !date) {
    res.status(400).json({ error: "title and date are required." });
    return;
  }

  try {
    let start: { dateTime?: string; date?: string; timeZone?: string };
    let end: { dateTime?: string; date?: string; timeZone?: string };

    if (time) {
      const startISO = `${date}T${time}:00`;
      const startDate = new Date(startISO);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      start = { dateTime: startISO, timeZone: "UTC" };
      end = { dateTime: endDate.toISOString().replace(".000Z", ""), timeZone: "UTC" };
    } else {
      start = { date };
      end = { date };
    }

    const created = await calendar.events.insert({
      calendarId: "primary",
      requestBody: { summary: title, start, end },
    });

    res.json({ googleId: created.data.id, htmlLink: created.data.htmlLink });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: "CALENDAR_API_ERROR", message: msg });
  }
});

export default router;
