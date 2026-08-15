'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Settings Schema Types ---
export interface SettingsField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  description?: string;
  options?: { label: string; value: string }[];
  defaultValue: any;
}

// --- Module Types ---
export type FeatureModuleCategory = 'content' | 'social' | 'monetization' | 'management';

export type FeatureModuleId =
  | 'reels'
  | 'messaging'
  | 'memberships'
  | 'comments'
  | 'creator_applications'
  | 'wallet';

export interface FeatureModule {
  id: FeatureModuleId;
  name: string;
  description: string;
  isEnabled: boolean;
  dependencies: FeatureModuleId[];
  settings: Record<string, any>;
  icon: string;
  category: FeatureModuleCategory;
  version: string;
  settingsSchema: SettingsField[];
  detailDescription: string;
  features: string[];
}

// --- Initial Module Definitions ---
export const INITIAL_FEATURE_MODULES: FeatureModule[] = [
  {
    id: 'reels',
    name: 'Shorts & Reels',
    description: 'Vertical video feed with interactions, audio background support, and monetization.',
    isEnabled: true,
    dependencies: [],
    settings: { maxVideoMB: 100, autoPlayFeed: true, enableDuets: false },
    icon: 'Film',
    category: 'content',
    version: '2.1.0',
    detailDescription:
      'The Shorts & Reels module powers the vertical video experience across your platform. Creators can upload short-form videos with background audio, text overlays, and effects. Fans interact through likes, comments, shares, and can discover content through an algorithmically-driven feed. Monetization is built in — creators earn through view-based payouts and tip prompts.',
    features: [
      'Vertical video upload with auto-transcoding',
      'Background audio and music library integration',
      'Algorithmic discovery feed',
      'View-based monetization tracking',
      'Duet and stitch capabilities',
      'Video analytics and performance metrics',
    ],
    settingsSchema: [
      {
        key: 'maxVideoMB',
        label: 'Maximum Video Size',
        type: 'number',
        description: 'Maximum upload size in megabytes per video file.',
        defaultValue: 100,
      },
      {
        key: 'autoPlayFeed',
        label: 'Auto-Play Feed',
        type: 'boolean',
        description: 'Automatically play videos as users scroll through the feed.',
        defaultValue: true,
      },
      {
        key: 'enableDuets',
        label: 'Enable Duets',
        type: 'boolean',
        description: 'Allow creators to create side-by-side duet videos with other creators.',
        defaultValue: false,
      },
    ],
  },
  {
    id: 'messaging',
    name: 'Direct Messaging',
    description: '1-on-1 private messaging and paywalled direct messages between fans and creators.',
    isEnabled: true,
    dependencies: [],
    settings: { allowPaywalledMessages: true, maxMessageLength: 500, enableReadReceipts: true },
    icon: 'MessageSquare',
    category: 'social',
    version: '1.4.0',
    detailDescription:
      'Direct Messaging enables private communication between fans and creators. Creators can set message pricing for paywalled DMs, creating a new revenue stream. The system supports text messages, media attachments, and real-time delivery with read receipts. All messages are end-to-end encrypted for privacy.',
    features: [
      'Real-time 1-on-1 messaging',
      'Paywalled DMs with custom pricing',
      'Media attachments (images, videos)',
      'Read receipts and online status',
      'Message request filtering',
      'Automated message moderation',
    ],
    settingsSchema: [
      {
        key: 'allowPaywalledMessages',
        label: 'Allow Paywalled Messages',
        type: 'boolean',
        description: 'Let creators charge fans for sending direct messages.',
        defaultValue: true,
      },
      {
        key: 'maxMessageLength',
        label: 'Max Message Length',
        type: 'number',
        description: 'Maximum number of characters per message.',
        defaultValue: 500,
      },
      {
        key: 'enableReadReceipts',
        label: 'Read Receipts',
        type: 'boolean',
        description: 'Show read receipts to indicate when messages have been seen.',
        defaultValue: true,
      },
    ],
  },
  {
    id: 'memberships',
    name: 'VIP Memberships',
    description: 'Creator tier subscriptions, recurring billing, and subscriber exclusive posts.',
    isEnabled: true,
    dependencies: ['wallet'],
    settings: { minTierPrice: 1.0, maxTiers: 5, enableTrialPeriod: false },
    icon: 'Star',
    category: 'monetization',
    version: '3.0.0',
    detailDescription:
      'VIP Memberships is the core monetization engine allowing creators to offer tiered subscription plans. Fans subscribe to different tiers to unlock exclusive content, early access, and special perks. Recurring billing is handled automatically with support for multiple payment providers. Requires the Virtual Wallet module for payout processing.',
    features: [
      'Multi-tier subscription plans',
      'Recurring billing with auto-renewal',
      'Subscriber-only content gating',
      'Free trial period support',
      'Subscription analytics dashboard',
      'Automated payment failure recovery',
    ],
    settingsSchema: [
      {
        key: 'minTierPrice',
        label: 'Minimum Tier Price',
        type: 'number',
        description: 'Minimum price in USD that creators can set for a subscription tier.',
        defaultValue: 1.0,
      },
      {
        key: 'maxTiers',
        label: 'Maximum Tiers',
        type: 'number',
        description: 'Maximum number of subscription tiers a creator can create.',
        defaultValue: 5,
      },
      {
        key: 'enableTrialPeriod',
        label: 'Enable Trial Period',
        type: 'boolean',
        description: 'Allow creators to offer free trial periods on their subscription tiers.',
        defaultValue: false,
      },
    ],
  },
  {
    id: 'comments',
    name: 'Post & Reel Comments',
    description: 'Interactive comment sections on public and subscriber posts.',
    isEnabled: true,
    dependencies: [],
    settings: { allowGifs: true, enableThreadedReplies: true, moderationLevel: 'standard' },
    icon: 'MessageCircle',
    category: 'social',
    version: '1.2.0',
    detailDescription:
      'The Post & Reel Comments module enables rich, interactive comment sections across all content types. Users can leave text comments, react with emojis, and participate in threaded discussions. Built-in moderation tools help creators manage their community with automated filtering, keyword blocking, and manual approval workflows.',
    features: [
      'Threaded comment replies',
      'GIF and emoji reactions',
      'Keyword-based auto-moderation',
      'Creator comment pinning',
      'Spam and toxicity detection',
      'Bulk moderation tools',
    ],
    settingsSchema: [
      {
        key: 'allowGifs',
        label: 'Allow GIF Reactions',
        type: 'boolean',
        description: 'Enable users to post GIF images in comments.',
        defaultValue: true,
      },
      {
        key: 'enableThreadedReplies',
        label: 'Threaded Replies',
        type: 'boolean',
        description: 'Allow nested reply threads under comments.',
        defaultValue: true,
      },
      {
        key: 'moderationLevel',
        label: 'Moderation Level',
        type: 'select',
        description: 'Set the automatic moderation sensitivity for comments.',
        options: [
          { label: 'Relaxed', value: 'relaxed' },
          { label: 'Standard', value: 'standard' },
          { label: 'Strict', value: 'strict' },
        ],
        defaultValue: 'standard',
      },
    ],
  },
  {
    id: 'creator_applications',
    name: 'Creator Onboarding',
    description: 'Fan-to-Creator upgrade application process and review pipeline.',
    isEnabled: true,
    dependencies: [],
    settings: { autoApprove: false, requireIdVerification: true, applicationCooldown: 30 },
    icon: 'FileText',
    category: 'management',
    version: '1.1.0',
    detailDescription:
      'Creator Onboarding manages the full lifecycle of fan-to-creator upgrade applications. When enabled, fans can submit applications to become creators on the platform. Admins review applications through a streamlined pipeline with configurable auto-approval rules, identity verification requirements, and customizable application forms.',
    features: [
      'Customizable application forms',
      'Admin review pipeline with approve/reject workflow',
      'Optional auto-approval rules',
      'Identity verification integration',
      'Application status notifications',
      'Cooldown period between re-applications',
    ],
    settingsSchema: [
      {
        key: 'autoApprove',
        label: 'Auto-Approve Applications',
        type: 'boolean',
        description: 'Automatically approve all creator applications without admin review.',
        defaultValue: false,
      },
      {
        key: 'requireIdVerification',
        label: 'Require ID Verification',
        type: 'boolean',
        description: 'Require government ID verification as part of the application process.',
        defaultValue: true,
      },
      {
        key: 'applicationCooldown',
        label: 'Re-Application Cooldown (days)',
        type: 'number',
        description: 'Days a user must wait before re-applying after a rejection.',
        defaultValue: 30,
      },
    ],
  },
  {
    id: 'wallet',
    name: 'Virtual Wallet & Payouts',
    description: 'User balances, wallet top-ups, tip support, and creator payout requests.',
    isEnabled: true,
    dependencies: [],
    settings: { minPayout: 50.0, enableTipping: true, payoutSchedule: 'weekly' },
    icon: 'Wallet',
    category: 'monetization',
    version: '2.3.0',
    detailDescription:
      'Virtual Wallet & Payouts is the financial backbone of the platform. It manages user balances, top-up transactions, tip processing, and creator payout workflows. Creators accumulate earnings from subscriptions, tips, and paywalled content, then request payouts on configurable schedules. The system integrates with multiple payment processors for global coverage.',
    features: [
      'User wallet with top-up and balance tracking',
      'Creator earnings dashboard',
      'Configurable payout schedules (weekly, bi-weekly, monthly)',
      'Tip support with custom amounts',
      'Multi-currency and payment processor support',
      'Transaction history and reporting',
    ],
    settingsSchema: [
      {
        key: 'minPayout',
        label: 'Minimum Payout Amount',
        type: 'number',
        description: 'Minimum balance in USD required for creators to request a payout.',
        defaultValue: 50.0,
      },
      {
        key: 'enableTipping',
        label: 'Enable Tipping',
        type: 'boolean',
        description: 'Allow fans to send tips to creators.',
        defaultValue: true,
      },
      {
        key: 'payoutSchedule',
        label: 'Payout Schedule',
        type: 'select',
        description: 'Default payout frequency for creator earnings.',
        options: [
          { label: 'Weekly', value: 'weekly' },
          { label: 'Bi-Weekly', value: 'biweekly' },
          { label: 'Monthly', value: 'monthly' },
        ],
        defaultValue: 'weekly',
      },
    ],
  },
];

