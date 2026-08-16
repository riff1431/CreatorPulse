'use client';

import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { calculateTaxAndFees, PaymentType } from '@/lib/payments/tax-fee-store';

interface CheckoutFeeBreakdownProps {
  baseAmount: number;
  currency?: string;
  countryCode?: string;
  paymentType?: PaymentType;
  gatewayId?: string;
  creatorTierLevel?: number;
  className?: string;
}

export const CheckoutFeeBreakdown: React.FC<CheckoutFeeBreakdownProps> = ({
  baseAmount,
  currency = 'USD',
  countryCode = 'US',
  paymentType = 'checkout',
  gatewayId = 'plugin-stripe',
  creatorTierLevel = 1,
  className = ''
}) => {
  const calc = calculateTaxAndFees({
    baseAmount,
    currency,
    countryCode,
    paymentType,
    gatewayId,
    creatorTierLevel
  });

  return (
    <div className={`p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs text-slate-700 font-medium ${className}`}>
      <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
        <span>Payment Summary</span>
        <span className="text-[10px] text-slate-400 font-mono uppercase">{countryCode} • {gatewayId.replace('plugin-', '')}</span>
      </div>

      {/* Subtotal */}
      <div className="flex justify-between">
        <span className="text-slate-600">Base Item Price</span>
        <span className="font-semibold">{currency} ${calc.baseAmount.toFixed(2)}</span>
      </div>

      {/* Tax */}
      <div className="flex justify-between">
        <span className="text-slate-600 flex items-center gap-1">
          {calc.taxRuleName} ({calc.taxRate}%)
          {calc.isInclusiveTax && <span className="text-[9px] bg-slate-200 px-1 py-0.2 rounded text-slate-600">Included</span>}
        </span>
        <span className="font-semibold text-slate-800">
          {calc.isInclusiveTax ? 'Includes ' : '+'}${calc.taxAmount.toFixed(2)}
        </span>
      </div>

      {/* Processing Surcharge */}
      {calc.chargeModel === 'pass_to_buyer' && calc.gatewayProcessingFee > 0 && (
        <div className="flex justify-between text-indigo-700 font-semibold">
          <span>Payment Processing Surcharge</span>
          <span>+${calc.gatewayProcessingFee.toFixed(2)}</span>
        </div>
      )}

      {/* Grand Total */}
      <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
        <span>Total Charged</span>
        <span className="text-indigo-600">${calc.buyerTotal.toFixed(2)} {currency}</span>
      </div>
    </div>
  );
};
