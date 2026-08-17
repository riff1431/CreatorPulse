'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Compass, Film, Bookmark, LayoutDashboard, Shield, 
  Database, Wallet, Bell, MessageSquare, Sparkles, User, Settings,
  Crown, Lock, BarChart2, Radio, LogOut, Moon, Sun, ChevronRight,
  TrendingUp, Users, Palette, Cpu, CheckCircle2, Play, Plus,
  Camera, Flower2, Trees, Plane, Heart, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useFollow } from '@/lib/follow/use-follow';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { useTheme } from '@/lib/extensions/theme-engine';
import { Avatar } from './Avatar';
import { MOCK_USERS } from '@/lib/supabase/store';
import { ProfileCompletionWidget } from './ProfileCompletionWidget';

interface StoryHighlight {
  id: string;
  title: string;
  coverImage: string;
  isNew?: boolean;
}

const DEFAULT_HIGHLIGHTS: StoryHighlight[] = [
  { id: 'h-new', title: 'New', coverImage: '', isNew: true },
  { id: 'h-1', title: 'Garden', coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=150' },
  { id: 'h-2', title: 'Cameras', coverImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=150' },
  { id: 'h-3', title: 'Wildlife', coverImage: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=150' },
  { id: 'h-4', title: 'Travel', coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { role, user, isAuthenticated, logout } = useAuth();
  const { counts } = useFollow();
  const { settings } = useSiteSettings();
  const { activeTheme, isDarkMode, toggleDarkMode } = useTheme();
  const [highlights, setHighlights] = useState<StoryHighlight[]>(DEFAULT_HIGHLIGHTS);
  const [activeHighlight, setActiveHighlight] = useState<StoryHighlight | null>(null);

  const logoUrl = settings.logo_url || activeTheme?.settings?.logoUrl;
  const siteName = settings.site_name || 'CreatorPulse';

  // Active user data (matching the mockup defaults when not logged in or member)
  const currentUser = user || {
    id: 'user-member',
    fullName: 'Abhinav Khare',
    username: 'abhi_navkhare',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    bio: 'UI Designer | Traveler | Lifestyle Blogger',
    postsCount: 472,
    followersCount: '12.4K',
    followingCount: 228,
    isVerified: true
  };

  // Navigation Items
  const navItems = [
    { label: 'Feed', href: '/feed', icon: Home },
    { label: 'Explore', href: '/explore', icon: Compass },
    { 
      label: 'Connections', 
      href: '/connections', 
      icon: Users, 
      badge: counts.pendingIncomingCount > 0 ? `${counts.pendingIncomingCount}` : undefined, 
      badgeColor: 'bg-amber-500 text-white' 
    },
    { label: 'Reels', href: '/shorts', icon: Film, badge: 'Hot', badgeColor: 'bg-rose-500 text-white' },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-72 2xl:w-80 hidden lg:flex flex-col gap-5 p-4 sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar rounded-[32px] border border-[#F3DCE8]/80 dark:border-[#3A2A4C]/80 bg-white/90 dark:bg-[#150D1E]/90 backdrop-blur-xl shrink-0 shadow-sm shadow-pink-500/5 select-none">
      
      {/* 1. Dynamic App Brand Logo / Title */}
      <div className="flex items-center justify-between px-2 pt-1">
        <Link href="/feed" className="flex items-center gap-2.5 group min-w-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={siteName}
              className="h-8 sm:h-9 w-auto max-w-[150px] object-contain rounded-xl group-hover:scale-102 transition-transform"
            />
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF8A00] via-[#EC4899] to-[#7928CA] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Sparkles size={18} />
              </div>
              <span className="text-lg font-black tracking-tight text-[#18181B] dark:text-[#FDF2F8] truncate font-sans">
                {siteName}
              </span>
            </div>
          )}
        </Link>

        {/* Quick Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-[#71717A] dark:text-[#D4B8D0] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E] transition-colors"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
        </button>
      </div>

      {/* 2. User Profile Card Section */}
      <div data-tour="sidebar-profile" className="p-4 rounded-[26px] bg-gradient-to-b from-[#FFF9FC] to-[#FFF1F7]/70 dark:from-[#22152E] dark:to-[#1A1024] border border-[#F3DCE8] dark:border-[#3A2A4C] text-center space-y-3 shadow-2xs">
        {/* Avatar with Ring */}
        <div className="relative inline-block mx-auto">
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#FF8A00] via-[#EC4899] to-[#7928CA] shadow-sm">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={currentUser.fullName || 'Abhinav Khare'}
              className="w-18 h-18 rounded-full object-cover border-2 border-white dark:border-[#150D1E]"
            />
          </div>
        </div>

        {/* Name & Handle */}
        <div>
          <h3 className="font-extrabold text-sm text-[#18181B] dark:text-[#FDF2F8]">
            {currentUser.fullName || 'Abhinav Khare'}
          </h3>
          <p className="text-xs text-[#A1A1AA] dark:text-[#8E7890] font-medium">
            @{currentUser.username || 'abhi_navkhare'}
          </p>
        </div>

        {/* Stats Row (Posts | Followers | Following) */}
        <div className="flex items-center justify-center divide-x divide-[#F3DCE8] dark:divide-[#3A2A4C] pt-1">
          <div className="px-3 text-center">
            <p className="font-black text-xs text-[#18181B] dark:text-[#FDF2F8]">472</p>
            <p className="text-[10px] text-[#A1A1AA] dark:text-[#8E7890] font-semibold">Posts</p>
          </div>
          <div className="px-3 text-center">
            <p className="font-black text-xs text-[#18181B] dark:text-[#FDF2F8]">12.4K</p>
            <p className="text-[10px] text-[#A1A1AA] dark:text-[#8E7890] font-semibold">Followers</p>
          </div>
          <div className="px-3 text-center">
            <p className="font-black text-xs text-[#18181B] dark:text-[#FDF2F8]">228</p>
            <p className="text-[10px] text-[#A1A1AA] dark:text-[#8E7890] font-semibold">Following</p>
          </div>
        </div>

        {/* Bio Text */}
        <div className="pt-1 text-[11px] text-[#71717A] dark:text-[#D4B8D0] font-medium leading-relaxed">
          <p className="font-bold text-[#18181B] dark:text-[#FDF2F8]">Abhinav Khare</p>
          <p>UI Designer | Traveler | Lifestyle Blogger</p>
        </div>
      </div>

      {/* 3. Story Highlights Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-2">
          <h4 className="font-extrabold text-xs text-[#18181B] dark:text-[#FDF2F8]">
            Story Highlights
          </h4>
          <span className="text-[10px] text-[#A1A1AA] font-bold">5 stories</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 px-1">
          {highlights.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.isNew && setActiveHighlight(item)}
              className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
            >
              {item.isNew ? (
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-center text-[#71717A] dark:text-[#D4B8D0] group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary)] transition-all bg-[#FFF9FC] dark:bg-[#22152E]">
                  <Plus size={18} />
                </div>
              ) : (
                <div className="p-0.5 rounded-full border border-[#F3DCE8] dark:border-[#3A2A4C] group-hover:border-[var(--color-primary)] transition-all bg-white dark:bg-[#150D1E] shadow-2xs">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-11 h-11 rounded-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              )}
              <span className="text-[10px] font-bold text-[#71717A] dark:text-[#D4B8D0] group-hover:text-[#18181B] dark:group-hover:text-[#FDF2F8] truncate max-w-[50px]">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Completion Widget (Compact) */}
      <ProfileCompletionWidget variant="compact" />

      {/* 4. Navigation Menu List */}
      <div className="space-y-1 pt-2 border-t border-[#F3DCE8] dark:border-[#3A2A4C] flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && item.href !== '/feed' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#FCE7F3] text-[#BE185D] dark:bg-[#381A2B] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] shadow-2xs'
                  : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-[#EC4899] dark:text-[#F472B6]' : 'text-[#A1A1AA] dark:text-[#8E7890]'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xs ${item.badgeColor || 'bg-[#EC4899] text-white'}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Logout button */}
        <button
          type="button"
          onClick={() => (logout ? logout() : (window.location.href = '/auth/login'))}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer mt-2"
        >
          <LogOut size={18} className="text-[#A1A1AA]" />
          <span>Logout</span>
        </button>
      </div>

      {/* Story Highlight Viewer Modal */}
      {activeHighlight && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveHighlight(null)}
        >
          <div className="relative max-w-sm w-full bg-[#150D1E] rounded-3xl overflow-hidden border border-white/20 shadow-2xl p-4 text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <img src={activeHighlight.coverImage} alt={activeHighlight.title} className="w-8 h-8 rounded-full object-cover" />
                <span className="font-bold text-sm">{activeHighlight.title}</span>
              </div>
              <button onClick={() => setActiveHighlight(null)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <img src={activeHighlight.coverImage} alt="Highlight" className="w-full h-80 object-cover rounded-2xl" />
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
