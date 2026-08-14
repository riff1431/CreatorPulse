'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

const subscriptions = [
  { id: '1', subscriber: 'Alex Vance', subscriberAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', creator: 'Sarah Jenkins', creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', plan: 'Pro Designer Tier', amount: '$15.00/mo', duration: '1 month', status: 'active', startDate: '2026-08-01', endDate: '2026-09-01' },
  { id: '2', subscriber: 'Jordan Lee', subscriberAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', creator: 'Marcus Vance', creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', plan: 'VIP Inner Circle', amount: '$30.00/mo', duration: '3 months', status: 'active', startDate: '2026-07-15', endDate: '2026-10-15' },
  { id: '3', subscriber: 'Mia Wong', subscriberAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', creator: 'Sarah Jenkins', creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', plan: 'Starter Community', amount: '$5.00/mo', duration: '1 month', status: 'cancelled', startDate: '2026-06-01', endDate: '2026-07-01' },
  { id: '4', subscriber: 'David Miller', subscriberAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', creator: 'Marcus Vance', creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', plan: 'Pro Developer Tier', amount: '$15.00/mo', duration: '12 months', status: 'active', startDate: '2026-01-01', endDate: '2027-01-01' },
];

export default function AdminSubscriptionsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <CreditCard className="text-emerald-400" size={22} />
          <h1 className="text-xl font-black text-white">Subscriptions</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">View and manage all active, cancelled, and expired subscriptions.</p>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-left">
              <th className="py-3 px-4 font-semibold">Subscriber</th>
              <th className="py-3 px-4 font-semibold">Creator</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Plan</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">Amount</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">Duration</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold hidden lg:table-cell">End Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {subscriptions.map((s) => (
              <tr key={s.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Avatar src={s.subscriberAvatar} alt={s.subscriber} size="sm" />
                    <span className="font-semibold text-slate-200">{s.subscriber}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Avatar src={s.creatorAvatar} alt={s.creator} size="sm" />
                    <span className="text-slate-300">{s.creator}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-300 hidden sm:table-cell">{s.plan}</td>
                <td className="py-3 px-4 text-emerald-400 font-bold hidden md:table-cell">{s.amount}</td>
                <td className="py-3 px-4 text-slate-400 hidden md:table-cell">{s.duration}</td>
                <td className="py-3 px-4">
                  <Badge variant={s.status === 'active' ? 'emerald' : s.status === 'cancelled' ? 'rose' : 'amber'} size="sm">
                    {s.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-slate-500 hidden lg:table-cell">{s.endDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
