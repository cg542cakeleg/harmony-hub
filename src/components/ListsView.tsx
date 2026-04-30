import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import type { ListItem, ListType, Priority, FamilyMember } from '../types';

const LIST_TYPES: ListType[] = ['grocery','todo','reminder','braindump'];
const LIST_META: Record<ListType, { label: string; emoji: string; color: string; bg: string }> = {
  grocery:   { label: 'Grocery',    emoji: '🛒', color: '#00FF9F', bg: 'rgba(0,255,159,0.18)' },
  todo:      { label: 'To-Do',      emoji: '✅', color: '#00D4FF', bg: 'rgba(0,212,255,0.18)' },
  reminder:  { label: 'Reminders',  emoji: '⏰', color: '#B66DFF', bg: 'rgba(182,109,255,0.18)' },
  braindump: { label: 'Brain Dump', emoji: '🧠', color: '#FF006E', bg: 'rgba(255,0,110,0.18)' },
};
const PRIORITY_DOT: Record<Priority, string> = { low: 'rgba(255,255,255,0.25)', medium: '#FFB800', high: '#FF006E' };

function newId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

interface Props { items: ListItem[]; onChange: (i: ListItem[]) => void; user: FamilyMember; members: FamilyMember[]; }

export default function ListsView({ items, onChange, members }: Props) {
  const [activeType, setActiveType] = useState<ListType>('grocery');
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [quantity, setQuantity] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const meta = LIST_META[activeType];
  const displayed = items.filter(i => i.list_type === activeType);
  const pending = displayed.filter(i => !i.completed);
  const done = displayed.filter(i => i.completed);

  function add() {
    if (!text.trim()) return;
    const now = new Date().toISOString();
    onChange([...items, { id: newId(), text: text.trim(), list_type: activeType, completed: false, priority, due_date: '', assigned_to: assignedTo, category: '', quantity, created_date: now, updated_date: now } as ListItem]);
    setText(''); setQuantity('');
  }

  function toggle(id: string) {
    const now = new Date().toISOString();
    onChange(items.map(i => i.id === id ? { ...i, completed: !i.completed, updated_date: now } : i));
  }

  function remove(id: string) { onChange(items.filter(i => i.id !== id)); }
  function clearDone() { onChange(items.filter(i => !(i.list_type === activeType && i.completed))); }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Our Lists</h1>
          <span className="text-2xl">📋</span>
        </div>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Shared across the whole family</p>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 flex-wrap">
        {LIST_TYPES.map(type => {
          const m = LIST_META[type];
          const active = activeType === type;
          const count = items.filter(i => i.list_type === type && !i.completed).length;
          return (
            <button key={type} onClick={() => setActiveType(type)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all"
              style={active
                ? { background: m.bg, color: m.color, border: `2px solid ${m.color}60`, boxShadow: `0 4px 16px ${m.color}30` }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
              }
            >
              <span>{m.emoji}</span> {m.label}
              {count > 0 && (
                <span className="w-5 h-5 rounded-full text-xs font-black flex items-center justify-center text-white" style={{ background: m.color }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add item */}
      <div className="dk-card rounded-2xl p-4 space-y-3">
        <div className="flex gap-2">
          {activeType === 'grocery' && (
            <input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Qty" className="dk-input w-20 rounded-xl px-3 py-2.5 text-sm"/>
          )}
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder={`Add to ${meta.label}...`} className="dk-input flex-1 rounded-xl px-4 py-2.5 text-sm"/>
          <button onClick={add} disabled={!text.trim()}
            className="px-4 py-2 rounded-xl text-white font-black hover:scale-105 disabled:opacity-40 transition-all flex items-center gap-1.5"
            style={{ background: meta.color, boxShadow: `0 4px 12px ${meta.color}40` }}
          >
            <Plus size={16}/> Add
          </button>
        </div>
        <div className="flex gap-3 flex-wrap">
          {activeType !== 'braindump' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Priority:</span>
              {(['low','medium','high'] as Priority[]).map(p => (
                <button key={p} onClick={() => setPriority(p)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-black capitalize transition-all"
                  style={priority === p
                    ? { background: PRIORITY_DOT[p], color: 'white' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: PRIORITY_DOT[p] }}/> {p}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>For:</span>
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="dk-select text-xs rounded-lg px-2 py-1">
              <option value="">Everyone</option>
              {members.map(m => <option key={m.id} value={m.name}>{m.emoji} {m.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-sm">
        <span className="font-black" style={{ color: meta.color }}>{pending.length} remaining</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>{done.length} done</span>
        {done.length > 0 && <button onClick={clearDone} className="ml-auto text-xs font-black transition-colors hover:opacity-70" style={{ color: '#FF006E' }}>Clear completed</button>}
      </div>

      {/* Items */}
      <div className="space-y-2">
        {pending.length === 0 && done.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">{meta.emoji}</p>
            <p className="font-black text-white">Nothing here yet!</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Add something above to get started.</p>
          </div>
        )}
        {pending.map(item => {
          const assignedM = item.assigned_to ? members.find(m => m.name === item.assigned_to) : null;
          return (
            <div key={item.id} className="dk-card rounded-2xl flex items-center gap-3 px-4 py-3 group hover:bg-white/5 transition-all">
              <button onClick={() => toggle(item.id)}
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                style={{ borderColor: meta.color }}
              />
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORITY_DOT[item.priority], boxShadow: item.priority !== 'low' ? `0 0 6px ${PRIORITY_DOT[item.priority]}` : 'none' }}/>
              <span className="flex-1 text-sm font-medium text-white">{item.text}</span>
              {item.quantity && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>{item.quantity}</span>}
              {item.assigned_to && <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background: `${assignedM?.color || meta.color}22`, color: assignedM?.color || meta.color }}>{assignedM?.emoji || '👤'} {item.assigned_to}</span>}
              <button onClick={() => remove(item.id)} className="opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 hover:scale-110" style={{ color: '#FF006E' }}><Trash2 size={14}/></button>
            </div>
          );
        })}
        {done.length > 0 && (
          <>
            <p className="text-xs font-black tracking-widest uppercase pt-2 pb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Completed</p>
            {done.map(item => (
              <div key={item.id} className="rounded-2xl flex items-center gap-3 px-4 py-3 group opacity-40 hover:opacity-60 transition-all" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => toggle(item.id)} className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: meta.color }}>
                  <Check size={13} className="text-white" strokeWidth={3}/>
                </button>
                <span className="flex-1 text-sm line-through" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.text}</span>
                {item.quantity && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.quantity}</span>}
                <button onClick={() => remove(item.id)} className="opacity-0 group-hover:opacity-100 transition-all" style={{ color: '#FF006E' }}><Trash2 size={14}/></button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}