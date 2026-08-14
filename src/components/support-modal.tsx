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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-6 space-y-5 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Heart className="text-rose-500 fill-rose-500" size={20} />
            <h3 className="text-lg font-bold text-slate-100">Send Support & Tip</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-xl font-black text-white">Thank You for Supporting!</h4>
            <p className="text-xs text-slate-300">
              Your support tip of <strong>${selectedAmount.toFixed(2)}</strong> was sent to @{creatorUsername}.
            </p>
            <Button variant="primary" size="sm" className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSendSupport} className="space-y-4 text-xs">
            <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <img src={creatorAvatar} alt={creatorName} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h4 className="font-bold text-slate-100 text-sm">{creatorName}</h4>
                <span className="text-cyan-400">@{creatorUsername}</span>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Select Tip Amount</label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 25, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset);
                      setCustomAmount('');
                    }}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      amount === preset && !customAmount
                        ? 'gradient-btn text-white shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-cyan-500/40'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Or Enter Custom Amount ($)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="e.g. 75"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Encouraging Note (Optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Keep creating awesome masterclasses!"
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Ledger breakdown */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Total Tip Amount:</span>
                <span className="text-slate-200 font-bold">${selectedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Processing Fee (5%):</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1 font-bold text-cyan-400">
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
