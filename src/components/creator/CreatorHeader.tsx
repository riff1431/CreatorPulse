'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Bell, PlusSquare, ArrowLeft, ChevronDown } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

export const CreatorHeader: React.FC = () => {
  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="text-white" size={16} />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-black text-white leading-none">CreatorPulse</h1>
          <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Creator Studio</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/feed"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-900"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to Feed</span>
        </Link>

        <Link href="/creator/posts">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 px-3 py-1.5 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all">
            <PlusSquare size={14} />
            <span className="hidden sm:inline">Publish</span>
          </button>
        </Link>

        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>

        <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-900 transition-colors">
          <Avatar
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
            alt="Creator"
            size="sm"
            isVerified={true}
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none">Sarah Jenkins</p>
            <p className="text-[10px] text-indigo-400">Verified Creator</p>
          </div>
          <ChevronDown size={12} className="text-slate-500 hidden sm:block" />
        </button>
      </div>
    </header>
  );
};
