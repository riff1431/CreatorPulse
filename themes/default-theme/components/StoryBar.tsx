'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Sparkles, Clock, ChevronLeft, ChevronRight, Send, AlertCircle, Lock, Eye, CheckCircle2, Radio, Heart } from 'lucide-react';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { useAuth } from '@/lib/auth/auth-context';

export interface StoryCircleItem {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  isLive?: boolean;
  isYourStory?: boolean;
  hasStory?: boolean;
  storyMediaUrl?: string;
  caption?: string;
  gradientBorder?: string;
}

const MOCK_STORIES_DATA: StoryCircleItem[] = [
  {
    id: 'story-your',
    creatorId: 'user-member',
    creatorName: 'Your story',
    creatorUsername: 'abhi_navkhare',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    isYourStory: true,
    hasStory: false,
  },
  {
    id: 'story-sonya',
    creatorId: 'c-sonya',
    creatorName: 'Sonya',
    creatorUsername: 'sonyaleena',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    isLive: true,
    hasStory: true,
    storyMediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    caption: 'Live streaming from Dubai studio! Join the chat 🌆',
    gradientBorder: 'from-[#FF0844] to-[#FFB199]',
  },
  {
    id: 'story-adam',
    creatorId: 'c-adam',
    creatorName: 'Adam',
    creatorUsername: 'adamaddisin',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    hasStory: true,
    storyMediaUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
    caption: 'Street photography session at golden hour 📸',
    gradientBorder: 'from-[#FF8A00] to-[#E52E71]',
  },
  {
    id: 'story-andrew',
    creatorId: 'c-andrew',
    creatorName: 'Andrew',
    creatorUsername: 'andrewdewitt',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    hasStory: true,
    storyMediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
    caption: 'Landscape editing masterclass teaser ✨',
    gradientBorder: 'from-[#EC4899] to-[#8B5CF6]',
  },
  {
    id: 'story-nicole',
    creatorId: 'c-nicole',
    creatorName: 'Nicole',
    creatorUsername: 'nicolesegall',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    hasStory: true,
    storyMediaUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800',
    caption: 'Exploring architectural geometry in New Delhi 🏛️',
    gradientBorder: 'from-[#F43F5E] to-[#FB7185]',
  },
  {
    id: 'story-ashley',
    creatorId: 'c-ashley',
    creatorName: 'Ashley',
    creatorUsername: 'ashleyvance',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    hasStory: true,
    storyMediaUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
    caption: 'Nature walk & macro lens experiments 🌿',
    gradientBorder: 'from-[#10B981] to-[#06B6D4]',
  },
  {
    id: 'story-michael',
    creatorId: 'c-michael',
    creatorName: 'Michael',
    creatorUsername: 'michaelgilmore',
    creatorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
    hasStory: true,
    storyMediaUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
    caption: 'Backstage film production moments 🎬',
    gradientBorder: 'from-[#6366F1] to-[#EC4899]',
  },
  {
    id: 'story-damian',
    creatorId: 'c-damian',
    creatorName: 'Damian',
    creatorUsername: 'damianefron',
    creatorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
    hasStory: true,
    storyMediaUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
    caption: 'Wilderness camping & night sky timelapses 🌌',
    gradientBorder: 'from-[#F59E0B] to-[#EF4444]',
  },
];

