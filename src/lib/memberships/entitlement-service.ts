'use client';

import { CreatorTier, INITIAL_CREATOR_TIERS, getStoredCreatorTiers } from './membership-store';

export interface TierEntitlements {
  can_view_vip_posts: boolean;
  can_download_assets: boolean;
  can_direct_message: boolean;
  has_supporter_badge: boolean;
  can_book_call: boolean;
  can_access_discord: boolean;
  commercial_license: boolean;
}

export const DEFAULT_TIER_ENTITLEMENTS: Record<string, TierEntitlements> = {
  'Community': {
    can_view_vip_posts: true,
    can_download_assets: false,
    can_direct_message: false,
    has_supporter_badge: true,
    can_book_call: false,
    can_access_discord: true,
    commercial_license: false,
  },
  'Masterclass': {
    can_view_vip_posts: true,
    can_download_assets: true,
    can_direct_message: false,
    has_supporter_badge: true,
    can_book_call: false,
    can_access_discord: true,
    commercial_license: false,
  },
  '1-on-1 Mentorship': {
    can_view_vip_posts: true,
    can_download_assets: true,
    can_direct_message: true,
    has_supporter_badge: true,
    can_book_call: true,
    can_access_discord: true,
    commercial_license: true,
  },
};

export interface MemberSubscription {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  tierId: string;
  tierName: string;
  tierCategory: string;
  tierIcon: string;
  billingCycle: 'monthly' | 'annual';
  amount: number;
  currency: string;
  status: 'active' | 'in_grace' | 'past_due' | 'cancelled' | 'expired';
  entitlements: TierEntitlements;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
  createdAt: string;
}

const STORAGE_SUBSCRIPTIONS_KEY = 'creatorpulse_member_subscriptions';

// Initial Mock Subscriptions
const INITIAL_MOCK_SUBSCRIPTIONS: MemberSubscription[] = [
  {
    id: 'sub-user-demo-1',
    userId: 'user-member-1',
    userName: 'Alex Rivers',
    userUsername: 'alexrivers',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    creatorId: 'user-creator-1',
    creatorName: 'Sarah Jenkins',
    creatorUsername: 'sarahdesign',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    tierId: 'plan-premium-1',
    tierName: 'Pro Designer Tier',
    tierCategory: 'Masterclass',
    tierIcon: 'zap',
    billingCycle: 'monthly',
    amount: 15.00,
    currency: 'USD',
    status: 'active',
    entitlements: {
      can_view_vip_posts: true,
      can_download_assets: true,
      can_direct_message: false,
      has_supporter_badge: true,
      can_book_call: false,
      can_access_discord: true,
      commercial_license: false,
    },
    currentPeriodStart: new Date(Date.now() - 10 * 86400000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 20 * 86400000).toISOString(),
    autoRenew: true,
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  }
];

export function getStoredSubscriptions(): MemberSubscription[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_SUBSCRIPTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_SUBSCRIPTIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading stored subscriptions:', err);
  }
  return INITIAL_MOCK_SUBSCRIPTIONS;
}

export function saveStoredSubscriptions(subs: MemberSubscription[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SUBSCRIPTIONS_KEY, JSON.stringify(subs));
    window.dispatchEvent(new CustomEvent('creatorpulse_subscriptions_updated', { detail: subs }));
  } catch (err) {
    console.error('Error saving subscriptions:', err);
  }
}

/**
 * Resolves whether a user has an active subscription to a creator
 */
export function getUserSubscription(userId?: string, creatorId?: string): MemberSubscription | null {
  if (!userId || !creatorId) return null;
  const subs = getStoredSubscriptions();
  return subs.find((s) => s.userId === userId && s.creatorId === creatorId && s.status === 'active') || null;
}

/**
 * Checks whether a user possesses a specific entitlement facility for a given creator
 */
export function checkUserEntitlement(
  userId?: string,
  creatorId?: string,
  facility?: keyof TierEntitlements
): boolean {
  if (!userId || !creatorId || !facility) return false;
  // Creator always has full access to their own content
  if (userId === creatorId) return true;

  const sub = getUserSubscription(userId, creatorId);
  if (!sub || sub.status !== 'active') return false;

  return !!sub.entitlements[facility];
}

/**
 * Enrolls a user into a creator's membership package
 */
