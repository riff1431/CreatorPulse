'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users, Star, Eye, DollarSign, TrendingUp, Clock,
  Sparkles, ArrowRight, PlusSquare, Wallet, Radio, ArrowUpRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Sparkline } from '@/components/ui/Sparkline';
import { HookPoint } from '@/lib/extensions/plugin-engine';
import { PluginSlot } from '@/lib/extensions/plugin-slot';

const periodData = {
  '7d': {
    followers: { total: '14,280', growth: '+320', rate: '2.3%', spark: [13960, 14020, 14100, 14150, 14200, 14250, 14280] },
    subscribers: { total: '840', growth: '+28', rate: '3.4%', spark: [812, 815, 820, 825, 830, 836, 840] },
    views: { total: '32.1k', growth: '+4,200', rate: '15.1%', spark: [4100, 4300, 3900, 4500, 4800, 5200, 5300] },
    revenue: { total: '$1,350', growth: '+12.4%', rate: 'up', spark: [150, 180, 160, 210, 190, 220, 240] },
    chartData: [
      { label: 'Mon', value: 150 },
      { label: 'Tue', value: 180 },
      { label: 'Wed', value: 160 },
      { label: 'Thu', value: 210 },
      { label: 'Fri', value: 190 },
      { label: 'Sat', value: 220 },
      { label: 'Sun', value: 240 },
    ]
  },
  '30d': {
    followers: { total: '14,280', growth: '+1,480', rate: '11.5%', spark: [12800, 13100, 13500, 13800, 14000, 14150, 14280] },
    subscribers: { total: '840', growth: '+112', rate: '15.4%', spark: [728, 745, 760, 785, 805, 820, 840] },
    views: { total: '128.4k', growth: '+18.5k', rate: '16.8%', spark: [28000, 31000, 33500, 36000, 32000, 35000, 36400] },
    revenue: { total: '$5,200', growth: '+15.6%', rate: 'up', spark: [2800, 3200, 3900, 4100, 3700, 4500, 5200] },
    chartData: [
      { label: 'Week 1', value: 1100 },
      { label: 'Week 2', value: 1300 },
      { label: 'Week 3', value: 1200 },
      { label: 'Week 4', value: 1600 },
    ]
  },
  '90d': {
    followers: { total: '14,280', growth: '+4,820', rate: '50.9%', spark: [9460, 10200, 11400, 12100, 12900, 13600, 14280] },
    subscribers: { total: '840', growth: '+310', rate: '58.5%', spark: [530, 580, 640, 690, 740, 790, 840] },
    views: { total: '384.2k', growth: '+56.2k', rate: '17.1%', spark: [110000, 118000, 125000, 132000, 121000, 138000, 140200] },
    revenue: { total: '$14,600', growth: '+22.4%', rate: 'up', spark: [3800, 4200, 4500, 4800, 5100, 5400, 5800] },
    chartData: [
      { label: 'Jun', value: 4100 },
      { label: 'Jul', value: 4800 },
      { label: 'Aug', value: 5700 },
    ]
  }
};

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

