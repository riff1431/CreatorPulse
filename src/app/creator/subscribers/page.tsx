'use client';

import React, { useState } from 'react';
import { Star, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

const subscribers = [
  { id: '1', name: 'Alex Vance', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', plan: 'Pro Designer Tier', amount: '$15.00/mo', autoRenew: true, start: '2026-08-01', expiry: '2026-09-01', status: 'active' },
  { id: '2', name: 'Jordan Lee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', plan: 'VIP Inner Circle', amount: '$30.00/mo', autoRenew: true, start: '2026-07-15', expiry: '2026-10-15', status: 'active' },
  { id: '3', name: 'Mia Wong', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', plan: 'Starter Community', amount: '$5.00/mo', autoRenew: false, start: '2026-06-01', expiry: '2026-07-01', status: 'cancelled' },
  { id: '4', name: 'David Miller', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', plan: 'Pro Designer Tier', amount: '$15.00/mo', autoRenew: true, start: '2026-05-10', expiry: '2027-05-10', status: 'active' },
  { id: '5', name: 'Emma Torres', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', plan: 'Starter Community', amount: '$5.00/mo', autoRenew: true, start: '2026-08-10', expiry: '2026-09-10', status: 'active' },
  { id: '6', name: 'Olivia Chen', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', plan: 'VIP Inner Circle', amount: '$30.00/mo', autoRenew: false, start: '2026-04-01', expiry: '2026-07-01', status: 'expired' },
];

export default function CreatorSubscribersPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = subscribers.filter((s) => {
    if (planFilter !== 'all' && s.plan !== planFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalMRR = subscribers.filter((s) => s.status === 'active').reduce((sum, s) => {
    const price = parseFloat(s.amount.replace('$', '').replace('/mo', ''));
    return sum + price;
  }, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Star className="text-indigo-400" size={22} />
          <h1 className="text-xl font-black text-white">Subscribers</h1>
          <span className="text-sm text-slate-500 font-medium ml-1">840 total</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Manage your paid subscribers and membership tiers.</p>
      </div>

      {/* MRR Banner */}
      <Card className="p-4 flex items-center justify-between bg-gradient-to-r from-indigo-950/40 to-slate-950 border-indigo-500/20">
        <div>
          <p className="text-xs text-slate-400 font-medium">Monthly Recurring Revenue (MRR)</p>
          <p className="text-2xl font-black text-white">${totalMRR.toFixed(2)}</p>
        </div>
        <Badge variant="emerald" size="sm">{subscribers.filter((s) => s.status === 'active').length} active</Badge>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input type="text" placeholder="Search subscribers..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50" />
        </div>
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none">
          <option value="all">All Plans</option>
          <option value="Starter Community">Starter</option>
          <option value="Pro Designer Tier">Pro</option>
          <option value="VIP Inner Circle">VIP</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-left">
              <th className="py-3 px-4 font-semibold">Subscriber</th>
              <th className="py-3 px-4 font-semibold">Plan</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Amount</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">Auto-Renew</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">Expiry</th>
              <th className="py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={s.avatar} alt={s.name} size="sm" />
                    <span className="font-bold text-slate-200">{s.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={s.plan.includes('VIP') ? 'amber' : s.plan.includes('Pro') ? 'indigo' : 'slate'} size="sm">{s.plan}</Badge>
                </td>
                <td className="py-3 px-4 text-emerald-400 font-bold hidden sm:table-cell">{s.amount}</td>
                <td className="py-3 px-4 hidden md:table-cell">
                  {s.autoRenew ? <span className="text-emerald-400">Yes</span> : <span className="text-slate-500">No</span>}
                </td>
                <td className="py-3 px-4 text-slate-400 hidden md:table-cell">{s.expiry}</td>
                <td className="py-3 px-4">
                  <Badge variant={s.status === 'active' ? 'emerald' : s.status === 'cancelled' ? 'rose' : 'slate'} size="sm">{s.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
