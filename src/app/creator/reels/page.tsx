'use client';

import React from 'react';
import { Film, PlusSquare, Trash2, Eye } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const reels = [
  { id: '1', title: '3 UI Design Mistakes You\'re Making!', views: 14200, likes: 1420, comments: 89, shares: 310, date: '2026-08-11', status: 'published' },
  { id: '2', title: 'Quick Figma Prototyping Tips', views: 8400, likes: 640, comments: 42, shares: 180, date: '2026-08-08', status: 'published' },
  { id: '3', title: 'Color Palette Generator Trick ✨', views: 5600, likes: 380, comments: 28, shares: 120, date: '2026-08-05', status: 'published' },
  { id: '4', title: 'Upcoming: Typography Deep Dive (Draft)', views: 0, likes: 0, comments: 0, shares: 0, date: '2026-08-14', status: 'draft' },
];

export default function CreatorReelsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Film className="text-[#EC4899]" size={22} />
            <h1 className="text-xl font-black text-[#18181B]">My Reels</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Manage your short vertical videos.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<PlusSquare size={14} />}>Upload Reel</Button>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] text-left">
              <th className="py-3.5 px-4 font-bold">Title</th>
              <th className="py-3.5 px-4 font-bold">Views</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Likes</th>
              <th className="py-3.5 px-4 font-bold hidden md:table-cell">Comments</th>
              <th className="py-3.5 px-4 font-bold hidden md:table-cell">Shares</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3DCE8]">
            {reels.map((r) => (
              <tr key={r.id} className="hover:bg-[#FFF9FC] transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-[#18181B] truncate max-w-[280px]">{r.title}</p>
                  <p className="text-[10px] text-[#A1A1AA]">{r.date}</p>
                </td>
                <td className="py-3 px-4 text-[#18181B] font-bold">{r.views.toLocaleString()}</td>
                <td className="py-3 px-4 text-[#71717A] hidden sm:table-cell font-medium">{r.likes.toLocaleString()}</td>
                <td className="py-3 px-4 text-[#71717A] hidden md:table-cell font-medium">{r.comments}</td>
                <td className="py-3 px-4 text-[#71717A] hidden md:table-cell font-medium">{r.shares}</td>
                <td className="py-3 px-4">
                  <Badge variant={r.status === 'published' ? 'emerald' : 'amber'} size="sm">{r.status}</Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm"><Eye size={13} /></Button>
                    <Button variant="ghost" size="sm"><Trash2 size={13} className="text-[#F43F5E]" /></Button>
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
