'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { MainLayout } from '../layouts/MainLayout';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { 
  Bell, Heart, DollarSign, MessageCircle, Star, Sparkles, 
  CheckCircle2, Trash2, Check, Filter, Radio, Gift, Flame,
  Compass, ArrowRight, X, ExternalLink, ShieldCheck, Crown,
  UserPlus, RefreshCw, Volume2, Inbox, MessageSquare
} from 'lucide-react';
import { prefersReducedMotion } from '../utils/animations';

export interface NotificationItem {
  id: string;
  sender: string;
  username?: string;
  avatar: string;
  action: string;
  category: 'drops' | 'live' | 'dms' | 'tips' | 'subs' | 'general';
  time: string;
  isRead: boolean;
  link: string;
  actionLabel?: string;
  previewImage?: string;
  amount?: number;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    sender: 'Sarah Jenkins',
    username: 'sarahdesign',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    action: 'published a new 4K Project Files VIP Drop: "Procedural Lighting & Shader Kit in Blender 4.2"',
    category: 'drops',
    time: '5m ago',
    isRead: false,
    link: '/feed',
    actionLabel: 'Unlock VIP Drop',
    previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
  },
  {
    id: 'n2',
    sender: 'Marcus Vance',
    username: 'marcuscode',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    action: 'is LIVE now! "Full-Stack SaaS Architecture & Next.js 15 Deep-Dive"',
    category: 'live',
    time: '20m ago',
    isRead: false,
    link: '/c/marcuscode',
    actionLabel: 'Join Livestream',
  },
  {
    id: 'n3',
    sender: 'Sarah Jenkins',
    username: 'sarahdesign',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    action: 'replied to your direct message: "Here is the download link & Figma tokens 🎨"',
    category: 'dms',
    time: '45m ago',
    isRead: false,
    link: '/messages',
    actionLabel: 'Reply in Chat',
  },
  {
    id: 'n4',
    sender: 'Platform Wallet',
    avatar: '',
    action: 'Your support tip of $10.00 was successfully delivered to Sarah Jenkins with dedication.',
    category: 'tips',
    time: '2h ago',
    isRead: true,
    link: '/balance',
    actionLabel: 'View Receipt',
    amount: 10.00,
  },
  {
    id: 'n5',
    sender: 'Marcus Vance',
    username: 'marcuscode',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    action: 'Your monthly VIP Membership Pass for "VIP Full-Stack Insider" renewed successfully ($19.99/mo).',
    category: 'subs',
    time: '1d ago',
    isRead: true,
    link: '/member/dashboard',
    actionLabel: 'Manage Pass',
    amount: 19.99,
  },
  {
    id: 'n6',
    sender: 'Elena Rostova',
    username: 'elenadesign',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    action: 'liked your comment on "Variable Typography & Fluid Design Systems Masterclass"',
    category: 'general',
    time: '1d ago',
    isRead: true,
    link: '/feed',
    actionLabel: 'View Comment',
  },
];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'drops' | 'live' | 'dms' | 'tips' | 'subs'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('creatorpulse_fan_notifications');
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch (e) {
          setNotifications(INITIAL_NOTIFICATIONS);
        }
      } else {
        setNotifications(INITIAL_NOTIFICATIONS);
        localStorage.setItem('creatorpulse_fan_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
      }
    }
  }, []);

  // Update storage helper
  const updateStoredNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem('creatorpulse_fan_notifications', JSON.stringify(items));
      window.dispatchEvent(new Event('creatorpulse_notifications_updated'));
    }
  };

  // GSAP animation on filter change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedFilter]);

  useEffect(() => {
    if (containerRef.current && !prefersReducedMotion() && !isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.notification-card-item',
          { opacity: 0, y: 14, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [selectedFilter, isLoading, notifications.length]);

  // Mark all as read
  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    updateStoredNotifications(updated);
  };

  // Mark single as read
  const handleMarkSingleRead = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    updateStoredNotifications(updated);
  };

  // Dismiss notification
  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    updateStoredNotifications(updated);
  };

  // Filtered array
  const filtered = notifications.filter((n) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !n.isRead;
    return n.category === selectedFilter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'drops':
        return <Star size={16} className="text-amber-500 fill-amber-500" />;
      case 'live':
        return <Radio size={16} className="text-rose-500 animate-pulse" />;
      case 'dms':
        return <MessageSquare size={16} className="text-[var(--color-primary)]" />;
      case 'tips':
        return <DollarSign size={16} className="text-emerald-500" />;
      case 'subs':
        return <Crown size={16} className="text-amber-400" />;
      default:
        return <Sparkles size={16} className="text-[var(--color-primary)]" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'drops':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[9px] font-black uppercase tracking-wider">
            ⭐ VIP Drop
          </span>
        );
      case 'live':
        return (
          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            Live Now
          </span>
        );
      case 'dms':
        return (
          <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-[#BE185D] dark:text-[#F472B6] text-[9px] font-black uppercase tracking-wider">
            Direct Chat
          </span>
        );
      case 'tips':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-black uppercase tracking-wider">
            Tip Receipt
          </span>
        );
      case 'subs':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[9px] font-black uppercase tracking-wider">
            VIP Membership
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase tracking-wider">
            Alert
          </span>
        );
    }
  };

  return (
    <MainLayout maxWidthClass="max-w-4xl">
      <div className="space-y-6 pb-12">
        
        {/* ========================================================================= */}
        {/* Header Hero Banner                                                        */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white shadow-xs">
                <Bell size={20} className={unreadCount > 0 ? 'animate-bounce-slow' : ''} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#18181B] dark:text-[#FDF2F8] tracking-tight">
                    Notifications & Activity
                  </h1>
                  {unreadCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-soft-primary)] dark:bg-[#381A2B] text-[var(--color-primary)] text-xs font-black border border-[#FBCFE8] dark:border-[#4C1D3B]">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5 font-medium">
                  Instant alerts for creator VIP drops, livestreams, direct replies, and support tips.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-3.5 py-2 rounded-2xl bg-[#FFF1F7] dark:bg-[#2D162B] border border-[#FBCFE8] dark:border-[#4C1D3B] text-xs font-black text-[var(--color-primary)] dark:text-[#F472B6] hover:bg-[#FCE7F3] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Check size={14} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills Navigation */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Alerts', count: notifications.length },
              { id: 'unread', label: '✉️ Unread', count: unreadCount },
              { id: 'drops', label: '⭐ VIP Drops', count: notifications.filter((n) => n.category === 'drops').length },
              { id: 'live', label: '🔥 Livestreams', count: notifications.filter((n) => n.category === 'live').length },
              { id: 'dms', label: '💬 Messages', count: notifications.filter((n) => n.category === 'dms').length },
              { id: 'tips', label: '💎 Tips & Gifts', count: notifications.filter((n) => n.category === 'tips').length },
              { id: 'subs', label: '👑 Subscriptions', count: notifications.filter((n) => n.category === 'subs').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedFilter === tab.id
                    ? 'bg-white dark:bg-[#381A2B] text-[var(--color-primary)] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] shadow-xs'
                    : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="text-[10px] opacity-75 font-black">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Notifications Feed Container                                              */}
        {/* ========================================================================= */}
        <div ref={containerRef} className="space-y-3">
          {isLoading ? (
            // Shimmer Loading Skeletons
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-5 rounded-3xl bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl skeleton-shimmer shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="w-1/3 h-3.5 skeleton-shimmer rounded-full" />
                    <div className="w-4/5 h-3 skeleton-shimmer rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`notification-card-item p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all group relative ${
                  item.isRead
                    ? 'bg-white/90 dark:bg-[#150D1E]/90 border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[var(--color-primary)]/40 shadow-2xs'
                    : 'bg-gradient-to-r from-pink-50/70 via-white to-white dark:from-[#25132B]/70 dark:via-[#150D1E] dark:to-[#150D1E] border-[#FBCFE8] dark:border-[#4C1D3B] shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Avatar / Icon */}
                  <div className="relative shrink-0">
                    {item.avatar ? (
                      <Avatar alt={item.sender} src={item.avatar} size="md" isVerified />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white shadow-xs">
                        {getCategoryIcon(item.category)}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-center shadow-2xs">
                      {getCategoryIcon(item.category)}
                    </span>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getCategoryBadge(item.category)}
                      <span className="text-[10px] text-[#A1A1AA] font-semibold">{item.time}</span>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                      )}
                    </div>

                    <p className="text-xs text-[#18181B] dark:text-[#FDF2F8] leading-relaxed font-medium">
                      <strong className="font-black text-[#18181B] dark:text-[#FDF2F8]">{item.sender}</strong>{' '}
                      {item.action}
                    </p>

                    {/* Preview Thumbnail if present */}
                    {item.previewImage && (
                      <div className="pt-1">
                        <img
                          src={item.previewImage}
                          alt="Drop Preview"
                          className="w-32 h-18 rounded-xl object-cover border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xs"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions & Direct Link */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {item.actionLabel && (
                    <Link
                      href={item.link}
                      className="px-3.5 py-1.5 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] text-xs font-black transition-all shadow-2xs flex items-center gap-1"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight size={12} />
                    </Link>
                  )}

                  {!item.isRead && (
                    <button
                      onClick={(e) => handleMarkSingleRead(item.id, e)}
                      title="Mark as read"
                      className="p-2 rounded-xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] text-[#71717A] dark:text-[#D4B8D0] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                    >
                      <Check size={14} />
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDismiss(item.id, e)}
                    title="Dismiss alert"
                    className="p-2 rounded-xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] text-[#71717A] dark:text-[#D4B8D0] hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="text-center py-16 px-6 bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-3xl space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-3xl bg-[var(--color-soft-primary)] dark:bg-[#2D162B] border border-[#FBCFE8] dark:border-[#4C1D3B] flex items-center justify-center mx-auto text-[var(--color-primary)] shadow-xs">
                <Inbox size={26} />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-base text-[#18181B] dark:text-[#FDF2F8]">
                  All Caught Up!
                </h3>
                <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] max-w-sm mx-auto leading-relaxed font-medium">
                  You don&apos;t have any notifications in this section. Discover more creators to receive exclusive alerts and drops.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                  className="text-xs font-bold"
                >
                  <RefreshCw size={12} className="mr-1.5" />
                  <span>View All Alerts</span>
                </Button>
                <Link href="/explore">
                  <Button variant="primary" size="sm" className="text-xs font-black">
                    <Compass size={13} className="mr-1.5" />
                    <span>Explore Creators</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default NotificationsPage;
