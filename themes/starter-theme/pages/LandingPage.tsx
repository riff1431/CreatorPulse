'use client';

import React from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { CreatorBadge } from '../partials/CreatorBadge';
import { PricingCard } from '../partials/PricingCard';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Heart } from 'lucide-react';

/**
 * Starter Theme Template Landing Page Override
 * Showcases visual features of the Theme SDK, including design token styling,
 * responsive grids, dynamic hover states, and card structures.
 */
export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 py-6 font-sans">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-soft-primary)] text-[var(--color-primary)] text-xs font-bold transition-all shadow-xs">
          <Sparkles size={14} className="text-[var(--color-primary)]" />
          <span>Theme Engine Active • Starter Kit v1.1.0</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-[var(--color-text-primary)]">
          Craft Gorgeous Portals for Your{' '}
          <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
            Creator Community
          </span>
        </h1>
        <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
          Welcome to your official Theme SDK starter template. Easily customize design tokens, override pages and layouts, and package ZIP archives for one-click installation.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight size={16} />}
            className="shadow-md"
          >
            Explore Platform
          </Button>
          <Button variant="secondary" size="lg">
            Theme Documentation
          </Button>
        </div>
      </section>

      {/* Featured Creators Row */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Featured Creators</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">Discover top verified creators</p>
          </div>
          <Badge variant="primary">Top Trending</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              name: 'Elena Rostova',
              handle: '@elena_art',
              role: 'Digital Illustrator',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
              members: '2.4k',
            },
            {
              name: 'Marcus Vance',
              handle: '@marcus_beats',
              role: 'Audio Producer',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
              members: '5.1k',
            },
            {
              name: 'Sophia Chen',
              handle: '@sophia_fit',
              role: 'Fitness & Wellness',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
              members: '3.8k',
            },
          ].map((creator, idx) => (
            <Card key={idx} hoverable className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={creator.avatar} alt={creator.name} isVerified size="lg" />
                <div>
                  <h3 className="font-bold text-sm text-[var(--color-text-primary)]">{creator.name}</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">{creator.handle}</p>
                  <p className="text-[11px] text-[var(--color-text-secondary)] font-medium mt-0.5">{creator.role}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Follow
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: <Zap size={24} className="text-[var(--color-primary)]" />,
            title: 'Design Tokens',
            desc: 'Configurable color palettes, border radii, and typography scales fully isolated in a declarative manifest.',
          },
          {
            icon: <ShieldCheck size={24} className="text-[var(--color-accent)]" />,
            title: 'Full Overrides Engine',
            desc: 'Override pages, layouts, and components with automatic, zero-crash fallback to default templates.',
          },
          {
            icon: <Heart size={24} className="text-rose-500" />,
            title: 'ZIP Export & Import',
            desc: 'Pack your theme folder into a ZIP archive for seamless distribution and one-click admin upload.',
          },
        ].map((feat, idx) => (
          <Card key={idx} hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-secondary)] flex items-center justify-center">
              {feat.icon}
            </div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">{feat.title}</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{feat.desc}</p>
          </Card>
        ))}
      </section>

      {/* Pricing / Membership Plans Partial Demo */}
      <section className="space-y-6">
        <div className="text-center max-w-md mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Membership Tiers</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">Sample starter tier cards with theme bindings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PricingCard
            title="Supporter"
            price="$5"
            description="Access to subscriber-only posts and Discord role."
            features={['Subscriber feed access', 'Community badge', 'Direct message replies']}
          />
          <PricingCard
            title="VIP Club"
            price="$15"
            isPopular
            description="Full library access with behind-the-scenes stories & reels."
            features={['All Supporter perks', 'Exclusive 4K media', 'Priority DM responses', 'Monthly live Q&A']}
          />
          <PricingCard
            title="All-Access Pro"
            price="$35"
            description="Ultimate pass with 1-on-1 monthly sessions and custom drops."
            features={['All VIP perks', '1-on-1 monthly session', 'Early access to drops', 'Custom role badge']}
          />
        </div>
      </section>

      {/* Dynamic Token Verification Box */}
      <section className="p-6 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[var(--color-text-primary)]">Live Token Verification</h3>
          <CreatorBadge name="Verified Theme SDK" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
          {[
            { label: 'Primary Color', style: { backgroundColor: 'var(--color-primary)', color: '#fff' } },
            { label: 'Primary Hover', style: { backgroundColor: 'var(--color-primary-hover)', color: '#fff' } },
            { label: 'Soft Primary', style: { backgroundColor: 'var(--color-soft-primary)', color: 'var(--color-primary)' } },
            { label: 'Accent Color', style: { backgroundColor: 'var(--color-accent)', color: '#fff' } },
          ].map((item, idx) => (
            <div
              key={idx}
              style={item.style}
              className="p-3.5 rounded-[var(--radius-button)] text-center shadow-xs border border-black/5"
            >
              {item.label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
