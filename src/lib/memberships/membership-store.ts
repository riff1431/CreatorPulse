'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CreatorTier {
  id: string;
  creatorId: string;
  name: string;
  priceMonthly: number;
  priceAnnual?: number;
  description: string;
  benefits: string[];
  subscribersCount?: number;
  status: 'active' | 'inactive';
  popular?: boolean;
  colorBadge?: string;
  icon?: string;
  category?: string;
  memberLimit?: number;
  welcomeMessage?: string;
  createdAt?: string;
}

const STORAGE_PREFIX = 'creatorpulse_creator_tiers_';

export const INITIAL_CREATOR_TIERS: Record<string, CreatorTier[]> = {
  'user-creator-1': [
    {
      id: 'plan-starter-1',
      creatorId: 'user-creator-1',
      name: 'Starter Community',
      priceMonthly: 5.00,
      priceAnnual: 48.00,
      description: 'Access to public post updates & general community lounge.',
      benefits: ['Access to Starter Posts', 'Community Chat Threads', 'Weekly Q&A Access'],
      subscribersCount: 420,
      status: 'active',
      popular: false,
      colorBadge: 'emerald',
      icon: 'star',
      category: 'Community',
      welcomeMessage: 'Welcome to the Starter Community! Check out our introductory threads in the feed.'
    },
    {
      id: 'plan-premium-1',
      creatorId: 'user-creator-1',
      name: 'Pro Designer Tier',
      priceMonthly: 15.00,
      priceAnnual: 144.00,
      description: 'Full Figma UI Kits, Design System Tokens, and Video Tutorials.',
      benefits: ['All Starter Benefits', '40+ Figma Template UI Kits', 'Exclusive Design Video Masterclasses', 'Source File Figma Downloads'],
      subscribersCount: 320,
      status: 'active',
      popular: true,
      colorBadge: 'pink',
      icon: 'zap',
      category: 'Masterclass',
      welcomeMessage: 'Welcome to Pro Designer! Your VIP UI kit downloads are unlocked on the masterclass tab.'
    },
    {
      id: 'plan-vip-1',
      creatorId: 'user-creator-1',
      name: 'VIP Inner Circle',
      priceMonthly: 30.00,
      priceAnnual: 288.00,
      description: 'Direct 1-on-1 Portfolio Reviews and Private Discord Channel.',
      benefits: ['All Pro Benefits', 'Direct 1-on-1 DM Thread', 'Monthly 30-min Portfolio Review Call', 'Priority Feature Feedback'],
      subscribersCount: 100,
      status: 'active',
      popular: false,
      colorBadge: 'purple',
      icon: 'crown',
      category: '1-on-1 Mentorship',
      memberLimit: 150,
      welcomeMessage: 'Welcome to the VIP Inner Circle! You now have direct access to schedule your monthly review call.'
    }
  ]
};

export const getStoredCreatorTiers = (creatorId: string): CreatorTier[] => {
  if (typeof window === 'undefined') {
    return INITIAL_CREATOR_TIERS[creatorId] || INITIAL_CREATOR_TIERS['user-creator-1'];
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${creatorId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read creator tiers from storage', e);
  }
  return INITIAL_CREATOR_TIERS[creatorId] || INITIAL_CREATOR_TIERS['user-creator-1'];
};

export const saveStoredCreatorTiers = (creatorId: string, tiers: CreatorTier[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${creatorId}`, JSON.stringify(tiers));
    window.dispatchEvent(
      new CustomEvent('creatorpulse_memberships_updated', {
        detail: { creatorId, tiers }
      })
    );
  } catch (e) {
    console.error('Failed to save creator tiers to storage', e);
  }
};

export const calculateTierMetrics = (tiers: CreatorTier[]) => {
  const activeTiers = tiers.filter((t) => t.status === 'active');
  const totalSubscribers = tiers.reduce((acc, t) => acc + (t.subscribersCount || 0), 0);
  const monthlyRecurringRevenue = tiers.reduce((acc, t) => {
    if (t.status !== 'active') return acc;
    return acc + (t.subscribersCount || 0) * t.priceMonthly;
  }, 0);
  const averagePrice = activeTiers.length > 0
    ? activeTiers.reduce((acc, t) => acc + t.priceMonthly, 0) / activeTiers.length
    : 0;

  return {
    activeTiersCount: activeTiers.length,
    totalTiersCount: tiers.length,
    totalSubscribers,
    monthlyRecurringRevenue,
    averagePrice
  };
};

export const useCreatorMemberships = (creatorId: string = 'user-creator-1') => {
  const [tiers, setTiers] = useState<CreatorTier[]>(() => getStoredCreatorTiers(creatorId));

  useEffect(() => {
    setTiers(getStoredCreatorTiers(creatorId));

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ creatorId: string; tiers: CreatorTier[] }>;
      if (customEvent.detail && customEvent.detail.creatorId === creatorId) {
        setTiers(customEvent.detail.tiers);
      } else {
        setTiers(getStoredCreatorTiers(creatorId));
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === `${STORAGE_PREFIX}${creatorId}`) {
        setTiers(getStoredCreatorTiers(creatorId));
      }
    };

    window.addEventListener('creatorpulse_memberships_updated', handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('creatorpulse_memberships_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [creatorId]);

  const addTier = useCallback((newTierData: Omit<CreatorTier, 'id' | 'creatorId' | 'createdAt'>) => {
    const id = `tier-${Date.now()}`;
    const newTier: CreatorTier = {
      ...newTierData,
      id,
      creatorId,
      subscribersCount: 0,
      createdAt: new Date().toISOString()
    };
    const updated = [newTier, ...tiers];
    setTiers(updated);
    saveStoredCreatorTiers(creatorId, updated);
    return newTier;
  }, [creatorId, tiers]);

  const updateTier = useCallback((tierId: string, updates: Partial<CreatorTier>) => {
    const updated = tiers.map((t) => (t.id === tierId ? { ...t, ...updates } : t));
    setTiers(updated);
    saveStoredCreatorTiers(creatorId, updated);
  }, [creatorId, tiers]);

  const toggleTierStatus = useCallback((tierId: string) => {
    const updated = tiers.map((t) => {
      if (t.id === tierId) {
        const nextStatus: 'active' | 'inactive' = t.status === 'active' ? 'inactive' : 'active';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTiers(updated);
    saveStoredCreatorTiers(creatorId, updated);
  }, [creatorId, tiers]);

  const deleteTier = useCallback((tierId: string) => {
    const updated = tiers.filter((t) => t.id !== tierId);
    setTiers(updated);
    saveStoredCreatorTiers(creatorId, updated);
  }, [creatorId, tiers]);

  const reorderTiers = useCallback((startIndex: number, endIndex: number) => {
    const next = Array.from(tiers);
    const [moved] = next.splice(startIndex, 1);
    next.splice(endIndex, 0, moved);
    setTiers(next);
    saveStoredCreatorTiers(creatorId, next);
  }, [creatorId, tiers]);

  const metrics = calculateTierMetrics(tiers);

  return {
    tiers,
    metrics,
    addTier,
    updateTier,
    toggleTierStatus,
    deleteTier,
    reorderTiers
  };
};
