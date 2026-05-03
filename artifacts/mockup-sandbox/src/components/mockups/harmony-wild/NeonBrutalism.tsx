import React, { useState } from 'react';
import './_wild.css';

const Navigation = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const tabs = ['HOME', 'CALENDAR', 'CHORES', 'LISTS', 'BILLS'];
  
  return (
    <nav className="w-64 border-r-4 border-black bg-white flex flex-col h-full" style={{ borderColor: 'var(--ink-black)' }}>
      <div className="p-6 border-b-4 border-black" style={{ borderColor: 'var(--ink-black)' }}>
        <h1 className="text-3xl font-display uppercase font-black tracking-tighter" style={{ lineHeight: '0.9' }}>
          HARMONY<br/>HUB
        </h1>
      </div>
      
      <div className="flex-1 flex flex-col pt-8">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              w-full text-left py-4 px-6 uppercase font-bold text-xl border-l-8 border-transparent transition-none
              ${activeTab === tab 
                ? 'bg-[#BFFF00] text-black border-l-black border-y-4 border-y-black border-l-8' 
                : 'hover:bg-gray-100 text-black border-y-4 border-transparent hover:border-y-black'
              }
            `}
            style={{ 
              borderRadius: 0,
              borderLeftColor: activeTab === tab ? '#000000' : 'transparent',
              borderTopColor: activeTab === tab ? '#000000' : 'transparent',
              borderBottomColor: activeTab === tab ? '#000000' : 'transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="p-6 border-t-4 border-black mt-auto" style={{ borderColor: 'var(--ink-black)' }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-black bg-[#BFFF00] flex items-center justify-center font-bold text-xl">
            A
          </div>
          <div className="font-bold uppercase">ALEX</div>
        </div>
      </div>
    </nav>
  );
};

export function NeonBrutalism() {
  const [activeTab, setActiveTab] = useState('HOME');

  return (
    <div className="neon-brutalism min-h-screen flex w-full h-full bg-white text-black overflow-hidden selection:bg-[#BFFF00] selection:text-black">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 lg:p-12">
        <header className="mb-12 border-b-4 border-black pb-8">
          <h2 className="text-7xl lg:text-8xl xl:text-9xl font-display font-black tracking-tighter leading-none uppercase">
            GET TO<br/>
            <span className="bg-[#BFFF00] px-4 -ml-4 border-4 border-black inline-block transform -rotate-2 mt-2">WORK.</span>
          </h2>
          <p className="mt-8 text-xl font-bold max-w-2xl border-l-4 border-black pl-4 py-2">
            YOUR FAMILY IS DEPENDING ON YOU. DON'T MESS THIS UP.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 auto-rows-min">
          
          {/* Overdue Bills - High Priority */}
          <div className="lg:col-span-8 border-4 border-black bg-black text-white p-6 relative">
            <div className="absolute top-0 right-0 bg-[#BFFF00] text-black border-l-4 border-b-4 border-black px-4 py-1 font-bold text-sm uppercase">
              URGENT
            </div>
            <h3 className="text-sm uppercase tracking-widest text-[#BFFF00] mb-8 font-bold">OVERDUE BILLS</h3>
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-t-2 border-dashed border-gray-600 pt-8 mt-4">
              <div>
                <div className="text-5xl lg:text-7xl font-bold font-display">$420.69</div>
                <div className="text-gray-400 mt-2 text-lg">ELECTRICITY / 3 DAYS LATE</div>
              </div>
              <button className="bg-[#BFFF00] text-black border-4 border-[#BFFF00] hover:bg-white hover:border-white px-8 py-4 font-bold text-xl uppercase whitespace-nowrap">
                PAY NOW
              </button>
            </div>
          </div>

          {/* Pending Chores */}
          <div className="lg:col-span-4 border-4 border-black bg-[#BFFF00] p-6 flex flex-col">
            <h3 className="text-sm uppercase tracking-widest text-black mb-6 font-bold border-b-4 border-black pb-2">PENDING CHORES</h3>
            
            <div className="flex-1 flex flex-col gap-0 border-4 border-black bg-white">
              <div className="p-4 border-b-4 border-black flex items-start gap-4 hover:bg-black hover:text-[#BFFF00] group cursor-pointer">
                <div className="w-6 h-6 border-2 border-black group-hover:border-[#BFFF00] flex-shrink-0 mt-1"></div>
                <div>
                  <div className="font-bold text-lg uppercase">TAKE OUT THE TRASH</div>
                  <div className="text-sm group-hover:text-gray-300">BEFORE IT SMELLS</div>
                </div>
              </div>
              <div className="p-4 border-b-4 border-black flex items-start gap-4 bg-black text-white">
                <div className="w-6 h-6 border-2 border-white bg-[#BFFF00] flex-shrink-0 mt-1 flex items-center justify-center">
                  <div className="w-3 h-3 bg-black"></div>
                </div>
                <div>
                  <div className="font-bold text-lg uppercase line-through text-gray-500">FEED THE DOG</div>
                  <div className="text-sm text-[#BFFF00]">DONE BY ALEX</div>
                </div>
              </div>
              <div className="p-4 flex items-start gap-4 hover:bg-black hover:text-[#BFFF00] group cursor-pointer">
                <div className="w-6 h-6 border-2 border-black group-hover:border-[#BFFF00] flex-shrink-0 mt-1"></div>
                <div>
                  <div className="font-bold text-lg uppercase">FIX THE SINK</div>
                  <div className="text-sm group-hover:text-gray-300">STOP PROCRASTINATING</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="lg:col-span-6 border-4 border-black bg-white p-6">
            <h3 className="text-sm uppercase tracking-widest text-black mb-6 font-bold border-b-4 border-black pb-2">UPCOMING EVENTS</h3>
            
            <div className="space-y-6">
              <div className="flex gap-6 items-start">
                <div className="text-center border-4 border-black w-24 flex-shrink-0">
                  <div className="bg-black text-white font-bold text-sm py-1">OCT</div>
                  <div className="text-4xl font-display font-bold py-2 bg-[#BFFF00]">24</div>
                </div>
                <div>
                  <h4 className="text-2xl font-bold uppercase font-display">DENTIST APPOINTMENT</h4>
                  <p className="text-lg border-l-2 border-black pl-3 mt-2">10:00 AM • DR. SMILE</p>
                </div>
              </div>
              
              <div className="flex gap-6 items-start">
                <div className="text-center border-4 border-black w-24 flex-shrink-0">
                  <div className="bg-black text-white font-bold text-sm py-1">OCT</div>
                  <div className="text-4xl font-display font-bold py-2">31</div>
                </div>
                <div>
                  <h4 className="text-2xl font-bold uppercase font-display">HALLOWEEN PARTY</h4>
                  <p className="text-lg border-l-2 border-black pl-3 mt-2">8:00 PM • NEIGHBORHOOD</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-6 border-4 border-black grid grid-cols-2">
            <div className="p-6 border-r-4 border-b-4 border-black flex flex-col justify-between hover:bg-[#BFFF00] transition-colors">
              <h3 className="text-sm uppercase tracking-widest font-bold mb-4">TASKS DONE</h3>
              <div className="text-7xl font-display font-black tracking-tighter">14</div>
            </div>
            <div className="p-6 border-b-4 border-black flex flex-col justify-between bg-black text-white">
              <h3 className="text-sm uppercase tracking-widest font-bold mb-4 text-[#BFFF00]">BILLS DUE</h3>
              <div className="text-7xl font-display font-black tracking-tighter">03</div>
            </div>
            <div className="col-span-2 p-6 flex flex-col justify-between hover:bg-gray-100">
              <h3 className="text-sm uppercase tracking-widest font-bold mb-4">NEXT ALLOWANCE</h3>
              <div className="flex items-end gap-4">
                <div className="text-6xl font-display font-black tracking-tighter">$50</div>
                <div className="text-xl font-bold pb-2">IN 2 DAYS</div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
