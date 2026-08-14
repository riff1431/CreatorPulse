'use client';

import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Bookmark } from 'lucide-react';

export function SavedPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Saved Posts</h1>
          <p className="text-xs text-[#71717A]">Your bookmarked content and exclusive media</p>
        </div>
      </div>
    </MainLayout>
  );
}

export default SavedPage;
