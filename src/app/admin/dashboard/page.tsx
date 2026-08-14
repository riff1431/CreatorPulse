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
import { Avatar } from '@/components/ui/Avatar';

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
          <Shield className="text-rose-400" size={22} />
          <h1 className="text-xl font-black text-white">Admin Dashboard</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Platform overview, metrics, and quick actions.</p>
      </div>

      {/* Stats Grid — 8 cards matching PRD Section 20 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          label="Total Members"
          value="48,920"
          icon={<Users size={16} className="text-cyan-400" />}
          trend="+1,240 this week"
          trendColor="text-cyan-400"
        />
        <AdminStatsCard
          label="Total Creators"
          value="1,480"
          icon={<UserCheck size={16} className="text-indigo-400" />}
          trend="+32 applications"
          trendColor="text-indigo-400"
        />
        <AdminStatsCard
          label="Active Subscriptions"
          value="24,150"
          icon={<CreditCard size={16} className="text-emerald-400" />}
          trend="+840 this month"
          trendColor="text-emerald-400"
        />
        <AdminStatsCard
          label="Platform Revenue"
          value="$241.5k"
          icon={<DollarSign size={16} className="text-amber-400" />}
          trend="+18.2% vs last month"
          trendColor="text-amber-400"
        />
        <AdminStatsCard
          label="Creator Earnings"
          value="$198.4k"
          icon={<TrendingUp size={16} className="text-violet-400" />}
          trend="82.1% of revenue"
          trendColor="text-violet-400"
        />
        <AdminStatsCard
          label="Total Transactions"
          value="156,320"
          icon={<Receipt size={16} className="text-sky-400" />}
          trend="+4,280 this week"
          trendColor="text-sky-400"
        />
        <AdminStatsCard
          label="Pending Payouts"
          value="$12,450"
          icon={<Wallet size={16} className="text-orange-400" />}
          trend="3 requests awaiting"
          trendColor="text-orange-400"
        />
        <AdminStatsCard
          label="Open Reports"
          value="7"
          icon={<AlertTriangle size={16} className="text-rose-400" />}
          trend="2 high priority"
          trendColor="text-rose-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Monthly Platform Revenue</h3>
            <Badge variant="emerald" size="sm">+18.2%</Badge>
          </div>
          <div className="flex items-end gap-3 h-44">
            {revenueData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400 font-medium">
                  ${(d.value / 1000).toFixed(0)}k
                </span>
                <div
                  className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${(d.value / maxVal) * 100}%` }}
                />
                <span className="text-[10px] text-slate-500">{d.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/admin/applications">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-rose-500/30 transition-colors flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <FileText size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Review Applications</p>
                    <p className="text-[10px] text-slate-500">2 pending</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-rose-400 transition-colors" />
              </div>
            </Link>

            <Link href="/admin/payouts">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-rose-500/30 transition-colors flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <Wallet size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Process Payouts</p>
                    <p className="text-[10px] text-slate-500">$12,450 pending</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-rose-400 transition-colors" />
              </div>
            </Link>

            <Link href="/admin/reports">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-rose-500/30 transition-colors flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                    <AlertTriangle size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Moderate Reports</p>
                    <p className="text-[10px] text-slate-500">7 open reports</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-rose-400 transition-colors" />
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Recent Activity</h3>
        <div className="divide-y divide-slate-800/60">
          {recentActivity.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  item.type === 'report' ? 'bg-rose-400' :
                  item.type === 'payout' ? 'bg-orange-400' :
                  item.type === 'application' ? 'bg-indigo-400' :
                  item.type === 'milestone' ? 'bg-amber-400' :
                  'bg-cyan-400'
                }`} />
                <span className="text-slate-300">{item.text}</span>
              </div>
              <span className="text-slate-500 shrink-0 ml-4">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
