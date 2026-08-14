'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield, Search, Bell, ArrowLeft, ChevronDown, User, DollarSign, FileText,
  Palette, Puzzle, CheckCircle2, Clock, AlertTriangle, Sparkles, X, Plus,
  Layers, Settings, Users, LogOut, Check, ExternalLink, Radio, Command,
  Filter, Trash2, Zap, ShieldAlert, CreditCard
} from 'lucide-react';
import { Avatar } from '@/components/admin/ui/Avatar';
import { useAuth } from '@/lib/auth/auth-context';
import { MOCK_USERS } from '@/lib/supabase/store';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'payout' | 'application' | 'report' | 'theme' | 'plugin' | 'security' | 'user';
  targetUrl: string;
  createdAt: string;
  timeAgo: string;
  isRead: boolean;
  severity?: 'info' | 'warning' | 'success' | 'danger';
}

const INITIAL_ADMIN_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-1',
    title: 'New Payout Request',
    message: 'Sarah Jenkins requested a withdrawal of $1,500.00 to Stripe Connect account.',
    type: 'payout',
    targetUrl: '/admin/payouts',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    timeAgo: '5 min ago',
    isRead: false,
    severity: 'warning'
  },
  {
    id: 'notif-2',
    title: 'Creator Tier Application',
    message: 'David Miller submitted an application for Fitness & Wellness creator verification.',
    type: 'application',
    targetUrl: '/admin/applications',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    timeAgo: '25 min ago',
    isRead: false,
    severity: 'info'
  },
  {
    id: 'notif-3',
    title: 'Content Flag Report',
    message: 'Post #412 was flagged for copyright verification. Needs moderation review.',
    type: 'report',
    targetUrl: '/admin/reports',
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    timeAgo: '50 min ago',
    isRead: false,
    severity: 'danger'
  },
  {
    id: 'notif-4',
    title: 'Theme Activated',
    message: 'Frontend Theme "Blush Core" was active and synced across all public client views.',
    type: 'theme',
    targetUrl: '/admin/themes',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    timeAgo: '2 hours ago',
    isRead: true,
    severity: 'success'
  },
  {
    id: 'notif-5',
    title: 'DRM Guard Automated Stamp',
    message: 'Digital DRM Watermark plugin processed and protected 24 new media uploads.',
    type: 'plugin',
    targetUrl: '/admin/plugins',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    timeAgo: '6 hours ago',
    isRead: true,
    severity: 'info'
  },
  {
    id: 'notif-6',
    title: 'Admin Session Authenticated',
    message: 'Super Admin login recorded from authorized IP address.',
    type: 'security',
    targetUrl: '/admin/audit-logs',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    timeAgo: '12 hours ago',
    isRead: true,
    severity: 'info'
  }
];

