import { useState } from 'react';
import { format, parseISO, isBefore, addDays } from 'date-fns';
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';
import type { Bill, BillStatus, BillCategory, FamilyMember } from '../types';

const STATUS_STYLES: Record<BillStatus, { bg: string; color: string; label: string }> = {
  paid:     { bg: 'rgba(0,255,159,0.2)',  color: '#00FF9F', label: 'Paid ✓' },
  not_paid: { bg: 'rgba(255,0,110,0.2)',  color: '#FF006E', label: 'Not Paid' },
  partial:  { bg: 'rgba(0,212,255,0.2)',  color: '#00D4FF', label: 'Partial' },
  waiting:  { bg: 'rgba(255,184,0,0.2)',  color: '#FFB800', label: 'Waiting' },
  late:     { bg: 'rgba(255,0,110,0.25)', color: '#FF4466', label: 'Late!' },
};

const CATEGORIES: BillCategory[] = ['rent','utilities','insurance','phone','subscriptions','food','medical','loan','kids','other'];

function newId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function emptyDraft() { return { name:'', amount_due:0, due_date: format(new Date(),'yyyy-MM-dd'), status:'not_paid' as BillStatus, category:'other' as BillCategory, notes:'', recurring:true, recurrence_day: null as number | null, is_subscription:false, emoji:'' }; }

interface Props { bills: Bill[]; onChange: (b: Bill[]) => void; user: FamilyMember; }

