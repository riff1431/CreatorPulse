'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Film, Clock, Users, Star,
  DollarSign, Wallet, BarChart3, Layers, Settings,
  ChevronLeft, ChevronRight, Menu
} from 'lucide-react';

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
    title: 'Content',
    items: [
      { label: 'Posts', href: '/creator/posts', icon: FileText },
      { label: 'Reels', href: '/creator/reels', icon: Film },
      { label: 'Stories', href: '/creator/stories', icon: Clock },
    ],
  },
  {
    title: 'Audience',
    items: [
      { label: 'Followers', href: '/creator/followers', icon: Users, badge: 14280 },
      { label: 'Subscribers', href: '/creator/subscribers', icon: Star, badge: 840 },
    ],
  },
  {
    title: 'Revenue',
    items: [
      { label: 'Earnings', href: '/creator/earnings', icon: DollarSign },
      { label: 'Payouts', href: '/creator/payouts', icon: Wallet },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Analytics', href: '/creator/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Memberships', href: '/creator/memberships', icon: Layers },
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

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">
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
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/5'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={16}
                        className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && item.badge && item.badge > 0 && (
                      <span className="text-[10px] font-bold bg-indigo-500/15 text-indigo-300 px-1.5 py-0.5 rounded-full leading-none">
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
      <div className="hidden lg:block border-t border-slate-800 p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-300 py-2 rounded-lg hover:bg-slate-900 transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 flex items-center justify-center"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full bg-slate-950 border-r border-slate-800 z-50 transition-transform duration-300 w-64 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 flex items-center px-4 border-b border-slate-800">
          <span className="text-sm font-bold text-white">Creator Studio</span>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-800/80 bg-slate-950 shrink-0 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
