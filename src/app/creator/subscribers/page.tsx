'use client';

import React, { useState } from 'react';
import { Star, Search, DollarSign, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

const subscribers = [
  { id: '1', name: 'Alex Vance', username: 'alexvance', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', plan: 'Pro Designer Tier', price: '$15.00/mo', duration: '1 month', autoRenew: true, renewalDate: '2026-09-01', totalPaid: '$75.00' },
  { id: '2', name: 'Jordan Lee', username: 'jordanlee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', plan: 'VIP Inner Circle', price: '$30.00/mo', duration: '3 months', autoRenew: true, renewalDate: '2026-10-15', totalPaid: '$180.00' },
  { id: '3', name: 'Mia Wong', username: 'miawong', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', plan: 'Starter Community', price: '$5.00/mo', duration: '1 month', autoRenew: false, renewalDate: '2026-08-28', totalPaid: '$25.00' },
  { id: '4', name: 'David Miller', username: 'fitdavid', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', plan: 'Pro Designer Tier', price: '$15.00/mo', duration: '12 months', autoRenew: true, renewalDate: '2027-01-15', totalPaid: '$150.00' },
];

export default function CreatorSubscribersPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  const filtered = subscribers.filter((s) => {
    if (planFilter !== 'all' && s.plan !== planFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Star className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">Subscribers</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Manage your 840 active paying members and subscription tiers.</p>
      </div>

      <div className="bg-gradient-to-r from-[#FFF1F7] to-[#FDF2F8] border border-[#F3DCE8] p-5 rounded-[24px] flex flex-wrap items-center justify-between gap-4 shadow-sm shadow-[#EC4899]/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] border border-[#FBCFE8] flex items-center justify-center text-[#EC4899] font-black text-lg">
            840
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#18181B]">Total Active Subscribers</h3>
            <p className="text-xs text-[#71717A] mt-0.5 font-medium">Generating <strong className="text-emerald-600 font-extrabold">$5,200/mo</strong> in recurring revenue</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
          <input
            type="text"
            placeholder="Search subscribers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#F3DCE8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] shadow-sm font-medium"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="bg-white border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] shadow-sm font-medium"
        >
          <option value="all">All Plans</option>
          <option value="Starter Community">Starter Community</option>
          <option value="Pro Designer Tier">Pro Designer Tier</option>
          <option value="VIP Inner Circle">VIP Inner Circle</option>
        </select>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] text-left">
              <th className="py-3.5 px-4 font-bold">Subscriber</th>
              <th className="py-3.5 px-4 font-bold">Plan</th>
              <th className="py-3.5 px-4 font-bold">Price</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Auto-Renew</th>
              <th className="py-3.5 px-4 font-bold hidden md:table-cell">Renewal Date</th>
              <th className="py-3.5 px-4 font-bold text-right">Lifetime Paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3DCE8]">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-[#FFF9FC] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={s.avatar} alt={s.name} size="sm" />
                    <div>
                      <p className="font-bold text-[#18181B]">{s.name}</p>
                      <p className="text-[10px] text-[#71717A]">@{s.username}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={s.plan.includes('VIP') ? 'rose' : s.plan.includes('Pro') ? 'pink' : 'slate'} size="sm">
                    {s.plan}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-[#18181B] font-bold">{s.price}</td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <span className={`flex items-center gap-1 font-medium ${s.autoRenew ? 'text-emerald-600' : 'text-[#A1A1AA]'}`}>
                    <RefreshCw size={11} className={s.autoRenew ? 'animate-spin-slow' : ''} />
                    {s.autoRenew ? 'Auto' : 'Manual'}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#71717A] hidden md:table-cell font-medium">{s.renewalDate}</td>
                <td className="py-3 px-4 text-right text-emerald-600 font-extrabold">{s.totalPaid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
