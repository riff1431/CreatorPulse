'use client';

import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, Users, Heart, Eye, DollarSign,
  Download, Search, ArrowUpDown, Filter, Sparkles, Film,
  Clock, Share2, MessageSquare, Printer, CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AnalyticsService, TimeRange } from '../services/analytics-service';

export function CreatorAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<'views' | 'likes' | 'revenue' | 'engagementRate'>('views');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [exportNotice, setExportNotice] = useState('');

  const analytics = AnalyticsService.getCreatorAnalytics(timeRange);

  const triggerNotice = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(''), 3500);
  };

  const handleExportCSV = () => {
    const csv = AnalyticsService.generateCSVReport(analytics);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creator-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerNotice('Downloaded CSV analytics report!');
  };

  const handleExportJSON = () => {
    const json = AnalyticsService.generateJSONReport(analytics);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creator-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerNotice('Downloaded JSON analytics report!');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const filteredContent = analytics.contentSummary.items
    .filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      return sortDirection === 'desc' ? (valB as number) - (valA as number) : (valA as number) - (valB as number);
    });

  const toggleSort = (key: 'views' | 'likes' | 'revenue' | 'engagementRate') => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const maxFollowerVal = Math.max(...analytics.followers.history.map((d) => d.followers), 1);
  const maxRevenueVal = Math.max(...analytics.revenue.history.map((d) => d.total), 1);
  const totalSourceViews = analytics.profileViews.sources.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#EC4899] flex items-center justify-center font-bold shadow-xs">
              <BarChart3 size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#18181B] tracking-tight flex items-center gap-2">
                Creator Analytics &amp; Insights
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-[#BE185D] border border-pink-200">
                  Add-on Plugin
                </span>
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5 font-medium">
                Detailed profile metrics, follower growth, post/reel/story engagement, and revenue performance.
              </p>
            </div>
          </div>
        </div>

        {/* Date Filter & Export Options */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(
              [
                ['7d', '7 Days'],
                ['30d', '30 Days'],
                ['90d', '90 Days'],
                ['12m', '1 Year']
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTimeRange(key)}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  timeRange === key
                    ? 'bg-white text-[#BE185D] shadow-2xs border border-pink-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Download size={13} /> CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Download size={13} /> JSON
            </button>
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Printer size={13} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Export Notice Banner */}
      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4 space-y-1.5 hoverable">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Profile Views</span>
            <Eye size={15} className="text-[#EC4899]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
            {analytics.profileViews.total.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp size={11} /> +{analytics.profileViews.changePercent}% vs prev
          </div>
        </Card>

        <Card className="p-4 space-y-1.5 hoverable">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Followers</span>
            <Users size={15} className="text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
            {analytics.followers.totalFollowers.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">
            +{analytics.followers.netGrowth} net growth
          </div>
        </Card>

        <Card className="p-4 space-y-1.5 hoverable">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Active Subscribers</span>
            <Sparkles size={15} className="text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
            {analytics.followers.totalSubscribers.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-bold">
            {analytics.followers.subscriberChurnRate}% churn rate
          </div>
        </Card>

        <Card className="p-4 space-y-1.5 hoverable">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Content Views</span>
            <Film size={15} className="text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
            {analytics.contentSummary.totalViews.toLocaleString()}
          </div>
          <div className="text-[10px] text-rose-600 font-bold">
            {analytics.contentSummary.totalPosts + analytics.contentSummary.totalReels} published
          </div>
        </Card>

        <Card className="p-4 space-y-1.5 hoverable">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Avg Engagement</span>
            <Heart size={15} className="text-red-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
            {analytics.contentSummary.avgEngagementRate}%
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">High interaction score</div>
        </Card>

        <Card className="p-4 space-y-1.5 hoverable border-pink-200 bg-gradient-to-br from-white to-pink-50/30">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#BE185D]">Total Earnings</span>
            <DollarSign size={15} className="text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#BE185D] tracking-tight">
            ${analytics.revenue.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp size={11} /> +{analytics.revenue.changePercent}% period growth
          </div>
        </Card>
      </div>

      {/* Main Interactive SVG Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SVG Chart 1: Follower Growth */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#18181B] flex items-center gap-2">
                <Users size={16} className="text-indigo-600" />
                Follower &amp; Subscriber Milestones
              </h3>
              <p className="text-[10px] text-[#71717A] mt-0.5">Audience metric logs for {timeRange}.</p>
            </div>
            <Badge variant="indigo" size="sm">
              +{analytics.followers.netGrowth} new followers
            </Badge>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-slate-100 pb-2">
            {analytics.followers.history.map((d, index) => {
              const heightPercent = (d.followers / maxFollowerVal) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[9px] text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                    {(d.followers / 1000).toFixed(1)}k
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl group-hover:scale-y-[1.02] transition-all duration-200 shadow-xs cursor-pointer"
                    style={{ height: `${Math.max(heightPercent * 0.75, 8)}%` }}
                  />
                  <span className="text-[10px] text-[#71717A] font-bold">{d.period}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* SVG Chart 2: Revenue Channels Breakdown */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#18181B] flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-600" />
                Revenue Channels Trend
              </h3>
              <p className="text-[10px] text-[#71717A] mt-0.5">Earnings breakdown from subscriptions, tips, and PPV.</p>
            </div>
            <Badge variant="emerald" size="sm">
              ${analytics.revenue.totalRevenue.toFixed(2)} total
            </Badge>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-slate-100 pb-2">
            {analytics.revenue.history.map((r, index) => {
              const heightPercent = (r.total / maxRevenueVal) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[9px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                    ${r.total}
                  </span>
                  <div className="w-full flex flex-col-reverse rounded-t-xl overflow-hidden cursor-pointer" style={{ height: `${Math.max(heightPercent * 0.75, 8)}%` }}>
                    <div
                      style={{ height: `${(r.subscriptions / r.total) * 100}%` }}
                      className="w-full bg-emerald-500"
                      title={`Subscriptions: $${r.subscriptions}`}
                    />
                    <div
                      style={{ height: `${(r.tips / r.total) * 100}%` }}
                      className="w-full bg-amber-400"
                      title={`Tips: $${r.tips}`}
                    />
                    <div
                      style={{ height: `${(r.payPerView / r.total) * 100}%` }}
                      className="w-full bg-rose-400"
                      title={`PPV: $${r.payPerView}`}
                    />
                  </div>
                  <span className="text-[10px] text-[#71717A] font-bold">{r.period}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-around text-xs pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold text-slate-700">Subscriptions (${analytics.revenue.subscriptionsTotal})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-[11px] font-bold text-slate-700">Tips (${analytics.revenue.tipsTotal})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="text-[11px] font-bold text-slate-700">PPV (${analytics.revenue.ppvTotal})</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Traffic Distribution Row */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#18181B]">Profile &amp; Content Traffic Distribution</h3>
            <p className="text-[10px] text-[#71717A] mt-0.5">Dissecting viewer acquisition channels.</p>
          </div>
          <Badge variant="pink" size="sm">
            {totalSourceViews.toLocaleString()} views total
          </Badge>
        </div>

        <div className="space-y-4 pt-1">
          <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
            {analytics.profileViews.sources.map((s, idx) => (
              <div
                key={idx}
                className="h-full transition-all duration-300 hover:opacity-90 cursor-pointer"
                style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
                title={`${s.source}: ${s.percentage}% (${s.count.toLocaleString()} views)`}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {analytics.profileViews.sources.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-[#18181B] truncate">{s.source}</p>
                  <p className="text-xs text-slate-600 font-extrabold">
                    {s.count.toLocaleString()}{' '}
                    <span className="text-[10px] text-slate-400 font-bold">({s.percentage}%)</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Top Content Breakdown Table */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#18181B]">Top Performing Content Breakdown</h3>
            <p className="text-[10px] text-[#71717A] mt-0.5">Detailed metrics for posts, reels, and stories.</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search by title or format..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-[#18181B] placeholder-slate-400 focus:outline-none focus:border-pink-500 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">Content Title</th>
                <th className="py-3 px-4">Format</th>
                <th
                  className="py-3 px-4 cursor-pointer select-none group"
                  onClick={() => toggleSort('views')}
                >
                  <div className="flex items-center gap-1 hover:text-[#18181B] transition-colors">
                    <span>Views</span>
                    <ArrowUpDown size={12} className="text-slate-400 group-hover:text-pink-600" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer select-none group"
                  onClick={() => toggleSort('likes')}
                >
                  <div className="flex items-center gap-1 hover:text-[#18181B] transition-colors">
                    <span>Likes &amp; Comments</span>
                    <ArrowUpDown size={12} className="text-slate-400 group-hover:text-pink-600" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer select-none group"
                  onClick={() => toggleSort('engagementRate')}
                >
                  <div className="flex items-center gap-1 hover:text-[#18181B] transition-colors">
                    <span>Engagement</span>
                    <ArrowUpDown size={12} className="text-slate-400 group-hover:text-pink-600" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer select-none group"
                  onClick={() => toggleSort('revenue')}
                >
                  <div className="flex items-center gap-1 hover:text-[#18181B] transition-colors">
                    <span>Revenue</span>
                    <ArrowUpDown size={12} className="text-slate-400 group-hover:text-pink-600" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContent.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#18181B] max-w-[320px]">
                    <div className="truncate">{c.title}</div>
                    <span className="text-[10px] text-slate-400 font-normal">Published on {c.publishedAt}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={c.type === 'Reel' ? 'rose' : c.type === 'Story' ? 'amber' : 'indigo'}
                      size="sm"
                    >
                      {c.type}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#18181B]">{c.views.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-emerald-600">+{c.likes.toLocaleString()} likes</span>
                    <div className="text-[10px] text-slate-400">{c.comments} comments</div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-indigo-700">{c.engagementRate}%</td>
                  <td className="py-3.5 px-4 font-black text-emerald-700">
                    ${c.revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
              {filteredContent.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-semibold">
                    No matching content found for search filter.
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
