import React from "react";
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  ListTodo, 
  CreditCard,
  Settings,
  Leaf,
  Sprout,
  Droplets,
  Bell
} from "lucide-react";
import "./_wild.css";

export function BentoGarden() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Serif+JP:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      <div className="wild-theme flex h-screen w-full subtle-grid">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-[#1A1A2E] flex flex-col z-10 relative">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-5 h-5 text-[#7CAF7A]" />
              <h1 className="font-serif text-xl tracking-wide">Harmony</h1>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[#8B8B8B]">Digital Garden</p>
          </div>

          <nav className="flex-1 mt-8 space-y-1">
            <a href="#" className="bento-nav-item active">
              <Home className="w-4 h-4 mr-3 opacity-70" />
              <span>Home</span>
            </a>
            <a href="#" className="bento-nav-item">
              <Calendar className="w-4 h-4 mr-3 opacity-70" />
              <span>Calendar</span>
            </a>
            <a href="#" className="bento-nav-item">
              <CheckSquare className="w-4 h-4 mr-3 opacity-70" />
              <span>Chores</span>
            </a>
            <a href="#" className="bento-nav-item">
              <ListTodo className="w-4 h-4 mr-3 opacity-70" />
              <span>Lists</span>
            </a>
            <a href="#" className="bento-nav-item">
              <CreditCard className="w-4 h-4 mr-3 opacity-70" />
              <span>Bills</span>
            </a>
          </nav>

          <div className="p-6 mt-auto">
            <a href="#" className="bento-nav-item px-2">
              <Settings className="w-4 h-4 mr-3 opacity-70" />
              <span>Settings</span>
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <header className="px-8 pt-8 pb-2 flex justify-between items-end">
              <div>
                <h2 className="font-serif text-3xl mb-1">Good morning, Yuki.</h2>
                <p className="text-[#8B8B8B] text-sm">Your garden is flourishing today.</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 border border-[#1A1A2E] rounded-full hover:bg-[#FAFAF8] transition-colors relative bg-white">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#E8A0BF] rounded-full"></span>
                </button>
                <div className="w-10 h-10 border border-[#1A1A2E] rounded-full overflow-hidden bg-[#FAFAF8] flex items-center justify-center">
                  <span className="font-serif text-[#1A1A2E]">Y</span>
                </div>
              </div>
            </header>

            <div className="bento-grid">
              
              {/* Hero / Overview - 2 cols wide */}
              <div className="bento-box bento-col-span-2 p-6 flex flex-col justify-between">
                <div className="petal top-4 right-8"></div>
                <div className="petal bottom-8 left-12 rotate-45"></div>
                
                <span className="bento-label">Daily Focus</span>
                <div className="mt-2">
                  <h3 className="font-serif text-2xl mb-4 leading-tight">Water the indoor plants<br/>and review upcoming bills.</h3>
                  <div className="flex gap-3">
                    <button className="btn-pill">Start Chores</button>
                    <button className="text-xs link-underline">View Calendar</button>
                  </div>
                </div>
              </div>

              {/* Weather / Vibe - 1 col */}
              <div className="bento-box p-6 flex flex-col items-center justify-center text-center">
                <span className="bento-label absolute top-4 left-4">Vibe</span>
                <div className="mt-4">
                  <Sprout className="w-8 h-8 mx-auto text-[#7CAF7A] mb-3" />
                  <div className="font-serif text-xl">Peaceful</div>
                  <div className="text-xs text-[#8B8B8B] mt-1">24°C • Clear</div>
                </div>
              </div>

              {/* Overdue Bills - 1 col, tall */}
              <div className="bento-box bento-row-span-2 p-6 bg-[#FAFAF8]">
                <span className="bento-label">Attention</span>
                <div className="mt-6 flex flex-col gap-6">
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="font-serif text-2xl text-[#1A1A2E]">$120</div>
                      <div className="text-[10px] bg-[#E8A0BF] bg-opacity-20 text-[#1A1A2E] px-2 py-0.5 rounded-full uppercase tracking-wider">Overdue</div>
                    </div>
                    <div className="text-sm font-medium">Electricity Bill</div>
                    <div className="text-xs text-[#8B8B8B]">Due 2 days ago</div>
                    <button className="text-xs link-underline mt-3">Pay Now</button>
                  </div>
                  
                  <div className="w-full h-px bg-[#1A1A2E] opacity-10"></div>
                  
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="font-serif text-2xl text-[#1A1A2E]">$45</div>
                    </div>
                    <div className="text-sm font-medium">Water Bill</div>
                    <div className="text-xs text-[#8B8B8B]">Due tomorrow</div>
                  </div>
                </div>
              </div>

              {/* Chores - 2 cols wide */}
              <div className="bento-box bento-col-span-2 p-6">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="bento-label mb-0">Pending Chores</span>
                  <button className="text-xs link-underline">See all</button>
                </div>
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-3 group">
                    <div className="w-4 h-4 border border-[#1A1A2E] flex-shrink-0 cursor-pointer group-hover:bg-[#FAFAF8] transition-colors"></div>
                    <span className="text-sm">Water plants (Living Room)</span>
                    <Droplets className="w-3 h-3 text-[#7CAF7A] ml-auto opacity-70" />
                  </div>
                  <div className="w-full h-px bg-[#1A1A2E] opacity-5"></div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-4 h-4 border border-[#1A1A2E] flex-shrink-0 cursor-pointer group-hover:bg-[#FAFAF8] transition-colors"></div>
                    <span className="text-sm">Take out recycling</span>
                  </div>
                  <div className="w-full h-px bg-[#1A1A2E] opacity-5"></div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-4 h-4 border border-[#1A1A2E] flex-shrink-0 cursor-pointer group-hover:bg-[#FAFAF8] transition-colors"></div>
                    <span className="text-sm">Clean kitchen counters</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Events - 1 col */}
              <div className="bento-box p-6">
                <span className="bento-label">Events</span>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-xs text-[#E8A0BF] font-medium mb-1">Today, 2 PM</div>
                    <div className="text-sm font-serif">Cherry blossom viewing</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#8B8B8B] mb-1">Tomorrow, 10 AM</div>
                    <div className="text-sm font-serif">Grocery run</div>
                  </div>
                </div>
              </div>

              {/* Progress - 3 cols wide */}
              <div className="bento-box bento-col-span-3 p-6 flex items-center justify-between">
                <div>
                  <span className="bento-label">Weekly Progress</span>
                  <div className="font-serif text-lg">You've completed 12 tasks this week.</div>
                </div>
                <div className="flex gap-1 items-end h-12">
                  <div className="w-4 h-6 bg-[#1A1A2E] opacity-20"></div>
                  <div className="w-4 h-8 bg-[#1A1A2E] opacity-20"></div>
                  <div className="w-4 h-4 bg-[#1A1A2E] opacity-20"></div>
                  <div className="w-4 h-10 bg-[#7CAF7A]"></div>
                  <div className="w-4 h-3 bg-[#1A1A2E] opacity-10"></div>
                  <div className="w-4 h-2 bg-[#1A1A2E] opacity-10"></div>
                  <div className="w-4 h-2 bg-[#1A1A2E] opacity-10"></div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}
