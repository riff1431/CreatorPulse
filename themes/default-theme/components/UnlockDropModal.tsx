'use client';

import React, { useState } from 'react';
import { 
  X, Lock, Unlock, Sparkles, CheckCircle2, 
  Wallet, ShieldCheck, Download, Eye
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface UnlockDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  postTitle?: string;
  creatorName?: string;
  creatorAvatar?: string;
  price?: number;
  previewUrl?: string;
  onUnlocked?: () => void;
}

export function UnlockDropModal({
  isOpen,
  onClose,
  postTitle = 'Exclusive Masterclass 4K Project Files & PSD Bundle',
  creatorName = 'Sarah Jenkins',
  creatorAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  price = 9.99,
  previewUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
  onUnlocked
}: UnlockDropModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const walletBalance = 240.50;

  const handleUnlock = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      if (onUnlocked) onUnlocked();
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#150D1E] rounded-3xl border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Blurred Locked Media Teaser Header */}
        <div className="relative h-44 w-full overflow-hidden bg-black flex items-center justify-center">
          <img 
            src={previewUrl} 
            alt="Drop Preview" 
            className="w-full h-full object-cover blur-md scale-105 opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-center p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EC4899]/30 border border-[#EC4899]/60 backdrop-blur-md flex items-center justify-center text-white mb-2 shadow-lg">
              <Lock size={22} className="text-[#F472B6]" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#FCE7F3] px-3 py-1 rounded-full bg-black/40 border border-white/10">
              VIP Paywalled Drop
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {isSuccess ? (
            <div className="py-6 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-lg font-black text-[#18181B] dark:text-[#FDF2F8]">
                Drop Unlocked!
              </h4>
              <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">
                The media bundle has been added to your unlocked vault.
              </p>
            </div>
          ) : (
            <>
              {/* Creator & Title */}
              <div className="flex items-start gap-3">
                <Avatar src={creatorAvatar} alt={creatorName} size="md" isVerified />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8] line-clamp-2">
                    {postTitle}
                  </h4>
                  <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">
                    by <span className="font-bold text-[#18181B] dark:text-[#FDF2F8]">{creatorName}</span>
                  </p>
                </div>
              </div>

              {/* Price & Wallet Status Card */}
              <div className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#A1A1AA]">
                    Unlock Price
                  </span>
                  <div className="text-xl font-black text-[#EC4899]">
                    ${price.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#71717A] dark:text-[#D4B8D0]">
                    Your Wallet Balance
                  </span>
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                    <Wallet size={13} />
                    <span>${walletBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Perks List */}
              <div className="text-xs text-[#71717A] dark:text-[#D4B8D0] space-y-1.5 pl-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-[#EC4899] shrink-0" />
                  <span>Permanent access in your personal Unlocked Vault</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download size={13} className="text-[#EC4899] shrink-0" />
                  <span>Full-resolution 4K video and raw download files</span>
                </div>
              </div>

              {/* Unlock Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleUnlock}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#FB7185] hover:opacity-95 text-white font-black text-sm shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Unlock size={16} />
                      <span>1-Click Unlock for ${price.toFixed(2)}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#A1A1AA] mt-3">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>Instant Platform Deduct & Download Rights</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
