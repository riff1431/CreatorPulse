'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, ArrowRight, ShieldCheck, Users, Play, Heart, 
  Lock, Zap, CheckCircle2, Star, Database, ChevronRight, 
  HelpCircle, Gift, DollarSign, Video, MessageSquare, Flame, Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { MOCK_CREATOR_DETAILS } from '@/lib/supabase/store';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { useTheme } from '@/lib/extensions/theme-engine';
import gsap from 'gsap';

export default function LandingPage() {
  const { activeTheme } = useTheme();
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
      a: 'CreatorPulse charges a transparent 5% platform fee on memberships and tips. The remaining 95% goes directly to your creator balance for express payouts.'
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

  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <RoleSwitcher />

      {/* Navigation Header */}
      <header className={`bg-white/80 backdrop-blur-xl border-b border-[#F3DCE8] px-6 py-4 ${
        activeTheme.settings?.headerStyle === 'floating'
          ? 'theme-header-floating'
          : activeTheme.settings?.headerStyle === 'simple'
          ? 'theme-header-simple'
          : 'theme-header-fixed'
      }`}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeTheme.settings?.logoUrl ? (
              <img src={activeTheme.settings.logoUrl} alt="Logo" className="h-9 w-auto max-w-[150px] object-contain rounded-xl" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-2xl gradient-btn flex items-center justify-center shadow-md shadow-[#EC4899]/25">
                  <Sparkles className="text-white" size={20} />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-[#18181B]">
                  Creator<span className="gradient-text">Pulse</span>
                </span>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-[#71717A] font-semibold">
            <a href="#features" className="hover:text-[#DB2777] transition-colors">Features</a>
            <a href="#showcase" className="hover:text-[#DB2777] transition-colors">Creators</a>
            <a href="#benefits" className="hover:text-[#DB2777] transition-colors">Benefits</a>
            <a href="#calculator" className="hover:text-[#DB2777] transition-colors">Calculator</a>
            <a href="#faq" className="hover:text-[#DB2777] transition-colors">FAQ</a>
            <Link href="/database" className="hover:text-[#DB2777] transition-colors flex items-center gap-1.5 text-[#BE185D]">
              <Database size={15} /> Supabase Schema
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/feed">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight size={15} />}>
                Launch App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative px-6 pt-20 pb-28 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Soft Pink Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-[#FCE7F3] via-[#FDF2F8] to-[#FFE4E6] rounded-full blur-[140px] pointer-events-none -z-10"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-[#FCE7F3]/70 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <div className="text-center space-y-7 max-w-4xl mx-auto">
          <div className="gsap-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF1F7] border border-[#F3DCE8] text-[#BE185D] text-xs font-bold shadow-sm shadow-[#EC4899]/5">
            <Sparkles size={14} className="text-[#EC4899]" /> Next.js 16 & Supabase Creator Membership Platform
          </div>

          <h1 className="gsap-fade-up text-5xl sm:text-7xl lg:text-8xl font-black text-[#18181B] tracking-tight leading-[1.04]">
            Create. Connect. <span className="gradient-text">Grow.</span>
          </h1>

          <p className="gsap-fade-up text-base sm:text-xl text-[#71717A] max-w-2xl mx-auto leading-relaxed font-normal">
            Build your community, share exclusive experiences, create memberships, and grow your creator business with direct subscriber recurring revenue.
          </p>

          <div className="gsap-fade-up flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/auth/signup">
              <Button variant="primary" size="lg" leftIcon={<Sparkles size={18} />}>
                Start Creating
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" size="lg" rightIcon={<ChevronRight size={16} />}>
                Explore Creators
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating Social Creator Visual Mockup Grid */}
        <div className="gsap-fade-up mt-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Card 1: Subscription Unlock */}
          <div className="animate-float bg-white/95 backdrop-blur-md border border-[#F3DCE8] p-5 rounded-[24px] shadow-lg shadow-[#EC4899]/8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="Sarah Jenkins" size="sm" isVerified={true} />
                <div>
                  <h4 className="text-xs font-bold text-[#18181B]">Sarah Jenkins</h4>
                  <span className="text-[10px] text-[#71717A]">@sarahdesign</span>
                </div>
              </div>
              <Badge variant="pink" size="sm">Pro VIP</Badge>
            </div>
            <div className="p-3 bg-[#FFF1F7] rounded-2xl border border-[#F3DCE8] text-xs text-[#BE185D] font-semibold flex items-center justify-between">
              <span>Monthly Subscription</span>
              <span className="font-bold text-[#18181B]">$15.00/mo</span>
            </div>
            <p className="text-xs text-[#71717A] leading-relaxed">
              &ldquo;Access to 40+ Figma UI kits, weekly design masterclasses, and direct portfolio feedback.&rdquo;
            </p>
          </div>

          {/* Card 2: Interactive Reel Status */}
          <div className="animate-float-delayed bg-gradient-to-br from-white to-[#FFF1F7] border border-[#F3DCE8] p-5 rounded-[24px] shadow-lg shadow-[#EC4899]/8 space-y-3 md:-translate-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#BE185D] flex items-center gap-1.5">
                <Flame size={14} className="text-[#EC4899]" /> Trending Reel
              </span>
              <Badge variant="rose" size="sm">14.2k views</Badge>
            </div>
            <div className="relative h-28 rounded-2xl overflow-hidden bg-[#18181B]">
              <img src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600" alt="Reel preview" className="w-full h-full object-cover opacity-85" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-[#EC4899] shadow-md">
                  <Play size={18} className="ml-0.5 fill-[#EC4899]" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-[#71717A]">
              <span className="flex items-center gap-1 text-[#EC4899] font-bold"><Heart size={14} className="fill-[#EC4899]" /> 1,420</span>
              <span className="flex items-center gap-1"><MessageSquare size={14} /> 89 Comments</span>
            </div>
          </div>

          {/* Card 3: Creator Payout & Earnings */}
          <div className="animate-float bg-white/95 backdrop-blur-md border border-[#F3DCE8] p-5 rounded-[24px] shadow-lg shadow-[#EC4899]/8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#18181B]">Express Payout</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Completed</span>
            </div>
            <div className="text-2xl font-extrabold text-[#18181B]">
              $2,475.00 <span className="text-xs text-[#71717A] font-normal">net</span>
            </div>
            <div className="space-y-1.5 text-xs text-[#71717A]">
              <div className="flex justify-between"><span>Method</span><span className="text-[#18181B] font-semibold">Bank (•••• 4920)</span></div>
              <div className="flex justify-between"><span>Platform Fee</span><span className="text-[#BE123C] font-semibold">-5.0%</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Showcase */}
      <section id="showcase" className="px-6 py-20 bg-white/70 border-y border-[#F3DCE8]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2.5">
            <Badge variant="pink" size="md">Creator Showcase</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#18181B]">Top-Earning Educators & Artists</h2>
            <p className="text-[#71717A] text-sm max-w-md mx-auto">Join 10,000+ verified creators offering direct member subscriptions.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {Object.values(MOCK_CREATOR_DETAILS).map((creator) => (
              <Card key={creator.id} hoverable className="space-y-4">
                <div className="relative h-32 rounded-2xl overflow-hidden bg-[#FFF1F7] -mx-5 -mt-5 mb-2">
                  <img src={creator.coverImageUrl} alt={creator.fullName} className="w-full h-full object-cover" />
                </div>

                <div className="flex items-end justify-between -mt-12 relative z-10 px-1">
                  <Avatar alt={creator.fullName} src={creator.avatarUrl} size="xl" isVerified={creator.isVerified} />
                  <Badge variant="pink" size="md">From ${creator.startingPrice}/mo</Badge>
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-[#18181B]">{creator.fullName}</h3>
                  <p className="text-xs text-[#BE185D] font-semibold">@{creator.username} • {creator.category}</p>
                  <p className="text-xs text-[#71717A] mt-2 line-clamp-2 leading-relaxed">{creator.headline}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-[#71717A] border-t border-[#F3DCE8] pt-3 font-medium">
                  <span><strong className="text-[#18181B]">{creator.subscriberCount.toLocaleString()}</strong> VIP Members</span>
                  <span><strong className="text-[#18181B]">{creator.followerCount.toLocaleString()}</strong> Followers</span>
                </div>

                <Link href={`/c/${creator.username}`} className="block">
                  <Button variant="secondary" size="sm" className="w-full">
                    View Profile & Membership Plans
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section id="benefits" className="px-6 py-24 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2.5">
          <Badge variant="pink" size="md">Platform Features</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#18181B]">Everything You Need to Succeed</h2>
          <p className="text-[#71717A] text-sm max-w-md mx-auto">Designed specifically for creators, educators, coaches, and artists.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-7 space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] border border-[#FBCFE8] flex items-center justify-center text-[#EC4899] shadow-sm">
              <Lock size={22} />
            </div>
            <h3 className="font-bold text-lg text-[#18181B]">Tiered Memberships</h3>
            <p className="text-xs text-[#71717A] leading-relaxed font-normal">
              Create Starter, Premium, and VIP plans. Set custom 1, 3, 6, or 12 month subscription billing with recurring revenue.
            </p>
          </Card>

          <Card className="p-7 space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] border border-[#FBCFE8] flex items-center justify-center text-[#EC4899] shadow-sm">
              <Video size={22} />
            </div>
            <h3 className="font-bold text-lg text-[#18181B]">Reels & 24h Stories</h3>
            <p className="text-xs text-[#71717A] leading-relaxed font-normal">
              Publish vertical short reels and 24-hour status stories with viewer lists, likes, comments, and paywalled previews.
            </p>
          </Card>

          <Card className="p-7 space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] border border-[#FBCFE8] flex items-center justify-center text-[#EC4899] shadow-sm">
              <DollarSign size={22} />
            </div>
            <h3 className="font-bold text-lg text-[#18181B]">Fan Support & Payouts</h3>
            <p className="text-xs text-[#71717A] leading-relaxed font-normal">
              Receive tips directly on posts and stories. Request express payouts to Bank, Stripe, or Crypto with 95% net earnings.
            </p>
          </Card>
        </div>
      </section>

      {/* Earnings Simulator */}
      <section id="calculator" className="px-6 py-20 bg-white/70 border-y border-[#F3DCE8]">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <Badge variant="pink" size="md">Earnings Simulator</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#18181B]">See Your Potential Monthly Earnings</h2>

          <div className="bg-[#FFF9FC] border border-[#F3DCE8] rounded-[28px] p-8 sm:p-10 space-y-6 max-w-xl mx-auto shadow-lg shadow-[#EC4899]/5">
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold text-[#18181B]">
                <span>VIP Subscribers: {subscriberCount} members</span>
                <span className="text-[#EC4899]">${tierPrice}/mo per member</span>
              </div>
              <input
                type="range"
                min="50"
                max="2000"
                step="25"
                value={subscriberCount}
                onChange={(e) => setSubscriberCount(Number(e.target.value))}
                className="w-full accent-[#EC4899] bg-[#FCE7F3] rounded-lg cursor-pointer h-2.5"
              />
            </div>

            <div className="text-5xl sm:text-6xl font-black gradient-text tracking-tight">
              ${monthlyEarnings.toLocaleString()} <span className="text-xl font-bold text-[#71717A]">/ mo</span>
            </div>
            <p className="text-xs text-[#71717A] font-medium">95% net payout directly to your creator balance</p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="px-6 py-24 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2.5">
          <Badge variant="pink" size="md">Got Questions?</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#18181B]">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Card
              key={idx}
              className="p-5 cursor-pointer space-y-2.5 transition-all hover:border-[#F472B6]/60"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between font-bold text-sm sm:text-base text-[#18181B]">
                <span>{faq.q}</span>
                <ChevronRight
                  size={18}
                  className={`text-[#EC4899] transition-transform duration-200 shrink-0 ml-2 ${openFaq === idx ? 'rotate-90' : ''}`}
                />
              </div>
              {openFaq === idx && (
                <p className="text-xs sm:text-sm text-[#71717A] pt-2 leading-relaxed border-t border-[#F3DCE8]">
                  {faq.a}
                </p>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 bg-gradient-to-b from-white to-[#FFF1F7] border-t border-[#F3DCE8] text-center space-y-6">
        <h2 className="text-4xl sm:text-5xl font-black text-[#18181B] tracking-tight">Ready to Build Your Creator Business?</h2>
        <p className="text-sm sm:text-base text-[#71717A] max-w-lg mx-auto">
          Start sharing exclusive content, building memberships, and earning recurring income today.
        </p>
        <Link href="/auth/signup">
          <Button variant="primary" size="lg" leftIcon={<Sparkles size={18} />}>
            Start Creating Now
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#F3DCE8] px-6 py-8 text-center text-xs text-[#71717A] bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 CreatorPulse Platform Inc. Built with Next.js & Supabase.</span>
          <div className="flex items-center gap-5 text-[#71717A] font-semibold">
            <Link href="/feed" className="hover:text-[#EC4899]">Feed</Link>
            <Link href="/shorts" className="hover:text-[#EC4899]">Reels</Link>
            <Link href="/balance" className="hover:text-[#EC4899]">Balance</Link>
            <Link href="/database" className="hover:text-[#EC4899]">Supabase SQL</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
