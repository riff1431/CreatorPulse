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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-[#F3DCE8] px-3 py-2 flex items-center justify-around shadow-lg shadow-[#EC4899]/5">
      <Link
        href="/feed"
        className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
          pathname === '/feed' ? 'text-[#EC4899]' : 'text-[#71717A]'
        }`}
      >
        <Home size={18} />
        <span>Feed</span>
      </Link>

      <Link
        href="/shorts"
        className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
          pathname === '/shorts' ? 'text-[#EC4899]' : 'text-[#71717A]'
        }`}
      >
        <Film size={18} />
        <span>Shorts</span>
      </Link>

      <Link
        href="/explore"
        className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
          pathname === '/explore' ? 'text-[#EC4899]' : 'text-[#71717A]'
        }`}
      >
        <Compass size={18} />
        <span>Explore</span>
      </Link>

      {activeRole === 'creator' ? (
        <Link
          href="/creator/dashboard"
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
            pathname.startsWith('/creator') ? 'text-[#EC4899]' : 'text-[#71717A]'
          }`}
        >
          <LayoutDashboard size={18} />
          <span>Studio</span>
        </Link>
      ) : activeRole === 'admin' ? (
        <Link
          href="/admin/dashboard"
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
            pathname.startsWith('/admin') ? 'text-[#F43F5E]' : 'text-[#71717A]'
          }`}
        >
          <Shield size={18} />
          <span>Admin</span>
        </Link>
      ) : (
        <Link
          href="/database"
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
            pathname === '/database' ? 'text-[#EC4899]' : 'text-[#71717A]'
          }`}
        >
          <Database size={18} />
          <span>Supabase</span>
        </Link>
      )}
    </nav>
  );
};
