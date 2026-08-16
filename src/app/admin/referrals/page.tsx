'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LucideProps } from 'lucide-react';
import {
  Users, Share2, Target, DollarSign, TrendingUp, Settings, Plus, Search,
  Filter, RefreshCw, Edit3, Trash2, Copy, Check, Eye, X, CheckCircle2,
  XCircle, Clock, AlertTriangle, Award, Percent, Calendar, Layers, Wallet,
  ArrowUpRight, Link as LinkIcon, MousePointerClick, UserPlus
} from 'lucide-react';
import { AdminIcon } from '@/components/admin/ui/AdminIcon';
import type {
  ReferralSettings, ReferralCampaign, ReferralConversion, ReferralPayout,
  ReferralAnalytics, TopAffiliate
} from '@/lib/referrals/types';

type TabId = 'overview' | 'campaigns' | 'conversions' | 'payouts' | 'settings';

// ─── Admin Referrals & Affiliates Page ──────────────────────────────────────
export default function AdminReferralsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);

  // Data
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [campaigns, setCampaigns] = useState<ReferralCampaign[]>([]);
  const [conversions, setConversions] = useState<ReferralConversion[]>([]);
  const [payouts, setPayouts] = useState<ReferralPayout[]>([]);
  const [settings, setSettings] = useState<ReferralSettings | null>(null);

  // Filters
  const [campaignSearch, setCampaignSearch] = useState('');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState('all');
  const [conversionSearch, setConversionSearch] = useState('');
  const [conversionStatusFilter, setConversionStatusFilter] = useState('all');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState('all');

  // Modals
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<ReferralCampaign | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [processingPayout, setProcessingPayout] = useState<ReferralPayout | null>(null);
  const [payoutAction, setPayoutAction] = useState<'approved' | 'rejected' | 'completed'>('approved');
  const [payoutNotes, setPayoutNotes] = useState('');

  // Campaign form
  const [campaignForm, setCampaignForm] = useState({
    name: '', description: '', commission_rate: 10, commission_type: 'percentage' as 'percentage' | 'fixed',
    start_date: '', end_date: '', coupon_id: '', target_audience: 'all' as 'all' | 'creators' | 'members',
    max_conversions: '', status: 'active' as 'active' | 'paused' | 'ended',
  });
  const [campaignFormError, setCampaignFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    is_enabled: true, default_commission_rate: 10, commission_type: 'percentage' as 'percentage' | 'fixed',
    cookie_duration_days: 30, min_payout_amount: 25, max_referral_tiers: 1,
    auto_approve_conversions: false, payout_methods: ['bank_transfer', 'paypal'] as string[],
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Bulk selection
  const [selectedConversions, setSelectedConversions] = useState<Set<string>>(new Set());

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Data fetching ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resAnalytics, resCampaigns, resConversions, resPayouts, resSettings] = await Promise.all([
        fetch('/api/admin/referrals?action=analytics'),
        fetch('/api/admin/referrals?action=campaigns'),
        fetch('/api/admin/referrals?action=conversions'),
        fetch('/api/admin/referrals?action=payouts'),
        fetch('/api/admin/referrals?action=settings'),
      ]);
      const [dAnalytics, dCampaigns, dConversions, dPayouts, dSettings] = await Promise.all([
        resAnalytics.json(), resCampaigns.json(), resConversions.json(), resPayouts.json(), resSettings.json(),
      ]);
      if (dAnalytics.success) setAnalytics(dAnalytics.analytics || dAnalytics.data);
      if (dCampaigns.success) setCampaigns(dCampaigns.campaigns || dCampaigns.data || []);
      if (dConversions.success) setConversions(dConversions.conversions || dConversions.data || []);
      if (dPayouts.success) setPayouts(dPayouts.payouts || dPayouts.data || []);
      if (dSettings.success) {
        const s = dSettings.settings || dSettings.data;
        if (s) {
          setSettings(s);
          setSettingsForm({
            is_enabled: s.is_enabled ?? true,
            default_commission_rate: s.default_commission_rate ?? s.defaultCommissionRate ?? 10,
            commission_type: s.commission_type ?? s.defaultCommissionType ?? 'percentage',
            cookie_duration_days: s.cookie_duration_days ?? s.cookieDurationDays ?? 30,
            min_payout_amount: s.min_payout_amount ?? s.minPayoutAmount ?? 25,
            max_referral_tiers: s.max_referral_tiers ?? 1,
            auto_approve_conversions: s.auto_approve_conversions ?? s.autoApproveConversions ?? false,
            payout_methods: s.payout_methods ?? s.payoutMethods ?? ['bank_transfer', 'paypal'],
          });
        }
      }
    } catch (e) {
      console.error('[AdminReferralsPage] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Campaign CRUD ──────────────────────────────────────────────────────────
  const openCreateCampaign = () => {
    setEditingCampaign(null);
    setCampaignForm({ name: '', description: '', commission_rate: 10, commission_type: 'percentage', start_date: new Date().toISOString().substring(0, 10), end_date: new Date(Date.now() + 90 * 86400000).toISOString().substring(0, 10), coupon_id: '', target_audience: 'all', max_conversions: '', status: 'active' });
    setCampaignFormError('');
    setIsCampaignModalOpen(true);
  };

  const openEditCampaign = (c: ReferralCampaign) => {
    setEditingCampaign(c);
    setCampaignForm({
      name: c.name, description: c.description || '', commission_rate: c.commission_rate ?? c.commissionRate ?? 10,
      commission_type: (c.commission_type ?? c.commissionType ?? 'percentage') as 'percentage' | 'fixed',
      start_date: c.start_date ? c.start_date.substring(0, 10) : '',
      end_date: c.end_date ? c.end_date.substring(0, 10) : '',
      coupon_id: c.coupon_id || '', target_audience: c.target_audience || 'all',
      max_conversions: c.max_conversions ? String(c.max_conversions) : '',
      status: c.status === 'inactive' ? 'paused' : c.status,
    });
    setCampaignFormError('');
    setIsCampaignModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.name.trim()) { setCampaignFormError('Campaign name is required.'); return; }
    if (campaignForm.commission_rate <= 0) { setCampaignFormError('Commission rate must be > 0.'); return; }
    setSubmitting(true);
    try {
      const payload = { ...campaignForm, max_conversions: campaignForm.max_conversions ? Number(campaignForm.max_conversions) : null, coupon_id: campaignForm.coupon_id || null };
      const res = await fetch('/api/admin/referrals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCampaign ? { action: 'update_campaign', id: editingCampaign.id, data: payload } : { action: 'create_campaign', data: payload }),
      });
      const data = await res.json();
      if (data.success) { setIsCampaignModalOpen(false); fetchData(); showToast(editingCampaign ? 'Campaign updated' : 'Campaign created'); }
      else setCampaignFormError(data.error || 'Failed to save.');
    } catch (err: any) { setCampaignFormError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!window.confirm(`Delete campaign "${name}"?`)) return;
    try {
      const res = await fetch('/api/admin/referrals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete_campaign', id }) });
      const data = await res.json();
      if (data.success) { fetchData(); showToast('Campaign deleted'); }
    } catch (e) { console.error(e); }
  };

  // ─── Conversion actions ─────────────────────────────────────────────────────
  const handleConversionStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/referrals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_conversion', id, status }) });
      fetchData(); showToast(`Conversion ${status}`);
    } catch (e) { console.error(e); }
  };

  const handleBulkConversions = async (status: string) => {
    if (selectedConversions.size === 0) return;
    try {
      await fetch('/api/admin/referrals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'bulk_update_conversions', ids: Array.from(selectedConversions), status }) });
      setSelectedConversions(new Set()); fetchData(); showToast(`${selectedConversions.size} conversions ${status}`);
    } catch (e) { console.error(e); }
  };

  const toggleConversionSelect = (id: string) => {
    setSelectedConversions(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleAllConversions = () => {
    const filtered = filteredConversions;
    if (selectedConversions.size === filtered.length) setSelectedConversions(new Set());
    else setSelectedConversions(new Set(filtered.map(c => c.id)));
  };

  // ─── Payout actions ─────────────────────────────────────────────────────────
  const openPayoutModal = (p: ReferralPayout, action: 'approved' | 'rejected' | 'completed') => {
    setProcessingPayout(p); setPayoutAction(action); setPayoutNotes(''); setIsPayoutModalOpen(true);
  };

  const handleProcessPayout = async () => {
    if (!processingPayout) return;
    setSubmitting(true);
    try {
      await fetch('/api/admin/referrals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'process_payout', payoutId: processingPayout.id, payoutAction: payoutAction, notes: payoutNotes }) });
      setIsPayoutModalOpen(false); fetchData(); showToast(`Payout ${payoutAction}`);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  // ─── Settings save ──────────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await fetch('/api/admin/referrals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_settings', data: settingsForm }) });
      const data = await res.json();
      if (data.success) showToast('Settings saved successfully');
      else showToast(data.error || 'Failed to save', 'error');
    } catch (e) { showToast('Failed to save settings', 'error'); }
    finally { setSettingsSaving(false); }
  };

  const togglePayoutMethod = (method: string) => {
    setSettingsForm(prev => ({
      ...prev,
      payout_methods: prev.payout_methods.includes(method)
        ? prev.payout_methods.filter(m => m !== method)
        : [...prev.payout_methods, method],
    }));
  };

  // ─── Filtered data ──────────────────────────────────────────────────────────
  const filteredCampaigns = campaigns.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(campaignSearch.toLowerCase()) || (c.description || '').toLowerCase().includes(campaignSearch.toLowerCase());
    const matchStatus = campaignStatusFilter === 'all' || c.status === campaignStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredConversions = conversions.filter(c => {
    const matchSearch = (c.referrer_id || c.referrerId || '').toLowerCase().includes(conversionSearch.toLowerCase()) || (c.referee_id || c.refereeId || '').toLowerCase().includes(conversionSearch.toLowerCase()) || c.id.toLowerCase().includes(conversionSearch.toLowerCase());
    const matchStatus = conversionStatusFilter === 'all' || c.status === conversionStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredPayouts = payouts.filter(p => payoutStatusFilter === 'all' || p.status === payoutStatusFilter);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const fmt = (n: number | undefined) => `$${(n || 0).toFixed(2)}`;
  const fmtDate = (d: string | undefined | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200', approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200', pending: 'bg-amber-50 text-amber-700 border-amber-200',
      paused: 'bg-slate-100 text-slate-600 border-slate-200', ended: 'bg-slate-100 text-slate-600 border-slate-200',
      rejected: 'bg-rose-50 text-rose-700 border-rose-200', paid: 'bg-blue-50 text-blue-700 border-blue-200',
      inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return `text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${map[status] || map.inactive}`;
  };

  // ─── Tabs Config ────────────────────────────────────────────────────────────
  const tabs: { id: TabId; label: string; icon: React.ComponentType<LucideProps>; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'campaigns', label: 'Campaigns', icon: Target, count: campaigns.length },
    { id: 'conversions', label: 'Conversions', icon: MousePointerClick, count: conversions.length },
    { id: 'payouts', label: 'Payouts', icon: Wallet, count: payouts.filter(p => p.status === 'pending').length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold shadow-lg border transition-all ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
          <AdminIcon icon={toast.type === 'success' ? CheckCircle2 : XCircle} size="xs" />
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 cursor-pointer"><X size={14} /></button>
        </div>
      )}

      {/* ──── Page Header ──── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <AdminIcon icon={Share2} size="sm" className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Referrals & Affiliate Manager</h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">Dynamic Engine</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Manage affiliate campaigns, commission rules, conversion tracking, referral payouts, and platform-wide analytics.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchData} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-xs" title="Refresh">
            <AdminIcon icon={RefreshCw} size="xs" variant="slate" className={loading ? 'animate-spin' : ''} />
          </button>
          {activeTab === 'campaigns' && (
            <button onClick={openCreateCampaign} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95">
              <AdminIcon icon={Plus} size="xs" className="text-white" />
              <span>Create Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* ──── Tab Bar ──── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-1.5 flex items-center gap-1 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}`}>
            <AdminIcon icon={tab.icon} size="xs" className={activeTab === tab.id ? 'text-white' : 'text-slate-500'} />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════ TAB: OVERVIEW ════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Affiliates', value: analytics?.totalAffiliates ?? analytics?.totalLinks ?? 0, icon: Users, color: 'indigo' },
              { label: 'Active Campaigns', value: analytics?.activeCampaigns ?? 0, icon: Target, color: 'emerald' },
              { label: 'Total Clicks', value: analytics?.totalClicks ?? 0, icon: MousePointerClick, color: 'blue' },
              { label: 'Total Conversions', value: analytics?.totalConversions ?? 0, icon: UserPlus, color: 'purple' },
              { label: 'Commission Paid', value: fmt(analytics?.totalCommissionPaid ?? analytics?.paidCommission ?? 0), icon: DollarSign, color: 'amber', isCurrency: true },
              { label: 'Conversion Rate', value: `${(analytics?.conversionRate ?? 0).toFixed(1)}%`, icon: TrendingUp, color: 'rose' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                  <div className={`w-8 h-8 rounded-xl bg-${card.color}-50 border border-${card.color}-100 flex items-center justify-center text-${card.color}-600`}>
                    <AdminIcon icon={card.icon} size="xs" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-black text-slate-900">{card.isCurrency ? card.value : card.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Top Affiliates & Recent Conversions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Affiliates */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <AdminIcon icon={Award} size="xs" variant="indigo" />
                <h3 className="text-sm font-black text-slate-900">Top Affiliates</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 px-4">#</th>
                      <th className="py-2.5 px-4">Affiliate</th>
                      <th className="py-2.5 px-4">Earned</th>
                      <th className="py-2.5 px-4">Conversions</th>
                      <th className="py-2.5 px-4">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {(analytics?.topAffiliates || []).length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-400">No affiliate data yet</td></tr>
                    ) : (analytics?.topAffiliates || []).slice(0, 8).map((a: TopAffiliate, i: number) => (
                      <tr key={a.userId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-black text-slate-400">{i + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 flex items-center justify-center text-white text-[10px] font-black">
                              {(a.userName || '??').substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-800">{a.userName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-600">{fmt(a.totalEarned)}</td>
                        <td className="py-3 px-4 font-bold">{a.totalConversions}</td>
                        <td className="py-3 px-4"><span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{a.conversionRate.toFixed(1)}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Conversions */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <AdminIcon icon={ArrowUpRight} size="xs" variant="emerald" />
                <h3 className="text-sm font-black text-slate-900">Recent Conversions</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {(analytics?.recentConversions || conversions.slice(0, 8)).length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">No conversions yet</div>
                ) : (analytics?.recentConversions || conversions.slice(0, 8)).map((c: ReferralConversion) => (
                  <div key={c.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <AdminIcon icon={UserPlus} size="xs" variant="emerald" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Referrer: {(c.referrer_id || c.referrerId || '').substring(0, 8)}...</p>
                        <p className="text-[10px] text-slate-400">{fmtDate(c.created_at || c.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-600">{fmt(c.commission_amount || c.commissionAmount)}</p>
                      <span className={statusBadge(c.status)}>{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ TAB: CAMPAIGNS ════════════════════════ */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <AdminIcon icon={Search} size="xs" variant="slate" className="absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search campaigns..." value={campaignSearch} onChange={e => setCampaignSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <AdminIcon icon={Filter} size="xs" variant="slate" />
              <select value={campaignStatusFilter} onChange={e => setCampaignStatusFilter(e.target.value)} className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer">
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="ended">Ended</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Campaign</th>
                    <th className="py-3 px-4">Commission</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Audience</th>
                    <th className="py-3 px-4">Conversions</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr><td colSpan={7} className="py-8 text-center text-slate-400"><AdminIcon icon={RefreshCw} size="sm" className="animate-spin mx-auto mb-2 text-indigo-600" />Loading campaigns...</td></tr>
                  ) : filteredCampaigns.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center space-y-2"><Target className="mx-auto text-slate-300" size={32} /><p className="font-bold text-slate-700 text-sm">No Campaigns Found</p><p className="text-xs text-slate-400">Create your first affiliate campaign to start tracking referrals.</p></td></tr>
                  ) : filteredCampaigns.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{c.name}</div>
                        {c.description && <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{c.description}</div>}
                        {c.coupon_id && <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 mt-1 inline-block">🎟️ Coupon Linked</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-sm text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/80">
                          {(c.commission_type ?? c.commissionType) === 'percentage' ? `${c.commission_rate ?? c.commissionRate}%` : `$${c.commission_rate ?? c.commissionRate}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{fmtDate(c.start_date)}</div>
                        <div className="text-[10px] text-slate-400">to {fmtDate(c.end_date)}</div>
                      </td>
                      <td className="py-3.5 px-4"><span className="capitalize text-slate-600">{c.target_audience || 'all'}</span></td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold">{c.total_conversions}</span>
                        {c.max_conversions && <span className="text-slate-400"> / {c.max_conversions}</span>}
                      </td>
                      <td className="py-3.5 px-4"><span className={statusBadge(c.status)}>{c.status}</span></td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditCampaign(c)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 cursor-pointer" title="Edit"><Edit3 size={14} /></button>
                          <button onClick={() => handleDeleteCampaign(c.id, c.name)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ TAB: CONVERSIONS ════════════════════════ */}
      {activeTab === 'conversions' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <AdminIcon icon={Search} size="xs" variant="slate" className="absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search by referrer or referee ID..." value={conversionSearch} onChange={e => setConversionSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <AdminIcon icon={Filter} size="xs" variant="slate" />
                <select value={conversionStatusFilter} onChange={e => setConversionStatusFilter(e.target.value)} className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer">
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              {selectedConversions.size > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500">{selectedConversions.size} selected</span>
                  <button onClick={() => handleBulkConversions('approved')} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold cursor-pointer hover:bg-emerald-700 transition-all">Approve</button>
                  <button onClick={() => handleBulkConversions('rejected')} className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold cursor-pointer hover:bg-rose-700 transition-all">Reject</button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4"><input type="checkbox" onChange={toggleAllConversions} checked={selectedConversions.size > 0 && selectedConversions.size === filteredConversions.length} className="rounded cursor-pointer" /></th>
                    <th className="py-3 px-4">Conversion ID</th>
                    <th className="py-3 px-4">Referrer</th>
                    <th className="py-3 px-4">Referee</th>
                    <th className="py-3 px-4">Transaction</th>
                    <th className="py-3 px-4">Commission</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr><td colSpan={9} className="py-8 text-center text-slate-400"><AdminIcon icon={RefreshCw} size="sm" className="animate-spin mx-auto mb-2 text-indigo-600" />Loading conversions...</td></tr>
                  ) : filteredConversions.length === 0 ? (
                    <tr><td colSpan={9} className="py-12 text-center space-y-2"><MousePointerClick className="mx-auto text-slate-300" size={32} /><p className="font-bold text-slate-700 text-sm">No Conversions Found</p><p className="text-xs text-slate-400">No conversion records match your filters.</p></td></tr>
                  ) : filteredConversions.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-3 px-4"><input type="checkbox" checked={selectedConversions.has(c.id)} onChange={() => toggleConversionSelect(c.id)} className="rounded cursor-pointer" /></td>
                      <td className="py-3 px-4"><span className="font-mono text-[10px] font-bold text-slate-500">{c.id.substring(0, 8)}...</span></td>
                      <td className="py-3 px-4 font-medium text-slate-700">{(c.referrer_id || c.referrerId || '').substring(0, 8)}...</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{(c.referee_id || c.refereeId || '').substring(0, 8)}...</td>
                      <td className="py-3 px-4 font-bold">{fmt(c.transaction_amount || c.transactionAmount)}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-black text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/80">
                          {fmt(c.commission_amount || c.commissionAmount)}
                        </span>
                      </td>
                      <td className="py-3 px-4"><span className={statusBadge(c.status)}>{c.status}</span></td>
                      <td className="py-3 px-4 text-slate-500">{fmtDate(c.created_at || c.createdAt)}</td>
                      <td className="py-3 px-4 text-right">
                        {(c.status === 'pending') && (
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleConversionStatus(c.id, 'approved')} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 cursor-pointer" title="Approve"><CheckCircle2 size={14} /></button>
                            <button onClick={() => handleConversionStatus(c.id, 'rejected')} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer" title="Reject"><XCircle size={14} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ TAB: PAYOUTS ════════════════════════ */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">Affiliate Payout Requests</h3>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <AdminIcon icon={Filter} size="xs" variant="slate" />
              <select value={payoutStatusFilter} onChange={e => setPayoutStatusFilter(e.target.value)} className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer">
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Payout ID</th>
                    <th className="py-3 px-4">Affiliate</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Fee</th>
                    <th className="py-3 px-4">Net</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Requested</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr><td colSpan={9} className="py-8 text-center text-slate-400"><AdminIcon icon={RefreshCw} size="sm" className="animate-spin mx-auto mb-2 text-indigo-600" />Loading payouts...</td></tr>
                  ) : filteredPayouts.length === 0 ? (
                    <tr><td colSpan={9} className="py-12 text-center space-y-2"><Wallet className="mx-auto text-slate-300" size={32} /><p className="font-bold text-slate-700 text-sm">No Payout Requests</p><p className="text-xs text-slate-400">No affiliate payout requests match your filter.</p></td></tr>
                  ) : filteredPayouts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-3 px-4"><span className="font-mono text-[10px] font-bold text-slate-500">{p.id.substring(0, 8)}...</span></td>
                      <td className="py-3 px-4 font-medium text-slate-700">{(p.user_id || p.userId || '').substring(0, 8)}...</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{fmt(p.amount)}</td>
                      <td className="py-3 px-4 text-slate-500">{fmt(p.processing_fee || p.processingFee || 0)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{fmt(p.net_amount || p.netAmount || p.amount)}</td>
                      <td className="py-3 px-4 capitalize text-slate-600">{(p.payout_method || p.payoutMethod || p.method || '').replace('_', ' ')}</td>
                      <td className="py-3 px-4"><span className={statusBadge(p.status)}>{p.status}</span></td>
                      <td className="py-3 px-4 text-slate-500">{fmtDate(p.created_at || p.createdAt)}</td>
                      <td className="py-3 px-4 text-right">
                        {p.status === 'pending' && (
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openPayoutModal(p, 'approved')} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 cursor-pointer" title="Approve"><CheckCircle2 size={14} /></button>
                            <button onClick={() => openPayoutModal(p, 'rejected')} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer" title="Reject"><XCircle size={14} /></button>
                          </div>
                        )}
                        {p.status === 'approved' && (
                          <button onClick={() => openPayoutModal(p, 'completed')} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold cursor-pointer hover:bg-emerald-100 border border-emerald-200 transition-all" title="Mark Completed">Complete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ TAB: SETTINGS ════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <AdminIcon icon={Settings} size="xs" variant="indigo" />
              <h3 className="text-sm font-black text-slate-900">Global Referral Settings</h3>
            </div>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800">Enable Referral System</label>
                <p className="text-[10px] text-slate-400 mt-0.5">Turn the referral & affiliate program on or off platform-wide.</p>
              </div>
              <button onClick={() => setSettingsForm(p => ({ ...p, is_enabled: !p.is_enabled }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settingsForm.is_enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${settingsForm.is_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Commission Rate & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Default Commission Rate</label>
                <input type="number" value={settingsForm.default_commission_rate} onChange={e => setSettingsForm(p => ({ ...p, default_commission_rate: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Commission Type</label>
                <select value={settingsForm.commission_type} onChange={e => setSettingsForm(p => ({ ...p, commission_type: e.target.value as 'percentage' | 'fixed' }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
            </div>

            {/* Cookie Duration & Min Payout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Cookie Tracking Duration (Days)</label>
                <input type="number" value={settingsForm.cookie_duration_days} onChange={e => setSettingsForm(p => ({ ...p, cookie_duration_days: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                <p className="text-[10px] text-slate-400 mt-1">How long a referral cookie remains valid after clicking a referral link.</p>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Minimum Payout Amount ($)</label>
                <input type="number" value={settingsForm.min_payout_amount} onChange={e => setSettingsForm(p => ({ ...p, min_payout_amount: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </div>
            </div>

            {/* Max Tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Max Referral Tiers</label>
                <input type="number" min={1} max={5} value={settingsForm.max_referral_tiers} onChange={e => setSettingsForm(p => ({ ...p, max_referral_tiers: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                <p className="text-[10px] text-slate-400 mt-1">Number of referral levels for multi-tier affiliate programs (1 = direct referrals only).</p>
              </div>
            </div>

            {/* Auto-Approve */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800">Auto-Approve Conversions</label>
                <p className="text-[10px] text-slate-400 mt-0.5">Automatically approve new conversions without manual admin review.</p>
              </div>
              <button onClick={() => setSettingsForm(p => ({ ...p, auto_approve_conversions: !p.auto_approve_conversions }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settingsForm.auto_approve_conversions ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${settingsForm.auto_approve_conversions ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Payout Methods */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">Allowed Payout Methods</label>
              <div className="flex flex-wrap gap-2">
                {['bank_transfer', 'paypal', 'crypto', 'wire_transfer', 'check'].map(method => (
                  <button key={method} onClick={() => togglePayoutMethod(method)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${settingsForm.payout_methods.includes(method) ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                    {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            {/* Save */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={handleSaveSettings} disabled={settingsSaving} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95 disabled:opacity-50">
                {settingsSaving ? <AdminIcon icon={RefreshCw} size="xs" className="text-white animate-spin" /> : <AdminIcon icon={Check} size="xs" className="text-white" />}
                <span>{settingsSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ CAMPAIGN MODAL ════════════════════════ */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsCampaignModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900">{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</h2>
              <button onClick={() => setIsCampaignModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveCampaign} className="p-5 space-y-4">
              {campaignFormError && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-3 py-2 rounded-xl">{campaignFormError}</div>}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Campaign Name *</label>
                <input type="text" value={campaignForm.name} onChange={e => setCampaignForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Summer Affiliate Blast" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Description</label>
                <textarea value={campaignForm.description} onChange={e => setCampaignForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none" placeholder="Describe this campaign..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Commission Rate *</label>
                  <input type="number" step="0.01" value={campaignForm.commission_rate} onChange={e => setCampaignForm(p => ({ ...p, commission_rate: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Commission Type</label>
                  <select value={campaignForm.commission_type} onChange={e => setCampaignForm(p => ({ ...p, commission_type: e.target.value as 'percentage' | 'fixed' }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Start Date</label>
                  <input type="date" value={campaignForm.start_date} onChange={e => setCampaignForm(p => ({ ...p, start_date: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">End Date</label>
                  <input type="date" value={campaignForm.end_date} onChange={e => setCampaignForm(p => ({ ...p, end_date: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Target Audience</label>
                  <select value={campaignForm.target_audience} onChange={e => setCampaignForm(p => ({ ...p, target_audience: e.target.value as 'all' | 'creators' | 'members' }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer">
                    <option value="all">All Users</option>
                    <option value="creators">Creators Only</option>
                    <option value="members">Members Only</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Max Conversions</label>
                  <input type="number" value={campaignForm.max_conversions} onChange={e => setCampaignForm(p => ({ ...p, max_conversions: e.target.value }))} placeholder="Unlimited" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Linked Coupon ID (optional)</label>
                <input type="text" value={campaignForm.coupon_id} onChange={e => setCampaignForm(p => ({ ...p, coupon_id: e.target.value }))} placeholder="e.g. coupon UUID" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Status</label>
                <select value={campaignForm.status} onChange={e => setCampaignForm(p => ({ ...p, status: e.target.value as 'active' | 'paused' | 'ended' }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer">
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCampaignModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" disabled={submitting} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50">
                  {submitting ? <AdminIcon icon={RefreshCw} size="xs" className="text-white animate-spin" /> : <AdminIcon icon={Check} size="xs" className="text-white" />}
                  <span>{editingCampaign ? 'Update Campaign' : 'Create Campaign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════ PAYOUT MODAL ════════════════════════ */}
      {isPayoutModalOpen && processingPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsPayoutModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900">
                {payoutAction === 'approved' ? 'Approve' : payoutAction === 'rejected' ? 'Reject' : 'Complete'} Payout
              </h2>
              <button onClick={() => setIsPayoutModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                <div className="flex justify-between text-xs"><span className="text-slate-500">Amount:</span><span className="font-bold">{fmt(processingPayout.amount)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">Fee:</span><span className="font-bold">{fmt(processingPayout.processing_fee || processingPayout.processingFee || 0)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">Net:</span><span className="font-bold text-emerald-600">{fmt(processingPayout.net_amount || processingPayout.netAmount || processingPayout.amount)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">Method:</span><span className="font-bold capitalize">{(processingPayout.payout_method || processingPayout.payoutMethod || processingPayout.method || '').replace('_', ' ')}</span></div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Admin Notes</label>
                <textarea value={payoutNotes} onChange={e => setPayoutNotes(e.target.value)} rows={3} placeholder="Optional notes..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none" />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsPayoutModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={handleProcessPayout} disabled={submitting} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 ${payoutAction === 'rejected' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'}`}>
                  {submitting ? <AdminIcon icon={RefreshCw} size="xs" className="text-white animate-spin" /> : <AdminIcon icon={payoutAction === 'rejected' ? XCircle : CheckCircle2} size="xs" className="text-white" />}
                  <span>{payoutAction === 'approved' ? 'Approve' : payoutAction === 'rejected' ? 'Reject' : 'Mark Completed'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
