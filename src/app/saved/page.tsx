'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Sparkles, Trash2, ArrowRight } from 'lucide-react';
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
                <h1 className="text-2xl font-black text-[#18181B]">Saved Posts & Bookmarks</h1>
              </div>
              <p className="text-xs text-[#71717A] font-medium">Your collection of bookmarked creator posts and premium content.</p>
            </div>

            <span className="text-xs text-[#BE185D] font-bold bg-[#FCE7F3] px-3 py-1 rounded-full border border-[#FBCFE8]">{savedPosts.length} saved</span>
          </div>

          <div className="space-y-4">
            {savedPosts.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-white border border-[#F3DCE8] rounded-[24px] p-8">
                <Bookmark size={32} className="text-[#A1A1AA] mx-auto" />
                <h3 className="font-extrabold text-[#18181B]">No Saved Posts Yet</h3>
                <p className="text-xs text-[#71717A]">Click the bookmark icon on any post in your feed to save it here.</p>
                <Link href="/feed">
                  <Button variant="primary" size="sm">Explore Feed</Button>
                </Link>
              </div>
            ) : (
              savedPosts.map((post) => (
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
