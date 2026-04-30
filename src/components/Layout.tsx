import type { ReactNode } from 'react';
import { Home, Calendar, CheckSquare, List, Receipt, LogOut, Settings } from 'lucide-react';
import type { FamilyMember } from '../types';

type Tab = 'home' | 'bills' | 'chores' | 'events' | 'lists';

const NAV = [
  { id: 'home'   as Tab, label: 'Home',     icon: Home },
  { id: 'events' as Tab, label: 'Calendar', icon: Calendar },
  { id: 'chores' as Tab, label: 'Chores',   icon: CheckSquare },
  { id: 'lists'  as Tab, label: 'Lists',    icon: List },
  { id: 'bills'  as Tab, label: 'Bills',    icon: Receipt },
];

const QUICK_LINKS = [
  { label: 'Calendar', url: 'https://calendar.google.com',  emoji: '📅', color: '#4285F4' },
  { label: 'Gmail',    url: 'https://mail.google.com',      emoji: '✉️',  color: '#EA4335' },
  { label: 'Photos',   url: 'https://photos.google.com',    emoji: '🖼️',  color: '#34A853' },
  { label: 'Drive',    url: 'https://drive.google.com',     emoji: '💾',  color: '#FBBC04' },
];

interface Props {
  tab: Tab;
  onTab: (t: Tab) => void;
  user: FamilyMember;
  onLogout: () => void;
  onManageProfiles: () => void;
  children: ReactNode;
}

