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
    .sort((a,b) => a.due_date.localeCompare(b.due_date));

  const lateBills = bills.filter(b => b.status !== 'paid' && isBefore(parseISO(b.due_date), today));

  const upcomingEvents = events
    .filter(e => !isBefore(parseISO(e.date), today))
    .sort((a,b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const soonEvents = events
    .filter(e => !isBefore(parseISO(e.date), today) && isBefore(parseISO(e.date), in7))
    .sort((a,b) => a.date.localeCompare(b.date));

  const pendingChores = chores.filter(c => !c.completed);
  const pendingTodos = listItems.filter(i => i.list_type === 'todo' && !i.completed);
  const totalUnpaid = bills.filter(b => b.status !== 'paid').reduce((s,b) => s+b.amount_due, 0);

  function eventBadge(dateStr: string) {
    const d = parseISO(dateStr);
    if (isToday(d)) return { label: 'Today', bg: '#FCE8E6', color: '#C62828' };
    if (isTomorrow(d)) return { label: 'Tomorrow', bg: '#FEF3E2', color: '#E65100' };
    const diff = differenceInDays(d, today);
    return { label: `In ${diff}d`, bg: '#E8F0FE', color: '#1565C0' };
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <p className="text-sm text-gray-400 font-medium">{format(today, 'EEEE, MMMM d, yyyy')}</p>
        <h1 className="text-3xl font-bold text-gray-800 mt-0.5">{greeting}, {user.name}! <span>💕</span></h1>
        <p className="text-gray-500 mt-0.5">Here's what's happening in your world today.</p>
      </div>

      {lateBills.length > 0 && (
        <div className="rounded-2xl p-4 border" style={{ background: '#FFF0F0', borderColor: '#FBBABA' }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">🚨</span>
            <div className="flex-1">
              <p className="font-semibold text-red-700">{lateBills.length} Overdue Bill{lateBills.length !== 1 ? 's' : ''}</p>
              <p className="text-sm text-red-500 mt-0.5">{lateBills.map(b => b.name).join(', ')}</p>
            </div>
            <button onClick={() => onNavigate('bills')} className="text-sm text-red-600 font-semibold hover:text-red-800 whitespace-nowrap">View →</button>
          </div>
        </div>
      )}

      {dueSoonBills.length > 0 && (
        <div className="rounded-2xl p-4 border" style={{ background: '#FFFBF0', borderColor: '#FDE68A' }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">🍊</span>
            <div className="flex-1">
              <p className="font-semibold text-amber-700">Bills due in the next 15 days</p>
              <p className="text-sm text-amber-600 mt-0.5">{dueSoonBills.slice(0,3).map(b => b.name).join(', ')}{dueSoonBills.length > 3 ? ` +${dueSoonBills.length-3} more` : ''}</p>
            </div>
            <button onClick={() => onNavigate('bills')} className="text-sm text-amber-600 font-semibold hover:text-amber-800 whitespace-nowrap">View →</button>
          </div>
        </div>
      )}

      {soonEvents.length > 0 && (
        <div className="rounded-2xl p-4 border" style={{ background: '#F0F4FF', borderColor: '#C7D2FE' }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">📅</span>
            <div className="flex-1">
              <p className="font-semibold text-indigo-700">Upcoming appointments & events</p>
              <p className="text-sm text-indigo-500 mt-0.5">{soonEvents.map(e => e.title).join(', ')}</p>
            </div>
            <button onClick={() => onNavigate('events')} className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 whitespace-nowrap">View →</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><span className="text-lg">📅</span><h3 className="font-semibold text-gray-800">Upcoming Events</h3></div>
            <button onClick={() => onNavigate('events')} className="text-xs font-semibold hover:opacity-70" style={{ color: user.color }}>View all →</button>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No upcoming events. Add some!</p>
          ) : upcomingEvents.slice(0,3).map(ev => {
            const badge = eventBadge(ev.date);
            return (
              <div key={ev.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span>{CAT_EMOJI[ev.category] || '📅'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{ev.title}</p>
                  <p className="text-xs text-gray-400">{format(parseISO(ev.date), 'MMM d')}{ev.time ? ` · ${ev.time}` : ''}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><span className="text-lg">🧹</span><h3 className="font-semibold text-gray-800">Pending Chores</h3></div>
            <button onClick={() => onNavigate('chores')} className="text-xs font-semibold hover:opacity-70" style={{ color: user.color }}>View all →</button>
          </div>
          {pendingChores.length === 0 ? (
            <p className="text-sm text-gray-400 italic">All caught up! 🎉</p>
          ) : pendingChores.slice(0,4).map(c => (
            <div key={c.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-sm">•</span>
              <span className="text-sm text-gray-700 flex-1 truncate">{c.title}</span>
              {c.assigned_to && <span className="text-xs text-gray-400">{c.assigned_to}</span>}
            </div>
          ))}
          {pendingChores.length > 4 && <p className="text-xs text-gray-400 mt-1">+{pendingChores.length - 4} more</p>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><span className="text-lg">✅</span><h3 className="font-semibold text-gray-800">To-Do List</h3></div>
            <button onClick={() => onNavigate('lists')} className="text-xs font-semibold hover:opacity-70" style={{ color: user.color }}>View all →</button>
          </div>
          {pendingTodos.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Nothing on the list!</p>
          ) : pendingTodos.slice(0,4).map(t => (
            <div key={t.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.priority === 'high' ? 'bg-red-400' : t.priority === 'medium' ? 'bg-yellow-400' : 'bg-gray-300'}`}/>
              <span className="text-sm text-gray-700 truncate">{t.text}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border shadow-sm p-4 col-span-2 md:col-span-1" style={{ background: '#FFFBF0', borderColor: '#FDE68A' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><span className="text-lg">💳</span><h3 className="font-semibold text-amber-800">Bills Due Soon</h3></div>
            <button onClick={() => onNavigate('bills')} className="text-xs font-semibold text-amber-600 hover:text-amber-800">View all →</button>
          </div>
          {dueSoonBills.length === 0 && lateBills.length === 0 ? (
            <p className="text-sm text-amber-600 italic">No bills due soon!</p>
          ) : [...lateBills.slice(0,2), ...dueSoonBills.slice(0,3)].slice(0,4).map(b => (
            <div key={b.id} className="flex items-center gap-2 py-1.5 border-b border-amber-100 last:border-0">
              <span className="text-sm flex-shrink-0">{b.emoji || '💰'}</span>
              <span className="text-sm text-amber-900 flex-1 truncate">{b.name}</span>
              <span className="text-xs text-gray-500 flex-shrink-0">{format(parseISO(b.due_date),'MMM d')}</span>
              <span className="text-sm font-semibold text-amber-800 flex-shrink-0">${b.amount_due.toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-3 pt-2 border-t border-amber-100">
            <p className="text-xs text-amber-700">Total unpaid: <span className="font-bold text-amber-900">${totalUnpaid.toFixed(2)}</span></p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-300 pb-2">Made with 💕 for our family</p>
    </div>
  );
}
