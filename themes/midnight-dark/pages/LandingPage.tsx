'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Lock, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Navbar } from '../components/Navbar';
import { Footer } from '@/components/layout/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-white selection:bg-[#8B5CF6] selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Cyber Hero */}
        <section className="relative pt-20 pb-24 overflow-hidden border-b border-[#334155]/60">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#8B5CF6]/30 via-[#06B6D4]/20 to-transparent blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E293B] border border-[#8B5CF6]/40 text-xs font-bold text-[#06B6D4] shadow-lg shadow-[#8B5CF6]/10">
              <Sparkles size={14} className="text-[#8B5CF6]" />
              <span>Next-Gen Theme Override Engine • Midnight Cyber</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-[1.1]">
              Empower Your <span className="bg-gradient-to-r from-[#8B5CF6] via-[#06B6D4] to-pink-500 bg-clip-text text-transparent">Creative Universe</span> in Deep Cyberpunk Dark
            </h1>

            <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto font-medium leading-relaxed">
              Monetize memberships, exclusive drops, high-bitrate livestreams, and VIP communities with ultra-low platform fees.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white shadow-xl shadow-[#8B5CF6]/25">
                  Launch Creator Hub <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/feed">
                <Button variant="outline" size="lg" className="border-[#334155] bg-[#0F172A]/80 text-[#F8FAFC] hover:bg-[#1E293B]">
                  Explore Live Feed
                </Button>
              </Link>
            </div>

            {/* Overrides vs Fallback Indicator Banner */}
            <div className="max-w-xl mx-auto mt-12 p-4 rounded-2xl bg-[#0F172A] border border-[#334155] text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#06B6D4] flex items-center gap-1.5">
                  <Zap size={14} /> Theme Override Engine Active
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Zero Broken Pages
                </span>
              </div>
              <p className="text-[#94A3B8]">
                This page uses the <strong>Midnight Cyber</strong> override for <code>LandingPage</code>, <code>MainLayout</code>, and <code>Navbar</code>. All remaining views (Feed, Dashboard, Profile, etc.) safely inherit from <strong>Default Theme</strong>!
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
