'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, MessageSquare, Bookmark, Share2, Lock, Sparkles, 
  Play, Pause, Eye, Send, Check, BarChart2, Volume2, CheckCircle2, MoreHorizontal,
  Gift, CornerDownRight, X, ExternalLink
} from 'lucide-react';
import { Post } from '@/lib/supabase/store';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { TipModal } from './TipModal';
import { UnlockDropModal } from './UnlockDropModal';
import { ShareModal } from './ShareModal';
import { PostDetailModal } from './PostDetailModal';
import { useAuth } from '@/lib/auth/auth-context';
import { checkUserEntitlement } from '@/lib/memberships/entitlement-service';

export interface PostCardProps {
  post: Post;
  isMemberUnlocked?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, isMemberUnlocked = false }) => {
  const { user, requireAuth } = useAuth();
  const [likesCount, setLikesCount] = useState(post.likesCount || 360);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 24);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [showPostDetailModal, setShowPostDetailModal] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isUnlockedLocally, setIsUnlockedLocally] = useState(isMemberUnlocked);

  // Dynamic entitlement check
  const currentUserId = user?.id || 'user-member-1';
  const hasEntitlement = checkUserEntitlement(currentUserId, post.authorId, 'can_view_vip_posts');

  const isLocked = (post.visibility === 'members_only' || post.isPaywalled) && !isUnlockedLocally && !hasEntitlement && currentUserId !== post.authorId;

  const handleToggleLike = () => {
    requireAuth(() => {
      if (isLiked) {
        setLikesCount((prev) => Math.max(0, prev - 1));
        setIsLiked(false);
        setIsLiking(false);
      } else {
        setLikesCount((prev) => prev + 1);
        setIsLiked(true);
        setIsLiking(true);
        setTimeout(() => setIsLiking(false), 450);
      }
    }, { 
      title: `Like ${post.authorName}'s Post`, 
      subtitle: 'Sign in to appreciate creators and save your interaction history.' 
    });
  };

  const handleToggleSave = () => {
    requireAuth(() => {
      setIsSaved(!isSaved);
    }, {
      title: 'Save to Bookmarks',
      subtitle: 'Sign in to bookmark your favorite creator posts and access them anytime.'
    });
  };

  // Subtitle / Location mapping (fallback to mockup realistic locations)
  const locationSubtitle = post.authorCategory || 'Dubai, UAE';

  return (
    <div className="bg-white dark:bg-[#150D1E] rounded-[28px] border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md hover:border-[#EC4899]/40 relative group/card">
      
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
            <p className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8] truncate group-hover/user:text-[#EC4899] transition-colors">
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
            title="Options"
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
                className="w-full text-left px-3 py-2 rounded-xl text-[#EC4899] hover:bg-[#FFF1F7] dark:hover:bg-[#2D162B] font-bold transition-colors flex items-center gap-2"
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

      {/* 2. CARD MEDIA ASSET (Clickable to open Post Detail Modal) */}
      <div 
        onClick={() => setShowPostDetailModal(true)}
        className="relative w-full aspect-4/3 sm:aspect-square bg-slate-100 dark:bg-[#22152E] overflow-hidden cursor-pointer group/media"
      >
        {post.mediaUrl ? (
          <img
            src={post.mediaUrl}
            alt={post.title || post.content}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/media:scale-103"
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
          <div 
            onClick={(e) => {
              e.stopPropagation();
              requireAuth(() => setIsUnlockModalOpen(true), {
                title: 'Unlock Exclusive Drop',
                subtitle: 'Sign in to access VIP subscriber drops, premium videos, and media sets.',
              });
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center text-white space-y-2 cursor-pointer"
          >
            <div className="p-3 rounded-full bg-white/20 text-white backdrop-blur-md">
              <Lock size={20} />
            </div>
            <p className="text-xs font-bold">VIP Members Exclusive Content</p>
            <Button
              variant="primary"
              size="sm"
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
            aria-label="Like post"
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

          {/* Comment Button (Opens Post Detail Modal) */}
          <button
            onClick={() => setShowPostDetailModal(true)}
            className="text-[#18181B] dark:text-[#FDF2F8] hover:text-[#EC4899] transition-colors cursor-pointer"
            title="Comment on Post"
            aria-label="Comment on post"
          >
            <MessageSquare size={21} />
          </button>

          {/* Share Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="text-[#18181B] dark:text-[#FDF2F8] hover:text-[#EC4899] transition-colors cursor-pointer"
            title="Share Post"
            aria-label="Share post"
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* Bookmark / Save Button */}
        <button
          onClick={handleToggleSave}
          className="transition-transform active:scale-125 cursor-pointer"
          title="Bookmark Post"
          aria-label="Bookmark post"
        >
          <Bookmark
            size={21}
            className={`transition-colors ${
              isSaved
                ? 'text-[#EC4899] fill-[#EC4899]'
                : 'text-[#18181B] dark:text-[#FDF2F8] hover:text-[#EC4899]'
            }`}
          />
        </button>
      </div>

      {/* 4. LIKED BY & CAPTION SECTION */}
      <div className="px-3.5 sm:px-4 pb-4 space-y-1">
        {/* Liked by count text */}
        <p 
          onClick={() => setShowPostDetailModal(true)}
          className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8] cursor-pointer hover:underline"
        >
          Liked by <span className="font-bold">Andrew</span> and <span className="font-bold">{likesCount} others</span>
        </p>

        {/* Caption */}
        <div className="text-xs text-[#18181B] dark:text-[#FDF2F8] leading-relaxed">
          <p className={isCaptionExpanded ? '' : 'line-clamp-2'}>
            <Link href={`/c/${post.authorUsername}`} className="font-black mr-1 hover:underline">
              {post.authorName}
            </Link>
            <span 
              onClick={() => setShowPostDetailModal(true)}
              className="font-normal cursor-pointer"
            >
              {post.content}
            </span>
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

        {/* View all comments preview link */}
        <button
          onClick={() => setShowPostDetailModal(true)}
          className="text-[11px] text-[#A1A1AA] hover:text-[#EC4899] font-medium transition-colors cursor-pointer block pt-0.5"
        >
          View all {commentsCount} comments
        </button>
      </div>

      {/* Full Post Detail & Comments Modal */}
      <PostDetailModal
        isOpen={showPostDetailModal}
        onClose={() => setShowPostDetailModal(false)}
        post={post}
        isLiked={isLiked}
        likesCount={likesCount}
        onToggleLike={handleToggleLike}
        isSaved={isSaved}
        onToggleSave={handleToggleSave}
        onCommentAdded={(newCount) => setCommentsCount(newCount)}
        isMemberUnlocked={isUnlockedLocally}
      />

      {/* Tip Creator Modal */}
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

      {/* Unlock VIP Drop Modal */}
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
