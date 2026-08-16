'use client';

import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { PluginSlot } from '@/lib/extensions/plugin-slot';
import { MOCK_POSTS, Post } from '@/lib/supabase/store';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface SinglePostPageProps {
  post?: Post;
}

export function SinglePostPage({ post }: SinglePostPageProps) {
  const activePost = post || MOCK_POSTS[0];

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Feed</span>
        </Link>

        {/* Post Card */}
        <PostCard post={activePost} />

        {/* Related Posts from Creator */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#EC4899]" />
            <h3 className="font-black text-sm text-[#18181B] dark:text-[#FDF2F8]">
              More from @{activePost.authorUsername}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_POSTS.filter((p) => p.id !== activePost.id).slice(0, 2).map((relatedPost) => (
              <Card key={relatedPost.id} hoverable className="p-4 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <Avatar alt={relatedPost.authorName} src={relatedPost.authorAvatar} size="xs" />
                  <span className="text-xs font-bold truncate">{relatedPost.authorName}</span>
                </div>
                <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] line-clamp-2 leading-relaxed">
                  {relatedPost.content}
                </p>
                <Link href={`/feed#${relatedPost.id}`} className="block pt-1">
                  <span className="text-[11px] font-bold text-[#EC4899] hover:underline">
                    View Post →
                  </span>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default SinglePostPage;
