'use client';

import React, { useState } from 'react';
import { Wallet, Send, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface PayoutReq {
  id: string;
  amount: string;
  fee: string;
  net: string;
  method: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  date: string;
}

const payoutHistory: PayoutReq[] = [
  { id: 'PAY-001', amount: '$1,500.00', fee: '$15.00', net: '$1,485.00', method: 'Bank Transfer (•••• 4920)', status: 'Pending', date: 'Yesterday' },
  { id: 'PAY-002', amount: '$2,000.00', fee: '$20.00', net: '$1,980.00', method: 'Bank Transfer (•••• 4920)', status: 'Completed', date: '2 weeks ago' },
  { id: 'PAY-003', amount: '$900.00', fee: '$9.00', net: '$891.00', method: 'Bank Transfer (•••• 4920)', status: 'Completed', date: '1 month ago' },
];

export default function CreatorPayoutsPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');
  const [submitted, setSubmitted] = useState(false);

  const feePercent = 1;
  const parsedAmount = parseFloat(amount) || 0;
  const fee = parsedAmount * (feePercent / 100);
  const netPayout = parsedAmount - fee;

  const handleSubmit = () => {
    if (parsedAmount >= 50) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setAmount('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Wallet className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">Payouts</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Request payouts and view payout history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payout Request Form */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#18181B]">Request New Payout</h3>

          <div className="p-4 bg-gradient-to-r from-[#FFF1F7] to-[#FDF2F8] rounded-2xl border border-[#F3DCE8] text-xs">
            <p className="text-[#71717A] font-semibold">Available Balance</p>
            <p className="text-3xl font-black text-[#18181B] mt-1">$4,850.00</p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[#18181B] font-bold mb-1">Payout Amount ($)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Min $50.00"
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium" />
            </div>

            <div>
              <label className="block text-[#18181B] font-bold mb-1">Payout Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-[#18181B] focus:outline-none font-medium">
                <option value="bank">Bank Transfer (•••• 4920)</option>
                <option value="stripe">Stripe Direct</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            {parsedAmount > 0 && (
              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] space-y-2">
                <div className="flex justify-between text-[#71717A]"><span>Amount</span><span className="text-[#18181B] font-bold">${parsedAmount.toFixed(2)}</span></div>
                <div className="flex justify-between text-[#71717A]"><span>Processing Fee ({feePercent}%)</span><span className="text-[#F43F5E] font-medium">-${fee.toFixed(2)}</span></div>
                <div className="border-t border-[#F3DCE8] pt-2 flex justify-between font-bold"><span className="text-[#18181B]">Net Payout</span><span className="text-emerald-600 font-extrabold">${netPayout.toFixed(2)}</span></div>
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              className="w-full"
              leftIcon={submitted ? <CheckCircle2 size={15} /> : <Send size={15} />}
              onClick={handleSubmit}
              disabled={parsedAmount < 50}
            >
              {submitted ? 'Payout Requested!' : 'Submit Payout Request'}
            </Button>
            {parsedAmount > 0 && parsedAmount < 50 && (
              <p className="text-[11px] text-[#F43F5E] text-center font-semibold">Minimum payout amount is $50.00</p>
            )}
          </div>
        </Card>

        {/* Payout History */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#18181B]">Payout History</h3>
          <div className="space-y-3">
            {payoutHistory.map((p) => (
              <div key={p.id} className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#A1A1AA] font-semibold">{p.id}</span>
                  <Badge variant={
                    p.status === 'Completed' ? 'emerald' :
                    p.status === 'Pending' ? 'amber' :
                    p.status === 'Approved' ? 'cyan' : 'rose'
                  } size="sm">{p.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-[#71717A] font-medium">
                  <span>{p.method}</span>
                  <span>{p.date}</span>
                </div>
                <div className="flex items-center justify-between font-bold border-t border-[#F3DCE8]/60 pt-1.5">
                  <span className="text-[#71717A]">Amount: {p.amount}</span>
                  <span className="text-emerald-600 font-extrabold">Net: {p.net}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
