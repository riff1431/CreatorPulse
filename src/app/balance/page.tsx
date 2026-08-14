'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Wallet, DollarSign, ArrowUpRight, ArrowDownLeft, PlusCircle, 
  CreditCard, ShieldCheck, Clock, CheckCircle2, AlertCircle, X 
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  MOCK_BALANCE, MOCK_TRANSACTIONS, TransactionRecord, 
  MOCK_PAYOUT_REQUESTS, PayoutRequest 
} from '@/lib/supabase/store';

export default function BalancePage() {
  const [balance, setBalance] = useState(MOCK_BALANCE);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(MOCK_TRANSACTIONS);
  const [payouts, setPayouts] = useState<PayoutRequest[]>(MOCK_PAYOUT_REQUESTS);
  
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('50');
  
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('500');
  const [payoutMethod, setPayoutMethod] = useState('Bank Transfer');
  const [accountDetails, setAccountDetails] = useState('Chase Bank - Routing: 122000247');

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(topUpAmount) || 0;
    if (val <= 0) return;

    setBalance({
      ...balance,
      availableBalance: balance.availableBalance + val
    });

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      date: 'Today',
      type: 'Top-Up',
      description: 'Wallet Balance Deposit',
      recipientOrSender: 'Visa Card (•••• 8821)',
      amount: val,
      platformFee: 0,
      netAmount: val,
      status: 'Completed'
    };

    setTransactions([newTx, ...transactions]);
    setShowTopUpModal(false);
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(payoutAmount) || 0;
    if (val <= 0 || val > balance.creatorTotalEarnings) return;

    const fee = Math.round(val * 0.01 * 100) / 100;
    const newPayout: PayoutRequest = {
      id: `pay-${Date.now()}`,
      creatorId: 'user-creator-1',
      creatorName: 'Sarah Jenkins',
      amount: val,
      processingFee: fee,
      netPayout: val - fee,
      payoutMethod,
      accountDetails,
      status: 'Pending',
      requestedAt: 'Just now'
    };

    setPayouts([newPayout, ...payouts]);
    setShowPayoutModal(false);
  };

  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 space-y-6 max-w-4xl mx-auto lg:mx-0 w-full pb-20 lg:pb-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3DCE8] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Wallet className="text-[#EC4899]" size={24} />
                <h1 className="text-2xl font-black text-[#18181B]">Account Balance & Wallet</h1>
              </div>
              <p className="text-xs text-[#71717A] font-medium">Manage member funds, transaction ledger, and creator payout requests.</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<PlusCircle size={14} />}
                onClick={() => setShowTopUpModal(true)}
              >
                Top-Up Balance
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<ArrowUpRight size={14} />}
                onClick={() => setShowPayoutModal(true)}
              >
                Request Payout
              </Button>
            </div>
          </div>

          {/* Metric Overview Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 space-y-2">
              <span className="text-xs text-[#71717A] font-bold uppercase tracking-wider block">Available Balance</span>
              <div className="text-2xl font-black text-[#18181B]">${balance.availableBalance.toFixed(2)}</div>
              <span className="text-[10px] text-emerald-600 font-bold block">Ready for memberships & tips</span>
            </Card>

            <Card className="p-5 space-y-2">
              <span className="text-xs text-[#71717A] font-bold uppercase tracking-wider block">Pending Balance</span>
              <div className="text-2xl font-black text-[#18181B]">${balance.pendingBalance.toFixed(2)}</div>
              <span className="text-[10px] text-amber-600 font-bold block">Clears in 24-48 hours</span>
            </Card>

            <Card className="p-5 space-y-2">
              <span className="text-xs text-[#71717A] font-bold uppercase tracking-wider block">Total Spent</span>
              <div className="text-2xl font-black text-[#18181B]">${balance.totalSpent.toFixed(2)}</div>
              <span className="text-[10px] text-[#71717A] font-medium block">Lifetime member spending</span>
            </Card>

            <Card className="p-5 space-y-2">
              <span className="text-xs text-[#71717A] font-bold uppercase tracking-wider block">Creator Total Earnings</span>
              <div className="text-2xl font-black text-[#BE185D]">${balance.creatorTotalEarnings.toFixed(2)}</div>
              <span className="text-[10px] text-emerald-600 font-bold block">Eligible for Payout</span>
            </Card>
          </div>

          {/* Creator Payout Requests Status */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <h3 className="font-extrabold text-base text-[#18181B]">Payout Requests History</h3>
              <Badge variant="pink" size="sm">Admin Moderated</Badge>
            </div>

            <div className="space-y-2.5">
              {payouts.map((pay) => (
                <div key={pay.id} className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#18181B]">${pay.amount.toFixed(2)} ({pay.payoutMethod})</span>
                      <Badge
                        variant={pay.status === 'Approved' ? 'emerald' : pay.status === 'Rejected' ? 'rose' : 'amber'}
                        size="sm"
                      >
                        {pay.status.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-[#71717A] mt-1 block font-medium">Account: {pay.accountDetails} • Requested {pay.requestedAt}</span>
                  </div>
                  <span className="text-emerald-600 font-black">Net: ${pay.netPayout.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Transaction History Ledger Table */}
          <Card className="p-0 overflow-x-auto">
            <div className="p-4 border-b border-[#F3DCE8]">
              <h3 className="font-extrabold text-base text-[#18181B]">Transaction History Ledger</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F3DCE8] text-[#71717A] bg-[#FFF9FC]">
                  <th className="py-3 px-4 font-bold">Date</th>
                  <th className="py-3 px-4 font-bold">Type</th>
                  <th className="py-3 px-4 font-bold">Description / Recipient</th>
                  <th className="py-3 px-4 font-bold">Amount</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3DCE8] text-[#18181B]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FFF9FC]">
                    <td className="py-3 px-4 text-[#71717A] font-medium">{tx.date}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={tx.type === 'Top-Up' ? 'emerald' : tx.type === 'Tip Support' ? 'pink' : 'slate'}
                        size="sm"
                      >
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#18181B]">{tx.description}</span>
                      <span className="text-[10px] text-[#71717A] block font-medium">{tx.recipientOrSender}</span>
                    </td>
                    <td className="py-3 px-4 font-black text-[#18181B]">${tx.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </main>
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 space-y-4 relative border border-[#F3DCE8] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <h3 className="text-lg font-extrabold text-[#18181B]">Top-Up Member Wallet</h3>
              <button onClick={() => setShowTopUpModal(false)} className="text-[#71717A] hover:text-[#18181B] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTopUp} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#18181B] font-bold mb-1">Amount to Deposit ($)</label>
                <input
                  type="number"
                  min="10"
                  step="5"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowTopUpModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Confirm Deposit (${topUpAmount})
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 space-y-4 relative border border-[#F3DCE8] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <h3 className="text-lg font-extrabold text-[#18181B]">Request Creator Payout</h3>
              <button onClick={() => setShowPayoutModal(false)} className="text-[#71717A] hover:text-[#18181B] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#18181B] font-bold mb-1">Payout Amount ($)</label>
                <input
                  type="number"
                  min="50"
                  max={balance.creatorTotalEarnings}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[#18181B] font-bold mb-1">Payout Method</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-[#18181B] focus:outline-none font-medium"
                >
                  <option value="Bank Transfer">Bank Transfer (ACH / Wire)</option>
                  <option value="Stripe Direct">Stripe Direct Connect</option>
                  <option value="PayPal">PayPal Account</option>
                  <option value="Crypto (USDC)">Crypto Payout (USDC / Solana)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#18181B] font-bold mb-1">Account / Routing Details</label>
                <input
                  type="text"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowPayoutModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Submit Payout Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
