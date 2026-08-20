'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings, Save, User, CreditCard, Lock, Sparkles, Image as ImageIcon,
  Building, CheckCircle2, Shield, Globe, Eye, EyeOff, Plus, Trash2,
  ExternalLink, Copy, Check, RefreshCw, Layers, Sliders, DollarSign,
  Radio, Smartphone, HelpCircle, ArrowRight, ShieldCheck, AlertCircle,
  Banknote, Wallet, Zap, ShieldAlert, Key, Filter, AtSign, ChevronDown,
  Info, CheckSquare, MessageSquare, Flame
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { MediaUploader } from '@/components/ui/MediaUploader';

// Types for dynamic payout accounts
export type PayoutChannelType = 'bank' | 'paypal' | 'stripe' | 'crypto' | 'wise';

export interface SavedPayoutAccount {
  id: string;
  type: PayoutChannelType;
  label: string;
  accountIdentifier: string;
  isPrimary: boolean;
  currency: string;
  status: 'Verified' | 'Pending Review' | 'Active';
}

export default function CreatorSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'payouts' | 'privacy'>('profile');
  const { showToast } = useToast();

  // Progress Bar & Saving State
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);

  // ----------------------------------------------------
  // TAB 1: Profile & Identity States
  // ----------------------------------------------------
  const [displayName, setDisplayName] = useState('Sarah Jenkins');
  const [handle, setHandle] = useState('sarahdesign');
  const [headline, setHeadline] = useState('UI/UX Design Systems & Design Engineering Masterclasses');
  const [bio, setBio] = useState('Senior Product Designer & Educator. Teaching UI/UX design systems, Figma tokens, and full-stack frontend design engineering to 14k+ creative minds.');
  const [category, setCategory] = useState('Art & Design');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200');
  
  // Social links
  const [socialYoutube, setSocialYoutube] = useState('https://youtube.com/@sarahdesign');
  const [socialX, setSocialX] = useState('https://x.com/sarahdesign');
  const [socialInstagram, setSocialInstagram] = useState('https://instagram.com/sarahdesign');
  const [socialWebsite, setSocialWebsite] = useState('https://sarahjenkins.design');

  // ----------------------------------------------------
  // TAB 2: Payout Accounts & Withdrawal States
  // ----------------------------------------------------
  const [selectedChannel, setSelectedChannel] = useState<PayoutChannelType>('bank');
  
  // Saved Payout Accounts list
  const [savedAccounts, setSavedAccounts] = useState<SavedPayoutAccount[]>([
    {
      id: 'acc-1',
      type: 'bank',
      label: 'Chase Premier Checking',
      accountIdentifier: 'Chase Bank (•••• 4920)',
      isPrimary: true,
      currency: 'USD',
      status: 'Verified'
    },
    {
      id: 'acc-2',
      type: 'paypal',
      label: 'PayPal Business Wallet',
      accountIdentifier: 'sarah.jenkins@creatorstudio.io',
      isPrimary: false,
      currency: 'USD',
      status: 'Active'
    }
  ]);

  // Dynamic Bank fields
  const [bankName, setBankName] = useState('JPMorgan Chase Bank, N.A.');
  const [accountHolder, setAccountHolder] = useState('Sarah Jenkins');
  const [routingNumber, setRoutingNumber] = useState('021000021');
  const [accountNumber, setAccountNumber] = useState('•••• •••• •••• 4920');
  const [accountType, setAccountType] = useState('checking');
  const [swiftBic, setSwiftBic] = useState('CHASUS33');

  // Dynamic PayPal fields
  const [paypalEmail, setPaypalEmail] = useState('sarah.jenkins@creatorstudio.io');
  const [paypalCurrency, setPaypalCurrency] = useState('USD');

  // Dynamic Stripe fields
  const [stripeEmail, setStripeEmail] = useState('sarah@jenkins.design');
  const [stripeCountry, setStripeCountry] = useState('United States (US)');

  // Dynamic Crypto fields
  const [cryptoNetwork, setCryptoNetwork] = useState('USDT (TRC-20)');
  const [cryptoAddress, setCryptoAddress] = useState('TXk49B7mQe2nZ8bVwP3xY8aL7vN5c1d9e0');
  const [cryptoMemo, setCryptoMemo] = useState('');

  // Dynamic Wise fields
  const [wiseEmail, setWiseEmail] = useState('sarah@jenkins.design');
  const [wiseCurrency, setWiseCurrency] = useState('USD');

  // Payout preferences
  const [payoutSchedule, setPayoutSchedule] = useState<'instant' | 'weekly' | 'monthly'>('weekly');
  const [minimumThreshold, setMinimumThreshold] = useState('50');

  // ----------------------------------------------------
  // TAB 3: Privacy & Safety States
  // ----------------------------------------------------
  const [whoCanMessage, setWhoCanMessage] = useState<'everyone' | 'subscribers' | 'tipped' | 'disabled'>('subscribers');
  const [whoCanFollow, setWhoCanFollow] = useState<'everyone' | 'subscribers' | 'approval'>('everyone');
  const [profileDiscovery, setProfileDiscovery] = useState<'public' | 'unlisted' | 'stealth'>('public');
  const [enableAiSpamFilter, setEnableAiSpamFilter] = useState(true);
  const [enableDrmWatermark, setEnableDrmWatermark] = useState(true);
  const [hideSubscriberCounts, setHideSubscriberCounts] = useState(false);
  const [require2faForPayouts, setRequire2faForPayouts] = useState(true);

  // Blacklist tags
  const [blacklistKeywords, setBlacklistKeywords] = useState<string[]>(['spam', 't.me/', 'whatsapp scam', 'crypto free gift']);
  const [newKeywordInput, setNewKeywordInput] = useState('');

  // ----------------------------------------------------
  // Save Trigger with Multi-Stage Progress Animation
  // ----------------------------------------------------
  const triggerSaveAction = (tabTitle: string) => {
    setIsSaving(true);
    setSaveProgress(15);

    const timer1 = setTimeout(() => setSaveProgress(50), 200);
    const timer2 = setTimeout(() => setSaveProgress(85), 450);
    const timer3 = setTimeout(() => {
      setSaveProgress(100);
      setTimeout(() => {
        setIsSaving(false);
        setSaveProgress(0);
        showToast(`${tabTitle} saved and updated successfully!`, 'success');
      }, 300);
    }, 750);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  // Add new payout method helper
  const handleAddNewPayoutMethod = () => {
    let identifier = '';
    let label = '';

    if (selectedChannel === 'bank') {
      identifier = `${bankName || 'Bank'} (•••• ${accountNumber.slice(-4) || '0000'})`;
      label = `${accountHolder}'s Bank Wire`;
    } else if (selectedChannel === 'paypal') {
      identifier = paypalEmail;
      label = 'PayPal Direct Wallet';
    } else if (selectedChannel === 'stripe') {
      identifier = `Stripe Connect (${stripeEmail})`;
      label = 'Stripe Express Account';
    } else if (selectedChannel === 'crypto') {
      identifier = `${cryptoNetwork} (${cryptoAddress.slice(0, 6)}...${cryptoAddress.slice(-4)})`;
      label = 'Crypto Web3 Wallet';
    } else {
      identifier = `Wise (${wiseEmail})`;
      label = 'Wise Global Transfer';
    }

    const newAcc: SavedPayoutAccount = {
      id: `acc-${Date.now()}`,
      type: selectedChannel,
      label,
      accountIdentifier: identifier,
      isPrimary: savedAccounts.length === 0,
      currency: 'USD',
      status: 'Active'
    };

    setSavedAccounts([...savedAccounts, newAcc]);
    showToast(`Added ${label} to saved payout accounts!`, 'success');
  };

  const handleSetPrimaryAccount = (id: string) => {
    setSavedAccounts(prev =>
      prev.map(acc => ({
        ...acc,
        isPrimary: acc.id === id
      }))
    );
    showToast('Default payout method updated!', 'info');
  };

  const handleDeleteAccount = (id: string) => {
    if (savedAccounts.length <= 1) {
      showToast('You must have at least one payout account configured.', 'warning');
      return;
    }
    setSavedAccounts(prev => prev.filter(acc => acc.id !== id));
    showToast('Payout method removed.', 'info');
  };

  // Blacklist Tag Handlers
  const handleAddKeyword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newKeywordInput.trim().toLowerCase();
    if (!trimmed) return;
    if (blacklistKeywords.includes(trimmed)) {
      showToast('Keyword is already in filter list.', 'info');
      return;
    }
    setBlacklistKeywords([...blacklistKeywords, trimmed]);
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (keyword: string) => {
    setBlacklistKeywords(blacklistKeywords.filter(k => k !== keyword));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Top Save Progress Bar (Smooth Animated Multi-Stage) */}
      {isSaving && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-[#FCE7F3] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#DB2777] transition-all duration-300 ease-out shadow-sm shadow-[#EC4899]/50"
            style={{ width: `${saveProgress}%` }}
          />
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-sm shadow-pink-500/5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FCE7F3] to-[#FFF1F7] dark:from-[#381A2B] dark:to-[#24152F] border border-[#FBCFE8] dark:border-[#4C1D3B] text-[#EC4899] flex items-center justify-center shrink-0 shadow-xs">
            <Settings size={24} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#18181B] dark:text-[#FDF2F8] tracking-tight">
                Creator Studio Settings
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Studio
              </span>
            </div>
            <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5 font-medium">
              Configure your visual identity, dynamic payout channels, and audience privacy safety rules.
            </p>
          </div>
        </div>

        {/* Quick Profile Link */}
        <Link
          href={`/c/${handle}`}
          target="_blank"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#FFF1F7] dark:bg-[#381A2B] hover:bg-[#FCE7F3] dark:hover:bg-[#4C1D3B] border border-[#FBCFE8] dark:border-[#4C1D3B] text-xs font-bold text-[#BE185D] dark:text-[#F472B6] transition-all shrink-0 hover:scale-105 active:scale-95 shadow-2xs"
        >
          <span>View Public Profile</span>
          <ExternalLink size={13} />
        </Link>
      </div>

      {/* Segmented Responsive Tabs Bar */}
      <div className="p-1.5 rounded-2xl bg-white/80 dark:bg-[#150D1E]/80 border border-[#F3DCE8] dark:border-[#3A2A4C] backdrop-blur-md shadow-xs">
        <div className="flex overflow-x-auto gap-1.5 hide-scrollbar scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[
            {
              id: 'profile',
              label: 'Profile Details',
              subtitle: 'Identity & Banner',
              icon: User,
              badge: 'Live'
            },
            {
              id: 'payouts',
              label: 'Payout Accounts',
              subtitle: 'Multi-Channel Wallet',
              icon: Wallet,
              badge: `${savedAccounts.length} Active`
            },
            {
              id: 'privacy',
              label: 'Privacy & Safety',
              subtitle: 'Audience & DRM Rules',
              icon: ShieldCheck,
              badge: 'Protected'
            }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[170px] sm:min-w-0 flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 cursor-pointer text-left relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FCE7F3] to-[#FFF1F7] dark:from-[#381A2B] dark:to-[#24152F] text-[#BE185D] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] shadow-2xs'
                    : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-white hover:bg-[#FFF9FC] dark:hover:bg-[#22152E]'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#EC4899] text-white shadow-sm shadow-[#EC4899]/30 scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black truncate">{tab.label}</span>
                  </div>
                  <p className="text-[10px] text-[#A1A1AA] dark:text-[#8E7890] truncate font-medium">
                    {tab.subtitle}
                  </p>
                </div>
                {tab.badge && (
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 border ${
                    isActive
                      ? 'bg-white/80 dark:bg-[#1A1222] text-[#EC4899] border-[#FBCFE8] dark:border-[#4C1D3B]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-transparent'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROFILE DETAILS & VISUAL IDENTITY */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Live Fan View Preview Card */}
          <Card className="p-5 sm:p-6 overflow-hidden relative border border-[#F3DCE8] dark:border-[#3A2A4C]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F3DCE8]/80 dark:border-[#3A2A4C]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#EC4899] animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-[#FDF2F8]">
                  Live Creator Profile Preview
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#A1A1AA] bg-[#FFF1F7] dark:bg-[#381A2B] px-2.5 py-1 rounded-full text-[#BE185D] dark:text-[#F472B6]">
                How fans view your studio in real-time
              </span>
            </div>

            {/* Mock Profile Card */}
            <div className="rounded-2xl border border-[#F3DCE8] dark:border-[#3A2A4C] bg-white dark:bg-[#1A1222] overflow-hidden shadow-sm">
              {/* Cover Banner Mock */}
              <div className="h-28 sm:h-36 w-full relative bg-gradient-to-r from-pink-400 via-rose-400 to-purple-500 overflow-hidden">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Cover Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1.5">
                  <ImageIcon size={11} />
                  <span>Public Banner</span>
                </div>
              </div>

              {/* Profile Avatar & Info row */}
              <div className="p-4 sm:p-5 pt-0 relative">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-3">
                  <div className="relative inline-block w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-white dark:ring-[#1A1222] shadow-xl overflow-hidden bg-white shrink-0">
                    <img
                      src={avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 p-1 bg-emerald-500 text-white rounded-full ring-2 ring-white dark:ring-[#1A1222]">
                      <Check size={10} strokeWidth={4} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] text-xs font-black flex items-center gap-1.5 border border-[#FBCFE8] dark:border-[#4C1D3B]">
                      <Flame size={13} />
                      <span>{category}</span>
                    </span>
                    <div className="text-[11px] font-bold text-[#71717A] dark:text-[#D4B8D0] bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] px-3 py-1 rounded-xl">
                      14.3k Followers • 840 VIPs
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base sm:text-lg font-black text-[#18181B] dark:text-[#FDF2F8]">
                      {displayName || 'Your Name'}
                    </h4>
                    <span className="text-xs font-bold text-[#A1A1AA]">
                      @{handle || 'handle'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#EC4899] dark:text-[#F472B6]">
                    {headline || 'Creator headline will appear here.'}
                  </p>
                  <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] pt-1 leading-relaxed">
                    {bio || 'Write a compelling bio to inform fans and potential subscribers about your content drops, weekly schedules, and exclusive member perks.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Visual Identity Uploaders Card */}
          <Card className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F3DCE8]/80 dark:border-[#3A2A4C]">
              <ImageIcon size={16} className="text-[#EC4899]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-[#FDF2F8]">
                Visual Media & Brand Assets
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-2xl bg-[#FFF9FC]/60 dark:bg-[#1A1222]/60 border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-3">
                <MediaUploader
                  label="Profile Avatar Picture"
                  description="Square avatar shown across feeds, messages, and comments (400x400px recommended)."
                  folder="avatars"
                  accept="images"
                  aspectRatio="square"
                  value={avatarUrl}
                  onChange={(url) => setAvatarUrl(url)}
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF9FC]/60 dark:bg-[#1A1222]/60 border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-3">
                <MediaUploader
                  label="Studio Cover Banner"
                  description="Wide header banner for your public creator landing page (1200x400px recommended)."
                  folder="covers"
                  accept="images"
                  aspectRatio="banner"
                  value={coverUrl}
                  onChange={(url) => setCoverUrl(url)}
                />
              </div>
            </div>
          </Card>

          {/* Creator Profile Form Fields Card */}
          <Card className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F3DCE8]/80 dark:border-[#3A2A4C]">
              <User size={16} className="text-[#EC4899]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-[#FDF2F8]">
                Creator Details & Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5">
                  Display Stage Name <span className="text-[#EC4899]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3.5 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899] focus:ring-2 focus:ring-[#EC4899]/20 font-bold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5">
                  Creator Handle URL <span className="text-[#EC4899]">*</span>
                </label>
                <div className="flex items-center bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#71717A] focus-within:border-[#EC4899] focus-within:ring-2 focus-within:ring-[#EC4899]/20 transition-all font-mono">
                  <span className="text-[#EC4899] font-bold mr-1">/c/</span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="username"
                    className="w-full bg-transparent text-[#18181B] dark:text-[#FDF2F8] font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                  Creator Headline / Catchphrase
                </label>
                <span className="text-[10px] text-[#A1A1AA] font-mono">
                  {headline.length}/100
                </span>
              </div>
              <input
                type="text"
                maxLength={100}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Product Designer & Educator. Teaching UI/UX design systems."
                className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3.5 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899] focus:ring-2 focus:ring-[#EC4899]/20 font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5">
                Creator Primary Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3.5 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899] focus:ring-2 focus:ring-[#EC4899]/20 font-bold transition-all appearance-none cursor-pointer"
                >
                  <option value="Art & Design">🎨 Art & Design</option>
                  <option value="Education & Tech">💻 Education & Tech</option>
                  <option value="Music & Audio">🎵 Music & Audio</option>
                  <option value="Gaming & Esports">🎮 Gaming & Esports</option>
                  <option value="Fitness & Health">⚡ Fitness & Health</option>
                  <option value="Lifestyle & Vlogs">✨ Lifestyle & Vlogs</option>
                  <option value="Photography & Cinema">📸 Photography & Cinema</option>
                  <option value="Business & Finance">📈 Business & Finance</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                  Biography & Creator Story
                </label>
                <span className="text-[10px] text-[#A1A1AA] font-mono">
                  {bio.length}/500
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell fans about yourself, your creative background, upload schedule, and what perks subscribers unlock..."
                className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl p-3.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899] focus:ring-2 focus:ring-[#EC4899]/20 resize-none font-medium transition-all"
              />
            </div>

            {/* Social Links Section */}
            <div className="pt-3 border-t border-[#F3DCE8]/80 dark:border-[#3A2A4C] space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-[#FDF2F8] flex items-center gap-1.5">
                  <Globe size={14} className="text-[#EC4899]" />
                  <span>Connected Social Channels</span>
                </p>
                <span className="text-[10px] text-[#A1A1AA]">Optional social badges</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#71717A] dark:text-[#D4B8D0] mb-1">YouTube Channel</label>
                  <input
                    type="url"
                    value={socialYoutube}
                    onChange={(e) => setSocialYoutube(e.target.value)}
                    placeholder="https://youtube.com/@..."
                    className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#71717A] dark:text-[#D4B8D0] mb-1">X (Twitter) Profile</label>
                  <input
                    type="url"
                    value={socialX}
                    onChange={(e) => setSocialX(e.target.value)}
                    placeholder="https://x.com/..."
                    className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#71717A] dark:text-[#D4B8D0] mb-1">Instagram Handle</label>
                  <input
                    type="url"
                    value={socialInstagram}
                    onChange={(e) => setSocialInstagram(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#71717A] dark:text-[#D4B8D0] mb-1">Personal Portfolio / Website</label>
                  <input
                    type="url"
                    value={socialWebsite}
                    onChange={(e) => setSocialWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-[#F3DCE8]/80 dark:border-[#3A2A4C] flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-[#A1A1AA]">
                All profile updates are immediately synchronized with your public studio.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => triggerSaveAction('Profile Details')}
                isLoading={isSaving}
                leftIcon={<Save size={15} />}
                className="w-full sm:w-auto"
              >
                Save Profile Details
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PAYOUT ACCOUNTS & WITHDRAWAL SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'payouts' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Quick Balance & Payout Overview Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 bg-gradient-to-br from-[#FFF1F7] via-white to-white dark:from-[#24152F] dark:to-[#150D1E] border border-[#FBCFE8] dark:border-[#4C1D3B] relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#BE185D] dark:text-[#F472B6]">
                  Available Balance
                </span>
                <div className="p-2 rounded-xl bg-[#FCE7F3] dark:bg-[#381A2B] text-[#EC4899]">
                  <DollarSign size={16} />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#18181B] dark:text-[#FDF2F8] mt-2 tracking-tight">
                $4,850.00
              </h3>
              <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Ready for next payout cycle
              </p>
            </Card>

            <Card className="p-5 bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] dark:text-[#D4B8D0]">
                  Total Paid Out
                </span>
                <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  <Banknote size={16} />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#18181B] dark:text-[#FDF2F8] mt-2 tracking-tight">
                $12,400.00
              </h3>
              <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] mt-1 font-medium">
                Lifetime Creator Revenue
              </p>
            </Card>

            <Card className="p-5 bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] dark:text-[#D4B8D0]">
                  Next Settlement
                </span>
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                  <Zap size={16} />
                </div>
              </div>
              <h3 className="text-lg font-black text-[#18181B] dark:text-[#FDF2F8] mt-2">
                Monday, 09:00 AM
              </h3>
              <p className="text-[11px] text-[#EC4899] font-bold mt-1">
                Auto-payout to Primary Account
              </p>
            </Card>
          </div>

          {/* Saved Payout Accounts List Card */}
          <Card className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F3DCE8]/80 dark:border-[#3A2A4C]">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-[#EC4899]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-[#FDF2F8]">
                  Saved Payout Destination Accounts
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#71717A] dark:text-[#D4B8D0]">
                {savedAccounts.length} Connected Method{savedAccounts.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-3">
              {savedAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    acc.isPrimary
                      ? 'border-[#EC4899] bg-[#FFF1F7]/70 dark:bg-[#381A2B]/40 shadow-xs'
                      : 'border-[#F3DCE8] dark:border-[#3A2A4C] bg-[#FFF9FC]/50 dark:bg-[#22152E]/30 hover:border-[#FBCFE8]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                      acc.type === 'bank'
                        ? 'bg-blue-600 text-white'
                        : acc.type === 'paypal'
                        ? 'bg-indigo-600 text-white'
                        : acc.type === 'stripe'
                        ? 'bg-purple-600 text-white'
                        : acc.type === 'crypto'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-teal-600 text-white'
                    }`}>
                      {acc.type === 'bank' ? <Building size={18} /> : acc.type === 'crypto' ? <Zap size={18} /> : acc.type.toUpperCase().slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8]">
                          {acc.label}
                        </h4>
                        {acc.isPrimary && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#EC4899] text-white shadow-2xs">
                            Primary Method
                          </span>
                        )}
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.2 rounded-md border border-emerald-200 dark:border-emerald-800">
                          {acc.status}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-[#71717A] dark:text-[#D4B8D0] truncate mt-0.5">
                        {acc.accountIdentifier}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {!acc.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryAccount(acc.id)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#EC4899] text-[11px] font-bold text-[#EC4899] hover:bg-[#FFF1F7] transition-colors cursor-pointer"
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteAccount(acc.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove Account"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Dynamic Payout Channel Configurator */}
          <Card className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F3DCE8]/80 dark:border-[#3A2A4C]">
              <CreditCard size={16} className="text-[#EC4899]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-[#FDF2F8]">
                Add or Configure Payout Channel
              </h3>
            </div>

            {/* Payout Channel Selector Cards */}
            <div>
              <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-2">
                Select Payout Channel Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    id: 'bank',
                    title: 'Direct Bank Wire / ACH',
                    desc: '2-3 business days • Direct ACH',
                    icon: Building,
                    badge: 'Popular'
                  },
                  {
                    id: 'paypal',
                    title: 'PayPal Direct',
                    desc: 'Instant wallet transfer',
                    icon: DollarSign,
                    badge: 'Instant'
                  },
                  {
                    id: 'stripe',
                    title: 'Stripe Express Connect',
                    desc: 'Daily automated bank transfer',
                    icon: CreditCard,
                    badge: 'Automated'
                  },
                  {
                    id: 'crypto',
                    title: 'Crypto / USDT & Web3',
                    desc: 'TRC-20, ERC-20, Polygon',
                    icon: Zap,
                    badge: 'Zero Border Fee'
                  },
                  {
                    id: 'wise',
                    title: 'Wise Global Multi-Currency',
                    desc: 'Lowest foreign FX rates',
                    icon: Globe,
                    badge: 'Global'
                  }
                ].map((channel) => {
                  const Icon = channel.icon;
                  const isSelected = selectedChannel === channel.id;

                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => setSelectedChannel(channel.id as PayoutChannelType)}
                      className={`p-3.5 rounded-2xl border text-left font-bold transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-[#EC4899] bg-[#FFF1F7] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] shadow-2xs ring-2 ring-[#EC4899]/20'
                          : 'border-[#F3DCE8] dark:border-[#3A2A4C] text-[#71717A] dark:text-[#D4B8D0] hover:border-[#EC4899]/50 bg-[#FFF9FC]/60 dark:bg-[#22152E]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className={`p-2 rounded-xl ${
                          isSelected ? 'bg-[#EC4899] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                        }`}>
                          <Icon size={16} />
                        </div>
                        {channel.badge && (
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-white text-[#EC4899] border border-[#FBCFE8]'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                          }`}>
                            {channel.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-black truncate">{channel.title}</p>
                      <p className="text-[10px] font-medium text-[#A1A1AA] mt-0.5 truncate">{channel.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Fields tailored to chosen Channel */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E]/60 border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-4">
              
              {/* 1. BANK FIELDS */}
              {selectedChannel === 'bank' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#F3DCE8]/80 dark:border-[#3A2A4C]">
                    <Building size={16} className="text-[#EC4899]" />
                    <span className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8]">Bank Wire & ACH Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. JPMorgan Chase Bank"
                        className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1">Account Holder Full Name</label>
                      <input
                        type="text"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="Name as printed on bank statement"
                        className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1">Routing Transit Number (ABA / ACH)</label>
                      <input
                        type="text"
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                        placeholder="9-digit routing number"
                        className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs font-mono text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1">Account Number / IBAN</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Checking or savings account number"
                        className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs font-mono text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1">Account Type</label>
                      <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
                        className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      >
                        <option value="checking">Checking Account</option>
                        <option value="savings">Savings Account</option>
                        <option value="business">Corporate / Business Account</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1">SWIFT / BIC Code (Optional for International Wire)</label>
                      <input
                        type="text"
                        value={swiftBic}
                        onChange={(e) => setSwiftBic(e.target.value)}
                        placeholder="e.g. CHASUS33"
                        className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs font-mono text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. PAYPAL FIELDS */}
              {selectedChannel === 'paypal' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#F3DCE8]/80 dark:border-[#3A2A4C]">
                    <DollarSign size={16} className="text-[#EC4899]" />
                    <span className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8]">PayPal Account Credentials</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1">PayPal Email Address</label>
                      <input
                        type="email"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="your-paypal-email@domain.com"
                        className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1">Preferred Currency</label>
                      <select
                        value={paypalCurrency}
                        onChange={(e) => setPaypalCurrency(e.target.value)}
                        className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      >
                        <option value="USD">USD - US Dollar ($)</option>
                        <option value="EUR">EUR - Euro (€)</option>
                        <option value="GBP">GBP - British Pound (£)</option>
                        <option value="CAD">CAD - Canadian Dollar (C$)</option>
                        <option value="AUD">AUD - Australian Dollar (A$)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. STRIPE FIELDS */}
              {selectedChannel === 'stripe' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#F3DCE8]/80 dark:border-[#3A2A4C]">
                    <CreditCard size={16} className="text-[#EC4899]" />
                    <span className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8]">Stripe Express Account Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1">Stripe Account Email</label>
                      <input
                        type="email"
                        value={stripeEmail}
                        onChange={(e) => setStripeEmail(e.target.value)}
                        placeholder="stripe-account@domain.com"
                        className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1">Country of Tax Residence</label>
                      <input
                        type="text"
                        value={stripeCountry}
                        onChange={(e) => setStripeCountry(e.target.value)}
                        placeholder="United States"
                        className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. CRYPTO FIELDS */}
              {selectedChannel === 'crypto' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#F3DCE8]/80 dark:border-[#3A2A4C]">
                    <Zap size={16} className="text-[#EC4899]" />
                    <span className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8]">Web3 Crypto Wallet Destination</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1">Blockchain Network</label>
                      <select
                        value={cryptoNetwork}
                        onChange={(e) => setCryptoNetwork(e.target.value)}
                        className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      >
                        <option value="USDT (TRC-20)">USDT (Tron TRC-20) - Low Fee</option>
                        <option value="USDT (ERC-20)">USDT (Ethereum ERC-20)</option>
                        <option value="USDC (Polygon)">USDC (Polygon PoS)</option>
                        <option value="USDC (Solana)">USDC (Solana SPL)</option>
                        <option value="Bitcoin (BTC)">Bitcoin (BTC Native)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1">Destination Memo / Tag (Optional)</label>
                      <input
                        type="text"
                        value={cryptoMemo}
                        onChange={(e) => setCryptoMemo(e.target.value)}
                        placeholder="Memo or destination tag if required"
                        className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs font-mono text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1">Public Receiving Wallet Address</label>
                    <input
                      type="text"
                      value={cryptoAddress}
                      onChange={(e) => setCryptoAddress(e.target.value)}
                      placeholder="e.g. 0x... or TXk..."
                      className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs font-mono text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                    />
                  </div>
                </div>
              )}

              {/* 5. WISE FIELDS */}
              {selectedChannel === 'wise' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#F3DCE8]/80 dark:border-[#3A2A4C]">
                    <Globe size={16} className="text-[#EC4899]" />
                    <span className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8]">Wise Global Recipient Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1">Wise Email or Member ID</label>
                      <input
                        type="email"
                        value={wiseEmail}
                        onChange={(e) => setWiseEmail(e.target.value)}
                        placeholder="your-wise-email@domain.com"
                        className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1">Settlement Currency</label>
                      <select
                        value={wiseCurrency}
                        onChange={(e) => setWiseCurrency(e.target.value)}
                        className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD (C$)</option>
                        <option value="AUD">AUD (A$)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Account Action */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddNewPayoutMethod}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#EC4899] text-xs font-bold text-[#BE185D] dark:text-[#F472B6] hover:bg-[#FFF1F7] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus size={14} />
                  <span>Save Method to Accounts List</span>
                </button>
              </div>
            </div>

            {/* Payout Schedule & Threshold Preferences */}
            <div className="pt-3 border-t border-[#F3DCE8]/80 dark:border-[#3A2A4C] space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-[#FDF2F8]">
                Settlement Rules & Automation
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#71717A] dark:text-[#D4B8D0] mb-1.5">
                    Automated Settlement Schedule
                  </label>
                  <select
                    value={payoutSchedule}
                    onChange={(e) => setPayoutSchedule(e.target.value as any)}
                    className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3.5 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                  >
                    <option value="weekly">Weekly on Mondays (Recommended)</option>
                    <option value="monthly">Monthly on the 1st</option>
                    <option value="instant">Instant on Earning Milestones</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#71717A] dark:text-[#D4B8D0] mb-1.5">
                    Minimum Auto-Withdrawal Threshold ($)
                  </label>
                  <select
                    value={minimumThreshold}
                    onChange={(e) => setMinimumThreshold(e.target.value)}
                    className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3.5 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                  >
                    <option value="50">$50.00 Minimum</option>
                    <option value="100">$100.00 Minimum</option>
                    <option value="250">$250.00 Minimum</option>
                    <option value="500">$500.00 Minimum</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security Assurance Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-900 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>256-Bit Bank-Grade Encryption:</strong> All payout credentials and destination identifiers are stored in a secure PCI-DSS level 1 compliant cryptographic vault.
              </span>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-[#F3DCE8]/80 dark:border-[#3A2A4C] flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-[#A1A1AA]">
                Ensure your bank/wallet information matches your verified legal ID.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => triggerSaveAction('Payout Settings')}
                isLoading={isSaving}
                leftIcon={<Save size={15} />}
                className="w-full sm:w-auto"
              >
                Save Payout Settings
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PRIVACY & SAFETY RULES */}
      {/* ========================================================================= */}
      {activeTab === 'privacy' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <Card className="p-5 sm:p-6 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F3DCE8]/80 dark:border-[#3A2A4C]">
              <Lock size={16} className="text-[#EC4899]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-[#FDF2F8]">
                Audience & Interaction Rules
              </h3>
            </div>

            {/* Direct Messaging Permissions - Visual Selection Cards */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                Who can send you direct private messages?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'subscribers',
                    title: 'Subscribers & VIP Patrons Only',
                    desc: 'Protects your inbox from spam while offering exclusive access to paying members.',
                    badge: 'Recommended'
                  },
                  {
                    id: 'everyone',
                    title: 'Everyone (Public Fan Inquiries)',
                    desc: 'Any registered user can send you questions or collaboration inquiries.',
                    badge: 'Public'
                  },
                  {
                    id: 'tipped',
                    title: 'Tipped Fans Only ($5+ min)',
                    desc: 'Requires fans to attach a small tip with their initial contact message.',
                    badge: 'Monetized'
                  },
                  {
                    id: 'disabled',
                    title: 'Direct Messages Disabled',
                    desc: 'Nobody can send you DMs. Direct message tab will be hidden from profile.',
                    badge: 'Restricted'
                  }
                ].map((option) => {
                  const isSelected = whoCanMessage === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setWhoCanMessage(option.id as any)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-[#EC4899] bg-[#FFF1F7] dark:bg-[#381A2B] text-[#18181B] dark:text-[#FDF2F8] shadow-xs ring-2 ring-[#EC4899]/20'
                          : 'border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#EC4899]/50 bg-[#FFF9FC]/50 dark:bg-[#22152E]/30 text-[#71717A] dark:text-[#D4B8D0]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#EC4899] bg-[#EC4899]' : 'border-gray-400'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <p className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8]">{option.title}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-[#EC4899] text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                        }`}>
                          {option.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-[#71717A] dark:text-[#D4B8D0] ml-6 leading-relaxed">
                        {option.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile Visibility & Feed Rules */}
            <div className="space-y-2.5 pt-2 border-t border-[#F3DCE8]/80 dark:border-[#3A2A4C]">
              <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                Public Studio Visibility & Discovery
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'public',
                    title: 'Public & Searchable',
                    desc: 'Listed in Explore, category feeds, and creator rankings.',
                    badge: 'Recommended'
                  },
                  {
                    id: 'unlisted',
                    title: 'Link-Only (Unlisted)',
                    desc: 'Visible only to users with your direct /c/handle link.',
                    badge: 'Private Link'
                  },
                  {
                    id: 'stealth',
                    title: 'Stealth Mode',
                    desc: 'Require manual follow approval before viewing feed posts.',
                    badge: 'Exclusive'
                  }
                ].map((item) => {
                  const isSelected = profileDiscovery === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProfileDiscovery(item.id as any)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#EC4899] bg-[#FFF1F7] dark:bg-[#381A2B] shadow-xs ring-2 ring-[#EC4899]/20'
                          : 'border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#EC4899]/50 bg-[#FFF9FC]/50 dark:bg-[#22152E]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8]">{item.title}</p>
                        <span className="text-[9px] font-bold text-[#BE185D] dark:text-[#F472B6]">{item.badge}</span>
                      </div>
                      <p className="text-[10px] text-[#71717A] dark:text-[#D4B8D0] leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Smart Safety Toggles */}
            <div className="space-y-3 pt-2 border-t border-[#F3DCE8]/80 dark:border-[#3A2A4C]">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-[#FDF2F8]">
                Content Protection & AI Shield Toggles
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E]/40 border border-[#F3DCE8] dark:border-[#3A2A4C] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                      <ShieldAlert size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">AI Toxicity & Spam Comment Shield</p>
                      <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">Automatically blocks spam links, hateful remarks, and promo bots.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableAiSpamFilter}
                    onChange={(e) => setEnableAiSpamFilter(e.target.checked)}
                    className="w-4 h-4 accent-[#EC4899] cursor-pointer rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E]/40 border border-[#F3DCE8] dark:border-[#3A2A4C] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-[#EC4899]">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">Digital DRM Media Watermark</p>
                      <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">Embeds translucent anti-piracy watermark on exclusive photos and videos.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableDrmWatermark}
                    onChange={(e) => setEnableDrmWatermark(e.target.checked)}
                    className="w-4 h-4 accent-[#EC4899] cursor-pointer rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E]/40 border border-[#F3DCE8] dark:border-[#3A2A4C] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                      <EyeOff size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">Hide Subscriber Count on Public Card</p>
                      <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">Keeps total subscriber and patronage count private to studio administrators.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hideSubscriberCounts}
                    onChange={(e) => setHideSubscriberCounts(e.target.checked)}
                    className="w-4 h-4 accent-[#EC4899] cursor-pointer rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E]/40 border border-[#F3DCE8] dark:border-[#3A2A4C] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                      <Key size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">Require 2FA for Withdrawal Account Changes</p>
                      <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">Requires authenticator app code verification before editing destination wallets.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={require2faForPayouts}
                    onChange={(e) => setRequire2faForPayouts(e.target.checked)}
                    className="w-4 h-4 accent-[#EC4899] cursor-pointer rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Blacklist Keywords Filter Tag Manager */}
            <div className="space-y-3 pt-2 border-t border-[#F3DCE8]/80 dark:border-[#3A2A4C]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-[#FDF2F8] flex items-center gap-1.5">
                    <Filter size={14} className="text-[#EC4899]" />
                    <span>Custom Blacklist Keyword Filter</span>
                  </h4>
                  <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
                    Comments or messages containing these words will be automatically held for review.
                  </p>
                </div>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E]/40 border border-[#F3DCE8] dark:border-[#3A2A4C] min-h-[50px] items-center">
                {blacklistKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] text-xs font-bold border border-[#FBCFE8] dark:border-[#4C1D3B] animate-in fade-in zoom-in-95"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}

                {blacklistKeywords.length === 0 && (
                  <span className="text-[11px] text-[#A1A1AA] italic">No custom filter keywords added yet.</span>
                )}
              </div>

              {/* Add Keyword Input */}
              <form onSubmit={handleAddKeyword} className="flex gap-2">
                <input
                  type="text"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  placeholder="Type word or phrase to block (e.g. 'free gift')..."
                  className="flex-1 bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3.5 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#EC4899] text-white text-xs font-bold hover:bg-[#DB2777] transition-all cursor-pointer shrink-0 shadow-2xs flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Add Filter</span>
                </button>
              </form>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-[#F3DCE8]/80 dark:border-[#3A2A4C] flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-[#A1A1AA]">
                Privacy and safety rules take effect instantly across all audience interactions.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => triggerSaveAction('Privacy & Safety Settings')}
                isLoading={isSaving}
                leftIcon={<Save size={15} />}
                className="w-full sm:w-auto"
              >
                Save Privacy Settings
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

