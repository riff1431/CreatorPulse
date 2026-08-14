'use client';

import React, { useState } from 'react';
import { Wallet, Send, CheckCircle2, AlertTriangle, ArrowRight, DollarSign, Building } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface PayoutReq {
  id: string;
  amount: string;
  fee: string;
  net: string;
  method: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  date: string;
}

const initialPayoutHistory: PayoutReq[] = [
  { id: 'PAY-001', amount: '$1,500.00', fee: '$15.00', net: '$1,485.00', method: 'Bank Transfer (•••• 4920)', status: 'Pending', date: 'Yesterday' },
  { id: 'PAY-002', amount: '$2,000.00', fee: '$20.00', net: '$1,980.00', method: 'Bank Transfer (•••• 4920)', status: 'Completed', date: '2 weeks ago' },
  { id: 'PAY-003', amount: '$900.00', fee: '$9.00', net: '$891.00', method: 'Bank Transfer (•••• 4920)', status: 'Completed', date: '1 month ago' },
];

export default function CreatorPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutReq[]>(initialPayoutHistory);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(4850);
  const { showToast } = useToast();

  const feePercent = 1;
  const parsedAmount = parseFloat(amount) || 0;
  const fee = parsedAmount * (feePercent / 100);
  const netPayout = parsedAmount - fee;

  const handleSubmit = () => {
    if (parsedAmount < 50) {
      showToast('Minimum payout request is $50.', 'error');
      return;
    }
    if (parsedAmount > availableBalance) {
      showToast('Requested amount exceeds available balance.', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newPayout: PayoutReq = {
        id: `PAY-00${payouts.length + 1}`,
        amount: `$${parsedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        fee: `$${fee.toFixed(2)}`,
        net: `$${netPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        method: method === 'bank' ? 'Bank Transfer (•••• 4920)' : method === 'stripe' ? 'Stripe Direct' : 'PayPal',
        status: 'Pending',
        date: 'Just now'
      };

      setPayouts([newPayout, ...payouts]);
      setAvailableBalance(prev => prev - parsedAmount);
      setAmount('');
      setIsSubmitting(false);
      showToast(`Payout request for $${parsedAmount.toFixed(2)} submitted successfully!`, 'success');
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Wallet className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B] tracking-tight">Payout Manager</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Request bank or online withdrawals and track settlement logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payout Request Form */}
        <Card className="p-6 space-y-5">
          <h3 className="text-sm font-bold text-[#18181B]">Request Payout</h3>

          {/* Balance card */}
          <div className="p-5 bg-gradient-to-tr from-[#FFF1F7] to-white rounded-2xl border border-[#F3DCE8] flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-wider">Available Balance</p>
              <p className="text-3xl font-black text-[#18181B] tracking-tight mt-1">${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-[#FCE7F3] rounded-2xl text-[#EC4899] animate-float"><Building size={20} /></div>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[#71717A] mb-1 font-bold">Withdrawal Amount ($)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] font-black">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Min $50.00"
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl pl-8 pr-3 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#71717A] mb-1 font-bold">Transfer Target & Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2.5 text-[#18181B] focus:outline-none font-medium"
              >
                <option value="bank">Bank Transfer (Chase Bank •••• 4920)</option>
                <option value="stripe">Stripe Direct Connect</option>
                <option value="paypal">PayPal Ledger (s.jenkins@design.com)</option>
              </select>
            </div>

            {parsedAmount > 0 && (
              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] space-y-2 font-bold transition-all animate-scale-up">
                <div className="flex justify-between text-[#71717A] text-[10px]">
                  <span>Requested Gross</span>
                  <span className="text-[#18181B] font-extrabold">${parsedAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#71717A] text-[10px]">
                  <span>Platform Settlement Fee ({feePercent}%)</span>
                  <span className="text-[#F43F5E] font-extrabold">-${fee.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#F3DCE8] pt-2 flex justify-between text-xs font-black">
                  <span className="text-[#18181B]">Disbursement Net</span>
                  <span className="text-emerald-600 text-sm font-black">${netPayout.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isSubmitting}
              leftIcon={<Send size={14} />}
              onClick={handleSubmit}
              disabled={parsedAmount < 50 || parsedAmount > availableBalance}
            >
              Request Settlement
            </Button>

            {parsedAmount > 0 && parsedAmount < 50 && (
              <div className="flex items-center gap-1.5 justify-center text-[#F43F5E]">
                <AlertTriangle size={12} />
                <span className="text-[10px] font-bold">Minimum payout limit is $50.00</span>
              </div>
            )}
            {parsedAmount > availableBalance && (
              <div className="flex items-center gap-1.5 justify-center text-[#F43F5E]">
                <AlertTriangle size={12} />
                <span className="text-[10px] font-bold">Insufficient funds available.</span>
              </div>
            )}
          </div>
        </Card>

        {/* Payout History Ledger */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#18181B]">Disbursement Ledger</h3>
            <p className="text-[10px] text-[#71717A] mt-0.5 font-medium">History of recent payout status updates.</p>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {payouts.map((p) => (
              <div key={p.id} className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] text-xs space-y-2.5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#A1A1AA] font-bold">{p.id}</span>
                  <Badge variant={
                    p.status === 'Completed' ? 'emerald' :
                    p.status === 'Pending' ? 'amber' :
                    p.status === 'Approved' ? 'cyan' : 'rose'
                  } size="sm">{p.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-[#71717A] font-semibold text-[10px]">
                  <span>{p.method}</span>
                  <span>{p.date}</span>
                </div>
                <div className="flex items-center justify-between font-black border-t border-[#F3DCE8]/60 pt-2 text-[10px]">
                  <span className="text-[#71717A]">Gross: {p.amount}</span>
                  <span className="text-emerald-600 text-xs font-black">Net Settled: {p.net}</span>
                </div>
              </div>
            ))}
            {payouts.length === 0 && (
              <p className="text-center py-8 text-[#71717A] font-bold">No payout history logged yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
