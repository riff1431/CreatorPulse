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

interface PostCardProps {
  post: Post;
  isMemberUnlocked?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, isMemberUnlocked = false }) => {
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
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
  const [newCommentText, setNewCommentText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  // Poll state
  const [pollOptions, setPollOptions] = useState(post.poll?.options || []);
  const [userVotedId, setUserVotedId] = useState<string | undefined>(post.poll?.userVotedId);
  const [totalVotes, setTotalVotes] = useState(post.poll?.totalVotes || 0);

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isLocked = post.visibility === 'members_only' && !isMemberUnlocked;

  const handleToggleLike = () => {
    if (isLiked) {
      setLikesCount(likesCount - 1);
      setIsLiked(false);
    } else {
      setLikesCount(likesCount + 1);
      setIsLiked(true);
    }
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleVote = (optionId: string) => {
    if (userVotedId) return; // already voted

    const updated = pollOptions.map((opt) =>
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );
    setPollOptions(updated);
    setUserVotedId(optionId);
    setTotalVotes(totalVotes + 1);
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
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/feed#${post.id}`);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <article id={post.id} className="glass-card p-5 space-y-4 transition-all">
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
                className="font-bold text-sm text-slate-100 hover:text-cyan-400 transition-colors"
              >
                {post.authorName}
              </Link>
              <span className="text-xs text-slate-400">@{post.authorUsername}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>{post.createdAt}</span>
              <span>•</span>
              <span className="text-cyan-400 font-medium">{post.authorCategory}</span>
            </div>
          </div>
        </div>

        {/* Visibility Badge */}
        {post.visibility === 'members_only' ? (
          <Badge variant="indigo" size="sm">
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
        <h3 className="text-base font-bold text-slate-100 leading-snug">{post.title}</h3>
      )}

      {/* Content text */}
      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{post.content}</p>

      {/* Interactive Poll Component */}
      {post.postType === 'poll' && post.poll && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
            <BarChart2 size={16} />
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
                  className={`w-full text-left p-3 rounded-xl relative overflow-hidden transition-all text-xs font-medium border ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {/* Percentage background fill */}
                  {Boolean(userVotedId) && (
                    <div
                      style={{ width: `${percentage}%` }}
                      className="absolute inset-y-0 left-0 bg-cyan-500/15 transition-all duration-500"
                    ></div>
                  )}

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      {isSelected && <CheckCircle2 size={13} className="text-cyan-400" />}
                      {opt.text}
                    </span>
                    {Boolean(userVotedId) && (
                      <span className="font-bold text-cyan-300">{percentage}%</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <span className="text-[10px] text-slate-400 block text-right">
            {totalVotes} total vote{totalVotes === 1 ? '' : 's'}
          </span>
        </div>
      )}

      {/* Audio Post Player */}
      {post.postType === 'audio' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className="w-12 h-12 rounded-full gradient-btn flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0"
          >
            {isPlayingAudio ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Volume2 size={14} className="text-cyan-400" /> Audio Masterclass Note
              </span>
              <span className="text-slate-500">03:45</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-cyan-400 rounded-full transition-all duration-300 ${
                  isPlayingAudio ? 'w-2/5 animate-pulse' : 'w-0'
                }`}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Media or Lock overlay */}
      {post.mediaUrl && post.postType !== 'poll' && (
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-[420px]">
          {isLocked ? (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Lock size={24} />
              </div>
              <h4 className="text-base font-bold text-slate-100">Exclusive VIP Member Content</h4>
              <p className="text-xs text-slate-400 max-w-sm">
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
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                <div className="w-14 h-14 rounded-full bg-cyan-500/90 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30 group-hover:scale-110 transition-transform">
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
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 transition-colors ${
              isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-400'
            }`}
          >
            <Heart size={16} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
          >
            <MessageSquare size={16} />
            <span>{comments.length} Comments</span>
          </button>

          <div className="flex items-center gap-1 text-slate-500 hidden sm:flex">
            <Eye size={14} />
            <span>{post.viewsCount} views</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-1.5 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-900"
            title="Share post"
          >
            {copiedShare ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
          </button>

          <button
            onClick={handleToggleSave}
            className={`p-1.5 transition-colors rounded-lg hover:bg-slate-900 ${
              isSaved ? 'text-cyan-400' : 'hover:text-cyan-400'
            }`}
            title="Save post"
          >
            <Bookmark size={16} className={isSaved ? 'fill-cyan-400' : ''} />
          </button>
        </div>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="border-t border-slate-800 pt-3 space-y-3">
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-slate-900/60 p-2.5 rounded-xl flex items-start gap-2.5">
                <Avatar alt={comment.userName} src={comment.userAvatar} size="sm" />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{comment.userName}</span>
                    <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                  </div>
                  <p className="text-slate-300 mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <Button type="submit" variant="primary" size="sm" leftIcon={<Send size={12} />}>
              Post
            </Button>
          </form>
        </div>
      )}
    </article>
  );
};
