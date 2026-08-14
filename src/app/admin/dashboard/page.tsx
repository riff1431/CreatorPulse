'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users, UserCheck, CreditCard, DollarSign, TrendingUp,
  Receipt, Wallet, AlertTriangle, FileText, Shield, ArrowRight
} from 'lucide-react';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const recentActivity = [
  { id: '1', text: 'David Miller submitted a creator application', type: 'application', time: '5m ago' },
  { id: '2', text: 'Jordan Lee reported a post for spam', type: 'report', time: '12m ago' },
  { id: '3', text: 'Sarah Jenkins requested a $1,500 payout', type: 'payout', time: '1h ago' },
  { id: '4', text: 'New user signup: michael@test.com', type: 'signup', time: '2h ago' },
  { id: '5', text: 'Marcus Vance reached 22,000 followers', type: 'milestone', time: '3h ago' },
];

const revenueData = [
  { month: 'Feb', value: 18000 },
  { month: 'Mar', value: 22000 },
  { month: 'Apr', value: 26000 },
  { month: 'May', value: 31000 },
  { month: 'Jun', value: 28000 },
  { month: 'Jul', value: 35000 },
  { month: 'Aug', value: 41500 },
];

export default function AdminDashboardPage() {
  const maxVal = Math.max(...revenueData.map((d) => d.value));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Shield className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">Admin Dashboard</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Platform overview, metrics, and quick actions.</p>
      </div>

      {/* Stats Grid — 8 cards matching PRD Section 20 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          label="Total Members"
          value="48,920"
          icon={<Users size={16} className="text-[#EC4899]" />}
          trend="+1,240 this week"
          trendColor="text-[#BE185D]"
        />
        <AdminStatsCard
          label="Total Creators"
          value="1,480"
          icon={<UserCheck size={16} className="text-[#EC4899]" />}
          trend="+32 applications"
          trendColor="text-[#BE185D]"
        />
        <AdminStatsCard
          label="Active Subscriptions"
          value="24,150"
          icon={<CreditCard size={16} className="text-emerald-600" />}
          trend="+840 this month"
          trendColor="text-emerald-600"
        />
        <AdminStatsCard
          label="Platform Revenue"
          value="$241.5k"
          icon={<DollarSign size={16} className="text-[#EC4899]" />}
          trend="+18.2% vs last month"
          trendColor="text-[#BE185D]"
        />
        <AdminStatsCard
          label="Creator Earnings"
          value="$198.4k"
          icon={<TrendingUp size={16} className="text-[#EC4899]" />}
          trend="82.1% of revenue"
          trendColor="text-[#71717A]"
        />
        <AdminStatsCard
          label="Total Transactions"
          value="156,320"
          icon={<Receipt size={16} className="text-[#EC4899]" />}
          trend="+4,280 this week"
          trendColor="text-[#BE185D]"
        />
        <AdminStatsCard
          label="Pending Payouts"
          value="$12,450"
          icon={<Wallet size={16} className="text-amber-600" />}
          trend="3 requests awaiting"
          trendColor="text-amber-600"
        />
        <AdminStatsCard
          label="Open Reports"
          value="7"
          icon={<AlertTriangle size={16} className="text-[#F43F5E]" />}
          trend="2 high priority"
          trendColor="text-[#BE123C]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#18181B]">Monthly Platform Revenue</h3>
            <Badge variant="emerald" size="sm">+18.2% vs last month</Badge>
          </div>
          <div className="flex items-end gap-3.5 h-48 pt-4">
            {revenueData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] text-[#71717A] font-bold">
                  ${(d.value / 1000).toFixed(0)}k
                </span>
                <div
                  className="w-full bg-gradient-to-t from-[#EC4899] to-[#F472B6] rounded-t-xl transition-all hover:opacity-90 hover:scale-y-[1.02] shadow-sm shadow-[#EC4899]/15"
                  style={{ height: `${(d.value / maxVal) * 100}%` }}
                />
                <span className="text-[11px] text-[#71717A] font-semibold">{d.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#18181B]">Quick Actions</h3>
          <div className="space-y-2.5">
            <Link href="/admin/applications">
              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] hover:border-[#F472B6] hover:bg-[#FFF1F7] transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FCE7F3] flex items-center justify-center text-[#EC4899] font-bold">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">Review Applications</p>
                    <p className="text-[10px] text-[#71717A] font-medium">2 pending</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#A1A1AA] group-hover:text-[#EC4899] transition-colors" />
              </div>
            </Link>

            <Link href="/admin/payouts">
              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] hover:border-[#F472B6] hover:bg-[#FFF1F7] transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FCE7F3] flex items-center justify-center text-[#EC4899] font-bold">
                    <Wallet size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">Process Payouts</p>
                    <p className="text-[10px] text-[#71717A] font-medium">$12,450 pending</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#A1A1AA] group-hover:text-[#EC4899] transition-colors" />
              </div>
            </Link>

            <Link href="/admin/reports">
              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] hover:border-[#F472B6] hover:bg-[#FFF1F7] transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FFE4E6] flex items-center justify-center text-[#F43F5E] font-bold">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">Moderate Reports</p>
                    <p className="text-[10px] text-[#71717A] font-medium">7 open reports</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#A1A1AA] group-hover:text-[#F43F5E] transition-colors" />
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#18181B]">Recent Activity</h3>
        <div className="divide-y divide-[#F3DCE8]">
          {recentActivity.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  item.type === 'report' ? 'bg-[#F43F5E]' :
                  item.type === 'payout' ? 'bg-amber-500' :
                  item.type === 'application' ? 'bg-[#EC4899]' :
                  item.type === 'milestone' ? 'bg-[#BE185D]' :
                  'bg-[#EC4899]'
                }`} />
                <span className="text-[#18181B] font-medium">{item.text}</span>
              </div>
              <span className="text-[#A1A1AA] shrink-0 ml-4 font-medium">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
