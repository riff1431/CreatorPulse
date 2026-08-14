'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, Compass, LayoutDashboard, Shield, Database } from 'lucide-react';
import { UserRole } from '@/lib/supabase/store';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState<UserRole>('member');

  useEffect(() => {
    const role = (localStorage.getItem('creatorpulse_active_role') as UserRole) || 'member';
    setActiveRole(role);

    const handleRoleEvent = (e: CustomEvent) => {
      setActiveRole(e.detail);
    };

    window.addEventListener('creatorpulse_role_changed' as any, handleRoleEvent);
    return () => {
      window.removeEventListener('creatorpulse_role_changed' as any, handleRoleEvent);
    };
  }, []);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/92 backdrop-blur-xl border-t border-pink-500/20 px-3 py-2 flex items-center justify-around">
      <Link
        href="/feed"
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          pathname === '/feed' ? 'text-pink-400 font-bold' : 'text-pink-200/60'
        }`}
      >
        <Home size={18} />
        <span>Feed</span>
      </Link>

      <Link
        href="/shorts"
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          pathname === '/shorts' ? 'text-pink-400 font-bold' : 'text-pink-200/60'
        }`}
      >
        <Film size={18} />
        <span>Shorts</span>
      </Link>

      <Link
        href="/explore"
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          pathname === '/explore' ? 'text-pink-400 font-bold' : 'text-pink-200/60'
        }`}
      >
        <Compass size={18} />
        <span>Explore</span>
      </Link>

      {activeRole === 'creator' ? (
        <Link
          href="/creator/dashboard"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname.startsWith('/creator') ? 'text-pink-400 font-bold' : 'text-pink-200/60'
          }`}
        >
          <LayoutDashboard size={18} />
          <span>Studio</span>
        </Link>
      ) : activeRole === 'admin' ? (
        <Link
          href="/admin/dashboard"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname.startsWith('/admin') ? 'text-rose-400 font-bold' : 'text-pink-200/60'
          }`}
        >
          <Shield size={18} />
          <span>Admin</span>
        </Link>
      ) : (
        <Link
          href="/database"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname === '/database' ? 'text-pink-400 font-bold' : 'text-pink-200/60'
          }`}
        >
          <Database size={18} />
          <span>Supabase</span>
        </Link>
      )}
    </nav>
  );
};
