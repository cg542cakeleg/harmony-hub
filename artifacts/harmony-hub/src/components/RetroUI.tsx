import { useState, type CSSProperties } from 'react';
import { C } from '../hooks/use-harmony-data';

const px = (n: number) => `${n}px`;

export const raisedStyle = (bg: string, pressed = false): CSSProperties => ({
  background: bg,
  border: `3px solid ${C.navy}`,
  boxShadow: pressed
    ? `inset 3px 3px 0 rgba(0,0,0,0.4), inset -1px -1px 0 rgba(255,255,255,0.1)`
    : `4px 4px 0 ${C.navy}, inset -2px -2px 0 rgba(0,0,0,0.2), inset 2px 2px 0 rgba(255,255,255,0.35)`,
  cursor: 'pointer',
  userSelect: 'none',
  borderRadius: 0,
});

export const insetStyle = (bg = C.white): CSSProperties => ({
  background: bg,
  border: `3px solid ${C.navy}`,
  boxShadow: `inset 3px 3px 0 rgba(0,0,0,0.25), inset -2px -2px 0 rgba(255,255,255,0.6)`,
});

export const panelStyle = (bg = C.white): CSSProperties => ({
  background: bg,
  border: `4px solid ${C.navy}`,
  boxShadow: `6px 6px 0 ${C.navy}`,
});

export const scanlinesBg: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 3px)',
};

export const Mono = ({ children, style }: { children: React.ReactNode; style?: CSSProperties }) => (
  <span style={{ fontFamily: "'Courier New', Courier, monospace", ...style }}>{children}</span>
);

export const Pixel = ({ children, size = 28, color = C.navy, style }: { children: React.ReactNode; size?: number; color?: string; style?: CSSProperties }) => (
  <span style={{ fontFamily: "'VT323', monospace", fontSize: px(size), color, lineHeight: 1.1, letterSpacing: '0.02em', ...style }}>
    {children}
  </span>
);

export const ProgressBar = ({ pct, color }: { pct: number; color: string }) => (
  <div style={{ ...insetStyle(), height: 18, overflow: 'hidden', position: 'relative' }}>
    <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', background: color, transition: 'width 0.3s' }}>
      <div style={{ ...scanlinesBg, width: '100%', height: '100%' }} />
    </div>
    <Mono style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, mixBlendMode: 'difference', color: 'white' }}>
      {Math.round(pct)}%
    </Mono>
  </div>
);

export const RetroCheck = ({ checked, label, sub, color, onClick, testId }: { checked: boolean; label: string; sub?: string; color: string; onClick?: () => void; testId?: string }) => (
  <div data-testid={testId} onClick={onClick} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderBottom: `2px solid ${C.navy}`, background: checked ? C.navy : 'transparent', cursor: onClick ? 'pointer' : 'default' }}>
    <div style={{ ...insetStyle(checked ? color : C.white), width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
      {checked && <Pixel size={16} color={C.navy}>X</Pixel>}
    </div>
    <div>
      <Pixel size={18} color={checked ? C.cream : C.navy} style={{ textDecoration: checked ? 'line-through' : 'none' }}>{label}</Pixel>
      {sub && <Mono style={{ display: 'block', fontSize: 10, color: checked ? color : '#888', marginTop: 1 }}>{sub}</Mono>}
    </div>
  </div>
);

export const Button = ({ children, onClick, bg = C.white, testId, style, type = 'button', disabled = false }: { children: React.ReactNode; onClick?: () => void; bg?: string; testId?: string; style?: CSSProperties; type?: 'button' | 'submit' | 'reset'; disabled?: boolean }) => {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type={type}
      data-testid={testId}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={onClick}
      style={{ ...raisedStyle(bg, pressed), ...style, ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
    >
      {children}
    </button>
  );
};
