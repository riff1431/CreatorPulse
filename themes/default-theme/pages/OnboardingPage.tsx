'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import { 
  Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Camera,
  Image as ImageIcon, Heart, Users, Bell, DollarSign,
  CreditCard, Share2, Shield, Eye, Check, RefreshCw,
  Compass, Radio, Film, Layers, Award, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { prefersReducedMotion } from '../utils/animations';

// Preset avatar options for quick identity setup
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
];

// Topic category pills
const TOPIC_CATEGORIES = [
  { id: 'art', label: '🎨 Art & 3D Design', count: '1.2k creators' },
  { id: 'tech', label: '💻 Tech & Coding', count: '980 creators' },
  { id: 'photo', label: '📷 Photography', count: '2.4k creators' },
  { id: 'music', label: '🎵 Music & Audio', count: '750 creators' },
  { id: 'fitness', label: '💪 Fitness & Health', count: '1.8k creators' },
  { id: 'lifestyle', label: '🌴 Lifestyle & Travel', count: '3.1k creators' },
  { id: 'gaming', label: '🎮 Gaming & Esports', count: '1.5k creators' },
  { id: 'business', label: '📈 Indie Business', count: '890 creators' },
];

// Recommended starter pack of creators
const STARTER_CREATORS = [
  {
    id: 'c-sonya',
    name: 'Sonya Leena',
    username: 'sonyaleena',
    category: 'Lifestyle & Travel',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    followers: '14.2K',
    previewImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
  },
  {
    id: 'c-adam',
    name: 'Adam Addisin',
    username: 'adamaddisin',
    category: 'Photography',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    followers: '9.8K',
    previewImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
  },
  {
    id: 'c-nicole',
    name: 'Nicole Segall',
    username: 'nicolesegall',
    category: 'Art & Design',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    followers: '21.5K',
    previewImage: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=500',
  },
];

