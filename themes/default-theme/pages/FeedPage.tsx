'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { 
  PlusSquare, Sparkles, Lock, Filter, Search, TrendingUp, 
  Users, CheckCircle2, ChevronRight, Image as ImageIcon, Video, Vote, BarChart2, AlertCircle 
} from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { StoryBar } from '../components/StoryBar';
import { PostCard } from '../components/PostCard';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Select } from '../components/Select';
import { MOCK_POSTS, MOCK_CREATOR_DETAILS, Post } from '@/lib/supabase/store';
import { useAuth } from '@/lib/auth/auth-context';
import { PluginSlot } from '@/lib/extensions/plugin-slot';

export function FeedPage() {
  const { user, role } = useAuth();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [feedTab, setFeedTab] = useState<'for_you' | 'following' | 'subscribed'>('for_you');
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  
  // Publisher options
  const [activePublishType, setActivePublishType] = useState<'text' | 'image' | 'poll'>('text');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostVisibility, setNewPostVisibility] = useState<'public' | 'members_only'>('public');

  const feedContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedContainerRef.current) {
      gsap.fromTo(
        feedContainerRef.current.children,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out', overwrite: 'auto' }
      );
    }
  }, [feedTab]);

  const [imageUrl, setImageUrl] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOpt1, setPollOpt1] = useState('');
  const [pollOpt2, setPollOpt2] = useState('');

  // Simulate loader on feed tab switcher
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsFeedLoading(true);
    }, 0);
    const timer2 = setTimeout(() => {
      setIsFeedLoading(false);
    }, 400);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [feedTab]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && activePublishType !== 'poll') return;
    if (activePublishType === 'poll' && (!pollQuestion.trim() || !pollOpt1.trim() || !pollOpt2.trim())) return;

    const created: Post = {
      id: `post-${Date.now()}`,
      authorId: user?.id || (role === 'creator' ? 'user-creator-1' : 'user-member'),
      authorName: user?.fullName || (role === 'creator' ? 'Sarah Jenkins' : 'Alex Vance'),
      authorUsername: user?.username || (role === 'creator' ? 'sarahdesign' : 'alexvance'),
      authorAvatar: user?.avatarUrl || (role === 'creator'
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
      authorVerified: role === 'creator' || user?.isVerified || false,
      authorCategory: user?.category || 'Art & Design',
      title: newPostTitle || undefined,
      content: activePublishType === 'poll' ? `Poll: ${pollQuestion}` : newPostContent,
      postType: activePublishType,
      mediaUrl: activePublishType === 'image' ? imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600' : undefined,
      poll: activePublishType === 'poll' ? {
        question: pollQuestion,
        options: [
          { id: 'o-1', text: pollOpt1, votes: 0 },
          { id: 'o-2', text: pollOpt2, votes: 0 }
        ],
        totalVotes: 0
      } : undefined,
      visibility: newPostVisibility,
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 1,
      createdAt: 'Just now'
    };

    setPosts([created, ...posts]);
    setNewPostContent('');
    setNewPostTitle('');
    setImageUrl('');
    setPollQuestion('');
    setPollOpt1('');
    setPollOpt2('');
  };

  const filteredPosts = posts.filter((p) => {
    if (feedTab === 'subscribed') return p.visibility === 'members_only';
    return true;
  });

  return (
    <MainLayout showSidebar={true} showFooter={false}>
      <div className="flex flex-col xl:flex-row gap-6 w-full">
        {/* Main Feed Column */}
        <div className="flex-1 space-y-6 max-w-2xl mx-auto xl:mx-0 w-full min-w-0">
          <StoryBar />

          {/* Quick Publisher Box */}
          <Card className="p-4 sm:p-5 space-y-4">
            {/* Publisher Type Selector */}
            <div className="flex items-center gap-2 border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-2 text-[11px] font-bold text-[#71717A] dark:text-[#D4B8D0]">
              <button
                type="button"
                onClick={() => setActivePublishType('text')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activePublishType === 'text'
                    ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6]'
                    : 'hover:bg-[#FFF1F7] dark:hover:bg-[#241A30]'
                }`}
              >
                Text Update
              </button>
              <button
                type="button"
                onClick={() => setActivePublishType('image')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activePublishType === 'image'
                    ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6]'
                    : 'hover:bg-[#FFF1F7] dark:hover:bg-[#241A30]'
                }`}
              >
                Image Drop
              </button>
              <button
                type="button"
                onClick={() => setActivePublishType('poll')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activePublishType === 'poll'
                    ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6]'
                    : 'hover:bg-[#FFF1F7] dark:hover:bg-[#241A30]'
                }`}
              >
                Community Poll
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              {activePublishType !== 'poll' && (
                <>
                  <Input
                    placeholder="Post Title (optional)"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                  <Textarea
                    rows={3}
                    placeholder="Share something exclusive with your audience..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                </>
              )}

              {activePublishType === 'image' && (
                <Input
                  type="url"
                  placeholder="Image URL (e.g. https://images.unsplash.com/...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              )}

              {activePublishType === 'poll' && (
                <div className="space-y-2">
                  <Input
                    placeholder="What is your poll question?"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Option 1"
                      value={pollOpt1}
                      onChange={(e) => setPollOpt1(e.target.value)}
                    />
                    <Input
                      placeholder="Option 2"
                      value={pollOpt2}
                      onChange={(e) => setPollOpt2(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="w-48">
                  <Select
                    value={newPostVisibility}
                    onChange={(e) => setNewPostVisibility(e.target.value as any)}
                    options={[
                      { label: 'Public Post', value: 'public' },
                      { label: 'VIP Members Only', value: 'members_only' },
                    ]}
                  />
                </div>

                <Button type="submit" variant="primary" size="sm" leftIcon={<PlusSquare size={14} />}>
                  Publish
                </Button>
              </div>
            </form>
          </Card>

          {/* Feed Filter Tabs */}
          <div className="flex items-center justify-between border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-2">
            <div className="flex items-center gap-2 text-xs font-extrabold">
              <button
                onClick={() => setFeedTab('for_you')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  feedTab === 'for_you'
                    ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6]'
                    : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B]'
                }`}
              >
                For You
              </button>
              <button
                onClick={() => setFeedTab('following')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  feedTab === 'following'
                    ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6]'
                    : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B]'
                }`}
              >
                Following
              </button>
              <button
                onClick={() => setFeedTab('subscribed')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  feedTab === 'subscribed'
                    ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6]'
                    : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B]'
                }`}
              >
                <Lock size={12} />
                <span>VIP Feed</span>
              </button>
            </div>
          </div>

          {/* Feed Posts List */}
          {isFeedLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-6 rounded-3xl bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FCE7F3] dark:bg-[#381A2B]" />
                    <div className="space-y-1.5 flex-1">
                      <div className="w-28 h-3 bg-[#FCE7F3] dark:bg-[#381A2B] rounded" />
                      <div className="w-16 h-2.5 bg-[#FCE7F3] dark:bg-[#381A2B] rounded" />
                    </div>
                  </div>
                  <div className="w-full h-24 bg-[#FFF9FC] dark:bg-[#241A30] rounded-2xl" />
                </div>
              ))}
            </div>
          ) : (
            <div ref={feedContainerRef} className="space-y-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Right Discovery Sidebar */}
        <aside className="hidden xl:block w-72 space-y-6 shrink-0 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F3DCE8] dark:border-[#3A2A4C]">
              <h3 className="font-black text-xs uppercase tracking-wider text-[#18181B] dark:text-[#FDF2F8]">
                Featured Creators
              </h3>
              <Link href="/explore" className="text-[11px] font-bold text-[#EC4899] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {Object.values(MOCK_CREATOR_DETAILS).slice(0, 3).map((creator) => (
                <Link
                  key={creator.id}
                  href={`/c/${creator.username}`}
                  className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] transition-colors"
                >
                  <Avatar alt={creator.fullName} src={creator.avatarUrl} size="sm" isVerified={creator.isVerified} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] truncate">{creator.fullName}</p>
                    <p className="text-[10px] text-[#71717A] dark:text-[#D4B8D0] truncate">@{creator.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </MainLayout>
  );
}

export default FeedPage;
