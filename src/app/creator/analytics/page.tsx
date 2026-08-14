'use client';

import React, { useState } from 'react';
import { BarChart3, Users, Eye, Film, Clock, TrendingUp, Heart, MessageSquare } from 'lucide-react';
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
            <BarChart3 className="text-violet-400" size={22} />
            <h1 className="text-xl font-black text-white">Analytics</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Audience growth, content performance, and engagement insights.</p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {([['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['90d', 'Last 90 days'], ['12m', '12 months']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTimeRange(key)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                timeRange === key ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Total Posts</span>
            <MessageSquare size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">48</div>
          <div className="text-[10px] text-cyan-400 font-medium">+5 this period</div>
        </Card>
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Total Reels</span>
            <Film size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">12</div>
          <div className="text-[10px] text-indigo-400 font-medium">+3 this period</div>
        </Card>
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Total Stories</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">86</div>
          <div className="text-[10px] text-amber-400 font-medium">+14 this period</div>
        </Card>
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Avg Engagement</span>
            <Heart size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">8.4%</div>
          <div className="text-[10px] text-rose-400 font-medium">+1.2% vs last period</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follower Growth Chart */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Follower Growth</h3>
            <Badge variant="cyan" size="sm">+1,480</Badge>
          </div>
          <div className="flex items-end gap-4 h-36">
            {followerGrowth.map((d) => (
              <div key={d.period} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400 font-medium">{(d.value / 1000).toFixed(1)}k</span>
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg"
                  style={{ height: `${(d.value / maxFollowers) * 100}%` }}
                />
                <span className="text-[10px] text-slate-500">{d.period}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Views Trend */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Views by Source</h3>
            <Badge variant="indigo" size="sm">{(totalViews / 1000).toFixed(0)}k total</Badge>
          </div>
          <div className="space-y-3">
            {viewsTrend.map((v) => {
              const total = v.profile + v.posts + v.reels + v.stories;
              return (
                <div key={v.period} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{v.period}</span>
                    <span>{(total / 1000).toFixed(0)}k views</span>
                  </div>
                  <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-900">
                    <div className="bg-indigo-500 h-full" style={{ width: `${(v.profile / total) * 100}%` }} />
                    <div className="bg-cyan-500 h-full" style={{ width: `${(v.posts / total) * 100}%` }} />
                    <div className="bg-violet-500 h-full" style={{ width: `${(v.reels / total) * 100}%` }} />
                    <div className="bg-amber-500 h-full" style={{ width: `${(v.stories / total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Profile</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Posts</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> Reels</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Stories</span>
          </div>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Top Performing Content</h3>
        <div className="divide-y divide-slate-800/60">
          {topContent.map((c, i) => (
            <div key={c.title} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-bold w-4">{i + 1}</span>
                <div>
                  <p className="font-semibold text-slate-200 truncate max-w-[300px]">{c.title}</p>
                  <Badge variant={c.type === 'Reel' ? 'indigo' : 'cyan'} size="sm">{c.type}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span className="flex items-center gap-1"><Eye size={11} /> {c.views.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Heart size={11} /> {c.likes.toLocaleString()}</span>
                <span className="flex items-center gap-1 hidden sm:flex"><MessageSquare size={11} /> {c.comments}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