export default function BillsView({ bills, onChange, user }: Props) {
  const [view, setView] = useState<'bills'|'subscriptions'>('bills');
  const [filterStatus, setFilterStatus] = useState<BillStatus|'all'>('all');
  const [editing, setEditing] = useState<Bill|null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const today = new Date();
  const soon = addDays(today, 7);

  const displayed = bills
    .filter(b => view === 'subscriptions' ? b.is_subscription : !b.is_subscription)
    .filter(b => filterStatus === 'all' || b.status === filterStatus)
    .sort((a,b) => a.due_date.localeCompare(b.due_date));

  const totalUnpaid = displayed.filter(b => b.status !== 'paid').reduce((s,b) => s+b.amount_due, 0);
  const paidCount = displayed.filter(b => b.status === 'paid').length;
  const subTotal = bills.filter(b => b.is_subscription).reduce((s,b) => s+b.amount_due, 0);

  function save() {
    const now = new Date().toISOString();
    if (editing) {
      onChange(bills.map(b => b.id === editing.id ? { ...draft, id: editing.id, created_date: editing.created_date, updated_date: now } as Bill : b));
      setEditing(null);
    } else {
      onChange([...bills, { ...draft, id: newId(), created_date: now, updated_date: now } as Bill]);
      setAdding(false);
    }
    setDraft(emptyDraft());
  }

  function remove(id: string) { if (confirm('Delete this bill?')) onChange(bills.filter(b => b.id !== id)); }

  function startEdit(b: Bill) {
    setEditing(b);
    setDraft({ name:b.name, amount_due:b.amount_due, due_date:b.due_date, status:b.status, category:b.category, notes:b.notes, recurring:b.recurring, recurrence_day:b.recurrence_day, is_subscription:b.is_subscription, emoji:b.emoji });
    setAdding(false);
    setExpandedId(null);
  }

  function quickStatus(id: string, status: BillStatus) {
    const now = new Date().toISOString();
    onChange(bills.map(b => b.id === id ? { ...b, status, updated_date: now } : b));
  }

  const isLate = (b: Bill) => b.status !== 'paid' && isBefore(parseISO(b.due_date), today);
  const isDueSoon = (b: Bill) => b.status !== 'paid' && !isLate(b) && isBefore(parseISO(b.due_date), soon);

  const inputCls = 'dk-input w-full mt-1 rounded-xl px-3 py-2 text-sm';
  const labelCls = 'text-xs font-bold tracking-wide uppercase';

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Bills</h1>
            <span className="text-2xl">💳</span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>What's Good Fam?! 💕 Here's what's due.</p>
        </div>
        <button
          onClick={() => { setAdding(true); setEditing(null); setDraft({ ...emptyDraft(), is_subscription: view === 'subscriptions' }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-white shadow-sm transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${user.color} 0%, ${user.color}99 100%)`, boxShadow: `0 4px 16px ${user.color}50` }}
        >
          <Plus size={16}/> Add Bill
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="dk-card rounded-2xl p-4">
          <p className="text-xs font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>Unpaid Bills</p>
          <p className="text-2xl font-black mt-1" style={{ color: '#FF006E' }}>${totalUnpaid.toFixed(2)}</p>
        </div>
        <div className="dk-card rounded-2xl p-4">
          <p className="text-xs font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>Bills Paid</p>
          <p className="text-2xl font-black mt-1" style={{ color: '#00FF9F' }}>{paidCount}</p>
        </div>
        <div className="dk-card rounded-2xl p-4">
          <p className="text-xs font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>Subscriptions/mo</p>
          <p className="text-2xl font-black mt-1" style={{ color: '#B66DFF' }}>${subTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* View toggle + filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex rounded-xl overflow-hidden dk-card">
          <button onClick={() => setView('bills')} className="px-4 py-2 text-sm font-black transition-all" style={view === 'bills' ? { background: user.color, color: 'white' } : { color: 'rgba(255,255,255,0.5)' }}>Bills</button>
          <button onClick={() => setView('subscriptions')} className="px-4 py-2 text-sm font-black transition-all border-l" style={{ borderColor: 'rgba(255,255,255,0.1)', ...(view === 'subscriptions' ? { background: user.color, color: 'white' } : { color: 'rgba(255,255,255,0.5)' }) }}>Subscriptions</button>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as BillStatus|'all')} className="dk-select text-sm rounded-xl px-3 py-2 focus:outline-none">
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_STYLES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Add/Edit form */}
      {(adding || editing) && (
        <div className="dk-card rounded-2xl p-5 space-y-4">
          <h3 className="font-black text-white tracking-tight">{editing ? 'Edit Bill' : 'New Bill'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls} style={{ color: 'rgba(255,255,255,0.45)' }}>Emoji</label><input value={draft.emoji} onChange={e => setDraft(d => ({...d, emoji: e.target.value}))} className={inputCls} placeholder="🏠"/></div>
            <div><label className={labelCls} style={{ color: 'rgba(255,255,255,0.45)' }}>Name *</label><input value={draft.name} onChange={e => setDraft(d => ({...d, name: e.target.value}))} className={inputCls} placeholder="Bill name"/></div>
            <div><label className={labelCls} style={{ color: 'rgba(255,255,255,0.45)' }}>Amount</label><input type="number" step="0.01" value={draft.amount_due} onChange={e => setDraft(d => ({...d, amount_due: parseFloat(e.target.value)||0}))} className={inputCls}/></div>
            <div><label className={labelCls} style={{ color: 'rgba(255,255,255,0.45)' }}>Due Date</label><input type="date" value={draft.due_date} onChange={e => setDraft(d => ({...d, due_date: e.target.value}))} className={inputCls}/></div>
            <div><label className={labelCls} style={{ color: 'rgba(255,255,255,0.45)' }}>Status</label><select value={draft.status} onChange={e => setDraft(d => ({...d, status: e.target.value as BillStatus}))} className="dk-select w-full mt-1 rounded-xl px-3 py-2 text-sm">{Object.entries(STATUS_STYLES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
            <div><label className={labelCls} style={{ color: 'rgba(255,255,255,0.45)' }}>Category</label><select value={draft.category} onChange={e => setDraft(d => ({...d, category: e.target.value as BillCategory}))} className="dk-select w-full mt-1 rounded-xl px-3 py-2 text-sm">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="col-span-2"><label className={labelCls} style={{ color: 'rgba(255,255,255,0.45)' }}>Notes</label><input value={draft.notes} onChange={e => setDraft(d => ({...d, notes: e.target.value}))} className={inputCls} placeholder="Optional notes"/></div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'rgba(255,255,255,0.7)' }}><input type="checkbox" checked={draft.recurring} onChange={e => setDraft(d => ({...d, recurring: e.target.checked}))} className="rounded accent-pink-500"/> Recurring</label>
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'rgba(255,255,255,0.7)' }}><input type="checkbox" checked={draft.is_subscription} onChange={e => setDraft(d => ({...d, is_subscription: e.target.checked}))} className="rounded accent-pink-500"/> Subscription</label>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setAdding(false); setEditing(null); }} className="px-4 py-2 rounded-xl text-sm font-black transition-all hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.6)' }}>Cancel</button>
            <button onClick={save} disabled={!draft.name} className="px-5 py-2 rounded-xl text-sm font-black text-white transition-all hover:scale-105 disabled:opacity-40" style={{ background: user.color, boxShadow: `0 4px 12px ${user.color}50` }}>Save</button>
          </div>
        </div>
      )}

      {/* Bills table */}
      <div className="dk-card rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_1fr_auto] gap-0 text-xs font-black uppercase tracking-widest dk-row px-5 py-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span className="w-8"/>
          <span>Bill</span>
          <span className="px-4">Due Date</span>
          <span className="px-4">Amount</span>
          <span className="px-4">Status</span>
          <span className="w-8"/>
        </div>
        {displayed.length === 0 && <p className="text-center py-10" style={{ color: 'rgba(255,255,255,0.35)' }}>No bills found.</p>}
        {displayed.map(bill => (
          <div key={bill.id} className="dk-row last:border-0 transition-colors" style={isLate(bill) ? { background: 'rgba(255,0,110,0.06)' } : isDueSoon(bill) ? { background: 'rgba(255,184,0,0.05)' } : {}}>
            <div className="grid grid-cols-[auto_1fr_auto_auto_1fr_auto] gap-0 items-center px-5 py-3 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setExpandedId(expandedId === bill.id ? null : bill.id)}>
              <span className="text-xl w-8 text-center">{bill.emoji || '💰'}</span>
              <div className="pl-2">
                <span className="text-sm font-bold text-white">{bill.name}</span>
                {isLate(bill) && <span className="ml-2 text-xs font-black" style={{ color: '#FF006E' }}>Overdue!</span>}
                {isDueSoon(bill) && <span className="ml-2 text-xs font-black" style={{ color: '#FFB800' }}>Due soon!</span>}
              </div>
              <span className="text-sm px-4 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.55)' }}>{format(parseISO(bill.due_date),'MMM d, yyyy')}</span>
              <span className="text-sm font-black text-white px-4 whitespace-nowrap">{bill.amount_due > 0 ? `$${bill.amount_due.toFixed(2)}` : '—'}</span>
              <div className="px-4">
                <select value={bill.status} onChange={e => { e.stopPropagation(); quickStatus(bill.id, e.target.value as BillStatus); }} onClick={e => e.stopPropagation()} className="text-xs px-2 py-1 rounded-full font-black border-0 outline-none cursor-pointer" style={{ background: STATUS_STYLES[bill.status].bg, color: STATUS_STYLES[bill.status].color }}>
                  {Object.entries(STATUS_STYLES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1 w-8 justify-end">
                <ChevronDown size={14} className={`transition-transform ${expandedId === bill.id ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.4)' }}/>
              </div>
            </div>
            {expandedId === bill.id && (
              <div className="px-5 pb-3 pt-0 flex items-start gap-4 border-t flex-wrap" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex-1">
                  {bill.notes && <p className="text-sm mt-2 italic" style={{ color: 'rgba(255,255,255,0.6)' }}>📝 {bill.notes}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>{bill.category}</span>
                    {bill.recurring && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,212,255,0.2)', color: '#00D4FF' }}>Recurring</span>}
                    {bill.is_subscription && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(182,109,255,0.2)', color: '#B66DFF' }}>Subscription</span>}
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2 flex-shrink-0">
                  <button onClick={() => startEdit(bill)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors" style={{ background: 'rgba(182,109,255,0.15)', color: '#B66DFF', border: '1px solid rgba(182,109,255,0.3)' }}><Pencil size={13}/> Edit</button>
                  <button onClick={() => remove(bill.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors" style={{ background: 'rgba(255,0,110,0.15)', color: '#FF006E', border: '1px solid rgba(255,0,110,0.3)' }}><Trash2 size={13}/> Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}