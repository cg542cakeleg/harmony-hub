import { useState } from 'react';
import { C, type Bill, type BillCategory, type BillFrequency, advanceRecurringBill } from '../../hooks/use-harmony-data';
import { Mono, Pixel, Button, panelStyle, insetStyle } from '../RetroUI';
import * as Dialog from '@radix-ui/react-dialog';

const CATEGORIES: BillCategory[] = ['Housing', 'Utilities', 'Subscriptions', 'Insurance', 'Debt', 'Other'];
const FREQUENCIES: BillFrequency[] = ['One-time', 'Monthly', 'Quarterly', 'Annual'];

const CATEGORY_COLORS: Record<BillCategory, string> = {
  Housing:       C.blue,
  Utilities:     C.orange,
  Subscriptions: C.pink,
  Insurance:     C.green,
  Debt:          C.red,
  Other:         '#888888',
};

const inputStyle = {
  ...insetStyle(C.white),
  padding: '6px 8px',
  fontFamily: "'VT323', monospace",
  fontSize: 20,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box' as const,
};

const labelStyle = {
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: 11,
  color: C.navy,
  letterSpacing: '0.05em',
  display: 'block',
  marginBottom: 3,
};

type BillFormState = {
  name: string;
  amount: string;
  dueDate: string;
  status: Bill['status'];
  category: BillCategory;
  account: string;
  frequency: BillFrequency;
  autopay: boolean;
  notes: string;
};

const EMPTY_BILL: BillFormState = {
  name: '',
  amount: '',
  dueDate: '',
  status: 'DUE',
  category: 'Other',
  account: '',
  frequency: 'Monthly',
  autopay: false,
  notes: '',
};

