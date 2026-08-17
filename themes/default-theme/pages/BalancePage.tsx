'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, DollarSign, CreditCard, 
  ShieldCheck, CheckCircle2, Clock, Landmark, Plus, Sparkles, Filter, Receipt, FileText, ChevronRight
} from 'lucide-react';

interface Transaction {
  id: string;
  title: string;
  type: 'earning' | 'tip' | 'payout' | 'deposit' | 'purchase';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'processing';
  receiptUrl?: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: 'tx-5', title: 'Deposit to Wallet', type: 'deposit', amount: 50.00, date: 'Today, 4:12 PM', status: 'completed', receiptUrl: '#' },
  { id: 'tx-1', title: 'Monthly VIP Subscriptions Payout', type: 'earning', amount: 840.00, date: 'Today, 2:30 PM', status: 'completed', receiptUrl: '#' },
  { id: 'tx-6', title: 'Purchased "Advanced Lighting" Video', type: 'purchase', amount: -12.00, date: 'Yesterday, 8:15 PM', status: 'completed', receiptUrl: '#' },
  { id: 'tx-2', title: 'Fan Tip from Alex Vance', type: 'tip', amount: 25.00, date: 'Yesterday, 1:45 PM', status: 'completed' },
  { id: 'tx-3', title: 'Express Bank Payout to Checking', type: 'payout', amount: -650.00, date: 'Aug 14, 2026', status: 'processing' },
  { id: 'tx-4', title: 'Video Masterclass Pass Unlock', type: 'earning', amount: 15.00, date: 'Aug 12, 2026', status: 'completed' },
];

type FilterType = 'all' | 'earnings' | 'purchases' | 'payouts';

