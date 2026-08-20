'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Bell, Check, CheckCircle2, Trash2, X, Sparkles, 
  Radio, Gift, ExternalLink, Flame, DollarSign, 
  Heart, MessageSquare, ArrowRight, ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { Avatar } from './Avatar';

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

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
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

export const NOTIFICATIONS_STORAGE_KEY = 'creatorpulse_fan_notifications';

export const getStoredNotificationsUnreadCount = (): number => {
  if (typeof window === 'undefined') return 3;
  const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  if (stored) {
    try {
      const items: NotificationItem[] = JSON.parse(stored);
      return items.filter((n) => !n.isRead).length;
    } catch {
      return DEFAULT_NOTIFICATIONS.filter((n) => !n.isRead).length;
    }
  }
  return DEFAULT_NOTIFICATIONS.filter((n) => !n.isRead).length;
};

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMessages?: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onOpenMessages,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'drops' | 'live' | 'dms' | 'tips'>('all');
  const dialogRef = useRef<HTMLDivElement>(null);

  // Load from localStorage or defaults
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      let items = DEFAULT_NOTIFICATIONS;
      if (stored) {
        try {
          items = JSON.parse(stored);
        } catch {
          items = DEFAULT_NOTIFICATIONS;
        }
      }
      setNotifications(items);
      const unread = items.filter((n) => !n.isRead).length;
      onUnreadCountChange?.(unread);
    }
  }, [isOpen, onUnreadCountChange]);

  // Sync back to storage and notify listeners
  const syncStorage = (updated: NotificationItem[]) => {
    setNotifications(updated);
    const unread = updated.filter((n) => !n.isRead).length;
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('creatorpulse_notifications_updated', {
          detail: { unreadCount: unread },
        })
      );
    }
    onUnreadCountChange?.(unread);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'drops') return n.category === 'drops';
    if (activeTab === 'live') return n.category === 'live';
    if (activeTab === 'dms') return n.category === 'dms';
    if (activeTab === 'tips') return n.category === 'tips' || n.category === 'subs';
    return true;
  });

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    syncStorage(updated);
  };

  const handleMarkItemAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    syncStorage(updated);
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = notifications.filter((n) => n.id !== id);
    syncStorage(updated);
  };

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'drops':
        return <Flame size={12} className="text-[#FF8A00]" />;
      case 'live':
        return <Radio size={12} className="text-[#EC4899] animate-pulse" />;
      case 'dms':
        return <MessageSquare size={12} className="text-[#3B82F6]" />;
      case 'tips':
        return <DollarSign size={12} className="text-[#10B981]" />;
      case 'subs':
        return <ShieldCheck size={12} className="text-[#8B5CF6]" />;
      default:
        return <Heart size={12} className="text-[#EC4899]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md transition-opacity duration-200 animate-in fade-in select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-modal-title"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg md:max-w-xl bg-white dark:bg-[#150D1E] rounded-t-[28px] sm:rounded-[32px] border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] h-auto animate-in zoom-in-95 slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200"
      >
        {/* Mobile top drag indicator handle */}
        <div className="sm:hidden w-10 h-1.5 bg-[#E4E4E7] dark:bg-[#3A2A4C] rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between shrink-0 bg-white/60 dark:bg-[#150D1E]/60 backdrop-blur-md gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#FF8A00] via-[#EC4899] to-[#7928CA] flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
              <Bell size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 id="notifications-modal-title" className="text-sm sm:text-base md:text-lg font-black text-[#18181B] dark:text-[#FDF2F8] truncate">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black bg-pink-100 dark:bg-[#381A2B] text-[#EC4899] dark:text-[#F472B6] shrink-0">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-[#71717A] dark:text-[#A1A1AA] truncate">
                Live alerts, VIP drops, and updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] sm:text-xs font-bold text-[#EC4899] hover:text-[#BE185D] dark:hover:text-[#F472B6] px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-pink-50 dark:hover:bg-[#22152E] transition-all cursor-pointer flex items-center gap-1 shrink-0"
                title="Mark all notifications as read"
              >
                <CheckCheck size={13} />
                <span className="hidden xs:inline">Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[#F4F4F6] dark:bg-[#22152E] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#E4E4E7] dark:hover:bg-[#2E1D3E] transition-all cursor-pointer"
              aria-label="Close notifications modal"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-3 sm:px-5 py-2 sm:py-2.5 border-b border-[#F3DCE8]/60 dark:border-[#3A2A4C]/60 flex items-center gap-1 sm:gap-1.5 overflow-x-auto shrink-0 bg-[#FFF9FC]/50 dark:bg-[#1A1222]/50 scrollbar-none">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'drops', label: '✨ Drops', count: notifications.filter((n) => n.category === 'drops').length },
            { id: 'live', label: '🔴 Live', count: notifications.filter((n) => n.category === 'live').length },
            { id: 'dms', label: '💬 DMs', count: notifications.filter((n) => n.category === 'dms').length },
            { id: 'tips', label: '💰 Tips & Subs', count: notifications.filter((n) => n.category === 'tips' || n.category === 'subs').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white shadow-xs'
                  : 'bg-white dark:bg-[#22152E] text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] border border-[#F3DCE8] dark:border-[#3A2A4C]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && tab.id === 'unread' && (
                <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-pink-100 dark:bg-[#381A2B] text-[#EC4899]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications Scrollable List */}
        <div className="p-3 sm:p-4 md:p-5 overflow-y-auto space-y-2 sm:space-y-2.5 flex-1 min-h-[200px]">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkItemAsRead(notif.id)}
                className={`group relative p-3 sm:p-3.5 md:p-4 rounded-2xl sm:rounded-3xl border transition-all duration-200 cursor-pointer flex items-start gap-2.5 sm:gap-3.5 ${
                  !notif.isRead
                    ? 'bg-[#FFF5F9] dark:bg-[#241731] border-[#FBCFE8] dark:border-[#522344] shadow-xs'
                    : 'bg-white dark:bg-[#1A1222] border-[#F3DCE8]/80 dark:border-[#3A2A4C]/80 hover:bg-[#FFF9FC] dark:hover:bg-[#22152E]'
                }`}
              >
                {/* Avatar / Icon */}
                <div className="relative shrink-0">
                  {notif.avatar ? (
                    <Avatar
                      src={notif.avatar}
                      alt={notif.sender}
                      size="sm"
                      className="ring-2 ring-[#F3DCE8] dark:ring-[#3A2A4C]"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#10B981] to-[#059669] flex items-center justify-center text-white font-bold shadow-xs">
                      <DollarSign size={16} />
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-center shadow-2xs">
                    {getCategoryIcon(notif.category)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="text-xs sm:text-[13px] text-[#18181B] dark:text-[#FDF2F8] leading-relaxed font-medium break-words">
                      <strong className="font-extrabold text-[#18181B] dark:text-white mr-1">
                        {notif.sender}
                      </strong>
                      {notif.action}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#EC4899] shrink-0 mt-1 ring-2 sm:ring-4 ring-pink-100 dark:ring-[#381A2B]" />
                    )}
                  </div>

                  {/* Optional preview image thumbnail */}
                  {notif.previewImage && (
                    <div className="w-full sm:w-48 h-20 rounded-xl overflow-hidden border border-[#F3DCE8] dark:border-[#3A2A4C] bg-black/5 mt-1">
                      <img
                        src={notif.previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Actions & Timestamp row */}
                  <div className="flex items-center justify-between gap-2 pt-1 flex-wrap sm:flex-nowrap">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#A1A1AA]">
                      {notif.time}
                    </span>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      {notif.link && (
                        <Link
                          href={notif.link}
                          onClick={(e) => {
                            handleMarkItemAsRead(notif.id);
                            if (notif.link === '/messages' && onOpenMessages) {
                              e.preventDefault();
                              onClose();
                              onOpenMessages();
                            } else {
                              onClose();
                            }
                          }}
                          className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#FFF1F7] dark:bg-[#341A2D] text-[#EC4899] dark:text-[#F472B6] hover:bg-[#EC4899] hover:text-white dark:hover:bg-[#EC4899] dark:hover:text-white transition-all flex items-center gap-1 shrink-0"
                        >
                          <span>{notif.actionLabel || 'View'}</span>
                          <ArrowRight size={10} />
                        </Link>
                      )}

                      <button
                        onClick={(e) => handleDeleteItem(e, notif.id)}
                        className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 p-1 sm:p-1.5 rounded-lg text-[#A1A1AA] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer shrink-0"
                        title="Remove notification"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 sm:py-12 px-4 text-center space-y-2.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFF1F7] dark:bg-[#22152E] flex items-center justify-center text-[#EC4899] mx-auto">
                <Bell size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#18181B] dark:text-[#FDF2F8]">
                  No notifications yet
                </h4>
                <p className="text-[11px] sm:text-xs text-[#71717A] dark:text-[#A1A1AA] max-w-xs mx-auto">
                  When creators drop new VIP assets or host live sessions, you'll be the first to know!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Safe Area Support on Mobile */}
        <div className="p-3 sm:p-4 md:px-5 border-t border-[#F3DCE8] dark:border-[#3A2A4C] bg-[#FFF9FC]/60 dark:bg-[#1A1222]/60 flex items-center justify-between shrink-0 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
          <Link
            href="/notifications"
            onClick={onClose}
            className="text-[11px] sm:text-xs font-bold text-[#EC4899] hover:text-[#BE185D] dark:hover:text-[#F472B6] flex items-center gap-1 group cursor-pointer truncate"
          >
            <span>Open Notification Center</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>

          <button
            onClick={onClose}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:bg-[#F4F4F6] dark:hover:bg-[#22152E] transition-colors cursor-pointer shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
