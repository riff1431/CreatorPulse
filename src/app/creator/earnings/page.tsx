'use client';

import React, { useState } from 'react';
import { DollarSign, TrendingUp, Clock, CreditCard, Star, Lock, Gift } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const earningsData = [
  { month: 'Feb', subscription: 1800, membership: 600, premium: 200, support: 200 },
  { month: 'Mar', subscription: 2100, membership: 700, premium: 250, support: 150 },
  { month: 'Apr', subscription: 2500, membership: 800, premium: 300, support: 300 },
  { month: 'May', subscription: 2800, membership: 850, premium: 250, support: 200 },
  { month: 'Jun', subscription: 2400, membership: 750, premium: 350, support: 200 },
  { month: 'Jul', subscription: 3000, membership: 900, premium: 400, support: 200 },
  { month: 'Aug', subscription: 3400, membership: 1050, premium: 450, support: 300 },
];

const breakdownItems = [
  { label: 'Subscription Earnings', value: '$22,400', icon: <CreditCard size={15} className="text-[#EC4899]" />, percentage: '64.9%' },
  { label: 'Membership Earnings', value: '$6,800', icon: <Star size={15} className="text-[#BE185D]" />, percentage: '19.7%' },
  { label: 'Premium Content Unlock', value: '$3,200', icon: <Lock size={15} className="text-[#F43F5E]" />, percentage: '9.3%' },
  { label: 'Tips & Support Received', value: '$2,100', icon: <Gift size={15} className="text-emerald-600" />, percentage: '6.1%' },
];

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function CreatorEarningsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const maxVal = Math.max(...earningsData.map((d) => d.subscription + d.membership + d.premium + d.support));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="text-[#EC4899]" size={22} />
            <h1 className="text-xl font-black text-[#18181B]">Earnings</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Detailed breakdown of all your revenue sources.</p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((t) => (
            <button key={t} onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                timeRange === t ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]' : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
              }`}
            >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Total Earnings</span>
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">$34,500</div>
          <div className="text-[11px] text-emerald-600 font-bold">Lifetime</div>
        </Card>
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Available</span>
            <TrendingUp size={16} className="text-[#EC4899]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">$4,850</div>
          <div className="text-[11px] text-[#BE185D] font-bold">Ready for payout</div>
        </Card>
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Pending</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">$1,200</div>
          <div className="text-[11px] text-amber-600 font-bold">Processing</div>
        </Card>
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">This Month</span>
            <DollarSign size={16} className="text-[#EC4899]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">$5,200</div>
          <div className="text-[11px] text-emerald-600 font-bold">+15.6% vs last month</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <Card className="lg:col-span-2 p-6 space-y-5">
          <h3 className="text-sm font-bold text-[#18181B]">Earnings by Source (Monthly)</h3>
          <div className="flex items-end gap-3.5 h-48 pt-4">
            {earningsData.map((d) => {
              const total = d.subscription + d.membership + d.premium + d.support;
              const height = (total / maxVal) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-[#71717A] font-bold">${(total / 1000).toFixed(1)}k</span>
                  <div className="w-full rounded-t-xl overflow-hidden shadow-sm" style={{ height: `${height}%` }}>
                    <div className="h-full flex flex-col">
                      <div className="bg-[#EC4899]" style={{ flex: d.subscription / total }} />
                      <div className="bg-[#BE185D]" style={{ flex: d.membership / total }} />
                      <div className="bg-[#F43F5E]" style={{ flex: d.premium / total }} />
                      <div className="bg-emerald-500" style={{ flex: d.support / total }} />
                    </div>
                  </div>
                  <span className="text-[11px] text-[#71717A] font-semibold">{d.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-5 text-xs text-[#71717A] pt-2 font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EC4899]" /> Subscriptions</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#BE185D]" /> Memberships</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" /> Premium</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Support</span>
          </div>
        </Card>

        {/* Breakdown */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#18181B]">Revenue Breakdown</h3>
          <div className="space-y-3">
            {breakdownItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8]">
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-[#18181B] font-bold">{item.label}</span>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[#18181B]">{item.value}</p>
                  <p className="text-[10px] text-[#71717A] font-medium">{item.percentage}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
