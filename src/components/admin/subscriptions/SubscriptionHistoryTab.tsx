'use client';

import React, { useState } from 'react';
import {
  Clock, ShieldCheck, AlertCircle, RefreshCw, Layers, Filter,
  User, CheckCircle2, Zap, FileText, ChevronDown, ChevronRight
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { SubscriptionAuditLog } from '@/lib/payments/subscription-billing-store';

interface SubscriptionHistoryTabProps {
  logs: SubscriptionAuditLog[];
}

export const SubscriptionHistoryTab: React.FC<SubscriptionHistoryTabProps> = ({ logs }) => {
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filtered = logs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    return true;
  });

  const getActionBadge = (action: SubscriptionAuditLog['action']) => {
    switch (action) {
      case 'RENEWED':
      case 'CREATED':
      case 'RESUMED':
        return <Badge variant="emerald" size="sm">{action}</Badge>;
      case 'UPGRADED':
        return <Badge variant="indigo" size="sm">Upgraded</Badge>;
      case 'DOWNGRADED':
        return <Badge variant="amber" size="sm">Downgraded</Badge>;
      case 'PAYMENT_FAILED':
      case 'SUSPENDED':
      case 'EXPIRED':
        return <Badge variant="rose" size="sm">{action}</Badge>;
      case 'GRACE_PERIOD_ENTERED':
      case 'RETRY_ATTEMPT':
        return <Badge variant="amber" size="sm">{action}</Badge>;
      case 'CANCELLED':
        return <Badge variant="slate" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="slate" size="sm">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Clock className="text-indigo-600" size={18} />
          <h3 className="font-extrabold text-slate-900 text-sm">Subscription Audit Trail & Event Timeline</h3>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Event Actions</option>
          <option value="CREATED">Created</option>
          <option value="RENEWED">Renewed</option>
          <option value="PAYMENT_FAILED">Payment Failed</option>
          <option value="RETRY_ATTEMPT">Retry Attempt</option>
          <option value="UPGRADED">Upgraded</option>
          <option value="DOWNGRADED">Downgraded</option>
          <option value="GRACE_PERIOD_ENTERED">Grace Period</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-left uppercase tracking-wider font-bold">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Subscriber</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Performed By</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Gateway</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  No subscription audit history entries found.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <React.Fragment key={log.id}>
                  <tr
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                  >
                    <td className="py-3 px-4 text-slate-500 font-medium">
                      {log.timestamp.substring(0, 19).replace('T', ' ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.subscriberName}</td>
                    <td className="py-3 px-4">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-4 capitalize font-semibold text-slate-600">
                      {log.performedBy.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{log.description}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {log.gatewayId.replace('plugin-', '')}
                    </td>
                  </tr>

                  {expandedLogId === log.id && log.details && (
                    <tr className="bg-slate-900 text-slate-200">
                      <td colSpan={6} className="p-4 font-mono text-[11px]">
                        <div className="font-bold text-indigo-400 mb-1">Event Payload Details:</div>
                        <pre className="bg-black/40 p-3 rounded-lg overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
