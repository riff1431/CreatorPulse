'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Star, Search, DollarSign, RefreshCw, Users, 
  Sparkles, Layers, ShieldCheck, ArrowRight, Eye,
  CheckCircle2, Mail, ExternalLink, Filter
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/auth-context';
import { useCreatorMemberships } from '@/lib/memberships/membership-store';
import { getStoredSubscriptions, MemberSubscription } from '@/lib/memberships/entitlement-service';

export default function CreatorSubscribersPage() {
  const { user } = useAuth();
  const creatorId = user?.id || 'user-creator-1';
  const { tiers, metrics } = useCreatorMemberships(creatorId);

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [subscriptionsList, setSubscriptionsList] = useState<MemberSubscription[]>([]);

  useEffect(() => {
    const loadSubs = () => {
      const all = getStoredSubscriptions();
      const creatorSubs = all.filter((s) => s.creatorId === creatorId && s.status === 'active');
      setSubscriptionsList(creatorSubs);
    };
    loadSubs();
    window.addEventListener('creatorpulse_subscriptions_updated', loadSubs);
    window.addEventListener('storage', loadSubs);
    return () => {
      window.removeEventListener('creatorpulse_subscriptions_updated', loadSubs);
      window.removeEventListener('storage', loadSubs);
    };
  }, [creatorId]);

  // Combined active subscribers list
  const displaySubscribers = [
    ...subscriptionsList.map((s) => ({
      id: s.id,
      name: s.userName,
      username: s.userUsername,
      avatar: s.userAvatar,
      plan: s.tierName,
      price: `$${s.amount.toFixed(2)}/${s.billingCycle === 'annual' ? 'yr' : 'mo'}`,
      duration: s.billingCycle === 'annual' ? '12 months' : '1 month',
      autoRenew: s.autoRenew,
      renewalDate: new Date(s.currentPeriodEnd).toLocaleDateString(),
      totalPaid: `$${s.amount.toFixed(2)}`,
    })),
    { id: 'mock-1', name: 'Jordan Lee', username: 'jordanlee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', plan: 'VIP Inner Circle', price: '$30.00/mo', duration: '3 months', autoRenew: true, renewalDate: '2026-10-15', totalPaid: '$180.00' },
    { id: 'mock-2', name: 'Mia Wong', username: 'miawong', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', plan: 'Starter Community', price: '$5.00/mo', duration: '1 month', autoRenew: false, renewalDate: '2026-08-28', totalPaid: '$25.00' },
    { id: 'mock-3', name: 'David Miller', username: 'fitdavid', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', plan: 'Pro Designer Tier', price: '$15.00/mo', duration: '12 months', autoRenew: true, renewalDate: '2027-01-15', totalPaid: '$150.00' },
  ];

  const filtered = displaySubscribers.filter((s) => {
    if (tierFilter !== 'all' && s.plan !== tierFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.username.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="text-[#EC4899]" size={22} />
            <h1 className="text-xl font-black text-[#18181B] tracking-tight">Active Subscribers</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Manage your {metrics.totalSubscribers} active paying members and subscription tier entitlements.
          </p>
        </div>

        <Link href="/creator/memberships">
          <Button variant="outline" size="sm" leftIcon={<Layers size={14} />}>
            Manage Tier Packages
          </Button>
        </Link>
      </div>

      {/* KPI Highlight Strip */}
      <div className="bg-gradient-to-r from-[#FFF1F7] via-white to-[#FFF9FC] border border-[#F3DCE8] p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] border border-[#FBCFE8] flex items-center justify-center text-[#EC4899] font-black text-lg shadow-sm">
            {metrics.totalSubscribers}
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#18181B]">Total Active Subscribers</h3>
            <p className="text-xs text-[#71717A] mt-0.5 font-medium">
              Generating <strong className="text-emerald-600 font-extrabold">${metrics.monthlyRecurringRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}/mo</strong> in recurring MRR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="emerald" size="md">
            {metrics.activeTiersCount} Active Tiers Live
          </Badge>
        </div>
      </div>

      {/* Search & Tier Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#F3DCE8] shadow-xs">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
          <input
            type="text"
            placeholder="Search subscribers by name or handle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#71717A]" />
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium cursor-pointer"
          >
            <option value="all">All Tiers ({tiers.length})</option>
            {tiers.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name} (${t.priceMonthly}/mo)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subscribers Table */}
      <Card className="overflow-x-auto p-0 rounded-3xl border border-[#F3DCE8] shadow-xs">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] text-left">
              <th className="py-3.5 px-4 font-bold">Subscriber</th>
              <th className="py-3.5 px-4 font-bold">Tier Plan</th>
              <th className="py-3.5 px-4 font-bold">Price Point</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Auto-Renew</th>
              <th className="py-3.5 px-4 font-bold hidden md:table-cell">Renewal Date</th>
              <th className="py-3.5 px-4 font-bold text-right">Lifetime Paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3DCE8]/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#71717A] font-medium">
                  No subscribers match your search filters.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#FFF9FC]/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={s.avatar} alt={s.name} size="sm" />
                      <div>
                        <p className="font-bold text-[#18181B]">{s.name}</p>
                        <p className="text-[10px] text-[#71717A]">@{s.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={s.plan.includes('VIP') ? 'rose' : s.plan.includes('Pro') ? 'pink' : 'slate'} size="sm">
                      {s.plan}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-[#18181B] font-bold">{s.price}</td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className={`flex items-center gap-1 font-medium ${s.autoRenew ? 'text-emerald-600' : 'text-[#A1A1AA]'}`}>
                      <RefreshCw size={11} className={s.autoRenew ? 'animate-spin-slow' : ''} />
                      {s.autoRenew ? 'Auto' : 'Manual'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#71717A] hidden md:table-cell font-medium">{s.renewalDate}</td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-extrabold">{s.totalPaid}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
