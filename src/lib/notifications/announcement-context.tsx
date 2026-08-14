'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type PlacementType = 'top_banner' | 'popup_modal' | 'notification_feed';
export type TargetRole = 'all' | 'member' | 'creator' | 'admin';
export type AnnouncementStatus = 'draft' | 'active' | 'expired' | 'archived';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: TargetRole;
  placement: PlacementType;
  status: AnnouncementStatus;
  publishedAt?: string;
  expiresAt?: string;
  ctaText?: string;
  ctaLink?: string;
  isDismissible: boolean;
  createdAt: string;
  viewsCount?: number;
  clicksCount?: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  isEnabled: boolean;
}

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-1',
    title: '🚀 CreatorPulse v2.5 Released!',
    content: 'We are thrilled to launch dynamic site management, custom CMS page builder, and live targeted announcements.',
    targetRole: 'all',
    placement: 'top_banner',
    status: 'active',
    ctaText: 'Explore Features',
    ctaLink: '/admin/settings',
    isDismissible: true,
    publishedAt: '2026-08-10T00:00:00Z',
    createdAt: '2026-08-10T00:00:00Z',
    viewsCount: 1420,
    clicksCount: 385,
  },
  {
    id: 'anc-2',
    title: '🎉 Creator Payout Threshold Update',
    content: 'Minimum payout threshold is now updated to $50. Submit your instant payout requests directly from your creator dashboard.',
    targetRole: 'creator',
    placement: 'popup_modal',
    status: 'active',
    ctaText: 'View Balance',
    ctaLink: '/balance',
    isDismissible: true,
    publishedAt: '2026-08-12T00:00:00Z',
    createdAt: '2026-08-12T00:00:00Z',
    viewsCount: 890,
    clicksCount: 240,
  },
];

export const INITIAL_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'welcome_user',
    name: 'Welcome New Member',
    subject: 'Welcome to {{platform_name}}!',
    body: 'Hi {{user_name}},\n\nThank you for joining {{platform_name}}. Explore top creators and unlock exclusive subscriber perks.',
    variables: ['user_name', 'platform_name'],
    isEnabled: true,
  },
  {
    id: 'payout_approved',
    name: 'Payout Approved',
    subject: 'Your payout request of ${{amount}} has been approved',
    body: 'Hi {{creator_name}},\n\nYour payout request of ${{amount}} was processed successfully via {{payout_method}}.',
    variables: ['creator_name', 'amount', 'payout_method'],
    isEnabled: true,
  },
  {
    id: 'report_resolved',
    name: 'Report Resolved',
    subject: 'Update on your reported content',
    body: 'Hi {{user_name}},\n\nOur moderation team reviewed your report and took appropriate action.',
    variables: ['user_name'],
    isEnabled: true,
  },
];

interface AnnouncementContextType {
  announcements: Announcement[];
  templates: NotificationTemplate[];
  getActiveBanners: (userRole?: string) => Announcement[];
  getActiveModals: (userRole?: string) => Announcement[];
  getActiveFeedAnnouncements: (userRole?: string) => Announcement[];
  dismissAnnouncement: (id: string) => void;
  isDismissed: (id: string) => boolean;
  saveAnnouncement: (announcement: Partial<Announcement> & { title: string; content: string }) => Promise<Announcement>;
  deleteAnnouncement: (id: string) => Promise<void>;
  updateTemplate: (id: string, template: Partial<NotificationTemplate>) => Promise<void>;
  resetToDefaults: () => void;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);
const ANNOUNCEMENTS_KEY = 'creatorpulse_announcements';
const TEMPLATES_KEY = 'creatorpulse_notification_templates';
const DISMISSED_KEY = 'creatorpulse_dismissed_announcements';

