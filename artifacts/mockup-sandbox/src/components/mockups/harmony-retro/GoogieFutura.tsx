import React, { useState } from 'react';
import './_group.css';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  List, 
  CreditCard,
  Menu,
  Bell,
  X
} from 'lucide-react';

export function GoogieFutura() {
  const [activeTab, setActiveTab] = useState('Home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', icon: <Home size={20} /> },
    { name: 'Calendar', icon: <Calendar size={20} /> },
    { name: 'Chores', icon: <CheckSquare size={20} /> },
    { name: 'Lists', icon: <List size={20} /> },
    { name: 'Bills', icon: <CreditCard size={20} /> },
  ];

  return (
    <div className="flex h-screen w-full relative overflow-hidden" style={{ backgroundColor: '#0D3B3E', color: 'white', fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Non-blocking fonts included in _group.css via edit */}
      
      {/* Background Orbits */}
      <div className="atomic-orbit animate-spin-slow" style={{ width: '150vw', height: '150vw', top: '-75vw', left: '-25vw', borderColor: 'rgba(79, 195, 247, 0.1)', borderWidth: '2px' }}></div>
      <div className="atomic-orbit animate-spin-slow" style={{ width: '100vw', height: '100vw', top: '-50vw', left: '0vw', borderColor: 'rgba(233, 30, 140, 0.1)', borderWidth: '2px', animationDirection: 'reverse', animationDuration: '30s' }}></div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 h-full relative z-10 p-6" style={{ backgroundColor: '#1A4A4A', borderRight: '4px solid #F5C518' }}>
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-full flex items-center justify-center googie-amoeba" style={{ backgroundColor: '#E91E8C' }}>
            <div className="w-6 h-6 atomic-starburst" style={{ backgroundColor: '#F5C518' }}></div>
          </div>
          <h1 className="text-xl font-bold tracking-widest uppercase" style={{ fontFamily: "'Orbitron', sans-serif", color: '#F5C518' }}>Harmony</h1>
        </div>

        <nav className="flex-1 space-y-4">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className="flex items-center gap-4 w-full text-left p-3 transition-all relative group"
              style={{ 
                color: activeTab === item.name ? '#F5C518' : 'white',
                fontFamily: "'Orbitron', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
            >
              {activeTab === item.name && (
                <div className="absolute left-0 w-2 h-2 atomic-starburst" style={{ backgroundColor: '#E91E8C', marginLeft: '-12px' }}></div>
              )}
              <span className={activeTab === item.name ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}>
                {item.icon}
              </span>
              <span className={activeTab === item.name ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}>
                {item.name}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative z-10 p-6 md:p-10">
        
        {/* Mobile Header */}
        <header className="md:hidden flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center googie-amoeba" style={{ backgroundColor: '#E91E8C' }}>
               <div className="w-4 h-4 atomic-starburst" style={{ backgroundColor: '#F5C518' }}></div>
            </div>
            <h1 className="text-lg font-bold tracking-widest uppercase" style={{ fontFamily: "'Orbitron', sans-serif", color: '#F5C518' }}>Harmony</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-white">
            <Menu size={24} />
          </button>
        </header>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          <section className="relative p-8 googie-amoeba shadow-lg animate-pulse-glow" style={{ backgroundColor: 'rgba(26, 74, 74, 0.8)', backdropFilter: 'blur(10px)', border: '2px solid #E91E8C' }}>
            <div className="absolute top-0 right-0 w-32 h-32 opacity-20 atomic-starburst" style={{ backgroundColor: '#F5C518', transform: 'translate(20%, -20%)' }}></div>
            <h2 className="text-3xl md:text-5xl font-black mb-2" style={{ fontFamily: "'Orbitron', sans-serif", color: '#4FC3F7' }}>
              Welcome to tomorrow, Dad!
            </h2>
            <p className="text-lg opacity-80 mb-6" style={{ fontFamily: "'Orbitron', sans-serif" }}>Your family's orbit is clear and running smoothly.</p>
            <button className="px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm transition-transform hover:scale-105" style={{ backgroundColor: '#F5C518', color: '#0D3B3E', fontFamily: "'Orbitron', sans-serif" }}>
              Log New Event
            </button>
          </section>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Overdue Bills Alert */}
            <div className="googie-amoeba-2 p-6 lg:col-span-1 shadow-lg" style={{ backgroundColor: 'rgba(233, 30, 140, 0.15)', border: '2px solid #E91E8C', backdropFilter: 'blur(5px)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500 animate-pulse">
                  <Bell size={16} color="white" />
                </div>
                <h3 className="text-xl font-bold uppercase" style={{ fontFamily: "'Orbitron', sans-serif", color: '#E91E8C' }}>Alert</h3>
              </div>
              <p className="mb-2 text-white opacity-90 text-sm">Overdue Bill: Water Utility</p>
              <p className="text-2xl font-bold text-white mb-4">$84.50</p>
              <button className="w-full py-2 rounded-full text-sm font-bold uppercase tracking-wider" style={{ backgroundColor: '#E91E8C', color: 'white', fontFamily: "'Orbitron', sans-serif" }}>
                Pay Now
              </button>
            </div>

            {/* Upcoming Bills */}
            <div className="googie-amoeba p-6 lg:col-span-2 shadow-lg relative overflow-hidden" style={{ backgroundColor: 'rgba(26, 74, 74, 0.9)', border: '2px solid #4FC3F7' }}>
              <h3 className="text-xl font-bold uppercase mb-6" style={{ fontFamily: "'Orbitron', sans-serif", color: '#4FC3F7' }}>Upcoming Bills</h3>
              <div className="space-y-4">
                {[
                  { name: 'Internet (Comcast)', date: 'Oct 15', amount: '$110.00' },
                  { name: 'Electricity', date: 'Oct 18', amount: '$65.20' }
                ].map((bill, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-white/10">
                    <div>
                      <p className="font-bold">{bill.name}</p>
                      <p className="text-sm opacity-60">Due {bill.date}</p>
                    </div>
                    <p className="font-bold text-lg" style={{ color: '#F5C518' }}>{bill.amount}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Chores */}
            <div className="googie-amoeba-3 p-6 lg:col-span-1 shadow-lg" style={{ backgroundColor: 'rgba(26, 74, 74, 0.9)', border: '2px solid #F5C518' }}>
              <h3 className="text-xl font-bold uppercase mb-6" style={{ fontFamily: "'Orbitron', sans-serif", color: '#F5C518' }}>Chores</h3>
              <div className="space-y-3">
                {[
                  { name: 'Vacuum Living Room', assignee: 'Timmy' },
                  { name: 'Take out trash', assignee: 'Dad' },
                  { name: 'Dishes', assignee: 'Mom' }
                ].map((chore, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border-2 flex-shrink-0" style={{ borderColor: '#F5C518' }}></div>
                    <div className="flex-1">
                      <p className="text-sm">{chore.name}</p>
                      <p className="text-xs opacity-50" style={{ fontFamily: "'Orbitron', sans-serif" }}>[{chore.assignee}]</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="googie-amoeba-2 p-6 lg:col-span-2 shadow-lg" style={{ backgroundColor: 'rgba(26, 74, 74, 0.9)', border: '2px solid white' }}>
              <h3 className="text-xl font-bold uppercase mb-6" style={{ fontFamily: "'Orbitron', sans-serif", color: 'white' }}>Mission Log</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Timmy's Soccer Game", date: 'Saturday, 10:00 AM', loc: 'Moonbase Park' },
                  { title: "Dentist", date: 'Next Tuesday, 2:30 PM', loc: 'Sector 4 Clinic' }
                ].map((event, i) => (
                  <div key={i} className="p-4 rounded-xl border border-white/20 bg-white/5">
                    <p className="font-bold mb-1" style={{ color: '#4FC3F7' }}>{event.title}</p>
                    <p className="text-sm opacity-80 mb-1">{event.date}</p>
                    <p className="text-xs opacity-50 uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>{event.loc}</p>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex" style={{ backgroundColor: 'rgba(13, 59, 62, 0.95)' }}>
          <div className="w-full p-8 flex flex-col">
            <button onClick={() => setMobileMenuOpen(false)} className="self-end p-2 text-white mb-8">
              <X size={32} />
            </button>
            <nav className="flex flex-col space-y-6">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-4 text-2xl uppercase tracking-wider"
                  style={{ 
                    color: activeTab === item.name ? '#F5C518' : 'white',
                    fontFamily: "'Orbitron', sans-serif"
                  }}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
