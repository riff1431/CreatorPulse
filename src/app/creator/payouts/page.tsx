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
          <Wallet className="text-emerald-400" size={22} />
          <h1 className="text-xl font-black text-white">Payouts</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Request payouts and view payout history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payout Request Form */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Request New Payout</h3>

          <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-500/20 text-xs">
            <p className="text-slate-400">Available Balance</p>
            <p className="text-2xl font-black text-white mt-1">$4,850.00</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Payout Amount ($)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Min $50.00"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500/50" />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Payout Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none">
                <option value="bank">Bank Transfer (•••• 4920)</option>
                <option value="stripe">Stripe Direct</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            {parsedAmount > 0 && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-400"><span>Amount</span><span className="text-white">${parsedAmount.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-400"><span>Processing Fee ({feePercent}%)</span><span className="text-rose-400">-${fee.toFixed(2)}</span></div>
                <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold"><span className="text-slate-300">Net Payout</span><span className="text-emerald-400">${netPayout.toFixed(2)}</span></div>
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              className="w-full"
              leftIcon={submitted ? <CheckCircle2 size={14} /> : <Send size={14} />}
              onClick={handleSubmit}
              disabled={parsedAmount < 50}
            >
              {submitted ? 'Payout Requested!' : 'Submit Payout Request'}
            </Button>
            {parsedAmount > 0 && parsedAmount < 50 && (
              <p className="text-[10px] text-rose-400 text-center">Minimum payout amount is $50.00</p>
            )}
          </div>
        </Card>

        {/* Payout History */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Payout History</h3>
          <div className="space-y-3">
            {payoutHistory.map((p) => (
              <div key={p.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-500">{p.id}</span>
                  <Badge variant={
                    p.status === 'Completed' ? 'emerald' :
                    p.status === 'Pending' ? 'amber' :
                    p.status === 'Approved' ? 'cyan' : 'rose'
                  } size="sm">{p.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{p.method}</span>
                  <span className="text-slate-500">{p.date}</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-300">Amount: {p.amount}</span>
                  <span className="text-emerald-400">Net: {p.net}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
