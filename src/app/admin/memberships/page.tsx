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
          <Star className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">Membership Plans</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">View all membership plans created by creators across the platform.</p>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] text-left">
              <th className="py-3.5 px-4 font-bold">Creator</th>
              <th className="py-3.5 px-4 font-bold">Plan Name</th>
              <th className="py-3.5 px-4 font-bold">Price</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Subscribers</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3DCE8]">
            {plans.map((p) => (
              <tr key={p.id} className="hover:bg-[#FFF9FC] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={p.avatar} alt={p.creator} size="sm" />
                    <span className="font-bold text-[#18181B]">{p.creator}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-[#18181B] font-semibold">{p.plan}</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">{p.price}</td>
                <td className="py-3 px-4 text-[#71717A] hidden sm:table-cell font-medium">{p.subscribers}</td>
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
