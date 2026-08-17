'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Play, Pause, Heart, Lock, Eye, Flame, 
  Video, DollarSign, ArrowRight, ShieldCheck, Zap,
  CheckCircle2, Compass, Layers
} from 'lucide-react';
import { Badge } from './Badge';

export const BentoFeatures: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 sm:space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto px-2">
        <Badge variant="pink" size="sm">
          <Layers size={12} /> Complete Monetization Stack
        </Badge>
        <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#18181B] dark:text-[#FDF2F8]">
          Every piece of content <br className="hidden xs:inline" />
          <span className="bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#FB7185] bg-clip-text text-transparent inline-block">
            tells a story & generates value
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#D4B8D0] font-medium">
          Offering creators infinite ways to monetize their craft with transparent payouts and 95% revenue share.
        </p>
      </div>

      {/* Responsive Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Card 1: Interactive Live Video Spotlight (Span 2 on desktop) */}
        <div className="lg:col-span-2 rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 bg-gradient-to-br from-[#FFF9FC] to-[#FFF1F7] dark:from-[#1A1222] dark:to-[#241A30] border border-[#F3DCE8] dark:border-[#3A2A4C] flex flex-col justify-between relative overflow-hidden group shadow-lg shadow-pink-500/5">
          <div className="space-y-3 sm:space-y-4 relative z-10">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-black bg-white dark:bg-[#1A1222] text-[#EC4899] border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xs flex items-center gap-1.5">
                <Play size={10} className="fill-[#EC4899]" /> Interactive Video Drops
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#71717A] dark:text-[#D4B8D0]">4K Ultra HDR</span>
            </div>

            <h3 className="text-xl xs:text-2xl sm:text-3xl font-black text-[#18181B] dark:text-[#FDF2F8] leading-tight">
              Connect, Create, & Commerce in High-Def
            </h3>
            <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#D4B8D0] max-w-md font-medium leading-relaxed">
              Publish paywalled masterclasses, vertical reels, and 24-hour status stories with zero lag and instant tipping.
            </p>
          </div>

          {/* Interactive Mock Video Player Area */}
          <div className="relative mt-5 sm:mt-6 rounded-xl sm:rounded-2xl overflow-hidden h-44 xs:h-52 sm:h-64 bg-black group/video">
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80"
              alt="Video thumbnail"
              className="w-full h-full object-cover opacity-80 group-hover/video:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Play Button Trigger */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md text-[#EC4899] flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer min-w-[48px] min-h-[48px]"
              aria-label={isPlaying ? "Pause video preview" : "Play video preview"}
            >
              {isPlaying ? <Pause size={20} className="fill-[#EC4899]" /> : <Play size={20} className="fill-[#EC4899] ml-0.5" />}
            </button>

            {/* Player Overlay Footer */}
            <div className="absolute bottom-2.5 left-3 right-3 sm:bottom-3 sm:left-4 sm:right-4 flex items-center justify-between text-white text-[10px] sm:text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold">Live Premiere</span>
              </div>
              <span className="font-mono bg-black/60 px-2 py-0.5 rounded-full">04:28 / 18:40</span>
            </div>
          </div>
        </div>

        {/* Right Side Column (Cards 2 & 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
          {/* Card 2: Creator Spotlight Modal Card */}
          <div className="rounded-2xl sm:rounded-3xl p-4 xs:p-5 sm:p-6 bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] flex flex-col justify-between relative overflow-hidden group shadow-lg shadow-pink-500/5">
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden h-36 xs:h-40 sm:h-44 bg-neutral-100 dark:bg-neutral-800">
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80"
                alt="Creator Profile"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Floating @artist Pill from Reference Video */}
              <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#EC4899] text-white shadow-md">
                @artist
              </div>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                aria-label="Like creator spotlight"
              >
                <Heart size={13} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
              </button>
            </div>

            <div className="mt-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm sm:text-base font-black text-[#18181B] dark:text-[#FDF2F8]">Trisha Woodward</h4>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">$19.99/mo</span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#71717A] dark:text-[#D4B8D0] font-medium">Digital Fashion & Visual Design from ArtRoo</p>
              <span className="inline-block text-[9px] font-black text-[#BE185D] dark:text-[#F472B6] bg-[#FFF1F7] dark:bg-[#381A2B] px-2 py-0.5 rounded-full">
                14.5k active fans
              </span>
            </div>
          </div>

          {/* Card 3: Spin Passion into Gold */}
          <div className="rounded-2xl sm:rounded-3xl p-4 xs:p-5 sm:p-6 bg-gradient-to-br from-[#EC4899] to-[#F43F5E] text-white flex flex-col justify-between shadow-xl shadow-pink-500/25 relative overflow-hidden group">
            <div className="space-y-2.5 sm:space-y-3 relative z-10">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <DollarSign size={18} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black leading-tight">
                Spin Your Art Into Gold
              </h3>
              <p className="text-[11px] sm:text-xs text-white/90 leading-relaxed font-medium">
                Keep 95% of every dollar earned from subscriptions, custom commissions, and instant tip drops.
              </p>
            </div>

            <div className="pt-4 sm:pt-5 relative z-10">
              <Link href="/auth/signup" className="block">
                <button className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white text-[#EC4899] font-black text-xs hover:bg-[#FFF1F7] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer min-h-[44px]">
                  Join As Creator →
                </button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default BentoFeatures;
