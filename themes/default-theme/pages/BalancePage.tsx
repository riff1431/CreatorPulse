'use client';

import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export function BalancePage() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Wallet & Payouts</h1>
          <p className="text-xs text-[#71717A]">Manage balances and deposit funds</p>
        </div>
      </div>
    </MainLayout>
  );
}

export default BalancePage;
