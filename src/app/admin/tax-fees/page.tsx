'use client';

import React, { useState, useEffect } from 'react';
import {
  Percent, Globe, CreditCard, Calculator, Settings, Plus,
  ShieldCheck, DollarSign, Layers, Sparkles
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';

// Stores
import {
  CountryTaxRule,
  PlatformFeeConfig,
  GatewayProcessingFee,
  getTaxRules,
  getPlatformFeeConfig,
  getGatewayProcessingFees
} from '@/lib/payments/tax-fee-store';

// Tab Components
import { TaxRulesTab } from '@/components/admin/tax-fees/TaxRulesTab';
import { PlatformFeeTab } from '@/components/admin/tax-fees/PlatformFeeTab';
import { GatewayProcessingFeesTab } from '@/components/admin/tax-fees/GatewayProcessingFeesTab';
import { FeeCalculatorSimulatorTab } from '@/components/admin/tax-fees/FeeCalculatorSimulatorTab';

// Modals
import { TaxRuleModal } from '@/components/admin/tax-fees/TaxFeeModals';

type TaxFeeTab = 'rules' | 'platform' | 'gateways' | 'simulator';

export default function AdminTaxFeesPage() {
  const [activeTab, setActiveTab] = useState<TaxFeeTab>('rules');

  const [rules, setRules] = useState<CountryTaxRule[]>([]);
  const [platformConfig, setPlatformConfig] = useState<PlatformFeeConfig>(getPlatformFeeConfig());
  const [gatewayFees, setGatewayFees] = useState<GatewayProcessingFee[]>([]);

  const [selectedRuleForEdit, setSelectedRuleForEdit] = useState<CountryTaxRule | null>(null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  const loadData = () => {
    setRules(getTaxRules());
    setPlatformConfig(getPlatformFeeConfig());
    setGatewayFees(getGatewayProcessingFees());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('creatorpulse_tax_fees_updated', handleUpdate);
    return () => window.removeEventListener('creatorpulse_tax_fees_updated', handleUpdate);
  }, []);

  const handleOpenRuleModal = (rule?: CountryTaxRule) => {
    setSelectedRuleForEdit(rule || null);
    setIsRuleModalOpen(true);
  };

  const activeRulesCount = rules.filter((r) => r.isActive).length;

  const tabs = [
    { id: 'rules', label: 'Country Tax Rules', icon: Globe, badge: activeRulesCount },
    { id: 'platform', label: 'Platform Fees & Revenue Splits', icon: Percent },
    { id: 'gateways', label: 'Gateway Processing Fees', icon: CreditCard, badge: gatewayFees.length },
    { id: 'simulator', label: 'Fee Calculator Simulator', icon: Calculator }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Percent className="text-indigo-600" size={24} />
            <h1 className="text-xl font-black text-slate-900">Dynamic Tax & Fee Manager</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Configure regional taxes (VAT, GST, Sales Tax), platform fee splits, creator tier overrides, and gateway surcharges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenRuleModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
            leftIcon={<Plus size={15} />}
          >
            Add Tax Rule
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Regional Tax Rules</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{activeRulesCount} Regions</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">US, EU VAT, UK, CA, AU, BD & Global</div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Default Platform Fee</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{platformConfig.defaultPlatformFeePercentage}%</div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1">Creators receive {platformConfig.creatorCommissionPercentage}% base</div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fixed Base Fee / Min Floor</div>
          <div className="text-2xl font-black text-slate-900 mt-1">${platformConfig.fixedFeeAmount.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Min platform fee: ${platformConfig.minimumFeeAmount.toFixed(2)}</div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gateway Surcharge Rules</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{gatewayFees.length} Active</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Stripe, PayPal, PipraPay & Mock</div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto scrollbar-none pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TaxFeeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      {activeTab === 'rules' && (
        <TaxRulesTab
          rules={rules}
          onRefresh={loadData}
          onOpenRuleModal={handleOpenRuleModal}
        />
      )}

      {activeTab === 'platform' && (
        <PlatformFeeTab config={platformConfig} onRefresh={loadData} />
      )}

      {activeTab === 'gateways' && (
        <GatewayProcessingFeesTab gatewayFees={gatewayFees} onRefresh={loadData} />
      )}

      {activeTab === 'simulator' && <FeeCalculatorSimulatorTab />}

      {/* Tax Rule Modal */}
      <TaxRuleModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        rule={selectedRuleForEdit}
        onSuccess={loadData}
      />
    </div>
  );
}
