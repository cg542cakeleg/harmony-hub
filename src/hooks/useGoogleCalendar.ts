import { useState, useEffect, useCallback, useRef } from 'react';
import type { FamilyEvent } from '../types';
import { GOOGLE_CLIENT_ID } from '../config/google';

const SCOPES          = 'https://www.googleapis.com/auth/calendar.readonly';
const TOKEN_KEY       = 'harmony_gcal_token';     // { access_token, expires_at }
const REFRESH_KEY     = 'harmony_gcal_refresh';   // refresh token (long-lived)
const EVENTS_KEY      = 'harmony_gcal_events';
const SYNC_KEY        = 'harmony_gcal_synced';
const POLL_MS         = 5 * 60 * 1000;            // background poll every 5 min

interface StoredToken { access_token: string; expires_at: number; }

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const google: any;

// ── token helpers ────────────────────────────────────────────────────────────

function readAccessToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw) as StoredToken;
    return Date.now() < t.expires_at - 30_000 ? t : null; // 30s buffer
  } catch { return null; }
}

function saveAccessToken(access_token: string, expires_in: number) {
  const t: StoredToken = { access_token, expires_at: Date.now() + expires_in * 1000 };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(t));
}

// ── get a valid access token — refreshes automatically if expired ─────────────

async function getValidAccessToken(): Promise<string | null> {
  // 1. Return stored token if still valid
  const stored = readAccessToken();
  if (stored) return stored.access_token;

  // 2. Try to refresh using the long-lived refresh token
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;

  try {
    const res = await fetch('/api/auth/refresh', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refresh_token: refreshToken }),
    });

    if (res.status === 401) {
      // Refresh token revoked — user must reconnect
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

    if (!res.ok) return null;

    const { access_token, expires_in } = await res.json();
    saveAccessToken(access_token, expires_in);
    return access_token;
  } catch {
    return null;
  }
}

// ── calendar fetch ────────────────────────────────────────────────────────────

function mapGCalEvent(ev: any): FamilyEvent {
  const isAllDay = !!ev.start?.date;
  const date     = isAllDay ? ev.start.date : (ev.start?.dateTime ?? '').split('T')[0];
  const time     = isAllDay ? '' : ((ev.start?.dateTime ?? '').split('T')[1] ?? '').slice(0, 5);
  const end_time = ev.end?.dateTime ? (ev.end.dateTime.split('T')[1] ?? '').slice(0, 5) : '';
  return {
    id: 'gcal-' + ev.id, title: ev.summary || '(No title)',
    date, time, end_time, category: 'other', assigned_to: '',
    notes: ev.description || '', color: 'blue', source: 'google',
    created_date: ev.created || new Date().toISOString(),
    updated_date: ev.updated || new Date().toISOString(),
  };
}

async function fetchCalendarEvents(accessToken: string): Promise<FamilyEvent[]> {
  const now     = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const timeMax = new Date(now.getFullYear(), now.getMonth() + 4, 1).toISOString();

  const listRes = await fetch(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!listRes.ok) throw new Error(`Calendar list ${listRes.status}`);
  const { items = [] } = await listRes.json();

  const all: FamilyEvent[] = [];
  for (const cal of items) {
    if (cal.selected === false) continue;
    const params = new URLSearchParams({ timeMin, timeMax, singleEvents: 'true', orderBy: 'startTime', maxResults: '250' });
    const evRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!evRes.ok) continue;
    const { items: evItems = [] } = await evRes.json();
    all.push(...evItems.map((e: any) => mapGCalEvent(e)));
  }
  return all;
}

// ── hook ──────────────────────────────────────────────────────────────────────

