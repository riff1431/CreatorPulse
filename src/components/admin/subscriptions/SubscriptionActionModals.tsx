'use client';

import React, { useState, useEffect } from 'react';
import { Crown, Calculator, Clock, Save, X, Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/admin/ui/Modal';
import { Button } from '@/components/admin/ui/Button';
import {
  SubscriptionPlan,
  SubscriberSubscription,
  saveSubscriptionPlan,
  processPlanChange,
  extendGracePeriod,
  calculateProration
} from '@/lib/payments/subscription-billing-store';

// 1. Plan Form Modal (Create / Edit Plan)
interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: SubscriptionPlan | null;
  onSuccess: () => void;
}

export const PlanFormModal: React.FC<PlanFormModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({
    name: '',
    slug: '',
    description: '',
    price: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    trialDays: 0,
    setupFee: 0,
    tierLevel: 1,
    gracePeriodDays: 5,
    maxRetryAttempts: 3,
    features: ['Access to creator feed'],
    isActive: true
  });

  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    if (plan) {
      setFormData(plan);
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        trialDays: 0,
        setupFee: 0,
        tierLevel: 1,
        gracePeriodDays: 5,
        maxRetryAttempts: 3,
        features: ['Access to creator feed'],
        isActive: true
      });
    }
  }, [plan, isOpen]);

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...(prev.features || []), featureInput.trim()]
    }));
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please enter plan name');
      return;
    }
    saveSubscriptionPlan(formData);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={plan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Plan Name *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                })
              }
              placeholder="e.g. Pro Creator Tier"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Slug</label>
            <input
              type="text"
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Description</label>
          <textarea
            rows={2}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief plan benefits summary..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Price ($) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price ?? 9.99}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-black focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Billing Cycle</label>
            <select
              value={formData.billingCycle || 'monthly'}
              onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="biannual">Bi-Annual</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tier Weight (1-3)</label>
            <select
              value={formData.tierLevel || 1}
              onChange={(e) => setFormData({ ...formData, tierLevel: parseInt(e.target.value) || 1 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value={1}>Tier 1 (Starter)</option>
              <option value={2}>Tier 2 (Pro)</option>
              <option value={3}>Tier 3 (VIP)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Trial Days</label>
            <input
              type="number"
              value={formData.trialDays ?? 0}
              onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Setup Fee ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.setupFee ?? 0}
              onChange={(e) => setFormData({ ...formData, setupFee: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Grace Period (Days)</label>
            <input
              type="number"
              value={formData.gracePeriodDays ?? 5}
              onChange={(e) => setFormData({ ...formData, gracePeriodDays: parseInt(e.target.value) || 5 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Features Checklist */}
        <div>
          <label className="font-bold text-slate-700 block mb-1">Plan Benefits & Features</label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="e.g. Direct chat access"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
            <Button type="button" size="sm" onClick={handleAddFeature} className="bg-slate-800 text-white font-bold cursor-pointer">
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {formData.features?.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-100 p-2 rounded-lg text-slate-700 text-xs">
                <span>{f}</span>
                <button type="button" onClick={() => handleRemoveFeature(i)} className="text-rose-600 cursor-pointer">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer">
            Save Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// 2. Change Plan Modal (Upgrade / Downgrade)
interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriberSubscription | null;
  plans: SubscriptionPlan[];
  onSuccess: () => void;
}

export const ChangePlanModal: React.FC<ChangePlanModalProps> = ({
  isOpen,
  onClose,
  subscription,
  plans,
  onSuccess
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  useEffect(() => {
    if (plans.length > 0) setSelectedPlanId(plans[0].id);
  }, [plans]);

  if (!subscription) return null;

  const targetPlan = plans.find((p) => p.id === selectedPlanId);
  const proration = targetPlan ? calculateProration(subscription, targetPlan) : null;

  const handleApply = () => {
    if (!targetPlan) return;
    try {
      const res = processPlanChange(subscription.id, targetPlan.id);
      alert(
        `Successfully changed plan for ${subscription.userName} to ${targetPlan.name}!\nNet charge: $${res.proration.netCharge.toFixed(2)}`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Failed to change plan: ${err.message}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Change Plan for ${subscription.userName}`}>
      <div className="space-y-4 text-xs font-medium">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Current Active Plan</div>
          <div className="font-extrabold text-slate-900 text-sm">{subscription.planName}</div>
          <div className="text-emerald-600 font-bold">${subscription.amount.toFixed(2)} / {subscription.billingCycle}</div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Select New Target Plan</label>
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — Tier {p.tierLevel} (${p.price}/{p.billingCycle})
              </option>
            ))}
          </select>
        </div>

        {proration && (
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2 text-slate-800">
            <div className="font-bold text-indigo-900">Proration Calculation Preview</div>
            <div className="flex justify-between text-xs">
              <span>Unused Days Credit:</span>
              <span className="font-bold text-emerald-700">-${proration.prorationCredit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>New Plan Price:</span>
              <span className="font-bold">${proration.newPlanPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black pt-2 border-t border-indigo-200 text-slate-900">
              <span>Net Immediate Charge:</span>
              <span className="text-indigo-700">${proration.netCharge.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleApply} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer">
            Confirm & Process Plan Change
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 3. Extend Grace Modal
interface ExtendGraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriberSubscription | null;
  onSuccess: () => void;
}

export const ExtendGraceModal: React.FC<ExtendGraceModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onSuccess
}) => {
  const [extraDays, setExtraDays] = useState(3);

  if (!subscription) return null;

  const handleExtend = () => {
    try {
      extendGracePeriod(subscription.id, extraDays);
      alert(`Grace period for ${subscription.userName} extended by ${extraDays} days.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Error extending grace period: ${err.message}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Extend Grace Period - ${subscription.userName}`}>
      <div className="space-y-4 text-xs font-medium">
        <p className="text-slate-600">
          Extend subscriber grace period duration during payment failure recovery. Subscriber will retain access during this window.
        </p>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Extra Days to Add</label>
          <input
            type="number"
            min={1}
            max={30}
            value={extraDays}
            onChange={(e) => setExtraDays(parseInt(e.target.value) || 1)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleExtend} className="bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer">
            Extend Grace Period
          </Button>
        </div>
      </div>
    </Modal>
  );
};
