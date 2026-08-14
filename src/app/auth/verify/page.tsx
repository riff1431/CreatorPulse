'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-white">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
          <Mail size={32} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Check Your Email</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            We sent a Supabase authentication link to your email inbox. Please click the confirmation link to activate your CreatorPulse account.
          </p>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <span>Supabase Auth token active for 24 hours</span>
        </div>

        <div className="space-y-3 pt-2">
          <Link href="/feed">
            <Button variant="primary" size="md" className="w-full" rightIcon={<ArrowRight size={14} />}>
              Proceed to Community Feed (Demo Mode)
            </Button>
          </Link>
          <Link href="/auth/login" className="block text-xs text-slate-400 hover:text-cyan-400">
            Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
