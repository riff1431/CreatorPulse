'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { 
  Bell, Heart, DollarSign, MessageCircle, Star, Sparkles, 
  CheckCircle2, Trash2, Check, Filter 
} from 'lucide-react';

interface NotificationItem {
  id: string;
  sender: string;
  avatar: string;
  action: string;
  category: 'tip' | 'sub' | 'comment' | 'system';
  time: string;
  isRead: boolean;
  link: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    sender: 'Alex Vance',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    action: 'sent you a tip of $25.00 for your masterclass!',
    category: 'tip',
    time: '5m ago',
    isRead: false,
    link: '/balance',
  },
  {
    id: 'n2',
    sender: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    action: 'subscribed to your VIP Inner Circle tier.',
    category: 'sub',
    time: '45m ago',
    isRead: false,
    link: '/creator/dashboard',
  },
  {
    id: 'n3',
    sender: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    action: 'commented: "This design token workflow is incredible!"',
    category: 'comment',
    time: '2h ago',
    isRead: true,
    link: '/feed',
  },
  {
    id: 'n4',
    sender: 'CreatorPulse Security',
    avatar: '',
    action: 'Your monthly payout of $1,450.00 has been initiated successfully.',
    category: 'system',
    time: '1d ago',
    isRead: true,
    link: '/balance',
  },
];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'tip' | 'sub' | 'comment'>('all');

  const filtered = selectedFilter === 'all'
    ? notifications
    : notifications.filter((n) => n.category === selectedFilter);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="text-[#EC4899]" size={22} />
              <h1 className="text-xl font-black text-[#18181B] dark:text-[#FDF2F8] tracking-tight">Notifications</h1>
            </div>
            <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">Stay updated on creator earnings, tips, and fan interactions.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-xs font-bold text-[#EC4899] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Check size={13} />
              <span>Mark all read</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl">
          {[
            { id: 'all', label: 'All' },
            { id: 'tip', label: 'Tips & Earnings' },
            { id: 'sub', label: 'Subscriptions' },
            { id: 'comment', label: 'Comments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] shadow-2xs'
                  : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications Feed */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all block ${
                  item.isRead
                    ? 'bg-white dark:bg-[#1A1222] border-[#F3DCE8] dark:border-[#3A2A4C] hover:bg-[#FFF9FC] dark:hover:bg-[#241A30]'
                    : 'bg-[#FFF9FC] dark:bg-[#241A30] border-[#FBCFE8] dark:border-[#4C1D3B] shadow-xs'
                }`}
              >
                {item.avatar ? (
                  <Avatar alt={item.sender} src={item.avatar} size="md" />
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F43F5E] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Sparkles size={18} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#18181B] dark:text-[#FDF2F8] leading-relaxed">
                    <strong className="font-bold">{item.sender}</strong> {item.action}
                  </p>
                  <span className="text-[10px] text-[#A1A1AA] dark:text-[#8E7890] font-medium block mt-1">
                    {item.time}
                  </span>
                </div>

                {!item.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899] shrink-0 mt-1" />
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-3xl space-y-2">
            <Bell size={32} className="mx-auto text-[#A1A1AA]" />
            <h3 className="font-bold text-sm text-[#18181B] dark:text-[#FDF2F8]">No notifications</h3>
            <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">You are all caught up with your latest alerts.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default NotificationsPage;
