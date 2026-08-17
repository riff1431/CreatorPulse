'use client';

import React from 'react';
import { CreatorHeader } from '../components/CreatorHeader';
import { CreatorSidebar } from '../components/CreatorSidebar';
import { MobileNav } from '../components/MobileNav';
import { RoleSwitcher } from '../components/RoleSwitcher';

interface CreatorLayoutProps {
  children: React.ReactNode;
}

export function CreatorLayout({ children }: CreatorLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex flex-col font-sans transition-colors duration-200">
      <RoleSwitcher />
      <CreatorHeader />
      
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 gap-6 lg:gap-8">
        <CreatorSidebar />
        <main className="flex-1 min-w-0 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}

export default CreatorLayout;
