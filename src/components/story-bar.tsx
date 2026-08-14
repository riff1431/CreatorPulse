'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Sparkles, Clock, ChevronLeft, ChevronRight, Send, AlertCircle, Lock, Eye, CheckCircle2 } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { useAuth } from '@/lib/auth/auth-context';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { StoriesService, PluginStory } from '@/lib/services/stories-service';

const getReactionId = () => Date.now() + Math.random();
const getReactionLeft = () => Math.floor(Math.random() * 60) + 20;

export const StoryBar: React.FC = () => {
  const { user, role } = useAuth();
  const { activePlugins } = usePlugins();

  // 1. Check if stories plugin is active
  const storiesPlugin = activePlugins.find((p) => p.id === 'plugin-creator-stories');

  const [activeStories, setActiveStories] = useState<PluginStory[]>([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number>(0);
  const [showAddStory, setShowAddStory] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600');
  const [newStoryType, setNewStoryType] = useState<'image' | 'video' | 'text'>('image');
  const [newTextGradient, setNewTextGradient] = useState('linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)');
  const [newVisibility, setNewVisibility] = useState<'public' | 'members_only'>('public');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reactions, setReactions] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const [replyText, setReplyText] = useState('');
  
  // Custom tracking for simulated subscriptions
  const [subscribedCreators, setSubscribedCreators] = useState<string[]>([]);

  // Load simulated subscriptions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('creatorpulse_memberships');
        if (stored) {
          setSubscribedCreators(JSON.parse(stored));
        }
      } catch (e) {}
    }
  }, []);

  // Return null if stories plugin is deactivated
  if (!storiesPlugin) {
    return null;
  }

  const settings = storiesPlugin.settingsValues || {};
  const maxStoryDuration = Number(settings.maxDuration || 24);
  const isViewerTrackingEnabled = settings.enableViewerTracking !== false;
  const isRepliesReactionsEnabled = settings.enableRepliesReactions !== false;
  const requireSubscriptionAll = settings.requireSubscriptionForStories === true;

  // Load and refresh stories
  const refreshStories = async () => {
    try {
      const active = await StoriesService.getStories();
      setActiveStories(active);
    } catch (e) {
      console.error('[StoryBar] Failed to load stories:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStories();
    // Listen to changes in the stories service
    window.addEventListener('creatorpulse_stories_updated', refreshStories);
    return () => {
      window.removeEventListener('creatorpulse_stories_updated', refreshStories);
    };
  }, []);

  // Group stories by creator
  const creatorsMap: Record<string, {
    creatorId: string;
    creatorName: string;
    creatorUsername: string;
    creatorAvatar: string;
    stories: PluginStory[];
    allSeen: boolean;
  }> = {};

  activeStories.forEach((story) => {
    if (!creatorsMap[story.creatorId]) {
      creatorsMap[story.creatorId] = {
        creatorId: story.creatorId,
        creatorName: story.creatorName,
        creatorUsername: story.creatorUsername,
        creatorAvatar: story.creatorAvatar,
        stories: [],
        allSeen: true
      };
    }
    creatorsMap[story.creatorId].stories.push(story);
  });

  // Determine seen states for each creator group
  Object.keys(creatorsMap).forEach((cId) => {
    const group = creatorsMap[cId];
    if (user) {
      const hasUnseen = group.stories.some((s) => {
        const views = s.views || [];
        return !views.some((v) => v.viewerId === user.id);
      });
      group.allSeen = !hasUnseen;
    }
  });

  const creatorsList = Object.values(creatorsMap);

  // Stories navigation within the active creator
  const activeCreator = selectedCreatorId ? creatorsMap[selectedCreatorId] : null;
  const activeStory = activeCreator ? activeCreator.stories[selectedStoryIndex] : null;

  // Mark active story as read
  useEffect(() => {
    if (activeStory && user && user.id !== activeStory.creatorId) {
      const hasSeen = activeStory.views?.some(v => v.viewerId === user.id);
      if (!hasSeen) {
        StoriesService.markAsSeen(activeStory.id, {
          id: user.id,
          fullName: user.fullName || 'Anonymous User',
          username: user.username || 'anonymous',
          avatarUrl: user.avatarUrl || ''
        });
      }
    }
  }, [activeStory, user]);

  // Story auto-progress handler (5 seconds)
  useEffect(() => {
    if (!activeStory || isStoryLocked(activeStory)) return;

    const timer = setTimeout(() => {
      handleNext();
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeStory, selectedStoryIndex]);

  const handleNext = () => {
    if (!activeCreator) return;
    if (selectedStoryIndex < activeCreator.stories.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1);
    } else {
      // Find the next creator's stories
      const currentIdx = creatorsList.findIndex((c) => c.creatorId === selectedCreatorId);
      if (currentIdx < creatorsList.length - 1) {
        const nextCreator = creatorsList[currentIdx + 1];
        setSelectedCreatorId(nextCreator.creatorId);
        
        // Find first unseen story index or default to 0
        const firstUnseenIdx = nextCreator.stories.findIndex(s => {
          const views = s.views || [];
          return !views.some(v => v.viewerId === user?.id);
        });
        setSelectedStoryIndex(firstUnseenIdx >= 0 ? firstUnseenIdx : 0);
      } else {
        // End of all stories
        setSelectedCreatorId(null);
      }
    }
  };

  const handlePrev = () => {
    if (!activeCreator) return;
    if (selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
    } else {
      // Go to previous creator's last story
      const currentIdx = creatorsList.findIndex((c) => c.creatorId === selectedCreatorId);
      if (currentIdx > 0) {
        const prevCreator = creatorsList[currentIdx - 1];
        setSelectedCreatorId(prevCreator.creatorId);
        setSelectedStoryIndex(prevCreator.stories.length - 1);
      }
    }
  };

  const handleReact = async (emoji: string) => {
    if (!activeStory || !user) return;
    const id = getReactionId();
    const left = getReactionLeft();
    setReactions((prev) => [...prev, { id, emoji, left }]);

    // Persist reaction
    await StoriesService.addReaction(activeStory.id, {
      id: user.id,
      username: user.username || 'member',
      fullName: user.fullName || 'Anonymous'
    }, emoji);

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1200);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeStory || !user) return;

    await StoriesService.addReply(activeStory.id, {
      id: user.id,
      username: user.username || 'member',
      fullName: user.fullName || 'Anonymous',
      avatarUrl: user.avatarUrl || ''
    }, replyText);

    setReplyText('');
    alert('Reply sent to creator!');
  };

  const isStoryLocked = (story: PluginStory) => {
    if (role === 'admin') return false;
    if (user?.id === story.creatorId) return false;

    const needsSub = story.visibility === 'members_only' || requireSubscriptionAll;
    if (!needsSub) return false;

    // Check default subscribers
    if (user?.id === 'user-member' && story.creatorId === 'user-creator-1') return false;

    // Check custom simulated subscription list
    if (subscribedCreators.includes(story.creatorId)) return false;

    return true;
  };

  const handleSimulateSubscribe = (creatorId: string) => {
    const updated = [...subscribedCreators, creatorId];
    setSubscribedCreators(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('creatorpulse_memberships', JSON.stringify(updated));
    }
    // Record transaction logic simulation
    const transactionsRaw = localStorage.getItem('creatorpulse_transactions_db') || '[]';
    try {
      const txs = JSON.parse(transactionsRaw);
      txs.unshift({
        id: `TX-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        type: 'Membership',
        from: user?.fullName || 'Alex Vance',
        to: activeCreator?.creatorName || 'Sarah Jenkins',
        amount: '$15.00',
        fee: '$0.75',
        net: '$14.25',
        status: 'Completed'
      });
      localStorage.setItem('creatorpulse_transactions_db', JSON.stringify(txs));
    } catch(e){}
  };

  const handleAddStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await StoriesService.createStory({
        creatorId: user.id,
        creatorName: user.fullName || 'Sarah Jenkins',
        creatorUsername: user.username || 'sarahdesign',
        creatorAvatar: user.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        mediaUrl: newStoryType === 'text' ? '' : newMediaUrl,
        caption: newCaption,
        storyType: newStoryType,
        textBgGradient: newStoryType === 'text' ? newTextGradient : undefined,
        visibility: newVisibility
      }, maxStoryDuration);

      setNewCaption('');
      setShowAddStory(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 bg-white/70 backdrop-blur-md border border-[#F3DCE8] p-4 rounded-[24px] shadow-sm shadow-[#EC4899]/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#EC4899] animate-pulse" size={16} />
          <h3 className="text-xs font-black text-[#18181B] tracking-tight uppercase">24-Hour Creator Stories</h3>
        </div>
        <span className="text-[10px] text-[#71717A] bg-[#FFF1F7] border border-[#F3DCE8] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
          <Clock size={11} className="text-[#EC4899]" /> Active Add-on
        </span>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
        {/* Add Story Button (Visible to Creators) */}
        {role === 'creator' && (
          <button
            onClick={() => setShowAddStory(true)}
            className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-white border-2 border-dashed border-[#F472B6] hover:border-[#EC4899] flex items-center justify-center text-[#EC4899] group-hover:scale-105 transition-all shadow-sm shadow-[#EC4899]/5">
              <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
            </div>
            <span className="text-[10px] font-extrabold text-[#52525B]">Add Story</span>
          </button>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-14 h-14 rounded-full skeleton-shimmer border border-[#F3DCE8]" />
                <div className="w-12 h-3 skeleton-shimmer rounded-full" />
              </div>
            ))}
          </>
        )}

        {/* Empty Stories State */}
        {!isLoading && creatorsList.length === 0 && (
          <div className="flex items-center gap-2 text-[#71717A] text-[11px] font-semibold py-2">
            <AlertCircle size={14} className="text-[#A1A1AA]" />
            <span>No creator stories active right now.</span>
          </div>
        )}

        {/* Active Stories Creator List */}
        {!isLoading && creatorsList.map((c) => (
          <button
            key={c.creatorId}
            onClick={() => {
              setSelectedCreatorId(c.creatorId);
              // Start from the first unseen story
              const firstUnseen = c.stories.findIndex(s => {
                const views = s.views || [];
                return !views.some(v => v.viewerId === user?.id);
              });
              setSelectedStoryIndex(firstUnseen >= 0 ? firstUnseen : 0);
            }}
            className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer text-left focus:outline-none"
          >
            <Avatar
              alt={c.creatorName}
              src={c.creatorAvatar}
              size="lg"
              hasStory={true}
              storySeen={c.allSeen}
              className="group-hover:scale-105 transition-transform shadow-md duration-300"
            />
            <span className="text-[10px] font-bold text-[#52525B] truncate max-w-[72px]">
              @{c.creatorUsername}
            </span>
          </button>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedCreatorId && activeStory && activeCreator && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="absolute inset-0 cursor-zoom-out" onClick={() => setSelectedCreatorId(null)}></div>

          <div className="relative max-w-sm w-full h-[640px] bg-[#121214] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between z-10">
            
            {/* Story Auto Progress Indicator Strip */}
            <div className="absolute top-3 left-4 right-4 z-30 flex gap-1.5">
              {activeCreator.stories.map((story, index) => {
                const isCurrent = index === selectedStoryIndex;
                const isPast = index < selectedStoryIndex;
                return (
                  <div key={story.id} className="h-[3px] flex-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      key={`${story.id}-${isCurrent}`}
                      className={`h-full bg-white rounded-full ${
                        isCurrent ? 'animate-story-progress' : isPast ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Header overlay */}
            <div className="p-4 pt-6 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between absolute top-0 left-0 right-0 z-20">
              <div className="flex items-center gap-2.5">
                <Avatar alt={activeCreator.creatorName} src={activeCreator.creatorAvatar} size="sm" />
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    {activeCreator.creatorName}
                    {activeStory.visibility === 'members_only' && (
                      <span className="text-[8px] bg-pink-600 text-white font-extrabold uppercase px-1.5 py-0.5 rounded border border-pink-400/30 flex items-center gap-0.5">
                        <Lock size={8} /> VIP
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-1 text-[9px] text-pink-300 font-bold mt-0.5">
                    <Clock size={10} />
                    <span>24h Ephemeral Update</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCreatorId(null)}
                className="text-white bg-white/10 p-2 rounded-full hover:bg-white/25 transition-colors cursor-pointer border border-white/10"
              >
                <X size={15} />
              </button>
            </div>

            {/* Story Navigation Zones (Left / Right Chevron overlays) */}
            <div className="absolute inset-y-0 left-0 w-16 flex items-center justify-start pl-2 z-20 opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={handlePrev}
                disabled={selectedStoryIndex === 0 && creatorsList.findIndex(c => c.creatorId === selectedCreatorId) === 0}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors disabled:opacity-0 cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 w-16 flex items-center justify-end pr-2 z-20 opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={handleNext}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Content Container (Gated / Text / Image) */}
            <div className="flex-1 w-full h-full relative bg-black flex items-center justify-center">
              
              {isStoryLocked(activeStory) ? (
                /* Paywall locked overlay screen */
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-4 bg-gradient-to-b from-[#1E112A] to-[#121214] w-full h-full text-white z-10">
                  <div className="w-16 h-16 rounded-full bg-pink-900/40 border border-pink-500/30 flex items-center justify-center text-pink-500 animate-pulse">
                    <Lock size={32} />
                  </div>
                  <h3 className="font-black text-lg tracking-tight">🔒 Exclusive VIP Story</h3>
                  <p className="text-xs text-slate-350 leading-relaxed max-w-[240px]">
                    Subscribe to {activeStory.creatorName} to instantly unlock all of their VIP stories, premium posts, and comments.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full max-w-[200px]"
                    onClick={() => {
                      handleSimulateSubscribe(activeStory.creatorId);
                      alert('Simulated Subscription successful! Story unlocked.');
                    }}
                  >
                    Subscribe $15.00/mo
                  </Button>
                </div>
              ) : activeStory.storyType === 'text' ? (
                /* Text Story with Stylized Background */
                <div
                  style={{ background: activeStory.textBgGradient || 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)' }}
                  className="w-full h-full flex flex-col items-center justify-center px-8 text-center text-white"
                  onClick={handleNext}
                >
                  <h2 className="text-lg font-black tracking-tight leading-relaxed max-w-[280px] drop-shadow-md">
                    {activeStory.caption}
                  </h2>
                </div>
              ) : (
                /* Image story */
                <img
                  src={activeStory.mediaUrl}
                  alt="Story content"
                  className="w-full h-full object-cover select-none"
                  onClick={handleNext}
                />
              )}

              {/* Floating Emojis */}
              {reactions.map((r) => (
                <span
                  key={r.id}
                  style={{ left: `${r.left}%` }}
                  className="absolute bottom-28 text-5xl select-none pointer-events-none z-30 animate-float-reaction"
                >
                  {r.emoji}
                </span>
              ))}
            </div>

            {/* Interactive Emoji Bar & Caption Footer */}
            {activeStory && !isStoryLocked(activeStory) && (
              <div className="p-4 pt-12 bg-gradient-to-t from-black/95 via-black/75 to-transparent absolute bottom-0 left-0 right-0 z-20 space-y-4">
                
                {activeStory.storyType !== 'text' && activeStory.caption && (
                  <div className="text-center px-4">
                    <p className="text-white text-xs font-bold leading-relaxed drop-shadow-md">
                      {activeStory.caption}
                    </p>
                  </div>
                )}

                {/* Engagement Area: Quick Reactions and Replies */}
                {isRepliesReactionsEnabled && (
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    
                    {/* Emoji Reaction Pills */}
                    <div className="flex items-center justify-between px-2">
                      {['❤️', '🔥', '😂', '😮', '😢', '🎉'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReact(emoji)}
                          className="text-2xl hover:scale-125 transition-transform duration-200 focus:outline-none cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Text Reply Box */}
                    <form onSubmit={handleSendReply} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Send reply to creator..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20"
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim()}
                        className="bg-pink-600 hover:bg-pink-700 text-white rounded-full p-2 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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

            <form onSubmit={handleAddStorySubmit} className="space-y-4 pt-4 text-xs font-semibold">
              
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
};
