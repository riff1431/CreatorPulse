'use client';

import React, { useState, createContext, useContext, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, Sparkles, LogIn, UserPlus, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface RequireAuthContextType {
  requireAuth: (actionName?: string) => boolean;
  showLoginModal: (actionName?: string) => void;
  closeLoginModal: () => void;
}

const RequireAuthContext = createContext<RequireAuthContextType | undefined>(undefined);

export const RequireAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [actionTitle, setActionTitle] = useState('perform this action');

  const requireAuth = (actionName = 'perform this action'): boolean => {
    if (isAuthenticated) {
      return true;
    }
    setActionTitle(actionName);
    setIsOpen(true);
    return false;
  };

  const showLoginModal = (actionName = 'perform this action') => {
    setActionTitle(actionName);
    setIsOpen(true);
  };

  const closeLoginModal = () => {
    setIsOpen(false);
  };

  const redirectUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
  const signupUrl = `/auth/signup?redirect=${encodeURIComponent(pathname)}`;

  return (
    <RequireAuthContext.Provider value={{ requireAuth, showLoginModal, closeLoginModal }}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <Card className="relative max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)] rounded-3xl">
            {/* Close Button */}
            <button
              onClick={closeLoginModal}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X size={18} />
            </button>

            {/* Header Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-pink-500/20">
              <Lock size={26} />
            </div>

            {/* Heading */}
            <div className="text-center space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-pink-500 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                Authentication Required
              </span>
              <h3 className="text-xl font-black text-[var(--color-text-primary)]">
                Join CreatorPulse to {actionTitle}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-relaxed">
                Connect with digital creators, support exclusive memberships, send direct messages, and personalize your feed.
              </p>
            </div>

            {/* Platform Perks List */}
            <div className="bg-[var(--color-surface-secondary)] p-4 rounded-2xl border border-[var(--color-border)] space-y-2 text-xs font-semibold text-[var(--color-text-primary)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Unlock creator exclusive posts & videos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Participate in live community discussions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Bookmark and organize your saved content</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Link href={redirectUrl} onClick={closeLoginModal} className="block w-full">
                <Button variant="primary" size="md" className="w-full text-xs" leftIcon={<LogIn size={16} />}>
                  Sign In to Your Account
                </Button>
              </Link>

              <Link href={signupUrl} onClick={closeLoginModal} className="block w-full">
                <Button variant="outline" size="md" className="w-full text-xs" leftIcon={<UserPlus size={16} />}>
                  Create a Free Account
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </RequireAuthContext.Provider>
  );
};

export const useRequireAuth = () => {
  const context = useContext(RequireAuthContext);
  if (!context) {
    throw new Error('useRequireAuth must be used within a RequireAuthProvider');
  }
  return context;
};
