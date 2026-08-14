'use client';

import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Bell, Heart, DollarSign, MessageCircle } from 'lucide-react';

export function NotificationsPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Notifications</h1>
          <p className="text-xs text-[#71717A]">Stay updated on your interactions and tips</p>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-white rounded-2xl border border-[#F3DCE8] flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#EC4899] flex items-center justify-center">
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-xs text-[#18181B] font-medium"><strong className="font-bold">Alex</strong> sent you a $25.00 tip!</p>
              <span className="text-[10px] text-[#A1A1AA]">5 minutes ago</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default NotificationsPage;