export function useGoogleCalendar() {
  const clientIdSet   = !!GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith('YOUR_');
  const hasRefresh    = !!localStorage.getItem(REFRESH_KEY);

  const [isConnected,  setIsConnected]  = useState(() => hasRefresh || !!readAccessToken());
  const [isSyncing,    setIsSyncing]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [gisReady,     setGisReady]     = useState(false);
  const [lastSync,     setLastSync]     = useState<number | null>(() => {
    const r = localStorage.getItem(SYNC_KEY); return r ? parseInt(r, 10) : null;
  });
  const [googleEvents, setGoogleEvents] = useState<FamilyEvent[]>(() => {
    try { return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]'); } catch { return []; }
  });

  const codeClientRef  = useRef<any>(null);
  const isSyncingRef   = useRef(false);

  // ── save helper ──────────────────────────────────────────────────────────
  function saveEvents(events: FamilyEvent[]) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    localStorage.setItem(SYNC_KEY, String(Date.now()));
    setGoogleEvents(events);
    setLastSync(Date.now());
  }

  // ── silent background sync ───────────────────────────────────────────────
  const silentSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    try {
      const token = await getValidAccessToken();
      if (!token) {
        // Refresh token gone — mark disconnected
        setIsConnected(false);
        isSyncingRef.current = false;
        return;
      }
      const events = await fetchCalendarEvents(token);
      saveEvents(events);
      setError(null);
    } catch { /* silent */ }
    finally { isSyncingRef.current = false; }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── GIS script ready check ───────────────────────────────────────────────
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      if (typeof google !== 'undefined' && google.accounts?.oauth2) {
        setGisReady(true);
      } else {
        timer = setTimeout(check, 150);
      }
    };
    check();
    return () => clearTimeout(timer);
  }, []);

  // ── init code client once GIS ready ─────────────────────────────────────
  useEffect(() => {
    if (!gisReady || !clientIdSet) return;

    codeClientRef.current = google.accounts.oauth2.initCodeClient({
      client_id: GOOGLE_CLIENT_ID,
      scope:     SCOPES,
      ux_mode:   'popup',
      callback:  async (resp: any) => {
        if (resp.error) {
          setError(`Auth failed: ${resp.error}`);
          setIsSyncing(false);
          isSyncingRef.current = false;
          return;
        }

        try {
          // Exchange auth code for tokens via our Vercel backend
          const res = await fetch('/api/auth/google', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ code: resp.code }),
          });

          if (!res.ok) {
            const { error: err } = await res.json();
            throw new Error(err ?? 'Token exchange failed');
          }

          const { access_token, refresh_token, expires_in } = await res.json();

          // Persist tokens
          saveAccessToken(access_token, expires_in);
          if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token);

          setIsConnected(true);
          setError(null);

          // Immediately fetch events with the fresh token
          const events = await fetchCalendarEvents(access_token);
          saveEvents(events);
        } catch (e: any) {
          setError(e?.message ?? 'Connection failed');
        } finally {
          setIsSyncing(false);
          isSyncingRef.current = false;
        }
      },
    });

    // Auto-sync on load if already connected
    if (isConnected) silentSync();
  }, [gisReady, clientIdSet]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── auto-poll every 5 min ────────────────────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;
    const id = setInterval(silentSync, POLL_MS);
    return () => clearInterval(id);
  }, [isConnected, silentSync]);

  // ── re-sync when user comes back to the tab ──────────────────────────────
  useEffect(() => {
    if (!isConnected) return;
    const onVisible = () => { if (document.visibilityState === 'visible') silentSync(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [isConnected, silentSync]);

  // ── public: manual connect ───────────────────────────────────────────────
  const connect = useCallback(() => {
    if (!codeClientRef.current) {
      setError('Google is still loading — try again in a moment.');
      return;
    }
    setIsSyncing(true);
    setError(null);
    isSyncingRef.current = true;
    codeClientRef.current.requestCode();
  }, []);

  // ── public: manual sync (shows spinner) ─────────────────────────────────
  const sync = useCallback(async () => {
    setIsSyncing(true);
    setError(null);
    isSyncingRef.current = true;
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setIsConnected(false);
        setError('Session expired — please reconnect.');
        return;
      }
      const events = await fetchCalendarEvents(token);
      saveEvents(events);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Sync failed');
    } finally {
      setIsSyncing(false);
      isSyncingRef.current = false;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── public: disconnect ───────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    try {
      const raw = localStorage.getItem(TOKEN_KEY);
      if (raw) {
        const t = JSON.parse(raw) as StoredToken;
        google.accounts.oauth2.revoke(t.access_token, () => {});
      }
    } catch { /* ignore */ }
    [TOKEN_KEY, REFRESH_KEY, EVENTS_KEY, SYNC_KEY].forEach(k => localStorage.removeItem(k));
    setIsConnected(false);
    setGoogleEvents([]);
    setLastSync(null);
    setError(null);
  }, []);

  return { isConnected, isSyncing, error, googleEvents, lastSync, gisReady, clientIdSet, connect, sync, disconnect };
}
