'use client';

import React from 'react';
import { Sparkles, Shield, Zap, Globe, Cpu, Layers } from 'lucide-react';

const PARTNERS = [
  { name: 'Linear', icon: '⚡ Linear' },
  { name: 'Mercury', icon: '💎 Mercury' },
  { name: 'Miro', icon: '🎨 Miro' },
  { name: 'Databricks', icon: '📊 Databricks' },
  { name: 'Stripe', icon: '💳 Stripe Payouts' },
  { name: 'Figma', icon: '✨ Figma Community' },
  { name: 'Supabase', icon: '⚡ Supabase Auth' },
  { name: 'Agora', icon: '📡 Agora Realtime' },
];

export const BrandTicker: React.FC = () => {
  return (
    <section className="py-12 border-y border-[#F3DCE8] dark:border-[#3A2A4C] bg-[#FFF9FC]/60 dark:bg-[#140D1C]/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-4 mb-6">
        <p className="text-[11px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#D4B8D0]">
          Trusted by top creators, growth hackers & digital artists
        </p>
      </div>

      <div className="relative w-full flex overflow-x-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
        {/* Infinite Marquee Content */}
        <div className="flex shrink-0 items-center gap-10 sm:gap-16 animate-marquee py-2">
          {PARTNERS.concat(PARTNERS).map((partner, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs sm:text-sm font-black text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] dark:hover:text-[#F472B6] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{partner.icon}</span>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-10 sm:gap-16 animate-marquee py-2" aria-hidden="true">
          {PARTNERS.concat(PARTNERS).map((partner, idx) => (
            <div
              key={`repeat-${idx}`}
              className="flex items-center gap-2 text-xs sm:text-sm font-black text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] dark:hover:text-[#F472B6] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{partner.icon}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandTicker;
