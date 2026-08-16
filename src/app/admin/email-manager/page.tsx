'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, Server, Send, FileText, Activity, Plus, Edit3, Trash2,
  Eye, EyeOff, CheckCircle2, XCircle, AlertCircle, Loader2,
  Wifi, WifiOff, Zap, Shield, RefreshCw, ChevronDown, ChevronRight,
  Download, Search, Filter, Settings, ToggleLeft, ToggleRight,
  Sparkles, ArrowRight, Clock, Globe, ExternalLink, Copy, Check
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { Modal } from '@/components/admin/ui/Modal';
import { Badge } from '@/components/admin/ui/Badge';
import { useToast, ToastType } from '@/components/ui/Toast';
import { useAdminProgress } from '@/components/admin/AdminProgressProvider';
import { RoleGuard } from '@/components/auth/RoleGuard';
import {
  getSmtpProviders, saveSmtpProviders, createSmtpProvider,
  updateSmtpProvider, deleteSmtpProvider,
  getEmailGlobalSettings, saveEmailGlobalSettings,
  SmtpProvider, SmtpProviderCreate, SmtpProviderType, EncryptionType,
  PROVIDER_PRESETS, getProviderStatus, DEFAULT_EMAIL_GLOBAL,
  EmailGlobalSettings,
} from '@/lib/email/smtp-store';
import {
  getDeliveryLogs, filterDeliveryLogs, appendDeliveryLog,
  getLogStats, STATUS_META, DeliveryLog, DeliveryLogFilter, DeliveryStatus,
} from '@/lib/email/delivery-log-store';
import {
  getEmailTemplates, renderEmailTemplatePreview, EmailTemplate,
} from '@/lib/email/email-template-store';

// ── Types ────────────────────────────────────────────────────────────────────

type Tab = 'providers' | 'templates' | 'logs' | 'global';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'providers', label: 'SMTP Providers', icon: Server },
  { id: 'templates', label: 'Email Templates', icon: FileText },
  { id: 'logs', label: 'Delivery Logs', icon: Activity },
  { id: 'global', label: 'Global Settings', icon: Settings },
];

const PROVIDER_TYPES: { value: SmtpProviderType; label: string; color: string }[] = [
  { value: 'gmail', label: 'Gmail / Google Workspace', color: '#EA4335' },
  { value: 'outlook', label: 'Outlook / Microsoft 365', color: '#0078D4' },
  { value: 'sendgrid', label: 'SendGrid', color: '#1A82E2' },
  { value: 'mailgun', label: 'Mailgun', color: '#F06B26' },
  { value: 'ses', label: 'Amazon SES', color: '#FF9900' },
  { value: 'resend', label: 'Resend', color: '#000000' },
  { value: 'custom', label: 'Custom SMTP', color: '#6366F1' },
];

