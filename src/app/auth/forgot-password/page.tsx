'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/auth/auth-context';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    const result = await forgotPassword(email);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to send password reset email.');
      setIsLoading(false);
      return;
    }

    setSubmitted(true);
    setIsLoading(false);
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
          <h1 className="text-2xl font-black text-[#18181B]">Reset Your Password</h1>
          <p className="text-xs text-[#71717A] font-medium">We will send a Supabase password reset link to your email</p>
        </div>

        <Card className="p-6 space-y-5">
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
              <h3 className="font-extrabold text-[#18181B]">Reset Email Sent</h3>
              <p className="text-xs text-[#71717A] font-medium">Check {email} for the reset password link.</p>
              <Link href="/auth/login">
                <Button variant="primary" size="sm" className="w-full">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-[#FFE4E6] border border-[#FECDD3] rounded-xl text-xs text-[#BE123C] flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-[#18181B] font-bold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
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
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="text-center text-xs text-[#71717A] border-t border-[#F3DCE8] pt-3 font-medium">
            Remember password?{' '}
            <Link href="/auth/login" className="text-[#BE185D] font-extrabold hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
