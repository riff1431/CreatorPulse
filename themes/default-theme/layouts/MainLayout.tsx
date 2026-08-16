'use client';

import React from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { MobileNav } from '../components/MobileNav';
import { RoleSwitcher } from '../components/RoleSwitcher';
import { SupabaseStatusBanner } from '@/components/supabase-status-banner';

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
  maxWidthClass = 'max-w-7xl',
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FFF9FC] dark:bg-[#0F0A14] text-[#18181B] dark:text-[#FDF2F8] flex flex-col font-sans selection:bg-[#FCE7F3] selection:text-[#EC4899] transition-colors duration-200">
      <RoleSwitcher />
      <SupabaseStatusBanner />
      {showNavbar && <Navbar />}

      <div className={`flex-1 flex w-full ${maxWidthClass} mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 gap-6 lg:gap-8`}>
        {showSidebar && <Sidebar />}
        <main className="flex-1 min-w-0 pb-20 lg:pb-8">
          {children}
        </main>
      </div>

      {showFooter && <Footer />}
      {showMobileNav && <MobileNav />}
    </div>
  );
}

export default MainLayout;
