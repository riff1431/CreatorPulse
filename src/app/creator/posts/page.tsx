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
  image: <Image size={12} className="text-cyan-400" />,
  video: <Video size={12} className="text-indigo-400" />,
  poll: <BarChart2 size={12} className="text-amber-400" />,
  text: <Type size={12} className="text-slate-400" />,
  audio: <Volume2 size={12} className="text-violet-400" />,
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
            <FileText className="text-cyan-400" size={22} />
            <h1 className="text-xl font-black text-white">My Posts</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Manage and track all your published and draft posts.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<PlusSquare size={14} />}>New Post</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input type="text" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-left">
              <th className="py-3 px-4 font-semibold">Post</th>
              <th className="py-3 px-4 font-semibold">Type</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Visibility</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">Views</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">Likes</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-200 truncate max-w-[250px]">{p.title}</p>
                  <p className="text-[10px] text-slate-500">{p.date}</p>
                </td>
                <td className="py-3 px-4"><Badge variant="slate" size="sm">{typeIcons[p.type]} {p.type}</Badge></td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <Badge variant={p.visibility === 'public' ? 'cyan' : 'indigo'} size="sm">{p.visibility}</Badge>
                </td>
                <td className="py-3 px-4 text-slate-300 hidden md:table-cell">{p.views.toLocaleString()}</td>
                <td className="py-3 px-4 text-slate-300 hidden md:table-cell">{p.likes}</td>
                <td className="py-3 px-4">
                  <Badge variant={p.status === 'published' ? 'emerald' : 'amber'} size="sm">{p.status}</Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm"><EyeOff size={13} /></Button>
                    <Button variant="ghost" size="sm"><Trash2 size={13} className="text-rose-400" /></Button>
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
