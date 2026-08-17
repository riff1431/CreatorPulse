'use client';

import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { MOCK_POSTS, Post } from '@/lib/supabase/store';
import { ArrowLeft, Sparkles, ChevronRight, Share2, Bookmark, Heart, Compass } from 'lucide-react';
import Link from 'next/link';

interface SinglePostPageProps {
  post?: Post;
}

export function SinglePostPage({ post }: SinglePostPageProps) {
  const activePost = post || MOCK_POSTS[0];

  return (
    <MainLayout maxWidthClass="max-w-4xl">
      <div className="space-y-6 pb-20 w-full min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Top Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8] dark:border-[#3A2A4C] text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E] transition-all group shadow-2xs"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Feed</span>
          </Link>

          <Link
            href={`/c/${activePost.authorUsername}`}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-[var(--color-primary)] hover:underline"
          >
            <span>Visit @{activePost.authorUsername}</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Main Post Card Container */}
        <div className="max-w-2xl mx-auto w-full">
          <PostCard post={activePost} />
        </div>

        {/* More Posts from this Creator */}
        <div className="space-y-4 pt-6 border-t border-[#F3DCE8] dark:border-[#3A2A4C]">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-[var(--color-primary)] flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <h3 className="font-black text-base text-[#18181B] dark:text-[#FDF2F8] tracking-tight">
                More from @{activePost.authorUsername}
              </h3>
            </div>

            <Link
              href={`/c/${activePost.authorUsername}`}
              className="text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-[var(--color-primary)] transition-colors flex items-center gap-1"
            >
              <span>View Channel</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_POSTS.filter((p) => p.id !== activePost.id).slice(0, 2).map((relatedPost) => (
              <Card
                key={relatedPost.id}
                hoverable
                className="p-4 sm:p-5 space-y-3 rounded-3xl border-[#F3DCE8] dark:border-[#3A2A4C] bg-white/90 dark:bg-[#150D1E]/90 hover:border-pink-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    alt={relatedPost.authorName}
                    src={relatedPost.authorAvatar}
                    size="sm"
                  />
                  <div>
                    <span className="text-xs font-extrabold block text-[#18181B] dark:text-[#FDF2F8]">
                      {relatedPost.authorName}
                    </span>
                    <span className="text-[10px] text-[#A1A1AA]">
                      @{relatedPost.authorUsername} • {relatedPost.createdAt}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] line-clamp-2 leading-relaxed">
                  {relatedPost.content}
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-[var(--color-primary)]">
                  <span>{relatedPost.likesCount} Likes • {relatedPost.commentsCount} Comments</span>
                  <Link href={`/feed`} className="flex items-center gap-0.5 hover:underline">
                    <span>Read Post</span>
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

export default SinglePostPage;
