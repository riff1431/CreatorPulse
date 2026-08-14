'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, ArrowRight, ShieldCheck, Users, Play, Heart, 
  Lock, Zap, CheckCircle2, Star, Database, ChevronRight, 
  HelpCircle, Gift, DollarSign, Video, MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { MOCK_CREATOR_DETAILS } from '@/lib/supabase/store';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';

export default function LandingPage() {
  const [subscriberCount, setSubscriberCount] = useState(300);
  const [tierPrice, setTierPrice] = useState(15);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const monthlyEarnings = Math.round(subscriberCount * tierPrice * 0.95);

  const faqs = [
    {
      q: 'How does membership billing work?',
      a: 'Creators define custom membership plans (Starter, Premium, VIP) with monthly or multi-month durations. Members get instant access to exclusive posts, code repositories, and private chat threads.'
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
      a: 'Yes. The application comes pre-built with PostgreSQL tables, Row Level Security (RLS) policies, and Supabase Auth client ready for instant live connection.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-pink-50 flex flex-col selection:bg-pink-500 selection:text-white">
      <RoleSwitcher />

      {/* Navigation Header */}
      <header className="border-b border-pink-500/20 px-6 py-4 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-pink-500/25">
            <Sparkles className="text-white" size={20} />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Creator<span className="gradient-text">Pulse</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-pink-200/80 font-medium">
          <a href="#features" className="hover:text-pink-300 transition-colors">Features</a>
          <a href="#showcase" className="hover:text-pink-300 transition-colors">Creators</a>
          <a href="#benefits" className="hover:text-pink-300 transition-colors">Benefits</a>
          <a href="#faq" className="hover:text-pink-300 transition-colors">FAQ</a>
          <Link href="/database" className="hover:text-pink-300 transition-colors flex items-center gap-1 text-pink-300/90">
            <Database size={14} /> Supabase Schema
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/feed">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
              Launch App
            </Button>
          </Link>
        </div>
      </header>

      {/* PRD Hero Section */}
      <section className="relative px-6 py-24 max-w-7xl mx-auto w-full text-center space-y-8 overflow-hidden">
        {/* Glowing Pink/Rose Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-r from-pink-500/15 via-rose-500/15 to-fuchsia-500/15 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-semibold shadow-sm shadow-pink-500/15">
          <Sparkles size={14} className="text-pink-400" /> Next.js 15 & Supabase Creator Membership Platform
        </div>

        {/* PRD Section 23 Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.05] max-w-4xl mx-auto">
          Create. Connect. <span className="gradient-text">Grow.</span>
        </h1>

        {/* PRD Section 23 Supporting Text */}
        <p className="text-base sm:text-xl text-pink-100/90 max-w-2xl mx-auto leading-relaxed font-normal">
          Build your community, share exclusive experiences, create memberships, and grow your creator business with direct subscriber recurring revenue.
        </p>

        {/* PRD Section 23 Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
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

        {/* Feature Pills */}
        <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-xs text-pink-100">
          <div className="glass-card p-3 flex items-center justify-center gap-2 border-pink-500/20 hover:border-pink-500/40 transition-colors">
            <Lock size={16} className="text-pink-400" /> Tiered Memberships
          </div>
          <div className="glass-card p-3 flex items-center justify-center gap-2 border-pink-500/20 hover:border-pink-500/40 transition-colors">
            <Video size={16} className="text-pink-400" /> Vertical Reels & Shorts
          </div>
          <div className="glass-card p-3 flex items-center justify-center gap-2 border-pink-500/20 hover:border-pink-500/40 transition-colors">
            <Zap size={16} className="text-pink-400" /> 24h Ephemeral Stories
          </div>
          <div className="glass-card p-3 flex items-center justify-center gap-2 border-pink-500/20 hover:border-pink-500/40 transition-colors">
            <Gift size={16} className="text-pink-400" /> Fan Support & Tips
          </div>
        </div>
      </section>

      {/* Creator Showcase */}
      <section id="showcase" className="px-6 py-16 bg-pink-950/20 border-y border-pink-500/15">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <Badge variant="pink" size="md">Creator Showcase</Badge>
            <h2 className="text-3xl font-black text-pink-50">Top-Earning Educators & Artists</h2>
            <p className="text-pink-200/70 text-sm">Join 10,000+ creators offering direct member subscriptions.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {Object.values(MOCK_CREATOR_DETAILS).map((creator) => (
              <Card key={creator.id} hoverable className="space-y-4 border-pink-500/20 hover:border-pink-500/40">
                <div className="relative h-28 rounded-xl overflow-hidden bg-pink-950/60 -mx-5 -mt-5 mb-2">
                  <img src={creator.coverImageUrl} alt={creator.fullName} className="w-full h-full object-cover opacity-90" />
                </div>

                <div className="flex items-end justify-between -mt-10 relative z-10 px-1">
                  <Avatar alt={creator.fullName} src={creator.avatarUrl} size="xl" isVerified={creator.isVerified} />
                  <Badge variant="pink" size="md">From ${creator.startingPrice}/mo</Badge>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-pink-50">{creator.fullName}</h3>
                  <p className="text-xs text-pink-300 font-medium">@{creator.username} • {creator.category}</p>
                  <p className="text-xs text-pink-200/80 mt-2 line-clamp-2">{creator.headline}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-pink-300/70 border-t border-pink-500/15 pt-3">
                  <span><strong className="text-pink-100">{creator.subscriberCount.toLocaleString()}</strong> VIP Members</span>
                  <span><strong className="text-pink-100">{creator.followerCount.toLocaleString()}</strong> Followers</span>
                </div>

                <Link href={`/c/${creator.username}`} className="block">
                  <Button variant="primary" size="sm" className="w-full">
                    View Profile & Membership Plans
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Membership & Creator Benefits Grid */}
      <section id="benefits" className="px-6 py-20 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <Badge variant="pink" size="md">Platform Features</Badge>
          <h2 className="text-3xl font-black text-pink-50">Everything You Need to Succeed</h2>
          <p className="text-pink-200/70 text-sm">Designed specifically for creators, educators, coaches, and artists.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 border-pink-500/20 hover:border-pink-500/40">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Lock size={20} />
            </div>
            <h3 className="font-bold text-lg text-pink-50">Tiered Memberships</h3>
            <p className="text-xs text-pink-200/70 leading-relaxed">
              Create Starter, Premium, and VIP plans. Set custom 1, 3, 6, or 12 month subscription billing.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-pink-500/20 hover:border-pink-500/40">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Video size={20} />
            </div>
            <h3 className="font-bold text-lg text-pink-50">Reels & Stories</h3>
            <p className="text-xs text-pink-200/70 leading-relaxed">
              Publish vertical short reels and 24-hour status stories with viewer lists and custom paywalls.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-pink-500/20 hover:border-pink-500/40">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <DollarSign size={20} />
            </div>
            <h3 className="font-bold text-lg text-pink-50">Fan Support & Payouts</h3>
            <p className="text-xs text-pink-200/70 leading-relaxed">
              Receive tips directly on posts and stories. Request express payouts to Bank, Stripe, or Crypto.
            </p>
          </Card>
        </div>
      </section>

      {/* Revenue Calculator */}
      <section className="px-6 py-16 bg-pink-950/20 border-y border-pink-500/15">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <Badge variant="pink" size="md">Earnings Simulator</Badge>
          <h2 className="text-3xl font-black text-pink-50">See Your Potential Monthly Earnings</h2>

          <div className="glass-card p-8 space-y-6 max-w-xl mx-auto border-pink-500/25 shadow-xl shadow-pink-500/10">
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-semibold text-pink-200">
                <span>VIP Subscribers: {subscriberCount} members</span>
                <span className="text-pink-400 font-bold">${tierPrice}/mo per member</span>
              </div>
              <input
                type="range"
                min="50"
                max="2000"
                step="25"
                value={subscriberCount}
                onChange={(e) => setSubscriberCount(Number(e.target.value))}
                className="w-full accent-pink-500 bg-pink-950/50 rounded-lg cursor-pointer"
              />
            </div>

            <div className="text-5xl font-black gradient-text">${monthlyEarnings.toLocaleString()} / mo</div>
            <p className="text-xs text-pink-300/70">95% net payout directly to your creator balance</p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="px-6 py-20 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="pink" size="md">Got Questions?</Badge>
          <h2 className="text-3xl font-black text-pink-50">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Card
              key={idx}
              className="p-4 cursor-pointer space-y-2 transition-all border-pink-500/20 hover:border-pink-500/40"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between font-bold text-sm text-pink-100">
                <span>{faq.q}</span>
                <ChevronRight
                  size={16}
                  className={`text-pink-400 transition-transform ${openFaq === idx ? 'rotate-90' : ''}`}
                />
              </div>
              {openFaq === idx && (
                <p className="text-xs text-pink-200/80 pt-1 leading-relaxed border-t border-pink-500/15">
                  {faq.a}
                </p>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 bg-gradient-to-b from-slate-950 to-pink-950/30 border-t border-pink-500/20 text-center space-y-6">
        <h2 className="text-4xl font-black text-white">Ready to Build Your Creator Business?</h2>
        <p className="text-sm text-pink-200/70 max-w-lg mx-auto">
          Start sharing exclusive content, building memberships, and earning recurring income today.
        </p>
        <Link href="/auth/signup">
          <Button variant="primary" size="lg" leftIcon={<Sparkles size={18} />}>
            Start Creating Now
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-pink-500/15 px-6 py-8 text-center text-xs text-pink-300/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 CreatorPulse Platform Inc. Built with Next.js & Supabase.</span>
          <div className="flex items-center gap-4 text-pink-300/70">
            <Link href="/feed" className="hover:text-pink-300">Feed</Link>
            <Link href="/shorts" className="hover:text-pink-300">Reels</Link>
            <Link href="/balance" className="hover:text-pink-300">Balance</Link>
            <Link href="/database" className="hover:text-pink-300">Supabase SQL</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
