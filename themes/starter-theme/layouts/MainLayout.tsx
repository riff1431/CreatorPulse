'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';

export interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
}

/**
 * Starter Theme SDK Main Layout Override
 * Demonstrates CSS custom property injection and dynamic container width.
 */
export function MainLayout({
  children,
  showSidebar = true,
  showFooter = true,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <div className="flex-1 flex w-full max-w-[var(--theme-container-width,1280px)] mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {showSidebar && (
          <aside className="hidden lg:block w-64 shrink-0">
            <Sidebar />
          </aside>
        )}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      {showFooter && <Footer />}
      <MobileNav />
    </div>
  );
}

export default MainLayout;
