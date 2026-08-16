'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, Puzzle, Settings, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { PluginSettingsFramework } from '@/components/admin/PluginSettingsFramework';
import { Badge } from '@/components/admin/ui/Badge';

export default function PluginSettingsPage() {
  const params = useParams<{ pluginId: string }>();
  const router = useRouter();
  const { plugins } = usePlugins();

  const pluginId = decodeURIComponent(params?.pluginId ?? '');
  const plugin = plugins.find(p => p.slug === pluginId || p.id === pluginId);

  // Plugin not found — redirect
  if (!plugin) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-2xl">🔌</div>
        <h2 className="text-lg font-bold text-[#18181B]">Plugin Not Found</h2>
        <p className="text-sm text-slate-500">
          No plugin with slug <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{pluginId}</code> is currently installed.
        </p>
        <Link
          href="/admin/plugins"
          className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft size={15} /> Back to Plugins
        </Link>
      </div>
    );
  }

  // Plugin found but deactivated — warn but still show settings
  const settingsTitle = plugin.adminSettingsPage?.title ?? `${plugin.name} — Settings`;
  const settingsDesc = plugin.adminSettingsPage?.description ?? 'Configure parameters, preferences, and integrations for this plugin.';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 flex-wrap pt-2">
        <Link href="/admin/dashboard" className="hover:text-slate-700 transition-colors">Admin</Link>
        <ChevronRight size={12} className="text-slate-300" />
        <Link href="/admin/plugins" className="hover:text-slate-700 transition-colors">Plugins &amp; Add-ons</Link>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-slate-600">{plugin.name}</span>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-indigo-700">Settings</span>
      </nav>

      {/* Plugin Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 text-3xl flex items-center justify-center border border-indigo-100 shadow-xs shrink-0">
              {plugin.iconUrl}
            </div>
            <div>
              <h1 className="text-lg font-black text-[#18181B] leading-tight">{settingsTitle}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{settingsDesc}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-slate-400">By {plugin.author}</span>
                <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">v{plugin.version}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-indigo-700 border border-slate-200">
                  {plugin.category}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {plugin.isEnabled ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                <CheckCircle2 size={13} />Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
                <XCircle size={13} />Inactive
              </span>
            )}
          </div>
        </div>

        {/* Inactive warning banner */}
        {!plugin.isEnabled && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 flex items-center gap-2">
            <span>⚠️</span>
            <span>
              This plugin is currently <strong>inactive</strong>. Settings changes will take effect when the plugin is activated.
            </span>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <Settings size={16} className="text-indigo-600" />
          <h2 className="font-bold text-sm text-[#18181B]">Configuration</h2>
          {plugin.settingsSchema.length > 0 && (
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 ml-auto">
              {plugin.settingsSchema.length} field{plugin.settingsSchema.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="p-5">
          <PluginSettingsFramework
            plugin={plugin}
            onSaved={() => {
              // Optionally show a global notice
            }}
          />
        </div>
      </div>

      {/* Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/plugins"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={14} />Back to Plugin Manager
        </Link>

        <Link
          href="/admin/plugins"
          className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
        >
          <Puzzle size={13} />View All Plugins
        </Link>
      </div>
    </div>
  );
}
