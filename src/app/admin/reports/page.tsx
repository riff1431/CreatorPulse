'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Report {
  id: string;
  reporter: string;
  targetType: 'post' | 'user' | 'reel';
  targetTitle: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  reportedAt: string;
}

const initialReports: Report[] = [
  { id: '1', reporter: 'Jordan Lee', targetType: 'post', targetTitle: 'FREE CRYPTO AIRDROP CLICK HERE!!!', reason: 'Spam and unauthorized promotional link', status: 'pending', reportedAt: '12m ago' },
  { id: '2', reporter: 'Alex Vance', targetType: 'user', targetTitle: '@crypto_bot_99', reason: 'Automated bot account spamming comments', status: 'pending', reportedAt: '45m ago' },
  { id: '3', reporter: 'David Miller', targetType: 'reel', targetTitle: 'Uncredited fitness video repost', reason: 'Copyright infringement / re-upload', status: 'resolved', reportedAt: '2 days ago' },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState(initialReports);

  const handleResolve = (id: string) => {
    setReports(reports.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)));
  };

  const handleDismiss = (id: string) => {
    setReports(reports.map((r) => (r.id === id ? { ...r, status: 'dismissed' } : r)));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-[#F43F5E]" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">Reports & Moderation</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Review community reports, take action, and maintain community safety.</p>
      </div>

      <div className="space-y-4">
        {reports.map((rep) => (
          <Card key={rep.id} className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Badge variant={rep.targetType === 'user' ? 'rose' : rep.targetType === 'reel' ? 'pink' : 'slate'} size="sm">
                  {rep.targetType.toUpperCase()}
                </Badge>
                <h3 className="font-bold text-sm text-[#18181B]">{rep.targetTitle}</h3>
              </div>
              <Badge variant={rep.status === 'resolved' ? 'emerald' : rep.status === 'dismissed' ? 'slate' : 'rose'} size="sm">
                {rep.status}
              </Badge>
            </div>

            <div className="bg-[#FFF9FC] p-4 rounded-2xl border border-[#F3DCE8] space-y-1.5 text-xs">
              <p className="text-[#BE123C] font-bold">Reason: {rep.reason}</p>
              <p className="text-[#71717A] font-medium">Reported by: <strong className="text-[#18181B]">{rep.reporter}</strong> • {rep.reportedAt}</p>
            </div>

            {rep.status === 'pending' && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F3DCE8]">
                <Button variant="ghost" size="sm" onClick={() => handleDismiss(rep.id)}>
                  Dismiss Report
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleResolve(rep.id)} leftIcon={<CheckCircle2 size={14} />}>
                  Take Action & Resolve
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
