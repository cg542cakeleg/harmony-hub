import { format, parseISO, isBefore, addDays, isToday, isTomorrow, differenceInDays } from 'date-fns';
import type { Bill, Chore, FamilyEvent, ListItem, FamilyMember } from '../types';

interface Props {
  bills: Bill[];
  chores: Chore[];
  events: FamilyEvent[];
  listItems: ListItem[];
  user: FamilyMember;
  onNavigate: (tab: 'bills' | 'chores' | 'events' | 'lists') => void;
}

const CAT_EMOJI: Record<string, string> = { appointment:'🏥', birthday:'🎂', school:'🎒', family:'👨‍👩‍👧', holiday:'🎉', other:'📅' };

export default function Dashboard({ bills, chores, events, listItems, user, onNavigate }: Props) {
  const today = new Date();
  const in15 = addDays(today, 15);
  const in7 = addDays(today, 7);

  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const dueSoonBills = bills
    .filter(b => b.status !== 'paid' && !isBefore(parseISO(b.due_date), today) && isBefore(parseISO(b.due_date), in15))
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  const lateBills = bills.filter(b => b.status !== 'paid' && isBefore(parseISO(b.due_date), today));

  const upcomingEvents = events
    .filter(e => !isBefore(parseISO(e.date), today))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const soonEvents = events
    .filter(e => !isBefore(parseISO(e.date), today) && isBefore(parseISO(e.date), in7))
    .sort((a, b) => a.date.localeCompare(b.date));

  const pendingChores = chores.filter(c => !c.completed);
  const pendingTodos = listItems.filter(i => i.list_type === 'todo' && !i.completed);
  const totalUnpaid = bills.filter(b => b.status !== 'paid').reduce((s, b) => s + b.amount_due, 0);

  function eventBadge(dateStr: string) {
    const d = parseISO(dateStr);
    if (isToday(d)) return { label: 'TODAY', border: '#FF006E', color: '#FF006E', bg: 'rgba(255,0,110,0.15)' };
    if (isTomorrow(d)) return { label: 'TOMORROW', border: '#FF10F0', color: '#FF10F0', bg: 'rgba(255,16,240,0.15)' };
    const diff = differenceInDays(d, today);
    return { label: `IN ${diff}D`, border: '#00D4FF', color: '#00D4FF', bg: 'rgba(0,212,255,0.15)' };
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-6">

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 glossy" style={{
        background: 'linear-gradient(135deg, rgba(255,16,240,0.15) 0%, rgba(182,109,255,0.15) 50%, rgba(0,212,255,0.1) 100%)',
        boxShadow: '0 8px 40px rgba(255,16,240,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '2px solid rgba(255,16,240,0.3)',
      }}>
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none animate-glow" style={{
          background: 'radial-gradient(circle, rgba(255,16,240,0.3) 0%, transparent 70%)',
        }} />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full pointer-events-none animate-glow" style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.25) 0%, transparent 70%)',
          animationDelay: '1.5s',
        }} />
        <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {format(today, 'EEEE, MMMM d, yyyy')}
        </p>
        <h1 className="text-3xl font-black text-white mt-1 tracking-tight leading-tight" style={{
          textShadow: '0 0 20px rgba(255,16,240,0.6), 0 0 40px rgba(255,16,240,0.3)',
        }}>
          {greeting}, {user.name}! <span className="inline-block animate-bounce">✨</span>
        </h1>
        <p className="mt-2 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Here's what's happening in your world today.
        </p>
      </div>

      {/* Alert: Overdue Bills */}
      {lateBills.length > 0 && (
        <div className="rounded-2xl p-4 glossy" style={{
          background: 'rgba(255,0,110,0.1)',
          border: '2px solid rgba(255,0,110,0.4)',
          boxShadow: '0 4px 24px rgba(255,0,110,0.2)',
        }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">🚨</span>
            <div className="flex-1">
              <p className="font-black text-white tracking-tight">
                {lateBills.length} OVERDUE BILL{lateBills.length !== 1 ? 'S' : ''}
              </p>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,100,140,0.9)' }}>
                {lateBills.slice(0, 3).map(b => b.name).join(', ')}{lateBills.length > 3 ? ` +${lateBills.length - 3} more` : ''}
              </p>
            </div>
            <button
              onClick={() => onNavigate('bills')}
              className="text-xs font-black tracking-widest px-3 py-1.5 rounded-xl transition-all hover:scale-105"
              style={{ background: 'rgba(255,0,110,0.3)', color: '#FF006E', border: '1px solid rgba(255,0,110,0.5)' }}
            >VIEW →</button>
          </div>
        </div>
      )}

      {/* Alert: Bills Due Soon */}
      {dueSoonBills.length > 0 && (
        <div className="rounded-2xl p-4 glossy" style={{
          background: 'rgba(0,212,255,0.08)',
          border: '2px solid rgba(0,212,255,0.3)',
          boxShadow: '0 4px 24px rgba(0,212,255,0.15)',
        }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">⚡</span>
            <div className="flex-1">
              <p className="font-black text-white tracking-tight">BILLS DUE IN 15 DAYS</p>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(0,212,255,0.9)' }}>
                {dueSoonBills.slice(0, 3).map(b => b.name).join(', ')}
                {dueSoonBills.length > 3 ? ` +${dueSoonBills.length - 3} more` : ''}
              </p>
            </div>
            <button
              onClick={() => onNavigate('bills')}
              className="text-xs font-black tracking-widest px-3 py-1.5 rounded-xl transition-all hover:scale-105"
              style={{ background: 'rgba(0,212,255,0.2)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.4)' }}
            >VIEW →</button>
          </div>
        </div>
      )}

      {/* Alert: Upcoming Events */}
      {soonEvents.length > 0 && (
        <div className="rounded-2xl p-4 glossy" style={{
          background: 'rgba(182,109,255,0.1)',
          border: '2px solid rgba(182,109,255,0.35)',
          boxShadow: '0 4px 24px rgba(182,109,255,0.2)',
        }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">📅</span>
            <div className="flex-1">
              <p className="font-black text-white tracking-tight">UPCOMING EVENTS THIS WEEK</p>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(182,109,255,0.9)' }}>
                {soonEvents.map(e => e.title).join(', ')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('events')}
              className="text-xs font-black tracking-widest px-3 py-1.5 rounded-xl transition-all hover:scale-105"
              style={{ background: 'rgba(182,109,255,0.2)', color: '#B66DFF', border: '1px solid rgba(182,109,255,0.4)' }}
            >VIEW →</button>
          </div>
        </div>
      )}

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Upcoming Events card */}
        <div className="rounded-2xl p-5 glossy transition-transform hover:scale-[1.02]" style={{
          background: 'linear-gradient(135deg, rgba(182,109,255,0.12) 0%, rgba(0,212,255,0.08) 100%)',
          border: '2px solid rgba(182,109,255,0.3)',
          boxShadow: '0 8px 32px rgba(182,109,255,0.2)',
        }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <h3 className="font-black text-white tracking-tight text-sm">UPCOMING EVENTS</h3>
            </div>
            <button onClick={() => onNavigate('events')} className="text-xs font-black tracking-widest transition-opacity hover:opacity-70" style={{ color: '#B66DFF' }}>ALL →</button>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.4)' }}>No upcoming events. Add some!</p>
          ) : upcomingEvents.slice(0, 3).map(ev => {
            const badge = eventBadge(ev.date);
            return (
              <div key={ev.id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(182,109,255,0.15)' }}>
                <span>{CAT_EMOJI[ev.category] || '📅'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{ev.title}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {format(parseISO(ev.date), 'MMM d')}{ev.time ? ` · ${ev.time}` : ''}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-black flex-shrink-0" style={{
                  background: badge.bg, color: badge.color, border: `1px solid ${badge.border}55`,
                }}>{badge.label}</span>
              </div>
            );
          })}
        </div>

        {/* Pending Chores card */}
        <div className="rounded-2xl p-5 glossy transition-transform hover:scale-[1.02]" style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(182,109,255,0.08) 100%)',
          border: '2px solid rgba(0,212,255,0.3)',
          boxShadow: '0 8px 32px rgba(0,212,255,0.2)',
        }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧹</span>
              <h3 className="font-black text-white tracking-tight text-sm">PENDING CHORES</h3>
            </div>
            <button onClick={() => onNavigate('chores')} className="text-xs font-black tracking-widest transition-opacity hover:opacity-70" style={{ color: '#00D4FF' }}>ALL →</button>
          </div>
          {pendingChores.length === 0 ? (
            <p className="text-sm font-bold" style={{ color: '#00D4FF' }}>All caught up! 🎉</p>
          ) : pendingChores.slice(0, 4).map(c => (
            <div key={c.id} className="flex items-center gap-2 py-2" style={{ borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#00D4FF', boxShadow: '0 0 6px #00D4FF' }} />
              <span className="text-sm font-medium text-white flex-1 truncate">{c.title}</span>
              {c.assigned_to && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,212,255,0.15)', color: '#00D4FF' }}>{c.assigned_to}</span>
              )}
            </div>
          ))}
          {pendingChores.length > 4 && <p className="text-xs mt-2" style={{ color: 'rgba(0,212,255,0.6)' }}>+{pendingChores.length - 4} more</p>}
        </div>

        {/* To-Do List card */}
        <div className="rounded-2xl p-5 glossy transition-transform hover:scale-[1.02]" style={{
          background: 'linear-gradient(135deg, rgba(255,16,240,0.1) 0%, rgba(182,109,255,0.08) 100%)',
          border: '2px solid rgba(255,16,240,0.25)',
          boxShadow: '0 8px 32px rgba(255,16,240,0.15)',
        }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <h3 className="font-black text-white tracking-tight text-sm">TO-DO LIST</h3>
            </div>
            <button onClick={() => onNavigate('lists')} className="text-xs font-black tracking-widest transition-opacity hover:opacity-70" style={{ color: '#FF10F0' }}>ALL →</button>
          </div>
          {pendingTodos.length === 0 ? (
            <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.4)' }}>Nothing on the list!</p>
          ) : pendingTodos.slice(0, 4).map(t => (
            <div key={t.id} className="flex items-center gap-2 py-2" style={{ borderBottom: '1px solid rgba(255,16,240,0.1)' }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{
                background: t.priority === 'high' ? '#FF006E' : t.priority === 'medium' ? '#FF10F0' : '#B66DFF',
                boxShadow: `0 0 6px ${t.priority === 'high' ? '#FF006E' : t.priority === 'medium' ? '#FF10F0' : '#B66DFF'}`,
              }} />
              <span className="text-sm font-medium text-white truncate">{t.text}</span>
            </div>
          ))}
        </div>

        {/* Bills Due Soon card */}
        <div className="rounded-2xl p-5 glossy transition-transform hover:scale-[1.02]" style={{
          background: 'linear-gradient(135deg, rgba(255,180,0,0.1) 0%, rgba(255,100,0,0.08) 100%)',
          border: '2px solid rgba(255,180,0,0.3)',
          boxShadow: '0 8px 32px rgba(255,150,0,0.15)',
        }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">💳</span>
              <h3 className="font-black text-white tracking-tight text-sm">BILLS DUE SOON</h3>
            </div>
            <button onClick={() => onNavigate('bills')} className="text-xs font-black tracking-widest transition-opacity hover:opacity-70" style={{ color: '#FFB800' }}>ALL →</button>
          </div>
          {dueSoonBills.length === 0 && lateBills.length === 0 ? (
            <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.4)' }}>No bills due soon!</p>
          ) : [...lateBills.slice(0, 2), ...dueSoonBills.slice(0, 3)].slice(0, 4).map(b => (
            <div key={b.id} className="flex items-center gap-2 py-2" style={{ borderBottom: '1px solid rgba(255,180,0,0.1)' }}>
              <span className="text-sm flex-shrink-0">{b.emoji || '💰'}</span>
              <span className="text-sm font-medium text-white flex-1 truncate">{b.name}</span>
              <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.45)' }}>{format(parseISO(b.due_date), 'MMM d')}</span>
              <span className="text-sm font-black flex-shrink-0" style={{ color: '#FFB800' }}>${b.amount_due.toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,180,0,0.2)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Total unpaid: <span className="font-black" style={{ color: '#FFB800' }}>${totalUnpaid.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs font-bold tracking-widest pb-2 chrome-text">
        MADE WITH ✨ FOR OUR FAMILY
      </p>
    </div>
  );
}