// --- Category metadata for UI ---
export const MODULE_CATEGORIES: Record<FeatureModuleCategory, { label: string; color: string }> = {
  content: { label: 'Content', color: '#6366f1' },
  social: { label: 'Social', color: '#06b6d4' },
  monetization: { label: 'Monetization', color: '#f59e0b' },
  management: { label: 'Management', color: '#10b981' },
};

// --- Context ---
interface FeatureModuleContextType {
  modules: FeatureModule[];
  isModuleEnabled: (id: FeatureModuleId) => boolean;
  toggleModule: (id: FeatureModuleId, targetState?: boolean) => { success: boolean; affectedModules?: string[]; message?: string };
  updateModuleSettings: (id: FeatureModuleId, newSettings: Record<string, any>) => Promise<void>;
  resetToDefaults: () => void;
}

const FeatureModuleContext = createContext<FeatureModuleContextType | undefined>(undefined);
const STORAGE_KEY = 'creatorpulse_feature_modules';

export const FeatureModuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modules, setModules] = useState<FeatureModule[]>(INITIAL_FEATURE_MODULES);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved state with initial modules to pick up new fields
        const merged = INITIAL_FEATURE_MODULES.map((initial) => {
          const savedMod = parsed.find((s: any) => s.id === initial.id);
          if (savedMod) {
            return {
              ...initial,
              isEnabled: savedMod.isEnabled,
              settings: { ...initial.settings, ...savedMod.settings },
            };
          }
          return initial;
        });
        setModules(merged);
      } catch (e) {
        console.error('Failed to parse feature modules from local storage', e);
      }
    }

    const fetchModules = async () => {
      try {
        const res = await fetch('/api/admin/modules');
        if (res.ok) {
          const data = await res.json();
          if (data && data.modules && data.modules.length > 0) {
            // Merge API data with initial definitions to ensure new fields are present
            const merged = INITIAL_FEATURE_MODULES.map((initial) => {
              const apiMod = data.modules.find((m: any) => m.id === initial.id);
              if (apiMod) {
                return {
                  ...initial,
                  isEnabled: apiMod.isEnabled ?? initial.isEnabled,
                  settings: { ...initial.settings, ...(apiMod.settings || {}) },
                };
              }
              return initial;
            });
            setModules(merged);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          }
        }
      } catch (e) {
        // Fallback to local state
      }
    };

    fetchModules();
  }, []);

  const saveModules = (newModules: FeatureModule[]) => {
    setModules(newModules);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newModules));
    fetch('/api/admin/modules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modules: newModules }),
    }).catch((e) => console.error('Failed to sync feature modules to API', e));
  };

  const isModuleEnabled = (id: FeatureModuleId): boolean => {
    const mod = modules.find((m) => m.id === id);
    return mod ? mod.isEnabled : true;
  };

  const toggleModule = (id: FeatureModuleId, targetState?: boolean) => {
    const currentMod = modules.find((m) => m.id === id);
    if (!currentMod) return { success: false, message: 'Module not found' };

    const newState = targetState !== undefined ? targetState : !currentMod.isEnabled;

    // Enabling a module: check if its required dependencies are enabled
    if (newState) {
      const disabledDependencies = currentMod.dependencies.filter((depId) => !isModuleEnabled(depId));
      if (disabledDependencies.length > 0) {
        const depNames = modules
          .filter((m) => disabledDependencies.includes(m.id))
          .map((m) => m.name)
          .join(', ');
        return {
          success: false,
          message: `Cannot enable ${currentMod.name} because it depends on disabled module(s): ${depNames}. Please enable them first.`,
        };
      }
    }

    // Disabling a module: check if other active modules depend on it
    let affectedModules: string[] = [];
    let updatedModules = modules.map((m) => {
      if (m.id === id) return { ...m, isEnabled: newState };
      return m;
    });

    if (!newState) {
      const dependentModules = modules.filter((m) => m.isEnabled && m.dependencies.includes(id));
      if (dependentModules.length > 0) {
        affectedModules = dependentModules.map((m) => m.name);
        // Automatically disable dependent modules as well to maintain system integrity
        updatedModules = updatedModules.map((m) => {
          if (m.dependencies.includes(id)) {
            return { ...m, isEnabled: false };
          }
          return m;
        });
      }
    }

    saveModules(updatedModules);
    return {
      success: true,
      affectedModules: affectedModules.length > 0 ? affectedModules : undefined,
      message: affectedModules.length > 0
        ? `${currentMod.name} disabled. Also auto-disabled dependent modules: ${affectedModules.join(', ')}.`
        : `${currentMod.name} is now ${newState ? 'enabled' : 'disabled'}.`,
    };
  };

  const updateModuleSettings = async (id: FeatureModuleId, newSettings: Record<string, any>) => {
    const updated = modules.map((m) => (m.id === id ? { ...m, settings: { ...m.settings, ...newSettings } } : m));
    saveModules(updated);
  };

  const resetToDefaults = () => {
    setModules(INITIAL_FEATURE_MODULES);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <FeatureModuleContext.Provider
      value={{
        modules,
        isModuleEnabled,
        toggleModule,
        updateModuleSettings,
        resetToDefaults,
      }}
    >
      {children}
    </FeatureModuleContext.Provider>
  );
};

export const useFeatureModules = () => {
  const context = useContext(FeatureModuleContext);
  if (!context) {
    throw new Error('useFeatureModules must be used within a FeatureModuleProvider');
  }
  return context;
};
