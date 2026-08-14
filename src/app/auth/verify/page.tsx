'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#FFF9FC] flex flex-col items-center justify-center p-4 selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#FCE7F3] border border-[#FBCFE8] flex items-center justify-center text-[#EC4899] mx-auto shadow-sm">
          <Mail size={30} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#18181B]">Check Your Email</h2>
          <p className="text-xs text-[#71717A] leading-relaxed font-medium">
            We sent a Supabase authentication link to your email inbox. Please click the confirmation link to activate your CreatorPulse account.
          </p>
        </div>

        <div className="bg-[#FFF9FC] p-3 rounded-2xl border border-[#F3DCE8] text-xs text-[#18181B] flex items-center gap-2.5 font-medium">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span>Supabase Auth token active for 24 hours</span>
        </div>

        <div className="space-y-3 pt-2">
          <Link href="/feed">
            <Button variant="primary" size="md" className="w-full" rightIcon={<ArrowRight size={14} />}>
              Proceed to Community Feed (Demo Mode)
            </Button>
          </Link>
          <Link href="/auth/login" className="block text-xs text-[#71717A] hover:text-[#EC4899] font-medium transition-colors">
            Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