export const StoryBar: React.FC = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<StoryCircleItem[]>(MOCK_STORIES_DATA);
  const [activeStory, setActiveStory] = useState<StoryCircleItem | null>(null);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [storyProgress, setStoryProgress] = useState(0);

  // Auto-progress story timer when viewing
  useEffect(() => {
    if (!activeStory) {
      setStoryProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          // Advance to next story or close
          const currentIndex = stories.findIndex((s) => s.id === activeStory.id);
          if (currentIndex < stories.length - 1) {
            setActiveStory(stories[currentIndex + 1]);
            return 0;
          } else {
            setActiveStory(null);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStory, stories]);

  const handleStoryClick = (item: StoryCircleItem) => {
    if (item.isYourStory) {
      setShowAddStoryModal(true);
    } else {
      setActiveStory(item);
      setStoryProgress(0);
    }
  };

  const handleAddStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    const newStory: StoryCircleItem = {
      id: `story-custom-${Date.now()}`,
      creatorId: 'user-member',
      creatorName: 'You',
      creatorUsername: user?.username || 'abhi_navkhare',
      creatorAvatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      hasStory: true,
      storyMediaUrl: newImageUrl.trim(),
      caption: newCaption.trim() || 'My new story snapshot ✨',
      gradientBorder: 'from-[#FF8A00] to-[#E52E71]',
    };

    setStories([stories[0], newStory, ...stories.slice(1)]);
    setShowAddStoryModal(false);
    setNewCaption('');
    setNewImageUrl('');
  };

  return (
    <div className="space-y-3 select-none">
      {/* Section Title matching the Mockup */}
      <h3 className="font-black text-base text-[#18181B] dark:text-[#FDF2F8] px-1">
        Stories
      </h3>

      {/* Horizontal Carousel */}
      <div className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-1 px-1">
        {stories.map((item) => (
          <button
            key={item.id}
            onClick={() => handleStoryClick(item)}
            className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
          >
            <div className="relative">
              {/* Outer Ring */}
              <div
                className={`p-0.75 rounded-full transition-all duration-300 group-hover:scale-105 ${
                  item.isYourStory
                    ? 'bg-[#E4E4E7] dark:bg-[#3A2A4C]'
                    : item.isLive
                    ? 'bg-gradient-to-tr from-[#FF0844] via-[#EC4899] to-[#FFB199] shadow-sm animate-pulse'
                    : `bg-gradient-to-tr ${item.gradientBorder || 'from-[#FF8A00] to-[#E52E71]'} shadow-sm`
                }`}
              >
                <img
                  src={item.creatorAvatar}
                  alt={item.creatorName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white dark:border-[#150D1E]"
                />
              </div>

              {/* Blue Plus Badge for Your Story */}
              {item.isYourStory && (
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#0095F6] text-white flex items-center justify-center border-2 border-white dark:border-[#150D1E] shadow-2xs">
                  <Plus size={13} strokeWidth={3} />
                </span>
              )}

              {/* Red LIVE Badge */}
              {item.isLive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-[8px] rounded-full uppercase tracking-wider shadow-xs border border-white dark:border-[#150D1E]">
                  LIVE
                </span>
              )}
            </div>

            {/* Label */}
            <span className="text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] truncate max-w-[64px]">
              {item.creatorName}
            </span>
          </button>
        ))}
      </div>

      {/* Story Player Lightbox Modal */}
      {activeStory && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveStory(null)}
        >
          <div
            className="relative max-w-sm w-full bg-[#150D1E] rounded-3xl overflow-hidden border border-white/20 shadow-2xl space-y-3 p-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Bar */}
            <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
              <div
                style={{ width: `${storyProgress}%` }}
                className="bg-white h-full transition-all duration-100 ease-linear rounded-full"
              />
            </div>

            {/* Top Bar Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={activeStory.creatorAvatar}
                  alt={activeStory.creatorName}
                  className="w-8 h-8 rounded-full object-cover border border-white/40"
                />
                <div>
                  <p className="font-bold text-xs">{activeStory.creatorName}</p>
                  <p className="text-[10px] text-white/70">@{activeStory.creatorUsername}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveStory(null)}
                className="p-1 rounded-full text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Story Image */}
            <div className="relative rounded-2xl overflow-hidden h-96">
              <img
                src={activeStory.storyMediaUrl || activeStory.creatorAvatar}
                alt="Story View"
                className="w-full h-full object-cover"
              />
              {activeStory.caption && (
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-xs font-semibold text-white">
                  {activeStory.caption}
                </div>
              )}
            </div>

            {/* Bottom Quick Reply */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder={`Reply to ${activeStory.creatorName}...`}
                className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-white/60 focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={() => setActiveStory(null)}
                className="p-2 rounded-full bg-pink-600 text-white hover:bg-pink-500"
              >
                <Heart size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Story Modal */}
      {showAddStoryModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowAddStoryModal(false)}
        >
          <div
            className="relative max-w-md w-full bg-white dark:bg-[#150D1E] rounded-3xl p-6 border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-3">
              <h4 className="font-black text-sm text-[#18181B] dark:text-[#FDF2F8]">
                Add to Your Story
              </h4>
              <button
                onClick={() => setShowAddStoryModal(false)}
                className="text-[#71717A] hover:text-[#18181B] dark:hover:text-[#FDF2F8]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStorySubmit} className="space-y-3">
              <input
                type="url"
                required
                placeholder="Story Image URL (e.g. https://images.unsplash.com/...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899]"
              />

              <input
                type="text"
                placeholder="Story caption / sticker note..."
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899]"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white font-black text-xs shadow-md hover:opacity-95 transition-opacity cursor-pointer"
              >
                Publish to Story
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryBar;
