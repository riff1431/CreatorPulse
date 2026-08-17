'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Film, MessageSquare, PlusSquare, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { user, role, isAuthenticated } = useAuth();

  const isCreator = role === 'creator';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#150D1E]/90 backdrop-blur-2xl border-t border-[#F3DCE8]/80 dark:border-[#3A2A4C]/80 px-3 sm:px-6 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),0.65rem)] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)] transition-colors duration-200">
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        
        {/* Feed */}
        <Link
          href="/feed"
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[46px] rounded-2xl transition-all duration-200 ${
            pathname === '/feed'
              ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] font-extrabold scale-105'
              : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] active:scale-95'
          }`}
        >
          <Home size={20} className={pathname === '/feed' ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
          <span className="text-[9px] font-black tracking-tight">Feed</span>
        </Link>

        {/* Connections */}
        <Link
          href="/connections"
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[46px] rounded-2xl transition-all duration-200 ${
            pathname === '/connections'
              ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] font-extrabold scale-105'
              : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] active:scale-95'
          }`}
        >
          <Compass size={20} className={pathname === '/connections' ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
          <span className="text-[9px] font-black tracking-tight">People</span>
        </Link>

        {/* Central Dynamic Action / Studio Button */}
        <div className="relative -top-5 flex justify-center w-14 shrink-0">
          {isCreator ? (
            <Link
              href="/creator/dashboard"
              className="flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#FF8A00] to-[#E52E71] text-white shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-[#150D1E] group"
              title="Creator Studio"
            >
              <PlusSquare size={22} className="group-hover:rotate-90 transition-transform duration-300" />
            </Link>
          ) : (
            <Link
              href="/shorts"
              className="flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#FF8A00] to-[#E52E71] text-white shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-[#150D1E] group"
              title="Reels"
            >
              <Film size={22} className="group-hover:scale-110 transition-transform duration-300" />
            </Link>
          )}
        </div>

        {/* Messages */}
        <Link
          href="/messages"
          className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[46px] rounded-2xl transition-all duration-200 ${
            pathname === '/messages'
              ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] font-extrabold scale-105'
              : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] active:scale-95'
          }`}
        >
          <div className="relative">
            <MessageSquare size={20} className={pathname === '/messages' ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EC4899] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EC4899] border-2 border-white dark:border-[#150D1E]"></span>
            </span>
          </div>
          <span className="text-[9px] font-black tracking-tight">Chat</span>
        </Link>

        {/* Profile / Studio */}
        <Link
          href={isAuthenticated ? (isCreator ? '/creator/dashboard' : '/settings') : '/auth/login'}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[46px] rounded-2xl transition-all duration-200 ${
            pathname.startsWith('/c/') || pathname.startsWith('/creator') || pathname.startsWith('/settings') || pathname.startsWith('/auth')
              ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] font-extrabold scale-105'
              : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] active:scale-95'
          }`}
        >
          {isCreator ? (
            <LayoutDashboard size={20} className={pathname.startsWith('/creator') ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
          ) : (
            <User size={20} className={pathname.startsWith('/settings') ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
          )}
          <span className="text-[9px] font-black tracking-tight">{isAuthenticated ? (isCreator ? 'Studio' : 'Profile') : 'Log In'}</span>
        </Link>

      </div>
    </div>
  );
};

export default MobileNav;

