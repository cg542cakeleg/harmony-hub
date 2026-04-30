import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, Check } from 'lucide-react';
import type { Chore, ChoreFrequency, ChoreCategory, FamilyMember } from '../types';

const FREQ_LABEL: Record<ChoreFrequency, string> = { daily:'Daily', weekly:'Weekly', monthly:'Monthly', as_needed:'As Needed' };
const FREQ_COLORS: Record<ChoreFrequency, { bg: string; color: string }> = {
  daily:     { bg: 'rgba(255,0,110,0.2)',  color: '#FF006E' },
  weekly:    { bg: 'rgba(0,212,255,0.2)',  color: '#00D4FF' },
  monthly:   { bg: 'rgba(0,255,159,0.2)', color: '#00FF9F' },
  as_needed: { bg: 'rgba(182,109,255,0.2)', color: '#B66DFF' },
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

  const inputCls = 'dk-input w-full mt-1 rounded-xl px-3 py-2 text-sm';
  const labelCls = 'text-xs font-black tracking-widest uppercase';

  const STAT_CONFIGS = [
    { label:'Total',   val: chores.length,                        color: '#B66DFF', bg: 'rgba(182,109,255,0.15)' },
    { label:'Pending', val: chores.filter(c=>!c.completed).length, color: '#FFB800', bg: 'rgba(255,184,0,0.15)' },
    { label:'Done',    val: chores.filter(c=>c.completed).length,  color: '#00FF9F', bg: 'rgba(0,255,159,0.15)' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Chores & Tasks</h1>
            <span className="text-2xl">🧹</span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Keep the household running smoothly</p>
        </div>
        <button
          onClick={() => { setAdding(true); setEditing(null); setDraft(emptyChore()); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-white shadow-sm hover:scale-105 transition-all"
          style={{ background: `linear-gradient(135deg, ${user.color} 0%, ${user.color}99 100%)`, boxShadow: `0 4px 16px ${user.color}50` }}
        >
          <Plus size={16}/> Add Chore
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {STAT_CONFIGS.map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: s.bg, border: `1px solid ${s.color}40` }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs font-black tracking-widest uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all','pending','done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-xl text-sm font-black capitalize transition-all"
            style={filter === f
              ? { background: user.color, color: 'white', boxShadow: `0 4px 12px ${user.color}50` }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >{f}</button>
        ))}
      </div>

      {/* Add/Edit form */}
      {(adding || editing) && (
        <div className="dk-card rounded-2xl p-5 space-y-4">
          <h3 className="font-black text-white tracking-tight">{editing ? 'Edit Chore' : 'New Chore'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className={labelCls} style={{ color: 'rgba(255,255,255,0.45)' }}>Title *</label><input value={draft.title} onChange={e => setDraft(d => ({...d, title: e.target.value}))} className={inputCls} placeholder="Chore name"/></div>
            <div><label className={labelCls} style={{ color: 'rgba(255,255,255,0.45)' }}>Category</label><select value={draft.category} onChange={e => setDraft(d => ({...d, category: e.target.value as ChoreCategory}))} className="dk-select w-full mt-1 rounded-xl px-3 py-2 text-sm">{CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}</select></div>
            <div><label className={labelCls} style={{ color: 'rgba(255,255,255,0.45)' }}>Frequency</label><select value={draft.frequency} onChange={e => setDraft(d => ({...d, frequency: e.target.value as ChoreFrequency}))} className="dk-select w-full mt-1 rounded-xl px-3 py-2 text-sm">{FREQUENCIES.map(f => <option key={f} value={f}>{FREQ_LABEL[f]}</option>)}</select></div>
            <div><label className={labelCls} style={{ color: 'rgba(255,255,255,0.45)' }}>Assigned To</label><select value={draft.assigned_to} onChange={e => setDraft(d => ({...d, assigned_to: e.target.value}))} className="dk-select w-full mt-1 rounded-xl px-3 py-2 text-sm"><option value="">Anyone</option>{members.map(m => <option key={m.id} value={m.name}>{m.emoji} {m.name}</option>)}</select></div>
            <div><label className={labelCls} style={{ color: 'rgba(255,255,255,0.45)' }}>Day of Week</label><select value={draft.day_of_week} onChange={e => setDraft(d => ({...d, day_of_week: e.target.value}))} className="dk-select w-full mt-1 rounded-xl px-3 py-2 text-sm"><option value="">Any</option>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div className="col-span-2"><label className={labelCls} style={{ color: 'rgba(255,255,255,0.45)' }}>Notes</label><input value={draft.notes} onChange={e => setDraft(d => ({...d, notes: e.target.value}))} className={inputCls} placeholder="Optional notes"/></div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setAdding(false); setEditing(null); }} className="px-4 py-2 rounded-xl text-sm font-black hover:bg-white/10 transition-all" style={{ color: 'rgba(255,255,255,0.6)' }}>Cancel</button>
            <button onClick={save} disabled={!draft.title} className="px-5 py-2 rounded-xl text-sm font-black text-white hover:scale-105 disabled:opacity-40 transition-all" style={{ background: user.color, boxShadow: `0 4px 12px ${user.color}50` }}>Save</button>
          </div>
        </div>
      )}

      {/* Chore list */}
      {displayed.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎉</p>
          <p className="font-black text-white">All done! No chores here.</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Add some chores to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(chore => {
            const assignedMember = chore.assigned_to ? memberForName(chore.assigned_to) : null;
            return (
              <div key={chore.id} className={`dk-card rounded-2xl flex items-center gap-3 px-4 py-3.5 group transition-all hover:bg-white/5 ${chore.completed ? 'opacity-50' : ''}`}>
                <button onClick={() => toggle(chore.id)} className="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all" style={chore.completed ? { background: user.color, borderColor: user.color } : { borderColor: 'rgba(255,255,255,0.25)' }}>
                  {chore.completed && <Check size={14} className="text-white" strokeWidth={3}/>}
                </button>
                <span className="text-xl flex-shrink-0">{CAT_EMOJI[chore.category]}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${chore.completed ? 'line-through' : 'text-white'}`} style={chore.completed ? { color: 'rgba(255,255,255,0.35)' } : {}}>{chore.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-black" style={{ background: FREQ_COLORS[chore.frequency].bg, color: FREQ_COLORS[chore.frequency].color }}>{FREQ_LABEL[chore.frequency]}</span>
                    {chore.assigned_to && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${assignedMember?.color || '#B66DFF'}22`, color: assignedMember?.color || '#B66DFF' }}>
                        {assignedMember?.emoji || '👤'} {chore.assigned_to}
                      </span>
                    )}
                    {chore.day_of_week && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>{chore.day_of_week}</span>}
                  </div>
                  {chore.notes && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{chore.notes}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => startEdit(chore)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#B66DFF' }}><Pencil size={14}/></button>
                  <button onClick={() => remove(chore.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#FF006E' }}><Trash2 size={14}/></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}