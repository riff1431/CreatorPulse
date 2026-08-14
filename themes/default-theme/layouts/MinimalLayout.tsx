'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';

interface MinimalLayoutProps {
  children: React.ReactNode;
}

export function MinimalLayout({ children }: MinimalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

export default MinimalLayout;
