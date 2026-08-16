'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Bell, PlusSquare, ArrowLeft, ChevronDown, Check, Star, MessageSquare, Wallet } from 'lucide-react';
import { Avatar } from './Avatar';
import { useAuth } from '@/lib/auth/auth-context';
import { MOCK_USERS } from '@/lib/supabase/store';
import { useSiteSettings } from '@/lib/settings/site-settings-context';

const mockNotifications = [
  { id: '1', text: 'Alex Vance subscribed to Pro VIP Tier', type: 'sub', time: '5m ago', read: false },
  { id: '2', text: 'Jordan Lee left a comment on your post', type: 'comment', time: '1h ago', read: false },
  { id: '3', text: 'You received a $25 tip from Mia Wong', type: 'tip', time: '3h ago', read: true },
];

export const CreatorHeader: React.FC = () => {
  const { user, role } = useAuth();
  const { settings } = useSiteSettings();
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
    <header className="h-16 bg-white/90 dark:bg-[#0F0A14]/90 border-b border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 backdrop-blur-xl">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        {settings.logo_url ? (
          <img src={settings.logo_url} alt={siteName} className="h-9 w-auto max-w-[140px] object-contain rounded-2xl shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F43F5E] flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
            <Sparkles className="text-white" size={17} />
          </div>
        )}
        <div className="hidden sm:block">
          <h1 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8] leading-none">{siteName}</h1>
          <span className="text-[10px] text-[#EC4899] font-extrabold uppercase tracking-wider">Creator Studio</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/feed"
          className="flex items-center gap-1.5 text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] transition-colors px-3 py-1.5 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30]"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Feed</span>
        </Link>

        {/* Live Wallet Pill */}
        <Link
          href="/balance"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FDF2F8] text-[#BE185D] border border-[#FBCFE8] hover:bg-[#FCE7F3] dark:bg-[#381A2B] dark:text-[#EC4899] dark:border-[#4C1D3B] transition-all"
        >
          <Wallet size={14} className="text-[#EC4899]" />
          <span>$1,450.00</span>
        </Link>

        <Link href="/creator/posts">
          <button className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#EC4899] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] px-3.5 py-1.5 sm:py-2 rounded-xl shadow-md shadow-pink-500/20 transition-all cursor-pointer">
            <PlusSquare size={14} />
            <span>Publish</span>
          </button>
        </Link>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#F3DCE8] dark:hover:border-[#3A2A4C]"
            aria-label="Studio Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EC4899] rounded-full ring-2 ring-white dark:ring-[#0F0A14] animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1A1222] rounded-2xl border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                    className={`p-2.5 rounded-xl border text-xs transition-all flex gap-2.5 ${
                      n.read
                        ? 'bg-[#FFF9FC]/50 dark:bg-[#241A30]/30 border-transparent text-[#71717A] dark:text-[#D4B8D0]'
                        : 'bg-[#FFF1F7] dark:bg-[#381A2B]/70 border-[#FBCFE8] dark:border-[#4C1D3B] text-[#18181B] dark:text-[#FDF2F8] font-medium'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {n.type === 'sub' ? (
                        <Star size={13} className="text-[#EC4899]" />
                      ) : n.type === 'comment' ? (
                        <MessageSquare size={13} className="text-[#BE185D]" />
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
            className="flex items-center gap-2 p-1 rounded-2xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] transition-colors cursor-pointer"
          >
            <Avatar
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              size="sm"
              isVerified={currentUser.isVerified}
            />
            <ChevronDown size={12} className="text-[#A1A1AA] hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1A1222] rounded-2xl border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl p-2.5 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              <Link href="/creator/settings" onClick={() => setShowProfileMenu(false)}>
                <div className="px-3 py-2 text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] rounded-xl transition-all cursor-pointer">
                  Profile Settings
                </div>
              </Link>
              <Link href="/creator/memberships" onClick={() => setShowProfileMenu(false)}>
                <div className="px-3 py-2 text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] rounded-xl transition-all cursor-pointer">
                  VIP Memberships
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
