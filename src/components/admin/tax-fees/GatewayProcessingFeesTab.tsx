'use client';

import React, { useState } from 'react';
import { CreditCard, Save, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { GatewayProcessingFee, saveGatewayProcessingFee } from '@/lib/payments/tax-fee-store';

interface GatewayProcessingFeesTabProps {
  gatewayFees: GatewayProcessingFee[];
  onRefresh: () => void;
}

export const GatewayProcessingFeesTab: React.FC<GatewayProcessingFeesTabProps> = ({
  gatewayFees,
  onRefresh
}) => {
  const [editingFees, setEditingFees] = useState<Record<string, GatewayProcessingFee>>(() => {
    const map: Record<string, GatewayProcessingFee> = {};
    gatewayFees.forEach((g) => (map[g.gatewayId] = { ...g }));
    return map;
  });

  const handleFieldChange = (gatewayId: string, field: keyof GatewayProcessingFee, val: any) => {
    setEditingFees((prev) => ({
      ...prev,
      [gatewayId]: {
        ...prev[gatewayId],
        [field]: val
      }
    }));
  };

  const handleSave = (gatewayId: string) => {
    const target = editingFees[gatewayId];
    if (!target) return;
    saveGatewayProcessingFee(target);
    alert(`Payment processing fee rules for ${target.gatewayName} saved.`);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <CreditCard className="text-indigo-400" size={22} />
          <h2 className="text-lg font-black text-white">Gateway Processing Fees & Surcharges</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure payment processing surcharges per gateway plugin (Stripe, PayPal, PipraPay, Mock) and define charge allocation models.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gatewayFees.map((fee) => {
          const state = editingFees[fee.gatewayId] || fee;

          return (
            <Card key={fee.gatewayId} className="border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{fee.gatewayName}</h3>
                    <span className="font-mono text-[10px] text-slate-400">{fee.gatewayId}</span>
                  </div>
                </div>
                <Badge variant={state.isActive ? 'emerald' : 'rose'} size="sm">
                  {state.isActive ? 'Active Rules' : 'Disabled'}
                </Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Percentage Fee (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={state.percentageFee}
                      onChange={(e) => handleFieldChange(fee.gatewayId, 'percentageFee', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-indigo-700 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fixed Fee ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={state.fixedFee}
                      onChange={(e) => handleFieldChange(fee.gatewayId, 'fixedFee', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fee Allocation Model</label>
                  <select
                    value={state.chargeModel}
                    onChange={(e) => handleFieldChange(fee.gatewayId, 'chargeModel', e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="pass_to_buyer">Pass to Buyer (Add surcharge at checkout)</option>
                    <option value="absorb_by_platform">Absorb by Platform (Platform absorbs gateway fee)</option>
                    <option value="deduct_from_creator">Deduct from Creator (Deduct from creator earnings)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => handleSave(fee.gatewayId)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                  leftIcon={<Save size={14} />}
                >
                  Save Gateway Surcharge
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
