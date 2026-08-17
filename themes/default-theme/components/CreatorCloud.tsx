'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, ArrowRight, Star, Heart, TrendingUp, Users } from 'lucide-react';
import { Badge } from './Badge';

interface CreatorCloudItem {
  id: string;
  name: string;
  handle: string;
  category: string;
  avatar: string;
  subscribers: string;
  isVerified: boolean;
  status?: string;
  engagement?: string;
}

const CREATORS_LIST: CreatorCloudItem[] = [
  { id: '1', name: 'Sophia Chen', handle: '@sophia_3d', category: '3D Art', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', subscribers: '12.4k', isVerified: true, status: 'Live Now', engagement: 'High' },
  { id: '2', name: 'Marcus Vance', handle: '@marcus_beats', category: 'Music', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', subscribers: '8.2k', isVerified: true, engagement: 'Rising' },
  { id: '3', name: 'Elena Rostova', handle: '@elena_art', category: 'Visuals', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', subscribers: '25.6k', isVerified: true, status: 'New Post' },
  { id: '4', name: 'Kaito Tanaka', handle: '@kaito_draws', category: 'Anime', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', subscribers: '19.1k', isVerified: true },
  { id: '5', name: 'Maya Lin', handle: '@maya_dance', category: 'Dance', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', subscribers: '14.8k', isVerified: false, engagement: 'Trending' },
  { id: '6', name: 'Liam Walker', handle: '@liam_fit', category: 'Fitness', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', subscribers: '31.0k', isVerified: true },
  { id: '7', name: 'Aria Stark', handle: '@aria_crafts', category: 'Ceramics', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', subscribers: '6.7k', isVerified: false, status: 'Live Now' },
  { id: '8', name: 'Noah Miller', handle: '@noah_tech', category: 'Coding', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', subscribers: '42.3k', isVerified: true, engagement: 'High' },
  { id: '9', name: 'Chloe Dubois', handle: '@chloe_fashion', category: 'Fashion', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', subscribers: '18.9k', isVerified: true },
  { id: '10', name: 'David Kim', handle: '@david_culinary', category: 'Cooking', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', subscribers: '11.5k', isVerified: true, status: 'New Post' },
  { id: '11', name: 'Zara Morales', handle: '@zara_yoga', category: 'Wellness', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150', subscribers: '9.4k', isVerified: false },
  { id: '12', name: 'Lucas Rossi', handle: '@lucas_cine', category: 'Filmmaking', avatar: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=150', subscribers: '22.0k', isVerified: true, engagement: 'Trending' },
];

export const CreatorCloud: React.FC = () => {
  const [hoveredCreator, setHoveredCreator] = useState<CreatorCloudItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative overflow-hidden">
      {/* Background Decorative Rings & Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] rounded-full border border-dashed border-[#F3DCE8]/60 dark:border-[#3A2A4C]/60 pointer-events-none -z-10 animate-spin" style={{ animationDuration: '60s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full border border-[#F3DCE8]/40 dark:border-[#3A2A4C]/40 pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-pink-500/10 dark:bg-pink-600/10 rounded-full blur-3xl pointer-events-none -z-10 mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10 mix-blend-multiply dark:mix-blend-screen" />

      {/* Center Headline */}
      <div className={`text-center space-y-4 max-w-2xl mx-auto mb-12 sm:mb-16 relative z-10 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="inline-flex items-center gap-2">
          <Badge variant="pink" size="sm" className="shadow-lg shadow-pink-500/20 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-pink-200 dark:border-pink-900">
            <Sparkles size={12} className="animate-pulse text-pink-500" /> <span className="font-bold">Thriving Creator Economy</span>
          </Badge>
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#18181B] dark:text-[#FDF2F8] drop-shadow-sm">
          You will find yourself <br />
          <span className="bg-gradient-to-r from-[#EC4899] via-[#8B5CF6] to-[#F43F5E] bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
            among us
          </span>
        </h2>
        <p className="text-xs sm:text-base text-[#71717A] dark:text-[#D4B8D0] font-medium leading-relaxed max-w-lg mx-auto">
          Dive into a dynamic, global ecosystem where creators and fans connect, support, and prosper together in real-time.
        </p>
      </div>

      {/* Floating Dynamic Creator Grid */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-6 max-w-6xl mx-auto">
        {CREATORS_LIST.map((creator, idx) => (
          <Link
            key={creator.id}
            href={`/c/${creator.handle.replace('@', '')}`}
            onMouseEnter={() => setHoveredCreator(creator)}
            onMouseLeave={() => setHoveredCreator(null)}
            className={`group relative flex flex-col items-center p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/60 dark:bg-[#1A1222]/60 backdrop-blur-xl border border-white/80 dark:border-white/10 hover:border-pink-400 dark:hover:border-pink-500 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(236,72,153,0.3)] cursor-pointer text-center overflow-hidden transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            style={{
              transitionDelay: `${idx * 50}ms`,
            }}
          >
            {/* Background Glow on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Badges/Info absolute positioned */}
            {creator.status === 'Live Now' && (
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-red-500 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                LIVE
              </div>
            )}

            {/* Avatar with Animated Glow Ring */}
            <div className="relative mt-2 sm:mt-0 w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[22px] overflow-hidden p-[2px] bg-gradient-to-tr from-[#EC4899] via-[#8B5CF6] to-[#F43F5E] shadow-lg group-hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] transition-all duration-500 shrink-0 z-10 group-hover:scale-105">
              <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[14px] sm:rounded-[20px] p-[2px]">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-full h-full object-cover rounded-[12px] sm:rounded-[18px] group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>
              
              {/* Overlay inside avatar on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[14px] sm:rounded-[20px] flex items-center justify-center m-[2px]">
                <ArrowRight size={20} className="text-white transform -translate-x-4 group-hover:translate-x-0 transition-transform duration-300" />
              </div>
              
              {creator.isVerified && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#1A1222] shadow-sm z-20">
                  <CheckCircle2 size={12} className="sm:w-3.5 sm:h-3.5" />
                </span>
              )}
            </div>

            {/* Creator Text Info */}
            <div className="mt-3 sm:mt-4 space-y-1 w-full relative z-10">
              <p className="text-xs sm:text-sm font-black text-[#18181B] dark:text-[#FDF2F8] truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-500 transition-all duration-300">
                {creator.name}
              </p>
              
              <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[11px] text-[#71717A] dark:text-[#D4B8D0] font-medium">
                <span className="truncate">{creator.category}</span>
                {creator.engagement === 'Trending' && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span className="flex items-center text-orange-500 gap-0.5 font-bold">
                      <TrendingUp size={10} /> Trending
                    </span>
                  </>
                )}
              </div>
              
              <div className="pt-2 sm:pt-2.5">
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-[#BE185D] dark:text-[#F472B6] bg-[#FFF1F7] dark:bg-[#381A2B] px-2.5 sm:px-3 py-1 rounded-full group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-500 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <Users size={10} className="group-hover:animate-pulse" />
                  {creator.subscribers} fans
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Interactive Bottom Creator Banner */}
      <div className={`mt-14 sm:mt-20 text-center transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '800ms' }}>
        <Link href="/explore">
          <button className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white dark:bg-[#1A1222] border-2 border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-transparent text-sm sm:text-base font-black text-[#18181B] dark:text-[#FDF2F8] shadow-lg hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <Star size={18} className="text-[#EC4899] group-hover:animate-spin-slow" />
            <span className="relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-500 transition-colors">
              Explore 2,500+ Verified Creators
            </span>
            <ArrowRight size={18} className="text-[#EC4899] transform group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </Link>
      </div>
    </section>
  );
};

export default CreatorCloud;