const SEARCH_DATABASE = [
  // Core Routes
  { type: 'route', category: 'Navigation', title: 'Dashboard Overview', subtitle: 'Platform KPI metrics, earnings & growth stats', url: '/admin/dashboard' },
  { type: 'route', category: 'Navigation', title: 'Frontend Themes', subtitle: 'Manage active public themes & design tokens', url: '/admin/themes' },
  { type: 'route', category: 'Navigation', title: 'Plugins & Add-ons', subtitle: 'Configure DRM, Virtual Gifts & AI Add-ons', url: '/admin/plugins' },
  { type: 'route', category: 'Navigation', title: 'Audit Logs', subtitle: 'Inspect system events, installs & security records', url: '/admin/audit-logs' },
  { type: 'route', category: 'Navigation', title: 'Creator Applications', subtitle: 'Review pending creator onboarding requests', url: '/admin/applications' },
  { type: 'route', category: 'Navigation', title: 'User Management', subtitle: 'Search, ban and manage fans & members', url: '/admin/users' },
  { type: 'route', category: 'Navigation', title: 'Creator Studio Management', subtitle: 'Manage creator profiles and tiers', url: '/admin/creators' },
  { type: 'route', category: 'Navigation', title: 'Financial Payouts', subtitle: 'Process bank transfers & withdrawal requests', url: '/admin/payouts' },
  { type: 'route', category: 'Navigation', title: 'Platform Earnings & Ledger', subtitle: 'Platform commission and gross volume', url: '/admin/earnings' },
  { type: 'route', category: 'Navigation', title: 'Subscriptions & Memberships', subtitle: 'Recurring VIP subscriber tiers & plans', url: '/admin/subscriptions' },
  { type: 'route', category: 'Navigation', title: 'Posts & Feed Moderation', subtitle: 'Manage published posts and content', url: '/admin/posts' },
  { type: 'route', category: 'Navigation', title: 'Vertical Shorts & Reels', subtitle: 'Moderate vertical reels and video feed', url: '/admin/reels' },
  { type: 'route', category: 'Navigation', title: 'Content Categories', subtitle: 'Manage taxonomy and discovery tags', url: '/admin/categories' },
  { type: 'route', category: 'Navigation', title: 'Roles & Permissions', subtitle: 'Configure RBAC access and security privileges', url: '/admin/roles' },
  { type: 'route', category: 'Navigation', title: 'Platform Settings', subtitle: 'System branding, payments and general config', url: '/admin/settings' },
  
  // Real Entities
  { type: 'user', category: 'Creators', title: 'Sarah Jenkins', subtitle: 'UI/UX Creator • @sarahdesign • $14.2k GMV', url: '/admin/creators' },
  { type: 'user', category: 'Creators', title: 'Marcus Vance', subtitle: '3D Motion Creator • @marcusvance', url: '/admin/creators' },
  { type: 'payout', category: 'Transactions', title: 'Sarah Jenkins Payout ($1,500.00)', subtitle: 'Pending review on Stripe Connect', url: '/admin/payouts' },
  { type: 'theme', category: 'Design', title: 'Blush Core Default Theme', subtitle: 'Official light pink creator theme v1.0.0', url: '/admin/themes' },
  { type: 'plugin', category: 'Extensions', title: 'Virtual Gifts & Animated Reactions', subtitle: 'Fan tipping & monetization add-on', url: '/admin/plugins' },
];

