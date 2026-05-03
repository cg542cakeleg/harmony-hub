import { useState } from 'react';
import { C } from '../../hooks/use-harmony-data';
import { Mono, Pixel, Button, panelStyle, insetStyle } from '../RetroUI';
import * as Dialog from '@radix-ui/react-dialog';

export function CalendarTab({ data, updateData }: { data: any, updateData: any }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', color: C.blue, memberId: data.members[0]?.id || '' });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    updateData((prev: any) => ({
      ...prev,
      events: [...prev.events, { ...newEvent, id: Math.random().toString(36).substring(7) }]
    }));
    setNewEvent({ title: '', date: '', time: '', color: C.blue, memberId: data.members[0]?.id || '' });
    setOpen(false);
  };

  const getEventsForDay = (day: number) => {
    const dStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return data.events.filter((e: any) => e.date === dStr);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.pink, padding: '10px 14px', border: `4px solid ${C.navy}`, boxShadow: `4px 4px 0 ${C.navy}` }}>
        <Button onClick={prevMonth} bg={C.white} testId="btn-prev-month"><Pixel size={20}>&lt; PREV</Pixel></Button>
        <Pixel size={28} color={C.white}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</Pixel>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button bg={C.gold} testId="btn-add-event"><Pixel size={20}>+ ADD EVENT</Pixel></Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} />
              <Dialog.Content style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '90%', maxWidth: 400, background: C.cream, border: `4px solid ${C.navy}`, boxShadow: `6px 6px 0 ${C.navy}`, zIndex: 51, borderRadius: 0
              }}>
                <div style={{ background: C.gold, borderBottom: `4px solid ${C.navy}`, padding: '8px 12px' }}>
                  <Pixel size={20}>NEW EVENT</Pixel>
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input placeholder="EVENT TITLE..." value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} style={{ ...insetStyle(C.white), padding: 8, fontFamily: "'VT323', monospace", fontSize: 20, outline: 'none' }} data-testid="input-event-title" />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} style={{ ...insetStyle(C.white), padding: 8, fontFamily: "'Courier New', Courier, monospace", fontSize: 14, outline: 'none', flex: 1 }} data-testid="input-event-date" />
                    <input type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} style={{ ...insetStyle(C.white), padding: 8, fontFamily: "'Courier New', Courier, monospace", fontSize: 14, outline: 'none', flex: 1 }} data-testid="input-event-time" />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <select value={newEvent.memberId} onChange={e => setNewEvent({...newEvent, memberId: e.target.value})} style={{ ...insetStyle(C.white), padding: 8, fontFamily: "'Courier New', Courier, monospace", fontSize: 14, outline: 'none', flex: 1 }} data-testid="select-event-member">
                      {data.members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <select value={newEvent.color} onChange={e => setNewEvent({...newEvent, color: e.target.value})} style={{ ...insetStyle(C.white), padding: 8, fontFamily: "'Courier New', Courier, monospace", fontSize: 14, outline: 'none', flex: 1, backgroundColor: newEvent.color, color: C.white }} data-testid="select-event-color">
                      <option value={C.blue} style={{background: C.blue}}>BLUE</option>
                      <option value={C.pink} style={{background: C.pink}}>PINK</option>
                      <option value={C.green} style={{background: C.green}}>GREEN</option>
                      <option value={C.orange} style={{background: C.orange}}>ORANGE</option>
                      <option value={C.red} style={{background: C.red}}>RED</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                    <Dialog.Close asChild><Button bg={C.white} testId="btn-cancel-event"><Pixel size={18}>CANCEL</Pixel></Button></Dialog.Close>
                    <Button bg={C.pink} onClick={addEvent} testId="btn-save-event"><Pixel size={18} color={C.white}>SAVE</Pixel></Button>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <Button onClick={nextMonth} bg={C.white} testId="btn-next-month"><Pixel size={20}>NEXT &gt;</Pixel></Button>
        </div>
      </div>

      <div style={{ ...panelStyle(C.white), padding: 10, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, minHeight: 480 }}>
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
          <div key={d} style={{ textAlign: 'center', background: C.navy, color: C.white, padding: '4px 0' }}>
            <Pixel size={16} color={C.white}>{d}</Pixel>
          </div>
        ))}
        {days.map((d, i) => {
          const dStr = d ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` : '';
          const isToday = dStr === todayStr;
          const dayEvents = d ? getEventsForDay(d) : [];
          
          return (
            <div key={i} style={{
              ...insetStyle(d ? (isToday ? C.gold : C.cream) : C.bg),
              height: 90,
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              opacity: d ? 1 : 0.5,
              overflow: 'hidden'
            }}>
              {d && <Pixel size={16} color={C.navy} style={{ marginBottom: 4 }}>{d}</Pixel>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
                {dayEvents.map((e: any) => (
                  <div key={e.id} style={{ background: e.color, padding: '2px 4px', border: `1px solid ${C.navy}` }} data-testid={`event-${e.id}`}>
                    <Mono style={{ fontSize: 9, color: C.white, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.time} {e.title}</Mono>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
