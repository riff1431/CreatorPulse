'use client';

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Filter, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Eye, Settings, Trash2 } from 'lucide-react';

export const ModerationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'rules' | 'logs'>('queue');
  const [filter, setFilter] = useState('all');

  const mockQueue = [
    { id: 'mod-1', author: 'user_dev99', type: 'Comment', reason: 'Toxicity Score 0.89', status: 'pending', createdAt: '10 mins ago', content: 'Suspicious promotion link added' },
    { id: 'mod-2', author: 'creator_test', type: 'Post', reason: 'Potential NSFW image', status: 'pending', createdAt: '25 mins ago', content: 'Unverified image attachment' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-rose-600 animate-pulse" size={24} />
            <h1 className="text-xl font-black text-[#18181B]">AI Content Moderation Queue</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Automated toxicity scanning, image visual classifiers, and moderation audit logs.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck size={14} /> AI Scanner Active
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Review</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{mockQueue.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Auto-Passed (Today)</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">1,420</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Auto-Rejected (Today)</p>
          <p className="text-2xl font-black text-rose-600 mt-1">14</p>
        </div>
      </div>

      {/* Moderation Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">Flagged Items Queue</h3>
          <span className="text-xs text-slate-500 font-medium">{mockQueue.length} items requiring review</span>
        </div>
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <tr>
              <th className="py-3 px-4">Author</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Flag Reason</th>
              <th className="py-3 px-4">Content Preview</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {mockQueue.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">{item.author}</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">{item.type}</span></td>
                <td className="py-3 px-4 text-rose-600 font-bold">{item.reason}</td>
                <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{item.content}</td>
                <td className="py-3 px-4 text-slate-400">{item.createdAt}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer">
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer">
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
