'use client';

import React from 'react';
import { Navbar } from '../components/Navbar';
import { MobileNav } from '../components/MobileNav';

interface MinimalLayoutProps {
  children: React.ReactNode;
}

export function MinimalLayout({ children }: MinimalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FFF9FC] dark:bg-[#0F0A14] text-[#18181B] dark:text-[#FDF2F8] flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <main className="flex-1 w-full pb-16 lg:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

export default MinimalLayout;
