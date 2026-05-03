import React, { useState } from 'react';

const C = {
  gold:   '#FFD600',
  blue:   '#1A33FF',
  pink:   '#FF0090',
  cream:  '#F0ECD8',
  navy:   '#0D0D3A',
  white:  '#FFFFF0',
  green:  '#00CC44',
  red:    '#FF2200',
  orange: '#FF8800',
  bg:     '#C8C8B8',
};

const px = (n: number) => `${n}px`;

/* ── 3-D button look via box-shadow ── */
const raisedStyle = (bg: string, pressed = false): React.CSSProperties => ({
  background: bg,
  border: `3px solid ${C.navy}`,
  boxShadow: pressed
    ? `inset 3px 3px 0 rgba(0,0,0,0.4), inset -1px -1px 0 rgba(255,255,255,0.1)`
    : `4px 4px 0 ${C.navy}, inset -2px -2px 0 rgba(0,0,0,0.2), inset 2px 2px 0 rgba(255,255,255,0.35)`,
  cursor: 'pointer',
  userSelect: 'none',
  borderRadius: 0,
});

const insetStyle = (bg = C.white): React.CSSProperties => ({
  background: bg,
  border: `3px solid ${C.navy}`,
  boxShadow: `inset 3px 3px 0 rgba(0,0,0,0.25), inset -2px -2px 0 rgba(255,255,255,0.6)`,
});

const panelStyle = (bg = C.white): React.CSSProperties => ({
  background: bg,
  border: `4px solid ${C.navy}`,
  boxShadow: `6px 6px 0 ${C.navy}`,
});

/* ── Scanline overlay ── */
const scanlinesBg: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 3px)',
};

/* ── Monospace label ── */
const Mono = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <span style={{ fontFamily: "'Courier New', Courier, monospace", ...style }}>{children}</span>
);

/* ── VT323 pixel heading ── */
const Pixel = ({ children, size = 28, color = C.navy, style }: { children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }) => (
  <span style={{ fontFamily: "'VT323', monospace", fontSize: px(size), color, lineHeight: 1.1, letterSpacing: '0.02em', ...style }}>
    {children}
  </span>
);

/* ── Window title bar ── */
const TitleBar = ({ title }: { title: string }) => (
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
  </div>
);

