'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users, Star, Eye, DollarSign, TrendingUp, Clock,
  Sparkles, ArrowRight, PlusSquare, Wallet, Radio
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

const revenueData = [
  { month: 'Feb', value: 2800 },
  { month: 'Mar', value: 3200 },
  { month: 'Apr', value: 3900 },
  { month: 'May', value: 4100 },
  { month: 'Jun', value: 3700 },
  { month: 'Jul', value: 4500 },
  { month: 'Aug', value: 5200 },
];

const recentSubscribers = [
  { name: 'Alex Vance', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', plan: 'Pro Designer Tier', time: '2h ago' },
  { name: 'Jordan Lee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', plan: 'VIP Inner Circle', time: '5h ago' },
  { name: 'Mia Wong', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', plan: 'Starter Community', time: '1d ago' },
  { name: 'David Miller', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', plan: 'Pro Designer Tier', time: '2d ago' },
];

const topPosts = [
  { title: 'Modern Micro-Interactions in Web Apps', views: 2410, likes: 342, type: 'image' },
  { title: 'Community Poll: Next UI Kit', views: 1200, likes: 94, type: 'poll' },
  { title: 'Audio Masterclass: Color Theory', views: 680, likes: 56, type: 'audio' },
];

export default function CreatorDashboardPage() {
  const maxVal = Math.max(...revenueData.map((d) => d.value));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="text-indigo-400" size={22} />
          <h1 className="text-xl font-black text-white">Creator Dashboard</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Revenue overview, audience growth, and content performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Followers</span>
            <Users size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">14,280</div>
          <div className="text-[10px] text-cyan-400 font-medium">+320 this week</div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Subscribers</span>
            <Star size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">840</div>
          <div className="text-[10px] text-indigo-400 font-medium">+28 this week</div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Profile Views</span>
            <Eye size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">128.4k</div>
          <div className="text-[10px] text-amber-400 font-medium">+4,200 this week</div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Monthly Revenue</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">$5,200</div>
          <div className="text-[10px] text-emerald-400 font-medium">+15.6% vs last month</div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Total Earnings</span>
            <TrendingUp size={16} className="text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white">$34,500</div>
          <div className="text-[10px] text-violet-400 font-medium">Lifetime earnings</div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Pending</span>
            <Clock size={16} className="text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white">$1,200</div>
          <div className="text-[10px] text-orange-400 font-medium">Available in 7 days</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Monthly Earnings</h3>
            <Badge variant="emerald" size="sm">+15.6%</Badge>
          </div>
          <div className="flex items-end gap-3 h-44">
            {revenueData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400 font-medium">${(d.value / 1000).toFixed(1)}k</span>
                <div
                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all hover:opacity-80"
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
            <Link href="/creator/posts">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-colors flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400"><PlusSquare size={14} /></div>
                  <p className="text-xs font-semibold text-slate-200">Create New Post</p>
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>
            </Link>
            <Link href="/creator/reels">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-colors flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400"><Radio size={14} /></div>
                  <p className="text-xs font-semibold text-slate-200">Upload Reel</p>
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>
            </Link>
            <Link href="/creator/payouts">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-colors flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Wallet size={14} /></div>
                  <p className="text-xs font-semibold text-slate-200">Request Payout</p>
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Subscribers */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Recent Subscribers</h3>
            <Link href="/creator/subscribers"><Button variant="ghost" size="sm" className="text-indigo-400 text-xs">View All</Button></Link>
          </div>
          <div className="space-y-3">
            {recentSubscribers.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Avatar src={s.avatar} alt={s.name} size="sm" />
                  <div>
                    <p className="font-semibold text-slate-200">{s.name}</p>
                    <p className="text-[10px] text-indigo-400">{s.plan}</p>
                  </div>
                </div>
                <span className="text-slate-500">{s.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Content */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Top Performing Posts</h3>
            <Link href="/creator/analytics"><Button variant="ghost" size="sm" className="text-indigo-400 text-xs">Analytics</Button></Link>
          </div>
          <div className="space-y-3">
            {topPosts.map((p) => (
              <div key={p.title} className="flex items-center justify-between text-xs p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200 truncate">{p.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                    <span>{p.views.toLocaleString()} views</span>
                    <span>{p.likes} likes</span>
                    <Badge variant="slate" size="sm">{p.type}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
