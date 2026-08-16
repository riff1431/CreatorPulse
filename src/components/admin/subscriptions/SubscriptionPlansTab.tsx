'use client';

import React, { useState } from 'react';
import {
  Crown, Plus, Edit3, Trash2, Check, AlertCircle,
  Clock, ShieldAlert, DollarSign, Layers, Sparkles
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { SubscriptionPlan, saveSubscriptionPlan, deleteSubscriptionPlan } from '@/lib/payments/subscription-billing-store';

interface SubscriptionPlansTabProps {
  plans: SubscriptionPlan[];
  onRefresh: () => void;
  onOpenPlanModal: (plan?: SubscriptionPlan) => void;
}

export const SubscriptionPlansTab: React.FC<SubscriptionPlansTabProps> = ({
  plans,
  onRefresh,
  onOpenPlanModal
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete subscription plan "${name}"?`)) {
      setDeletingId(id);
      deleteSubscriptionPlan(id);
      onRefresh();
      setDeletingId(null);
    }
  };

  const handleToggleActive = (plan: SubscriptionPlan) => {
    saveSubscriptionPlan({ ...plan, isActive: !plan.isActive });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="text-amber-400" size={22} />
            <h2 className="text-lg font-black text-white">Subscription Plans Manager</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure tier levels, billing cycles, trial days, setup fees, grace periods, and failed retry limits.
          </p>
        </div>
        <Button
          onClick={() => onOpenPlanModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shrink-0 cursor-pointer"
          leftIcon={<Plus size={16} />}
        >
          Create New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col justify-between border transition-all duration-200 ${
              !plan.isActive
                ? 'bg-slate-50 border-slate-200 opacity-75'
                : plan.tierLevel === 3
                ? 'border-indigo-200 bg-gradient-to-b from-indigo-50/40 via-white to-white shadow-sm'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                    plan.tierLevel === 3
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : plan.tierLevel === 2
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  Tier {plan.tierLevel} ({plan.tierLevel === 1 ? 'Starter' : plan.tierLevel === 2 ? 'Pro' : 'VIP'})
                </span>

                <button
                  onClick={() => handleToggleActive(plan)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                    plan.isActive
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                >
                  {plan.isActive ? 'Active' : 'Disabled'}
                </button>
              </div>

              {/* Plan Name & Pricing */}
              <h3 className="text-base font-black text-slate-900 leading-tight">{plan.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px] font-medium">
                {plan.description}
              </p>

              <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900">${plan.price.toFixed(2)}</span>
                  <span className="text-xs text-slate-500 font-semibold"> / {plan.billingCycle}</span>
                </div>
                {plan.setupFee > 0 && (
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    +${plan.setupFee} setup fee
                  </span>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600 mb-4 bg-white p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-indigo-500 shrink-0" />
                  <span>Trial: <strong>{plan.trialDays ? `${plan.trialDays} days` : 'None'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldAlert size={13} className="text-amber-500 shrink-0" />
                  <span>Grace: <strong>{plan.gracePeriodDays} days</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers size={13} className="text-blue-500 shrink-0" />
                  <span>Max Retries: <strong>{plan.maxRetryAttempts}x</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-emerald-500 shrink-0" />
                  <span>Subscribers: <strong>{plan.activeSubscribersCount}</strong></span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-1.5 mb-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Included Benefits</p>
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                    <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs cursor-pointer font-bold"
                leftIcon={<Edit3 size={13} />}
                onClick={() => onOpenPlanModal(plan)}
              >
                Edit Plan
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:bg-rose-50 cursor-pointer p-2"
                onClick={() => handleDelete(plan.id, plan.name)}
                disabled={deletingId === plan.id}
              >
                <Trash2 size={15} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
