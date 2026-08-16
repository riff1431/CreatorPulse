'use client';

import React, { useState } from 'react';
import {
  RefreshCw, AlertTriangle, ShieldAlert, Play, CheckCircle2,
  Clock, Calendar, ArrowRight, Zap, RefreshCcw
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { Avatar } from '@/components/admin/ui/Avatar';
import { SubscriberSubscription, processFailedPaymentRetry } from '@/lib/payments/subscription-billing-store';

interface RenewalsAndRetriesTabProps {
  subscriptions: SubscriberSubscription[];
  onRefresh: () => void;
}

export const RenewalsAndRetriesTab: React.FC<RenewalsAndRetriesTabProps> = ({
  subscriptions,
  onRefresh
}) => {
  const [runningBatch, setRunningBatch] = useState(false);
  const [batchLogs, setBatchLogs] = useState<string[]>([]);
  const [processingSubId, setProcessingSubId] = useState<string | null>(null);

  // Subscriptions needing attention (in_grace or past_due)
  const retryQueue = subscriptions.filter(
    (s) => s.status === 'in_grace' || s.status === 'past_due' || s.failedAttempts > 0
  );

  const handleRunBatchCheck = async () => {
    setRunningBatch(true);
    setBatchLogs(['[Cron Engine] Starting Subscription Auto-Renewal & Payment Retry Check...']);

    await new Promise((r) => setTimeout(r, 600));
    setBatchLogs((prev) => [...prev, `[Queue] Found ${retryQueue.length} subscriptions in retry / grace period queue.`]);

    let successCount = 0;
    let failCount = 0;

    for (const sub of retryQueue) {
      await new Promise((r) => setTimeout(r, 400));
      try {
        const res = await processFailedPaymentRetry(sub.id);
        if (res.success) {
          successCount++;
          setBatchLogs((prev) => [...prev, `[Success] ${sub.userName} (${sub.planName}) -> Charged via ${sub.gatewayId}. Subscription active.`]);
        } else {
          failCount++;
          setBatchLogs((prev) => [...prev, `[Failed] ${sub.userName} (${sub.planName}) -> ${res.message}`]);
        }
      } catch (err: any) {
        failCount++;
        setBatchLogs((prev) => [...prev, `[Error] ${sub.userName} -> ${err.message}`]);
      }
    }

    setBatchLogs((prev) => [
      ...prev,
      `[Completed] Batch check completed. ${successCount} recovered, ${failCount} failed.`
    ]);
    setRunningBatch(false);
    onRefresh();
  };

  const handleSingleRetry = async (sub: SubscriberSubscription) => {
    setProcessingSubId(sub.id);
    try {
      const res = await processFailedPaymentRetry(sub.id);
      alert(res.message);
      onRefresh();
    } catch (err: any) {
      alert(`Retry failed: ${err.message}`);
    } finally {
      setProcessingSubId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Control */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="text-indigo-400 animate-spin-slow" size={22} />
            <h2 className="text-lg font-black text-white">Renewals & Failed-Payment Retries Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated retry schedules, grace period monitoring, and instant payment recovery for active gateway plugins.
          </p>
        </div>

        <Button
          onClick={handleRunBatchCheck}
          disabled={runningBatch}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shrink-0 cursor-pointer"
          leftIcon={<Play size={15} />}
        >
          {runningBatch ? 'Processing Batch...' : 'Run Batch Renewals & Retries'}
        </Button>
      </div>

      {/* Batch Console Output if active */}
      {batchLogs.length > 0 && (
        <Card className="bg-slate-950 text-slate-200 border-slate-800 p-4 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Live Cron Engine Execution Log</div>
          {batchLogs.map((log, index) => (
            <div key={index} className={log.includes('[Success]') ? 'text-emerald-400' : log.includes('[Failed]') || log.includes('[Error]') ? 'text-rose-400' : 'text-slate-300'}>
              {log}
            </div>
          ))}
        </Card>
      )}

      {/* Retry Queue List */}
      <Card className="p-0 overflow-x-auto">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={18} />
            <h3 className="font-bold text-slate-900 text-sm">Failed Payments & Grace Period Queue ({retryQueue.length})</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Automatic retries trigger every 24-48h per gateway schedule</span>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-left uppercase tracking-wider font-bold">
              <th className="py-3 px-4">Subscriber</th>
              <th className="py-3 px-4">Plan</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Retry Attempts</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Grace Expiration</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {retryQueue.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                  <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={24} />
                  No failed payments or subscriptions currently in grace period! All subscriptions are healthy.
                </td>
              </tr>
            ) : (
              retryQueue.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={sub.userAvatar} alt={sub.userName} size="sm" />
                      <div>
                        <div className="font-bold text-slate-900">{sub.userName}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{sub.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{sub.planName}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">${sub.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      Attempt {sub.failedAttempts} of 3
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={sub.status === 'in_grace' ? 'amber' : 'rose'} size="sm">
                      {sub.status === 'in_grace' ? 'In Grace Period' : 'Past Due'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">
                    {sub.gracePeriodEnd ? sub.gracePeriodEnd.substring(0, 10) : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] cursor-pointer"
                      disabled={processingSubId === sub.id}
                      onClick={() => handleSingleRetry(sub)}
                      leftIcon={<Zap size={13} />}
                    >
                      {processingSubId === sub.id ? 'Charging...' : 'Force Retry Now'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
