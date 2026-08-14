'use client';

import React from 'react';
import { Clock, PlusSquare, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const stories = [
  { id: '1', caption: 'Workspace preview! Recording today\'s design masterclass 🎨', views: 340, replies: 12, createdAt: '3 hours ago', expiresAt: '21h remaining', status: 'active' },
  { id: '2', caption: 'Coffee run before design review ☕', views: 580, replies: 24, createdAt: '18 hours ago', expiresAt: '6h remaining', status: 'active' },
  { id: '3', caption: 'Figma update thoughts poll', views: 890, replies: 45, createdAt: '2 days ago', expiresAt: 'Expired', status: 'expired' },
];

export default function CreatorStoriesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="text-[#EC4899]" size={22} />
            <h1 className="text-xl font-black text-[#18181B]">My Stories</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Manage your 24-hour ephemeral status updates.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<PlusSquare size={14} />}>Add Story</Button>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] text-left">
              <th className="py-3.5 px-4 font-bold">Caption</th>
              <th className="py-3.5 px-4 font-bold">Views</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Replies</th>
              <th className="py-3.5 px-4 font-bold hidden md:table-cell">Posted</th>
              <th className="py-3.5 px-4 font-bold">Expires</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3DCE8]">
            {stories.map((s) => (
              <tr key={s.id} className="hover:bg-[#FFF9FC] transition-colors">
                <td className="py-3 px-4 font-bold text-[#18181B] max-w-[280px] truncate">{s.caption}</td>
                <td className="py-3 px-4 text-[#18181B] font-bold">{s.views}</td>
                <td className="py-3 px-4 text-[#71717A] hidden sm:table-cell font-medium">{s.replies}</td>
                <td className="py-3 px-4 text-[#71717A] hidden md:table-cell font-medium">{s.createdAt}</td>
                <td className="py-3 px-4 text-[#A1A1AA] font-medium">{s.expiresAt}</td>
                <td className="py-3 px-4">
                  <Badge variant={s.status === 'active' ? 'emerald' : 'slate'} size="sm">{s.status}</Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm"><Trash2 size={13} className="text-[#F43F5E]" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
