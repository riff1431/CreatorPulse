'use client';

import React from 'react';
import { Clock, PlusSquare, Trash2, Eye } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const stories = [
  { id: '1', caption: 'Workspace preview! Recording today\'s design masterclass 🎨', views: 340, reactions: 42, expiresAt: '21 hours', status: 'active' },
  { id: '2', caption: 'Behind the scenes: new Figma plugin 🔌', views: 280, reactions: 35, expiresAt: '16 hours', status: 'active' },
  { id: '3', caption: 'Q&A: Best fonts for SaaS dashboards?', views: 520, reactions: 64, expiresAt: 'Expired', status: 'expired' },
  { id: '4', caption: 'New color palette drop 🌈', views: 410, reactions: 51, expiresAt: 'Expired', status: 'expired' },
];

export default function CreatorStoriesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="text-amber-400" size={22} />
            <h1 className="text-xl font-black text-white">My Stories</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Manage your active and expired 24-hour stories.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<PlusSquare size={14} />}>Create Story</Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-left">
              <th className="py-3 px-4 font-semibold">Caption</th>
              <th className="py-3 px-4 font-semibold">Views</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Reactions</th>
              <th className="py-3 px-4 font-semibold">Expires</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {stories.map((s) => (
              <tr key={s.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-200 truncate max-w-[280px]">{s.caption}</p>
                </td>
                <td className="py-3 px-4 text-slate-300">{s.views}</td>
                <td className="py-3 px-4 text-slate-300 hidden sm:table-cell">{s.reactions}</td>
                <td className="py-3 px-4 text-slate-400">{s.expiresAt}</td>
                <td className="py-3 px-4">
                  <Badge variant={s.status === 'active' ? 'emerald' : 'slate'} size="sm">{s.status}</Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm"><Eye size={13} /></Button>
                    {s.status === 'active' && <Button variant="ghost" size="sm"><Trash2 size={13} className="text-rose-400" /></Button>}
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
