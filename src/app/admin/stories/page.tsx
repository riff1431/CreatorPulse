'use client';

import React, { useState } from 'react';
import { Clock, Search, Trash2 } from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { Avatar } from '@/components/admin/ui/Avatar';

const allStories = [
  { id: '1', creator: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', caption: 'Workspace preview! Recording today\'s design masterclass 🎨', views: 340, status: 'active', expiresAt: '21h remaining' },
  { id: '2', creator: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', caption: 'Live code review session starting in 30 mins 💻', views: 580, status: 'active', expiresAt: '18h remaining' },
  { id: '3', creator: 'Lisa Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', caption: 'Late night studio vibes 🎵 New track dropping soon', views: 290, status: 'active', expiresAt: '12h remaining' },
  { id: '4', creator: 'David Miller', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', caption: 'Morning workout routine done 💪', views: 180, status: 'expired', expiresAt: 'Expired' },
];

export default function AdminStoriesPage() {
  const [stories, setStories] = useState(allStories);

  const handleDelete = (id: string) => {
    setStories(stories.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Clock className="text-indigo-600" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">Content Moderation — Stories</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Monitor active and expired 24-hour creator stories.</p>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[#71717A] text-left">
              <th className="py-3.5 px-4 font-bold">Creator</th>
              <th className="py-3.5 px-4 font-bold">Caption</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Views</th>
              <th className="py-3.5 px-4 font-bold hidden md:table-cell">Expires</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {stories.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={s.avatar} alt={s.creator} size="sm" hasStory={s.status === 'active'} />
                    <span className="font-bold text-[#18181B]">{s.creator}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-[#52525B] max-w-[280px] truncate font-medium">{s.caption}</td>
                <td className="py-3 px-4 text-[#18181B] font-bold hidden sm:table-cell">{s.views}</td>
                <td className="py-3 px-4 text-[#A1A1AA] hidden md:table-cell font-medium">{s.expiresAt}</td>
                <td className="py-3 px-4">
                  <Badge variant={s.status === 'active' ? 'emerald' : 'slate'} size="sm">{s.status}</Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}>
                    <Trash2 size={13} className="text-red-600" />
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
