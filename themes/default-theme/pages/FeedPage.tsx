'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { 
  Search, Bell, MessageSquare, Plus, Camera, ImagePlus,
  Sparkles, X, Heart, Bookmark, Share2, MoreHorizontal,
  Send, Compass, Filter, RefreshCw
} from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { StoryBar } from '../components/StoryBar';
import { PostCard } from '../components/PostCard';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { WelcomeModal } from '../components/WelcomeModal';
import { GuidedTour } from '../components/GuidedTour';
import { FirstActionsWidget } from '../components/FirstActionsWidget';
import { UserNavDropdown } from '../components/UserNavDropdown';
import { NotificationsModal, getStoredNotificationsUnreadCount } from '../components/NotificationsModal';
import { MessagesModal, getStoredMessagesUnreadCount } from '../components/MessagesModal';

import { Post } from '@/lib/supabase/store';
import { useAuth } from '@/lib/auth/auth-context';
import { getFtueState } from '@/lib/ftue/ftue-store';
import { prefersReducedMotion } from '../utils/animations';
import { useContentPreferences } from '@/lib/preferences/use-content-preferences';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { useTheme } from '@/lib/extensions/theme-engine';

const MOCK_MOCKUP_POSTS: Post[] = [
  {
    id: 'post-sonya',
    authorId: 'c-sonya',
    authorName: 'Sonya Leena',
    authorUsername: 'sonyaleena',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    authorVerified: true,
    authorCategory: 'Dubai, UAE',
    content: 'You can never dull my sparkle ✨ Living life in high definition.',
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    postType: 'image',
    visibility: 'public',
    likesCount: 360,
    commentsCount: 24,
    viewsCount: 1420,
    createdAt: '2h ago',
  },
  {
    id: 'post-adam',
    authorId: 'c-adam',
    authorName: 'Adam Addisin',
    authorUsername: 'adamaddisin',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    authorVerified: true,
    authorCategory: 'Oklahoma, US',
    content: 'In photography, there is a reality so subtle that it becomes more real than reality itself. 📷',
    mediaUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
    postType: 'image',
    visibility: 'public',
    likesCount: 512,
    commentsCount: 42,
    viewsCount: 2890,
    createdAt: '4h ago',
  },
  {
    id: 'post-andrew',
    authorId: 'c-andrew',
    authorName: 'Andrew Dewitt',
    authorUsername: 'andrewdewitt',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    authorVerified: true,
    authorCategory: 'Overland Park, KS',
    content: 'The unexpected moment is always sweeter! Capturing the golden hour tones. ☀️',
    mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
    postType: 'image',
    visibility: 'public',
    likesCount: 428,
    commentsCount: 19,
    viewsCount: 1980,
    createdAt: '6h ago',
  },
  {
    id: 'post-nicole',
    authorId: 'c-nicole',
    authorName: 'Nicole Segall',
    authorUsername: 'nicolesegall',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    authorVerified: true,
    authorCategory: 'New Delhi, India',
    content: 'Vibrant architecture and colorful streets everywhere you turn! 🌈 Exploring heritage alleys.',
    mediaUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800',
    postType: 'image',
    visibility: 'public',
    likesCount: 684,
    commentsCount: 53,
    viewsCount: 3410,
    createdAt: '1d ago',
  },
  {
    id: 'post-michael',
    authorId: 'c-michael',
    authorName: 'Michael Gilmore',
    authorUsername: 'michaelgilmore',
    authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
    authorVerified: true,
    authorCategory: 'Lawrence, KS',
    content: 'Cinematic sunset gradients over the hills. Nature never fails to amaze. 🌄',
    mediaUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
    postType: 'image',
    visibility: 'public',
    likesCount: 295,
    commentsCount: 14,
    viewsCount: 1220,
    createdAt: '1d ago',
  },
  {
    id: 'post-damian',
    authorId: 'c-damian',
    authorName: 'Damian Efron',
    authorUsername: 'damianefron',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
    authorVerified: true,
    authorCategory: 'Birmingham, UK',
    content: 'Wildlife exploration and close encounters in the misty forest. 🌲🐾',
    mediaUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
    postType: 'image',
    visibility: 'public',
    likesCount: 890,
    commentsCount: 77,
    viewsCount: 4500,
    createdAt: '2d ago',
  },
];

