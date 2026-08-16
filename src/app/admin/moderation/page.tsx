'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Puzzle, ArrowRight, ShieldCheck } from 'lucide-react';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { ModerationDashboard } from '@plugins/content-moderation/components/ModerationDashboard';

export default function AdminContentModerationPage() {
  const { activePlugins } = usePlugins();

  const isModerationPluginActive = activePlugins.some(
    (p) => p.id === 'plugin-content-moderation' || p.slug === 'content-moderation'
  );

  if (isModerationPluginActive) {
    return <ModerationDashboard />;
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto text-3xl shadow-sm">
        <ShieldAlert size={38} />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[#18181B] tracking-tight">
          AI-Assisted Content Moderation Plugin Inactive
        </h2>
        <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed font-medium">
          The <strong>AI-Assisted Content Moderation Add-on Plugin</strong> is currently deactivated. Enable it from the Plugin Manager to unlock automated text toxicity scanning, image visual classifiers, video metadata anomaly detection, customizable rule engines, blocked keyword filtering, and moderation queues.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/admin/plugins"
          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition-all shadow-md"
        >
          <Puzzle size={15} /> Go to Plugin Manager <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
