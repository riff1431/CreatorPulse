'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, Eye, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { UserRole } from '@/lib/supabase/store';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('alex@community.io');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('member');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      localStorage.setItem('creatorpulse_active_role', selectedRole);
      window.dispatchEvent(new CustomEvent('creatorpulse_role_changed', { detail: selectedRole }));
      
      if (selectedRole === 'admin') {
        router.push('/admin/dashboard');
      } else if (selectedRole === 'creator') {
        router.push('/creator/dashboard');
      } else {
        router.push('/feed');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-white relative">
      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="text-white" size={24} />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-white">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to your CreatorPulse community account</p>
        </div>

        <Card className="p-6 space-y-5">
          {/* Role selector for easy demo testing */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Sign in as Role:</label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => { setSelectedRole('member'); setEmail('alex@community.io'); }}
                className={`py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1 ${
                  selectedRole === 'member' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400'
                }`}
              >
                <UserCheck size={13} /> Member
              </button>
              <button
                type="button"
                onClick={() => { setSelectedRole('creator'); setEmail('sarah@designcode.com'); }}
                className={`py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1 ${
                  selectedRole === 'creator' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400'
                }`}
              >
                <Eye size={13} /> Creator
              </button>
              <button
                type="button"
                onClick={() => { setSelectedRole('admin'); setEmail('admin@creatorpulse.com'); }}
                className={`py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1 ${
                  selectedRole === 'admin' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400'
                }`}
              >
                <Shield size={13} /> Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-medium">Password</label>
                <Link href="/auth/verify" className="text-cyan-400 text-[11px] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight size={14} />}
            >
              Sign In to {selectedRole.toUpperCase()} Account
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
            Don't have an account yet?{' '}
            <Link href="/auth/signup" className="text-cyan-400 font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
