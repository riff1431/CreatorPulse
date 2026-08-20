'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Heart, MessageSquare, Bookmark, Share2, Lock, Sparkles, 
  Send, X, MoreHorizontal, Gift, Check, Copy, CheckCircle2,
  ShieldCheck, ArrowRight, CornerDownRight, Smile, ExternalLink,
  Volume2, Play, Users, Eye
} from 'lucide-react';
import { Post } from '@/lib/supabase/store';
import { createPortal } from 'react-dom';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { TipModal } from './TipModal';
import { ShareModal } from './ShareModal';
import { UnlockDropModal } from './UnlockDropModal';
import { useAuth } from '@/lib/auth/auth-context';

export interface CommentItem {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    isVip?: boolean;
    isVerified?: boolean;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

const DEFAULT_POST_COMMENTS: Record<string, CommentItem[]> = {
  default: [
    {
      id: 'c1',
      author: {
        name: 'Marcus Vance',
        username: 'marcuscode',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        isVip: true,
        isVerified: true,
      },
      content: 'The lighting composition and tones in this shot are stunning! Truly masterclass work 🎨🔥',
      createdAt: '25m ago',
      likes: 14,
      isLiked: true,
    },
    {
      id: 'c2',
      author: {
        name: 'Elena Rostova',
        username: 'elenadesign',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        isVip: false,
        isVerified: true,
      },
      content: 'Loving the vibrant aesthetic and depth. Would love to see a behind-the-scenes breakdown!',
      createdAt: '1h ago',
      likes: 8,
      isLiked: false,
    },
    {
      id: 'c3',
      author: {
        name: 'David Kim',
        username: 'davidbeats',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        isVip: true,
      },
      content: 'VIP tier subscriber here — best creator content on my daily feed! Keep inspiring us ✨',
      createdAt: '3h ago',
      likes: 21,
      isLiked: false,
    },
  ],
};

const QUICK_EMOJIS = ['🔥', '❤️', '👏', '💎', '🚀', '✨', '😍', '🙌'];

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  isLiked: boolean;
  likesCount: number;
  onToggleLike: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  onCommentAdded?: (newCount: number) => void;
  isMemberUnlocked?: boolean;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  isOpen,
  onClose,
  post,
  isLiked,
  likesCount,
  onToggleLike,
  isSaved,
  onToggleSave,
  onCommentAdded,
  isMemberUnlocked = false,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isUnlockedLocally, setIsUnlockedLocally] = useState(isMemberUnlocked);
  const [mounted, setMounted] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentsListRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLocked = (post.visibility === 'members_only' || post.isPaywalled) && !isUnlockedLocally;

  // Initialize comments on open
  useEffect(() => {
    if (isOpen) {
      const initial = DEFAULT_POST_COMMENTS[post.id] || DEFAULT_POST_COMMENTS.default;
      setComments(initial);
    }
  }, [isOpen, post.id]);

  // Lock background scroll & Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  const handleMediaDoubleClick = () => {
    if (!isLiked) {
      onToggleLike();
    }
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 800);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: `c_${Date.now()}`,
      author: {
        name: user?.fullName || 'Abhinav Khare',
        username: user?.username || 'abhi_navkhare',
        avatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        isVip: true,
        isVerified: true,
      },
      content: newCommentText.trim(),
      createdAt: 'Just now',
      likes: 0,
      isLiked: false,
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    setNewCommentText('');
    onCommentAdded?.((post.commentsCount || 0) + 1);

    // Smooth scroll to top of comments
    if (commentsListRef.current) {
      commentsListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleCommentLike = (id: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            likes: c.isLiked ? c.likes - 1 : c.likes + 1,
            isLiked: !c.isLiked,
          };
        }
        return c;
      })
    );
  };

  const handleReplyTo = (username: string) => {
    setNewCommentText(`@${username} `);
    commentInputRef.current?.focus();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md transition-opacity duration-200 animate-in fade-in select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-4xl md:max-w-5xl lg:max-w-5xl bg-white dark:bg-[#150D1E] rounded-t-[28px] sm:rounded-[32px] border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] md:h-[640px] md:max-h-[88vh] animate-in zoom-in-95 slide-in-from-bottom-4 md:slide-in-from-bottom-0 duration-200"
      >
        {/* Mobile drag handle */}
        <div className="md:hidden w-10 h-1.5 bg-[#E4E4E7] dark:bg-[#3A2A4C] rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        {/* ========================================================================= */}
        {/* LEFT COLUMN: Media Container (Image / Asset display)                     */}
        {/* ========================================================================= */}
        <div 
          onDoubleClick={handleMediaDoubleClick}
          className="relative w-full md:w-7/12 bg-black/90 dark:bg-black/95 flex items-center justify-center overflow-hidden shrink-0 aspect-4/3 sm:aspect-square md:aspect-auto md:h-full cursor-pointer group"
        >
          {post.mediaUrl ? (
            <img
              src={post.mediaUrl}
              alt={post.title || post.content}
              className="w-full h-full object-contain max-h-[40vh] sm:max-h-[50vh] md:max-h-full transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-[#FFF9FC] to-[#FFF1F7] dark:from-[#22152E] dark:to-[#1A1024] text-center">
              <p className="text-base font-semibold text-[#18181B] dark:text-[#FDF2F8] max-w-sm">
                {post.content}
              </p>
            </div>
          )}

          {/* Double tap heart overlay */}
          {showHeartOverlay && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-200">
              <Heart size={90} className="text-[#F43F5E] fill-[#F43F5E] drop-shadow-2xl animate-ping" />
            </div>
          )}

          {/* Lock Overlay for Exclusive Drops */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
              <div className="p-4 rounded-full bg-white/20 text-white backdrop-blur-md">
                <Lock size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black">VIP Exclusive Post Drop</h4>
                <p className="text-xs text-white/80 max-w-xs">
                  Unlock full 4K project media, high-res source files, and VIP discussions.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUnlockModalOpen(true);
                }}
                className="text-xs font-black px-5 py-2.5 shadow-lg shadow-pink-500/25 cursor-pointer"
              >
                Unlock VIP Drop ($9.99)
              </Button>
            </div>
          )}

          {/* Double click helper tooltip */}
          <span className="hidden md:inline-block absolute bottom-3 left-3 text-[10px] text-white/60 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full pointer-events-none">
            Double-click to like
          </span>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Author Header, Comments Scroll, Actions & Composer        */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#150D1E] overflow-hidden">
          
          {/* 1. Author Header */}
          <div className="p-3 sm:p-4 border-b border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between shrink-0 bg-white/70 dark:bg-[#150D1E]/70 backdrop-blur-md gap-3">
            <Link
              href={`/c/${post.authorUsername}`}
              onClick={onClose}
              className="flex items-center gap-2.5 min-w-0 flex-1 group/user"
            >
              <Avatar
                alt={post.authorName}
                src={post.authorAvatar}
                size="sm"
                isVerified={post.authorVerified}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8] truncate group-hover/user:text-[#EC4899] transition-colors">
                    {post.authorName}
                  </p>
                  {post.authorVerified && (
                    <ShieldCheck size={13} className="text-[#EC4899] shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-[#A1A1AA] dark:text-[#8E7890] truncate font-medium">
                  {post.authorCategory || 'Dubai, UAE'}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                  isFollowing
                    ? 'bg-[#F4F4F6] dark:bg-[#22152E] text-[#71717A] dark:text-[#D4B8D0] hover:text-red-500'
                    : 'bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white shadow-xs hover:opacity-95'
                }`}
              >
                {isFollowing ? 'Following' : '+ Follow'}
              </button>

              {/* Options menu */}
              <div className="relative">
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="p-1.5 rounded-xl text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-[#F4F4F6] dark:hover:bg-[#22152E] transition-colors cursor-pointer"
                  title="More options"
                >
                  <MoreHorizontal size={17} />
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

              {/* Close Modal Button */}
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl bg-[#F4F4F6] dark:bg-[#22152E] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-[#E4E4E7] dark:hover:bg-[#2E1D3E] transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* 2. Scrollable Content: Caption + Comments Feed */}
          <div 
            ref={commentsListRef}
            className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 min-h-[160px]"
          >
            {/* Post Caption Block */}
            <div className="flex items-start gap-3 pb-3 border-b border-[#F3DCE8]/80 dark:border-[#3A2A4C]/80">
              <Avatar
                alt={post.authorName}
                src={post.authorAvatar}
                size="sm"
                isVerified={post.authorVerified}
                className="shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#18181B] dark:text-[#FDF2F8] leading-relaxed break-words">
                  <Link
                    href={`/c/${post.authorUsername}`}
                    onClick={onClose}
                    className="font-extrabold mr-1.5 hover:text-[#EC4899] transition-colors inline"
                  >
                    {post.authorName}
                  </Link>
                  <span className="font-normal">{post.content}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-[#A1A1AA] font-semibold">
                  <span>{post.createdAt || '2h ago'}</span>
                  <span>•</span>
                  <span className="text-[#EC4899] font-bold">Author</span>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3.5">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5 group/comment">
                  <Avatar
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    size="sm"
                    className="shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="bg-[#FFF9FC] dark:bg-[#20142C] p-2.5 sm:p-3 rounded-2xl border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90">
                      <div className="flex items-center justify-between mb-0.5 gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8] truncate">
                            {comment.author.name}
                          </span>
                          {comment.author.isVip && (
                            <span className="px-1.5 py-0.2 rounded bg-pink-100 dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] text-[8px] font-black uppercase">
                              VIP
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#A1A1AA] shrink-0 font-medium">
                          {comment.createdAt}
                        </span>
                      </div>
                      <p className="text-xs text-[#3F3F46] dark:text-[#E4D4E2] leading-relaxed break-words font-medium">
                        {comment.content}
                      </p>
                    </div>

                    {/* Comment Actions row */}
                    <div className="flex items-center gap-3.5 pl-2 text-[11px] text-[#71717A] dark:text-[#A1A1AA] font-bold">
                      <button
                        onClick={() => toggleCommentLike(comment.id)}
                        className={`flex items-center gap-1 cursor-pointer transition-colors ${
                          comment.isLiked ? 'text-[#F43F5E]' : 'hover:text-[#18181B] dark:hover:text-white'
                        }`}
                      >
                        <Heart size={11} className={comment.isLiked ? 'fill-current' : ''} />
                        <span>{comment.likes}</span>
                      </button>
                      <button
                        onClick={() => handleReplyTo(comment.author.username)}
                        className="hover:text-[#EC4899] cursor-pointer flex items-center gap-0.5"
                      >
                        <CornerDownRight size={10} />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Action Icons & Likes Count Bar */}
          <div className="p-3 sm:px-4 border-t border-[#F3DCE8] dark:border-[#3A2A4C] bg-[#FFF9FC]/50 dark:bg-[#1A1222]/50 shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Like Button */}
                <button
                  onClick={onToggleLike}
                  className="transition-transform active:scale-125 cursor-pointer"
                  title="Like Post"
                >
                  <Heart
                    size={22}
                    className={`transition-colors duration-200 ${
                      isLiked
                        ? 'text-[#F43F5E] fill-[#F43F5E]'
                        : 'text-[#18181B] dark:text-[#FDF2F8] hover:text-[#F43F5E]'
                    }`}
                  />
                </button>

                {/* Comment Button */}
                <button
                  onClick={() => commentInputRef.current?.focus()}
                  className="text-[#18181B] dark:text-[#FDF2F8] hover:text-[#EC4899] transition-colors cursor-pointer"
                  title="Focus comment box"
                >
                  <MessageSquare size={21} />
                </button>

                {/* Share Button */}
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="text-[#18181B] dark:text-[#FDF2F8] hover:text-[#EC4899] transition-colors cursor-pointer"
                  title="Share Post"
                >
                  <Share2 size={20} />
                </button>

                {/* Tip Creator Button */}
                <button
                  onClick={() => setIsTipModalOpen(true)}
                  className="text-[#18181B] dark:text-[#FDF2F8] hover:text-[#FF8A00] transition-colors cursor-pointer"
                  title="Send Creator Tip"
                >
                  <Gift size={20} />
                </button>
              </div>

              {/* Bookmark / Save Button */}
              <button
                onClick={onToggleSave}
                className="transition-transform active:scale-125 cursor-pointer"
                title="Bookmark Post"
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

            {/* Liked by count */}
            <div className="flex items-center justify-between text-xs font-black text-[#18181B] dark:text-[#FDF2F8]">
              <p>
                Liked by <span className="font-bold">Andrew</span> and <span className="font-bold">{likesCount} others</span>
              </p>
              <span className="text-[10px] font-semibold text-[#A1A1AA]">
                {comments.length} comments
              </span>
            </div>
          </div>

          {/* 4. Quick Emoji Picker Row */}
          <div className="px-3 sm:px-4 py-1.5 bg-[#FFF9FC] dark:bg-[#1C1026] border-t border-[#F3DCE8]/80 dark:border-[#3A2A4C]/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setNewCommentText((prev) => prev + emoji)}
                className="p-1 text-sm hover:scale-125 transition-transform cursor-pointer shrink-0"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* 5. Comment Input Composer with Mobile Safe-Area */}
          <form
            onSubmit={handleAddComment}
            className="p-2.5 sm:p-3 bg-white dark:bg-[#150D1E] border-t border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center gap-2 shrink-0 pb-[max(env(safe-area-inset-bottom),0.625rem)]"
          >
            <input
              ref={commentInputRef}
              type="text"
              placeholder="Add a comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="flex-1 px-3.5 py-2 sm:py-2.5 rounded-full bg-[#F4F4F6] dark:bg-[#22152E] border border-transparent focus:border-[#EC4899] text-xs sm:text-[13px] text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none transition-all font-medium min-w-0"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="p-2.5 sm:p-3 rounded-full bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white hover:opacity-95 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-md shadow-pink-500/20"
              title="Post comment"
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      </div>

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
    </div>,
    document.body
  );
};

export default PostDetailModal;
