'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Search, Bell, ArrowLeft, ChevronDown } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

export const AdminHeader: React.FC = () => {
  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <Shield className="text-white" size={16} />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-black text-white leading-none">CreatorPulse</h1>
          <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">Admin Panel</span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text"
            placeholder="Search users, posts, reports..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/feed"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-900"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to App</span>
        </Link>

        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-900 transition-colors">
          <Avatar
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"
            alt="Admin"
            size="sm"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none">Elena Rostova</p>
            <p className="text-[10px] text-rose-400">Super Admin</p>
          </div>
          <ChevronDown size={12} className="text-slate-500 hidden sm:block" />
        </button>
      </div>
    </header>
  );
};
