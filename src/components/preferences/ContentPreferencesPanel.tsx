'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Sliders, Tag, Plus, X, Search, EyeOff, Shield, RotateCcw, 
  Check, Trash2, UserPlus, Clock, History, AlertTriangle, Filter,
  Compass, Heart, Layers, Volume2, CheckCircle2, ChevronRight, Settings
} from 'lucide-react';
import { useContentPreferences } from '@/lib/preferences/use-content-preferences';
import { MOCK_CREATOR_DETAILS } from '@/lib/supabase/store';
import { Switch } from '../../../themes/default-theme/components/Switch';

const ALL_CATEGORIES = [
  'Art & Design',
  'Education & Tech',
  'Fitness & Wellness',
  'Music & Sound',
  'Photography',
  'Gaming & Esports',
  'Lifestyle & Travel',
  'Business & Startup',
  'AI & Future Tech',
  'Fashion & Beauty',
  'Food & Cooking',
  'Podcasts & Talk',
];

const SUGGESTED_TAGS = [
  '#blender', '#react', '#fitness', '#cyberpunk', '#vlog', 
  '#hiphop', '#tutorial', '#crypto', '#web3', '#ai', 
  '#photography', '#cooking', '#indiehackers', '#3d'
];

export function ContentPreferencesPanel() {
  const {
    preferences,
    history,
    togglePreferredCategory,
    addPreferredTopic,
    removePreferredTopic,
    togglePreferredCreator,
    muteTopic,
    unmuteTopic,
    muteCreator,
    unmuteCreator,
    toggleHiddenPostType,
    updatePreferenceSetting,
    resetAllPreferences,
    removeSearchItem,
    clearSearchHistory,
    removeDiscoveredCreator,
    clearDiscoveryHistory,
    clearAllHistory,
    updatePrivacySetting,
  } = useContentPreferences();

  const [activeSubTab, setActiveSubTab] = useState<'interests' | 'creators' | 'filters' | 'history' | 'algorithm'>('interests');
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [customMuteInput, setCustomMuteInput] = useState('');
  const [creatorSearchQuery, setCreatorSearchQuery] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopicInput.trim()) return;
    addPreferredTopic(customTopicInput);
    setCustomTopicInput('');
    triggerToast('Topic added to your preferences');
  };

  const handleAddMuteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMuteInput.trim()) return;
    muteTopic(customMuteInput);
    setCustomMuteInput('');
    triggerToast('Topic added to muted list');
  };

  const handleResetConfirm = () => {
    resetAllPreferences();
    clearAllHistory();
    setShowResetModal(false);
    triggerToast('Personalization & history reset to defaults');
  };

  const creatorEntries = Object.entries(MOCK_CREATOR_DETAILS);
  const availableCreators = creatorEntries.filter(([id, creator]) => {
    const q = creatorSearchQuery.toLowerCase().trim();
    const cat = creator.category ?? '';
    return !q || creator.fullName.toLowerCase().includes(q) || creator.username.toLowerCase().includes(q) || cat.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {showToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs font-bold shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setShowToast(false)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FFF1F7] via-[#FCE7F3] to-[#F3E8FF] dark:from-[#24152F] dark:via-[#1D1129] dark:to-[#170E22] border border-[#FBCFE8] dark:border-[#4C1D3B] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#BE185D] dark:text-[#F472B6]">
              <Sparkles size={18} className="animate-pulse" />
              <h2 className="text-lg font-black tracking-tight">Content Preference & Personalization</h2>
            </div>
            <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">
              Control what appears in your Feed, Explore, and Reels based on categories, favorite creators, search history, and mutes.
            </p>
          </div>

          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-[#150D1E]/80 text-[#71717A] dark:text-[#D4B8D0] hover:text-[#BE185D] dark:hover:text-[#F472B6] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#FBCFE8] text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <RotateCcw size={14} />
            <span>Reset Personalization</span>
          </button>
        </div>

        {/* Quick Stats Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#150D1E]/70 border border-[#F3DCE8]/70 dark:border-[#3A2A4C]/70">
            <span className="block text-[10px] font-black uppercase text-[#A1A1AA] dark:text-[#8E7890]">Preferred Categories</span>
            <span className="text-base font-black text-[#BE185D] dark:text-[#F472B6]">{preferences.preferredCategories.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#150D1E]/70 border border-[#F3DCE8]/70 dark:border-[#3A2A4C]/70">
            <span className="block text-[10px] font-black uppercase text-[#A1A1AA] dark:text-[#8E7890]">Active Topics</span>
            <span className="text-base font-black text-[#BE185D] dark:text-[#F472B6]">{preferences.preferredTopics.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#150D1E]/70 border border-[#F3DCE8]/70 dark:border-[#3A2A4C]/70">
            <span className="block text-[10px] font-black uppercase text-[#A1A1AA] dark:text-[#8E7890]">Muted Topics & Creators</span>
            <span className="text-base font-black text-[#BE185D] dark:text-[#F472B6]">{preferences.mutedTopics.length + preferences.mutedCreatorIds.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#150D1E]/70 border border-[#F3DCE8]/70 dark:border-[#3A2A4C]/70">
            <span className="block text-[10px] font-black uppercase text-[#A1A1AA] dark:text-[#8E7890]">Search Log Entries</span>
            <span className="text-base font-black text-[#BE185D] dark:text-[#F472B6]">{history.recentSearches.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 hide-scrollbar border-b border-[#F3DCE8] dark:border-[#3A2A4C]">
        {[
          { id: 'interests', label: 'Categories & Topics', icon: Tag },
          { id: 'creators', label: 'Creator Preferences', icon: Heart },
          { id: 'filters', label: 'Content Mutes & Filters', icon: EyeOff },
          { id: 'history', label: 'Search & Discovery History', icon: History, badge: `${history.recentSearches.length}` },
          { id: 'algorithm', label: 'Algorithm Tuning', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#BE185D] text-white shadow-sm shadow-pink-500/20'
                  : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF9FC] dark:hover:bg-[#22152E]'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-pink-100 dark:bg-pink-950 text-[#BE185D] dark:text-[#F472B6]'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: Categories & Topics */}
      {activeSubTab === 'interests' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Preferred Categories */}
          <div className="p-5 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-4">
            <div>
              <h3 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8]">Preferred Categories</h3>
              <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">
                Select the content categories you enjoy most. Posts and creators in these niches will be prioritized in your feeds.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = preferences.preferredCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      togglePreferredCategory(cat);
                      triggerToast(isSelected ? `Removed ${cat}` : `Added ${cat}`);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] border-[#FBCFE8] dark:border-[#4C1D3B] shadow-2xs scale-105'
                        : 'bg-[#FFF9FC] dark:bg-[#22152E] text-[#71717A] dark:text-[#D4B8D0] border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#EC4899]/50'
                    }`}
                  >
                    {isSelected ? <Check size={14} className="text-[#EC4899]" /> : <Plus size={14} className="text-[#A1A1AA]" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Topics */}
          <div className="p-5 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-4">
            <div>
              <h3 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8]">Favorite Hashtags & Topics</h3>
              <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">
                Follow specific tags to see related drops, masterclasses, and posts more often.
              </p>
            </div>

            {/* Active Topics List */}
            <div className="flex flex-wrap gap-2">
              {preferences.preferredTopics.map((topic) => (
                <span
                  key={topic}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] text-xs font-bold"
                >
                  <span>{topic}</span>
                  <button
                    onClick={() => {
                      removePreferredTopic(topic);
                      triggerToast(`Removed ${topic}`);
                    }}
                    className="hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}

              {preferences.preferredTopics.length === 0 && (
                <p className="text-xs text-[#71717A] dark:text-[#8E7890] italic">No custom topics added yet.</p>
              )}
            </div>

            {/* Add Custom Topic Input */}
            <form onSubmit={handleAddTopicSubmit} className="flex items-center gap-2 pt-2">
              <div className="relative flex-1">
                <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                <input
                  type="text"
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  placeholder="Add custom topic (e.g. #blender, #react)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#BE185D] hover:bg-[#9D174D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Add Topic
              </button>
            </form>

            {/* Suggested Tags */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-[#71717A] dark:text-[#8E7890]">Suggested Popular Tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.map((tag) => {
                  const isAdded = preferences.preferredTopics.includes(tag);
                  if (isAdded) return null;
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        addPreferredTopic(tag);
                        triggerToast(`Added ${tag}`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#FFF9FC] dark:bg-[#22152E] hover:bg-[#FCE7F3] dark:hover:bg-[#381A2B] text-[#71717A] hover:text-[#BE185D] dark:text-[#D4B8D0] border border-[#F3DCE8] dark:border-[#3A2A4C] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={11} />
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Creator Preferences */}
      {activeSubTab === 'creators' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Favorite Creators */}
          <div className="p-5 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-4">
            <div>
              <h3 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8]">Favorite Creators</h3>
              <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">
                Creators added to your favorites will always appear near the top of your Feed and Explore recommendations.
              </p>
            </div>

            {/* Search and Pick Creators */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
              <input
                type="text"
                value={creatorSearchQuery}
                onChange={(e) => setCreatorSearchQuery(e.target.value)}
                placeholder="Search creators to add to favorites..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
              />
            </div>

            {/* Creator Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableCreators.map(([id, creator]) => {
                const isFavorite = preferences.preferredCreatorIds.includes(id) || preferences.preferredCreatorIds.includes(creator.username);
                const isMuted = preferences.mutedCreatorIds.includes(id) || preferences.mutedCreatorIds.includes(creator.username);

                return (
                  <div
                    key={id}
                    className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={creator.avatarUrl}
                        alt={creator.fullName}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#FBCFE8]"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] truncate">
                          {creator.fullName}
                        </div>
                        <div className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] truncate">
                          @{creator.username} {creator.category ? `• ${creator.category}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          togglePreferredCreator(id);
                          triggerToast(isFavorite ? `Removed @${creator.username} from favorites` : `Added @${creator.username} to favorites`);
                        }}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isFavorite
                            ? 'bg-[#BE185D] text-white shadow-xs'
                            : 'bg-white dark:bg-[#150D1E] text-[#71717A] dark:text-[#D4B8D0] hover:text-[#BE185D] border border-[#F3DCE8] dark:border-[#3A2A4C]'
                        }`}
                        title={isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
                      >
                        <Heart size={14} className={isFavorite ? 'fill-current' : ''} />
                      </button>

                      <button
                        onClick={() => {
                          if (isMuted) {
                            unmuteCreator(id);
                            triggerToast(`Unmuted @${creator.username}`);
                          } else {
                            muteCreator(id);
                            triggerToast(`Muted @${creator.username}`);
                          }
                        }}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isMuted
                            ? 'bg-red-500 text-white'
                            : 'bg-white dark:bg-[#150D1E] text-[#71717A] hover:text-red-500 border border-[#F3DCE8] dark:border-[#3A2A4C]'
                        }`}
                        title={isMuted ? 'Unmute Creator' : 'Mute Creator'}
                      >
                        <EyeOff size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Content Mutes & Filters */}
      {activeSubTab === 'filters' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Muted Topics */}
          <div className="p-5 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-4">
            <div>
              <h3 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8]">Muted Topics & Keywords</h3>
              <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">
                Content containing these topics or keywords will be automatically filtered out from your feeds.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {preferences.mutedTopics.map((topic) => (
                <span
                  key={topic}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-xs font-bold"
                >
                  <span>{topic}</span>
                  <button
                    onClick={() => {
                      unmuteTopic(topic);
                      triggerToast(`Unmuted ${topic}`);
                    }}
                    className="hover:text-red-900 transition-colors cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}

              {preferences.mutedTopics.length === 0 && (
                <p className="text-xs text-[#71717A] dark:text-[#8E7890] italic">No topics muted.</p>
              )}
            </div>

            <form onSubmit={handleAddMuteSubmit} className="flex items-center gap-2 pt-2">
              <div className="relative flex-1">
                <EyeOff size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                <input
                  type="text"
                  value={customMuteInput}
                  onChange={(e) => setCustomMuteInput(e.target.value)}
                  placeholder="Add topic to mute (e.g. #spoilers, #politics)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-red-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Mute Topic
              </button>
            </form>
          </div>

          {/* Hidden Content Types & Sensitive Filter */}
          <div className="p-5 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-5">
            <div>
              <h3 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8]">Content Types & Safety Filters</h3>
              <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">
                Choose which post formats you prefer to see, and set your content filtering level.
              </p>
            </div>

            {/* Content Type Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'text', label: 'Exclude Text Posts', desc: 'Hide standalone text updates' },
                { id: 'video', label: 'Exclude Long Videos', desc: 'Hide long video uploads' },
                { id: 'short', label: 'Exclude Short Reels', desc: 'Hide short video feeds' },
                { id: 'poll', label: 'Exclude Interactive Polls', desc: 'Hide voting polls' },
              ].map((type) => {
                const isExcluded = preferences.hiddenPostTypes.includes(type.id);
                return (
                  <div key={type.id} className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">{type.label}</span>
                      <span className="block text-[11px] text-[#71717A] dark:text-[#8E7890]">{type.desc}</span>
                    </div>
                    <Switch
                      checked={isExcluded}
                      onChange={() => {
                        toggleHiddenPostType(type.id);
                        triggerToast(isExcluded ? `Re-enabled ${type.id} posts` : `Excluded ${type.id} posts`);
                      }}
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>

            {/* Sensitive Content Filter Selector */}
            <div className="pt-2 space-y-2 border-t border-[#F3DCE8] dark:border-[#3A2A4C]">
              <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">Sensitive Content Filter Level</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'strict', label: 'Strict', desc: 'Maximum filtering' },
                  { id: 'standard', label: 'Standard', desc: 'Default balance' },
                  { id: 'relaxed', label: 'Relaxed', desc: 'Minimal restrictions' },
                ].map((level) => (
                  <button
                    key={level.id}
                    onClick={() => {
                      updatePreferenceSetting('sensitiveContentFilter', level.id as any);
                      triggerToast(`Filter set to ${level.label}`);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      preferences.sensitiveContentFilter === level.id
                        ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] border-[#FBCFE8] dark:border-[#4C1D3B] font-black shadow-2xs'
                        : 'bg-[#FFF9FC] dark:bg-[#22152E] text-[#71717A] dark:text-[#D4B8D0] border-[#F3DCE8] dark:border-[#3A2A4C]'
                    }`}
                  >
                    <span className="block text-xs uppercase font-bold">{level.label}</span>
                    <span className="block text-[10px] mt-0.5 opacity-80">{level.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Search & Discovery History */}
      {activeSubTab === 'history' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Privacy & Recording Controls */}
          <div className="p-5 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8]">History & Privacy Controls</h3>
                <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">
                  Choose whether your search activity and creator discoveries are logged or used for recommendation engine tuning.
                </p>
              </div>
              <button
                onClick={() => {
                  clearAllHistory();
                  triggerToast('All search & discovery history cleared');
                }}
                className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-900 text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Clear History</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-2">
                <Switch
                  checked={history.pauseSearchHistory}
                  onChange={(val) => {
                    updatePrivacySetting('pauseSearchHistory', val);
                    triggerToast(val ? 'Search history recording paused' : 'Search history recording resumed');
                  }}
                  label="Pause Search History"
                  description="Stop recording new search queries"
                  size="sm"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-2">
                <Switch
                  checked={history.pauseDiscoveryHistory}
                  onChange={(val) => {
                    updatePrivacySetting('pauseDiscoveryHistory', val);
                    triggerToast(val ? 'Creator discovery tracking paused' : 'Creator discovery tracking resumed');
                  }}
                  label="Pause Discovery History"
                  description="Stop tracking visited creator profiles"
                  size="sm"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-2">
                <Switch
                  checked={history.useHistoryForRecommendations}
                  onChange={(val) => {
                    updatePrivacySetting('useHistoryForRecommendations', val);
                    triggerToast(val ? 'History recommendations enabled' : 'History recommendations disabled');
                  }}
                  label="Improve Recommendations"
                  description="Use history to tune feed scoring"
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Recent Searches */}
          <div className="p-5 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8]">Recent Searches</h3>
                <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">
                  Your recent search queries. Click an item to re-search or remove individual entries.
                </p>
              </div>
              {history.recentSearches.length > 0 && (
                <button
                  onClick={() => {
                    clearSearchHistory();
                    triggerToast('Recent searches cleared');
                  }}
                  className="text-xs font-bold text-[#BE185D] dark:text-[#F472B6] hover:underline cursor-pointer"
                >
                  Clear Searches
                </button>
              )}
            </div>

            <div className="space-y-2">
              {history.recentSearches.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between gap-3 group hover:border-[#FBCFE8]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <History size={15} className="text-[#EC4899] shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] truncate">{item.query}</span>
                      <span className="block text-[10px] text-[#71717A] dark:text-[#8E7890]">
                        {item.timestamp} {item.category ? `• ${item.category}` : ''}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      removeSearchItem(item.id);
                      triggerToast('Search item removed');
                    }}
                    className="p-1.5 text-[#A1A1AA] hover:text-red-500 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {history.recentSearches.length === 0 && (
                <p className="text-xs text-[#71717A] dark:text-[#8E7890] italic py-2">No recent search history.</p>
              )}
            </div>
          </div>

          {/* Recently Discovered Creators */}
          <div className="p-5 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8]">Recently Discovered Creators</h3>
                <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">
                  Creators you recently explored or interacted with.
                </p>
              </div>
              {history.discoveredCreators.length > 0 && (
                <button
                  onClick={() => {
                    clearDiscoveryHistory();
                    triggerToast('Discovered creators cleared');
                  }}
                  className="text-xs font-bold text-[#BE185D] dark:text-[#F472B6] hover:underline cursor-pointer"
                >
                  Clear Discovered
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {history.discoveredCreators.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={item.avatarUrl} alt={item.creatorName} className="w-9 h-9 rounded-full object-cover border border-[#FBCFE8]" />
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] truncate">{item.creatorName}</span>
                      <span className="block text-[10px] text-[#71717A] dark:text-[#8E7890] truncate">@{item.creatorUsername} • {item.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      removeDiscoveredCreator(item.id);
                      triggerToast('Creator removed from history');
                    }}
                    className="p-1.5 text-[#A1A1AA] hover:text-red-500 transition-colors cursor-pointer shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {history.discoveredCreators.length === 0 && (
                <p className="text-xs text-[#71717A] dark:text-[#8E7890] italic py-2 col-span-2">No discovered creators recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: Algorithm Tuning */}
      {activeSubTab === 'algorithm' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-5 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-6">
            <div>
              <h3 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8]">Recommendation Engine Tuning</h3>
              <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">
                Fine-tune how candidate posts and creators are weighed across Feed, Explore, and Reels.
              </p>
            </div>

            {/* Master Personalization Switch */}
            <div className="p-4 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">Enable Personalized Recommendations</span>
                <span className="block text-[11px] text-[#71717A] dark:text-[#8E7890]">
                  When disabled, recommendations display standard trending content without personal scoring.
                </span>
              </div>
              <Switch
                checked={preferences.enablePersonalization}
                onChange={(val) => {
                  updatePreferenceSetting('enablePersonalization', val);
                  triggerToast(val ? 'Personalization enabled' : 'Personalization disabled');
                }}
              />
            </div>

            {/* Recommendation Mode Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">Discovery Balance Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'balanced', label: 'Balanced', desc: 'Mix of subscriptions & new recommendations' },
                  { id: 'familiarity', label: 'Familiarity First', desc: 'Prioritize creators you follow & love' },
                  { id: 'discovery', label: 'Discovery First', desc: 'Expose more rising talent and new topics' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      updatePreferenceSetting('recommendationMode', mode.id as any);
                      triggerToast(`Mode set to ${mode.label}`);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      preferences.recommendationMode === mode.id
                        ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] border-[#FBCFE8] dark:border-[#4C1D3B] font-bold shadow-2xs'
                        : 'bg-[#FFF9FC] dark:bg-[#22152E] text-[#71717A] dark:text-[#D4B8D0] border-[#F3DCE8] dark:border-[#3A2A4C]'
                    }`}
                  >
                    <span className="block text-xs font-black">{mode.label}</span>
                    <span className="block text-[11px] mt-1 opacity-80">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Discovery Weight Slider */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">Discovery Weighting: {preferences.discoveryWeight}%</label>
                <span className="text-[11px] text-[#EC4899] font-mono">{preferences.discoveryWeight > 50 ? 'Higher Novelty' : 'More Familiar'}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={preferences.discoveryWeight}
                onChange={(e) => updatePreferenceSetting('discoveryWeight', parseInt(e.target.value))}
                className="w-full accent-[#BE185D] cursor-pointer"
              />
            </div>

            {/* Include Live Streams Switch */}
            <div className="p-4 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">Include Live Stream Alerts in Feed</span>
                <span className="block text-[11px] text-[#71717A] dark:text-[#8E7890]">
                  Show real-time broadcast banners for live creators matching your interests.
                </span>
              </div>
              <Switch
                checked={preferences.includeLiveStreams}
                onChange={(val) => {
                  updatePreferenceSetting('includeLiveStreams', val);
                  triggerToast(val ? 'Live stream alerts enabled' : 'Live stream alerts disabled');
                }}
                size="sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle size={24} />
              <h3 className="text-base font-black text-[#18181B] dark:text-[#FDF2F8]">Reset Personalization & History?</h3>
            </div>

            <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] leading-relaxed">
              This action will reset your category preferences, hashtag topics, favorite creators, muted items, algorithm sliders, search history, and discovery logs back to factory defaults.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:bg-[#FFF9FC] dark:hover:bg-[#22152E] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Reset All Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
