'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag, Plus, Search, Filter, RefreshCw, Download, CheckCircle2, XCircle,
  Clock, AlertTriangle, TrendingUp, DollarSign, Users, Award, Percent,
  Calendar, Layers, Edit3, Trash2, Copy, Check, Sparkles, ChevronRight,
  Shield, Info, Eye, X, ArrowUpRight, Zap
} from 'lucide-react';
import { AdminIcon } from '@/components/admin/ui/AdminIcon';
import { CouponPromotion, CouponRedemption, PromotionAnalytics, DiscountType, TargetScope } from '@/lib/promotions/promotions-service';
import { MOCK_USERS, MOCK_MEMBERSHIP_PLANS } from '@/lib/supabase/store';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<CouponPromotion[]>([]);
  const [analytics, setAnalytics] = useState<PromotionAnalytics | null>(null);
  const [history, setHistory] = useState<CouponRedemption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'manager' | 'history'>('manager');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // History Search & Filter State
  const [historySearch, setHistorySearch] = useState<string>('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPromo, setEditingPromo] = useState<CouponPromotion | null>(null);
  const [modalError, setModalError] = useState<string>('');
  const [modalSubmitting, setModalSubmitting] = useState<boolean>(false);

  // Form Fields State
  const [formData, setFormData] = useState<{
    code: string;
    title: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    minPurchaseAmount: number;
    maxDiscountAmount: string;
    totalUsageLimit: string;
    perUserLimit: number;
    startDate: string;
    expiryDate: string;
    isAutoApplied: boolean;
    scope: TargetScope;
    targetCreatorId: string;
    targetPlanId: string;
    status: 'active' | 'inactive';
  }>({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minPurchaseAmount: 0,
    maxDiscountAmount: '',
    totalUsageLimit: '',
    perUserLimit: 1,
    startDate: new Date().toISOString().substring(0, 10),
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
    isAutoApplied: false,
    scope: 'all',
    targetCreatorId: '',
    targetPlanId: '',
    status: 'active',
  });

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resPromos, resHist] = await Promise.all([
        fetch('/api/promotions'),
        fetch('/api/promotions/history'),
      ]);

      const dataPromos = await resPromos.json();
      const dataHist = await resHist.json();

      if (dataPromos.success) {
        setPromotions(dataPromos.promotions);
        setAnalytics(dataPromos.analytics);
      }
      if (dataHist.success) {
        setHistory(dataHist.history);
      }
    } catch (e) {
      console.error('[AdminPromotionsPage] Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Code Copy
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingPromo(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: 15,
      minPurchaseAmount: 0,
      maxDiscountAmount: '',
      totalUsageLimit: '',
      perUserLimit: 1,
      startDate: new Date().toISOString().substring(0, 10),
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      isAutoApplied: false,
      scope: 'all',
      targetCreatorId: '',
      targetPlanId: '',
      status: 'active',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (promo: CouponPromotion) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      title: promo.title,
      description: promo.description || '',
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minPurchaseAmount: promo.minPurchaseAmount || 0,
      maxDiscountAmount: promo.maxDiscountAmount ? String(promo.maxDiscountAmount) : '',
      totalUsageLimit: promo.totalUsageLimit ? String(promo.totalUsageLimit) : '',
      perUserLimit: promo.perUserLimit || 1,
      startDate: promo.startDate ? promo.startDate.substring(0, 10) : '',
      expiryDate: promo.expiryDate ? promo.expiryDate.substring(0, 10) : '',
      isAutoApplied: promo.isAutoApplied,
      scope: promo.scope,
      targetCreatorId: promo.targetCreatorId || '',
      targetPlanId: promo.targetPlanId || '',
      status: promo.status === 'inactive' ? 'inactive' : 'active',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  // Generate random promo code helper
  const handleGenerateCode = () => {
    const prefixes = ['SUMMER', 'VIP', 'FLASH', 'CREATOR', 'PROMO', 'BONUS'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNumber = Math.floor(10 + Math.random() * 90);
    setFormData((prev) => ({ ...prev, code: `${randomPrefix}${randomNumber}` }));
  };

  // Toggle Promo Active Status
  const handleToggleStatus = async (promo: CouponPromotion) => {
    const newStatus = promo.status === 'inactive' ? 'active' : 'inactive';
    try {
      const res = await fetch(`/api/promotions/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (e) {
      console.error('[AdminPromotionsPage] Error toggling status:', e);
    }
  };

  // Delete Promo
  const handleDeletePromo = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete promotion code "${code}"?`)) return;
    try {
      const res = await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (e) {
      console.error('[AdminPromotionsPage] Error deleting promo:', e);
    }
  };

  // Save Modal Form (Create / Edit)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!formData.code.trim()) {
      setModalError('Promotion code is required.');
      return;
    }
    if (!formData.title.trim()) {
      setModalError('Promotion title is required.');
      return;
    }
    if (formData.discountValue <= 0) {
      setModalError('Discount value must be greater than zero.');
      return;
    }

    setModalSubmitting(true);

    try {
      // Find Creator / Plan Name if selected
      let targetCreatorName = undefined;
      if (formData.targetCreatorId) {
        const creatorObj = Object.values(MOCK_USERS).find((u) => u.id === formData.targetCreatorId);
        if (creatorObj) targetCreatorName = creatorObj.fullName;
      }

      let targetPlanName = undefined;
      if (formData.targetPlanId) {
        const allPlans = Object.values(MOCK_MEMBERSHIP_PLANS).flat();
        const planObj = allPlans.find((p) => p.id === formData.targetPlanId);
        if (planObj) targetPlanName = planObj.name;
      }

      const payload = {
        code: formData.code,
        title: formData.title,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minPurchaseAmount: Number(formData.minPurchaseAmount || 0),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        totalUsageLimit: formData.totalUsageLimit ? Number(formData.totalUsageLimit) : undefined,
        perUserLimit: Number(formData.perUserLimit || 1),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate + 'T23:59:59').toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
        isAutoApplied: formData.isAutoApplied,
        scope: formData.scope,
        targetCreatorId: formData.targetCreatorId || undefined,
        targetCreatorName,
        targetPlanId: formData.targetPlanId || undefined,
        targetPlanName,
        status: formData.status,
      };

      let response;
      if (editingPromo) {
        response = await fetch(`/api/promotions/${editingPromo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();
      if (!data.success) {
        setModalError(data.error || 'Failed to save promotion.');
      } else {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      setModalError(err.message || 'An error occurred while saving.');
    } finally {
      setModalSubmitting(false);
    }
  };

  // CSV Export for Redemption History
  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = ['Redemption ID', 'Coupon Code', 'Discount Type', 'Discount Amount ($)', 'User ID', 'User Name', 'Creator', 'Original Amount ($)', 'Final Amount ($)', 'Gateway', 'Date'];
    const rows = history.map((r) => [
      r.id,
      r.couponCode,
      r.discountType,
      r.discountAmount.toFixed(2),
      r.userId,
      r.userName || '',
      r.creatorName || 'Global',
      r.originalAmount.toFixed(2),
      r.finalAmount.toFixed(2),
      r.gatewayId,
      new Date(r.redeemedAt).toLocaleString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `coupon-redemptions-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Promotions
  const filteredPromotions = promotions.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.targetCreatorName && p.targetCreatorName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesScope = scopeFilter === 'all' || p.scope === scopeFilter || (scopeFilter === 'auto' && p.isAutoApplied);

    return matchesSearch && matchesStatus && matchesScope;
  });

  // Filtered History
  const filteredHistory = history.filter((h) => {
    return (
      h.couponCode.toLowerCase().includes(historySearch.toLowerCase()) ||
      (h.userName && h.userName.toLowerCase().includes(historySearch.toLowerCase())) ||
      (h.creatorName && h.creatorName.toLowerCase().includes(historySearch.toLowerCase())) ||
      h.gatewayId.toLowerCase().includes(historySearch.toLowerCase())
    );
  });

  // Creator options list for selector
  const creatorOptions = Object.values(MOCK_USERS).filter((u) => u.role === 'creator');
  // Plan options list for selector
  const planOptions = Object.values(MOCK_MEMBERSHIP_PLANS).flat();

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <AdminIcon icon={Tag} size="sm" className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Dynamic Coupon & Promotion Manager</h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                Dynamic Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Manage percentage and fixed discounts, usage limits, auto-applied promos, creator offers, and real-time checkout analytics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
            title="Refresh Data"
          >
            <AdminIcon icon={RefreshCw} size="xs" variant="slate" className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95"
          >
            <AdminIcon icon={Plus} size="xs" className="text-white" />
            <span>Create Promotion</span>
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Coupons */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Coupons</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <AdminIcon icon={Tag} size="xs" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{analytics?.totalCoupons || 0}</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Configured
            </span>
          </div>
        </div>

        {/* Card 2: Active Promos */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Promos</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <AdminIcon icon={Zap} size="xs" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">{analytics?.activePromotions || 0}</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              Live Checkout
            </span>
          </div>
        </div>

        {/* Card 3: Total Redemptions */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Redemptions</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <AdminIcon icon={Users} size="xs" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{analytics?.totalRedemptions || 0}</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Used
            </span>
          </div>
        </div>

        {/* Card 4: Total Customer Savings */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Savings</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <AdminIcon icon={DollarSign} size="xs" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">${analytics?.totalDiscountSavings.toFixed(2) || '0.00'}</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
              Saved
            </span>
          </div>
        </div>

        {/* Card 5: Avg Discount per order */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Discount</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AdminIcon icon={TrendingUp} size="xs" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">${analytics?.avgDiscountValue.toFixed(2) || '0.00'}</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
              /Order
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-1.5 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('manager')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'manager'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          <AdminIcon icon={Tag} size="xs" className={activeTab === 'manager' ? 'text-white' : 'text-slate-500'} />
          <span>Promotions Manager ({promotions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          <AdminIcon icon={Clock} size="xs" className={activeTab === 'history' ? 'text-white' : 'text-slate-500'} />
          <span>Redemption Audit Log ({history.length})</span>
        </button>
      </div>

      {/* TAB 1: PROMOTIONS MANAGER */}
      {activeTab === 'manager' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <AdminIcon icon={Search} size="xs" variant="slate" className="absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search code, title, or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Status & Scope Filters */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {/* Status Filter Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <AdminIcon icon={Filter} size="xs" variant="slate" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="expired">Expired</option>
                  <option value="exhausted">Exhausted</option>
                  <option value="inactive">Disabled</option>
                </select>
              </div>

              {/* Scope Filter Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <AdminIcon icon={Layers} size="xs" variant="slate" />
                <select
                  value={scopeFilter}
                  onChange={(e) => setScopeFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Target Scopes</option>
                  <option value="all">Global Offers</option>
                  <option value="creator">Creator Specific</option>
                  <option value="membership_plan">Plan Specific</option>
                  <option value="auto">Auto-Applied</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Coupon & Code</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Rules & Target</th>
                    <th className="py-3 px-4">Usage Progress</th>
                    <th className="py-3 px-4">Expiry Window</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        <AdminIcon icon={RefreshCw} size="sm" className="animate-spin mx-auto mb-2 text-indigo-600" />
                        Loading promotion registry...
                      </td>
                    </tr>
                  ) : filteredPromotions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center space-y-2">
                        <Tag className="mx-auto text-slate-300" size={32} />
                        <p className="font-bold text-slate-700 text-sm">No Promotions Found</p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          No promotion codes match your search query or filter constraints.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPromotions.map((promo) => {
                      const isExpired = promo.status === 'expired';
                      const isActive = promo.status === 'active';
                      const isScheduled = promo.status === 'scheduled';

                      return (
                        <tr key={promo.id} className="hover:bg-slate-50/60 transition-colors group">
                          {/* Code & Title */}
                          <td className="py-3.5 px-4 font-medium">
                            <div className="flex items-center gap-2.5">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-sm text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/80">
                                    {promo.code}
                                  </span>
                                  <button
                                    onClick={() => handleCopyCode(promo.code)}
                                    className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                                    title="Copy Code"
                                  >
                                    <AdminIcon icon={copiedCode === promo.code ? Check : Copy} size="xs" />
                                  </button>
                                  {promo.isAutoApplied && (
                                    <span className="text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                      <Sparkles size={10} /> Auto-Apply
                                    </span>
                                  )}
                                </div>
                                <span className="font-bold text-slate-900 mt-1">{promo.title}</span>
                                {promo.description && (
                                  <span className="text-[11px] text-slate-500 line-clamp-1">{promo.description}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Discount Value */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-black text-sm text-emerald-600">
                                {promo.discountType === 'percentage'
                                  ? `${promo.discountValue}% OFF`
                                  : `$${promo.discountValue.toFixed(2)} OFF`}
                              </span>
                              {promo.maxDiscountAmount && (
                                <span className="text-[10px] text-slate-400">
                                  Cap: ${promo.maxDiscountAmount.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Target Scope */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-slate-700 font-semibold">
                                {promo.scope === 'all' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                    🌐 All Platform Offers
                                  </span>
                                )}
                                {promo.scope === 'creator' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold">
                                    👤 Creator: {promo.targetCreatorName || '@creator'}
                                  </span>
                                )}
                                {promo.scope === 'membership_plan' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold">
                                    👑 Tier: {promo.targetPlanName || 'Plan'}
                                  </span>
                                )}
                              </span>
                              {promo.minPurchaseAmount > 0 && (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Min spend: ${promo.minPurchaseAmount.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Usage Progress */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 w-28">
                              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                                <span>{promo.currentUsageCount} used</span>
                                <span>{promo.totalUsageLimit ? promo.totalUsageLimit : '∞'}</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-indigo-600 h-full rounded-full transition-all"
                                  style={{
                                    width: promo.totalUsageLimit
                                      ? `${Math.min(100, (promo.currentUsageCount / promo.totalUsageLimit) * 100)}%`
                                      : '35%',
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Dates */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                            <div>Start: {new Date(promo.startDate).toLocaleDateString()}</div>
                            <div>Exp: {new Date(promo.expiryDate).toLocaleDateString()}</div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                promo.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : promo.status === 'scheduled'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : promo.status === 'expired'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : promo.status === 'exhausted'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  promo.status === 'active'
                                    ? 'bg-emerald-500 animate-pulse'
                                    : promo.status === 'scheduled'
                                    ? 'bg-blue-500'
                                    : 'bg-slate-400'
                                }`}
                              />
                              {promo.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleStatus(promo)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                  promo.status === 'inactive'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                                title="Toggle Status"
                              >
                                {promo.status === 'inactive' ? 'Enable' : 'Disable'}
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(promo)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                                title="Edit Promotion"
                              >
                                <AdminIcon icon={Edit3} size="xs" />
                              </button>
                              <button
                                onClick={() => handleDeletePromo(promo.id, promo.code)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                title="Delete Promotion"
                              >
                                <AdminIcon icon={Trash2} size="xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REDEMPTION AUDIT LOG & ANALYTICS */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Top Performance Summary Card */}
          {analytics && analytics.topPerformingCoupons.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 rounded-2xl p-5 text-white shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-amber-400" size={18} />
                  <h4 className="font-extrabold text-sm tracking-wide">Top Performing Coupon Codes</h4>
                </div>
                <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                  Real-time Analytics
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {analytics.topPerformingCoupons.map((top, idx) => (
                  <div key={top.code} className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-black text-amber-300">#{idx + 1} {top.code}</span>
                      <span className="text-[10px] text-slate-300">{top.redemptions} Uses</span>
                    </div>
                    <div className="text-lg font-black text-white">
                      ${top.totalSavings.toFixed(2)} <span className="text-[10px] text-emerald-400 font-normal">saved</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Trail Filter & Export Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <AdminIcon icon={Search} size="xs" variant="slate" className="absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail by code, user, or creator..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleExportCSV}
              disabled={history.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <AdminIcon icon={Download} size="xs" className="text-white" />
              <span>Export CSV Audit Report</span>
            </button>
          </div>

          {/* Redemption History Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Redemption ID & Date</th>
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Member User</th>
                    <th className="py-3 px-4">Creator / Tier</th>
                    <th className="py-3 px-4">Discount Savings</th>
                    <th className="py-3 px-4">Final Order Amount</th>
                    <th className="py-3 px-4 text-right">Payment Gateway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center space-y-2">
                        <Clock className="mx-auto text-slate-300" size={32} />
                        <p className="font-bold text-slate-700 text-sm">No Redemption History Recorded</p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Redemptions will automatically appear here when members apply coupons at checkout.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* ID & Date */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-slate-800 text-[11px]">{item.id}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(item.redeemedAt).toLocaleString()}
                            </span>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="py-3.5 px-4 font-mono font-black text-indigo-600">
                          <span className="bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                            {item.couponCode}
                          </span>
                        </td>

                        {/* User */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {item.userName || item.userId}
                        </td>

                        {/* Creator / Tier */}
                        <td className="py-3.5 px-4 text-slate-600">
                          {item.creatorName ? (
                            <span className="font-semibold text-slate-800">@{item.creatorName}</span>
                          ) : (
                            <span className="text-slate-400">Global</span>
                          )}
                          {item.planName && (
                            <span className="block text-[10px] text-slate-500">({item.planName})</span>
                          )}
                        </td>

                        {/* Discount */}
                        <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                          -${item.discountAmount.toFixed(2)}
                        </td>

                        {/* Amounts */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900">${item.finalAmount.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-400 line-through">
                              Orig: ${item.originalAmount.toFixed(2)}
                            </span>
                          </div>
                        </td>

                        {/* Gateway */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                            {item.gatewayId}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PROMOTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 relative border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <AdminIcon icon={Tag} size="sm" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingPromo ? 'Edit Promotion Code' : 'Create New Promotion Code'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Configure discount rules, limits, targeting & auto-apply.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Code & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>Coupon Code *</span>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer"
                    >
                      ⚡ Auto Generate
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUMMER20"
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Promotion Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summer Fan Special"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description shown at checkout or promotional banner..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discountType: e.target.value as DiscountType }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Value ({formData.discountType === 'percentage' ? '%' : '$'}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discountValue: Number(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {formData.discountType === 'percentage' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Max Cap ($)</label>
                    <input
                      type="number"
                      placeholder="Optional max limit"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, maxDiscountAmount: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Min Spend ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Min required spend"
                      value={formData.minPurchaseAmount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, minPurchaseAmount: Number(e.target.value) }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Usage & User Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={formData.totalUsageLimit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, totalUsageLimit: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Per User Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, perUserLimit: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Start & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Target Scope & Targeting dropdowns */}
              <div className="space-y-2 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <label className="block text-xs font-extrabold text-indigo-950">Offer Targeting & Scope</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      value="all"
                      checked={formData.scope === 'all'}
                      onChange={() => setFormData((prev) => ({ ...prev, scope: 'all', targetCreatorId: '', targetPlanId: '' }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-800">Global All</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      value="creator"
                      checked={formData.scope === 'creator'}
                      onChange={() => setFormData((prev) => ({ ...prev, scope: 'creator', targetPlanId: '' }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-800">Specific Creator</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      value="membership_plan"
                      checked={formData.scope === 'membership_plan'}
                      onChange={() => setFormData((prev) => ({ ...prev, scope: 'membership_plan', targetCreatorId: '' }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-800">Membership Tier</span>
                  </label>
                </div>

                {formData.scope === 'creator' && (
                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Target Creator</label>
                    <select
                      value={formData.targetCreatorId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, targetCreatorId: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="">Choose Creator...</option>
                      {creatorOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName} (@{c.username})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.scope === 'membership_plan' && (
                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Target Membership Plan</label>
                    <select
                      value={formData.targetPlanId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, targetPlanId: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="">Choose Plan...</option>
                      {planOptions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${p.priceMonthly.toFixed(2)}/mo)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Toggles: Auto-Apply & Active Status */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAutoApplied}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isAutoApplied: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-800">Auto-Apply at Checkout</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Status:</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Disabled</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {modalSubmitting ? (
                    <RefreshCw size={14} className="animate-spin text-white" />
                  ) : (
                    <AdminIcon icon={Check} size="xs" className="text-white" />
                  )}
                  <span>{editingPromo ? 'Update Promotion' : 'Save Promotion'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
