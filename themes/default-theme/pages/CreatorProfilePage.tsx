'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import gsap from 'gsap';
import { 
  Sparkles, Lock, CheckCircle2, UserPlus, Heart, MessageSquare, 
  Share2, ShieldCheck, Star, Users, Check, Globe, X, Film, Info, Image as ImageIcon, AlertCircle
} from 'lucide-react';
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

export function CreatorProfilePage() {
  const params = useParams();
  const username = (params?.username as string) || 'sarahdesign';

  const creatorKey = Object.keys(MOCK_CREATOR_DETAILS).find(
    (k) => MOCK_CREATOR_DETAILS[k].username.toLowerCase() === username.toLowerCase()
  ) || 'user-creator-1';

  const creator: CreatorProfile = MOCK_CREATOR_DETAILS[creatorKey];
  const plans: MembershipPlan[] = MOCK_MEMBERSHIP_PLANS[creatorKey] || [
    { id: 'p1', creatorId: creatorKey, name: 'Starter Community', priceMonthly: 5.00, description: 'Basic tier', benefits: ['Starter Posts'] }
  ];
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan>(plans[1] || plans[0]);
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [autoRenew, setAutoRenew] = useState(true);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'reels' | 'memberships' | 'about'>('posts');

  const modalRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      gsap.fromTo(
        node,
        { scale: 0.85, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.6)', overwrite: 'auto' }
      );
    }
  }, []);

  const [isTabLoading, setIsTabLoading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const creatorPosts = MOCK_POSTS.filter((p) => p.authorUsername === creator.username);

  const mediaGallery = [
    { id: 'gal-1', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600', title: 'Workstation Setup' },
    { id: 'gal-2', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600', title: 'UI Kit Figma Workspace' },
    { id: 'gal-3', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600', title: 'Masterclass Design Guide' },
    { id: 'gal-4', url: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600', title: 'Wireframing Board' }
  ];

  const discountMultiplier = durationMonths === 12 ? 0.8 : durationMonths === 6 ? 0.85 : durationMonths === 3 ? 0.9 : 1.0;
  const totalPrice = Math.round(selectedPlan.priceMonthly * durationMonths * discountMultiplier * 100) / 100;

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsTabLoading(true);
    }, 0);
    const timer2 = setTimeout(() => {
      setIsTabLoading(false);
    }, 450);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [activeTab]);

  const handleSubscribeConfirm = () => {
    setShowSubModal(false);
    setShowCheckoutModal(true);
  };

  return (
    <MainLayout showSidebar={true} showFooter={false}>
      <div className="space-y-6 max-w-3xl mx-auto w-full">
          {/* Cover & Profile Card */}
          <Card className="p-0 overflow-hidden relative border border-[#F3DCE8] shadow-sm shadow-[#EC4899]/5">
            <div className="h-44 sm:h-56 relative bg-[#FFF1F7] overflow-hidden group">
              <img
                src={creator.coverImageUrl}
                alt={creator.fullName}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent"></div>
            </div>

            <div className="px-6 pb-6 pt-0 relative space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 relative z-10">
                <Avatar
                  alt={creator.fullName}
                  src={creator.avatarUrl}
                  size="xl"
                  isVerified={creator.isVerified}
                  className="border-4 border-white shadow-xl"
                />

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant={isFollowing ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setIsFollowing(!isFollowing)}
                    leftIcon={isFollowing ? <Check size={14} /> : <UserPlus size={14} />}
                  >
                    {isFollowing ? 'Following' : 'Follow Free'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSupportModal(true)}
                    leftIcon={<Heart size={14} className="text-[#F43F5E] fill-[#F43F5E]" />}
                  >
                    Support Tip
                  </Button>

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

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-[#18181B] tracking-tight">{creator.fullName}</h1>
                  <Badge variant="pink" size="sm">{creator.category}</Badge>
                </div>
                <p className="text-xs text-[#BE185D] font-bold">@{creator.username}</p>
                <p className="text-sm text-[#18181B] leading-relaxed font-semibold">{creator.headline}</p>
                <p className="text-xs text-[#71717A] leading-relaxed font-semibold">{creator.bio}</p>
              </div>

              <div className="flex items-center gap-6 text-xs text-[#71717A] border-t border-[#F3DCE8] pt-3 font-medium">
                <div>
                  <strong className="text-[#18181B] text-sm block font-extrabold">{creator.subscriberCount.toLocaleString()}</strong>
                  <span>VIP Subscribers</span>
                </div>
                <div>
                  <strong className="text-[#18181B] text-sm block font-extrabold">{creator.followerCount.toLocaleString()}</strong>
                  <span>Followers</span>
                </div>
                <div>
                  <strong className="text-[#18181B] text-sm block font-extrabold">{creator.profileViews.toLocaleString()}</strong>
                  <span>Profile Views</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Profile Tabs: Posts, Media, Reels, Memberships, About */}
          <div className="flex items-center border-b border-[#F3DCE8] text-xs font-bold overflow-x-auto scrollbar-none">
            {[
              { id: 'posts', label: 'Posts' },
              { id: 'media', label: '🖼️ Media Gallery' },
              { id: 'reels', label: '🎥 Reels' },
              { id: 'memberships', label: '🔒 Membership Plans' },
              { id: 'about', label: 'ℹ️ About Creator' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'posts' | 'media' | 'reels' | 'memberships' | 'about')}
                className={`px-4 py-3 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'border-[#EC4899] text-[#BE185D]' 
                    : 'border-transparent text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          {isTabLoading ? (
            <div className="space-y-4">
              <div className="bg-white border border-[#F3DCE8] rounded-3xl p-5 space-y-3">
                <div className="w-1/3 h-4 skeleton-shimmer rounded-full" />
                <div className="w-full h-3 skeleton-shimmer rounded-full" />
                <div className="w-5/6 h-3 skeleton-shimmer rounded-full" />
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  {creatorPosts.length === 0 ? (
                    <div className="text-center py-10 bg-white border border-[#F3DCE8] rounded-[24px]">
                      <AlertCircle size={24} className="text-[#A1A1AA] mx-auto mb-2" />
                      <p className="text-xs text-[#71717A] font-bold">No posts published by this creator yet.</p>
                    </div>
                  ) : (
                    creatorPosts.map((post) => (
                      <PostCard key={post.id} post={post} isMemberUnlocked={isSubscribed} />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'memberships' && (
                <div className="grid md:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`p-5 space-y-4 relative flex flex-col justify-between border ${
                        plan.popular ? 'border-[#EC4899] bg-[#FFF9FC] shadow-sm shadow-[#EC4899]/10' : 'border-[#F3DCE8]'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] uppercase font-black bg-[#EC4899] text-white px-3 py-0.5 rounded-full shadow-sm">
                          Most Popular
                        </span>
                      )}

                      <div className="space-y-2">
                        <h3 className="font-extrabold text-sm text-[#18181B]">{plan.name}</h3>
                        <div className="text-2xl font-black text-[#BE185D]">${plan.priceMonthly.toFixed(2)} <span className="text-[10px] text-[#71717A] font-medium">/mo</span></div>
                        <p className="text-[11px] text-[#71717A] leading-relaxed font-semibold">{plan.description}</p>
                        <ul className="space-y-2 text-xs text-[#18181B] pt-2 border-t border-[#F3DCE8]">
                          {plan.benefits.map((b, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#EC4899] shrink-0" />
                              <span className="font-semibold text-[11px]">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowSubModal(true);
                        }}
                      >
                        Select Plan
                      </Button>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'about' && (
                <Card className="p-6 space-y-4 text-xs text-[#52525B] border border-[#F3DCE8]">
                  <h3 className="text-sm font-black text-[#18181B] uppercase tracking-tight">About {creator.fullName}</h3>
                  <p className="leading-relaxed font-semibold">{creator.bio}</p>
                  <div className="space-y-2 border-t border-[#F3DCE8] pt-3 font-semibold text-[#71717A]">
                    <p><strong className="text-[#18181B] font-extrabold">Category:</strong> {creator.category}</p>
                    <p><strong className="text-[#18181B] font-extrabold">Starting Subscription:</strong> ${creator.startingPrice}/mo</p>
                    <p><strong className="text-[#18181B] font-extrabold">Member Since:</strong> November 2025</p>
                  </div>
                </Card>
              )}

              {activeTab === 'media' && (
                <div className="grid grid-cols-2 gap-4">
                  {mediaGallery.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setLightboxImage(item.url)}
                      className="rounded-2xl overflow-hidden bg-[#FFF1F7] border border-[#F3DCE8] h-44 cursor-zoom-in relative group"
                    >
                      <img 
                        src={item.url} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5">
                        <ImageIcon size={16} /> Zoom View
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reels' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl overflow-hidden bg-[#FFF1F7] border border-[#F3DCE8] h-64 relative group cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600" alt="Reel" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center text-white text-xs font-bold gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <Film size={18} className="animate-pulse" /> Play vertical reel
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

      {/* Lightbox Modal overlay */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl bg-black border border-white/10">
            <img src={lightboxImage} alt="Gallery Zoomed" className="max-w-full max-h-[80vh] object-contain select-none" />
            <button 
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/55 text-white rounded-full hover:bg-black border border-white/10 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Subscription Duration Picker Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-white rounded-[24px] max-w-md w-full p-6 space-y-5 relative border border-[#F3DCE8] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#EC4899]" size={20} />
                <h3 className="text-lg font-extrabold text-[#18181B]">Subscribe to {selectedPlan.name}</h3>
              </div>
              <button onClick={() => setShowSubModal(false)} className="text-[#71717A] hover:text-[#18181B] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[#18181B] font-bold mb-1.5">Select Duration:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { m: 1, label: '1 Mo' },
                    { m: 3, label: '3 Mo (-10%)' },
                    { m: 6, label: '6 Mo (-15%)' },
                    { m: 12, label: '1 Year (-20%)' }
                  ].map((item) => (
                    <button
                      key={item.m}
                      type="button"
                      onClick={() => setDurationMonths(item.m)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                        durationMonths === item.m
                          ? 'gradient-btn text-white shadow-md shadow-[#EC4899]/20'
                          : 'bg-[#FFF9FC] text-[#71717A] border border-[#F3DCE8] hover:bg-[#FFF1F7]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#FFF9FC] p-3 rounded-2xl border border-[#F3DCE8]">
                <span className="text-[#18181B] font-semibold">Auto-renew subscription</span>
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="accent-[#EC4899] w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="bg-[#FFF1F7] p-4 rounded-2xl border border-[#F3DCE8] space-y-1.5">
                <div className="flex justify-between font-extrabold text-[#18181B] text-sm">
                  <span>Total Amount ({durationMonths} month{durationMonths > 1 ? 's' : ''}):</span>
                  <span className="text-emerald-600 font-black">${totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-[#71717A]">Includes full access to exclusive posts, media, & member chat.</p>
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
          onSuccess={(res) => {
            setIsSubscribed(true);
            setShowCheckoutModal(false);
          }}
        />
      )}

      </div>
    </MainLayout>
  );
}

export default CreatorProfilePage;
