'use client';

import React, { useState } from 'react';
import { FileText, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { MOCK_APPLICATIONS, CreatorApplication } from '@/lib/supabase/store';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<CreatorApplication[]>(MOCK_APPLICATIONS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const handleApprove = (id: string) => {
    setApplications(applications.map((a) => (a.id === id ? { ...a, status: 'approved' } : a)));
  };

  const handleReject = (id: string) => {
    setApplications(applications.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a)));
  };

  const filtered = applications.filter((a) => filter === 'all' || a.status === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FileText className="text-indigo-400" size={22} />
          <h1 className="text-xl font-black text-white">Creator Applications</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Review and manage creator verification applications.</p>
      </div>

      <div className="flex items-center gap-2 text-xs">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
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
                {applications.filter((a) => a.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((app) => (
          <Card key={app.id} className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={app.userAvatar} alt={app.userName} size="md" />
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{app.userName}</h3>
                  <p className="text-[10px] text-slate-400">{app.userEmail}</p>
                </div>
              </div>
              <Badge
                variant={app.status === 'approved' ? 'emerald' : app.status === 'rejected' ? 'rose' : 'amber'}
                size="sm"
              >
                {app.status.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Category</span>
                <span className="text-slate-200 font-semibold">{app.category}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Portfolio</span>
                <a href={app.portfolioUrl} target="_blank" rel="noopener" className="text-cyan-400 font-semibold flex items-center gap-1 hover:underline">
                  View <ExternalLink size={10} />
                </a>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Submitted</span>
                <span className="text-slate-200 font-semibold">{app.submittedAt}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider block mb-1">Application Reason</span>
              &ldquo;{app.reason}&rdquo;
            </div>

            {app.status === 'pending' && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(app.id)}
                  leftIcon={<XCircle size={14} className="text-rose-400" />}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApprove(app.id)}
                  leftIcon={<CheckCircle2 size={14} />}
                >
                  Approve Creator
                </Button>
              </div>
            )}
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-slate-500">
            No applications match your filter.
          </Card>
        )}
      </div>
    </div>
  );
}
