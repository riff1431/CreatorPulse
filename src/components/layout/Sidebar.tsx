'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Compass, Film, Bookmark, LayoutDashboard, Shield, 
  Database, Wallet, Bell, MessageSquare, Sparkles 
} from 'lucide-react';
import { UserRole } from '@/lib/supabase/store';

export const Sidebar: React.FC = () => {
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

  const navItems = [
    { label: 'Home Feed', href: '/feed', icon: Home },
    { label: 'Explore & Search', href: '/explore', icon: Compass },
    { label: 'Reels (Shorts)', href: '/shorts', icon: Film, badge: 'Hot' },
    { label: 'Direct Messages', href: '/messages', icon: MessageSquare },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Saved Posts', href: '/saved', icon: Bookmark },
    { label: 'Account Balance', href: '/balance', icon: Wallet },
  ];

  return (
    <aside className="w-64 hidden lg:flex flex-col gap-6 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-pink-500/15">
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-pink-300/50 px-3 mb-2">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-pink-500/15 text-pink-300 border border-pink-500/30 shadow-md shadow-pink-500/10 font-semibold'
                  : 'text-pink-200/70 hover:text-pink-100 hover:bg-pink-950/40 hover:border hover:border-pink-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-pink-400' : 'text-pink-300/60'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold bg-pink-500/25 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/40">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-pink-300/50 px-3 mb-2">
          Management & Studio
        </p>

        {activeRole === 'creator' && (
          <Link
            href="/creator/dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname.startsWith('/creator')
                ? 'bg-pink-500/15 text-pink-300 border border-pink-500/30 font-semibold'
                : 'text-pink-200/80 hover:text-pink-300 hover:bg-pink-950/40'
            }`}
          >
            <LayoutDashboard size={18} className="text-pink-400" />
            <span>Creator Dashboard</span>
          </Link>
        )}

        {activeRole === 'admin' && (
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname.startsWith('/admin')
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold'
                : 'text-pink-200/80 hover:text-rose-300 hover:bg-pink-950/40'
            }`}
          >
            <Shield size={18} className="text-rose-400" />
            <span>Admin Control Center</span>
          </Link>
        )}

        <Link
          href="/database"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname === '/database'
              ? 'bg-pink-500/15 text-pink-300 border border-pink-500/30'
              : 'text-pink-200/70 hover:text-pink-100 hover:bg-pink-950/40'
          }`}
        >
          <Database size={18} className="text-pink-400" />
          <span>Supabase Inspector</span>
        </Link>
      </div>

      {activeRole === 'member' && (
        <div className="mt-auto glass-card p-4 space-y-3 relative overflow-hidden border-pink-500/25 bg-gradient-to-b from-pink-950/30 to-pink-950/50">
          <div className="flex items-center gap-2 text-pink-400">
            <Sparkles size={16} />
            <h5 className="font-bold text-xs uppercase tracking-wider">Become a Creator</h5>
          </div>
          <p className="text-xs text-pink-200/70 leading-relaxed">
            Offer VIP membership tiers, video masterclasses, and receive direct fan tips.
          </p>
          <Link
            href="/auth/signup"
            className="block text-center text-xs font-semibold gradient-btn text-white py-2 rounded-xl"
          >
            Apply for Creator Status
          </Link>
        </div>
      )}
    </aside>
  );
};
