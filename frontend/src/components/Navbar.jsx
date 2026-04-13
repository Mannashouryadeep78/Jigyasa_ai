import React, { useState } from 'react';
import { Home, BarChart2, LogOut, Menu, X, Clock, LayoutGrid, ShieldCheck, LifeBuoy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ activeView, onViewChange }) {
  const { signOut, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'list', label: 'History', icon: <Clock className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'prep', label: 'Prep Matrix', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'checker', label: 'ATS Checker', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'help', label: 'Help', icon: <LifeBuoy className="w-4 h-4" /> },
  ];

  return (
    <nav className="w-full bg-[#1a0f0a]/40 backdrop-blur-md border-b border-white/5 sticky top-0 z-[100] px-4 sm:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange('list')}>
          <span className="text-[#b45309] text-xl sm:text-2xl">✦</span>
          <h1 className="text-lg sm:text-xl font-medium tracking-tighter text-white">Jigyasa</h1>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest ${
                  activeView === item.id 
                    ? 'bg-[#b45309] text-[#1a0f0a]' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
          
          <div className="h-6 w-px bg-white/10 mx-2" />


          <button 
            onClick={() => signOut()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-red-500/10 text-white/80 hover:text-red-400 rounded-full transition-all border border-white/10 hover:border-red-500/20 font-bold tracking-widest uppercase text-[10px]"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white/70 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#1a0f0a] border-b border-white/10 p-4 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold uppercase tracking-widest w-full ${
                  activeView === item.id 
                    ? 'bg-[#b45309]/20 text-[#f5cca8] border border-[#b45309]/30' 
                    : 'text-white/60 hover:bg-white/5'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
          
          <div className="h-px w-full bg-white/5" />


          <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-4 bg-red-500/10 text-red-400 rounded-xl font-bold tracking-widest uppercase text-sm w-full"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
