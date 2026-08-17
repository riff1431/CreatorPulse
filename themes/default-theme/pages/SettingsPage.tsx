'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, Shield, Key, Bell, CreditCard, Crown, Lock, Globe, Moon, 
  Sun, Sparkles, CheckCircle2, ChevronRight, DollarSign, Radio, 
  Eye, EyeOff, Save, Trash2, Plus, ExternalLink, Copy, Check, 
  Smartphone, Monitor, AlertCircle, RefreshCw, Layers, Sliders,
  HelpCircle, LogOut, ArrowRight, Video, Flame, MessageSquare, Share2
} from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Select } from '../components/Select';
import { Switch } from '../components/Switch';
import { ProfileCompletionWidget } from '../components/ProfileCompletionWidget';
import { useAuth } from '@/lib/auth/auth-context';
import { NotificationPreferencesPanel } from '@/components/notifications/NotificationPreferencesPanel';
import { ContentPreferencesPanel } from '@/components/preferences/ContentPreferencesPanel';
import { MOCK_USERS, MOCK_CREATOR_DETAILS } from '@/lib/supabase/store';

export function SettingsPage() {
  const { user, role, switchRole, isAuthenticated, logout } = useAuth();
  
  // Active role detection and interactive view switcher
  const [viewMode, setViewMode] = useState<'member' | 'creator'>(role === 'creator' ? 'creator' : 'member');
  const isCreator = viewMode === 'creator';
  const isMember = viewMode === 'member';

  // Active tab state based on role
  const [activeTab, setActiveTab] = useState<string>(isCreator ? 'creator_profile' : 'fan_profile');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync initial tab when viewMode changes
  const handleSwitchView = (mode: 'member' | 'creator') => {
    setViewMode(mode);
    switchRole(mode);
    setActiveTab(mode === 'creator' ? 'creator_profile' : 'fan_profile');
  };

  // Current user details
  const currentUser = user || (isCreator 
    ? MOCK_USERS['user-creator-1'] 
    : MOCK_USERS['user-member']);

  // Fan User Form States
  const [fanFullName, setFanFullName] = useState(currentUser?.fullName || 'Alex Vance');
  const [fanUsername, setFanUsername] = useState(currentUser?.username || 'alexvance');
  const [fanEmail, setFanEmail] = useState(currentUser?.email || 'alex.vance@example.com');
  const [fanBio, setFanBio] = useState('Passionate 3D design enthusiast, digital creator supporter, and avid masterclass learner.');
  const [fanAvatar, setFanAvatar] = useState(currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');
  const [fanStealthMode, setFanStealthMode] = useState(false);
  const [fanCurrency, setFanCurrency] = useState('USD');
  const [fanLanguage, setFanLanguage] = useState('en');

  // Creator User Form States
  const [creatorStageName, setCreatorStageName] = useState(currentUser?.fullName || 'Sarah Jenkins');
  const [creatorHandle, setCreatorHandle] = useState(currentUser?.username || 'sarahdesign');
  const [creatorCategory, setCreatorCategory] = useState('Design & Creative');
  const [creatorBio, setCreatorBio] = useState('Senior UI/UX Designer & 3D Artist. Sharing weekly masterclasses, design project files, and exclusive drops.');
  const [creatorAvatar, setCreatorAvatar] = useState(currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');
  const [creatorBanner, setCreatorBanner] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200');
  const [creatorYoutube, setCreatorYoutube] = useState('https://youtube.com/@sarahdesign');
  const [creatorX, setCreatorX] = useState('https://x.com/sarahdesign');
  const [creatorInstagram, setCreatorInstagram] = useState('https://instagram.com/sarahdesign');
  const [creatorTwitch, setCreatorTwitch] = useState('https://twitch.tv/sarahdesign');

  // Creator Monetization States
  const [tier1Price, setTier1Price] = useState('4.99');
  const [tier2Price, setTier2Price] = useState('14.99');
  const [tier3Price, setTier3Price] = useState('29.99');
  const [minTipAmount, setMinTipAmount] = useState('2.00');
  const [enableTipSounds, setEnableTipSounds] = useState(true);
  const [autoWelcomeMsg, setAutoWelcomeMsg] = useState('Hey there! Welcome to my VIP family. Check out the pinned post for your exclusive project source files! ✨');

  // Creator Broadcast / Studio States
  const [streamResolution, setStreamResolution] = useState('1080p60');
  const [watermarkProtection, setWatermarkProtection] = useState(true);
  const [lowLatency, setLowLatency] = useState(true);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [streamKeyCopied, setStreamKeyCopied] = useState(false);
  const streamKey = 'live_sk_9481a8c7e2b109439201948fc72';

  // Subscriptions & Payment state for Fans
  const [subscriptions, setSubscriptions] = useState([
    { id: 'sub-1', creator: 'Sarah Jenkins', username: 'sarahdesign', tier: 'VIP Insider ($14.99/mo)', nextBilling: 'Sept 15, 2026', autoRenew: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { id: 'sub-2', creator: 'Marcus Vance', username: 'marcuscode', tier: 'Code Master ($9.99/mo)', nextBilling: 'Sept 22, 2026', autoRenew: true, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
  ]);

  // Notifications toggles
  const [notifDrops, setNotifDrops] = useState(true);
  const [notifLives, setNotifLives] = useState(true);
  const [notifDMs, setNotifDMs] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);

  // Security
  const [enable2FA, setEnable2FA] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Save handler with simulated feedback toast
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 450);
  };

  const copyStreamKey = () => {
    navigator.clipboard.writeText(streamKey);
    setStreamKeyCopied(true);
    setTimeout(() => setStreamKeyCopied(false), 2000);
  };

  // Define tab navigation based on role
  const fanTabs = [
    { id: 'fan_profile', label: 'Profile & Identity', icon: User },
    { id: 'fan_content_prefs', label: 'Content & Personalization', icon: Sliders, badge: 'Active' },
    { id: 'fan_memberships', label: 'My VIP Subscriptions', icon: Crown, badge: '2 Active' },
    { id: 'fan_payments', label: 'Payment Methods & Wallet', icon: CreditCard },
    { id: 'fan_notifications', label: 'Notifications & Alerts', icon: Bell },
    { id: 'fan_security', label: 'Account & Security', icon: Shield },
    { id: 'fan_preferences', label: 'Display & Preferences', icon: Globe },
  ];

  const creatorTabs = [
    { id: 'creator_profile', label: 'Creator Profile & Bio', icon: User },
    { id: 'creator_monetization', label: 'VIP Tiers & Monetization', icon: Sparkles, badge: '3 Tiers' },
    { id: 'creator_payouts', label: 'Payouts & Banking', icon: DollarSign, badge: 'Stripe Active' },
    { id: 'creator_studio', label: 'Broadcast & Studio', icon: Radio },
    { id: 'creator_notifications', label: 'Fan Alert Settings', icon: Bell },
    { id: 'creator_security', label: 'Security & Team Access', icon: Shield },
  ];

  const activeTabsList = isCreator ? creatorTabs : fanTabs;

  return (
    <MainLayout showSidebar={true} showFooter={false}>
      <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
        
        {/* Header Title & Role Switcher Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-sm shadow-pink-500/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar
                alt={isCreator ? creatorStageName : fanFullName}
                src={isCreator ? creatorAvatar : fanAvatar}
                size="lg"
                isVerified={isCreator || currentUser.isVerified}
              />
              <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white shadow-2xs ${
                isCreator 
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#F43F5E]' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600'
              }`}>
                {viewMode}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-[#18181B] dark:text-[#FDF2F8] tracking-tight">
                  {isCreator ? creatorStageName : fanFullName}
                </h1>
                <span className="text-xs text-[#71717A] dark:text-[#D4B8D0] font-bold">
                  @{isCreator ? creatorHandle : fanUsername}
                </span>
              </div>
              <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
                {isCreator 
                  ? 'Manage your creator profile, VIP tiers, livestream keys, and payout details.' 
                  : 'Manage your personal account, VIP subscriptions, saved cards, and notifications.'}
              </p>
            </div>
          </div>

          {/* Quick Role Tester Selector */}
          <div className="flex items-center gap-2 bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] p-1.5 rounded-2xl shrink-0">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#A1A1AA] px-2">
              Viewing as:
            </span>
            <button
              onClick={() => handleSwitchView('member')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                viewMode === 'member'
                  ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] shadow-2xs'
                  : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B]'
              }`}
            >
              Fan View
            </button>
            <button
              onClick={() => handleSwitchView('creator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                viewMode === 'creator'
                  ? 'bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] shadow-2xs'
                  : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B]'
              }`}
            >
              Creator View
            </button>
          </div>
        </div>

        {/* Success Feedback Alert Toast */}
        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs font-bold shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Settings updated successfully! Changes have been synchronized to your account.</span>
            </div>
            <button onClick={() => setSavedSuccess(false)} className="text-emerald-700 hover:text-emerald-900">
              Dismiss
            </button>
          </div>
        )}

        {/* Main Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Settings Tabs Navigation */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-2 sm:p-3 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-sm shadow-pink-500/5 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#A1A1AA] dark:text-[#8E7890] px-3 py-2 mb-1 hidden lg:block">
                {isCreator ? 'Creator Controls' : 'Account Navigation'}
              </p>

              <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 pb-2 lg:pb-0 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {activeTabsList.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 lg:w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer text-left group ${
                        isActive
                          ? 'bg-[#FCE7F3] text-[#BE185D] dark:bg-[#381A2B] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] shadow-2xs scale-100'
                          : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E] border border-transparent scale-95 hover:scale-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon size={16} className={`transition-transform duration-300 ${isActive ? 'text-[#EC4899] dark:text-[#F472B6] scale-110' : 'text-[#A1A1AA] group-hover:scale-110'}`} />
                        <span className="truncate whitespace-nowrap">{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span className="hidden lg:block text-[9px] font-black px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-[#BE185D] dark:text-[#F472B6] border border-pink-200 dark:border-pink-900 shrink-0">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role-Specific CTA Card in Left Column */}
            {isMember ? (
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FFF1F7] to-[#FCE7F3] dark:from-[#24152F] dark:to-[#1C1026] border border-[#FBCFE8] dark:border-[#4C1D3B] space-y-3 shadow-xs hover:shadow-md transition-shadow duration-300 group hidden lg:block">
                <div className="flex items-center gap-2 text-[#BE185D] dark:text-[#F472B6]">
                  <Sparkles size={16} className="group-hover:animate-pulse" />
                  <h4 className="text-xs font-black">Want to Sell Memberships?</h4>
                </div>
                <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] leading-relaxed">
                  Switch to a creator profile to start earning recurring fan revenue, video drop tips, and live gifts.
                </p>
                <button
                  onClick={() => { switchRole('creator'); setActiveTab('creator_profile'); }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F43F5E] text-white text-xs font-black shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  Enable Creator Account
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 space-y-3 hidden lg:block transition-all hover:border-[#FBCFE8] dark:hover:border-[#4C1D3B]">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#71717A] dark:text-[#D4B8D0]">Public Creator Link:</span>
                  <Link href={`/c/${creatorHandle}`} className="text-[#EC4899] flex items-center gap-1 hover:underline group">
                    <span>View Profile</span>
                    <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
                <div className="p-2.5 bg-[#FFF9FC] dark:bg-[#22152E] rounded-xl text-[11px] font-mono text-[#71717A] dark:text-[#D4B8D0] truncate border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#EC4899]/50 transition-colors cursor-text selection:bg-pink-200 dark:selection:bg-pink-900">
                  creatorpulse.com/c/{creatorHandle}
                </div>
              </div>
            )}
          </div>

          {/* Right Main Settings Form Area */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Profile Completion Checklist Banner */}
            <ProfileCompletionWidget variant="card" />
            
            {/* ========================================================= */}
            {/* 1. FAN: PROFILE & IDENTITY */}
            {/* ========================================================= */}
            {activeTab === 'fan_profile' && (
              <div className="p-5 sm:p-7 rounded-3xl bg-white/95 dark:bg-[#150D1E]/95 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-lg shadow-pink-500/5 space-y-6 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-4">
                  <h3 className="text-lg font-black text-[#18181B] dark:text-[#FDF2F8] flex items-center gap-2">
                    <User className="text-[#EC4899]" size={20} />
                    Personal Profile & Identity
                  </h3>
                  <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-1">
                    Customize your display details and avatar visible across community feeds and chats.
                  </p>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="relative group cursor-pointer">
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                        <Video size={20} className="text-white" />
                      </div>
                      <Avatar alt={fanFullName} src={fanAvatar} size="xl" className="ring-4 ring-[#FCE7F3] dark:ring-[#381A2B] group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="space-y-1.5 flex-1 w-full">
                      <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">Profile Avatar URL</p>
                      <input
                        type="url"
                        value={fanAvatar}
                        onChange={(e) => setFanAvatar(e.target.value)}
                        className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] transition-all hover:border-[#FBCFE8] dark:hover:border-[#4C1D3B]"
                        placeholder="https://..."
                      />
                      <p className="text-[10px] text-[#A1A1AA]">Recommended size: 400x400px. Max 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="group">
                      <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5 group-focus-within:text-[#EC4899] transition-colors">
                        Full Display Name
                      </label>
                      <input
                        type="text"
                        value={fanFullName}
                        onChange={(e) => setFanFullName(e.target.value)}
                        className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-3 text-sm font-bold text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] transition-all hover:border-[#FBCFE8] dark:hover:border-[#4C1D3B]"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5 group-focus-within:text-[#EC4899] transition-colors">
                        Username Handle
                      </label>
                      <div className="flex items-center bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#EC4899]/20 focus-within:border-[#EC4899] transition-all hover:border-[#FBCFE8] dark:hover:border-[#4C1D3B]">
                        <span className="text-sm font-bold text-[#A1A1AA]">@</span>
                        <input
                          type="text"
                          value={fanUsername}
                          onChange={(e) => setFanUsername(e.target.value)}
                          className="w-full bg-transparent text-sm font-bold text-[#18181B] dark:text-[#FDF2F8] focus:outline-none ml-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5 group-focus-within:text-[#EC4899] transition-colors">
                      Bio / About You
                    </label>
                    <textarea
                      rows={4}
                      value={fanBio}
                      onChange={(e) => setFanBio(e.target.value)}
                      className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl p-4 text-sm text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] resize-none transition-all hover:border-[#FBCFE8] dark:hover:border-[#4C1D3B]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#FFF9FC] to-white dark:from-[#22152E] dark:to-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#FBCFE8] dark:hover:border-[#4C1D3B] transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                        <EyeOff size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#18181B] dark:text-[#FDF2F8]">Stealth Mode (Private Profile)</p>
                        <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">Hide your VIP subscription badges and profile from public discovery.</p>
                      </div>
                    </div>
                    <Switch checked={fanStealthMode} onChange={setFanStealthMode} />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] text-white text-sm font-black shadow-md hover:shadow-lg shadow-pink-500/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-70 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {isSaving ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      <span>{isSaving ? 'Saving Changes...' : 'Save Profile Details'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================= */}
            {/* 1.5. FAN: CONTENT PREFERENCES & PERSONALIZATION */}
            {/* ========================================================= */}
            {activeTab === 'fan_content_prefs' && (
              <div className="p-5 sm:p-7 rounded-3xl bg-white/95 dark:bg-[#150D1E]/95 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-lg shadow-pink-500/5 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ContentPreferencesPanel />
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. FAN: MY VIP SUBSCRIPTIONS */}
            {/* ========================================================= */}
            {activeTab === 'fan_memberships' && (
              <div className="p-5 sm:p-7 rounded-3xl bg-white/95 dark:bg-[#150D1E]/95 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-lg shadow-pink-500/5 space-y-6 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-[#18181B] dark:text-[#FDF2F8] flex items-center gap-2">
                      <Crown className="text-amber-500" size={20} />
                      Active VIP Creator Memberships
                    </h3>
                    <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-1">
                      Manage recurring monthly passes, tier perks, and renewal billing.
                    </p>
                  </div>
                  <Link href="/explore" className="text-xs font-black text-[#EC4899] bg-[#FFF1F7] dark:bg-[#381A2B] hover:bg-[#FCE7F3] dark:hover:bg-[#4C1D3B] px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 group">
                    <span>Discover More</span>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscriptions.map((sub, idx) => (
                    <div
                      key={sub.id}
                      className="group flex flex-col justify-between p-5 rounded-3xl bg-gradient-to-br from-[#FFF9FC] to-white dark:from-[#22152E] dark:to-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#FBCFE8] dark:hover:border-[#4C1D3B] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar alt={sub.creator} src={sub.avatar} size="lg" isVerified={true} className="ring-4 ring-[#FCE7F3] dark:ring-[#381A2B] group-hover:scale-105 transition-transform" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8] truncate">{sub.creator}</h4>
                            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full shrink-0">Active</span>
                          </div>
                          <p className="text-[11px] text-[#A1A1AA] truncate">@{sub.username}</p>
                          <div className="mt-2 inline-flex items-center gap-1.5 bg-[#FFF1F7] dark:bg-[#381A2B] px-2.5 py-1 rounded-lg">
                            <Sparkles size={12} className="text-[#EC4899]" />
                            <p className="text-[11px] font-bold text-[#EC4899]">{sub.tier}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-[#A1A1AA] uppercase font-bold tracking-wider">Next Renewal</p>
                          <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">{sub.nextBilling}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/c/${sub.username}`}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] hover:text-[#EC4899] transition-colors hover:shadow-sm"
                          >
                            Feed
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              // In a real app, this would open a confirmation modal
                              if(window.confirm('Are you sure you want to cancel this membership?')) {
                                setSubscriptions(subscriptions.filter(s => s.id !== sub.id));
                                setSavedSuccess(true);
                              }
                            }}
                            className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:text-white hover:bg-rose-500 transition-colors"
                            aria-label="Cancel Pass"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {subscriptions.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-[#F3DCE8] dark:border-[#3A2A4C] rounded-3xl">
                      <div className="w-16 h-16 bg-[#FFF1F7] dark:bg-[#381A2B] rounded-full flex items-center justify-center mb-4">
                        <Crown size={24} className="text-[#EC4899] opacity-50" />
                      </div>
                      <h4 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8]">No Active Memberships</h4>
                      <p className="text-xs text-[#71717A] mt-1 max-w-sm">Support your favorite creators to unlock exclusive content, live streams, and community perks.</p>
                      <Link href="/explore" className="mt-4 px-5 py-2.5 bg-[#EC4899] text-white text-xs font-bold rounded-xl hover:bg-[#DB2777] transition-colors">
                        Explore Creators
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 3. FAN: PAYMENT METHODS & WALLET */}
            {/* ========================================================= */}
            {activeTab === 'fan_payments' && (
              <div className="p-5 sm:p-7 rounded-3xl bg-white/95 dark:bg-[#150D1E]/95 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-lg shadow-pink-500/5 space-y-6 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-4">
                  <h3 className="text-lg font-black text-[#18181B] dark:text-[#FDF2F8] flex items-center gap-2">
                    <CreditCard className="text-[#EC4899]" size={20} />
                    Payment Methods & Wallet
                  </h3>
                  <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-1">
                    Manage your checkout payment cards, PipraPay instant gateway, and account balance.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#18181B] to-[#27272A] dark:from-[#2A1736] dark:to-[#170B1E] border border-gray-800 dark:border-[#4C1D3B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden shadow-xl">
                  {/* Decorative Elements */}
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#EC4899] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                  
                  <div className="relative z-10 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA] flex items-center gap-1.5">
                      <Layers size={12} className="text-[#EC4899]" />
                      Available Wallet Balance
                    </span>
                    <h3 className="text-4xl font-black text-white tracking-tight">$240.50</h3>
                    <p className="text-xs text-gray-400">Available for subscriptions and tips</p>
                  </div>
                  <button className="relative z-10 px-6 py-3 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F43F5E] text-white text-sm font-black shadow-lg shadow-pink-500/30 hover:-translate-y-1 transition-transform active:translate-y-0 w-full sm:w-auto text-center flex items-center justify-center gap-2">
                    <Plus size={16} /> Add Funds
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wider text-[#A1A1AA]">Connected Cards</p>
                    <span className="text-[10px] bg-[#FFF1F7] dark:bg-[#381A2B] text-[#EC4899] px-2 py-0.5 rounded-full font-bold">Encrypted & Secure</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#FFF9FC] to-white dark:from-[#22152E] dark:to-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] group hover:border-[#FBCFE8] dark:hover:border-[#4C1D3B] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs tracking-wider shadow-sm group-hover:scale-105 transition-transform">
                        VISA
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#18181B] dark:text-[#FDF2F8]">Visa ending in 4242</p>
                          <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                            Primary
                          </span>
                        </div>
                        <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">Expires 12/28</p>
                      </div>
                    </div>
                    <button className="p-2 text-[#A1A1AA] hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30" aria-label="Remove Card">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] group hover:border-[#FBCFE8] dark:hover:border-[#4C1D3B] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-xs tracking-wider shadow-sm group-hover:scale-105 transition-transform">
                        MC
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#18181B] dark:text-[#FDF2F8]">Mastercard ending in 8821</p>
                        <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">Expires 08/27</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-[#EC4899] font-bold hover:underline px-2 py-1">
                        Make Primary
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Trigger Add Card Modal logic
                      alert('Add new card modal will appear here.');
                    }}
                    className="w-full py-4 rounded-2xl border-2 border-dashed border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#EC4899] hover:bg-[#FFF9FC] dark:hover:bg-[#22152E] text-sm font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] transition-all flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <Plus size={18} className="group-hover:scale-125 transition-transform" />
                    <span>Add New Credit / Debit Card</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 4. CREATOR: PROFILE & BRANDING */}
            {/* ========================================================= */}
            {activeTab === 'creator_profile' && (
              <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-sm shadow-pink-500/5 space-y-5 backdrop-blur-md">
                <div className="border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-3">
                  <h3 className="text-base font-black text-[#18181B] dark:text-[#FDF2F8]">
                    Creator Branding & Public Profile
                  </h3>
                  <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
                    Customize your public landing page, verified badge, bio, and social handles.
                  </p>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5">
                        Creator / Brand Name
                      </label>
                      <input
                        type="text"
                        value={creatorStageName}
                        onChange={(e) => setCreatorStageName(e.target.value)}
                        className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5">
                        Creator Handle URL
                      </label>
                      <div className="flex items-center bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-3.5 py-2.5">
                        <span className="text-xs font-bold text-[#A1A1AA]">/c/</span>
                        <input
                          type="text"
                          value={creatorHandle}
                          onChange={(e) => setCreatorHandle(e.target.value)}
                          className="w-full bg-transparent text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] focus:outline-none ml-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5">
                        Primary Category
                      </label>
                      <select
                        value={creatorCategory}
                        onChange={(e) => setCreatorCategory(e.target.value)}
                        className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] focus:outline-none"
                      >
                        <option value="Design & Creative">Design & Creative</option>
                        <option value="Software & Tech">Software & Tech</option>
                        <option value="Digital Art & 3D">Digital Art & 3D</option>
                        <option value="Music & Production">Music & Production</option>
                        <option value="Fitness & Health">Fitness & Health</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5">
                        Avatar Image URL
                      </label>
                      <input
                        type="url"
                        value={creatorAvatar}
                        onChange={(e) => setCreatorAvatar(e.target.value)}
                        className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-3.5 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5">
                      Cover Banner URL
                    </label>
                    <input
                      type="url"
                      value={creatorBanner}
                      onChange={(e) => setCreatorBanner(e.target.value)}
                      className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-3.5 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5">
                      Creator Story & Bio
                    </label>
                    <textarea
                      rows={3}
                      value={creatorBio}
                      onChange={(e) => setCreatorBio(e.target.value)}
                      className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl p-3.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none resize-none font-medium"
                    />
                  </div>

                  {/* Social Handles */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-black uppercase tracking-wider text-[#A1A1AA]">Connected Social Channels</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="url"
                        placeholder="YouTube URL"
                        value={creatorYoutube}
                        onChange={(e) => setCreatorYoutube(e.target.value)}
                        className="bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8]"
                      />
                      <input
                        type="url"
                        placeholder="X (Twitter) URL"
                        value={creatorX}
                        onChange={(e) => setCreatorX(e.target.value)}
                        className="bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8]"
                      />
                      <input
                        type="url"
                        placeholder="Instagram URL"
                        value={creatorInstagram}
                        onChange={(e) => setCreatorInstagram(e.target.value)}
                        className="bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8]"
                      />
                      <input
                        type="url"
                        placeholder="Twitch URL"
                        value={creatorTwitch}
                        onChange={(e) => setCreatorTwitch(e.target.value)}
                        className="bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8]"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] text-white text-xs font-black shadow-sm shadow-pink-500/25 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Save size={14} />
                      <span>{isSaving ? 'Saving Changes...' : 'Save Creator Profile'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================= */}
            {/* 5. CREATOR: MONETIZATION & VIP TIERS */}
            {/* ========================================================= */}
            {activeTab === 'creator_monetization' && (
              <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-sm shadow-pink-500/5 space-y-5 backdrop-blur-md">
                <div className="border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-3">
                  <h3 className="text-base font-black text-[#18181B] dark:text-[#FDF2F8]">
                    VIP Membership Tiers & Fan Tips
                  </h3>
                  <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
                    Configure your monthly subscription prices, tip jar rules, and welcome message automation.
                  </p>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  {/* Tier Pricing Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8]">Tier 1: Supporter</span>
                        <Crown size={14} className="text-amber-500" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-black text-sm text-[#EC4899]">$</span>
                        <input
                          type="text"
                          value={tier1Price}
                          onChange={(e) => setTier1Price(e.target.value)}
                          className="w-16 bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-lg px-2 py-1 text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]"
                        />
                        <span className="text-[10px] text-[#A1A1AA]">/month</span>
                      </div>
                      <p className="text-[10px] text-[#71717A] dark:text-[#D4B8D0]">Community badge + Public drop access</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border-2 border-[#EC4899] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#EC4899]">Tier 2: VIP Insider</span>
                        <Sparkles size={14} className="text-[#EC4899]" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-black text-sm text-[#EC4899]">$</span>
                        <input
                          type="text"
                          value={tier2Price}
                          onChange={(e) => setTier2Price(e.target.value)}
                          className="w-16 bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-lg px-2 py-1 text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]"
                        />
                        <span className="text-[10px] text-[#A1A1AA]">/month</span>
                      </div>
                      <p className="text-[10px] text-[#71717A] dark:text-[#D4B8D0]">4K Video Drops + Source Files + Vault</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8]">Tier 3: Diamond</span>
                        <Flame size={14} className="text-rose-500" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-black text-sm text-[#EC4899]">$</span>
                        <input
                          type="text"
                          value={tier3Price}
                          onChange={(e) => setTier3Price(e.target.value)}
                          className="w-16 bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-lg px-2 py-1 text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]"
                        />
                        <span className="text-[10px] text-[#A1A1AA]">/month</span>
                      </div>
                      <p className="text-[10px] text-[#71717A] dark:text-[#D4B8D0]">1-on-1 DM Priority + Live Masterclasses</p>
                    </div>
                  </div>

                  {/* Fan Tipping Rules */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-black uppercase tracking-wider text-[#A1A1AA]">Fan Tip Jar Rules</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C]">
                        <div>
                          <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">Minimum Tip</p>
                          <p className="text-[10px] text-[#71717A] dark:text-[#D4B8D0]">Minimum amount required to send tip</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-black text-[#EC4899]">$</span>
                          <input
                            type="text"
                            value={minTipAmount}
                            onChange={(e) => setMinTipAmount(e.target.value)}
                            className="w-14 bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-lg px-2 py-1 text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C]">
                        <div>
                          <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">Live Tip Sound Alert</p>
                          <p className="text-[10px] text-[#71717A] dark:text-[#D4B8D0]">Play bell on receiving fan tip</p>
                        </div>
                        <Switch checked={enableTipSounds} onChange={setEnableTipSounds} />
                      </div>
                    </div>
                  </div>

                  {/* Automated Welcome Direct Message */}
                  <div>
                    <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5">
                      Automated Welcome Direct Message for New Subscribers
                    </label>
                    <textarea
                      rows={2}
                      value={autoWelcomeMsg}
                      onChange={(e) => setAutoWelcomeMsg(e.target.value)}
                      className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl p-3.5 text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none resize-none font-medium"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] text-white text-xs font-black shadow-sm shadow-pink-500/25 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Save size={14} />
                      <span>{isSaving ? 'Saving Changes...' : 'Save Monetization Settings'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================= */}
            {/* 6. CREATOR: PAYOUTS & BANKING */}
            {/* ========================================================= */}
            {activeTab === 'creator_payouts' && (
              <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-sm shadow-pink-500/5 space-y-5 backdrop-blur-md">
                <div className="border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-3">
                  <h3 className="text-base font-black text-[#18181B] dark:text-[#FDF2F8]">
                    Payout Destination & Banking Settings
                  </h3>
                  <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
                    Connect your bank account or gateway for automatic weekly earnings payouts.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200">Stripe Connect Active</h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Direct deposit connected to Chase Bank (•••• 9942)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-white dark:bg-[#150D1E] px-2.5 py-1 rounded-xl border border-emerald-300 dark:border-emerald-800">
                    Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#A1A1AA]">Payout Frequency</span>
                    <p className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8]">Every Monday (Weekly)</p>
                    <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">Minimum threshold: $50.00</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#A1A1AA]">Tax Info (W-8BEN / W-9)</span>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">Validated & On File</p>
                    <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">1099-K reporting active</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F43F5E] text-white text-xs font-black shadow-xs cursor-pointer"
                  >
                    Update Banking Details
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 7. CREATOR: BROADCAST & STUDIO */}
            {/* ========================================================= */}
            {activeTab === 'creator_studio' && (
              <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-sm shadow-pink-500/5 space-y-5 backdrop-blur-md">
                <div className="border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-3">
                  <h3 className="text-base font-black text-[#18181B] dark:text-[#FDF2F8]">
                    Live Broadcast & Studio Configuration
                  </h3>
                  <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
                    RTMP keys for OBS / vMix, stream quality profiles, and content leak prevention.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Stream Key Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                      OBS / RTMP Stream Key (Secret)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-3.5 py-2">
                        <span className="font-mono text-xs text-[#18181B] dark:text-[#FDF2F8] flex-1">
                          {showStreamKey ? streamKey : '••••••••••••••••••••••••••••••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowStreamKey(!showStreamKey)}
                          className="text-[#A1A1AA] hover:text-[#18181B] ml-2 cursor-pointer"
                        >
                          {showStreamKey ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={copyStreamKey}
                        className="px-3.5 py-2.5 rounded-2xl bg-[#FCE7F3] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        {streamKeyCopied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{streamKeyCopied ? 'Copied!' : 'Copy Key'}</span>
                      </button>
                    </div>
                  </div>

                  {/* RTMP Ingest URL */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                      RTMP Server URL
                    </label>
                    <div className="p-2.5 bg-[#FFF9FC] dark:bg-[#22152E] rounded-xl text-xs font-mono text-[#71717A] dark:text-[#D4B8D0] border border-[#F3DCE8] dark:border-[#3A2A4C]">
                      rtmp://live.creatorpulse.com/app
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C]">
                      <div>
                        <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">Anti-Leak Dynamic Watermarking</p>
                        <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">Display viewer username overlay to protect exclusive video drops.</p>
                      </div>
                      <Switch checked={watermarkProtection} onChange={setWatermarkProtection} />
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C]">
                      <div>
                        <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">Ultra-Low Latency Broadcast</p>
                        <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">Sub-second live stream delay for zero-lag fan chat interaction.</p>
                      </div>
                      <Switch checked={lowLatency} onChange={setLowLatency} />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F43F5E] text-white text-xs font-black shadow-xs cursor-pointer"
                    >
                      Save Studio Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 8. UNIVERSAL: NOTIFICATIONS */}
            {/* ========================================================= */}
            {(activeTab === 'fan_notifications' || activeTab === 'creator_notifications') && (
              <NotificationPreferencesPanel isCreatorView={isCreator} />
            )}

            {/* ========================================================= */}
            {/* 9. UNIVERSAL: SECURITY & PASSWORD */}
            {/* ========================================================= */}
            {(activeTab === 'fan_security' || activeTab === 'creator_security') && (
              <div className="p-5 sm:p-7 rounded-3xl bg-white/95 dark:bg-[#150D1E]/95 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-lg shadow-pink-500/5 space-y-6 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-4">
                  <h3 className="text-lg font-black text-[#18181B] dark:text-[#FDF2F8] flex items-center gap-2">
                    <Shield className="text-[#EC4899]" size={20} />
                    Account Security & Authentication
                  </h3>
                  <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-1">
                    Update your account password, enable two-factor authentication, and monitor active sessions.
                  </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="group">
                      <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5 group-focus-within:text-[#EC4899] transition-colors">
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-3 text-sm text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] transition-all"
                      />
                    </div>

                    <div className="group relative">
                      <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5 group-focus-within:text-[#EC4899] transition-colors">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl px-4 py-3 text-sm text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] transition-all"
                      />
                      {newPassword && (
                        <div className="absolute right-4 top-9 flex gap-1">
                          <div className="h-1.5 w-3 rounded-full bg-emerald-500"></div>
                          <div className="h-1.5 w-3 rounded-full bg-emerald-500"></div>
                          <div className="h-1.5 w-3 rounded-full bg-emerald-500"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#FFF9FC] to-white dark:from-[#22152E] dark:to-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#FBCFE8] dark:hover:border-[#4C1D3B] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 group-hover:scale-110 transition-transform">
                        <Key size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#18181B] dark:text-[#FDF2F8]">Two-Factor Authentication (2FA)</p>
                        <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">Require authenticator code on unrecognized device sign-ins.</p>
                      </div>
                    </div>
                    <Switch checked={enable2FA} onChange={setEnable2FA} />
                  </div>

                  {/* Active Sessions */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-black uppercase tracking-wider text-[#A1A1AA]">Active Logged-In Sessions</p>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] text-sm group hover:border-[#FBCFE8] dark:hover:border-[#4C1D3B] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-xl bg-[#FFF1F7] dark:bg-[#381A2B] text-[#EC4899] group-hover:scale-110 transition-transform">
                          <Monitor size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-[#18181B] dark:text-[#FDF2F8]">macOS • Chrome Browser</p>
                          <p className="text-xs text-[#71717A]">Current Active Device • Dhaka, Bangladesh</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">Active Now</span>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-4 border-t border-[#F3DCE8] dark:border-[#3A2A4C]">
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">Delete Account</h4>
                        <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">Permanently remove your account and data. This action cannot be undone.</p>
                      </div>
                      <button type="button" onClick={() => {
                        if(window.confirm('Are you absolutely sure you want to delete your account? This action is irreversible.')) {
                          alert('Account deletion request initiated.');
                        }
                      }} className="px-4 py-2 bg-white dark:bg-[#150D1E] border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-colors whitespace-nowrap shadow-sm">
                        Delete Account
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] text-white text-sm font-black shadow-md hover:shadow-lg shadow-pink-500/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-70 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {isSaving ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Lock size={16} />
                      )}
                      <span>{isSaving ? 'Updating...' : 'Update Security Settings'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================= */}
            {/* 10. FAN: PREFERENCES & LOCALIZATION */}
            {/* ========================================================= */}
            {activeTab === 'fan_preferences' && (
              <div className="p-5 sm:p-7 rounded-3xl bg-white/95 dark:bg-[#150D1E]/95 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-lg shadow-pink-500/5 space-y-6 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-4">
                  <h3 className="text-lg font-black text-[#18181B] dark:text-[#FDF2F8] flex items-center gap-2">
                    <Globe className="text-[#EC4899]" size={20} />
                    Display & Regional Preferences
                  </h3>
                  <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-1">
                    Customize your interface currency, system language, and theme modes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="group">
                    <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5 group-focus-within:text-[#EC4899] transition-colors">
                      Billing Currency
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A1A1AA] group-focus-within:text-[#EC4899] transition-colors">
                        <CreditCard size={16} />
                      </div>
                      <select
                        value={fanCurrency}
                        onChange={(e) => setFanCurrency(e.target.value)}
                        className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] transition-all appearance-none cursor-pointer"
                      >
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="GBP">GBP (£) - British Pound</option>
                        <option value="CAD">CAD ($) - Canadian Dollar</option>
                        <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#A1A1AA]">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] mb-1.5 group-focus-within:text-[#EC4899] transition-colors">
                      Interface Language
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A1A1AA] group-focus-within:text-[#EC4899] transition-colors">
                        <Globe size={16} />
                      </div>
                      <select
                        value={fanLanguage}
                        onChange={(e) => setFanLanguage(e.target.value)}
                        className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] transition-all appearance-none cursor-pointer"
                      >
                        <option value="en">English (US)</option>
                        <option value="es">Español (Spanish)</option>
                        <option value="fr">Français (French)</option>
                        <option value="de">Deutsch (German)</option>
                        <option value="ja">日本語 (Japanese)</option>
                        <option value="bn">বাংলা (Bengali)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#A1A1AA]">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Mode Toggle Example (Static for UI) */}
                <div className="pt-2">
                  <p className="text-xs font-black uppercase tracking-wider text-[#A1A1AA] mb-3">App Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" className="p-3 rounded-2xl border-2 border-[#EC4899] bg-[#FFF1F7] dark:bg-[#381A2B] text-[#EC4899] flex flex-col items-center justify-center gap-2">
                      <Monitor size={20} />
                      <span className="text-xs font-bold">System</span>
                    </button>
                    <button type="button" className="p-3 rounded-2xl border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#FBCFE8] hover:bg-[#FFF9FC] text-[#71717A] flex flex-col items-center justify-center gap-2 transition-all">
                      <Sun size={20} />
                      <span className="text-xs font-bold">Light</span>
                    </button>
                    <button type="button" className="p-3 rounded-2xl border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#4C1D3B] hover:bg-[#22152E] text-[#71717A] flex flex-col items-center justify-center gap-2 transition-all">
                      <Moon size={20} />
                      <span className="text-xs font-bold">Dark</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSave}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] text-white text-sm font-black shadow-md hover:shadow-lg shadow-pink-500/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-70 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isSaving ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default SettingsPage;
