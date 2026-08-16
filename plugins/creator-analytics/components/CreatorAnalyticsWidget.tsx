'use client';

import React from 'react';
import Link from 'next/link';
import { BarChart3, TrendingUp, Eye, DollarSign, ArrowRight } from 'lucide-react';
import { AnalyticsService } from '../services/analytics-service';

export function CreatorAnalyticsWidget() {
  const analytics = AnalyticsService.getCreatorAnalytics('30d');

  return (
    <div className="bg-gradient-to-br from-white to-pink-50/40 border border-pink-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pink-100 text-[#EC4899] flex items-center justify-center font-bold shadow-4xs">
            <BarChart3 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#18181B] flex items-center gap-1.5">
              Creator Analytics Summary
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-[#BE185D]">
                Add-on
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Last 30 days performance snapshot</p>
          </div>
        </div>

        <Link
          href="/creator/analytics"
          className="text-xs font-bold text-[#BE185D] hover:text-[#EC4899] flex items-center gap-1 transition-colors"
        >
          Full Studio <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="p-3 bg-white border border-pink-100 rounded-xl">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Profile Views</span>
          <span className="text-base font-black text-[#18181B] block mt-0.5">
            {analytics.profileViews.total.toLocaleString()}
          </span>
          <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
            <TrendingUp size={9} /> +{analytics.profileViews.changePercent}%
          </span>
        </div>

        <div className="p-3 bg-white border border-pink-100 rounded-xl">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Follower Growth</span>
          <span className="text-base font-black text-indigo-700 block mt-0.5">
            +{analytics.followers.netGrowth}
          </span>
          <span className="text-[9px] font-bold text-slate-500 block mt-0.5">
            {analytics.followers.totalFollowers.toLocaleString()} total
          </span>
        </div>

        <div className="p-3 bg-white border border-pink-100 rounded-xl">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Earnings</span>
          <span className="text-base font-black text-emerald-700 block mt-0.5">
            ${analytics.revenue.totalRevenue.toFixed(0)}
          </span>
          <span className="text-[9px] font-bold text-emerald-600 block mt-0.5">
            +{analytics.revenue.changePercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
