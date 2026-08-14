'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Search, Bell, ArrowLeft, ChevronDown, Check, User, DollarSign, FileText } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

const mockSearchResults = [
  { type: 'user', title: 'Sarah Jenkins', subtitle: 'Verified Creator • @sarahdesign', url: '/admin/creators' },
  { type: 'payout', title: '$1,500.00 Payout Request', subtitle: 'Sarah Jenkins • Pending Transfer', url: '/admin/payouts' },
  { type: 'app', title: 'David Miller Application', subtitle: 'Fitness & Wellness Creator', url: '/admin/applications' },
];

export const AdminHeader: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredResults = mockSearchResults.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="h-16 bg-slate-950/90 border-b border-pink-500/20 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 backdrop-blur-xl">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-pink-500/25 animate-pulse">
          <Shield className="text-white" size={16} />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-black text-white leading-none">CreatorPulse</h1>
          <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">Admin Panel</span>
        </div>
      </div>

      {/* Center: Commmand Palette Search Simulation */}
      <div className="flex-1 max-w-md mx-4 hidden md:block relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400/50" size={14} />
          <input
            type="text"
            placeholder="Search commands, users, payout requests..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full bg-pink-950/20 border border-pink-500/25 rounded-2xl pl-9 pr-4 py-2 text-xs text-pink-100 placeholder-pink-300/30 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all font-semibold"
          />
        </div>

        {showSearchDropdown && (searchQuery.length > 0 || searchQuery === '') && (
          <div className="absolute left-0 right-0 mt-2 bg-slate-900/95 border border-pink-500/20 rounded-2xl shadow-2xl p-3 space-y-2 z-50 backdrop-blur-md animate-scale-up">
            <p className="text-[9px] font-black uppercase text-pink-400/60 tracking-widest px-2.5">
              Quick command suggestions
            </p>
            <div className="space-y-1">
              {filteredResults.map((item, idx) => {
                const Icon = item.type === 'user' ? User : item.type === 'payout' ? DollarSign : FileText;
                return (
                  <Link key={idx} href={item.url} onClick={() => setShowSearchDropdown(false)}>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-pink-950/40 border border-transparent hover:border-pink-500/10 cursor-pointer transition-all">
                      <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 shrink-0">
                        <Icon size={12} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-pink-100 truncate">{item.title}</p>
                        <p className="text-[10px] text-pink-300/40 font-semibold truncate">{item.subtitle}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {filteredResults.length === 0 && (
                <p className="text-[10px] text-pink-300/30 italic py-2 text-center font-semibold">
                  No matching admin records found
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/feed"
          className="flex items-center gap-1.5 text-xs font-bold text-pink-300/70 hover:text-pink-100 transition-colors px-3 py-1.5 rounded-xl hover:bg-pink-500/10"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to App</span>
        </Link>

        <button className="relative p-2.5 text-pink-300/70 hover:text-pink-100 hover:bg-pink-500/10 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-pink-500/10">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full"></span>
        </button>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-pink-500/10 transition-colors cursor-pointer border border-transparent hover:border-pink-500/10"
          >
            <Avatar
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"
              alt="Admin"
              size="sm"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-pink-100 leading-none">Elena Rostova</p>
              <p className="text-[10px] text-pink-400 font-semibold mt-0.5">Super Admin</p>
            </div>
            <ChevronDown size={12} className="text-pink-400/50 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2.5 w-44 bg-slate-900/95 border border-pink-500/20 rounded-2xl shadow-2xl p-2.5 space-y-1.5 z-50 backdrop-blur-md animate-scale-up">
              <Link href="/admin/settings" onClick={() => setShowProfileMenu(false)}>
                <div className="px-3 py-2 text-xs font-semibold text-pink-300 hover:text-pink-100 hover:bg-pink-950/40 rounded-xl transition-all cursor-pointer">
                  Platform Settings
                </div>
              </Link>
              <hr className="border-pink-500/10" />
              <Link href="/feed">
                <div className="px-3 py-2 text-xs font-semibold text-pink-300 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer">
                  Log Out
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
