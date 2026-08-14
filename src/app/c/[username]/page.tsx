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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 space-y-6 max-w-3xl mx-auto lg:mx-0 w-full pb-20 lg:pb-8">
          {/* Cover & Profile Card */}
          <Card className="p-0 overflow-hidden relative border border-slate-800">
            <div className="h-44 sm:h-56 relative bg-slate-900">
              <img
                src={creator.coverImageUrl}
                alt={creator.fullName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            </div>

            <div className="px-6 pb-6 pt-0 relative space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 relative z-10">
                <Avatar
                  alt={creator.fullName}
                  src={creator.avatarUrl}
                  size="xl"
                  isVerified={creator.isVerified}
                  className="border-4 border-slate-950 shadow-2xl"
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
                    leftIcon={<Heart size={14} className="text-rose-500 fill-rose-500" />}
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
                  <h1 className="text-2xl font-black text-white">{creator.fullName}</h1>
                  <Badge variant="cyan" size="sm">{creator.category}</Badge>
                </div>
                <p className="text-xs text-cyan-400 font-medium">@{creator.username}</p>
                <p className="text-sm text-slate-300 leading-relaxed">{creator.headline}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{creator.bio}</p>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <div>
                  <strong className="text-slate-100 text-sm block">{creator.subscriberCount.toLocaleString()}</strong>
                  <span>VIP Subscribers</span>
                </div>
                <div>
                  <strong className="text-slate-100 text-sm block">{creator.followerCount.toLocaleString()}</strong>
                  <span>Followers</span>
                </div>
                <div>
                  <strong className="text-slate-100 text-sm block">{creator.profileViews.toLocaleString()}</strong>
                  <span>Profile Views</span>
                </div>
              </div>
            </div>
          </Card>

          {/* PRD Section 4 Profile Tabs: Posts, Media, Reels, Memberships, About */}
          <div className="flex items-center border-b border-slate-800 text-xs font-semibold overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-3 border-b-2 shrink-0 transition-all ${
                activeTab === 'posts' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`px-4 py-3 border-b-2 shrink-0 transition-all flex items-center gap-1.5 ${
                activeTab === 'media' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon size={13} /> Media Gallery
            </button>
            <button
              onClick={() => setActiveTab('reels')}
              className={`px-4 py-3 border-b-2 shrink-0 transition-all flex items-center gap-1.5 ${
                activeTab === 'reels' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film size={13} /> Reels
            </button>
            <button
              onClick={() => setActiveTab('memberships')}
              className={`px-4 py-3 border-b-2 shrink-0 transition-all flex items-center gap-1.5 ${
                activeTab === 'memberships' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock size={13} /> Membership Plans
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-3 border-b-2 shrink-0 transition-all flex items-center gap-1.5 ${
                activeTab === 'about' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
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
                    plan.popular ? 'border-cyan-500/50 bg-slate-900/90' : ''
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold bg-cyan-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-slate-100">{plan.name}</h3>
                    <div className="text-3xl font-black gradient-text">${plan.priceMonthly.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/mo</span></div>
                    <p className="text-xs text-slate-400">{plan.description}</p>
                    <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                      {plan.benefits.map((b, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-cyan-400 shrink-0" />
                          <span>{b}</span>
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
            <Card className="p-6 space-y-4 text-xs text-slate-300">
              <h3 className="text-base font-bold text-slate-100">About {creator.fullName}</h3>
              <p className="leading-relaxed">{creator.bio}</p>
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <p><strong>Category:</strong> {creator.category}</p>
                <p><strong>Total Lifetime Revenue:</strong> ${creator.totalRevenue.toLocaleString()}</p>
                <p><strong>Member Since:</strong> November 2025</p>
              </div>
            </Card>
          )}

          {activeTab === 'media' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 h-44">
                <img src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600" alt="Media" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 h-44">
                <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600" alt="Media" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {activeTab === 'reels' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 h-64 relative group">
                <img src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600" alt="Reel" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Film size={24} className="text-white" />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PRD Subscription Duration Picker Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-cyan-400" size={20} />
                <h3 className="text-lg font-bold text-slate-100">Subscribe to {selectedPlan.name}</h3>
              </div>
              <button onClick={() => setShowSubModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Duration Choice: 1, 3, 6, 12 months */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Select Duration:</label>
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
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center transition-all ${
                        durationMonths === item.m
                          ? 'gradient-btn text-white shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Renewal Toggle */}
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-medium">Auto-renew subscription</span>
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="accent-cyan-400 w-4 h-4"
                />
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between font-bold text-slate-100 text-sm">
                  <span>Total Amount ({durationMonths} month{durationMonths > 1 ? 's' : ''}):</span>
                  <span className="text-cyan-400">${totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-400">Includes full access to exclusive posts, media, & member chat.</p>
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
