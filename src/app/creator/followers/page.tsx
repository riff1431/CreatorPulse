'use client';

import React, { useState } from 'react';
import { Users, Search, UserMinus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

const followers = [
  { id: '1', name: 'Alex Vance', username: 'alexvance', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', followedSince: '2026-01-15', isFollowingBack: true },
  { id: '2', name: 'Jordan Lee', username: 'jordanlee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', followedSince: '2026-03-22', isFollowingBack: false },
  { id: '3', name: 'Mia Wong', username: 'miawong', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', followedSince: '2026-05-01', isFollowingBack: false },
  { id: '4', name: 'David Miller', username: 'fitdavid', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', followedSince: '2026-06-10', isFollowingBack: true },
  { id: '5', name: 'Emma Torres', username: 'emmabakes', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', followedSince: '2026-07-08', isFollowingBack: false },
  { id: '6', name: 'Ryan Park', username: 'ryanpark', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150', followedSince: '2026-08-01', isFollowingBack: false },
  { id: '7', name: 'Olivia Chen', username: 'oliviachen', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', followedSince: '2026-08-10', isFollowingBack: true },
];

export default function CreatorFollowersPage() {
  const [search, setSearch] = useState('');

  const filtered = followers.filter((f) =>
    !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Users className="text-cyan-400" size={22} />
          <h1 className="text-xl font-black text-white">Followers</h1>
          <span className="text-sm text-slate-500 font-medium ml-1">14,280</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">People who follow your creator profile.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
        <input type="text" placeholder="Search followers..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50" />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-left">
              <th className="py-3 px-4 font-semibold">Follower</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Followed Since</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((f) => (
              <tr key={f.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={f.avatar} alt={f.name} size="sm" />
                    <div>
                      <p className="font-bold text-slate-200">{f.name}</p>
                      <p className="text-[10px] text-slate-500">@{f.username}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">{f.followedSince}</td>
                <td className="py-3 px-4">
                  {f.isFollowingBack ? (
                    <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">Mutual</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">Follows You</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {!f.isFollowingBack && <Button variant="outline" size="sm">Follow Back</Button>}
                    <Button variant="ghost" size="sm"><UserMinus size={13} className="text-slate-400" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
