import { useState } from 'react';
import { C } from '../../hooks/use-harmony-data';
import { Mono, Pixel, Button, panelStyle, RetroCheck, insetStyle } from '../RetroUI';

export function ListsTab({ data, updateData }: { data: any, updateData: any }) {
  const [activeListId, setActiveListId] = useState(data.lists[0]?.id);
  const [newItemText, setNewItemText] = useState('');
  const [newListTitle, setNewListTitle] = useState('');

  const activeList = data.lists.find((l: any) => l.id === activeListId);

  const addList = () => {
    if (!newListTitle) return;
    const newList = { id: Math.random().toString(36).substring(7), name: newListTitle, items: [] };
    updateData((prev: any) => ({
      ...prev,
      lists: [...prev.lists, newList]
    }));
    setActiveListId(newList.id);
    setNewListTitle('');
  };

  const addItem = () => {
    if (!newItemText || !activeListId) return;
    updateData((prev: any) => ({
      ...prev,
      lists: prev.lists.map((l: any) => {
        if (l.id === activeListId) {
          return {
            ...l,
            items: [...l.items, { id: Math.random().toString(36).substring(7), text: newItemText, done: false }]
          };
        }
        return l;
      })
    }));
    setNewItemText('');
  };

  const toggleItem = (itemId: string) => {
    updateData((prev: any) => ({
      ...prev,
      lists: prev.lists.map((l: any) => {
        if (l.id === activeListId) {
          return {
            ...l,
            items: l.items.map((i: any) => i.id === itemId ? { ...i, done: !i.done } : i)
          };
        }
        return l;
      })
    }));
  };

  const clearDone = () => {
    updateData((prev: any) => ({
      ...prev,
      lists: prev.lists.map((l: any) => {
        if (l.id === activeListId) {
          return {
            ...l,
            items: l.items.filter((i: any) => !i.done)
          };
        }
        return l;
      })
    }));
  };

  return (
    <div style={{ width: '100%', display: 'flex', gap: 14 }}>
      <div style={{ flex: '0 0 250px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newListTitle}
            onChange={e => setNewListTitle(e.target.value)}
            placeholder="NEW LIST..."
            style={{ ...insetStyle(C.white), padding: '6px 8px', width: '100%', fontFamily: "'VT323', monospace", fontSize: 18, outline: 'none' }}
            data-testid="input-new-list"
          />
          <Button onClick={addList} bg={C.gold} style={{ padding: '6px 12px' }} testId="btn-add-list"><Pixel size={18}>+</Pixel></Button>
        </div>
        <div style={{ ...panelStyle(C.white), display: 'flex', flexDirection: 'column' }}>
          {data.lists.map((l: any) => (
            <div
              key={l.id}
              onClick={() => setActiveListId(l.id)}
              style={{
                padding: '10px 14px',
                borderBottom: `2px solid ${C.navy}`,
                background: activeListId === l.id ? C.navy : 'transparent',
                cursor: 'pointer'
              }}
              data-testid={`list-${l.id}`}
            >
              <Pixel size={18} color={activeListId === l.id ? C.white : C.navy}>{l.name}</Pixel>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, ...panelStyle(C.white), display: 'flex', flexDirection: 'column' }}>
        {activeList ? (
          <>
            <div style={{ background: C.orange, borderBottom: `4px solid ${C.navy}`, padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Pixel size={24} color={C.white}>{activeList.name}</Pixel>
              <Button onClick={clearDone} bg={C.red} style={{ padding: '4px 8px' }} testId="btn-clear-done">
                <Pixel size={16} color={C.white}>CLEAR DONE</Pixel>
              </Button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeList.items.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center' }}><Mono style={{ color: '#888' }}>LIST IS EMPTY</Mono></div>
              ) : (
                activeList.items.map((item: any) => (
                  <RetroCheck
                    key={item.id}
                    checked={item.done}
                    onClick={() => toggleItem(item.id)}
                    label={item.text}
                    color={C.orange}
                    testId={`list-item-${item.id}`}
                  />
                ))
              )}
            </div>
            <div style={{ padding: 14, borderTop: `4px solid ${C.navy}`, background: C.cream, display: 'flex', gap: 10 }}>
              <input
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder="ADD ITEM..."
                style={{ ...insetStyle(C.white), flex: 1, padding: '8px 12px', fontFamily: "'VT323', monospace", fontSize: 20, outline: 'none' }}
                data-testid="input-new-item"
              />
              <Button onClick={addItem} bg={C.green} style={{ padding: '8px 20px' }} testId="btn-add-item">
                <Pixel size={20} color={C.white}>ADD</Pixel>
              </Button>
            </div>
          </>
        ) : (
          <div style={{ padding: 20, textAlign: 'center' }}><Mono style={{ color: '#888' }}>SELECT A LIST // OR CREATE ONE</Mono></div>
        )}
      </div>
    </div>
  );
}
