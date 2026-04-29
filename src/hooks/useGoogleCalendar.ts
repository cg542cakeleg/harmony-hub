import { useState, useEffect, useCallback, useRef } from 'react';
import type { FamilyEvent } from '../types';
import { GOOGLE_CLIENT_ID } from '../config/google';

const SCOPES      = 'https://www.googleapis.com/auth/calendar.readonly';
const TOKEN_KEY   = 'harmony_gcal_token';
const EVENTS_KEY  = 'harmony_gcal_events';
const SYNC_KEY    = 'harmony_gcal_synced';
const POLL_MS     = 5 * 60 * 1000;   // auto-refresh every 5 minutes

interface StoredToken { access_token: string; expires_at: number; }

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const google: any;

// ── helpers ───────────────────────────────────────────────────────────────

function readToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw) as StoredToken;
    return Date.now() < t.expires_at ? t : null;
  } catch { return null; }
}

function mapGCalEvent(ev: any): FamilyEvent {
  const isAllDay = !!ev.start?.date;
  const date     = isAllDay ? ev.start.date : (ev.start?.dateTime ?? '').split('T')[0];
  const time     = isAllDay ? '' : ((ev.start?.dateTime ?? '').split('T')[1] ?? '').slice(0, 5);
  const end_time = ev.end?.dateTime ? (ev.end.dateTime.split('T')[1] ?? '').slice(0, 5) : '';
  return {
    id:           'gcal-' + ev.id,
    title:        ev.summary || '(No title)',
    date, time, end_time,
    category:     'other',
    assigned_to:  '',
    notes:        ev.description || '',
    color:        'blue',
    source:       'google',
    created_date: ev.created  || new Date().toISOString(),
    updated_date: ev.updated  || new Date().toISOString(),
  };
}

async function doFetch(accessToken: string): Promise<FamilyEvent[]> {
  const now     = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const timeMax = new Date(now.getFullYear(), now.getMonth() + 4, 1).toISOString();

  const listRes = await fetch(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!listRes.ok) throw new Error(`Calendar list error: ${listRes.status}`);
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

// ── hook ──────────────────────────────────────────────────────────────────

export function useGoogleCalendar() {
  const clientIdSet = !!GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith('YOUR_');

  const [isConnected,   setIsConnected]   = useState(() => !!readToken());
  const [isSyncing,     setIsSyncing]     = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [gisReady,      setGisReady]      = useState(false);
  const [lastSync,      setLastSync]      = useState<number | null>(() => {
    const raw = localStorage.getItem(SYNC_KEY);
    return raw ? parseInt(raw, 10) : null;
  });
  const [googleEvents, setGoogleEvents] = useState<FamilyEvent[]>(() => {
    try { return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]'); } catch { return []; }
  });

  const tokenClientRef = useRef<any>(null);
  const isSyncingRef   = useRef(false);  // prevent overlapping fetches

  // ── save helper ──────────────────────────────────────────────────────────
  function saveEvents(events: FamilyEvent[]) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    localStorage.setItem(SYNC_KEY, String(Date.now()));
    setGoogleEvents(events);
    setLastSync(Date.now());
  }

  // ── silent background sync (no loading spinner) ──────────────────────────
  const silentSync = useCallback(async () => {
    if (isSyncingRef.current) return;  // skip if already running
    const token = readToken();
    if (!token) return;                // token expired — wait for user to reconnect
    isSyncingRef.current = true;
    try {
      const events = await doFetch(token.access_token);
      saveEvents(events);
      setError(null);
    } catch { /* silent — don't show error for background syncs */ }
    finally { isSyncingRef.current = false; }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── GIS script ready poll ─────────────────────────────────────────────────
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

  // ── init token client + first load sync ──────────────────────────────────
  useEffect(() => {
    if (!gisReady || !clientIdSet) return;

    tokenClientRef.current = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: async (resp: any) => {
        if (resp.error) {
          setError(`Auth failed: ${resp.error}`);
          setIsSyncing(false);
          isSyncingRef.current = false;
          return;
        }
        const expires_at = Date.now() + Number(resp.expires_in) * 1000;
        localStorage.setItem(TOKEN_KEY, JSON.stringify({ access_token: resp.access_token, expires_at }));
        setIsConnected(true);
        setError(null);
        try {
          const events = await doFetch(resp.access_token);
          saveEvents(events);
        } catch (e: any) {
          setError('Sync failed: ' + (e?.message ?? 'Unknown'));
        } finally {
          setIsSyncing(false);
          isSyncingRef.current = false;
        }
      },
    });

    // Initial load sync
    silentSync();
  }, [gisReady, clientIdSet, silentSync]);

  // ── AUTO-POLL every 5 minutes ─────────────────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(silentSync, POLL_MS);
    return () => clearInterval(interval);
  }, [isConnected, silentSync]);

  // ── VISIBILITY REFRESH — sync when user returns to the tab ───────────────
  useEffect(() => {
    if (!isConnected) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') silentSync();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [isConnected, silentSync]);

  // ── Manual sync (shows spinner) ──────────────────────────────────────────
  const sync = useCallback(async () => {
    const token = readToken();
    if (!token) {
      // Token expired — re-authenticate
      if (!tokenClientRef.current) return;
      setIsSyncing(true);
      setError(null);
      tokenClientRef.current.requestAccessToken({ prompt: '' });
      return;
    }
    setIsSyncing(true);
    setError(null);
    isSyncingRef.current = true;
    try {
      const events = await doFetch(token.access_token);
      saveEvents(events);
      setError(null);
    } catch (e: any) {
      setError('Sync failed: ' + (e?.message ?? 'Unknown'));
    } finally {
      setIsSyncing(false);
      isSyncingRef.current = false;
    }
  }, []);

  // ── Connect (first time) ─────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (!tokenClientRef.current) {
      setError('Google is still loading — try again in a moment.');
      return;
    }
    setIsSyncing(true);
    setError(null);
    isSyncingRef.current = true;
    tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
  }, []);

  // ── Disconnect ───────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    try {
      const raw = localStorage.getItem(TOKEN_KEY);
      if (raw) {
        const t = JSON.parse(raw) as StoredToken;
        google.accounts.oauth2.revoke(t.access_token, () => {});
      }
    } catch { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EVENTS_KEY);
    localStorage.removeItem(SYNC_KEY);
    setIsConnected(false);
    setGoogleEvents([]);
    setLastSync(null);
    setError(null);
  }, []);

  return { isConnected, isSyncing, error, googleEvents, lastSync, gisReady, clientIdSet, connect, sync, disconnect };
}
