'use client';

import React, { useState } from 'react';
import { Wallet, CheckCircle2, Eye, Building, Receipt } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

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
  routingDetails?: string;
  email?: string;
}

const initialPayouts: PayoutReq[] = [
  { id: 'PAY-001', creator: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', amount: '$1,500.00', fee: '$15.00', net: '$1,485.00', method: 'Bank Transfer', status: 'Pending', requestedAt: 'Yesterday', routingDetails: 'Chase Bank • Routing: 021000021 • Account: ••••4920', email: 'sarah@designcode.com' },
  { id: 'PAY-002', creator: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', amount: '$2,500.00', fee: '$25.00', net: '$2,475.00', method: 'Stripe Direct Connect', status: 'Pending', requestedAt: '2 days ago', routingDetails: 'Stripe Account: acct_1N2H3J4K5L6M7N8O', email: 'marcus@codemaster.io' },
  { id: 'PAY-003', creator: 'Lisa Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', amount: '$800.00', fee: '$8.00', net: '$792.00', method: 'PayPal Ledger', status: 'Pending', requestedAt: '3 days ago', routingDetails: 'PayPal Email: lisa.c@visuals.org', email: 'lisa@chenphoto.com' },
  { id: 'PAY-004', creator: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', amount: '$3,200.00', fee: '$32.00', net: '$3,168.00', method: 'Stripe Direct Connect', status: 'Completed', requestedAt: '1 week ago', routingDetails: 'Stripe Account: acct_1N2H3J4K5L6M7N8O', email: 'marcus@codemaster.io' },
  { id: 'PAY-005', creator: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', amount: '$900.00', fee: '$9.00', net: '$891.00', method: 'Bank Transfer', status: 'Completed', requestedAt: '2 weeks ago', routingDetails: 'Chase Bank • Routing: 021000021 • Account: ••••4920', email: 'sarah@designcode.com' },
];

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutReq[]>(initialPayouts);
  const [filter, setFilter] = useState<'all' | 'Pending' | 'Approved' | 'Completed' | 'Rejected'>('all');
  const [selectedPayout, setSelectedPayout] = useState<PayoutReq | null>(null);
  const { showToast } = useToast();

  const handleApprove = (id: string, name: string) => {
    setPayouts(payouts.map((p) => (p.id === id ? { ...p, status: 'Approved' } : p)));
    showToast(`Payout request ${id} for "${name}" approved.`, 'success');
    if (selectedPayout && selectedPayout.id === id) {
      setSelectedPayout({ ...selectedPayout, status: 'Approved' });
    }
  };

  const handleReject = (id: string, name: string) => {
    setPayouts(payouts.map((p) => (p.id === id ? { ...p, status: 'Rejected' } : p)));
    showToast(`Payout request ${id} for "${name}" rejected.`, 'warning');
    if (selectedPayout && selectedPayout.id === id) {
      setSelectedPayout({ ...selectedPayout, status: 'Rejected' });
    }
  };

  const handleComplete = (id: string, name: string) => {
    setPayouts(payouts.map((p) => (p.id === id ? { ...p, status: 'Completed' } : p)));
    showToast(`Payout ${id} for "${name}" marked as Completed!`, 'success');
    if (selectedPayout && selectedPayout.id === id) {
      setSelectedPayout({ ...selectedPayout, status: 'Completed' });
    }
  };

  const filtered = payouts.filter((p) => filter === 'all' || p.status === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="text-[#EC4899]" size={22} />
            <h1 className="text-xl font-black text-[#18181B] tracking-tight">Payout Requests</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Verify payout accounts, process bank wires, and audit logs.</p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-white/70 p-1 border border-[#F3DCE8] rounded-2xl shadow-xs self-start sm:self-auto">
          {(['all', 'Pending', 'Approved', 'Completed', 'Rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs' : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]/50'
              }`}
            >
              {f === 'all' ? 'All Ledger' : f}
              {f === 'Pending' && (
                <span className="ml-1.5 bg-[#FFE4E6] text-[#BE123C] px-1.5 py-0.5 rounded-full text-[9px] font-black">
                  {payouts.filter((p) => p.status === 'Pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <Card className="overflow-hidden p-0 border-[#F3DCE8]/80">
        <div className="overflow-x-auto relative">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] font-bold">
                <th className="py-3.5 px-4">Ref ID</th>
                <th className="py-3.5 px-4">Creator</th>
                <th className="py-3.5 px-4">Requested Gross</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Platform Fee</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Net Disbursement</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Settlement Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3DCE8]/60">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#FFF9FC]/50 transition-colors">
                  <td className="py-3.5 px-4 text-[#A1A1AA] font-mono font-bold">{p.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={p.avatar} alt={p.creator} size="sm" />
                      <span className="font-bold text-[#18181B]">{p.creator}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#18181B] font-bold">{p.amount}</td>
                  <td className="py-3.5 px-4 text-[#F43F5E] font-medium hidden sm:table-cell">{p.fee}</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-extrabold hidden sm:table-cell">{p.net}</td>
                  <td className="py-3.5 px-4 text-[#71717A] hidden md:table-cell font-semibold">{p.method}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={
                      p.status === 'Completed' ? 'emerald' :
                      p.status === 'Approved' ? 'cyan' :
                      p.status === 'Rejected' ? 'rose' : 'amber'
                    } size="sm">{p.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="sm" leftIcon={<Eye size={12} />} onClick={() => setSelectedPayout(p)}>
                        Inspect
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#71717A] font-bold">
                    No payout logs registered in this queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payout detailed verification invoice Modal */}
      <Modal
        isOpen={selectedPayout !== null}
        onClose={() => setSelectedPayout(null)}
        title={selectedPayout ? `Payout settlement review: ${selectedPayout.id}` : ''}
      >
        {selectedPayout && (
          <div className="space-y-4 font-semibold text-xs">
            {/* Header info */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#F3DCE8]">
              <Avatar src={selectedPayout.avatar} alt={selectedPayout.creator} size="md" />
              <div>
                <h4 className="text-xs font-black text-[#18181B] tracking-tight">{selectedPayout.creator}</h4>
                <p className="text-[10px] text-[#71717A]">{selectedPayout.email} • Requested {selectedPayout.requestedAt}</p>
              </div>
            </div>

            {/* Payout invoice grid */}
            <div className="bg-[#FFF9FC] border border-[#F3DCE8] rounded-2xl p-4 space-y-3 font-semibold text-xs text-[#18181B]">
              <div className="flex items-center justify-between pb-2 border-b border-[#F3DCE8]/60">
                <span className="text-[#A1A1AA] text-[10px] font-bold">Settlement Account</span>
                <span className="text-[#18181B] font-extrabold flex items-center gap-1.5">
                  <Building size={12} className="text-[#EC4899]" /> {selectedPayout.method}
                </span>
              </div>
              <p className="text-[#71717A] text-[10px] font-bold bg-white p-2 rounded-xl border border-[#F3DCE8]/60">
                {selectedPayout.routingDetails || 'Linked profile connection active.'}
              </p>
              <div className="space-y-1.5 pt-1.5">
                <div className="flex justify-between text-[#71717A]">
                  <span>Amount Requested</span>
                  <span>{selectedPayout.amount}</span>
                </div>
                <div className="flex justify-between text-[#71717A]">
                  <span>Processing Fee (1%)</span>
                  <span className="text-[#F43F5E] font-bold">-{selectedPayout.fee}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-[#F3DCE8] pt-2">
                  <span className="text-[#18181B]">Net Payout Released</span>
                  <span className="text-emerald-600 font-extrabold text-sm">{selectedPayout.net}</span>
                </div>
              </div>
            </div>

            {/* Verification options */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-[#A1A1AA] font-bold">
                Verification status: <Badge variant="slate" size="sm">{selectedPayout.status}</Badge>
              </span>
              <div className="flex gap-2">
                {selectedPayout.status === 'Pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[#F43F5E] border-rose-200 hover:bg-rose-50"
                      onClick={() => handleReject(selectedPayout.id, selectedPayout.creator)}
                    >
                      Reject Request
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 size={13} />}
                      onClick={() => handleApprove(selectedPayout.id, selectedPayout.creator)}
                    >
                      Approve Payout
                    </Button>
                  </>
                )}
                {selectedPayout.status === 'Approved' && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Receipt size={13} />}
                    onClick={() => handleComplete(selectedPayout.id, selectedPayout.creator)}
                  >
                    Disburse & Mark Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
