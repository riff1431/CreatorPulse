'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
}

export function MainLayout({ children, showSidebar = true, showFooter = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col font-sans selection:bg-[#FCE7F3] selection:text-[#EC4899]">
      <Navbar />
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {showSidebar && (
          <aside className="hidden lg:block w-64 shrink-0">
            <Sidebar />
          </aside>
        )}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
      {showFooter && <Footer />}
      <MobileNav />
    </div>
  );
}

export default MainLayout;
