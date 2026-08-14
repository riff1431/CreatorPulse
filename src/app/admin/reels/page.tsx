'use client';

import React from 'react';
import { Film, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

const reels = [
  { id: '1', title: '3 UI Design Mistakes You\'re Making!', creator: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', views: 14200, likes: 1420, reports: 0, date: '2026-08-11', status: 'active' },
  { id: '2', title: 'Why Supabase RLS is a Game-Changer', creator: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', views: 28900, likes: 2890, reports: 0, date: '2026-08-10', status: 'active' },
  { id: '3', title: 'Quick Figma Prototyping Tips', creator: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', views: 8400, likes: 640, reports: 1, date: '2026-08-08', status: 'active' },
  { id: '4', title: 'Inappropriate Content Reel', creator: 'crypto_bot_99', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150', views: 320, likes: 5, reports: 4, date: '2026-08-07', status: 'hidden' },
];

export default function AdminReelsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Film className="text-indigo-400" size={22} />
          <h1 className="text-xl font-black text-white">Reels Management</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Manage all short-form vertical video content.</p>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-left">
              <th className="py-3 px-4 font-semibold">Reel</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Views</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Likes</th>
              <th className="py-3 px-4 font-semibold">Reports</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {reels.map((r) => (
              <tr key={r.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={r.avatar} alt={r.creator} size="sm" />
                    <div>
                      <p className="font-bold text-slate-200 truncate max-w-[220px]">{r.title}</p>
                      <p className="text-[10px] text-slate-500">{r.creator} • {r.date}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-300 hidden sm:table-cell">{r.views.toLocaleString()}</td>
                <td className="py-3 px-4 text-slate-300 hidden sm:table-cell">{r.likes.toLocaleString()}</td>
                <td className="py-3 px-4">
                  {r.reports > 0 ? <Badge variant="rose" size="sm">{r.reports}</Badge> : <span className="text-slate-500">0</span>}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={r.status === 'active' ? 'emerald' : 'amber'} size="sm">{r.status}</Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm">{r.status === 'active' ? <EyeOff size={13} /> : <Eye size={13} />}</Button>
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
