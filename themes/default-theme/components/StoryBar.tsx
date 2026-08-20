'use client';

import React, { useState, useEffect, useRef, MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Sparkles, ChevronLeft, ChevronRight, Send, Heart, Upload } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export interface StoryMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  isViewed?: boolean;
  createdAt: number;
}

export interface StoryGroup {
  id: string; // usually user id
  isYourStory?: boolean;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  isLive?: boolean; // For live broadcasting badge
  gradientBorder?: string; // custom color theme
  items: StoryMedia[];
}

// Initial mock data with multiple items for some users
const MOCK_STORIES_DATA: StoryGroup[] = [
  {
    id: 'story-your',
    isYourStory: true,
    creatorName: 'Your story',
    creatorUsername: 'abhi_navkhare',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    items: [],
  },
  {
    id: 'c-sonya',
    creatorName: 'Sonya',
    creatorUsername: 'sonyaleena',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    isLive: true,
    gradientBorder: 'from-[#FF0844] to-[#FFB199]',
    items: [
      {
        id: 's-sonya-1',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
        type: 'image',
        caption: 'Live streaming from Dubai studio! 🌆',
        createdAt: Date.now() - 3600000,
      },
      {
        id: 's-sonya-2',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
        type: 'image',
        caption: 'Behind the scenes setup 🎥',
        createdAt: Date.now() - 1800000,
      }
    ],
  },
  {
    id: 'c-adam',
    creatorName: 'Adam',
    creatorUsername: 'adamaddisin',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    gradientBorder: 'from-[#FF8A00] to-[#E52E71]',
    items: [
      {
        id: 's-adam-1',
        url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
        type: 'image',
        caption: 'Street photography session at golden hour 📸',
        createdAt: Date.now() - 7200000,
      }
    ],
  },
  {
    id: 'c-andrew',
    creatorName: 'Andrew',
    creatorUsername: 'andrewdewitt',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    gradientBorder: 'from-[#EC4899] to-[#8B5CF6]',
    items: [
      {
        id: 's-andrew-1',
        url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800',
        type: 'image',
        caption: 'Landscape editing masterclass teaser ✨',
        createdAt: Date.now() - 8000000,
      }
    ]
  },
  {
    id: 'c-nicole',
    creatorName: 'Nicole',
    creatorUsername: 'nicolesegall',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    gradientBorder: 'from-[#F43F5E] to-[#FB7185]',
    items: [
      {
        id: 's-nicole-1',
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
        type: 'image',
        caption: 'Nature walk & macro lens experiments 🌿',
        createdAt: Date.now() - 9000000,
      },
      {
        id: 's-nicole-2',
        url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
        type: 'image',
        caption: 'Found this beauty!',
        createdAt: Date.now() - 8500000,
      }
    ]
  }
];

const GRADIENT_OPTIONS = [
  { id: 'sunset', label: 'Sunset', value: 'from-[#FF8A00] to-[#E52E71]' },
  { id: 'cyber', label: 'Cyber', value: 'from-[#8B5CF6] to-[#EC4899]' },
  { id: 'ocean', label: 'Ocean', value: 'from-[#10B981] to-[#06B6D4]' },
  { id: 'rose', label: 'Rose Gold', value: 'from-[#F43F5E] to-[#FB7185]' },
];

