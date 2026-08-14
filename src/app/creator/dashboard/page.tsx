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
          <Sparkles className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">Creator Dashboard</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Revenue overview, audience growth, and content performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Followers</span>
            <Users size={16} className="text-[#EC4899]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">14,280</div>
          <div className="text-[11px] text-[#BE185D] font-bold">+320 this week</div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Subscribers</span>
            <Star size={16} className="text-[#EC4899]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">840</div>
          <div className="text-[11px] text-[#BE185D] font-bold">+28 this week</div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Profile Views</span>
            <Eye size={16} className="text-[#EC4899]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">128.4k</div>
          <div className="text-[11px] text-[#BE185D] font-bold">+4,200 this week</div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Monthly Revenue</span>
            <DollarSign size={16} className="text-[#EC4899]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">$5,200</div>
          <div className="text-[11px] text-emerald-600 font-bold">+15.6% vs last month</div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Total Earnings</span>
            <TrendingUp size={16} className="text-[#EC4899]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">$34,500</div>
          <div className="text-[11px] text-[#71717A] font-medium">Lifetime earnings</div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Pending</span>
            <Clock size={16} className="text-[#EC4899]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">$1,200</div>
          <div className="text-[11px] text-[#A1A1AA] font-medium">Available in 7 days</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#18181B]">Monthly Earnings Trend</h3>
            <Badge variant="emerald" size="sm">+15.6% Growth</Badge>
          </div>
          <div className="flex items-end gap-3.5 h-48 pt-4">
            {revenueData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] text-[#71717A] font-bold">${(d.value / 1000).toFixed(1)}k</span>
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
            <Link href="/creator/posts">
              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] hover:border-[#F472B6] hover:bg-[#FFF1F7] transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FCE7F3] flex items-center justify-center text-[#EC4899] font-bold"><PlusSquare size={16} /></div>
                  <p className="text-xs font-bold text-[#18181B]">Create New Post</p>
                </div>
                <ArrowRight size={14} className="text-[#A1A1AA] group-hover:text-[#EC4899] transition-colors" />
              </div>
            </Link>
            <Link href="/creator/reels">
              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] hover:border-[#F472B6] hover:bg-[#FFF1F7] transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FCE7F3] flex items-center justify-center text-[#EC4899] font-bold"><Radio size={16} /></div>
                  <p className="text-xs font-bold text-[#18181B]">Upload Reel</p>
                </div>
                <ArrowRight size={14} className="text-[#A1A1AA] group-hover:text-[#EC4899] transition-colors" />
              </div>
            </Link>
            <Link href="/creator/payouts">
              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] hover:border-[#F472B6] hover:bg-[#FFF1F7] transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FCE7F3] flex items-center justify-center text-[#EC4899] font-bold"><Wallet size={16} /></div>
                  <p className="text-xs font-bold text-[#18181B]">Request Payout</p>
                </div>
                <ArrowRight size={14} className="text-[#A1A1AA] group-hover:text-[#EC4899] transition-colors" />
              </div>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Subscribers */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#18181B]">Recent Subscribers</h3>
            <Link href="/creator/subscribers"><Button variant="ghost" size="sm" className="text-[#EC4899] text-xs font-bold">View All</Button></Link>
          </div>
          <div className="space-y-3">
            {recentSubscribers.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-[#FFF9FC]">
                <div className="flex items-center gap-3">
                  <Avatar src={s.avatar} alt={s.name} size="sm" />
                  <div>
                    <p className="font-bold text-[#18181B]">{s.name}</p>
                    <p className="text-[10px] text-[#BE185D] font-semibold">{s.plan}</p>
                  </div>
                </div>
                <span className="text-[#A1A1AA] font-medium">{s.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Content */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#18181B]">Top Performing Posts</h3>
            <Link href="/creator/analytics"><Button variant="ghost" size="sm" className="text-[#EC4899] text-xs font-bold">Analytics</Button></Link>
          </div>
          <div className="space-y-3">
            {topPosts.map((p) => (
              <div key={p.title} className="flex items-center justify-between text-xs p-3 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8]">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#18181B] truncate">{p.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-[#71717A] font-medium">
                    <span>{p.views.toLocaleString()} views</span>
                    <span>•</span>
                    <span>{p.likes} likes</span>
                    <Badge variant="pink" size="sm">{p.type}</Badge>
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
