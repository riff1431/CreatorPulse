'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Compass, Film, Bookmark, LayoutDashboard, Shield, 
  Database, Wallet, Bell, MessageSquare, Sparkles 
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { HookPoint } from '@/lib/extensions/plugin-engine';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { role } = useAuth();

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
    <aside className="w-64 hidden lg:flex flex-col gap-6 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-[#F3DCE8]">
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] px-3 mb-2">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-sm shadow-[#EC4899]/5'
                  : 'text-[#52525B] hover:text-[#18181B] hover:bg-[#FFF1F7]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-[#EC4899]' : 'text-[#71717A]'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold bg-[#FFE4E6] text-[#BE123C] px-2 py-0.5 rounded-full border border-[#FECDD3]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] px-3 mb-2">
          Management & Studio
        </p>

        {role === 'creator' && (
          <Link
            href="/creator/dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
              pathname.startsWith('/creator')
                ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                : 'text-[#52525B] hover:text-[#18181B] hover:bg-[#FFF1F7]'
            }`}
          >
            <LayoutDashboard size={18} className="text-[#EC4899]" />
            <span>Creator Studio</span>
          </Link>
        )}

        {role === 'admin' && (
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
              pathname.startsWith('/admin')
                ? 'bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3]'
                : 'text-[#52525B] hover:text-[#BE123C] hover:bg-[#FFF1F7]'
            }`}
          >
            <Shield size={18} className="text-[#F43F5E]" />
            <span>Admin Control Center</span>
          </Link>
        )}

        <Link
          href="/database"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
            pathname === '/database'
              ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
              : 'text-[#52525B] hover:text-[#18181B] hover:bg-[#FFF1F7]'
          }`}
        >
          <Database size={18} className="text-[#EC4899]" />
          <span>Supabase Inspector</span>
        </Link>

        {/* Plugin Extension Hook Point */}
        <HookPoint name="sidebar_extra_links" />
      </div>

      {role === 'member' && (
        <div className="mt-auto bg-gradient-to-br from-[#FFF1F7] to-[#FDF2F8] border border-[#F3DCE8] p-4 rounded-2xl space-y-3 relative overflow-hidden shadow-sm shadow-[#EC4899]/5">
          <div className="flex items-center gap-2 text-[#BE185D]">
            <Sparkles size={16} />
            <h5 className="font-bold text-xs uppercase tracking-wider">Become a Creator</h5>
          </div>
          <p className="text-xs text-[#71717A] leading-relaxed font-normal">
            Offer VIP membership tiers, video masterclasses, and receive direct fan tips.
          </p>
          <Link
            href="/auth/signup"
            className="block text-center text-xs font-bold gradient-btn text-white py-2 rounded-xl"
          >
            Apply for Creator Status
          </Link>
        </div>
      )}
    </aside>
  );
};
