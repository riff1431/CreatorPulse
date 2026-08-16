'use client';

import React, { useState } from 'react';
import { Calculator, DollarSign, Globe, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { calculateTaxAndFees, PaymentType } from '@/lib/payments/tax-fee-store';

export const FeeCalculatorSimulatorTab: React.FC = () => {
  const [baseAmount, setBaseAmount] = useState<number>(30.0);
  const [currency, setCurrency] = useState<string>('USD');
  const [countryCode, setCountryCode] = useState<string>('US');
  const [paymentType, setPaymentType] = useState<PaymentType>('subscription');
  const [gatewayId, setGatewayId] = useState<string>('plugin-stripe');
  const [creatorTierLevel, setCreatorTierLevel] = useState<number>(2);

  const calc = calculateTaxAndFees({
    baseAmount,
    currency,
    countryCode,
    paymentType,
    gatewayId,
    creatorTierLevel
  });

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white p-6 rounded-2xl border border-indigo-800 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="text-indigo-400" size={24} />
          <div>
            <h2 className="text-lg font-black text-white">Real-Time Server-Side Fee Calculator Simulator</h2>
            <p className="text-xs text-slate-300">
              Simulate tax rates, platform fee splits, gateway processing surcharges, creator earnings, and total charged to buyer.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 my-4 text-xs font-medium">
          {/* Base Amount & Currency */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold">Base Item Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={baseAmount}
              onChange={(e) => setBaseAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-black text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Country / Region */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold">Customer Country / Region</label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-400"
            >
              <option value="US">United States (8% Sales Tax)</option>
              <option value="EU">European Union (20% Inclusive VAT)</option>
              <option value="GB">United Kingdom (20% Inclusive VAT)</option>
              <option value="CA">Canada (13% HST)</option>
              <option value="AU">Australia (10% GST)</option>
              <option value="BD">Bangladesh (5% VAT)</option>
              <option value="GLOBAL">Global Fallback (5% Tax)</option>
            </select>
          </div>

          {/* Payment Type */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold">Payment Type</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-400"
            >
              <option value="subscription">Subscription Membership</option>
              <option value="checkout">One-Time Premium Unlock</option>
              <option value="tip">Creator Fan Support / Tip</option>
              <option value="wallet_funding">Wallet Balance Top-Up</option>
            </select>
          </div>

          {/* Payment Gateway */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold">Payment Gateway</label>
            <select
              value={gatewayId}
              onChange={(e) => setGatewayId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-400"
            >
              <option value="plugin-stripe">Stripe (2.9% + $0.30 - Pass to Buyer)</option>
              <option value="plugin-paypal">PayPal (3.49% + $0.49 - Pass to Buyer)</option>
              <option value="plugin-piprapay">PipraPay (1.5% - Absorb by Platform)</option>
              <option value="plugin-mock">Mock Gateway (0% - Free)</option>
            </select>
          </div>

          {/* Creator Tier */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold">Creator Membership Tier</label>
            <select
              value={creatorTierLevel}
              onChange={(e) => setCreatorTierLevel(parseInt(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-400"
            >
              <option value={1}>Tier 1: Starter (10% Platform Fee)</option>
              <option value={2}>Tier 2: Pro Creator (7.5% Platform Fee)</option>
              <option value={3}>Tier 3: VIP Inner Circle (5% Platform Fee)</option>
            </select>
          </div>
        </div>

        {/* Breakdown Output Cards */}
        <div className="bg-slate-950/90 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="text-sm font-bold text-white">Calculation Breakdown Output</div>
            <Badge variant="indigo" size="sm">
              Tax Rule: {calc.taxRuleName} ({calc.taxRate}%)
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Base Price</div>
              <div className="text-sm font-black text-white">${calc.baseAmount.toFixed(2)}</div>
            </div>

            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Tax ({calc.taxRate}%)</div>
              <div className="text-sm font-black text-indigo-400">+${calc.taxAmount.toFixed(2)}</div>
              <div className="text-[9px] text-slate-400">{calc.isInclusiveTax ? 'Inclusive' : 'Exclusive'}</div>
            </div>

            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Platform Fee ({calc.platformFeeRate}%)</div>
              <div className="text-sm font-black text-amber-400">${calc.platformFeeAmount.toFixed(2)}</div>
            </div>

            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Gateway Fee</div>
              <div className="text-sm font-black text-slate-300">${calc.gatewayProcessingFee.toFixed(2)}</div>
              <div className="text-[9px] text-slate-400 uppercase">{calc.chargeModel.replace(/_/g, ' ')}</div>
            </div>

            <div className="p-3 bg-emerald-600/20 border border-emerald-500/30 rounded-lg">
              <div className="text-[10px] text-emerald-300 uppercase font-bold">Creator Net Earning</div>
              <div className="text-base font-black text-emerald-400">${calc.creatorNetEarning.toFixed(2)}</div>
            </div>
          </div>

          <div className="p-4 bg-indigo-600/20 border border-indigo-500/40 rounded-xl flex items-center justify-between">
            <span className="font-extrabold text-sm text-white">Final Total Charged to Customer at Checkout:</span>
            <span className="text-xl font-black text-amber-300">${calc.buyerTotal.toFixed(2)} {calc.currency}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
