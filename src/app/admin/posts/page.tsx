'use client';

import React, { useState } from 'react';
import { FileText, Search, Filter, Eye, EyeOff, Trash2, Image, Video, BarChart2, Type, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

const allPosts = [
  { id: '1', author: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', title: 'Modern Micro-Interactions in Web Apps', type: 'image', visibility: 'public', likes: 342, comments: 28, views: 2410, status: 'published', date: '2026-08-12' },
  { id: '2', author: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', title: 'Fullstack Next.js 15 + Supabase Architecture Blueprint', type: 'video', visibility: 'members_only', likes: 580, comments: 45, views: 4200, status: 'published', date: '2026-08-11' },
  { id: '3', author: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', title: 'Community Poll: Next UI Kit', type: 'poll', visibility: 'public', likes: 94, comments: 16, views: 1200, status: 'published', date: '2026-08-10' },
  { id: '4', author: 'Lisa Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', title: 'Audio Masterclass: Sound Design Essentials', type: 'audio', visibility: 'subscribers', likes: 120, comments: 12, views: 890, status: 'published', date: '2026-08-09' },
  { id: '5', author: 'crypto_bot_99', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150', title: 'FREE CRYPTO AIRDROP CLICK HERE!!!', type: 'text', visibility: 'public', likes: 0, comments: 2, views: 15, status: 'hidden', date: '2026-08-08' },
];

const typeIcons: Record<string, React.ReactNode> = {
  image: <Image size={12} className="text-[#EC4899]" />,
  video: <Video size={12} className="text-[#BE185D]" />,
  poll: <BarChart2 size={12} className="text-amber-500" />,
  text: <Type size={12} className="text-[#71717A]" />,
  audio: <Volume2 size={12} className="text-purple-500" />,
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState(allPosts);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const handleToggleHide = (id: string) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, status: p.status === 'published' ? 'hidden' : 'published' } : p)));
  };

  const handleDelete = (id: string) => {
    setPosts(posts.filter((p) => p.id !== id));
  };

  const filtered = posts.filter((p) => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.author.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FileText className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">Content Moderation — Posts</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Review, moderate, hide, or delete user and creator posts.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
          <input
            type="text"
            placeholder="Search posts by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#F3DCE8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] shadow-sm font-medium"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-white border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] shadow-sm font-medium"
        >
          <option value="all">All Types</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="poll">Poll</option>
          <option value="audio">Audio</option>
          <option value="text">Text</option>
        </select>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] text-left">
              <th className="py-3.5 px-4 font-bold">Post Title</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Author</th>
              <th className="py-3.5 px-4 font-bold">Type</th>
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
                <td className="py-3 px-4 hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <Avatar src={p.avatar} alt={p.author} size="sm" />
                    <span className="text-[#52525B] font-medium">{p.author}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant="slate" size="sm">{typeIcons[p.type]} {p.type}</Badge>
                </td>
                <td className="py-3 px-4 text-[#71717A] hidden md:table-cell font-medium">{p.views.toLocaleString()}</td>
                <td className="py-3 px-4 text-[#71717A] hidden md:table-cell font-medium">{p.likes}</td>
                <td className="py-3 px-4">
                  <Badge variant={p.status === 'published' ? 'emerald' : 'rose'} size="sm">
                    {p.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleToggleHide(p.id)}>
                      {p.status === 'published' ? <EyeOff size={13} /> : <Eye size={13} className="text-[#EC4899]" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
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
