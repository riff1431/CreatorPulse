'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusSquare, Sparkles, Lock, Filter, Search, TrendingUp, 
  Users, CheckCircle2, ChevronRight, Image as ImageIcon, Video, Vote, BarChart2 
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
import { Badge } from '@/components/ui/Badge';
import { MOCK_POSTS, MOCK_CREATOR_DETAILS, Post, UserRole } from '@/lib/supabase/store';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [feedTab, setFeedTab] = useState<'for_you' | 'following' | 'subscribed'>('for_you');
  const [activeRole, setActiveRole] = useState<UserRole>('member');
  
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostVisibility, setNewPostVisibility] = useState<'public' | 'members_only'>('public');

  useEffect(() => {
    const role = (localStorage.getItem('creatorpulse_active_role') as UserRole) || 'member';
    setActiveRole(role);

    const handleRoleEvent = (e: CustomEvent) => {
      setActiveRole(e.detail);
    };

    window.addEventListener('creatorpulse_role_changed' as any, handleRoleEvent);
    return () => {
      window.removeEventListener('creatorpulse_role_changed' as any, handleRoleEvent);
    };
  }, []);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const created: Post = {
      id: `post-${Date.now()}`,
      authorId: activeRole === 'creator' ? 'user-creator-1' : 'user-member',
      authorName: activeRole === 'creator' ? 'Sarah Jenkins' : 'Alex Vance',
      authorUsername: activeRole === 'creator' ? 'sarahdesign' : 'alexvance',
      authorAvatar: activeRole === 'creator'
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      authorVerified: activeRole === 'creator',
      authorCategory: 'Art & Design',
      title: newPostTitle || undefined,
      content: newPostContent,
      postType: 'text',
      visibility: newPostVisibility,
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 1,
      createdAt: 'Just now'
    };

    setPosts([created, ...posts]);
    setNewPostContent('');
    setNewPostTitle('');
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

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 space-y-6 max-w-2xl mx-auto lg:mx-0 w-full pb-20 lg:pb-8">
          <StoryBar />

          {/* Quick Publisher Box */}
          <Card className="p-5 space-y-3.5">
            <div className="flex items-center gap-3">
              <Avatar
                alt={activeRole === 'creator' ? 'Sarah Jenkins' : 'Alex Vance'}
                src={
                  activeRole === 'creator'
                    ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
                    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                }
                size="md"
              />
              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Post title or headline..."
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] focus:bg-white transition-colors"
              />
            </div>

            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder={
                activeRole === 'creator'
                  ? 'Publish a public post, poll, or exclusive VIP update...'
                  : 'Share thoughts or questions with creators...'
              }
              rows={2}
              className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] focus:bg-white transition-colors resize-none"
            />

            <div className="flex items-center justify-between border-t border-[#F3DCE8] pt-3 text-xs">
              <div className="flex items-center gap-2">
                <select
                  value={newPostVisibility}
                  onChange={(e) => setNewPostVisibility(e.target.value as any)}
                  className="bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-2.5 py-1.5 text-xs text-[#71717A] focus:outline-none font-medium"
                >
                  <option value="public">🌐 Public Post</option>
                  <option value="members_only">🔒 Members Only</option>
                </select>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
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

            <span className="text-xs text-[#A1A1AA] hidden sm:inline font-medium">{filteredPosts.length} posts</span>
          </div>

          {/* Posts Stream */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isMemberUnlocked={activeRole === 'creator' || activeRole === 'admin'}
              />
            ))}
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
        </aside>
      </div>

      <MobileNav />
    </div>
  );
}
