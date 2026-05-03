import React, { useState } from 'react';
import { Home, Calendar, CheckSquare, List, DollarSign, Bell, User, Plus, Search, ChevronRight } from 'lucide-react';

// Theme Colors
const theme = {
  bg: '#F5EDD6',
  bgCard: '#EDE0C4',
  gold: '#C89B3C',
  green: '#7B8B3E',
  sienna: '#B55A30',
  brown: '#5C3317',
  tan: '#D4A96A',
  white: '#FFFAF0',
};

// Sample Data
const upcomingEvents = [
  { id: 1, title: 'Disco Night at The Roller Rink', date: 'Fri, 8:00 PM', person: 'Everyone' },
  { id: 2, title: 'Fondue Party', date: 'Sat, 6:30 PM', person: 'Grandma Rose' },
];

const pendingChores = [
  { id: 1, title: 'Vacuum the Shag Carpet', assignee: 'Timmy', due: 'Today' },
  { id: 2, title: 'Water the Ferns', assignee: 'Jane', due: 'Tomorrow' },
];

const bills = [
  { id: 1, name: 'Record Club Subscription', amount: '$12.50', due: 'Overdue', urgent: true },
  { id: 2, name: 'Electric Bill', amount: '$45.00', due: 'In 3 days', urgent: false },
];

export function GroovyLounge() {
  const [activeNav, setActiveNav] = useState('Home');

  return (
    <div 
      className="flex h-screen w-full overflow-hidden"
      style={{ 
        backgroundColor: theme.bg,
        fontFamily: "'Courier Prime', monospace",
        color: theme.brown
      }}
    >
      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />

      {/* Decorative Blob Background */}
      <div 
        className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div 
          className="absolute rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]"
          style={{ 
            width: '60vw', 
            height: '60vw', 
            backgroundColor: theme.tan, 
            top: '-10vw', 
            right: '-10vw',
            filter: 'blur(40px)'
          }}
        />
        <div 
          className="absolute rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%]"
          style={{ 
            width: '40vw', 
            height: '40vw', 
            backgroundColor: theme.gold, 
            bottom: '-5vw', 
            left: '15vw',
            filter: 'blur(40px)'
          }}
        />
      </div>

      {/* Sidebar */}
      <aside 
        className="w-64 flex-shrink-0 flex flex-col relative z-10"
        style={{ backgroundColor: theme.brown, color: theme.white }}
      >
        <div className="p-6 flex items-center gap-3">
          <div 
            className="w-10 h-10 flex items-center justify-center rounded-full"
            style={{ backgroundColor: theme.gold, color: theme.brown }}
          >
            <Home size={24} />
          </div>
          <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: '1.5rem', color: theme.gold, lineHeight: 1.2 }}>
            Harmony Hub
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          {[
            { id: 'Home', icon: Home },
            { id: 'Calendar', icon: Calendar },
            { id: 'Chores', icon: CheckSquare },
            { id: 'Lists', icon: List },
            { id: 'Bills', icon: DollarSign },
          ].map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className="flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 relative group overflow-hidden"
                style={{
                  backgroundColor: isActive ? theme.gold : 'transparent',
                  color: isActive ? theme.brown : theme.bg,
                  borderRadius: '9999px',
                  fontWeight: isActive ? 'bold' : 'normal',
                }}
              >
                {!isActive && (
                  <div 
                    className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"
                    style={{ backgroundColor: 'rgba(200, 155, 60, 0.2)', borderRadius: '9999px' }}
                  />
                )}
                <item.icon size={20} className="relative z-10" />
                <span className="relative z-10 text-lg tracking-wider uppercase">{item.id}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-6">
          <div 
            className="rounded-3xl p-4 flex items-center gap-3"
            style={{ backgroundColor: theme.sienna, color: theme.white }}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <div className="text-sm font-bold opacity-80 uppercase tracking-widest">Logged in</div>
              <div className="font-bold">Grandma Rose</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 p-8 flex flex-col gap-8">
        
        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h2 
              className="text-5xl mb-2"
              style={{ fontFamily: "'Alfa Slab One', serif", color: theme.sienna }}
            >
              Right On, Rose!
            </h2>
            <p className="text-xl opacity-80" style={{ color: theme.brown }}>
              Today is Thursday, October 12, 1974. Keep on truckin'.
            </p>
          </div>
          
          <div className="flex gap-4">
            <button 
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: theme.gold, color: theme.brown }}
            >
              <Search size={20} />
            </button>
            <button 
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 relative"
              style={{ backgroundColor: theme.sienna, color: theme.white }}
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-3 h-3 rounded-full" style={{ backgroundColor: theme.green }} />
            </button>
          </div>
        </header>

        {/* Urgent Alerts */}
        <div 
          className="rounded-[2rem] p-6 shadow-xl relative overflow-hidden"
          style={{ 
            backgroundColor: theme.bgCard,
            borderLeft: `12px solid ${theme.sienna}`,
            border: `2px solid ${theme.brown}`
          }}
        >
          <div 
            className="absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-multiply opacity-20 pointer-events-none"
            style={{ backgroundColor: theme.sienna, transform: 'translate(30%, -30%)' }}
          />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-inner"
                style={{ backgroundColor: theme.sienna, color: theme.white }}
              >
                <DollarSign size={32} />
              </div>
              <div>
                <h3 className="text-2xl mb-1 uppercase font-bold tracking-widest" style={{ color: theme.sienna }}>Bummer!</h3>
                <p className="text-lg font-bold">The Record Club Subscription is overdue ($12.50).</p>
              </div>
            </div>
            <button 
              className="px-8 py-3 rounded-full font-bold uppercase tracking-widest shadow-lg transition-transform hover:-translate-y-1"
              style={{ backgroundColor: theme.green, color: theme.white, border: `2px solid ${theme.brown}` }}
            >
              Pay Now
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upcoming Events */}
          <section>
            <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: `4px solid ${theme.gold}` }}>
              <h3 className="text-3xl" style={{ fontFamily: "'Alfa Slab One', serif", color: theme.brown }}>What's Happening</h3>
              <button 
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ backgroundColor: theme.gold, color: theme.brown }}
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              {upcomingEvents.map((event) => (
                <div 
                  key={event.id}
                  className="rounded-2xl p-5 shadow-md flex items-center justify-between group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl"
                  style={{ backgroundColor: theme.white, borderLeft: `8px solid ${theme.gold}` }}
                >
                  <div>
                    <div className="font-bold text-lg mb-1">{event.title}</div>
                    <div className="text-sm opacity-70 flex items-center gap-2">
                      <Calendar size={14} /> {event.date} • <User size={14} /> {event.person}
                    </div>
                  </div>
                  <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: theme.gold }} />
                </div>
              ))}
            </div>
          </section>

          {/* Pending Chores */}
          <section>
            <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: `4px solid ${theme.green}` }}>
              <h3 className="text-3xl" style={{ fontFamily: "'Alfa Slab One', serif", color: theme.brown }}>Chores to Dig</h3>
              <button 
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ backgroundColor: theme.green, color: theme.white }}
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              {pendingChores.map((chore) => (
                <div 
                  key={chore.id}
                  className="rounded-2xl p-5 shadow-md flex items-center gap-4 group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl"
                  style={{ backgroundColor: theme.white, borderLeft: `8px solid ${theme.green}` }}
                >
                  <div 
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: theme.green }}
                  >
                    <div className="w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: theme.green }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-1">{chore.title}</div>
                    <div className="text-sm opacity-70 flex items-center gap-2 uppercase tracking-wider">
                      {chore.assignee} • {chore.due}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
