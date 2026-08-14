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
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#8B5CF6] selection:text-white">
      <div className="border-b border-[#334155]/60 bg-[#0F172A]/80 backdrop-blur-xl sticky top-0 z-40">
        <Navbar />
      </div>
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