const EMPTY_PROVIDER: SmtpProviderCreate = {
  name: '',
  provider: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  encryption: 'tls',
  username: '',
  password: '',
  apiKey: '',
  apiRegion: '',
  fromName: 'CreatorPulse',
  fromEmail: 'noreply@creatorpulse.com',
  replyTo: '',
  isActive: false,
  isFallback: false,
  priority: 0,
};

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminEmailManagerPage() {
  const [activeTab, setActiveTab] = useState<Tab>('providers');
  const { showToast } = useToast();
  const { startProgress, updateProgress, completeProgress, errorProgress } = useAdminProgress();

  return (
    <RoleGuard
      requiredPermission="manage_settings"
      fallbackTitle="Access Restricted"
      fallbackMessage="You need administrator settings permissions to manage email & SMTP configuration."
    >
      <div className="max-w-7xl mx-auto space-y-5 pb-16">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                <Mail size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-black text-[#18181B] tracking-tight">
                Dynamic Email &amp; SMTP Manager
              </h1>
            </div>
            <p className="text-xs text-[#71717A] mt-1 font-medium ml-10.5">
              Configure providers, manage templates, view delivery logs, and control your centralized mail service.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/admin/email-templates"
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <FileText size={12} />
              Legacy Template Editor
              <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        {activeTab === 'providers' && (
          <ProvidersTab showToast={showToast} startProgress={startProgress} updateProgress={updateProgress} completeProgress={completeProgress} errorProgress={errorProgress} />
        )}
        {activeTab === 'templates' && <TemplatesTab showToast={showToast} />}
        {activeTab === 'logs' && <LogsTab />}
        {activeTab === 'global' && <GlobalSettingsTab showToast={showToast} />}
      </div>
    </RoleGuard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1: SMTP PROVIDERS
// ══════════════════════════════════════════════════════════════════════════════

function ProvidersTab({ showToast, startProgress, updateProgress, completeProgress, errorProgress }: any) {
  const [providers, setProviders] = useState<SmtpProvider[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Partial<SmtpProvider> | null>(null);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; latencyMs: number }>>({});

  const load = useCallback(() => setProviders(getSmtpProviders()), []);
  useEffect(() => { load(); }, [load]);

  const handleOpenAdd = () => {
    setEditingProvider({ ...EMPTY_PROVIDER });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: SmtpProvider) => {
    setEditingProvider({ ...p });
    setIsModalOpen(true);
  };

  const handleProviderTypeChange = (type: SmtpProviderType) => {
    const preset = PROVIDER_PRESETS[type];
    setEditingProvider((prev) => ({
      ...prev,
      provider: type,
      host: preset.host,
      port: preset.port,
      encryption: preset.encryption,
    }));
  };

  const handleSave = async () => {
    if (!editingProvider?.name || !editingProvider?.fromEmail) {
      showToast('Name and From Email are required.', 'error');
      return;
    }

    startProgress({
      title: editingProvider.id ? 'Updating SMTP Provider' : 'Adding SMTP Provider',
      steps: ['Validating configuration...', 'Saving to store...'],
    });
    updateProgress(0, 'running', 40, 'Validating configuration...');
    await new Promise((r) => setTimeout(r, 400));
    updateProgress(0, 'success', 70, 'Configuration valid.');
    updateProgress(1, 'running', 85, 'Saving to store...');

    try {
      if (editingProvider.id) {
        updateSmtpProvider(editingProvider.id, editingProvider as Partial<SmtpProvider>);
      } else {
        createSmtpProvider(editingProvider as SmtpProviderCreate);
      }
      await new Promise((r) => setTimeout(r, 300));
      load();
      completeProgress(editingProvider.id ? 'Provider updated!' : 'Provider added!');
      showToast(editingProvider.id ? 'SMTP provider updated.' : 'SMTP provider added.', 'success');
      setIsModalOpen(false);
    } catch (e: any) {
      errorProgress(1, 'Failed to save provider.');
      showToast('Failed to save provider.', 'error');
    }
  };

  const handleDelete = (id: string) => {
    deleteSmtpProvider(id);
    load();
    showToast('Provider deleted.', 'info');
    setIsDeleteConfirm(null);
  };

  const handleSetActive = (id: string) => {
    const all = getSmtpProviders().map((p) => ({ ...p, isActive: p.id === id, isFallback: p.id === id ? false : p.isFallback }));
    saveSmtpProviders(all);
    load();
    showToast('Active SMTP provider updated.', 'success');
  };

  const handleToggleFallback = (id: string) => {
    const p = providers.find((x) => x.id === id);
    if (!p) return;
    if (p.isActive) { showToast('Cannot set active provider as fallback.', 'error'); return; }
    updateSmtpProvider(id, { isFallback: !p.isFallback });
    load();
    showToast(`Fallback ${!p.isFallback ? 'enabled' : 'disabled'}.`, 'info');
  };

  const handleTestConnection = async (p: SmtpProvider) => {
    setTestingId(p.id);
    try {
      const res = await fetch('/api/admin/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: p.provider,
          host: p.host,
          port: p.port,
          username: p.username,
          password: p.password,
          apiKey: p.apiKey,
          encryption: p.encryption,
        }),
      });
      const data = await res.json();
      setTestResults((prev) => ({ ...prev, [p.id]: data }));
      // Persist test result
      updateSmtpProvider(p.id, {
        lastTestedAt: new Date().toISOString(),
        lastTestStatus: data.success ? 'ok' : 'fail',
        lastTestMessage: data.message,
        lastTestLatencyMs: data.latencyMs,
      });
      load();
      showToast(data.success ? `Connection OK — ${data.latencyMs}ms` : `Connection failed: ${data.message}`, data.success ? 'success' : 'error');
    } catch {
      showToast('Test request failed.', 'error');
    } finally {
      setTestingId(null);
    }
  };

  const statusBadge = (p: SmtpProvider) => {
    const s = getProviderStatus(p);
    if (s === 'active') return <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase">● Active</span>;
    if (s === 'fallback') return <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 uppercase">↺ Fallback</span>;
    return <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 uppercase">○ Inactive</span>;
  };

  const preset = editingProvider?.provider ? PROVIDER_PRESETS[editingProvider.provider as SmtpProviderType] : null;
  const isApiProvider = preset?.isApiProvider ?? false;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Providers', value: providers.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Primary', value: providers.filter(p => p.isActive).length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Fallback Providers', value: providers.filter(p => p.isFallback).length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Last Tested OK', value: providers.filter(p => p.lastTestStatus === 'ok').length, color: 'text-sky-600', bg: 'bg-sky-50' },
        ].map((stat) => (
          <Card key={stat.label} className={`p-3 ${stat.bg} border-transparent`}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color} mt-0.5`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Providers list header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-800">Configured Providers</h2>
        <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={handleOpenAdd}>
          Add Provider
        </Button>
      </div>

      {/* Provider cards */}
      <div className="space-y-3">
        {providers.length === 0 && (
          <Card className="py-12 text-center text-slate-400 font-semibold text-sm">
            No SMTP providers configured. Click "Add Provider" to get started.
          </Card>
        )}
        {providers.map((p) => {
          const preset = PROVIDER_PRESETS[p.provider];
          const result = testResults[p.id];
          const isTesting = testingId === p.id;
          return (
            <Card key={p.id} className="p-4 border border-slate-200 hover:border-slate-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Provider icon + name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-[11px] shadow-sm"
                    style={{ backgroundColor: preset.color }}
                  >
                    {preset.label.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-slate-900 truncate">{p.name}</p>
                      {statusBadge(p)}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {preset.label} · {p.fromEmail} · {p.host}:{p.port}
                    </p>
                  </div>
                </div>

                {/* Health status */}
                <div className="flex items-center gap-2 shrink-0">
                  {p.lastTestStatus === 'ok' && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                      <CheckCircle2 size={11} /> {p.lastTestLatencyMs}ms
                    </div>
                  )}
                  {p.lastTestStatus === 'fail' && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded-lg">
                      <XCircle size={11} /> Failed
                    </div>
                  )}
                  {result && (
                    <span className={`text-[10px] font-semibold ${result.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {result.success ? '✓ Verified' : '✗ Error'}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleTestConnection(p)}
                    disabled={isTesting}
                    title="Test Connection"
                    className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isTesting ? <Loader2 size={11} className="animate-spin" /> : <Wifi size={11} />}
                    {isTesting ? 'Testing...' : 'Test'}
                  </button>
                  {!p.isActive && (
                    <button
                      onClick={() => handleSetActive(p.id)}
                      title="Set as Primary Active"
                      className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all cursor-pointer"
                    >
                      <Zap size={11} /> Set Active
                    </button>
                  )}
                  {!p.isActive && (
                    <button
                      onClick={() => handleToggleFallback(p.id)}
                      title={p.isFallback ? 'Disable fallback' : 'Enable as fallback'}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        p.isFallback
                          ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <RefreshCw size={11} /> {p.isFallback ? 'Fallback ON' : 'Fallback'}
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => setIsDeleteConfirm(p.id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Test result message */}
              {result && (
                <div className={`mt-3 p-2.5 rounded-xl text-[11px] font-semibold border ${
                  result.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {result.success ? <CheckCircle2 size={12} className="inline mr-1.5" /> : <XCircle size={12} className="inline mr-1.5" />}
                  {result.message}
                  {result.latencyMs > 0 && <span className="ml-2 opacity-70">({result.latencyMs}ms)</span>}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProvider?.id ? 'Edit SMTP Provider' : 'Add SMTP Provider'}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Provider type */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800">Provider Type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {PROVIDER_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleProviderTypeChange(t.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-bold text-left cursor-pointer transition-all ${
                    editingProvider?.provider === t.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-extrabold text-slate-800">Provider Name</label>
            <input
              type="text"
              value={editingProvider?.name ?? ''}
              onChange={(e) => setEditingProvider((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Primary Gmail SMTP"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
            />
          </div>

          {/* Sender identity */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Mail size={11} /> Sender Identity
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-700">From Name</label>
                <input
                  type="text"
                  value={editingProvider?.fromName ?? ''}
                  onChange={(e) => setEditingProvider((p) => ({ ...p, fromName: e.target.value }))}
                  placeholder="CreatorPulse"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-700">From Email</label>
                <input
                  type="email"
                  value={editingProvider?.fromEmail ?? ''}
                  onChange={(e) => setEditingProvider((p) => ({ ...p, fromEmail: e.target.value }))}
                  placeholder="noreply@example.com"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-700">Reply-To (optional)</label>
              <input
                type="email"
                value={editingProvider?.replyTo ?? ''}
                onChange={(e) => setEditingProvider((p) => ({ ...p, replyTo: e.target.value }))}
                placeholder="support@example.com"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>

          {/* SMTP connection fields */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Server size={11} /> Connection Settings
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-extrabold text-slate-700">SMTP Host</label>
                <input
                  type="text"
                  value={editingProvider?.host ?? ''}
                  onChange={(e) => setEditingProvider((p) => ({ ...p, host: e.target.value }))}
                  placeholder="smtp.gmail.com"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-700">Port</label>
                <input
                  type="number"
                  value={editingProvider?.port ?? 587}
                  onChange={(e) => setEditingProvider((p) => ({ ...p, port: parseInt(e.target.value) || 587 }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-700">Encryption</label>
              <div className="flex gap-2">
                {(['none', 'tls', 'ssl'] as EncryptionType[]).map((enc) => (
                  <button
                    key={enc}
                    type="button"
                    onClick={() => setEditingProvider((p) => ({ ...p, encryption: enc }))}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase cursor-pointer border transition-all ${
                      editingProvider?.encryption === enc
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {enc === 'none' ? 'None' : enc.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Shield size={11} /> Credentials (Stored Securely)
            </p>
            {!isApiProvider ? (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-700">Username / Email</label>
                  <input
                    type="text"
                    value={editingProvider?.username ?? ''}
                    onChange={(e) => setEditingProvider((p) => ({ ...p, username: e.target.value }))}
                    placeholder="you@gmail.com"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>
                <PasswordField
                  label="Password / App Password"
                  value={editingProvider?.password ?? ''}
                  onChange={(v) => setEditingProvider((p) => ({ ...p, password: v }))}
                />
              </>
            ) : (
              <>
                <PasswordField
                  label="API Key"
                  value={editingProvider?.apiKey ?? ''}
                  onChange={(v) => setEditingProvider((p) => ({ ...p, apiKey: v }))}
                  placeholder="SG.xxx / re_xxx / ..."
                />
                {editingProvider?.provider === 'ses' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700">SMTP Username (Access Key ID)</label>
                      <input
                        type="text"
                        value={editingProvider?.username ?? ''}
                        onChange={(e) => setEditingProvider((p) => ({ ...p, username: e.target.value }))}
                        placeholder="AKIAIOSFODNN7EXAMPLE"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <PasswordField
                      label="SMTP Password (Secret Access Key)"
                      value={editingProvider?.password ?? ''}
                      onChange={(v) => setEditingProvider((p) => ({ ...p, password: v }))}
                      placeholder="wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY"
                    />
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700">AWS Region</label>
                      <input
                        type="text"
                        value={editingProvider?.apiRegion ?? ''}
                        onChange={(e) => setEditingProvider((p) => ({ ...p, apiRegion: e.target.value }))}
                        placeholder="us-east-1"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}
                {editingProvider?.provider === 'mailgun' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-700">Mailgun Region</label>
                    <div className="flex gap-2">
                      {['us', 'eu'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setEditingProvider((p) => ({ ...p, apiRegion: r }))}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase cursor-pointer border transition-all ${
                            editingProvider?.apiRegion === r
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          {r.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Routing */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editingProvider?.isActive ?? false}
                onChange={(e) => setEditingProvider((p) => ({ ...p, isActive: e.target.checked, isFallback: e.target.checked ? false : p?.isFallback }))}
                className="accent-indigo-600 w-3.5 h-3.5"
              />
              <span className="text-xs font-bold text-slate-700">Set as Active Primary Provider</span>
            </label>
            {!editingProvider?.isActive && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editingProvider?.isFallback ?? false}
                  onChange={(e) => setEditingProvider((p) => ({ ...p, isFallback: e.target.checked }))}
                  className="accent-amber-500 w-3.5 h-3.5"
                />
                <span className="text-xs font-bold text-slate-700">Enable as Fallback</span>
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {editingProvider?.id ? 'Update Provider' : 'Add Provider'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={!!isDeleteConfirm} onClose={() => setIsDeleteConfirm(null)} title="Delete Provider">
        <div className="space-y-4">
          <p className="text-sm text-slate-700">Are you sure you want to delete this SMTP provider? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => isDeleteConfirm && handleDelete(isDeleteConfirm)}>Delete Provider</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Password field ────────────────────────────────────────────────────────────

function PasswordField({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-extrabold text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••••••••••'}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 pr-9 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
        >
          {show ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2: EMAIL TEMPLATES (integrated with provider test-send)
// ══════════════════════════════════════════════════════════════════════════════

function TemplatesTab({ showToast }: { showToast: (msg: string, type?: ToastType) => void }) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isTestSendOpen, setIsTestSendOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('admin@creatorpulse.com');
  const [isSending, setIsSending] = useState(false);
  const providers = getSmtpProviders();
  const activeProvider = providers.find((p) => p.isActive) ?? providers[0] ?? null;

  useEffect(() => {
    const list = getEmailTemplates();
    setTemplates(list);
    if (list.length > 0) setSelected(list[0]);
  }, []);

  const preview = selected ? renderEmailTemplatePreview(selected) : { subject: '', bodyHtml: '' };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProvider || !selected) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/admin/smtp/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: activeProvider.id,
          providerName: activeProvider.name,
          toEmail: testEmail,
          subject: preview.subject,
          templateSlug: selected.slug,
          templateName: selected.name,
          fromName: activeProvider.fromName,
          fromEmail: activeProvider.fromEmail,
          provider: activeProvider.provider,
          apiKey: activeProvider.apiKey,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Record in local log store
        appendDeliveryLog({
          providerId: activeProvider.id,
          providerName: activeProvider.name,
          templateSlug: selected.slug,
          templateName: selected.name,
          recipientEmail: testEmail,
          subject: preview.subject,
          status: 'sent',
          errorMessage: null,
          messageId: data.messageId ?? null,
          deliveredAt: new Date().toISOString(),
          meta: { isTestEmail: true },
        });
        showToast(`Test email dispatched to ${testEmail} via ${activeProvider.name}!`, 'success');
      } else {
        appendDeliveryLog({
          providerId: activeProvider.id,
          providerName: activeProvider.name,
          templateSlug: selected.slug,
          templateName: selected.name,
          recipientEmail: testEmail,
          subject: preview.subject,
          status: 'failed',
          errorMessage: data.error ?? 'Unknown error',
          messageId: null,
          deliveredAt: null,
          meta: { isTestEmail: true },
        });
        showToast(`Send failed: ${data.error}`, 'error');
      }
    } catch {
      showToast('Network error sending test email.', 'error');
    } finally {
      setIsSending(false);
      setIsTestSendOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Active provider notice */}
      {activeProvider ? (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <span>
            Test emails will be dispatched via <strong>{activeProvider.name}</strong> ({activeProvider.fromEmail})
          </span>
          <a href="#" onClick={(e) => { e.preventDefault(); }} className="ml-auto text-emerald-700 underline font-bold whitespace-nowrap">
            {PROVIDER_PRESETS[activeProvider.provider].label}
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800">
          <AlertCircle size={14} className="shrink-0" />
          No active SMTP provider configured. Go to the Providers tab to set one up.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Template list */}
        <div className="lg:col-span-4 space-y-2">
          <Card className="p-3 bg-slate-50/50">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 px-1">
              Templates ({templates.length})
            </p>
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={`w-full text-left p-2.5 rounded-xl mb-1 text-xs transition-all cursor-pointer ${
                  selected?.id === t.id
                    ? 'bg-indigo-600 text-white font-extrabold'
                    : 'bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{t.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                    t.enabled
                      ? selected?.id === t.id ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                      : selected?.id === t.id ? 'bg-rose-900/30 text-rose-200' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {t.enabled ? 'On' : 'Off'}
                  </span>
                </div>
                <span className={`text-[10px] font-mono mt-0.5 block ${selected?.id === t.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {t.slug}
                </span>
              </button>
            ))}
          </Card>
        </div>

        {/* Preview panel */}
        <div className="lg:col-span-8">
          {selected ? (
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">{selected.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Subject: {preview.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-all ${previewDevice === 'desktop' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}
                    >
                      Desktop
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-all ${previewDevice === 'mobile' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}
                    >
                      Mobile
                    </button>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Send size={12} />}
                    onClick={() => setIsTestSendOpen(true)}
                    disabled={!activeProvider}
                  >
                    Send Test
                  </Button>
                </div>
              </div>
              <div className="flex justify-center bg-slate-200/50 p-4 rounded-2xl">
                <div className={`bg-white rounded-xl shadow border border-slate-200 overflow-hidden transition-all duration-300 ${previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-[640px]'}`}>
                  <iframe srcDoc={preview.bodyHtml} title="Preview" className="w-full min-h-[480px] border-none" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 text-center font-medium">
                To edit this template's HTML, visit the{' '}
                <a href="/admin/email-templates" className="text-indigo-600 underline">Email Template Editor</a>.
              </p>
            </Card>
          ) : (
            <Card className="py-16 text-center text-slate-400 font-semibold">Select a template to preview.</Card>
          )}
        </div>
      </div>

      {/* Test send modal */}
      <Modal isOpen={isTestSendOpen} onClose={() => setIsTestSendOpen(false)} title="Send Test Email">
        <form onSubmit={handleSendTest} className="space-y-4">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs">
            <p className="font-extrabold text-indigo-900">Dispatching via: {activeProvider?.name}</p>
            <p className="text-indigo-700 mt-1">Template: <strong>{selected?.name}</strong></p>
            <p className="text-indigo-700">From: {activeProvider?.fromName} &lt;{activeProvider?.fromEmail}&gt;</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">Recipient Email</label>
            <input
              type="email"
              required
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsTestSendOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSending} leftIcon={isSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}>
              {isSending ? 'Sending...' : 'Send Test Email'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3: DELIVERY LOGS
// ══════════════════════════════════════════════════════════════════════════════

function LogsTab() {
  const [logs, setLogs] = useState<DeliveryLog[]>([]);
  const [filter, setFilter] = useState<DeliveryLogFilter>({ status: 'all', providerId: 'all', search: '' });
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const providers = getSmtpProviders();

  useEffect(() => { setLogs(getDeliveryLogs()); }, []);

  const filtered = filterDeliveryLogs(logs, filter);
  const stats = getLogStats(logs);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const exportCSV = () => {
    const headers = ['Date', 'Recipient', 'Subject', 'Template', 'Provider', 'Status', 'Error', 'Message ID'];
    const rows = filtered.map((l) => [
      new Date(l.sentAt).toLocaleString(),
      l.recipientEmail,
      l.subject,
      l.templateName ?? '',
      l.providerName,
      l.status,
      l.errorMessage ?? '',
      l.messageId ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-700' },
          { label: 'Sent', value: stats.sent, color: 'text-emerald-600' },
          { label: 'Failed', value: stats.failed, color: 'text-rose-600' },
          { label: 'Bounced', value: stats.bounced, color: 'text-amber-600' },
          { label: 'Deferred', value: stats.deferred, color: 'text-sky-600' },
          { label: 'Delivery Rate', value: `${stats.deliveryRate}%`, color: stats.deliveryRate >= 90 ? 'text-emerald-600' : 'text-amber-600' },
        ].map((s) => (
          <Card key={s.label} className="p-3 text-center">
            <p className="text-[9px] font-bold uppercase text-slate-400">{s.label}</p>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search email, subject..."
            value={filter.search}
            onChange={(e) => { setFilter((f) => ({ ...f, search: e.target.value })); setPage(1); }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>
        <select
          value={filter.status}
          onChange={(e) => { setFilter((f) => ({ ...f, status: e.target.value as any })); setPage(1); }}
          className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="bounced">Bounced</option>
          <option value="deferred">Deferred</option>
        </select>
        <select
          value={filter.providerId}
          onChange={(e) => { setFilter((f) => ({ ...f, providerId: e.target.value })); setPage(1); }}
          className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="all">All Providers</option>
          {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer ml-auto"
        >
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* Logs table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Date', 'Recipient', 'Template', 'Provider', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[10px] font-black uppercase text-slate-500 tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold">No logs found matching filters.</td>
                </tr>
              )}
              {paginated.map((log) => {
                const meta = STATUS_META[log.status];
                const isExpanded = expandedLog === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    >
                      <td className="px-4 py-2.5 text-slate-500 font-medium whitespace-nowrap">
                        {new Date(log.sentAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-2.5 text-slate-800 font-semibold max-w-[160px] truncate">{log.recipientEmail}</td>
                      <td className="px-4 py-2.5 text-slate-600 max-w-[140px]">
                        <span className="truncate block">{log.templateName ?? <span className="text-slate-400 italic">Raw send</span>}</span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 font-medium whitespace-nowrap">{log.providerName}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${meta.bg} ${meta.color} ${meta.border}`}>
                          {log.status === 'sent' && <CheckCircle2 size={10} />}
                          {log.status === 'failed' && <XCircle size={10} />}
                          {log.status === 'bounced' && <AlertCircle size={10} />}
                          {log.status === 'deferred' && <Clock size={10} />}
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <ChevronRight size={14} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={6} className="px-6 py-3 text-xs space-y-1.5">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                            <div><span className="font-black text-slate-500">Subject: </span><span className="text-slate-800">{log.subject}</span></div>
                            <div><span className="font-black text-slate-500">Message ID: </span><span className="font-mono text-slate-700">{log.messageId ?? '—'}</span></div>
                            {log.errorMessage && (
                              <div className="col-span-2">
                                <span className="font-black text-rose-600">Error: </span>
                                <span className="text-rose-700">{log.errorMessage}</span>
                              </div>
                            )}
                            {log.meta && Object.keys(log.meta).length > 0 && (
                              <div className="col-span-2">
                                <span className="font-black text-slate-500">Meta: </span>
                                <code className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{JSON.stringify(log.meta)}</code>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
            <p className="text-[10px] font-semibold text-slate-500">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} logs
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-40 cursor-pointer hover:bg-slate-50"
              >
                ← Prev
              </button>
              <span className="px-2 text-[10px] font-bold text-slate-500">{page}/{totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-40 cursor-pointer hover:bg-slate-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4: GLOBAL EMAIL SETTINGS
// ══════════════════════════════════════════════════════════════════════════════

function GlobalSettingsTab({ showToast }: { showToast: (msg: string, type?: ToastType) => void }) {
  const [settings, setSettings] = useState<EmailGlobalSettings>(getEmailGlobalSettings());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    saveEmailGlobalSettings(settings);
    setIsSaving(false);
    showToast('Global email settings saved.', 'success');
  };

  const Field = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="sm:w-64 shrink-0">
        <p className="text-xs font-extrabold text-slate-800">{label}</p>
        {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );

  return (
    <div className="space-y-4 max-w-3xl">
      <Card className="divide-y divide-slate-100 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100">
          <h2 className="text-sm font-black text-indigo-900 flex items-center gap-2">
            <Globe size={14} className="text-indigo-600" /> Global Mail Service Configuration
          </h2>
          <p className="text-[11px] text-indigo-700 mt-1">These settings apply to all outgoing emails platform-wide.</p>
        </div>

        <div className="p-4 space-y-0">
          <Field label="Mail Service" description="Master toggle for all outgoing emails">
            <button
              onClick={() => setSettings((s) => ({ ...s, serviceEnabled: !s.serviceEnabled }))}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-xs font-bold cursor-pointer"
            >
              {settings.serviceEnabled ? (
                <><ToggleRight size={20} className="text-emerald-600" /><span className="text-emerald-700">Mail Service Enabled</span></>
              ) : (
                <><ToggleLeft size={20} className="text-slate-400" /><span className="text-slate-500">Mail Service Disabled</span></>
              )}
            </button>
          </Field>

          <Field label="Fallback Chain" description="Automatically use fallback providers if primary fails">
            <button
              onClick={() => setSettings((s) => ({ ...s, useFallbackChain: !s.useFallbackChain }))}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-xs font-bold cursor-pointer"
            >
              {settings.useFallbackChain ? (
                <><ToggleRight size={20} className="text-indigo-600" /><span className="text-indigo-700">Fallback Chain Enabled</span></>
              ) : (
                <><ToggleLeft size={20} className="text-slate-400" /><span className="text-slate-500">No Fallback</span></>
              )}
            </button>
          </Field>

          <Field label="Default From Name" description="Global sender name used if provider override is empty">
            <input
              type="text"
              value={settings.defaultFromName}
              onChange={(e) => setSettings((s) => ({ ...s, defaultFromName: e.target.value }))}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            />
          </Field>

          <Field label="Default From Email" description="Global sender email address">
            <input
              type="email"
              value={settings.defaultFromEmail}
              onChange={(e) => setSettings((s) => ({ ...s, defaultFromEmail: e.target.value }))}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            />
          </Field>

          <Field label="Default Reply-To" description="Where replies will go globally (optional)">
            <input
              type="email"
              value={settings.defaultReplyTo}
              onChange={(e) => setSettings((s) => ({ ...s, defaultReplyTo: e.target.value }))}
              placeholder="support@yoursite.com"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            />
          </Field>

          <Field label="Bounce Handling Email" description="Email address to receive bounce notifications">
            <input
              type="email"
              value={settings.bounceHandlingEmail}
              onChange={(e) => setSettings((s) => ({ ...s, bounceHandlingEmail: e.target.value }))}
              placeholder="bounces@yoursite.com"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            />
          </Field>

          <Field label="Global Email Signature" description="HTML appended to all outgoing email bodies">
            <textarea
              value={settings.globalSignatureHtml}
              onChange={(e) => setSettings((s) => ({ ...s, globalSignatureHtml: e.target.value }))}
              rows={4}
              placeholder="<p style='color:#94a3b8;font-size:12px;'>Sent by CreatorPulse — Unsubscribe</p>"
              className="w-full bg-slate-900 text-slate-100 font-mono text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </Field>
        </div>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <p className="text-[11px] text-slate-400 font-medium">Changes persist via localStorage and sync to database on save.</p>
        <Button
          variant="primary"
          size="sm"
          leftIcon={isSaving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Global Settings'}
        </Button>
      </div>
    </div>
  );
}
