'use client';

import React from 'react';
import { 
  Check, X, Sparkles, Zap, Crown, Star, 
  HelpCircle, ArrowRight, ShieldCheck, CheckCircle2,
  Lock, Flame, Layers
} from 'lucide-react';
import { CreatorTier } from '@/lib/memberships/membership-store';
import { buildTierComparisonMatrix } from '@/lib/memberships/entitlement-service';
import { Button } from '@/components/ui/Button';

interface TierComparisonMatrixProps {
  tiers: CreatorTier[];
  onSelectTier?: (tier: CreatorTier) => void;
  activeTierId?: string;
}

export function TierComparisonMatrix({
  tiers,
  onSelectTier,
  activeTierId,
}: TierComparisonMatrixProps) {
  const activeTiers = tiers.filter((t) => t.status === 'active');
  const matrixRows = buildTierComparisonMatrix(activeTiers);

  if (activeTiers.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#EC4899]">
            <Layers size={13} />
            <span>Package Perks Matrix</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-[#18181B] dark:text-[#FDF2F8] tracking-tight">
            Tier Advantages &amp; Facility Breakdown
          </h3>
        </div>
        <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] font-medium max-w-sm">
          Compare included facilities, content access limits, and unlock level per package.
        </p>
      </div>

      {/* Comparison Table Container (Horizontal scroll on mobile) */}
      <div className="rounded-3xl border border-[#F3DCE8] dark:border-[#3A2A4C] bg-white dark:bg-[#150D1E] overflow-hidden shadow-xs">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[620px]">
            {/* Table Header: Tier Names & Pricing */}
            <thead>
              <tr className="border-b border-[#F3DCE8] dark:border-[#3A2A4C] bg-[#FFF9FC]/70 dark:bg-[#1C1026]/70">
                <th className="p-4 sm:p-5 text-xs font-black uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA] w-2/5">
                  Package Facilities &amp; Perks
                </th>
                {activeTiers.map((tier) => {
                  const isCurrent = activeTierId === tier.id;
                  return (
                    <th
                      key={tier.id}
                      className={`p-4 sm:p-5 text-center transition-all ${
                        tier.popular ? 'bg-pink-50/50 dark:bg-pink-950/20' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        {tier.popular && (
                          <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white shadow-2xs">
                            <Sparkles size={9} /> Popular
                          </span>
                        )}
                        <p className="text-xs sm:text-sm font-black text-[#18181B] dark:text-[#FDF2F8] truncate">
                          {tier.name}
                        </p>
                        <p className="text-sm sm:text-base font-black text-[#EC4899]">
                          ${tier.priceMonthly.toFixed(2)}
                          <span className="text-[10px] font-semibold text-[#71717A] dark:text-[#A1A1AA]">/mo</span>
                        </p>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body: Feature Rows */}
            <tbody className="divide-y divide-[#F3DCE8]/60 dark:divide-[#3A2A4C]/60 text-xs font-semibold">
              {matrixRows.map((row) => (
                <tr key={row.key} className="hover:bg-[#FFF9FC]/40 dark:hover:bg-[#1C1026]/40 transition-colors">
                  <td className="p-3.5 sm:p-4 text-[#18181B] dark:text-[#FDF2F8] flex items-center justify-between gap-2">
                    <span className="font-bold">{row.name}</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#71717A] dark:text-[#A1A1AA]">
                      {row.category}
                    </span>
                  </td>

                  {activeTiers.map((tier) => {
                    const isIncluded = row.tiers[tier.id];
                    return (
                      <td key={tier.id} className="p-3.5 sm:p-4 text-center">
                        {isIncluded ? (
                          <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                            <Check size={14} className="stroke-[3]" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                            <X size={13} className="stroke-[2]" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            {/* Table Footer: Action CTA Buttons */}
            {onSelectTier && (
              <tfoot>
                <tr className="border-t border-[#F3DCE8] dark:border-[#3A2A4C] bg-[#FFF9FC]/50 dark:bg-[#1C1026]/50">
                  <td className="p-4 text-xs font-bold text-[#71717A] dark:text-[#A1A1AA]">
                    Choose a pass to join
                  </td>
                  {activeTiers.map((tier) => {
                    const isCurrent = activeTierId === tier.id;
                    return (
                      <td key={tier.id} className="p-4 text-center">
                        <Button
                          variant={tier.popular ? 'primary' : 'outline'}
                          size="sm"
                          className="w-full text-xs font-black cursor-pointer shadow-2xs"
                          onClick={() => onSelectTier(tier)}
                        >
                          {isCurrent ? 'Current Plan' : 'Join Tier'}
                        </Button>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