function exportCSV(bills: Bill[]) {
  const headers = ['Name', 'Amount', 'Due Date', 'Status', 'Category', 'Account', 'Frequency', 'Autopay', 'Notes'];
  const rows = bills.map(b => [
    `"${b.name.replace(/"/g, '""')}"`,
    b.amount.toFixed(2),
    b.dueDate,
    b.status,
    b.category,
    `"${(b.account ?? '').replace(/"/g, '""')}"`,
    b.frequency,
    b.autopay ? 'Yes' : 'No',
    `"${(b.notes ?? '').replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'harmony-hub-bills.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function BillsTab({ data, updateData }: { data: any; updateData: any }) {
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_BILL });

  const bills: Bill[] = data.bills ?? [];

  const openAdd = () => {
    setForm({ ...EMPTY_BILL });
    setEditingId(null);
    setDialogMode('add');
  };

  const openEdit = (bill: Bill) => {
    setForm({
      name: bill.name,
      amount: String(bill.amount),
      dueDate: bill.dueDate,
      status: bill.status,
      category: bill.category,
      account: bill.account ?? '',
      frequency: bill.frequency,
      autopay: bill.autopay ?? false,
      notes: bill.notes ?? '',
    });
    setEditingId(bill.id);
    setDialogMode('edit');
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingId(null);
  };

  const saveBill = () => {
    if (!form.name || !form.amount) return;
    const amt = parseFloat(form.amount);
    if (isNaN(amt)) return;

    updateData((prev: any) => {
      if (dialogMode === 'edit' && editingId) {
        return {
          ...prev,
          bills: prev.bills.map((b: Bill) =>
            b.id === editingId
              ? { ...b, name: form.name, amount: amt, dueDate: form.dueDate, status: form.status, category: form.category, account: form.account, frequency: form.frequency, autopay: form.autopay, notes: form.notes, recurring: form.frequency !== 'One-time' }
              : b
          ),
        };
      }
      const newBill: Bill = {
        id: Math.random().toString(36).substring(7),
        name: form.name,
        amount: amt,
        dueDate: form.dueDate,
        status: form.status,
        category: form.category,
        account: form.account,
        frequency: form.frequency,
        autopay: form.autopay,
        notes: form.notes,
        recurring: form.frequency !== 'One-time',
      };
      return { ...prev, bills: [...prev.bills, newBill] };
    });
    closeDialog();
  };

  const deleteBill = (id: string) => {
    updateData((prev: any) => ({ ...prev, bills: prev.bills.filter((b: Bill) => b.id !== id) }));
    closeDialog();
  };

  const toggleStatus = (id: string) => {
    updateData((prev: any) => {
      const updated = prev.bills.flatMap((b: Bill) => {
        if (b.id !== id) return [b];
        const nextStatus = b.status === 'PAID' ? 'DUE' : 'PAID';
        const updatedBill = { ...b, status: nextStatus as Bill['status'] };
        if (nextStatus === 'PAID' && b.frequency !== 'One-time') {
          return [updatedBill, advanceRecurringBill(updatedBill)];
        }
        return [updatedBill];
      });
      return { ...prev, bills: updated };
    });
  };

  // Monthly overview
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthBills = bills.filter(b => {
    if (!b.dueDate) return false;
    const d = new Date(b.dueDate + 'T00:00:00');
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const totalDue = monthBills.filter(b => b.status !== 'PAID').reduce((s, b) => s + b.amount, 0);
  const totalPaid = monthBills.filter(b => b.status === 'PAID').reduce((s, b) => s + b.amount, 0);
  const totalOverdue = monthBills.filter(b => b.status === 'OVERDUE').reduce((s, b) => s + b.amount, 0);

  // Category grouping
  const grouped: Record<BillCategory, Bill[]> = {} as any;
  for (const cat of CATEGORIES) grouped[cat] = [];
  for (const b of bills) {
    const cat: BillCategory = b.category ?? 'Other';
    if (grouped[cat]) grouped[cat].push(b);
    else grouped['Other'].push(b);
  }

  const overdueBills = bills.filter(b => b.status === 'OVERDUE');
  const maxOverdue = overdueBills.sort((a, b) => b.amount - a.amount)[0];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* OVERDUE ALERT */}
      {maxOverdue && (
        <div style={{ ...panelStyle(C.navy), color: C.white, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: C.red, border: `3px solid ${C.gold}`, padding: '4px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '-16px -16px 0', boxSizing: 'content-box' }}>
            <Pixel size={20} color={C.white}>⚠ ALERT — OVERDUE</Pixel>
            <Mono style={{ fontSize: 11, color: C.gold, border: `2px solid ${C.gold}`, padding: '1px 6px' }}>URGENT</Mono>
          </div>
          <div style={{ paddingTop: 8 }}>
            <Mono style={{ fontSize: 11, color: C.gold, display: 'block', marginBottom: 4 }}>{maxOverdue.name.toUpperCase()} / URGENT</Mono>
            <Pixel size={72} color={C.gold} style={{ display: 'block', lineHeight: 1 }}>${maxOverdue.amount.toFixed(2)}</Pixel>
          </div>
          <Button onClick={() => toggleStatus(maxOverdue.id)} bg={C.gold} style={{ padding: '10px 0', width: '100%' }} testId={`btn-pay-urgent-${maxOverdue.id}`}>
            <Pixel size={24} color={C.navy}>[ MARK PAID ]</Pixel>
          </Button>
        </div>
      )}

      {/* MONTHLY OVERVIEW */}
      <div style={{ ...panelStyle(C.navy), padding: 14 }}>
        <Pixel size={16} color={C.gold} style={{ display: 'block', marginBottom: 10 }}>
          THIS MONTH — {now.toLocaleString('default', { month: 'long' }).toUpperCase()} {thisYear}
        </Pixel>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'TOTAL DUE', val: totalDue, color: C.orange },
            { label: 'TOTAL PAID', val: totalPaid, color: C.green },
            { label: 'OVERDUE', val: totalOverdue, color: C.red },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ flex: 1, minWidth: 90, background: 'rgba(255,255,255,0.07)', border: `2px solid ${color}`, padding: '8px 10px' }}>
              <Mono style={{ fontSize: 10, color, display: 'block', marginBottom: 2 }}>{label}</Mono>
              <Pixel size={26} color={C.white}>${val.toFixed(2)}</Pixel>
            </div>
          ))}
        </div>
      </div>

      {/* HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Pixel size={24}>ALL BILLS</Pixel>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button bg={C.navy} style={{ padding: '5px 12px' }} onClick={() => exportCSV(bills)} testId="btn-export-bills">
            <Pixel size={16} color={C.gold}>EXPORT CSV</Pixel>
          </Button>
          <Button bg={C.blue} style={{ padding: '5px 12px' }} onClick={openAdd} testId="btn-add-bill">
            <Pixel size={18} color={C.white}>+ ADD BILL</Pixel>
          </Button>
        </div>
      </div>

      {/* BILLS LIST — GROUPED BY CATEGORY */}
      {bills.length === 0 ? (
        <div style={{ ...panelStyle(C.white), padding: 24, textAlign: 'center' }}>
          <Mono style={{ color: '#888' }}>NO BILLS FOUND // ADD ONE TO CONTINUE</Mono>
        </div>
      ) : (
        CATEGORIES.filter(cat => grouped[cat].length > 0).map(cat => {
          const catBills = grouped[cat];
          const subtotal = catBills.reduce((s, b) => s + b.amount, 0);
          const catColor = CATEGORY_COLORS[cat];
          return (
            <div key={cat} style={{ ...panelStyle(C.white), overflow: 'hidden' }}>
              {/* Category header */}
              <div style={{ background: catColor, borderBottom: `3px solid ${C.navy}`, padding: '5px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Pixel size={18} color={C.white}>{cat.toUpperCase()}</Pixel>
                <Mono style={{ fontSize: 12, color: C.white }}>SUBTOTAL: ${subtotal.toFixed(2)}</Mono>
              </div>
              {catBills.map((bill, idx) => (
                <div
                  key={bill.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderBottom: idx < catBills.length - 1 ? `2px solid ${C.navy}` : 'none',
                    background: bill.status === 'OVERDUE' ? 'rgba(255,34,0,0.06)' : 'transparent',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Pixel size={20}>{bill.name}</Pixel>
                      {bill.autopay && (
                        <Mono style={{ fontSize: 10, background: C.green, color: C.white, padding: '1px 5px' }}>AUTO</Mono>
                      )}
                      {bill.frequency !== 'One-time' && (
                        <Mono style={{ fontSize: 10, background: C.navy, color: C.gold, padding: '1px 5px' }}>{bill.frequency.toUpperCase()}</Mono>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 2 }}>
                      <Mono style={{ fontSize: 11, color: '#666' }}>DUE: {bill.dueDate || 'N/A'}</Mono>
                      {bill.account && <Mono style={{ fontSize: 11, color: '#666' }}>ACCT: {bill.account}</Mono>}
                    </div>
                    {bill.notes && (
                      <Mono style={{ fontSize: 11, color: '#888', display: 'block', marginTop: 2, fontStyle: 'italic' }}>
                        {bill.notes}
                      </Mono>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <Pixel size={22}>${bill.amount.toFixed(2)}</Pixel>
                    <Button
                      onClick={() => toggleStatus(bill.id)}
                      bg={bill.status === 'PAID' ? C.green : bill.status === 'OVERDUE' ? C.red : C.orange}
                      style={{ padding: '3px 8px', minWidth: 80 }}
                      testId={`btn-toggle-bill-${bill.id}`}
                    >
                      <Pixel size={14} color={C.white}>{bill.status}</Pixel>
                    </Button>
                    <Button
                      onClick={() => openEdit(bill)}
                      bg={C.cream}
                      style={{ padding: '3px 8px' }}
                      testId={`btn-edit-bill-${bill.id}`}
                    >
                      <Pixel size={14} color={C.navy}>EDIT</Pixel>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          );
        })
      )}

      {/* ADD / EDIT DIALOG */}
      <Dialog.Root open={dialogMode !== null} onOpenChange={open => { if (!open) closeDialog(); }}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 50 }} />
          <Dialog.Content style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '94%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto',
            background: C.cream, border: `4px solid ${C.navy}`, boxShadow: `6px 6px 0 ${C.navy}`,
            zIndex: 51, borderRadius: 0,
          }}>
            <div style={{ background: C.gold, borderBottom: `4px solid ${C.navy}`, padding: '8px 12px', position: 'sticky', top: 0, zIndex: 1 }}>
              <Pixel size={20}>{dialogMode === 'edit' ? 'EDIT BILL' : 'NEW BILL'}</Pixel>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Name */}
              <div>
                <label style={labelStyle}>PAYEE NAME</label>
                <input
                  placeholder="BILL NAME..."
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                  data-testid="input-bill-name"
                />
              </div>

              {/* Amount + Due Date side by side */}
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>AMOUNT ($)</label>
                  <input
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    style={inputStyle}
                    data-testid="input-bill-amount"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>DUE DATE</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    style={{ ...inputStyle, fontSize: 14, fontFamily: "'Courier New', Courier, monospace" }}
                    data-testid="input-bill-date"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={labelStyle}>CATEGORY</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as BillCategory })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  data-testid="select-bill-category"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>

              {/* Frequency + Account side by side */}
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>FREQUENCY</label>
                  <select
                    value={form.frequency}
                    onChange={e => setForm({ ...form, frequency: e.target.value as BillFrequency })}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    data-testid="select-bill-frequency"
                  >
                    {FREQUENCIES.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>ACCOUNT / CARD</label>
                  <input
                    placeholder="VISA, CHASE..."
                    value={form.account}
                    onChange={e => setForm({ ...form, account: e.target.value })}
                    style={inputStyle}
                    data-testid="input-bill-account"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={labelStyle}>STATUS</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['DUE', 'PAID', 'OVERDUE'] as const).map(s => (
                    <button
                      key={s}
                      data-testid={`btn-status-${s.toLowerCase()}`}
                      onClick={() => setForm({ ...form, status: s })}
                      style={{
                        flex: 1,
                        ...insetStyle(form.status === s ? C.navy : C.white),
                        padding: '5px 4px',
                        cursor: 'pointer',
                        border: `3px solid ${C.navy}`,
                      }}
                    >
                      <Pixel size={16} color={form.status === s ? C.gold : C.navy}>{s}</Pixel>
                    </button>
                  ))}
                </div>
              </div>

              {/* Autopay toggle */}
              <div
                data-testid="toggle-bill-autopay"
                onClick={() => setForm({ ...form, autopay: !form.autopay })}
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 0' }}
              >
                <div style={{ ...insetStyle(form.autopay ? C.green : C.white), width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {form.autopay && <Pixel size={16} color={C.white}>✓</Pixel>}
                </div>
                <Pixel size={18} color={C.navy}>AUTOPAY ENABLED</Pixel>
              </div>

              {/* Notes */}
              <div>
                <label style={labelStyle}>NOTES</label>
                <textarea
                  placeholder="OPTIONAL NOTES..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: "'Courier New', Courier, monospace", fontSize: 13 }}
                  data-testid="input-bill-notes"
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <div>
                  {dialogMode === 'edit' && editingId && (
                    <Button
                      bg={C.red}
                      onClick={() => deleteBill(editingId)}
                      testId="btn-delete-bill"
                      style={{ padding: '6px 14px' }}
                    >
                      <Pixel size={16} color={C.white}>DELETE</Pixel>
                    </Button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button bg={C.cream} onClick={closeDialog} testId="btn-cancel-bill" style={{ padding: '6px 14px' }}>
                    <Pixel size={16}>CANCEL</Pixel>
                  </Button>
                  <Button bg={C.blue} onClick={saveBill} testId="btn-save-bill" style={{ padding: '6px 14px' }}>
                    <Pixel size={16} color={C.white}>SAVE</Pixel>
                  </Button>
                </div>
              </div>

            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
