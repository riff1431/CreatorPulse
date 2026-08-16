'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Sparkles, Search, Bell, Shield, LayoutDashboard, 
  User, LogOut, PlusSquare, Compass, LogIn, X, Wallet,
  CheckCircle2, Film, Image as ImageIcon, Radio, Bookmark,
  MessageSquare, Settings, ChevronDown, Check
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/auth-context';
import { MOCK_USERS } from '@/lib/supabase/store';
import { HookPoint } from '@/lib/extensions/plugin-engine';
import { useNavigation } from '@/lib/navigation/navigation-context';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { useTheme } from '@/lib/extensions/theme-engine';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isAuthenticated, logout } = useAuth();
  const { getHeaderItems } = useNavigation();
  const { settings } = useSiteSettings();
  const { activeTheme } = useTheme();

  const headerNavItems = getHeaderItems ? getHeaderItems(role || 'guest') : [];

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationTab, setNotificationTab] = useState<'all' | 'unread'>('all');
  const [unreadCount, setUnreadCount] = useState(2);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setIsMobileSearchOpen(true);
        } else {
          searchInputRef.current?.focus();
        }
      }
      if (e.key === 'Escape') {
        setIsMobileSearchOpen(false);
        setShowNotifications(false);
        setShowUserMenu(false);
        setShowCreateMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (createMenuRef.current && !createMenuRef.current.contains(target)) {
        setShowCreateMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentUser = user || (role === 'admin' 
    ? MOCK_USERS['user-admin'] 
    : role === 'creator' 
    ? MOCK_USERS['user-creator-1'] 
    : MOCK_USERS['user-member']);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMobileSearchOpen(false);
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  const logoUrl = settings.logo_url || activeTheme?.settings?.logoUrl;
  const siteName = settings.site_name || 'CreatorPulse';

  // Sample notifications list
  const notificationsList = [
    {
      id: 'notif-1',
      sender: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      action: 'published a new VIP masterclass post',
      time: '5m ago',
      isUnread: true,
      link: '/feed',
    },
    {
      id: 'notif-2',
      sender: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      action: 'sent you a tip of $15.00',
      time: '24m ago',
      isUnread: true,
      link: '/balance',
    },
    {
      id: 'notif-3',
      sender: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      action: 'started following your creator profile',
      time: '2h ago',
      isUnread: false,
      link: '/c/elena_art',
    },
  ];

  const filteredNotifications = notificationTab === 'unread' 
    ? notificationsList.filter(n => n.isUnread)
    : notificationsList;

  return (
    <>
      <header 
        className={`sticky top-0 z-40 w-full transition-all duration-250 ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#0F0A14]/95 backdrop-blur-xl border-b border-[#F3DCE8]/80 dark:border-[#3A2A4C] shadow-sm shadow-pink-500/5 py-2.5'
            : 'bg-white/85 dark:bg-[#0F0A14]/85 backdrop-blur-md border-b border-[#F3DCE8]/60 dark:border-[#3A2A4C]/60 py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* 1. Brand Logo */}
          <Link href="/feed" className="flex items-center gap-2.5 group shrink-0 select-none">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-9 w-auto max-w-[160px] object-contain rounded-xl" />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F43F5E] flex items-center justify-center shadow-md shadow-[#EC4899]/25 group-hover:scale-105 transition-transform duration-200">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight text-[#18181B] dark:text-[#FDF2F8] flex items-center gap-1">
                    {siteName}
                  </span>
                  <span className="text-[10px] text-[#71717A] dark:text-[#D4B8D0] block -mt-1 font-semibold tracking-wide">
                    {settings.tagline || 'Creator SaaS Platform'}
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* 2. Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <Link
              href="/feed"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                pathname === '/feed'
                  ? 'bg-[#FCE7F3] text-[#BE185D] dark:bg-[#381A2B] dark:text-[#EC4899]'
                  : 'text-[#52525B] hover:text-[#BE185D] hover:bg-[#FFF1F7] dark:text-[#D4B8D0] dark:hover:bg-[#241A30]'
              }`}
            >
              Feed
            </Link>
            <Link
              href="/explore"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                pathname === '/explore'
                  ? 'bg-[#FCE7F3] text-[#BE185D] dark:bg-[#381A2B] dark:text-[#EC4899]'
                  : 'text-[#52525B] hover:text-[#BE185D] hover:bg-[#FFF1F7] dark:text-[#D4B8D0] dark:hover:bg-[#241A30]'
              }`}
            >
              Explore
            </Link>
            <Link
              href="/shorts"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                pathname === '/shorts'
                  ? 'bg-[#FCE7F3] text-[#BE185D] dark:bg-[#381A2B] dark:text-[#EC4899]'
                  : 'text-[#52525B] hover:text-[#BE185D] hover:bg-[#FFF1F7] dark:text-[#D4B8D0] dark:hover:bg-[#241A30]'
              }`}
            >
              Reels
            </Link>
            {headerNavItems.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                target={item.target || '_self'}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#52525B] hover:text-[#BE185D] hover:bg-[#FFF1F7] dark:text-[#D4B8D0] dark:hover:bg-[#241A30] transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* 3. Global Search Input (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-sm relative items-center">
            <Search className="absolute left-3.5 text-[#A1A1AA] pointer-events-none" size={15} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators, posts, tags..."
              className="w-full bg-[#FFF9FC] dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] focus:border-[#EC4899] focus:bg-white dark:focus:bg-[#241A30] rounded-xl pl-9 pr-14 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20 transition-all font-medium"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-md text-[#A1A1AA] hover:text-[#18181B] cursor-pointer"
              >
                <X size={13} />
              </button>
            ) : (
              <kbd className="absolute right-3 hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-[#A1A1AA] bg-white dark:bg-[#241A30] border border-[#E4E4E7] dark:border-[#3A2A4C] rounded shadow-2xs pointer-events-none">
                ⌘K
              </kbd>
            )}
          </form>

          {/* 4. Action Controls & Profiles */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden p-2 rounded-xl text-[#71717A] dark:text-[#D4B8D0] hover:text-[#BE185D] hover:bg-[#FDF2F8] dark:hover:bg-[#241A30] transition-colors border border-transparent hover:border-[#F3DCE8]"
              aria-label="Open Search"
            >
              <Search size={18} />
            </button>

            <HookPoint name="navbar_actions" />

            {/* Wallet / Balance Quick Pill for Authenticated Users */}
            {isAuthenticated && (
              <Link
                href="/balance"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FDF2F8] text-[#BE185D] border border-[#FBCFE8] hover:bg-[#FCE7F3] dark:bg-[#381A2B] dark:text-[#EC4899] dark:border-[#4C1D3B] transition-all shadow-2xs"
                title="Your Wallet Balance"
              >
                <Wallet size={14} className="text-[#EC4899]" />
                <span>$240.50</span>
              </Link>
            )}

            {/* Creator "Create +" Action Dropdown */}
            {role === 'creator' && (
              <div className="relative" ref={createMenuRef}>
                <button
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#EC4899] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] transition-all shadow-sm shadow-pink-500/25 hover:shadow-md cursor-pointer"
                >
                  <PlusSquare size={15} />
                  <span className="hidden sm:inline">Create</span>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${showCreateMenu ? 'rotate-180' : ''}`} />
                </button>

                {showCreateMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl p-2 z-50 shadow-xl shadow-pink-500/10 animate-in fade-in zoom-in-95 duration-150">
                    <Link
                      href="/creator/dashboard"
                      onClick={() => setShowCreateMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#18181B] dark:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#BE185D] transition-colors"
                    >
                      <ImageIcon size={15} className="text-[#EC4899]" />
                      <span>New Post</span>
                    </Link>
                    <Link
                      href="/creator/stories"
                      onClick={() => setShowCreateMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#18181B] dark:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#BE185D] transition-colors"
                    >
                      <Radio size={15} className="text-amber-500" />
                      <span>Upload Story</span>
                    </Link>
                    <Link
                      href="/shorts"
                      onClick={() => setShowCreateMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#18181B] dark:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#BE185D] transition-colors"
                    >
                      <Film size={15} className="text-indigo-500" />
                      <span>New Reel</span>
                    </Link>
                    <div className="my-1 border-t border-[#F3DCE8] dark:border-[#3A2A4C]" />
                    <Link
                      href="/creator/dashboard"
                      onClick={() => setShowCreateMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#BE185D] dark:text-[#EC4899] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] transition-colors"
                    >
                      <LayoutDashboard size={15} />
                      <span>Creator Studio</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Admin Quick Badge */}
            {role === 'admin' && (
              <Link href="/admin/dashboard">
                <Button 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<Shield size={15} className="text-[#EC4899]" />}
                  className="border-[#F3DCE8] hover:border-[#EC4899]"
                >
                  <span className="hidden sm:inline">Admin Hub</span>
                </Button>
              </Link>
            )}

            {/* Notifications Drawer Toggle */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl text-[#71717A] dark:text-[#D4B8D0] hover:text-[#BE185D] hover:bg-[#FDF2F8] dark:hover:bg-[#241A30] transition-all relative border border-transparent hover:border-[#F3DCE8] dark:hover:border-[#3A2A4C] cursor-pointer"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EC4899] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EC4899] ring-2 ring-white dark:ring-[#0F0A14]"></span>
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl p-4 space-y-3 z-50 shadow-2xl shadow-pink-500/10 animate-in fade-in zoom-in-95 duration-150">
                  {/* Header & Tabs */}
                  <div className="flex items-center justify-between border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#18181B] dark:text-[#FDF2F8]">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="text-[10px] text-[#BE185D] bg-[#FCE7F3] px-2 py-0.5 rounded-full font-extrabold">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-[#EC4899] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1.5 p-1 bg-[#FFF9FC] dark:bg-[#241A30] rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setNotificationTab('all')}
                      className={`flex-1 py-1 rounded-lg text-center transition-all ${
                        notificationTab === 'all'
                          ? 'bg-white dark:bg-[#1A1222] text-[#BE185D] dark:text-[#EC4899] shadow-xs'
                          : 'text-[#71717A] hover:text-[#18181B]'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setNotificationTab('unread')}
                      className={`flex-1 py-1 rounded-lg text-center transition-all ${
                        notificationTab === 'unread'
                          ? 'bg-white dark:bg-[#1A1222] text-[#BE185D] dark:text-[#EC4899] shadow-xs'
                          : 'text-[#71717A] hover:text-[#18181B]'
                      }`}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>

                  {/* Notification Items */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notif) => (
                        <Link
                          key={notif.id}
                          href={notif.link}
                          onClick={() => setShowNotifications(false)}
                          className={`p-2.5 rounded-xl border flex items-start gap-3 transition-colors ${
                            notif.isUnread
                              ? 'bg-[#FFF9FC] dark:bg-[#241A30]/60 border-[#FBCFE8] dark:border-[#4C1D3B]'
                              : 'bg-white dark:bg-[#1A1222] border-[#F3DCE8]/60 dark:border-[#3A2A4C]/60 hover:bg-[#FFF9FC]'
                          }`}
                        >
                          <Avatar alt={notif.sender} size="sm" src={notif.avatar} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#18181B] dark:text-[#FDF2F8] leading-tight">
                              <strong className="font-bold">{notif.sender}</strong> {notif.action}
                            </p>
                            <span className="text-[10px] text-[#A1A1AA] mt-1 block">{notif.time}</span>
                          </div>
                          {notif.isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#EC4899] shrink-0 mt-1" />
                          )}
                        </Link>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-[#A1A1AA]">
                        No notifications to display
                      </div>
                    )}
                  </div>

                  {/* Footer Link */}
                  <div className="border-t border-[#F3DCE8] dark:border-[#3A2A4C] pt-2 text-center">
                    <Link
                      href="/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-bold text-[#BE185D] hover:underline"
                    >
                      View all notification history →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Menu Popover */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-[#EC4899]/40 transition-all cursor-pointer select-none"
                  aria-label="User Account Menu"
                >
                  <Avatar
                    alt={currentUser.fullName}
                    src={currentUser.avatarUrl}
                    size="sm"
                    isVerified={currentUser.isVerified}
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl p-3 space-y-2 z-50 shadow-2xl shadow-pink-500/10 animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* User Profile Header */}
                    <div className="px-2.5 py-2 bg-[#FFF9FC] dark:bg-[#241A30] rounded-xl border border-[#F3DCE8] dark:border-[#3A2A4C]">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-[#18181B] dark:text-[#FDF2F8] truncate">{currentUser.fullName}</p>
                        {currentUser.isVerified && <CheckCircle2 size={14} className="text-[#EC4899] shrink-0" />}
                      </div>
                      <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] truncate">@{currentUser.username}</p>
                      
                      <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#F3DCE8]/60 dark:border-[#3A2A4C]/60 text-[11px]">
                        <span className="font-bold text-[#BE185D] bg-[#FCE7F3] dark:bg-[#381A2B] px-2 py-0.5 rounded-md uppercase text-[10px]">
                          {role}
                        </span>
                        <span className="font-bold text-[#18181B] dark:text-[#FDF2F8]">
                          Bal: $240.50
                        </span>
                      </div>
                    </div>

                    {/* Navigation Menu Options */}
                    <div className="space-y-0.5 text-xs text-[#18181B] dark:text-[#FDF2F8] font-medium pt-1">
                      <Link
                        href={`/c/${currentUser.username}`}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#BE185D] transition-colors"
                      >
                        <User size={15} className="text-[#EC4899]" />
                        <span>My Public Profile</span>
                      </Link>

                      {role === 'creator' && (
                        <Link
                          href="/creator/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#BE185D] transition-colors"
                        >
                          <LayoutDashboard size={15} className="text-[#EC4899]" />
                          <span>Creator Studio</span>
                        </Link>
                      )}

                      {role === 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#BE185D] transition-colors"
                        >
                          <Shield size={15} className="text-[#F43F5E]" />
                          <span>Admin Control Panel</span>
                        </Link>
                      )}

                      <Link
                        href="/balance"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#BE185D] transition-colors"
                      >
                        <Wallet size={15} className="text-emerald-500" />
                        <span>Wallet & Earnings</span>
                      </Link>

                      <Link
                        href="/messages"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#BE185D] transition-colors"
                      >
                        <MessageSquare size={15} className="text-indigo-500" />
                        <span>Direct Messages</span>
                      </Link>

                      <Link
                        href="/saved"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#BE185D] transition-colors"
                      >
                        <Bookmark size={15} className="text-amber-500" />
                        <span>Saved Bookmarks</span>
                      </Link>

                      <div className="my-1 border-t border-[#F3DCE8] dark:border-[#3A2A4C]" />

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FFE4E6] dark:hover:bg-[#381A2B] hover:text-[#BE123C] transition-colors text-[#71717A] cursor-pointer font-bold"
                      >
                        <LogOut size={15} className="text-[#F43F5E]" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay Modal */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1A1222] rounded-2xl p-4 shadow-2xl space-y-4 border border-[#F3DCE8] dark:border-[#3A2A4C]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18181B] dark:text-[#FDF2F8]">Search CreatorPulse</h3>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-1 rounded-lg text-[#71717A] hover:bg-[#FCE7F3]"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators, posts, topics..."
                className="w-full bg-[#FFF9FC] dark:bg-[#241A30] border border-[#F3DCE8] dark:border-[#3A2A4C] focus:border-[#EC4899] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20"
              />
            </form>
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['#art', '#music', '#gaming', '#fitness', '#photography', 'VIP Passes'].map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag.replace('#', ''));
                      router.push(`/explore?q=${encodeURIComponent(tag.replace('#', ''))}`);
                      setIsMobileSearchOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FCE7F3] text-[#BE185D] hover:bg-[#FBCFE8] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
