import React, { useState } from 'react';
import './_wild.css';

export function NeonBrutV3() {
  const [activeTab, setActiveTab] = useState('HOME');
  const tabs = ['HOME', 'CALENDAR', 'CHORES', 'LISTS', 'BILLS'];

  return (
    <div className="neon-brutalism min-h-screen flex flex-col bg-white text-black overflow-hidden selection:bg-[#BFFF00]">

      {/* MASTHEAD — newspaper-style full-width header */}
      <div className="border-b-8 border-black px-6 py-4 flex items-center gap-0">
        <div className="flex-1 border-r-4 border-black pr-6">
          <div className="text-3xl font-display font-black uppercase tracking-tighter leading-none">HARMONY HUB</div>
          <div className="text-xs font-bold uppercase tracking-widest mt-0.5 text-gray-500">FAMILY COMMAND CENTER — DAILY EDITION</div>
        </div>
        <nav className="flex gap-0 mx-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-3 py-1 font-bold uppercase text-xs border-r-2 border-black last:border-r-0"
              style={{ background: activeTab === tab ? '#BFFF00' : 'transparent' }}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="border-l-4 border-black pl-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#BFFF00] border-2 border-black flex items-center justify-center font-bold text-sm">A</div>
          <span className="font-bold uppercase text-sm">ALEX</span>
        </div>
      </div>

      {/* HEADLINE BAND — full bleed, like a newspaper lede */}
      <div className="border-b-4 border-black bg-black text-white px-6 py-3 flex items-center gap-6">
        <span className="bg-[#BFFF00] text-black px-3 py-1 text-xs font-bold uppercase border-2 border-[#BFFF00] flex-shrink-0">URGENT</span>
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter leading-none flex-1">
          $420.69 OVERDUE — ELECTRICITY BILL 3 DAYS LATE. DON'T MESS THIS UP.
        </h2>
        <button className="bg-[#BFFF00] text-black px-6 py-2 font-bold uppercase text-sm border-4 border-[#BFFF00] hover:bg-white hover:border-white flex-shrink-0">
          PAY NOW
        </button>
      </div>

      {/* NEWSPAPER COLUMNS */}
      <div className="flex flex-1 min-h-0">

        {/* FAT LEFT COLUMN — primary story */}
        <div className="flex-[4] border-r-4 border-black flex flex-col p-6 gap-6">

          {/* Big headline */}
          <div className="border-b-4 border-black pb-5">
            <h3 className="text-8xl font-display font-black uppercase tracking-tighter leading-none">
              GET<br/>TO<br/>
              <span className="bg-[#BFFF00] px-3 border-4 border-black inline-block">WORK.</span>
            </h3>
            <p className="text-sm font-bold border-l-4 border-black pl-3 mt-4 leading-tight uppercase">
              YOUR FAMILY IS DEPENDING ON YOU.
            </p>
          </div>

          {/* Quick stats row within fat column */}
          <div className="grid grid-cols-3 border-4 border-black">
            {[
              { label: 'TASKS DONE', value: '14', bg: '#BFFF00' },
              { label: 'BILLS DUE', value: '03', bg: '#000', light: true },
              { label: 'ALLOWANCE', value: '$50', bg: 'white' },
            ].map((s, i) => (
              <div
                key={i}
                className="p-4 border-r-4 border-black last:border-r-0 flex flex-col"
                style={{ background: s.bg, color: s.light ? 'white' : 'black', borderColor: '#000' }}
              >
                <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: s.light ? '#BFFF00' : 'black' }}>{s.label}</p>
                <div className="text-4xl font-display font-black leading-none">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Events — below stats */}
          <div>
            <p className="text-xs uppercase tracking-widest font-bold border-b-4 border-black pb-2 mb-4">UPCOMING EVENTS</p>
            <div className="space-y-4">
              {[
                { month: 'OCT', day: '24', title: 'DENTIST APPOINTMENT', time: '10:00 AM • DR. SMILE', lime: true },
                { month: 'OCT', day: '31', title: 'HALLOWEEN PARTY', time: '8:00 PM • NEIGHBORHOOD', lime: false },
              ].map((e, i) => (
                <div key={i} className="flex gap-4 items-start border-b-2 border-black pb-4 last:border-b-0 last:pb-0">
                  <div className="border-4 border-black flex-shrink-0 w-14 text-center">
                    <div className="bg-black text-white text-xs font-bold py-0.5">{e.month}</div>
                    <div className={`text-2xl font-display font-bold py-1 ${e.lime ? 'bg-[#BFFF00]' : ''}`}>{e.day}</div>
                  </div>
                  <div>
                    <div className="font-bold uppercase leading-tight">{e.title}</div>
                    <div className="text-xs text-gray-600 mt-1 border-l-2 border-black pl-2">{e.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* THIN RIGHT COLUMNS — secondary matter */}
        <div className="flex-[3] flex flex-col">

          {/* Chores column — full height right side */}
          <div className="flex-1 flex flex-col">
            <div className="bg-[#BFFF00] border-b-4 border-black px-5 py-3">
              <p className="text-xs uppercase tracking-widest font-bold">PENDING CHORES</p>
            </div>
            <div className="flex-1 flex flex-col">
              {[
                { label: 'TAKE OUT THE TRASH', sub: 'BEFORE IT SMELLS', done: false },
                { label: 'FEED THE DOG', sub: 'DONE BY ALEX', done: true },
                { label: 'FIX THE SINK', sub: 'STOP PROCRASTINATING', done: false },
              ].map((item, i, arr) => (
                <div
                  key={i}
                  className="flex-1 flex items-start gap-4 px-5 py-4"
                  style={{
                    background: item.done ? '#000' : (i % 2 === 0 ? 'white' : '#f5f5f5'),
                    color: item.done ? 'white' : 'black',
                    borderBottom: i < arr.length - 1 ? '4px solid #000' : 'none',
                  }}
                >
                  <div
                    className="w-5 h-5 border-2 flex-shrink-0 mt-1 flex items-center justify-center"
                    style={{ borderColor: item.done ? '#BFFF00' : '#000', background: item.done ? '#BFFF00' : 'transparent' }}
                  >
                    {item.done && <div className="w-2.5 h-2.5 bg-black"></div>}
                  </div>
                  <div>
                    <div className={`font-bold uppercase text-sm leading-tight ${item.done ? 'line-through text-gray-500' : ''}`}>
                      {item.label}
                    </div>
                    <div className="text-xs mt-1" style={{ color: item.done ? '#BFFF00' : '#777' }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer byline */}
          <div className="border-t-4 border-black px-5 py-3 bg-black text-[#BFFF00] flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-widest">DON'T MESS THIS UP.</span>
            <span className="text-xs font-bold uppercase">3 BILLS DUE</span>
          </div>

        </div>
      </div>
    </div>
  );
}
