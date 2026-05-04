import { useState, useCallback } from 'react';
import { C, type Event } from '../../hooks/use-harmony-data';
import { Mono, Pixel, Button, panelStyle, insetStyle } from '../RetroUI';
import { csrfFetch } from '@workspace/replit-auth-web';
import * as Dialog from '@radix-ui/react-dialog';

const GOOGLE_BLUE = '#4285F4';

function GoogleBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 12, height: 12, borderRadius: '50%', background: GOOGLE_BLUE,
      border: `1px solid ${C.navy}`, flexShrink: 0,
      fontFamily: 'sans-serif', fontSize: 8, color: '#fff', fontWeight: 'bold',
      lineHeight: 1,
    }}>G</span>
  );
}

function formatLastSynced(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'JUST NOW';
  if (diff < 3600) return `${Math.floor(diff / 60)}m AGO`;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function CalendarTab({ data, updateData }: { data: any; updateData: any }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '', date: '', time: '', color: C.blue,
    memberId: data.members[0]?.id || '', pushToGoogle: false,
  });

  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncErrorCode, setSyncErrorCode] = useState<string | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncError(null);
    setSyncErrorCode(null);
    try {
      const res = await fetch('/api/calendar/sync', { credentials: 'include' });
      const data2 = await res.json();
      if (!res.ok) {
        setSyncError(data2.message ?? data2.error ?? 'Sync failed.');
        setSyncErrorCode(data2.error ?? null);
        return;
      }
      const incoming: Event[] = data2.events ?? [];
      updateData((prev: any) => {
        const existingGoogleIds = new Set(
          prev.events.filter((e: Event) => e.googleId).map((e: Event) => e.googleId),
        );
        const fresh = incoming.filter((e) => !existingGoogleIds.has(e.googleId));
        return { ...prev, events: [...prev.events, ...fresh] };
      });
      setLastSynced(data2.syncedAt ?? new Date().toISOString());
    } catch {
      setSyncError('Network error. Could not reach the server.');
    } finally {
      setSyncing(false);
    }
  }, [updateData]);

  const addEvent = useCallback(async () => {
    if (!newEvent.title || !newEvent.date) return;
    const id = Math.random().toString(36).substring(7);
    const ev: Event = { ...newEvent, id, source: 'local' };
    updateData((prev: any) => ({ ...prev, events: [...prev.events, ev] }));

    if (newEvent.pushToGoogle) {
      try {
        await csrfFetch('/api/calendar/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newEvent.title, date: newEvent.date, time: newEvent.time }),
        });
      } catch {
        // push failure is non-blocking
      }
    }

    setNewEvent({ title: '', date: '', time: '', color: C.blue, memberId: data.members[0]?.id || '', pushToGoogle: false });
    setOpen(false);
  }, [newEvent, data.members, updateData]);

  const toggleHideGoogle = useCallback((eventId: string) => {
    updateData((prev: any) => ({
      ...prev,
      events: prev.events.map((e: Event) =>
        e.id === eventId ? { ...e, hidden: !e.hidden } : e,
      ),
    }));
  }, [updateData]);

  const getEventsForDay = (day: number) => {
    const dStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return (data.events as Event[]).filter((e) => e.date === dStr && !e.hidden);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const inputStyle: React.CSSProperties = {
    ...insetStyle(C.white), padding: 8,
    fontFamily: "'Courier New', Courier, monospace", fontSize: 14,
    outline: 'none',
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: C.pink, padding: '10px 14px',
        border: `4px solid ${C.navy}`, boxShadow: `4px 4px 0 ${C.navy}`,
        flexWrap: 'wrap', gap: 8,
      }}>
        <Button onClick={prevMonth} bg={C.white} testId="btn-prev-month">
          <Pixel size={20}>&lt; PREV</Pixel>
        </Button>

        <Pixel size={28} color={C.white}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Pixel>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Sync button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Button
              onClick={handleSync}
              bg={syncing ? C.navy : GOOGLE_BLUE}
              disabled={syncing}
              testId="btn-sync-calendar"
            >
              <Pixel size={18} color={C.white}>
                {syncing ? 'SYNCING...' : '⟳ SYNC'}
              </Pixel>
            </Button>
            {lastSynced && (
              <Mono style={{ fontSize: 9, color: C.white, textAlign: 'center' }}>
                {formatLastSynced(lastSynced)}
              </Mono>
            )}
          </div>

          {/* Add event dialog */}
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button bg={C.gold} testId="btn-add-event">
                <Pixel size={20}>+ ADD EVENT</Pixel>
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} />
              <Dialog.Content style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '90%', maxWidth: 420, background: C.cream,
                border: `4px solid ${C.navy}`, boxShadow: `6px 6px 0 ${C.navy}`,
                zIndex: 51, borderRadius: 0,
              }}>
                <div style={{ background: C.gold, borderBottom: `4px solid ${C.navy}`, padding: '8px 12px' }}>
                  <Pixel size={20}>NEW EVENT</Pixel>
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    placeholder="EVENT TITLE..." value={newEvent.title}
                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    style={{ ...insetStyle(C.white), padding: 8, fontFamily: "'VT323', monospace", fontSize: 20, outline: 'none' }}
                    data-testid="input-event-title"
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input type="date" value={newEvent.date}
                      onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                      style={{ ...inputStyle, flex: 1 }} data-testid="input-event-date" />
                    <input type="time" value={newEvent.time}
                      onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                      style={{ ...inputStyle, flex: 1 }} data-testid="input-event-time" />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <select value={newEvent.memberId}
                      onChange={e => setNewEvent({ ...newEvent, memberId: e.target.value })}
                      style={{ ...inputStyle, flex: 1 }} data-testid="select-event-member">
                      {data.members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <select value={newEvent.color}
                      onChange={e => setNewEvent({ ...newEvent, color: e.target.value })}
                      style={{ ...inputStyle, flex: 1, backgroundColor: newEvent.color, color: C.white }}
                      data-testid="select-event-color">
                      <option value={C.blue} style={{ background: C.blue }}>BLUE</option>
                      <option value={C.pink} style={{ background: C.pink }}>PINK</option>
                      <option value={C.green} style={{ background: C.green }}>GREEN</option>
                      <option value={C.orange} style={{ background: C.orange }}>ORANGE</option>
                      <option value={C.red} style={{ background: C.red }}>RED</option>
                    </select>
                  </div>

                  {/* Push to Google checkbox */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newEvent.pushToGoogle}
                      onChange={e => setNewEvent({ ...newEvent, pushToGoogle: e.target.checked })}
                      data-testid="checkbox-push-to-google"
                      style={{ width: 16, height: 16, cursor: 'pointer' }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <GoogleBadge />
                      <Mono style={{ fontSize: 13, color: C.navy }}>ALSO ADD TO GOOGLE CALENDAR</Mono>
                    </span>
                  </label>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                    <Dialog.Close asChild>
                      <Button bg={C.white} testId="btn-cancel-event"><Pixel size={18}>CANCEL</Pixel></Button>
                    </Dialog.Close>
                    <Button bg={C.pink} onClick={addEvent} testId="btn-save-event">
                      <Pixel size={18} color={C.white}>SAVE</Pixel>
                    </Button>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          <Button onClick={nextMonth} bg={C.white} testId="btn-next-month">
            <Pixel size={20}>NEXT &gt;</Pixel>
          </Button>
        </div>
      </div>

      {/* Sync error banner */}
      {syncError && (
        <div style={{
          background: C.red, border: `3px solid ${C.navy}`,
          boxShadow: `3px 3px 0 ${C.navy}`, padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          flexWrap: 'wrap',
        }}>
          <Mono style={{ fontSize: 13, color: C.white, flex: 1 }}>⚠ {syncError}</Mono>
          <div style={{ display: 'flex', gap: 8 }}>
            {(syncErrorCode === 'NO_GOOGLE_TOKEN' || syncErrorCode === 'TOKEN_EXPIRED') && (
              <Button
                bg={GOOGLE_BLUE}
                onClick={() => { window.location.href = '/api/auth/google?returnTo=/harmony-hub/'; }}
                testId="btn-reauth-google"
              >
                <Pixel size={16} color={C.white}>SIGN IN WITH GOOGLE</Pixel>
              </Button>
            )}
            <Button bg={C.white} onClick={() => setSyncError(null)} testId="btn-dismiss-sync-error">
              <Pixel size={16}>DISMISS</Pixel>
            </Button>
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <div style={{ ...panelStyle(C.white), padding: 10, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, minHeight: 480 }}>
        {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
          <div key={d} style={{ textAlign: 'center', background: C.navy, color: C.white, padding: '4px 0' }}>
            <Pixel size={16} color={C.white}>{d}</Pixel>
          </div>
        ))}
        {days.map((d, i) => {
          const dStr = d
            ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            : '';
          const isToday = dStr === todayStr;
          const dayEvents = d ? getEventsForDay(d) : [];

          return (
            <div key={i} style={{
              ...insetStyle(d ? (isToday ? C.gold : C.cream) : C.bg),
              height: 90, padding: 4,
              display: 'flex', flexDirection: 'column',
              opacity: d ? 1 : 0.5, overflow: 'hidden',
            }}>
              {d && <Pixel size={16} color={C.navy} style={{ marginBottom: 4 }}>{d}</Pixel>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
                {dayEvents.map((e: Event) => (
                  <div
                    key={e.id}
                    style={{ background: e.color, padding: '2px 4px', border: `1px solid ${C.navy}`, display: 'flex', alignItems: 'center', gap: 2 }}
                    data-testid={`event-${e.id}`}
                  >
                    {e.source === 'google' && <GoogleBadge />}
                    <Mono style={{ fontSize: 9, color: C.white, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {e.time && !e.allDay ? `${e.time} ` : ''}{e.title}
                    </Mono>
                    {e.source === 'google' && (
                      <button
                        onClick={() => toggleHideGoogle(e.id)}
                        title="Hide this event"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.white, fontSize: 8, padding: 0, lineHeight: 1, flexShrink: 0 }}
                        data-testid={`btn-hide-event-${e.id}`}
                      >✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {(data.events as Event[]).some((e: Event) => e.source === 'google') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' }}>
          <GoogleBadge />
          <Mono style={{ fontSize: 11, color: C.navy }}>= IMPORTED FROM GOOGLE CALENDAR (click ✕ to hide)</Mono>
        </div>
      )}
    </div>
  );
}
