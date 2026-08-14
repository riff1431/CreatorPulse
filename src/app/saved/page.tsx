'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Sparkles, Trash2, ArrowRight, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { PostCard } from '@/components/post-card';
import { MOCK_POSTS, Post } from '@/lib/supabase/store';
import { Button } from '@/components/ui/Button';

export default function SavedPage() {
  const [savedPosts, setSavedPosts] = useState<Post[]>(
    MOCK_POSTS.filter((p) => p.isSaved || p.id === 'post-2')
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [savedCategory, setSavedCategory] = useState<'all' | 'image' | 'video' | 'poll'>('all');
  const [isSavedLoading, setIsSavedLoading] = useState(false);

  // Simulate loader when filter updates
  useEffect(() => {
    setIsSavedLoading(true);
    const timer = setTimeout(() => {
      setIsSavedLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery, savedCategory]);

  const filteredPosts = savedPosts.filter((p) => {
    const matchesCat = savedCategory === 'all' || p.postType === savedCategory;
    const matchesSearch =
      (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSavedCategory('all');
  };

  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 space-y-6 max-w-2xl mx-auto lg:mx-0 w-full pb-20 lg:pb-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Bookmark className="text-[#EC4899] fill-[#EC4899]" size={24} />
                <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Saved Posts & Bookmarks</h1>
              </div>
              <p className="text-xs text-[#71717A] font-bold">Your collection of bookmarked creator posts and premium content.</p>
            </div>

            <span className="text-xs text-[#BE185D] font-bold bg-[#FCE7F3] px-3 py-1 rounded-full border border-[#FBCFE8]">{filteredPosts.length} saved</span>
          </div>

          {/* Search bar inside Saved folders */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search through saved posts..."
              className="w-full bg-white border border-[#F3DCE8] focus:border-[#EC4899] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none transition-all shadow-inner font-semibold"
            />
          </div>

          {/* Saved category tabs */}
          <div className="flex items-center gap-2 border-b border-[#F3DCE8] pb-2 text-xs font-bold overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: '📂 All Bookmarks' },
              { id: 'image', label: '🖼️ Images' },
              { id: 'video', label: '🎥 Videos' },
              { id: 'poll', label: '📊 Polls' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSavedCategory(tab.id as any)}
                className={`px-4 py-2 rounded-2xl transition-all shrink-0 cursor-pointer ${
                  savedCategory === tab.id
                    ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                    : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Feed Grid Area */}
          <div className="space-y-4">
            {isSavedLoading ? (
              // Shimmer message loaders
              <>
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-white border border-[#F3DCE8] rounded-[24px] p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full skeleton-shimmer" />
                      <div className="space-y-1.5 flex-1">
                        <div className="w-24 h-3.5 skeleton-shimmer rounded-full" />
                        <div className="w-16 h-2.5 skeleton-shimmer rounded-full" />
                      </div>
                    </div>
                    <div className="w-full h-4 skeleton-shimmer rounded-full" />
                    <div className="w-4/5 h-4 skeleton-shimmer rounded-full" />
                  </div>
                ))}
              </>
            ) : filteredPosts.length === 0 ? (
              // Empty Bookmarks View
              <div className="text-center py-16 px-6 bg-white border border-[#F3DCE8] rounded-[24px] space-y-4">
                <Bookmark size={32} className="text-[#A1A1AA] mx-auto animate-pulse" />
                <h3 className="font-extrabold text-[#18181B] text-base">No Saved Items Found</h3>
                <p className="text-xs text-[#71717A] max-w-sm mx-auto leading-relaxed font-semibold">
                  We couldn't find any saved posts matching your active selection criteria. Try adjusting filters.
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleResetFilters} leftIcon={<RefreshCw size={12} />}>
                    Reset Filters
                  </Button>
                  <Link href="/feed">
                    <Button variant="primary" size="sm">Go to Feed</Button>
                  </Link>
                </div>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} isMemberUnlocked={true} />
              ))
            )}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