export function CreatorDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);

  const activeData = periodData[selectedPeriod];
  const maxChartVal = Math.max(...activeData.chartData.map((d) => d.value));

  const graphWidth = 500;
  const graphHeight = 160;
  const padding = 20;

  const points = activeData.chartData.map((d, index) => {
    const x = padding + (index / (activeData.chartData.length - 1)) * (graphWidth - padding * 2);
    const y = graphHeight - padding - (d.value / maxChartVal) * (graphHeight - padding * 2 - 20);
    return { x, y, label: d.label, val: d.value };
  });

  const pathLine = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const pathArea = `${pathLine} L ${points[points.length - 1].x} ${graphHeight - padding} L ${points[0].x} ${graphHeight - padding} Z`;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#EC4899] animate-pulse" size={22} />
            <h1 className="text-xl font-black text-[#18181B] tracking-tight">Creator Dashboard</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Revenue overview, audience growth, and content performance.</p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-white/70 p-1 rounded-2xl border border-[#F3DCE8] self-start sm:self-auto shadow-xs">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedPeriod === period
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]/50'
              }`}
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Followers Card */}
        <Card className="p-5 flex flex-col justify-between min-h-36 hoverable">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-[#71717A]">
              <span className="font-bold uppercase tracking-wider">Followers</span>
              <div className="p-1.5 rounded-lg bg-pink-50 text-[#EC4899]"><Users size={14} /></div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">{activeData.followers.total}</div>
          </div>
          <div className="flex items-end justify-between pt-2">
            <div className="text-[11px] font-bold text-[#BE185D] flex items-center gap-0.5">
              <ArrowUpRight size={12} /> {activeData.followers.growth} ({activeData.followers.rate})
            </div>
            <Sparkline data={activeData.followers.spark} width={70} height={20} />
          </div>
        </Card>

        {/* Subscribers Card */}
        <Card className="p-5 flex flex-col justify-between min-h-36 hoverable">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-[#71717A]">
              <span className="font-bold uppercase tracking-wider">Subscribers</span>
              <div className="p-1.5 rounded-lg bg-pink-50 text-[#EC4899]"><Star size={14} /></div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">{activeData.subscribers.total}</div>
          </div>
          <div className="flex items-end justify-between pt-2">
            <div className="text-[11px] font-bold text-[#BE185D] flex items-center gap-0.5">
              <ArrowUpRight size={12} /> {activeData.subscribers.growth} ({activeData.subscribers.rate})
            </div>
            <Sparkline data={activeData.subscribers.spark} width={70} height={20} color="#BE185D" fillColor="rgba(190, 24, 93, 0.1)" />
          </div>
        </Card>

        {/* Profile Views Card */}
        <Card className="p-5 flex flex-col justify-between min-h-36 hoverable">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-[#71717A]">
              <span className="font-bold uppercase tracking-wider">Profile Views</span>
              <div className="p-1.5 rounded-lg bg-pink-50 text-[#EC4899]"><Eye size={14} /></div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">{activeData.views.total}</div>
          </div>
          <div className="flex items-end justify-between pt-2">
            <div className="text-[11px] font-bold text-[#BE185D] flex items-center gap-0.5">
              <ArrowUpRight size={12} /> {activeData.views.growth} ({activeData.views.rate})
            </div>
            <Sparkline data={activeData.views.spark} width={70} height={20} />
          </div>
        </Card>

        {/* Revenue Card */}
        <Card className="p-5 flex flex-col justify-between min-h-36 hoverable">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-[#71717A]">
              <span className="font-bold uppercase tracking-wider">Revenue</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><DollarSign size={14} /></div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">{activeData.revenue.total}</div>
          </div>
          <div className="flex items-end justify-between pt-2">
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight size={12} /> {activeData.revenue.growth} growth
            </div>
            <Sparkline data={activeData.revenue.spark} width={70} height={20} color="#059669" fillColor="rgba(5, 150, 105, 0.1)" />
          </div>
        </Card>

        {/* Lifetime Earnings Card */}
        <Card className="p-5 flex flex-col justify-between min-h-36 hoverable">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-[#71717A]">
              <span className="font-bold uppercase tracking-wider">Lifetime Earnings</span>
              <div className="p-1.5 rounded-lg bg-pink-50 text-[#EC4899]"><TrendingUp size={14} /></div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">$34,500</div>
          </div>
          <div className="flex items-end justify-between pt-2">
            <div className="text-[11px] font-medium text-[#71717A]">
              Total payout cleared
            </div>
            <Sparkline data={[28000, 29000, 30500, 32000, 32800, 33600, 34500]} width={70} height={20} />
          </div>
        </Card>

        {/* Pending Payout Card */}
        <Card className="p-5 flex flex-col justify-between min-h-36 hoverable">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-[#71717A]">
              <span className="font-bold uppercase tracking-wider">Pending Release</span>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><Clock size={14} /></div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">$1,200</div>
          </div>
          <div className="flex items-end justify-between pt-2">
            <div className="text-[11px] font-bold text-amber-600">
              Clearance in 4 days
            </div>
            <Sparkline data={[800, 950, 1100, 1050, 1200, 1150, 1200]} width={70} height={20} color="#D97706" fillColor="rgba(217, 119, 6, 0.1)" />
          </div>
        </Card>
      </div>

      {/* Main Grid: Charts and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Interactive Chart Card */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#18181B]">Earnings Trend</h3>
              <p className="text-[10px] text-[#71717A] mt-0.5">Visualize your cash flow increments over the period.</p>
            </div>
            <Badge variant="emerald" size="sm">+{activeData.revenue.growth} Growth</Badge>
          </div>

          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${graphWidth} ${graphHeight}`}
              width="100%"
              height="100%"
              className="overflow-visible select-none"
            >
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padding + ratio * (graphHeight - padding * 2 - 20);
                return (
                  <line
                    key={ratio}
                    x1={padding}
                    y1={y}
                    x2={graphWidth - padding}
                    y2={y}
                    stroke="#F3DCE8"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                );
              })}

              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EC4899" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#EC4899" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              <path d={pathArea} fill="url(#chartGradient)" />

              <path
                d={pathLine}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#BE185D" />
                </linearGradient>
              </defs>

              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredChartIndex === idx ? 5 : 3.5}
                    fill={hoveredChartIndex === idx ? '#BE185D' : '#EC4899'}
                    stroke="white"
                    strokeWidth={1.5}
                    className="transition-all duration-150"
                  />
                  <rect
                    x={p.x - 20}
                    y={padding}
                    width={40}
                    height={graphHeight - padding * 2}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredChartIndex(idx)}
                    onMouseLeave={() => setHoveredChartIndex(null)}
                  />
                </g>
              ))}

              {points.map((p, idx) => (
                <text
                  key={idx}
                  x={p.x}
                  y={graphHeight - 4}
                  textAnchor="middle"
                  fill="#71717A"
                  fontSize={8}
                  fontWeight="bold"
                >
                  {p.label}
                </text>
              ))}
            </svg>

            {hoveredChartIndex !== null && (
              <div
                className="absolute bg-white/95 border border-[#F3DCE8] p-2 rounded-xl shadow-md text-[10px] space-y-0.5 z-10 font-bold text-[#18181B]"
                style={{
                  left: `${(points[hoveredChartIndex].x / graphWidth) * 100}%`,
                  top: `${(points[hoveredChartIndex].y / graphHeight) * 100 - 32}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <span className="text-[#EC4899] block font-black">${points[hoveredChartIndex].val}</span>
                <span className="text-[#A1A1AA] text-[8px] font-semibold">{points[hoveredChartIndex].label}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#18181B]">Quick Actions</h3>
            <p className="text-[10px] text-[#71717A] mt-0.5">Frequent creator studio shortcuts.</p>
          </div>
          <div className="space-y-3">
            <Link href="/creator/posts">
              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] hover:border-[#F472B6] hover:bg-[#FFF1F7] transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FCE7F3] flex items-center justify-center text-[#EC4899] font-bold"><PlusSquare size={16} /></div>
                  <div>
                    <p className="text-xs font-black text-[#18181B]">Create New Post</p>
                    <p className="text-[9px] text-[#71717A] font-semibold">Publish text, image, poll</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#A1A1AA] group-hover:text-[#EC4899] transition-colors" />
              </div>
            </Link>

            <Link href="/creator/reels">
              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] hover:border-[#F472B6] hover:bg-[#FFF1F7] transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FCE7F3] flex items-center justify-center text-[#EC4899] font-bold"><Radio size={16} /></div>
                  <div>
                    <p className="text-xs font-black text-[#18181B]">Upload Reel</p>
                    <p className="text-[9px] text-[#71717A] font-semibold">Short full-screen video reels</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#A1A1AA] group-hover:text-[#EC4899] transition-colors" />
              </div>
            </Link>

            <Link href="/creator/payouts">
              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] hover:border-[#F472B6] hover:bg-[#FFF1F7] transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FCE7F3] flex items-center justify-center text-[#EC4899] font-bold"><Wallet size={16} /></div>
                  <div>
                    <p className="text-xs font-black text-[#18181B]">Request Payout</p>
                    <p className="text-[9px] text-[#71717A] font-semibold">Transfer available balance</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#A1A1AA] group-hover:text-[#EC4899] transition-colors" />
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* Dynamic Plugin Widgets Hook Point & Standard SDK Plugin Slots */}
      <HookPoint name="creator_dashboard_widgets" className="space-y-4" />
      <PluginSlot hook="dashboard_widget" className="mt-4" />

      {/* Row 3: Recent Subscribers & Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#18181B]">Recent Subscribers</h3>
              <p className="text-[10px] text-[#71717A] mt-0.5">Newly subscribed fans and members.</p>
            </div>
            <Link href="/creator/subscribers">
              <Button variant="ghost" size="sm" className="text-[#EC4899] text-xs font-bold">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentSubscribers.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs p-2.5 rounded-xl border border-[#F3DCE8]/50 hover:bg-[#FFF9FC] transition-all">
                <div className="flex items-center gap-3">
                  <Avatar src={s.avatar} alt={s.name} size="sm" />
                  <div>
                    <p className="font-bold text-[#18181B]">{s.name}</p>
                    <p className="text-[10px] text-[#BE185D] font-semibold">{s.plan}</p>
                  </div>
                </div>
                <span className="text-[#A1A1AA] font-bold text-[10px]">{s.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#18181B]">Top Performing Posts</h3>
              <p className="text-[10px] text-[#71717A] mt-0.5">Most views and comments this period.</p>
            </div>
            <Link href="/creator/analytics">
              <Button variant="ghost" size="sm" className="text-[#EC4899] text-xs font-bold">Analytics</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {topPosts.map((p) => (
              <div key={p.title} className="flex items-center justify-between text-xs p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] hover:border-[#F472B6]/50 transition-all">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-extrabold text-[#18181B] truncate">{p.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-[#71717A] font-bold">
                    <span>{p.views.toLocaleString()} views</span>
                    <span>•</span>
                    <span>{p.likes} likes</span>
                  </div>
                </div>
                <Badge variant="pink" size="sm">{p.type}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CreatorDashboardPage;
