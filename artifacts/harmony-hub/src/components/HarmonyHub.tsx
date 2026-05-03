import { useState, useEffect } from 'react';
import { C, useHarmonyData } from '../hooks/use-harmony-data';
import { Mono, Pixel, scanlinesBg, panelStyle, Button, ProgressBar, RetroCheck, insetStyle } from './RetroUI';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@workspace/replit-auth-web';

import { ChoresTab } from './tabs/ChoresTab';
import { ListsTab } from './tabs/ListsTab';
import { BillsTab } from './tabs/BillsTab';
import { CalendarTab } from './tabs/CalendarTab';

const TitleBar = ({ title }: { title: string }) => {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  return (
    <div style={{ background: C.gold, borderBottom: `4px solid ${C.navy}`, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[C.red, C.orange, C.green].map((col, i) => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: col, border: `2px solid ${C.navy}` }} />
        ))}
      </div>
      <Pixel size={20} color={C.navy} style={{ flex: 1, textAlign: 'center', letterSpacing: '0.1em' }}>
        {title}
      </Pixel>
      <Mono style={{ fontSize: 11, color: C.navy, opacity: 0.6 }}>v2.0</Mono>
      {!isLoading && (
        isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user?.profileImageUrl && (
              <img src={user.profileImageUrl} alt="" style={{ width: 22, height: 22, border: `2px solid ${C.navy}`, borderRadius: '50%' }} />
            )}
            <Mono style={{ fontSize: 11, color: C.navy }}>{user?.firstName ?? user?.email ?? 'USER'}</Mono>
            <Button onClick={logout} bg={C.navy} style={{ padding: '2px 8px' }} testId="btn-logout">
              <Pixel size={12} color={C.gold}>LOG OUT</Pixel>
            </Button>
          </div>
        ) : (
          <Button onClick={login} bg={C.navy} style={{ padding: '2px 10px' }} testId="btn-login">
            <Pixel size={12} color={C.gold}>LOG IN</Pixel>
          </Button>
        )
      )}
    </div>
  );
};

