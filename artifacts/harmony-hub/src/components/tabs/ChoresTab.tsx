import { useState } from 'react';
import { C } from '../../hooks/use-harmony-data';
import { Mono, Pixel, Button, panelStyle, RetroCheck, insetStyle } from '../RetroUI';
import * as Dialog from '@radix-ui/react-dialog';

export function ChoresTab({ data, updateData }: { data: any, updateData: any }) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'DONE'>('ALL');
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMember, setNewMember] = useState(data.members[0]?.id || '');
  
  const filteredChores = data.chores.filter((c: any) => {
    if (filter === 'PENDING') return !c.done;
    if (filter === 'DONE') return c.done;
    return true;
  });

  const toggleChore = (id: string) => {
    updateData((prev: any) => ({
      ...prev,
      chores: prev.chores.map((c: any) => c.id === id ? { ...c, done: !c.done } : c)
    }));
  };

  const addChore = () => {
    if (!newTitle) return;
    updateData((prev: any) => ({
      ...prev,
      chores: [...prev.chores, {
        id: Math.random().toString(36).substring(7),
        title: newTitle,
        memberId: newMember,
        dueDate: new Date().toISOString().split('T')[0],
        done: false
      }]
    }));
    setNewTitle('');
    setOpen(false);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {['ALL', 'PENDING', 'DONE'].map(f => (
            <Button
              key={f}
              onClick={() => setFilter(f as any)}
              bg={filter === f ? C.cream : C.white}
              style={{ padding: '6px 12px' }}
              testId={`filter-${f}`}
            >
              <Pixel size={18}>{f}</Pixel>
            </Button>
          ))}
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button bg={C.green} style={{ padding: '6px 16px' }} testId="btn-add-chore">
              <Pixel size={20} color={C.white}>+ ADD CHORE</Pixel>
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} />
            <Dialog.Content style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '90%', maxWidth: 400, background: C.cream, border: `4px solid ${C.navy}`, boxShadow: `6px 6px 0 ${C.navy}`, zIndex: 51, borderRadius: 0
            }}>
              <div style={{ background: C.gold, borderBottom: `4px solid ${C.navy}`, padding: '8px 12px' }}>
                <Pixel size={20}>NEW CHORE</Pixel>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  data-testid="input-chore-title"
                  placeholder="CHORE TITLE..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  style={{ ...insetStyle(C.white), padding: 8, fontFamily: "'VT323', monospace", fontSize: 20, color: C.navy, width: '100%', outline: 'none' }}
                />
                <select
                  data-testid="select-chore-member"
                  value={newMember}
                  onChange={e => setNewMember(e.target.value)}
                  style={{ ...insetStyle(C.white), padding: 8, fontFamily: "'Courier New', Courier, monospace", fontSize: 14, color: C.navy, width: '100%', outline: 'none' }}
                >
                  {data.members.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <Dialog.Close asChild>
                    <Button bg={C.white} testId="btn-cancel-chore"><Pixel size={18}>CANCEL</Pixel></Button>
                  </Dialog.Close>
                  <Button bg={C.green} onClick={addChore} testId="btn-save-chore"><Pixel size={18} color={C.white}>SAVE</Pixel></Button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div style={{ ...panelStyle(C.white), flex: 1, minHeight: 400 }}>
        {filteredChores.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center' }}>
            <Mono style={{ color: '#888' }}>NO CHORES FOUND // ADD ONE TO CONTINUE</Mono>
          </div>
        ) : (
          filteredChores.map((chore: any) => {
            const member = data.members.find((m: any) => m.id === chore.memberId);
            return (
              <RetroCheck
                key={chore.id}
                checked={chore.done}
                onClick={() => toggleChore(chore.id)}
                label={chore.title}
                sub={`ASSIGNED: ${member?.name || 'UNKNOWN'}`}
                color={member?.color || C.gold}
                testId={`chore-${chore.id}`}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
