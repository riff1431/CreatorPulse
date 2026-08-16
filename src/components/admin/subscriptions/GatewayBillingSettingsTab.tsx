'use client';

import React, { useState } from 'react';
import {
  CreditCard, Settings, RefreshCw, CheckCircle2, ShieldCheck,
  Zap, Save, AlertCircle, Puzzle, Globe
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { GatewayBillingConfig, saveGatewayBillingConfig } from '@/lib/payments/subscription-billing-store';

interface GatewayBillingSettingsTabProps {
  configs: GatewayBillingConfig[];
  onRefresh: () => void;
}

export const GatewayBillingSettingsTab: React.FC<GatewayBillingSettingsTabProps> = ({
  configs,
  onRefresh
}) => {
  const [editingConfigs, setEditingConfigs] = useState<Record<string, GatewayBillingConfig>>(() => {
    const map: Record<string, GatewayBillingConfig> = {};
    configs.forEach((c) => (map[c.gatewayId] = { ...c }));
    return map;
  });

  const handleFieldChange = (gatewayId: string, field: keyof GatewayBillingConfig, val: any) => {
    setEditingConfigs((prev) => ({
      ...prev,
      [gatewayId]: {
        ...prev[gatewayId],
        [field]: val
      }
    }));
  };

  const handleSave = (gatewayId: string) => {
    const target = editingConfigs[gatewayId];
    if (!target) return;
    saveGatewayBillingConfig(target);
    alert(`Billing settings for gateway ${target.gatewayName} saved successfully.`);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Puzzle className="text-indigo-400" size={22} />
            <h2 className="text-lg font-black text-white">Gateway-Specific Subscription Settings</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamically configure recurring billing behavior, retry schedules, grace period limits, and webhook sync across active payment gateway plugins.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configs.map((config) => {
          const state = editingConfigs[config.gatewayId] || config;

          return (
            <Card key={config.gatewayId} className="border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{config.gatewayName}</h3>
                    <span className="font-mono text-[10px] text-slate-400">{config.gatewayId}</span>
                  </div>
                </div>
                <Badge variant={config.supportsRecurring ? 'emerald' : 'slate'} size="sm">
                  {config.supportsRecurring ? 'Recurring Supported' : 'One-Time Only'}
                </Badge>
              </div>

              <div className="space-y-3 text-xs">
                {/* Subscription Mode */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Recurring Billing Execution Mode</label>
                  <select
                    value={state.subscriptionMode}
                    onChange={(e) => handleFieldChange(config.gatewayId, 'subscriptionMode', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="direct_gateway">Direct Gateway Native Subscriptions (Stripe Customer Portal)</option>
                    <option value="tokenized_recurring">Tokenized Recurring (PayPal Billing Agreements)</option>
                    <option value="managed_retry">Platform Managed Retries (PipraPay / Sandbox Token)</option>
                  </select>
                </div>

                {/* Retry Schedule Days */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Retry Schedule Intervals (Days)</label>
                  <input
                    type="text"
                    value={Array.isArray(state.retrySchedule) ? state.retrySchedule.join(', ') : '1, 3, 7'}
                    onChange={(e) =>
                      handleFieldChange(
                        config.gatewayId,
                        'retrySchedule',
                        e.target.value.split(',').map((n) => parseInt(n.trim()) || 1)
                      )
                    }
                    placeholder="e.g. 1, 3, 7, 14"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Days between retry attempts after initial payment failure.</p>
                </div>

                {/* Grace Period */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Gateway Grace Period (Days)</label>
                    <input
                      type="number"
                      value={state.gracePeriodDays}
                      onChange={(e) => handleFieldChange(config.gatewayId, 'gracePeriodDays', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id={`autocancel-${config.gatewayId}`}
                      checked={state.autoCancelOnMaxRetries}
                      onChange={(e) => handleFieldChange(config.gatewayId, 'autoCancelOnMaxRetries', e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={`autocancel-${config.gatewayId}`} className="font-bold text-slate-700 text-[11px]">
                      Auto-Cancel on Max Retries
                    </label>
                  </div>
                </div>

                {/* Webhook Sync toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-800">Webhook IPN Synchronization</div>
                      <div className="text-[10px] text-slate-400 font-medium">Sync payment events live via gateway IPN</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={state.webhookSyncEnabled}
                    onChange={(e) => handleFieldChange(config.gatewayId, 'webhookSyncEnabled', e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => handleSave(config.gatewayId)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  leftIcon={<Save size={14} />}
                >
                  Save Gateway Settings
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
