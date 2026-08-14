'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { 
  PlusSquare, Sparkles, Lock, Filter, Search, TrendingUp, 
  Users, CheckCircle2, ChevronRight, Image as ImageIcon, Video, Vote, BarChart2, AlertCircle 
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { SupabaseStatusBanner } from '@/components/supabase-status-banner';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { StoryBar } from '@/components/story-bar';
import { PostCard } from '@/components/post-card';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { MOCK_POSTS, MOCK_CREATOR_DETAILS, Post } from '@/lib/supabase/store';
import { useAuth } from '@/lib/auth/auth-context';
import { ThemeSlot } from '@/lib/extensions/theme-slot';
import { PluginSlot } from '@/lib/extensions/plugin-slot';

export default function FeedPage() {
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
    }, 600);
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
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <RoleSwitcher />
      <SupabaseStatusBanner />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex theme-layout-wrapper theme-gap px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 space-y-6 max-w-2xl mx-auto lg:mx-0 w-full pb-20 lg:pb-8">
          <StoryBar />

          {/* Quick Publisher Box */}
          <Card className="p-5 space-y-4 border border-[#F3DCE8] shadow-sm">
            {/* Publisher Type Selector */}
            <div className="flex items-center gap-2 border-b border-[#F3DCE8] pb-2 text-[11px] font-bold text-[#71717A]">
              <button
                type="button"
                onClick={() => setActivePublishType('text')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activePublishType === 'text' ? 'bg-[#FCE7F3] text-[#BE185D]' : 'hover:bg-[#FFF1F7] hover:text-[#18181B]'
                }`}
              >
                ✍️ Text Update
              </button>
              <button
                type="button"
                onClick={() => setActivePublishType('image')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activePublishType === 'image' ? 'bg-[#FCE7F3] text-[#BE185D]' : 'hover:bg-[#FFF1F7] hover:text-[#18181B]'
                }`}
              >
                🖼️ Image Post
              </button>
              <button
                type="button"
                onClick={() => setActivePublishType('poll')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activePublishType === 'poll' ? 'bg-[#FCE7F3] text-[#BE185D]' : 'hover:bg-[#FFF1F7] hover:text-[#18181B]'
                }`}
              >
                📊 Create Poll
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Avatar
                alt={user?.fullName || (role === 'creator' ? 'Sarah Jenkins' : 'Alex Vance')}
                src={
                  user?.avatarUrl || (role === 'creator'
                    ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
                    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150')
                }
                size="md"
              />
              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Post title or headline (optional)..."
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] focus:bg-white transition-colors font-semibold"
              />
            </div>

            {activePublishType === 'poll' ? (
              <div className="space-y-2 text-xs font-semibold">
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Ask the community a question..."
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] focus:bg-white transition-colors"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={pollOpt1}
                    onChange={(e) => setPollOpt1(e.target.value)}
                    placeholder="Option 1"
                    className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] focus:bg-white"
                  />
                  <input
                    type="text"
                    value={pollOpt2}
                    onChange={(e) => setPollOpt2(e.target.value)}
                    placeholder="Option 2"
                    className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] focus:bg-white"
                  />
                </div>
              </div>
            ) : (
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={
                  role === 'creator'
                    ? 'Publish a public post, or exclusive VIP update...'
                    : 'Share thoughts or questions with creators...'
                }
                rows={2}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] focus:bg-white transition-colors resize-none font-semibold"
              />
            )}

            {activePublishType === 'image' && (
              <div>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL (e.g. Unsplash link)..."
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] focus:bg-white transition-colors font-semibold"
                />
              </div>
            )}

            <div className="flex items-center justify-between border-t border-[#F3DCE8] pt-3 text-xs">
              <div className="flex items-center gap-2">
                <select
                  value={newPostVisibility}
                  onChange={(e) => setNewPostVisibility(e.target.value as 'public' | 'members_only')}
                  className="bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-2.5 py-1.5 text-xs text-[#71717A] focus:outline-none font-semibold"
                >
                  <option value="public">🌐 Public Post</option>
                  <option value="members_only">🔒 Members Only</option>
                </select>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleCreatePost}
                disabled={activePublishType === 'poll' ? (!pollQuestion.trim() || !pollOpt1.trim() || !pollOpt2.trim()) : !newPostContent.trim()}
              >
                Publish Post
              </Button>
            </div>
          </Card>

          {/* Feed Tabs: For You, Following, Subscribed */}
          <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <button
                onClick={() => setFeedTab('for_you')}
                className={`px-4 py-2 rounded-2xl transition-all cursor-pointer ${
                  feedTab === 'for_you'
                    ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-sm shadow-[#EC4899]/5'
                    : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
                }`}
              >
                For You
              </button>

              <button
                onClick={() => setFeedTab('following')}
                className={`px-4 py-2 rounded-2xl transition-all cursor-pointer ${
                  feedTab === 'following'
                    ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-sm shadow-[#EC4899]/5'
                    : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
                }`}
              >
                Following
              </button>

              <button
                onClick={() => setFeedTab('subscribed')}
                className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  feedTab === 'subscribed'
                    ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-sm shadow-[#EC4899]/5'
                    : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
                }`}
              >
                <Lock size={12} /> Subscribed
              </button>
            </div>

            <span className="text-xs text-[#A1A1AA] hidden sm:inline font-bold">{filteredPosts.length} posts</span>
          </div>

          {/* Posts Stream */}
          <div ref={feedContainerRef} className="space-y-4">
            {isFeedLoading ? (
              // Shimmer Cards Loading State
              <>
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-white border border-[#F3DCE8] rounded-[24px] p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full skeleton-shimmer" />
                      <div className="space-y-1.5 flex-1">
                        <div className="w-28 h-3.5 skeleton-shimmer rounded-full" />
                        <div className="w-16 h-2.5 skeleton-shimmer rounded-full" />
                      </div>
                    </div>
                    <div className="w-full h-4 skeleton-shimmer rounded-full" />
                    <div className="w-5/6 h-4 skeleton-shimmer rounded-full" />
                    <div className="w-full h-40 skeleton-shimmer rounded-2xl" />
                  </div>
                ))}
              </>
            ) : filteredPosts.length === 0 ? (
              // Premium Empty Feed State
              <div className="text-center py-16 px-6 bg-white border border-[#F3DCE8] rounded-[24px] space-y-4">
                <AlertCircle className="w-12 h-12 text-[#BE185D] mx-auto animate-bounce" />
                <h3 className="font-extrabold text-[#18181B] text-base">No Subscribed Posts</h3>
                <p className="text-xs text-[#71717A] max-w-sm mx-auto leading-relaxed font-semibold">
                  You are not currently subscribed to any premium creator tiers. Explore trending creators and subscribe to unlock.
                </p>
                <Link href="/explore" className="inline-block">
                  <Button variant="primary" size="sm">
                    Discover Creators
                  </Button>
                </Link>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isMemberUnlocked={role === 'creator' || role === 'admin'}
                />
              ))
            )}
          </div>
        </main>

        <aside className="w-80 hidden xl:flex flex-col gap-6">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div className="flex items-center gap-2 text-[#18181B] font-bold text-xs">
                <TrendingUp size={16} className="text-[#EC4899]" />
                <span>Trending Creators</span>
              </div>
              <Link href="/explore" className="text-[11px] text-[#BE185D] font-bold hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3.5">
              {Object.values(MOCK_CREATOR_DETAILS).map((creator) => (
                <div key={creator.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Avatar alt={creator.fullName} src={creator.avatarUrl} size="md" isVerified={creator.isVerified} />
                    <div>
                      <Link href={`/c/${creator.username}`} className="font-bold text-[#18181B] hover:text-[#EC4899] block transition-colors">
                        {creator.fullName}
                      </Link>
                      <span className="text-[10px] text-[#71717A]">@{creator.username}</span>
                    </div>
                  </div>
                  <Link href={`/c/${creator.username}`}>
                    <Button variant="outline" size="sm">
                      Visit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          {/* Dynamic Plugin Widgets in Feed Sidebar */}
          <PluginSlot hook="feed_sidebar_widget" />
          <PluginSlot hook="feed_post_action" />
        </aside>
      </div>

      <MobileNav />
    </div>
  );
}
