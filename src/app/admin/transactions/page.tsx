'use client';

import React, { useState } from 'react';
import { Receipt, Search, Filter, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const transactions = [
  { id: 'TX-001', date: '2026-08-12', type: 'Membership', from: 'Alex Vance', to: 'Sarah Jenkins', amount: '$15.00', fee: '$0.75', net: '$14.25', status: 'Completed' },
  { id: 'TX-002', date: '2026-08-11', type: 'Tip Support', from: 'Jordan Lee', to: 'Marcus Vance', amount: '$25.00', fee: '$1.25', net: '$23.75', status: 'Completed' },
  { id: 'TX-003', date: '2026-08-10', type: 'Top-Up', from: 'Visa •••• 8821', to: 'Alex Vance', amount: '$100.00', fee: '$0.00', net: '$100.00', status: 'Completed' },
  { id: 'TX-004', date: '2026-08-09', type: 'Premium Unlock', from: 'Mia Wong', to: 'Sarah Jenkins', amount: '$9.99', fee: '$0.50', net: '$9.49', status: 'Completed' },
  { id: 'TX-005', date: '2026-08-08', type: 'Payout', from: 'CreatorPulse', to: 'Marcus Vance', amount: '$2,500.00', fee: '$25.00', net: '$2,475.00', status: 'Completed' },
  { id: 'TX-006', date: '2026-08-07', type: 'Membership', from: 'David Miller', to: 'Marcus Vance', amount: '$30.00', fee: '$1.50', net: '$28.50', status: 'Completed' },
  { id: 'TX-007', date: '2026-08-06', type: 'Top-Up', from: 'Stripe •••• 4412', to: 'Jordan Lee', amount: '$50.00', fee: '$0.00', net: '$50.00', status: 'Pending' },
];

export default function AdminTransactionsPage() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (search && !t.from.toLowerCase().includes(search.toLowerCase()) && !t.to.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="text-sky-400" size={22} />
            <h1 className="text-xl font-black text-white">Transactions</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Full platform transaction ledger with fee transparency.</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Download size={14} />}>Export CSV</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input type="text" placeholder="Search by user..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none">
          <option value="all">All Types</option>
          <option value="Top-Up">Top-Up</option>
          <option value="Membership">Membership</option>
          <option value="Tip Support">Tip Support</option>
          <option value="Premium Unlock">Premium Unlock</option>
          <option value="Payout">Payout</option>
        </select>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-left">
              <th className="py-3 px-4 font-semibold">ID</th>
              <th className="py-3 px-4 font-semibold">Date</th>
              <th className="py-3 px-4 font-semibold">Type</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">From</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">To</th>
              <th className="py-3 px-4 font-semibold">Amount</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">Fee</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">Net</th>
              <th className="py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4 text-slate-500 font-mono">{t.id}</td>
                <td className="py-3 px-4 text-slate-400">{t.date}</td>
                <td className="py-3 px-4">
                  <Badge variant={
                    t.type === 'Top-Up' ? 'cyan' :
                    t.type === 'Membership' ? 'indigo' :
                    t.type === 'Tip Support' ? 'amber' :
                    t.type === 'Premium Unlock' ? 'slate' :
                    'emerald'
                  } size="sm">{t.type}</Badge>
                </td>
                <td className="py-3 px-4 text-slate-300 hidden sm:table-cell">{t.from}</td>
                <td className="py-3 px-4 text-slate-300 hidden sm:table-cell">{t.to}</td>
                <td className="py-3 px-4 text-white font-bold">{t.amount}</td>
                <td className="py-3 px-4 text-rose-400 hidden md:table-cell">{t.fee}</td>
                <td className="py-3 px-4 text-emerald-400 hidden md:table-cell">{t.net}</td>
                <td className="py-3 px-4">
                  <Badge variant={t.status === 'Completed' ? 'emerald' : 'amber'} size="sm">{t.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
