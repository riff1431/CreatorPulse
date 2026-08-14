'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Bell, PlusSquare, ArrowLeft, ChevronDown } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

export const CreatorHeader: React.FC = () => {
  return (
    <header className="h-15 bg-white/85 border-b border-[#F3DCE8] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 backdrop-blur-xl">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl gradient-btn flex items-center justify-center shadow-md shadow-[#EC4899]/25">
          <Sparkles className="text-white" size={16} />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-black text-[#18181B] leading-none">CreatorPulse</h1>
          <span className="text-[10px] text-[#BE185D] font-bold uppercase tracking-wider">Creator Studio</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/feed"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#71717A] hover:text-[#DB2777] transition-colors px-3 py-1.5 rounded-xl hover:bg-[#FDF2F8]"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to Feed</span>
        </Link>

        <Link href="/creator/posts">
          <button className="flex items-center gap-1.5 text-xs font-bold text-white gradient-btn px-3.5 py-1.5 rounded-xl shadow-md shadow-[#EC4899]/20 hover:shadow-[#EC4899]/35 transition-all cursor-pointer">
            <PlusSquare size={14} />
            <span className="hidden sm:inline">Publish</span>
          </button>
        </Link>

        <button className="relative p-2 text-[#71717A] hover:text-[#DB2777] hover:bg-[#FDF2F8] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#F3DCE8]">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EC4899] rounded-full ring-2 ring-white"></span>
        </button>

        <button className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-2xl hover:bg-[#FDF2F8] transition-colors cursor-pointer border border-transparent hover:border-[#F3DCE8]">
          <Avatar
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
            alt="Creator"
            size="sm"
            isVerified={true}
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-[#18181B] leading-none">Sarah Jenkins</p>
            <p className="text-[10px] text-[#BE185D] font-semibold">Verified Creator</p>
          </div>
          <ChevronDown size={12} className="text-[#A1A1AA] hidden sm:block" />
        </button>
      </div>
    </header>
  );
};