/* ── Tab bar ── */
const TabBar = ({ tabs, active, setActive }: { tabs: { label: string; color: string }[]; active: string; setActive: (t: string) => void }) => (
  <div style={{ background: C.gold, borderBottom: `4px solid ${C.navy}`, display: 'flex', alignItems: 'flex-end', paddingLeft: 8, gap: 4 }}>
    {tabs.map(tab => {
      const isActive = tab.label === active;
      return (
        <button
          key={tab.label}
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
    {/* Add tab button */}
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

/* ── Progress bar ── */
const ProgressBar = ({ pct, color }: { pct: number; color: string }) => (
  <div style={{ ...insetStyle(), height: 18, overflow: 'hidden', position: 'relative' }}>
    <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.3s' }}>
      <div style={{ ...scanlinesBg, width: '100%', height: '100%' }} />
    </div>
    <Mono style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, mixBlendMode: 'difference', color: 'white' }}>
      {pct}%
    </Mono>
  </div>
);

/* ── Checkbox ── */
const RetroCheck = ({ checked, label, sub, color }: { checked: boolean; label: string; sub?: string; color: string }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderBottom: `2px solid ${C.navy}`, background: checked ? C.navy : 'transparent' }}>
    <div style={{ ...insetStyle(checked ? color : C.white), width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
      {checked && <Pixel size={16} color={C.navy}>X</Pixel>}
    </div>
    <div>
      <Pixel size={18} color={checked ? C.cream : C.navy} style={{ textDecoration: checked ? 'line-through' : 'none' }}>{label}</Pixel>
      {sub && <Mono style={{ display: 'block', fontSize: 10, color: checked ? color : '#888', marginTop: 1 }}>{sub}</Mono>}
    </div>
  </div>
);

export function RetroOS() {
  const [activeTab, setActiveTab] = useState('HOME');

  const tabs = [
    { label: 'HOME',     color: C.blue },
    { label: 'CALENDAR', color: C.pink },
    { label: 'CHORES',   color: C.green },
    { label: 'LISTS',    color: C.orange },
    { label: 'BILLS',    color: C.red },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />

      {/* OS desktop background */}
      <div style={{ minHeight: '100vh', background: C.bg, ...scanlinesBg, padding: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', fontFamily: "'Courier New', monospace" }}>

        {/* Main window */}
        <div style={{ width: '100%', maxWidth: 1180, border: `5px solid ${C.navy}`, boxShadow: `10px 10px 0 ${C.navy}`, background: C.cream, display: 'flex', flexDirection: 'column' }}>

          <TitleBar title="HARMONY HUB — FAMILY MANAGEMENT SYSTEM" />
          <TabBar tabs={tabs} active={activeTab} setActive={setActiveTab} />

          {/* Content area */}
          <div style={{ background: C.cream, padding: 16, display: 'flex', gap: 14, flexWrap: 'wrap' }}>

            {/* ── LEFT PANEL: Overdue Bills ── */}
            <div style={{ flex: '2 1 340px', ...panelStyle(C.navy), color: C.white, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Dialog title bar */}
              <div style={{ background: C.red, border: `3px solid ${C.gold}`, padding: '4px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '-16px -16px 0', boxSizing: 'content-box' }}>
                <Pixel size={20} color={C.white}>⚠ ALERT — OVERDUE</Pixel>
                <Mono style={{ fontSize: 11, color: C.gold, border: `2px solid ${C.gold}`, padding: '1px 6px' }}>URGENT</Mono>
              </div>

              <div style={{ paddingTop: 8 }}>
                <Mono style={{ fontSize: 11, color: C.gold, display: 'block', marginBottom: 4 }}>ELECTRICITY BILL / 3 DAYS LATE</Mono>
                <Pixel size={72} color={C.gold} style={{ display: 'block', lineHeight: 1 }}>$420.69</Pixel>
              </div>

              <ProgressBar pct={87} color={C.red} />
              <Mono style={{ fontSize: 10, color: C.orange }}>█ OVERDUE 87% OF MONTHLY BUDGET</Mono>

              <button
                style={{ ...raisedStyle(C.gold), padding: '10px 0', width: '100%', border: `3px solid ${C.navy}` }}
              >
                <Pixel size={24} color={C.navy}>[ PAY NOW ]</Pixel>
              </button>

              <div style={{ borderTop: `2px dashed #444`, paddingTop: 10 }}>
                <Mono style={{ fontSize: 10, color: '#aaa', display: 'block', marginBottom: 6 }}>ALSO DUE THIS MONTH:</Mono>
                {[{ name: 'WATER BILL', amt: '$45.00', due: 'DUE IN 2 DAYS' }, { name: 'INTERNET', amt: '$89.99', due: 'DUE IN 5 DAYS' }].map((b, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', padding: '5px 0' }}>
                    <Mono style={{ fontSize: 12, color: C.cream }}>{b.name}</Mono>
                    <Pixel size={16} color={C.orange}>{b.amt}</Pixel>
                    <Mono style={{ fontSize: 10, color: '#888' }}>{b.due}</Mono>
                  </div>
                ))}
              </div>
            </div>

            {/* ── MIDDLE PANEL: Chores ── */}
            <div style={{ flex: '1.5 1 240px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Chores window */}
              <div style={{ ...panelStyle(C.white), flex: 1 }}>
                <div style={{ background: C.blue, borderBottom: `4px solid ${C.navy}`, padding: '5px 10px' }}>
                  <Pixel size={20} color={C.white}>PENDING CHORES</Pixel>
                </div>
                <div>
                  <RetroCheck checked={false} label="TAKE OUT TRASH"     sub="BEFORE IT SMELLS" color={C.gold} />
                  <RetroCheck checked={true}  label="FEED THE DOG"       sub="DONE BY ALEX" color={C.green} />
                  <RetroCheck checked={false} label="FIX THE SINK"       sub="STOP PROCRASTINATING" color={C.gold} />
                  <RetroCheck checked={false} label="VACUUM LIVING ROOM" sub="ASSIGNED: MOM" color={C.gold} />
                </div>
                <div style={{ padding: '8px 10px', borderTop: `2px solid ${C.navy}`, background: C.cream }}>
                  <Mono style={{ fontSize: 11, color: '#666' }}>3 PENDING / 1 COMPLETE</Mono>
                  <ProgressBar pct={25} color={C.green} />
                </div>
              </div>

              {/* Events window */}
              <div style={{ ...panelStyle(C.white) }}>
                <div style={{ background: C.pink, borderBottom: `4px solid ${C.navy}`, padding: '5px 10px' }}>
                  <Pixel size={20} color={C.white}>UPCOMING EVENTS</Pixel>
                </div>
                {[
                  { date: 'OCT 24', label: 'DENTIST APPT', time: '10:00 AM', color: C.blue },
                  { date: 'OCT 31', label: 'HALLOWEEN',   time: '08:00 PM', color: C.pink },
                ].map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', borderBottom: `2px solid ${C.navy}`, background: i % 2 === 0 ? C.white : C.cream }}>
                    <div style={{ ...insetStyle(e.color), padding: '4px 8px', flexShrink: 0 }}>
                      <Pixel size={14} color={C.white}>{e.date}</Pixel>
                    </div>
                    <div>
                      <Pixel size={18} color={C.navy}>{e.label}</Pixel>
                      <Mono style={{ display: 'block', fontSize: 10, color: '#888' }}>{e.time}</Mono>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT PANEL: Stats ── */}
            <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {[
                { label: 'TASKS DONE', value: '14', color: C.green,  bg: C.navy },
                { label: 'BILLS DUE',  value: '03', color: C.gold,   bg: C.red  },
                { label: 'ALLOWANCE',  value: '$50', color: C.navy,  bg: C.gold },
              ].map((stat, i) => (
                <div key={i} style={{ ...panelStyle(stat.bg), padding: 12, textAlign: 'center' }}>
                  <Mono style={{ fontSize: 11, color: stat.color, display: 'block', letterSpacing: '0.08em' }}>{stat.label}</Mono>
                  <Pixel size={52} color={stat.color} style={{ display: 'block', lineHeight: 1.1 }}>{stat.value}</Pixel>
                </div>
              ))}

              {/* Family members mini-panel */}
              <div style={{ ...panelStyle(C.white) }}>
                <div style={{ background: C.orange, borderBottom: `4px solid ${C.navy}`, padding: '5px 10px' }}>
                  <Pixel size={18} color={C.white}>FAMILY</Pixel>
                </div>
                {['ALEX', 'MOM', 'DAD', 'KID'].map((name, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderBottom: `2px solid ${C.navy}`, background: i === 0 ? C.gold : C.white }}>
                    <div style={{ ...insetStyle([C.blue, C.pink, C.green, C.orange][i % 4]), width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Pixel size={14} color={C.white}>{name[0]}</Pixel>
                    </div>
                    <Pixel size={16} color={C.navy}>{name}</Pixel>
                    {i === 0 && <Mono style={{ marginLeft: 'auto', fontSize: 10, color: C.navy, background: C.gold, border: `1px solid ${C.navy}`, padding: '1px 4px' }}>YOU</Mono>}
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* ── Status bar ── */}
          <div style={{ background: C.navy, borderTop: `4px solid ${C.navy}`, padding: '4px 14px', display: 'flex', gap: 20, alignItems: 'center' }}>
            <Mono style={{ fontSize: 11, color: C.green }}>● SYSTEM OK</Mono>
            <Mono style={{ fontSize: 11, color: C.gold }}>⚡ 1 URGENT ALERT</Mono>
            <Mono style={{ fontSize: 11, color: C.cream, marginLeft: 'auto' }}>HARMONY HUB v2.0 — FAMILY OS</Mono>
          </div>

        </div>
      </div>
    </>
  );
}
