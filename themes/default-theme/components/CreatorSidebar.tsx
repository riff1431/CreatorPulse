'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Film, Clock, Users, Star,
  DollarSign, Wallet, BarChart3, Layers, Settings,
  ChevronLeft, ChevronRight, Menu, X, Sparkles
} from 'lucide-react';
import { usePlugins } from '@/lib/extensions/plugin-engine';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/creator/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Content & Media',
    items: [
      { label: 'Posts', href: '/creator/posts', icon: FileText },
      { label: 'Reels', href: '/creator/reels', icon: Film },
      { label: 'Stories', href: '/creator/stories', icon: Clock },
    ],
  },
  {
    title: 'Audience & Fans',
    items: [
      { label: 'Followers', href: '/creator/followers', icon: Users, badge: 14280 },
      { label: 'VIP Subscribers', href: '/creator/subscribers', icon: Star, badge: 840 },
    ],
  },
  {
    title: 'Monetization',
    items: [
      { label: 'Earnings', href: '/creator/earnings', icon: DollarSign },
      { label: 'Payouts & Wallet', href: '/balance', icon: Wallet },
    ],
  },
  {
    title: 'Settings & Tiers',
    items: [
      { label: 'Tier Memberships', href: '/creator/memberships', icon: Layers },
      { label: 'Profile Settings', href: '/creator/settings', icon: Settings },
    ],
  },
];

const formatBadge = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

export const CreatorSidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activePlugins } = usePlugins();
  const hasStoriesPlugin = activePlugins.some((p) => p.id === 'plugin-creator-stories');

  const filteredGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.href === '/creator/stories' && !hasStoriesPlugin) return false;
      return true;
    }),
  })).filter((group) => group.items.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--color-surface)] /60 /60 backdrop-blur-xl">
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-5">
        {filteredGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)] dark:text-[#8E7890] px-3 mb-1.5">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all relative group ${
                      isActive
                        ? 'bg-[var(--color-soft-primary)] text-[var(--color-primary)] border border-[#FBCFE8] shadow-xs'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] dark:hover:text-[#FDF2F8] '
                    }`}
                  >
                    <div className="flex items-center gap-2.5 z-10 min-w-0">
                      <Icon
                        size={16}
                        className={`shrink-0 transition-colors duration-200 ${
                          isActive ? 'text-[var(--color-primary)] ' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] '
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && item.badge > 0 && (
                      <span className="text-[10px] font-black bg-[var(--color-surface-secondary)] text-[var(--color-primary)] px-2 py-0.5 rounded-full border border-[var(--color-border)] shadow-2xs shrink-0">
                        {formatBadge(item.badge)}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle (Desktop) */}
      <div className="hidden lg:block border-t border-[var(--color-border)] p-3 bg-[var(--color-surface)] /40 /40">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] dark:hover:text-[#FDF2F8] py-2 rounded-xl hover:bg-[var(--color-surface-secondary)] transition-all cursor-pointer"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Trigger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-20 right-4 z-40 w-11 h-11 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-xl shadow-pink-500/30 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
        aria-label="Open Studio Menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full bg-[var(--color-surface)] border-r border-[var(--color-border)] z-50 transition-transform duration-300 w-72 shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--color-border)] ">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[var(--color-primary)] " size={18} />
            <span className="text-sm font-black text-[var(--color-text-primary)] tracking-tight">Creator Studio</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] "
          >
            <X size={18} />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] /40 /40 shrink-0 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default CreatorSidebar;
