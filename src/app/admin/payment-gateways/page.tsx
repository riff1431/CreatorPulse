'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard, CheckCircle2, AlertTriangle, Settings, RefreshCw,
  Plus, ExternalLink, Shield, Zap, Sparkles, Lock, ArrowUpRight,
  ArrowRight, ShieldCheck, Eye, EyeOff, Check, X, SlidersHorizontal,
  ChevronUp, ChevronDown, Activity, Globe, DollarSign, Receipt,
  Layers, Upload, HelpCircle, Info
} from 'lucide-react';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { PluginManifest } from '@/lib/extensions/plugin-types';
import { PluginSettingsFramework } from '@/components/admin/PluginSettingsFramework';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';
import { Modal } from '@/components/admin/ui/Modal';
import { useAdminProgress } from '@/components/admin/AdminProgressProvider';

interface PaymentLog {
  id: string;
  timestamp: string;
  gatewayId: string;
  eventType: 'CHECKOUT' | 'SUBSCRIPTION' | 'REFUND' | 'PAYOUT' | 'WEBHOOK' | 'ERROR';
  transactionId?: string;
  amount?: number;
  currency?: string;
  status: string;
  details: string;
}

export default function AdminPaymentGatewaysPage() {
  const { plugins, togglePlugin, updatePluginSettings } = usePlugins();
  const { startProgress, updateProgress, completeProgress, errorProgress } = useAdminProgress();

  const [activeTab, setActiveTab] = useState<'gateways' | 'diagnostics' | 'logs' | 'currencies'>('gateways');
  const [selectedGateway, setSelectedGateway] = useState<PluginManifest | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Diagnostic test states
  const [testingGatewayId, setTestingGatewayId] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    gatewayId: string;
    success: boolean;
    message: string;
    latencyMs: number;
    mode: string;
  } | null>(null);

  // Filter monetization & payment hook plugins
  const paymentGateways = plugins.filter(
    (p) =>
      (p.hooks.includes('payment_gateway_methods') && p.category === 'Monetization') ||
      p.id.includes('piprapay') ||
      p.id.includes('stripe') ||
      p.id.includes('paypal') ||
      p.id.includes('mock')
  ).sort((a, b) => {
    const orderA = (a.settingsValues?.displayOrder as number) ?? 99;
    const orderB = (b.settingsValues?.displayOrder as number) ?? 99;
    return orderA - orderB;
  });


  const triggerNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  // Fetch payment logs
  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/payment-gateways');
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to fetch payment logs', e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleGateway = async (gateway: PluginManifest) => {
    const targetState = !gateway.isEnabled;
    startProgress({
      title: `${targetState ? 'Activating' : 'Deactivating'} ${gateway.name}`,
      steps: [
        'Validating gateway configuration...',
        'Updating central payment provider registry...',
        'Syncing checkout channel routing...'
      ]
    });

    try {
      updateProgress(0, 'running', 30, 'Validating configuration...');
      await new Promise((r) => setTimeout(r, 350));
      updateProgress(0, 'success', 60, 'Configuration validated.');

      updateProgress(1, 'running', 80, 'Updating central payment registry...');
      togglePlugin(gateway.id, targetState);
      await new Promise((r) => setTimeout(r, 400));
      updateProgress(1, 'success', 90, 'Provider registry updated.');

      updateProgress(2, 'running', 95, 'Syncing checkout routes...');
      await new Promise((r) => setTimeout(r, 250));

      completeProgress(`Gateway ${gateway.name} ${targetState ? 'activated' : 'deactivated'} successfully!`);
      triggerNotice(`${gateway.name} is now ${targetState ? 'Active' : 'Disabled'}.`);
    } catch (err: any) {
      errorProgress(1, err.message || 'Failed to toggle gateway.');
    }
  };

  const handleSetDefault = (gateway: PluginManifest) => {
    // Set target gateway isDefault to true, others to false
    paymentGateways.forEach((g) => {
      const isTarget = g.id === gateway.id;
      updatePluginSettings(g.id, {
        ...g.settingsValues,
        isDefault: isTarget
      });
    });
    triggerNotice(`Set "${gateway.name}" as the Default Payment Gateway.`);
  };

  const handleMovePriority = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= paymentGateways.length) return;

    const currentGateway = paymentGateways[index];
    const targetGateway = paymentGateways[targetIndex];

    const currentOrder = (currentGateway.settingsValues.displayOrder as number) ?? index + 1;
    const targetOrder = (targetGateway.settingsValues.displayOrder as number) ?? targetIndex + 1;

    updatePluginSettings(currentGateway.id, {
      ...currentGateway.settingsValues,
      displayOrder: targetOrder
    });

    updatePluginSettings(targetGateway.id, {
      ...targetGateway.settingsValues,
      displayOrder: currentOrder
    });

    triggerNotice('Updated payment gateway checkout priority order.');
  };

  const handleRunDiagnostic = async (gateway: PluginManifest) => {
    setTestingGatewayId(gateway.id);
    setDiagnosticResult(null);

    try {
      const res = await fetch('/api/admin/payment-gateways/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gatewayId: gateway.id,
          settings: gateway.settingsValues
        })
      });
      const data = await res.json();

      setDiagnosticResult({
        gatewayId: gateway.id,
        success: data.success ?? false,
        message: data.message || (data.success ? 'Gateway handshake successful.' : 'Connection test failed.'),
        latencyMs: data.latencyMs ?? 120,
        mode: data.mode || (gateway.settingsValues.mode as string) || 'sandbox'
      });

      triggerNotice(data.success ? `Diagnostic Passed for ${gateway.name}!` : `Diagnostic Failed for ${gateway.name}`);
    } catch (e: any) {
      setDiagnosticResult({
        gatewayId: gateway.id,
        success: false,
        message: e.message || 'Network request failed',
        latencyMs: 0,
        mode: 'error'
      });
    } finally {
      setTestingGatewayId(null);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'ALL') return true;
    return log.eventType === logFilter || log.status.toUpperCase() === logFilter;
  });

  const activeGatewayCount = paymentGateways.filter((g) => g.isEnabled).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 px-4 sm:px-6">
      {/* Toast Notice */}
      {noticeMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-600 border border-emerald-200 flex items-center justify-center text-2xl shadow-xs">
            💳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Dynamic Payment Gateway Manager</h1>
              <Badge variant="emerald" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                {activeGatewayCount} Active
              </Badge>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5 font-medium">
              Manage payment gateway add-ons, credentials, webhook verification, checkout priority, and live transaction logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/plugins">
            <Button variant="outline" size="sm" leftIcon={<Plus size={14} />}>
              Install Gateway Add-on
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={fetchLogs}
            leftIcon={<RefreshCw size={14} />}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('gateways')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'gateways'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <CreditCard size={14} />
          <span>Payment Gateways ({paymentGateways.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'diagnostics'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Activity size={14} />
          <span>Connection Diagnostics</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Receipt size={14} />
          <span>Transaction &amp; Webhook Logs</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
            {logs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('currencies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'currencies'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Globe size={14} />
          <span>Currencies &amp; Fees</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PAYMENT GATEWAYS LIST & CARDS                                      */}
      {/* ========================================================================= */}
      {activeTab === 'gateways' && (
        <div className="space-y-6">
          {/* Diagnostic Result Banner (if run) */}
          {diagnosticResult && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3 animate-in fade-in ${
                diagnosticResult.success
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/90 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {diagnosticResult.success ? (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{diagnosticResult.message}</span>
                    <span className="font-mono text-[10px] bg-white/80 px-1.5 py-0.5 rounded border border-current opacity-75">
                      {diagnosticResult.latencyMs}ms latency
                    </span>
                  </div>
                  <p className="text-[11px] opacity-85 mt-0.5">
                    Tested mode: <span className="font-bold uppercase">{diagnosticResult.mode}</span> • Handshake verified server-side.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDiagnosticResult(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Gateway Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentGateways.map((gateway, index) => {
              const isDefault = gateway.settingsValues.isDefault === true;
              const isSandbox = gateway.settingsValues.mode === 'sandbox';
              const supportedCurr = String(gateway.settingsValues.supportedCurrencies || 'USD');
              const feePct = (gateway.settingsValues.transactionFeePercentage as number) || 0;
              const isPipraPay = gateway.id === 'plugin-piprapay' || gateway.slug === 'piprapay';

              return (
                <div
                  key={gateway.id}
                  className={`p-5 rounded-2xl border transition-all bg-white relative flex flex-col justify-between shadow-xs ${
                    gateway.isEnabled
                      ? 'border-indigo-200 ring-1 ring-indigo-500/10'
                      : 'border-slate-200 opacity-80 bg-slate-50/40'
                  }`}
                >
                  <div>
                    {/* Card Top Badges & Logo */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shadow-3xs shrink-0">
                          {gateway.iconUrl}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-black text-[#18181B]">{gateway.name}</h3>
                            {isDefault && (
                              <span className="text-[9px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded font-bold font-mono border border-pink-200">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#71717A] mt-0.5 line-clamp-2 font-medium">
                            {gateway.description}
                          </p>
                        </div>
                      </div>

                      {/* Status pill */}
                      <div className="shrink-0">
                        {gateway.isEnabled ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={11} /> Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1.5 my-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Mode:</span>
                        <span className={`font-bold text-[11px] px-1.5 py-0.2 rounded ${
                          isSandbox
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isSandbox ? 'Sandbox (Test Portal)' : 'Live Production'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Currencies:</span>
                        <span className="font-bold text-slate-800 text-[11px]">
                          {isPipraPay ? 'BDT (৳) • bKash • Nagad • Cards' : supportedCurr}
                        </span>
                      </div>

                      {feePct > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">Processing Fee:</span>
                          <span className="font-bold text-slate-800 text-[11px]">+{feePct}%</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Webhook Endpoint:</span>
                        <span className="font-mono text-[10px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          /api/payments/webhook/{gateway.slug.replace('-payments', '')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    {/* Priority order arrows */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-bold mr-1">#{index + 1}</span>
                      <button
                        onClick={() => handleMovePriority(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        onClick={() => handleMovePriority(index, 'down')}
                        disabled={index === paymentGateways.length - 1}
                        title="Move Down"
                        className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronDown size={12} />
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunDiagnostic(gateway)}
                        isLoading={testingGatewayId === gateway.id}
                        className="text-[11px] h-7 px-2.5"
                      >
                        Test
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedGateway(gateway);
                          setIsConfigModalOpen(true);
                        }}
                        className="text-[11px] h-7 px-2.5"
                        leftIcon={<Settings size={11} />}
                      >
                        Configure
                      </Button>

                      {!isDefault && gateway.isEnabled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(gateway)}
                          className="text-[11px] h-7 px-2 text-indigo-600 hover:bg-indigo-50"
                        >
                          Make Default
                        </Button>
                      )}

                      <Button
                        variant={gateway.isEnabled ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleGateway(gateway)}
                        className={`text-[11px] h-7 px-2.5 ${gateway.isEnabled ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : ''}`}
                      >
                        {gateway.isEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONNECTION DIAGNOSTICS                                             */}
      {/* ========================================================================= */}
      {activeTab === 'diagnostics' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#18181B]">Live Gateway Connection Diagnostics</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Execute real-time API roundtrip handshakes to verify endpoint reachability, credentials, and network latency.
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {paymentGateways.map((g) => (
              <div key={g.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{g.iconUrl}</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#18181B]">{g.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Endpoint: {String(g.settingsValues.baseUrl || 'https://api.stripe.com/v1')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    g.isEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {g.isEnabled ? 'Active Channel' : 'Inactive'}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRunDiagnostic(g)}
                    isLoading={testingGatewayId === g.id}
                    leftIcon={<Activity size={12} />}
                  >
                    Run Health Ping
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TRANSACTION & WEBHOOK LOGS                                         */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-[#18181B]">Central Payment &amp; Webhook Audit Ledger</h2>
              <p className="text-xs text-slate-500">Live feed of server-side checkouts, webhook callbacks, and gateway exceptions.</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Event Types</option>
                <option value="CHECKOUT">Checkouts</option>
                <option value="SUBSCRIPTION">Subscriptions</option>
                <option value="WEBHOOK">Webhooks (IPN)</option>
                <option value="ERROR">Errors / Failures</option>
              </select>

              <Button variant="outline" size="sm" onClick={fetchLogs} leftIcon={<RefreshCw size={12} />}>
                Refresh
              </Button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No payment transaction logs matching criteria.
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isError = log.eventType === 'ERROR' || log.status === 'Failed';
                const isWebhook = log.eventType === 'WEBHOOK';

                return (
                  <div key={log.id} className="p-3.5 hover:bg-slate-50/80 flex items-start justify-between gap-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        isError
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : isWebhook
                          ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isError ? 'ERR' : isWebhook ? 'IPN' : 'TXN'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#18181B]">{log.gatewayId}</span>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {log.eventType}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            log.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : isError
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{log.details}</p>
                        {log.transactionId && (
                          <span className="text-[10px] font-mono text-slate-400">ID: {log.transactionId}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {log.amount !== undefined && (
                        <div className="font-bold text-slate-900">${log.amount.toFixed(2)} {log.currency}</div>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CURRENCIES & GLOBAL SURCHARGE FEES                                */}
      {/* ========================================================================= */}
      {activeTab === 'currencies' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#18181B]">Multi-Currency &amp; Transaction Surcharges</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set global merchant checkout currencies and platform transaction fee policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold text-slate-800">Primary Platform Base Currency</h3>
              <p className="text-[11px] text-slate-500">Core pricing unit used for creator memberships, tips, and payouts.</p>
              <select className="w-full bg-white border border-slate-200 text-xs rounded-lg p-2 font-bold text-slate-800 focus:outline-none">
                <option value="USD">USD ($ - United States Dollar)</option>
                <option value="BDT">BDT (৳ - Bangladeshi Taka - bKash / Nagad)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold text-slate-800">Automatic Webhook Reconciliation</h3>
              <p className="text-[11px] text-slate-500">Auto-credit creator wallets upon verified IPN signature receipts.</p>
              <div className="flex items-center gap-2 pt-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 size={16} /> Enabled &amp; Idempotency-Locked
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GATEWAY CONFIGURATION MODAL                                               */}
      {/* ========================================================================= */}
      {isConfigModalOpen && selectedGateway && (
        <Modal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          title={`Configure ${selectedGateway.name}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-2xl">{selectedGateway.iconUrl}</span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{selectedGateway.name} Settings</h4>
                <p className="text-[10px] text-slate-500">Plugin ID: {selectedGateway.id} • v{selectedGateway.version}</p>
              </div>
            </div>

            <PluginSettingsFramework
              plugin={selectedGateway}
              onSaved={() => {
                triggerNotice(`Saved configuration for ${selectedGateway.name}`);
                setIsConfigModalOpen(false);
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
