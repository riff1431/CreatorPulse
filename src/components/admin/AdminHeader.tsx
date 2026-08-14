'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Search, Bell, ArrowLeft, ChevronDown, User, DollarSign, FileText, Palette, Puzzle, ShieldCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

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
    <header className="h-16 bg-white border-b border-[#F3DCE8] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 shadow-xs">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F43F5E] flex items-center justify-center shadow-md shadow-[#EC4899]/20">
          <Shield className="text-white" size={16} />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-black text-[#18181B] leading-none">CreatorPulse</h1>
          <span className="text-[10px] text-[#EC4899] font-bold uppercase tracking-wider">Admin Panel</span>
        </div>
      </div>

      {/* Center: Commmand Palette Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
          <input
            type="text"
            placeholder="Search themes, plugins, users, payouts..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-2xl pl-9 pr-4 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] focus:ring-1 focus:ring-[#EC4899]/30 transition-all font-semibold"
          />
        </div>

        {showSearchDropdown && (searchQuery.length > 0 || searchQuery === '') && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-[#F3DCE8] rounded-2xl shadow-xl p-3 space-y-2 z-50 animate-scale-up">
            <p className="text-[9px] font-black uppercase text-[#A1A1AA] tracking-widest px-2.5">
              Quick command suggestions
            </p>
            <div className="space-y-1">
              {filteredResults.map((item, idx) => {
                let Icon = FileText;
                if (item.type === 'theme') Icon = Palette;
                else if (item.type === 'plugin') Icon = Puzzle;
                else if (item.type === 'user') Icon = User;
                else if (item.type === 'payout') Icon = DollarSign;

                return (
                  <Link key={idx} href={item.url} onClick={() => setShowSearchDropdown(false)}>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FFF1F7] border border-transparent hover:border-[#FBCFE8] cursor-pointer transition-all">
                      <div className="p-1.5 rounded-lg bg-[#FCE7F3] text-[#EC4899] shrink-0">
                        <Icon size={13} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#18181B] truncate">{item.title}</p>
                        <p className="text-[10px] text-[#71717A] font-medium truncate">{item.subtitle}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {filteredResults.length === 0 && (
                <p className="text-[10px] text-[#A1A1AA] italic py-2 text-center font-semibold">
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
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-bold text-[#71717A] hover:text-[#EC4899] transition-colors px-3 py-1.5 rounded-xl hover:bg-[#FFF1F7]"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">View Public Website</span>
        </Link>

        <button className="relative p-2.5 text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7] rounded-xl transition-colors cursor-pointer border border-transparent">
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#EC4899] rounded-full"></span>
        </button>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-[#FFF1F7] transition-colors cursor-pointer border border-transparent"
          >
            <Avatar
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"
              alt="Admin"
              size="sm"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#18181B] leading-none">Elena Rostova</p>
              <p className="text-[10px] text-[#EC4899] font-bold mt-0.5">Super Admin</p>
            </div>
            <ChevronDown size={12} className="text-[#A1A1AA] hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2.5 w-48 bg-white border border-[#F3DCE8] rounded-2xl shadow-xl p-2.5 space-y-1 z-50 animate-scale-up">
              <Link href="/admin/themes" onClick={() => setShowProfileMenu(false)}>
                <div className="px-3 py-2 text-xs font-bold text-[#71717A] hover:text-[#BE185D] hover:bg-[#FFF1F7] rounded-xl transition-all cursor-pointer flex items-center gap-2">
                  <Palette size={14} className="text-[#EC4899]" />
                  <span>Frontend Themes</span>
                </div>
              </Link>
              <Link href="/admin/plugins" onClick={() => setShowProfileMenu(false)}>
                <div className="px-3 py-2 text-xs font-bold text-[#71717A] hover:text-[#BE185D] hover:bg-[#FFF1F7] rounded-xl transition-all cursor-pointer flex items-center gap-2">
                  <Puzzle size={14} className="text-[#EC4899]" />
                  <span>Plugins & Add-ons</span>
                </div>
              </Link>
              <Link href="/admin/settings" onClick={() => setShowProfileMenu(false)}>
                <div className="px-3 py-2 text-xs font-bold text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7] rounded-xl transition-all cursor-pointer">
                  Platform Settings
                </div>
              </Link>
              <hr className="border-[#F3DCE8]" />
              <Link href="/feed">
                <div className="px-3 py-2 text-xs font-bold text-[#F43F5E] hover:bg-[#FFE4E6] rounded-xl transition-all cursor-pointer">
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
