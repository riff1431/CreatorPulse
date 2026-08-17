'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Bell, PlusSquare, ArrowLeft, ChevronDown, Check, Star, MessageSquare, Wallet, Sun, Moon } from 'lucide-react';
import { Avatar } from './Avatar';
import { useAuth } from '@/lib/auth/auth-context';
import { MOCK_USERS } from '@/lib/supabase/store';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { useTheme } from '@/lib/extensions/theme-engine';


const mockNotifications = [
  { id: '1', text: 'Alex Vance subscribed to Pro VIP Tier', type: 'sub', time: '5m ago', read: false },
  { id: '2', text: 'Jordan Lee left a comment on your post', type: 'comment', time: '1h ago', read: false },
  { id: '3', text: 'You received a $25 tip from Mia Wong', type: 'tip', time: '3h ago', read: true },
];

export const CreatorHeader: React.FC = () => {
  const { user, role } = useAuth();
  const { settings } = useSiteSettings();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const currentUser = user || (role === 'creator' ? MOCK_USERS['user-creator-1'] : MOCK_USERS['user-member']);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const siteName = settings.site_name || 'CreatorPulse';

  return (
    <header className="h-16 bg-white/85 dark:bg-[#1A1222]/85 border-b border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 backdrop-blur-xl">
      {/* Left: Brand */}
      <div className="flex items-center gap-3 shrink-0">
        {settings.logo_url ? (
          <img src={settings.logo_url} alt={siteName} className="h-9 w-auto max-w-[140px] object-contain rounded-2xl shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F43F5E] flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0 text-white">
            <Sparkles size={17} />
          </div>
        )}
        <div className="hidden sm:flex flex-col justify-center">
          <h1 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8] leading-tight">{siteName}</h1>
          <span className="text-[10px] text-[#EC4899] dark:text-[#F472B6] font-extrabold uppercase tracking-wider leading-tight">Creator Studio</span>
        </div>
      </div>

      {/* Right: Unified h-9 Height Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <Link
          href="/feed"
          className="h-9 px-3.5 flex items-center gap-1.5 text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] dark:hover:text-[#F472B6] transition-colors rounded-full hover:bg-[#FFF1F7] dark:hover:bg-[#241A30]"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Feed</span>
        </Link>

        {/* Live Wallet Pill */}
        <Link
          href="/balance"
          className="hidden md:flex h-9 px-3.5 rounded-full items-center gap-1.5 text-xs font-bold bg-[#FFF1F7] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] hover:bg-[#FCE7F3] transition-all shadow-2xs"
        >
          <Wallet size={14} className="text-[#EC4899] dark:text-[#F472B6]" />
          <span>$14,600.00</span>
        </Link>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-center text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] dark:hover:text-[#F472B6] hover:border-[#EC4899] transition-colors cursor-pointer shrink-0"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
        </button>

        <Link href="/feed">
          <button className="h-9 px-3.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#EC4899] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] shadow-sm shadow-pink-500/20 hover:shadow-md transition-all cursor-pointer shrink-0">
            <PlusSquare size={14} />
            <span>Publish</span>
          </button>
        </Link>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-center text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] hover:border-[#EC4899] transition-all relative cursor-pointer shrink-0"
            aria-label="Studio Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EC4899] rounded-full ring-2 ring-white dark:ring-[#0F0A14] animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1A1222] rounded-3xl border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-2">
                <span className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8]">Studio Alerts</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] font-bold text-[#EC4899] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={10} /> Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-2xl border text-xs transition-all flex gap-2.5 ${
                      n.read
                        ? 'bg-[#FFF9FC] dark:bg-[#241A30] border-transparent text-[#71717A] dark:text-[#D4B8D0]'
                        : 'bg-[#FFF1F7] dark:bg-[#381A2B] border-[#FBCFE8] dark:border-[#4C1D3B] text-[#18181B] dark:text-[#FDF2F8] font-medium'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {n.type === 'sub' ? (
                        <Star size={13} className="text-[#EC4899]" />
                      ) : n.type === 'comment' ? (
                        <MessageSquare size={13} className="text-[#EC4899]" />
                      ) : (
                        <Sparkles size={13} className="text-amber-500" />
                      )}
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="leading-snug text-xs">{n.text}</p>
                      <span className="text-[10px] text-[#A1A1AA] font-semibold">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full ring-2 ring-pink-500/20 hover:ring-pink-500 transition-all flex items-center justify-center cursor-pointer shrink-0"
          >
            <Avatar
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              size="sm"
              isVerified={currentUser.isVerified}
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1A1222] rounded-3xl border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl p-2.5 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              <Link href="/creator/dashboard" onClick={() => setShowProfileMenu(false)}>
                <div className="px-3 py-2 text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] rounded-xl transition-all cursor-pointer">
                  Creator Dashboard
                </div>
              </Link>
              <Link href="/creator/analytics" onClick={() => setShowProfileMenu(false)}>
                <div className="px-3 py-2 text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] rounded-xl transition-all cursor-pointer">
                  Studio Analytics
                </div>
              </Link>
              <div className="border-t border-[#F3DCE8] dark:border-[#3A2A4C] my-1" />
              <Link href="/feed" onClick={() => setShowProfileMenu(false)}>
                <div className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer">
                  Exit Studio
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CreatorHeader;
