'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Sparkles, Clock, ChevronLeft, ChevronRight, Heart, Flame, Laugh, AlertCircle } from 'lucide-react';
import { MOCK_STORIES, Story } from '@/lib/supabase/store';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';

const getReactionId = () => Date.now() + Math.random();
const getReactionLeft = () => Math.floor(Math.random() * 50) + 25;

export const StoryBar: React.FC = () => {
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showAddStory, setShowAddStory] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600');
  const [isLoading, setIsLoading] = useState(true);
  const [reactions, setReactions] = useState<{ id: number; emoji: string; left: number }[]>([]);

  // Simulate loading state for a real premium feel
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  // Story automatic progress handler
  useEffect(() => {
    if (!selectedStory) return;
    const timer = setTimeout(() => {
      const idx = stories.findIndex((s) => s.id === selectedStory.id);
      if (idx < stories.length - 1) {
        setSelectedStory(stories[idx + 1]);
      } else {
        setSelectedStory(null);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [selectedStory, stories]);

  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl) return;

    const created: Story = {
      id: `story-${Date.now()}`,
      creatorId: 'user-creator-1',
      creatorName: 'Sarah Jenkins',
      creatorUsername: 'sarahdesign',
      creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      mediaUrl: newMediaUrl,
      caption: newCaption || 'New Story Status Update!',
      createdAt: 'Just now',
      expiresAt: '24 hours remaining'
    };

    setStories([created, ...stories]);
    setNewCaption('');
    setShowAddStory(false);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedStory) return;
    const idx = stories.findIndex((s) => s.id === selectedStory.id);
    if (idx < stories.length - 1) {
      setSelectedStory(stories[idx + 1]);
    } else {
      setSelectedStory(null);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedStory) return;
    const idx = stories.findIndex((s) => s.id === selectedStory.id);
    if (idx > 0) {
      setSelectedStory(stories[idx - 1]);
    }
  };

  const handleReact = (emoji: string) => {
    const id = getReactionId();
    const left = getReactionLeft();
    setReactions((prev) => [...prev, { id, emoji, left }]);
    // Remove reaction DOM after animation ends
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1200);
  };

  return (
    <div className="space-y-3 bg-white/70 backdrop-blur-md border border-[#F3DCE8] p-4 rounded-[24px] shadow-sm shadow-[#EC4899]/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#EC4899] animate-pulse" size={16} />
          <h3 className="text-xs font-black text-[#18181B] tracking-tight uppercase">24-Hour Creator Stories</h3>
        </div>
        <span className="text-[10px] text-[#71717A] bg-[#FFF1F7] border border-[#F3DCE8] px-2.5 py-0.5 rounded-full font-bold">
          Ephemeral Status
        </span>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
        {/* Add Story Button */}
        <button
          onClick={() => setShowAddStory(true)}
          className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-white border-2 border-dashed border-[#F472B6] hover:border-[#EC4899] flex items-center justify-center text-[#EC4899] group-hover:scale-105 transition-all shadow-sm shadow-[#EC4899]/5">
            <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <span className="text-[10px] font-extrabold text-[#52525B]">Add Story</span>
        </button>

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
        {!isLoading && stories.length === 0 && (
          <div className="flex items-center gap-2 text-[#71717A] text-[11px] font-semibold py-2">
            <AlertCircle size={14} className="text-[#A1A1AA]" />
            <span>No creator stories active right now.</span>
          </div>
        )}

        {/* Active Stories List */}
        {!isLoading && stories.map((story) => (
          <button
            key={story.id}
            onClick={() => setSelectedStory(story)}
            className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer text-left focus:outline-none"
          >
            <Avatar
              alt={story.creatorName}
              src={story.creatorAvatar}
              size="lg"
              hasStory={true}
              className="group-hover:scale-105 transition-transform shadow-md duration-300 ring-2 ring-transparent group-hover:ring-[#EC4899]/35"
            />
            <span className="text-[10px] font-bold text-[#52525B] truncate max-w-[72px]">
              @{story.creatorUsername}
            </span>
          </button>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          {/* Overlay Close Handler */}
          <div className="absolute inset-0 cursor-zoom-out" onClick={() => setSelectedStory(null)}></div>

          <div className="relative max-w-sm w-full h-[600px] bg-[#121214] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between z-10">
            {/* Story Auto Progress Indicator Strip */}
            <div className="absolute top-3 left-4 right-4 z-30 flex gap-1.5">
              {stories.map((story, index) => {
                const isCurrent = story.id === selectedStory.id;
                const isPast = stories.findIndex((s) => s.id === selectedStory.id) > index;
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
                <Avatar alt={selectedStory.creatorName} src={selectedStory.creatorAvatar} size="sm" />
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    {selectedStory.creatorName}
                    <span className="text-[9px] text-[#FDA4AF] bg-white/10 px-1.5 py-0.5 rounded-md border border-white/10">Creator</span>
                  </h4>
                  <div className="flex items-center gap-1 text-[9px] text-pink-300 font-bold mt-0.5">
                    <Clock size={10} />
                    <span>{selectedStory.expiresAt}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStory(null)}
                className="text-white bg-white/10 p-2 rounded-full hover:bg-white/25 transition-colors cursor-pointer border border-white/10"
              >
                <X size={15} />
              </button>
            </div>

            {/* Story Navigation Zones (Left / Right Chevron overlays) */}
            <div className="absolute inset-y-0 left-0 w-16 flex items-center justify-start pl-2 z-20 opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={handlePrev}
                disabled={stories.findIndex((s) => s.id === selectedStory.id) === 0}
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

            {/* Media Image Content */}
            <div className="flex-1 w-full h-full relative bg-black flex items-center justify-center">
              <img
                src={selectedStory.mediaUrl}
                alt="Story content"
                className="w-full h-full object-cover select-none"
                onClick={handleNext}
              />

              {/* Floating Emojis DOM Render */}
              {reactions.map((r) => (
                <span
                  key={r.id}
                  style={{ left: `${r.left}%` }}
                  className="absolute bottom-28 text-4xl select-none pointer-events-none z-30 animate-float-reaction"
                >
                  {r.emoji}
                </span>
              ))}
            </div>

            {/* Interactive Emoji Bar & Caption Footer */}
            <div className="p-4 pt-12 bg-gradient-to-t from-black/95 via-black/70 to-transparent absolute bottom-0 left-0 right-0 z-20 space-y-4">
              {selectedStory.caption && (
                <div className="text-center px-2">
                  <p className="text-xs font-semibold text-white leading-relaxed">{selectedStory.caption}</p>
                  <span className="text-[9px] text-white/50 mt-1 block">Created {selectedStory.createdAt}</span>
                </div>
              )}

              {/* Quick Emojis Selection Bar */}
              <div className="flex items-center justify-between gap-1.5 px-3 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 z-30 relative">
                <span className="text-[10px] text-white/60 font-bold hidden xs:inline">React:</span>
                <div className="flex justify-around flex-1">
                  {[
                    { e: '❤️', label: 'love' },
                    { e: '🔥', label: 'fire' },
                    { e: '😂', label: 'laugh' },
                    { e: '😮', label: 'wow' },
                    { e: '👏', label: 'clap' },
                    { e: '🎉', label: 'celebrate' }
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleReact(item.e)}
                      className="text-xl hover:scale-130 transition-transform active:scale-95 duration-200 cursor-pointer"
                    >
                      {item.e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showAddStory && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-[#F3DCE8] max-w-md w-full p-6 space-y-4 shadow-2xl shadow-[#EC4899]/15">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-[#EC4899]" />
                <h3 className="text-sm font-black text-[#18181B] uppercase tracking-tight">Post a 24-Hour Story</h3>
              </div>
              <button
                onClick={() => setShowAddStory(false)}
                className="text-[#71717A] hover:text-[#18181B] p-1 rounded-full hover:bg-[#FFF9FC] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddStory} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[#18181B] mb-1">Status/Story Media URL (Unsplash or direct image)</label>
                <input
                  type="text"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[#18181B] mb-1">Story Caption / Note</label>
                <textarea
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="What are you doing today? e.g. Sketching UI details..."
                  rows={2}
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] focus:bg-white resize-none transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowAddStory(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Publish 24h Story
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

