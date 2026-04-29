import { useState } from 'react';
import { format, parseISO, isBefore, addDays } from 'date-fns';
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';
import type { Bill, BillStatus, BillCategory, FamilyMember } from '../types';

const STATUS_STYLES: Record<BillStatus, { bg: string; color: string; label: string }> = {
  paid:     { bg: '#E6F4EA', color: '#2E7D32', label: 'Paid ✓' },
  not_paid: { bg: '#FCE8E6', color: '#C62828', label: 'Not Paid' },
  partial:  { bg: '#E8F0FE', color: '#1565C0', label: 'Partial' },
  waiting:  { bg: '#FEF3E2', color: '#E65100', label: 'Waiting' },
  late:     { bg: '#FCE8E6', color: '#B71C1C', label: 'Late!' },
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

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">Bills</h1>
            <span className="text-2xl">💳</span>
          </div>
          <p className="text-gray-400 text-sm mt-0.5">What's Good Fam?! 💕 Here's what's due.</p>
        </div>
        <button onClick={() => { setAdding(true); setEditing(null); setDraft({ ...emptyDraft(), is_subscription: view === 'subscriptions' }); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90" style={{ background: user.color }}>
          <Plus size={16}/> Add Bill
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Unpaid Bills</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#C62828' }}>${totalUnpaid.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Bills Paid</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{paidCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Subscriptions/mo</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#8B6FD4' }}>${subTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* View toggle + filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <button onClick={() => setView('bills')} className="px-4 py-2 text-sm font-medium transition-colors" style={view === 'bills' ? { background: user.bgColor, color: user.color } : { color: '#6B7280' }}>Bills</button>
          <button onClick={() => setView('subscriptions')} className="px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200" style={view === 'subscriptions' ? { background: user.bgColor, color: user.color } : { color: '#6B7280' }}>Subscriptions</button>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none shadow-sm text-gray-600">
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_STYLES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Add/Edit form */}
      {(adding || editing) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-gray-800">{editing ? 'Edit Bill' : 'New Bill'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400 font-medium">Emoji</label><input value={draft.emoji} onChange={e => setDraft(d => ({...d, emoji: e.target.value}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" placeholder="🏠"/></div>
            <div><label className="text-xs text-gray-400 font-medium">Name *</label><input value={draft.name} onChange={e => setDraft(d => ({...d, name: e.target.value}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" placeholder="Bill name"/></div>
            <div><label className="text-xs text-gray-400 font-medium">Amount</label><input type="number" step="0.01" value={draft.amount_due} onChange={e => setDraft(d => ({...d, amount_due: parseFloat(e.target.value)||0}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"/></div>
            <div><label className="text-xs text-gray-400 font-medium">Due Date</label><input type="date" value={draft.due_date} onChange={e => setDraft(d => ({...d, due_date: e.target.value}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"/></div>
            <div><label className="text-xs text-gray-400 font-medium">Status</label><select value={draft.status} onChange={e => setDraft(d => ({...d, status: e.target.value as BillStatus}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200">{Object.entries(STATUS_STYLES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
            <div><label className="text-xs text-gray-400 font-medium">Category</label><select value={draft.category} onChange={e => setDraft(d => ({...d, category: e.target.value as BillCategory}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="col-span-2"><label className="text-xs text-gray-400 font-medium">Notes</label><input value={draft.notes} onChange={e => setDraft(d => ({...d, notes: e.target.value}))} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" placeholder="Optional notes"/></div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked={draft.recurring} onChange={e => setDraft(d => ({...d, recurring: e.target.checked}))} className="rounded"/> Recurring</label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked={draft.is_subscription} onChange={e => setDraft(d => ({...d, is_subscription: e.target.checked}))} className="rounded"/> Subscription</label>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setAdding(false); setEditing(null); }} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
            <button onClick={save} disabled={!draft.name} className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40" style={{ background: user.color }}>Save</button>
          </div>
        </div>
      )}

      {/* Bills table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_1fr_auto] gap-0 text-xs text-gray-400 font-medium uppercase tracking-wide border-b border-gray-100 px-5 py-3">
          <span className="w-8"/>
          <span>Bill</span>
          <span className="px-4">Due Date</span>
          <span className="px-4">Amount</span>
          <span className="px-4">Status</span>
          <span className="w-8"/>
        </div>
        {displayed.length === 0 && <p className="text-center text-gray-400 py-10">No bills found.</p>}
        {displayed.map(bill => (
          <div key={bill.id} className={`border-b border-gray-50 last:border-0 transition-colors ${isLate(bill) ? 'bg-red-50/50' : isDueSoon(bill) ? 'bg-amber-50/30' : ''}`}>
            <div className="grid grid-cols-[auto_1fr_auto_auto_1fr_auto] gap-0 items-center px-5 py-3 cursor-pointer hover:bg-gray-50/50 transition-colors" onClick={() => setExpandedId(expandedId === bill.id ? null : bill.id)}>
              <span className="text-xl w-8 text-center">{bill.emoji || '💰'}</span>
              <div className="pl-2">
                <span className="text-sm font-medium text-gray-800">{bill.name}</span>
                {isLate(bill) && <span className="ml-2 text-xs text-red-500 font-medium">Overdue!</span>}
                {isDueSoon(bill) && <span className="ml-2 text-xs text-amber-500 font-medium">Due soon!</span>}
              </div>
              <span className="text-sm text-gray-500 px-4 whitespace-nowrap">{format(parseISO(bill.due_date),'MMM d, yyyy')}</span>
              <span className="text-sm font-semibold text-gray-800 px-4 whitespace-nowrap">{bill.amount_due > 0 ? `$${bill.amount_due.toFixed(2)}` : '—'}</span>
              <div className="px-4">
                <select value={bill.status} onChange={e => { e.stopPropagation(); quickStatus(bill.id, e.target.value as BillStatus); }} onClick={e => e.stopPropagation()} className="text-xs px-2 py-1 rounded-full font-semibold border-0 outline-none cursor-pointer" style={{ background: STATUS_STYLES[bill.status].bg, color: STATUS_STYLES[bill.status].color }}>
                  {Object.entries(STATUS_STYLES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1 w-8 justify-end">
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedId === bill.id ? 'rotate-180' : ''}`}/>
              </div>
            </div>
            {expandedId === bill.id && (
              <div className="px-5 pb-3 pt-0 flex items-start gap-4 border-t border-gray-50 bg-gray-50/50">
                <div className="flex-1">
                  {bill.notes && <p className="text-sm text-gray-600 mt-2 italic">📝 {bill.notes}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{bill.category}</span>
                    {bill.recurring && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Recurring</span>}
                    {bill.is_subscription && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Subscription</span>}
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2 flex-shrink-0">
                  <button onClick={() => startEdit(bill)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"><Pencil size={13}/> Edit</button>
                  <button onClick={() => remove(bill.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"><Trash2 size={13}/> Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

