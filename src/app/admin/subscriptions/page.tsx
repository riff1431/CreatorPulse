'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Avatar } from '@/components/admin/ui/Avatar';

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
          <CreditCard className="text-indigo-600" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">Subscriptions</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">View and manage all active, cancelled, and expired subscriptions.</p>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[#71717A] text-left">
              <th className="py-3.5 px-4 font-bold">Subscriber</th>
              <th className="py-3.5 px-4 font-bold">Creator</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Plan</th>
              <th className="py-3.5 px-4 font-bold hidden md:table-cell">Amount</th>
              <th className="py-3.5 px-4 font-bold hidden md:table-cell">Duration</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold hidden lg:table-cell">End Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {subscriptions.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={s.subscriberAvatar} alt={s.subscriber} size="sm" />
                    <span className="font-bold text-[#18181B]">{s.subscriber}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={s.creatorAvatar} alt={s.creator} size="sm" />
                    <span className="text-[#52525B] font-medium">{s.creator}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-[#52525B] hidden sm:table-cell font-medium">{s.plan}</td>
                <td className="py-3 px-4 text-emerald-600 font-bold hidden md:table-cell">{s.amount}</td>
                <td className="py-3 px-4 text-[#71717A] hidden md:table-cell font-medium">{s.duration}</td>
                <td className="py-3 px-4">
                  <Badge variant={s.status === 'active' ? 'emerald' : s.status === 'cancelled' ? 'rose' : 'amber'} size="sm">
                    {s.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-[#A1A1AA] hidden lg:table-cell font-medium">{s.endDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
