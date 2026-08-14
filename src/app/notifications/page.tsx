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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 space-y-6 max-w-3xl mx-auto lg:mx-0 w-full pb-20 lg:pb-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="text-cyan-400" size={24} />
                <h1 className="text-2xl font-black text-white">Notifications Center</h1>
              </div>
              <p className="text-xs text-slate-400">Activity updates, new subscribers, tips, and system alerts.</p>
            </div>

            <Button variant="outline" size="sm" onClick={handleMarkAllRead} leftIcon={<Check size={14} />}>
              Mark All as Read
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filter === 'all'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filter === 'unread'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
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
                className={`p-4 flex items-start gap-3 transition-all ${
                  !item.isRead ? 'bg-slate-900/90 border-cyan-500/30' : 'opacity-85'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                  {item.type === 'subscriber' ? (
                    <UserPlus size={18} className="text-indigo-400" />
                  ) : item.type === 'tip' ? (
                    <DollarSign size={18} className="text-emerald-400" />
                  ) : item.type === 'like' ? (
                    <Heart size={18} className="text-rose-400 fill-rose-400" />
                  ) : (
                    <Sparkles size={18} className="text-cyan-400" />
                  )}
                </div>

                <div className="flex-1 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-100">{item.title}</h4>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-slate-300">{item.message}</p>
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
