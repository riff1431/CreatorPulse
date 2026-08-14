'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type FeatureModuleId = 
  | 'stories' 
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
}

export const INITIAL_FEATURE_MODULES: FeatureModule[] = [
  {
    id: 'stories',
    name: '24h Stories',
    description: 'Allow creators to publish 24-hour expiring media stories with viewer counts and reactions.',
    isEnabled: true,
    dependencies: [],
    settings: { maxStorySeconds: 30 },
    icon: 'Clock',
  },
  {
    id: 'reels',
    name: 'Shorts & Reels',
    description: 'Vertical video feed with interactions, audio background support, and monetization.',
    isEnabled: true,
    dependencies: [],
    settings: { maxVideoMB: 100 },
    icon: 'Film',
  },
  {
    id: 'messaging',
    name: 'Direct Messaging',
    description: '1-on-1 private messaging and paywalled direct messages between fans and creators.',
    isEnabled: true,
    dependencies: [],
    settings: { allowPaywalledMessages: true },
    icon: 'MessageSquare',
  },
  {
    id: 'memberships',
    name: 'VIP Memberships',
    description: 'Creator tier subscriptions, recurring billing, and subscriber exclusive posts.',
    isEnabled: true,
    dependencies: ['wallet'],
    settings: { minTierPrice: 1.00 },
    icon: 'Star',
  },
  {
    id: 'comments',
    name: 'Post & Reel Comments',
    description: 'Interactive comment sections on public and subscriber posts.',
    isEnabled: true,
    dependencies: [],
    settings: { allowGifs: true },
    icon: 'MessageCircle',
  },
  {
    id: 'creator_applications',
    name: 'Creator Onboarding',
    description: 'Fan-to-Creator upgrade application process and review pipeline.',
    isEnabled: true,
    dependencies: [],
    settings: { autoApprove: false },
    icon: 'FileText',
  },
  {
    id: 'wallet',
    name: 'Virtual Wallet & Payouts',
    description: 'User balances, wallet top-ups, tip support, and creator payout requests.',
    isEnabled: true,
    dependencies: [],
    settings: { minPayout: 50.00 },
    icon: 'Wallet',
  },
];

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
        setModules(JSON.parse(saved));
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
            setModules(data.modules);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.modules));
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