export function FeedPage() {
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const { activeTheme } = useTheme();
  const { scorePost, muteCreator, muteTopic } = useContentPreferences();

  const logoUrl = settings.logo_url || activeTheme?.settings?.logoUrl;
  const siteName = settings.site_name || 'CreatorPulse';

  const [posts, setPosts] = useState<Post[]>(MOCK_MOCKUP_POSTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedFilter, setFeedFilter] = useState<'all' | 'for_you' | 'preferred'>('for_you');
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(3);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(3);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostImageUrl, setNewPostImageUrl] = useState('');
  const [newPostLocation, setNewPostLocation] = useState('New York, US');
  const feedGridRef = useRef<HTMLDivElement>(null);

  // Initialize and listen to dynamic unread counts across storage and custom events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUnreadNotificationsCount(getStoredNotificationsUnreadCount());
      setUnreadMessagesCount(getStoredMessagesUnreadCount());

      const handleNotifUpdate = (e: Event) => {
        const customEvent = e as CustomEvent<{ unreadCount?: number }>;
        if (customEvent.detail && typeof customEvent.detail.unreadCount === 'number') {
          setUnreadNotificationsCount(customEvent.detail.unreadCount);
        } else {
          setUnreadNotificationsCount(getStoredNotificationsUnreadCount());
        }
      };

      const handleMessagesUpdate = (e: Event) => {
        const customEvent = e as CustomEvent<{ unreadCount?: number }>;
        if (customEvent.detail && typeof customEvent.detail.unreadCount === 'number') {
          setUnreadMessagesCount(customEvent.detail.unreadCount);
        } else {
          setUnreadMessagesCount(getStoredMessagesUnreadCount());
        }
      };

      const handleStorage = () => {
        setUnreadNotificationsCount(getStoredNotificationsUnreadCount());
        setUnreadMessagesCount(getStoredMessagesUnreadCount());
      };

      window.addEventListener('creatorpulse_notifications_updated', handleNotifUpdate);
      window.addEventListener('creatorpulse_messages_updated', handleMessagesUpdate);
      window.addEventListener('storage', handleStorage);

      return () => {
        window.removeEventListener('creatorpulse_notifications_updated', handleNotifUpdate);
        window.removeEventListener('creatorpulse_messages_updated', handleMessagesUpdate);
        window.removeEventListener('storage', handleStorage);
      };
    }
  }, []);

  // Check FTUE welcome trigger
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {
      const ftue = getFtueState(user.id);
      if (!ftue.hasSeenWelcomeModal) {
        setShowWelcomeModal(true);
      }
    }
  }, [user?.id]);

  // GSAP animation on mount or filter
  useEffect(() => {
    if (feedGridRef.current && !prefersReducedMotion()) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.mockup-feed-card',
          { opacity: 0, y: 20, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
        );
      }, feedGridRef);
      return () => ctx.revert();
    }
  }, [posts.length, searchQuery, feedFilter]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostImageUrl.trim() && !newPostCaption.trim()) return;

    const created: Post = {
      id: `post-${Date.now()}`,
      authorId: user?.id || 'user-member',
      authorName: user?.fullName || 'Abhinav Khare',
      authorUsername: user?.username || 'abhi_navkhare',
      authorAvatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      authorVerified: true,
      authorCategory: newPostLocation || 'New York, US',
      content: newPostCaption.trim() || 'New moment captured ✨',
      mediaUrl: newPostImageUrl.trim() || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
      postType: 'image',
      visibility: 'public',
      likesCount: 1,
      commentsCount: 0,
      viewsCount: 10,
      createdAt: 'Just now',
    };

    setPosts([created, ...posts]);
    setShowCreatePostModal(false);
    setNewPostCaption('');
    setNewPostImageUrl('');
  };

  // Evaluate & Filter Posts using Personalization Engine
  const evaluatedPosts = posts
    .map((p) => ({ post: p, eval: scorePost(p) }))
    .filter((item) => {
      if (item.eval.isHidden) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.post.authorName.toLowerCase().includes(q) ||
          item.post.authorUsername.toLowerCase().includes(q) ||
          (item.post.authorCategory || '').toLowerCase().includes(q) ||
          item.post.content.toLowerCase().includes(q)
        );
      }
      if (feedFilter === 'preferred') {
        return item.eval.matchTags.length > 0;
      }
      return true;
    });

  if (feedFilter === 'for_you') {
    evaluatedPosts.sort((a, b) => b.eval.score - a.eval.score);
  }

  return (
    <MainLayout showSidebar={true} showNavbar={false} showFooter={false} maxWidthClass="max-w-7xl">
      <div className="space-y-6 pb-20 w-full min-w-0">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER BAR: Pill Search, Notifications, DMs, + Create a post       */}
        {/* ========================================================================= */}
        <div className="sticky top-2 sm:top-4 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 dark:bg-[#150D1E]/90 backdrop-blur-2xl p-3 sm:px-5 rounded-[28px] border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-sm shadow-pink-500/5">
          
          {/* Mobile / Tablet Brand Logo Header */}
          <div className="flex items-center justify-between lg:hidden">
            <Link href="/feed" className="flex items-center gap-2 group min-w-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="h-7 w-auto max-w-[130px] object-contain rounded-xl"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FF8A00] via-[#EC4899] to-[#7928CA] flex items-center justify-center text-white shadow-xs">
                    <Sparkles size={15} />
                  </div>
                  <span className="text-base font-black tracking-tight text-[#18181B] dark:text-[#FDF2F8]">
                    {siteName}
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Pill Search Bar */}
          <div data-tour="search" className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-[#F4F4F6] dark:bg-[#22152E] border border-transparent focus:border-[var(--color-primary)] rounded-full pl-10 pr-9 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right Action Icons & CTA Button */}
          <div className="flex items-center justify-end gap-3 shrink-0">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotificationsModal(true)}
              className="relative p-2.5 rounded-full text-[#18181B] dark:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E] transition-colors cursor-pointer"
              title="Notifications"
              aria-label="Open notifications modal"
            >
              <Bell size={20} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#EC4899] ring-2 ring-white dark:ring-[#150D1E] animate-pulse" />
              )}
            </button>

            {/* Direct Messages Icon */}
            <button
              onClick={() => setShowMessagesModal(true)}
              className="relative p-2.5 rounded-full text-[#18181B] dark:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E] transition-colors cursor-pointer"
              title="Direct Messages"
              aria-label="Open direct messages modal"
            >
              <MessageSquare size={20} />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF8A00] ring-2 ring-white dark:ring-[#150D1E]" />
              )}
            </button>

            {/* + Create a post Button (Vibrant Orange-Pink Gradient Pill) */}
            <button
              data-tour="create-post"
              onClick={() => setShowCreatePostModal(true)}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF8A00] to-[#E52E71] hover:from-[#FF7A00] hover:to-[#D51E61] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-pink-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Create a post</span>
            </button>

            {/* User Profile / Navbar Dropdown Menu */}
            <UserNavDropdown />
          </div>

        </div>

        {/* Recommended First Actions Widget */}
        <FirstActionsWidget />

        {/* ========================================================================= */}
        {/* 2. 24-HOUR STORIES BAR                                                    */}
        {/* ========================================================================= */}
        <div data-tour="stories" className="bg-white/80 dark:bg-[#150D1E]/80 backdrop-blur-xl p-4 sm:p-5 rounded-[28px] border border-[#F3DCE8]/80 dark:border-[#3A2A4C]/80 shadow-xs">
          <StoryBar />
        </div>

        {/* ========================================================================= */}
        {/* 3. FEED GRID: Responsive 3-Column Post Cards                             */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <h2 className="font-black text-lg text-[#18181B] dark:text-[#FDF2F8]">
                Feed
              </h2>
              <span className="text-xs font-bold text-[#A1A1AA]">
                ({evaluatedPosts.length} posts)
              </span>
            </div>

            {/* Personalized Feed Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'for_you', label: '✨ For You' },
                { id: 'preferred', label: '🏷️ Preferred Topics' },
                { id: 'all', label: '🌐 All Feed' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setFeedFilter(chip.id as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    feedFilter === chip.id
                      ? 'bg-[#BE185D] text-white shadow-2xs'
                      : 'bg-[#FFF9FC] dark:bg-[#22152E] text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] border border-[#F3DCE8] dark:border-[#3A2A4C]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={feedGridRef}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6"
          >
            {evaluatedPosts.map(({ post, eval: itemEval }, idx) => (
              <div key={post.id} data-tour={idx === 0 ? 'post-card' : undefined} className="mockup-feed-card relative space-y-2">
                {itemEval.matchTags.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] text-[10px] font-black w-fit">
                    <Sparkles size={12} />
                    <span>Matched: {itemEval.matchTags.join(' • ')}</span>
                  </div>
                )}
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onStartTour={() => {
          setShowWelcomeModal(false);
          setShowGuidedTour(true);
        }}
      />

      {/* Guided Tour Spotlight */}
      <GuidedTour
        isActive={showGuidedTour}
        onComplete={() => setShowGuidedTour(false)}
      />

      {/* ========================================================================= */}
      {/* 4. CREATE A POST MODAL                                                    */}
      {/* ========================================================================= */}
      {showCreatePostModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowCreatePostModal(false)}
        >
          <div
            className="relative max-w-lg w-full bg-white dark:bg-[#150D1E] rounded-[32px] p-6 border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF8A00] to-[#E52E71] flex items-center justify-center text-white">
                  <ImagePlus size={16} />
                </div>
                <h3 className="font-black text-sm text-[#18181B] dark:text-[#FDF2F8]">
                  Create New Post
                </h3>
              </div>
              <button
                onClick={() => setShowCreatePostModal(false)}
                className="text-[#71717A] hover:text-[#18181B] dark:hover:text-[#FDF2F8] p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5">
              {/* Image Preview & URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                  Image or Media Asset URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="Paste high-res image URL (e.g. https://images.unsplash.com/...)"
                  value={newPostImageUrl}
                  onChange={(e) => setNewPostImageUrl(e.target.value)}
                  className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] font-medium"
                />
              </div>

              {/* Caption */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                  Caption
                </label>
                <textarea
                  rows={3}
                  placeholder="Write an engaging caption, story, or description..."
                  value={newPostCaption}
                  onChange={(e) => setNewPostCaption(e.target.value)}
                  className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] font-medium resize-none"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                  Location Tag
                </label>
                <input
                  type="text"
                  placeholder="Location (e.g. Dubai, UAE / New York, US)"
                  value={newPostLocation}
                  onChange={(e) => setNewPostLocation(e.target.value)}
                  className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] font-medium"
                />
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white font-extrabold text-xs shadow-lg shadow-pink-500/20 hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={16} strokeWidth={3} />
                <span>Share Post to Feed</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onOpenMessages={() => setShowMessagesModal(true)}
        onUnreadCountChange={setUnreadNotificationsCount}
      />

      {/* Direct Messages Modal */}
      <MessagesModal
        isOpen={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
        onUnreadCountChange={setUnreadMessagesCount}
      />
    </MainLayout>
  );
}

export default FeedPage;