export function subscribeUserToTier(params: {
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar?: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar?: string;
  tierId: string;
  billingCycle: 'monthly' | 'annual';
}): { success: boolean; subscription?: MemberSubscription; message?: string } {
  const tiers = getStoredCreatorTiers(params.creatorId);
  const tier = tiers.find((t) => t.id === params.tierId);
  if (!tier) {
    return { success: false, message: 'Membership tier not found.' };
  }

  const category = tier.category || 'Community';
  const entitlements: TierEntitlements = DEFAULT_TIER_ENTITLEMENTS[category] || {
    can_view_vip_posts: true,
    can_download_assets: tier.priceMonthly >= 15,
    can_direct_message: tier.priceMonthly >= 30,
    has_supporter_badge: true,
    can_book_call: tier.priceMonthly >= 30,
    can_access_discord: true,
    commercial_license: tier.priceMonthly >= 30,
  };

  const amount = params.billingCycle === 'annual'
    ? (tier.priceAnnual || tier.priceMonthly * 9.6)
    : tier.priceMonthly;

  const currentPeriodEnd = new Date();
  if (params.billingCycle === 'annual') {
    currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
  } else {
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
  }

  const newSub: MemberSubscription = {
    id: `sub-${Date.now()}`,
    userId: params.userId,
    userName: params.userName,
    userUsername: params.userUsername,
    userAvatar: params.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    creatorId: params.creatorId,
    creatorName: params.creatorName,
    creatorUsername: params.creatorUsername,
    creatorAvatar: params.creatorAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    tierId: tier.id,
    tierName: tier.name,
    tierCategory: category,
    tierIcon: tier.icon || 'zap',
    billingCycle: params.billingCycle,
    amount,
    currency: 'USD',
    status: 'active',
    entitlements,
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: currentPeriodEnd.toISOString(),
    autoRenew: true,
    createdAt: new Date().toISOString(),
  };

  const allSubs = getStoredSubscriptions().filter(
    (s) => !(s.userId === params.userId && s.creatorId === params.creatorId)
  );
  allSubs.unshift(newSub);
  saveStoredSubscriptions(allSubs);

  return { success: true, subscription: newSub, message: `Successfully subscribed to ${tier.name}!` };
}

/**
 * Cancels or switches an active subscription
 */
export function cancelUserSubscription(subscriptionId: string): boolean {
  const subs = getStoredSubscriptions();
  const index = subs.findIndex((s) => s.id === subscriptionId);
  if (index === -1) return false;

  subs[index].status = 'cancelled';
  subs[index].autoRenew = false;
  saveStoredSubscriptions([...subs]);
  return true;
}

/**
 * Returns Advantages & Disadvantages Matrix across creator tiers
 */
export interface MatrixFeatureItem {
  key: string;
  name: string;
  category: string;
  tiers: Record<string, boolean | string>; // tierId -> isIncluded or string value
}

export function buildTierComparisonMatrix(tiers: CreatorTier[]): MatrixFeatureItem[] {
  const standardFeatures = [
    { key: 'vip_feed', name: 'Member-Only VIP Feed Drops', category: 'Content' },
    { key: 'supporter_badge', name: 'Supporter Profile & Comment Badge', category: 'Community' },
    { key: 'discord_lounge', name: 'Private Discord Community Lounge', category: 'Community' },
    { key: 'project_files', name: '4K Source Files, Code & Design Kits', category: 'Downloads' },
    { key: 'masterclasses', name: 'Video Masterclass Library Access', category: 'Content' },
    { key: 'direct_dms', name: 'Direct 1-on-1 Priority DM Hotline', category: 'Direct Access' },
    { key: 'monthly_call', name: 'Monthly 30-min Strategy / Review Call', category: 'Direct Access' },
    { key: 'commercial_license', name: 'Commercial Asset Use License', category: 'Perks' },
  ];

  return standardFeatures.map((feat) => {
    const tierMap: Record<string, boolean | string> = {};
    tiers.forEach((t) => {
      const cat = t.category || '';
      const price = t.priceMonthly;

      if (feat.key === 'vip_feed' || feat.key === 'supporter_badge' || feat.key === 'discord_lounge') {
        tierMap[t.id] = true;
      } else if (feat.key === 'project_files' || feat.key === 'masterclasses') {
        tierMap[t.id] = price >= 10 || cat === 'Masterclass' || cat === '1-on-1 Mentorship';
      } else if (feat.key === 'direct_dms' || feat.key === 'monthly_call' || feat.key === 'commercial_license') {
        tierMap[t.id] = price >= 25 || cat === '1-on-1 Mentorship';
      } else {
        tierMap[t.id] = false;
      }
    });

    return {
      key: feat.key,
      name: feat.name,
      category: feat.category,
      tiers: tierMap,
    };
  });
}
