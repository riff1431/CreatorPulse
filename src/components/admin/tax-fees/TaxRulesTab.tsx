'use client';

import React, { useState } from 'react';
import { Globe, Plus, Edit3, Trash2, CheckCircle2, ShieldAlert, Tag, Percent } from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { CountryTaxRule, saveTaxRule, deleteTaxRule } from '@/lib/payments/tax-fee-store';

interface TaxRulesTabProps {
  rules: CountryTaxRule[];
  onRefresh: () => void;
  onOpenRuleModal: (rule?: CountryTaxRule) => void;
}

export const TaxRulesTab: React.FC<TaxRulesTabProps> = ({
  rules,
  onRefresh,
  onOpenRuleModal
}) => {
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete tax rule "${name}"?`)) {
      deleteTaxRule(id);
      onRefresh();
    }
  };

  const handleToggleActive = (rule: CountryTaxRule) => {
    saveTaxRule({ ...rule, isActive: !rule.isActive });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="text-indigo-400" size={22} />
            <h2 className="text-lg font-black text-white">Country & Region Tax Rules</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure regional VAT, GST, and Sales Tax rates with inclusive or exclusive pricing rules per country code.
          </p>
        </div>
        <Button
          onClick={() => onOpenRuleModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shrink-0 cursor-pointer"
          leftIcon={<Plus size={16} />}
        >
          Add Country Tax Rule
        </Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-left uppercase tracking-wider font-bold">
              <th className="py-3.5 px-4">Code</th>
              <th className="py-3.5 px-4">Country / Region</th>
              <th className="py-3.5 px-4">Tax Name</th>
              <th className="py-3.5 px-4">Tax Rate (%)</th>
              <th className="py-3.5 px-4">Pricing Mode</th>
              <th className="py-3.5 px-4 hidden md:table-cell">Applied Types</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{rule.countryCode}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">{rule.countryName}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-700">{rule.taxName}</td>
                <td className="py-3.5 px-4 font-black text-slate-900 text-sm">{rule.taxRate.toFixed(1)}%</td>
                <td className="py-3.5 px-4">
                  <Badge variant={rule.isInclusive ? 'indigo' : 'amber'} size="sm">
                    {rule.isInclusive ? 'Inclusive (Included)' : 'Exclusive (Added at checkout)'}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {rule.appliedPaymentTypes.map((t) => (
                      <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded capitalize font-medium">
                        {t.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => handleToggleActive(rule)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                      rule.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {rule.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] px-2 py-1 font-bold cursor-pointer"
                      leftIcon={<Edit3 size={12} />}
                      onClick={() => onOpenRuleModal(rule)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] text-rose-600 hover:bg-rose-50 cursor-pointer p-1"
                      onClick={() => handleDelete(rule.id, rule.countryName)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
