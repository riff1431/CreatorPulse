'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Star, Wallet, Bookmark, Heart, Sparkles, 
  CreditCard, Compass, ShieldCheck, ChevronRight,
  Download, ArrowUpRight, CheckCircle2, Clock,
  Calendar, Layers, Filter, RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { useAuth } from '@/lib/auth/auth-context';
import { TipModal } from '../components/TipModal';
import { ProfileCompletionWidget } from '../components/ProfileCompletionWidget';
import { getStoredSubscriptions, MemberSubscription } from '@/lib/memberships/entitlement-service';

interface SubscribedCreator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  tierName: string;
  price: number;
  renewsInDays: number;
  status: 'active' | 'expiring' | 'paused';
  perks: string[];
}

const INITIAL_SUBSCRIPTIONS: SubscribedCreator[] = [
  {
    id: 'sub_1',
    name: 'Sarah Jenkins',
    username: 'sarahdesign',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    tierName: 'VIP Pro Designer Tier',
    price: 14.99,
    renewsInDays: 12,
    status: 'active',
    perks: ['4K Project Source Files', 'Priority DMs', 'Weekly Live Stream Access']
  },
  {
    id: 'sub_2',
    name: 'Marcus Vance',
    username: 'marcuscode',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    tierName: 'VIP Full-Stack Insider',
    price: 19.99,
    renewsInDays: 24,
    status: 'active',
    perks: ['GitHub Repo Access', 'Code Reviews', 'Discord VIP Role']
  }
];

const BILLING_INVOICES = [
  { id: 'INV-2026-881', date: 'Aug 01, 2026', creator: 'Sarah Jenkins', tier: 'VIP Pro Tier', amount: 14.99, status: 'Paid' },
  { id: 'INV-2026-752', date: 'Jul 15, 2026', creator: 'Marcus Vance', tier: 'VIP Full-Stack', amount: 19.99, status: 'Paid' },
  { id: 'INV-2026-640', date: 'Jul 01, 2026', creator: 'Sarah Jenkins', tier: 'VIP Pro Tier', amount: 14.99, status: 'Paid' },
];

