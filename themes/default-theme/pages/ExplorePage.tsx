'use client';

import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Compass, Search, TrendingUp } from 'lucide-react';

export function ExplorePage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Explore Creators</h1>
          <p className="text-xs text-[#71717A]">Discover trending artists, educators, and creators</p>
        </div>
      </div>
    </MainLayout>
  );
}

export default ExplorePage;