export function OnboardingPage() {
  const router = useRouter();
  const { user, role, saveOnboardingProgress, completeOnboarding } = useAuth();
  
  const isCreator = role === 'creator' || user?.role === 'creator';
  const totalSteps = 4;

  // Step state (hydrated from user.onboardingStep if available)
  const [currentStep, setCurrentStep] = useState<number>(user?.onboardingStep || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletedCelebrate, setIsCompletedCelebrate] = useState(false);

  // Fan Form State
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || PRESET_AVATARS[0]);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.onboardingData?.interests || ['art', 'tech']
  );
  const [followedCreators, setFollowedCreators] = useState<string[]>(
    user?.onboardingData?.followedCreators || ['c-sonya']
  );
  const [prefEmailDigest, setPrefEmailDigest] = useState(true);
  const [prefDropAlerts, setPrefDropAlerts] = useState(true);
  const [prefThemeDark, setPrefThemeDark] = useState(false);

  // Creator Form State
  const [creatorHeadline, setCreatorHeadline] = useState(
    user?.onboardingData?.headline || 'Senior Designer & Digital Creator'
  );
  const [creatorCategory, setCreatorCategory] = useState(
    user?.category || 'Art & Design'
  );
  const [creatorCoverUrl, setCreatorCoverUrl] = useState(
    user?.coverUrl || user?.onboardingData?.coverImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200'
  );
  const [monthlyPrice, setMonthlyPrice] = useState<number>(
    user?.onboardingData?.startingPrice || 9.99
  );
  const [vipDropPrice, setVipDropPrice] = useState<number>(4.99);
  const [payoutMethod, setPayoutMethod] = useState(
    user?.onboardingData?.payoutMethod || 'stripe'
  );
  const [payoutAccount, setPayoutAccount] = useState(
    user?.onboardingData?.payoutAccount || user?.email || ''
  );
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [welcomePostText, setWelcomePostText] = useState(
    'Hey everyone! Welcome to my official CreatorPulse channel. Exclusive drops and livestreams coming soon! ✨'
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Resume-after-refresh check on mount
  useEffect(() => {
    if (user?.onboardingStep && user.onboardingStep > 1 && user.onboardingStep <= 4) {
      setCurrentStep(user.onboardingStep);
    }
  }, [user?.onboardingStep]);

  // Animate step transitions
  useEffect(() => {
    if (containerRef.current && !prefersReducedMotion()) {
      gsap.fromTo(
        '.onboarding-step-content',
        { opacity: 0, y: 15, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [currentStep]);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleFollow = (creatorId: string) => {
    setFollowedCreators((prev) =>
      prev.includes(creatorId) ? prev.filter((id) => id !== creatorId) : [...prev, creatorId]
    );
  };

  // Next Step Action (Saves progress)
  const handleNextStep = async () => {
    setIsSubmitting(true);
    const nextStep = currentStep + 1;

    const dataToSave = isCreator
      ? {
          fullName,
          bio,
          avatarUrl,
          coverImageUrl: creatorCoverUrl,
          category: creatorCategory,
          headline: creatorHeadline,
          startingPrice: monthlyPrice,
          payoutMethod,
          payoutAccount,
          socialLinks: { twitter: socialTwitter, instagram: socialInstagram },
        }
      : {
          fullName,
          bio,
          avatarUrl,
          interests: selectedInterests,
          followedCreators,
          preferences: {
            emailDigest: prefEmailDigest,
            instantDropAlerts: prefDropAlerts,
            prefersDark: prefThemeDark,
          },
        };

    if (saveOnboardingProgress) {
      await saveOnboardingProgress(nextStep, dataToSave);
    }

    setIsSubmitting(false);
    if (nextStep <= totalSteps) {
      setCurrentStep(nextStep);
    } else {
      handleCompleteOnboarding();
    }
  };

  // Complete Onboarding Action
  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    setIsCompletedCelebrate(true);

    const finalData = isCreator
      ? {
          fullName,
          bio,
          avatarUrl,
          coverImageUrl: creatorCoverUrl,
          category: creatorCategory,
          headline: creatorHeadline,
          startingPrice: monthlyPrice,
          payoutMethod,
          payoutAccount,
          socialLinks: { twitter: socialTwitter, instagram: socialInstagram },
        }
      : {
          fullName,
          bio,
          avatarUrl,
          interests: selectedInterests,
          followedCreators,
          preferences: {
            emailDigest: prefEmailDigest,
            instantDropAlerts: prefDropAlerts,
            prefersDark: prefThemeDark,
          },
        };

    if (completeOnboarding) {
      await completeOnboarding(finalData);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      const destination = isCreator ? '/creator/dashboard' : '/feed';
      router.push(destination);
    }, 1500);
  };

  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-[#FFF9FC] via-[#FFF1F7]/70 to-[#FCE7F3]/30 dark:from-[#150D1E] dark:via-[#1A1024] dark:to-[#22152E] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-pink-100 text-[#18181B] dark:text-[#FDF2F8]">
      
      {/* Top Floating App Brand & Stepper Progress */}
      <div className="max-w-xl w-full space-y-6 pb-6">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF8A00] via-[#EC4899] to-[#7928CA] flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#18181B] dark:text-[#FDF2F8]">
                CreatorPulse
              </span>
              <span className="ml-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-pink-100 text-[#EC4899] dark:bg-pink-950/60 dark:text-pink-400">
                {isCreator ? 'Creator Setup' : 'Fan Setup'}
              </span>
            </div>
          </Link>

          <span className="text-xs font-black text-[#71717A] dark:text-[#D4B8D0]">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Stepper Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-[#E4E4E7] dark:bg-[#3A2A4C] h-2 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-[#FF8A00] via-[#EC4899] to-[#7928CA] rounded-full transition-all duration-500 ease-out"
            />
          </div>

          {/* Step Pill Indicators */}
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-extrabold">
            <span className={currentStep >= 1 ? 'text-[var(--color-primary)]' : 'text-[#A1A1AA]'}>
              1. Profile
            </span>
            <span className={currentStep >= 2 ? 'text-[var(--color-primary)]' : 'text-[#A1A1AA]'}>
              {isCreator ? '2. Pricing' : '2. Interests'}
            </span>
            <span className={currentStep >= 3 ? 'text-[var(--color-primary)]' : 'text-[#A1A1AA]'}>
              {isCreator ? '3. Payout' : '3. Connect'}
            </span>
            <span className={currentStep >= 4 ? 'text-[var(--color-primary)]' : 'text-[#A1A1AA]'}>
              4. Launch
            </span>
          </div>
        </div>
      </div>

      {/* Main Wizard Card */}
      <Card className="max-w-xl w-full p-6 sm:p-8 rounded-[36px] border border-[#F3DCE8] dark:border-[#3A2A4C] bg-white/90 dark:bg-[#150D1E]/90 backdrop-blur-2xl shadow-xl shadow-pink-500/5 space-y-6 relative overflow-hidden">
        
        {/* Celebration Overlay on Complete */}
        {isCompletedCelebrate && (
          <div className="absolute inset-0 z-30 bg-white/95 dark:bg-[#150D1E]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-[#18181B] dark:text-[#FDF2F8]">
              Setup Complete! 🎉
            </h3>
            <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] max-w-sm">
              Your profile is verified and ready. Redirecting you to your personalized {isCreator ? 'Creator Studio' : 'Home Feed'}...
            </p>
          </div>
        )}

        <div className="onboarding-step-content space-y-6">

          {/* ========================================================================= */}
          {/* FAN FLOW (MEMBER)                                                         */}
          {/* ========================================================================= */}
          {!isCreator && (
            <>
              {/* STEP 1: Profile & Identity */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-black text-[#18181B] dark:text-[#FDF2F8]">
                      Choose Your Avatar & Bio
                    </h2>
                    <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
                      Personalize your identity across the creator community.
                    </p>
                  </div>

                  {/* Active Avatar Preview */}
                  <div className="flex flex-col items-center justify-center gap-3 pt-2">
                    <div className="relative">
                      <div className="p-1 rounded-full bg-gradient-to-tr from-[#FF8A00] via-[#EC4899] to-[#7928CA] shadow-md">
                        <img
                          src={avatarUrl}
                          alt="Avatar Preview"
                          className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#150D1E]"
                        />
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold text-[var(--color-primary)]">
                      Selected Avatar
                    </span>
                  </div>

                  {/* Preset Avatar Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                      Pick from presets:
                    </label>
                    <div className="flex items-center justify-center gap-3 overflow-x-auto py-1">
                      {PRESET_AVATARS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(preset)}
                          className={`p-0.5 rounded-full transition-all cursor-pointer ${
                            avatarUrl === preset
                              ? 'ring-2 ring-[var(--color-primary)] scale-110'
                              : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={preset}
                            alt="Preset"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom URL Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                      Or Custom Image URL
                    </label>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899]"
                    />
                  </div>

                  {/* Display Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899]"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                      Bio / Tagline
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="E.g. UI enthusiast, traveler & photography lover ✨"
                      className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Interests & Topics */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-black text-[#18181B] dark:text-[#FDF2F8]">
                      Pick Your Interests
                    </h2>
                    <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
                      Select at least 2 topics so we can tune your feed and stories.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    {TOPIC_CATEGORIES.map((topic) => {
                      const isSelected = selectedInterests.includes(topic.id);
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => toggleInterest(topic.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-[#381A2B] dark:to-[#22152E] border-[var(--color-primary)] shadow-sm'
                              : 'bg-white dark:bg-[#22152E] border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-pink-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-[#18181B] dark:text-[#FDF2F8]">
                              {topic.label}
                            </span>
                            {isSelected && (
                              <CheckCircle2 size={16} className="text-[var(--color-primary)] shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-[#A1A1AA] font-bold mt-2">
                            {topic.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Connect With Creators */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-black text-[#18181B] dark:text-[#FDF2F8]">
                      Follow Featured Creators
                    </h2>
                    <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
                      Get instant access to top posts, VIP drops, and 24-hour stories.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {STARTER_CREATORS.map((creator) => {
                      const isFollowing = followedCreators.includes(creator.id);
                      return (
                        <div
                          key={creator.id}
                          className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={creator.avatar}
                              alt={creator.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-[#150D1E]"
                            />
                            <div>
                              <p className="font-extrabold text-xs text-[#18181B] dark:text-[#FDF2F8]">
                                {creator.name}
                              </p>
                              <p className="text-[10px] text-[#A1A1AA] font-medium">
                                @{creator.username} • {creator.category}
                              </p>
                              <span className="text-[10px] font-black text-[var(--color-primary)]">
                                {creator.followers} followers
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleFollow(creator.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                              isFollowing
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white shadow-sm hover:opacity-95'
                            }`}
                          >
                            {isFollowing ? 'Following ✓' : '+ Follow'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: Preferences & Launch */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-black text-[#18181B] dark:text-[#FDF2F8]">
                      Experience Preferences
                    </h2>
                    <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
                      Configure how you want to be notified of new drops and livestreams.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* VIP Drop Notifications */}
                    <div className="p-4 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-xs text-[#18181B] dark:text-[#FDF2F8]">
                          Instant VIP Drop Alerts
                        </p>
                        <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">
                          Get alerted when your followed creators publish limited drops.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefDropAlerts}
                        onChange={(e) => setPrefDropAlerts(e.target.checked)}
                        className="w-5 h-5 accent-[var(--color-primary)] rounded cursor-pointer"
                      />
                    </div>

                    {/* Weekly Creator Digest */}
                    <div className="p-4 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-xs text-[#18181B] dark:text-[#FDF2F8]">
                          Weekly Creator Digest
                        </p>
                        <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">
                          Top trending stories and creator highlights sent weekly.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefEmailDigest}
                        onChange={(e) => setPrefEmailDigest(e.target.checked)}
                        className="w-5 h-5 accent-[var(--color-primary)] rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* CREATOR FLOW                                                              */}
          {/* ========================================================================= */}
          {isCreator && (
            <>
              {/* STEP 1: Creator Identity & Banner */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-black text-[#18181B] dark:text-[#FDF2F8]">
                      Creator Channel Setup
                    </h2>
                    <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
                      Set your brand headline, category, avatar, and banner photo.
                    </p>
                  </div>

                  {/* Banner Preview */}
                  <div className="relative rounded-2xl overflow-hidden h-28 bg-slate-100 dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C]">
                    <img
                      src={creatorCoverUrl}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-bold text-white">
                      Channel Cover
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                      Cover Banner URL
                    </label>
                    <input
                      type="url"
                      value={creatorCoverUrl}
                      onChange={(e) => setCreatorCoverUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Sarah Jenkins"
                        className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                        Primary Category
                      </label>
                      <select
                        value={creatorCategory}
                        onChange={(e) => setCreatorCategory(e.target.value)}
                        className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      >
                        <option value="Art & Design">Art & Design</option>
                        <option value="Education & Tech">Education & Tech</option>
                        <option value="Photography">Photography</option>
                        <option value="Music & Audio">Music & Audio</option>
                        <option value="Fitness & Health">Fitness & Health</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                      Headline & Subtitle
                    </label>
                    <input
                      type="text"
                      value={creatorHeadline}
                      onChange={(e) => setCreatorHeadline(e.target.value)}
                      placeholder="Senior Product Designer & Educator"
                      className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Membership & Pricing */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-black text-[#18181B] dark:text-[#FDF2F8]">
                      Monetization & Tier Pricing
                    </h2>
                    <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
                      Define your subscription rates and VIP member drop access.
                    </p>
                  </div>

                  {/* Monthly Pricing Slider */}
                  <div className="p-4 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-[#18181B] dark:text-[#FDF2F8]">
                        Monthly VIP Membership
                      </span>
                      <span className="text-base font-black text-[var(--color-primary)]">
                        ${monthlyPrice.toFixed(2)}/mo
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2.99"
                      max="49.99"
                      step="1"
                      value={monthlyPrice}
                      onChange={(e) => setMonthlyPrice(parseFloat(e.target.value))}
                      className="w-full accent-[var(--color-primary)] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#A1A1AA] font-bold">
                      <span>$2.99/mo</span>
                      <span>$25.00/mo</span>
                      <span>$49.99/mo</span>
                    </div>
                  </div>

                  {/* VIP Single Drop Base Pricing */}
                  <div className="p-4 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-[#18181B] dark:text-[#FDF2F8]">
                        Average Paywalled Drop Price
                      </span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        ${vipDropPrice.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.99"
                      max="19.99"
                      step="0.5"
                      value={vipDropPrice}
                      onChange={(e) => setVipDropPrice(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Payout Method */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-black text-[#18181B] dark:text-[#FDF2F8]">
                      Payout & Banking
                    </h2>
                    <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
                      Connect your preferred account to receive automated weekly earnings.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'stripe', title: 'Stripe Connect', subtitle: 'Direct bank debit / card' },
                      { id: 'bank', title: 'Direct Bank Wire', subtitle: 'Global SWIFT / IBAN' },
                      { id: 'paypal', title: 'PayPal Payouts', subtitle: 'Instant wallet transfer' },
                      { id: 'crypto', title: 'Crypto (USDC)', subtitle: 'Zero-fee Polygon / Solana' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPayoutMethod(method.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          payoutMethod === method.id
                            ? 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-[#381A2B] dark:to-[#22152E] border-[var(--color-primary)] shadow-sm'
                            : 'bg-white dark:bg-[#22152E] border-[#F3DCE8] dark:border-[#3A2A4C]'
                        }`}
                      >
                        <p className="font-extrabold text-xs text-[#18181B] dark:text-[#FDF2F8]">
                          {method.title}
                        </p>
                        <p className="text-[10px] text-[#A1A1AA] mt-1">{method.subtitle}</p>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                      Payout Email / Address
                    </label>
                    <input
                      type="text"
                      value={payoutAccount}
                      onChange={(e) => setPayoutAccount(e.target.value)}
                      placeholder="payouts@yourdomain.com"
                      className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Socials & Welcome Message */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-black text-[#18181B] dark:text-[#FDF2F8]">
                      Welcome Post & Socials
                    </h2>
                    <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
                      Publish your first introductory post to your new followers.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                      Welcome Post Draft
                    </label>
                    <textarea
                      rows={3}
                      value={welcomePostText}
                      onChange={(e) => setWelcomePostText(e.target.value)}
                      className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                        X / Twitter Handle
                      </label>
                      <input
                        type="text"
                        value={socialTwitter}
                        onChange={(e) => setSocialTwitter(e.target.value)}
                        placeholder="@username"
                        className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold uppercase text-[#71717A] dark:text-[#D4B8D0]">
                        Instagram Handle
                      </label>
                      <input
                        type="text"
                        value={socialInstagram}
                        onChange={(e) => setSocialInstagram(e.target.value)}
                        placeholder="@username"
                        className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Wizard Controls Footer */}
        <div className="pt-4 border-t border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between gap-3">
          
          {/* Back Button */}
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2.5 rounded-2xl border border-[#F3DCE8] dark:border-[#3A2A4C] text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <span />
          )}

          {/* Next / Complete Button */}
          <div className="flex items-center gap-2">
            {currentStep < totalSteps && (
              <button
                type="button"
                onClick={handleNextStep}
                className="text-xs font-bold text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8] px-3 py-2 cursor-pointer"
              >
                Skip
              </button>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={currentStep === totalSteps ? handleCompleteOnboarding : handleNextStep}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white text-xs font-extrabold shadow-md shadow-pink-500/20 hover:scale-102 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : currentStep === totalSteps ? (
                <>
                  <span>Finish Setup</span>
                  <Check size={14} strokeWidth={3} />
                </>
              ) : (
                <>
                  <span>Next Step</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>

      </Card>
    </div>
  );
}

export default OnboardingPage;
