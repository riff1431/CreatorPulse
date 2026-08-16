'use client';

import React, { useState, useEffect } from 'react';
import { Percent, Save, Layers, DollarSign, Crown, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { PlatformFeeConfig, savePlatformFeeConfig } from '@/lib/payments/tax-fee-store';

interface PlatformFeeTabProps {
  config: PlatformFeeConfig;
  onRefresh: () => void;
}

export const PlatformFeeTab: React.FC<PlatformFeeTabProps> = ({ config, onRefresh }) => {
  const [formData, setFormData] = useState<PlatformFeeConfig>(config);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleTierOverrideChange = (index: number, val: number) => {
    const updated = [...(formData.tierOverrides || [])];
    updated[index] = { ...updated[index], platformFeePercentage: val };
    setFormData({ ...formData, tierOverrides: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePlatformFeeConfig(formData);
    alert('Platform fee configuration and creator tier overrides saved successfully.');
    onRefresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Percent className="text-indigo-400" size={22} />
            <h2 className="text-lg font-black text-white">Platform Fees & Creator Revenue Splits</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Define global platform commission percentages, fixed base fees, minimum platform charges, and creator membership tier fee overrides.
          </p>
        </div>

        <Button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shrink-0 cursor-pointer"
          leftIcon={<Save size={15} />}
        >
          Save Fee Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Base Platform Rules */}
        <Card className="space-y-4 border border-slate-200">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Default Platform Fees</h3>
            <p className="text-xs text-slate-500 font-medium">Applied to standard non-overridden transactions.</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Base Platform Fee Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.defaultPlatformFeePercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultPlatformFeePercentage: parseFloat(e.target.value) || 0,
                    creatorCommissionPercentage: 100 - (parseFloat(e.target.value) || 0)
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-indigo-700 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                Default creator payout share: <strong className="text-emerald-600">{formData.creatorCommissionPercentage}%</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Fixed Fee ($ per transaction)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fixedFeeAmount}
                  onChange={(e) => setFormData({ ...formData, fixedFeeAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Minimum Fee ($ floor)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minimumFeeAmount}
                  onChange={(e) => setFormData({ ...formData, minimumFeeAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Creator Tier Overrides */}
        <Card className="space-y-4 border border-slate-200">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Creator Membership Tier Overrides</h3>
              <p className="text-xs text-slate-500 font-medium">Special platform fee discounts per creator tier.</p>
            </div>
            <Crown size={18} className="text-amber-500" />
          </div>

          <div className="space-y-3 text-xs">
            {formData.tierOverrides?.map((tier, idx) => (
              <div key={tier.tierLevel} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <div className="font-extrabold text-slate-900">Tier {tier.tierLevel}: {tier.tierName}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Creator receives {100 - tier.platformFeePercentage}% net</div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    step="0.1"
                    value={tier.platformFeePercentage}
                    onChange={(e) => handleTierOverrideChange(idx, parseFloat(e.target.value) || 0)}
                    className="w-20 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-right font-black text-indigo-700 focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                  <span className="font-bold text-slate-500">% fee</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </form>
  );
};
