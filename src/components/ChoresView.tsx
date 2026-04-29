import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, Check } from 'lucide-react';
import type { Chore, ChoreFrequency, ChoreCategory, FamilyMember } from '../types';

const FREQ_LABEL: Record<ChoreFrequency, string> = { daily:'Daily', weekly:'Weekly', monthly:'Monthly', as_needed:'As Needed' };
const FREQ_COLORS: Record<ChoreFrequency, { bg: string; color: string }> = {
  daily: { bg: '#FCE8E6', color: '#C62828' },
  weekly: { bg: '#E8F0FE', color: '#1565C0' },
  monthly: { bg: '#E6F4EA', color: '#2E7D32' },
  as_needed: { bg: '#F3E8FF', color: '#6B21A8' },
};
const CAT_EMOJI: Record<ChoreCategory, string> = { cleaning:'🧹', laundry:'👕', kitchen:'🍽️', yard:'🌿', errands:'🚗', kids:'👶', pets:'🐾', other:'📋' };
const CATEGORIES: ChoreCategory[] = ['cleaning','laundry','kitchen','yard','errands','kids','pets','other'];
const FREQUENCIES: ChoreFrequency[] = ['daily','weekly','monthly','as_needed'];
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function newId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function emptyChore() { return { title:'', frequency:'weekly' as ChoreFrequency, assigned_to:'', day_of_week:'', completed:false, completed_date:'', notes:'', category:'cleaning' as ChoreCategory }; }

interface Props { chores: Chore[]; onChange: (c: Chore[]) => void; user: FamilyMember; members: FamilyMember[]; }

export default function ChoresView({ chores, onChange, user, members }: Props) {
  const [filter, setFilter] = useState<'all'|'pending'|'done'>('pending');
  const [editing, setEditing] = useState<Chore|null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyChore());

  const displayed = chores.filter(c => filter === 'all' ? true : filter === 'pending' ? !c.completed : c.completed);

  function save() {
    const now = new Date().toISOString();
    if (editing) {
      onChange(chores.map(c => c.id === editing.id ? { ...draft, id: editing.id, created_date: editing.created_date, updated_date: now } as Chore : c));
      setEditing(null);
    } else {
      onChange([...chores, { ...draft, id: newId(), created_date: now, updated_date: now } as Chore]);
      setAdding(false);
    }
    setDraft(emptyChore());
  }

  function remove(id: string) { if (confirm('Delete this chore?')) onChange(chores.filter(c => c.id !== id)); }

  function toggle(id: string) {
    const now = new Date().toISOString();
    onChange(chores.map(c => c.id === id ? { ...c, completed: !c.completed, completed_date: !c.completed ? format(new Date(),'yyyy-MM-dd') : '', updated_date: now } : c));
  }

  function startEdit(c: Chore) {
    setEditing(c); setAdding(false);
    setDraft({ title:c.title, frequency:c.frequency, assigned_to:c.assigned_to, day_of_week:c.day_of_week, completed:c.completed, completed_date:c.completed_date, notes:c.notes, category:c.category });
  }

  const memberForName = (name: string) => members.find(m => m.name.toLowerCase() === name.toLowerCase());

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-gray-800">Chores & Tasks</h1><span className="text-2xl">🧹</span></div>
          <p className="text-gray-400 text-sm mt-0.5">Keep the household running smoothly</p>
        </div>
        <button onClick={() => { setAdding(true); setEditing(null); setDraft(emptyChore()); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity" style={{ background: user.color }}>
          <Plus size={16}/> Add Chore
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[{label:'Total',val:chores.length,bg:'#F3E8FF',color:'#6B21A8'},{label:'Pending',val:chores.filter(c=>!c.completed).length,bg:'#FEF3E2',color:'#E65100'},{label:'Done',val:chores.filter(c=>c.completed).length,bg:'#E6F4EA',color:'#2E7D32'}].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center border border-gray-100 shadow-sm bg-white">
            <p className="text-2xl font-bold" style={{color:s.color}}>{s.val}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all','pending','done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className="px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-colors border" style={filter === f ? { background: user.bgColor, color: user.color, borderColor: user.color + '40' } : { background: 'white', color: '#6B7280', borderColor: '#E5E7EB' }}>{f}</button>
        ))}
      </div>

      {/* Add/Edit form */}
      {(adding || editing) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-gray-800">{editing ? 'Edit Chore' : 'New Chore'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-xs text-gray-400 font-medium">Title *</label><input value={draft.title} onChange={e => setDraft(d => ({...d, title: e.target.value}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" placeholder="Chore name"/></div>
            <div><label className="text-xs text-gray-400 font-medium">Category</label><select value={draft.category} onChange={e => setDraft(d => ({...d, category: e.target.value as ChoreCategory}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">{CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}</select></div>
            <div><label className="text-xs text-gray-400 font-medium">Frequency</label><select value={draft.frequency} onChange={e => setDraft(d => ({...d, frequency: e.target.value as ChoreFrequency}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">{FREQUENCIES.map(f => <option key={f} value={f}>{FREQ_LABEL[f]}</option>)}</select></div>
            <div><label className="text-xs text-gray-400 font-medium">Assigned To</label><select value={draft.assigned_to} onChange={e => setDraft(d => ({...d, assigned_to: e.target.value}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"><option value="">Anyone</option>{members.map(m => <option key={m.id} value={m.name}>{m.emoji} {m.name}</option>)}</select></div>
            <div><label className="text-xs text-gray-400 font-medium">Day of Week</label><select value={draft.day_of_week} onChange={e => setDraft(d => ({...d, day_of_week: e.target.value}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"><option value="">Any</option>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div className="col-span-2"><label className="text-xs text-gray-400 font-medium">Notes</label><input value={draft.notes} onChange={e => setDraft(d => ({...d, notes: e.target.value}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" placeholder="Optional notes"/></div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setAdding(false); setEditing(null); }} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
            <button onClick={save} disabled={!draft.title} className="px-5 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40" style={{ background: user.color }}>Save</button>
          </div>
        </div>
      )}

      {/* Chore list */}
      {displayed.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎉</p>
          <p className="font-semibold text-gray-600">All done! No chores here.</p>
          <p className="text-sm text-gray-400 mt-1">Add some chores to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(chore => {
            const assignedMember = chore.assigned_to ? memberForName(chore.assigned_to) : null;
            return (
              <div key={chore.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 px-4 py-3.5 group transition-all ${chore.completed ? 'opacity-60' : ''}`}>
                <button onClick={() => toggle(chore.id)} className="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all" style={chore.completed ? { background: user.color, borderColor: user.color } : { borderColor: '#D1D5DB' }}>
                  {chore.completed && <Check size={14} className="text-white" strokeWidth={3}/>}
                </button>
                <span className="text-xl flex-shrink-0">{CAT_EMOJI[chore.category]}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${chore.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{chore.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: FREQ_COLORS[chore.frequency].bg, color: FREQ_COLORS[chore.frequency].color }}>{FREQ_LABEL[chore.frequency]}</span>
                    {chore.assigned_to && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: assignedMember?.bgColor || '#F3F4F6', color: assignedMember?.color || '#6B7280' }}>
                        {assignedMember?.emoji || '👤'} {chore.assigned_to}
                      </span>
                    )}
                    {chore.day_of_week && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{chore.day_of_week}</span>}
                  </div>
                  {chore.notes && <p className="text-xs text-gray-400 mt-0.5">{chore.notes}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => startEdit(chore)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"><Pencil size={14}/></button>
                  <button onClick={() => remove(chore.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