export function BalancePage() {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('200');
  const [depositAmount, setDepositAmount] = useState('50');
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setShowPayoutModal(false);
    }, 2000);
  };

  const filteredTransactions = TRANSACTIONS.filter(tx => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'earnings') return tx.type === 'earning' || tx.type === 'tip';
    if (activeFilter === 'purchases') return tx.type === 'purchase' || tx.type === 'deposit';
    if (activeFilter === 'payouts') return tx.type === 'payout';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200/50 dark:border-emerald-800/50"><CheckCircle2 size={10} /> COMPLETED</span>;
      case 'pending':
      case 'processing':
        return <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/40 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200/50 dark:border-amber-800/50"><Clock size={10} /> PROCESSING</span>;
      default:
        return null;
    }
  };

  const getIconForType = (type: string, amount: number) => {
    if (type === 'deposit') return <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center shadow-inner"><ArrowDownLeft size={20} /></div>;
    if (type === 'purchase') return <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 flex items-center justify-center shadow-inner"><Receipt size={20} /></div>;
    if (amount > 0) return <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shadow-inner"><ArrowDownLeft size={20} /></div>;
    return <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center shadow-inner"><ArrowUpRight size={20} /></div>;
  };

  return (
    <MainLayout>
      <div className={`max-w-5xl mx-auto space-y-8 pb-16 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl text-white shadow-lg shadow-pink-500/20">
                <Wallet size={24} />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
                Wallet & History
              </h1>
            </div>
            <p className="text-[13px] text-[var(--color-text-secondary)] font-medium max-w-md">
              Manage your funds, view purchase history, and request payouts instantly.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              size="md"
              className="flex-1 md:flex-none rounded-2xl font-bold bg-[var(--color-surface)] shadow-sm hover:shadow-md transition-all"
              leftIcon={<Plus size={16} />}
              onClick={() => setShowDepositModal(true)}
            >
              Add Funds
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1 md:flex-none rounded-2xl font-bold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all hover:-translate-y-0.5"
              leftIcon={<ArrowUpRight size={16} />}
              onClick={() => setShowPayoutModal(true)}
            >
              Withdraw
            </Button>
          </div>
        </div>

        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main Wallet Balance */}
          <div className="col-span-1 md:col-span-2 relative overflow-hidden rounded-[32px] p-8 bg-gradient-to-br from-[#1E1E1E] to-[#0D0D0D] border border-white/10 shadow-2xl group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-pink-500/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-pink-500/30 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[12px] font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={14} className="text-pink-400" /> Available Balance
                  </span>
                  <div className="mt-2 text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                    $1,450<span className="text-white/50 text-3xl">.00</span>
                  </div>
                </div>
                <div className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                  <Wallet size={28} className="text-white/80" />
                </div>
              </div>
              
              <div className="mt-8 flex items-center gap-6 border-t border-white/10 pt-6">
                <div>
                  <p className="text-[11px] text-white/50 font-bold uppercase tracking-wider mb-1">Pending Clearance</p>
                  <p className="text-lg font-bold text-white">$320.00</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <p className="text-[11px] text-white/50 font-bold uppercase tracking-wider mb-1">Lifetime Earned</p>
                  <p className="text-lg font-bold text-emerald-400">$14,600.00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Account Quick View */}
          <div className="rounded-[32px] p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-[13px] text-[var(--color-text-secondary)] uppercase tracking-wider">Payout Method</h3>
                <Badge variant="emerald" size="sm" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck size={12} className="mr-1" /> Active
                </Badge>
              </div>
              
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-100 to-white dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <Landmark size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-[14px] text-slate-900 dark:text-white">Chase Bank</h4>
                    <p className="text-[12px] text-slate-500 font-medium font-mono mt-0.5">•••• •••• 4892</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="w-full mt-4 rounded-xl text-[12px] font-bold">
              Manage Accounts <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>

        {/* Transaction History Ledger */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
            <h3 className="font-black text-xl text-[var(--color-text-primary)] tracking-tight">Transaction History</h3>
            
            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(['all', 'earnings', 'purchases', 'payouts'] as FilterType[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-[12px] font-bold capitalize transition-all duration-300 whitespace-nowrap ${
                    activeFilter === filter
                      ? 'bg-[var(--color-primary)] text-white shadow-md shadow-pink-500/20'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredTransactions.map((tx, index) => (
              <div
                key={tx.id}
                className="group p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)] transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md animate-in slide-in-from-bottom-2 fade-in"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-4">
                  {getIconForType(tx.type, tx.amount)}
                  <div>
                    <h4 className="font-bold text-[14px] text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">{tx.title}</h4>
                    <p className="text-[12px] text-[var(--color-text-secondary)] font-medium mt-0.5">{tx.date}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full pl-14 sm:pl-0">
                  <div className="flex flex-col items-start sm:items-end gap-1">
                    <span
                      className={`font-black text-[15px] ${
                        tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--color-text-primary)]'
                      }`}
                    >
                      {tx.amount > 0 ? `+` : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                    {getStatusBadge(tx.status)}
                  </div>
                  
                  {tx.receiptUrl ? (
                    <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-pink-50 dark:hover:bg-pink-950/30">
                      <FileText size={18} />
                    </Button>
                  ) : (
                    <div className="w-10" /> /* Spacer for alignment */
                  )}
                </div>
              </div>
            ))}
            
            {filteredTransactions.length === 0 && (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text-muted)] mb-4">
                  <Filter size={24} />
                </div>
                <h3 className="font-black text-[15px] text-[var(--color-text-primary)]">No transactions found</h3>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">Try changing your filters to see more history.</p>
              </div>
            )}
          </div>
        </div>

        {/* Payout Modal */}
        <Modal
          isOpen={showPayoutModal}
          onClose={() => setShowPayoutModal(false)}
          title="Request Payout"
          description="Transfer your available earnings to your connected bank account."
        >
          {payoutSuccess ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h4 className="font-black text-xl text-[var(--color-text-primary)] tracking-tight">Payout Initiated!</h4>
                <p className="text-[13px] text-[var(--color-text-secondary)] font-medium mt-1 max-w-[240px] mx-auto">Funds will reflect in your Chase Checking account within 24 hours.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRequestPayout} className="space-y-6 pt-2">
              <div className="space-y-1">
                <label className="text-[12px] font-black text-[var(--color-text-secondary)] uppercase tracking-wider pl-1">Amount to withdraw</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign size={20} className="text-[var(--color-text-muted)]" />
                  </div>
                  <input
                    type="number"
                    max="1450"
                    min="10"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-[20px] py-4 pl-10 pr-4 text-xl font-black text-[var(--color-text-primary)] transition-all outline-none shadow-inner"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] font-bold text-[var(--color-text-secondary)] pl-1 flex justify-between mt-1">
                  <span>Available: $1,450.00</span>
                  <button type="button" onClick={() => setPayoutAmount('1450')} className="text-[var(--color-primary)] hover:underline">Withdraw All</button>
                </p>
              </div>

              <div className="p-4 bg-[var(--color-bg)] rounded-[20px] border border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center">
                    <Landmark size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[13px] text-[var(--color-text-primary)]">Chase Checking</h4>
                    <p className="text-[11px] text-[var(--color-text-secondary)] font-mono mt-0.5">•••• 4892</p>
                  </div>
                </div>
                <Badge variant="slate" size="sm" className="bg-[var(--color-surface)]">Default</Badge>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" size="lg" className="flex-1 rounded-[16px] font-bold" onClick={() => setShowPayoutModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="lg" className="flex-1 rounded-[16px] font-black shadow-lg shadow-pink-500/25">
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
          title="Add Funds"
          description="Load your wallet to instantly purchase masterclasses, send tips, and unlock VIP content."
        >
          <div className="space-y-6 pt-2">
            <div className="space-y-3">
              <label className="text-[12px] font-black text-[var(--color-text-secondary)] uppercase tracking-wider pl-1">Select Amount</label>
              <div className="grid grid-cols-3 gap-3">
                {['20', '50', '100', '200', '500'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`py-3 rounded-2xl text-[15px] font-black transition-all duration-300 border-2 cursor-pointer ${
                      depositAmount === amt 
                        ? 'bg-[var(--color-soft-primary)] text-[var(--color-primary)] border-[var(--color-primary)] shadow-md shadow-pink-500/10'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-bg)]'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-[var(--color-text-muted)] font-bold">$</span>
                  </div>
                  <input
                    type="number"
                    placeholder="Custom"
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full h-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-2xl py-3 pl-7 pr-2 text-[15px] font-black text-[var(--color-text-primary)] transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-[16px] font-black shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 py-4"
              onClick={() => setShowDepositModal(false)}
            >
              Add ${depositAmount || '0'} to Wallet
            </Button>
            
            <p className="text-[11px] text-center font-bold text-[var(--color-text-muted)] flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" /> Secure encrypted checkout
            </p>
          </div>
        </Modal>

      </div>
    </MainLayout>
  );
}

export default BalancePage;
