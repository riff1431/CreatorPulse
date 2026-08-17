'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, ArrowRight, ShieldCheck, Users, Play, Heart, 
  Lock, Zap, CheckCircle2, Star, ChevronRight, 
  HelpCircle, DollarSign, Video, MessageSquare, Flame, Check
} from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { RoleSwitcher } from '../components/RoleSwitcher';
import { HeroSection } from '../components/HeroSection';
import { BrandTicker } from '../components/BrandTicker';
import { CreatorCloud } from '../components/CreatorCloud';
import { BentoFeatures } from '../components/BentoFeatures';
import { ProjectEstimationCalculator } from '../components/ProjectEstimationCalculator';
import { MOCK_CREATOR_DETAILS } from '@/lib/supabase/store';
import { useTheme } from '@/lib/extensions/theme-engine';
import { useSiteSettings } from '@/lib/settings/site-settings-context';

export function LandingPage() {
  const { activeTheme } = useTheme();
  const { settings } = useSiteSettings();
  const [subscriberCount, setSubscriberCount] = useState(350);
  const [tierPrice, setTierPrice] = useState(15);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const monthlyEarnings = Math.round(subscriberCount * tierPrice * 0.95);

  const faqs = [
    {
      q: 'How does membership billing work?',
      a: 'Creators define custom membership plans (Starter, Premium, VIP) with monthly or multi-month durations. Members get instant access to exclusive posts, video masterclasses, and private chat threads.'
    },
    {
      q: 'What platform fees apply to creator tips and memberships?',
      a: `${settings.site_name || 'CreatorPulse'} charges a transparent 5% platform fee on memberships and tips. The remaining 95% goes directly to your creator balance for express payouts.`
    },
    {
      q: 'Can I publish vertical short reels and 24-hour stories?',
      a: 'Yes! Creators can upload 24-hour ephemeral status stories and full-screen vertical short reels with real-time likes, comments, and paywalled previews.'
    },
    {
      q: 'Is Supabase database and authentication included?',
      a: 'Yes. The application comes pre-built with 25 PostgreSQL tables, Row Level Security (RLS) policies, and Supabase Auth client ready for instant live connection.'
    }
  ];

  const siteName = settings.site_name || 'CreatorPulse';

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex flex-col selection:bg-[var(--color-soft-primary)] selection:text-[var(--color-primary-hover)] transition-colors duration-200 overflow-x-hidden">
      <RoleSwitcher />
      <Navbar />

      {/* 1. Ultra Modern Interactive 3D Hero Section */}
      <HeroSection />

      {/* 2. Brand & Partner Trust Ticker */}
      <BrandTicker />

      {/* 3. Community Matrix: "You will find yourself among us" */}
      <CreatorCloud />
      
      {/* 4. Project Estimation Calculator */}
      <ProjectEstimationCalculator />

      {/* 5. Complete Monetization Stack Bento Grid */}
      <BentoFeatures />

      {/* 6. Featured Verified Creators Showcase */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        <div className="text-center space-y-2 px-2">
          <Badge variant="pink" size="sm">Top Creators</Badge>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight">Discover Verified Creators</h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">Join thousands of fans supporting their favorite artists and educators</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Object.values(MOCK_CREATOR_DETAILS).slice(0, 3).map((creator) => (
            <Card key={creator.id} hoverable className="p-4 xs:p-5 sm:p-6 space-y-4 rounded-2xl sm:rounded-3xl">
              <div className="flex items-center gap-3">
                <Avatar
                  src={creator.avatarUrl}
                  alt={creator.fullName}
                  size="lg"
                  isVerified={creator.isVerified}
                  hasStory={true}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm sm:text-base truncate">{creator.fullName}</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] truncate">@{creator.username}</p>
                  <span className="text-[10px] font-extrabold text-[var(--color-primary)] bg-[var(--color-soft-primary)] px-2 py-0.5 rounded-full mt-1 inline-block">
                    {creator.category}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#52525B] dark:text-[#D4B8D0] line-clamp-2 leading-relaxed font-medium">
                {creator.bio}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--color-border)] text-center text-xs">
                <div>
                  <span className="font-black block text-xs sm:text-sm">{(creator.subscriberCount || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-[var(--color-text-secondary)]">Subscribers</span>
                </div>
                <div>
                  <span className="font-black block text-xs sm:text-sm">{(creator.followerCount || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-[var(--color-text-secondary)]">Followers</span>
                </div>
                <div>
                  <span className="font-black block text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-extrabold">$9.99</span>
                  <span className="text-[10px] text-[var(--color-text-secondary)]">From /mo</span>
                </div>
              </div>

              <Link href={`/c/${creator.username}`} className="block pt-1">
                <Button variant="outline" size="sm" className="w-full min-h-[38px]" rightIcon={<ArrowRight size={13} />}>
                  View Profile & Tiers
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. Creator Earnings Calculator */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFF1F7]/60 to-[#FFF9FC] dark:from-[#1A1222]/60 dark:to-[#0F0A14] border-y border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 px-2">
          <div className="space-y-2">
            <Badge variant="pink" size="sm">Revenue Potential</Badge>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight">Calculate Your Monthly Income</h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">See how much you can earn based on your active fan subscriptions</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-10 space-y-5 sm:space-y-6 max-w-xl mx-auto shadow-xl shadow-[var(--color-primary)]/5">
            <div className="space-y-3 sm:space-y-4 text-left">
              <div className="flex justify-between text-xs font-bold gap-2">
                <span>VIP Subscribers: <strong className="text-[var(--color-primary)]">{subscriberCount}</strong> members</span>
                <span className="text-[var(--color-text-secondary)]">${tierPrice}/mo tier</span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="25"
                value={subscriberCount}
                onChange={(e) => setSubscriberCount(Number(e.target.value))}
                className="w-full accent-[#EC4899] bg-[var(--color-soft-primary)] rounded-lg cursor-pointer h-3"
                aria-label="Subscriber count slider"
              />
            </div>

            <div className="space-y-3 sm:space-y-4 text-left">
              <div className="flex justify-between text-xs font-bold gap-2">
                <span>Monthly Tier Price: <strong className="text-[var(--color-primary)]">${tierPrice}</strong></span>
                <span className="text-[var(--color-text-secondary)]">Per member</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={tierPrice}
                onChange={(e) => setTierPrice(Number(e.target.value))}
                className="w-full accent-[#EC4899] bg-[var(--color-soft-primary)] rounded-lg cursor-pointer h-3"
                aria-label="Tier price slider"
              />
            </div>

            <div className="p-4 xs:p-6 bg-gradient-to-tr from-[var(--color-soft-primary)] to-[#FFF1F7] dark:to-[#1A1222] rounded-2xl border border-[var(--color-soft-border)] text-center space-y-1.5 sm:space-y-2">
              <span className="text-[10px] sm:text-xs font-bold text-[var(--color-text-secondary)] block uppercase tracking-wider">Estimated Monthly Earnings</span>
              <p className="text-3xl xs:text-4xl sm:text-5xl font-black text-[var(--color-primary)]">
                ${monthlyEarnings.toLocaleString()}
                <span className="text-xs sm:text-sm font-normal text-[var(--color-text-secondary)]"> /month</span>
              </p>
              <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary)]">Based on 95% creator payout rate after 5% platform fee</p>
            </div>

            <Link href="/auth/signup" className="block">
              <Button variant="primary" size="lg" className="w-full min-h-[46px]" rightIcon={<ArrowRight size={16} />}>
                Start Monetizing Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FAQs Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6 sm:space-y-8">
        <div className="text-center space-y-2 px-2">
          <Badge variant="slate" size="sm"><HelpCircle size={12} /> Got Questions?</Badge>
          <h2 className="text-2xl xs:text-3xl font-black tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-4 xs:px-6 py-3.5 sm:py-4 text-left flex items-center justify-between text-xs xs:text-sm sm:text-base font-bold cursor-pointer hover:text-[var(--color-primary)] gap-3"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  size={16}
                  className={`transition-transform duration-200 text-[var(--color-text-secondary)] shrink-0 ${openFaq === idx ? 'rotate-90 text-[var(--color-primary)]' : ''}`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 xs:px-6 pb-4 sm:pb-5 pt-1 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)]/50 font-medium">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. Call to Action Banner */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#FB7185] rounded-2xl sm:rounded-3xl p-6 xs:p-8 sm:p-14 text-center text-white space-y-4 sm:space-y-6 shadow-2xl shadow-pink-500/25 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4 relative z-10">
            <h2 className="text-2xl xs:text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Turn Your Passion into a Thriving Business?
            </h2>
            <p className="text-xs sm:text-base text-white/90 font-medium">
              Join thousands of creators who earn predictable income directly from their biggest fans.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white text-[#EC4899] text-xs sm:text-sm font-black hover:bg-[#FFF1F7] hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer min-h-[46px]">
                  Create Your Creator Account →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
