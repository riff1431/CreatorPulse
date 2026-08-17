'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Compass, Film, Bookmark, LayoutDashboard, Shield, 
  Database, Wallet, Bell, MessageSquare, Sparkles, User, Settings,
  Crown, Lock, BarChart2, Radio, LogOut, Moon, Sun, ChevronRight,
  TrendingUp, Users, Palette, Cpu, CheckCircle2, Play, Clock
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useFollow } from '@/lib/follow/use-follow';
import { Avatar } from '../ui/Avatar';
import { useTheme } from '@/lib/extensions/theme-engine';
import { MOCK_USERS } from '@/lib/supabase/store';


export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { role, user, isAuthenticated, logout } = useAuth();
  const { counts } = useFollow();
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Active user data
  const currentUser = user || (role === 'admin' 
    ? MOCK_USERS['user-admin'] 
    : role === 'creator' 
    ? MOCK_USERS['user-creator-1'] 
    : MOCK_USERS['user-member']);

  const walletBalance = role === 'creator' ? '$14,600.00' : role === 'admin' ? '$28,450.00' : '$240.50';

  // 1. Discover & Feed Navigation
  const discoverItems = [
    { label: 'Home Feed', href: '/feed', icon: Home },
    { label: 'Explore & Search', href: '/explore', icon: Compass },
    { 
      label: 'Connections', 
      href: '/connections', 
      icon: Users, 
      badge: counts.pendingIncomingCount > 0 ? `${counts.pendingIncomingCount}` : undefined, 
      badgeColor: 'bg-amber-500 text-white' 
    },
    { label: 'Reels & Shorts', href: '/shorts', icon: Film, badge: 'Hot', badgeColor: 'bg-rose-500 text-white' },
    { label: 'Direct Messages', href: '/messages', icon: MessageSquare, badge: '3', badgeColor: 'bg-[#EC4899] text-white' },
    { label: 'Notifications', href: '/notifications', icon: Bell, badge: '2', badgeColor: 'bg-amber-500 text-white' },
    { label: 'Saved Bookmarks', href: '/saved', icon: Bookmark },
    { label: 'Activity & History', href: '/history', icon: Clock },
  ];

  // 2. Memberships & Vault
  const membershipItems = [
    { label: 'VIP Subscriptions', href: '/member/dashboard', icon: Crown },
    { label: 'Wallet & Payouts', href: '/balance', icon: Wallet, badge: walletBalance, badgeColor: 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B]' },
    { label: 'Unlocked Vault', href: '/saved?tab=vault', icon: Lock },
  ];

  // 3. Creator Studio & Tools
  const creatorItems = [
    { label: 'Studio Dashboard', href: '/creator/dashboard', icon: LayoutDashboard },
    { label: 'VIP Membership Tiers', href: '/creator/memberships', icon: Sparkles },
    { label: 'Go Live Studio', href: '/live', icon: Radio, badge: 'Live', badgeColor: 'bg-red-500 text-white animate-pulse' },
    { label: 'Audience Analytics', href: '/creator/dashboard?tab=analytics', icon: BarChart2 },
  ];

  // 4. Administration
  const adminItems = [
    { label: 'Admin Console', href: '/admin/dashboard', icon: Shield },
    { label: 'Theme Manager', href: '/admin/themes', icon: Palette },
    { label: 'Plugin Extensions', href: '/admin/plugins', icon: Cpu },
    { label: 'Database Inspector', href: '/database', icon: Database },
  ];

  return (
    <aside className="w-68 hidden lg:flex flex-col gap-5 p-3.5 sticky top-20 h-[calc(100vh-5.5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-pink-200 dark:scrollbar-thumb-pink-950 rounded-3xl border border-[#F3DCE8]/80 dark:border-[#3A2A4C]/80 bg-white/85 dark:bg-[#150D1E]/85 backdrop-blur-xl shrink-0 shadow-sm shadow-pink-500/5 select-none">
      
      {/* 1. Logged In User Profile Mini Card */}
      {isAuthenticated && (
        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#FFF9FC] to-[#FFF1F7] dark:from-[#22152E] dark:to-[#1A1024] border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xs">
          <div className="flex items-center gap-3">
            <Link href={`/c/${currentUser.username}`} className="group relative shrink-0">
              <Avatar
                alt={currentUser.fullName}
                src={currentUser.avatarUrl}
                size="md"
                isVerified={currentUser.isVerified}
                className="group-hover:scale-105 transition-transform"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/c/${currentUser.username}`} className="block group">
                <p className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8] truncate group-hover:text-[#EC4899] transition-colors">
                  {currentUser.fullName}
                </p>
                <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] truncate">
                  @{currentUser.username}
                </p>
              </Link>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-[#EC4899] to-[#F43F5E] text-white shadow-2xs">
                  {role}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {walletBalance}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DISCOVER & FEED SECTION */}
      <div className="space-y-0.5">
        <p className="text-[10px] font-black uppercase tracking-wider text-[#A1A1AA] dark:text-[#8E7890] px-3 mb-1.5 flex items-center justify-between">
          <span>Discover</span>
          <Sparkles size={11} className="text-[#EC4899]" />
        </p>
        {discoverItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && item.href !== '/feed' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#FCE7F3] text-[#BE185D] dark:bg-[#381A2B] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] shadow-2xs'
                  : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} className={isActive ? 'text-[#EC4899] dark:text-[#F472B6]' : 'text-[#A1A1AA] dark:text-[#8E7890]'} />
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
      </div>

      {/* 3. MEMBERSHIPS & VAULT SECTION */}
      <div className="space-y-0.5">
        <p className="text-[10px] font-black uppercase tracking-wider text-[#A1A1AA] dark:text-[#8E7890] px-3 mb-1.5 flex items-center justify-between">
          <span>Memberships & Vault</span>
          <Crown size={11} className="text-amber-500" />
        </p>
        {membershipItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#FCE7F3] text-[#BE185D] dark:bg-[#381A2B] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] shadow-2xs'
                  : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} className={isActive ? 'text-[#EC4899] dark:text-[#F472B6]' : 'text-[#A1A1AA] dark:text-[#8E7890]'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* 4. CREATOR STUDIO (If Creator or Admin) */}
      {(role === 'creator' || role === 'admin') && (
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#A1A1AA] dark:text-[#8E7890] px-3 mb-1.5 flex items-center justify-between">
            <span>Creator Studio</span>
            <LayoutDashboard size={11} className="text-[#EC4899]" />
          </p>
          {creatorItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#FCE7F3] text-[#BE185D] dark:bg-[#381A2B] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] shadow-2xs'
                    : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive ? 'text-[#EC4899] dark:text-[#F472B6]' : 'text-[#A1A1AA] dark:text-[#8E7890]'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xs ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* 5. ADMINISTRATION (If Admin) */}
      {role === 'admin' && (
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#A1A1AA] dark:text-[#8E7890] px-3 mb-1.5 flex items-center justify-between">
            <span>Admin Console</span>
            <Shield size={11} className="text-[#F43F5E]" />
          </p>
          {adminItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 shadow-2xs'
                    : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive ? 'text-[#F43F5E]' : 'text-[#A1A1AA] dark:text-[#8E7890]'} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* 6. PREFERENCES & ACCOUNT SETTINGS */}
      <div className="space-y-0.5 pt-2 border-t border-[#F3DCE8] dark:border-[#3A2A4C]">
        <p className="text-[10px] font-black uppercase tracking-wider text-[#A1A1AA] dark:text-[#8E7890] px-3 mb-1.5">
          Account & System
        </p>

        <Link
          href="/settings"
          className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
            pathname === '/settings'
              ? 'bg-[#FCE7F3] text-[#BE185D] dark:bg-[#381A2B] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B]'
              : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Settings size={16} className="text-[#A1A1AA] dark:text-[#8E7890]" />
            <span>Account Settings</span>
          </div>
          <ChevronRight size={13} className="text-[#A1A1AA]" />
        </Link>

        {/* Quick Dark Mode Switcher */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-[#A1A1AA]" />}
            <span>{isDarkMode ? 'Light Theme' : 'Dark Theme'}</span>
          </div>
          <span className="text-[10px] text-[#A1A1AA] uppercase font-black">{isDarkMode ? 'Dark' : 'Light'}</span>
        </button>

        {/* Sign Out Action */}
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer mt-1"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {/* 7. Fan Callout: Monetize / Become Creator */}
      {role === 'member' && (
        <div className="mt-auto bg-gradient-to-br from-[#FFF1F7] to-[#FCE7F3] dark:from-[#24152F] dark:to-[#1C1026] border border-[#FBCFE8] dark:border-[#4C1D3B] p-3.5 rounded-2xl space-y-2 relative overflow-hidden shadow-xs">
          <div className="flex items-center gap-2 text-[#BE185D] dark:text-[#F472B6]">
            <Sparkles size={15} />
            <h5 className="font-black text-xs tracking-tight">Monetize Your Audience</h5>
          </div>
          <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] leading-relaxed">
            Create VIP subscription tiers, paywalled video drops, and instant fan tips.
          </p>
          <Link
            href="/auth/signup"
            className="block text-center text-xs font-black text-white bg-gradient-to-r from-[#EC4899] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] py-2 rounded-xl shadow-xs shadow-pink-500/20 transition-all cursor-pointer"
          >
            Become a Creator
          </Link>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
