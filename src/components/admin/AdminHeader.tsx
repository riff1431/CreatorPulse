'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield, Search, Bell, ArrowLeft, ChevronDown, User, DollarSign, FileText,
  Palette, Puzzle, CheckCircle2, Clock, AlertTriangle, Sparkles, X, Plus,
  Layers, Settings, Users, LogOut, Check, ExternalLink, Radio, Command,
  Filter, Trash2, Zap, ShieldAlert, CreditCard, Sun, Moon, Monitor
} from 'lucide-react';
import { Avatar } from '@/components/admin/ui/Avatar';
import { useAuth } from '@/lib/auth/auth-context';
import { MOCK_USERS } from '@/lib/supabase/store';
import { AdminIcon } from '@/components/admin/ui/AdminIcon';
import { IconButton } from '@/components/admin/ui/IconButton';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { useAdminTheme } from '@/components/admin/AdminThemeProvider';

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
  { type: 'route', category: 'Navigation', title: 'Storage & Drives', subtitle: 'Manage local and cloud storage drivers and buckets', url: '/admin/storage' },
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
  const { settings } = useSiteSettings();

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

  // Theme state
  const { adminTheme, setAdminTheme } = useAdminTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 shadow-2xs">
      {/* Left: Brand & Dashboard Link */}
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt={settings.site_name || 'CreatorPulse'} className="h-8.5 w-auto max-w-[90px] sm:max-w-[140px] object-contain rounded-lg shrink-0" />
          ) : (
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-600/20 group-hover:scale-105 transition-transform shrink-0">
              <AdminIcon icon={Shield} size="sm" className="text-white" />
            </div>
          )}
          <div className="hidden sm:block">
            <h1 className="text-xs font-black text-slate-800 leading-none tracking-tight">
              {settings.site_name || 'CreatorPulse'}
            </h1>
            <span className="text-[9px] text-indigo-600 font-extrabold uppercase tracking-wider block mt-0.5">Admin Console</span>
          </div>
        </Link>

        {/* Public Website Shortcut */}
        <Link
          href="/feed"
          target="_blank"
          className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors px-2.5 py-1.5 rounded-xl ml-2 border border-transparent hover:border-slate-200 group"
        >
          <AdminIcon icon={ArrowLeft} size="xs" variant="slate" className="group-hover:text-indigo-600 transition-colors" />
          <span>View Frontend</span>
        </Link>
      </div>

      {/* Center: Command Palette Global Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block relative" ref={searchRef}>
        <div className="relative">
          <AdminIcon icon={Search} size="xs" variant="neutral" className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search routes, creators, payouts, themes... (⌘K)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8.5 pr-14 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            <AdminIcon icon={Command} size="xs" variant="neutral" className="opacity-70" />
            <span>K</span>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-2 z-50 animate-in fade-in slide-in-from-top-2 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-100">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                {searchQuery ? `Results for "${searchQuery}"` : 'Quick Navigation Suggestions'}
              </span>
              <span className="text-[10px] text-slate-500">{filteredResults.length} matches</span>
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
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-indigo-50/40 border border-transparent hover:border-indigo-100/30 cursor-pointer transition-all">
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                        <AdminIcon icon={Icon} size="xs" variant="indigo" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-500 truncate font-medium">{item.subtitle}</p>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {item.category}
                      </span>
                    </div>
                  </Link>
                );
              })}

              {filteredResults.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-500 space-y-1">
                  <p className="font-bold">No admin records found</p>
                  <p className="text-[11px] text-slate-400">Try searching for &quot;Themes&quot;, &quot;Payouts&quot;, or &quot;Users&quot;</p>
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
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/50 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5 active:scale-[0.98]"
            title="Admin Quick Actions"
          >
            <AdminIcon icon={Plus} size="xs" variant="indigo" strokeWidth={2.5} />
            <span className="hidden sm:inline">Quick Actions</span>
            <AdminIcon icon={ChevronDown} size="xs" variant="indigo" className={`hidden sm:inline transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-100 mb-1">
                Frequent Tasks
              </div>
              <Link
                href="/admin/payouts"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/40 rounded-xl transition-all"
              >
                <AdminIcon icon={DollarSign} size="xs" variant="indigo" />
                <span>Review Payouts</span>
              </Link>
              <Link
                href="/admin/applications"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/40 rounded-xl transition-all"
              >
                <AdminIcon icon={Users} size="xs" variant="indigo" />
                <span>Review Applications</span>
              </Link>
              <Link
                href="/admin/themes"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/40 rounded-xl transition-all"
              >
                <AdminIcon icon={Palette} size="xs" variant="indigo" />
                <span>Customize Themes</span>
              </Link>
              <Link
                href="/admin/plugins"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/40 rounded-xl transition-all"
              >
                <AdminIcon icon={Puzzle} size="xs" variant="indigo" />
                <span>Manage Plugins</span>
              </Link>
              <Link
                href="/admin/categories"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/40 rounded-xl transition-all"
              >
                <AdminIcon icon={Layers} size="xs" variant="indigo" />
                <span>Add Category</span>
              </Link>
            </div>
          )}
        </div>

        {/* Real-time Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <div className="relative inline-block">
            <IconButton
              icon={Bell}
              size="sm"
              variant="neutral"
              label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              active={showNotifications}
              tooltip="Admin Notifications"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white select-none pointer-events-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2">
              {/* Notifications Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-800">Admin Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAllNotifications}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                      title="Clear all"
                    >
                      <AdminIcon icon={Trash2} size="xs" variant="slate" />
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
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                        : 'text-slate-500 hover:bg-slate-50'
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
                          ? 'bg-white border-slate-100 hover:bg-slate-50'
                          : 'bg-indigo-50/20 border-indigo-100 hover:border-indigo-300 shadow-3xs'
                      }`}
                    >
                      <AdminIcon
                        icon={Icon}
                        size="sm"
                        variant={notif.isRead ? 'slate' : 'primary'}
                        container
                        rounded="md"
                        className="shrink-0 mt-0.5 shadow-4xs"
                      />

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs truncate ${notif.isRead ? 'font-bold text-slate-800' : 'font-extrabold text-indigo-700'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">{notif.timeAgo}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 font-medium">
                          {notif.message}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteNotification(notif.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer"
                        title="Dismiss"
                      >
                        <AdminIcon icon={X} size="xs" variant="slate" />
                      </button>
                    </div>
                  );
                })}

                {filteredNotifications.length === 0 && (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-4xs">
                      <AdminIcon icon={CheckCircle2} size="md" variant="indigo" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">All caught up!</p>
                    <p className="text-[10px] text-slate-500">No notifications match the active filter tab.</p>
                  </div>
                )}
              </div>

              {/* View All Links Footer */}
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] font-bold">
                <Link
                  href="/admin/audit-logs"
                  onClick={() => setShowNotifications(false)}
                  className="text-indigo-600 hover:underline"
                >
                  System Audit Logs →
                </Link>
                <Link
                  href="/admin/reports"
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Flagged Content →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <div className="relative font-sans animate-in fade-in" ref={themeMenuRef}>
          <IconButton
            icon={
              !mounted
                ? Sun
                : adminTheme === 'dark'
                ? Moon
                : adminTheme === 'system'
                ? Monitor
                : Sun
            }
            size="sm"
            variant="neutral"
            label="Theme Selection"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            active={showThemeMenu}
            tooltip="Theme Preference"
          />

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              {(['light', 'dark', 'system'] as const).map((t) => {
                let Icon = Sun;
                if (t === 'dark') Icon = Moon;
                if (t === 'system') Icon = Monitor;

                const isSelected = mounted && adminTheme === t;

                return (
                  <button
                    key={t}
                    onClick={() => {
                      setAdminTheme(t);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <AdminIcon icon={Icon} size="xs" variant={isSelected ? 'primary' : 'neutral'} />
                    <span className="capitalize">{t}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 ml-auto text-indigo-600" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-200"
          >
            <Avatar
              src={adminUser.avatarUrl}
              alt={adminUser.fullName}
              size="sm"
            />
            <div className="hidden sm:block text-left ml-1">
              <p className="text-xs font-bold text-slate-800 leading-none">{adminUser.fullName}</p>
              <p className="text-[9px] text-indigo-600 font-extrabold uppercase mt-1">Super Admin</p>
            </div>
            <AdminIcon icon={ChevronDown} size="xs" variant="slate" className={`ml-1 hidden sm:block transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-3xl shadow-2xl p-3 space-y-2 z-50 animate-in fade-in slide-in-from-top-2">
              {/* Profile Card Header */}
              <div className="px-3 py-2 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-800">{adminUser.fullName}</p>
                <p className="text-[10px] text-slate-500 truncate font-medium">{adminUser.email}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-bold text-emerald-700">Authenticated (Full Access)</span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-0.5 text-xs font-semibold">
                <Link href="/admin/settings" onClick={() => setShowProfileMenu(false)}>
                  <div className="px-3 py-2 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/40 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 group">
                    <AdminIcon icon={Settings} size="xs" variant="neutral" className="group-hover:text-indigo-600" />
                    <span>Platform Settings</span>
                  </div>
                </Link>

                <Link href="/admin/roles" onClick={() => setShowProfileMenu(false)}>
                  <div className="px-3 py-2 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/40 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 group">
                    <AdminIcon icon={Shield} size="xs" variant="neutral" className="group-hover:text-indigo-600" />
                    <span>Roles & Permissions</span>
                  </div>
                </Link>

                <Link href="/admin/themes" onClick={() => setShowProfileMenu(false)}>
                  <div className="px-3 py-2 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/40 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 group">
                    <AdminIcon icon={Palette} size="xs" variant="neutral" className="group-hover:text-indigo-600" />
                    <span>Frontend Themes</span>
                  </div>
                </Link>

                <Link href="/admin/plugins" onClick={() => setShowProfileMenu(false)}>
                  <div className="px-3 py-2 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/40 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 group">
                    <AdminIcon icon={Puzzle} size="xs" variant="neutral" className="group-hover:text-indigo-600" />
                    <span>Plugins & Add-ons</span>
                  </div>
                </Link>

                <Link href="/admin/audit-logs" onClick={() => setShowProfileMenu(false)}>
                  <div className="px-3 py-2 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/40 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 group">
                    <AdminIcon icon={Clock} size="xs" variant="neutral" className="group-hover:text-indigo-600" />
                    <span>System Audit Logs</span>
                  </div>
                </Link>
              </div>

              {/* Portal Links & Logout */}
              <div className="border-t border-slate-100 pt-2 space-y-1">
                <Link href="/feed" target="_blank">
                  <div className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-between cursor-pointer">
                    <span>Public Home Feed</span>
                    <AdminIcon icon={ExternalLink} size="xs" variant="neutral" className="opacity-60" />
                  </div>
                </Link>

                <Link href="/creator/dashboard">
                  <div className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-between cursor-pointer">
                    <span>Creator Studio</span>
                    <AdminIcon icon={ExternalLink} size="xs" variant="neutral" className="opacity-60" />
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all cursor-pointer flex items-center gap-2 text-left mt-1"
                >
                  <AdminIcon icon={LogOut} size="xs" variant="rose" />
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
