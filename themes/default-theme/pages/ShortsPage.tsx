'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { MinimalLayout } from '../layouts/MinimalLayout';
import { Avatar } from '../components/Avatar';
import { useAuth } from '@/lib/auth/auth-context';
import { useContentPreferences } from '@/lib/preferences/use-content-preferences';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { 
  Heart, MessageSquare, Share2, Play, Pause, Volume2, 
  VolumeX, Gift, Music2, ChevronUp, ChevronDown, Check, X, Send, Sparkles,
  MoreVertical, Bookmark, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { TipModal } from '../components/TipModal';
import { ShareModal } from '../components/ShareModal';
import { CommentsDrawer } from '../components/CommentsDrawer';

interface Reel {
  id: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  isVerified: boolean;
  caption: string;
  musicTitle: string;
  videoUrl: string;
  thumbnailUrl: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
}

const MOCK_REELS: Reel[] = [
  {
    id: 'reel-1',
    creatorName: 'Sarah Jenkins',
    creatorUsername: 'sarahdesign',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    isVerified: true,
    caption: 'Behind the scenes at today’s UI Masterclass! Which color palette should we use next? 🎨✨ Drop your thoughts in the comments!',
    musicTitle: 'Original Audio • Sarah Jenkins • Lo-Fi Waves',
    videoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    likesCount: 1420,
    commentsCount: 89,
    sharesCount: 34,
  },
  {
    id: 'reel-2',
    creatorName: 'Marcus Vance',
    creatorUsername: 'marcuscode',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
    isVerified: true,
    caption: 'Cooking up a new full-stack SaaS drop in the studio. VIP repo stems dropping tomorrow! 🎹🔥',
    musicTitle: 'Marcus Vance • Cyber Beats 04',
    videoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    likesCount: 3200,
    commentsCount: 215,
    sharesCount: 92,
  },
  {
    id: 'reel-3',
    creatorName: 'Sonya Leena',
    creatorUsername: 'sonyaleena',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    isVerified: true,
    caption: 'Sunset vibes over the rooftop pool in Dubai 🌴✨ What a weekend.',
    musicTitle: 'Sonya Leena • Golden Hour Acoustic',
    videoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    likesCount: 5410,
    commentsCount: 412,
    sharesCount: 180,
  },
];

export function ShortsPage() {
  const { scorePost, muteCreator } = useContentPreferences();
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedReels, setLikedReels] = useState<string[]>([]);
  const [savedReels, setSavedReels] = useState<string[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  // Filter reels based on user preferences
  const activeReels = MOCK_REELS.filter((r) => {
    const scored = scorePost({
      id: r.id,
      authorId: r.creatorUsername,
      authorName: r.creatorName,
      authorUsername: r.creatorUsername,
      authorAvatar: r.creatorAvatar,
      authorVerified: r.isVerified,
      authorCategory: 'Reels',
      content: r.caption,
      postType: 'short',
      visibility: 'public',
      likesCount: r.likesCount,
      commentsCount: r.commentsCount,
      viewsCount: r.sharesCount * 10,
      createdAt: 'Just now',
    });
    return !scored.isHidden;
  });

  const reelList = activeReels.length > 0 ? activeReels : MOCK_REELS;
  const safeIndex = currentReelIndex % reelList.length;
  const reel = reelList[safeIndex];
  const isLiked = likedReels.includes(reel.id);
  const isSaved = savedReels.includes(reel.id);

  // Simulated progress timer
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNextReel();
            return 0;
          }
          return prev + 1;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentReelIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        handleNextReel();
      } else if (e.key === 'ArrowUp') {
        handlePrevReel();
      } else if (e.key === ' ' || e.key === 'k') {
        setIsPlaying((p) => !p);
      } else if (e.key === 'm') {
        setIsMuted((m) => !m);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentReelIndex]);

  const handleNextReel = () => {
    setProgress(0);
    if (currentReelIndex < reelList.length - 1) {
      setCurrentReelIndex(currentReelIndex + 1);
    } else {
      setCurrentReelIndex(0);
    }
  };

  const handlePrevReel = () => {
    setProgress(0);
    if (currentReelIndex > 0) {
      setCurrentReelIndex(currentReelIndex - 1);
    } else {
      setCurrentReelIndex(reelList.length - 1);
    }
  };

  const toggleLike = () => {
    setLikedReels((prev) =>
      prev.includes(reel.id) ? prev.filter((id) => id !== reel.id) : [...prev, reel.id]
    );
  };

  const toggleSave = () => {
    setSavedReels((prev) =>
      prev.includes(reel.id) ? prev.filter((id) => id !== reel.id) : [...prev, reel.id]
    );
  };

  return (
    <MinimalLayout>
      <div className="fixed inset-0 bg-[#0B0612] text-white flex items-center justify-center select-none overflow-hidden">
        
        {/* Top Floating App Bar */}
        <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
          <Link
            href="/feed"
            className="p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Feed</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-pink-500/30 text-pink-300 border border-pink-500/40 backdrop-blur-md">
              Reels • {currentReelIndex + 1}/{MOCK_REELS.length}
            </span>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>

        {/* Vertical Up / Down Switch Controls for Desktop */}
        <div className="hidden lg:flex flex-col items-center gap-3 absolute right-8 top-1/2 -translate-y-1/2 z-30">
          <button
            onClick={handlePrevReel}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
            title="Previous Reel (Up Arrow)"
          >
            <ChevronUp size={22} />
          </button>
          <button
            onClick={handleNextReel}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
            title="Next Reel (Down Arrow)"
          >
            <ChevronDown size={22} />
          </button>
        </div>

        {/* Central Reel 9:16 Frame */}
        <div className="relative w-full h-full max-w-[420px] max-h-[860px] sm:rounded-[36px] overflow-hidden bg-black shadow-2xl border border-white/10 flex flex-col justify-between">
          
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/20">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-[#FF8A00] to-[#EC4899] transition-all duration-150"
            />
          </div>

          {/* Reel Media / Video Simulation */}
          <div
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 cursor-pointer"
          >
            <img
              src={reel.videoUrl}
              alt={reel.caption}
              className="w-full h-full object-cover"
            />
            {/* Play/Pause Overlay Icon */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xl">
                  <Play size={28} className="ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Gradient Fade for Subtitles */}
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          {/* Spacer */}
          <div />

          {/* Bottom Content Area & Side Action Stack */}
          <div className="relative z-20 p-5 pb-6 flex items-end justify-between gap-4">
            
            {/* Left Column: Creator Identity, Caption & Music */}
            <div className="space-y-3 max-w-[280px]">
              {/* Creator Pill */}
              <div className="flex items-center gap-2.5">
                <Link href={`/c/${reel.creatorUsername}`}>
                  <img
                    src={reel.creatorAvatar}
                    alt={reel.creatorName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[var(--color-primary)]"
                  />
                </Link>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-sm text-white drop-shadow-md">
                      {reel.creatorName}
                    </span>
                    {reel.isVerified && (
                      <CheckCircle2 size={14} className="text-[var(--color-primary)] shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-white/70">
                    @{reel.creatorUsername}
                  </span>
                </div>
              </div>

              {/* Caption */}
              <p className="text-xs text-white/95 leading-relaxed font-medium line-clamp-3 drop-shadow-sm">
                {reel.caption}
              </p>

              {/* Music Marquee */}
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/80 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
                <Music2 size={12} className="animate-spin" />
                <span className="truncate max-w-[200px]">{reel.musicTitle}</span>
              </div>
            </div>

            {/* Right Column: Floating Action Icons Stack */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              
              {/* Like Button */}
              <button
                onClick={toggleLike}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 ${
                    isLiked
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 scale-110'
                      : 'bg-black/40 text-white group-hover:bg-black/60 border border-white/20'
                  }`}
                >
                  <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow-sm">
                  {isLiked ? reel.likesCount + 1 : reel.likesCount}
                </span>
              </button>

              {/* Comments Button */}
              <button
                onClick={() => setShowComments(true)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 group-hover:bg-black/60 border border-white/20 flex items-center justify-center text-white backdrop-blur-md transition-transform active:scale-90">
                  <MessageSquare size={19} />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow-sm">
                  {reel.commentsCount}
                </span>
              </button>

              {/* Tip Creator Button */}
              <button
                onClick={() => setIsTipModalOpen(true)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FF8A00] to-[#E52E71] flex items-center justify-center text-white shadow-md shadow-pink-500/30 transition-transform hover:scale-105 active:scale-90">
                  <Gift size={19} />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow-sm">Tip</span>
              </button>

              {/* Bookmark Button */}
              <button
                onClick={toggleSave}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 ${
                    isSaved
                      ? 'bg-[var(--color-primary)] text-white shadow-lg'
                      : 'bg-black/40 text-white group-hover:bg-black/60 border border-white/20'
                  }`}
                >
                  <Bookmark size={19} className={isSaved ? 'fill-current' : ''} />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow-sm">Save</span>
              </button>

              {/* Share Button */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 group-hover:bg-black/60 border border-white/20 flex items-center justify-center text-white backdrop-blur-md transition-transform active:scale-90">
                  <Share2 size={19} />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow-sm">Share</span>
              </button>

            </div>

          </div>
        </div>

        {/* Tip Modal */}
        <TipModal
          isOpen={isTipModalOpen}
          onClose={() => setIsTipModalOpen(false)}
          creatorName={reel.creatorName}
          creatorHandle={reel.creatorUsername}
          creatorAvatar={reel.creatorAvatar}
        />

        {/* Share Modal */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={`Check out ${reel.creatorName}'s reel on CreatorPulse!`}
        />

        {/* Comments Drawer */}
        <CommentsDrawer
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          postId={reel.id}
          postTitle={reel.caption}
        />

      </div>
    </MinimalLayout>
  );
}

export default ShortsPage;
