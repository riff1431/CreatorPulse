'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Compass, Film, Bookmark, LayoutDashboard, Shield, 
  Database, Wallet, Bell, MessageSquare, Sparkles, User, Settings
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { HookPoint } from '@/lib/extensions/plugin-engine';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { role, user, isAuthenticated } = useAuth();

  const navItems = [
    { label: 'Home Feed', href: '/feed', icon: Home },
    { label: 'Explore & Search', href: '/explore', icon: Compass },
    { label: 'Reels & Shorts', href: '/shorts', icon: Film, badge: 'Hot' },
    { label: 'Direct Messages', href: '/messages', icon: MessageSquare },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Saved Bookmarks', href: '/saved', icon: Bookmark },
    { label: 'Wallet & Payouts', href: '/balance', icon: Wallet },
  ];

  return (
    <aside className="w-64 hidden lg:flex flex-col gap-5 p-4 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none rounded-3xl border border-[#F3DCE8] dark:border-[#3A2A4C] bg-white/80 dark:bg-[#1A1222]/80 backdrop-blur-xl shrink-0 shadow-sm shadow-pink-500/5">
      
      {/* Primary Discovery Links */}
      <div className="space-y-1">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#A1A1AA] dark:text-[#8E7890] px-3 mb-2">
          Discover
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#FCE7F3] to-[#FFF1F7] text-[#BE185D] border border-[#FBCFE8] dark:from-[#381A2B] dark:to-[#24141F] dark:text-[#F472B6] dark:border-[#4C1D3B] shadow-xs'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7] dark:text-[#D4B8D0] dark:hover:text-[#FDF2F8] dark:hover:bg-[#241A30]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={17} className={isActive ? 'text-[#EC4899]' : 'text-[#A1A1AA] dark:text-[#8E7890]'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-black bg-gradient-to-r from-rose-500 to-pink-500 text-white px-2 py-0.5 rounded-full shadow-2xs">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Studio & Management Area */}
      <div className="space-y-1">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#A1A1AA] dark:text-[#8E7890] px-3 mb-2">
          Studio & Tools
        </p>

        {role === 'creator' && (
          <Link
            href="/creator/dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              pathname.startsWith('/creator')
                ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] dark:bg-[#381A2B] dark:text-[#F472B6] dark:border-[#4C1D3B] shadow-xs'
                : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7] dark:text-[#D4B8D0] dark:hover:bg-[#241A30]'
            }`}
          >
            <LayoutDashboard size={17} className="text-[#EC4899]" />
            <span>Creator Studio</span>
          </Link>
        )}

        {role === 'admin' && (
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              pathname.startsWith('/admin')
                ? 'bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3] dark:bg-[#3E141D] dark:text-[#FB7185] shadow-xs'
                : 'text-[#71717A] hover:text-[#BE123C] hover:bg-[#FFF1F7] dark:text-[#D4B8D0] dark:hover:bg-[#241A30]'
            }`}
          >
            <Shield size={17} className="text-[#F43F5E]" />
            <span>Admin Control Panel</span>
          </Link>
        )}

        <Link
          href="/database"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            pathname === '/database'
              ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] dark:bg-[#381A2B] dark:text-[#F472B6] shadow-xs'
              : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7] dark:text-[#D4B8D0] dark:hover:bg-[#241A30]'
          }`}
        >
          <Database size={17} className="text-[#EC4899]" />
          <span>Supabase Inspector</span>
        </Link>

        {/* Plugin Extension Hook Point */}
        <HookPoint name="sidebar_extra_links" />
      </div>

      {/* Fan Callout Banner: Apply for Creator */}
      {role === 'member' && (
        <div className="mt-auto bg-gradient-to-br from-[#FFF1F7] to-[#FDF2F8] dark:from-[#241A30] dark:to-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] p-4 rounded-3xl space-y-2.5 relative overflow-hidden shadow-xs">
          <div className="flex items-center gap-2 text-[#BE185D] dark:text-[#F472B6]">
            <Sparkles size={16} />
            <h5 className="font-extrabold text-xs uppercase tracking-wider">Monetize Your Craft</h5>
          </div>
          <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] leading-relaxed">
            Create VIP tiers, broadcast live streams, and earn direct fan subscriptions.
          </p>
          <Link
            href="/auth/signup"
            className="block text-center text-xs font-extrabold text-white bg-gradient-to-r from-[#EC4899] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Become a Creator
          </Link>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
