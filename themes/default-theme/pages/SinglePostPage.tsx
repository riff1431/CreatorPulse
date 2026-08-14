'use client';

import React from 'react';
import MainLayout from '../layouts/MainLayout';
import PluginSlot from '@/lib/extensions/plugin-slot';
import { ArrowLeft, Heart, MessageSquare, Share2 } from 'lucide-react';
import Link from 'next/link';

interface SinglePostPageProps {
  post?: any;
}

export function SinglePostPage({ post }: SinglePostPageProps) {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/feed" className="inline-flex items-center gap-2 text-xs font-bold text-[#71717A] hover:text-[#EC4899]">
          <ArrowLeft size={14} />
          <span>Back to Feed</span>
        </Link>

        <div className="bg-white rounded-3xl border border-[#F3DCE8] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-[#EC4899] font-bold flex items-center justify-center">
                CP
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#18181B]">Creator Exclusive</h3>
                <p className="text-xs text-[#71717A]">Published recently</p>
              </div>
            </div>
            <PluginSlot hook="post_actions" />
          </div>

          <p className="text-xs text-[#18181B] leading-relaxed">
            {post?.content || 'Exclusive creator post details with full media viewer and tip drawer.'}
          </p>

          <PluginSlot hook="feed_post_action" />
        </div>
      </div>
    </MainLayout>
  );
}

export default SinglePostPage;
