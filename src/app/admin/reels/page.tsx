'use client';

import React, { useState } from 'react';
import { Film, Search, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

const allReels = [
  { id: '1', creator: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', title: '3 UI Design Mistakes You\'re Making!', views: 14200, likes: 1420, comments: 89, status: 'published', date: '2026-08-11' },
  { id: '2', creator: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', title: 'Supabase RLS in 60 Seconds ⚡', views: 28400, likes: 3100, comments: 142, status: 'published', date: '2026-08-10' },
  { id: '3', creator: 'Lisa Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', title: 'Lofi Beat Creation Live in 45s 🎧', views: 8900, likes: 720, comments: 34, status: 'published', date: '2026-08-09' },
  { id: '4', creator: 'crypto_bot_99', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150', title: 'MAKE $10,000 TODAY GUARANTEED', views: 320, likes: 2, comments: 18, status: 'hidden', date: '2026-08-08' },
];

export default function AdminReelsPage() {
  const [reels, setReels] = useState(allReels);
  const [search, setSearch] = useState('');

  const handleToggleHide = (id: string) => {
    setReels(reels.map((r) => (r.id === id ? { ...r, status: r.status === 'published' ? 'hidden' : 'published' } : r)));
  };

  const handleDelete = (id: string) => {
    setReels(reels.filter((r) => r.id !== id));
  };

  const filtered = reels.filter((r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.creator.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Film className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">Content Moderation — Reels</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Review and moderate vertical short video reels.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
        <input
          type="text"
          placeholder="Search reels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-[#F3DCE8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] shadow-sm font-medium"
        />
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] text-left">
              <th className="py-3.5 px-4 font-bold">Reel</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Creator</th>
              <th className="py-3.5 px-4 font-bold">Views</th>
              <th className="py-3.5 px-4 font-bold hidden md:table-cell">Likes</th>
              <th className="py-3.5 px-4 font-bold hidden md:table-cell">Comments</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3DCE8]">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-[#FFF9FC] transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-[#18181B] truncate max-w-[280px]">{r.title}</p>
                  <p className="text-[10px] text-[#A1A1AA]">{r.date}</p>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <Avatar src={r.avatar} alt={r.creator} size="sm" />
                    <span className="text-[#52525B] font-medium">{r.creator}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-[#18181B] font-bold">{r.views.toLocaleString()}</td>
                <td className="py-3 px-4 text-[#71717A] hidden md:table-cell font-medium">{r.likes.toLocaleString()}</td>
                <td className="py-3 px-4 text-[#71717A] hidden md:table-cell font-medium">{r.comments}</td>
                <td className="py-3 px-4">
                  <Badge variant={r.status === 'published' ? 'emerald' : 'rose'} size="sm">
                    {r.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleToggleHide(r.id)}>
                      {r.status === 'published' ? <EyeOff size={13} /> : <Eye size={13} className="text-[#EC4899]" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                      <Trash2 size={13} className="text-[#F43F5E]" />
                    </Button>
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
