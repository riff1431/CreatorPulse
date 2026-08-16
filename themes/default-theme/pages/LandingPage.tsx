'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, ArrowRight, ShieldCheck, Users, Play, Heart, 
  Lock, Zap, CheckCircle2, Star, Database, ChevronRight, 
  HelpCircle, Gift, DollarSign, Video, MessageSquare, Flame, Check
} from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { RoleSwitcher } from '../components/RoleSwitcher';
import { MOCK_CREATOR_DETAILS } from '@/lib/supabase/store';
import { useTheme } from '@/lib/extensions/theme-engine';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import gsap from 'gsap';

export function LandingPage() {
  const { activeTheme } = useTheme();
  const { settings } = useSiteSettings();
  const [subscriberCount, setSubscriberCount] = useState(350);
  const [tierPrice, setTierPrice] = useState(15);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const heroRef = useRef<HTMLDivElement>(null);

  const monthlyEarnings = Math.round(subscriberCount * tierPrice * 0.95);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll('.gsap-fade-up'),
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out' }
      );
    }
  }, []);

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
    <div className="min-h-screen bg-[#FFF9FC] dark:bg-[#0F0A14] text-[#18181B] dark:text-[#FDF2F8] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777] transition-colors duration-200">
      <RoleSwitcher />
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#EC4899]/20 to-[#F43F5E]/15 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="gsap-fade-up inline-flex items-center gap-2">
            <Badge variant="gradient" size="sm">
              <Sparkles size={12} /> Next-Gen Creator Platform
            </Badge>
          </div>

          <h1 className="gsap-fade-up text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08]">
            Monetize Your Audience with <span className="bg-gradient-to-r from-[#EC4899] to-[#F43F5E] bg-clip-text text-transparent">VIP Memberships</span> & Direct Drops
          </h1>

          <p className="gsap-fade-up text-base sm:text-lg text-[#71717A] dark:text-[#D4B8D0] leading-relaxed max-w-2xl mx-auto">
            Empower your creative community with tiered VIP subscriptions, paywalled exclusive drops, 24-hour status stories, and instant fan tips.
          </p>

          <div className="gsap-fade-up flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight size={16} />}>
                Get Started for Free
              </Button>
            </Link>
            <Link href="/explore" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Creators
              </Button>
            </Link>
          </div>

          <div className="gsap-fade-up pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-[#71717A] dark:text-[#D4B8D0]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#EC4899]" />
              <span>Instant Payouts</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <span>95% Creator Share</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Zero Upfront Setup Fee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Creators Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="pink" size="sm">Top Creators</Badge>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Discover Verified Creators</h2>
          <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">Join thousands of fans supporting their favorite artists and educators</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(MOCK_CREATOR_DETAILS).slice(0, 3).map((creator) => (
            <Card key={creator.id} hoverable className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-3.5">
                <Avatar
                  src={creator.avatarUrl}
                  alt={creator.fullName}
                  size="lg"
                  isVerified={creator.isVerified}
                  hasStory={true}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base truncate">{creator.fullName}</h3>
                  <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] truncate">@{creator.username}</p>
                  <span className="text-[10px] font-extrabold text-[#BE185D] dark:text-[#F472B6] bg-[#FCE7F3] dark:bg-[#381A2B] px-2 py-0.5 rounded-full mt-1 inline-block">
                    {creator.category}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#52525B] dark:text-[#D4B8D0] line-clamp-2 leading-relaxed">
                {creator.bio}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F3DCE8] dark:border-[#3A2A4C] text-center text-xs">
                <div>
                  <span className="font-black block">{(creator.subscriberCount || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-[#71717A] dark:text-[#8E7890]">Subscribers</span>
                </div>
                <div>
                  <span className="font-black block">{(creator.followerCount || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-[#71717A] dark:text-[#8E7890]">Followers</span>
                </div>
                <div>
                  <span className="font-black block text-emerald-600 dark:text-emerald-400 font-extrabold">$9.99</span>
                  <span className="text-[10px] text-[#71717A] dark:text-[#8E7890]">From /mo</span>
                </div>
              </div>

              <Link href={`/c/${creator.username}`} className="block pt-1">
                <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight size={13} />}>
                  View Profile & Tiers
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Creator Earnings Calculator */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFF1F7]/60 to-[#FFF9FC] dark:from-[#1A1222]/60 dark:to-[#0F0A14] border-y border-[#F3DCE8] dark:border-[#3A2A4C]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-2">
            <Badge variant="pink" size="sm">Revenue Potential</Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Calculate Your Monthly Income</h2>
            <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#D4B8D0]">See how much you can earn based on your active fan subscriptions</p>
          </div>

          <div className="bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-3xl p-6 sm:p-10 space-y-6 max-w-xl mx-auto shadow-xl shadow-pink-500/5">
            <div className="space-y-4 text-left">
              <div className="flex justify-between text-xs font-bold">
                <span>VIP Subscribers: <strong className="text-[#EC4899]">{subscriberCount}</strong> members</span>
                <span className="text-[#71717A] dark:text-[#D4B8D0]">${tierPrice}/mo tier</span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="25"
                value={subscriberCount}
                onChange={(e) => setSubscriberCount(Number(e.target.value))}
                className="w-full accent-[#EC4899] bg-[#FCE7F3] dark:bg-[#381A2B] rounded-lg cursor-pointer h-2.5"
              />
            </div>

            <div className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-[#EC4899] to-[#F43F5E] bg-clip-text text-transparent tracking-tight">
              ${monthlyEarnings.toLocaleString()} <span className="text-xl font-bold text-[#71717A] dark:text-[#D4B8D0]">/ mo</span>
            </div>
            <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] font-medium">95% net payout directly to your creator balance</p>

            <Link href="/auth/signup" className="block pt-2">
              <Button variant="primary" size="md" className="w-full">
                Claim Your Creator Studio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-4 sm:px-6 lg:px-8 py-20 max-w-3xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="pink" size="sm">Got Questions?</Badge>
          <h2 className="text-3xl font-black tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Card
              key={idx}
              className="p-5 cursor-pointer space-y-2.5 transition-all hover:border-[#EC4899]/60"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between font-bold text-sm sm:text-base">
                <span>{faq.q}</span>
                <ChevronRight
                  size={18}
                  className={`text-[#EC4899] transition-transform duration-200 shrink-0 ml-2 ${openFaq === idx ? 'rotate-90' : ''}`}
                />
              </div>
              {openFaq === idx && (
                <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] pt-2 leading-relaxed border-t border-[#F3DCE8] dark:border-[#3A2A4C]">
                  {faq.a}
                </p>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-b from-white to-[#FFF1F7] dark:from-[#1A1222] dark:to-[#0F0A14] border-t border-[#F3DCE8] dark:border-[#3A2A4C] text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Ready to Launch Your Creator Business?</h2>
        <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#D4B8D0] max-w-lg mx-auto">
          Start sharing exclusive content, building memberships, and earning recurring income today.
        </p>
        <Link href="/auth/signup">
          <Button variant="primary" size="lg" leftIcon={<Sparkles size={18} />}>
            Start Creating Now
          </Button>
        </Link>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
