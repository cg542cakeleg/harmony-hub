import { useState, useEffect, useCallback, useRef } from 'react';
import type { FamilyEvent } from '../types';
import { GOOGLE_CLIENT_ID } from '../config/google';

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const TOKEN_KEY   = 'harmony_gcal_token';
const EVENTS_KEY  = 'harmony_gcal_events';
const SYNC_KEY    = 'harmony_gcal_synced';

interface StoredToken { access_token: string; expires_at: number; }

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const google: any;

// ── helpers ────────────────────────────────────────────────────────────────

function readToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw) as StoredToken;
    return Date.now() < t.expires_at ? t : null;   // return null if expired
  } catch { return null; }
}

function mapGCalEvent(ev: any, calColor?: string): FamilyEvent {
  const isAllDay = !!ev.start?.date;
  const date     = isAllDay ? ev.start.date : (ev.start?.dateTime ?? '').split('T')[0];
  const time     = isAllDay ? '' : ((ev.start?.dateTime ?? '').split('T')[1] ?? '').slice(0, 5);
  const end_time = ev.end?.dateTime ? (ev.end.dateTime.split('T')[1] ?? '').slice(0, 5) : '';

  return {
    id:           'gcal-' + ev.id,
    title:        ev.summary || '(No title)',
    date,
    time,
    end_time,
    category:     'other',
    assigned_to:  '',
    notes:        ev.description || '',
    color:        calColor || 'blue',
    source:       'google',
    created_date: ev.created  || new Date().toISOString(),
    updated_date: ev.updated  || new Date().toISOString(),
  };
}

async function doFetch(accessToken: string): Promise<FamilyEvent[]> {
  const now     = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const timeMax = new Date(now.getFullYear(), now.getMonth() + 4, 1).toISOString();

  // Fetch calendar list
  const listRes = await fetch(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!listRes.ok) throw new Error(`Calendar list error: ${listRes.status}`);
  const { items = [] } = await listRes.json();

  // Fetch events from every visible calendar
  const all: FamilyEvent[] = [];
  for (const cal of items) {
    if (cal.selected === false) continue;
    const params = new URLSearchParams({
      timeMin, timeMax,
      singleEvents: 'true',
      orderBy:      'startTime',
      maxResults:   '250',
    });
    const evRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!evRes.ok) continue;
    const { items: evItems = [] } = await evRes.json();
    all.push(...evItems.map((e: any) => mapGCalEvent(e, cal.backgroundColor)));
  }
  return all;
}

// ── hook ──────────────────────────────────────────────────────────────────

export function useGoogleCalendar() {
  const clientIdSet = !!GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith('YOUR_');

  const [isConnected, setIsConnected] = useState(() => !!readToken());
  const [isSyncing,   setIsSyncing]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [gisReady,    setGisReady]    = useState(false);
  const [lastSync,    setLastSync]    = useState<number | null>(() => {
    const raw = localStorage.getItem(SYNC_KEY);
    return raw ? parseInt(raw, 10) : null;
  });
  const [googleEvents, setGoogleEvents] = useState<FamilyEvent[]>(() => {
    try { return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]'); } catch { return []; }
  });

  const tokenClientRef = useRef<any>(null);
  const pendingSync    = useRef(false);

  // Poll until GIS script is ready
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

  // Init token client once GIS ready
  useEffect(() => {
    if (!gisReady || !clientIdSet) return;

    tokenClientRef.current = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: async (resp: any) => {
        if (resp.error) {
          setError(`Auth failed: ${resp.error}`);
          setIsSyncing(false);
          pendingSync.current = false;
          return;
        }
        // Store token
        const expires_at = Date.now() + Number(resp.expires_in) * 1000;
        localStorage.setItem(TOKEN_KEY, JSON.stringify({ access_token: resp.access_token, expires_at }));
        setIsConnected(true);
        setError(null);

        // Sync events
        try {
          const events = await doFetch(resp.access_token);
          localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
          localStorage.setItem(SYNC_KEY, String(Date.now()));
          setGoogleEvents(events);
          setLastSync(Date.now());
        } catch (e: any) {
          setError('Sync failed: ' + (e?.message ?? 'Unknown error'));
        } finally {
          setIsSyncing(false);
          pendingSync.current = false;
        }
      },
    });

    // Auto-sync on load if token is still valid
    const token = readToken();
    if (token) {
      setIsSyncing(true);
      doFetch(token.access_token)
        .then(events => {
          localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
          localStorage.setItem(SYNC_KEY, String(Date.now()));
          setGoogleEvents(events);
          setLastSync(Date.now());
        })
        .catch(() => { /* silently skip auto-sync failures */ })
        .finally(() => setIsSyncing(false));
    }
  }, [gisReady, clientIdSet]); // eslint-disable-line react-hooks/exhaustive-deps

  const connect = useCallback(() => {
    if (!tokenClientRef.current) {
      setError('Google is still loading — try again in a moment.');
      return;
    }
    setIsSyncing(true);
    setError(null);
    pendingSync.current = true;
    tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
  }, []);

  const sync = useCallback(async () => {
    const token = readToken();
    if (!token) {
      // Token expired — ask user to re-authenticate
      if (!tokenClientRef.current) return;
      setIsSyncing(true);
      setError(null);
      tokenClientRef.current.requestAccessToken({ prompt: '' });
      return;
    }
    setIsSyncing(true);
    setError(null);
    try {
      const events = await doFetch(token.access_token);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
      localStorage.setItem(SYNC_KEY, String(Date.now()));
      setGoogleEvents(events);
      setLastSync(Date.now());
    } catch (e: any) {
      setError('Sync failed: ' + (e?.message ?? 'Unknown error'));
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    const raw = localStorage.getItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EVENTS_KEY);
    localStorage.removeItem(SYNC_KEY);
    setIsConnected(false);
    setGoogleEvents([]);
    setLastSync(null);
    setError(null);
    // Revoke token
    try {
      if (raw) {
        const t = JSON.parse(raw) as StoredToken;
        google.accounts.oauth2.revoke(t.access_token, () => {});
      }
    } catch { /* ignore */ }
  }, []);

  return { isConnected, isSyncing, error, googleEvents, lastSync, gisReady, clientIdSet, connect, sync, disconnect };
}
