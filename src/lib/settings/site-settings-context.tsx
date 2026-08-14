'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface SocialLinks {
  twitter: string;
  instagram: string;
  youtube: string;
  discord: string;
  github: string;
  linkedin: string;
  telegram: string;
}

export interface SEODefaults {
  meta_title_template: string;
  default_meta_description: string;
  default_meta_keywords: string;
  og_image_url: string;
  twitter_handle: string;
  canonical_domain: string;
}

export interface SiteSettings {
  site_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  copyright_text: string;
  social_links: SocialLinks;
  seo_defaults: SEODefaults;
  maintenance_mode: boolean;
  maintenance_title: string;
  maintenance_message: string;
  registration_mode: 'open' | 'invite_only' | 'closed';
  default_user_role: 'member' | 'creator';
  require_email_verification: boolean;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: 'CreatorPulse',
  tagline: 'A premium creator membership and community platform.',
  logo_url: '',
  favicon_url: '',
  contact_email: 'support@creatorpulse.com',
  contact_phone: '+1 (555) 234-5678',
  contact_address: '100 Innovation Way, San Francisco, CA 94105',
  copyright_text: '© 2026 CreatorPulse Inc. All rights reserved.',
  social_links: {
    twitter: 'https://x.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
    discord: 'https://discord.gg',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    telegram: 'https://t.me',
  },
  seo_defaults: {
    meta_title_template: '%s | CreatorPulse',
    default_meta_description: 'Join top creators and build your membership community with CreatorPulse.',
    default_meta_keywords: 'creator, membership, subscription, community, monetize',
    og_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    twitter_handle: '@creatorpulse',
    canonical_domain: 'https://creatorpulse.com',
  },
  maintenance_mode: false,
  maintenance_title: 'We will be back shortly!',
  maintenance_message: 'CreatorPulse is undergoing scheduled system maintenance to bring you exciting improvements.',
  registration_mode: 'open',
  default_user_role: 'member',
  require_email_verification: false,
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  isLoading: boolean;
  resetToDefaults: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'creatorpulse_site_settings';

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Load initial from localStorage if present
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SITE_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse site settings from local storage', e);
      }
    }

    // 2. Fetch live settings from API / Supabase
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/site-settings');
        if (res.ok) {
          const data = await res.json();
          if (data && data.settings) {
            const merged = { ...DEFAULT_SITE_SETTINGS, ...data.settings };
            setSettings(merged);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          }
        }
      } catch (e) {
        // Fallback to existing settings
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.error('Failed to sync site settings to server', e);
    }
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SITE_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, updateSettings, isLoading, resetToDefaults }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
