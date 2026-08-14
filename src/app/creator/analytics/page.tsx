'use client';

import React, { useState } from 'react';
import { BarChart3, Eye, Film, Clock, Heart, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const followerGrowth = [
  { period: 'Week 1', value: 12800 },
  { period: 'Week 2', value: 13100 },
  { period: 'Week 3', value: 13500 },
  { period: 'Week 4', value: 14280 },
];

const viewsTrend = [
  { period: 'Week 1', profile: 28000, posts: 14200, reels: 22400, stories: 4800 },
  { period: 'Week 2', profile: 31000, posts: 16800, reels: 28900, stories: 5200 },
  { period: 'Week 3', profile: 33500, posts: 15600, reels: 25200, stories: 4600 },
  { period: 'Week 4', profile: 36000, posts: 18400, reels: 32100, stories: 6100 },
];

const topContent = [
  { title: '3 UI Design Mistakes You\'re Making!', type: 'Reel', views: 14200, likes: 1420, comments: 89 },
  { title: 'Modern Micro-Interactions in Web Apps', type: 'Post', views: 2410, likes: 342, comments: 28 },
  { title: 'Community Poll: Next UI Kit', type: 'Post', views: 1200, likes: 94, comments: 16 },
  { title: 'Quick Figma Prototyping Tips', type: 'Reel', views: 8400, likes: 640, comments: 42 },
  { title: 'Audio Masterclass: Color Theory', type: 'Post', views: 680, likes: 56, comments: 8 },
];

type TimeRange = '7d' | '30d' | '90d' | '12m';

export default function CreatorAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const maxFollowers = Math.max(...followerGrowth.map((d) => d.value));
  const totalViews = viewsTrend.reduce((sum, v) => sum + v.profile, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="text-[#EC4899]" size={22} />
            <h1 className="text-xl font-black text-[#18181B]">Analytics</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Audience growth, content performance, and engagement insights.</p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {([['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['90d', 'Last 90 days'], ['12m', '12 months']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTimeRange(key)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                timeRange === key ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]' : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
              }`}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Total Posts</span>
            <MessageSquare size={16} className="text-[#EC4899]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">48</div>
          <div className="text-[11px] text-[#BE185D] font-bold">+5 this period</div>
        </Card>
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Total Reels</span>
            <Film size={16} className="text-[#EC4899]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">12</div>
          <div className="text-[11px] text-[#BE185D] font-bold">+3 this period</div>
        </Card>
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Total Stories</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">86</div>
          <div className="text-[11px] text-amber-600 font-bold">+14 this period</div>
        </Card>
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Avg Engagement</span>
            <Heart size={16} className="text-[#F43F5E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">8.4%</div>
          <div className="text-[11px] text-emerald-600 font-bold">+1.2% vs last period</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follower Growth Chart */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#18181B]">Follower Growth</h3>
            <Badge variant="emerald" size="sm">+1,480</Badge>
          </div>
          <div className="flex items-end gap-4 h-40 pt-2">
            {followerGrowth.map((d) => (
              <div key={d.period} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] text-[#71717A] font-bold">{(d.value / 1000).toFixed(1)}k</span>
                <div
                  className="w-full bg-gradient-to-t from-[#EC4899] to-[#F472B6] rounded-t-xl shadow-sm shadow-[#EC4899]/15"
                  style={{ height: `${(d.value / maxFollowers) * 100}%` }}
                />
                <span className="text-[11px] text-[#71717A] font-semibold">{d.period}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Views Trend */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#18181B]">Views by Source</h3>
            <Badge variant="pink" size="sm">{(totalViews / 1000).toFixed(0)}k total</Badge>
          </div>
          <div className="space-y-3.5 pt-2">
            {viewsTrend.map((v) => {
              const total = v.profile + v.posts + v.reels + v.stories;
              return (
                <div key={v.period} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-[#71717A] font-semibold">
                    <span>{v.period}</span>
                    <span className="text-[#18181B] font-bold">{(total / 1000).toFixed(0)}k views</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#FCE7F3]">
                    <div className="bg-[#EC4899] h-full" style={{ width: `${(v.profile / total) * 100}%` }} />
                    <div className="bg-[#BE185D] h-full" style={{ width: `${(v.posts / total) * 100}%` }} />
                    <div className="bg-[#F43F5E] h-full" style={{ width: `${(v.reels / total) * 100}%` }} />
                    <div className="bg-amber-400 h-full" style={{ width: `${(v.stories / total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#18181B]">Top Performing Content</h3>
        <div className="divide-y divide-[#F3DCE8]">
          {topContent.map((c, i) => (
            <div key={c.title} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[#A1A1AA] font-bold w-4">{i + 1}</span>
                <div>
                  <p className="font-bold text-[#18181B] truncate max-w-[300px]">{c.title}</p>
                  <Badge variant={c.type === 'Reel' ? 'rose' : 'pink'} size="sm">{c.type}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[#71717A] font-medium">
                <span className="flex items-center gap-1"><Eye size={12} className="text-[#EC4899]" /> {c.views.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Heart size={12} className="text-[#F43F5E]" /> {c.likes.toLocaleString()}</span>
                <span className="flex items-center gap-1 hidden sm:flex"><MessageSquare size={12} /> {c.comments}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
