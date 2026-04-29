import { useState } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isBefore } from 'date-fns';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { FamilyEvent, EventCategory, FamilyMember } from '../types';

const CATEGORIES: EventCategory[] = ['appointment','birthday','school','family','holiday','other'];
const CAT_STYLES: Record<EventCategory, { bg: string; color: string; emoji: string }> = {
  appointment: { bg: '#E8F0FE', color: '#1565C0', emoji: '🏥' },
  birthday:    { bg: '#FCE8E6', color: '#C62828', emoji: '🎂' },
  school:      { bg: '#FEF3E2', color: '#E65100', emoji: '🎒' },
  family:      { bg: '#E6F4EA', color: '#2E7D32', emoji: '👨‍👩‍👧' },
  holiday:     { bg: '#F3E8FF', color: '#6B21A8', emoji: '🎉' },
  other:       { bg: '#F3F4F6', color: '#4B5563', emoji: '📅' },
};
const CAT_DOT: Record<EventCategory, string> = { appointment:'#4285F4', birthday:'#EA4335', school:'#FBBC04', family:'#34A853', holiday:'#9C27B0', other:'#9E9E9E' };

function newId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function emptyEvent(date = '') { return { title:'', date: date || format(new Date(),'yyyy-MM-dd'), time:'', end_time:'', category:'family' as EventCategory, assigned_to:'', notes:'', color:'pink' }; }

interface Props { events: FamilyEvent[]; onChange: (e: FamilyEvent[]) => void; user: FamilyMember; members: FamilyMember[]; }

