'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type SectionType = 
  | 'hero' 
  | 'rich_text' 
  | 'feature_grid' 
  | 'faq' 
  | 'cta_banner' 
  | 'media' 
  | 'contact_form';

export interface CMSSection {
  id: string;
  type: SectionType;
  title?: string;
  subtitle?: string;
  content?: string; // HTML or Markdown
  mediaUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  cards?: Array<{ title: string; description: string; icon?: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  settings?: Record<string, any>;
}

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
  sections: CMSSection[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_CMS_PAGES: CMSPage[] = [
  {
    id: 'page-1',
    title: 'About CreatorPulse',
    slug: 'about-us',
    status: 'published',
    seoTitle: 'About Us | CreatorPulse SaaS Platform',
    seoDescription: 'Empowering digital creators, educators, and communities to build direct fan memberships.',
    seoKeywords: 'about, creator economy, memberships, fan subscriptions',
    ogImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    sections: [
      {
        id: 'sec-1',
        type: 'hero',
        title: 'Empowering Creator Independence',
        subtitle: 'CreatorPulse is the ultimate membership & community platform designed for digital creators, educators, and influencers.',
        ctaText: 'Explore Platform',
        ctaLink: '/explore',
        mediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 'sec-2',
        type: 'feature_grid',
        title: 'Why Top Creators Choose CreatorPulse',
        subtitle: 'Built from the ground up for peak performance, seamless monetization, and community engagement.',
        cards: [
          { title: 'Direct Memberships', description: 'Create monthly paid tiers with custom benefits and instant payout options.', icon: 'Star' },
          { title: 'Shorts & 24h Stories', description: 'Share dynamic short-form videos and daily stories to keep fans hooked.', icon: 'Film' },
          { title: 'Paywalled Content & DMs', description: 'Monetize exclusive posts, polls, files, and direct messages effortlessly.', icon: 'Lock' },
          { title: 'Built-in Wallet', description: 'Receive tips, payouts, and instant top-ups with complete financial transparency.', icon: 'Wallet' }
        ]
      },
      {
        id: 'sec-3',
        type: 'rich_text',
        title: 'Our Mission & Vision',
        content: '<p class="text-base text-slate-700 leading-relaxed mb-4">We believe every creator deserves direct ownership over their audience, revenue, and content without algorithmic gatekeepers. Our platform gives creators enterprise-grade tools to launch paid memberships, host exclusive digital media, and connect authentically with fans.</p><p class="text-base text-slate-700 leading-relaxed">Whether you produce video tutorials, music, podcasts, or exclusive art, CreatorPulse offers the security and performance you need to build a sustainable business.</p>'
      }
    ],
    publishedAt: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-15T00:00:00Z'
  },
  {
    id: 'page-2',
    title: 'Terms of Service',
    slug: 'terms',
    status: 'published',
    seoTitle: 'Terms of Service | CreatorPulse',
    seoDescription: 'Read our platform rules, payment guidelines, and acceptable use policy.',
    sections: [
      {
        id: 'sec-terms-1',
        type: 'hero',
        title: 'Terms of Service',
        subtitle: 'Please review our platform guidelines and terms of service carefully.',
      },
      {
        id: 'sec-terms-2',
        type: 'rich_text',
        title: '1. Account Eligibility & Responsibilities',
        content: '<p class="text-slate-700 leading-relaxed mb-4">By accessing or using CreatorPulse, you agree to abide by these Terms of Service. You must be at least 18 years old or possess legal guardian consent to register an account.</p><h3 class="font-bold text-slate-900 text-lg mt-6 mb-2">2. Content & Monetization Guidelines</h3><p class="text-slate-700 leading-relaxed mb-4">Creators maintain full copyright ownership over their uploaded media. Content violating intellectual property laws, spamming, or explicit illegal activities will result in immediate suspension.</p><h3 class="font-bold text-slate-900 text-lg mt-6 mb-2">3. Payments & Withdrawals</h3><p class="text-slate-700 leading-relaxed font-medium">All financial transactions processed on CreatorPulse are governed by our security standards. Creator payout requests are processed based on the platform payout threshold.</p>'
      }
    ],
    publishedAt: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-15T00:00:00Z'
  },
  {
    id: 'page-3',
    title: 'Help & Frequently Asked Questions',
    slug: 'help',
    status: 'published',
    seoTitle: 'Help & Support | CreatorPulse FAQ',
    seoDescription: 'Find answers to common questions about CreatorPulse subscriptions, payouts, and creator tools.',
    sections: [
      {
        id: 'sec-faq-1',
        type: 'hero',
        title: 'How Can We Help You Today?',
        subtitle: 'Everything you need to know about setting up your profile, subscribing to creators, and handling payouts.',
      },
      {
        id: 'sec-faq-2',
        type: 'faq',
        title: 'Frequently Asked Questions',
        faqs: [
          { question: 'How do creator payout requests work?', answer: 'Creators can submit payout requests once their available balance reaches the minimum threshold ($50). Payouts are transferred via Bank Transfer or PayPal.' },
          { question: 'What payment methods are accepted?', answer: 'We support all major Credit/Debit cards, Virtual Wallet Top-ups, and Instant Payment Gateways.' },
          { question: 'Can I cancel my creator subscription anytime?', answer: 'Yes! You can cancel your subscription from your profile settings at any time without hidden fees.' },
          { question: 'How do 24-hour stories work?', answer: 'Stories automatically expire after 24 hours from publication. Creators can set stories to Public, Followers-Only, or VIP Subscribers.' }
        ]
      },
      {
        id: 'sec-faq-3',
        type: 'contact_form',
        title: 'Still Have Questions?',
        subtitle: 'Contact our support team and we will get back to you within 24 hours.'
      }
    ],
    publishedAt: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-15T00:00:00Z'
  }
];

interface CMSContextType {
  pages: CMSPage[];
  getPageBySlug: (slug: string) => CMSPage | undefined;
  getPageById: (id: string) => CMSPage | undefined;
  savePage: (page: Partial<CMSPage> & { title: string; slug: string }) => Promise<CMSPage>;
  deletePage: (id: string) => Promise<void>;
  toggleStatus: (id: string, status: 'draft' | 'published' | 'archived') => Promise<void>;
  resetToDefaults: () => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);
const STORAGE_KEY = 'creatorpulse_cms_pages';

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<CMSPage[]>(INITIAL_CMS_PAGES);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse CMS pages from local storage', e);
      }
    }

    const fetchPages = async () => {
      try {
        const res = await fetch('/api/admin/cms');
        if (res.ok) {
          const data = await res.json();
          if (data && data.pages && data.pages.length > 0) {
            setPages(data.pages);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.pages));
          }
        }
      } catch (e) {
        // Fallback to local state
      }
    };

    fetchPages();
  }, []);

  const persistPages = (newPages: CMSPage[]) => {
    setPages(newPages);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPages));
    fetch('/api/admin/cms', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages: newPages }),
    }).catch((e) => console.error('Failed to sync CMS pages to API', e));
  };

  const getPageBySlug = (slug: string) => {
    return pages.find((p) => p.slug === slug);
  };

  const getPageById = (id: string) => {
    return pages.find((p) => p.id === id);
  };

  const savePage = async (pageData: Partial<CMSPage> & { title: string; slug: string }): Promise<CMSPage> => {
    const now = new Date().toISOString();
    let updatedPage: CMSPage;

    if (pageData.id) {
      const existing = pages.find((p) => p.id === pageData.id);
      updatedPage = {
        ...(existing || ({} as CMSPage)),
        ...pageData,
        updatedAt: now,
      } as CMSPage;
      persistPages(pages.map((p) => (p.id === pageData.id ? updatedPage : p)));
    } else {
      updatedPage = {
        id: `page-${Date.now()}`,
        title: pageData.title,
        slug: pageData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        status: pageData.status || 'draft',
        seoTitle: pageData.seoTitle || pageData.title,
        seoDescription: pageData.seoDescription || '',
        seoKeywords: pageData.seoKeywords || '',
        ogImage: pageData.ogImage || '',
        sections: pageData.sections || [],
        createdAt: now,
        updatedAt: now,
        publishedAt: pageData.status === 'published' ? now : undefined,
      };
      persistPages([...pages, updatedPage]);
    }
    return updatedPage;
  };

  const deletePage = async (id: string) => {
    persistPages(pages.filter((p) => p.id !== id));
  };

  const toggleStatus = async (id: string, status: 'draft' | 'published' | 'archived') => {
    const now = new Date().toISOString();
    const updated = pages.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          status,
          updatedAt: now,
          publishedAt: status === 'published' ? (p.publishedAt || now) : p.publishedAt,
        };
      }
      return p;
    });
    persistPages(updated);
  };

  const resetToDefaults = () => {
    setPages(INITIAL_CMS_PAGES);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <CMSContext.Provider
      value={{
        pages,
        getPageBySlug,
        getPageById,
        savePage,
        deletePage,
        toggleStatus,
        resetToDefaults,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
