import React, { useState } from 'react';
import './_wild.css';

export function NeonBrutV1() {
  const [activeTab, setActiveTab] = useState('HOME');
  const tabs = ['HOME', 'CALENDAR', 'CHORES', 'LISTS', 'BILLS'];

  return (
    <div className="neon-brutalism min-h-screen flex flex-col bg-white text-black overflow-hidden selection:bg-[#BFFF00]">

      {/* TOP BAR NAV — horizontal instead of sidebar */}
      <header className="border-b-4 border-black flex items-stretch">
        <div className="px-6 py-4 border-r-4 border-black flex items-center">
          <h1 className="text-xl font-display font-black uppercase tracking-tighter leading-none">
            HARMONY<br/>HUB
          </h1>
        </div>
        <nav className="flex flex-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-4 px-2 font-bold uppercase text-sm border-r-4 border-black last:border-r-0 transition-none"
              style={{
                background: activeTab === tab ? '#BFFF00' : 'white',
                borderColor: '#000',
              }}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="px-6 border-l-4 border-black flex items-center gap-3">
          <div className="w-9 h-9 border-2 border-black bg-[#BFFF00] flex items-center justify-center font-bold text-sm">A</div>
          <span className="font-bold uppercase text-sm">ALEX</span>
        </div>
      </header>

      {/* HERO BANNER — full width horizontal strip */}
      <div className="border-b-4 border-black px-8 py-6 flex items-baseline gap-6">
        <h2 className="text-6xl font-display font-black uppercase tracking-tighter leading-none whitespace-nowrap">
          GET TO WORK.
        </h2>
        <div className="flex-1 border-t-4 border-black mt-auto" style={{ marginBottom: '0.35rem' }}></div>
        <p className="text-sm font-bold uppercase border-l-4 border-black pl-4 max-w-xs leading-tight whitespace-nowrap">
          YOUR FAMILY IS<br/>DEPENDING ON YOU.
        </p>
      </div>

      {/* THREE-COLUMN CONTENT */}
      <div className="flex flex-1 min-h-0">

        {/* COL 1 — wide, bills focus */}
        <div className="flex-[3] border-r-4 border-black flex flex-col">
          <div className="bg-black text-white p-6 flex-1 relative">
            <div className="absolute top-0 right-0 bg-[#BFFF00] text-black border-l-4 border-b-4 border-black px-3 py-1 font-bold text-xs uppercase">URGENT</div>
            <p className="text-xs uppercase tracking-widest text-[#BFFF00] mb-4 font-bold">OVERDUE BILLS</p>
            <div className="text-6xl font-display font-black mb-2">$420.69</div>
            <div className="text-gray-400 text-sm mb-6">ELECTRICITY / 3 DAYS LATE</div>
            <button className="bg-[#BFFF00] text-black px-8 py-3 font-bold text-lg uppercase border-4 border-[#BFFF00] hover:bg-white hover:border-white w-full">
              PAY NOW
            </button>
          </div>
          <div className="border-t-4 border-black p-6 bg-white">
            <p className="text-xs uppercase tracking-widest font-bold mb-3">UPCOMING EVENTS</p>
            <div className="flex gap-4 items-start mb-4">
              <div className="border-4 border-black w-16 flex-shrink-0 text-center">
                <div className="bg-black text-white text-xs font-bold py-0.5">OCT</div>
                <div className="text-3xl font-display font-bold py-1 bg-[#BFFF00]">24</div>
              </div>
              <div>
                <div className="font-bold uppercase">DENTIST APPOINTMENT</div>
                <div className="text-sm border-l-2 border-black pl-2 mt-1">10:00 AM • DR. SMILE</div>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="border-4 border-black w-16 flex-shrink-0 text-center">
                <div className="bg-black text-white text-xs font-bold py-0.5">OCT</div>
                <div className="text-3xl font-display font-bold py-1">31</div>
              </div>
              <div>
                <div className="font-bold uppercase">HALLOWEEN PARTY</div>
                <div className="text-sm border-l-2 border-black pl-2 mt-1">8:00 PM • NEIGHBORHOOD</div>
              </div>
            </div>
          </div>
        </div>

        {/* COL 2 — chores */}
        <div className="flex-[2] border-r-4 border-black bg-[#BFFF00] flex flex-col">
          <div className="p-6 border-b-4 border-black">
            <p className="text-xs uppercase tracking-widest font-bold">PENDING CHORES</p>
          </div>
          <div className="flex-1 bg-white flex flex-col">
            {[
              { label: 'TAKE OUT THE TRASH', sub: 'BEFORE IT SMELLS', done: false },
              { label: 'FEED THE DOG', sub: 'DONE BY ALEX', done: true },
              { label: 'FIX THE SINK', sub: 'STOP PROCRASTINATING', done: false },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 border-b-4 border-black last:border-b-0"
                style={{ background: item.done ? '#000' : 'white', color: item.done ? 'white' : 'black' }}
              >
                <div className="w-5 h-5 border-2 flex-shrink-0 mt-1 flex items-center justify-center"
                  style={{ borderColor: item.done ? '#BFFF00' : '#000', background: item.done ? '#BFFF00' : 'transparent' }}>
                  {item.done && <div className="w-2.5 h-2.5 bg-black"></div>}
                </div>
                <div>
                  <div className={`font-bold uppercase text-base ${item.done ? 'line-through text-gray-500' : ''}`}>{item.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: item.done ? '#BFFF00' : '#666' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COL 3 — stats, narrow */}
        <div className="flex-[1] flex flex-col">
          {[
            { label: 'TASKS DONE', value: '14', dark: false },
            { label: 'BILLS DUE', value: '03', dark: true },
            { label: 'ALLOWANCE', value: '$50', dark: false },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex-1 p-5 border-b-4 border-black last:border-b-0 flex flex-col justify-between"
              style={{ background: stat.dark ? '#000' : 'white', color: stat.dark ? 'white' : 'black' }}
            >
              <p className="text-xs uppercase tracking-widest font-bold" style={{ color: stat.dark ? '#BFFF00' : 'black' }}>{stat.label}</p>
              <div className="text-5xl font-display font-black tracking-tighter">{stat.value}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
