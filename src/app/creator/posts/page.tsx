'use client';

import React, { useState } from 'react';
import { FileText, Search, PlusSquare, Eye, EyeOff, Trash2, Image, Video, BarChart2, Type, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const posts = [
  { id: '1', title: 'Modern Micro-Interactions in Web Apps', type: 'image', visibility: 'public', likes: 342, comments: 28, views: 2410, date: '2026-08-12', status: 'published' },
  { id: '2', title: 'Community Poll: Next UI Kit', type: 'poll', visibility: 'public', likes: 94, comments: 16, views: 1200, date: '2026-08-10', status: 'published' },
  { id: '3', title: '[VIP] Advanced Figma Variables Masterclass', type: 'video', visibility: 'members_only', likes: 128, comments: 34, views: 680, date: '2026-08-08', status: 'published' },
  { id: '4', title: 'Audio Masterclass: Color Theory Foundations', type: 'audio', visibility: 'subscribers', likes: 56, comments: 8, views: 420, date: '2026-08-06', status: 'published' },
  { id: '5', title: 'Upcoming: Design Systems 2.0 (Draft)', type: 'text', visibility: 'public', likes: 0, comments: 0, views: 0, date: '2026-08-14', status: 'draft' },
];

const typeIcons: Record<string, React.ReactNode> = {
  image: <Image size={12} className="text-[#EC4899]" />,
  video: <Video size={12} className="text-[#BE185D]" />,
  poll: <BarChart2 size={12} className="text-amber-500" />,
  text: <Type size={12} className="text-[#71717A]" />,
  audio: <Volume2 size={12} className="text-purple-500" />,
};

export default function CreatorPostsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = posts.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="text-[#EC4899]" size={22} />
            <h1 className="text-xl font-black text-[#18181B]">My Posts</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Manage and track all your published and draft posts.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<PlusSquare size={14} />}>New Post</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#F3DCE8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] shadow-sm font-medium"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] shadow-sm font-medium"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] text-left">
              <th className="py-3.5 px-4 font-bold">Post</th>
              <th className="py-3.5 px-4 font-bold">Type</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Visibility</th>
              <th className="py-3.5 px-4 font-bold hidden md:table-cell">Views</th>
              <th className="py-3.5 px-4 font-bold hidden md:table-cell">Likes</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3DCE8]">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-[#FFF9FC] transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-[#18181B] truncate max-w-[280px]">{p.title}</p>
                  <p className="text-[10px] text-[#A1A1AA]">{p.date}</p>
                </td>
                <td className="py-3 px-4"><Badge variant="slate" size="sm">{typeIcons[p.type]} {p.type}</Badge></td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <Badge variant={p.visibility === 'public' ? 'slate' : 'pink'} size="sm">{p.visibility}</Badge>
                </td>
                <td className="py-3 px-4 text-[#18181B] font-bold hidden md:table-cell">{p.views.toLocaleString()}</td>
                <td className="py-3 px-4 text-[#71717A] hidden md:table-cell font-medium">{p.likes}</td>
                <td className="py-3 px-4">
                  <Badge variant={p.status === 'published' ? 'emerald' : 'amber'} size="sm">{p.status}</Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm"><EyeOff size={13} /></Button>
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