export function MemberDashboardPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscribedCreator[]>(INITIAL_SUBSCRIPTIONS);
  const [selectedCreatorForTip, setSelectedCreatorForTip] = useState<SubscribedCreator | null>(null);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  useEffect(() => {
    const loadDynamicSubscriptions = () => {
      const stored = getStoredSubscriptions();
      const currentUserId = user?.id || 'user-member-1';
      const userSubs = stored.filter((s) => s.userId === currentUserId && s.status === 'active');
      if (userSubs.length > 0) {
        const formatted: SubscribedCreator[] = userSubs.map((s) => {
          const now = Date.now();
          const end = new Date(s.currentPeriodEnd).getTime();
          const daysLeft = Math.max(1, Math.round((end - now) / 86400000));
          return {
            id: s.id,
            name: s.creatorName,
            username: s.creatorUsername,
            avatar: s.creatorAvatar,
            tierName: s.tierName,
            price: s.amount,
            renewsInDays: daysLeft,
            status: 'active',
            perks: Object.entries(s.entitlements)
              .filter(([_, val]) => !!val)
              .map(([k]) => k.replace(/^can_/, '').replace(/^has_/, '').replace(/_/g, ' ')),
          };
        });
        setSubscriptions(formatted);
      } else {
        setSubscriptions(INITIAL_SUBSCRIPTIONS);
      }
    };

    loadDynamicSubscriptions();
    window.addEventListener('creatorpulse_subscriptions_updated', loadDynamicSubscriptions);
    window.addEventListener('storage', loadDynamicSubscriptions);
    return () => {
      window.removeEventListener('creatorpulse_subscriptions_updated', loadDynamicSubscriptions);
      window.removeEventListener('storage', loadDynamicSubscriptions);
    };
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-[#FFF9FC] dark:bg-[#0B0612] text-[#18181B] dark:text-[#FDF2F8] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 space-y-6 max-w-4xl mx-auto lg:mx-0 w-full pb-20 lg:pb-8">
          
          {/* Welcome Banner Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#FFF1F7] to-white dark:from-[#150D1E] dark:via-[#24152F] dark:to-[#150D1E] border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar 
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                alt={user?.fullName || 'Member'} 
                size="lg" 
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black text-[#18181B] dark:text-[#FDF2F8] tracking-tight">
                    Welcome back, {user?.fullName || 'Alex Vance'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                    Member
                  </span>
                </div>
                <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-1 font-medium">
                  Manage your active VIP passes, unlocked creator drops, and wallet deposits.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link href="/balance">
                <Button variant="outline" size="sm" leftIcon={<Wallet size={15} className="text-[#EC4899]" />}>
                  <span>$240.50 Balance</span>
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="primary" size="sm" leftIcon={<Compass size={15} />}>
                  <span>Find Creators</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Profile Completion Progress Card */}
          <ProfileCompletionWidget variant="card" />

          {/* Quick Member Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
            <div className="p-4 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[#71717A] dark:text-[#D4B8D0]">
                <span className="text-[11px] font-black uppercase tracking-wider">VIP Passes</span>
                <Star size={16} className="text-[#EC4899]" />
              </div>
              <p className="text-2xl font-black text-[#18181B] dark:text-[#FDF2F8]">
                {subscriptions.length} Active
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[#71717A] dark:text-[#D4B8D0]">
                <span className="text-[11px] font-black uppercase tracking-wider">Wallet</span>
                <Wallet size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-[#18181B] dark:text-[#FDF2F8]">
                $240.50
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[#71717A] dark:text-[#D4B8D0]">
                <span className="text-[11px] font-black uppercase tracking-wider">Saved Drops</span>
                <Bookmark size={16} className="text-[#EC4899]" />
              </div>
              <p className="text-2xl font-black text-[#18181B] dark:text-[#FDF2F8]">
                84
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[#71717A] dark:text-[#D4B8D0]">
                <span className="text-[11px] font-black uppercase tracking-wider">Liked Posts</span>
                <Heart size={16} className="text-[#F43F5E]" />
              </div>
              <p className="text-2xl font-black text-[#18181B] dark:text-[#FDF2F8]">
                342
              </p>
            </div>
          </div>

          {/* Subscribed Creators Passes */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-[#EC4899]" />
                <h2 className="text-base font-black text-[#18181B] dark:text-[#FDF2F8]">
                  My Active Memberships
                </h2>
              </div>
              <Link href="/explore" className="text-xs font-bold text-[#EC4899] hover:underline flex items-center gap-1">
                <span>Explore More</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map((sub) => (
                <div 
                  key={sub.id} 
                  className="p-5 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-xs space-y-4 hover:border-[#EC4899]/40 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar src={sub.avatar} alt={sub.name} size="md" isVerified />
                      <div>
                        <Link href={`/c/${sub.username}`} className="font-black text-sm text-[#18181B] dark:text-[#FDF2F8] group-hover:text-[#EC4899] transition-colors">
                          {sub.name}
                        </Link>
                        <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] font-semibold">
                          @{sub.username}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-pink-100 dark:bg-pink-950/60 text-[#BE185D] dark:text-[#F472B6] text-[10px] font-black">
                      ${sub.price}/mo
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                      <span>{sub.tierName}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">● Active</span>
                    </div>
                    <div className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] space-y-1">
                      {sub.perks.map((p, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 size={11} className="text-[#EC4899]" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#A1A1AA] flex items-center gap-1">
                      <Clock size={12} />
                      <span>Renews in {sub.renewsInDays} days</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCreatorForTip(sub);
                          setIsTipModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#FFF1F7] dark:bg-[#2D162B] text-[#BE185D] dark:text-[#F472B6] hover:bg-[#FCE7F3] text-xs font-bold transition-colors cursor-pointer"
                      >
                        Send Tip
                      </button>
                      <Link 
                        href={`/c/${sub.username}`}
                        className="px-3 py-1.5 rounded-xl bg-[#EC4899] text-white hover:bg-[#DB2777] text-xs font-bold transition-colors"
                      >
                        View Drops
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Billing Receipts & Invoices */}
          <div className="p-5 rounded-3xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-[#EC4899]" />
                <h3 className="text-base font-black text-[#18181B] dark:text-[#FDF2F8]">
                  Recent Subscription Invoices
                </h3>
              </div>
              <Link href="/balance" className="text-xs font-bold text-[#EC4899] hover:underline">
                View All Transactions
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#F3DCE8] dark:border-[#3A2A4C] text-[10px] font-black uppercase tracking-wider text-[#A1A1AA]">
                    <th className="pb-2.5">Invoice</th>
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Creator & Tier</th>
                    <th className="pb-2.5">Amount</th>
                    <th className="pb-2.5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3DCE8]/60 dark:divide-[#3A2A4C]/60 text-[#18181B] dark:text-[#FDF2F8]">
                  {BILLING_INVOICES.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#FFF9FC] dark:hover:bg-[#22152E]/50 transition-colors">
                      <td className="py-3 font-mono font-bold text-[#71717A] dark:text-[#D4B8D0]">{inv.id}</td>
                      <td className="py-3 font-semibold">{inv.date}</td>
                      <td className="py-3">
                        <div className="font-bold">{inv.creator}</div>
                        <div className="text-[10px] text-[#71717A] dark:text-[#D4B8D0]">{inv.tier}</div>
                      </td>
                      <td className="py-3 font-black text-[#EC4899]">${inv.amount.toFixed(2)}</td>
                      <td className="py-3 text-right">
                        <button className="px-2.5 py-1 rounded-xl bg-[#FFF1F7] dark:bg-[#2D162B] text-[#BE185D] dark:text-[#F472B6] hover:bg-[#FCE7F3] text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer">
                          <Download size={11} />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />

      {/* Tip Modal */}
      {selectedCreatorForTip && (
        <TipModal
          isOpen={isTipModalOpen}
          onClose={() => setIsTipModalOpen(false)}
          creatorName={selectedCreatorForTip.name}
          creatorHandle={selectedCreatorForTip.username}
          creatorAvatar={selectedCreatorForTip.avatar}
        />
      )}
    </div>
  );
}
