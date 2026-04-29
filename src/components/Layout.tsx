import type { ReactNode } from 'react';
import { Home, Calendar, CheckSquare, List, Receipt, LogOut, Settings } from 'lucide-react';
import type { FamilyMember } from '../types';

type Tab = 'home' | 'bills' | 'chores' | 'events' | 'lists';

const NAV = [
  { id: 'home' as Tab, label: 'Home', icon: Home },
  { id: 'events' as Tab, label: 'Calendar', icon: Calendar },
  { id: 'chores' as Tab, label: 'Chores', icon: CheckSquare },
  { id: 'lists' as Tab, label: 'Lists', icon: List },
  { id: 'bills' as Tab, label: 'Bills', icon: Receipt },
];

const GOOGLE_LINKS = [
  { label: 'Google Calendar', url: 'https://calendar.google.com', emoji: '📅', bg: '#E8F0FE', color: '#4285F4' },
  { label: 'Gmail', url: 'https://mail.google.com', emoji: '✉️', bg: '#FCE8E6', color: '#EA4335' },
  { label: 'Google Photos', url: 'https://photos.google.com', emoji: '🖼️', bg: '#E6F4EA', color: '#34A853' },
  { label: 'Google Drive', url: 'https://drive.google.com', emoji: '💾', bg: '#FEF3E2', color: '#FBBC04' },
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
    <div className="flex min-h-screen" style={{ background: '#F8F7FC' }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 shadow-sm sticky top-0 h-screen z-20">
        {/* Brand */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shadow-sm" style={{ background: 'linear-gradient(135deg, #E07092, #8B6FD4)' }}>🏠</div>
            <div>
              <p className="font-bold text-gray-800 text-sm leading-tight">Family Hub</p>
              <p className="text-xs text-gray-400 leading-tight">Our Command Center</p>
            </div>
          </div>
        </div>

        {/* Active user */}
        <div className="px-4 py-3 border-b border-gray-50">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl" style={{ background: user.bgColor + '55' }}>
            <span className="text-xl">{user.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
              <p className="text-xs capitalize" style={{ color: user.color }}>{user.role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV.map(n => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => onTab(n.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`} style={active ? { background: user.bgColor, color: user.color } : {}}>
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                {n.label}
              </button>
            );
          })}
        </nav>

        {/* Google links */}
        <div className="px-4 pb-3 border-t border-gray-50 pt-3">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide px-1 mb-2">Quick Links</p>
          <div className="grid grid-cols-2 gap-1.5">
            {GOOGLE_LINKS.map(g => (
              <a key={g.url} href={g.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity" style={{ background: g.bg, color: g.color }}>
                <span className="text-sm">{g.emoji}</span>
                <span className="truncate">{g.label.split(' ')[1]}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 pb-4 space-y-0.5">
          <button onClick={onManageProfiles} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
            <Settings size={15}/> Manage Profiles
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-colors">
            <LogOut size={15}/> Switch User
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏠</span>
            <div>
              <p className="font-bold text-gray-800 text-sm leading-none">Family Hub</p>
              <p className="text-xs text-gray-400">Our Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: user.bgColor }}>{user.emoji}</div>
            <button onClick={onLogout} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><LogOut size={16}/></button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          {/* Google links bar - mobile only */}
          <div className="md:hidden flex gap-2 mb-4 overflow-x-auto pb-1">
            {GOOGLE_LINKS.map(g => (
              <a key={g.url} href={g.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0" style={{ background: g.bg, color: g.color }}>
                <span>{g.emoji}</span> {g.label.split(' ')[1] || g.label}
              </a>
            ))}
          </div>
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-20 shadow-lg">
          {NAV.map(n => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => onTab(n.id)} className="flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors" style={active ? { color: user.color } : { color: '#9CA3AF' }}>
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8}/>
                <span className="text-xs font-medium">{n.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
