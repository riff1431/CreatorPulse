'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, Heart, MessageSquare, UserPlus, DollarSign, 
  Sparkles, CheckCircle2, ShieldCheck, Check, Inbox, AlertCircle 
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NotificationItem } from '@/lib/supabase/store';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-1',
      title: 'New VIP Subscriber',
      message: 'Jordan Lee subscribed to your Pro Designer Tier ($15.00/mo).',
      time: '10 minutes ago',
      isRead: false,
      type: 'subscriber'
    },
    {
      id: 'n-2',
      title: 'Creator Tip Support Received',
      message: 'Alex Vance sent you a $25.00 support tip: "Great design masterclass!"',
      time: '1 hour ago',
      isRead: false,
      type: 'tip'
    },
    {
      id: 'n-3',
      title: 'Post Liked',
      message: 'Marcus Vance liked your post "Modern Micro-Interactions in Web Apps".',
      time: '3 hours ago',
      isRead: true,
      type: 'like'
    },
    {
      id: 'n-4',
      title: 'Creator Verification Approved',
      message: 'Your Creator Application has been approved by the Admin team! You can now set membership pricing.',
      time: '1 day ago',
      isRead: true,
      type: 'payout'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'subscriber' | 'tip' | 'like'>('all');
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);

  // Simulate loader on filter switch
  useEffect(() => {
    setIsNotificationLoading(true);
    const timer = setTimeout(() => {
      setIsNotificationLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [filter]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 space-y-6 max-w-3xl mx-auto lg:mx-0 w-full pb-20 lg:pb-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="text-[#EC4899] animate-bounce-slow" size={24} />
                <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Notifications Center</h1>
              </div>
              <p className="text-xs text-[#71717A] font-bold">Activity updates, new subscribers, tips, and system alerts.</p>
            </div>

            <Button variant="outline" size="sm" onClick={handleMarkAllRead} leftIcon={<Check size={14} />}>
              Mark All Read
            </Button>
          </div>

          {/* Filter Tabs Icon Row */}
          <div className="flex items-center gap-2 border-b border-[#F3DCE8] pb-2 text-xs font-bold overflow-x-auto scrollbar-none">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-2xl transition-all cursor-pointer shrink-0 ${
                filter === 'all'
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
              }`}
            >
              🛎️ All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-2xl transition-all cursor-pointer shrink-0 ${
                filter === 'unread'
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
              }`}
            >
              ✉️ Unread ({notifications.filter((n) => !n.isRead).length})
            </button>
            <button
              onClick={() => setFilter('subscriber')}
              className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                filter === 'subscriber'
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
              }`}
            >
              <UserPlus size={13} /> VIP Subs
            </button>
            <button
              onClick={() => setFilter('tip')}
              className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                filter === 'tip'
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
              }`}
            >
              <DollarSign size={13} /> Support Tips
            </button>
            <button
              onClick={() => setFilter('like')}
              className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                filter === 'like'
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
              }`}
            >
              <Heart size={13} /> Likes
            </button>
          </div>

          {/* Notifications Feed */}
          <div className="space-y-3">
            {isNotificationLoading ? (
              // Shimmer loaders
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white border border-[#F3DCE8] rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl skeleton-shimmer shrink-0" />
                    <div className="space-y-2 flex-1 pt-1.5">
                      <div className="w-1/3 h-3.5 skeleton-shimmer rounded-full" />
                      <div className="w-full h-3 skeleton-shimmer rounded-full" />
                    </div>
                  </div>
                ))}
              </>
            ) : filtered.length === 0 ? (
              // Empty Inbox State
              <div className="text-center py-16 px-6 bg-white border border-[#F3DCE8] rounded-[24px] space-y-4 max-w-md mx-auto">
                <Inbox className="w-12 h-12 text-[#BE185D] mx-auto animate-pulse" />
                <h3 className="font-extrabold text-[#18181B] text-base">Inbox Empty</h3>
                <p className="text-xs text-[#71717A] font-semibold leading-relaxed">
                  You don't have any notifications under this filter. Tap 'All' to check other updates.
                </p>
                <Button variant="outline" size="sm" onClick={() => setFilter('all')}>
                  View All Notifications
                </Button>
              </div>
            ) : (
              filtered.map((item) => (
                <Card
                  key={item.id}
                  className={`p-5 flex items-start gap-4 transition-all duration-300 border ${
                    !item.isRead 
                      ? 'bg-white border-[#F472B6] shadow-sm shadow-[#EC4899]/5' 
                      : 'bg-white/80 border-[#F3DCE8] opacity-75'
                  }`}
                >
                  <div className="p-3 rounded-2xl bg-[#FFF1F7] border border-[#F3DCE8] shrink-0">
                    {item.type === 'subscriber' ? (
                      <UserPlus size={18} className="text-[#EC4899]" />
                    ) : item.type === 'tip' ? (
                      <DollarSign size={18} className="text-emerald-600" />
                    ) : item.type === 'like' ? (
                      <Heart size={18} className="text-[#F43F5E] fill-[#F43F5E]" />
                    ) : (
                      <Sparkles size={18} className="text-[#EC4899]" />
                    )}
                  </div>

                  <div className="flex-1 text-xs space-y-1.5 font-semibold">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-[#18181B] text-sm">{item.title}</h4>
                      <span className="text-[10px] text-[#A1A1AA]">{item.time}</span>
                    </div>
                    <p className="text-[#52525B] leading-relaxed font-normal">{item.message}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