export const StoryBar: React.FC = () => {
  const { user } = useAuth();
  
  // Data state
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>(MOCK_STORIES_DATA);
  
  // Viewer state
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Likes
  const [likedStoryItems, setLikedStoryItems] = useState<Set<string>>(new Set());
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  
  // Uploader state
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string>('');
  const [previewMediaType, setPreviewMediaType] = useState<'image' | 'video' | null>(null);
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_OPTIONS[0].value);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  // --- Story Auto-Progress Logic ---
  useEffect(() => {
    if (activeGroupIndex === null || isPaused) return;

    const group = storyGroups[activeGroupIndex];
    if (!group || !group.items[activeItemIndex]) return;

    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          // Time to advance
          if (activeItemIndex < group.items.length - 1) {
            // Next item in current group
            setActiveItemIndex(prevItem => prevItem + 1);
            return 0;
          } else {
            // Next group
            const nextGroupIndex = activeGroupIndex + 1;
            if (nextGroupIndex < storyGroups.length && storyGroups[nextGroupIndex].items.length > 0) {
              setActiveGroupIndex(nextGroupIndex);
              setActiveItemIndex(0);
              return 0;
            } else {
              // End of all stories
              setActiveGroupIndex(null);
              return 0;
            }
          }
        }
        return prev + (group.items[activeItemIndex].type === 'video' ? 0.5 : 2); // slower for video
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeGroupIndex, activeItemIndex, isPaused, storyGroups]);

  // Mark as viewed when activeItemIndex changes
  useEffect(() => {
    if (activeGroupIndex !== null) {
      const group = storyGroups[activeGroupIndex];
      const item = group?.items[activeItemIndex];
      if (item && !item.isViewed) {
        setStoryGroups(prev => {
          const newGroups = [...prev];
          newGroups[activeGroupIndex] = {
            ...newGroups[activeGroupIndex],
            items: newGroups[activeGroupIndex].items.map((it, idx) => 
              idx === activeItemIndex ? { ...it, isViewed: true } : it
            )
          };
          return newGroups;
        });
      }
    }
  }, [activeGroupIndex, activeItemIndex]);

  // --- Viewer Navigation ---
  const handleNext = () => {
    if (activeGroupIndex === null) return;
    const group = storyGroups[activeGroupIndex];
    if (activeItemIndex < group.items.length - 1) {
      setActiveItemIndex(prev => prev + 1);
      setStoryProgress(0);
    } else {
      const nextGroupIndex = activeGroupIndex + 1;
      if (nextGroupIndex < storyGroups.length && storyGroups[nextGroupIndex].items.length > 0) {
        setActiveGroupIndex(nextGroupIndex);
        setActiveItemIndex(0);
        setStoryProgress(0);
      } else {
        setActiveGroupIndex(null);
      }
    }
  };

  const handlePrev = () => {
    if (activeGroupIndex === null) return;
    if (activeItemIndex > 0) {
      setActiveItemIndex(prev => prev - 1);
      setStoryProgress(0);
    } else {
      const prevGroupIndex = activeGroupIndex - 1;
      // Skip empty groups
      if (prevGroupIndex >= 0) {
        let targetIndex = prevGroupIndex;
        while (targetIndex >= 0 && storyGroups[targetIndex].items.length === 0) {
          targetIndex--;
        }
        if (targetIndex >= 0) {
          setActiveGroupIndex(targetIndex);
          setActiveItemIndex(storyGroups[targetIndex].items.length - 1);
          setStoryProgress(0);
          return;
        }
      }
      setStoryProgress(0); // Just restart current if can't go back
    }
  };

  const handleLikeCurrentStory = () => {
    if (activeGroupIndex === null) return;
    const activeItem = storyGroups[activeGroupIndex].items[activeItemIndex];
    if (!activeItem) return;

    const newLiked = new Set(likedStoryItems);
    if (newLiked.has(activeItem.id)) {
      newLiked.delete(activeItem.id);
    } else {
      newLiked.add(activeItem.id);
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 1000);
    }
    setLikedStoryItems(newLiked);
  };

  // --- List/Carousel Logic ---
  const handleGroupClick = (index: number) => {
    const group = storyGroups[index];
    if (group.isYourStory && group.items.length === 0) {
      setShowAddStoryModal(true);
    } else if (group.items.length > 0) {
      // Find first unread or start from 0
      const firstUnreadIndex = group.items.findIndex(it => !it.isViewed);
      setActiveGroupIndex(index);
      setActiveItemIndex(firstUnreadIndex >= 0 ? firstUnreadIndex : 0);
      setStoryProgress(0);
    }
  };

  const handleAddStoryClick = (e: ReactMouseEvent) => {
    e.stopPropagation();
    setShowAddStoryModal(true);
  };

  const handleStoriesScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    handleStoriesScroll();
    window.addEventListener('resize', handleStoriesScroll);
    return () => window.removeEventListener('resize', handleStoriesScroll);
  }, [storyGroups]);

  const scrollStoriesBy = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // --- Upload Logic ---
  const processFile = (file: File) => {
    if (!file) return;
    if (file.type.startsWith('image/')) {
      setPreviewMediaType('image');
    } else if (file.type.startsWith('video/')) {
      setPreviewMediaType('video');
    } else {
      alert('Please upload an image or video file.');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewMediaUrl(objectUrl);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleAddStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewMediaUrl || isPublishing) return;

    setIsPublishing(true);
    setPublishProgress(0);

    const interval = setInterval(() => {
      setPublishProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          const newMedia: StoryMedia = {
            id: `story-media-${Date.now()}`,
            url: previewMediaUrl,
            type: previewMediaType || 'image',
            caption: newCaption.trim() || undefined,
            createdAt: Date.now(),
            isViewed: true, // creator already viewed their own uploaded story
          };

          setStoryGroups(prevGroups => {
            const newGroups = [...prevGroups];
            // Find "Your story" group
            const yourGroupIndex = newGroups.findIndex(g => g.isYourStory);
            if (yourGroupIndex >= 0) {
              newGroups[yourGroupIndex] = {
                ...newGroups[yourGroupIndex],
                gradientBorder: selectedGradient, // Update gradient theme to latest
                items: [...newGroups[yourGroupIndex].items, newMedia]
              };
            }
            return newGroups;
          });

          setShowAddStoryModal(false);
          setNewCaption('');
          setPreviewMediaUrl('');
          setPreviewMediaType(null);
          setIsPublishing(false);
          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  // derived state for viewer
  const activeGroup = activeGroupIndex !== null ? storyGroups[activeGroupIndex] : null;
  const activeItem = activeGroup?.items[activeItemIndex];

  return (
    <div className="space-y-3 select-none relative group/stories">
      <h3 className="font-black text-base text-[#18181B] dark:text-[#FDF2F8] px-1">
        Stories
      </h3>

      {showLeftScroll && (
        <button
          onClick={() => scrollStoriesBy(-300)}
          className="absolute left-0 top-[60%] -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 rounded-full bg-white dark:bg-[#22152E] shadow-lg border border-[#F3DCE8] dark:border-[#3A2A4C] text-[#18181B] dark:text-[#FDF2F8] hover:bg-[#F4F4F5] dark:hover:bg-[#381A2B] transition-all opacity-0 group-hover/stories:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <div 
        ref={scrollContainerRef}
        onScroll={handleStoriesScroll}
        className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth"
      >
        {storyGroups.map((group, index) => {
          const hasUnread = group.items.some(item => !item.isViewed);
          const hasStories = group.items.length > 0;
          
          return (
            <button
              key={group.id}
              onClick={() => handleGroupClick(index)}
              className="flex flex-col items-center gap-1.5 shrink-0 group/btn cursor-pointer"
            >
              <div className="relative">
                {/* Outer Ring */}
                <div
                  className={`p-0.75 rounded-full transition-all duration-300 group-hover/btn:scale-105 ${
                    group.isYourStory && !hasStories
                      ? 'bg-[#E4E4E7] dark:bg-[#3A2A4C]'
                      : hasUnread
                      ? `bg-gradient-to-tr ${group.gradientBorder || 'from-[#FF8A00] to-[#E52E71]'} shadow-sm ${group.isLive ? 'animate-pulse' : ''}`
                      : 'bg-[#E4E4E7] dark:bg-[#3A2A4C]' // Greyed out if all viewed
                  }`}
                >
                  <img
                    src={user?.avatarUrl && group.isYourStory ? user.avatarUrl : group.creatorAvatar}
                    alt={group.creatorName}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white dark:border-[#150D1E]"
                  />
                </div>

                {/* Blue Plus Badge for Your Story */}
                {group.isYourStory && (
                  <div 
                    onClick={handleAddStoryClick}
                    className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#0095F6] text-white flex items-center justify-center border-2 border-white dark:border-[#150D1E] shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Plus size={13} strokeWidth={3} />
                  </div>
                )}

                {/* Red LIVE Badge */}
                {group.isLive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-[8px] rounded-full uppercase tracking-wider shadow-xs border border-white dark:border-[#150D1E]">
                    LIVE
                  </span>
                )}
              </div>

              <span className={`text-[11px] truncate max-w-[64px] ${!hasUnread && hasStories ? 'font-medium text-[#A1A1AA]' : 'font-bold text-[#18181B] dark:text-[#FDF2F8]'}`}>
                {group.creatorName}
              </span>
            </button>
          )
        })}
      </div>

      {showRightScroll && (
        <button
          onClick={() => scrollStoriesBy(300)}
          className="absolute right-0 top-[60%] -translate-y-1/2 translate-x-4 z-10 w-8 h-8 rounded-full bg-white dark:bg-[#22152E] shadow-lg border border-[#F3DCE8] dark:border-[#3A2A4C] text-[#18181B] dark:text-[#FDF2F8] hover:bg-[#F4F4F5] dark:hover:bg-[#381A2B] transition-all opacity-0 group-hover/stories:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Story Player Lightbox Modal */}
      {activeGroup && activeItem && typeof document !== 'undefined' && (
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black sm:bg-black/95 backdrop-blur-md flex items-center justify-center sm:p-4"
            onClick={() => setActiveGroupIndex(null)}
          >
            <div
              className="relative w-full h-full sm:max-w-sm sm:h-[85vh] sm:rounded-[32px] bg-[#150D1E] overflow-hidden sm:border sm:border-white/20 shadow-2xl flex flex-col text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Instagram style progress bars for multiple items */}
              <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
                {activeGroup.items.map((item, idx) => {
                  let width = '0%';
                  if (idx < activeItemIndex) width = '100%';
                  else if (idx === activeItemIndex) width = `${storyProgress}%`;

                  return (
                    <div key={item.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                      <div
                        style={{ width }}
                        className="bg-white h-full transition-all duration-100 ease-linear rounded-full"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Top Bar Header Overlay */}
              <div className="absolute top-5 left-0 right-0 z-20 flex items-center justify-between px-4 pointer-events-none">
                <div className="flex items-center gap-2.5 pointer-events-auto">
                  <img
                    src={user?.avatarUrl && activeGroup.isYourStory ? user.avatarUrl : activeGroup.creatorAvatar}
                    alt={activeGroup.creatorName}
                    className="w-9 h-9 rounded-full object-cover border border-white/40 shadow-md"
                  />
                  <div className="drop-shadow-md">
                    <p className="font-bold text-sm leading-tight text-white shadow-black/50">{activeGroup.creatorName}</p>
                    <p className="text-[11px] font-medium text-white/90">
                      @{activeGroup.isYourStory && user ? user.username : activeGroup.creatorUsername}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveGroupIndex(null)}
                  className="p-1.5 rounded-full bg-black/20 text-white/90 hover:text-white hover:bg-black/40 backdrop-blur-md transition-colors pointer-events-auto"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Tap zones for manual navigation */}
              <div className="absolute inset-0 z-10 flex pt-16 pb-24">
                <div 
                  className="w-1/3 h-full cursor-pointer" 
                  onClick={handlePrev} 
                  onPointerDown={() => setIsPaused(true)}
                  onPointerUp={() => setIsPaused(false)}
                  onPointerLeave={() => setIsPaused(false)}
                />
                <div 
                  className="w-2/3 h-full cursor-pointer" 
                  onClick={handleNext} 
                  onPointerDown={() => setIsPaused(true)}
                  onPointerUp={() => setIsPaused(false)}
                  onPointerLeave={() => setIsPaused(false)}
                />
              </div>

              {/* Story Media */}
              <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
                {activeItem.type === 'video' ? (
                  <video 
                    src={activeItem.url}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    loop
                    muted
                  />
                ) : (
                  <img
                    src={activeItem.url}
                    alt="Story View"
                    className="w-full h-full object-cover"
                  />
                )}
                
                {activeItem.caption && (
                  <div className="absolute bottom-20 inset-x-0 px-6 drop-shadow-xl text-center z-10 pointer-events-none">
                    <span className="inline-block px-4 py-2 bg-black/60 backdrop-blur-md text-white font-bold text-sm rounded-xl border border-white/10">
                      {activeItem.caption}
                    </span>
                  </div>
                )}

                {/* Floating Heart Overlay */}
                {showHeartAnimation && likedStoryItems.has(activeItem.id) && (
                  <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none overflow-hidden animate-out fade-out zoom-out duration-1000">
                     <Heart size={100} className="text-[#E52E71] fill-[#E52E71] drop-shadow-2xl animate-bounce" />
                  </div>
                )}
              </div>

              {/* Bottom Quick Reply Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
                <div className="flex items-center gap-3 relative z-20">
                  <input
                    type="text"
                    placeholder={`Reply to ${activeGroup.creatorName}...`}
                    className="flex-1 bg-white/15 border border-white/20 backdrop-blur-md rounded-full px-5 py-3 text-sm text-white placeholder-white/80 focus:outline-none focus:border-pink-500 focus:bg-white/20 transition-all shadow-lg"
                    onFocus={() => setIsPaused(true)}
                    onBlur={() => setIsPaused(false)}
                  />
                  <button
                    onClick={handleLikeCurrentStory}
                    className={`relative p-3 rounded-full transition-transform shadow-lg ${
                      likedStoryItems.has(activeItem.id) 
                        ? 'bg-gradient-to-tr from-[#FF8A00] to-[#E52E71] text-white hover:scale-105 active:scale-95' 
                        : 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 hover:scale-105 active:scale-95'
                    }`}
                  >
                    <Heart size={20} className={likedStoryItems.has(activeItem.id) ? "fill-white" : ""} />
                    
                    {showHeartAnimation && likedStoryItems.has(activeItem.id) && (
                      <div className="absolute inset-0 rounded-full border border-pink-400 animate-ping pointer-events-none" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      )}

      {/* Add Story Modal */}
      {showAddStoryModal && typeof document !== 'undefined' && (
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center sm:p-4"
            onClick={() => setShowAddStoryModal(false)}
          >
            <div
              className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md bg-white dark:bg-[#150D1E] sm:rounded-[32px] flex flex-col shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3DCE8] dark:border-[#3A2A4C] bg-white/50 dark:bg-[#150D1E]/50 backdrop-blur-sm sticky top-0 z-10">
                <h4 className="font-black text-base text-[#18181B] dark:text-[#FDF2F8] flex items-center gap-2">
                  <Sparkles size={18} className="text-[#EC4899]" />
                  Add to Your Story
                </h4>
                <button
                  onClick={() => setShowAddStoryModal(false)}
                  className="text-[#71717A] hover:text-[#18181B] dark:hover:text-[#FDF2F8] bg-[#F4F4F5] dark:bg-[#22152E] p-1.5 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                <form onSubmit={handleAddStorySubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] uppercase tracking-wider">
                      Story Media
                    </label>
                    
                    {!previewMediaUrl ? (
                      <div 
                        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                          dragActive 
                            ? 'border-[#EC4899] bg-[#FFF1F7] dark:bg-[#381A2B]' 
                            : 'border-[#E4E4E7] dark:border-[#3A2A4C] hover:border-[#F472B6] hover:bg-[#FFF9FC] dark:hover:bg-[#22152E]'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                        />
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF8A00] to-[#E52E71] flex items-center justify-center text-white mb-3 shadow-md">
                          <Upload size={20} strokeWidth={2.5} />
                        </div>
                        <p className="font-bold text-sm text-[#18181B] dark:text-[#FDF2F8]">
                          Tap or drag to upload
                        </p>
                        <p className="text-xs font-medium text-[#71717A] dark:text-[#A1A1AA] mt-1">
                          Images (JPG, PNG) or short Videos (MP4)
                        </p>
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-[400px] w-full flex items-center justify-center group shadow-inner">
                        {previewMediaType === 'video' ? (
                          <video src={previewMediaUrl} className="w-full h-full object-contain" controls autoPlay loop muted />
                        ) : (
                          <img src={previewMediaUrl} alt="Preview" className="w-full h-full object-contain" />
                        )}
                        <button 
                          type="button"
                          onClick={() => {
                            setPreviewMediaUrl('');
                            setPreviewMediaType(null);
                          }}
                          className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                          title="Remove media"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] uppercase tracking-wider">
                      Caption
                    </label>
                    <input
                      type="text"
                      placeholder="Write a caption or sticker note..."
                      value={newCaption}
                      onChange={(e) => setNewCaption(e.target.value)}
                      className="w-full bg-[#F4F4F5] dark:bg-[#22152E] border border-transparent focus:border-[#EC4899] rounded-xl px-4 py-3 text-sm text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] uppercase tracking-wider">
                      Story Ring Theme
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {GRADIENT_OPTIONS.map((grad) => (
                        <button
                          key={grad.id}
                          type="button"
                          onClick={() => setSelectedGradient(grad.value)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                            selectedGradient === grad.value
                              ? 'border-[#EC4899] bg-[#FFF1F7] dark:bg-[#381A2B]'
                              : 'border-[#E4E4E7] dark:border-[#3A2A4C] bg-white dark:bg-[#150D1E]'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${grad.value} shadow-sm border border-white/20`} />
                          <span className={`text-xs font-bold ${selectedGradient === grad.value ? 'text-[#BE185D] dark:text-[#F472B6]' : 'text-[#71717A] dark:text-[#D4B8D0]'}`}>
                            {grad.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-[#F3DCE8] dark:border-[#3A2A4C] bg-white/50 dark:bg-[#150D1E]/50 backdrop-blur-sm sticky bottom-0 z-10">
                {isPublishing ? (
                  <div className="w-full py-2 space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-bold text-[#71717A] dark:text-[#D4B8D0]">
                      <span>Publishing to your story...</span>
                      <span>{Math.min(publishProgress, 100)}%</span>
                    </div>
                    <div className="w-full bg-[#E4E4E7] dark:bg-[#3A2A4C] h-2.5 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-[#FF8A00] to-[#E52E71] h-full transition-all duration-200 ease-out" 
                        style={{ width: `${publishProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddStorySubmit}
                    disabled={!previewMediaUrl}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white font-black text-sm shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:shadow-none hover:opacity-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    Publish to Story
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      )}
    </div>
  );
};

export default StoryBar;
