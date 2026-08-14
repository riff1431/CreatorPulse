'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { CreatorSidebar } from '@/components/creator/CreatorSidebar';
import { MobileNav } from '@/components/layout/MobileNav';

interface CreatorLayoutProps {
  children: React.ReactNode;
}

export function CreatorLayout({ children }: CreatorLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <aside className="hidden lg:block w-64 shrink-0">
          <CreatorSidebar />
        </aside>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

export default CreatorLayout;
