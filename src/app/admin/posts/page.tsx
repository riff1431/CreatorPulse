'use client';

import React, { useState } from 'react';
import { FileText, Search, Filter, Eye, EyeOff, Trash2, Image, Video, BarChart2, Type } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

const posts = [
  { id: '1', title: 'Modern Micro-Interactions in Web Apps', author: 'Sarah Jenkins', authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', type: 'image', visibility: 'public', likes: 342, reports: 0, date: '2026-08-12', status: 'active' },
  { id: '2', title: '[VIP] Full Supabase RLS Production Setup', author: 'Marcus Vance', authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', type: 'video', visibility: 'members_only', likes: 184, reports: 0, date: '2026-08-11', status: 'active' },
  { id: '3', title: 'Community Poll: Next UI Kit', author: 'Sarah Jenkins', authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', type: 'poll', visibility: 'public', likes: 94, reports: 0, date: '2026-08-10', status: 'active' },
  { id: '4', title: 'Off-topic spam promotion', author: 'crypto_bot_99', authorAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150', type: 'text', visibility: 'public', likes: 2, reports: 3, date: '2026-08-09', status: 'hidden' },
  { id: '5', title: 'Audio Masterclass: Color Theory', author: 'Sarah Jenkins', authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', type: 'audio', visibility: 'subscribers', likes: 56, reports: 0, date: '2026-08-08', status: 'active' },
];

const typeIcons: Record<string, React.ReactNode> = {
  image: <Image size={12} className="text-cyan-400" />,
  video: <Video size={12} className="text-indigo-400" />,
  poll: <BarChart2 size={12} className="text-amber-400" />,
  text: <Type size={12} className="text-slate-400" />,
  audio: <Type size={12} className="text-violet-400" />,
};

export default function AdminPostsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = posts.filter((p) => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FileText className="text-cyan-400" size={22} />
          <h1 className="text-xl font-black text-white">Posts Management</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">View, moderate, and manage all platform posts.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input type="text" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none">
          <option value="all">All Types</option>
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="poll">Poll</option>
          <option value="audio">Audio</option>
        </select>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-left">
              <th className="py-3 px-4 font-semibold">Post</th>
              <th className="py-3 px-4 font-semibold">Type</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Visibility</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">Likes</th>
              <th className="py-3 px-4 font-semibold">Reports</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={p.authorAvatar} alt={p.author} size="sm" />
                    <div>
                      <p className="font-bold text-slate-200 truncate max-w-[200px]">{p.title}</p>
                      <p className="text-[10px] text-slate-500">by {p.author} • {p.date}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant="slate" size="sm">{typeIcons[p.type]} {p.type}</Badge>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <Badge variant={p.visibility === 'public' ? 'cyan' : 'indigo'} size="sm">{p.visibility}</Badge>
                </td>
                <td className="py-3 px-4 text-slate-300 hidden md:table-cell">{p.likes}</td>
                <td className="py-3 px-4">
                  {p.reports > 0 ? (
                    <Badge variant="rose" size="sm">{p.reports} reports</Badge>
                  ) : (
                    <span className="text-slate-500">0</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={p.status === 'active' ? 'emerald' : 'amber'} size="sm">{p.status}</Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" title="Toggle visibility">
                      {p.status === 'active' ? <EyeOff size={13} /> : <Eye size={13} />}
                    </Button>
                    <Button variant="ghost" size="sm" title="Delete"><Trash2 size={13} className="text-rose-400" /></Button>
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
