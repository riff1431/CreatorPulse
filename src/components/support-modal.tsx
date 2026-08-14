'use client';

import React, { useState } from 'react';
import { Heart, DollarSign, Sparkles, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';

interface SupportModalProps {
  creatorName: string;
  creatorAvatar: string;
  creatorUsername: string;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  creatorName,
  creatorAvatar,
  creatorUsername,
  onClose
}) => {
  const [amount, setAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const selectedAmount = customAmount ? parseFloat(customAmount) || 0 : amount;
  const platformFee = Math.round(selectedAmount * 0.05 * 100) / 100;
  const creatorNet = Math.round((selectedAmount - platformFee) * 100) / 100;

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAmount <= 0) return;
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] max-w-md w-full p-6 space-y-5 relative border border-[#F3DCE8] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
          <div className="flex items-center gap-2">
            <Heart className="text-[#EC4899] fill-[#EC4899]" size={20} />
            <h3 className="text-lg font-extrabold text-[#18181B]">Send Support & Tip</h3>
          </div>
          <button onClick={onClose} className="text-[#71717A] hover:text-[#18181B] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FCE7F3] border border-[#FBCFE8] flex items-center justify-center text-[#EC4899] mx-auto animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-xl font-black text-[#18181B]">Thank You for Supporting!</h4>
            <p className="text-xs text-[#71717A] font-medium">
              Your support tip of <strong className="text-[#18181B] font-extrabold">${selectedAmount.toFixed(2)}</strong> was sent to @{creatorUsername}.
            </p>
            <Button variant="primary" size="sm" className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSendSupport} className="space-y-4 text-xs">
            <div className="flex items-center gap-3 bg-[#FFF9FC] p-3 rounded-2xl border border-[#F3DCE8]">
              <img src={creatorAvatar} alt={creatorName} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h4 className="font-bold text-[#18181B] text-sm">{creatorName}</h4>
                <span className="text-[#BE185D] font-bold">@{creatorUsername}</span>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-[#18181B] font-bold mb-1.5">Select Tip Amount</label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 25, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset);
                      setCustomAmount('');
                    }}
                    className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      amount === preset && !customAmount
                        ? 'gradient-btn text-white shadow-md shadow-[#EC4899]/20'
                        : 'bg-[#FFF9FC] text-[#71717A] border border-[#F3DCE8] hover:bg-[#FFF1F7] hover:text-[#18181B]'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-[#18181B] font-bold mb-1">Or Enter Custom Amount ($)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="e.g. 75"
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-[#18181B] font-bold mb-1">Encouraging Note (Optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Keep creating awesome masterclasses!"
                rows={2}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium resize-none"
              />
            </div>

            {/* Ledger breakdown */}
            <div className="bg-[#FFF9FC] p-3.5 rounded-2xl border border-[#F3DCE8] space-y-1.5 text-[11px] text-[#71717A] font-medium">
              <div className="flex justify-between">
                <span>Total Tip Amount:</span>
                <span className="text-[#18181B] font-bold">${selectedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Processing Fee (5%):</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-[#F3DCE8] pt-1 font-bold text-emerald-600">
                <span>Creator Net Earning:</span>
                <span>${creatorNet.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" leftIcon={<Heart size={14} className="fill-white" />}>
                Send ${selectedAmount.toFixed(2)} Support
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
