import { useState } from 'react';
import { C } from '../../hooks/use-harmony-data';
import { Mono, Pixel, Button, panelStyle, insetStyle } from '../RetroUI';
import * as Dialog from '@radix-ui/react-dialog';

export function BillsTab({ data, updateData }: { data: any, updateData: any }) {
  const [open, setOpen] = useState(false);
  const [newBill, setNewBill] = useState({ name: '', amount: '', dueDate: '', status: 'DUE', recurring: false });

  const overdueBills = data.bills.filter((b: any) => b.status === 'OVERDUE');
  const maxOverdue = overdueBills.sort((a: any, b: any) => b.amount - a.amount)[0];

  const addBill = () => {
    if (!newBill.name || !newBill.amount) return;
    updateData((prev: any) => ({
      ...prev,
      bills: [...prev.bills, { ...newBill, id: Math.random().toString(36).substring(7), amount: parseFloat(newBill.amount) }]
    }));
    setNewBill({ name: '', amount: '', dueDate: '', status: 'DUE', recurring: false });
    setOpen(false);
  };

  const toggleStatus = (id: string) => {
    updateData((prev: any) => ({
      ...prev,
      bills: prev.bills.map((b: any) => {
        if (b.id === id) {
          const nextStatus = b.status === 'PAID' ? 'DUE' : 'PAID';
          return { ...b, status: nextStatus };
        }
        return b;
      })
    }));
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pixel size={24}>ALL BILLS</Pixel>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button bg={C.blue} style={{ padding: '6px 16px' }} testId="btn-add-bill">
              <Pixel size={20} color={C.white}>+ ADD BILL</Pixel>
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} />
            <Dialog.Content style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '90%', maxWidth: 400, background: C.cream, border: `4px solid ${C.navy}`, boxShadow: `6px 6px 0 ${C.navy}`, zIndex: 51, borderRadius: 0
            }}>
              <div style={{ background: C.gold, borderBottom: `4px solid ${C.navy}`, padding: '8px 12px' }}>
                <Pixel size={20}>NEW BILL</Pixel>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input placeholder="BILL NAME..." value={newBill.name} onChange={e => setNewBill({...newBill, name: e.target.value})} style={{ ...insetStyle(C.white), padding: 8, fontFamily: "'VT323', monospace", fontSize: 20, outline: 'none' }} data-testid="input-bill-name" />
                <input placeholder="AMOUNT..." type="number" value={newBill.amount} onChange={e => setNewBill({...newBill, amount: e.target.value})} style={{ ...insetStyle(C.white), padding: 8, fontFamily: "'VT323', monospace", fontSize: 20, outline: 'none' }} data-testid="input-bill-amount" />
                <input type="date" value={newBill.dueDate} onChange={e => setNewBill({...newBill, dueDate: e.target.value})} style={{ ...insetStyle(C.white), padding: 8, fontFamily: "'Courier New', Courier, monospace", fontSize: 14, outline: 'none' }} data-testid="input-bill-date" />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <Dialog.Close asChild><Button bg={C.white} testId="btn-cancel-bill"><Pixel size={18}>CANCEL</Pixel></Button></Dialog.Close>
                  <Button bg={C.blue} onClick={addBill} testId="btn-save-bill"><Pixel size={18} color={C.white}>SAVE</Pixel></Button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div style={{ ...panelStyle(C.white), display: 'flex', flexDirection: 'column' }}>
        {data.bills.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center' }}><Mono style={{ color: '#888' }}>NO BILLS FOUND // ADD ONE TO CONTINUE</Mono></div>
        ) : (
          data.bills.map((bill: any) => (
            <div key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: `2px solid ${C.navy}` }}>
              <div>
                <Pixel size={20}>{bill.name}</Pixel>
                <Mono style={{ display: 'block', fontSize: 11, color: '#666' }}>DUE: {bill.dueDate || 'N/A'}</Mono>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Pixel size={24}>${bill.amount.toFixed(2)}</Pixel>
                <Button 
                  onClick={() => toggleStatus(bill.id)} 
                  bg={bill.status === 'PAID' ? C.green : bill.status === 'OVERDUE' ? C.red : C.orange}
                  style={{ padding: '4px 10px', width: 90 }}
                  testId={`btn-toggle-bill-${bill.id}`}
                >
                  <Pixel size={16} color={C.white}>{bill.status}</Pixel>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
