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
  { label: 'Subscription Earnings', value: '$22,400', icon: <CreditCard size={14} className="text-indigo-400" />, percentage: '64.9%' },
  { label: 'Membership Earnings', value: '$6,800', icon: <Star size={14} className="text-amber-400" />, percentage: '19.7%' },
  { label: 'Premium Content Unlock', value: '$3,200', icon: <Lock size={14} className="text-cyan-400" />, percentage: '9.3%' },
  { label: 'Tips & Support Received', value: '$2,100', icon: <Gift size={14} className="text-emerald-400" />, percentage: '6.1%' },
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
            <DollarSign className="text-emerald-400" size={22} />
            <h1 className="text-xl font-black text-white">Earnings</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Detailed breakdown of all your revenue sources.</p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((t) => (
            <button key={t} onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                timeRange === t ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Total Earnings</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">$34,500</div>
          <div className="text-[10px] text-emerald-400 font-medium">Lifetime</div>
        </Card>
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Available</span>
            <TrendingUp size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">$4,850</div>
          <div className="text-[10px] text-indigo-400 font-medium">Ready for payout</div>
        </Card>
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Pending</span>
            <Clock size={16} className="text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white">$1,200</div>
          <div className="text-[10px] text-orange-400 font-medium">Processing</div>
        </Card>
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">This Month</span>
            <DollarSign size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">$5,200</div>
          <div className="text-[10px] text-cyan-400 font-medium">+15.6% vs last month</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <Card className="lg:col-span-2 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Earnings by Source (Monthly)</h3>
          <div className="flex items-end gap-3 h-44">
            {earningsData.map((d) => {
              const total = d.subscription + d.membership + d.premium + d.support;
              const height = (total / maxVal) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-medium">${(total / 1000).toFixed(1)}k</span>
                  <div className="w-full rounded-t-lg overflow-hidden" style={{ height: `${height}%` }}>
                    <div className="h-full flex flex-col">
                      <div className="bg-indigo-500" style={{ flex: d.subscription / total }} />
                      <div className="bg-amber-500" style={{ flex: d.membership / total }} />
                      <div className="bg-cyan-500" style={{ flex: d.premium / total }} />
                      <div className="bg-emerald-500" style={{ flex: d.support / total }} />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">{d.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Subscriptions</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Memberships</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Premium</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Support</span>
          </div>
        </Card>

        {/* Breakdown */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Revenue Breakdown</h3>
          <div className="space-y-3">
            {breakdownItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-slate-200 font-medium">{item.label}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{item.value}</p>
                  <p className="text-[10px] text-slate-500">{item.percentage}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
