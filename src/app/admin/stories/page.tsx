'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Search, Trash2, AlertCircle, Settings, Wrench, Sparkles, ShieldAlert, Check } from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { Avatar } from '@/components/admin/ui/Avatar';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { StoriesService, PluginStory } from '@/lib/services/stories-service';

export default function AdminStoriesPage() {
  const { activePlugins } = usePlugins();

  // 1. Check if stories plugin is active
  const storiesPlugin = activePlugins.find((p) => p.id === 'plugin-creator-stories');

  const [stories, setStories] = useState<PluginStory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const fetchAllStories = async () => {
    try {
      // In a real database, we would query all stories including expired ones.
      // For dual-mode simulation, we get active stories and also retrieve all stored stories.
      const all = StoriesService.getLocalDB();
      setStories(all);
    } catch (e) {
      console.error('[AdminStoriesPage] Load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (storiesPlugin) {
      fetchAllStories();
      window.addEventListener('creatorpulse_stories_updated', fetchAllStories);
      return () => window.removeEventListener('creatorpulse_stories_updated', fetchAllStories);
    }
  }, [storiesPlugin]);

  // Safe Deactivation View
  if (!storiesPlugin) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mx-auto border border-slate-200">
          <Settings className="w-10 h-10 animate-spin" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Content Moderation — Stories</h1>
          <p className="text-xs text-[#71717A] max-w-md mx-auto leading-relaxed">
            The 24-Hour Creator Stories moderator dashboard is currently inactive. Please install and enable the Stories plugin under the Plugins & Add-ons panel to activate content moderation for ephemeral updates.
          </p>
        </div>
        <div className="pt-2">
          <a href="/admin/plugins">
            <Button variant="primary" size="sm">Configure Plugins</Button>
          </a>
        </div>
      </div>
    );
  }

  const settings = storiesPlugin.settingsValues || {};
  const maxStoryDuration = Number(settings.maxDuration || 24);
  const allowedMediaTypes = String(settings.allowedTypes || 'all');
  const cleanupInterval = Number(settings.cleanupInterval || 24);

  const handleDelete = async (id: string) => {
    if (!confirm('Moderation Action: Are you sure you want to purge this story from the platform? The creator will be notified.')) return;
    
    const success = await StoriesService.deleteStory(id);
    if (success) {
      alert('Story moderated and deleted successfully!');
      fetchAllStories();
    }
  };

  const handleManualCleanup = async () => {
    setIsCleaningUp(true);
    try {
      const { purgedCount } = await StoriesService.cleanupExpiredStories();
      alert(`Cleanup execution complete. Purged ${purgedCount} expired stories from the active cache.`);
      fetchAllStories();
    } catch (e) {
      console.error(e);
    } finally {
      setIsCleaningUp(false);
    }
  };

  const now = new Date().getTime();
  const getStoryStatus = (story: PluginStory): 'active' | 'expired' => {
    return new Date(story.expiresAt).getTime() > now ? 'active' : 'expired';
  };

  const filteredStories = stories.filter((s) => {
    const status = getStoryStatus(s);
    const matchesSearch =
      s.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.creatorUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.caption || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="text-indigo-600 animate-pulse" size={22} />
            <h1 className="text-xl font-black text-[#18181B]">Content Moderation — Stories</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Monitor active, expired, and paywalled creator stories across the platform.</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Wrench size={14} />}
          onClick={handleManualCleanup}
          isLoading={isCleaningUp}
        >
          Run Auto-Cleanup Job
        </Button>
      </div>

      {/* Grid: Widgets & Settings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-slate-200 bg-white md:col-span-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Cached Stories</p>
          <h3 className="text-2xl font-black text-[#18181B] mt-1">{stories.length}</h3>
          <span className="text-[9px] text-slate-500 font-semibold block mt-1">Active + Expired Archive</span>
        </Card>
        
        <Card className="p-4 border border-slate-200 bg-white md:col-span-3">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Settings size={13} className="text-indigo-600" /> Stories Plugin Config Settings
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-bold text-slate-600">
            <div>
              <span className="text-slate-450 block font-medium">Story Expiry Limit</span>
              <span className="text-[#18181B] mt-0.5 block">{maxStoryDuration} Hours</span>
            </div>
            <div>
              <span className="text-slate-450 block font-medium">Allowed Formats</span>
              <span className="text-[#18181B] mt-0.5 block capitalize">{allowedMediaTypes}</span>
            </div>
            <div>
              <span className="text-slate-450 block font-medium">Seen Tracking</span>
              <Badge variant={settings.enableViewerTracking !== false ? 'emerald' : 'slate'} size="sm" className="mt-0.5">
                {settings.enableViewerTracking !== false ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div>
              <span className="text-slate-450 block font-medium">Paywall Check</span>
              <Badge variant={settings.requireSubscriptionForStories === true ? 'pink' : 'slate'} size="sm" className="mt-0.5">
                {settings.requireSubscriptionForStories === true ? 'Paywalled' : 'Flexible'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Moderation Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 w-full max-w-xs focus-within:border-indigo-500 shadow-xs">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search creators or captions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent focus:outline-none w-full font-medium"
          />
        </div>

        <div className="flex gap-2">
          {([
            { id: 'all', label: 'All Stories' },
            { id: 'active', label: 'Active Only' },
            { id: 'expired', label: 'Expired Only' }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Moderation Table */}
      <Card className="overflow-x-auto p-0 border border-slate-200">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-semibold">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading stories...</span>
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-semibold space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto animate-pulse" />
            <p>No stories found matching your filter criteria.</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-250 bg-slate-50 text-slate-500 text-left">
                <th className="py-3 px-4 font-bold">Creator</th>
                <th className="py-3 px-4 font-bold">Caption / Preview</th>
                <th className="py-3 px-4 font-bold">Format</th>
                <th className="py-3 px-4 font-bold">Visibility</th>
                <th className="py-3 px-4 font-bold hidden sm:table-cell">Views Count</th>
                <th className="py-3 px-4 font-bold hidden md:table-cell">Expires</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStories.map((s) => {
                const status = getStoryStatus(s);
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={s.creatorAvatar} alt={s.creatorName} size="sm" hasStory={status === 'active'} storySeen={true} />
                        <div className="text-left">
                          <p className="font-bold text-slate-900">{s.creatorName}</p>
                          <p className="text-[10px] text-slate-500">@{s.creatorUsername}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-[200px] truncate font-medium">
                      {s.caption || 'Text Status Update'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="indigo" size="sm" className="uppercase font-bold tracking-wider">{s.storyType}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={s.visibility === 'members_only' ? 'pink' : 'slate'} size="sm">
                        {s.visibility === 'members_only' ? 'VIP Only' : 'Public'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-bold hidden sm:table-cell">
                      {s.views?.length || 0} Views
                    </td>
                    <td className="py-3 px-4 text-slate-400 hidden md:table-cell font-medium">
                      {new Date(s.expiresAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={status === 'active' ? 'emerald' : 'slate'} size="sm">
                        {status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 size={13} className="text-red-600" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
