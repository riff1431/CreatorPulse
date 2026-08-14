'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Bell, PlusSquare, ArrowLeft, ChevronDown, Check, Star, MessageSquare } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/auth/auth-context';
import { MOCK_USERS } from '@/lib/supabase/store';
import { useSiteSettings } from '@/lib/settings/site-settings-context';

const mockNotifications = [
  { id: '1', text: 'Alex Vance subscribed to Pro Designer Tier', type: 'sub', time: '5m ago', read: false },
  { id: '2', text: 'Jordan Lee left a comment on your post', type: 'comment', time: '1h ago', read: false },
  { id: '3', text: 'You received a $20 support tip from Mia Wong', type: 'tip', time: '3h ago', read: true },
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

  // Close dropdowns on outside click
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

  return (
    <header className="h-16 bg-white/85 border-b border-[#F3DCE8] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 backdrop-blur-xl">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        {settings.logo_url ? (
          <img src={settings.logo_url} alt={settings.site_name || 'CreatorPulse'} className="h-10 w-auto max-w-[140px] object-contain rounded-2xl shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-2xl gradient-btn flex items-center justify-center shadow-md shadow-[#EC4899]/25 animate-float shrink-0">
            <Sparkles className="text-white" size={18} />
          </div>
        )}
        <div className="hidden sm:block">
          <h1 className="text-sm font-black text-[#18181B] leading-none">{settings.site_name || 'CreatorPulse'}</h1>
          <span className="text-[10px] text-[#BE185D] font-bold uppercase tracking-wider">Creator Studio</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/feed"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#71717A] hover:text-[#DB2777] transition-colors px-3 py-1.5 rounded-xl hover:bg-[#FDF2F8]"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to Feed</span>
        </Link>

        <Link href="/creator/posts">
          <button className="flex items-center gap-1.5 text-xs font-bold text-white gradient-btn px-4 py-2 rounded-xl shadow-md shadow-[#EC4899]/20 hover:shadow-[#EC4899]/35 hover:-translate-y-0.5 transition-all cursor-pointer">
            <PlusSquare size={14} />
            <span className="hidden sm:inline">Publish</span>
          </button>
        </Link>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-[#71717A] hover:text-[#DB2777] hover:bg-[#FDF2F8] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#F3DCE8]"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EC4899] rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-[#F3DCE8] shadow-xl shadow-[#EC4899]/10 p-4 space-y-3 z-50 animate-scale-up">
              <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-2">
                <span className="text-xs font-black text-[#18181B]">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] font-bold text-[#EC4899] hover:underline flex items-center gap-1"
                  >
                    <Check size={10} /> Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border text-[11px] transition-all flex gap-2.5 ${
                      n.read
                        ? 'bg-[#FFF9FC]/50 border-transparent text-[#71717A]'
                        : 'bg-[#FFF1F7] border-[#FBCFE8] text-[#18181B] font-medium shadow-xs shadow-[#EC4899]/5'
                    }`}
                  >
                    <div className="mt-0.5">
                      {n.type === 'sub' ? (
                        <Star size={12} className="text-[#EC4899]" />
                      ) : n.type === 'comment' ? (
                        <MessageSquare size={12} className="text-[#BE185D]" />
                      ) : (
                        <Sparkles size={12} className="text-amber-500" />
                      )}
                    </div>
                    <div className="space-y-0.5 flex-1 leading-normal">
                      <p>{n.text}</p>
                      <span className="text-[9px] text-[#A1A1AA] font-semibold">{n.time}</span>
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
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-2xl hover:bg-[#FDF2F8] transition-colors cursor-pointer border border-transparent hover:border-[#F3DCE8]"
          >
            <Avatar
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              size="sm"
              isVerified={currentUser.isVerified}
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#18181B] leading-none">{currentUser.fullName}</p>
              <p className="text-[10px] text-[#BE185D] font-semibold">
                {currentUser.role === 'admin' ? 'Super Admin' : currentUser.role === 'creator' ? 'Verified Creator' : 'Member'}
              </p>
            </div>
            <ChevronDown size={12} className="text-[#A1A1AA] hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2.5 w-48 bg-white/95 backdrop-blur-md rounded-2xl border border-[#F3DCE8] shadow-xl p-2.5 space-y-1 z-50 animate-scale-up">
              <Link href="/creator/settings">
                <div className="px-3 py-2 text-xs font-semibold text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7] rounded-xl transition-all cursor-pointer">
                  Profile Settings
                </div>
              </Link>
              <Link href="/creator/memberships">
                <div className="px-3 py-2 text-xs font-semibold text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7] rounded-xl transition-all cursor-pointer">
                  Memberships
                </div>
              </Link>
              <hr className="border-[#F3DCE8]" />
              <Link href="/feed">
                <div className="px-3 py-2 text-xs font-semibold text-[#71717A] hover:text-[#BE123C] hover:bg-rose-50 rounded-xl transition-all cursor-pointer">
                  Log Out
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
