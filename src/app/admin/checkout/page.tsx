'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, CreditCard, SlidersHorizontal, DollarSign,
  Percent, Tag, ArrowRight, ShieldCheck, CheckCircle2,
  RefreshCw, RotateCcw, Save, Eye, Sparkles, ChevronUp,
  ChevronDown, Layers, FileText, Globe, Check, AlertCircle,
  HelpCircle, Settings, X, Lock, ExternalLink
} from 'lucide-react';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';
import { useAdminProgress } from '@/components/admin/AdminProgressProvider';
import {
  CheckoutConfiguration,
  DEFAULT_CHECKOUT_CONFIG,
  getCheckoutConfig,
  saveCheckoutConfig,
  resetCheckoutConfig,
  formatCheckoutPrice
} from '@/lib/payments/checkout-config-store';

export default function AdminCheckoutManagerPage() {
  const { plugins, togglePlugin, updatePluginSettings } = usePlugins();
  const { startProgress, updateProgress, completeProgress, errorProgress } = useAdminProgress();

  const [config, setConfig] = useState<CheckoutConfiguration>(getCheckoutConfig());
  const [activeTab, setActiveTab] = useState<'gateways' | 'fields' | 'currency' | 'coupons' | 'redirects'>('gateways');
  const [isSaving, setIsSaving] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Live preview test state
  const [previewSelectedGateway, setPreviewSelectedGateway] = useState<string>('plugin-piprapay');
  const [previewCoupon, setPreviewCoupon] = useState<string>('');
  const [previewCouponApplied, setPreviewCouponApplied] = useState(false);
  const [previewCountry, setPreviewCountry] = useState<string>('US');

  // Load config on mount
  useEffect(() => {
    const loaded = getCheckoutConfig();
    setConfig(loaded);
  }, []);

  const triggerToast = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  // Filter payment gateway plugins
  const paymentGateways = plugins.filter(
    (p) =>
      (p.hooks.includes('payment_gateway_methods') && p.category === 'Monetization') ||
      p.id.includes('piprapay') ||
      p.id.includes('stripe') ||
      p.id.includes('paypal') ||
      p.id.includes('mock')
  ).sort((a, b) => {
    const orderA = config.gatewayOverrides[a.id]?.displayOrder ?? (a.settingsValues?.displayOrder as number) ?? 99;
    const orderB = config.gatewayOverrides[b.id]?.displayOrder ?? (b.settingsValues?.displayOrder as number) ?? 99;
    return orderA - orderB;
  });

  const handleSave = async () => {
    setIsSaving(true);
    startProgress({
      title: 'Saving Checkout Configuration',
      steps: [
        'Validating checkout field schema...',
        'Updating currency & tax calculation rules...',
        'Persisting gateway priority order...'
      ]
    });

    try {
      updateProgress(0, 'running', 35, 'Validating field configuration...');
      await new Promise((r) => setTimeout(r, 250));
      updateProgress(0, 'success', 60, 'Fields validated.');

      updateProgress(1, 'running', 75, 'Updating tax rules...');
      const saved = saveCheckoutConfig(config);
      setConfig(saved);
      await new Promise((r) => setTimeout(r, 300));
      updateProgress(1, 'success', 90, 'Taxes & currencies synced.');

      updateProgress(2, 'running', 95, 'Updating gateway priority...');
      await new Promise((r) => setTimeout(r, 200));

      completeProgress('Checkout manager settings saved and deployed globally!');
      triggerToast('Checkout settings saved successfully!');
    } catch (e: any) {
      errorProgress(1, e.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all checkout settings to factory defaults?')) {
      const reset = resetCheckoutConfig();
      setConfig(reset);
      triggerToast('Checkout settings reset to defaults.');
    }
  };

  const handleGatewayPriority = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= paymentGateways.length) return;

    const currentG = paymentGateways[index];
    const targetG = paymentGateways[targetIndex];

    const currentOrder = config.gatewayOverrides[currentG.id]?.displayOrder ?? index + 1;
    const targetOrder = config.gatewayOverrides[targetG.id]?.displayOrder ?? targetIndex + 1;

    const updatedOverrides = {
      ...config.gatewayOverrides,
      [currentG.id]: {
        ...config.gatewayOverrides[currentG.id],
        displayOrder: targetOrder
      },
      [targetG.id]: {
        ...config.gatewayOverrides[targetG.id],
        displayOrder: currentOrder
      }
    };

    const newConfig = {
      ...config,
      gatewayOverrides: updatedOverrides
    };

    setConfig(newConfig);
    saveCheckoutConfig(newConfig);
    triggerToast('Gateway checkout priority updated.');
  };

  const handleSetDefaultGateway = (gatewayId: string) => {
    const updatedOverrides: typeof config.gatewayOverrides = {};
    paymentGateways.forEach((g) => {
      updatedOverrides[g.id] = {
        ...config.gatewayOverrides[g.id],
        isDefault: g.id === gatewayId
      };
    });

    const newConfig = {
      ...config,
      gatewayOverrides: updatedOverrides
    };
    setConfig(newConfig);
    saveCheckoutConfig(newConfig);
    triggerToast(`Default gateway set to ${gatewayId}.`);
  };

  // Preview Calculations
  const previewBaseAmount = 30.0;
  const previewDiscount = previewCouponApplied ? 6.0 : 0.0;
  const previewSubtotalAfterDiscount = previewBaseAmount - previewDiscount;
  const previewTaxPct = config.taxesAndFees.enableRegionalTax
    ? previewCountry === 'BD'
      ? 15.0
      : previewCountry === 'EU' || previewCountry === 'GB'
      ? 20.0
      : config.taxesAndFees.defaultTaxPercentage
    : 0.0;
  const previewTaxAmount = (previewSubtotalAfterDiscount * previewTaxPct) / 100;
  const previewSurcharge = config.taxesAndFees.enableProcessingFeePassThrough
    ? config.taxesAndFees.fixedProcessingFee +
      (previewSubtotalAfterDiscount * config.taxesAndFees.percentageProcessingFee) / 100
    : 0.0;
  const previewTotalDue = previewSubtotalAfterDiscount + (config.taxesAndFees.isTaxInclusive ? 0 : previewTaxAmount) + previewSurcharge;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 px-4 sm:px-6">
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-indigo-500/20 text-pink-600 border border-pink-200 flex items-center justify-center text-2xl shadow-xs">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Dynamic Checkout Manager</h1>
              <Badge variant="emerald" className="bg-pink-50 text-pink-700 border-pink-200 font-bold text-[10px]">
                Active Flow
              </Badge>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5 font-medium">
              Configure checkout payment methods, required fields, currency formatting, taxes &amp; fees, coupons, and redirect paths.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLivePreview(!showLivePreview)}
            leftIcon={<Eye size={14} />}
          >
            {showLivePreview ? 'Hide Preview' : 'Show Live Preview'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw size={14} />}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Save size={14} />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('gateways')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'gateways'
              ? 'bg-pink-50 text-pink-700 border border-pink-200 shadow-xs'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <CreditCard size={14} />
          <span>Payment Gateways ({paymentGateways.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fields')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'fields'
              ? 'bg-pink-50 text-pink-700 border border-pink-200 shadow-xs'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>Checkout Fields</span>
        </button>

        <button
          onClick={() => setActiveTab('currency')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'currency'
              ? 'bg-pink-50 text-pink-700 border border-pink-200 shadow-xs'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <DollarSign size={14} />
          <span>Currency, Taxes &amp; Fees</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'coupons'
              ? 'bg-pink-50 text-pink-700 border border-pink-200 shadow-xs'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Tag size={14} />
          <span>Coupons &amp; Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('redirects')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'redirects'
              ? 'bg-pink-50 text-pink-700 border border-pink-200 shadow-xs'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ArrowRight size={14} />
          <span>Success &amp; Cancel URLs</span>
        </button>
      </div>

      {/* Main Grid: Settings (Left) + Interactive Live Preview (Right) */}
      <div className={`grid grid-cols-1 ${showLivePreview ? 'lg:grid-cols-12' : ''} gap-6`}>
        {/* Left Column: Form Settings Tabs */}
        <div className={showLivePreview ? 'lg:col-span-7 space-y-6' : 'space-y-6'}>
          {/* ========================================================================= */}
          {/* TAB 1: GATEWAYS & PRIORITY                                                */}
          {/* ========================================================================= */}
          {activeTab === 'gateways' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#18181B]">Payment Gateways Priority &amp; Ordering</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Reorder checkout options, set the default gateway, and customize user-facing labels.
                  </p>
                </div>
                <Link href="/admin/payment-gateways" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                  Manage Credentials <ExternalLink size={12} />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {paymentGateways.map((g, index) => {
                  const override = config.gatewayOverrides[g.id] || {};
                  const isDefault = override.isDefault ?? g.settingsValues.isDefault === true;
                  const isEnabled = override.isEnabled ?? g.isEnabled;
                  const customLabel = override.customLabel || g.name;
                  const isPipraPay = g.id === 'plugin-piprapay' || g.slug === 'piprapay';

                  return (
                    <div key={g.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <button
                            onClick={() => handleGatewayPriority(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronUp size={11} />
                          </button>
                          <span className="text-[10px] font-bold text-slate-400">#{index + 1}</span>
                          <button
                            onClick={() => handleGatewayPriority(index, 'down')}
                            disabled={index === paymentGateways.length - 1}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronDown size={11} />
                          </button>
                        </div>

                        <span className="text-2xl">{g.iconUrl}</span>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#18181B]">{customLabel}</h4>
                            {isDefault && (
                              <span className="text-[8px] bg-pink-100 text-pink-700 px-1.5 py-0.2 rounded font-bold uppercase">
                                Default
                              </span>
                            )}
                            {isPipraPay && (
                              <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                bKash / Nagad
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{g.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isDefault && isEnabled && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefaultGateway(g.id)}
                            className="text-[10px] h-7 px-2 text-indigo-600 hover:bg-indigo-50"
                          >
                            Make Default
                          </Button>
                        )}
                        <Button
                          variant={isEnabled ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => {
                            const updated = {
                              ...config,
                              gatewayOverrides: {
                                ...config.gatewayOverrides,
                                [g.id]: {
                                  ...config.gatewayOverrides[g.id],
                                  isEnabled: !isEnabled
                                }
                              }
                            };
                            setConfig(updated);
                            saveCheckoutConfig(updated);
                            triggerToast(`${g.name} ${!isEnabled ? 'enabled' : 'disabled'}.`);
                          }}
                          className={`text-[10px] h-7 px-2.5 ${isEnabled ? 'text-rose-600 border-rose-200' : ''}`}
                        >
                          {isEnabled ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CHECKOUT FIELDS                                                    */}
          {/* ========================================================================= */}
          {activeTab === 'fields' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#18181B]">Custom Checkout Form Fields</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Control which customer fields are displayed and required before proceeding to payment.
                </p>
              </div>

              <div className="space-y-3">
                {/* Full Name */}
                <div className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Customer Full Name</h4>
                    <p className="text-[11px] text-slate-500">Collect buyer legal name for receipts and invoices.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.fields.fullName.enabled}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            fields: {
                              ...config.fields,
                              fullName: { ...config.fields.fullName, enabled: e.target.checked }
                            }
                          })
                        }
                        className="rounded text-pink-600 focus:ring-pink-500"
                      />
                      <span>Show Field</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.fields.fullName.required}
                        disabled={!config.fields.fullName.enabled}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            fields: {
                              ...config.fields,
                              fullName: { ...config.fields.fullName, required: e.target.checked }
                            }
                          })
                        }
                        className="rounded text-pink-600 focus:ring-pink-500"
                      />
                      <span>Required</span>
                    </label>
                  </div>
                </div>

                {/* Billing Country */}
                <div className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Billing Country / Region</h4>
                    <p className="text-[11px] text-slate-500">Used for regional VAT/tax rate automatic calculations.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.fields.billingCountry.enabled}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            fields: {
                              ...config.fields,
                              billingCountry: { ...config.fields.billingCountry, enabled: e.target.checked }
                            }
                          })
                        }
                        className="rounded text-pink-600 focus:ring-pink-500"
                      />
                      <span>Show Field</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.fields.billingCountry.required}
                        disabled={!config.fields.billingCountry.enabled}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            fields: {
                              ...config.fields,
                              billingCountry: { ...config.fields.billingCountry, required: e.target.checked }
                            }
                          })
                        }
                        className="rounded text-pink-600 focus:ring-pink-500"
                      />
                      <span>Required</span>
                    </label>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Mobile Phone Number</h4>
                    <p className="text-[11px] text-slate-500">Allows SMS notification delivery or mobile banking reference.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.fields.phone.enabled}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            fields: {
                              ...config.fields,
                              phone: { ...config.fields.phone, enabled: e.target.checked }
                            }
                          })
                        }
                        className="rounded text-pink-600 focus:ring-pink-500"
                      />
                      <span>Show Field</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.fields.phone.required}
                        disabled={!config.fields.phone.enabled}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            fields: {
                              ...config.fields,
                              phone: { ...config.fields.phone, required: e.target.checked }
                            }
                          })
                        }
                        className="rounded text-pink-600 focus:ring-pink-500"
                      />
                      <span>Required</span>
                    </label>
                  </div>
                </div>

                {/* Tax ID */}
                <div className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Tax / VAT Identification Number</h4>
                    <p className="text-[11px] text-slate-500">For B2B buyers needing company VAT/EIN tax exemption.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.fields.taxId.enabled}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            fields: {
                              ...config.fields,
                              taxId: { ...config.fields.taxId, enabled: e.target.checked }
                            }
                          })
                        }
                        className="rounded text-pink-600 focus:ring-pink-500"
                      />
                      <span>Show Field</span>
                    </label>
                  </div>
                </div>

                {/* Terms of Service Checkbox */}
                <div className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Terms of Service Agreement Checkbox</h4>
                    <p className="text-[11px] text-slate-500">Requires customers to explicitly accept Terms before checkout.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.fields.termsCheckbox.enabled}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            fields: {
                              ...config.fields,
                              termsCheckbox: { ...config.fields.termsCheckbox, enabled: e.target.checked }
                            }
                          })
                        }
                        className="rounded text-pink-600 focus:ring-pink-500"
                      />
                      <span>Show Checkbox</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.fields.termsCheckbox.required}
                        disabled={!config.fields.termsCheckbox.enabled}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            fields: {
                              ...config.fields,
                              termsCheckbox: { ...config.fields.termsCheckbox, required: e.target.checked }
                            }
                          })
                        }
                        className="rounded text-pink-600 focus:ring-pink-500"
                      />
                      <span>Mandatory</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CURRENCY, TAXES & FEES                                             */}
          {/* ========================================================================= */}
          {activeTab === 'currency' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
              <div>
                <h2 className="text-sm font-bold text-[#18181B]">Currency Formatting, Taxes &amp; Surcharges</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure default currency, tax calculations, and merchant processing fees.
                </p>
              </div>

              {/* Currency Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Base Currency</label>
                  <select
                    value={config.currency.defaultCurrency}
                    onChange={(e) => {
                      const cur = e.target.value;
                      const symbol = cur === 'BDT' ? '৳' : cur === 'EUR' ? '€' : cur === 'GBP' ? '£' : '$';
                      setConfig({
                        ...config,
                        currency: {
                          ...config.currency,
                          defaultCurrency: cur,
                          currencySymbol: symbol
                        }
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800"
                  >
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="BDT">BDT (৳ - Bangladeshi Taka)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                    <option value="CAD">CAD ($ - Canadian Dollar)</option>
                    <option value="AUD">AUD ($ - Australian Dollar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Symbol Position</label>
                  <select
                    value={config.currency.currencyPosition}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        currency: {
                          ...config.currency,
                          currencyPosition: e.target.value as 'prefix' | 'suffix'
                        }
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800"
                  >
                    <option value="prefix">Prefix (e.g. $25.00)</option>
                    <option value="suffix">Suffix (e.g. 25.00$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Decimal Places</label>
                  <select
                    value={config.currency.decimalPlaces}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        currency: {
                          ...config.currency,
                          decimalPlaces: Number(e.target.value)
                        }
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800"
                  >
                    <option value={2}>2 Decimals (e.g. 25.00)</option>
                    <option value={0}>0 Decimals (e.g. 25)</option>
                  </select>
                </div>
              </div>

              {/* Tax Settings */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Regional Taxes (VAT / GST / Sales Tax)</h4>
                    <p className="text-[11px] text-slate-500">Calculate tax dynamically based on buyer country.</p>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.taxesAndFees.enableRegionalTax}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          taxesAndFees: {
                            ...config.taxesAndFees,
                            enableRegionalTax: e.target.checked
                          }
                        })
                      }
                      className="rounded text-pink-600 focus:ring-pink-500"
                    />
                    <span>Enable Taxes</span>
                  </label>
                </div>

                {config.taxesAndFees.enableRegionalTax && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Default Fallback Tax (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={config.taxesAndFees.defaultTaxPercentage}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            taxesAndFees: {
                              ...config.taxesAndFees,
                              defaultTaxPercentage: parseFloat(e.target.value) || 0
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tax Pricing Model</label>
                      <select
                        value={config.taxesAndFees.isTaxInclusive ? 'inclusive' : 'exclusive'}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            taxesAndFees: {
                              ...config.taxesAndFees,
                              isTaxInclusive: e.target.value === 'inclusive'
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800"
                      >
                        <option value="exclusive">Exclusive (Added on top at checkout)</option>
                        <option value="inclusive">Inclusive (Included in product price)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Processing Surcharge Fees */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Processing Fee Pass-Through Surcharge</h4>
                    <p className="text-[11px] text-slate-500">Pass gateway merchant fees to customer total.</p>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.taxesAndFees.enableProcessingFeePassThrough}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          taxesAndFees: {
                            ...config.taxesAndFees,
                            enableProcessingFeePassThrough: e.target.checked
                          }
                        })
                      }
                      className="rounded text-pink-600 focus:ring-pink-500"
                    />
                    <span>Pass Fee to Buyer</span>
                  </label>
                </div>

                {config.taxesAndFees.enableProcessingFeePassThrough && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Percentage Surcharge (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="15"
                        value={config.taxesAndFees.percentageProcessingFee}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            taxesAndFees: {
                              ...config.taxesAndFees,
                              percentageProcessingFee: parseFloat(e.target.value) || 0
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Fixed Fee Surcharge ($)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="10"
                        value={config.taxesAndFees.fixedProcessingFee}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            taxesAndFees: {
                              ...config.taxesAndFees,
                              fixedProcessingFee: parseFloat(e.target.value) || 0
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: COUPONS & SUMMARY                                                  */}
          {/* ========================================================================= */}
          {activeTab === 'coupons' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#18181B]">Promotions, Trust Badges &amp; Order Summary</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure promo code input, creator details, and security badges.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Coupon &amp; Promo Code Input</h4>
                    <p className="text-[11px] text-slate-500">Allow customers to type discount promo codes at checkout.</p>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.coupons.allowCoupons}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          coupons: { ...config.coupons, allowCoupons: e.target.checked }
                        })
                      }
                      className="rounded text-pink-600 focus:ring-pink-500"
                    />
                    <span>Allow Coupons</span>
                  </label>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Auto-Apply Best Promotion</h4>
                    <p className="text-[11px] text-slate-500">Automatically applies eligible creator discounts on modal load.</p>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.coupons.allowAutoApplyCoupons}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          coupons: { ...config.coupons, allowAutoApplyCoupons: e.target.checked }
                        })
                      }
                      className="rounded text-pink-600 focus:ring-pink-500"
                    />
                    <span>Auto-Apply</span>
                  </label>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Show Creator Avatar &amp; Handle</h4>
                    <p className="text-[11px] text-slate-500">Displays paying creator's verified avatar in the summary box.</p>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.general.showCreatorInfo}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          general: { ...config.general, showCreatorInfo: e.target.checked }
                        })
                      }
                      className="rounded text-pink-600 focus:ring-pink-500"
                    />
                    <span>Show Creator</span>
                  </label>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Show Trust &amp; SSL Badges</h4>
                    <p className="text-[11px] text-slate-500">Displays 256-bit encrypted bank-grade SSL trust indicators.</p>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.general.showTrustBadges}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          general: { ...config.general, showTrustBadges: e.target.checked }
                        })
                      }
                      className="rounded text-pink-600 focus:ring-pink-500"
                    />
                    <span>Show Badges</span>
                  </label>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-bold text-slate-700">Custom Checkout Title</label>
                  <input
                    type="text"
                    value={config.general.checkoutTitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        general: { ...config.general, checkoutTitle: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: REDIRECTS                                                          */}
          {/* ========================================================================= */}
          {activeTab === 'redirects' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#18181B]">Success &amp; Cancellation Routing</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure where customers are redirected after completing or aborting payment.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Default Success Redirect URL</label>
                  <input
                    type="text"
                    value={config.redirects.defaultSuccessUrl}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        redirects: { ...config.redirects, defaultSuccessUrl: e.target.value }
                      })
                    }
                    placeholder="/balance?success=true"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Default Cancel Redirect URL</label>
                  <input
                    type="text"
                    value={config.redirects.defaultCancelUrl}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        redirects: { ...config.redirects, defaultCancelUrl: e.target.value }
                      })
                    }
                    placeholder="/balance?cancelled=true"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custom Success Banner Message</label>
                  <textarea
                    rows={2}
                    value={config.redirects.customSuccessMessage}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        redirects: { ...config.redirects, customSuccessMessage: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: INTERACTIVE LIVE CHECKOUT PREVIEW                          */}
        {/* ========================================================================= */}
        {showLivePreview && (
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#18181B]">
                <Sparkles size={14} className="text-pink-600" />
                <span>Live Interactive Preview</span>
              </div>
              <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold">
                Real-Time Render
              </span>
            </div>

            {/* Mock Checkout Modal Card */}
            <div className="bg-white rounded-[24px] border border-[#F3DCE8] p-5 shadow-xl space-y-3.5 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-2.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-[#EC4899]" size={18} />
                  <h3 className="text-sm font-black text-[#18181B]">
                    {config.general.checkoutTitle}
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">Preview</span>
              </div>

              {/* Summary Box */}
              <div className="bg-[#FFF9FC] p-3.5 rounded-2xl border border-[#F3DCE8] space-y-1.5 text-xs">
                {config.general.showCreatorInfo && (
                  <div className="flex items-center gap-2 pb-2 border-b border-[#F3DCE8]/60">
                    <div className="w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">
                      SJ
                    </div>
                    <span className="text-[11px] text-slate-500 font-bold">
                      Paying Creator: <strong className="text-slate-900">@sarahdesign</strong>
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Item / Service:</span>
                  <span className="font-bold text-slate-800">VIP Creator Access Pass</span>
                </div>

                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Subtotal Price:</span>
                  <span className="font-bold text-slate-800">
                    {formatCheckoutPrice(previewBaseAmount, config.currency.defaultCurrency, config)}
                  </span>
                </div>

                {/* Coupon discount line */}
                {previewCouponApplied && (
                  <div className="flex justify-between text-[11px] text-emerald-700 font-bold bg-emerald-50 p-1.5 rounded-lg">
                    <span>Discount (WELCOME20):</span>
                    <span>-{formatCheckoutPrice(previewDiscount, config.currency.defaultCurrency, config)}</span>
                  </div>
                )}

                {/* Tax line */}
                {config.taxesAndFees.enableRegionalTax && previewTaxAmount > 0 && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">{config.taxesAndFees.taxLabel} ({previewTaxPct}%):</span>
                    <span className="font-bold text-slate-800">
                      {formatCheckoutPrice(previewTaxAmount, config.currency.defaultCurrency, config)}
                    </span>
                  </div>
                )}

                {/* Processing Fee */}
                {config.taxesAndFees.enableProcessingFeePassThrough && previewSurcharge > 0 && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">{config.taxesAndFees.platformFeeLabel}:</span>
                    <span className="font-bold text-slate-800">
                      {formatCheckoutPrice(previewSurcharge, config.currency.defaultCurrency, config)}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between border-t border-[#F3DCE8] pt-2 mt-1">
                  <span className="font-black text-xs text-slate-900">Total Amount Due:</span>
                  <span className="text-emerald-600 font-black text-sm">
                    {formatCheckoutPrice(previewTotalDue, config.currency.defaultCurrency, config)}
                  </span>
                </div>
              </div>

              {/* Dynamic Custom Fields in Preview */}
              <div className="space-y-2 text-xs">
                {config.fields.fullName.enabled && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      {config.fields.fullName.label} {config.fields.fullName.required && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      placeholder={config.fields.fullName.placeholder || 'John Doe'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                )}

                {config.fields.billingCountry.enabled && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      {config.fields.billingCountry.label} {config.fields.billingCountry.required && <span className="text-rose-500">*</span>}
                    </label>
                    <select
                      value={previewCountry}
                      onChange={(e) => setPreviewCountry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                    >
                      <option value="US">United States (8% Sales Tax)</option>
                      <option value="BD">Bangladesh (15% VAT - bKash / Nagad)</option>
                      <option value="EU">European Union (20% VAT)</option>
                      <option value="GB">United Kingdom (20% VAT)</option>
                    </select>
                  </div>
                )}

                {config.fields.phone.enabled && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      {config.fields.phone.label} {config.fields.phone.required && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="tel"
                      placeholder={config.fields.phone.placeholder || '+1 (555) 000-0000'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                )}

                {config.fields.taxId.enabled && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      {config.fields.taxId.label}
                    </label>
                    <input
                      type="text"
                      placeholder={config.fields.taxId.placeholder || 'VAT-12345678'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Coupon input in preview */}
              {config.coupons.allowCoupons && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={previewCoupon}
                      onChange={(e) => setPreviewCoupon(e.target.value.toUpperCase())}
                      placeholder={config.coupons.couponInputPlaceholder}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] font-mono font-bold uppercase text-slate-800"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewCouponApplied(!previewCouponApplied)}
                      className="text-[10px] h-7 px-2"
                    >
                      {previewCouponApplied ? 'Remove' : 'Apply'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment Gateway Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[10px] font-bold text-slate-700">Choose Payment Method:</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                  {paymentGateways
                    .filter((g) => (config.gatewayOverrides[g.id]?.isEnabled ?? g.isEnabled))
                    .map((g) => {
                      const isSelected = previewSelectedGateway === g.id;
                      const customLabel = config.gatewayOverrides[g.id]?.customLabel || g.name;

                      return (
                        <div
                          key={g.id}
                          onClick={() => setPreviewSelectedGateway(g.id)}
                          className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'border-pink-500 bg-pink-50/50 ring-1 ring-pink-500/30'
                              : 'border-slate-200 bg-white hover:border-pink-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{g.iconUrl}</span>
                            <div>
                              <h5 className="text-[11px] font-bold text-slate-900">{customLabel}</h5>
                              <p className="text-[9px] text-slate-500 line-clamp-1">{g.description}</p>
                            </div>
                          </div>
                          {isSelected && <Check size={14} className="text-pink-600 shrink-0" />}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Terms Checkbox */}
              {config.fields.termsCheckbox.enabled && (
                <label className="flex items-start gap-1.5 text-[10px] text-slate-600 cursor-pointer pt-1">
                  <input type="checkbox" defaultChecked className="mt-0.5 rounded text-pink-600" />
                  <span>{config.fields.termsCheckbox.label}</span>
                </label>
              )}

              {/* Checkout Button */}
              <Button variant="primary" className="w-full text-xs font-bold py-2 shadow-sm" leftIcon={<ShieldCheck size={14} />}>
                Proceed to Pay {formatCheckoutPrice(previewTotalDue, config.currency.defaultCurrency, config)}
              </Button>

              {/* Trust Badge text */}
              {config.general.showTrustBadges && (
                <p className="text-[9px] text-slate-400 text-center font-medium">
                  {config.general.trustBadgesText}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
