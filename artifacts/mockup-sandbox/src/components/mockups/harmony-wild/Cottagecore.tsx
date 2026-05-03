import React, { useState } from "react";
import { Leaf, Calendar, CheckSquare, List as ListIcon, CreditCard, Home } from "lucide-react";

export function Cottagecore() {
  const [activeTab, setActiveTab] = useState("Home");

  const colors = {
    bg: "#F5EFE6",
    cardBg: "#F0E6D3",
    rose: "#D4849A",
    sage: "#8FAF8A",
    lavender: "#A89BC2",
    terracotta: "#C97B5A",
  };

  const navItems = [
    { name: "Home", icon: Home },
    { name: "Calendar", icon: Calendar },
    { name: "Chores", icon: CheckSquare },
    { name: "Lists", icon: ListIcon },
    { name: "Bills", icon: CreditCard },
  ];

  return (
    <div
      className="min-h-screen flex text-slate-800 relative overflow-hidden"
      style={{
        backgroundColor: colors.bg,
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap"
        rel="stylesheet"
      />

      {/* Decorative botanical element top right */}
      <div 
        className="absolute top-0 right-0 pointer-events-none opacity-40"
        style={{ width: "200px", height: "200px" }}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M100,0 Q120,40 180,60 Q130,80 150,150 Q100,100 80,180 Q60,110 0,100 Q60,80 70,20 Q100,40 100,0" fill={colors.sage} opacity="0.5"/>
          <circle cx="100" cy="100" r="15" fill={colors.rose} opacity="0.6"/>
        </svg>
      </div>

      {/* Sidebar */}
      <aside
        className="w-64 flex-shrink-0 p-6 flex flex-col border-r"
        style={{
          backgroundColor: colors.bg,
          borderColor: "rgba(143, 175, 138, 0.3)", // sage with opacity
        }}
      >
        <div className="mb-12 text-center">
          <h1
            className="text-3xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: colors.rose,
            }}
          >
            Harmony
          </h1>
          <p className="text-sm italic text-slate-500 mt-1">Our family journal</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300"
              style={{
                backgroundColor: activeTab === item.name ? "rgba(143, 175, 138, 0.15)" : "transparent",
                color: activeTab === item.name ? colors.sage : "inherit",
              }}
            >
              {activeTab === item.name ? (
                <Leaf size={18} style={{ color: colors.sage }} />
              ) : (
                <item.icon size={18} className="opacity-60" />
              )}
              <span
                className={activeTab === item.name ? "font-semibold" : ""}
                style={{
                  fontFamily: activeTab === item.name ? "'Playfair Display', serif" : "'Lato', sans-serif",
                  fontSize: activeTab === item.name ? "1.1rem" : "1rem",
                }}
              >
                {item.name}
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 text-center border-t border-dashed" style={{ borderColor: "rgba(212, 132, 154, 0.3)" }}>
          <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl font-serif" style={{ backgroundColor: colors.sage }}>
            R
          </div>
          <p className="font-serif">Rosie</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h2
            className="text-4xl mb-2"
            style={{ fontFamily: "'Playfair Display', serif", color: colors.terracotta }}
          >
            Good Morning, Rosie.
          </h2>
          <p className="text-lg italic text-slate-600">
            The garden is blooming, and here is what needs your attention today.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Overdue Bills Card */}
          <div
            className="p-6 relative rounded-[16px]"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.rose}`,
              boxShadow: `0 10px 20px -5px rgba(212, 132, 154, 0.2)`,
            }}
          >
            <h3
              className="text-xl mb-4 italic pb-2 border-b-2"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: colors.rose,
                borderBottomStyle: "dashed",
                borderColor: "rgba(212, 132, 154, 0.3)"
              }}
            >
              Overdue
            </h3>
            <ul className="space-y-4">
              <li className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span style={{ color: colors.rose }}>✿</span> Water Bill
                </span>
                <span
                  className="text-xl"
                  style={{ fontFamily: "'Playfair Display', serif", color: colors.terracotta }}
                >
                  $45.00
                </span>
              </li>
            </ul>
            <button
              className="mt-6 w-full py-2 rounded-full text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: colors.rose, boxShadow: "0 4px 10px rgba(212, 132, 154, 0.3)" }}
            >
              Settle Account
            </button>
          </div>

          {/* Upcoming Events Card */}
          <div
            className="p-6 relative rounded-[16px]"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.sage}`,
              boxShadow: `0 10px 20px -5px rgba(143, 175, 138, 0.2)`,
            }}
          >
            <h3
              className="text-xl mb-4 italic pb-2 border-b-2"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: colors.sage,
                borderBottomStyle: "dashed",
                borderColor: "rgba(143, 175, 138, 0.3)"
              }}
            >
              Upcoming Joy
            </h3>
            <ul className="space-y-4">
              <li className="flex flex-col">
                <span className="flex items-center gap-2 font-medium">
                  <span style={{ color: colors.sage }}>❀</span> Grandma's Birthday
                </span>
                <span className="text-sm text-slate-500 ml-6 italic">Tomorrow, 2:00 PM</span>
              </li>
              <li className="flex flex-col">
                <span className="flex items-center gap-2 font-medium">
                  <span style={{ color: colors.sage }}>❀</span> Farmers Market
                </span>
                <span className="text-sm text-slate-500 ml-6 italic">Saturday, 8:00 AM</span>
              </li>
            </ul>
          </div>

          {/* Chores Card */}
          <div
            className="p-6 relative rounded-[16px]"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.lavender}`,
              boxShadow: `0 10px 20px -5px rgba(168, 155, 194, 0.2)`,
            }}
          >
            <h3
              className="text-xl mb-4 italic pb-2 border-b-2"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: colors.lavender,
                borderBottomStyle: "dashed",
                borderColor: "rgba(168, 155, 194, 0.3)"
              }}
            >
              Daily Tending
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-2 appearance-none checked:bg-current transition-colors cursor-pointer"
                  style={{ borderColor: colors.lavender, color: colors.lavender }}
                  defaultChecked
                />
                <span className="line-through text-slate-400">Tend the garden</span>
              </li>
              <li className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-2 appearance-none transition-colors cursor-pointer"
                  style={{ borderColor: colors.lavender, color: colors.lavender }}
                />
                <span>Bake bread</span>
              </li>
              <li className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-2 appearance-none transition-colors cursor-pointer"
                  style={{ borderColor: colors.lavender, color: colors.lavender }}
                />
                <span>Feed the chickens</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
