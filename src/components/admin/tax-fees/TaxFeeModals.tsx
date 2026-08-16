'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Save, X, Percent } from 'lucide-react';
import { Modal } from '@/components/admin/ui/Modal';
import { Button } from '@/components/admin/ui/Button';
import {
  CountryTaxRule,
  PaymentType,
  saveTaxRule
} from '@/lib/payments/tax-fee-store';

interface TaxRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule?: CountryTaxRule | null;
  onSuccess: () => void;
}

export const TaxRuleModal: React.FC<TaxRuleModalProps> = ({
  isOpen,
  onClose,
  rule,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Partial<CountryTaxRule>>({
    countryCode: 'US',
    countryName: '',
    taxName: 'Sales Tax',
    taxRate: 5.0,
    isInclusive: false,
    appliedPaymentTypes: ['subscription', 'checkout', 'tip', 'wallet_funding'],
    isActive: true
  });

  useEffect(() => {
    if (rule) {
      setFormData(rule);
    } else {
      setFormData({
        countryCode: '',
        countryName: '',
        taxName: 'VAT',
        taxRate: 5.0,
        isInclusive: false,
        appliedPaymentTypes: ['subscription', 'checkout', 'tip', 'wallet_funding'],
        isActive: true
      });
    }
  }, [rule, isOpen]);

  const handleTogglePaymentType = (type: PaymentType) => {
    const current = formData.appliedPaymentTypes || [];
    if (current.includes(type)) {
      setFormData({ ...formData, appliedPaymentTypes: current.filter((t) => t !== type) });
    } else {
      setFormData({ ...formData, appliedPaymentTypes: [...current, type] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.countryName) {
      alert('Please enter country name');
      return;
    }
    saveTaxRule(formData);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={rule ? 'Edit Country Tax Rule' : 'Add New Country Tax Rule'}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Country Code (2-Letter ISO)</label>
            <input
              type="text"
              required
              placeholder="e.g. US, EU, GB, CA"
              value={formData.countryCode || ''}
              onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-indigo-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Country / Region Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. United States"
              value={formData.countryName || ''}
              onChange={(e) => setFormData({ ...formData, countryName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tax Label / Name</label>
            <input
              type="text"
              required
              placeholder="e.g. VAT, GST, Sales Tax"
              value={formData.taxName || ''}
              onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tax Rate (%) *</label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.taxRate ?? 5.0}
              onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Pricing Mode</label>
          <select
            value={formData.isInclusive ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, isInclusive: e.target.value === 'true' })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
          >
            <option value="false">Exclusive Tax (Tax added on top of item price at checkout)</option>
            <option value="true">Inclusive Tax (Tax already included inside listed item price)</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Apply to Payment Types</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'subscription', label: 'Subscription Memberships' },
              { id: 'checkout', label: 'One-Time Content Unlocks' },
              { id: 'tip', label: 'Creator Fan Support / Tips' },
              { id: 'wallet_funding', label: 'Wallet Top-Ups' }
            ].map((pt) => {
              const checked = (formData.appliedPaymentTypes || []).includes(pt.id as PaymentType);

              return (
                <label key={pt.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleTogglePaymentType(pt.id as PaymentType)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-800 text-xs font-semibold">{pt.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer" leftIcon={<Save size={14} />}>
            Save Tax Rule
          </Button>
        </div>
      </form>
    </Modal>
  );
};
