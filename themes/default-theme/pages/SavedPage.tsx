'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { MOCK_POSTS, Post } from '@/lib/supabase/store';
import { 
  Bookmark, Sparkles, Filter, Compass, Lock, 
  Unlock, Video, Image as ImageIcon, Search, Download,
  Grid, List, Layers, ShieldCheck
} from 'lucide-react';

export function SavedPage() {
  const [savedPosts, setSavedPosts] = useState<Post[]>(MOCK_POSTS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'vault' | 'video' | 'images'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'feed'>('grid');

  const filteredPosts = savedPosts.filter((p) => {
    if (activeFilter === 'vault') {
      if (p.visibility !== 'members_only') return false;
    }
    if (activeFilter === 'video') {
      if (!p.mediaUrl || !p.mediaUrl.includes('mp4')) return false;
    }
    if (activeFilter === 'images') {
      if (!p.mediaUrl || p.mediaUrl.includes('mp4')) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.content.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <MainLayout maxWidthClass="max-w-7xl">
      <div className="space-y-6 pb-20 w-full min-w-0">
        
        {/* Top Header Card */}
        <div className="p-5 sm:p-7 rounded-[32px] bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF8A00] to-[#E52E71] flex items-center justify-center text-white shadow-md shadow-pink-500/20">
                  <Bookmark size={20} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#18181B] dark:text-[#FDF2F8] tracking-tight">
                    Bookmarks & VIP Vault
                  </h1>
                  <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] font-medium">
                    Your collection of saved creator moments, 4K project stems, and unlocked drops.
                  </p>
                </div>
              </div>
            </div>

            {/* Layout Toggle & Total Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center p-1 bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl">
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    layoutMode === 'grid'
                      ? 'bg-white dark:bg-[#150D1E] text-[var(--color-primary)] shadow-xs'
                      : 'text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8]'
                  }`}
                  title="Grid Layout"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setLayoutMode('feed')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    layoutMode === 'feed'
                      ? 'bg-white dark:bg-[#150D1E] text-[var(--color-primary)] shadow-xs'
                      : 'text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8]'
                  }`}
                  title="Feed Layout"
                >
                  <List size={16} />
                </button>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-[#BE185D] dark:text-[#F472B6] text-xs font-black">
                {filteredPosts.length} Items
              </span>
            </div>
          </div>

          {/* Search & Filter Tabs Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
              <input
                type="text"
                placeholder="Search saved drops or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] font-medium"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Items', icon: Layers },
                { id: 'vault', label: 'VIP Vault', icon: Unlock },
                { id: 'video', label: 'Videos', icon: Video },
                { id: 'images', label: 'Photos & Files', icon: ImageIcon },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] shadow-2xs'
                        : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8]'
                    }`}
                  >
                    <Icon size={13} className={isActive ? 'text-[var(--color-primary)]' : 'text-[#A1A1AA]'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Saved Posts Grid or List */}
        {filteredPosts.length > 0 ? (
          <div
            className={
              layoutMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6'
                : 'max-w-2xl mx-auto space-y-6'
            }
          >
            {filteredPosts.map((post) => (
              <div key={post.id} className="mockup-feed-card">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-3xl space-y-3">
            <div className="w-16 h-16 rounded-full bg-pink-50 dark:bg-pink-950/40 text-[var(--color-primary)] flex items-center justify-center mx-auto">
              <Bookmark size={28} />
            </div>
            <h3 className="font-extrabold text-base text-[#18181B] dark:text-[#FDF2F8]">
              No saved items in this category
            </h3>
            <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] max-w-sm mx-auto">
              Bookmark drops from your feed or unlock VIP tiers to store them permanently in your vault.
            </p>
            <div className="pt-2">
              <Link href="/feed">
                <Button variant="primary" size="sm" leftIcon={<Compass size={14} />}>
                  Explore Community Feed
                </Button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default SavedPage;
