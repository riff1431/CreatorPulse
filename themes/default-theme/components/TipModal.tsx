import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Heart, Sparkles, DollarSign, Wallet, 
  CreditCard, CheckCircle2, ShieldCheck, Gift, Flame
} from 'lucide-react';
import { Avatar } from './Avatar';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName?: string;
  creatorHandle?: string;
  creatorAvatar?: string;
  onSuccess?: (amount: number, message: string) => void;
}

const PRESET_AMOUNTS = [2, 5, 10, 20, 50, 100];

export function TipModal({
  isOpen,
  onClose,
  creatorName = 'Sarah Jenkins',
  creatorHandle = 'sarahdesign',
  creatorAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  onSuccess
}: TipModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  const walletBalance = 240.50;

  const handleSendTip = () => {
    if (currentAmount <= 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      if (onSuccess) onSuccess(currentAmount, message);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setMessage('');
        setCustomAmount('');
      }, 1600);
    }, 900);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-white dark:bg-[#150D1E] rounded-t-[32px] sm:rounded-3xl border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden w-10 h-1.5 bg-[#E4E4E7] dark:bg-[#3A2A4C] rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        {/* Top Header Background */}
        <div className="relative p-5 sm:p-6 pb-4 bg-gradient-to-br from-[#FFF1F7] via-[#FCE7F3] to-[#FFF1F7] dark:from-[#24152F] dark:via-[#1C1026] dark:to-[#24152F] border-b border-[#FBCFE8]/60 dark:border-[#4C1D3B]/60 shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <Avatar src={creatorAvatar} alt={creatorName} size="lg" isVerified />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-[#18181B] dark:text-[#FDF2F8]">
                  Send Tip to {creatorName}
                </h3>
                <Sparkles size={14} className="text-[#EC4899]" />
              </div>
              <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] font-semibold">
                @{creatorHandle} • Direct Creator Support
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-950/60 text-[#EC4899] flex items-center justify-center mx-auto shadow-inner">
                <Heart size={32} className="fill-[#EC4899] animate-bounce" />
              </div>
              <h4 className="text-xl font-black text-[#18181B] dark:text-[#FDF2F8]">
                Tip Sent Successfully!
              </h4>
              <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">
                You sent <span className="font-bold text-[#EC4899]">${currentAmount.toFixed(2)}</span> to {creatorName}.
              </p>
            </div>
          ) : (
            <>
              {/* Preset Amounts */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-[#71717A] dark:text-[#D4B8D0] block mb-2.5">
                  Select Amount (USD)
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {PRESET_AMOUNTS.map((amt) => {
                    const isSelected = selectedAmount === amt && !customAmount;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`py-2.5 rounded-2xl text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-[#EC4899] text-white shadow-md shadow-pink-500/25 scale-[1.02]'
                            : 'bg-[#FFF9FC] dark:bg-[#22152E] text-[#18181B] dark:text-[#FDF2F8] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#EC4899]/50'
                        }`}
                      >
                        <span>${amt}</span>
                        {amt >= 50 && <Flame size={13} className={isSelected ? 'text-amber-200' : 'text-amber-500'} />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Input */}
                <div className="mt-2.5 relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#71717A]">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="Custom amount..."
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(0);
                    }}
                    className="w-full pl-8 pr-4 py-2 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899]"
                    min="1"
                    step="1"
                  />
                </div>
              </div>

              {/* Private Cheer / Dedication Message */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-[#71717A] dark:text-[#D4B8D0] block mb-2">
                  Cheer Message (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Say something nice or request a shoutout..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] text-xs text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:border-[#EC4899] resize-none"
                  maxLength={160}
                />
                <div className="flex justify-between items-center text-[10px] text-[#A1A1AA] mt-1">
                  <span>Visible to creator & in live tip feed</span>
                  <span>{message.length}/160</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-[#71717A] dark:text-[#D4B8D0] block">
                  Payment Source
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentMethod === 'wallet'
                        ? 'bg-[#FFF1F7] dark:bg-[#2D162B] border-[#EC4899] text-[#18181B] dark:text-white shadow-2xs'
                        : 'bg-[#FFF9FC] dark:bg-[#22152E] border-[#F3DCE8] dark:border-[#3A2A4C] text-[#71717A]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Wallet size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold">Wallet</span>
                    </div>
                    <p className="text-[10px] text-[#71717A] dark:text-[#D4B8D0] mt-1 font-semibold">
                      ${walletBalance.toFixed(2)} Available
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-[#FFF1F7] dark:bg-[#2D162B] border-[#EC4899] text-[#18181B] dark:text-white shadow-2xs'
                        : 'bg-[#FFF9FC] dark:bg-[#22152E] border-[#F3DCE8] dark:border-[#3A2A4C] text-[#71717A]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-[#EC4899]" />
                      <span className="text-xs font-bold">Card •••• 4242</span>
                    </div>
                    <p className="text-[10px] text-[#71717A] dark:text-[#D4B8D0] mt-1 font-semibold">
                      Visa Debit
                    </p>
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing || currentAmount <= 0}
                  onClick={handleSendTip}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#FB7185] hover:opacity-95 text-white font-black text-sm shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Gift size={16} />
                      <span>Send ${currentAmount.toFixed(2)} Tip</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#A1A1AA] mt-3">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>Secure 256-Bit Platform Transaction</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

