'use client';

import React, { useState } from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    setIsSigningOut(true);
    await logout();
    setIsSigningOut(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <Card className="relative max-w-sm w-full p-6 text-center space-y-5 shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)] rounded-3xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSigningOut}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
          <LogOut size={26} />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-[var(--color-text-primary)]">
            Confirm Sign Out
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-relaxed">
            Are you sure you want to sign out as <span className="font-bold text-[var(--color-text-primary)]">{user?.fullName || 'Active User'}</span>?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSigningOut}
            className="flex-1 text-xs"
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirmLogout}
            disabled={isSigningOut}
            className="flex-1 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            leftIcon={isSigningOut ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogOut size={14} />}
          >
            {isSigningOut ? 'Signing Out...' : 'Yes, Sign Out'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
