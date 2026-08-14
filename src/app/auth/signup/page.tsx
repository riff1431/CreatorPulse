'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { UserRole } from '@/lib/supabase/store';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [category, setCategory] = useState('Education & Tech');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      localStorage.setItem('creatorpulse_active_role', role);
      window.dispatchEvent(new CustomEvent('creatorpulse_role_changed', { detail: role }));
      router.push('/auth/verify');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#FFF9FC] flex flex-col items-center justify-center p-4 selection:bg-[#FCE7F3] selection:text-[#DB2777] relative">
      <div className="absolute w-96 h-96 bg-[#FCE7F3]/60 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F472B6] flex items-center justify-center shadow-lg shadow-[#EC4899]/25 group-hover:scale-105 transition-transform">
              <Sparkles className="text-white" size={24} />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-[#18181B]">Join CreatorPulse</h1>
          <p className="text-xs text-[#71717A] font-medium">Create your account to unlock exclusive posts & communities</p>
        </div>

        <Card className="p-6 space-y-5">
          {/* Account Type Toggle */}
          <div className="space-y-1.5 text-xs">
            <label className="block font-bold text-[#18181B]">I am joining as a:</label>
            <div className="grid grid-cols-2 gap-2 bg-[#FFF9FC] p-1.5 rounded-2xl border border-[#F3DCE8]">
              <button
                type="button"
                onClick={() => setRole('member')}
                className={`py-2 px-3 rounded-xl font-bold transition-all text-center cursor-pointer ${
                  role === 'member' ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-sm' : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                Community Member
              </button>
              <button
                type="button"
                onClick={() => setRole('creator')}
                className={`py-2 px-3 rounded-xl font-bold transition-all text-center cursor-pointer ${
                  role === 'creator' ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-sm' : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                Creator & Educator
              </button>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[#18181B] font-bold mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] focus:bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-[#18181B] font-bold mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. jordan_creator"
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] focus:bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-[#18181B] font-bold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@domain.com"
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] focus:bg-white font-medium"
                required
              />
            </div>

            {role === 'creator' && (
              <div>
                <label className="block text-[#18181B] font-bold mb-1">Primary Creator Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2.5 text-[#18181B] focus:outline-none font-medium"
                >
                  <option value="Education & Tech">Education & Tech</option>
                  <option value="Art & Design">Art & Design</option>
                  <option value="Fitness & Wellness">Fitness & Wellness</option>
                  <option value="Business & Coaching">Business & Coaching</option>
                  <option value="Music & Sound">Music & Sound</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-[#18181B] font-bold mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] focus:bg-white font-medium"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight size={14} />}
            >
              Create Account
            </Button>
          </form>

          <div className="text-center text-xs text-[#71717A] border-t border-[#F3DCE8] pt-4 font-medium">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#BE185D] font-extrabold hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
