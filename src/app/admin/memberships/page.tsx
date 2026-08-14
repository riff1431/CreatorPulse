'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

const plans = [
  { id: '1', creator: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', plan: 'Starter Community', price: '$5.00/mo', subscribers: 420, status: 'active' },
  { id: '2', creator: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', plan: 'Pro Designer Tier', price: '$15.00/mo', subscribers: 320, status: 'active' },
  { id: '3', creator: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', plan: 'VIP Inner Circle', price: '$30.00/mo', subscribers: 100, status: 'active' },
  { id: '4', creator: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', plan: 'Starter Community', price: '$5.00/mo', subscribers: 680, status: 'active' },
  { id: '5', creator: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', plan: 'Pro Developer Tier', price: '$15.00/mo', subscribers: 540, status: 'active' },
  { id: '6', creator: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', plan: 'VIP Inner Circle', price: '$30.00/mo', subscribers: 230, status: 'active' },
  { id: '7', creator: 'Lisa Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', plan: 'Basic Listener', price: '$3.00/mo', subscribers: 180, status: 'active' },
  { id: '8', creator: 'Lisa Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', plan: 'Producer Access', price: '$20.00/mo', subscribers: 90, status: 'inactive' },
];

export default function AdminMembershipsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Star className="text-amber-400" size={22} />
          <h1 className="text-xl font-black text-white">Membership Plans</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">View all membership plans created by creators across the platform.</p>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-left">
              <th className="py-3 px-4 font-semibold">Creator</th>
              <th className="py-3 px-4 font-semibold">Plan Name</th>
              <th className="py-3 px-4 font-semibold">Price</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Subscribers</th>
              <th className="py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {plans.map((p) => (
              <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Avatar src={p.avatar} alt={p.creator} size="sm" />
                    <span className="font-semibold text-slate-200">{p.creator}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-300 font-medium">{p.plan}</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{p.price}</td>
                <td className="py-3 px-4 text-slate-300 hidden sm:table-cell">{p.subscribers}</td>
                <td className="py-3 px-4">
                  <Badge variant={p.status === 'active' ? 'emerald' : 'slate'} size="sm">{p.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
