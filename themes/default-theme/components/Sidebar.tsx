'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Compass, Film, Bookmark, LayoutDashboard, Shield, 
  Database, Wallet, Bell, MessageSquare, Sparkles, User, Settings,
  Crown, Lock, BarChart2, Radio, LogOut, Moon, Sun, ChevronRight, ChevronLeft,
  TrendingUp, Users, Palette, Cpu, CheckCircle2, Play, Plus,
  Camera, Flower2, Trees, Plane, Heart, Image as ImageIcon,
  ExternalLink, UserPlus, UserCheck, X, Trash2, Eye, Flame, Award
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useFollow } from '@/lib/follow/use-follow';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { useTheme } from '@/lib/extensions/theme-engine';
import { MOCK_USERS, MOCK_CREATOR_DETAILS } from '@/lib/supabase/store';
import { ProfileCompletionWidget } from './ProfileCompletionWidget';

export interface StoryHighlight {
  id: string;
  title: string;
  coverImage: string;
  isNew?: boolean;
}

export interface FeaturedCreatorItem {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  coverUrl: string;
  category: string;
  bio: string;
  headline: string;
  followerCount: string;
  startingPrice: number;
  isVerified: boolean;
  highlights: StoryHighlight[];
}

const DEFAULT_CREATOR_HIGHLIGHTS: StoryHighlight[] = [
  { id: 'h-1', title: 'Garden', coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300' },
  { id: 'h-2', title: 'Cameras', coverImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300' },
  { id: 'h-3', title: 'Wildlife', coverImage: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=300' },
  { id: 'h-4', title: 'Travel', coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300' },
  { id: 'h-5', title: 'Design', coverImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=300' },
];

const FEATURED_CREATORS: FeaturedCreatorItem[] = [
  {
    id: 'user-creator-1',
    fullName: 'Sarah Jenkins',
    username: 'sarahdesign',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
    category: 'Art & Design',
    bio: 'Senior Product Designer & Educator teaching UI/UX systems.',
    headline: 'UI/UX Design Systems Masterclasses',
    followerCount: '14.2K',
    startingPrice: 5.00,
    isVerified: true,
    highlights: [
      { id: 'h-s1', title: 'Figma', coverImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=300' },
      { id: 'h-s2', title: 'Workshops', coverImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300' },
      { id: 'h-s3', title: 'Freebies', coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300' },
    ]
  },
  {
    id: 'user-creator-2',
    fullName: 'Marcus Vance',
    username: 'marcuscode',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
    coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
    category: 'Education & Tech',
    bio: 'Fullstack Architect & Next.js specialist. Creator of DevScale.',
    headline: 'Next.js 15 & Supabase Architecture',
    followerCount: '22.1K',
    startingPrice: 15.00,
    isVerified: true,
    highlights: [
      { id: 'h-m1', title: 'Next.js', coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300' },
      { id: 'h-m2', title: 'Backend', coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300' },
      { id: 'h-m3', title: 'Tips', coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300' },
    ]
  },
  {
    id: 'c-sonya',
    fullName: 'Sonya Leena',
    username: 'sonyaleena',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    coverUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600',
    category: 'Lifestyle & Travel',
    bio: 'Visual artist living life in high definition across Dubai & beyond.',
    headline: 'Travel, Aesthetics & Lifestyle Stories',
    followerCount: '18.5K',
    startingPrice: 9.00,
    isVerified: true,
    highlights: [
      { id: 'h-so1', title: 'Dubai', coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300' },
      { id: 'h-so2', title: 'Vlogs', coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' },
      { id: 'h-so3', title: 'Style', coverImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300' },
    ]
  },
  {
    id: 'c-adam',
    fullName: 'Adam Addisin',
    username: 'adamaddisin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    coverUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',
    category: 'Photography',
    bio: 'Professional street & studio photographer. Framing real moments.',
    headline: 'Cinematic Photography & Color Grading',
    followerCount: '24.8K',
    startingPrice: 12.00,
    isVerified: true,
    highlights: [
      { id: 'h-a1', title: 'Cameras', coverImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300' },
      { id: 'h-a2', title: 'Presets', coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=300' },
      { id: 'h-a3', title: 'Street', coverImage: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=300' },
    ]
  },
];

const PRESET_HIGHLIGHT_COVERS = [
  'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300',
  'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=300',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300',
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=300',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300',
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { role, user, isAuthenticated, logout, requireAuth } = useAuth();
  const { counts: globalFollowCounts } = useFollow();
  const { settings } = useSiteSettings();
  const { activeTheme, isDarkMode, toggleDarkMode } = useTheme();

  const isCreator = role === 'creator';

  // Creator Story Highlights state
  const [creatorHighlights, setCreatorHighlights] = useState<StoryHighlight[]>([]);
  const [activeHighlight, setActiveHighlight] = useState<StoryHighlight | null>(null);
  const [showAddHighlightModal, setShowAddHighlightModal] = useState(false);
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const [newHighlightCover, setNewHighlightCover] = useState(PRESET_HIGHLIGHT_COVERS[0]);
  const [customCoverUrl, setCustomCoverUrl] = useState('');

  // Fan User: Featured Creators Auto-Rotating Spotlight state
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timerProgress, setTimerProgress] = useState(0);

  const logoUrl = settings.logo_url || activeTheme?.settings?.logoUrl;
  const siteName = settings.site_name || 'CreatorPulse';

  // Active creator details if logged in as creator
  const currentCreatorUser = user || {
    id: 'user-creator-1',
    email: 'sarah@designcode.com',
    fullName: 'Sarah Jenkins',
    username: 'sarahdesign',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    bio: 'Senior Product Designer & Educator. Teaching UI/UX design engineering.',
    role: 'creator',
    category: 'Art & Design',
    isVerified: true,
    status: 'active' as const,
    createdAt: '2025-11-10'
  };

  // Active creator follow stats
  const { counts: creatorFollowStats } = useFollow(currentCreatorUser.id);

  // Current featured creator for fan user
  const currentFeatured = FEATURED_CREATORS[featuredIndex] || FEATURED_CREATORS[0];
  const { isFollowing: isFeaturedFollowing, follow: followFeatured, unfollow: unfollowFeatured } = useFollow(currentFeatured.id);

  // 1. Load & persist creator highlights
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {
      const storageKey = `creatorpulse_highlights_${user.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setCreatorHighlights(JSON.parse(saved));
        } catch (e) {
          setCreatorHighlights(DEFAULT_CREATOR_HIGHLIGHTS);
        }
      } else {
        setCreatorHighlights(DEFAULT_CREATOR_HIGHLIGHTS);
      }
    } else {
      setCreatorHighlights(DEFAULT_CREATOR_HIGHLIGHTS);
    }
  }, [user?.id, isCreator]);

  const saveCreatorHighlights = (newHighlights: StoryHighlight[]) => {
    setCreatorHighlights(newHighlights);
    if (typeof window !== 'undefined' && user?.id) {
      localStorage.setItem(`creatorpulse_highlights_${user.id}`, JSON.stringify(newHighlights));
    }
  };

  const handleAddHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHighlightTitle.trim()) return;

    const chosenCover = customCoverUrl.trim() || newHighlightCover || PRESET_HIGHLIGHT_COVERS[0];
    const newHighlight: StoryHighlight = {
      id: `highlight-${Date.now()}`,
      title: newHighlightTitle.trim(),
      coverImage: chosenCover,
    };

    const updated = [newHighlight, ...creatorHighlights];
    saveCreatorHighlights(updated);
    setShowAddHighlightModal(false);
    setNewHighlightTitle('');
    setCustomCoverUrl('');
  };

  const handleDeleteHighlight = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = creatorHighlights.filter(h => h.id !== id);
    saveCreatorHighlights(updated);
    if (activeHighlight?.id === id) {
      setActiveHighlight(null);
    }
  };

  // 2. Auto-rotate Featured Creators for Fan Users (every 3 seconds)
  useEffect(() => {
    if (isCreator || isPaused) return;

    const INTERVAL_MS = 3000;
    const STEP_MS = 50;
    const increment = (STEP_MS / INTERVAL_MS) * 100;

    const timer = setInterval(() => {
      setTimerProgress((prev) => {
        if (prev >= 100) {
          setFeaturedIndex((idx) => (idx + 1) % FEATURED_CREATORS.length);
          return 0;
        }
        return prev + increment;
      });
    }, STEP_MS);

    return () => clearInterval(timer);
  }, [isCreator, isPaused, featuredIndex]);

  const handleNextFeatured = () => {
    setFeaturedIndex((idx) => (idx + 1) % FEATURED_CREATORS.length);
    setTimerProgress(0);
  };

  const handlePrevFeatured = () => {
    setFeaturedIndex((idx) => (idx - 1 + FEATURED_CREATORS.length) % FEATURED_CREATORS.length);
    setTimerProgress(0);
  };

  const handleSelectFeatured = (index: number) => {
    setFeaturedIndex(index);
    setTimerProgress(0);
  };

  // Navigation Items
  const navItems = [
    { label: 'Feed', href: '/feed', icon: Home },
    { label: 'Explore', href: '/explore', icon: Compass },
    { 
      label: 'Connections', 
      href: '/connections', 
      icon: Users, 
      badge: globalFollowCounts.pendingIncomingCount > 0 ? `${globalFollowCounts.pendingIncomingCount}` : undefined, 
      badgeColor: 'bg-amber-500 text-white' 
    },
    { label: 'Reels', href: '/shorts', icon: Film, badge: 'Hot', badgeColor: 'bg-rose-500 text-white' },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-72 2xl:w-80 hidden lg:flex flex-col gap-4 p-4 sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar rounded-[32px] border border-[#F3DCE8]/80 dark:border-[#3A2A4C]/80 bg-white/90 dark:bg-[#150D1E]/90 backdrop-blur-xl shrink-0 shadow-sm shadow-pink-500/5 select-none">
      
      {/* 1. App Brand Logo & Theme Toggle */}
      <div className="flex items-center justify-between px-2 pt-1">
        <Link href="/feed" className="flex items-center gap-2.5 group min-w-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={siteName}
              className="h-8 sm:h-9 w-auto max-w-[150px] object-contain rounded-xl group-hover:scale-102 transition-transform"
            />
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF8A00] via-[#EC4899] to-[#7928CA] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Sparkles size={18} />
              </div>
              <span className="text-lg font-black tracking-tight text-[#18181B] dark:text-[#FDF2F8] truncate font-sans">
                {siteName}
              </span>
            </div>
          )}
        </Link>

        {/* Quick Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-[#71717A] dark:text-[#D4B8D0] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E] transition-colors cursor-pointer"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. CREATOR VIEW: Creator Profile Card + Story Highlights                  */}
      {/* ========================================================================= */}
      {isCreator ? (
        <>
          {/* Creator Profile Card Section */}
          <div data-tour="sidebar-profile" className="p-4 rounded-[26px] bg-gradient-to-b from-[#FFF9FC] to-[#FFF1F7]/70 dark:from-[#22152E] dark:to-[#1A1024] border border-[#F3DCE8] dark:border-[#3A2A4C] text-center space-y-3 shadow-2xs relative overflow-hidden">
            {/* Creator Badge Pill */}
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF8A00] to-[#EC4899] text-white text-[9px] font-black uppercase tracking-wider shadow-2xs flex items-center gap-1">
              <Crown size={10} />
              <span>Creator</span>
            </div>

            {/* Avatar with Vibrant Gradient Ring */}
            <div className="relative inline-block mx-auto pt-1">
              <div className="p-0.75 rounded-full bg-gradient-to-tr from-[#FF8A00] via-[#EC4899] to-[#7928CA] shadow-sm">
                <img
                  src={currentCreatorUser.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'}
                  alt={currentCreatorUser.fullName || 'Creator'}
                  className="w-18 h-18 rounded-full object-cover border-2 border-white dark:border-[#150D1E]"
                />
              </div>
            </div>

            {/* Name & Handle */}
            <div>
              <div className="flex items-center justify-center gap-1">
                <h3 className="font-extrabold text-sm text-[#18181B] dark:text-[#FDF2F8]">
                  {currentCreatorUser.fullName || 'Sarah Jenkins'}
                </h3>
                {currentCreatorUser.isVerified !== false && (
                  <CheckCircle2 size={13} className="text-[#EC4899] fill-[#EC4899] text-white" />
                )}
              </div>
              <p className="text-xs text-[#A1A1AA] dark:text-[#8E7890] font-medium">
                @{currentCreatorUser.username || 'sarahdesign'}
              </p>
            </div>

            {/* Dynamic Stats Row (Posts | Followers | Following) */}
            <div className="flex items-center justify-center divide-x divide-[#F3DCE8] dark:divide-[#3A2A4C] pt-1">
              <div className="px-3 text-center">
                <p className="font-black text-xs text-[#18181B] dark:text-[#FDF2F8]">
                  {currentCreatorUser.role === 'creator' ? '472' : '12'}
                </p>
                <p className="text-[10px] text-[#A1A1AA] dark:text-[#8E7890] font-semibold">Posts</p>
              </div>
              <div className="px-3 text-center">
                <p className="font-black text-xs text-[#18181B] dark:text-[#FDF2F8]">
                  {creatorFollowStats.followersCount > 0 ? `${creatorFollowStats.followersCount}` : '14.2K'}
                </p>
                <p className="text-[10px] text-[#A1A1AA] dark:text-[#8E7890] font-semibold">Followers</p>
              </div>
              <div className="px-3 text-center">
                <p className="font-black text-xs text-[#18181B] dark:text-[#FDF2F8]">
                  {creatorFollowStats.followingCount > 0 ? `${creatorFollowStats.followingCount}` : '340'}
                </p>
                <p className="text-[10px] text-[#A1A1AA] dark:text-[#8E7890] font-semibold">Following</p>
              </div>
            </div>

            {/* Bio Text */}
            <div className="pt-1 text-[11px] text-[#71717A] dark:text-[#D4B8D0] font-medium leading-relaxed">
              <p className="font-bold text-[#18181B] dark:text-[#FDF2F8]">
                {currentCreatorUser.category || 'Art & Design'}
              </p>
              <p className="line-clamp-2">
                {currentCreatorUser.bio || 'Senior Product Designer & Educator. Teaching UI/UX design engineering.'}
              </p>
            </div>

            {/* Creator Profile Link Button */}
            <Link
              href={`/c/${currentCreatorUser.username || 'sarahdesign'}`}
              className="mt-1 w-full py-1.5 px-3 rounded-xl bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#EC4899] text-[11px] font-bold text-[#BE185D] dark:text-[#F472B6] hover:bg-[#FFF1F7] dark:hover:bg-[#381A2B] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>View Creator Page</span>
              <ExternalLink size={12} />
            </Link>
          </div>

          {/* Story Highlights Section (Dynamic & Functional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <h4 className="font-extrabold text-xs text-[#18181B] dark:text-[#FDF2F8] flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#EC4899]" />
                <span>Story Highlights</span>
              </h4>
              <span className="text-[10px] text-[#A1A1AA] font-bold">
                {creatorHighlights.length} {creatorHighlights.length === 1 ? 'story' : 'stories'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 px-1">
              {/* + New Highlight Button */}
              <button
                type="button"
                onClick={() => setShowAddHighlightModal(true)}
                className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
                title="Add new story highlight"
              >
                <div className="w-11 h-11 rounded-full border-2 border-dashed border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-center text-[#71717A] dark:text-[#D4B8D0] group-hover:border-[#EC4899] group-hover:text-[#EC4899] group-hover:scale-105 transition-all bg-[#FFF9FC] dark:bg-[#22152E]">
                  <Plus size={16} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold text-[#71717A] dark:text-[#D4B8D0] group-hover:text-[#18181B] dark:group-hover:text-[#FDF2F8]">
                  New
                </span>
              </button>

              {/* Highlight Items */}
              {creatorHighlights.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveHighlight(item)}
                  className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer relative"
                >
                  <div className="p-0.5 rounded-full border border-[#F3DCE8] dark:border-[#3A2A4C] group-hover:border-[#EC4899] group-hover:scale-105 transition-all bg-white dark:bg-[#150D1E] shadow-2xs">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#71717A] dark:text-[#D4B8D0] group-hover:text-[#18181B] dark:group-hover:text-[#FDF2F8] truncate max-w-[50px]">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* ========================================================================= */
        /* 3. FAN USER VIEW: Auto-Rotating Featured Creators Spotlight (3s Timer)    */
        /* ========================================================================= */
        <div 
          className="space-y-3"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Spotlight Header Bar */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-1.5">
              <Flame size={14} className="text-[#FF8A00] animate-bounce" />
              <h4 className="font-extrabold text-xs text-[#18181B] dark:text-[#FDF2F8]">
                Featured Creators
              </h4>
            </div>

            {/* Auto-Rotation Controls & Counter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#A1A1AA]">
                {featuredIndex + 1}/{FEATURED_CREATORS.length}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handlePrevFeatured}
                  className="p-1 rounded-md text-[#71717A] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E] transition-colors"
                  title="Previous creator"
                >
                  <ChevronLeft size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleNextFeatured}
                  className="p-1 rounded-md text-[#71717A] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E] transition-colors"
                  title="Next creator"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* 3s Auto-Timer Progress Line */}
          <div className="w-full bg-[#F3DCE8]/50 dark:bg-[#3A2A4C]/50 h-1 rounded-full overflow-hidden">
            <div
              style={{ width: `${timerProgress}%` }}
              className="h-full bg-gradient-to-r from-[#FF8A00] via-[#EC4899] to-[#7928CA] transition-all duration-75 ease-linear rounded-full"
            />
          </div>

          {/* Featured Creator Spotlight Card */}
          <div className="rounded-[26px] bg-gradient-to-b from-[#FFF9FC] to-[#FFF1F7]/70 dark:from-[#22152E] dark:to-[#1A1024] border border-[#F3DCE8] dark:border-[#3A2A4C] overflow-hidden shadow-2xs transition-all duration-300">
            {/* Banner Header with Category Badge */}
            <div className="relative h-20 w-full overflow-hidden bg-zinc-800">
              <img
                src={currentFeatured.coverUrl}
                alt={currentFeatured.fullName}
                className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider border border-white/20">
                {currentFeatured.category}
              </span>

              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#EC4899]/90 backdrop-blur-md text-white text-[9px] font-black tracking-wide flex items-center gap-1">
                <Sparkles size={9} />
                <span>Featured</span>
              </span>
            </div>

            {/* Creator Info Body */}
            <div className="p-3.5 pt-0 -mt-7 text-center space-y-2.5 relative">
              {/* Creator Avatar */}
              <div className="relative inline-block mx-auto">
                <div className="p-0.75 rounded-full bg-gradient-to-tr from-[#FF8A00] via-[#EC4899] to-[#7928CA] shadow-md">
                  <img
                    src={currentFeatured.avatarUrl}
                    alt={currentFeatured.fullName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-[#150D1E]"
                  />
                </div>
              </div>

              {/* Name & Handle */}
              <div>
                <div className="flex items-center justify-center gap-1">
                  <h3 className="font-extrabold text-sm text-[#18181B] dark:text-[#FDF2F8]">
                    {currentFeatured.fullName}
                  </h3>
                  {currentFeatured.isVerified && (
                    <CheckCircle2 size={13} className="text-[#EC4899] fill-[#EC4899] text-white" />
                  )}
                </div>
                <p className="text-xs text-[#A1A1AA] dark:text-[#8E7890] font-medium">
                  @{currentFeatured.username}
                </p>
              </div>

              {/* Stats & Pricing Pill */}
              <div className="flex items-center justify-center gap-2 py-1 px-2.5 rounded-xl bg-white/80 dark:bg-[#150D1E]/80 border border-[#F3DCE8] dark:border-[#3A2A4C] text-[10px] font-bold text-[#71717A] dark:text-[#D4B8D0]">
                <span>{currentFeatured.followerCount} followers</span>
                <span>•</span>
                <span className="text-[#BE185D] dark:text-[#F472B6] font-extrabold">
                  From ${currentFeatured.startingPrice}/mo
                </span>
              </div>

              {/* Headline / Bio */}
              <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] font-medium line-clamp-2 leading-relaxed px-1">
                {currentFeatured.headline || currentFeatured.bio}
              </p>

              {/* Action Buttons: Follow Toggle & View Profile */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    requireAuth(() => {
                      if (isFeaturedFollowing) unfollowFeatured();
                      else followFeatured();
                    }, { 
                      title: `Follow ${currentFeatured.fullName}`,
                      subtitle: 'Sign in or join to follow creators and receive their latest updates.' 
                    });
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                    isFeaturedFollowing
                      ? 'bg-[#F4F4F5] dark:bg-[#22152E] text-[#18181B] dark:text-[#FDF2F8] border border-[#E4E4E7] dark:border-[#3A2A4C]'
                      : 'bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white hover:opacity-95 shadow-pink-500/20'
                  }`}
                >
                  {isFeaturedFollowing ? (
                    <>
                      <UserCheck size={13} />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={13} />
                      <span>Follow</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/c/${currentFeatured.username}`}
                  className="py-2 px-3 rounded-xl bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#EC4899] text-[#18181B] dark:text-[#FDF2F8] hover:text-[#BE185D] dark:hover:text-[#F472B6] text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                >
                  <span>Profile</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* Featured Creator's Highlights Preview */}
          {currentFeatured.highlights && currentFeatured.highlights.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between px-2 text-[10px] font-bold text-[#A1A1AA]">
                <span>@{currentFeatured.username}&apos;s Highlights</span>
                <span>{currentFeatured.highlights.length} stories</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
                {currentFeatured.highlights.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setActiveHighlight(h)}
                    className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
                  >
                    <div className="p-0.5 rounded-full border border-[#F3DCE8] dark:border-[#3A2A4C] group-hover:border-[#EC4899] group-hover:scale-105 transition-all bg-white dark:bg-[#150D1E] shadow-2xs">
                      <img
                        src={h.coverImage}
                        alt={h.title}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    </div>
                    <span className="text-[9px] font-bold text-[#71717A] dark:text-[#D4B8D0] group-hover:text-[#18181B] dark:group-hover:text-[#FDF2F8] truncate max-w-[45px]">
                      {h.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pagination Indicators / Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {FEATURED_CREATORS.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => handleSelectFeatured(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  featuredIndex === idx
                    ? 'w-5 h-1.5 bg-gradient-to-r from-[#FF8A00] to-[#E52E71]'
                    : 'w-1.5 h-1.5 bg-[#E4E4E7] dark:bg-[#3A2A4C] hover:bg-[#A1A1AA]'
                }`}
                title={`View ${c.fullName}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Profile Completion Widget (Compact) */}
      <ProfileCompletionWidget variant="compact" />

      {/* 4. Navigation Menu List */}
      <div className="space-y-1 pt-2 border-t border-[#F3DCE8] dark:border-[#3A2A4C] flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && item.href !== '/feed' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#FCE7F3] text-[#BE185D] dark:bg-[#381A2B] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] shadow-2xs'
                  : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-[#EC4899] dark:text-[#F472B6]' : 'text-[#A1A1AA] dark:text-[#8E7890]'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xs ${item.badgeColor || 'bg-[#EC4899] text-white'}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Logout button */}
        <button
          type="button"
          onClick={() => (logout ? logout() : (window.location.href = '/auth/login'))}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer mt-2"
        >
          <LogOut size={18} className="text-[#A1A1AA]" />
          <span>Logout</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. STORY HIGHLIGHT VIEWER MODAL                                           */}
      {/* ========================================================================= */}
      {activeHighlight && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveHighlight(null)}
        >
          <div 
            className="relative max-w-sm w-full bg-[#150D1E] rounded-3xl overflow-hidden border border-white/20 shadow-2xl p-5 text-center space-y-4 text-white" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img 
                  src={activeHighlight.coverImage} 
                  alt={activeHighlight.title} 
                  className="w-9 h-9 rounded-full object-cover border border-white/30" 
                />
                <div className="text-left">
                  <span className="font-extrabold text-sm block">{activeHighlight.title}</span>
                  <span className="text-[10px] text-white/70">Story Highlight</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isCreator && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteHighlight(activeHighlight.id, e)}
                    className="p-1.5 rounded-full bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 hover:text-white transition-colors"
                    title="Delete highlight"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button 
                  onClick={() => setActiveHighlight(null)} 
                  className="p-1.5 rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-[420px] w-full flex items-center justify-center shadow-inner">
              <img 
                src={activeHighlight.coverImage} 
                alt={activeHighlight.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
              <div className="absolute bottom-4 inset-x-4 text-center">
                <span className="inline-block px-4 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white font-bold text-xs border border-white/20">
                  ✨ {activeHighlight.title}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CREATE NEW HIGHLIGHT MODAL (FOR CREATORS)                              */}
      {/* ========================================================================= */}
      {showAddHighlightModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowAddHighlightModal(false)}
        >
          <div
            className="relative max-w-md w-full bg-white dark:bg-[#150D1E] rounded-3xl overflow-hidden border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF8A00] to-[#E52E71] flex items-center justify-center text-white">
                  <Sparkles size={16} />
                </div>
                <h3 className="font-black text-sm text-[#18181B] dark:text-[#FDF2F8]">
                  Create Story Highlight
                </h3>
              </div>
              <button
                onClick={() => setShowAddHighlightModal(false)}
                className="text-[#71717A] hover:text-[#18181B] dark:hover:text-[#FDF2F8] p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddHighlight} className="space-y-4">
              {/* Highlight Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                  Highlight Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Travel, BTS, Design, Tips..."
                  value={newHighlightTitle}
                  onChange={(e) => setNewHighlightTitle(e.target.value)}
                  className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] font-medium"
                />
              </div>

              {/* Cover Presets */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                  Select Cover Photo Preset
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_HIGHLIGHT_COVERS.map((cover, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewHighlightCover(cover);
                        setCustomCoverUrl('');
                      }}
                      className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                        newHighlightCover === cover && !customCoverUrl
                          ? 'border-[#EC4899] scale-105 shadow-md shadow-pink-500/20 ring-2 ring-pink-500/30'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={cover} alt="Cover preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Or Custom Cover URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                  Or Custom Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customCoverUrl}
                  onChange={(e) => setCustomCoverUrl(e.target.value)}
                  className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] font-medium"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!newHighlightTitle.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white font-extrabold text-xs shadow-lg shadow-pink-500/20 hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={16} strokeWidth={3} />
                <span>Save Story Highlight</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </aside>
  );
};

export default Sidebar;

