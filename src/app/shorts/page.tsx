'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, MessageSquare, Share2, Play, Sparkles, 
  ChevronUp, ChevronDown, CheckCircle2, UserPlus 
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { MOCK_SHORTS, ShortVideo } from '@/lib/supabase/store';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export default function ShortsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shortsList, setShortsList] = useState<ShortVideo[]>(MOCK_SHORTS);

  const activeShort = shortsList[currentIndex];

  const handleNext = () => {
    if (currentIndex < shortsList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleToggleLike = () => {
    const updated = [...shortsList];
    const item = updated[currentIndex];
    if (item.isLiked) {
      item.likesCount -= 1;
      item.isLiked = false;
    } else {
      item.likesCount += 1;
      item.isLiked = true;
    }
    setShortsList(updated);
  };

  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 flex flex-col items-center justify-center pb-20 lg:pb-8">
          <div className="relative max-w-sm w-full h-[620px] bg-[#18181B] rounded-[32px] overflow-hidden shadow-2xl border border-[#F3DCE8] flex flex-col justify-between">
            {/* Background Video Media Mock */}
            <div className="absolute inset-0 z-0 bg-black">
              <img
                src={activeShort.videoUrl}
                alt={activeShort.title}
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85"></div>
            </div>

            {/* Top Navigation Overlay */}
            <div className="relative z-10 p-4 flex items-center justify-between">
              <span className="text-xs font-bold bg-[#FCE7F3] text-[#BE185D] px-3 py-1 rounded-full border border-[#FBCFE8] backdrop-blur-md shadow-sm">
                {activeShort.category}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 bg-black/40 text-white rounded-full hover:bg-black/60 backdrop-blur-md cursor-pointer transition-colors"
                >
                  <ChevronUp size={18} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 bg-black/40 text-white rounded-full hover:bg-black/60 backdrop-blur-md cursor-pointer transition-colors"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>

            {/* Floating Right Interaction Bar */}
            <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-5 text-white">
              <button
                onClick={handleToggleLike}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className={`p-3.5 rounded-full backdrop-blur-md transition-all ${
                  activeShort.isLiked ? 'bg-[#EC4899] text-white shadow-lg shadow-[#EC4899]/40 scale-110' : 'bg-black/40 hover:bg-[#EC4899]/40 text-white'
                }`}>
                  <Heart size={22} className={activeShort.isLiked ? 'fill-white' : ''} />
                </div>
                <span className="text-xs font-bold">{activeShort.likesCount}</span>
              </button>

              <button className="flex flex-col items-center gap-1 cursor-pointer">
                <div className="p-3.5 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors">
                  <MessageSquare size={22} />
                </div>
                <span className="text-xs font-bold">{activeShort.commentsCount}</span>
              </button>

              <button className="flex flex-col items-center gap-1 cursor-pointer">
                <div className="p-3.5 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors">
                  <Share2 size={22} />
                </div>
                <span className="text-xs font-bold">{activeShort.sharesCount}</span>
              </button>
            </div>

            {/* Bottom Info Overlay */}
            <div className="relative z-10 p-5 space-y-3 pr-16">
              <div className="flex items-center gap-2.5">
                <Link href={`/c/${activeShort.authorUsername}`}>
                  <Avatar alt={activeShort.authorName} src={activeShort.authorAvatar} size="md" isVerified />
                </Link>
                <div>
                  <Link href={`/c/${activeShort.authorUsername}`} className="font-bold text-sm text-white hover:underline block">
                    {activeShort.authorName}
                  </Link>
                  <span className="text-[11px] text-pink-200">@{activeShort.authorUsername}</span>
                </div>
                <Button variant="primary" size="sm" className="ml-2">
                  Follow
                </Button>
              </div>

              <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
                {activeShort.title}
              </p>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
