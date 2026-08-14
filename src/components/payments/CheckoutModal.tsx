'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, CreditCard, Sparkles, X, AlertTriangle, Wallet, ArrowRight, HelpCircle } from 'lucide-react';
import gsap from 'gsap';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

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
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const modalBoxRef = useRef<HTMLDivElement>(null);

  // Identify active payment plugins (category = Monetization, hooks registers 'payment_gateway_methods')
  const activeGateways = plugins.filter(
    (p) => p.isEnabled && p.hooks.includes('payment_gateway_methods')
  );

  // Set the default gateway on mount
  useEffect(() => {
    if (activeGateways.length > 0) {
      const defaultGateway = activeGateways.find((p) => p.settingsValues.isDefault === true);
      setSelectedGateway(defaultGateway ? defaultGateway.id : activeGateways[0].id);
    }
  }, [plugins]);

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

  const handlePayment = async () => {
    if (!selectedGateway) {
      setErrorMsg('Please select a payment gateway.');
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
      userId: 'user-member', // Hardcoded active member role user ID
      creatorId,
      amount,
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
          settings: targetGateway.settingsValues
        })
      });

      const result = await response.json();

      if (result.error) {
        setErrorMsg(result.error);
        setIsProcessing(false);
        return;
      }

      if (result.success) {
        // If simulated redirect URL is present, send user to simulated bank portal
        if (result.gatewayReference && result.gatewayReference.startsWith('/')) {
          console.log('[CheckoutModal] Redirecting to sandbox simulation:', result.gatewayReference);
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
        className="bg-white rounded-[28px] max-w-md w-full p-6 space-y-5 relative border border-[#F3DCE8] shadow-2xl animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="text-[#EC4899]" size={20} />
            <h3 className="text-lg font-extrabold text-[#18181B]">
              {type === 'funding' ? 'Top-Up Wallet' : 'Secure Checkout'}
            </h3>
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
        <div className="bg-[#FFF9FC] p-4 rounded-2xl border border-[#F3DCE8] space-y-2">
          {type !== 'funding' && creatorName && (
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

          <div className="flex justify-between border-t border-[#F3DCE8] pt-2 mt-1">
            <span className="text-[#18181B] font-extrabold text-sm">Amount Due:</span>
            <span className="text-emerald-600 font-black text-base">${amount.toFixed(2)} {currency}</span>
          </div>
        </div>

        {/* Payment Gateway Provider Selector */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-[#18181B]">Choose Payment Method:</label>
          
          {activeGateways.length === 0 ? (
            <div className="p-4 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <AlertTriangle className="text-amber-500 mx-auto" size={20} />
              <p className="text-xs font-bold text-slate-700">No Payment Providers Active</p>
              <p className="text-[10px] text-slate-500">Contact admin to activate Stripe or PayPal plugins.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {activeGateways.map((gateway) => {
                const isSelected = selectedGateway === gateway.id;
                const isSandbox = gateway.settingsValues.mode === 'sandbox';
                const isDefault = gateway.settingsValues.isDefault === true;

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
                          <h4 className="text-xs font-bold text-[#18181B]">{gateway.name}</h4>
                          {isDefault && (
                            <span className="text-[8px] bg-pink-100 text-pink-700 px-1 rounded font-bold font-mono">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-[#71717A] max-w-[220px] font-medium leading-tight">
                          {gateway.description}
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
                        {String(gateway.settingsValues.supportedCurrencies || 'USD')}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#F3DCE8]">
          <Button
            variant="primary"
            className="w-full"
            disabled={isProcessing || activeGateways.length === 0}
            onClick={handlePayment}
            leftIcon={<ShieldCheck size={14} />}
          >
            {isProcessing ? 'Connecting Secure Gateway...' : `Proceed to Payment`}
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

        {/* Security badge overlay */}
        <p className="text-[10px] text-[#A1A1AA] text-center font-medium flex items-center justify-center gap-1">
          🔒 256-bit SSL encrypted backend credentials. Key secrets held server-side.
        </p>
      </div>
    </div>
  );
};
