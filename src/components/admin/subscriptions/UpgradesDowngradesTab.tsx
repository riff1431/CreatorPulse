'use client';

import React, { useState } from 'react';
import {
  ArrowUpRight, ArrowDownRight, Layers, Calculator, CheckCircle2,
  DollarSign, Sparkles, User, RefreshCw
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { Avatar } from '@/components/admin/ui/Avatar';
import {
  SubscriberSubscription,
  SubscriptionPlan,
  calculateProration,
  processPlanChange,
  SubscriptionAuditLog
} from '@/lib/payments/subscription-billing-store';

interface UpgradesDowngradesTabProps {
  subscriptions: SubscriberSubscription[];
  plans: SubscriptionPlan[];
  logs: SubscriptionAuditLog[];
  onRefresh: () => void;
}

export const UpgradesDowngradesTab: React.FC<UpgradesDowngradesTabProps> = ({
  subscriptions,
  plans,
  logs,
  onRefresh
}) => {
  const [selectedSubId, setSelectedSubId] = useState<string>(subscriptions[0]?.id || '');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[1]?.id || plans[0]?.id || '');

  const activeSub = subscriptions.find((s) => s.id === selectedSubId);
  const targetPlan = plans.find((p) => p.id === selectedPlanId);

  const proration = activeSub && targetPlan ? calculateProration(activeSub, targetPlan) : null;

  const upgradeLogs = logs.filter((l) => l.action === 'UPGRADED' || l.action === 'DOWNGRADED');

  const handleApplyChange = () => {
    if (!activeSub || !targetPlan) return;
    try {
      const result = processPlanChange(activeSub.id, targetPlan.id);
      alert(
        `Successfully ${result.proration.isUpgrade ? 'upgraded' : 'downgraded'} ${
          activeSub.userName
        } to ${targetPlan.name}!\nNet charge: $${result.proration.netCharge.toFixed(2)}`
      );
      onRefresh();
    } catch (err: any) {
      alert(`Plan change failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulator Section */}
      <Card className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white p-6 rounded-2xl border border-indigo-800 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="text-indigo-400" size={22} />
          <div>
            <h2 className="text-base font-black text-white">Plan Upgrade & Downgrade Proration Simulator</h2>
            <p className="text-xs text-slate-300">
              Calculate unused days credit from current plan and compute pro-rated difference for instant tier changes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 my-4">
          {/* Select Subscriber */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200">Select Subscriber</label>
            <select
              value={selectedSubId}
              onChange={(e) => setSelectedSubId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-indigo-400"
            >
              {subscriptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.userName} — Current: {s.planName} (${s.amount}/mo)
                </option>
              ))}
            </select>
          </div>

          {/* Select Target Plan */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200">Select New Target Plan</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-indigo-400"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — Tier {p.tierLevel} (${p.price}/{p.billingCycle})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Proration Calculation Box */}
        {proration && activeSub && targetPlan && (
          <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {proration.isUpgrade ? (
                  <Badge variant="emerald" size="md">
                    <ArrowUpRight size={14} className="mr-1 inline" /> Upgrade
                  </Badge>
                ) : (
                  <Badge variant="amber" size="md">
                    <ArrowDownRight size={14} className="mr-1 inline" /> Downgrade
                  </Badge>
                )}
                <span className="text-xs text-slate-300 font-medium">
                  {activeSub.planName} → {targetPlan.name}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {proration.daysRemaining} days remaining in current period
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Old Plan Price</div>
                <div className="text-sm font-black text-white">${proration.oldPlanPrice.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Unused Days Credit</div>
                <div className="text-sm font-black text-emerald-400">-${proration.prorationCredit.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-[10px] text-slate-400 uppercase font-bold">New Plan Price</div>
                <div className="text-sm font-black text-white">${proration.newPlanPrice.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-indigo-600/30 border border-indigo-500/40 rounded-lg">
                <div className="text-[10px] text-indigo-300 uppercase font-bold">Net Immediate Charge</div>
                <div className="text-base font-black text-amber-300">${proration.netCharge.toFixed(2)}</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={handleApplyChange}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
                leftIcon={<CheckCircle2 size={15} />}
              >
                Apply Plan Change & Invoice Subscriber
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Upgrade & Downgrade Audit History */}
      <Card className="p-0 overflow-x-auto">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="text-indigo-600" size={18} />
            <h3 className="font-bold text-slate-900 text-sm">Proration Upgrade & Downgrade History Log</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{upgradeLogs.length} plan changes recorded</span>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-left uppercase tracking-wider font-bold">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Subscriber</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Gateway</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {upgradeLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                  No upgrade or downgrade events logged yet. Use the simulator above to process changes.
                </td>
              </tr>
            ) : (
              upgradeLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-medium">{log.timestamp.substring(0, 16).replace('T', ' ')}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{log.subscriberName}</td>
                  <td className="py-3 px-4">
                    <Badge variant={log.action === 'UPGRADED' ? 'emerald' : 'amber'} size="sm">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{log.description}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.gatewayId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
