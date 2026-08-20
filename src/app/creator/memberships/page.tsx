'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers, Plus, Pencil, Trash2, Users, Check, Sparkles,
  AlertCircle, DollarSign, TrendingUp, Star, Search,
  ArrowUp, ArrowDown, Copy, CheckCheck, X, ExternalLink,
  ShieldAlert, Gift, MessageSquare, Info, Zap, Crown,
  Heart, Coffee, Shield, Flame, Rocket, Diamond, Award,
  SlidersHorizontal, CheckCircle2, ChevronRight, Share2,
  Lock, ArrowRight, Eye, RefreshCw, Smartphone, Monitor, Tag
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/auth-context';
import {
  useCreatorMemberships,
  CreatorTier
} from '@/lib/memberships/membership-store';

// Premium Tier Icon Options
const TIER_ICONS: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  crown: { label: 'VIP Crown', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-50' },
  zap: { label: 'Pro Zap', icon: Zap, color: 'text-[#EC4899]', bg: 'bg-pink-50' },
  star: { label: 'Star', icon: Star, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  diamond: { label: 'Diamond', icon: Diamond, color: 'text-sky-600', bg: 'bg-sky-50' },
  rocket: { label: 'Rocket', icon: Rocket, color: 'text-purple-600', bg: 'bg-purple-50' },
  heart: { label: 'Supporter', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
  coffee: { label: 'Coffee', icon: Coffee, color: 'text-amber-700', bg: 'bg-amber-100/60' },
  shield: { label: 'Shield', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  flame: { label: 'Flame', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
};

// Fast-Start Preset Packages for Creators
const FAST_PACKAGE_BLUEPRINTS = [
  {
    name: 'Community Lounge',
    icon: 'coffee',
    category: 'Community',
    priceMonthly: 5.0,
    priceAnnual: 48.0,
    description: 'Casual community pass with supporter badge and member-only feed posts.',
    benefits: ['Supporter Profile Badge', 'Exclusive Feed Posts', 'Community Chat Lounge Access', 'Priority Direct Messaging'],
    popular: false,
    colorBadge: 'emerald',
    welcomeMessage: 'Welcome to the community! Feel free to introduce yourself in the members feed.'
  },
  {
    name: 'Pro Creator Tier',
    icon: 'zap',
    category: 'Masterclass',
    priceMonthly: 15.0,
    priceAnnual: 144.0,
    description: 'Full access to downloadable project files, UI design kits, and monthly masterclasses.',
    benefits: ['All Starter Community Perks', '4K Video Masterclasses', 'Figma & Code Source File Downloads', 'Monthly Live Stream Q&A Access'],
    popular: true,
    colorBadge: 'pink',
    welcomeMessage: 'Welcome to Pro! Your VIP downloads and masterclass videos are now unlocked.'
  },
  {
    name: 'VIP Inner Circle',
    icon: 'crown',
    category: '1-on-1 Mentorship',
    priceMonthly: 35.0,
    priceAnnual: 336.0,
    description: 'Direct 1-on-1 guidance, private Discord access, and monthly strategy calls.',
    benefits: ['All Pro Creator Perks', 'Monthly 30-min 1-on-1 Video Call', 'Direct Priority DM Hotline', 'Early Product Drafts & Betas'],
    popular: false,
    colorBadge: 'purple',
    memberLimit: 50,
    welcomeMessage: 'Welcome to the Inner Circle! Check your DMs for booking your first 1-on-1 call.'
  }
];

// Suggested Perks grouped by category
const PERK_CATEGORIES = [
  {
    name: 'Content & Drops',
    perks: ['Exclusive VIP Posts & Behind-the-Scenes', '4K Source Files & Templates', 'Full Video Masterclass Library', 'Early Draft Previews']
  },
  {
    name: 'Community & Roles',
    perks: ['Discord VIP Role & Private Channels', 'Supporter Badge on Comments', 'Monthly Live Q&A Stream', 'Community Voting Rights']
  },
  {
    name: 'Direct Access & Coaching',
    perks: ['Direct 1-on-1 DM Thread', 'Monthly 30-min Strategy Call', 'Portfolio & Code Reviews', 'Commercial Asset License']
  }
];

export default function CreatorMembershipsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const creatorId = user?.id || 'user-creator-1';

  const {
    tiers,
    metrics,
    addTier,
    updateTier,
    toggleTierStatus,
    deleteTier,
    reorderTiers
  } = useCreatorMemberships(creatorId);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'popular'>('all');

  // Modals & Active state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'essentials' | 'pricing' | 'perks'>('essentials');
  const [editingTier, setEditingTier] = useState<CreatorTier | null>(null);
  const [tierToDelete, setTierToDelete] = useState<CreatorTier | null>(null);
  const [copiedTierId, setCopiedTierId] = useState<string | null>(null);

  // Live Profile Preview states
  const [previewBillingCycle, setPreviewBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPreviewTierId, setSelectedPreviewTierId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('zap');
  const [formCategory, setFormCategory] = useState('Community');
  const [formPriceMonthly, setFormPriceMonthly] = useState('15.00');
  const [formPriceAnnual, setFormPriceAnnual] = useState('144.00');
  const [formDesc, setFormDesc] = useState('');
  const [formPerkInput, setFormPerkInput] = useState('');
  const [formBenefits, setFormBenefits] = useState<string[]>([]);
  const [formPopular, setFormPopular] = useState(false);
  const [formColor, setFormColor] = useState('pink');
  const [formMemberLimit, setFormMemberLimit] = useState('');
  const [formWelcomeMsg, setFormWelcomeMsg] = useState('');

  // Filtered Tiers
  const filteredTiers = useMemo(() => {
    return tiers.filter((t) => {
      if (statusFilter === 'active' && t.status !== 'active') return false;
      if (statusFilter === 'inactive' && t.status !== 'inactive') return false;
      if (statusFilter === 'popular' && !t.popular) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesCategory = (t.category || '').toLowerCase().includes(q);
        const matchesPerks = t.benefits.some((b) => b.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesPerks && !matchesCategory) return false;
      }
      return true;
    });
  }, [tiers, statusFilter, searchQuery]);

  // Selected or Fallback Preview Tier
  const previewTier = useMemo(() => {
    if (selectedPreviewTierId) {
      const found = tiers.find((t) => t.id === selectedPreviewTierId);
      if (found) return found;
    }
    return tiers.find((t) => t.popular) || tiers[0] || null;
  }, [tiers, selectedPreviewTierId]);

  // Total MRR calculation for revenue share bar
  const totalMonthlyMRR = useMemo(() => {
    return tiers.reduce((acc, t) => {
      if (t.status !== 'active') return acc;
      return acc + (t.subscribersCount || 0) * t.priceMonthly;
    }, 0);
  }, [tiers]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingTier(null);
    setModalTab('essentials');
    setFormName('');
    setFormIcon('zap');
    setFormCategory('Community');
    setFormPriceMonthly('10.00');
    setFormPriceAnnual('96.00');
    setFormDesc('');
    setFormBenefits(['Access to Member-Only Posts', 'Community Chat Lounge Access', 'Supporter Profile Badge']);
    setFormPopular(false);
    setFormColor('pink');
    setFormMemberLimit('');
    setFormWelcomeMsg('Thank you for subscribing! We are thrilled to welcome you to the tier.');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (tier: CreatorTier) => {
    setEditingTier(tier);
    setModalTab('essentials');
    setFormName(tier.name);
    setFormIcon(tier.icon || 'zap');
    setFormCategory(tier.category || 'Community');
    setFormPriceMonthly(tier.priceMonthly.toFixed(2));
    setFormPriceAnnual(tier.priceAnnual ? tier.priceAnnual.toFixed(2) : (tier.priceMonthly * 9.6).toFixed(2));
    setFormDesc(tier.description);
    setFormBenefits([...tier.benefits]);
    setFormPopular(!!tier.popular);
    setFormColor(tier.colorBadge || 'pink');
    setFormMemberLimit(tier.memberLimit ? String(tier.memberLimit) : '');
    setFormWelcomeMsg(tier.welcomeMessage || '');
    setIsModalOpen(true);
  };

  // Apply Fast Blueprint
  const handleApplyBlueprint = (bp: typeof FAST_PACKAGE_BLUEPRINTS[0]) => {
    setEditingTier(null);
    setModalTab('essentials');
    setFormName(bp.name);
    setFormIcon(bp.icon);
    setFormCategory(bp.category);
    setFormPriceMonthly(bp.priceMonthly.toFixed(2));
    setFormPriceAnnual(bp.priceAnnual.toFixed(2));
    setFormDesc(bp.description);
    setFormBenefits([...bp.benefits]);
    setFormPopular(bp.popular);
    setFormColor(bp.colorBadge);
    setFormMemberLimit(bp.memberLimit ? String(bp.memberLimit) : '');
    setFormWelcomeMsg(bp.welcomeMessage);
    setIsModalOpen(true);
    showToast(`Template "${bp.name}" loaded into creator!`, 'info');
  };

  // Add Perk Tag
  const handleAddPerk = (perk: string) => {
    const trimmed = perk.trim();
    if (!trimmed) return;
    if (formBenefits.includes(trimmed)) {
      showToast('This perk is already included.', 'info');
      return;
    }
    setFormBenefits([...formBenefits, trimmed]);
    setFormPerkInput('');
  };

  // Remove Perk Tag
  const handleRemovePerk = (index: number) => {
    setFormBenefits(formBenefits.filter((_, i) => i !== index));
  };

  // Calculate 20% Annual Discount
  const handleAutoAnnualDiscount = () => {
    const m = parseFloat(formPriceMonthly) || 0;
    if (m > 0) {
      const a = (m * 12 * 0.8).toFixed(2);
      setFormPriceAnnual(a);
      showToast('Annual price calculated with 20% savings discount!', 'success');
    }
  };

  // Form Save Action
  const handleSaveTier = (e: React.FormEvent) => {
    e.preventDefault();
    const monthly = parseFloat(formPriceMonthly);
    if (!formName.trim()) {
      showToast('Please enter a tier package name.', 'error');
      setModalTab('essentials');
      return;
    }
    if (isNaN(monthly) || monthly <= 0) {
      showToast('Please enter a valid monthly price ($ USD).', 'error');
      setModalTab('pricing');
      return;
    }
    if (formBenefits.length === 0) {
      showToast('Please specify at least one perk for subscribers.', 'error');
      setModalTab('perks');
      return;
    }

    const annual = parseFloat(formPriceAnnual) || Number((monthly * 12 * 0.8).toFixed(2));
    const limit = formMemberLimit ? parseInt(formMemberLimit, 10) : undefined;

    if (editingTier) {
      updateTier(editingTier.id, {
        name: formName.trim(),
        icon: formIcon,
        category: formCategory.trim(),
        priceMonthly: monthly,
        priceAnnual: annual,
        description: formDesc.trim(),
        benefits: formBenefits,
        popular: formPopular,
        colorBadge: formColor,
        memberLimit: limit,
        welcomeMessage: formWelcomeMsg.trim()
      });
      showToast(`Tier "${formName.trim()}" updated successfully!`, 'success');
    } else {
      addTier({
        name: formName.trim(),
        icon: formIcon,
        category: formCategory.trim(),
        priceMonthly: monthly,
        priceAnnual: annual,
        description: formDesc.trim() || 'Access to exclusive member-only perks and content.',
        benefits: formBenefits,
        status: 'active',
        popular: formPopular,
        colorBadge: formColor,
        memberLimit: limit,
        welcomeMessage: formWelcomeMsg.trim()
      });
      showToast(`New tier "${formName.trim()}" published!`, 'success');
    }

    setIsModalOpen(false);
  };

  // Delete Action
  const handleConfirmDelete = () => {
    if (!tierToDelete) return;
    deleteTier(tierToDelete.id);
    showToast(`Tier "${tierToDelete.name}" deleted.`, 'info');
    setTierToDelete(null);
  };

  // Copy Direct Link
  const handleCopyShareLink = (tier: CreatorTier) => {
    const username = user?.username || 'sarahdesign';
    const link = `${window.location.origin}/c/${username}?tier=${tier.id}`;
    navigator.clipboard.writeText(link);
    setCopiedTierId(tier.id);
    showToast('Direct subscription link copied to clipboard!', 'success');
    setTimeout(() => setCopiedTierId(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. MINIMAL HERO HEADER WITH CONTEXT & QUICK ACTIONS                        */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-[#FFF9FC] to-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#F3DCE8] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-pink-100/70 text-[#BE185D] text-[10px] font-black uppercase tracking-wider">
              Creator Memberships
            </span>
            <span className="text-xs text-[#A1A1AA] font-bold hidden sm:inline">• Subscription Packages</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-[#18181B] tracking-tight">
            Membership Studio
          </h1>
          <p className="text-xs text-[#71717A] max-w-xl font-medium leading-relaxed">
            Configure transparent passes, offer exclusive perks, and turn your fanbase into recurring monthly patrons.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-stretch sm:self-auto">
          <Link
            href={`/c/${user?.username || 'sarahdesign'}`}
            target="_blank"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#71717A] hover:text-[#18181B] bg-white border border-[#F3DCE8] px-3.5 py-2.5 rounded-xl sm:rounded-2xl transition-all hover:bg-[#FFF9FC] shadow-2xs"
          >
            <Eye size={14} className="text-[#EC4899]" />
            <span>Public Profile</span>
          </Link>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={handleOpenCreateModal}
            className="flex-1 sm:flex-initial shadow-md shadow-pink-500/25 cursor-pointer justify-center"
          >
            Create Tier
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. VISUALIZED INTELLIGENCE METRIC CARDS & REVENUE DISTRIBUTION BAR        */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Active Tiers */}
          <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#F3DCE8] shadow-xs space-y-1.5 sm:space-y-2 hover:border-[#EC4899]/40 transition-all group">
            <div className="flex items-center justify-between text-[#71717A]">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#A1A1AA]">Active Tiers</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-pink-50 text-[#EC4899] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers size={14} className="sm:w-4 sm:h-4" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-black text-[#18181B] tracking-tight">
                {metrics.activeTiersCount}
                <span className="text-[10px] sm:text-xs font-semibold text-[#A1A1AA] ml-1">/ {metrics.totalTiersCount} total</span>
              </p>
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-emerald-600 flex items-center gap-1.5 pt-0.5">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live on Profile</span>
            </div>
          </div>

          {/* Subscribers */}
          <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#F3DCE8] shadow-xs space-y-1.5 sm:space-y-2 hover:border-[#EC4899]/40 transition-all group">
            <div className="flex items-center justify-between text-[#71717A]">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#A1A1AA]">Subscribers</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users size={14} className="sm:w-4 sm:h-4" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-black text-[#18181B] tracking-tight">
                {metrics.totalSubscribers.toLocaleString()}
              </p>
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-[#BE185D] flex items-center gap-1 pt-0.5">
              <TrendingUp size={12} />
              <span>Paying Patrons</span>
            </div>
          </div>

          {/* Monthly MRR */}
          <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#F3DCE8] shadow-xs space-y-1.5 sm:space-y-2 hover:border-emerald-300 transition-all group">
            <div className="flex items-center justify-between text-[#71717A]">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#A1A1AA]">Monthly MRR</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <DollarSign size={14} className="sm:w-4 sm:h-4" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-black text-[#18181B] tracking-tight truncate">
                ${metrics.monthlyRecurringRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-emerald-600 flex items-center gap-1 pt-0.5 truncate">
              <Sparkles size={12} className="shrink-0" />
              <span>Recurring Monthly</span>
            </div>
          </div>

          {/* Projected Annual (ARR) */}
          <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#F3DCE8] shadow-xs space-y-1.5 sm:space-y-2 hover:border-amber-300 transition-all group">
            <div className="flex items-center justify-between text-[#71717A]">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#A1A1AA]">Est. ARR</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Award size={14} className="sm:w-4 sm:h-4" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-black text-[#18181B] tracking-tight truncate">
                ${(metrics.monthlyRecurringRevenue * 12).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-amber-700 flex items-center gap-1 pt-0.5 truncate">
              <Lock size={12} className="shrink-0" />
              <span>12-Mo Projection</span>
            </div>
          </div>
        </div>

        {/* Visualized Revenue Distribution Breakdown Bar */}
        {totalMonthlyMRR > 0 && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#F3DCE8] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#18181B]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-[#EC4899]" />
                <span>Tier Revenue Share</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#71717A] font-semibold">
                ${totalMonthlyMRR.toLocaleString()}/mo Gross
              </span>
            </div>

            {/* Stacked Percentage Progress Bar */}
            <div className="h-2.5 sm:h-3 rounded-full overflow-hidden bg-slate-100 flex p-0.5 gap-0.5">
              {tiers.filter((t) => t.status === 'active' && (t.subscribersCount || 0) > 0).map((t, idx) => {
                const tierMRR = (t.subscribersCount || 0) * t.priceMonthly;
                const pct = totalMonthlyMRR > 0 ? (tierMRR / totalMonthlyMRR) * 100 : 0;
                const colors = ['bg-[#EC4899]', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500'];
                const segColor = colors[idx % colors.length];

                return (
                  <div
                    key={t.id}
                    style={{ width: `${Math.max(pct, 4)}%` }}
                    className={`${segColor} h-full rounded-full transition-all duration-500 hover:brightness-110 cursor-pointer`}
                    title={`${t.name}: $${tierMRR.toLocaleString()}/mo (${pct.toFixed(1)}%)`}
                    onClick={() => setSelectedPreviewTierId(t.id)}
                  />
                );
              })}
            </div>

            {/* Legend tags */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[10px] sm:text-[11px] font-semibold text-[#71717A]">
              {tiers.filter((t) => t.status === 'active' && (t.subscribersCount || 0) > 0).map((t, idx) => {
                const tierMRR = (t.subscribersCount || 0) * t.priceMonthly;
                const pct = totalMonthlyMRR > 0 ? (tierMRR / totalMonthlyMRR) * 100 : 0;
                const dotColors = ['bg-[#EC4899]', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500'];
                const dotColor = dotColors[idx % dotColors.length];

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedPreviewTierId(t.id)}
                    className="flex items-center gap-1 hover:text-[#18181B] cursor-pointer transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                    <span className="font-bold text-[#18181B] truncate max-w-[120px] sm:max-w-none">{t.name}:</span>
                    <span>${tierMRR.toLocaleString()} ({pct.toFixed(0)}%)</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. 1-CLICK FAST BLUEPRINTS STARTER STRIP                                   */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#FFF1F7] via-white to-[#FFF1F7] border border-[#F3DCE8] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#EC4899]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#18181B]">
              Quick-Start Package Blueprints
            </h3>
          </div>
          <span className="text-[10px] sm:text-[11px] text-[#71717A] font-semibold">
            One-click templates curated for creators &amp; educators
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {FAST_PACKAGE_BLUEPRINTS.map((bp) => {
            const IconComponent = TIER_ICONS[bp.icon]?.icon || Sparkles;
            return (
              <div
                key={bp.name}
                onClick={() => handleApplyBlueprint(bp)}
                className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#F3DCE8] hover:border-[#EC4899] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#FFF1F7] text-[#BE185D] flex items-center justify-center shrink-0">
                        <IconComponent size={14} />
                      </div>
                      <span className="text-xs font-black text-[#18181B] group-hover:text-[#BE185D] transition-colors truncate">
                        {bp.name}
                      </span>
                    </div>
                    <span className="text-xs font-black text-emerald-600 shrink-0">${bp.priceMonthly}/mo</span>
                  </div>
                  <p className="text-[10px] text-[#71717A] line-clamp-2 leading-relaxed">
                    {bp.description}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-[#F3DCE8]/60 flex items-center justify-between text-[10px] font-bold text-[#BE185D]">
                  <span>{bp.benefits.length} perks</span>
                  <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Use <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN GRID: TIERS LIST + LIVE SUBSCRIBER PREVIEW PANEL                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
        
        {/* Left Column: Filter Bar & Tier Cards */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Controls Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-[#F3DCE8] shadow-xs">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl pl-9 pr-8 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A1A1AA] hover:text-[#18181B] cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'all', label: `All (${tiers.length})` },
                { id: 'active', label: `Active (${metrics.activeTiersCount})` },
                { id: 'inactive', label: `Inactive (${metrics.totalTiersCount - metrics.activeTiersCount})` },
                { id: 'popular', label: '★ Popular' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setStatusFilter(chip.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    statusFilter === chip.id
                      ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-2xs'
                      : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF9FC]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tier Cards List */}
          {filteredTiers.length === 0 ? (
            <div className="p-8 sm:p-10 rounded-2xl sm:rounded-3xl bg-white border border-[#F3DCE8] text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-pink-50 text-[#EC4899] flex items-center justify-center mx-auto text-xl border border-pink-100 shadow-xs">
                <Layers size={24} />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-black text-[#18181B]">No Tiers Found</h3>
                <p className="text-xs text-[#71717A] font-medium">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No packages match your search filters.'
                    : 'Get started by creating your first subscription pass to monetize your content.'}
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={handleOpenCreateModal} leftIcon={<Plus size={14} />}>
                Create Tier
              </Button>
            </div>
          ) : (
            <div className="space-y-3.5 sm:space-y-4">
              {filteredTiers.map((tier, index) => {
                const tierMonthlyMRR = (tier.subscribersCount || 0) * tier.priceMonthly;
                const isSelectedForPreview = previewTier?.id === tier.id;
                const IconMeta = TIER_ICONS[tier.icon || 'zap'] || TIER_ICONS.zap;
                const TierIcon = IconMeta.icon;

                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedPreviewTierId(tier.id)}
                    className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border transition-all cursor-pointer space-y-3.5 sm:space-y-4 hover:shadow-lg ${
                      isSelectedForPreview
                        ? 'border-[#EC4899] ring-2 ring-[#EC4899]/30 shadow-md shadow-pink-500/5'
                        : 'border-[#F3DCE8] hover:border-[#EC4899]/50 shadow-xs'
                    } ${tier.status === 'inactive' ? 'opacity-70 bg-slate-50/60' : ''}`}
                  >
                    {/* Header Row: Icon, Title, Badges, Pricing */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Tier Icon Badge */}
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${IconMeta.bg} ${IconMeta.color} flex items-center justify-center shrink-0 border border-black/5 shadow-2xs`}>
                          <TierIcon size={18} className="sm:w-5 sm:h-5" />
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-black text-[#18181B] tracking-tight">{tier.name}</h3>
                            {tier.category && (
                              <span className="text-[10px] font-extrabold text-[#71717A] bg-slate-100 px-2 py-0.5 rounded-md">
                                {tier.category}
                              </span>
                            )}
                            {tier.popular && (
                              <span className="text-[9px] sm:text-[10px] font-black text-[#BE185D] bg-[#FCE7F3] px-2 py-0.5 rounded-full border border-[#FBCFE8] flex items-center gap-1 shadow-2xs">
                                <Sparkles size={10} /> Popular
                              </span>
                            )}
                            <Badge variant={tier.status === 'active' ? 'emerald' : 'slate'} size="sm">
                              {tier.status.toUpperCase()}
                            </Badge>
                            {tier.memberLimit && (
                              <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                Cap: {tier.memberLimit}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#71717A] font-medium leading-relaxed">
                            {tier.description}
                          </p>
                        </div>
                      </div>

                      {/* Pricing Block */}
                      <div className="text-left sm:text-right shrink-0 bg-[#FFF9FC] sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                        <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-1">
                          <p className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
                            ${tier.priceMonthly.toFixed(2)}
                            <span className="text-xs font-semibold text-[#71717A]">/mo</span>
                          </p>
                          {tier.priceAnnual && (
                            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600">
                              ${tier.priceAnnual.toFixed(2)}/yr (Save 20%)
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-[#71717A] font-bold mt-1 flex items-center gap-1.5 justify-start sm:justify-end">
                          <Users size={12} className="text-[#EC4899]" />
                          <span>{tier.subscribersCount || 0} members</span>
                          <span className="text-[#A1A1AA] font-normal">• ${tierMonthlyMRR.toLocaleString()}/mo</span>
                        </div>
                      </div>
                    </div>

                    {/* Unlocked Perks Tag Chips */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#A1A1AA]">
                        <span>Included Perks &amp; Rewards ({tier.benefits.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tier.benefits.map((b, i) => (
                          <span
                            key={i}
                            className="text-[10px] sm:text-[11px] font-semibold text-[#18181B] bg-[#FFF9FC] px-2.5 py-1 rounded-xl border border-[#F3DCE8] inline-flex items-center gap-1.5"
                          >
                            <CheckCircle2 size={12} className="text-[#EC4899] shrink-0" />
                            <span>{b}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Welcome message preview */}
                    {tier.welcomeMessage && (
                      <div className="p-2.5 rounded-xl bg-pink-50/40 border border-pink-100 text-[10px] sm:text-[11px] text-[#71717A] flex items-start gap-2">
                        <MessageSquare size={13} className="text-[#EC4899] shrink-0 mt-0.5" />
                        <p className="italic">
                          <strong className="not-italic text-[#18181B] font-bold">New Member Note:</strong> &ldquo;{tier.welcomeMessage}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Actions Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#F3DCE8]">
                      {/* Left: Reorder & Share */}
                      <div className="flex items-center gap-1">
                        <button
                          disabled={index === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            reorderTiers(index, index - 1);
                          }}
                          title="Move Tier Up"
                          className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF9FC] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors border border-[#F3DCE8]"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          disabled={index === filteredTiers.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            reorderTiers(index, index + 1);
                          }}
                          title="Move Tier Down"
                          className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF9FC] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors border border-[#F3DCE8]"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyShareLink(tier);
                          }}
                          title="Copy Direct Checkout Link"
                          className="p-1.5 rounded-lg text-[#71717A] hover:text-[#BE185D] hover:bg-[#FFF1F7] cursor-pointer transition-colors border border-[#F3DCE8] inline-flex items-center gap-1 text-xs font-bold px-2 sm:px-2.5 ml-1"
                        >
                          {copiedTierId === tier.id ? <CheckCheck size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          <span className="hidden sm:inline">Share Link</span>
                        </button>
                      </div>

                      {/* Right: Edit, Status Toggle, Delete */}
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Pencil size={13} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(tier);
                          }}
                          className="cursor-pointer"
                        >
                          Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTierStatus(tier.id);
                            showToast(
                              `Tier "${tier.name}" ${tier.status === 'active' ? 'deactivated' : 'activated'}.`,
                              'info'
                            );
                          }}
                          className="text-xs font-bold cursor-pointer"
                        >
                          {tier.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTierToDelete(tier);
                          }}
                          title="Delete Tier"
                          className="p-2 rounded-xl text-[#71717A] hover:text-[#F43F5E] hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live Profile Device Frame Preview */}
        <div className="space-y-4 lg:sticky lg:top-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#A1A1AA]">Live Fan View</h4>
              <p className="text-[10px] text-[#71717A] font-medium">Public profile tier preview</p>
            </div>
            {/* Monthly / Annual Toggle */}
            <div className="flex items-center bg-[#FFF1F7] p-0.5 rounded-xl border border-[#FBCFE8] text-[10px] font-bold">
              <button
                onClick={() => setPreviewBillingCycle('monthly')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  previewBillingCycle === 'monthly'
                    ? 'bg-[#EC4899] text-white shadow-2xs'
                    : 'text-[#BE185D] hover:text-[#18181B]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPreviewBillingCycle('annual')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  previewBillingCycle === 'annual'
                    ? 'bg-[#EC4899] text-white shadow-2xs'
                    : 'text-[#BE185D] hover:text-[#18181B]'
                }`}
              >
                Annual -20%
              </button>
            </div>
          </div>

          {/* Interactive Device / Card Preview Container */}
          <div className="bg-gradient-to-tr from-[#FFF1F7] via-white to-[#FFF9FC] border-2 border-dashed border-[#F3DCE8] p-4 sm:p-5 rounded-2xl sm:rounded-[28px] space-y-4 shadow-sm">
            
            {/* Creator Header Profile Card Mockup */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#F3DCE8]">
              <Avatar
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                alt={user?.fullName || 'Sarah Jenkins'}
                size="md"
                isVerified
              />
              <div className="min-w-0">
                <p className="text-xs font-black text-[#18181B] truncate">{user?.fullName || 'Sarah Jenkins'}</p>
                <p className="text-[10px] text-[#BE185D] font-bold">@{user?.username || 'sarahdesign'}</p>
              </div>
            </div>

            {/* Render Selected Preview Tier */}
            {previewTier ? (
              <div className={`p-4 sm:p-5 rounded-2xl relative overflow-hidden bg-white border transition-all ${
                previewTier.popular
                  ? 'border-[#EC4899] shadow-lg shadow-pink-500/10 ring-1 ring-[#EC4899]'
                  : 'border-[#F3DCE8] shadow-sm'
              }`}>
                {previewTier.popular && (
                  <div className="absolute right-0 top-0 bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white text-[8px] font-black px-2.5 py-0.5 rounded-bl-xl uppercase tracking-wider shadow-2xs">
                    ★ Popular Choice
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Meta = TIER_ICONS[previewTier.icon || 'zap'] || TIER_ICONS.zap;
                      const Icon = Meta.icon;
                      return (
                        <div className={`w-7 h-7 rounded-lg ${Meta.bg} ${Meta.color} flex items-center justify-center shrink-0`}>
                          <Icon size={14} />
                        </div>
                      );
                    })()}
                    <span className="text-[9px] uppercase tracking-wider text-[#EC4899] font-black truncate">
                      {previewTier.category || 'Membership Pass'}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-[#18181B] tracking-tight">
                    {previewTier.name}
                  </h4>
                  <p className="text-xs text-[#71717A] font-medium line-clamp-2 leading-relaxed">
                    {previewTier.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-3 pb-2 border-b border-[#F3DCE8]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#18181B] tracking-tight">
                      {previewBillingCycle === 'monthly'
                        ? `$${previewTier.priceMonthly.toFixed(2)}`
                        : `$${(previewTier.priceAnnual || previewTier.priceMonthly * 9.6).toFixed(2)}`}
                    </span>
                    <span className="text-xs font-bold text-[#71717A]">
                      {previewBillingCycle === 'monthly' ? '/ month' : '/ year'}
                    </span>
                  </div>
                  {previewBillingCycle === 'annual' && (
                    <span className="text-[10px] font-black text-emerald-600">
                      ★ Includes 20% annual savings discount
                    </span>
                  )}
                </div>

                {/* Perks Checklist */}
                <div className="space-y-2 pt-3">
                  <p className="text-[9px] text-[#A1A1AA] uppercase tracking-wider font-black">Everything in this pass:</p>
                  <div className="space-y-1.5 max-h-36 sm:max-h-40 overflow-y-auto pr-1">
                    {previewTier.benefits.map((b, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#18181B] font-semibold">
                        <CheckCircle2 size={13} className="text-[#EC4899] shrink-0 mt-0.5" />
                        <span className="leading-tight">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscribe Button */}
                <button className="w-full mt-4 py-2.5 text-center text-xs font-black text-white gradient-btn rounded-xl shadow-md shadow-pink-500/20 active:scale-98 transition-all cursor-pointer">
                  Subscribe &amp; Join Tier
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#71717A] text-center py-6 font-medium">
                No tier selected for preview.
              </p>
            )}

            {/* Tier Switcher Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[9px] uppercase tracking-wider text-[#A1A1AA] font-black block">
                Preview Tier Switcher:
              </span>
              <div className="flex flex-wrap gap-1">
                {tiers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedPreviewTierId(t.id)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      previewTier?.id === t.id
                        ? 'bg-[#EC4899] text-white shadow-2xs'
                        : 'bg-white border border-[#F3DCE8] text-[#71717A] hover:text-[#18181B]'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. VISUAL SETUP & EDIT MODAL (FULLY RESPONSIVE FLUID BOTTOM SHEET / MODAL) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-t-[32px] sm:rounded-3xl border border-[#F3DCE8] shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden transform transition-all animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator Bar */}
            <div className="sm:hidden w-12 h-1.5 bg-[#E4E4E7] rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

            {/* Modal Top Header (Pinned) */}
            <div className="flex items-center justify-between px-5 sm:px-6 pt-3 sm:pt-5 pb-3 border-b border-[#F3DCE8] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#BE185D] text-white flex items-center justify-center font-bold shadow-md shadow-pink-500/20 shrink-0">
                  <Layers size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-sm sm:text-base text-[#18181B] truncate">
                    {editingTier ? `Edit: ${editingTier.name}` : 'Create Membership Package'}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#71717A] font-medium truncate">
                    Configure tier branding, price points, and member perks.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF9FC] cursor-pointer shrink-0 ml-2"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stepped Tab Navigation (Segmented Pill Control) */}
            <div className="px-4 sm:px-6 pt-3 pb-2 bg-[#FFF9FC]/80 border-b border-[#F3DCE8] shrink-0">
              <div className="bg-[#FCE7F3]/70 p-1 rounded-2xl flex items-center gap-1">
                {[
                  { id: 'essentials', icon: Tag, label: 'Identity', fullLabel: '1. Identity & Icon' },
                  { id: 'pricing', icon: DollarSign, label: 'Pricing', fullLabel: '2. Pricing & Cap' },
                  { id: 'perks', icon: Sparkles, label: 'Perks', fullLabel: '3. Perks & Rewards' },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = modalTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setModalTab(tab.id as any)}
                      className={`flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none text-center ${
                        isActive
                          ? 'bg-white text-[#BE185D] shadow-xs font-black'
                          : 'text-[#71717A] hover:text-[#18181B] hover:bg-white/40'
                      }`}
                    >
                      <Icon size={14} className={isActive ? 'text-[#EC4899]' : 'text-[#A1A1AA] shrink-0'} />
                      <span className="hidden sm:inline">{tab.fullLabel}</span>
                      <span className="sm:hidden">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Content Area (Scrollable) */}
            <form onSubmit={handleSaveTier} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 text-xs font-semibold">
                
                {/* TAB 1: ESSENTIALS */}
                {modalTab === 'essentials' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Tier Name */}
                    <div className="space-y-1">
                      <label className="block text-[#71717A] font-bold">Tier Title / Package Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. VIP Inner Circle, Pro Designer Pass"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                      />
                    </div>

                    {/* Icon Selector Grid */}
                    <div className="space-y-1.5">
                      <label className="block text-[#71717A] font-bold">Choose Premium Tier Icon</label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
                        {Object.entries(TIER_ICONS).map(([key, meta]) => {
                          const Icon = meta.icon;
                          const isSelected = formIcon === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setFormIcon(key)}
                              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                                isSelected
                                  ? 'border-[#EC4899] bg-[#FFF1F7] text-[#BE185D] ring-1 ring-[#EC4899] shadow-2xs'
                                  : 'border-[#F3DCE8] text-[#71717A] hover:border-[#EC4899]/50 hover:bg-[#FFF9FC]'
                              }`}
                            >
                              <Icon size={16} className={meta.color} />
                              <span className="text-[9px] sm:text-[10px] font-bold truncate max-w-full">{meta.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category Tag & Color */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[#71717A] font-bold">Package Category Tag</label>
                        <input
                          type="text"
                          placeholder="e.g. Community, Masterclass, Mentorship"
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[#71717A] font-bold">Color Accent Theme</label>
                        <select
                          value={formColor}
                          onChange={(e) => setFormColor(e.target.value)}
                          className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium cursor-pointer"
                        >
                          <option value="pink">Neon Pink (Primary)</option>
                          <option value="emerald">Emerald Green</option>
                          <option value="purple">Royal Purple</option>
                          <option value="amber">Golden Amber</option>
                          <option value="blue">Ocean Blue</option>
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="block text-[#71717A] font-bold">Tagline &amp; Description</label>
                      <textarea
                        rows={2}
                        placeholder="Briefly describe what subscribers unlock and who this package is for..."
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium resize-none"
                      />
                    </div>

                    {/* Popular Highlight Card */}
                    <div 
                      onClick={() => setFormPopular(!formPopular)}
                      className="p-3 rounded-2xl bg-[#FFF9FC] border border-[#F3DCE8] hover:border-[#EC4899]/50 transition-all cursor-pointer flex items-center justify-between gap-3 select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-pink-100/80 text-[#EC4899] flex items-center justify-center shrink-0">
                          <Sparkles size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-[#18181B] truncate">Highlight as &quot;Most Popular&quot;</p>
                          <p className="text-[10px] text-[#71717A] font-medium truncate">Displays glowing badge &amp; highlighted card on profile</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formPopular}
                        onChange={(e) => setFormPopular(e.target.checked)}
                        className="accent-[#EC4899] w-4 h-4 cursor-pointer shrink-0"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: PRICING & LIMITS */}
                {modalTab === 'pricing' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Monthly Price */}
                      <div className="space-y-1">
                        <label className="block text-[#71717A] font-bold">Monthly Price ($ USD) *</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] font-bold">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="1"
                            required
                            placeholder="15.00"
                            value={formPriceMonthly}
                            onChange={(e) => setFormPriceMonthly(e.target.value)}
                            className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl pl-8 pr-3 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                          />
                        </div>
                      </div>

                      {/* Annual Price */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[#71717A] font-bold">Annual Price ($ USD)</label>
                          <button
                            type="button"
                            onClick={handleAutoAnnualDiscount}
                            className="text-[10px] text-[#EC4899] hover:underline font-bold cursor-pointer"
                          >
                            Auto -20% Discount
                          </button>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] font-bold">$</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="144.00"
                            value={formPriceAnnual}
                            onChange={(e) => setFormPriceAnnual(e.target.value)}
                            className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl pl-8 pr-3 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Member Cap Limit */}
                    <div className="p-3.5 rounded-2xl bg-[#FFF9FC] border border-[#F3DCE8] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[#18181B] font-bold">Member Limit Cap (Optional)</label>
                        <span className="text-[10px] text-[#A1A1AA] font-bold">Leave blank for unlimited</span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 50 VIP students"
                        value={formMemberLimit}
                        onChange={(e) => setFormMemberLimit(e.target.value)}
                        className="w-full bg-white border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                      />
                      <p className="text-[10px] text-[#71717A] font-medium">
                        Creates urgency and exclusivity for high-touch tiers with capped capacity.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 3: PERKS & DELIVERY */}
                {modalTab === 'perks' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Add Custom Perk Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[#71717A] font-bold">Add Custom Perk / Reward *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type a custom perk and press Add..."
                          value={formPerkInput}
                          onChange={(e) => setFormPerkInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddPerk(formPerkInput);
                            }
                          }}
                          className="flex-1 bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddPerk(formPerkInput)}
                          className="cursor-pointer shrink-0"
                        >
                          + Add
                        </Button>
                      </div>
                    </div>

                    {/* Categorized Suggestions Grid */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] text-[#A1A1AA] font-black uppercase tracking-wider block">
                        Quick Suggestions (Click to Add):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {PERK_CATEGORIES.map((cat) => (
                          <div key={cat.name} className="p-3 rounded-2xl bg-[#FFF9FC] border border-[#F3DCE8] space-y-1.5 flex flex-col justify-between">
                            <span className="text-[10px] font-black text-[#BE185D] uppercase tracking-wider block">
                              {cat.name}
                            </span>
                            <div className="flex flex-col gap-1">
                              {cat.perks.map((p) => {
                                const isAdded = formBenefits.includes(p);
                                return (
                                  <button
                                    key={p}
                                    type="button"
                                    disabled={isAdded}
                                    onClick={() => handleAddPerk(p)}
                                    className={`text-[10px] font-bold p-1.5 rounded-lg text-left transition-all flex items-start gap-1.5 cursor-pointer ${
                                      isAdded
                                        ? 'bg-pink-100/40 text-[#BE185D] opacity-60 cursor-not-allowed'
                                        : 'bg-white hover:bg-[#FFF1F7] text-[#52525B] hover:text-[#18181B] border border-[#F3DCE8]/80 shadow-2xs'
                                    }`}
                                  >
                                    <span className="text-[#EC4899] font-black shrink-0">{isAdded ? '✓' : '+'}</span>
                                    <span className="leading-tight line-clamp-2">{p}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Added Perks Badges */}
                    <div className="pt-2 border-t border-[#F3DCE8] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#A1A1AA] font-black uppercase tracking-wider">
                          Selected Perks for this Pass ({formBenefits.length})
                        </span>
                        {formBenefits.length === 0 && (
                          <span className="text-[10px] text-rose-600 font-bold">At least 1 perk required</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {formBenefits.map((b, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-bold text-[#BE185D] bg-[#FCE7F3] px-3 py-1 rounded-full border border-[#FBCFE8] flex items-center gap-1.5 shadow-2xs"
                          >
                            <CheckCircle2 size={12} className="shrink-0" />
                            <span>{b}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePerk(idx)}
                              className="hover:text-red-700 font-black ml-1 cursor-pointer text-xs"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Welcome Message */}
                    <div className="pt-2 border-t border-[#F3DCE8] space-y-1">
                      <label className="block text-[#71717A] font-bold">Automated Welcome Note for New Subscribers</label>
                      <input
                        type="text"
                        placeholder="e.g. Welcome to the Inner Circle! Check your DMs for onboarding instructions..."
                        value={formWelcomeMsg}
                        onChange={(e) => setFormWelcomeMsg(e.target.value)}
                        className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls (Pinned) */}
              <div className="shrink-0 px-4 sm:px-6 py-3.5 border-t border-[#F3DCE8] bg-[#FFF9FC]/90 backdrop-blur-md flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {modalTab !== 'essentials' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (modalTab === 'perks') setModalTab('pricing');
                        else if (modalTab === 'pricing') setModalTab('essentials');
                      }}
                    >
                      Back
                    </Button>
                  )}
                  {modalTab !== 'perks' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (modalTab === 'essentials') setModalTab('pricing');
                        else if (modalTab === 'pricing') setModalTab('perks');
                      }}
                      className="text-xs font-bold"
                    >
                      Next Step →
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md">
                    {editingTier ? 'Save Changes' : 'Publish Package'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DELETE CONFIRMATION MODAL (FULLY RESPONSIVE)                           */}
      {/* ========================================================================= */}
      {tierToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs"
          onClick={() => setTierToDelete(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 border border-[#F3DCE8] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden w-12 h-1.5 bg-[#E4E4E7] rounded-full mx-auto -mt-1 mb-2" />

            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#F43F5E] flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
              <ShieldAlert size={24} />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-[#18181B]">Delete Membership Tier?</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Are you sure you want to delete <strong className="text-[#18181B]">{tierToDelete.name}</strong>?
                {tierToDelete.subscribersCount && tierToDelete.subscribersCount > 0 ? (
                  <span className="block mt-1 text-rose-600 font-bold">
                    Warning: This tier currently has {tierToDelete.subscribersCount} active paying subscribers.
                  </span>
                ) : (
                  ' This action will permanently remove the package from your public profile.'
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <Button variant="outline" size="sm" onClick={() => setTierToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleConfirmDelete}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
