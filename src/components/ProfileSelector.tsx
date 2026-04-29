import { useState } from 'react';
import type { FamilyMember } from '../types';
import { Plus, X, Check, Edit2 } from 'lucide-react';

const COLORS = [
  { color: '#E07092', bg: '#F9C6D0' },
  { color: '#3DAED4', bg: '#B8EAD8' },
  { color: '#8B6FD4', bg: '#D6CCF4' },
  { color: '#F5A623', bg: '#FDE8B8' },
  { color: '#5DBD8A', bg: '#C0EED8' },
  { color: '#E05757', bg: '#FAC6C6' },
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
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFF0F4 0%, #F0F0FF 50%, #F0FFF8 100%)' }}>
      <div className="w-full max-w-md px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md" style={{ background: 'linear-gradient(135deg, #E07092, #8B6FD4)' }}>
            <span className="text-3xl">🏠</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Family Hub</h1>
          <p className="text-gray-500 mt-1">Our Command Center</p>
        </div>

        {/* PIN entry overlay */}
        {pinTarget && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
              <div className="text-center mb-5">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 text-3xl" style={{ background: pinTarget.bgColor }}>
                  {pinTarget.emoji}
                </div>
                <h3 className="font-bold text-gray-800">Welcome, {pinTarget.name}!</h3>
                <p className="text-sm text-gray-500 mt-1">Enter your 4-digit PIN</p>
              </div>
              <div className="flex gap-2 justify-center mb-2">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-colors ${pinInput.length > i ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'} ${pinError ? 'border-red-400 bg-red-50' : ''}`}>
                    {pinInput.length > i ? '●' : ''}
                  </div>
                ))}
              </div>
              {pinError && <p className="text-center text-red-500 text-xs mb-2">Incorrect PIN. Try again.</p>}
              <div className="grid grid-cols-3 gap-2 mt-4 mb-2">
                {['1','2','3','4','5','6','7','8','9'].map(n => (
                  <button key={n} onClick={() => handlePinDigit(n)} className="h-12 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 text-lg transition-colors">{n}</button>
                ))}
                <button onClick={() => setPinInput(p => p.slice(0,-1))} className="h-12 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">⌫</button>
                <button onClick={() => handlePinDigit('0')} className="h-12 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 text-lg transition-colors">0</button>
                <button onClick={() => { setPinTarget(null); setPinInput(''); }} className="h-12 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm transition-colors">✕</button>
              </div>
            </div>
          </div>
        )}

        {/* Member cards */}
        <div className="space-y-3 mb-4">
          {members.map(m => (
            <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 p-4 group">
              <button onClick={() => handleSelect(m)} className="flex items-center gap-4 flex-1 text-left">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm" style={{ background: m.bgColor }}>
                  {m.emoji}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">{m.name}</p>
                  <p className="text-sm" style={{ color: m.color }}>{m.role === 'admin' ? '⭐ Admin' : '👤 Member'}{m.pin ? ' · 🔒 PIN' : ' · Tap to enter'}</p>
                </div>
              </button>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(m)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Edit2 size={16}/></button>
                {members.length > 1 && <button onClick={() => deleteMember(m.id)} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><X size={16}/></button>}
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit form */}
        {(adding || editing) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 space-y-4">
            <h3 className="font-bold text-gray-800">{editing ? 'Edit Profile' : 'Add Family Member'}</h3>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Name</label>
              <input value={draft.name} onChange={e => setDraft(d => ({...d, name: e.target.value}))} placeholder="Full name" className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Avatar</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setDraft(d => ({...d, emoji: e}))} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${draft.emoji === e ? 'scale-110 shadow-md' : 'hover:bg-gray-50'}`} style={draft.emoji === e ? { background: draft.bgColor } : {}}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Color</label>
              <div className="flex gap-2 mt-1">
                {COLORS.map(c => (
                  <button key={c.color} onClick={() => setDraft(d => ({...d, color: c.color, bgColor: c.bg}))} className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110" style={{ background: c.color }}>
                    {draft.color === c.color && <Check size={14} className="text-white" strokeWidth={3}/>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">PIN (4 digits, optional)</label>
              <input type="password" maxLength={4} inputMode="numeric" value={draft.pin} onChange={e => setDraft(d => ({...d, pin: e.target.value.replace(/\D/g,'').slice(0,4)}))} placeholder="Leave blank for no PIN" className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Role</label>
              <div className="flex gap-2 mt-1">
                {(['admin','member'] as const).map(r => (
                  <button key={r} onClick={() => setDraft(d => ({...d, role: r}))} className="flex-1 py-2 rounded-xl text-sm font-medium capitalize border transition-colors" style={draft.role === r ? { background: draft.color, color: 'white', borderColor: 'transparent' } : { borderColor: '#E5E7EB', color: '#6B7280' }}>
                    {r === 'admin' ? '⭐ Admin' : '👤 Member'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setAdding(false); setEditing(null); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveMember} disabled={!draft.name.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: draft.color }}>Save</button>
            </div>
          </div>
        )}

        {!adding && !editing && (
          <button onClick={() => { setAdding(true); setEditing(null); }} className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 text-sm font-medium hover:border-pink-300 hover:text-pink-500 transition-colors flex items-center justify-center gap-2">
            <Plus size={18}/> Add Family Member
          </button>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">Made with 💕 for our family</p>
      </div>
    </div>
  );
}
