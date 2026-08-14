'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Search, Bell, ArrowLeft, ChevronDown } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

export const AdminHeader: React.FC = () => {
  return (
    <header className="h-14 bg-slate-950/90 border-b border-pink-500/20 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 backdrop-blur-xl">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center shadow-lg shadow-pink-500/25">
          <Shield className="text-white" size={16} />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-black text-white leading-none">CreatorPulse</h1>
          <span className="text-[10px] text-pink-400 font-semibold uppercase tracking-wider">Admin Panel</span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400/60" size={14} />
          <input
            type="text"
            placeholder="Search users, posts, reports..."
            className="w-full bg-pink-950/20 border border-pink-500/20 rounded-xl pl-9 pr-4 py-1.5 text-xs text-pink-100 placeholder-pink-300/40 focus:outline-none focus:border-pink-400 transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/feed"
          className="flex items-center gap-1.5 text-xs text-pink-300/70 hover:text-pink-100 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-pink-500/10"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to App</span>
        </Link>

        <button className="relative p-2 text-pink-300/70 hover:text-pink-100 hover:bg-pink-500/10 rounded-lg transition-colors cursor-pointer">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
        </button>

        <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-pink-500/10 transition-colors cursor-pointer">
          <Avatar
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"
            alt="Admin"
            size="sm"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-pink-100 leading-none">Elena Rostova</p>
            <p className="text-[10px] text-pink-400 font-medium">Super Admin</p>
          </div>
          <ChevronDown size={12} className="text-pink-400/60 hidden sm:block" />
        </button>
      </div>
    </header>
  );
};
