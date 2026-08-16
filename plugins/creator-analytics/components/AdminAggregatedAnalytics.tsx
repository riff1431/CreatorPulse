'use client';

import React, { useState } from 'react';
import {
  BarChart3, Crown, Users, TrendingUp, DollarSign, Eye, Download,
  Sparkles, CheckCircle2, ShieldCheck, Film, Layers, Clock
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { AnalyticsService, TimeRange } from '../services/analytics-service';

export function AdminAggregatedAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [exportNotice, setExportNotice] = useState('');

  const adminStats = AnalyticsService.getAdminAnalytics(timeRange);

  const triggerNotice = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(''), 3500);
  };

  const handleExportAdminCSV = () => {
    const csv = AnalyticsService.generateAdminCSVReport(adminStats);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-platform-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerNotice('Downloaded System-wide Platform Analytics CSV!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#18181B] tracking-tight flex items-center gap-2">
                Platform Aggregated Analytics
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Admin Intelligence
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                System-wide creator performance, platform earnings, format distribution, and engagement metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Date Filter & Export Options */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(
              [
                ['7d', '7D'],
                ['30d', '30D'],
                ['90d', '90D'],
                ['12m', '1 Year']
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTimeRange(key)}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  timeRange === key
                    ? 'bg-white text-indigo-700 shadow-2xs border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={handleExportAdminCSV}
          >
            Export Platform CSV
          </Button>
        </div>
      </div>

      {/* Export Notice */}
      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 space-y-1.5 hoverable">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Active Creators</span>
            <Users size={15} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-[#18181B] tracking-tight">
            {adminStats.totalPlatformCreators}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">100% active verified creators</div>
        </Card>

        <Card className="p-4 space-y-1.5 hoverable">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Platform Subscribers</span>
            <Sparkles size={15} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-[#18181B] tracking-tight">
            {adminStats.totalActiveSubscribers.toLocaleString()}
          </div>
          <div className="text-[10px] text-indigo-600 font-bold">Recurring platform memberships</div>
        </Card>

        <Card className="p-4 space-y-1.5 hoverable">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Platform Views</span>
            <Eye size={15} className="text-pink-500" />
          </div>
          <div className="text-2xl font-black text-[#18181B] tracking-tight">
            {adminStats.totalPlatformViews.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">High platform audience traffic</div>
        </Card>

        <Card className="p-4 space-y-1.5 hoverable border-emerald-200 bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-700">Gross Platform GMV</span>
            <DollarSign size={15} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">
            ${adminStats.totalPlatformRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp size={11} /> Total platform revenue ({timeRange})
          </div>
        </Card>

        <Card className="p-4 space-y-1.5 hoverable">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Avg Creator Revenue</span>
            <BarChart3 size={15} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-[#18181B] tracking-tight">
            ${adminStats.avgCreatorEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500 font-bold">Average earnings per creator</div>
        </Card>
      </div>

      {/* Leaderboard & Format Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <Card className="p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#18181B] flex items-center gap-2">
                <Crown size={16} className="text-amber-500" />
                Top Performing Creator Leaderboard
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Ranked by monthly gross revenue and engagement.</p>
            </div>
            <Badge variant="amber" size="sm">Top Creators</Badge>
          </div>

          <div className="space-y-3">
            {adminStats.topPerformingCreators.map((creator) => (
              <div
                key={creator.creatorId}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center shrink-0">
                    #{creator.rank}
                  </div>
                  <img
                    src={creator.avatarUrl}
                    alt={creator.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold text-[#18181B]">{creator.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">{creator.handle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-xs font-black text-emerald-700">
                      ${creator.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Monthly revenue</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-indigo-700">{creator.subscribersCount}</div>
                    <div className="text-[10px] text-slate-400 font-medium">Subscribers</div>
                  </div>
                  <div>
                    <Badge variant="emerald" size="sm">{creator.engagementRate}% eng</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Content Format Distribution */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#18181B] flex items-center gap-2">
                <Layers size={16} className="text-indigo-600" />
                Content Format Split
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Platform view distribution by format.</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
              {adminStats.contentFormatDistribution.map((item, idx) => (
                <div
                  key={idx}
                  className="h-full transition-all duration-300 hover:opacity-90 cursor-pointer"
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  title={`${item.format}: ${item.percentage}% (${item.count.toLocaleString()} views)`}
                />
              ))}
            </div>

            <div className="space-y-2 text-xs">
              {adminStats.contentFormatDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-[#18181B] truncate">{item.format}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-slate-800">{item.count.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 ml-1">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Engagement Matrix */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-[#18181B] flex items-center gap-1.5 mb-2">
              <Clock size={13} className="text-amber-500" /> Peak Engagement Hours (UTC)
            </h4>
            <div className="flex items-end justify-between gap-1 h-16 pt-1">
              {adminStats.peakEngagementHours.map((hour, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end">
                  <div
                    className="w-full bg-indigo-500 rounded-t-md group-hover:bg-indigo-600 transition-colors"
                    style={{ height: `${hour.activityScore}%` }}
                    title={`${hour.hour}: ${hour.activityScore}% engagement level`}
                  />
                  <span className="text-[8px] text-slate-400 font-mono">{hour.hour}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
