'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Eye, Ban, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { MOCK_REPORTS, ReportItem } from '@/lib/supabase/store';

const extendedReports: (ReportItem & { reporterAvatar: string; severity: 'low' | 'medium' | 'high' })[] = [
  { ...MOCK_REPORTS[0], reporterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', severity: 'medium' },
  { ...MOCK_REPORTS[1], reporterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', severity: 'high' },
  { id: 'rep-3', reporterName: 'Alex Vance', reporterAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', targetType: 'comment', targetTitle: 'Hateful comment on design post', reason: 'Harassment and bullying language', status: 'pending', createdAt: '6 hours ago', severity: 'high' },
  { id: 'rep-4', reporterName: 'Lisa Chen', reporterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', targetType: 'post', targetTitle: 'Copyright violation - stolen artwork', reason: 'This creator stole my original artwork and reposted it', status: 'pending', createdAt: '1 day ago', severity: 'high' },
  { id: 'rep-5', reporterName: 'David Miller', reporterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', targetType: 'user', targetTitle: 'User @spam_account_42', reason: 'Bot account sending bulk DMs', status: 'resolved', createdAt: '2 days ago', severity: 'medium' },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState(extendedReports);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');

  const handleResolve = (id: string) => {
    setReports(reports.map((r) => (r.id === id ? { ...r, status: 'resolved' as const } : r)));
  };

  const handleDismiss = (id: string) => {
    setReports(reports.map((r) => (r.id === id ? { ...r, status: 'dismissed' as const } : r)));
  };

  const filtered = reports.filter((r) => filter === 'all' || r.status === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-rose-400" size={22} />
          <h1 className="text-xl font-black text-white">Reports & Moderation</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Review flagged content, manage violations, and take moderation actions.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {(['all', 'pending', 'resolved', 'dismissed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && (
              <span className="ml-1.5 bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-full text-[10px]">
                {reports.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filtered.map((rep) => (
          <Card key={rep.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <Avatar src={rep.reporterAvatar} alt={rep.reporterName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-200">{rep.reporterName}</span>
                    <span className="text-[10px] text-slate-500">reported</span>
                    <span className="font-bold text-xs text-rose-400 truncate">{rep.targetTitle}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={rep.targetType === 'post' ? 'cyan' : rep.targetType === 'user' ? 'indigo' : 'amber'} size="sm">
                      {rep.targetType}
                    </Badge>
                    <Badge
                      variant={rep.severity === 'high' ? 'rose' : rep.severity === 'medium' ? 'amber' : 'slate'}
                      size="sm"
                    >
                      {rep.severity} priority
                    </Badge>
                    <span className="text-[10px] text-slate-500">{rep.createdAt}</span>
                  </div>
                </div>
              </div>
              <Badge
                variant={rep.status === 'resolved' ? 'emerald' : rep.status === 'dismissed' ? 'slate' : 'amber'}
                size="sm"
              >
                {rep.status.toUpperCase()}
              </Badge>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider block mb-1">Reason</span>
              &ldquo;{rep.reason}&rdquo;
            </div>

            {rep.status === 'pending' && (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" leftIcon={<Eye size={12} />}>View Content</Button>
                  <Button variant="ghost" size="sm" leftIcon={<MessageSquare size={12} />}>Warn User</Button>
                  <Button variant="ghost" size="sm" leftIcon={<Ban size={12} className="text-rose-400" />}>Suspend</Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDismiss(rep.id)} leftIcon={<XCircle size={12} />}>
                    Dismiss
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => handleResolve(rep.id)} leftIcon={<CheckCircle2 size={12} />}>
                    Resolve
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-slate-500">No reports match your filter.</Card>
        )}
      </div>
    </div>
  );
}