export default function EventsView({ events, onChange, user, members }: Props) {
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<string|null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<FamilyEvent|null>(null);
  const [draft, setDraft] = useState(emptyEvent());

  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) });
  const startPad = getDay(startOfMonth(current));
  const eventsOnDay = (d: Date) => events.filter(e => isSameDay(parseISO(e.date), d));

  function save() {
    const now = new Date().toISOString();
    if (editing) {
      onChange(events.map(e => e.id === editing.id ? { ...draft, id: editing.id, created_date: editing.created_date, updated_date: now } as FamilyEvent : e));
      setEditing(null);
    } else {
      onChange([...events, { ...draft, id: newId(), created_date: now, updated_date: now } as FamilyEvent]);
      setAdding(false);
    }
    setDraft(emptyEvent());
  }

  function remove(id: string) { if (confirm('Delete event?')) onChange(events.filter(e => e.id !== id)); }
  function startEdit(ev: FamilyEvent) { setEditing(ev); setAdding(false); setSelected(null); setDraft({ title:ev.title, date:ev.date, time:ev.time, end_time:ev.end_time, category:ev.category, assigned_to:ev.assigned_to, notes:ev.notes, color:ev.color }); }

  const upcoming = events.filter(e => !isBefore(parseISO(e.date), new Date())).sort((a,b) => a.date.localeCompare(b.date)).slice(0,8);
  const selectedEvents = selected ? eventsOnDay(parseISO(selected)) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-gray-800">Family Calendar</h1><span className="text-2xl">📅</span></div>
          <p className="text-gray-400 text-sm mt-0.5">Everyone's schedule, all in one place</p>
        </div>
        <div className="flex gap-2">
          <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
            <ExternalLink size={14}/> Google Cal
          </a>
          <button onClick={() => { setAdding(true); setEditing(null); setDraft(emptyEvent(selected||'')); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity" style={{ background: user.color }}>
            <Plus size={16}/> Add Event
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()-1))} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"><ChevronLeft size={18}/></button>
          <h2 className="font-bold text-gray-800 text-lg">{format(current,'MMMM yyyy')}</h2>
          <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()+1))} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"><ChevronRight size={18}/></button>
        </div>
        <div className="grid grid-cols-7 border-b border-gray-50">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 p-2 gap-1">
          {Array(startPad).fill(null).map((_,i) => <div key={'p'+i} className="h-14"/>)}
          {days.map(day => {
            const de = eventsOnDay(day);
            const selKey = format(day,'yyyy-MM-dd');
            const isSel = selected === selKey;
            const isT = isToday(day);
            return (
              <div key={day.toISOString()} onClick={() => setSelected(isSel ? null : selKey)} className={`h-14 flex flex-col items-center pt-1.5 cursor-pointer rounded-xl transition-all ${isSel ? 'ring-2' : 'hover:bg-gray-50'}`} style={isSel ? { background: user.bgColor, outline: '2px solid ' + user.color } : {}}>
                <span className={`text-xs w-7 h-7 flex items-center justify-center rounded-full font-medium ${isT ? 'text-white' : 'text-gray-600'}`} style={isT ? { background: user.color } : {}}>{format(day,'d')}</span>
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center px-1">
                  {de.slice(0,3).map(e => <span key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ background: CAT_DOT[e.category] }}/>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day events */}
      {selected && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">{format(parseISO(selected),'EEEE, MMMM d')}</h3>
            <button onClick={() => { setAdding(true); setEditing(null); setDraft(emptyEvent(selected)); }} className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-xl text-white hover:opacity-90" style={{ background: user.color }}><Plus size={14}/> Add</button>
          </div>
          {selectedEvents.length === 0 ? <p className="text-sm text-gray-400 italic">No events — click Add to create one!</p> : selectedEvents.map(ev => {
            const s = CAT_STYLES[ev.category];
            const assignedM = members.find(m => m.name === ev.assigned_to);
            return (
              <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl mb-2" style={{ background: s.bg }}>
                <span className="text-xl mt-0.5">{s.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: s.color }}>{ev.title}</p>
                  {ev.time && <p className="text-xs opacity-70 mt-0.5">{ev.time}{ev.end_time ? ` – ${ev.end_time}` : ''}</p>}
                  {ev.assigned_to && <p className="text-xs mt-0.5" style={{ color: assignedM?.color || s.color }}>{assignedM?.emoji || '👤'} {ev.assigned_to}</p>}
                  {ev.notes && <p className="text-xs opacity-60 mt-0.5">{ev.notes}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(ev)} className="p-1 opacity-60 hover:opacity-100 transition-opacity"><Pencil size={13}/></button>
                  <button onClick={() => remove(ev.id)} className="p-1 opacity-60 hover:opacity-100 transition-opacity"><Trash2 size={13}/></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit form */}
      {(adding || editing) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-gray-800">{editing ? 'Edit Event' : 'New Event'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-xs text-gray-400 font-medium">Title *</label><input value={draft.title} onChange={e => setDraft(d => ({...d, title: e.target.value}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" placeholder="Event title"/></div>
            <div><label className="text-xs text-gray-400 font-medium">Date</label><input type="date" value={draft.date} onChange={e => setDraft(d => ({...d, date: e.target.value}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"/></div>
            <div><label className="text-xs text-gray-400 font-medium">Category</label><select value={draft.category} onChange={e => setDraft(d => ({...d, category: e.target.value as EventCategory}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">{CATEGORIES.map(c => <option key={c} value={c}>{CAT_STYLES[c].emoji} {c}</option>)}</select></div>
            <div><label className="text-xs text-gray-400 font-medium">Start Time</label><input type="time" value={draft.time} onChange={e => setDraft(d => ({...d, time: e.target.value}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"/></div>
            <div><label className="text-xs text-gray-400 font-medium">End Time</label><input type="time" value={draft.end_time} onChange={e => setDraft(d => ({...d, end_time: e.target.value}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"/></div>
            <div className="col-span-2"><label className="text-xs text-gray-400 font-medium">Assigned To</label><select value={draft.assigned_to} onChange={e => setDraft(d => ({...d, assigned_to: e.target.value}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"><option value="">Everyone</option>{members.map(m => <option key={m.id} value={m.name}>{m.emoji} {m.name}</option>)}</select></div>
            <div className="col-span-2"><label className="text-xs text-gray-400 font-medium">Notes</label><input value={draft.notes} onChange={e => setDraft(d => ({...d, notes: e.target.value}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" placeholder="Any notes?"/></div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setAdding(false); setEditing(null); }} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
            <button onClick={save} disabled={!draft.title} className="px-5 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40" style={{ background: user.color }}>Save</button>
          </div>
        </div>
      )}

      {/* Upcoming list */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Upcoming Events</h3>
        {upcoming.length === 0 ? <p className="text-sm text-gray-400 italic text-center py-6">No upcoming events. Add one!</p> : (
          <div className="space-y-2">
            {upcoming.map(ev => {
              const s = CAT_STYLES[ev.category];
              const assignedM = members.find(m => m.name === ev.assigned_to);
              return (
                <div key={ev.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 px-4 py-3 group">
                  <div className="text-center min-w-10">
                    <p className="text-xs font-bold uppercase text-gray-400">{format(parseISO(ev.date),'MMM')}</p>
                    <p className="text-xl font-bold text-gray-800 leading-none">{format(parseISO(ev.date),'d')}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: s.bg }}>{s.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{ev.title}</p>
                    <div className="flex gap-2 mt-0.5">
                      {ev.time && <span className="text-xs text-gray-400">{ev.time}</span>}
                      {ev.assigned_to && <span className="text-xs" style={{ color: assignedM?.color || '#6B7280' }}>{assignedM?.emoji || '👤'} {ev.assigned_to}</span>}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: s.bg, color: s.color }}>{ev.category}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(ev)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"><Pencil size={13}/></button>
                    <button onClick={() => remove(ev.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
