'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { CheckoutModal } from '@/components/payments/CheckoutModal';
import { 
  MOCK_CREATOR_DETAILS, MOCK_POSTS, 
  CreatorProfile 
} from '@/lib/supabase/store';
import { 
  Compass, Search, Sparkles, Filter, Users, ArrowRight, X, 
  Eye, UserPlus, Flame, Check, Lock, Star, Clock, History, FileText, ChevronRight, CheckCircle2
} from 'lucide-react';
import { prefersReducedMotion } from '../utils/animations';

import { useContentPreferences } from '@/lib/preferences/use-content-preferences';
import { useHistory } from '@/lib/history/history-context';

const CATEGORIES = [
  'All', 
  'Art & Design', 
  'Education & Tech', 
  'Fitness & Wellness', 
  'Music & Sound', 
  'Photography', 
  'Gaming & Esports', 
  'Lifestyle'
];

const SORT_OPTIONS = [
  { id: 'for_you', label: '✨ For You' },
  { id: 'trending', label: '🔥 Trending' },
  { id: 'popular', label: '⭐ Most Popular' },
  { id: 'newest', label: '✨ Rising Stars' },
  { id: 'price_asc', label: '💰 Price: Low to High' },
  { id: 'top_rated', label: '💎 Top Rated' },
];