const TabBar = ({ tabs, active, setActive }: { tabs: { label: string; color: string }[]; active: string; setActive: (t: string) => void }) => (
  <div style={{ background: C.gold, borderBottom: `4px solid ${C.navy}`, display: 'flex', alignItems: 'flex-end', paddingLeft: 8, gap: 4 }}>
    {tabs.map(tab => {
      const isActive = tab.label === active;
      return (
        <button
          key={tab.label}
          data-testid={`tab-${tab.label}`}
          onClick={() => setActive(tab.label)}
          style={{
            background: isActive ? C.cream : tab.color,
            border: `3px solid ${C.navy}`,
            borderBottom: isActive ? `3px solid ${C.cream}` : `3px solid ${C.navy}`,
            padding: '6px 18px 8px',
            fontFamily: "'VT323', monospace",
            fontSize: 18,
            color: isActive ? C.navy : C.white,
            cursor: 'pointer',
            position: 'relative',
            zIndex: isActive ? 2 : 1,
            marginBottom: isActive ? '-4px' : 0,
            boxShadow: isActive ? `none` : `3px 0 0 ${C.navy}`,
          }}
        >
          {tab.label}
        </button>
      );
    })}
    <div
      style={{
        marginLeft: 'auto', marginRight: 8, marginBottom: 6,
        width: 28, height: 28,
        background: C.white, border: `3px solid ${C.navy}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', fontWeight: 900, fontSize: 18, color: C.blue,
        boxShadow: `3px 3px 0 ${C.navy}`,
        cursor: 'pointer',
      }}
    >+</div>
  </div>
);

export function HarmonyHub() {
  const [activeTab, setActiveTab] = useState('HOME');
  const { data, updateData } = useHarmonyData();
  const [tickerMsg, setTickerMsg] = useState("ALL SYSTEMS NOMINAL");

  useEffect(() => {
    const msgs = [
      "ALL SYSTEMS NOMINAL",
      `${data.chores.filter((c:any)=>!c.done).length} CHORES PENDING`,
      `${data.bills.filter((b:any)=>b.status==='OVERDUE').length} OVERDUE BILLS`,
      `HAVE A GREAT DAY!`
    ];
    let i = 0;
    const int = setInterval(() => {
      i = (i + 1) % msgs.length;
      setTickerMsg(msgs[i]);
    }, 4000);
    return () => clearInterval(int);
  }, [data]);

  const tabs = [
    { label: 'HOME',     color: C.blue },
    { label: 'CALENDAR', color: C.pink },
    { label: 'CHORES',   color: C.green },
    { label: 'LISTS',    color: C.orange },
    { label: 'BILLS',    color: C.red },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, ...scanlinesBg, padding: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', fontFamily: "'Courier New', monospace" }}>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
      <div style={{ width: '100%', maxWidth: 1180, border: `5px solid ${C.navy}`, boxShadow: `10px 10px 0 ${C.navy}`, background: C.cream, display: 'flex', flexDirection: 'column' }}>
        <TitleBar title="HARMONY HUB — FAMILY MANAGEMENT SYSTEM" />
        <TabBar tabs={tabs} active={activeTab} setActive={setActiveTab} />
        
        <div style={{ background: C.cream, padding: 16, display: 'flex', gap: 14, flexWrap: 'wrap', minHeight: 600 }}>
          {activeTab === 'HOME' && <HomeTab data={data} updateData={updateData} />}
          {activeTab === 'CALENDAR' && <CalendarTab data={data} updateData={updateData} />}
          {activeTab === 'CHORES' && <ChoresTab data={data} updateData={updateData} />}
          {activeTab === 'LISTS' && <ListsTab data={data} updateData={updateData} />}
          {activeTab === 'BILLS' && <BillsTab data={data} updateData={updateData} />}
        </div>
        
        <div style={{ background: C.navy, borderTop: `4px solid ${C.navy}`, padding: '4px 14px', display: 'flex', gap: 20, alignItems: 'center', overflow: 'hidden' }}>
          <Mono style={{ fontSize: 11, color: C.green, flexShrink: 0 }}>● SYSTEM OK</Mono>
          <Mono style={{ fontSize: 11, color: C.gold, flexShrink: 0 }}>! {data.bills.filter((b:any) => b.status === 'OVERDUE').length} URGENT ALERTS</Mono>
          <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative', height: '14px' }}>
            <div style={{ position: 'absolute', animation: 'ticker 15s linear infinite' }}>
              <Mono style={{ fontSize: 11, color: C.cream }}>{tickerMsg} // </Mono>
            </div>
          </div>
          <Mono style={{ fontSize: 11, color: C.cream, flexShrink: 0, background: C.navy, zIndex: 1 }}>HARMONY HUB v2.0 — FAMILY OS</Mono>
        </div>
      </div>
    </div>
  );
}

function HomeTab({ data, updateData }: { data: any, updateData: any }) {
  const completedChores = data.chores.filter((c: any) => c.done).length;
  const totalChores = data.chores.length;
  const pct = totalChores > 0 ? (completedChores / totalChores) * 100 : 0;
  const [manageOpen, setManageOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberColor, setNewMemberColor] = useState(C.blue);

  const addMember = () => {
    if (!newMemberName) return;
    updateData((prev: any) => ({
      ...prev,
      members: [...prev.members, { id: Math.random().toString(36).substring(7), name: newMemberName.toUpperCase(), color: newMemberColor }]
    }));
    setNewMemberName('');
  };

  const removeMember = (id: string) => {
    updateData((prev: any) => ({
      ...prev,
      members: prev.members.filter((m:any) => m.id !== id)
    }));
  };

  return (
    <div style={{ width: '100%', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      <div style={{ flex: '1.5 1 300px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...panelStyle(C.white) }}>
          <div style={{ background: C.blue, borderBottom: `4px solid ${C.navy}`, padding: '5px 10px' }}>
            <Pixel size={20} color={C.white}>PENDING CHORES</Pixel>
          </div>
          <div>
            {data.chores.filter((c:any)=>!c.done).slice(0, 4).map((chore: any) => (
              <RetroCheck key={chore.id} checked={chore.done} label={chore.title} color={C.gold} testId={`home-chore-${chore.id}`} onClick={() => {
                updateData((prev: any) => ({
                  ...prev,
                  chores: prev.chores.map((c: any) => c.id === chore.id ? { ...c, done: !c.done } : c)
                }));
              }} />
            ))}
            {data.chores.filter((c:any)=>!c.done).length === 0 && <div style={{ padding: 16 }}><Mono>NO CHORES PENDING // ALL CLEAR</Mono></div>}
          </div>
          <div style={{ padding: '8px 10px', borderTop: `2px solid ${C.navy}`, background: C.cream }}>
            <Mono style={{ fontSize: 11, color: '#666' }}>{completedChores} COMPLETE / {totalChores - completedChores} PENDING</Mono>
            <ProgressBar pct={pct} color={C.green} />
          </div>
        </div>

        <div style={{ ...panelStyle(C.white) }}>
          <div style={{ background: C.pink, borderBottom: `4px solid ${C.navy}`, padding: '5px 10px' }}>
            <Pixel size={20} color={C.white}>UPCOMING EVENTS (NEXT 7 DAYS)</Pixel>
          </div>
          {data.events.slice(0, 3).map((e: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', borderBottom: `2px solid ${C.navy}`, background: i % 2 === 0 ? C.white : C.cream }}>
              <div style={{ ...insetStyle(e.color || C.blue), padding: '4px 8px', flexShrink: 0 }}>
                <Pixel size={14} color={C.white}>{e.date.split('-').slice(1).join('/')}</Pixel>
              </div>
              <div>
                <Pixel size={18} color={C.navy}>{e.title}</Pixel>
                <Mono style={{ display: 'block', fontSize: 10, color: '#888' }}>{e.time}</Mono>
              </div>
            </div>
          ))}
          {data.events.length === 0 && <div style={{ padding: 16 }}><Mono>NO EVENTS FOUND // ALL CLEAR</Mono></div>}
        </div>
      </div>

      <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'TASKS DONE', value: completedChores.toString(), color: C.green,  bg: C.navy },
          { label: 'BILLS DUE',  value: data.bills.filter((b: any) => b.status !== 'PAID').length.toString(), color: C.gold,   bg: C.red  },
          { label: 'TOTAL LISTS',  value: data.lists.length.toString(), color: C.navy,  bg: C.gold },
        ].map((stat, i) => (
          <div key={i} style={{ ...panelStyle(stat.bg), padding: 12, textAlign: 'center' }}>
            <Mono style={{ fontSize: 11, color: stat.color, display: 'block', letterSpacing: '0.08em' }}>{stat.label}</Mono>
            <Pixel size={52} color={stat.color} style={{ display: 'block', lineHeight: 1.1 }}>{stat.value}</Pixel>
          </div>
        ))}

        <div style={{ ...panelStyle(C.white) }}>
          <div style={{ background: C.orange, borderBottom: `4px solid ${C.navy}`, padding: '5px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pixel size={18} color={C.white}>FAMILY ROSTER ({data.members.length})</Pixel>
            <Dialog.Root open={manageOpen} onOpenChange={setManageOpen}>
              <Dialog.Trigger asChild>
                <Button bg={C.gold} style={{ padding: '2px 6px' }} testId="btn-manage-family"><Pixel size={12}>MANAGE</Pixel></Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} />
                <Dialog.Content style={{
                  position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: '90%', maxWidth: 400, background: C.cream, border: `4px solid ${C.navy}`, boxShadow: `6px 6px 0 ${C.navy}`, zIndex: 51, borderRadius: 0
                }}>
                  <div style={{ background: C.orange, borderBottom: `4px solid ${C.navy}`, padding: '8px 12px' }}>
                    <Pixel size={20} color={C.white}>MANAGE FAMILY</Pixel>
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {data.members.map((m:any) => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px', borderBottom: `1px solid ${C.navy}` }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                           <div style={{ width: 16, height: 16, background: m.color, border: `2px solid ${C.navy}` }} />
                           <Pixel size={18}>{m.name}</Pixel>
                         </div>
                         <Button onClick={() => removeMember(m.id)} bg={C.red} style={{ padding: '2px 8px' }} testId={`btn-remove-${m.id}`}><Pixel size={14} color={C.white}>DEL</Pixel></Button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                      <input placeholder="NEW NAME..." value={newMemberName} onChange={e => setNewMemberName(e.target.value)} style={{ ...insetStyle(C.white), padding: 8, fontFamily: "'VT323', monospace", fontSize: 18, outline: 'none', flex: 1 }} data-testid="input-new-member" />
                      <select value={newMemberColor} onChange={e => setNewMemberColor(e.target.value)} style={{ ...insetStyle(C.white), padding: 8, flexShrink: 0, background: newMemberColor, color: C.white, outline: 'none' }} data-testid="select-member-color">
                        <option value={C.blue} style={{background: C.blue}}>BLU</option>
                        <option value={C.pink} style={{background: C.pink}}>PNK</option>
                        <option value={C.green} style={{background: C.green}}>GRN</option>
                        <option value={C.orange} style={{background: C.orange}}>ORG</option>
                      </select>
                      <Button onClick={addMember} bg={C.green} style={{ padding: '4px 12px' }} testId="btn-add-member"><Pixel size={16} color={C.white}>ADD</Pixel></Button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                      <Dialog.Close asChild><Button bg={C.white} testId="btn-close-manage"><Pixel size={18}>CLOSE</Pixel></Button></Dialog.Close>
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
          {data.members.map((m: any, i: number) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderBottom: `2px solid ${C.navy}`, background: i === 0 ? C.gold : C.white }}>
              <div style={{ ...insetStyle(m.color), width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Pixel size={14} color={C.white}>{m.name[0]}</Pixel>
              </div>
              <Pixel size={16} color={C.navy}>{m.name}</Pixel>
              {i === 0 && <Mono style={{ marginLeft: 'auto', fontSize: 10, color: C.navy, background: C.gold, border: `1px solid ${C.navy}`, padding: '1px 4px' }}>YOU</Mono>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
