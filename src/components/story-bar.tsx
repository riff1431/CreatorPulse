'use client';

import React, { useState } from 'react';
import { Plus, X, Sparkles, Clock, Eye } from 'lucide-react';
import { MOCK_STORIES, Story } from '@/lib/supabase/store';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';

export const StoryBar: React.FC = () => {
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showAddStory, setShowAddStory] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600');

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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#EC4899]" size={16} />
          <h3 className="text-sm font-bold text-[#18181B]">24-Hour Creator Stories</h3>
        </div>
        <span className="text-xs text-[#71717A] font-medium">Ephemeral Status</span>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
        {/* Add Story Button */}
        <button
          onClick={() => setShowAddStory(true)}
          className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-white border-2 border-dashed border-[#F472B6] hover:border-[#EC4899] flex items-center justify-center text-[#EC4899] group-hover:scale-105 transition-all shadow-sm shadow-[#EC4899]/10">
            <Plus size={22} />
          </div>
          <span className="text-[11px] font-semibold text-[#52525B]">Add Story</span>
        </button>

        {/* Active Stories List */}
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => setSelectedStory(story)}
            className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer text-left"
          >
            <Avatar
              alt={story.creatorName}
              src={story.creatorAvatar}
              size="lg"
              hasStory={true}
              className="group-hover:scale-105 transition-transform shadow-sm"
            />
            <span className="text-[11px] font-semibold text-[#52525B] truncate max-w-[70px]">
              @{story.creatorUsername}
            </span>
          </button>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full h-[580px] bg-[#18181B] rounded-[28px] overflow-hidden shadow-2xl border border-white/20 flex flex-col justify-between">
            {/* Header */}
            <div className="p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between absolute top-0 left-0 right-0 z-10">
              <div className="flex items-center gap-2">
                <Avatar alt={selectedStory.creatorName} src={selectedStory.creatorAvatar} size="sm" />
                <div>
                  <h4 className="text-xs font-bold text-white">{selectedStory.creatorName}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-[#F472B6] font-semibold">
                    <Clock size={10} />
                    <span>{selectedStory.expiresAt}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStory(null)}
                className="text-white bg-black/40 p-1.5 rounded-full hover:bg-black/60 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Media Image */}
            <div className="flex-1 w-full h-full relative bg-black">
              <img
                src={selectedStory.mediaUrl}
                alt="Story content"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Caption Footer */}
            {selectedStory.caption && (
              <div className="p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent absolute bottom-0 left-0 right-0 z-10 text-center">
                <p className="text-sm font-medium text-white">{selectedStory.caption}</p>
                <span className="text-[10px] text-white/70 mt-1 block">Created {selectedStory.createdAt}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showAddStory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#F3DCE8] max-w-md w-full p-6 space-y-4 shadow-2xl shadow-[#EC4899]/15">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <h3 className="text-base font-bold text-[#18181B]">Post a 24-Hour Story</h3>
              <button onClick={() => setShowAddStory(false)} className="text-[#71717A] hover:text-[#18181B] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStory} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#18181B] font-semibold mb-1">Image / Media URL</label>
                <input
                  type="text"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[#18181B] font-semibold mb-1">Caption / Status Note</label>
                <textarea
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="What's happening right now?"
                  rows={3}
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] focus:bg-white"
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
