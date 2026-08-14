'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, Heart, MessageSquare, UserPlus, DollarSign, 
  Sparkles, CheckCircle2, ShieldCheck, Check 
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

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));

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
                <Bell className="text-[#EC4899]" size={24} />
                <h1 className="text-2xl font-black text-[#18181B]">Notifications Center</h1>
              </div>
              <p className="text-xs text-[#71717A] font-medium">Activity updates, new subscribers, tips, and system alerts.</p>
            </div>

            <Button variant="outline" size="sm" onClick={handleMarkAllRead} leftIcon={<Check size={14} />}>
              Mark All as Read
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-[#F3DCE8] pb-2 text-xs font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-2xl transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-2xl transition-all cursor-pointer ${
                filter === 'unread'
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
              }`}
            >
              Unread ({notifications.filter((n) => !n.isRead).length})
            </button>
          </div>

          {/* Notifications Feed */}
          <div className="space-y-3">
            {filtered.map((item) => (
              <Card
                key={item.id}
                className={`p-5 flex items-start gap-4 transition-all ${
                  !item.isRead ? 'bg-white border-[#F472B6]/60 shadow-md shadow-[#EC4899]/5' : 'bg-white/80 opacity-90'
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

                <div className="flex-1 text-xs space-y-1.5 font-medium">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-[#18181B] text-sm">{item.title}</h4>
                    <span className="text-[10px] text-[#A1A1AA]">{item.time}</span>
                  </div>
                  <p className="text-[#52525B] leading-relaxed font-normal">{item.message}</p>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
