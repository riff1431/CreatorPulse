'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { 
  Sparkles, Lock, CheckCircle2, UserPlus, Heart, MessageSquare, 
  Share2, ShieldCheck, Star, Users, Check, Globe, X, Film, Info, 
  Image as ImageIcon, AlertCircle, ExternalLink, ArrowRight, Eye, Play, Clock, UserX
} from 'lucide-react';
import { useFollow } from '@/lib/follow/use-follow';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { PostCard } from '../components/PostCard';
import { SupportModal } from '@/components/support-modal';
import { CheckoutModal } from '@/components/payments/CheckoutModal';
import { 
  MOCK_CREATOR_DETAILS, MOCK_POSTS, MOCK_MEMBERSHIP_PLANS, 
  CreatorProfile, MembershipPlan 
} from '@/lib/supabase/store';
import { getStoredCreatorTiers, CreatorTier } from '@/lib/memberships/membership-store';
import { TierComparisonMatrix } from '../components/TierComparisonMatrix';
import { subscribeUserToTier, getUserSubscription } from '@/lib/memberships/entitlement-service';
import { prefersReducedMotion } from '../utils/animations';

export function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = (params?.username as string) || 'sarahdesign';

  const creatorKey = Object.keys(MOCK_CREATOR_DETAILS).find(
    (k) => MOCK_CREATOR_DETAILS[k].username.toLowerCase() === username.toLowerCase()
  ) || 'user-creator-1';

  const creator: CreatorProfile = MOCK_CREATOR_DETAILS[creatorKey] || MOCK_CREATOR_DETAILS['user-creator-1'];
  
  const [rawTiers, setRawTiers] = useState<CreatorTier[]>(() => {
    return getStoredCreatorTiers(creatorKey) || [];
  });

  const [plans, setPlans] = useState<MembershipPlan[]>(() => {
    const stored = getStoredCreatorTiers(creatorKey);
    if (stored && stored.length > 0) {
      return stored.filter((t) => t.status === 'active').map((t) => ({
        id: t.id,
        creatorId: t.creatorId,
        name: t.name,
        priceMonthly: t.priceMonthly,
        description: t.description,
        benefits: t.benefits,
        popular: t.popular
      }));
    }
    return MOCK_MEMBERSHIP_PLANS[creatorKey] || [];
  });

  useEffect(() => {
    const handleUpdate = () => {
      const stored = getStoredCreatorTiers(creatorKey);
      if (stored && stored.length > 0) {
        setRawTiers(stored);
        setPlans(stored.filter((t) => t.status === 'active').map((t) => ({
          id: t.id,
          creatorId: t.creatorId,
          name: t.name,
          priceMonthly: t.priceMonthly,
          description: t.description,
          benefits: t.benefits,
          popular: t.popular
        })));
      }
    };
    window.addEventListener('creatorpulse_memberships_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('creatorpulse_memberships_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [creatorKey]);
  
  const {
    isFollowing,
    isPending,
    isPrivate: isProfilePrivate,
    isMutual,
    counts,
    follow: followAction,
    unfollow: unfollowAction,
    cancelRequest: cancelRequestAction,
  } = useFollow(creatorKey);

  const displayFollowerCount = (creator.followerCount || 0) + (isFollowing ? 1 : 0);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan>(plans[1] || plans[0]);
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [autoRenew, setAutoRenew] = useState(true);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'reels' | 'memberships' | 'about'>('posts');
  const [postFilter, setPostFilter] = useState<'all' | 'public' | 'vip'>('all');
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activeReelVideo, setActiveReelVideo] = useState<{ title: string; url: string; thumbnail: string } | null>(null);

  
  const [isSticky, setIsSticky] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const modalRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      gsap.fromTo(
        node,
        { scale: 0.88, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.5)', overwrite: 'auto' }
      );
    }
  }, []);

  const creatorPosts = MOCK_POSTS.filter((p) => p.authorUsername.toLowerCase() === creator.username.toLowerCase());
  const filteredPosts = creatorPosts.filter((p) => {
    if (postFilter === 'public') return p.visibility === 'public';
    if (postFilter === 'vip') return p.visibility === 'members_only';
    return true;
  });

  const handleToggleFollow = () => {
    if (isFollowing) {
      unfollowAction();
      showToast(`Unfollowed @${creator.username}`);
    } else if (isPending) {
      cancelRequestAction();
      showToast(`Follow request cancelled for @${creator.username}`);
    } else {
      const res = followAction();
      if (res === 'pending') {
        showToast(`Follow request sent to @${creator.username}`);
      } else {
        showToast(`You are now following @${creator.username}!`);
      }
    }
  };

  const mediaGallery = [
    { id: 'gal-1', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800', title: 'Modern Workstation Setup' },
    { id: 'gal-2', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', title: 'Figma System Architecture Design' },
    { id: 'gal-3', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800', title: 'Masterclass UI Guidelines' },
    { id: 'gal-4', url: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800', title: 'Mobile App Wireframing Board' }
  ];

  
  const mockStories = [
    { id: 's1', title: 'Studio Tour', image: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=300', isNew: true },
    { id: 's2', title: 'Q&A', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300', isNew: false },
    { id: 's3', title: 'Behind Scenes', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300', isNew: false },
    { id: 's4', title: 'Vlog', image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300', isNew: false },
  ];

  const reelsList = [
    { id: 'reel-1', title: 'How to build smooth GSAP animations in Next.js', thumbnail: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600', url: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42866-large.mp4' },
    { id: 'reel-2', title: 'Top 5 UI Design Principles for 2026', thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600', url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-typing-on-a-keyboard-41334-large.mp4' }
  ];

  const discountMultiplier = durationMonths === 12 ? 0.8 : durationMonths === 6 ? 0.85 : durationMonths === 3 ? 0.9 : 1.0;
  const totalPrice = Math.round((selectedPlan.priceMonthly || creator.startingPrice) * durationMonths * discountMultiplier * 100) / 100;

  
  // Sticky header scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const bottom = headerRef.current.getBoundingClientRect().bottom;
        setIsSticky(bottom < 60);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Header entry animation
  useEffect(() => {
    if (headerRef.current && !prefersReducedMotion()) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  // Tab change animation
  useEffect(() => {
    setIsTabLoading(true);
    const timer = setTimeout(() => {
      setIsTabLoading(false);
      if (tabContentRef.current && !prefersReducedMotion()) {
        const children = tabContentRef.current?.children;
        if (children && children.length > 0) {
          gsap.fromTo(
            children,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'back.out(1.2)' }
          );
        } else {
          gsap.fromTo(
            tabContentRef.current,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
          );
        }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [activeTab, postFilter]);

  const handleShareProfile = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Profile link copied to clipboard!');
    }
  };

  const handleSubscribeConfirm = () => {
    setShowSubModal(false);
    setShowCheckoutModal(true);
  };

  return (
    <MainLayout showSidebar={true} showFooter={false}>
      <div className="space-y-6 max-w-4xl mx-auto w-full pb-16">
        
        {/* Cover Header & Profile Card */}
        <Card ref={headerRef} className="p-0 overflow-hidden relative border border-[var(--color-border)] shadow-sm shadow-[#EC4899]/5">
          {/* Cover Photo */}
          <div className="h-48 sm:h-64 relative bg-[var(--color-surface-secondary)] overflow-hidden group">
            <img
              src={creator.coverImageUrl}
              alt={creator.fullName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent"></div>
            
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={handleShareProfile}
                className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer border border-white/20"
                title="Share Profile"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Profile Details Container */}
          <div className="px-6 pb-6 pt-0 relative space-y-5">
            {/* Top Row: Avatar & Primary Actions */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 relative z-10">
              <Avatar
                alt={creator.fullName}
                src={creator.avatarUrl}
                size="xl"
                isVerified={creator.isVerified}
                className="border-4 border-white shadow-2xl ring-4 ring-pink-500/20"
              />

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={isFollowing ? 'secondary' : isPending ? 'outline' : 'primary'}
                  size="sm"
                  onClick={handleToggleFollow}
                  leftIcon={
                    isFollowing ? (
                      <Check size={14} />
                    ) : isPending ? (
                      <Clock size={14} className="text-amber-500" />
                    ) : (
                      <UserPlus size={14} />
                    )
                  }
                >
                  {isFollowing ? 'Following' : isPending ? 'Requested' : 'Follow Free'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSupportModal(true)}
                  leftIcon={<Heart size={14} className="text-[#F43F5E] fill-[#F43F5E]" />}
                >
                  Support Tip
                </Button>

                <Link href={`/messages?user=${creator.username}`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<MessageSquare size={14} />}
                  >
                    Message
                  </Button>
                </Link>

                {isSubscribed ? (
                  <Badge variant="emerald" size="md">
                    <CheckCircle2 size={14} /> VIP Member Active
                  </Badge>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowSubModal(true)}
                    leftIcon={<Sparkles size={14} />}
                  >
                    Subscribe From ${creator.startingPrice}/mo
                  </Button>
                )}
              </div>
            </div>

            {/* Creator Identity */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{creator.fullName}</h1>
                <Badge variant="pink" size="sm">{creator.category}</Badge>
                {creator.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck size={13} /> Verified Creator
                  </span>
                )}
              </div>
              
              <p className="text-xs text-[var(--color-primary)] font-bold">@{creator.username}</p>
              <p className="text-sm text-[var(--color-text-primary)] leading-relaxed font-bold">{creator.headline}</p>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-medium">{creator.bio}</p>

              {/* External Links */}
              <div className="flex items-center gap-4 text-xs font-semibold text-[var(--color-primary)] pt-1">
                <a href="#" className="flex items-center gap-1 hover:underline">
                  <Globe size={13} /> portfolio.{creator.username}.design
                </a>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 text-center bg-[var(--color-surface-secondary)] p-3.5 rounded-2xl border border-[var(--color-border)]">
              <div>
                <strong className="text-base sm:text-lg font-black text-[var(--color-text-primary)] block">
                  {(creator.subscriberCount || 0).toLocaleString()}
                </strong>
                <span className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">VIP Members</span>
              </div>
              <Link href="/connections?tab=followers" className="hover:opacity-80 transition-opacity">
                <strong className="text-base sm:text-lg font-black text-[var(--color-primary)] block">
                  {displayFollowerCount.toLocaleString()}
                </strong>
                <span className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider hover:underline">
                  Followers
                </span>
              </Link>
              <div>
                <strong className="text-base sm:text-lg font-black text-[var(--color-text-primary)] block">
                  {creatorPosts.length}
                </strong>
                <span className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Posts</span>
              </div>
              <div>
                <strong className="text-base sm:text-lg font-black text-[var(--color-text-primary)] block">
                  {(creator.profileViews || 0).toLocaleString()}
                </strong>
                <span className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Views</span>
              </div>
            </div>
          </div>
        </Card>

        
        {/* Stories Section */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-2 px-1">
          {mockStories.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 border-2 transition-all group-active:scale-95 ${story.isNew ? 'border-pink-500' : 'border-[var(--color-border)]'}`}>
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-[var(--color-text-primary)] max-w-[70px] truncate text-center">{story.title}</span>
            </div>
          ))}
        </div>

        {/* Profile Navigation Tabs */}
        <div className="flex items-center border-b border-[var(--color-border)] text-xs font-bold overflow-x-auto scrollbar-none gap-1">
          {[
            { id: 'posts', label: '📝 Posts' },
            { id: 'media', label: '🖼️ Media Gallery' },
            { id: 'reels', label: '🎥 Reels & Shorts' },
            { id: 'memberships', label: '🔒 VIP Tiers' },
            { id: 'about', label: 'ℹ️ About' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 border-b-2 shrink-0 transition-all cursor-pointer select-none ${
                activeTab === tab.id 
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-soft-primary)]/40 rounded-t-xl font-black' 
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Renderer */}
        <div ref={tabContentRef}>
          {isTabLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl h-52 p-4 flex flex-col justify-end space-y-2">
                    <div className="w-2/3 h-3 skeleton-shimmer rounded-full" />
                    <div className="w-1/2 h-2 skeleton-shimmer rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  {/* Sub-filter Bar */}
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'all', label: 'All Posts' },
                      { id: 'public', label: '🌐 Public' },
                      { id: 'vip', label: '🔒 VIP Exclusive' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setPostFilter(f.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          postFilter === f.id
                            ? 'bg-[var(--color-primary)] text-white shadow-xs'
                            : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl space-y-2">
                      <AlertCircle size={28} className="text-[var(--color-text-muted)] mx-auto mb-1" />
                      <p className="text-xs text-[var(--color-text-secondary)] font-bold">No posts available under this filter.</p>
                    </div>
                  ) : (
                    filteredPosts.map((post) => (
                      <PostCard key={post.id} post={post} isMemberUnlocked={isSubscribed} />
                    ))
                  )}
                </div>
              )}

              {/* Media Gallery Tab */}
              {activeTab === 'media' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mediaGallery.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setLightboxImage(item.url)}
                      className="rounded-2xl overflow-hidden bg-[var(--color-surface-secondary)] border border-[var(--color-border)] h-52 cursor-zoom-in relative group"
                    >
                      <img 
                        src={item.url} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-bold gap-2 p-4 text-center">
                        <ImageIcon size={22} />
                        <span>{item.title}</span>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">Click to Zoom</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reels Tab */}
              {activeTab === 'reels' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reelsList.map((reel) => (
                    <div 
                      key={reel.id}
                      onClick={() => setActiveReelVideo(reel)}
                      className="rounded-2xl overflow-hidden bg-[var(--color-surface-secondary)] border border-[var(--color-border)] h-72 relative group cursor-pointer"
                    >
                      <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4 text-white">
                        <Badge variant="pink" size="sm" className="self-start">🎥 Short Reel</Badge>
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white mx-auto shadow-lg shadow-pink-500/40 group-hover:scale-110 transition-transform">
                            <Play size={20} className="ml-1 fill-white" />
                          </div>
                          <p className="text-xs font-bold line-clamp-2 text-center">{reel.title}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Membership Tiers Tab */}
              {activeTab === 'memberships' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {plans.map((plan) => (
                      <Card
                        key={plan.id}
                        className={`p-6 space-y-4 relative flex flex-col justify-between border ${
                          plan.popular ? 'border-[var(--color-primary)] bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-secondary)] shadow-md shadow-[#EC4899]/10' : 'border-[var(--color-border)]'
                        }`}
                      >
                        {plan.popular && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] uppercase font-black bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white px-3 py-0.5 rounded-full shadow-sm">
                            Most Popular
                          </span>
                        )}

                        <div className="space-y-3">
                          <h3 className="font-extrabold text-base text-[var(--color-text-primary)]">{plan.name}</h3>
                          <div className="text-2xl font-black text-[var(--color-primary)]">
                            ${plan.priceMonthly.toFixed(2)} <span className="text-xs text-[var(--color-text-secondary)] font-bold">/mo</span>
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-semibold">{plan.description}</p>
                          
                          <ul className="space-y-2 text-xs text-[var(--color-text-primary)] pt-3 border-t border-[var(--color-border)]">
                            {plan.benefits.map((b, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-[var(--color-primary)] shrink-0" />
                                <span className="font-semibold text-xs">{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          variant={plan.popular ? 'primary' : 'outline'}
                          size="sm"
                          className="w-full mt-4"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setShowSubModal(true);
                          }}
                        >
                          Select Tier
                        </Button>
                      </Card>
                    ))}
                  </div>

                  {/* Advantages & Disadvantages Breakdown Matrix */}
                  <TierComparisonMatrix
                    tiers={rawTiers}
                    activeTierId={selectedPlan?.id}
                    onSelectTier={(tier) => {
                      setSelectedPlan({
                        id: tier.id,
                        creatorId: tier.creatorId,
                        name: tier.name,
                        priceMonthly: tier.priceMonthly,
                        description: tier.description,
                        benefits: tier.benefits,
                        popular: tier.popular
                      });
                      setShowSubModal(true);
                    }}
                  />
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <Card className="p-6 space-y-5 border border-[var(--color-border)]">
                  <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider">About {creator.fullName}</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-semibold">{creator.bio}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[var(--color-border)] pt-4 text-xs font-semibold text-[var(--color-text-secondary)]">
                    <div>
                      <strong className="text-[var(--color-text-primary)] font-black block text-xs uppercase mb-1">Category</strong>
                      <span>{creator.category}</span>
                    </div>
                    <div>
                      <strong className="text-[var(--color-text-primary)] font-black block text-xs uppercase mb-1">Starting Subscription</strong>
                      <span>${creator.startingPrice}/month</span>
                    </div>
                    <div>
                      <strong className="text-[var(--color-text-primary)] font-black block text-xs uppercase mb-1">Verified Member Since</strong>
                      <span>November 2025</span>
                    </div>
                    <div>
                      <strong className="text-[var(--color-text-primary)] font-black block text-xs uppercase mb-1">Payout Status</strong>
                      <span className="text-emerald-600 font-bold">Stripe Verified</span>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>

      </div>

      
      {/* Sticky Action Bar */}
      <div className={`fixed top-14 left-0 right-0 sm:left-[280px] z-40 bg-[var(--color-surface)]/80 backdrop-blur-xl border-b border-[var(--color-border)] p-3 transition-all duration-300 transform ${isSticky ? 'translate-y-0 opacity-100 visible' : '-translate-y-full opacity-0 invisible'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 sm:px-0">
          <div className="flex items-center gap-3">
            <Avatar src={creator.avatarUrl} alt={creator.fullName} size="sm" isVerified={creator.isVerified} />
            <div className="hidden sm:block">
              <p className="text-sm font-black text-[var(--color-text-primary)] leading-tight">{creator.fullName}</p>
              <p className="text-[10px] text-[var(--color-text-secondary)] font-bold">@{creator.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isFollowing ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleToggleFollow}
              className="hidden sm:flex"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
            {!isSubscribed && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowSubModal(true)}
              >
                Subscribe
              </Button>
            )}
            <Link href={`/messages?user=${creator.username}`}>
              <Button variant="secondary" size="sm" className="hidden sm:flex">
                <MessageSquare size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-black border border-white/10 shadow-2xl">
            <img src={lightboxImage} alt="Gallery Zoomed" className="max-w-full max-h-[80vh] object-contain select-none" />
            <button 
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black border border-white/20 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Reels Video Modal */}
      {activeReelVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveReelVideo(null)}
        >
          <div 
            className="relative max-w-md w-full rounded-3xl overflow-hidden bg-black border border-white/20 shadow-2xl space-y-3 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-white border-b border-white/10 pb-2">
              <h3 className="text-xs font-bold truncate">{activeReelVideo.title}</h3>
              <button onClick={() => setActiveReelVideo(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            
            <video 
              src={activeReelVideo.url} 
              controls 
              autoPlay 
              className="w-full h-[450px] object-cover rounded-2xl" 
            />
          </div>
        </div>
      )}

      {/* Duration & Tier Subscription Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-[var(--color-surface)] rounded-[26px] max-w-md w-full p-6 space-y-5 relative border border-[var(--color-border)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[var(--color-primary)]" size={20} />
                <h3 className="text-base font-extrabold text-[var(--color-text-primary)]">Subscribe: {selectedPlan.name}</h3>
              </div>
              <button onClick={() => setShowSubModal(false)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[var(--color-text-primary)] font-bold mb-1.5">Select Duration:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { m: 1, label: '1 Month', disc: 'Standard' },
                    { m: 3, label: '3 Months', disc: 'Save 10%' },
                    { m: 6, label: '6 Months', disc: 'Save 15%' },
                    { m: 12, label: '1 Year', disc: 'Save 20%' }
                  ].map((item) => (
                    <button
                      key={item.m}
                      type="button"
                      onClick={() => setDurationMonths(item.m)}
                      className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                        durationMonths === item.m
                          ? 'bg-[var(--color-soft-primary)] border-[var(--color-primary)] text-[var(--color-primary)] shadow-xs font-bold'
                          : 'bg-[var(--color-surface-secondary)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                      }`}
                    >
                      <div className="flex justify-between font-bold">
                        <span>{item.label}</span>
                        <span className="text-[10px] bg-[#EC4899]/10 text-[#EC4899] px-1.5 py-0.5 rounded-full">{item.disc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between bg-[var(--color-surface-secondary)] p-3 rounded-2xl border border-[var(--color-border)]">
                <span className="text-[var(--color-text-primary)] font-semibold">Auto-renew subscription</span>
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="accent-[#EC4899] w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="bg-[var(--color-surface-secondary)] p-4 rounded-2xl border border-[var(--color-border)] space-y-1">
                <div className="flex justify-between font-extrabold text-[var(--color-text-primary)] text-sm">
                  <span>Total ({durationMonths} month{durationMonths > 1 ? 's' : ''}):</span>
                  <span className="text-emerald-600 font-black">${totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)]">Includes full access to exclusive posts, media, & member chat.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowSubModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSubscribeConfirm}>
                  Confirm & Pay ${totalPrice.toFixed(2)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Tip Modal */}
      {showSupportModal && (
        <SupportModal
          creatorName={creator.fullName}
          creatorAvatar={creator.avatarUrl}
          creatorUsername={creator.username}
          onClose={() => setShowSupportModal(false)}
        />
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <CheckoutModal
          type="subscription"
          amount={totalPrice}
          description={`Subscription: ${selectedPlan.name}`}
          creatorId={creatorKey}
          creatorName={creator.fullName}
          creatorAvatar={creator.avatarUrl}
          creatorUsername={creator.username}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          durationMonths={durationMonths}
          autoRenew={autoRenew}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={() => {
            subscribeUserToTier({
              userId: 'user-member-1',
              userName: 'Alex Rivers',
              userUsername: 'alexrivers',
              creatorId: creatorKey,
              creatorName: creator.fullName,
              creatorUsername: creator.username,
              creatorAvatar: creator.avatarUrl,
              tierId: selectedPlan.id,
              billingCycle: durationMonths === 12 ? 'annual' : 'monthly',
            });
            setIsSubscribed(true);
            setShowCheckoutModal(false);
            showToast(`VIP Subscription active for @${creator.username}! Unlocked all tier perks.`);
          }}
        />
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#18181B] text-white px-5 py-2.5 rounded-2xl text-xs font-bold border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <span>{toastMessage}</span>
        </div>
      )}
    </MainLayout>
  );
}

export default CreatorProfilePage;
