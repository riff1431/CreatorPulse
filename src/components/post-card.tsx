'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, MessageSquare, Bookmark, Share2, Lock, Sparkles, 
  Play, Pause, Eye, Send, Check, BarChart2, Volume2, CheckCircle2 
} from 'lucide-react';
import { Post, Comment } from '@/lib/supabase/store';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { HookPoint } from '@/lib/extensions/plugin-engine';

interface PostCardProps {
  post: Post;
  isMemberUnlocked?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, isMemberUnlocked = false }) => {
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c-1',
      postId: post.id,
      userId: 'user-member',
      userName: 'Alex Vance',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      content: 'This micro-interaction trick completely transformed our landing page! Highly recommended.',
      createdAt: '30m ago'
    }
  ]);
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Poll state
  const [pollOptions, setPollOptions] = useState(post.poll?.options || []);
  const [userVotedId, setUserVotedId] = useState<string | undefined>(post.poll?.userVotedId);
  const [totalVotes, setTotalVotes] = useState(post.poll?.totalVotes || 0);

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isLocked = post.visibility === 'members_only' && !isMemberUnlocked;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

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
    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);
    triggerToast(nextSavedState ? "💾 Post saved to Bookmarks!" : "🗑️ Post removed from Bookmarks!");
  };

  const handleVote = (optionId: string) => {
    if (userVotedId) return; // already voted

    const updated = pollOptions.map((opt) =>
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );
    setPollOptions(updated);
    setUserVotedId(optionId);
    setTotalVotes(totalVotes + 1);
    triggerToast("🗳️ Thank you for voting!");
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const created: Comment = {
      id: `comment-${Date.now()}`,
      postId: post.id,
      userId: 'user-member',
      userName: 'Alex Vance',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      content: newCommentText.trim(),
      createdAt: 'Just now'
    };

    setComments([...comments, created]);
    setNewCommentText('');
    triggerToast("💬 Comment posted successfully!");
  };

  const handleToggleCommentLike = (commentId: string) => {
    if (likedCommentIds.includes(commentId)) {
      setLikedCommentIds(likedCommentIds.filter(id => id !== commentId));
    } else {
      setLikedCommentIds([...likedCommentIds, commentId]);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/feed#${post.id}`);
    setCopiedShare(true);
    triggerToast("🔗 Link copied to clipboard!");
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <article id={post.id} className="bg-white/90 backdrop-blur-md border border-[#F3DCE8] rounded-[24px] p-5 space-y-4 shadow-sm shadow-[#EC4899]/5 hover:shadow-md hover:shadow-[#EC4899]/10 transition-all relative">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={`/c/${post.authorUsername}`}>
            <Avatar
              alt={post.authorName}
              src={post.authorAvatar}
              size="md"
              isVerified={post.authorVerified}
            />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/c/${post.authorUsername}`}
                className="font-bold text-sm text-[#18181B] hover:text-[#EC4899] transition-colors"
              >
                {post.authorName}
              </Link>
              <span className="text-xs text-[#71717A]">@{post.authorUsername}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA] mt-0.5 font-medium">
              <span>{post.createdAt}</span>
              <span>•</span>
              <span className="text-[#BE185D] font-semibold">{post.authorCategory}</span>
            </div>
          </div>
        </div>

        {/* Visibility Badge */}
        {post.visibility === 'members_only' ? (
          <Badge variant="pink" size="sm">
            <Lock size={11} /> Members Only
          </Badge>
        ) : (
          <Badge variant="slate" size="sm">
            Public Post
          </Badge>
        )}
      </div>

      {/* Title */}
      {post.title && (
        <h3 className="text-base font-bold text-[#18181B] leading-snug">{post.title}</h3>
      )}

      {/* Content text */}
      <p className="text-sm text-[#3F3F46] leading-relaxed whitespace-pre-line font-normal">{post.content}</p>

      {/* Interactive Poll Component */}
      {post.postType === 'poll' && post.poll && (
        <div className="bg-[#FFF9FC] border border-[#F3DCE8] rounded-2xl p-4 space-y-3 shadow-inner">
          <div className="flex items-center gap-2 text-[#BE185D] font-bold text-xs">
            <BarChart2 size={16} className="text-[#EC4899]" />
            <span>{post.poll.question}</span>
          </div>

          <div className="space-y-2">
            {pollOptions.map((opt) => {
              const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              const isSelected = userVotedId === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  disabled={Boolean(userVotedId)}
                  className={`w-full text-left p-3 rounded-xl relative overflow-hidden transition-all text-xs font-semibold border ${
                    isSelected
                      ? 'border-[#EC4899] bg-[#FCE7F3] text-[#BE185D]'
                      : 'border-[#F3DCE8] bg-white text-[#18181B] hover:border-[#F472B6]/60'
                  }`}
                >
                  {/* Percentage background fill */}
                  {Boolean(userVotedId) && (
                    <div
                      style={{ width: `${percentage}%` }}
                      className="absolute inset-y-0 left-0 bg-[#FCE7F3]/60 transition-all duration-500"
                    ></div>
                  )}

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      {isSelected && <CheckCircle2 size={14} className="text-[#EC4899]" />}
                      {opt.text}
                    </span>
                    {Boolean(userVotedId) && (
                      <span className="font-bold text-[#BE185D]">{percentage}%</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <span className="text-[10px] text-[#A1A1AA] block text-right font-medium">
            {totalVotes} total vote{totalVotes === 1 ? '' : 's'}
          </span>
        </div>
      )}

      {/* Audio Post Player */}
      {post.postType === 'audio' && (
        <div className="bg-[#FFF1F7] border border-[#F3DCE8] rounded-2xl p-4 flex items-center gap-4">
          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className="w-12 h-12 rounded-full gradient-btn flex items-center justify-center text-white shadow-md shadow-[#EC4899]/25 shrink-0 hover:scale-105 transition-transform cursor-pointer"
          >
            {isPlayingAudio ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#18181B]">
              <span className="font-bold flex items-center gap-1.5 text-[#BE185D]">
                <Volume2 size={14} className="text-[#EC4899]" /> Audio Masterclass Note
              </span>
              <span className="text-[#71717A] font-medium">03:45</span>
            </div>
            <div className="h-2 bg-[#FCE7F3] rounded-full overflow-hidden">
              <div
                className={`h-full bg-[#EC4899] rounded-full transition-all duration-300 ${
                  isPlayingAudio ? 'w-2/5 animate-pulse' : 'w-0'
                }`}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Media or Lock overlay */}
      {post.mediaUrl && post.postType !== 'poll' && (
        <div className="relative rounded-2xl overflow-hidden bg-[#FFF9FC] border border-[#F3DCE8] max-h-[440px]">
          {isLocked ? (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] border border-[#FBCFE8] flex items-center justify-center text-[#EC4899] shadow-md shadow-[#EC4899]/10">
                <Lock size={22} />
              </div>
              <h4 className="text-base font-bold text-[#18181B]">Exclusive VIP Member Content</h4>
              <p className="text-xs text-[#71717A] max-w-sm font-normal">
                Subscribe to @{post.authorUsername} to unlock source code, masterclasses, and private posts.
              </p>
              <Link href={`/c/${post.authorUsername}`}>
                <Button variant="primary" size="sm" leftIcon={<Sparkles size={14} />}>
                  Unlock Membership ($9.99/mo)
                </Button>
              </Link>
            </div>
          ) : post.postType === 'video' ? (
            <div className="relative group cursor-pointer">
              <img
                src={post.thumbnailUrl || post.mediaUrl}
                alt={post.title || 'Video content'}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/15 transition-all">
                <div className="w-14 h-14 rounded-full bg-[#EC4899] flex items-center justify-center text-white shadow-xl shadow-[#EC4899]/40 group-hover:scale-110 transition-transform">
                  <Play size={24} className="ml-1 fill-white" />
                </div>
              </div>
            </div>
          ) : (
            <img
              src={post.mediaUrl}
              alt={post.title || 'Post image'}
              className="w-full h-auto max-h-96 object-cover"
            />
          )}
        </div>
      )}

      {/* Actions Footer */}
      <div className="flex items-center justify-between border-t border-[#F3DCE8] pt-3 text-xs text-[#71717A]">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 transition-all cursor-pointer ${
              isLiked ? 'text-[#EC4899] font-bold' : 'hover:text-[#EC4899]'
            }`}
          >
            <Heart 
              size={16} 
              className={`transition-transform duration-200 ${
                isLiked ? 'fill-[#EC4899] text-[#EC4899]' : 'hover:scale-110'
              } ${isLiking ? 'animate-heart-pop' : ''}`} 
            />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 hover:text-[#EC4899] transition-colors cursor-pointer"
          >
            <MessageSquare size={16} />
            <span>{comments.length} Comments</span>
          </button>

          <div className="flex items-center gap-1 text-[#A1A1AA] hidden sm:flex">
            <Eye size={14} />
            <span>{post.viewsCount} views</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 hover:text-[#EC4899] hover:bg-[#FDF2F8] transition-colors rounded-xl cursor-pointer"
            title="Share post"
          >
            {copiedShare ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
          </button>

          <button
            onClick={handleToggleSave}
            className={`p-2 transition-colors rounded-xl hover:bg-[#FDF2F8] cursor-pointer ${
              isSaved ? 'text-[#EC4899]' : 'hover:text-[#EC4899]'
            }`}
            title="Save post"
          >
            <Bookmark size={16} className={isSaved ? 'fill-[#EC4899]' : ''} />
          </button>
        </div>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="border-t border-[#F3DCE8] pt-3 space-y-3">
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-[11px] text-[#A1A1AA] text-center py-3 font-semibold">No comments yet. Support the creator by posting one!</p>
            ) : (
              comments.map((comment) => {
                const isCommentLiked = likedCommentIds.includes(comment.id);
                return (
                  <div key={comment.id} className="bg-[#FFF9FC] border border-[#F3DCE8] p-3 rounded-2xl flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 flex-1">
                      <Avatar alt={comment.userName} src={comment.userAvatar} size="sm" />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#18181B]">{comment.userName}</span>
                          <span className="text-[10px] text-[#A1A1AA] font-medium">{comment.createdAt}</span>
                        </div>
                        <p className="text-[#52525B] mt-1 font-normal leading-relaxed">{comment.content}</p>
                      </div>
                    </div>

                    {/* Like Comment Button */}
                    <button 
                      onClick={() => handleToggleCommentLike(comment.id)}
                      className={`text-[#A1A1AA] hover:text-[#EC4899] transition-colors p-1 rounded-lg ${
                        isCommentLiked ? 'text-[#EC4899]' : ''
                      }`}
                    >
                      <Heart size={12} className={isCommentLiked ? 'fill-[#EC4899] text-[#EC4899]' : ''} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Comments Emoji Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['❤️', '👍', '🔥', '😂', '😮', '👏', '🙌'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setNewCommentText((prev) => prev + emoji)}
                className="hover:scale-110 active:scale-95 transition-transform bg-[#FFF9FC] border border-[#F3DCE8] px-2.5 py-1 rounded-xl text-xs cursor-pointer font-normal"
              >
                {emoji}
              </button>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write a supportive comment..."
              className="flex-1 bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] focus:bg-white transition-colors"
            />
            <Button type="submit" variant="primary" size="sm" leftIcon={<Send size={12} />}>
              Post
            </Button>
          </form>
        </div>
      )}

      {/* Extensible Plugin Hook Point */}
      <HookPoint name="post_card_footer" context={{ post }} />

      {/* Floating Card Toast alert notice */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#18181B] text-white px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-[11px] font-bold border border-white/10 shadow-2xl z-50 animate-toast-in">
          <span>{toastMessage}</span>
        </div>
      )}
    </article>
  );
};
