'use client';

import React, { useState } from 'react';
import { BarChart3, Eye, Film, Clock, Heart, MessageSquare, Search, ArrowUpDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// Mock datasets for period changes
const analyticsPeriodData = {
  '7d': {
    posts: 3,
    reels: 1,
    stories: 18,
    engagement: '8.1%',
    growthTotal: '+210',
    viewsTotal: '18k total',
    followersGrowth: [
      { period: 'Mon', value: 14100 },
      { period: 'Tue', value: 14140 },
      { period: 'Wed', value: 14170 },
      { period: 'Thu', value: 14210 },
      { period: 'Fri', value: 14230 },
      { period: 'Sat', value: 14260 },
      { period: 'Sun', value: 14280 },
    ],
    viewsSource: [
      { source: 'Profile Views', val: 5600, color: '#EC4899' },
      { source: 'Posts Feed', val: 3200, color: '#BE185D' },
      { source: 'Reels Tab', val: 6800, color: '#F43F5E' },
      { source: 'Stories View', val: 2400, color: '#F59E0B' },
    ]
  },
  '30d': {
    posts: 12,
    reels: 4,
    stories: 86,
    engagement: '8.4%',
    growthTotal: '+1,480',
    viewsTotal: '97k total',
    followersGrowth: [
      { period: 'Week 1', value: 12800 },
      { period: 'Week 2', value: 13100 },
      { period: 'Week 3', value: 13500 },
      { period: 'Week 4', value: 14280 },
    ],
    viewsSource: [
      { source: 'Profile Views', val: 36000, color: '#EC4899' },
      { source: 'Posts Feed', val: 18400, color: '#BE185D' },
      { source: 'Reels Tab', val: 32100, color: '#F43F5E' },
      { source: 'Stories View', val: 6100, color: '#F59E0B' },
    ]
  },
  '90d': {
    posts: 38,
    reels: 14,
    stories: 242,
    engagement: '9.2%',
    growthTotal: '+4,820',
    viewsTotal: '340k total',
    followersGrowth: [
      { period: 'Month 1', value: 9460 },
      { period: 'Month 2', value: 11800 },
      { period: 'Month 3', value: 14280 },
    ],
    viewsSource: [
      { source: 'Profile Views', val: 125000, color: '#EC4899' },
      { source: 'Posts Feed', val: 78000, color: '#BE185D' },
      { source: 'Reels Tab', val: 110000, color: '#F43F5E' },
      { source: 'Stories View', val: 27000, color: '#F59E0B' },
    ]
  },
  '12m': {
    posts: 142,
    reels: 56,
    stories: 890,
    engagement: '8.9%',
    growthTotal: '+9,620',
    viewsTotal: '1.4M total',
    followersGrowth: [
      { period: 'Q1', value: 4660 },
      { period: 'Q2', value: 7800 },
      { period: 'Q3', value: 11200 },
      { period: 'Q4', value: 14280 },
    ],
    viewsSource: [
      { source: 'Profile Views', val: 510000, color: '#EC4899' },
      { source: 'Posts Feed', val: 290000, color: '#BE185D' },
      { source: 'Reels Tab', val: 450000, color: '#F43F5E' },
      { source: 'Stories View', val: 150000, color: '#F59E0B' },
    ]
  }
};

const topContent = [
  { id: '1', title: '3 UI Design Mistakes You\'re Making!', type: 'Reel', views: 14200, likes: 1420, comments: 89 },
  { id: '2', title: 'Modern Micro-Interactions in Web Apps', type: 'Post', views: 2410, likes: 342, comments: 28 },
  { id: '3', title: 'Community Poll: Next UI Kit', type: 'Post', views: 1200, likes: 94, comments: 16 },
  { id: '4', title: 'Quick Figma Prototyping Tips', type: 'Reel', views: 8400, likes: 640, comments: 42 },
  { id: '5', title: 'Audio Masterclass: Color Theory', type: 'Post', views: 680, likes: 56, comments: 8 },
];

type TimeRange = '7d' | '30d' | '90d' | '12m';

export default function CreatorAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<'views' | 'likes' | 'comments'>('views');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const activePeriod = analyticsPeriodData[timeRange];
  const maxFollowerVal = Math.max(...activePeriod.followersGrowth.map(d => d.value));

  // Handles filtering & sorting content lists
  const filteredContent = topContent.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    return sortDirection === 'desc' ? valB - valA : valA - valB;
  });

  const toggleSort = (key: 'views' | 'likes' | 'comments') => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const totalSourceViews = activePeriod.viewsSource.reduce((sum, item) => sum + item.val, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="text-[#EC4899]" size={22} />
            <h1 className="text-xl font-black text-[#18181B] tracking-tight">Analytics Studio</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Audience growth, content performance, and engagement insights.</p>
        </div>
        
        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 bg-white/70 p-1 border border-[#F3DCE8] rounded-2xl self-start md:self-auto shadow-xs">
          {([['7d', '7D'], ['30d', '30D'], ['90d', '90D'], ['12m', '12M']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTimeRange(key)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                timeRange === key
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2 hoverable">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Posts</span>
            <MessageSquare size={16} className="text-[#EC4899]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">{activePeriod.posts}</div>
          <div className="text-[11px] text-[#BE185D] font-bold">+5 published</div>
        </Card>

        <Card className="p-5 space-y-2 hoverable">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Reels</span>
            <Film size={16} className="text-[#EC4899]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">{activePeriod.reels}</div>
          <div className="text-[11px] text-[#BE185D] font-bold">+2 published</div>
        </Card>

        <Card className="p-5 space-y-2 hoverable">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Stories Uploads</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">{activePeriod.stories}</div>
          <div className="text-[11px] text-amber-600 font-bold">+12 posted</div>
        </Card>

        <Card className="p-5 space-y-2 hoverable">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Engagement Rate</span>
            <Heart size={16} className="text-[#F43F5E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">{activePeriod.engagement}</div>
          <div className="text-[11px] text-emerald-600 font-bold">+0.8% vs last month</div>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SVG Bar Chart: Follower Growth */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#18181B]">Follower Milestones</h3>
              <p className="text-[10px] text-[#71717A] mt-0.5">Audience metric logs for time period.</p>
            </div>
            <Badge variant="emerald" size="sm">{activePeriod.growthTotal} followers</Badge>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-2">
            {activePeriod.followersGrowth.map((d, index) => {
              const heightPercent = (d.value / maxFollowerVal) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[9px] text-[#BE185D] font-bold bg-[#FCE7F3] border border-[#FBCFE8] px-1.5 py-0.5 rounded-md">
                    {(d.value / 1000).toFixed(1)}k
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-[#EC4899] to-[#F472B6] rounded-t-xl group-hover:scale-y-[1.03] transition-all duration-200 shadow-xs shadow-[#EC4899]/10 cursor-pointer"
                    style={{ height: `${heightPercent * 0.7}%` }}
                  />
                  <span className="text-[10px] text-[#71717A] font-bold">{d.period}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Stacked Row Chart: Views by Source */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#18181B]">Traffic Distribution</h3>
              <p className="text-[10px] text-[#71717A] mt-0.5">Which channels yield the most visual interest.</p>
            </div>
            <Badge variant="pink" size="sm">{activePeriod.viewsTotal}</Badge>
          </div>

          <div className="space-y-4 pt-2">
            {/* Interactive stacked horizontal progress bar */}
            <div className="w-full h-4.5 rounded-full overflow-hidden flex bg-pink-100 shadow-inner">
              {activePeriod.viewsSource.map((s, idx) => {
                const pct = (s.val / totalSourceViews) * 100;
                return (
                  <div
                    key={idx}
                    className="h-full transition-all duration-300 hover:opacity-90 cursor-pointer"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: s.color,
                    }}
                    title={`${s.source}: ${pct.toFixed(0)}%`}
                  />
                );
              })}
            </div>

            {/* Legends list with real values */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {activePeriod.viewsSource.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-[#FFF9FC] border border-[#F3DCE8]/60">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-[#18181B] truncate">{s.source}</p>
                    <p className="text-[11px] text-[#71717A] font-extrabold">
                      {s.val.toLocaleString()} <span className="text-[9px] text-[#A1A1AA] font-bold">({((s.val / totalSourceViews) * 100).toFixed(0)}%)</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performing Content Section */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#18181B]">Performance Breakdown</h3>
            <p className="text-[10px] text-[#71717A] mt-0.5">Analyze viewer statistics for individual posts and reels.</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={13} />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] font-medium"
            />
          </div>
        </div>

        {/* scroll shadow indicator overlay container */}
        <div className="overflow-x-auto rounded-2xl border border-[#F3DCE8]/80">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#FFF9FC] border-b border-[#F3DCE8] text-[#71717A] font-bold">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4 cursor-pointer select-none group" onClick={() => toggleSort('views')}>
                  <div className="flex items-center gap-1 hover:text-[#18181B] transition-colors">
                    <span>Views</span>
                    <ArrowUpDown size={12} className="text-[#A1A1AA] group-hover:text-[#EC4899]" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer select-none group" onClick={() => toggleSort('likes')}>
                  <div className="flex items-center gap-1 hover:text-[#18181B] transition-colors">
                    <span>Likes</span>
                    <ArrowUpDown size={12} className="text-[#A1A1AA] group-hover:text-[#EC4899]" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer select-none group" onClick={() => toggleSort('comments')}>
                  <div className="flex items-center gap-1 hover:text-[#18181B] transition-colors">
                    <span>Comments</span>
                    <ArrowUpDown size={12} className="text-[#A1A1AA] group-hover:text-[#EC4899]" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3DCE8]/60">
              {filteredContent.map((c, i) => (
                <tr key={c.id} className="hover:bg-[#FFF9FC]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#18181B] max-w-[280px] truncate">{c.title}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={c.type === 'Reel' ? 'rose' : 'pink'} size="sm">
                      {c.type}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#18181B]">{c.views.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600">+{c.likes.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-[#71717A] font-medium">{c.comments} comments</td>
                </tr>
              ))}
              {filteredContent.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#71717A] font-semibold">
                    No matching post content found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
