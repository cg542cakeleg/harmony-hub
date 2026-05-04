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
        // Persist rotated refresh_token when the provider returns a new one
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
    if (allDay) {
      // All-day: startRaw is "YYYY-MM-DD" — use directly, no timezone conversion
      date = startRaw.slice(0, 10);
    } else {
      // Timed: startRaw is an ISO-8601 string with offset (e.g. "2026-05-10T14:30:00-07:00")
      // Extract date and time from the string itself to preserve the event's local wall time,
      // rather than converting to UTC which would shift the displayed time for non-UTC users.
      const localPart = startRaw.slice(0, 16); // "YYYY-MM-DDTHH:MM"
      date = localPart.slice(0, 10);
      time = localPart.slice(11, 16);
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

router.get("/calendar/status", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.json({ hasCalendarAccess: false });
    return;
  }
  const sid = getSessionId(req);
  if (!sid) {
    res.json({ hasCalendarAccess: false });
    return;
  }
  const session = await getSession(sid);
  res.json({ hasCalendarAccess: !!session?.access_token });
});

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
    } else if (
      msg.includes("insufficientPermissions") ||
      msg.includes("forbidden") ||
      msg.includes("403") ||
      msg.toLowerCase().includes("scope")
    ) {
      res.status(403).json({
        error: "INSUFFICIENT_SCOPE",
        message: "Google Calendar permission not granted. Please sign in with Google again to allow calendar access.",
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
      // Use floating datetime (no timeZone) so Google Calendar respects the user's
      // calendar timezone setting rather than forcing UTC interpretation.
      // Compute end time (+1 hour) using real Date arithmetic to correctly roll over midnight.
      const startISO = `${date}T${time}:00`;
      // Parse as a local floating datetime; add 3600 seconds to get end time
      const [y, mo, d2] = (date as string).split("-").map(Number);
      const [hh, mm] = (time as string).split(":").map(Number);
      const startMs = new Date(y, mo - 1, d2, hh, mm, 0).getTime();
      const endMs = startMs + 60 * 60 * 1000;
      const endD = new Date(endMs);
      const endISO =
        `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, "0")}-${String(endD.getDate()).padStart(2, "0")}` +
        `T${String(endD.getHours()).padStart(2, "0")}:${String(endD.getMinutes()).padStart(2, "0")}:00`;
      start = { dateTime: startISO };
      end = { dateTime: endISO };
    } else {
      // For all-day events, end.date must be the day after (exclusive) per Google Calendar API spec
      const endDate = new Date(date as string);
      endDate.setDate(endDate.getDate() + 1);
      const endDateStr = endDate.toISOString().split("T")[0];
      start = { date };
      end = { date: endDateStr };
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