export const AdminHeader: React.FC = () => {
  const router = useRouter();
  const { user, role, logout } = useAuth();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  // Profile dropdown state
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Quick actions dropdown state
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'actions' | 'system'>('all');
  const [notifications, setNotifications] = useState<AdminNotification[]>(INITIAL_ADMIN_NOTIFICATIONS);

  // Refs for click outside
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Load notifications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('creatorpulse_admin_notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load admin notifications', e);
    }
  }, []);

  // Save notifications to localStorage
  const saveNotifications = (updated: AdminNotification[]) => {
    setNotifications(updated);
    try {
      localStorage.setItem('creatorpulse_admin_notifications', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save admin notifications', e);
    }
  };

  // Keyboard shortcut (Cmd + K or Ctrl + K) for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchDropdown((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listeners
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target as Node)) {
        setShowQuickActions(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Active User display resolution
  const adminUser = user || MOCK_USERS['user-admin'] || {
    id: 'user-admin',
    fullName: 'Elena Rostova',
    username: 'admin',
    email: 'admin@creatorpulse.com',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    role: 'admin'
  };

  // Unread notifications count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Filtered notifications
  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'unread') return !n.isRead;
    if (notifFilter === 'actions') return n.type === 'payout' || n.type === 'application' || n.type === 'report';
    if (notifFilter === 'system') return n.type === 'theme' || n.type === 'plugin' || n.type === 'security';
    return true;
  });

  // Notification handlers
  const handleMarkAsRead = (id: string, targetUrl?: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    saveNotifications(updated);
    if (targetUrl) {
      setShowNotifications(false);
      router.push(targetUrl);
    }
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    saveNotifications(updated);
  };

  const handleClearAllNotifications = () => {
    saveNotifications([]);
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  // Filter search results
  const filteredResults = SEARCH_DATABASE.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="h-16 bg-white border-b border-[#F3DCE8] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 shadow-2xs">
      {/* Left: Brand & Dashboard Link */}
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-[#EC4899] to-[#F43F5E] flex items-center justify-center shadow-sm shadow-[#EC4899]/20 group-hover:scale-105 transition-transform">
            <Shield className="text-white" size={15} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xs font-black text-[#18181B] leading-none tracking-tight">CreatorPulse</h1>
            <span className="text-[9px] text-[#BE185D] font-extrabold uppercase tracking-wider block mt-0.5">Admin Console</span>
          </div>
        </Link>

        {/* Public Website Shortcut */}
        <Link
          href="/feed"
          target="_blank"
          className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-[#71717A] hover:text-[#EC4899] transition-colors px-2.5 py-1.5 rounded-xl hover:bg-[#FFF1F7] ml-2 border border-transparent hover:border-[#F3DCE8]"
        >
          <ArrowLeft size={13} />
          <span>View Frontend</span>
        </Link>
      </div>

      {/* Center: Command Palette Global Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={13} />
          <input
            type="text"
            placeholder="Search routes, creators, payouts, themes... (⌘K)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl pl-8.5 pr-14 py-1.5 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] focus:bg-white transition-all font-medium"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-[#A1A1AA] bg-white px-1.5 py-0.5 rounded border border-[#F3DCE8]">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-[#F3DCE8] rounded-2xl shadow-xl p-3 space-y-2 z-50 animate-in fade-in slide-in-from-top-2 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-1 pb-1 border-b border-[#F3DCE8]">
              <span className="text-[10px] font-extrabold uppercase text-[#A1A1AA] tracking-wider">
                {searchQuery ? `Results for "${searchQuery}"` : 'Quick Navigation Suggestions'}
              </span>
              <span className="text-[10px] text-[#71717A]">{filteredResults.length} matches</span>
            </div>

            <div className="space-y-1">
              {filteredResults.map((item, idx) => {
                let Icon = FileText;
                if (item.type === 'theme') Icon = Palette;
                else if (item.type === 'plugin') Icon = Puzzle;
                else if (item.type === 'user') Icon = User;
                else if (item.type === 'payout') Icon = DollarSign;

                return (
                  <Link
                    key={idx}
                    href={item.url}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                  >
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FFF1F7] border border-transparent hover:border-[#F3DCE8] cursor-pointer transition-all">
                      <div className="p-1.5 rounded-lg bg-[#FCE7F3] text-[#EC4899] shrink-0">
                        <Icon size={13} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#18181B] truncate">{item.title}</p>
                        <p className="text-[10px] text-[#71717A] truncate font-medium">{item.subtitle}</p>
                      </div>
                      <span className="text-[9px] font-bold text-[#A1A1AA] bg-[#FFF9FC] px-2 py-0.5 rounded border border-[#F3DCE8]">
                        {item.category}
                      </span>
                    </div>
                  </Link>
                );
              })}

              {filteredResults.length === 0 && (
                <div className="py-6 text-center text-xs text-[#71717A] space-y-1">
                  <p className="font-bold">No admin records found</p>
                  <p className="text-[11px] text-[#A1A1AA]">Try searching for &quot;Themes&quot;, &quot;Payouts&quot;, or &quot;Users&quot;</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions, Notifications & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Actions Dropdown */}
        <div className="relative" ref={quickActionsRef}>
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF1F7] text-[#BE185D] hover:bg-[#FCE7F3] border border-[#FBCFE8] text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Admin Quick Actions"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span className="hidden sm:inline">Quick Actions</span>
            <ChevronDown size={11} className={`transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#F3DCE8] rounded-2xl shadow-xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#A1A1AA] tracking-wider border-b border-[#F3DCE8] mb-1">
                Frequent Tasks
              </div>
              <Link
                href="/admin/payouts"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold text-[#18181B] hover:text-[#BE185D] hover:bg-[#FFF1F7] rounded-xl transition-all"
              >
                <DollarSign size={14} className="text-[#EC4899]" />
                <span>Review Payouts</span>
              </Link>
              <Link
                href="/admin/applications"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold text-[#18181B] hover:text-[#BE185D] hover:bg-[#FFF1F7] rounded-xl transition-all"
              >
                <Users size={14} className="text-[#EC4899]" />
                <span>Review Applications</span>
              </Link>
              <Link
                href="/admin/themes"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold text-[#18181B] hover:text-[#BE185D] hover:bg-[#FFF1F7] rounded-xl transition-all"
              >
                <Palette size={14} className="text-[#EC4899]" />
                <span>Customize Themes</span>
              </Link>
              <Link
                href="/admin/plugins"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold text-[#18181B] hover:text-[#BE185D] hover:bg-[#FFF1F7] rounded-xl transition-all"
              >
                <Puzzle size={14} className="text-[#EC4899]" />
                <span>Manage Plugins</span>
              </Link>
              <Link
                href="/admin/categories"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold text-[#18181B] hover:text-[#BE185D] hover:bg-[#FFF1F7] rounded-xl transition-all"
              >
                <Layers size={14} className="text-[#EC4899]" />
                <span>Add Category</span>
              </Link>
            </div>
          )}
        </div>

        {/* Real-time Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#71717A] hover:text-[#EC4899] hover:bg-[#FFF1F7] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#F3DCE8]"
            title="Admin Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#EC4899] text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#F3DCE8] rounded-3xl shadow-2xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2">
              {/* Notifications Header */}
              <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#18181B]">Admin Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-[#FCE7F3] text-[#BE185D] px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-[#EC4899] hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAllNotifications}
                      className="p-1 rounded text-[#A1A1AA] hover:text-[#F43F5E] cursor-pointer"
                      title="Clear all"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 text-[11px] font-bold overflow-x-auto scrollbar-none pb-1">
                {(['all', 'unread', 'actions', 'system'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setNotifFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 capitalize ${
                      notifFilter === tab
                        ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                        : 'text-[#71717A] hover:bg-[#FFF9FC]'
                    }`}
                  >
                    {tab === 'all' ? 'All' : tab}
                  </button>
                ))}
              </div>

              {/* Notifications List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredNotifications.map((notif) => {
                  let Icon = Bell;
                  if (notif.type === 'payout') Icon = DollarSign;
                  else if (notif.type === 'application') Icon = Users;
                  else if (notif.type === 'report') Icon = ShieldAlert;
                  else if (notif.type === 'theme') Icon = Palette;
                  else if (notif.type === 'plugin') Icon = Puzzle;

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id, notif.targetUrl)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative group ${
                        notif.isRead
                          ? 'bg-white border-[#F3DCE8]/60 hover:bg-[#FFF9FC]'
                          : 'bg-[#FFF1F7] border-[#FBCFE8] hover:border-[#EC4899]/50 shadow-2xs'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-white text-[#EC4899] border border-[#F3DCE8] shrink-0 mt-0.5">
                        <Icon size={14} />
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs truncate ${notif.isRead ? 'font-bold text-[#18181B]' : 'font-extrabold text-[#BE185D]'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-[#A1A1AA] shrink-0 font-medium">{notif.timeAgo}</span>
                        </div>
                        <p className="text-[11px] text-[#71717A] leading-relaxed line-clamp-2 font-medium">
                          {notif.message}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteNotification(notif.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#A1A1AA] hover:text-[#F43F5E] transition-opacity cursor-pointer"
                        title="Dismiss"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}

                {filteredNotifications.length === 0 && (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFF1F7] text-[#EC4899] flex items-center justify-center mx-auto">
                      <CheckCircle2 size={20} />
                    </div>
                    <p className="text-xs font-bold text-[#18181B]">All caught up!</p>
                    <p className="text-[10px] text-[#71717A]">No notifications match the active filter tab.</p>
                  </div>
                )}
              </div>

              {/* View All Links Footer */}
              <div className="border-t border-[#F3DCE8] pt-2 flex items-center justify-between text-[11px] font-bold">
                <Link
                  href="/admin/audit-logs"
                  onClick={() => setShowNotifications(false)}
                  className="text-[#EC4899] hover:underline"
                >
                  System Audit Logs →
                </Link>
                <Link
                  href="/admin/reports"
                  onClick={() => setShowNotifications(false)}
                  className="text-[#71717A] hover:text-[#18181B]"
                >
                  Flagged Content →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-2xl hover:bg-[#FFF1F7] transition-all cursor-pointer border border-transparent hover:border-[#F3DCE8]"
          >
            <Avatar
              src={adminUser.avatarUrl}
              alt={adminUser.fullName}
              size="sm"
            />
            <div className="hidden sm:block text-left ml-1">
              <p className="text-xs font-bold text-[#18181B] leading-none">{adminUser.fullName}</p>
              <p className="text-[9px] text-[#BE185D] font-extrabold uppercase mt-1">Super Admin</p>
            </div>
            <ChevronDown size={11} className={`text-[#A1A1AA] ml-1 hidden sm:block transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-[#F3DCE8] rounded-3xl shadow-2xl p-3 space-y-2 z-50 animate-in fade-in slide-in-from-top-2">
              {/* Profile Card Header */}
              <div className="px-3 py-2 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] space-y-1">
                <p className="text-xs font-bold text-[#18181B]">{adminUser.fullName}</p>
                <p className="text-[10px] text-[#71717A] truncate font-medium">{adminUser.email}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-bold text-emerald-700">Authenticated (Full Access)</span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-0.5 text-xs font-semibold">
                <Link href="/admin/settings" onClick={() => setShowProfileMenu(false)}>
                  <div className="px-3 py-2 text-[#71717A] hover:text-[#BE185D] hover:bg-[#FFF1F7] rounded-xl transition-all cursor-pointer flex items-center gap-2.5">
                    <Settings size={14} className="text-[#EC4899]" />
                    <span>Platform Settings</span>
                  </div>
                </Link>

                <Link href="/admin/roles" onClick={() => setShowProfileMenu(false)}>
                  <div className="px-3 py-2 text-[#71717A] hover:text-[#BE185D] hover:bg-[#FFF1F7] rounded-xl transition-all cursor-pointer flex items-center gap-2.5">
                    <Shield size={14} className="text-[#EC4899]" />
                    <span>Roles & Permissions</span>
                  </div>
                </Link>

                <Link href="/admin/themes" onClick={() => setShowProfileMenu(false)}>
                  <div className="px-3 py-2 text-[#71717A] hover:text-[#BE185D] hover:bg-[#FFF1F7] rounded-xl transition-all cursor-pointer flex items-center gap-2.5">
                    <Palette size={14} className="text-[#EC4899]" />
                    <span>Frontend Themes</span>
                  </div>
                </Link>

                <Link href="/admin/plugins" onClick={() => setShowProfileMenu(false)}>
                  <div className="px-3 py-2 text-[#71717A] hover:text-[#BE185D] hover:bg-[#FFF1F7] rounded-xl transition-all cursor-pointer flex items-center gap-2.5">
                    <Puzzle size={14} className="text-[#EC4899]" />
                    <span>Plugins & Add-ons</span>
                  </div>
                </Link>

                <Link href="/admin/audit-logs" onClick={() => setShowProfileMenu(false)}>
                  <div className="px-3 py-2 text-[#71717A] hover:text-[#BE185D] hover:bg-[#FFF1F7] rounded-xl transition-all cursor-pointer flex items-center gap-2.5">
                    <Clock size={14} className="text-[#EC4899]" />
                    <span>System Audit Logs</span>
                  </div>
                </Link>
              </div>

              {/* Portal Links & Logout */}
              <div className="border-t border-[#F3DCE8] pt-2 space-y-1">
                <Link href="/feed" target="_blank">
                  <div className="px-3 py-1.5 text-xs font-bold text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF9FC] rounded-xl transition-all flex items-center justify-between cursor-pointer">
                    <span>Public Home Feed</span>
                    <ExternalLink size={12} />
                  </div>
                </Link>

                <Link href="/creator/dashboard">
                  <div className="px-3 py-1.5 text-xs font-bold text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF9FC] rounded-xl transition-all flex items-center justify-between cursor-pointer">
                    <span>Creator Studio</span>
                    <ExternalLink size={12} />
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-xs font-bold text-[#F43F5E] hover:bg-[#FFE4E6] rounded-xl transition-all cursor-pointer flex items-center gap-2 text-left mt-1"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
