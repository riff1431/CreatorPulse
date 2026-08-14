'use client';

import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

const stories = [
  { id: '1', creator: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', caption: 'Recording today\'s design masterclass 🎨', views: 340, expiresAt: '21 hours', status: 'active' },
  { id: '2', creator: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', caption: 'Live Q&A starting in 30 minutes! 💻', views: 520, expiresAt: '18 hours', status: 'active' },
  { id: '3', creator: 'Lisa Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', caption: 'New sample pack dropping tomorrow 🎧', views: 180, expiresAt: '6 hours', status: 'active' },
  { id: '4', creator: 'David Miller', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', caption: 'Morning workout routine 💪', views: 90, expiresAt: 'Expired', status: 'expired' },
];

export default function AdminStoriesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Clock className="text-amber-400" size={22} />
          <h1 className="text-xl font-black text-white">Stories Management</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">View and manage 24-hour ephemeral stories.</p>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-left">
              <th className="py-3 px-4 font-semibold">Creator</th>
              <th className="py-3 px-4 font-semibold">Caption</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Views</th>
              <th className="py-3 px-4 font-semibold">Expires</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {stories.map((s) => (
              <tr key={s.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={s.avatar} alt={s.creator} size="sm" />
                    <span className="font-bold text-slate-200">{s.creator}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-300 truncate max-w-[200px]">{s.caption}</td>
                <td className="py-3 px-4 text-slate-300 hidden sm:table-cell">{s.views}</td>
                <td className="py-3 px-4 text-slate-400">{s.expiresAt}</td>
                <td className="py-3 px-4">
                  <Badge variant={s.status === 'active' ? 'emerald' : 'slate'} size="sm">{s.status}</Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm"><Trash2 size={13} className="text-rose-400" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
