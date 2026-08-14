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
    <div className="min-h-screen bg-[#FFF9FC] flex flex-col items-center justify-center p-4 selection:bg-[#FCE7F3] selection:text-[#DB2777] relative">
      <div className="absolute w-96 h-96 bg-[#FCE7F3]/60 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F472B6] flex items-center justify-center shadow-lg shadow-[#EC4899]/25 group-hover:scale-105 transition-transform">
              <Sparkles className="text-white" size={24} />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-[#18181B]">Welcome Back</h1>
          <p className="text-xs text-[#71717A] font-medium">Sign in to your CreatorPulse community account</p>
        </div>

        <Card className="p-6 space-y-5">
          {/* Role selector for easy demo testing */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#18181B]">Sign in as Demo Role:</label>
            <div className="grid grid-cols-3 gap-1.5 bg-[#FFF9FC] p-1.5 rounded-2xl border border-[#F3DCE8] text-xs">
              <button
                type="button"
                onClick={() => { setSelectedRole('member'); setEmail('alex@community.io'); }}
                className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedRole === 'member' ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-sm' : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <UserCheck size={13} /> Member
              </button>
              <button
                type="button"
                onClick={() => { setSelectedRole('creator'); setEmail('sarah@designcode.com'); }}
                className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedRole === 'creator' ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-sm' : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <Eye size={13} /> Creator
              </button>
              <button
                type="button"
                onClick={() => { setSelectedRole('admin'); setEmail('admin@creatorpulse.com'); }}
                className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedRole === 'admin' ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-sm' : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <Shield size={13} /> Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#18181B] font-bold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl pl-9 pr-3 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] focus:bg-white transition-colors font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[#18181B] font-bold">Password</label>
                <Link href="/auth/forgot-password" className="text-[#BE185D] text-[11px] font-bold hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl pl-9 pr-3 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] focus:bg-white transition-colors font-medium"
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

          <div className="text-center text-xs text-[#71717A] border-t border-[#F3DCE8] pt-4 font-medium">
            Don't have an account yet?{' '}
            <Link href="/auth/signup" className="text-[#BE185D] font-extrabold hover:underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
