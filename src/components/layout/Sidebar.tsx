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
    <aside className="w-64 hidden lg:flex flex-col gap-6 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-slate-800/80">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
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
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-md shadow-cyan-500/5'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
          Management & Studio
        </p>

        {activeRole === 'creator' && (
          <Link
            href="/creator/dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname === '/creator/dashboard'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-300 hover:text-indigo-400 hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard size={18} className="text-indigo-400" />
            <span>Creator Dashboard</span>
          </Link>
        )}

        {activeRole === 'admin' && (
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname === '/admin/dashboard'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'text-slate-300 hover:text-rose-400 hover:bg-slate-900'
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
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
          }`}
        >
          <Database size={18} className="text-emerald-400" />
          <span>Supabase Inspector</span>
        </Link>
      </div>

      {activeRole === 'member' && (
        <div className="mt-auto glass-card p-4 space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles size={16} />
            <h5 className="font-bold text-xs uppercase tracking-wider">Become a Creator</h5>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
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
