'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, RefreshCw, CheckCircle2, AlertTriangle,
  RotateCcw, Sliders, ShieldCheck, Play, Trash2, Filter,
  Globe, Search, Layers, Server, Activity, ArrowUpRight
} from 'lucide-react';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import {
  SchedulingService,
  ScheduledItem,
  ScheduleLog,
  WorkerStatus
} from '../services/scheduling-service';

export const AdminScheduleQueueManager: React.FC = () => {
  const { activePlugins } = usePlugins();
  const isPluginActive = activePlugins.some(
    p => p.id === 'plugin-content-scheduling' || p.slug === 'content-scheduling'
  );

  if (!isPluginActive) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto text-2xl shadow-xs">
          <Calendar size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-[#18181B] tracking-tight">
            Content Scheduling Plugin Inactive
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            The <strong>Content Scheduling Add-on Plugin</strong> is currently disabled on this platform.
            Enable the plugin in the Plugin Manager to activate automated content queues and background worker checks.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/admin/plugins"
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl transition-all"
          >
            Go to Plugin Manager
          </Link>
        </div>
      </div>
    );
  }

  const [items, setItems] = useState<ScheduledItem[]>([]);
  const [logs, setLogs] = useState<ScheduleLog[]>([]);
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus | null>(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = () => {
    setIsProcessing(true);
    const loadedItems = SchedulingService.getItems();
    const loadedLogs = SchedulingService.getLogs();
    const status = SchedulingService.getWorkerStatus();
    setItems(loadedItems);
    setLogs(loadedLogs);
    setWorkerStatus(status);
    setTimeout(() => setIsProcessing(false), 300);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualCronTrigger = () => {
    const res = SchedulingService.runWorkerCronCheck();
    loadData();
    alert(`[Admin Trigger] Background Worker Executed:\n• Processed: ${res.processedCount}\n• Auto-Published: ${res.publishedCount}\n• Retries: ${res.retryCount}`);
  };

  const handleForcePublish = (id: string) => {
    if (confirm('Admin Override: Force publish this content to feed immediately?')) {
      SchedulingService.forcePublishNow(id);
      loadData();
    }
  };

  const handleRetryJob = (id: string) => {
    SchedulingService.retryFailedJob(id);
    loadData();
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Admin Override: Delete this scheduled item permanently?')) {
      SchedulingService.deleteScheduledContent(id);
      loadData();
    }
  };

  const filteredItems = items.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.creatorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (!isPluginActive) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-800">Content Scheduling Plugin Deactivated</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The Content Scheduling & Auto-Publishing add-on plugin is currently inactive. Activate it in the Admin Plugins Directory to manage background queues and automated worker routines.
        </p>
        <Link
          href="/admin/plugins"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          <Sliders size={14} /> Open Plugin Manager
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚡</span>
            <h1 className="text-2xl font-black tracking-tight">Admin Schedule Queue Oversight</h1>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Worker Standby
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400">
            Monitor system-wide schedule queues, background cron pulse health, failure retry limits, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer border border-slate-700"
          >
            <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
            <span>Refresh State</span>
          </button>
          <button
            onClick={handleManualCronTrigger}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95"
          >
            <Play size={14} />
            <span>Trigger Worker Cron Now</span>
          </button>
        </div>
      </div>

      {/* Worker Health Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Worker Pulse Status</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-black text-slate-800">Active (30s interval)</span>
          </div>
          <p className="text-[10px] text-slate-400">Polling for due scheduled tasks</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Queue Count</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-600">
              {items.filter(i => i.status === 'scheduled').length}
            </span>
            <span className="text-xs font-semibold text-slate-400">Platform Wide</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Retry Queue</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">
              {items.filter(i => i.status === 'failed_retryable').length}
            </span>
            <span className="text-xs font-semibold text-amber-600">Auto-Retry Pending</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Plugin Settings</p>
          <Link
            href="/admin/plugins/content-scheduling/settings"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1"
          >
            Configure Rules & Limits <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Layers size={18} className="text-indigo-600" /> Global Platform Schedule Queue
            </h2>
            <p className="text-xs text-slate-500">
              Review all scheduled content across creators, override statuses, force publish, or trigger job retries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by creator or title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="failed_retryable">Failed Retryable</option>
              <option value="failed">Failed Permanent</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-3 px-4">Creator</th>
                <th className="py-3 px-4">Format & Title</th>
                <th className="py-3 px-4">Scheduled Time</th>
                <th className="py-3 px-4">Timezone</th>
                <th className="py-3 px-4">Status & Errors</th>
                <th className="py-3 px-4 text-right">Admin Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    No items in queue matching filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <img src={item.creatorAvatar} alt={item.creatorName} className="w-7 h-7 rounded-full" />
                        <div>
                          <p className="font-bold text-slate-800">{item.creatorName}</p>
                          <p className="text-[10px] text-slate-400">@{item.creatorUsername}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {item.contentType}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">{item.visibility}</span>
                        </div>
                        <p className="font-bold text-slate-800 truncate">{item.title || item.content}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <p className="font-bold text-slate-800">
                        {new Date(item.scheduledAt).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                        {item.timezone}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        item.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.status === 'scheduled' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        item.status === 'failed_retryable' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        item.status === 'failed' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        <span className="capitalize">{item.status.replace('_', ' ')}</span>
                      </span>
                      {item.lastError && (
                        <p className="text-[10px] text-rose-600 font-bold truncate max-w-[150px] mt-0.5" title={item.lastError}>
                          {item.lastError}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status !== 'published' && (
                          <button
                            onClick={() => handleForcePublish(item.id)}
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[10px] transition-colors border border-emerald-200"
                          >
                            Force Publish
                          </button>
                        )}
                        {(item.status === 'failed_retryable' || item.status === 'failed') && (
                          <button
                            onClick={() => handleRetryJob(item.id)}
                            className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-[10px] transition-colors border border-amber-200"
                          >
                            Retry Job
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