export const AnnouncementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [templates, setTemplates] = useState<NotificationTemplate[]>(INITIAL_TEMPLATES);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    // Load local storage
    const savedAnc = localStorage.getItem(ANNOUNCEMENTS_KEY);
    if (savedAnc) {
      try { setAnnouncements(JSON.parse(savedAnc)); } catch (e) {}
    }

    const savedTpl = localStorage.getItem(TEMPLATES_KEY);
    if (savedTpl) {
      try { setTemplates(JSON.parse(savedTpl)); } catch (e) {}
    }

    const savedDsm = localStorage.getItem(DISMISSED_KEY);
    if (savedDsm) {
      try { setDismissedIds(JSON.parse(savedDsm)); } catch (e) {}
    }

    // API sync
    const fetchApi = async () => {
      try {
        const res = await fetch('/api/admin/announcements');
        if (res.ok) {
          const data = await res.json();
          if (data.announcements) {
            setAnnouncements(data.announcements);
            localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(data.announcements));
          }
          if (data.templates) {
            setTemplates(data.templates);
            localStorage.setItem(TEMPLATES_KEY, JSON.stringify(data.templates));
          }
        }
      } catch (e) {}
    };
    fetchApi();
  }, []);

  const persistAnnouncements = (newAnc: Announcement[]) => {
    setAnnouncements(newAnc);
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(newAnc));
    fetch('/api/admin/announcements', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcements: newAnc, templates }),
    }).catch((e) => console.error(e));
  };

  const persistTemplates = (newTpl: NotificationTemplate[]) => {
    setTemplates(newTpl);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(newTpl));
    fetch('/api/admin/announcements', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcements, templates: newTpl }),
    }).catch((e) => console.error(e));
  };

  const dismissAnnouncement = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated));
  };

  const isDismissed = (id: string) => dismissedIds.includes(id);

  const filterActive = (list: Announcement[], placement: PlacementType, userRole: string = 'guest') => {
    const now = new Date().getTime();
    return list.filter((anc) => {
      if (anc.placement !== placement) return false;
      if (anc.status !== 'active') return false;
      if (isDismissed(anc.id)) return false;
      if (anc.targetRole !== 'all' && anc.targetRole !== userRole && userRole !== 'super_admin') return false;
      
      if (anc.publishedAt) {
        const pubTime = new Date(anc.publishedAt).getTime();
        if (pubTime > now) return false;
      }
      if (anc.expiresAt) {
        const expTime = new Date(anc.expiresAt).getTime();
        if (expTime < now) return false;
      }
      return true;
    });
  };

  const getActiveBanners = (userRole: string = 'guest') => filterActive(announcements, 'top_banner', userRole);
  const getActiveModals = (userRole: string = 'guest') => filterActive(announcements, 'popup_modal', userRole);
  const getActiveFeedAnnouncements = (userRole: string = 'guest') => filterActive(announcements, 'notification_feed', userRole);

  const saveAnnouncement = async (data: Partial<Announcement> & { title: string; content: string }): Promise<Announcement> => {
    const now = new Date().toISOString();
    let updated: Announcement;
    if (data.id) {
      const existing = announcements.find((a) => a.id === data.id);
      updated = { ...(existing || ({} as Announcement)), ...data } as Announcement;
      persistAnnouncements(announcements.map((a) => (a.id === data.id ? updated : a)));
    } else {
      updated = {
        id: `anc-${Date.now()}`,
        title: data.title,
        content: data.content,
        targetRole: data.targetRole || 'all',
        placement: data.placement || 'top_banner',
        status: data.status || 'active',
        ctaText: data.ctaText || '',
        ctaLink: data.ctaLink || '',
        isDismissible: data.isDismissible !== false,
        publishedAt: data.publishedAt || now,
        expiresAt: data.expiresAt || undefined,
        createdAt: now,
        viewsCount: 0,
        clicksCount: 0,
      };
      persistAnnouncements([updated, ...announcements]);
    }
    return updated;
  };

  const deleteAnnouncement = async (id: string) => {
    persistAnnouncements(announcements.filter((a) => a.id !== id));
  };

  const updateTemplate = async (id: string, fields: Partial<NotificationTemplate>) => {
    const updated = templates.map((t) => (t.id === id ? { ...t, ...fields } : t));
    persistTemplates(updated);
  };

  const resetToDefaults = () => {
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setTemplates(INITIAL_TEMPLATES);
    setDismissedIds([]);
    localStorage.removeItem(ANNOUNCEMENTS_KEY);
    localStorage.removeItem(TEMPLATES_KEY);
    localStorage.removeItem(DISMISSED_KEY);
  };

  return (
    <AnnouncementContext.Provider
      value={{
        announcements,
        templates,
        getActiveBanners,
        getActiveModals,
        getActiveFeedAnnouncements,
        dismissAnnouncement,
        isDismissed,
        saveAnnouncement,
        deleteAnnouncement,
        updateTemplate,
        resetToDefaults,
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncements = () => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncements must be used within an AnnouncementProvider');
  }
  return context;
};
