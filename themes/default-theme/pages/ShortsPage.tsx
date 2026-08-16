'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MinimalLayout } from '../layouts/MinimalLayout';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { 
  Heart, MessageSquare, Share2, Play, Pause, Volume2, 
  VolumeX, Gift, Music2, ChevronUp, ChevronDown, Check, X, Send
} from 'lucide-react';

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
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    isVerified: true,
    caption: 'Behind the scenes at today’s UI Masterclass! Which color palette should we use next? 🎨✨',
    musicTitle: 'Original Audio • Lo-Fi Chill Waves',
    videoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    likesCount: 1420,
    commentsCount: 89,
    sharesCount: 34,
  },
  {
    id: 'reel-2',
    creatorName: 'Marcus Vance',
    creatorUsername: 'marcus_beats',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isVerified: true,
    caption: 'Cooking up a new synthwave drop in the studio. VIP stems dropping tomorrow! 🎹🔥',
    musicTitle: 'Marcus Vance • Cyber Beats 04',
    videoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    likesCount: 3200,
    commentsCount: 215,
    sharesCount: 92,
  },
];

export function ShortsPage() {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedReels, setLikedReels] = useState<string[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([
    { id: 'c1', user: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', text: 'This vibe is unmatched!' },
    { id: 'c2', user: 'Devin Cole', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', text: 'Can not wait for the stems to drop!' },
  ]);
  const [newComment, setNewComment] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const activeReel = MOCK_REELS[currentReelIndex];
  const isLiked = likedReels.includes(activeReel.id);

  const toggleLike = () => {
    if (isLiked) {
      setLikedReels(likedReels.filter((id) => id !== activeReel.id));
    } else {
      setLikedReels([...likedReels, activeReel.id]);
    }
  };

  const handleNext = () => {
    if (currentReelIndex < MOCK_REELS.length - 1) {
      setCurrentReelIndex(currentReelIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentReelIndex > 0) {
      setCurrentReelIndex(currentReelIndex - 1);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([...comments, { id: `c-${Date.now()}`, user: 'You', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', text: newComment.trim() }]);
    setNewComment('');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <MinimalLayout>
      <div className="flex justify-center items-center py-4 sm:py-8 px-2">
        <div className="relative w-full max-w-sm h-[78vh] sm:h-[82vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
          
          {/* Reel Media Preview */}
          <img
            src={activeReel.thumbnailUrl}
            alt={activeReel.caption}
            className="w-full h-full object-cover select-none"
            onClick={() => setIsPlaying(!isPlaying)}
          />

          {/* Top Controls Overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider border border-white/10">
              Reels
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors border border-white/10 cursor-pointer"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </div>

          {/* Pause / Play central overlay indicator */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-[#EC4899]/90 flex items-center justify-center text-white shadow-xl">
                <Play size={28} className="ml-1 fill-white" />
              </div>
            </div>
          )}

          {/* Right Action Rail */}
          <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 z-20">
            {/* Like */}
            <button
              onClick={toggleLike}
              className="flex flex-col items-center gap-1 text-white group cursor-pointer"
            >
              <div className={`p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform ${isLiked ? 'text-[#EC4899]' : ''}`}>
                <Heart size={20} className={isLiked ? 'fill-[#EC4899]' : ''} />
              </div>
              <span className="text-[10px] font-bold drop-shadow">{activeReel.likesCount + (isLiked ? 1 : 0)}</span>
            </button>

            {/* Comments */}
            <button
              onClick={() => setShowComments(true)}
              className="flex flex-col items-center gap-1 text-white group cursor-pointer"
            >
              <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
                <MessageSquare size={20} />
              </div>
              <span className="text-[10px] font-bold drop-shadow">{comments.length}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1 text-white group cursor-pointer"
            >
              <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
                {isCopied ? <Check size={20} className="text-emerald-400" /> : <Share2 size={20} />}
              </div>
              <span className="text-[10px] font-bold drop-shadow">Share</span>
            </button>

            {/* Tip Link */}
            <Link href={`/c/${activeReel.creatorUsername}`}>
              <div className="p-3 rounded-full bg-gradient-to-tr from-[#EC4899] to-[#F43F5E] text-white shadow-md shadow-pink-500/30 hover:scale-110 transition-transform">
                <Gift size={20} />
              </div>
            </Link>
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-0 left-0 right-14 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white space-y-2 z-20">
            <div className="flex items-center gap-2.5">
              <Link href={`/c/${activeReel.creatorUsername}`}>
                <Avatar alt={activeReel.creatorName} src={activeReel.creatorAvatar} size="sm" isVerified={activeReel.isVerified} />
              </Link>
              <Link href={`/c/${activeReel.creatorUsername}`} className="font-bold text-xs hover:underline">
                @{activeReel.creatorUsername}
              </Link>
              <Link
                href={`/c/${activeReel.creatorUsername}`}
                className="px-2.5 py-0.5 rounded-full bg-[#EC4899] hover:bg-[#DB2777] text-white font-extrabold text-[10px] transition-colors"
              >
                Follow
              </Link>
            </div>

            <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-normal">
              {activeReel.caption}
            </p>

            <div className="flex items-center gap-1.5 text-[10px] text-pink-300 font-bold">
              <Music2 size={12} className="animate-pulse" />
              <span className="truncate">{activeReel.musicTitle}</span>
            </div>
          </div>

          {/* Next / Prev Navigation Buttons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
            {currentReelIndex > 0 && (
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                title="Previous Reel"
              >
                <ChevronUp size={16} />
              </button>
            )}
            {currentReelIndex < MOCK_REELS.length - 1 && (
              <button
                onClick={handleNext}
                className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                title="Next Reel"
              >
                <ChevronDown size={16} />
              </button>
            )}
          </div>

          {/* Comments Drawer Overlay */}
          {showComments && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md p-4 flex flex-col justify-between z-30 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-white">
                <h4 className="text-xs font-bold">Comments ({comments.length})</h4>
                <button onClick={() => setShowComments(false)} className="p-1 rounded-lg hover:bg-white/10">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
                {comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2 text-white text-xs">
                    <Avatar alt={c.user} src={c.avatar} size="xs" />
                    <div>
                      <span className="font-bold text-slate-300 block">{c.user}</span>
                      <p className="text-slate-100">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-white/10">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#EC4899]"
                />
                <Button type="submit" variant="primary" size="sm">
                  <Send size={12} />
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </MinimalLayout>
  );
}

export default ShortsPage;
