import { useState } from 'react';
import type { FamilyMember } from '../types';
import { Plus, X, Check, Edit2 } from 'lucide-react';

const COLORS = [
  { color: '#FF10F0', bg: 'rgba(255,16,240,0.2)' },
  { color: '#00D4FF', bg: 'rgba(0,212,255,0.2)' },
  { color: '#B66DFF', bg: 'rgba(182,109,255,0.2)' },
  { color: '#FF006E', bg: 'rgba(255,0,110,0.2)' },
  { color: '#FFB800', bg: 'rgba(255,184,0,0.2)' },
  { color: '#00FF9F', bg: 'rgba(0,255,159,0.2)' },
];

const EMOJIS = ['👩','👨','👵','👴','🧒','👧','👦','🧑','👶','🐱','🦋','🌸'];

function newId() { return 'member-' + Math.random().toString(36).slice(2); }

interface Props {
  members: FamilyMember[];
  onLogin: (member: FamilyMember) => void;
  onUpdateMembers: (members: FamilyMember[]) => void;
}

export default function ProfileSelector({ members, onLogin, onUpdateMembers }: Props) {
  const [pinTarget, setPinTarget] = useState<FamilyMember | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<FamilyMember | null>(null);
  const [draft, setDraft] = useState<{ name: string; emoji: string; color: string; bgColor: string; pin: string; role: 'admin' | 'member' }>({
    name: '', emoji: '👩', color: COLORS[0].color, bgColor: COLORS[0].bg, pin: '', role: 'member',
  });

  function handleSelect(m: FamilyMember) {
    if (m.pin) {
      setPinTarget(m); setPinInput(''); setPinError(false);
    } else {
      onLogin(m);
    }
  }

  function handlePinDigit(digit: string) {
    if (pinInput.length >= 4) return;
    const next = pinInput + digit;
    setPinInput(next);
    setPinError(false);
    if (next.length === 4 && pinTarget) {
      if (next === pinTarget.pin) {
        onLogin(pinTarget);
        setPinTarget(null);
      } else {
        setPinError(true);
        setTimeout(() => setPinInput(''), 500);
      }
    }
  }

  function saveMember() {
    if (!draft.name.trim()) return;
    const now = new Date().toISOString();
    if (editing) {
      onUpdateMembers(members.map(m => m.id === editing.id
        ? { ...m, name: draft.name, emoji: draft.emoji, color: draft.color, bgColor: draft.bgColor, pin: draft.pin, role: draft.role }
        : m
      ));
      setEditing(null);
    } else {
      const nm: FamilyMember = { id: newId(), name: draft.name, emoji: draft.emoji, color: draft.color, bgColor: draft.bgColor, pin: draft.pin, role: draft.role, created_date: now };
      onUpdateMembers([...members, nm]);
      setAdding(false);
    }
    setDraft({ name: '', emoji: '👩', color: COLORS[0].color, bgColor: COLORS[0].bg, pin: '', role: 'member' });
  }

  function startEdit(m: FamilyMember) {
    setEditing(m); setAdding(false);
    setDraft({ name: m.name, emoji: m.emoji, color: m.color, bgColor: m.bgColor, pin: m.pin, role: m.role });
  }

  function deleteMember(id: string) {
    if (confirm('Remove this family member?')) onUpdateMembers(members.filter(m => m.id !== id));
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: '#0A0014' }}>

      {/* Animated background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none animate-float" style={{
        background: 'radial-gradient(circle, rgba(255,16,240,0.15) 0%, transparent 70%)',
      }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none animate-float" style={{
        background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
        animationDelay: '3s',
      }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none animate-float" style={{
        background: 'radial-gradient(circle, rgba(182,109,255,0.1) 0%, transparent 70%)',
        animationDelay: '6s',
      }} />

      {/* PIN entry overlay */}
      {pinTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}>
          <div className="rounded-3xl p-6 w-full max-w-xs glossy" style={{
            background: 'linear-gradient(135deg, rgba(10,0,20,0.95) 0%, rgba(30,0,50,0.95) 100%)',
            border: `2px solid ${pinTarget.color}55`,
            boxShadow: `0 24px 80px ${pinTarget.color}40`,
          }}>
            <div className="text-center mb-5">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-4xl" style={{
                background: `linear-gradient(135deg, ${pinTarget.bgColor} 0%, ${pinTarget.color}40 100%)`,
                boxShadow: `0 8px 32px ${pinTarget.color}50`,
                border: `2px solid ${pinTarget.color}60`,
              }}>
                {pinTarget.emoji}
              </div>
              <h3 className="font-black text-white tracking-tight text-lg" style={{ textShadow: `0 0 20px ${pinTarget.color}` }}>
                WELCOME, {pinTarget.name.toUpperCase()}!
              </h3>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Enter your 4-digit PIN</p>
            </div>

            <div className="flex gap-2 justify-center mb-4">
              {[0,1,2,3].map(i => (
                <div key={i} className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black transition-all" style={{
                  background: pinInput.length > i
                    ? (pinError ? 'rgba(255,0,110,0.3)' : `${pinTarget.color}30`)
                    : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${pinInput.length > i
                    ? (pinError ? '#FF006E' : pinTarget.color)
                    : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: pinInput.length > i ? `0 0 12px ${pinError ? '#FF006E' : pinTarget.color}60` : 'none',
                  color: pinError ? '#FF006E' : pinTarget.color,
                }}>
                  {pinInput.length > i ? '●' : ''}
                </div>
              ))}
            </div>

            {pinError && (
              <p className="text-center text-xs font-black tracking-widest mb-3 animate-shake" style={{ color: '#FF006E' }}>
                INCORRECT PIN
              </p>
            )}

            <div className="grid grid-cols-3 gap-2">
              {['1','2','3','4','5','6','7','8','9'].map(n => (
                <button key={n} onClick={() => handlePinDigit(n)}
                  className="h-12 rounded-xl font-black text-lg text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPinInput(p => p.slice(0,-1))}
                className="h-12 rounded-xl font-black text-white transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                ⌫
              </button>
              <button onClick={() => handlePinDigit('0')}
                className="h-12 rounded-xl font-black text-lg text-white transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                0
              </button>
              <button onClick={() => { setPinTarget(null); setPinInput(''); }}
                className="h-12 rounded-xl text-sm transition-all hover:scale-105"
                style={{ background: 'rgba(255,0,110,0.15)', border: '1px solid rgba(255,0,110,0.3)', color: '#FF006E' }}>
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md px-4 py-8 relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 glossy" style={{
            background: 'linear-gradient(135deg, #FF10F0 0%, #B66DFF 50%, #00D4FF 100%)',
            boxShadow: '0 12px 48px rgba(255,16,240,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}>
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight chrome-text">FAMILY HUB</h1>
          <p className="mt-1 text-sm font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Command Center
          </p>
        </div>

        {/* Member cards */}
        <div className="space-y-3 mb-4">
          {members.map(m => (
            <div key={m.id} className="group rounded-2xl glossy transition-all hover:scale-[1.02]" style={{
              background: `linear-gradient(135deg, ${m.bgColor} 0%, rgba(10,0,20,0.6) 100%)`,
              border: `2px solid ${m.color}44`,
              boxShadow: `0 4px 24px ${m.color}22`,
            }}>
              <div className="flex items-center gap-4 p-4">
                <button onClick={() => handleSelect(m)} className="flex items-center gap-4 flex-1 text-left">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{
                    background: `linear-gradient(135deg, ${m.color}40 0%, ${m.bgColor} 100%)`,
                    boxShadow: `0 4px 16px ${m.color}50, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    border: `2px solid ${m.color}55`,
                  }}>
                    {m.emoji}
                  </div>
                  <div>
                    <p className="font-black text-white text-lg tracking-tight">{m.name}</p>
                    <p className="text-xs font-bold mt-0.5" style={{ color: m.color }}>
                      {m.role === 'admin' ? '⭐ ADMIN' : '👤 MEMBER'}{m.pin ? ' · 🔒 PIN' : ' · TAP TO ENTER'}
                    </p>
                  </div>
                </button>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(m)}
                    className="p-2 rounded-xl transition-all hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                    <Edit2 size={15}/>
                  </button>
                  {members.length > 1 && (
                    <button onClick={() => deleteMember(m.id)}
                      className="p-2 rounded-xl transition-all hover:scale-110"
                      style={{ background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.3)', color: '#FF006E' }}>
                      <X size={15}/>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit form */}
        {(adding || editing) && (
          <div className="rounded-2xl p-5 mb-4 glossy" style={{
            background: 'linear-gradient(135deg, rgba(30,0,50,0.9) 0%, rgba(10,0,20,0.9) 100%)',
            border: '2px solid rgba(182,109,255,0.3)',
            boxShadow: '0 8px 40px rgba(182,109,255,0.2)',
          }}>
            <h3 className="font-black text-white tracking-tight mb-4">
              {editing ? 'EDIT PROFILE' : 'ADD FAMILY MEMBER'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Name</label>
                <input
                  value={draft.name}
                  onChange={e => setDraft(d => ({...d, name: e.target.value}))}
                  placeholder="Full name"
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white placeholder-white/30 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '2px solid rgba(182,109,255,0.3)',
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Avatar</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setDraft(d => ({...d, emoji: e}))}
                      className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all hover:scale-110"
                      style={draft.emoji === e ? {
                        background: `${draft.color}30`,
                        border: `2px solid ${draft.color}`,
                        boxShadow: `0 0 12px ${draft.color}60`,
                        transform: 'scale(1.15)',
                      } : {
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Color</label>
                <div className="flex gap-3 mt-1.5">
                  {COLORS.map(c => (
                    <button key={c.color} onClick={() => setDraft(d => ({...d, color: c.color, bgColor: c.bg}))}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{
                        background: c.color,
                        boxShadow: draft.color === c.color ? `0 0 16px ${c.color}` : 'none',
                        transform: draft.color === c.color ? 'scale(1.25)' : 'scale(1)',
                        border: draft.color === c.color ? '2px solid white' : 'none',
                      }}>
                      {draft.color === c.color && <Check size={14} className="text-white" strokeWidth={3}/>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Role</label>
                <div className="flex gap-2 mt-1.5">
                  {(['admin','member'] as const).map(r => (
                    <button key={r} onClick={() => setDraft(d => ({...d, role: r}))}
                      className="flex-1 py-2.5 rounded-xl text-sm font-black tracking-wide transition-all hover:scale-[1.02]"
                      style={draft.role === r ? {
                        background: `linear-gradient(135deg, ${draft.color}50 0%, ${draft.color}30 100%)`,
                        border: `2px solid ${draft.color}`,
                        color: draft.color,
                        boxShadow: `0 4px 16px ${draft.color}40`,
                      } : {
                        background: 'rgba(255,255,255,0.03)',
                        border: '2px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.4)',
                      }}>
                      {r === 'admin' ? '⭐ ADMIN' : '👤 MEMBER'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => { setAdding(false); setEditing(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black tracking-wide text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }}>
                  CANCEL
                </button>
                <button onClick={saveMember} disabled={!draft.name.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black tracking-wide text-white disabled:opacity-40 transition-all hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${draft.color} 0%, ${draft.bgColor} 100%)`,
                    boxShadow: `0 4px 16px ${draft.color}50`,
                  }}>
                  SAVE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Member button */}
        {!adding && !editing && (
          <button
            onClick={() => { setAdding(true); setEditing(null); }}
            className="w-full py-3.5 rounded-2xl text-sm font-black tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(255,16,240,0.05)',
              border: '2px dashed rgba(255,16,240,0.35)',
            }}
          >
            <Plus size={18} style={{ color: '#FF10F0' }}/>
            <span className="chrome-text">ADD FAMILY MEMBER</span>
          </button>
        )}

        <p className="text-center text-xs font-bold tracking-widest mt-8 chrome-text">
          MADE WITH ✨ FOR OUR FAMILY
        </p>
      </div>
    </div>
  );
}