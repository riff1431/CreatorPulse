'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';

export interface ChannelPreference {
  inApp: boolean;
  email: boolean;
}

export interface UserNotificationPreferences {
  followers: ChannelPreference;       // New followers & subscribers
  comments: ChannelPreference;        // Comments, replies & mentions
  messages: ChannelPreference;        // Direct messages & chat requests
  memberships: ChannelPreference;     // Tier upgrades, renewals, cancellations
  creatorUpdates: ChannelPreference;  // Creator posts, VIP drops, livestreams
  payments: ChannelPreference;        // Payments, payouts, tips & earnings
  security: ChannelPreference;        // Security alerts, login attempts, password changes
  digestFrequency: 'instant' | 'daily_digest' | 'weekly_summary';
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string;   // e.g. "08:00"
}

export const DEFAULT_NOTIFICATION_PREFERENCES: UserNotificationPreferences = {
  followers: { inApp: true, email: true },
  comments: { inApp: true, email: true },
  messages: { inApp: true, email: true },
  memberships: { inApp: true, email: true },
  creatorUpdates: { inApp: true, email: false },
  payments: { inApp: true, email: true },
  security: { inApp: true, email: true },
  digestFrequency: 'instant',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

interface NotificationPreferencesContextType {
  preferences: UserNotificationPreferences;
  isSaving: boolean;
  savedSuccess: boolean;
  updateCategoryPref: (category: keyof Omit<UserNotificationPreferences, 'digestFrequency' | 'quietHoursEnabled' | 'quietHoursStart' | 'quietHoursEnd'>, channel: 'inApp' | 'email', enabled: boolean) => void;
  updateMetaPref: <K extends 'digestFrequency' | 'quietHoursEnabled' | 'quietHoursStart' | 'quietHoursEnd'>(key: K, value: UserNotificationPreferences[K]) => void;
  toggleAllChannel: (channel: 'inApp' | 'email', enabled: boolean) => void;
  resetToDefaults: () => void;
  savePreferences: () => Promise<boolean>;
}

const NotificationPreferencesContext = createContext<NotificationPreferencesContextType | undefined>(undefined);

function getStorageKey(userId?: string | null): string {
  const id = userId || 'guest';
  return `creatorpulse_notif_prefs_${id}`;
}

export const NotificationPreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserNotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load user notification preferences when user changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = getStorageKey(user?.id);
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          ...parsed,
        });
      } else {
        setPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
      }
    } catch (e) {
      console.error('Failed to parse notification preferences', e);
      setPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    }
  }, [user?.id]);

  const updateCategoryPref = (
    category: keyof Omit<UserNotificationPreferences, 'digestFrequency' | 'quietHoursEnabled' | 'quietHoursStart' | 'quietHoursEnd'>,
    channel: 'inApp' | 'email',
    enabled: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: enabled,
      },
    }));
  };

  const updateMetaPref = <K extends 'digestFrequency' | 'quietHoursEnabled' | 'quietHoursStart' | 'quietHoursEnd'>(
    key: K,
    value: UserNotificationPreferences[K]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleAllChannel = (channel: 'inApp' | 'email', enabled: boolean) => {
    setPreferences((prev) => {
      const updated = { ...prev };
      const categories: (keyof Omit<UserNotificationPreferences, 'digestFrequency' | 'quietHoursEnabled' | 'quietHoursStart' | 'quietHoursEnd'>)[] = [
        'followers', 'comments', 'messages', 'memberships', 'creatorUpdates', 'payments', 'security'
      ];
      categories.forEach((cat) => {
        updated[cat] = {
          ...updated[cat],
          [channel]: enabled,
        };
      });
      return updated;
    });
  };

  const resetToDefaults = () => {
    setPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
  };

  const savePreferences = async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      await new Promise((res) => setTimeout(res, 400));
      const key = getStorageKey(user?.id);
      localStorage.setItem(key, JSON.stringify(preferences));
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      return true;
    } catch (e) {
      console.error('Failed to save notification preferences', e);
      setIsSaving(false);
      return false;
    }
  };

  return (
    <NotificationPreferencesContext.Provider
      value={{
        preferences,
        isSaving,
        savedSuccess,
        updateCategoryPref,
        updateMetaPref,
        toggleAllChannel,
        resetToDefaults,
        savePreferences,
      }}
    >
      {children}
    </NotificationPreferencesContext.Provider>
  );
};

export const useNotificationPreferences = () => {
  const context = useContext(NotificationPreferencesContext);
  if (!context) {
    throw new Error('useNotificationPreferences must be used within a NotificationPreferencesProvider');
  }
  return context;
};
