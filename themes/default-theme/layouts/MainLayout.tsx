'use client';

import React from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { MobileNav } from '../components/MobileNav';
import { RoleSwitcher } from '../components/RoleSwitcher';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
  showNavbar?: boolean;
  showMobileNav?: boolean;
  maxWidthClass?: string;
}

export function MainLayout({
  children,
  showSidebar = true,
  showFooter = true,
  showNavbar = true,
  showMobileNav = true,
  maxWidthClass = 'max-w-7xl 2xl:max-w-[1560px]',
}: MainLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text-primary)] flex flex-col font-sans selection:bg-[var(--color-soft-primary)] selection:text-[var(--color-primary)] transition-colors duration-200 overflow-x-hidden">
      <RoleSwitcher />
      {showNavbar && <Navbar />}

      <div className={`flex-1 flex w-full ${maxWidthClass} mx-auto px-3 sm:px-5 md:px-6 lg:px-8 xl:px-10 py-3 sm:py-5 lg:py-6 gap-6 lg:gap-8`}>
        {showSidebar && <Sidebar />}
        <main className="flex-1 min-w-0 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </main>
      </div>

      {showFooter && <Footer />}
      {showMobileNav && <MobileNav />}
    </div>
  );
}

export default MainLayout;
