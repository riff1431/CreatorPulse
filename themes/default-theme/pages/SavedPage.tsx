'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { MOCK_POSTS, Post } from '@/lib/supabase/store';
import { Bookmark, Sparkles, Filter, Compass } from 'lucide-react';

export function SavedPage() {
  const [savedPosts, setSavedPosts] = useState<Post[]>(MOCK_POSTS.slice(0, 2));
  const [activeFilter, setActiveFilter] = useState<'all' | 'media' | 'vip'>('all');

  const filteredPosts = savedPosts.filter((p) => {
    if (activeFilter === 'media') return Boolean(p.mediaUrl);
    if (activeFilter === 'vip') return p.visibility === 'members_only';
    return true;
  });

  return (
    <MainLayout>
      <div className="space-y-6 max-w-3xl mx-auto pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bookmark className="text-[#EC4899]" size={22} />
              <h1 className="text-xl font-black text-[#18181B] dark:text-[#FDF2F8] tracking-tight">Saved Bookmarks</h1>
            </div>
            <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">Your bookmarked creator posts, masterclasses, and exclusive drops.</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6]'
                  : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B]'
              }`}
            >
              All ({savedPosts.length})
            </button>
            <button
              onClick={() => setActiveFilter('media')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'media'
                  ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6]'
                  : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B]'
              }`}
            >
              Media
            </button>
            <button
              onClick={() => setActiveFilter('vip')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'vip'
                  ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6]'
                  : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B]'
              }`}
            >
              VIP Drops
            </button>
          </div>
        </div>

        {/* Saved Posts List */}
        {filteredPosts.length > 0 ? (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-3xl space-y-3">
            <Bookmark size={32} className="mx-auto text-[#A1A1AA]" />
            <h3 className="font-bold text-sm text-[#18181B] dark:text-[#FDF2F8]">No bookmarks saved yet</h3>
            <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">Save posts from your feed to revisit exclusive content anytime.</p>
            <Link href="/feed" className="inline-block pt-2">
              <Button variant="primary" size="sm" leftIcon={<Compass size={14} />}>
                Explore Feed
              </Button>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default SavedPage;
