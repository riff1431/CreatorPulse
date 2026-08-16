'use client';

import React from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export const PipraPayWidget: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
      <div className="flex items-center gap-2 mb-2">
        <CreditCard className="text-emerald-600" size={18} />
        <h4 className="text-xs font-bold text-[#18181B]">PipraPay Multi-Gateway Active</h4>
      </div>
      <p className="text-[11px] text-slate-600">
        Accepting bKash, Nagad, Rocket, Upay, Visa, MasterCard, and Amex with automatic webhook resolution.
      </p>
    </div>
  );
};

export default PipraPayWidget;
