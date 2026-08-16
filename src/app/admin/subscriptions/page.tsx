'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard, Crown, RefreshCw, Layers, FileText, Settings,
  Clock, TrendingUp, AlertCircle, Plus, Users, ShieldAlert, Sparkles
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';

// Stores
import {
  SubscriptionPlan,
  SubscriberSubscription,
  SubscriptionAuditLog,
  GatewayBillingConfig,
  getSubscriptionPlans,
  getSubscriberSubscriptions,
  getSubscriptionAuditLogs,
  getGatewayBillingConfigs
} from '@/lib/payments/subscription-billing-store';

import { PlatformInvoice, getPlatformInvoices } from '@/lib/payments/invoice-system-store';

// Tab Components
import { SubscriptionPlansTab } from '@/components/admin/subscriptions/SubscriptionPlansTab';
import { SubscribersTab } from '@/components/admin/subscriptions/SubscribersTab';
import { RenewalsAndRetriesTab } from '@/components/admin/subscriptions/RenewalsAndRetriesTab';
import { UpgradesDowngradesTab } from '@/components/admin/subscriptions/UpgradesDowngradesTab';
import { InvoicesTab } from '@/components/admin/subscriptions/InvoicesTab';
import { GatewayBillingSettingsTab } from '@/components/admin/subscriptions/GatewayBillingSettingsTab';
import { SubscriptionHistoryTab } from '@/components/admin/subscriptions/SubscriptionHistoryTab';

// Modals
import {
  PlanFormModal,
  ChangePlanModal,
  ExtendGraceModal
} from '@/components/admin/subscriptions/SubscriptionActionModals';
import { InvoicePrintModal } from '@/components/admin/invoices/InvoicePrintModal';
import { InvoiceSettingsModal } from '@/components/admin/invoices/InvoiceSettingsModal';

