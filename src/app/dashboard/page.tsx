'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function DashboardRouter() {
  const router = useRouter();

  useEffect(() => {
    // In a real app, you would fetch the user's role from Supabase here.
    // For now, we'll assume a default redirect or you can build a switch.
    // We'll redirect to the member dashboard by default.
    router.replace('/member/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Sparkles className="text-cyan-400" size={32} />
        <p className="text-slate-400 text-sm font-medium">Routing to your dashboard...</p>
      </div>
    </div>
  );
}
