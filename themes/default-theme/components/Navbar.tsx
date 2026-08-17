'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Sparkles, Search, Bell, Shield, LayoutDashboard, 
  User, LogOut, PlusSquare, X, Wallet,
  CheckCircle2, Film, Image as ImageIcon, Bookmark,
  MessageSquare, Settings, ChevronDown, Check, Menu, Moon, Sun,
  ExternalLink, Crown, CreditCard, ChevronRight, HelpCircle,
  Eye, Compass, Play
} from 'lucide-react';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { useAuth } from '@/lib/auth/auth-context';
import { MOCK_USERS, MOCK_CREATOR_DETAILS } from '@/lib/supabase/store';
import { useNavigation } from '@/lib/navigation/navigation-context';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { useTheme } from '@/lib/extensions/theme-engine';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isAuthenticated, logout } = useAuth();
  const { getHeaderItems } = useNavigation();
  const { settings } = useSiteSettings();
  const { activeTheme, isDarkMode, toggleDarkMode } = useTheme();

  // Dynamic Navigation Items from Navigation context
  const headerNavItems = useMemo(() => {
    const items = getHeaderItems ? getHeaderItems(role || 'guest') : [];
    if (items && items.length > 0) return items;
    // Fallback default clean navigation items
    return [
      { id: 'def-1', title: 'Feed', url: '/feed', isEnabled: true, target: '_self' as const },
      { id: 'def-2', title: 'Explore Creators', url: '/explore', isEnabled: true, target: '_self' as const },
      { id: 'def-3', title: 'Shorts & Reels', url: '/shorts', isEnabled: true, target: '_self' as const },
    ];
  }, [getHeaderItems, role]);

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Popover States
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationTab, setNotificationTab] = useState<'all' | 'unread' | 'earnings'>('all');
  const [unreadCount, setUnreadCount] = useState(2);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Refs
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);

  // Scroll detection for navbar elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setIsSearchModalOpen(false);
        setIsMobileDrawerOpen(false);
        setShowNotifications(false);
        setShowUserMenu(false);
        setShowCreateMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdowns and search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchFocused(false);
      }
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

  // Current active user data
  const currentUser = user || (role === 'admin' 
    ? MOCK_USERS['user-admin'] 
    : role === 'creator' 
    ? MOCK_USERS['user-creator-1'] 
    : MOCK_USERS['user-member']);

  // Format dynamic wallet balance
  const walletBalance = useMemo(() => {
    if (role === 'creator') return '$14,600.00';
    if (role === 'admin') return '$28,450.00';
    return '$240.50';
  }, [role]);

  // Live dynamic search suggestions
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return Object.values(MOCK_CREATOR_DETAILS).filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q) ||
        (c.bio || '').toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      setIsSearchModalOpen(false);
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
    setUnreadCount(0);
  };

  const logoUrl = settings.logo_url || activeTheme?.settings?.logoUrl;
  const siteName = settings.site_name || 'CreatorPulse';

  // Dynamic notifications list
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      sender: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      action: 'published a new VIP masterclass drop',
      time: '5m ago',
      isUnread: true,
      category: 'memberships',
      link: '/feed',
    },
    {
      id: 'notif-2',
      sender: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      action: 'sent you a creator tip of $15.00',
      time: '24m ago',
      isUnread: true,
      category: 'earnings',
      link: '/balance',
    },
    {
      id: 'notif-3',
      sender: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      action: 'started following your creator profile',
      time: '2h ago',
      isUnread: false,
      category: 'all',
      link: '/c/elena_art',
    },
  ]);

  const filteredNotifications = notifications.filter((n) => {
    if (notificationTab === 'unread') return n.isUnread;
    if (notificationTab === 'earnings') return n.category === 'earnings';
    return true;
  });

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return (
    <>
      <header 
        className={`sticky top-0 z-40 w-full transition-all duration-300 pt-[max(env(safe-area-inset-top),0px)] ${
          isScrolled
            ? 'bg-white/85 dark:bg-[#0F0A14]/85 backdrop-blur-2xl border-b border-[#F3DCE8]/80 dark:border-[#3A2A4C]/80 shadow-[0_4px_30px_rgba(0,0,0,0.03)]'
            : 'bg-white/70 dark:bg-[#0F0A14]/70 backdrop-blur-xl border-b border-[#F3DCE8]/40 dark:border-[#3A2A4C]/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-[54px] sm:h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-3 xl:gap-6">
          
          {/* 1. Left: Mobile Hamburger Toggle & Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden w-9 h-9 rounded-2xl flex items-center justify-center text-[#18181B] dark:text-[#FDF2F8] bg-[#FFF9FC] dark:bg-[#1A1222] hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-all border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-pink-200 dark:hover:border-pink-900 active:scale-95 cursor-pointer shadow-sm"
              aria-label="Open mobile navigation menu"
            >
              <Menu size={18} className="stroke-[2.5]" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group select-none">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-8 sm:h-9 w-auto max-w-[130px] sm:max-w-[150px] object-contain rounded-xl" />
              ) : (
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#EC4899] via-[#F43F5E] to-[#FB7185] flex items-center justify-center shadow-md shadow-pink-500/25 group-hover:scale-105 transition-transform duration-200 shrink-0 text-white">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-sm sm:text-base font-black tracking-tight text-[#18181B] dark:text-[#FDF2F8] leading-tight">
                      {siteName}
                    </span>
                    <span className="text-[10px] text-[#71717A] dark:text-[#D4B8D0] font-bold tracking-wide leading-tight hidden 2xl:inline">
                      {settings.tagline || 'Creator SaaS Platform'}
                    </span>
                  </div>
                </div>
              )}
            </Link>
          </div>

          {/* 2. Center: Desktop Navigation Links (Responsive Padding) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            {headerNavItems.map((item) => {
              const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url));
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.target || '_self'}
                  className={`h-8 sm:h-9 px-2.5 xl:px-3.5 flex items-center text-xs font-bold whitespace-nowrap rounded-full transition-all ${
                    isActive
                      ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] shadow-2xs'
                      : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] dark:hover:text-[#F472B6] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] border border-transparent'
                  }`}
                >
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. Right: Action Controls & User Navbar Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 justify-end">
            
            {/* Search Icon Trigger for Mobile & Laptops (< xl) */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="xl:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] border border-[#F3DCE8] dark:border-[#3A2A4C] transition-colors cursor-pointer"
              aria-label="Open Search"
              title="Search Creators (⌘K)"
            >
              <Search size={15} />
            </button>

            {/* Desktop Search Bar (Visible on xl+ screens) */}
            <div ref={searchContainerRef} className="relative hidden xl:flex items-center h-9">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center h-9">
                <Search className="absolute left-3 text-[#A1A1AA] dark:text-[#8E7890] pointer-events-none" size={14} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  placeholder="Search creators..."
                  className="h-9 pl-8 pr-11 rounded-full bg-[#FFF9FC] dark:bg-[#241A30] border border-[#F3DCE8] dark:border-[#3A2A4C] focus:border-[#EC4899] focus:bg-white dark:focus:bg-[#1A1222] text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-pink-500/20 w-36 2xl:w-48 focus:w-52 transition-all font-medium"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 p-1 rounded-full text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8] cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X size={12} />
                  </button>
                ) : (
                  <kbd className="absolute right-2.5 hidden 2xl:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-[#A1A1AA] dark:text-[#8E7890] bg-white dark:bg-[#1A1222] border border-[#E4E4E7] dark:border-[#3A2A4C] shadow-2xs pointer-events-none">
                    ⌘K
                  </kbd>
                )}
              </form>

              {/* Live Search Suggestions Dropdown */}
              {isSearchFocused && searchQuery.trim().length > 0 && (
                <div className="absolute top-11 left-0 right-0 bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl p-3 z-50 shadow-2xl shadow-pink-500/10 space-y-2 animate-in fade-in zoom-in-95 duration-150 min-w-[280px]">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#A1A1AA] px-1 flex items-center justify-between">
                    <span>Creators Matching &ldquo;{searchQuery}&rdquo;</span>
                    <span>{searchResults.length}</span>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map((c) => (
                        <Link
                          key={c.id}
                          href={`/c/${c.username}`}
                          onClick={() => setIsSearchFocused(false)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] transition-colors group"
                        >
                          <Avatar src={c.avatarUrl} alt={c.fullName} size="sm" isVerified={c.isVerified} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] truncate group-hover:text-[#EC4899]">
                                {c.fullName}
                              </p>
                              <span className="text-[10px] text-[#A1A1AA] font-semibold">
                                {(c.subscriberCount || 0).toLocaleString()} fans
                              </span>
                            </div>
                            <p className="text-[10px] text-[#71717A] dark:text-[#D4B8D0] truncate">@{c.username} • {c.category || 'Creator'}</p>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href={`/explore?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setIsSearchFocused(false)}
                        className="block text-center text-xs font-bold text-[#EC4899] hover:underline pt-1 border-t border-[#F3DCE8] dark:border-[#3A2A4C]"
                      >
                        View all results for &ldquo;{searchQuery}&rdquo; →
                      </Link>
                    </div>
                  ) : (
                    <div className="py-3 text-center text-xs text-[#71717A] dark:text-[#D4B8D0]">
                      No creators found. Press Enter to search.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dark Mode Quick Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-center text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] dark:hover:text-[#F472B6] hover:border-[#EC4899] transition-colors cursor-pointer shrink-0"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme mode"
            >
              {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            </button>

            {/* Authenticated State Controls */}
            {isAuthenticated ? (
              <>
                {/* Live Dynamic Wallet / Balance Quick Pill */}
                <Link
                  href="/balance"
                  className="hidden md:flex h-8 sm:h-9 px-2.5 sm:px-3 rounded-full bg-[#FFF1F7] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] hover:bg-[#FCE7F3] items-center gap-1.5 text-xs font-bold transition-all shadow-2xs shrink-0"
                  title="Your Current Balance"
                >
                  <Wallet size={13} className="text-[#EC4899] dark:text-[#F472B6]" />
                  <span>{walletBalance}</span>
                </Link>

                {/* Creator "Create +" Action Popover */}
                {role === 'creator' && (
                  <div className="relative" ref={createMenuRef}>
                    <button
                      onClick={() => setShowCreateMenu(!showCreateMenu)}
                      className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full bg-gradient-to-r from-[#EC4899] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-pink-500/20 hover:shadow-md transition-all cursor-pointer shrink-0"
                      aria-label="Create content"
                    >
                      <PlusSquare size={14} />
                      <span className="hidden xl:inline">Create</span>
                      <ChevronDown size={11} className={`transition-transform duration-200 ${showCreateMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showCreateMenu && (
                      <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl p-2 z-50 shadow-2xl shadow-pink-500/10 animate-in fade-in zoom-in-95 duration-150">
                        <Link
                          href="/feed"
                          onClick={() => setShowCreateMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#EC4899] transition-colors"
                        >
                          <ImageIcon size={15} className="text-[#EC4899]" />
                          <span>New Post Drop</span>
                        </Link>
                        <Link
                          href="/shorts"
                          onClick={() => setShowCreateMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#EC4899] transition-colors"
                        >
                          <Film size={15} className="text-indigo-500" />
                          <span>New Video Reel</span>
                        </Link>
                        <div className="my-1 border-t border-[#F3DCE8] dark:border-[#3A2A4C]" />
                        <Link
                          href="/creator/dashboard"
                          onClick={() => setShowCreateMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#BE185D] dark:text-[#F472B6] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] transition-colors"
                        >
                          <LayoutDashboard size={15} />
                          <span>Creator Studio</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Notifications Popover */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-center text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] hover:border-[#EC4899] transition-all relative cursor-pointer shrink-0"
                    title="Notifications"
                    aria-label="View notifications"
                  >
                    <Bell size={15} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EC4899] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EC4899] ring-2 ring-white dark:ring-[#0F0A14]"></span>
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-88 md:w-96 bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-3xl p-3 sm:p-4 space-y-3 z-50 shadow-2xl shadow-pink-500/10 animate-in fade-in zoom-in-95 duration-150">
                      {/* Header & Tabs */}
                      <div className="flex items-center justify-between border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-2.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-[#18181B] dark:text-[#FDF2F8]">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="text-[10px] text-[#BE185D] dark:text-[#F472B6] bg-[#FCE7F3] dark:bg-[#381A2B] px-2 py-0.5 rounded-full font-black">
                              {unreadCount} New
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-bold text-[#EC4899] hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Filter Tabs */}
                      <div className="flex items-center gap-1 p-1 bg-[#FFF9FC] dark:bg-[#241A30] rounded-xl text-xs font-bold">
                        <button
                          onClick={() => setNotificationTab('all')}
                          className={`flex-1 py-1 rounded-lg text-center transition-all text-[11px] ${
                            notificationTab === 'all'
                              ? 'bg-white dark:bg-[#1A1222] text-[#BE185D] dark:text-[#F472B6] shadow-xs'
                              : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B]'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setNotificationTab('unread')}
                          className={`flex-1 py-1 rounded-lg text-center transition-all text-[11px] ${
                            notificationTab === 'unread'
                              ? 'bg-white dark:bg-[#1A1222] text-[#BE185D] dark:text-[#F472B6] shadow-xs'
                              : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B]'
                          }`}
                        >
                          Unread ({unreadCount})
                        </button>
                        <button
                          onClick={() => setNotificationTab('earnings')}
                          className={`flex-1 py-1 rounded-lg text-center transition-all text-[11px] ${
                            notificationTab === 'earnings'
                              ? 'bg-white dark:bg-[#1A1222] text-[#BE185D] dark:text-[#F472B6] shadow-xs'
                              : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B]'
                          }`}
                        >
                          Earnings
                        </button>
                      </div>

                      {/* Notification Items */}
                      <div className="space-y-2 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
                        {filteredNotifications.length > 0 ? (
                          filteredNotifications.map((notif) => (
                            <Link
                              key={notif.id}
                              href={notif.link}
                              onClick={() => {
                                markNotificationAsRead(notif.id);
                                setShowNotifications(false);
                              }}
                              className={`p-2.5 rounded-2xl border flex items-start gap-2.5 transition-colors ${
                                notif.isUnread
                                  ? 'bg-[#FFF9FC] dark:bg-[#241A30] border-[#FBCFE8] dark:border-[#4C1D3B]'
                                  : 'bg-white dark:bg-[#1A1222] border-[#F3DCE8]/60 dark:border-[#3A2A4C]/60 hover:bg-[#FFF9FC] dark:hover:bg-[#241A30]'
                              }`}
                            >
                              <Avatar alt={notif.sender} size="sm" src={notif.avatar} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-[#18181B] dark:text-[#FDF2F8] leading-tight font-medium">
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
                          <div className="py-6 text-center text-xs text-[#71717A] dark:text-[#D4B8D0]">
                            No notifications in this tab
                          </div>
                        )}
                      </div>

                      {/* Footer Link */}
                      <div className="border-t border-[#F3DCE8] dark:border-[#3A2A4C] pt-2 text-center">
                        <Link
                          href="/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="text-xs font-bold text-[#EC4899] hover:underline"
                        >
                          View all notification history →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Navbar Menu Option (Fully Dynamic & Interactive) */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`h-8 sm:h-9 px-1 sm:px-1.5 rounded-full border flex items-center gap-1 transition-all cursor-pointer select-none shrink-0 ${
                      showUserMenu
                        ? 'bg-[#FFF1F7] dark:bg-[#381A2B] border-[#EC4899] shadow-2xs'
                        : 'bg-white dark:bg-[#1A1222] border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#EC4899]'
                    }`}
                    aria-label="User Account Menu"
                  >
                    <Avatar
                      alt={currentUser.fullName}
                      src={currentUser.avatarUrl}
                      size="sm"
                      isVerified={currentUser.isVerified}
                    />
                    <ChevronDown size={12} className={`text-[#71717A] dark:text-[#D4B8D0] transition-transform duration-200 ${showUserMenu ? 'rotate-180 text-[#EC4899]' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-3xl p-3 space-y-2.5 z-50 shadow-2xl shadow-pink-500/10 animate-in fade-in zoom-in-95 duration-150">
                      {/* User Header Profile Card */}
                      <div className="p-3 rounded-2xl bg-[#FFF9FC] dark:bg-[#241A30] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center gap-3">
                        <Avatar
                          alt={currentUser.fullName}
                          src={currentUser.avatarUrl}
                          size="md"
                          isVerified={currentUser.isVerified}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8] truncate">
                            {currentUser.fullName}
                          </p>
                          <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] truncate">
                            @{currentUser.username}
                          </p>
                          <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EC4899] text-white">
                            {role}
                          </span>
                        </div>
                      </div>

                      {/* Quick Navigation Links */}
                      <div className="space-y-0.5 text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                        <Link
                          href={`/c/${currentUser.username}`}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#EC4899] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <User size={15} className="text-[#EC4899]" />
                            <span>My Profile</span>
                          </div>
                          <ChevronRight size={13} className="text-[#A1A1AA]" />
                        </Link>

                        <Link
                          href="/balance"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#EC4899] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Wallet size={15} className="text-emerald-500" />
                            <span>Wallet & Payouts</span>
                          </div>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold">{walletBalance}</span>
                        </Link>

                        {role === 'creator' && (
                          <Link
                            href="/creator/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#EC4899] transition-colors text-[#BE185D] dark:text-[#F472B6]"
                          >
                            <div className="flex items-center gap-2.5">
                              <LayoutDashboard size={15} />
                              <span>Creator Studio</span>
                            </div>
                            <ChevronRight size={13} />
                          </Link>
                        )}

                        {role === 'admin' && (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#EC4899] transition-colors text-[#BE185D] dark:text-[#F472B6]"
                          >
                            <div className="flex items-center gap-2.5">
                              <Shield size={15} />
                              <span>Admin Console</span>
                            </div>
                            <ChevronRight size={13} />
                          </Link>
                        )}

                        <Link
                          href="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#EC4899] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Settings size={15} className="text-[#71717A]" />
                            <span>Account Settings</span>
                          </div>
                          <ChevronRight size={13} className="text-[#A1A1AA]" />
                        </Link>

                        <button
                          type="button"
                          onClick={toggleDarkMode}
                          className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] transition-colors text-xs font-bold cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
                            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                          </div>
                          <span className="text-[10px] text-[#A1A1AA] uppercase">{isDarkMode ? 'Dark' : 'Light'}</span>
                        </button>
                      </div>

                      {/* Logout Button */}
                      <div className="pt-1 border-t border-[#F3DCE8] dark:border-[#3A2A4C]">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors text-rose-600 dark:text-rose-400 cursor-pointer font-bold"
                        >
                          <LogOut size={15} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Guest Actions (Clean, Responsive & High-Converting) */
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/auth/login"
                  className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full flex items-center text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] transition-colors shrink-0"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="h-8 sm:h-9 px-3 sm:px-4 rounded-full flex items-center text-xs font-bold text-white bg-gradient-to-r from-[#EC4899] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] shadow-sm shadow-pink-500/25 hover:shadow-md transition-all shrink-0"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Universal Search Modal (Mobile & Laptop) */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1222] rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 border border-[#F3DCE8] dark:border-[#3A2A4C] max-w-lg w-full mx-auto mt-6 sm:mt-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search size={18} className="text-[#EC4899]" />
                <h3 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8]">Search {siteName}</h3>
              </div>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#71717A] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] cursor-pointer"
                aria-label="Close search modal"
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
                placeholder="Search creators, topics, hashtags..."
                className="w-full bg-[#FFF9FC] dark:bg-[#241A30] border border-[#F3DCE8] dark:border-[#3A2A4C] focus:border-[#EC4899] rounded-2xl pl-10 pr-10 py-3 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#A1A1AA] hover:text-[#18181B]"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Live Search Suggestions */}
            {searchQuery.trim().length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#A1A1AA]">Matching Creators</p>
                {searchResults.length > 0 ? (
                  searchResults.map((c) => (
                    <Link
                      key={c.id}
                      href={`/c/${c.username}`}
                      onClick={() => setIsSearchModalOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] transition-colors"
                    >
                      <Avatar src={c.avatarUrl} alt={c.fullName} size="sm" isVerified={c.isVerified} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] truncate">{c.fullName}</p>
                        <p className="text-[10px] text-[#71717A] dark:text-[#D4B8D0] truncate">@{c.username} • {c.category || 'Creator'}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-[#71717A] text-center py-4">No creators found. Press Enter to explore.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md lg:hidden flex transition-all duration-300">
          <div 
            className="w-[85%] max-w-sm bg-white dark:bg-[#0F0A14] h-full space-y-6 flex flex-col justify-between overflow-y-auto shadow-[20px_0_40px_rgba(0,0,0,0.1)] dark:shadow-[20px_0_40px_rgba(0,0,0,0.5)] border-r border-[#F3DCE8] dark:border-[#3A2A4C] animate-in slide-in-from-left duration-300"
            style={{ paddingTop: 'max(env(safe-area-inset-top), 1.25rem)', paddingBottom: 'max(env(safe-area-inset-bottom), 1.25rem)' }}
          >
            <div className="px-5 space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[14px] bg-gradient-to-tr from-[#EC4899] to-[#F43F5E] flex items-center justify-center text-white shadow-md shadow-pink-500/30">
                    <Sparkles size={18} />
                  </div>
                  <span className="font-black text-lg text-[#18181B] dark:text-[#FDF2F8] tracking-tight">{siteName}</span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-9 h-9 rounded-[14px] flex items-center justify-center text-[#71717A] bg-[#FFF9FC] dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95"
                >
                  <X size={18} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Mobile Drawer Navigation Links */}
              <nav className="space-y-1">
                {headerNavItems.map((item) => {
                  const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url));
                  return (
                    <Link
                      key={item.id}
                      href={item.url}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#FFF1F7] dark:bg-[#381A2B] text-[#EC4899] border border-[#FBCFE8] dark:border-[#4C1D3B]'
                          : 'text-[#71717A] dark:text-[#D4B8D0] hover:bg-[#FFF9FC] dark:hover:bg-[#241A30]'
                      }`}
                    >
                      <span>{item.title}</span>
                      <ChevronRight size={14} className="text-[#A1A1AA]" />
                    </Link>
                  );
                })}
              </nav>

              {/* Creator Studio Shortcut in Drawer */}
              {isAuthenticated && role === 'creator' && (
                <div className="pt-2 border-t border-[#F3DCE8] dark:border-[#3A2A4C]">
                  <Link
                    href="/creator/dashboard"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#EC4899]/10 to-[#F43F5E]/10 border border-[#FBCFE8] dark:border-[#4C1D3B] text-xs font-black text-[#BE185D] dark:text-[#F472B6]"
                  >
                    <LayoutDashboard size={16} />
                    <span>Open Creator Studio</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Drawer Bottom Controls */}
            <div className="px-5 space-y-3 pt-5 border-t border-[#F3DCE8] dark:border-[#3A2A4C] mt-auto">
              {/* Dark mode button inside drawer */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-[18px] bg-[#FFF9FC] dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-pink-200 dark:hover:border-pink-900 text-sm font-bold text-[#18181B] dark:text-[#FDF2F8] transition-colors active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#241A30] shadow-sm flex items-center justify-center border border-[#F3DCE8] dark:border-[#3A2A4C]">
                    {isDarkMode ? <Sun size={16} className="text-amber-400 stroke-[2.5]" /> : <Moon size={16} className="stroke-[2.5]" />}
                  </div>
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-amber-400/20' : 'bg-gray-200'} flex items-center`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? 'translate-x-4 bg-amber-400' : ''}`} />
                </div>
              </button>

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    logout();
                  }}
                  className="w-full py-3.5 rounded-[18px] bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-100 active:scale-[0.98] transition-all"
                >
                  <LogOut size={18} className="stroke-[2.5]" /> Sign Out
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link href="/auth/login" className="flex-1" onClick={() => setIsMobileDrawerOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full rounded-[18px] py-3.5">Log In</Button>
                  </Link>
                  <Link href="/auth/signup" className="flex-1" onClick={() => setIsMobileDrawerOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full rounded-[18px] py-3.5">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