type BillingTab = 'subscribers' | 'plans' | 'retries' | 'proration' | 'invoices' | 'gateways' | 'history';

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<BillingTab>('subscribers');

  // State
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriberSubscription[]>([]);
  const [logs, setLogs] = useState<SubscriptionAuditLog[]>([]);
  const [configs, setConfigs] = useState<GatewayBillingConfig[]>([]);
  const [invoices, setInvoices] = useState<PlatformInvoice[]>([]);

  // Modals state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<SubscriptionPlan | null>(null);

  const [selectedSubForAction, setSelectedSubForAction] = useState<SubscriberSubscription | null>(null);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [isGraceModalOpen, setIsGraceModalOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState<PlatformInvoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isInvoiceSettingsModalOpen, setIsInvoiceSettingsModalOpen] = useState(false);

  const loadAllData = () => {
    setPlans(getSubscriptionPlans());
    setSubscriptions(getSubscriberSubscriptions());
    setLogs(getSubscriptionAuditLogs());
    setConfigs(getGatewayBillingConfigs());
    setInvoices(getPlatformInvoices());
  };

  useEffect(() => {
    loadAllData();
    const handleUpdate = () => loadAllData();
    window.addEventListener('creatorpulse_subscription_billing_updated', handleUpdate);
    window.addEventListener('creatorpulse_invoices_updated', handleUpdate);
    return () => {
      window.removeEventListener('creatorpulse_subscription_billing_updated', handleUpdate);
      window.removeEventListener('creatorpulse_invoices_updated', handleUpdate);
    };
  }, []);

  // Compute metrics
  const activeSubsCount = subscriptions.filter((s) => s.status === 'active').length;
  const graceSubsCount = subscriptions.filter((s) => s.status === 'in_grace' || s.status === 'past_due').length;
  const mrr = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((acc, s) => acc + (s.billingCycle === 'yearly' ? s.amount / 12 : s.amount), 0);
  const failedCount = subscriptions.reduce((acc, s) => acc + s.failedAttempts, 0);

  const handleOpenPlanModal = (plan?: SubscriptionPlan) => {
    setSelectedPlanForEdit(plan || null);
    setIsPlanModalOpen(true);
  };

  const handleSelectSubAction = (
    sub: SubscriberSubscription,
    action: 'retry' | 'upgrade' | 'grace' | 'cancel' | 'invoices'
  ) => {
    setSelectedSubForAction(sub);
    if (action === 'upgrade') {
      setIsChangePlanModalOpen(true);
    } else if (action === 'grace') {
      setIsGraceModalOpen(true);
    } else if (action === 'retry') {
      setActiveTab('retries');
    } else if (action === 'invoices') {
      setActiveTab('invoices');
    }
  };

  const tabs = [
    { id: 'subscribers', label: 'Live Subscribers', icon: Users, badge: subscriptions.length },
    { id: 'plans', label: 'Plans Manager', icon: Crown, badge: plans.length },
    { id: 'retries', label: 'Renewals & Retries', icon: RefreshCw, badge: graceSubsCount > 0 ? graceSubsCount : undefined, badgeVariant: 'amber' },
    { id: 'proration', label: 'Upgrades & Downgrades', icon: Layers },
    { id: 'invoices', label: 'Invoices & Receipts', icon: FileText, badge: invoices.length },
    { id: 'gateways', label: 'Gateway Billing Settings', icon: Settings },
    { id: 'history', label: 'Audit Trail', icon: Clock }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="text-indigo-600" size={24} />
            <h1 className="text-xl font-black text-slate-900">Dynamic Subscription Billing Manager</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage plans, recurring billing cycles, renewals, cancellations, grace periods, retries, upgrades, and gateway billing rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenPlanModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
            leftIcon={<Plus size={15} />}
          >
            Create Plan
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Recurring Revenue (MRR)</div>
          <div className="text-2xl font-black text-slate-900 mt-1">${mrr.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">+12.4% from active subscribers</div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Subscribers</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{activeSubsCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Out of {subscriptions.length} total members</div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Grace Period / Past Due</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{graceSubsCount}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Active retry recovery loop</div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Failed Payment Attempts</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{failedCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Across all gateway plugins</div>
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
              onClick={() => setActiveTab(tab.id as BillingTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    tab.badgeVariant === 'amber'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      {activeTab === 'subscribers' && (
        <SubscribersTab
          subscriptions={subscriptions}
          onRefresh={loadAllData}
          onSelectSubscription={handleSelectSubAction}
        />
      )}

      {activeTab === 'plans' && (
        <SubscriptionPlansTab
          plans={plans}
          onRefresh={loadAllData}
          onOpenPlanModal={handleOpenPlanModal}
        />
      )}

      {activeTab === 'retries' && (
        <RenewalsAndRetriesTab subscriptions={subscriptions} onRefresh={loadAllData} />
      )}

      {activeTab === 'proration' && (
        <UpgradesDowngradesTab
          subscriptions={subscriptions}
          plans={plans}
          logs={logs}
          onRefresh={loadAllData}
        />
      )}

      {activeTab === 'invoices' && (
        <InvoicesTab
          invoices={invoices}
          onRefresh={loadAllData}
          onOpenInvoiceModal={(inv) => {
            setSelectedInvoice(inv);
            setIsInvoiceModalOpen(true);
          }}
          onOpenSettingsModal={() => setIsInvoiceSettingsModalOpen(true)}
        />
      )}

      {activeTab === 'gateways' && (
        <GatewayBillingSettingsTab configs={configs} onRefresh={loadAllData} />
      )}

      {activeTab === 'history' && <SubscriptionHistoryTab logs={logs} />}

      {/* Modals */}
      <PlanFormModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        plan={selectedPlanForEdit}
        onSuccess={loadAllData}
      />

      <ChangePlanModal
        isOpen={isChangePlanModalOpen}
        onClose={() => setIsChangePlanModalOpen(false)}
        subscription={selectedSubForAction}
        plans={plans}
        onSuccess={loadAllData}
      />

      <ExtendGraceModal
        isOpen={isGraceModalOpen}
        onClose={() => setIsGraceModalOpen(false)}
        subscription={selectedSubForAction}
        onSuccess={loadAllData}
      />

      <InvoicePrintModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={selectedInvoice}
      />

      <InvoiceSettingsModal
        isOpen={isInvoiceSettingsModalOpen}
        onClose={() => setIsInvoiceSettingsModalOpen(false)}
        onSuccess={loadAllData}
      />
    </div>
  );
}
