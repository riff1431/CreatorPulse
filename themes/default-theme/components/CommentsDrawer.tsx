'use client';

import React, { useState } from 'react';
import { 
  X, MessageSquare, Send, Heart, Smile, 
  CornerDownRight, MoreHorizontal, Sparkles 
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface Comment {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    isVip?: boolean;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  postTitle?: string;
}

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c1',
    author: {
      name: 'Marcus Vance',
      username: 'marcuscode',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      isVip: true
    },
    content: 'The lighting in this 3D render breakdown is incredible! Downloading the project files right now.',
    createdAt: '25m ago',
    likes: 12,
    isLiked: true
  },
  {
    id: 'c2',
    author: {
      name: 'Elena Rostova',
      username: 'elenadesign',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isVip: false
    },
    content: 'Can you do a follow up on the procedural texturing workflow in the next drop?',
    createdAt: '1h ago',
    likes: 5,
    isLiked: false
  },
  {
    id: 'c3',
    author: {
      name: 'David Kim',
      username: 'davidk',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isVip: true
    },
    content: 'VIP tier 2 subscriber here, best investment for my daily design inspiration! 🔥',
    createdAt: '3h ago',
    likes: 18,
    isLiked: false
  }
];

const QUICK_EMOJIS = ['🔥', '❤️', '👏', '💎', '🚀', '✨', '😍', '🙌'];

export function CommentsDrawer({
  isOpen,
  onClose,
  postId,
  postTitle = 'Community Discussion'
}: CommentsDrawerProps) {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');

  if (!isOpen) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newC: Comment = {
      id: `c_${Date.now()}`,
      author: {
        name: 'Alex Vance',
        username: 'alexvance',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        isVip: true
      },
      content: newCommentText.trim(),
      createdAt: 'Just now',
      likes: 0,
      isLiked: false
    };

    setComments([newC, ...comments]);
    setNewCommentText('');
  };

  const toggleCommentLike = (id: string) => {
    setComments(comments.map(c => {
      if (c.id === id) {
        return {
          ...c,
          likes: c.isLiked ? c.likes - 1 : c.likes + 1,
          isLiked: !c.isLiked
        };
      }
      return c;
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-lg bg-white dark:bg-[#150D1E] rounded-t-3xl sm:rounded-3xl border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 relative flex flex-col max-h-[85vh] h-[600px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between bg-[#FFF9FC] dark:bg-[#1C1026]">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-[#EC4899]" />
            <div>
              <h3 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8]">
                Comments ({comments.length})
              </h3>
              <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] truncate max-w-[260px]">
                {postTitle}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Comments Feed List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3 group">
              <Avatar src={c.author.avatar} alt={c.author.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="bg-[#FFF9FC] dark:bg-[#22152E] p-3 rounded-2xl border border-[#F3DCE8] dark:border-[#3A2A4C]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8] truncate">
                        {c.author.name}
                      </span>
                      {c.author.isVip && (
                        <span className="px-1.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-[#BE185D] dark:text-[#F472B6] text-[9px] font-black uppercase tracking-wider">
                          VIP
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#A1A1AA]">
                      {c.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-[#3F3F46] dark:text-[#E4D4E2] leading-relaxed">
                    {c.content}
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-1.5 pl-2 text-[11px] text-[#71717A] dark:text-[#D4B8D0] font-bold">
                  <button 
                    onClick={() => toggleCommentLike(c.id)}
                    className={`flex items-center gap-1 cursor-pointer transition-colors ${
                      c.isLiked ? 'text-[#F43F5E]' : 'hover:text-[#18181B]'
                    }`}
                  >
                    <Heart size={12} className={c.isLiked ? 'fill-current' : ''} />
                    <span>{c.likes}</span>
                  </button>
                  <button className="hover:text-[#18181B] cursor-pointer">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Emoji Reaction Bar */}
        <div className="px-4 py-2 bg-[#FFF9FC] dark:bg-[#1C1026] border-t border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setNewCommentText(prev => prev + emoji)}
              className="p-1 text-sm hover:scale-125 transition-transform cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input Composer */}
        <form 
          onSubmit={handleAddComment}
          className="p-3 bg-white dark:bg-[#150D1E] border-t border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Write a comment..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim()}
            className="p-2.5 rounded-2xl bg-[#EC4899] text-white hover:bg-[#DB2777] transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
