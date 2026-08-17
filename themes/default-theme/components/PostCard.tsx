'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, MessageSquare, Bookmark, Share2, Lock, Sparkles, 
  Play, Pause, Eye, Send, Check, BarChart2, Volume2, CheckCircle2, MoreHorizontal,
  Gift, CornerDownRight, X, ExternalLink
} from 'lucide-react';
import { Post, Comment } from '@/lib/supabase/store';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { TipModal } from './TipModal';
import { UnlockDropModal } from './UnlockDropModal';
import { ShareModal } from './ShareModal';
import { CommentsDrawer } from './CommentsDrawer';

export interface PostCardProps {
  post: Post;
  isMemberUnlocked?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, isMemberUnlocked = false }) => {
  const [likesCount, setLikesCount] = useState(post.likesCount || 360);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isUnlockedLocally, setIsUnlockedLocally] = useState(isMemberUnlocked);

  const isLocked = (post.visibility === 'members_only' || post.isPaywalled) && !isUnlockedLocally;

  const handleToggleLike = () => {
    if (isLiked) {
      setLikesCount(likesCount - 1);
      setIsLiked(false);
      setIsLiking(false);
    } else {
      setLikesCount(likesCount + 1);
      setIsLiked(true);
      setIsLiking(true);
      setTimeout(() => setIsLiking(false), 450);
    }
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
  };

  // Subtitle / Location mapping (fallback to mockup realistic locations)
  const locationSubtitle = post.authorCategory || 'Dubai, UAE';

  return (
    <div className="bg-white dark:bg-[#150D1E] rounded-[28px] border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md hover:border-[var(--color-primary)]/40 relative group/card">
      
      {/* 1. CARD HEADER */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <Link href={`/c/${post.authorUsername}`} className="flex items-center gap-2.5 min-w-0 flex-1 group/user">
          <Avatar
            alt={post.authorName}
            src={post.authorAvatar}
            size="sm"
            isVerified={post.authorVerified}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8] truncate group-hover/user:text-[var(--color-primary)] transition-colors">
              {post.authorName}
            </p>
            <p className="text-[10px] text-[#A1A1AA] dark:text-[#8E7890] truncate font-medium">
              {locationSubtitle}
            </p>
          </div>
        </Link>

        {/* Three Dots Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="p-1.5 rounded-full text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF9FC] dark:hover:bg-[#22152E] transition-colors cursor-pointer"
          >
            <MoreHorizontal size={16} />
          </button>

          {showOptionsMenu && (
            <div className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-[#1E122A] rounded-2xl border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-xl p-1.5 space-y-1 text-xs select-none">
              <button
                onClick={() => {
                  setIsShareModalOpen(true);
                  setShowOptionsMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-[#18181B] dark:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#2D162B] font-semibold transition-colors flex items-center gap-2"
              >
                <Share2 size={13} />
                <span>Share Post</span>
              </button>
              <button
                onClick={() => {
                  setIsTipModalOpen(true);
                  setShowOptionsMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-[var(--color-primary)] hover:bg-[#FFF1F7] dark:hover:bg-[#2D162B] font-bold transition-colors flex items-center gap-2"
              >
                <Gift size={13} />
                <span>Send Creator Tip</span>
              </button>
              <button
                onClick={() => setShowOptionsMenu(false)}
                className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors flex items-center gap-2"
              >
                <X size={13} />
                <span>Dismiss</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. CARD MEDIA ASSET */}
      <div className="relative w-full aspect-4/3 sm:aspect-square bg-slate-100 dark:bg-[#22152E] overflow-hidden">
        {post.mediaUrl ? (
          <img
            src={post.mediaUrl}
            alt={post.title || post.content}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-103"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-[#FFF9FC] to-[#FFF1F7] dark:from-[#22152E] dark:to-[#1A1024] text-center">
            <p className="text-sm font-semibold text-[#18181B] dark:text-[#FDF2F8] line-clamp-4">
              {post.content}
            </p>
          </div>
        )}

        {/* Lock Overlay for Exclusive Drops */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center text-white space-y-2">
            <div className="p-3 rounded-full bg-white/20 text-white backdrop-blur-md">
              <Lock size={20} />
            </div>
            <p className="text-xs font-bold">VIP Members Exclusive Content</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsUnlockModalOpen(true)}
              className="text-xs font-black"
            >
              Unlock Drop
            </Button>
          </div>
        )}
      </div>

      {/* 3. ACTION ICONS ROW */}
      <div className="p-3 sm:px-4 flex items-center justify-between pt-3">
        <div className="flex items-center gap-3">
          {/* Like Button */}
          <button
            onClick={handleToggleLike}
            className="transition-transform active:scale-125 cursor-pointer"
            title="Like Post"
          >
            <Heart
              size={22}
              className={`transition-colors duration-200 ${
                isLiked
                  ? 'text-[#F43F5E] fill-[#F43F5E]'
                  : 'text-[#18181B] dark:text-[#FDF2F8] hover:text-[#F43F5E]'
              } ${isLiking ? 'animate-ping' : ''}`}
            />
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowCommentsDrawer(true)}
            className="text-[#18181B] dark:text-[#FDF2F8] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
            title="Comment on Post"
          >
            <MessageSquare size={21} />
          </button>

          {/* Share Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="text-[#18181B] dark:text-[#FDF2F8] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
            title="Share Post"
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* Bookmark / Save Button */}
        <button
          onClick={handleToggleSave}
          className="transition-transform active:scale-125 cursor-pointer"
          title="Bookmark Post"
        >
          <Bookmark
            size={21}
            className={`transition-colors ${
              isSaved
                ? 'text-[var(--color-primary)] fill-[var(--color-primary)]'
                : 'text-[#18181B] dark:text-[#FDF2F8] hover:text-[var(--color-primary)]'
            }`}
          />
        </button>
      </div>

      {/* 4. LIKED BY & CAPTION SECTION */}
      <div className="px-3.5 sm:px-4 pb-4 space-y-1">
        {/* Liked by count text matching Mockup */}
        <p className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8]">
          Liked by <span className="font-bold">Andrew</span> and <span className="font-bold">{likesCount} others</span>
        </p>

        {/* Caption */}
        <div className="text-xs text-[#18181B] dark:text-[#FDF2F8] leading-relaxed">
          <p className={isCaptionExpanded ? '' : 'line-clamp-2'}>
            <Link href={`/c/${post.authorUsername}`} className="font-black mr-1 hover:underline">
              {post.authorName}
            </Link>
            <span className="font-normal">{post.content}</span>
          </p>
          {post.content && post.content.length > 80 && (
            <button
              onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
              className="text-[11px] text-[#A1A1AA] font-bold hover:underline cursor-pointer mt-0.5"
            >
              {isCaptionExpanded ? 'less' : '...more'}
            </button>
          )}
        </div>
      </div>

      {/* Interactive Comments Drawer */}
      <CommentsDrawer
        isOpen={showCommentsDrawer}
        onClose={() => setShowCommentsDrawer(false)}
        postId={post.id}
        postTitle={post.title || post.content}
      />

      {/* Tip Modal */}
      <TipModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        creatorName={post.authorName}
        creatorHandle={post.authorUsername}
        creatorAvatar={post.authorAvatar}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={post.title || post.content}
        url={`https://creatorpulse.com/feed?post=${post.id}`}
      />

      {/* Unlock Drop Modal */}
      <UnlockDropModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        postTitle={post.title || 'VIP Exclusive Masterclass Drop'}
        price={9.99}
        creatorName={post.authorName}
        creatorAvatar={post.authorAvatar}
        onUnlocked={() => setIsUnlockedLocally(true)}
      />
    </div>
  );
};

export default PostCard;
