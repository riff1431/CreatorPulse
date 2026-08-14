'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Trash2, Eye, ShieldAlert, Flag, UserMinus, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

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
  { id: 'REP-101', reporter: 'Jordan Lee', targetType: 'post', targetTitle: 'FREE CRYPTO AIRDROP CLICK HERE!!!', reason: 'Spam and unauthorized promotional link', status: 'pending', reportedAt: '12m ago' },
  { id: 'REP-102', reporter: 'Alex Vance', targetType: 'user', targetTitle: '@crypto_bot_99', reason: 'Automated bot account spamming comments', status: 'pending', reportedAt: '45m ago' },
  { id: 'REP-103', reporter: 'David Miller', targetType: 'reel', targetTitle: 'Uncredited fitness video repost', reason: 'Copyright infringement / re-upload without permission', status: 'resolved', reportedAt: '2 days ago' },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [activeTab, setActiveTab] = useState<'all' | 'post' | 'reel' | 'user'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionOption, setActionOption] = useState('warning');
  const { showToast } = useToast();

  const handleDismiss = (id: string) => {
    setReports(reports.map((r) => {
      if (r.id === id) {
        showToast('Community report dismissed.', 'info');
        return { ...r, status: 'dismissed' };
      }
      return r;
    }));
  };

  const handleResolveAction = () => {
    if (!selectedReport) return;
    const id = selectedReport.id;
    
    setReports(reports.map((r) => {
      if (r.id === id) {
        let msg = '';
        if (actionOption === 'warning') msg = 'Warning sent to user.';
        else if (actionOption === 'remove') msg = 'Content removed from feeds.';
        else if (actionOption === 'suspend') msg = 'User account suspended for 7 days.';
        else msg = 'User account permanently banned.';
        
        showToast(`Report resolved: ${msg}`, 'success');
        return { ...r, status: 'resolved' };
      }
      return r;
    }));
    
    setSelectedReport(null);
  };

  const filteredReports = reports.filter(r => activeTab === 'all' || r.targetType === activeTab);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-[#F43F5E]" size={22} />
            <h1 className="text-xl font-black text-[#18181B] tracking-tight">Reports & Moderation</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Verify community reports, investigate content Visibilities, and moderate users.</p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-white/70 p-1 border border-[#F3DCE8] rounded-2xl shadow-xs self-start sm:self-auto">
          {(['all', 'post', 'reel', 'user'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                activeTab === tab
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]/50'
              }`}
            >
              {tab === 'all' ? 'All Queue' : `${tab}s`}
              {tab === 'all' && (
                <span className="ml-1.5 bg-[#FFE4E6] text-[#BE123C] px-1.5 py-0.5 rounded-full text-[9px] font-black">
                  {reports.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reports feed */}
      <div className="space-y-4">
        {filteredReports.map((rep) => (
          <Card key={rep.id} className="p-6 space-y-4 hoverable">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Badge variant={rep.targetType === 'user' ? 'rose' : rep.targetType === 'reel' ? 'pink' : 'slate'} size="sm">
                  {rep.targetType.toUpperCase()}
                </Badge>
                <h3 className="font-extrabold text-sm text-[#18181B] tracking-tight">{rep.targetTitle}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#A1A1AA] font-bold">Ref: {rep.id}</span>
                <Badge variant={rep.status === 'resolved' ? 'emerald' : rep.status === 'dismissed' ? 'slate' : 'rose'} size="sm">
                  {rep.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="bg-[#FFF9FC] p-4 rounded-2xl border border-[#F3DCE8] space-y-2 text-xs font-semibold text-[#18181B]">
              <div className="flex items-start gap-1.5 text-[#BE123C]">
                <Flag size={12} className="shrink-0 mt-0.5" />
                <p>Violation Claim: <span className="font-medium text-[#71717A]">{rep.reason}</span></p>
              </div>
              <p className="text-[#A1A1AA] text-[10px] font-bold">
                Reported by <span className="text-[#18181B] font-extrabold">{rep.reporter}</span> • {rep.reportedAt}
              </p>
            </div>

            {rep.status === 'pending' && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F3DCE8]/60">
                <Button variant="ghost" size="sm" onClick={() => handleDismiss(rep.id)}>
                  Dismiss Report
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<ShieldAlert size={14} />}
                  onClick={() => setSelectedReport(rep)}
                >
                  Take Moderation Action
                </Button>
              </div>
            )}
          </Card>
        ))}

        {filteredReports.length === 0 && (
          <p className="text-center py-12 text-[#71717A] font-bold">No violation reports logged in this tab.</p>
        )}
      </div>

      {/* Moderation Resolution Option Modal */}
      <Modal
        isOpen={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
        title={selectedReport ? `Resolve Abuse Report: ${selectedReport.id}` : ''}
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-800 space-y-1">
              <p className="font-extrabold flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-rose-600" /> Confirm Violation Case
              </p>
              <p className="text-[10px] text-rose-700/80 leading-normal">
                Subject: {selectedReport.targetTitle} ({selectedReport.targetType.toUpperCase()})
              </p>
              <p className="text-[10px] text-rose-700/80 leading-normal">
                Reason: {selectedReport.reason}
              </p>
            </div>

            <div className="space-y-3 font-semibold text-xs text-[#18181B]">
              <label className="block text-[#71717A] font-bold">Disciplinary Enforcement Action</label>
              
              <div className="space-y-2">
                <div
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer select-none transition-all ${
                    actionOption === 'warning' ? 'border-[#EC4899] bg-[#FFF9FC]' : 'border-[#F3DCE8] hover:bg-slate-50'
                  }`}
                  onClick={() => setActionOption('warning')}
                >
                  <input type="radio" checked={actionOption === 'warning'} onChange={() => {}} className="accent-[#EC4899]" />
                  <div>
                    <p className="font-bold text-[#18181B]">Send Formal Warning</p>
                    <p className="text-[9px] text-[#71717A] font-medium">Deliver warnings to the creator with no penalties.</p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer select-none transition-all ${
                    actionOption === 'remove' ? 'border-[#EC4899] bg-[#FFF9FC]' : 'border-[#F3DCE8] hover:bg-slate-50'
                  }`}
                  onClick={() => setActionOption('remove')}
                >
                  <input type="radio" checked={actionOption === 'remove'} onChange={() => {}} className="accent-[#EC4899]" />
                  <div>
                    <p className="font-bold text-[#18181B]">Remove & Delete Content</p>
                    <p className="text-[9px] text-[#71717A] font-medium">Delete reported post/reel and send warning logs.</p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer select-none transition-all ${
                    actionOption === 'suspend' ? 'border-[#EC4899] bg-[#FFF9FC]' : 'border-[#F3DCE8] hover:bg-slate-50'
                  }`}
                  onClick={() => setActionOption('suspend')}
                >
                  <input type="radio" checked={actionOption === 'suspend'} onChange={() => {}} className="accent-[#EC4899]" />
                  <div>
                    <p className="font-bold text-[#18181B]">Suspend Account (7 Days)</p>
                    <p className="text-[9px] text-[#71717A] font-medium">Temporarily freeze all follow/creator privileges.</p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer select-none transition-all ${
                    actionOption === 'ban' ? 'border-[#EC4899] bg-[#FFF9FC]' : 'border-[#F3DCE8] hover:bg-slate-50'
                  }`}
                  onClick={() => setActionOption('ban')}
                >
                  <input type="radio" checked={actionOption === 'ban'} onChange={() => {}} className="accent-[#EC4899]" />
                  <div>
                    <p className="font-bold text-[#18181B]">Permanently Ban User Account</p>
                    <p className="text-[9px] text-[#71717A] font-medium">Block user and disable wallet withdrawal settlement.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3DCE8] mt-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedApp(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<ShieldCheck size={14} />}
                onClick={handleResolveAction}
              >
                Resolve Abuse Case
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
