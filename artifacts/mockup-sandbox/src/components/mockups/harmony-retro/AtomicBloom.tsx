import React from 'react';
import { Home, Calendar, CheckSquare, List, CreditCard, Bell, Plus, MoreHorizontal } from 'lucide-react';
import './_group.css';

export function AtomicBloom() {
  return (
    <div className="atomic-bloom flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r-2 border-dashed p-6 flex flex-col gap-8" style={{ borderColor: 'var(--accent-brown)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 atomic-starburst flex items-center justify-center" style={{ backgroundColor: 'var(--accent-orange)' }} />
          <h1 className="atomic-bloom-heading text-2xl" style={{ color: 'var(--accent-orange)' }}>Harmony</h1>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {[
            { icon: Home, label: 'Home', active: true },
            { icon: Calendar, label: 'Calendar', active: false },
            { icon: CheckSquare, label: 'Chores', active: false },
            { icon: List, label: 'Lists', active: false },
            { icon: CreditCard, label: 'Bills', active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`atomic-bloom-sidebar-item flex items-center gap-3 px-4 py-3 w-full text-left font-bold ${item.active ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t-2 border-dashed" style={{ borderColor: 'var(--accent-mustard)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center bg-white" style={{ borderColor: 'var(--accent-brown)' }}>
              <span className="atomic-bloom-heading text-lg" style={{ color: 'var(--accent-orange)' }}>M</span>
            </div>
            <div>
              <p className="font-bold">Mom</p>
              <p className="text-xs opacity-70">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h2 className="atomic-bloom-heading text-4xl mb-2" style={{ color: 'var(--accent-brown)' }}>Good Morning, Mom!</h2>
            <p className="opacity-80">It's a beautiful Thursday in the neighborhood.</p>
          </div>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ borderColor: 'var(--accent-brown)' }}>
              <Bell size={20} />
            </button>
            <button className="atomic-bloom-button px-6 py-2 flex items-center gap-2">
              <Plus size={20} />
              <span className="uppercase tracking-widest text-sm">Add New</span>
            </button>
          </div>
        </header>

        {/* Alert Card */}
        <div className="atomic-bloom-card mb-8 p-6 !border-red-500" style={{ boxShadow: '4px 4px 0px #ef4444' }}>
          <div className="atomic-bloom-card-content flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#ef4444' }}>
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="atomic-bloom-heading text-xl text-red-600">Overdue Bill!</h3>
                <p>The <strong>Electricity</strong> bill was due 2 days ago.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600 mb-1">$142.50</p>
              <button className="px-4 py-1 rounded-full text-sm font-bold border-2 border-red-500 text-red-600 hover:bg-red-50">
                Pay Now
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Upcoming Bills */}
          <section className="atomic-bloom-card p-6">
            <div className="atomic-bloom-card-content">
              <h3 className="uppercase tracking-[0.2em] font-bold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--accent-mustard)' }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-mustard)' }} />
                Upcoming Bills
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Netflix', due: 'Tomorrow', amount: '$15.99', color: 'var(--accent-orange)' },
                  { name: 'Water', due: 'In 3 days', amount: '$45.00', color: 'var(--accent-green)' },
                  { name: 'Internet', due: 'Next week', amount: '$89.99', color: 'var(--accent-brown)' },
                ].map((bill, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border-2 border-transparent hover:border-dashed hover:border-[var(--accent-brown)] transition-colors">
                    <div>
                      <p className="font-bold atomic-bloom-heading text-lg">{bill.name}</p>
                      <p className="text-xs opacity-70">Due: {bill.due}</p>
                    </div>
                    <p className="text-lg font-bold" style={{ color: bill.color }}>{bill.amount}</p>
                  </div>
                ))}
              </div>
              <div className="atomic-bloom-divider my-4" />
              <button className="w-full text-center text-sm font-bold uppercase tracking-widest hover:underline" style={{ color: 'var(--accent-orange)' }}>
                View All Bills
              </button>
            </div>
          </section>

          {/* Pending Chores */}
          <section className="atomic-bloom-card p-6" style={{ boxShadow: '4px 4px 0px var(--accent-green)' }}>
            <div className="atomic-bloom-card-content">
              <h3 className="uppercase tracking-[0.2em] font-bold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--accent-green)' }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-green)' }} />
                Pending Chores
              </h3>
              <div className="space-y-3">
                {[
                  { task: 'Fold Laundry', assignee: 'Timmy', status: 'pending' },
                  { task: 'Empty Dishwasher', assignee: 'Sarah', status: 'done' },
                  { task: 'Take out Trash', assignee: 'Dad', status: 'pending' },
                  { task: 'Vacuum Living Room', assignee: 'Mom', status: 'pending' },
                ].map((chore, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <button className={`w-6 h-6 rounded border-2 flex items-center justify-center ${chore.status === 'done' ? 'bg-[var(--accent-green)] border-[var(--accent-green)] text-white' : 'border-[var(--accent-brown)] hover:bg-black/5'}`}>
                      {chore.status === 'done' && <CheckSquare size={14} />}
                    </button>
                    <span className={`flex-1 ${chore.status === 'done' ? 'line-through opacity-50' : ''}`}>{chore.task}</span>
                    <span className="text-xs px-2 py-1 rounded-full border-2 border-dashed" style={{ borderColor: 'var(--accent-mustard)' }}>{chore.assignee}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="atomic-bloom-card p-6" style={{ boxShadow: '4px 4px 0px var(--accent-orange)' }}>
            <div className="atomic-bloom-card-content">
              <h3 className="uppercase tracking-[0.2em] font-bold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--accent-orange)' }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-orange)' }} />
                Upcoming Events
              </h3>
              
              <div className="relative border-l-2 border-dashed ml-3 pl-6 space-y-6" style={{ borderColor: 'var(--accent-mustard)' }}>
                {[
                  { time: '4:00 PM', title: 'Soccer Practice', desc: 'Timmy - Field 4' },
                  { time: '6:30 PM', title: 'Family Dinner', desc: 'Pizza Night!' },
                  { time: 'Tomorrow', title: 'Dentist Appt', desc: 'Sarah - Dr. Smith' },
                ].map((event, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-[var(--bg-cream)]" style={{ borderColor: 'var(--accent-orange)' }} />
                    <p className="text-xs font-bold mb-1" style={{ color: 'var(--accent-brown)' }}>{event.time}</p>
                    <p className="atomic-bloom-heading text-lg">{event.title}</p>
                    <p className="text-sm opacity-70">{event.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
