'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Puzzle, ArrowRight } from 'lucide-react';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { AdminAggregatedAnalytics } from '@plugins/creator-analytics/components/AdminAggregatedAnalytics';

export default function AdminCreatorAnalyticsPage() {
  const { activePlugins } = usePlugins();
  const isAnalyticsPluginActive = activePlugins.some(
    (p) => p.id === 'plugin-creator-analytics' || p.slug === 'creator-analytics'
  );

  if (isAnalyticsPluginActive) {
    return <AdminAggregatedAnalytics />;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto text-2xl shadow-xs">
        <ShieldCheck size={32} />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-extrabold text-[#18181B] tracking-tight">
          Aggregated Analytics Plugin Inactive
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          The <strong>Creator Analytics &amp; Insights Add-on Plugin</strong> is currently inactive. Activate it from the Plugin Manager to view platform-wide aggregated creator metrics, gross earnings, format distributions, and system CSV reports.
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
