import React, { useState } from 'react';
import './_wild.css';

export function NeonBrutV2() {
  const [activeTab, setActiveTab] = useState('HOME');
  const tabs = ['HOME', 'CALENDAR', 'CHORES', 'LISTS', 'BILLS'];

  return (
    <div className="neon-brutalism min-h-screen flex flex-col bg-white text-black overflow-hidden selection:bg-[#BFFF00]">

      {/* STATUS TICKER — ultra-slim top strip */}
      <div className="bg-black text-[#BFFF00] flex items-center border-b-4 border-black">
        <div className="px-4 py-2 border-r-4 border-[#BFFF00] font-bold text-xs uppercase tracking-widest whitespace-nowrap">
          HARMONY HUB
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex gap-8 px-6 py-2 text-xs font-bold uppercase tracking-wide">
            <span>⚡ $420.69 OVERDUE</span>
            <span className="border-l border-[#BFFF00] pl-8">📅 DENTIST — OCT 24</span>
            <span className="border-l border-[#BFFF00] pl-8">✓ 14 TASKS DONE THIS WEEK</span>
            <span className="border-l border-[#BFFF00] pl-8">🏠 3 BILLS DUE</span>
          </div>
        </div>
        <div className="px-4 py-2 border-l-4 border-[#BFFF00] flex items-center gap-2">
          <div className="w-6 h-6 bg-[#BFFF00] text-black flex items-center justify-center font-bold text-xs">A</div>
          <span className="text-xs font-bold uppercase">ALEX</span>
        </div>
      </div>

      {/* NAVIGATION ROW */}
      <nav className="flex border-b-4 border-black">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-3 px-4 font-bold uppercase text-sm border-r-4 border-black last:border-r-0"
            style={{ background: activeTab === tab ? '#BFFF00' : 'white' }}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* COMMAND GRID — 4 equal panels top row */}
      <div className="grid grid-cols-4 border-b-4 border-black" style={{ borderColor: '#000' }}>
        {[
          { label: 'TASKS DONE', value: '14', bg: 'white' },
          { label: 'BILLS DUE', value: '03', bg: '#000', light: true },
          { label: 'CHORES PENDING', value: '02', bg: 'white' },
          { label: 'NEXT ALLOWANCE', value: '$50', bg: '#BFFF00' },
        ].map((s, i) => (
          <div
            key={i}
            className="p-5 border-r-4 border-black last:border-r-0 flex flex-col gap-2"
            style={{ background: s.bg, color: s.light ? 'white' : 'black', borderColor: '#000' }}
          >
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: s.light ? '#BFFF00' : 'black' }}>{s.label}</p>
            <div className="text-5xl font-display font-black tracking-tighter leading-none">{s.value}</div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT GRID — tight, equal-weight panels */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT BLOCK: overdue bills — 5 cols */}
        <div className="flex-[5] border-r-4 border-black flex flex-col">
          <div className="flex-1 bg-black text-white p-6 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs uppercase tracking-widest text-[#BFFF00] font-bold">OVERDUE BILLS</p>
                <span className="bg-[#BFFF00] text-black px-3 py-1 text-xs font-bold uppercase border-2 border-[#BFFF00]">URGENT</span>
              </div>
              <div className="text-7xl font-display font-black leading-none mb-2">$420.69</div>
              <div className="text-gray-400 text-sm border-l-4 border-gray-600 pl-3">ELECTRICITY / 3 DAYS LATE</div>
            </div>
            <button className="bg-[#BFFF00] text-black px-6 py-4 font-bold text-xl uppercase border-4 border-[#BFFF00] hover:bg-white hover:border-white w-full mt-6">
              PAY NOW
            </button>
          </div>

          {/* events below bills */}
          <div className="border-t-4 border-black p-6 bg-white">
            <p className="text-xs uppercase tracking-widest font-bold border-b-4 border-black pb-2 mb-4">UPCOMING EVENTS</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { month: 'OCT', day: '24', title: 'DENTIST APPT', time: '10:00 AM', lime: true },
                { month: 'OCT', day: '31', title: 'HALLOWEEN', time: '8:00 PM', lime: false },
              ].map((e, i) => (
                <div key={i} className="flex gap-3 items-start border-4 border-black p-3">
                  <div className="border-4 border-black w-12 flex-shrink-0 text-center">
                    <div className="bg-black text-white text-xs font-bold py-0.5">{e.month}</div>
                    <div className={`text-2xl font-display font-bold py-1 ${e.lime ? 'bg-[#BFFF00]' : ''}`}>{e.day}</div>
                  </div>
                  <div>
                    <div className="font-bold uppercase text-sm leading-tight">{e.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{e.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT BLOCK: chores — 3 cols */}
        <div className="flex-[3] bg-[#BFFF00] flex flex-col">
          <div className="p-4 border-b-4 border-black">
            <p className="text-xs uppercase tracking-widest font-bold">PENDING CHORES</p>
          </div>
          <div className="flex-1 flex flex-col bg-white">
            {[
              { label: 'TAKE OUT THE TRASH', sub: 'BEFORE IT SMELLS', done: false },
              { label: 'FEED THE DOG', sub: 'DONE BY ALEX', done: true },
              { label: 'FIX THE SINK', sub: 'STOP PROCRASTINATING', done: false },
            ].map((item, i) => (
              <div
                key={i}
                className="flex-1 flex items-start gap-4 p-5 border-b-4 border-black last:border-b-0"
                style={{ background: item.done ? '#000' : 'white', color: item.done ? 'white' : 'black' }}
              >
                <div className="w-5 h-5 border-2 flex-shrink-0 mt-1 flex items-center justify-center"
                  style={{ borderColor: item.done ? '#BFFF00' : '#000', background: item.done ? '#BFFF00' : 'transparent' }}>
                  {item.done && <div className="w-2.5 h-2.5 bg-black"></div>}
                </div>
                <div>
                  <div className={`font-bold uppercase ${item.done ? 'line-through text-gray-500' : ''}`}>{item.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: item.done ? '#BFFF00' : '#555' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
