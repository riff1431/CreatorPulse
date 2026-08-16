'use client';

import React, { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, DollarSign, CreditCard, 
  ShieldCheck, CheckCircle2, Clock, Landmark, Plus, Sparkles 
} from 'lucide-react';

interface Transaction {
  id: string;
  title: string;
  type: 'earning' | 'tip' | 'payout' | 'deposit';
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

const TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', title: 'Monthly VIP Subscriptions Payout', type: 'earning', amount: 840.00, date: 'Today, 2:30 PM', status: 'completed' },
  { id: 'tx-2', title: 'Fan Tip from Alex Vance', type: 'tip', amount: 25.00, date: 'Yesterday', status: 'completed' },
  { id: 'tx-3', title: 'Express Bank Payout to Checking', type: 'payout', amount: -650.00, date: 'Aug 14, 2026', status: 'completed' },
  { id: 'tx-4', title: 'Video Masterclass Pass Unlock', type: 'earning', amount: 15.00, date: 'Aug 12, 2026', status: 'completed' },
];

export function BalancePage() {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('200');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setShowPayoutModal(false);
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="text-[#EC4899]" size={24} />
              <h1 className="text-xl sm:text-2xl font-black text-[#18181B] dark:text-[#FDF2F8] tracking-tight">
                Wallet & Payouts
              </h1>
            </div>
            <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
              Manage your available earnings, request express payouts, and review transaction history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowDownLeft size={14} />}
              onClick={() => setShowDepositModal(true)}
            >
              Deposit
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ArrowUpRight size={14} />}
              onClick={() => setShowPayoutModal(true)}
            >
              Withdraw
            </Button>
          </div>
        </div>

        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-6 space-y-2 bg-gradient-to-br from-[#FFF1F7] to-white dark:from-[#241A30] dark:to-[#1A1222]">
            <span className="text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] uppercase tracking-wider block">
              Available Balance
            </span>
            <div className="text-3xl font-black text-[#18181B] dark:text-[#FDF2F8] tracking-tight">
              $1,450.00
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> Ready for instant payout
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <span className="text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] uppercase tracking-wider block">
              Pending Clearings
            </span>
            <div className="text-3xl font-black text-[#18181B] dark:text-[#FDF2F8] tracking-tight">
              $320.00
            </div>
            <p className="text-[11px] text-[#A1A1AA] dark:text-[#8E7890] font-medium flex items-center gap-1">
              <Clock size={12} /> Clears within 24-48 hours
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <span className="text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] uppercase tracking-wider block">
              Lifetime Earned
            </span>
            <div className="text-3xl font-black text-[#EC4899] tracking-tight">
              $14,600.00
            </div>
            <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] font-medium">
              Net 95% creator distribution
            </p>
          </Card>
        </div>

        {/* Linked Accounts */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-3">
            <h3 className="font-black text-sm text-[#18181B] dark:text-[#FDF2F8]">Linked Payout Accounts</h3>
            <Badge variant="emerald" size="sm">
              <ShieldCheck size={12} /> Verified
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-[#F3DCE8] dark:border-[#3A2A4C] bg-[#FFF9FC] dark:bg-[#241A30] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-[#EC4899] flex items-center justify-center">
                  <Landmark size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#18181B] dark:text-[#FDF2F8]">Direct Bank Checking</h4>
                  <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">Chase •••• 4892 (Primary)</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-[#F3DCE8] dark:border-[#3A2A4C] bg-[#FFF9FC] dark:bg-[#241A30] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#18181B] dark:text-[#FDF2F8]">Debit Card Fast Payout</h4>
                  <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">Visa •••• 1024</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                Connected
              </span>
            </div>
          </div>
        </Card>

        {/* Transaction History Ledger */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-3">
            <h3 className="font-black text-sm text-[#18181B] dark:text-[#FDF2F8]">Recent Activity</h3>
            <span className="text-xs text-[#71717A] dark:text-[#D4B8D0] font-medium">Last 30 Days</span>
          </div>

          <div className="space-y-3">
            {TRANSACTIONS.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl border border-[#F3DCE8] dark:border-[#3A2A4C] bg-[#FFF9FC] dark:bg-[#241A30]/50 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.amount > 0
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                    }`}
                  >
                    {tx.amount > 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#18181B] dark:text-[#FDF2F8]">{tx.title}</h4>
                    <p className="text-[10px] text-[#71717A] dark:text-[#D4B8D0]">{tx.date}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black text-xs block ${
                      tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {tx.amount > 0 ? `+` : ''}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Payout Modal */}
        <Modal
          isOpen={showPayoutModal}
          onClose={() => setShowPayoutModal(false)}
          title="Request Instant Payout"
          description="Transfer your earnings directly to your connected bank account or debit card."
        >
          {payoutSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="font-bold text-sm">Payout Initiated!</h4>
              <p className="text-xs text-slate-500">Funds should reflect in your bank account in 30 minutes.</p>
            </div>
          ) : (
            <form onSubmit={handleRequestPayout} className="space-y-4">
              <Input
                label="Payout Amount ($)"
                type="number"
                max="1450"
                min="10"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                helperText="Maximum available balance: $1,450.00"
              />

              <div className="p-3 bg-[#FFF1F7] dark:bg-[#381A2B] rounded-xl border border-[#FBCFE8] dark:border-[#4C1D3B] text-[11px] text-[#BE185D] dark:text-[#F472B6]">
                Destination: Chase Checking (•••• 4892)
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={() => setShowPayoutModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="flex-1">
                  Confirm Payout
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Deposit Modal */}
        <Modal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          title="Deposit Funds into Wallet"
          description="Add funds to support creators, unlock VIP drops, and tip masterclasses."
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Amount ($)</label>
              <div className="grid grid-cols-4 gap-2">
                {['$10', '$25', '$50', '$100'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className="p-2 bg-[#FFF9FC] dark:bg-[#241A30] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#EC4899] rounded-xl text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => setShowDepositModal(false)}
            >
              Continue to Secure Checkout
            </Button>
          </div>
        </Modal>

      </div>
    </MainLayout>
  );
}

export default BalancePage;
