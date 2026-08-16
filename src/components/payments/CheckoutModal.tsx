'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, CreditCard, Sparkles, X, AlertTriangle,
  Wallet, ArrowRight, Tag, CheckCircle2, RefreshCw,
  Globe, Lock, FileText, Check
} from 'lucide-react';
import gsap from 'gsap';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import {
  CheckoutConfiguration,
  getCheckoutConfig,
  formatCheckoutPrice
} from '@/lib/payments/checkout-config-store';

interface CheckoutModalProps {
  type: 'checkout' | 'subscription' | 'funding';
  amount: number;
  currency?: string;
  description: string;
  creatorId?: string;
  creatorName?: string;
  creatorAvatar?: string;
  creatorUsername?: string;
  // Subscription specific
  planId?: string;
  planName?: string;
  durationMonths?: number;
  autoRenew?: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  type,
  amount,
  currency = 'USD',
  description,
  creatorId = 'user-creator-1',
  creatorName = 'Sarah Jenkins',
  creatorAvatar,
  creatorUsername = 'sarahdesign',
  planId = '',
  planName = '',
  durationMonths = 1,
  autoRenew = true,
  onClose,
  onSuccess
}) => {
  const { plugins } = usePlugins();
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfiguration>(getCheckoutConfig());
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const modalBoxRef = useRef<HTMLDivElement>(null);

  // Dynamic Form Field Values
  const [formData, setFormData] = useState({
    fullName: '',
    billingCountry: checkoutConfig.fields.billingCountry.defaultValue || 'US',
    phone: '',
    taxId: '',
    termsAccepted: true,
    orderNotes: ''
  });

  // Coupon & Promotion state
  const [couponInput, setCouponInput] = useState<string>('');
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [couponResult, setCouponResult] = useState<{
    valid: boolean;
    couponCode?: string;
    discountAmount: number;
    finalAmount: number;
    isAutoApplied?: boolean;
    message: string;
  } | null>(null);

  // Sync with live checkout configuration
  useEffect(() => {
    const handleConfigUpdate = (e: any) => {
      if (e.detail) setCheckoutConfig(e.detail);
      else setCheckoutConfig(getCheckoutConfig());
    };
    window.addEventListener('creatorpulse_checkout_config_updated', handleConfigUpdate);
    return () => window.removeEventListener('creatorpulse_checkout_config_updated', handleConfigUpdate);
  }, []);

  // Identify and prioritize active payment plugins
  const activeGateways = plugins
    .filter((p) => {
      const override = checkoutConfig.gatewayOverrides[p.id];
      const isEnabled = override?.isEnabled ?? p.isEnabled;
      return isEnabled && (p.hooks.includes('payment_gateway_methods') || p.category === 'Monetization');
    })
    .sort((a, b) => {
      const orderA = checkoutConfig.gatewayOverrides[a.id]?.displayOrder ?? (a.settingsValues?.displayOrder as number) ?? 99;
      const orderB = checkoutConfig.gatewayOverrides[b.id]?.displayOrder ?? (b.settingsValues?.displayOrder as number) ?? 99;
      return orderA - orderB;
    });

  // Set default gateway on mount
  useEffect(() => {
    if (activeGateways.length > 0) {
      const overrideDefault = activeGateways.find((g) => checkoutConfig.gatewayOverrides[g.id]?.isDefault === true);
      const pluginDefault = activeGateways.find((p) => p.settingsValues.isDefault === true);
      const chosen = overrideDefault || pluginDefault || activeGateways[0];
      setSelectedGateway(chosen.id);
    }
  }, [plugins, checkoutConfig]);

  // Auto-apply promo codes if enabled
  useEffect(() => {
    if (type !== 'funding' && amount > 0 && checkoutConfig.coupons.allowAutoApplyCoupons) {
      checkAutoApplyPromotion();
    }
  }, [amount, creatorId, planId, checkoutConfig.coupons.allowAutoApplyCoupons]);

  const checkAutoApplyPromotion = async () => {
    try {
      const response = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          userId: 'user-member',
          creatorId,
          planId,
          checkAutoApply: true,
        }),
      });

      const res = await response.json();
      if (res.valid && res.coupon) {
        setCouponResult({
          valid: true,
          couponCode: res.coupon.code,
          discountAmount: res.discountAmount,
          finalAmount: res.finalAmount,
          isAutoApplied: true,
          message: res.message,
        });
        setCouponInput(res.coupon.code);
      }
    } catch (e) {
      console.warn('[CheckoutModal] Auto-apply promo check error:', e);
    }
  };

  // GSAP Entry Animation
  useEffect(() => {
    if (modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)', overwrite: 'auto' }
      );
    }
  }, []);

  const handleApplyCoupon = async (codeToValidate?: string) => {
    const code = codeToValidate || couponInput.trim();
    if (!code) {
      setCouponResult({
        valid: false,
        discountAmount: 0,
        finalAmount: amount,
        message: 'Please enter a coupon code.',
      });
      return;
    }

    setCouponLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          amount,
          userId: 'user-member',
          creatorId,
          planId,
        }),
      });

      const res = await response.json();
      if (res.valid) {
        setCouponResult({
          valid: true,
          couponCode: res.coupon.code,
          discountAmount: res.discountAmount,
          finalAmount: res.finalAmount,
          isAutoApplied: false,
          message: res.message,
        });
        setCouponInput(res.coupon.code);
      } else {
        setCouponResult({
          valid: false,
          discountAmount: 0,
          finalAmount: amount,
          message: res.message || 'Invalid or expired promo code.',
        });
      }
    } catch (e: any) {
      setCouponResult({
        valid: false,
        discountAmount: 0,
        finalAmount: amount,
        message: `Failed to validate code: ${e.message}`,
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponResult(null);
    setCouponInput('');
  };

  // Dynamic Price Calculations (Discount + Regional Taxes + Surcharge Fees)
  const baseDiscountedAmount = couponResult?.valid ? couponResult.finalAmount : amount;
  const currentDiscountAmount = couponResult?.valid ? couponResult.discountAmount : 0;

  // Regional Tax Calculation
  const countryTaxRates: Record<string, number> = {
    US: 8.0,
    BD: 15.0,
    EU: 20.0,
    GB: 20.0,
    CA: 13.0,
    AU: 10.0
  };
  const effectiveTaxRate = checkoutConfig.taxesAndFees.enableRegionalTax
    ? countryTaxRates[formData.billingCountry] ?? checkoutConfig.taxesAndFees.defaultTaxPercentage
    : 0.0;
  const calculatedTaxAmount = (baseDiscountedAmount * effectiveTaxRate) / 100;

  // Surcharge / Processing Pass-Through Fee
  const calculatedSurcharge = checkoutConfig.taxesAndFees.enableProcessingFeePassThrough
    ? checkoutConfig.taxesAndFees.fixedProcessingFee +
      (baseDiscountedAmount * checkoutConfig.taxesAndFees.percentageProcessingFee) / 100
    : 0.0;

  const currentFinalAmount =
    baseDiscountedAmount +
    (checkoutConfig.taxesAndFees.isTaxInclusive ? 0 : calculatedTaxAmount) +
    calculatedSurcharge;

  const handlePayment = async () => {
    if (!selectedGateway) {
      setErrorMsg('Please select a payment gateway.');
      return;
    }

    // Form Validations
    if (checkoutConfig.fields.fullName.enabled && checkoutConfig.fields.fullName.required && !formData.fullName.trim()) {
      setErrorMsg('Please enter your Full Name.');
      return;
    }
    if (checkoutConfig.fields.phone.enabled && checkoutConfig.fields.phone.required && !formData.phone.trim()) {
      setErrorMsg('Please enter your Phone Number.');
      return;
    }
    if (checkoutConfig.fields.termsCheckbox.enabled && checkoutConfig.fields.termsCheckbox.required && !formData.termsAccepted) {
      setErrorMsg('You must agree to the Terms of Service to continue.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    const targetGateway = activeGateways.find((g) => g.id === selectedGateway);
    if (!targetGateway) {
      setErrorMsg('Selected payment gateway is invalid.');
      setIsProcessing(false);
      return;
    }

    // Generate Idempotency Key
    const idempotencyKey = `idem-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    // Core parameters mapping
    const params = {
      idempotencyKey,
      userId: 'user-member',
      creatorId,
      customerName: formData.fullName,
      billingCountry: formData.billingCountry,
      phone: formData.phone,
      taxId: formData.taxId,
      orderNotes: formData.orderNotes,
      amount: currentFinalAmount,
      originalAmount: amount,
      discountAmount: currentDiscountAmount,
      taxAmount: calculatedTaxAmount,
      taxRate: effectiveTaxRate,
      surchargeFee: calculatedSurcharge,
      appliedCouponCode: couponResult?.valid ? couponResult.couponCode : undefined,
      currency,
      description,
      isSandbox: targetGateway.settingsValues.mode === 'sandbox',
      planId,
      planName,
      durationMonths,
      autoRenew
    };

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gatewayId: selectedGateway,
          type: type === 'funding' ? 'funding' : type === 'subscription' ? 'subscription' : 'checkout',
          params,
          settings: targetGateway.settingsValues,
          appliedCouponCode: couponResult?.valid ? couponResult.couponCode : undefined,
        })
      });

      const result = await response.json();

      if (result.error) {
        setErrorMsg(result.error);
        setIsProcessing(false);
        return;
      }

      if (result.success) {
        // If simulated redirect URL is present, send user to payment portal
        if (result.gatewayReference && result.gatewayReference.startsWith('/')) {
          console.log('[CheckoutModal] Redirecting to checkout portal:', result.gatewayReference);
          window.location.href = result.gatewayReference;
        } else {
          // Direct resolution (e.g. Mock Sandbox completions)
          onSuccess(result);
        }
      } else {
        setErrorMsg(result.message || 'Payment transaction failed.');
        setIsProcessing(false);
      }
    } catch (e: any) {
      setErrorMsg(`Network connection failed: ${e.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={modalBoxRef}
        className="bg-white rounded-[28px] max-w-md w-full p-6 space-y-4 relative border border-[#F3DCE8] shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="text-[#EC4899]" size={20} />
            <div>
              <h3 className="text-lg font-extrabold text-[#18181B] leading-tight">
                {type === 'funding' ? 'Top-Up Wallet' : checkoutConfig.general.checkoutTitle}
              </h3>
              {checkoutConfig.general.checkoutSubtitle && (
                <p className="text-[10px] text-slate-500 font-medium">{checkoutConfig.general.checkoutSubtitle}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} disabled={isProcessing} className="text-[#71717A] hover:text-[#18181B] cursor-pointer disabled:opacity-50">
            <X size={18} />
          </button>
        </div>

        {/* Errors */}
        {errorMsg && (
          <div className="p-3 bg-[#FFE4E6] border border-[#FECDD3] rounded-2xl text-xs text-[#BE123C] flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Transaction Summary Box */}
        {checkoutConfig.general.showOrderSummaryBreakdown && (
          <div className="bg-[#FFF9FC] p-4 rounded-2xl border border-[#F3DCE8] space-y-2">
            {checkoutConfig.general.showCreatorInfo && type !== 'funding' && creatorName && (
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#F3DCE8]/60">
                {creatorAvatar && (
                  <img src={creatorAvatar} alt={creatorName} className="w-6 h-6 rounded-full object-cover" />
                )}
                <span className="text-xs text-[#71717A] font-bold">
                  Paying Creator: <strong className="text-[#18181B]">@{creatorUsername}</strong>
                </span>
              </div>
            )}
            
            <div className="flex justify-between text-xs">
              <span className="text-[#71717A] font-semibold">Payment For:</span>
              <span className="font-bold text-[#18181B]">{description}</span>
            </div>

            {type === 'subscription' && (
              <div className="flex justify-between text-xs">
                <span className="text-[#71717A] font-semibold">Plan Term:</span>
                <span className="font-bold text-[#18181B]">{durationMonths} Month(s)</span>
              </div>
            )}

            <div className="flex justify-between text-xs pt-1">
              <span className="text-[#71717A] font-semibold">Subtotal Price:</span>
              <span className="font-bold text-[#18181B]">
                {formatCheckoutPrice(amount, currency, checkoutConfig)}
              </span>
            </div>

            {/* Discount Line if Coupon Applied */}
            {couponResult?.valid && (
              <div className="flex justify-between text-xs text-emerald-600 font-bold bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                <span className="flex items-center gap-1.5">
                  <Tag size={12} className="shrink-0 text-emerald-600" />
                  <span>Promo ({couponResult.couponCode})</span>
                  {couponResult.isAutoApplied && (
                    <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1 rounded font-extrabold uppercase">Auto</span>
                  )}
                </span>
                <span>-{formatCheckoutPrice(currentDiscountAmount, currency, checkoutConfig)}</span>
              </div>
            )}

            {/* Regional Taxes */}
            {checkoutConfig.taxesAndFees.enableRegionalTax && calculatedTaxAmount > 0 && (
              <div className="flex justify-between text-xs text-slate-600">
                <span>{checkoutConfig.taxesAndFees.taxLabel} ({effectiveTaxRate}%):</span>
                <span className="font-bold text-slate-800">
                  {formatCheckoutPrice(calculatedTaxAmount, currency, checkoutConfig)}
                </span>
              </div>
            )}

            {/* Processing Fee Surcharges */}
            {checkoutConfig.taxesAndFees.enableProcessingFeePassThrough && calculatedSurcharge > 0 && (
              <div className="flex justify-between text-xs text-slate-600">
                <span>{checkoutConfig.taxesAndFees.platformFeeLabel}:</span>
                <span className="font-bold text-slate-800">
                  {formatCheckoutPrice(calculatedSurcharge, currency, checkoutConfig)}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t border-[#F3DCE8] pt-2 mt-1">
              <span className="text-[#18181B] font-extrabold text-sm">Total Amount Due:</span>
              <div className="text-right">
                {couponResult?.valid && (
                  <span className="text-[11px] text-slate-400 line-through mr-1.5">
                    {formatCheckoutPrice(amount, currency, checkoutConfig)}
                  </span>
                )}
                <span className="text-emerald-600 font-black text-base">
                  {formatCheckoutPrice(currentFinalAmount, currency, checkoutConfig)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Custom Customer Form Fields */}
        <div className="space-y-2.5">
          {checkoutConfig.fields.fullName.enabled && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {checkoutConfig.fields.fullName.label} {checkoutConfig.fields.fullName.required && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder={checkoutConfig.fields.fullName.placeholder || 'John Doe'}
                disabled={isProcessing}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
            </div>
          )}

          {checkoutConfig.fields.billingCountry.enabled && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {checkoutConfig.fields.billingCountry.label} {checkoutConfig.fields.billingCountry.required && <span className="text-rose-500">*</span>}
              </label>
              <select
                value={formData.billingCountry}
                onChange={(e) => setFormData({ ...formData, billingCountry: e.target.value })}
                disabled={isProcessing}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              >
                <option value="US">United States (8% Tax)</option>
                <option value="BD">Bangladesh (15% VAT - bKash / Nagad / Rocket)</option>
                <option value="EU">European Union (20% VAT)</option>
                <option value="GB">United Kingdom (20% VAT)</option>
                <option value="CA">Canada (13% GST/HST)</option>
                <option value="AU">Australia (10% GST)</option>
              </select>
            </div>
          )}

          {checkoutConfig.fields.phone.enabled && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {checkoutConfig.fields.phone.label} {checkoutConfig.fields.phone.required && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={checkoutConfig.fields.phone.placeholder || '+1 (555) 000-0000'}
                disabled={isProcessing}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
            </div>
          )}

          {checkoutConfig.fields.taxId.enabled && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {checkoutConfig.fields.taxId.label}
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                placeholder={checkoutConfig.fields.taxId.placeholder || 'VAT-12345678'}
                disabled={isProcessing}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
            </div>
          )}
        </div>

        {/* Dynamic Coupon & Promo Code Section */}
        {checkoutConfig.coupons.allowCoupons && type !== 'funding' && (
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="block text-xs font-bold text-[#18181B] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag size={13} className="text-indigo-600" />
                <span>Have a Promo Code or Coupon?</span>
              </span>
              {couponResult?.valid && (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                >
                  Remove Code
                </button>
              )}
            </label>

            {couponResult?.valid ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">
                      Code "{couponResult.couponCode}" Applied!
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium">{couponResult.message}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-700 shrink-0 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200">
                  -{formatCheckoutPrice(currentDiscountAmount, currency, checkoutConfig)}
                </span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder={checkoutConfig.coupons.couponInputPlaceholder || 'ENTER PROMO CODE'}
                    disabled={couponLoading || isProcessing}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 uppercase placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyCoupon()}
                    disabled={couponLoading || isProcessing || !couponInput.trim()}
                    className="shrink-0"
                  >
                    {couponLoading ? (
                      <RefreshCw size={13} className="animate-spin text-indigo-600" />
                    ) : (
                      'Apply Code'
                    )}
                  </Button>
                </div>
                {couponResult && !couponResult.valid && (
                  <p className="text-[11px] text-rose-600 font-semibold px-1">
                    ⚠️ {couponResult.message}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Payment Gateway Provider Selector */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-[#18181B]">Choose Payment Method:</label>
          
          {activeGateways.length === 0 ? (
            <div className="p-4 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <AlertTriangle className="text-amber-500 mx-auto" size={20} />
              <p className="text-xs font-bold text-slate-700">No Payment Providers Active</p>
              <p className="text-[10px] text-slate-500">Contact admin to activate PipraPay, Stripe, or PayPal plugins.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {activeGateways.map((gateway) => {
                const isSelected = selectedGateway === gateway.id;
                const isSandbox = gateway.settingsValues.mode === 'sandbox';
                const override = checkoutConfig.gatewayOverrides[gateway.id] || {};
                const customLabel = override.customLabel || gateway.name;
                const isDefault = override.isDefault ?? gateway.settingsValues.isDefault === true;
                const isPipraPay = gateway.id === 'plugin-piprapay' || gateway.slug === 'piprapay';

                return (
                  <Card
                    key={gateway.id}
                    onClick={() => !isProcessing && setSelectedGateway(gateway.id)}
                    className={`p-3 flex items-center justify-between cursor-pointer border transition-all ${
                      isSelected
                        ? 'border-[#EC4899] bg-[#FFF1F7]/40 ring-1 ring-[#EC4899]/30'
                        : 'border-[#F3DCE8] bg-white hover:border-[#F472B6]/40'
                    } ${isProcessing ? 'opacity-65 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl select-none">{gateway.iconUrl}</span>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-[#18181B]">{customLabel}</h4>
                          {isDefault && (
                            <span className="text-[8px] bg-pink-100 text-pink-700 px-1 rounded font-bold font-mono">
                              Default
                            </span>
                          )}
                          {isPipraPay && (
                            <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">
                              bKash / Nagad
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-[#71717A] max-w-[220px] font-medium leading-tight">
                          {override.customDescription || gateway.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {isSandbox && (
                        <span className="text-[8px] border border-amber-300 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                          Sandbox
                        </span>
                      )}
                      <span className="text-[9px] text-[#A1A1AA] font-semibold uppercase">
                        {isPipraPay ? 'BDT • ৳' : String(gateway.settingsValues.supportedCurrencies || 'USD')}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Terms Checkbox */}
        {checkoutConfig.fields.termsCheckbox.enabled && (
          <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
              className="mt-0.5 rounded text-pink-600 focus:ring-pink-500"
            />
            <span className="text-[11px] leading-tight">
              {checkoutConfig.fields.termsCheckbox.label}{' '}
              {checkoutConfig.fields.termsCheckbox.termsUrl && (
                <a href={checkoutConfig.fields.termsCheckbox.termsUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                  Read terms
                </a>
              )}
            </span>
          </label>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#F3DCE8]">
          <Button
            variant="primary"
            className="w-full"
            disabled={isProcessing || activeGateways.length === 0}
            onClick={handlePayment}
            leftIcon={<ShieldCheck size={14} />}
          >
            {isProcessing
              ? 'Connecting Secure Gateway...'
              : `Proceed to Pay ${formatCheckoutPrice(currentFinalAmount, currency, checkoutConfig)}`}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isProcessing}
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>

        {/* Security Trust Badges */}
        {checkoutConfig.general.showTrustBadges && (
          <p className="text-[10px] text-[#A1A1AA] text-center font-medium flex items-center justify-center gap-1">
            {checkoutConfig.general.trustBadgesText}
          </p>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
