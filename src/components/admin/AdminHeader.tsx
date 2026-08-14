'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Search, Bell, ArrowLeft, ChevronDown, User, DollarSign, FileText, Palette, Puzzle } from 'lucide-react';
import { Avatar } from '@/components/admin/ui/Avatar';

const mockSearchResults = [
  { type: 'theme', title: 'Frontend Themes', subtitle: 'Manage active themes & design tokens', url: '/admin/themes' },
  { type: 'plugin', title: 'Plugins & Add-ons', subtitle: 'Configure DRM, Virtual Gifts & AI Add-ons', url: '/admin/plugins' },
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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 shadow-2xs">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xs">
          <Shield className="text-white" size={15} />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xs font-black text-slate-800 leading-none tracking-tight">CreatorPulse</h1>
          <span className="text-[9px] text-indigo-600 font-extrabold uppercase tracking-wider block mt-0.5">Admin Console</span>
        </div>
      </div>

      {/* Center: Command Palette Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input
            type="text"
            placeholder="Search themes, plugins, users, payouts..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8.5 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
          />
        </div>

        {showSearchDropdown && (searchQuery.length > 0 || searchQuery === '') && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-2.5 space-y-2 z-50">
            <p className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider px-2">
              Quick Menu Suggestions
            </p>
            <div className="space-y-0.5">
              {filteredResults.map((item, idx) => {
                let Icon = FileText;
                if (item.type === 'theme') Icon = Palette;
                else if (item.type === 'plugin') Icon = Puzzle;
                else if (item.type === 'user') Icon = User;
                else if (item.type === 'payout') Icon = DollarSign;

                return (
                  <Link key={idx} href={item.url} onClick={() => setShowSearchDropdown(false)}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200/50 cursor-pointer transition-all">
                      <div className="p-1.5 rounded bg-slate-100 text-slate-500 shrink-0">
                        <Icon size={12} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{item.title}</p>
                        <p className="text-[9px] text-slate-400 font-medium truncate">{item.subtitle}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {filteredResults.length === 0 && (
                <p className="text-[10px] text-slate-400 italic py-2 text-center font-medium">
                  No matching admin records found
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3.5">
        <Link
          href="/feed"
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
        >
          <ArrowLeft size={13} />
          <span className="hidden sm:inline">View Frontend</span>
        </Link>

        <button className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border border-transparent">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
        </button>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent"
          >
            <Avatar
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"
              alt="Admin"
              size="sm"
            />
            <div className="hidden sm:block text-left ml-1">
              <p className="text-[11px] font-bold text-slate-700 leading-none">Elena Rostova</p>
              <p className="text-[9px] text-indigo-600 font-extrabold mt-0.5">Super Admin</p>
            </div>
            <ChevronDown size={11} className="text-slate-400 ml-1.5 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg p-2 space-y-0.5 z-50">
              <Link href="/admin/themes" onClick={() => setShowProfileMenu(false)}>
                <div className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-all cursor-pointer flex items-center gap-2">
                  <Palette size={12} className="text-slate-400" />
                  <span>Frontend Themes</span>
                </div>
              </Link>
              <Link href="/admin/plugins" onClick={() => setShowProfileMenu(false)}>
                <div className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-all cursor-pointer flex items-center gap-2">
                  <Puzzle size={12} className="text-slate-400" />
                  <span>Plugins & Add-ons</span>
                </div>
              </Link>
              <Link href="/admin/settings" onClick={() => setShowProfileMenu(false)}>
                <div className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all cursor-pointer flex items-center gap-2">
                  <User size={12} className="text-slate-400" />
                  <span>Platform Settings</span>
                </div>
              </Link>
              <hr className="border-slate-100 my-1" />
              <Link href="/feed">
                <div className="px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-md transition-all cursor-pointer">
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
