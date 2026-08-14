'use client';

import React from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

const earningsData = [
  { month: 'Feb', revenue: 18000, fees: 900, payouts: 15300 },
  { month: 'Mar', revenue: 22000, fees: 1100, payouts: 18700 },
  { month: 'Apr', revenue: 26000, fees: 1300, payouts: 22100 },
  { month: 'May', revenue: 31000, fees: 1550, payouts: 26350 },
  { month: 'Jun', revenue: 28000, fees: 1400, payouts: 23800 },
  { month: 'Jul', revenue: 35000, fees: 1750, payouts: 29750 },
  { month: 'Aug', revenue: 41500, fees: 2075, payouts: 35275 },
];

const topCreators = [
  { name: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', earnings: '$68,900', percentage: '33.8%' },
  { name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', earnings: '$34,500', percentage: '16.9%' },
  { name: 'Lisa Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', earnings: '$12,400', percentage: '6.1%' },
  { name: 'David Miller', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', earnings: '$6,200', percentage: '3.0%' },
  { name: 'Emma Torres', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', earnings: '$2,800', percentage: '1.4%' },
];

export default function AdminEarningsPage() {
  const maxRevenue = Math.max(...earningsData.map((d) => d.revenue));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <TrendingUp className="text-emerald-400" size={22} />
          <h1 className="text-xl font-black text-white">Platform Earnings</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Revenue overview, platform fees, and creator earnings breakdown.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard label="Total Revenue" value="$241,500" icon={<DollarSign size={16} className="text-emerald-400" />} trend="+18.2% this month" trendColor="text-emerald-400" />
        <AdminStatsCard label="Platform Fees" value="$12,075" icon={<DollarSign size={16} className="text-rose-400" />} trend="5% commission" trendColor="text-rose-400" />
        <AdminStatsCard label="Creator Payouts" value="$198,425" icon={<DollarSign size={16} className="text-indigo-400" />} trend="82.1% of revenue" trendColor="text-indigo-400" />
        <AdminStatsCard label="Net Platform Earnings" value="$31,000" icon={<TrendingUp size={16} className="text-amber-400" />} trend="After payouts + fees" trendColor="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="lg:col-span-2 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Monthly Revenue Trend</h3>
          <div className="flex items-end gap-3 h-44">
            {earningsData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400 font-medium">${(d.revenue / 1000).toFixed(0)}k</span>
                <div className="w-full flex flex-col gap-0.5" style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}>
                  <div className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg" />
                </div>
                <span className="text-[10px] text-slate-500">{d.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Earning Creators */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Top Earning Creators</h3>
          <div className="space-y-3">
            {topCreators.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-bold w-4">{i + 1}</span>
                  <Avatar src={c.avatar} alt={c.name} size="sm" />
                  <span className="font-semibold text-slate-200">{c.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400">{c.earnings}</p>
                  <p className="text-[10px] text-slate-500">{c.percentage}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