export default function Layout({ tab, onTab, user, onLogout, onManageProfiles, children }: Props) {
  return (
    <div className="flex min-h-screen">
      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 sticky top-0 h-screen z-20 glossy" style={{
        background: 'linear-gradient(180deg, rgba(10,0,20,0.98) 0%, rgba(20,0,40,0.98) 100%)',
        borderRight: '2px solid rgba(255,16,240,0.3)',
        boxShadow: '4px 0 32px rgba(255,16,240,0.2)',
      }}>
        {/* Brand */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl glossy" style={{
            background: 'linear-gradient(135deg,#FF10F0 0%,#B66DFF 50%,#00D4FF 100%)',
            boxShadow: '0 8px 32px rgba(255,16,240,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}>
            <span className="text-2xl">✨</span>
            <div>
              <p className="font-black text-white text-sm tracking-tight leading-none">FAMILY HUB</p>
              <p className="text-xs text-white/80 font-semibold tracking-wide">COMMAND CENTER</p>
            </div>
          </div>
        </div>

        {/* Active user */}
        <div className="px-4 pb-4">
          <div className="rounded-2xl p-4 glossy" style={{
            background: 'linear-gradient(135deg,rgba(255,16,240,0.15) 0%,rgba(182,109,255,0.15) 100%)',
            boxShadow: `0 4px 20px rgba(255,16,240,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
            border: `2px solid ${user.color}55`,
          }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{
                background: `linear-gradient(135deg,${user.bgColor} 0%,${user.color}40 100%)`,
                boxShadow: `0 4px 16px ${user.color}60, inset 0 1px 0 rgba(255,255,255,0.3)`,
                border: '2px solid rgba(255,255,255,0.2)',
              }}>{user.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white truncate tracking-tight">{user.name}</p>
                <span className="text-xs font-bold capitalize px-2 py-0.5 rounded-full inline-block mt-1" style={{
                  background: `linear-gradient(135deg,${user.color} 0%,${user.color}CC 100%)`,
                  color: 'white', boxShadow: `0 2px 8px ${user.color}60`,
                }}>{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-2">
          {NAV.map(n => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => onTab(n.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 tracking-tight ${active ? 'glossy scale-[1.02]' : ''}`}
                style={active ? {
                  background: 'linear-gradient(135deg,#FF10F0 0%,#B66DFF 100%)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(255,16,240,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,16,240,0.5)',
                } : {
                  background: 'rgba(255,16,240,0.05)',
                  color: '#B8B8B8',
                  border: '2px solid rgba(255,16,240,0.1)',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background='rgba(255,16,240,0.15)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(255,16,240,0.3)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background='rgba(255,16,240,0.05)'; e.currentTarget.style.color='#B8B8B8'; e.currentTarget.style.borderColor='rgba(255,16,240,0.1)'; } }}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {n.label.toUpperCase()}
              </button>
            );
          })}
        </nav>

        {/* Quick links */}
        <div className="px-4 py-3">
          <p className="text-xs font-black tracking-wider px-2 mb-3 chrome-text">QUICK LINKS</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_LINKS.map(g => (
              <a key={g.url} href={g.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-black transition-all hover:scale-105 glossy"
                style={{
                  background: `linear-gradient(135deg,${g.color}30 0%,${g.color}15 100%)`,
                  color: g.color,
                  boxShadow: `0 4px 12px ${g.color}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
                  border: `2px solid ${g.color}40`,
                }}>
                <span>{g.emoji}</span><span className="truncate">{g.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-5 space-y-2">
          <button onClick={onManageProfiles}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{ background:'rgba(182,109,255,0.1)', color:'#B66DFF', border:'2px solid rgba(182,109,255,0.2)' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(182,109,255,0.2)';e.currentTarget.style.borderColor='rgba(182,109,255,0.4)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(182,109,255,0.1)';e.currentTarget.style.borderColor='rgba(182,109,255,0.2)';}}
          ><Settings size={16}/> MANAGE PROFILES</button>
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{ background:'rgba(255,16,240,0.1)', color:'#FF10F0', border:'2px solid rgba(255,16,240,0.2)' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,16,240,0.2)';e.currentTarget.style.borderColor='rgba(255,16,240,0.4)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,16,240,0.1)';e.currentTarget.style.borderColor='rgba(255,16,240,0.2)';}}
          ><LogOut size={16}/> SWITCH USER</button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-10 glossy" style={{
          background: 'linear-gradient(135deg,rgba(10,0,20,0.98) 0%,rgba(20,0,40,0.98) 100%)',
          borderBottom: '2px solid rgba(255,16,240,0.3)',
          boxShadow: '0 4px 20px rgba(255,16,240,0.2)',
        }}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl glossy" style={{
              background: 'linear-gradient(135deg,#FF10F0 0%,#B66DFF 100%)',
              boxShadow: '0 4px 16px rgba(255,16,240,0.4)',
            }}>✨</div>
            <div>
              <p className="font-black text-white text-sm leading-none tracking-tight">FAMILY HUB</p>
              <p className="text-xs text-white/60 font-semibold">COMMAND CENTER</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{
              background: `linear-gradient(135deg,${user.bgColor} 0%,${user.color}40 100%)`,
              border: '2px solid rgba(255,255,255,0.2)',
            }}>{user.emoji}</div>
            <button onClick={onLogout} className="p-2 rounded-xl transition-all" style={{ background:'rgba(255,16,240,0.1)', border:'2px solid rgba(255,16,240,0.2)', color:'white' }}>
              <LogOut size={18}/>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {/* Quick links — mobile only */}
          <div className="md:hidden flex gap-2 mb-4 overflow-x-auto pb-1">
            {QUICK_LINKS.map(g => (
              <a key={g.url} href={g.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all hover:scale-105"
                style={{ background:`${g.color}20`, color:g.color, border:`2px solid ${g.color}40` }}>
                <span>{g.emoji}</span>{g.label}
              </a>
            ))}
          </div>
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 flex z-20 glossy px-2 py-2 gap-1" style={{
          background: 'linear-gradient(135deg,rgba(10,0,20,0.98) 0%,rgba(20,0,40,0.98) 100%)',
          borderTop: '2px solid rgba(255,16,240,0.3)',
          boxShadow: '0 -4px 20px rgba(255,16,240,0.2)',
        }}>
          {NAV.map(n => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => onTab(n.id)}
                className="flex-1 flex flex-col items-center py-2.5 gap-1 transition-all duration-300 rounded-2xl"
                style={active ? {
                  color: 'white',
                  background: 'linear-gradient(135deg,#FF10F0 0%,#B66DFF 100%)',
                  boxShadow: '0 4px 16px rgba(255,16,240,0.5)',
                  border: '2px solid rgba(255,16,240,0.5)',
                } : { color:'#B8B8B8', background:'rgba(255,16,240,0.05)', border:'2px solid transparent' }}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2}/>
                <span className="text-xs font-bold tracking-tight">{n.label.toUpperCase()}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}