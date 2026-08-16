'use client';

import React from 'react';
import Link from 'next/link';
import { BarChart3, AlertCircle, Puzzle, ArrowRight } from 'lucide-react';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { CreatorAnalyticsDashboard } from '@plugins/creator-analytics/components/CreatorAnalyticsDashboard';

export default function CreatorAnalyticsPage() {
  const { activePlugins } = usePlugins();
  const isAnalyticsPluginActive = activePlugins.some(
    (p) => p.id === 'plugin-creator-analytics' || p.slug === 'creator-analytics'
  );

  if (isAnalyticsPluginActive) {
    return <CreatorAnalyticsDashboard />;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto text-2xl shadow-xs">
        <BarChart3 size={32} />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-extrabold text-[#18181B] tracking-tight">
          Creator Analytics &amp; Insights Plugin Inactive
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          The <strong>Creator Analytics &amp; Insights Add-on Plugin</strong> is currently disabled on this platform.
          Please contact your administrator or enable the plugin in the Plugin Manager to unlock detailed profile view tracking, follower growth trends, revenue analytics, and CSV exports.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/admin/plugins"
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl transition-all shadow-2xs"
        >
          <Puzzle size={15} /> Go to Plugin Manager <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
