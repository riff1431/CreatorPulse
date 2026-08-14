'use client';

import React, { useState } from 'react';
import { UserCheck, Search, Filter, MoreVertical, ShieldCheck, ShieldOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

const creators = [
  { id: '1', name: 'Sarah Jenkins', username: 'sarahdesign', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', category: 'Art & Design', followers: 14280, subscribers: 840, revenue: '$34,500', verified: true },
  { id: '2', name: 'Marcus Vance', username: 'marcuscode', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', category: 'Education & Tech', followers: 22100, subscribers: 1450, revenue: '$68,900', verified: true },
  { id: '3', name: 'Lisa Chen', username: 'lisachen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', category: 'Music & Sound', followers: 8900, subscribers: 320, revenue: '$12,400', verified: true },
  { id: '4', name: 'David Miller', username: 'fitdavid', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', category: 'Fitness & Wellness', followers: 5400, subscribers: 180, revenue: '$6,200', verified: false },
  { id: '5', name: 'Emma Torres', username: 'emmabakes', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', category: 'Food & Cooking', followers: 3200, subscribers: 95, revenue: '$2,800', verified: false },
];

export default function AdminCreatorsPage() {
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  const filtered = creators.filter((c) => {
    if (verifiedFilter === 'verified' && !c.verified) return false;
    if (verifiedFilter === 'unverified' && c.verified) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <UserCheck className="text-indigo-400" size={22} />
          <h1 className="text-xl font-black text-white">Creator Management</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Manage all verified and pending creators on the platform.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text"
            placeholder="Search creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50"
          />
        </div>
        <select
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value as any)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
        >
          <option value="all">All Creators</option>
          <option value="verified">Verified Only</option>
          <option value="unverified">Unverified Only</option>
        </select>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-left">
              <th className="py-3 px-4 font-semibold">Creator</th>
              <th className="py-3 px-4 font-semibold">Category</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Followers</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">Subscribers</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">Revenue</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={c.avatar} alt={c.name} size="sm" isVerified={c.verified} />
                    <div>
                      <p className="font-bold text-slate-200">{c.name}</p>
                      <p className="text-[10px] text-slate-500">@{c.username}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4"><Badge variant="slate" size="sm">{c.category}</Badge></td>
                <td className="py-3 px-4 text-slate-300 hidden sm:table-cell">{c.followers.toLocaleString()}</td>
                <td className="py-3 px-4 text-slate-300 hidden md:table-cell">{c.subscribers.toLocaleString()}</td>
                <td className="py-3 px-4 text-emerald-400 font-bold hidden md:table-cell">{c.revenue}</td>
                <td className="py-3 px-4">
                  {c.verified ? (
                    <Badge variant="emerald" size="sm"><ShieldCheck size={10} /> Verified</Badge>
                  ) : (
                    <Badge variant="amber" size="sm"><ShieldOff size={10} /> Unverified</Badge>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm"><MoreVertical size={14} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
