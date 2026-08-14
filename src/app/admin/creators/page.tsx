'use client';

import React, { useState } from 'react';
import { UserCheck, Search, Filter, MoreVertical, Star, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

const creators = [
  { id: '1', name: 'Sarah Jenkins', username: 'sarahdesign', email: 'sarah@designcode.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', category: 'Art & Design', subscribers: 840, earnings: '$34,500', status: 'verified' },
  { id: '2', name: 'Marcus Vance', username: 'marcuscode', email: 'marcus@codemaster.io', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', category: 'Education & Tech', subscribers: 1450, earnings: '$68,900', status: 'verified' },
  { id: '3', name: 'Lisa Chen', username: 'lisasound', email: 'lisa@ambientvibes.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', category: 'Music & Sound', subscribers: 270, earnings: '$12,400', status: 'verified' },
  { id: '4', name: 'David Miller', username: 'fitdavid', email: 'david@fitnessedge.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', category: 'Fitness & Wellness', subscribers: 190, earnings: '$6,200', status: 'pending' },
  { id: '5', name: 'Emma Torres', username: 'emmabakes', email: 'emma@sweetstudio.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', category: 'Food & Cooking', subscribers: 95, earnings: '$2,800', status: 'suspended' },
];

export default function AdminCreatorsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = creators.filter((c) => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.username.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <UserCheck className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">Creator Management</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Manage verified creators, categories, and earnings performance.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
          <input
            type="text"
            placeholder="Search creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#F3DCE8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] shadow-sm font-medium"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] shadow-sm font-medium"
        >
          <option value="all">All Categories</option>
          <option value="Art & Design">Art & Design</option>
          <option value="Education & Tech">Education & Tech</option>
          <option value="Music & Sound">Music & Sound</option>
          <option value="Fitness & Wellness">Fitness & Wellness</option>
          <option value="Food & Cooking">Food & Cooking</option>
        </select>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] text-left">
              <th className="py-3.5 px-4 font-bold">Creator</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Category</th>
              <th className="py-3.5 px-4 font-bold">Subscribers</th>
              <th className="py-3.5 px-4 font-bold hidden md:table-cell">Earnings</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3DCE8]">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-[#FFF9FC] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={c.avatar} alt={c.name} size="sm" isVerified={c.status === 'verified'} />
                    <div>
                      <p className="font-bold text-[#18181B]">{c.name}</p>
                      <p className="text-[10px] text-[#71717A]">@{c.username}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-[#71717A] hidden sm:table-cell font-medium">{c.category}</td>
                <td className="py-3 px-4 text-[#18181B] font-bold">{c.subscribers.toLocaleString()}</td>
                <td className="py-3 px-4 text-emerald-600 font-bold hidden md:table-cell">{c.earnings}</td>
                <td className="py-3 px-4">
                  <Badge variant={c.status === 'verified' ? 'pink' : c.status === 'pending' ? 'amber' : 'rose'} size="sm">
                    {c.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm">
                    <MoreVertical size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
