import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import type { ListItem, ListType, Priority, FamilyMember } from '../types';

const LIST_TYPES: ListType[] = ['grocery','todo','reminder','braindump'];
const LIST_META: Record<ListType, { label: string; emoji: string; color: string; bg: string }> = {
  grocery:   { label: 'Grocery',   emoji: '🛒', color: '#2E7D32', bg: '#E6F4EA' },
  todo:      { label: 'To-Do',     emoji: '✅', color: '#1565C0', bg: '#E8F0FE' },
  reminder:  { label: 'Reminders', emoji: '⏰', color: '#6B21A8', bg: '#F3E8FF' },
  braindump: { label: 'Brain Dump',emoji: '🧠', color: '#C62828', bg: '#FCE8E6' },
};
const PRIORITY_DOT: Record<Priority, string> = { low: '#D1D5DB', medium: '#FBBF24', high: '#EF4444' };

function newId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

interface Props { items: ListItem[]; onChange: (i: ListItem[]) => void; user: FamilyMember; members: FamilyMember[]; }

export default function ListsView({ items, onChange, user, members }: Props) {
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
        <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-gray-800">Our Lists</h1><span className="text-2xl">📋</span></div>
        <p className="text-gray-400 text-sm mt-0.5">Shared across the whole family</p>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 flex-wrap">
        {LIST_TYPES.map(type => {
          const m = LIST_META[type];
          const active = activeType === type;
          return (
            <button key={type} onClick={() => setActiveType(type)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all shadow-sm" style={active ? { background: m.bg, color: m.color, borderColor: m.color + '40' } : { background: 'white', color: '#6B7280', borderColor: '#E5E7EB' }}>
              <span>{m.emoji}</span> {m.label}
              {items.filter(i => i.list_type === type && !i.completed).length > 0 && (
                <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ background: m.color }}>{items.filter(i => i.list_type === type && !i.completed).length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add item */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex gap-2">
          {activeType === 'grocery' && (
            <input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Qty" className="w-20 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"/>
          )}
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder={`Add to ${meta.label}...`} className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"/>
          <button onClick={add} disabled={!text.trim()} className="px-4 py-2 rounded-xl text-white font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1.5" style={{ background: user.color }}>
            <Plus size={16}/> Add
          </button>
        </div>
        <div className="flex gap-3 flex-wrap">
          {activeType !== 'braindump' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Priority:</span>
              {(['low','medium','high'] as Priority[]).map(p => (
                <button key={p} onClick={() => setPriority(p)} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium capitalize ${priority === p ? 'border-transparent text-white' : 'border-gray-200 text-gray-500 bg-white'}`} style={priority === p ? { background: PRIORITY_DOT[p] } : {}}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: PRIORITY_DOT[p] }}/> {p}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">For:</span>
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none text-gray-600">
              <option value="">Everyone</option>
              {members.map(m => <option key={m.id} value={m.name}>{m.emoji} {m.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="font-medium" style={{ color: meta.color }}>{pending.length} remaining</span>
        <span className="text-gray-300">·</span>
        <span>{done.length} done</span>
        {done.length > 0 && <button onClick={clearDone} className="ml-auto text-xs text-red-400 hover:text-red-600 font-medium transition-colors">Clear completed</button>}
      </div>

      {/* Items */}
      <div className="space-y-2">
        {pending.length === 0 && done.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">{meta.emoji}</p>
            <p className="font-semibold text-gray-600">Nothing here yet!</p>
            <p className="text-sm text-gray-400 mt-1">Add something above to get started.</p>
          </div>
        )}
        {pending.map(item => {
          const assignedM = item.assigned_to ? members.find(m => m.name === item.assigned_to) : null;
          return (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 px-4 py-3 group">
              <button onClick={() => toggle(item.id)} className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-current flex items-center justify-center flex-shrink-0 transition-colors" style={{ '--hover-color': meta.color } as any}/>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORITY_DOT[item.priority] }}/>
              <span className="flex-1 text-sm text-gray-800">{item.text}</span>
              {item.quantity && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{item.quantity}</span>}
              {item.assigned_to && <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: assignedM?.bgColor || '#F3F4F6', color: assignedM?.color || '#6B7280' }}>{assignedM?.emoji || '👤'} {item.assigned_to}</span>}
              <button onClick={() => remove(item.id)} className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"><Trash2 size={14}/></button>
            </div>
          );
        })}
        {done.length > 0 && (
          <>
            <p className="text-xs text-gray-400 pt-2 pb-1 font-semibold uppercase tracking-wide">Completed</p>
            {done.map(item => (
              <div key={item.id} className="bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3 px-4 py-3 group opacity-60">
                <button onClick={() => toggle(item.id)} className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: meta.color }}>
                  <Check size={13} className="text-white" strokeWidth={3}/>
                </button>
                <span className="flex-1 text-sm text-gray-500 line-through">{item.text}</span>
                {item.quantity && <span className="text-xs text-gray-400">{item.quantity}</span>}
                <button onClick={() => remove(item.id)} className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
