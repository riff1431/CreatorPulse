'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/auth/auth-context';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    const result = await resetPassword(password);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to update password.');
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);

    setTimeout(() => {
      router.push('/auth/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FFF9FC] flex flex-col items-center justify-center p-4 selection:bg-[#FCE7F3] selection:text-[#DB2777] relative">
      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F472B6] flex items-center justify-center shadow-lg shadow-[#EC4899]/25 group-hover:scale-105 transition-transform">
              <Sparkles className="text-white" size={24} />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-[#18181B]">Create New Password</h1>
          <p className="text-xs text-[#71717A] font-medium">Set a new secure password for your CreatorPulse account</p>
        </div>

        <Card className="p-6 space-y-5">
          {isSuccess ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
              <h3 className="font-extrabold text-[#18181B]">Password Updated!</h3>
              <p className="text-xs text-[#71717A] font-medium">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-[#FFE4E6] border border-[#FECDD3] rounded-xl text-xs text-[#BE123C] flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-[#18181B] font-bold mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl pl-9 pr-3 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] focus:bg-white font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#18181B] font-bold mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl pl-9 pr-3 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] focus:bg-white font-medium"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight size={14} />}
              >
                Update Password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
