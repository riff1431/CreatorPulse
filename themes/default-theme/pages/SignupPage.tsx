'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Alert } from '../components/Alert';
import { useAuth } from '@/lib/auth/auth-context';
import { UserRole } from '@/lib/supabase/store';
import { GuestGuard } from '@/components/auth/RouteGuards';
import { useSiteSettings } from '@/lib/settings/site-settings-context';

export function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { settings } = useSiteSettings();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('member');
  const [category, setCategory] = useState('Education & Tech');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (!fullName.trim() || !username.trim() || !email.trim()) {
      setErrorMessage('Please fill out all required fields.');
      setIsLoading(false);
      return;
    }

    if (username.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    const result = await signup(fullName, username, email, password, role, category);

    if (!result.success) {
      setErrorMessage(result.error || 'Signup failed. Please try again.');
      setIsLoading(false);
      return;
    }

    if (result.error === 'Check email') {
      router.push('/auth/verify');
      return;
    }

    if (role === 'creator') {
      router.push('/creator/dashboard');
    } else {
      router.push('/feed');
    }
  };

  return (
    <GuestGuard>
      <div className="min-h-screen bg-[#FFF9FC] dark:bg-[#0F0A14] text-[#18181B] dark:text-[#FDF2F8] flex flex-col items-center justify-center p-4 selection:bg-[#FCE7F3] selection:text-[#DB2777] relative transition-colors duration-200">
        <div className="absolute w-96 h-96 bg-[#FCE7F3]/60 dark:bg-pink-900/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-md w-full space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 group">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={settings.site_name || 'Logo'} className="h-12 w-auto max-w-[180px] object-contain rounded-2xl shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F472B6] flex items-center justify-center shadow-lg shadow-[#EC4899]/25 group-hover:scale-105 transition-transform shrink-0">
                  <Sparkles className="text-white" size={24} />
                </div>
              )}
            </Link>
            <h1 className="text-2xl font-black text-[#18181B] dark:text-[#FDF2F8]">Join {settings.site_name || 'CreatorPulse'}</h1>
            <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] font-medium">Create your account to unlock exclusive posts & communities</p>
          </div>

          <Card className="p-6 space-y-5">
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

            {errorMessage && (
              <Alert variant="error" onDismiss={() => setErrorMessage('')}>
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleSignup} className="space-y-3.5 text-xs">
              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                required
              />

              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. jordan_creator"
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@domain.com"
                required
              />

              {role === 'creator' && (
                <Select
                  label="Primary Creator Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={[
                    { label: 'Education & Tech', value: 'Education & Tech' },
                    { label: 'Art & Design', value: 'Art & Design' },
                    { label: 'Fitness & Wellness', value: 'Fitness & Wellness' },
                    { label: 'Business & Coaching', value: 'Business & Coaching' },
                    { label: 'Music & Sound', value: 'Music & Sound' },
                  ]}
                />
              )}

              <Input
                label="Password"
                type="password"
                isPassword={true}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min 6 characters)"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight size={14} />}
              >
                Create Account & Log In
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
    </GuestGuard>
  );
}

export default SignupPage;
