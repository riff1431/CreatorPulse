'use client';

import React from 'react';
import MinimalLayout from '../layouts/MinimalLayout';
import { Heart, MessageSquare, Share2, Play } from 'lucide-react';

export function ShortsPage() {
  return (
    <MinimalLayout>
      <div className="flex justify-center items-center py-6">
        <div className="w-full max-w-sm h-[80vh] bg-slate-900 rounded-3xl relative overflow-hidden flex items-center justify-center shadow-2xl border border-[#F3DCE8]">
          <Play size={48} className="text-white/80" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
            <div>
              <h3 className="font-bold text-sm">@creator_highlights</h3>
              <p className="text-xs text-slate-300">Behind the scenes studio session ✨</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <button className="p-2.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30"><Heart size={18} /></button>
              <button className="p-2.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30"><MessageSquare size={18} /></button>
              <button className="p-2.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30"><Share2 size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </MinimalLayout>
  );
}

export default ShortsPage;
