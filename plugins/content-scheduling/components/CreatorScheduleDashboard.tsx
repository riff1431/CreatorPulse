'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon, Clock, FileText, Film, Sparkles,
  Plus, CheckCircle2, AlertTriangle, RefreshCw, XCircle, Trash2,
  Globe, Play, Eye, Filter, ArrowUpRight, Check, AlertCircle, RotateCcw,
  Sliders, ShieldCheck, ChevronLeft, ChevronRight, Search
} from 'lucide-react';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import {
  SchedulingService,
  ScheduledItem,
  ContentType,
  ScheduleStatus,
  ScheduleLog
} from '../services/scheduling-service';

export const CreatorScheduleDashboard: React.FC = () => {
  const { activePlugins } = usePlugins();
  const isPluginActive = activePlugins.some(
    p => p.id === 'plugin-content-scheduling' || p.slug === 'content-scheduling'
  );

  if (!isPluginActive) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto text-2xl shadow-xs">
          <CalendarIcon size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-[#18181B] tracking-tight">
            Content Scheduling &amp; Auto-Publishing Plugin Inactive
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            The <strong>Content Scheduling Add-on Plugin</strong> is currently disabled.
            Please enable the plugin in the Plugin Manager to schedule posts, reels, and stories for automatic publishing.
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

  const [activeTab, setActiveTab] = useState<'calendar' | 'queue' | 'logs'>('calendar');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [items, setItems] = useState<ScheduledItem[]>([]);
  const [logs, setLogs] = useState<ScheduleLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduledItem | null>(null);

  // Form State
  const [contentType, setContentType] = useState<ContentType>('post');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'subscribers' | 'vip_only'>('public');
  const [unlockPrice, setUnlockPrice] = useState('0');
  const [scheduledAt, setScheduledAt] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');

  // Calendar view Month navigation
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const loadData = () => {
    setIsRefreshing(true);
    const loadedItems = SchedulingService.getItems();
    const loadedLogs = SchedulingService.getLogs();
    setItems(loadedItems);
    setLogs(loadedLogs);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    loadData();
    // Default scheduledAt to tomorrow 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const tzOffset = tomorrow.getTimezoneOffset() * 60000;
    const localISOTime = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
    setScheduledAt(localISOTime);
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setContent('');
    setMediaUrl('');
    setVisibility('public');
    setUnlockPrice('0');
    setContentType('post');
    setModalOpen(true);
  };

  const openEditModal = (item: ScheduledItem) => {
    setEditingItem(item);
    setContentType(item.contentType);
    setTitle(item.title || '');
    setContent(item.content);
    setMediaUrl(item.mediaUrl || '');
    setVisibility(item.visibility);
    setUnlockPrice(String(item.unlockPrice || 0));
    setTimezone(item.timezone || 'UTC');

    const dt = new Date(item.scheduledAt);
    const tzOffset = dt.getTimezoneOffset() * 60000;
    const localISOTime = new Date(dt.getTime() - tzOffset).toISOString().slice(0, 16);
    setScheduledAt(localISOTime);

    setModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !scheduledAt) return;

    const formattedDate = new Date(scheduledAt).toISOString();

    if (editingItem) {
      SchedulingService.updateScheduledContent(editingItem.id, {
        contentType,
        title,
        content,
        mediaUrl,
        visibility,
        unlockPrice: Number(unlockPrice),
        scheduledAt: formattedDate,
        timezone,
      });
    } else {
      SchedulingService.scheduleContent({
        contentType,
        title,
        content,
        mediaUrl,
        visibility,
        unlockPrice: Number(unlockPrice),
        scheduledAt: formattedDate,
        timezone,
      });
    }

    setModalOpen(false);
    loadData();
  };

  const handlePublishNow = (id: string) => {
    if (confirm('Are you sure you want to publish this content immediately?')) {
      SchedulingService.forcePublishNow(id);
      loadData();
    }
  };

  const handleRetry = (id: string) => {
    SchedulingService.retryFailedJob(id);
    loadData();
  };

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this scheduled item?')) {
      SchedulingService.cancelScheduledContent(id);
      loadData();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Permanently delete this scheduled item?')) {
      SchedulingService.deleteScheduledContent(id);
      loadData();
    }
  };

  const handleManualCronPulse = () => {
    const res = SchedulingService.runWorkerCronCheck();
    loadData();
    alert(`Background Worker Execution Completed:\n• Processed: ${res.processedCount}\n• Published: ${res.publishedCount}\n• Retried: ${res.retryCount}`);
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (typeFilter !== 'all' && item.contentType !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchContent = item.content.toLowerCase().includes(q);
        return matchTitle || matchContent;
      }
      return true;
    });
  }, [items, statusFilter, typeFilter, searchQuery]);

  // Queue Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const scheduled = items.filter(i => i.status === 'scheduled').length;
    const published = items.filter(i => i.status === 'published').length;
    const failed = items.filter(i => i.status === 'failed' || i.status === 'failed_retryable').length;
    const successRate = total > 0 ? Math.round((published / (published + failed || 1)) * 100) : 100;
    return { total, scheduled, published, failed, successRate };
  }, [items]);

  if (!isPluginActive) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800">Content Scheduling Plugin Inactive</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            The Content Scheduling & Auto-Publishing add-on plugin is currently deactivated on your platform.
            Enable it in Admin Plugin Management to schedule posts, reels, and stories.
          </p>
        </div>
        <Link
          href="/admin/plugins"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
        >
          <Sliders size={15} />
          Go to Plugin Management
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-pink-100/60 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📅</span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Content Schedule & Auto-Publishing
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Plugin Active
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Schedule future Posts, Video Reels & 24h Stories with timezone accuracy, queue controls & background auto-publishing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleManualCronPulse}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer border border-slate-200"
            title="Execute background worker poll check now"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Worker Pulse</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-pink-500/25 transition-all cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>Schedule Content</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scheduled Queue</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-600">{stats.scheduled}</span>
            <span className="text-xs font-semibold text-slate-400">Pending</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Published Content</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">{stats.published}</span>
            <span className="text-xs font-semibold text-emerald-600">Auto-Published</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Failed / Retries</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600">{stats.failed}</span>
            <span className="text-xs font-semibold text-rose-500">Attention Needed</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Publish Success Rate</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-800">{stats.successRate}%</span>
            <span className="text-xs font-semibold text-emerald-600">Optimal</span>
          </div>
        </div>
      </div>

      {/* Tabs & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-white text-pink-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon size={14} />
            <span>Calendar View</span>
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-white text-pink-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock size={14} />
            <span>Queue List ({items.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-white text-pink-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Worker Logs</span>
          </button>
        </div>

        {/* Filters for Queue */}
        {activeTab === 'queue' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search schedule..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-pink-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-pink-500"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="failed_retryable">Failed (Retryable)</option>
              <option value="failed">Failed (Permanent)</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-pink-500"
            >
              <option value="all">All Formats</option>
              <option value="post">Posts</option>
              <option value="reel">Reels</option>
              <option value="story">Stories</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB CONTENT: CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <CalendarIcon size={18} className="text-pink-500" />
              {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const prev = new Date(currentMonthDate);
                  prev.setMonth(prev.getMonth() - 1);
                  setCurrentMonthDate(prev);
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentMonthDate(new Date())}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const next = new Date(currentMonthDate);
                  next.setMonth(next.getMonth() + 1);
                  setCurrentMonthDate(next);
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Simple Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[11px] font-black uppercase text-slate-400 py-1">
                {d}
              </div>
            ))}

            {Array.from({ length: 35 }).map((_, idx) => {
              const year = currentMonthDate.getFullYear();
              const month = currentMonthDate.getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const dayNum = idx - firstDay + 1;
              const isCurrentMonth = dayNum > 0 && dayNum <= new Date(year, month + 1, 0).getDate();

              if (!isCurrentMonth) {
                return (
                  <div key={idx} className="min-h-[100px] bg-slate-50/50 rounded-2xl border border-slate-100/50 p-2 opacity-30" />
                );
              }

              const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayItems = items.filter(item => {
                const itemDateStr = new Date(item.scheduledAt).toISOString().split('T')[0];
                return itemDateStr === targetDateStr;
              });

              const isToday = new Date().toISOString().split('T')[0] === targetDateStr;

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] rounded-2xl border p-2 flex flex-col justify-between transition-all ${
                    isToday
                      ? 'bg-pink-50/30 border-pink-300 ring-2 ring-pink-400/20'
                      : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${isToday ? 'text-pink-600 bg-pink-100 px-1.5 py-0.5 rounded-md' : 'text-slate-700'}`}>
                      {dayNum}
                    </span>
                    {dayItems.length > 0 && (
                      <span className="text-[9px] font-extrabold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                        {dayItems.length}
                      </span>
                    )}
                  </div>

                  {/* Scheduled Badges */}
                  <div className="space-y-1 overflow-y-auto max-h-[70px] scrollbar-none my-1">
                    {dayItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => openEditModal(item)}
                        className={`p-1.5 rounded-lg text-[10px] font-bold leading-tight cursor-pointer truncate flex items-center gap-1 ${
                          item.contentType === 'reel'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                            : item.contentType === 'story'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                        }`}
                        title={`${item.title || item.content} (${new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                      >
                        {item.contentType === 'reel' && <Film size={10} className="shrink-0 text-purple-600" />}
                        {item.contentType === 'story' && <Sparkles size={10} className="shrink-0 text-amber-600" />}
                        {item.contentType === 'post' && <FileText size={10} className="shrink-0 text-indigo-600" />}
                        <span className="truncate">{item.title || item.content}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={openCreateModal}
                    className="w-full text-center text-[9px] font-bold text-slate-400 hover:text-pink-600 hover:bg-pink-50 py-0.5 rounded transition-colors cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: QUEUE LIST VIEW */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">Content & Format</th>
                  <th className="py-3.5 px-4">Creator</th>
                  <th className="py-3.5 px-4">Scheduled Publication</th>
                  <th className="py-3.5 px-4">Timezone</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                      No scheduled items found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Content Preview */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex items-start gap-3">
                          {item.mediaUrl ? (
                            <img
                              src={item.mediaUrl}
                              alt="Media"
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg ${
                              item.contentType === 'reel' ? 'bg-purple-100 text-purple-600' :
                              item.contentType === 'story' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                            }`}>
                              {item.contentType === 'reel' ? '🎬' : item.contentType === 'story' ? '📸' : '📝'}
                            </div>
                          )}
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                                item.contentType === 'reel' ? 'bg-purple-100 text-purple-700' :
                                item.contentType === 'story' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                {item.contentType}
                              </span>
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                                {item.visibility}
                              </span>
                            </div>
                            <p className="font-bold text-slate-800 truncate">{item.title || item.content}</p>
                            <p className="text-[11px] text-slate-400 truncate">{item.content}</p>
                          </div>
                        </div>
                      </td>

                      {/* Creator */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <img src={item.creatorAvatar} alt={item.creatorName} className="w-6 h-6 rounded-full" />
                          <span className="font-bold text-slate-700 truncate">{item.creatorName}</span>
                        </div>
                      </td>

                      {/* Scheduled Time */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-slate-800">
                            {new Date(item.scheduledAt).toLocaleDateString(undefined, {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                            <Clock size={11} className="text-slate-400" />
                            {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </td>

                      {/* Timezone */}
                      <td className="py-4 px-4">
                        <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-semibold">
                          {item.timezone}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          item.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          item.status === 'scheduled' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          item.status === 'failed_retryable' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          item.status === 'failed' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {item.status === 'published' && <CheckCircle2 size={12} />}
                          {item.status === 'scheduled' && <Clock size={12} />}
                          {item.status === 'failed_retryable' && <RotateCcw size={12} />}
                          {item.status === 'failed' && <AlertTriangle size={12} />}
                          <span className="capitalize">{item.status.replace('_', ' ')}</span>
                        </span>
                        {item.lastError && (
                          <p className="text-[10px] text-rose-500 font-medium truncate max-w-[140px] mt-1" title={item.lastError}>
                            {item.lastError}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === 'scheduled' && (
                            <button
                              onClick={() => handlePublishNow(item.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[11px] transition-colors cursor-pointer border border-emerald-200"
                              title="Force publish now"
                            >
                              Publish Now
                            </button>
                          )}
                          {(item.status === 'failed_retryable' || item.status === 'failed') && (
                            <button
                              onClick={() => handleRetry(item.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-[11px] transition-colors cursor-pointer border border-amber-200"
                              title="Retry publishing"
                            >
                              Retry
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Edit / Reschedule"
                          >
                            <Sliders size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
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
      )}

      {/* TAB CONTENT: WORKER LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-600" />
              Background Worker Execution Audit History
            </h2>
            <button
              onClick={loadData}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RefreshCw size={13} /> Refresh Logs
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
            {logs.map(log => (
              <div
                key={log.id}
                className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-4 font-mono ${
                  log.status === 'success' ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' :
                  log.status === 'warning' ? 'bg-amber-50/50 border-amber-200 text-amber-950' :
                  log.status === 'error' ? 'bg-rose-50/50 border-rose-200 text-rose-950' :
                  'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold uppercase px-1.5 py-0.5 rounded text-[9px] bg-white border border-current shadow-3xs">
                      {log.action}
                    </span>
                    {log.creatorName && (
                      <span className="font-semibold text-slate-600">[{log.creatorName}]</span>
                    )}
                  </div>
                  <p className="font-medium text-slate-700">{log.message}</p>
                  {log.errorDetails && (
                    <p className="text-[10px] text-rose-600 font-bold">{log.errorDetails}</p>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-sans">
                  {new Date(log.executedAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingItem ? 'Edit & Reschedule Content' : 'Schedule Content for Auto-Publishing'}
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  Select media format, target publication time and creator timezone.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer shadow-2xs"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-6 space-y-4 text-xs font-medium text-slate-700">
              {/* Content Type Tabs */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400">Content Format</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setContentType('post')}
                    className={`py-2 px-3 rounded-xl font-extrabold border text-center transition-all cursor-pointer ${
                      contentType === 'post'
                        ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    📝 Feed Post
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('reel')}
                    className={`py-2 px-3 rounded-xl font-extrabold border text-center transition-all cursor-pointer ${
                      contentType === 'reel'
                        ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🎬 Video Reel
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('story')}
                    className={`py-2 px-3 rounded-xl font-extrabold border text-center transition-all cursor-pointer ${
                      contentType === 'story'
                        ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    📸 24h Story
                  </button>
                </div>
              </div>

              {/* Title & Content */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400">Title / Headline (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Drop Lookbook 2026"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-pink-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400">Caption / Content *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write your post caption, reel description or story announcement..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-pink-500 font-medium"
                />
              </div>

              {/* Media URL & Visibility */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400">Media URL (Image / Video)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400">Audience Visibility</label>
                  <select
                    value={visibility}
                    onChange={e => setVisibility(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-pink-500 font-semibold"
                  >
                    <option value="public">🌐 Public (All Followers)</option>
                    <option value="subscribers">⭐ Subscribers Only</option>
                    <option value="vip_only">👑 VIP Tier Only</option>
                  </select>
                </div>
              </div>

              {/* Scheduled Date, Time & Timezone */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400">Publication Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-pink-500 font-mono font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400">Target Timezone *</label>
                  <select
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-pink-500 font-mono font-semibold"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">America/New_York (EST/EDT)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    <option value="Asia/Dhaka">Asia/Dhaka (BST)</option>
                    <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                  </select>
                </div>
              </div>

              {/* Timezone Converter Info Box */}
              <div className="p-3 bg-pink-50/60 rounded-2xl border border-pink-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-pink-900 font-semibold">
                  <Globe size={15} className="text-pink-500 shrink-0" />
                  <span>Selected Timezone Target: <strong className="font-mono">{timezone}</strong></span>
                </div>
                <span className="text-pink-600 font-bold bg-white px-2 py-0.5 rounded-md border border-pink-200">
                  Timezone Aware
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs shadow-md shadow-pink-600/20 cursor-pointer"
                >
                  {editingItem ? 'Save Rescheduled Item' : 'Confirm & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
