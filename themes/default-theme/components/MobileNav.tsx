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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F0A14]/95 backdrop-blur-2xl border-t border-[#F3DCE8] dark:border-[#3A2A4C] px-4 py-2 pb-[max(env(safe-area-inset-bottom),0.6rem)] shadow-2xl transition-colors duration-200">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Feed */}
        <Link
          href="/feed"
          className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all duration-150 min-w-[52px] ${
            pathname === '/feed'
              ? 'text-[#EC4899] font-black'
              : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899]'
          }`}
        >
          <Home size={20} className={pathname === '/feed' ? 'stroke-[2.5] text-[#EC4899]' : 'stroke-2'} />
          <span className="text-[10px] font-bold">Feed</span>
        </Link>

        {/* Explore */}
        <Link
          href="/explore"
          className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all duration-150 min-w-[52px] ${
            pathname === '/explore'
              ? 'text-[#EC4899] font-black'
              : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899]'
          }`}
        >
          <Compass size={20} className={pathname === '/explore' ? 'stroke-[2.5] text-[#EC4899]' : 'stroke-2'} />
          <span className="text-[10px] font-bold">Explore</span>
        </Link>

        {/* Central Dynamic Action / Studio Button */}
        {isCreator ? (
          <Link
            href="/creator/dashboard"
            className="flex items-center justify-center w-12 h-12 -mt-5 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F43F5E] text-white shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all border-2 border-white dark:border-[#0F0A14]"
            title="Creator Studio"
          >
            <PlusSquare size={22} />
          </Link>
        ) : (
          <Link
            href="/shorts"
            className="flex items-center justify-center w-12 h-12 -mt-5 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F43F5E] text-white shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all border-2 border-white dark:border-[#0F0A14]"
            title="Reels"
          >
            <Film size={22} />
          </Link>
        )}

        {/* Messages */}
        <Link
          href="/messages"
          className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all duration-150 min-w-[52px] relative ${
            pathname === '/messages'
              ? 'text-[#EC4899] font-black'
              : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899]'
          }`}
        >
          <MessageSquare size={20} className={pathname === '/messages' ? 'stroke-[2.5] text-[#EC4899]' : 'stroke-2'} />
          <span className="text-[10px] font-bold">Chat</span>
        </Link>

        {/* Profile / Studio */}
        <Link
          href={isAuthenticated ? (isCreator ? '/creator/dashboard' : `/c/${user?.username || 'sarahdesign'}`) : '/auth/login'}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all duration-150 min-w-[52px] ${
            pathname.startsWith('/c/') || pathname.startsWith('/creator') || pathname.startsWith('/auth')
              ? 'text-[#EC4899] font-black'
              : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899]'
          }`}
        >
          {isCreator ? (
            <LayoutDashboard size={20} className={pathname.startsWith('/creator') ? 'stroke-[2.5] text-[#EC4899]' : 'stroke-2'} />
          ) : (
            <User size={20} className={pathname.startsWith('/c/') ? 'stroke-[2.5] text-[#EC4899]' : 'stroke-2'} />
          )}
          <span className="text-[10px] font-bold">{isAuthenticated ? (isCreator ? 'Studio' : 'Profile') : 'Log In'}</span>
        </Link>

      </div>
    </div>
  );
};

export default MobileNav;
