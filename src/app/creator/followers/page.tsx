'use client';

import React, { useState } from 'react';
import { Users, Search, UserCheck, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

const followers = [
  { id: '1', name: 'Alex Vance', username: 'alexvance', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', followedAt: '2 days ago', isMutual: true, isSubscriber: true },
  { id: '2', name: 'Jordan Lee', username: 'jordanlee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', followedAt: '3 days ago', isMutual: false, isSubscriber: true },
  { id: '3', name: 'Mia Wong', username: 'miawong', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', followedAt: '5 days ago', isMutual: true, isSubscriber: false },
  { id: '4', name: 'David Miller', username: 'fitdavid', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', followedAt: '1 week ago', isMutual: false, isSubscriber: true },
  { id: '5', name: 'Emma Torres', username: 'emmabakes', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', followedAt: '2 weeks ago', isMutual: true, isSubscriber: false },
];

export default function CreatorFollowersPage() {
  const [search, setSearch] = useState('');
  const filtered = followers.filter((f) => !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Users className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">Followers</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Manage and interact with your 14,280 followers.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
        <input
          type="text"
          placeholder="Search followers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-[#F3DCE8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] shadow-sm font-medium"
        />
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] text-left">
              <th className="py-3.5 px-4 font-bold">User</th>
              <th className="py-3.5 px-4 font-bold">Relationship</th>
              <th className="py-3.5 px-4 font-bold">Member Status</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Followed</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3DCE8]">
            {filtered.map((f) => (
              <tr key={f.id} className="hover:bg-[#FFF9FC] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={f.avatar} alt={f.name} size="sm" />
                    <div>
                      <p className="font-bold text-[#18181B]">{f.name}</p>
                      <p className="text-[10px] text-[#71717A]">@{f.username}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={f.isMutual ? 'pink' : 'slate'} size="sm">
                    {f.isMutual ? 'Mutual Follow' : 'Follows You'}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  {f.isSubscriber ? (
                    <Badge variant="emerald" size="sm">Active Subscriber</Badge>
                  ) : (
                    <span className="text-[#A1A1AA] font-medium">Free Follower</span>
                  )}
                </td>
                <td className="py-3 px-4 text-[#A1A1AA] hidden sm:table-cell font-medium">{f.followedAt}</td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm" leftIcon={<MessageSquare size={13} />}>
                    Message
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
