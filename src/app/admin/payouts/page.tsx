'use client';

import React, { useState } from 'react';
import { Wallet, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

interface PayoutReq {
  id: string;
  creator: string;
  avatar: string;
  amount: string;
  fee: string;
  net: string;
  method: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  requestedAt: string;
}

const initialPayouts: PayoutReq[] = [
  { id: 'PAY-001', creator: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', amount: '$1,500.00', fee: '$15.00', net: '$1,485.00', method: 'Bank Transfer (•••• 4920)', status: 'Pending', requestedAt: 'Yesterday' },
  { id: 'PAY-002', creator: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', amount: '$2,500.00', fee: '$25.00', net: '$2,475.00', method: 'Stripe Direct', status: 'Pending', requestedAt: '2 days ago' },
  { id: 'PAY-003', creator: 'Lisa Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', amount: '$800.00', fee: '$8.00', net: '$792.00', method: 'PayPal', status: 'Pending', requestedAt: '3 days ago' },
  { id: 'PAY-004', creator: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', amount: '$3,200.00', fee: '$32.00', net: '$3,168.00', method: 'Stripe Direct', status: 'Completed', requestedAt: '1 week ago' },
  { id: 'PAY-005', creator: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', amount: '$900.00', fee: '$9.00', net: '$891.00', method: 'Bank Transfer (•••• 4920)', status: 'Completed', requestedAt: '2 weeks ago' },
];

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutReq[]>(initialPayouts);
  const [filter, setFilter] = useState<'all' | 'Pending' | 'Approved' | 'Completed' | 'Rejected'>('all');

  const handleApprove = (id: string) => {
    setPayouts(payouts.map((p) => (p.id === id ? { ...p, status: 'Approved' } : p)));
  };

  const handleReject = (id: string) => {
    setPayouts(payouts.map((p) => (p.id === id ? { ...p, status: 'Rejected' } : p)));
  };

  const handleComplete = (id: string) => {
    setPayouts(payouts.map((p) => (p.id === id ? { ...p, status: 'Completed' } : p)));
  };

  const filtered = payouts.filter((p) => filter === 'all' || p.status === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Wallet className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">Payout Requests</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Review, approve, and process creator payout requests.</p>
      </div>

      <div className="flex items-center gap-2 text-xs">
        {(['all', 'Pending', 'Approved', 'Completed', 'Rejected'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              filter === f ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]' : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
            }`}
          >
            {f === 'all' ? 'All' : f}
            {f === 'Pending' && <span className="ml-1.5 bg-[#FFE4E6] text-[#BE123C] px-1.5 py-0.5 rounded-full text-[10px]">{payouts.filter((p) => p.status === 'Pending').length}</span>}
          </button>
        ))}
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] text-left">
              <th className="py-3.5 px-4 font-bold">ID</th>
              <th className="py-3.5 px-4 font-bold">Creator</th>
              <th className="py-3.5 px-4 font-bold">Amount</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Fee</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Net Payout</th>
              <th className="py-3.5 px-4 font-bold hidden md:table-cell">Method</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3DCE8]">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-[#FFF9FC] transition-colors">
                <td className="py-3 px-4 text-[#A1A1AA] font-mono font-medium">{p.id}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={p.avatar} alt={p.creator} size="sm" />
                    <span className="font-bold text-[#18181B]">{p.creator}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-[#18181B] font-bold">{p.amount}</td>
                <td className="py-3 px-4 text-[#F43F5E] font-medium hidden sm:table-cell">{p.fee}</td>
                <td className="py-3 px-4 text-emerald-600 font-bold hidden sm:table-cell">{p.net}</td>
                <td className="py-3 px-4 text-[#71717A] hidden md:table-cell font-medium">{p.method}</td>
                <td className="py-3 px-4">
                  <Badge variant={
                    p.status === 'Completed' ? 'emerald' :
                    p.status === 'Approved' ? 'cyan' :
                    p.status === 'Rejected' ? 'rose' : 'amber'
                  } size="sm">{p.status}</Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  {p.status === 'Pending' && (
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleReject(p.id)}><XCircle size={14} className="text-[#F43F5E]" /></Button>
                      <Button variant="primary" size="sm" onClick={() => handleApprove(p.id)}><CheckCircle2 size={14} /></Button>
                    </div>
                  )}
                  {p.status === 'Approved' && (
                    <Button variant="outline" size="sm" onClick={() => handleComplete(p.id)}>Mark Complete</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