export function ExplorePage() {
  const { preferences, history, addSearchQuery, removeSearchItem, trackDiscoveredCreator, scoreCreator } = useContentPreferences();
  const [activeTab, setActiveTab] = useState<'creators' | 'content'>('creators');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeSort, setActiveSort] = useState('for_you');
  
  const [followedUsernames, setFollowedUsernames] = useState<Record<string, boolean>>({
    'sarahdesign': true,
  });

  const [previewCreator, setPreviewCreator] = useState<CreatorProfile | null>(null);
  const [selectedCreatorForSub, setSelectedCreatorForSub] = useState<{ creator: CreatorProfile; key: string } | null>(null);
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [autoRenew, setAutoRenew] = useState(true);
  const [showSubDurationModal, setShowSubDurationModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLDivElement>(null);
  const recommendedRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const creatorEntries = Object.entries(MOCK_CREATOR_DETAILS);

  // Filter Logic with Personalization & Mute checks
  const filteredCreators = creatorEntries.filter(([key, creator]) => {
    const scoreResult = scoreCreator(creator);
    if (scoreResult.isHidden) return false;

    const matchesCategory = selectedCategory === 'All' || creator.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      creator.fullName.toLowerCase().includes(q) ||
      creator.username.toLowerCase().includes(q) ||
      creator.headline.toLowerCase().includes(q) ||
      (creator.bio && creator.bio.toLowerCase().includes(q)) ||
      (creator.category && creator.category.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const sortedCreators = [...filteredCreators].sort((a, b) => {
    const creatorA = a[1];
    const creatorB = b[1];
    if (activeSort === 'for_you') return scoreCreator(creatorB).score - scoreCreator(creatorA).score;
    if (activeSort === 'popular') return creatorB.subscriberCount - creatorA.subscriberCount;
    if (activeSort === 'price_asc') return creatorA.startingPrice - creatorB.startingPrice;
    if (activeSort === 'top_rated') return creatorB.profileViews - creatorA.profileViews;
    if (activeSort === 'newest') return creatorB.followerCount - creatorA.followerCount;
    return (creatorB.subscriberCount + creatorB.followerCount) - (creatorA.subscriberCount + creatorA.followerCount);
  });

  const { logActivity } = useHistory();

  // Track discovered creators on preview
  const handlePreviewCreator = (key: string, creator: CreatorProfile) => {
    setPreviewCreator(creator);
    trackDiscoveredCreator({
      creatorId: key,
      creatorName: creator.fullName,
      creatorUsername: creator.username,
      avatarUrl: creator.avatarUrl,
      category: creator.category || 'General',
    });

    logActivity({
      category: 'profile',
      title: `Visited Creator Profile: ${creator.fullName}`,
      subtitle: `@${creator.username} • ${creator.headline || creator.category}`,
      targetUrl: `/c/${creator.username}`,
      targetId: creator.id,
      avatarUrl: creator.avatarUrl,
      actionType: 'view',
    });
  };

  // Handle Search Debounce & History Logging
  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
        if (searchQuery.trim().length >= 2) {
          addSearchQuery(searchQuery.trim(), selectedCategory !== 'All' ? selectedCategory : undefined);
          logActivity({
            category: 'search',
            title: `Searched for "${searchQuery.trim()}"`,
            subtitle: `Category: ${selectedCategory}`,
            targetUrl: `/explore?q=${encodeURIComponent(searchQuery.trim())}`,
            actionType: 'search',
          });
        }
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, selectedCategory, addSearchQuery, logActivity]);

  // GSAP Animations
  useEffect(() => {
    if (!prefersReducedMotion() && !isSearching) {
      const elements = [];
      if (gridRef.current) elements.push(...Array.from(gridRef.current.children));
      if (trendingRef.current) elements.push(...Array.from(trendingRef.current.children));
      if (recommendedRef.current) elements.push(...Array.from(recommendedRef.current.children));
      
      if (elements.length > 0) {
        gsap.fromTo(
          elements,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'back.out(1.2)', overwrite: 'auto' }
        );
      }
    }
  }, [selectedCategory, searchQuery, activeSort, activeTab, isSearching]);

  const toggleFollow = (username: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !followedUsernames[username];
    setFollowedUsernames((prev) => ({ ...prev, [username]: nextState }));
    showToast(nextState ? `You are now following @${username}!` : `Unfollowed @${username}`);
  };

  const handleOpenSubscribe = (creatorKey: string, creator: CreatorProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCreatorForSub({ creator, key: creatorKey });
    setShowSubDurationModal(true);
  };

  const handleConfirmSubscribeDuration = () => {
    setShowSubDurationModal(false);
    setShowCheckoutModal(true);
  };

  const trendingCreators = creatorEntries.slice(0, 3);
  const recommendedCreators = creatorEntries.slice(3, 6);

  return (
    <MainLayout>
      <div className="space-y-10 max-w-7xl mx-auto pb-16 px-4 sm:px-6">
        
        {/* Search Header Section */}
        <div className="relative overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2.5rem] p-8 sm:p-12 shadow-sm flex flex-col items-center text-center">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 w-full max-w-2xl space-y-6">
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--color-text-primary)] tracking-tight">
              What are you looking for?
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] font-medium max-w-xl mx-auto">
              Discover verified creators, exclusive communities, and premium content tailored to your interests.
            </p>

            {/* Smart Search Bar */}
            <div className="relative group w-full mt-8">
              <div className={`absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-2xl blur-lg transition-opacity duration-500 ${searchFocused ? 'opacity-30' : 'opacity-0 group-hover:opacity-15'}`} />
              <div className="relative flex items-center bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-primary)]/50 focus-within:border-[var(--color-primary)] transition-all">
                <Search className="absolute left-4 text-[var(--color-text-muted)]" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  placeholder="Search creators, topics, or content..."
                  className="w-full bg-transparent pl-12 pr-12 py-4 text-sm sm:text-base text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none font-medium h-[56px]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer p-1.5 rounded-full hover:bg-[var(--color-surface-secondary)] transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Recent Searches Dropdown */}
              {searchFocused && !searchQuery && history.recentSearches.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 text-left">
                  <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider px-2">Recent Searches</span>
                    <span className="text-[10px] text-[#A1A1AA]">{history.recentSearches.length} items</span>
                  </div>
                  <div className="p-2 space-y-1">
                    {history.recentSearches.map((item) => (
                      <div 
                        key={item.id}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--color-surface-secondary)] rounded-xl transition-colors text-sm text-[var(--color-text-primary)] font-medium"
                      >
                        <button
                          className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                          onClick={() => setSearchQuery(item.query)}
                        >
                          <History size={16} className="text-[#EC4899] shrink-0" />
                          <span className="truncate">{item.query}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSearchItem(item.id);
                          }}
                          className="text-[var(--color-text-muted)] hover:text-red-500 p-1 cursor-pointer"
                          title="Remove search"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 pb-2 border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab('creators')}
            className={`pb-3 px-4 text-sm sm:text-base font-extrabold flex items-center gap-2 transition-all relative ${
              activeTab === 'creators' 
                ? 'text-[var(--color-primary)]' 
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Users size={18} /> Creators
            {activeTab === 'creators' && (
              <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[var(--color-primary)] rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-3 px-4 text-sm sm:text-base font-extrabold flex items-center gap-2 transition-all relative ${
              activeTab === 'content' 
                ? 'text-[var(--color-primary)]' 
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <FileText size={18} /> Content & Posts
            {activeTab === 'content' && (
              <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[var(--color-primary)] rounded-t-full" />
            )}
          </button>
        </div>

        {/* Categories & Sorting (Creators Tab only) */}
        {activeTab === 'creators' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all snap-start ${
                    selectedCategory === cat
                      ? 'bg-[var(--color-text-primary)] text-[var(--color-bg)] shadow-md'
                      : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
              <div className="text-sm text-[var(--color-text-secondary)] font-semibold flex items-center gap-2">
                <Filter size={16} /> 
                {isSearching ? 'Searching...' : `Found ${sortedCreators.length} results`}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {SORT_OPTIONS.map((sort) => (
                  <button
                    key={sort.id}
                    onClick={() => setActiveSort(sort.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      activeSort === sort.id
                        ? 'bg-[var(--color-soft-primary)] text-[var(--color-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
                    }`}
                  >
                    {sort.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Tab Placeholder */}
        {activeTab === 'content' && (
          <div className="text-center py-20 bg-[var(--color-surface)] border border-[var(--color-border)] border-dashed rounded-3xl space-y-4">
            <div className="w-16 h-16 bg-[var(--color-soft-primary)] rounded-full flex items-center justify-center mx-auto">
              <FileText size={28} className="text-[var(--color-primary)]" />
            </div>
            <h3 className="font-extrabold text-xl text-[var(--color-text-primary)]">Search Content & Posts</h3>
            <p className="text-sm text-[var(--color-text-secondary)] font-medium max-w-md mx-auto">
              Search for specific posts, articles, videos, and exclusive resources across all creators. (Coming soon)
            </p>
          </div>
        )}

        {/* Creators View */}
        {activeTab === 'creators' && (
          <div className="space-y-12">
            
            {/* Loading Skeleton */}
            {isSearching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 h-[340px] flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="h-28 bg-[var(--color-bg)] rounded-2xl -mx-5 -mt-5 mb-2" />
                      <div className="w-20 h-20 rounded-full bg-[var(--color-surface-secondary)] border-4 border-[var(--color-surface)] -mt-12" />
                      <div className="h-4 bg-[var(--color-surface-secondary)] rounded w-3/4" />
                      <div className="h-3 bg-[var(--color-surface-secondary)] rounded w-1/2" />
                      <div className="h-10 bg-[var(--color-surface-secondary)] rounded w-full mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* 1. Trending Creators */}
                {selectedCategory === 'All' && !searchQuery && trendingCreators.length > 0 && (
                  <section className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black text-[var(--color-text-primary)] flex items-center gap-2">
                        <Flame className="text-orange-500 fill-orange-500" size={24} />
                        Trending This Week
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" ref={trendingRef}>
                      {trendingCreators.map(([key, creator]) => (
                        <CreatorCard 
                          key={`trend-${creator.id}`}
                          creator={creator}
                          creatorKey={key}
                          isFollowing={!!followedUsernames[creator.username]}
                          onFollow={(e: React.MouseEvent) => toggleFollow(creator.username, e)}
                          onSubscribe={(e: React.MouseEvent) => handleOpenSubscribe(key, creator, e)}
                          onPreview={() => handlePreviewCreator(key, creator)}
                          badge={<Badge variant="pink" size="sm" className="absolute top-3 right-3 shadow-lg">🔥 Hot</Badge>}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 2. Recommended Creators */}
                {selectedCategory === 'All' && !searchQuery && recommendedCreators.length > 0 && (
                  <section className="space-y-5 pt-4 border-t border-[var(--color-border)]">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black text-[var(--color-text-primary)] flex items-center gap-2">
                        <Star className="text-yellow-500 fill-yellow-500" size={24} />
                        Recommended For You
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" ref={recommendedRef}>
                      {recommendedCreators.map(([key, creator]) => (
                        <CreatorCard 
                          key={`rec-${creator.id}`}
                          creator={creator}
                          creatorKey={key}
                          isFollowing={!!followedUsernames[creator.username]}
                          onFollow={(e: React.MouseEvent) => toggleFollow(creator.username, e)}
                          onSubscribe={(e: React.MouseEvent) => handleOpenSubscribe(key, creator, e)}
                          onPreview={() => handlePreviewCreator(key, creator)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 3. Main Search Results / All Creators */}
                <section className="space-y-5 pt-4 border-t border-[var(--color-border)]">
                  {searchQuery || selectedCategory !== 'All' ? (
                    <h2 className="text-xl font-black text-[var(--color-text-primary)]">Search Results</h2>
                  ) : (
                    <h2 className="text-xl font-black text-[var(--color-text-primary)]">All Creators</h2>
                  )}

                  {sortedCreators.length > 0 ? (
                    <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {sortedCreators.map(([key, creator]) => (
                        <CreatorCard 
                          key={`all-${creator.id}`}
                          creator={creator}
                          creatorKey={key}
                          isFollowing={!!followedUsernames[creator.username]}
                          onFollow={(e: React.MouseEvent) => toggleFollow(creator.username, e)}
                          onSubscribe={(e: React.MouseEvent) => handleOpenSubscribe(key, creator, e)}
                          onPreview={() => handlePreviewCreator(key, creator)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-24 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2.5rem] space-y-5 max-w-3xl mx-auto">
                      <div className="w-20 h-20 bg-[var(--color-surface-secondary)] rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <Compass size={40} className="text-[var(--color-text-muted)]" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xl text-[var(--color-text-primary)]">No creators found</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] font-medium mt-2">
                          We couldn't find anyone matching your search criteria. Try a different term or clear filters.
                        </p>
                      </div>
                      <Button 
                        variant="primary" 
                        size="md" 
                        onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                        className="rounded-full shadow-lg"
                      >
                        Clear Search & Filters
                      </Button>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        )}

      </div>

      {/* Quick Peek Modal */}
      {previewCreator && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewCreator(null)}
        >
          <div 
            className="bg-[var(--color-surface)] rounded-[32px] max-w-lg w-full overflow-hidden border border-[var(--color-border)] shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-40 relative bg-[var(--color-surface-secondary)]">
              <img src={previewCreator.coverImageUrl} alt={previewCreator.fullName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button 
                onClick={() => setPreviewCreator(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 cursor-pointer border border-white/20 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-8 pb-8 pt-0 space-y-5 -mt-12 relative z-10">
              <div className="flex items-end justify-between">
                <Avatar 
                  src={previewCreator.avatarUrl} 
                  alt={previewCreator.fullName} 
                  size="xl" 
                  isVerified={previewCreator.isVerified}
                  className="border-[5px] border-[var(--color-surface)] shadow-xl"
                />
                <Badge variant="pink" size="md" className="mb-2 shadow-sm">
                  From ${previewCreator.startingPrice}/mo
                </Badge>
              </div>

              <div>
                <h3 className="text-2xl font-black text-[var(--color-text-primary)] flex items-center gap-2">
                  {previewCreator.fullName}
                  {previewCreator.isVerified && <CheckCircle2 size={20} className="text-blue-500" />}
                </h3>
                <p className="text-sm text-[var(--color-primary)] font-bold">@{previewCreator.username} • {previewCreator.category}</p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-3 font-semibold leading-relaxed">{previewCreator.headline}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-2 leading-relaxed">{previewCreator.bio}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-[var(--color-border)]">
                <div className="text-center p-3 bg-[var(--color-surface-secondary)] rounded-2xl">
                  <p className="text-lg font-black text-[var(--color-text-primary)]">{(previewCreator.subscriberCount || 0).toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">VIP Members</p>
                </div>
                <div className="text-center p-3 bg-[var(--color-surface-secondary)] rounded-2xl">
                  <p className="text-lg font-black text-[var(--color-text-primary)]">{(previewCreator.followerCount || 0).toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Followers</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link href={`/c/${previewCreator.username}`} className="flex-1">
                  <Button variant="outline" size="md" fullWidth className="rounded-xl font-bold">
                    View Full Studio
                  </Button>
                </Link>
                
                <Button 
                  variant="primary" 
                  size="md" 
                  className="flex-1 rounded-xl font-bold"
                  onClick={() => {
                    const key = Object.keys(MOCK_CREATOR_DETAILS).find(
                      (k) => MOCK_CREATOR_DETAILS[k].username === previewCreator.username
                    ) || 'user-creator-1';
                    setSelectedCreatorForSub({ creator: previewCreator, key });
                    setPreviewCreator(null);
                    setShowSubDurationModal(true);
                  }}
                  leftIcon={<Sparkles size={16} />}
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Duration Picker Modal */}
      {showSubDurationModal && selectedCreatorForSub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-[28px] max-w-md w-full p-8 space-y-6 relative border border-[var(--color-border)] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[var(--color-text-primary)] flex items-center gap-2">
                <Sparkles className="text-[var(--color-primary)]" size={24} />
                Choose Plan
              </h3>
              <button 
                onClick={() => setShowSubDurationModal(false)} 
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer bg-[var(--color-surface-secondary)] p-2 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { m: 1, label: '1 Month', disc: 'Standard' },
                  { m: 3, label: '3 Months', disc: 'Save 10%' },
                  { m: 6, label: '6 Months', disc: 'Save 15%' },
                  { m: 12, label: '1 Year', disc: 'Save 20%' }
                ].map((item) => {
                  const price = selectedCreatorForSub.creator.startingPrice;
                  const mult = item.m === 12 ? 0.8 : item.m === 6 ? 0.85 : item.m === 3 ? 0.9 : 1.0;
                  const total = Math.round(price * item.m * mult * 100) / 100;

                  return (
                    <button
                      key={item.m}
                      type="button"
                      onClick={() => setDurationMonths(item.m)}
                      className={`p-4 rounded-[20px] text-left transition-all cursor-pointer border-2 relative overflow-hidden ${
                        durationMonths === item.m
                          ? 'bg-[var(--color-soft-primary)] border-[var(--color-primary)] shadow-sm'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      {durationMonths === item.m && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-[var(--color-primary)] rounded-bl-[20px] flex items-center justify-center text-white">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-[var(--color-text-primary)]">{item.label}</span>
                        {item.disc !== 'Standard' && (
                          <span className="text-[10px] font-bold text-[var(--color-primary)]">{item.disc}</span>
                        )}
                        <span className="text-lg font-black mt-2 text-[var(--color-text-primary)]">${total.toFixed(2)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between bg-[var(--color-surface-secondary)] p-4 rounded-2xl border border-[var(--color-border)] mt-4">
                <span className="text-sm font-bold text-[var(--color-text-primary)]">Auto-renew subscription</span>
                <div className="relative inline-block w-10 h-6">
                  <input
                    type="checkbox"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="peer appearance-none w-10 h-6 bg-[var(--color-border)] rounded-full checked:bg-[var(--color-primary)] cursor-pointer transition-colors"
                  />
                  <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform pointer-events-none shadow-sm" />
                </div>
              </div>

              <div className="pt-4">
                <Button variant="primary" size="lg" fullWidth onClick={handleConfirmSubscribeDuration} className="rounded-xl font-bold text-base shadow-lg shadow-[var(--color-primary)]/20">
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal Integration */}
      {showCheckoutModal && selectedCreatorForSub && (
        <CheckoutModal
          type="subscription"
          amount={
            Math.round(
              selectedCreatorForSub.creator.startingPrice *
              durationMonths *
              (durationMonths === 12 ? 0.8 : durationMonths === 6 ? 0.85 : durationMonths === 3 ? 0.9 : 1.0) *
              100
            ) / 100
          }
          description={`VIP Subscription: ${selectedCreatorForSub.creator.fullName}`}
          creatorId={selectedCreatorForSub.key}
          creatorName={selectedCreatorForSub.creator.fullName}
          creatorAvatar={selectedCreatorForSub.creator.avatarUrl}
          creatorUsername={selectedCreatorForSub.creator.username}
          planId="vip-pro"
          planName="VIP Pro Pass"
          durationMonths={durationMonths}
          autoRenew={autoRenew}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={() => {
            setShowCheckoutModal(false);
            showToast(`Successfully subscribed to @${selectedCreatorForSub.creator.username}!`);
          }}
        />
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[var(--color-text-primary)] text-[var(--color-bg)] px-6 py-3 rounded-full text-sm font-bold shadow-2xl z-[100] flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-green-400" />
          {toastMessage}
        </div>
      )}
    </MainLayout>
  );
}

// Subcomponent for Creator Card to keep main clean
function CreatorCard({ creator, creatorKey, isFollowing, onFollow, onSubscribe, onPreview, badge }: any) {
  return (
    <Card 
      hoverable 
      className="p-5 flex flex-col justify-between space-y-4 border border-[var(--color-border)] relative group transition-all hover:border-[var(--color-primary)]/30 hover:shadow-xl hover:shadow-[var(--color-primary)]/5"
    >
      {badge}
      <div className="space-y-3">
        {/* Cover Header */}
        <div className="relative h-28 rounded-2xl overflow-hidden bg-[var(--color-surface-secondary)] -mx-5 -mt-5 mb-2">
          <img 
            src={creator.coverImageUrl} 
            alt={creator.fullName} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute bottom-2 left-2 flex gap-1">
             <span className="text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full shadow-sm">
              From ${creator.startingPrice}/mo
            </span>
          </div>
        </div>

        {/* Avatar & Follow Action */}
        <div className="flex items-end justify-between -mt-10 relative z-10 px-1">
          <Avatar 
            src={creator.avatarUrl} 
            alt={creator.fullName} 
            size="xl" 
            isVerified={creator.isVerified} 
            className="border-4 border-[var(--color-surface)] shadow-lg"
          />

          <Button
            variant={isFollowing ? 'secondary' : 'outline'}
            size="xs"
            onClick={onFollow}
            leftIcon={isFollowing ? <Check size={12} /> : <UserPlus size={12} />}
            className="rounded-full shadow-sm"
          >
            {isFollowing ? 'Following' : 'Follow Free'}
          </Button>
        </div>

        {/* Creator Info */}
        <div className="pt-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-extrabold text-lg text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors">
              {creator.fullName}
            </h3>
          </div>
          <p className="text-xs font-bold text-[var(--color-primary)]">
            @{creator.username} • <span className="text-[var(--color-text-secondary)] font-semibold">{creator.category}</span>
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2.5 line-clamp-2 leading-relaxed font-semibold min-h-[2.5rem]">
            {creator.headline || creator.bio}
          </p>
        </div>

        {/* Quick Peek Badge / Tag */}
        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] border-t border-[var(--color-border)] pt-4 font-medium">
          <div className="flex items-center gap-1.5 bg-[var(--color-surface-secondary)] px-2 py-1 rounded-lg">
            <Users size={14} className="text-[var(--color-text-muted)]" />
            <span><strong className="text-[var(--color-text-primary)] font-black">{(creator.subscriberCount || 0).toLocaleString()}</strong> VIPs</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[var(--color-surface-secondary)] px-2 py-1 rounded-lg">
            <Star size={14} className="text-[var(--color-text-muted)]" />
            <span><strong className="text-[var(--color-text-primary)] font-black">{(creator.followerCount || 0).toLocaleString()}</strong> Followers</span>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onPreview}
            leftIcon={<Eye size={14} />}
            className="rounded-xl font-bold"
          >
            Peek
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={onSubscribe}
            rightIcon={<ArrowRight size={14} />}
            className="rounded-xl font-bold shadow-md shadow-[var(--color-primary)]/10"
          >
            Subscribe
          </Button>
        </div>

        <Link href={`/c/${creator.username}`} className="flex items-center justify-center gap-1 text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors group/link py-1">
          View Full VIP Studio <ChevronRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </Card>
  );
}

export default ExplorePage;
