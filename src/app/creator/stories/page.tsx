'use client';

import React, { useState, useEffect } from 'react';
import { Clock, PlusSquare, Trash2, Eye, AlertCircle, Settings, X, Plus, Sparkles, MessageSquare, Heart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/auth/auth-context';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { StoriesService, PluginStory, StoryViewer, StoryReaction, StoryReply } from '@/lib/services/stories-service';

export default function CreatorStoriesPage() {
  const { user } = useAuth();
  const { activePlugins } = usePlugins();

  // 1. Check if stories plugin is active
  const storiesPlugin = activePlugins.find((p) => p.id === 'plugin-creator-stories');

  const [stories, setStories] = useState<PluginStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<PluginStory | null>(null);
  const [showAddStory, setShowAddStory] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');

  // New Story Form State
  const [newCaption, setNewCaption] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600');
  const [newStoryType, setNewStoryType] = useState<'image' | 'video' | 'text'>('image');
  const [newTextGradient, setNewTextGradient] = useState('linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)');
  const [newVisibility, setNewVisibility] = useState<'public' | 'members_only'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCreatorStories = async () => {
    if (!user) return;
    try {
      const all = await StoriesService.getCreatorStories(user.id);
      setStories(all);
      // Sync selectedStory state if open
      if (selectedStory) {
        const fresh = all.find(s => s.id === selectedStory.id);
        if (fresh) setSelectedStory(fresh);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (storiesPlugin && user) {
      fetchCreatorStories();
    }
  }, [storiesPlugin, user]);

  // Safe Deactivation View
  if (!storiesPlugin) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mx-auto border border-pink-200">
          <Settings className="w-10 h-10 animate-spin" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Creator Stories Plugin Inactive</h1>
          <p className="text-xs text-[#71717A] max-w-md mx-auto leading-relaxed">
            The 24-Hour Creator Stories features are currently deactivated. Please ask the administrator to install and activate this add-on inside the plugin marketplace.
          </p>
        </div>
        <div className="pt-2">
          <a href="/admin/plugins">
            <Button variant="primary" size="sm">Go to Plugin Manager</Button>
          </a>
        </div>
      </div>
    );
  }

  const settings = storiesPlugin.settingsValues || {};
  const maxStoryDuration = Number(settings.maxDuration || 24);

  const now = new Date().getTime();
  const activeStories = stories.filter(s => new Date(s.expiresAt).getTime() > now);
  const expiredStories = stories.filter(s => new Date(s.expiresAt).getTime() <= now);

  const displayedStories = activeTab === 'active' ? activeStories : expiredStories;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this story? This action is permanent.')) return;
    
    const success = await StoriesService.deleteStory(id);
    if (success) {
      if (selectedStory?.id === id) {
        setSelectedStory(null);
      }
      fetchCreatorStories();
    }
  };

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await StoriesService.createStory({
        creatorId: user.id,
        creatorName: user.fullName || 'Sarah Jenkins',
        creatorUsername: user.username || 'sarahdesign',
        creatorAvatar: user.avatarUrl || '',
        mediaUrl: newStoryType === 'text' ? '' : newMediaUrl,
        caption: newCaption,
        storyType: newStoryType,
        textBgGradient: newStoryType === 'text' ? newTextGradient : undefined,
        visibility: newVisibility
      }, maxStoryDuration);

      setNewCaption('');
      setShowAddStory(false);
      fetchCreatorStories();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTimeRemaining = (expiresAtStr: string) => {
    const expiresAt = new Date(expiresAtStr).getTime();
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (3600 * 1000));
    const mins = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours}h ${mins}m remaining`;
    }
    return `${mins}m remaining`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="text-[#EC4899]" size={22} />
            <h1 className="text-xl font-black text-[#18181B]">Creator Story Studio</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Publish, analyze, and manage your 24-hour ephemeral status updates.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<PlusSquare size={14} />} onClick={() => setShowAddStory(true)}>
          New Story
        </Button>
      </div>

      {/* Stats Cards Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between border border-[#F3DCE8]">
          <div>
            <p className="text-[10px] text-[#71717A] uppercase font-black tracking-wider">Active Stories</p>
            <h3 className="text-2xl font-black text-[#18181B] mt-1">{activeStories.length}</h3>
          </div>
          <Badge variant="emerald" size="sm">Active</Badge>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-[#F3DCE8]">
          <div>
            <p className="text-[10px] text-[#71717A] uppercase font-black tracking-wider">Total Views</p>
            <h3 className="text-2xl font-black text-[#18181B] mt-1">
              {stories.reduce((acc, s) => acc + (s.views?.length || 0), 0)}
            </h3>
          </div>
          <Badge variant="indigo" size="sm">Insight</Badge>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-[#F3DCE8]">
          <div>
            <p className="text-[10px] text-[#71717A] uppercase font-black tracking-wider">Engagement Responses</p>
            <h3 className="text-2xl font-black text-[#18181B] mt-1">
              {stories.reduce((acc, s) => acc + (s.reactions?.length || 0) + (s.replies?.length || 0), 0)}
            </h3>
          </div>
          <Badge variant="pink" size="sm">Direct</Badge>
        </Card>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[#F3DCE8] text-xs font-bold gap-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-2 px-1 border-b-2 transition-all cursor-pointer ${
            activeTab === 'active' ? 'border-[#EC4899] text-[#EC4899]' : 'border-transparent text-[#71717A]'
          }`}
        >
          Active Stories ({activeStories.length})
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`pb-2 px-1 border-b-2 transition-all cursor-pointer ${
            activeTab === 'expired' ? 'border-[#EC4899] text-[#EC4899]' : 'border-transparent text-[#71717A]'
          }`}
        >
          Archive (Expired) ({expiredStories.length})
        </button>
      </div>

      {/* Main Layout (Table & Insight Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Stories list */}
        <Card className="lg:col-span-2 p-0 overflow-x-auto border border-[#F3DCE8]">
          {displayedStories.length === 0 ? (
            <div className="p-12 text-center text-[#71717A] font-semibold space-y-2">
              <AlertCircle className="w-8 h-8 text-[#A1A1AA] mx-auto animate-pulse" />
              <p>No stories found in this section.</p>
              {activeTab === 'active' && (
                <button onClick={() => setShowAddStory(true)} className="text-[#EC4899] text-xs underline cursor-pointer">
                  Publish your first story now!
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] text-left">
                  <th className="py-3 px-4 font-bold">Story Preview</th>
                  <th className="py-3 px-4 font-bold">Visibility</th>
                  <th className="py-3 px-4 font-bold">Views</th>
                  <th className="py-3 px-4 font-bold">Expires In</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3DCE8]">
                {displayedStories.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedStory(s)}
                    className={`hover:bg-[#FFF9FC] transition-colors cursor-pointer ${
                      selectedStory?.id === s.id ? 'bg-[#FFF1F7]' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center shrink-0 border border-[#FBCFE8]">
                          {s.storyType === 'text' ? (
                            <div style={{ background: s.textBgGradient }} className="w-full h-full flex items-center justify-center p-0.5">
                              <span className="text-[5px] text-white font-extrabold line-clamp-3 text-center">{s.caption}</span>
                            </div>
                          ) : (
                            <img src={s.mediaUrl} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="max-w-[200px]">
                          <p className="font-bold text-[#18181B] truncate">{s.caption || 'Text Update'}</p>
                          <p className="text-[9px] text-[#A1A1AA] uppercase font-bold tracking-wider mt-0.5">{s.storyType} Story</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={s.visibility === 'members_only' ? 'pink' : 'emerald'} size="sm">
                        {s.visibility === 'members_only' ? 'VIP Members' : 'Public'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-[#18181B] font-bold">
                      <span className="flex items-center gap-1">
                        <Eye size={12} className="text-[#71717A]" /> {s.views?.length || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#71717A] font-medium">
                      {activeTab === 'active' ? calculateTimeRemaining(s.expiresAt) : 'Expired'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(s.id, e)}
                      >
                        <Trash2 size={13} className="text-[#F43F5E]" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Story Viewers & Engagement Insights Drawer */}
        <div className="lg:col-span-1">
          {selectedStory ? (
            <Card className="border border-[#F3DCE8] p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
                <div>
                  <h3 className="font-black text-xs uppercase text-[#18181B]">Story Engagement</h3>
                  <p className="text-[9px] text-[#71717A] font-bold mt-0.5">Real-time statistics</p>
                </div>
                <button onClick={() => setSelectedStory(null)} className="text-[#71717A] hover:text-[#18181B]">
                  <X size={15} />
                </button>
              </div>

              {/* Story Mini Preview */}
              <div className="flex gap-3 items-center bg-[#FFF9FC] p-3 rounded-2xl border border-[#F3DCE8]">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-[#FBCFE8] shrink-0">
                  {selectedStory.storyType === 'text' ? (
                    <div style={{ background: selectedStory.textBgGradient }} className="w-full h-full flex items-center justify-center p-1">
                      <span className="text-[6px] text-white font-black line-clamp-3 text-center">{selectedStory.caption}</span>
                    </div>
                  ) : (
                    <img src={selectedStory.mediaUrl} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#18181B] truncate">{selectedStory.caption || 'Text Update'}</p>
                  <p className="text-[9px] text-pink-600 font-bold uppercase tracking-wider mt-0.5">{selectedStory.visibility}</p>
                </div>
              </div>

              {/* Engagement Tabbed Sections */}
              <div className="space-y-4">
                
                {/* 1. Emoji Reaction summary */}
                <div className="space-y-2">
                  <p className="text-[10px] text-[#71717A] uppercase font-black tracking-wider flex items-center gap-1.5">
                    <Heart size={11} className="text-pink-600" /> Emoji Reactions ({selectedStory.reactions?.length || 0})
                  </p>
                  {selectedStory.reactions && selectedStory.reactions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(
                        selectedStory.reactions.reduce((acc, r) => {
                          acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([emoji, count]) => (
                        <div key={emoji} className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-bold text-slate-700 shadow-xs">
                          <span>{emoji}</span>
                          <span className="text-[9px] bg-slate-200 text-slate-800 rounded-full w-4 h-4 flex items-center justify-center font-black">{count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#A1A1AA] italic font-medium">No reactions received yet.</p>
                  )}
                </div>

                {/* 2. Text Replies List */}
                <div className="space-y-2">
                  <p className="text-[10px] text-[#71717A] uppercase font-black tracking-wider flex items-center gap-1.5">
                    <MessageSquare size={11} className="text-[#EC4899]" /> Text Replies ({selectedStory.replies?.length || 0})
                  </p>
                  {selectedStory.replies && selectedStory.replies.length > 0 ? (
                    <div className="space-y-2 max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-100 pr-1">
                      {selectedStory.replies.map((rep) => (
                        <div key={rep.id} className="p-2 bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl flex gap-2">
                          <Avatar alt={rep.username} src={rep.avatarUrl} size="sm" className="shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-[10px] text-[#18181B]">@{rep.username}</span>
                              <span className="text-[8px] text-[#A1A1AA]">Reply</span>
                            </div>
                            <p className="text-[10px] text-[#52525B] leading-relaxed mt-0.5 break-words font-medium">{rep.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#A1A1AA] italic font-medium">No text replies received yet.</p>
                  )}
                </div>

                {/* 3. Seen Viewers List */}
                <div className="space-y-2">
                  <p className="text-[10px] text-[#71717A] uppercase font-black tracking-wider flex items-center gap-1.5">
                    <Eye size={11} className="text-[#EC4899]" /> Seen List ({selectedStory.views?.length || 0})
                  </p>
                  {selectedStory.views && selectedStory.views.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-100 pr-1">
                      {selectedStory.views.map((view) => (
                        <div key={view.viewerId} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-xl transition-all">
                          <div className="flex items-center gap-2">
                            <Avatar alt={view.viewerName} src={view.viewerAvatar} size="sm" />
                            <div className="text-left">
                              <p className="font-bold text-[10px] text-[#18181B]">{view.viewerName}</p>
                              <p className="text-[9px] text-[#71717A]">@{view.viewerUsername}</p>
                            </div>
                          </div>
                          <span className="text-[8px] font-bold text-[#A1A1AA]">Viewed</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#A1A1AA] italic font-medium">No views recorded yet.</p>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border border-dashed border-[#F3DCE8] p-8 text-center text-[#71717A] font-semibold flex flex-col items-center justify-center space-y-2">
              <Eye size={24} className="text-[#A1A1AA] animate-pulse" />
              <p className="text-xs">Select a story to inspect real-time views, reactions, and direct text responses.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Add Story Modal */}
      {showAddStory && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 border border-[#F3DCE8] shadow-2xl relative">
            <button
              onClick={() => setShowAddStory(false)}
              className="absolute top-4 right-4 text-[#71717A] hover:text-[#18181B]"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-black text-[#18181B] border-b border-[#F3DCE8] pb-3 flex items-center gap-2">
              📸 Create 24h Ephemeral Story
            </h3>

            <form onSubmit={handleAddStory} className="space-y-4 pt-4 text-xs font-semibold">
              
              {/* Type Select */}
              <div className="space-y-1">
                <label className="text-[#52525B]">Story Type</label>
                <div className="flex gap-2">
                  {(['image', 'text'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewStoryType(t)}
                      className={`flex-1 py-2 rounded-xl border text-center font-bold capitalize transition-all cursor-pointer ${
                        newStoryType === t
                          ? 'bg-[#FCE7F3] text-[#BE185D] border-[#FBCFE8]'
                          : 'bg-white text-[#71717A] border-[#F3DCE8]'
                      }`}
                    >
                      {t} Story
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility Settings */}
              <div className="space-y-1">
                <label className="text-[#52525B]">Access Tier</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewVisibility('public')}
                    className={`flex-1 py-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      newVisibility === 'public'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-white text-[#71717A] border-[#F3DCE8]'
                    }`}
                  >
                    🌍 Public (All Followers)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVisibility('members_only')}
                    className={`flex-1 py-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      newVisibility === 'members_only'
                        ? 'bg-rose-50 text-[#BE185D] border-[#FBCFE8]'
                        : 'bg-white text-[#71717A] border-[#F3DCE8]'
                    }`}
                  >
                    🔒 VIP Members Only
                  </button>
                </div>
              </div>

              {newStoryType === 'image' ? (
                <>
                  {/* Media URL Input */}
                  <div className="space-y-1">
                    <label className="text-[#52525B]">Story Image URL</label>
                    <input
                      type="text"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      placeholder="Paste image URL here"
                      className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#EC4899]"
                      required
                    />
                  </div>

                  {/* Caption Input */}
                  <div className="space-y-1">
                    <label className="text-[#52525B]">Caption (Optional)</label>
                    <textarea
                      value={newCaption}
                      onChange={(e) => setNewCaption(e.target.value)}
                      placeholder="Write a caption to overlay..."
                      rows={2}
                      className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#EC4899] resize-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Background Gradient Pick */}
                  <div className="space-y-1">
                    <label className="text-[#52525B]">Gradient Theme</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Rose Pink', value: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)' },
                        { label: 'Cyber Violet', value: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' },
                        { label: 'Tech Indigo', value: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }
                      ].map((grad) => (
                        <button
                          key={grad.label}
                          type="button"
                          onClick={() => setNewTextGradient(grad.value)}
                          style={{ background: grad.value }}
                          className={`h-10 rounded-xl border text-[9px] font-black text-white text-center flex items-center justify-center leading-none p-1 cursor-pointer transition-transform ${
                            newTextGradient === grad.value ? 'scale-105 ring-2 ring-pink-500' : 'opacity-85'
                          }`}
                        >
                          {grad.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Status Update */}
                  <div className="space-y-1">
                    <label className="text-[#52525B]">Story Text Update</label>
                    <textarea
                      value={newCaption}
                      onChange={(e) => setNewCaption(e.target.value)}
                      placeholder="Write your text status update..."
                      rows={3}
                      className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#EC4899] resize-none"
                      required
                    />
                  </div>
                </>
              )}

              {/* Form Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 border border-[#F3DCE8]"
                  onClick={() => setShowAddStory(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  isLoading={isSubmitting}
                >
                  Publish Story
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
