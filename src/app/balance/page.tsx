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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 space-y-6 max-w-4xl mx-auto lg:mx-0 w-full pb-20 lg:pb-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Wallet className="text-cyan-400" size={24} />
                <h1 className="text-2xl font-black text-white">Account Balance & Wallet</h1>
              </div>
              <p className="text-xs text-slate-400">Manage member funds, transaction ledger, and creator payout requests.</p>
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
            <Card className="p-4 space-y-2">
              <span className="text-xs text-slate-400 block">Available Balance</span>
              <div className="text-2xl font-black text-white">${balance.availableBalance.toFixed(2)}</div>
              <span className="text-[10px] text-emerald-400 block">Ready for memberships & tips</span>
            </Card>

            <Card className="p-4 space-y-2">
              <span className="text-xs text-slate-400 block">Pending Balance</span>
              <div className="text-2xl font-black text-white">${balance.pendingBalance.toFixed(2)}</div>
              <span className="text-[10px] text-amber-400 block">Clears in 24-48 hours</span>
            </Card>

            <Card className="p-4 space-y-2">
              <span className="text-xs text-slate-400 block">Total Spent</span>
              <div className="text-2xl font-black text-white">${balance.totalSpent.toFixed(2)}</div>
              <span className="text-[10px] text-slate-400 block">Lifetime member spending</span>
            </Card>

            <Card className="p-4 space-y-2">
              <span className="text-xs text-slate-400 block">Creator Total Earnings</span>
              <div className="text-2xl font-black text-cyan-400">${balance.creatorTotalEarnings.toFixed(2)}</div>
              <span className="text-[10px] text-cyan-400 block">Eligible for Payout</span>
            </Card>
          </div>

          {/* Creator Payout Requests Status */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-base text-slate-100">Payout Requests History</h3>
              <Badge variant="indigo" size="sm">Admin Moderated</Badge>
            </div>

            <div className="space-y-2">
              {payouts.map((pay) => (
                <div key={pay.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">${pay.amount.toFixed(2)} ({pay.payoutMethod})</span>
                      <Badge
                        variant={pay.status === 'Approved' ? 'emerald' : pay.status === 'Rejected' ? 'rose' : 'amber'}
                        size="sm"
                      >
                        {pay.status.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Account: {pay.accountDetails} • Requested {pay.requestedAt}</span>
                  </div>
                  <span className="text-cyan-400 font-bold">Net: ${pay.netPayout.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Transaction History Ledger Table */}
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-base text-slate-100">Transaction History Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Description / Recipient</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-slate-400">{tx.date}</td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={tx.type === 'Top-Up' ? 'emerald' : tx.type === 'Tip Support' ? 'rose' : 'indigo'}
                          size="sm"
                        >
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-200">{tx.description}</span>
                        <span className="text-[10px] text-slate-400 block">{tx.recipientOrSender}</span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-100">${tx.amount.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-semibold">{tx.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100">Top-Up Member Wallet</h3>
              <button onClick={() => setShowTopUpModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTopUp} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Amount to Deposit ($)</label>
                <input
                  type="number"
                  min="10"
                  step="5"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100">Request Creator Payout</h3>
              <button onClick={() => setShowPayoutModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Payout Amount ($)</label>
                <input
                  type="number"
                  min="50"
                  max={balance.creatorTotalEarnings}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Payout Method</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Bank Transfer">Bank Transfer (ACH / Wire)</option>
                  <option value="Stripe Direct">Stripe Direct Connect</option>
                  <option value="PayPal">PayPal Account</option>
                  <option value="Crypto (USDC)">Crypto Payout (USDC / Solana)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Account / Routing Details</label>
                <input
                  type="text"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
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
