'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Sparkles, Lock, CheckCircle2, UserPlus, Heart, MessageSquare, 
  Share2, ShieldCheck, Star, Users, Check, Globe, X, Film, Info, Image as ImageIcon 
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PostCard } from '@/components/post-card';
import { SupportModal } from '@/components/support-modal';
import { 
  MOCK_CREATOR_DETAILS, MOCK_POSTS, MOCK_MEMBERSHIP_PLANS, 
  CreatorProfile, MembershipPlan 
} from '@/lib/supabase/store';

export default function CreatorProfilePage() {
  const params = useParams();
  const username = (params.username as string) || 'sarahdesign';

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
  const [durationMonths, setDurationMonths] = useState<number>(1); // 1, 3, 6, 12 months
  const [autoRenew, setAutoRenew] = useState(true);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // PRD Profile Tabs: Posts, Media, Reels, Memberships, About
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'reels' | 'memberships' | 'about'>('posts');

  const creatorPosts = MOCK_POSTS.filter((p) => p.authorUsername === creator.username);

  const discountMultiplier = durationMonths === 12 ? 0.8 : durationMonths === 6 ? 0.85 : durationMonths === 3 ? 0.9 : 1.0;
  const totalPrice = Math.round(selectedPlan.priceMonthly * durationMonths * discountMultiplier * 100) / 100;

  const handleSubscribeConfirm = () => {
    setIsSubscribed(true);
    setShowSubModal(false);
  };

  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 space-y-6 max-w-3xl mx-auto lg:mx-0 w-full pb-20 lg:pb-8">
          {/* Cover & Profile Card */}
          <Card className="p-0 overflow-hidden relative border border-[#F3DCE8] shadow-sm shadow-[#EC4899]/5">
            <div className="h-44 sm:h-56 relative bg-[#FFF1F7]">
              <img
                src={creator.coverImageUrl}
                alt={creator.fullName}
                className="w-full h-full object-cover"
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

                  {/* PRD Tip Button */}
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
                  <h1 className="text-2xl font-black text-[#18181B]">{creator.fullName}</h1>
                  <Badge variant="pink" size="sm">{creator.category}</Badge>
                </div>
                <p className="text-xs text-[#BE185D] font-bold">@{creator.username}</p>
                <p className="text-sm text-[#18181B] leading-relaxed font-semibold">{creator.headline}</p>
                <p className="text-xs text-[#71717A] leading-relaxed font-medium">{creator.bio}</p>
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
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-3 border-b-2 shrink-0 transition-all cursor-pointer ${
                activeTab === 'posts' ? 'border-[#EC4899] text-[#BE185D]' : 'border-transparent text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`px-4 py-3 border-b-2 shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'media' ? 'border-[#EC4899] text-[#BE185D]' : 'border-transparent text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              <ImageIcon size={13} /> Media Gallery
            </button>
            <button
              onClick={() => setActiveTab('reels')}
              className={`px-4 py-3 border-b-2 shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reels' ? 'border-[#EC4899] text-[#BE185D]' : 'border-transparent text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              <Film size={13} /> Reels
            </button>
            <button
              onClick={() => setActiveTab('memberships')}
              className={`px-4 py-3 border-b-2 shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'memberships' ? 'border-[#BE185D] text-[#BE185D]' : 'border-transparent text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              <Lock size={13} /> Membership Plans
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-3 border-b-2 shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'about' ? 'border-[#EC4899] text-[#BE185D]' : 'border-transparent text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              <Info size={13} /> About Creator
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {creatorPosts.map((post) => (
                <PostCard key={post.id} post={post} isMemberUnlocked={isSubscribed} />
              ))}
            </div>
          )}

          {activeTab === 'memberships' && (
            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`p-5 space-y-4 relative flex flex-col justify-between ${
                    plan.popular ? 'border-[#EC4899] bg-[#FFF9FC] shadow-md shadow-[#EC4899]/10' : ''
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase font-extrabold bg-[#EC4899] text-white px-3 py-0.5 rounded-full shadow-sm">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base text-[#18181B]">{plan.name}</h3>
                    <div className="text-3xl font-black text-[#BE185D]">${plan.priceMonthly.toFixed(2)} <span className="text-xs text-[#71717A] font-medium">/mo</span></div>
                    <p className="text-xs text-[#71717A] font-medium leading-relaxed">{plan.description}</p>
                    <ul className="space-y-2 text-xs text-[#18181B] pt-2 border-t border-[#F3DCE8]">
                      {plan.benefits.map((b, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-[#EC4899] shrink-0" />
                          <span className="font-medium">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full mt-2"
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
            <Card className="p-6 space-y-4 text-xs text-[#52525B]">
              <h3 className="text-base font-extrabold text-[#18181B]">About {creator.fullName}</h3>
              <p className="leading-relaxed">{creator.bio}</p>
              <div className="space-y-2 border-t border-[#F3DCE8] pt-3 font-medium">
                <p><strong className="text-[#18181B]">Category:</strong> {creator.category}</p>
                <p><strong className="text-[#18181B]">Total Lifetime Revenue:</strong> ${creator.totalRevenue.toLocaleString()}</p>
                <p><strong className="text-[#18181B]">Member Since:</strong> November 2025</p>
              </div>
            </Card>
          )}

          {activeTab === 'media' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden bg-[#FFF1F7] border border-[#F3DCE8] h-44">
                <img src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600" alt="Media" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden bg-[#FFF1F7] border border-[#F3DCE8] h-44">
                <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600" alt="Media" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {activeTab === 'reels' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden bg-[#FFF1F7] border border-[#F3DCE8] h-64 relative group">
                <img src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600" alt="Reel" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <Film size={24} className="text-white" />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Subscription Duration Picker Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 space-y-5 relative border border-[#F3DCE8] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#EC4899]" size={20} />
                <h3 className="text-lg font-extrabold text-[#18181B]">Subscribe to {selectedPlan.name}</h3>
              </div>
              <button onClick={() => setShowSubModal(false)} className="text-[#71717A] hover:text-[#18181B] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Duration Choice: 1, 3, 6, 12 months */}
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

              {/* Auto Renewal Toggle */}
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

      <MobileNav />
    </div>
  );
}
