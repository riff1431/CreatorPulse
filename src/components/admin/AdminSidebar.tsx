'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCheck, FileText, Film, Clock,
  AlertTriangle, CreditCard, Star, Receipt, TrendingUp, Wallet,
  Layers, Settings, ChevronLeft, ChevronRight, Menu
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
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'User Management',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Creators', href: '/admin/creators', icon: UserCheck },
      { label: 'Applications', href: '/admin/applications', icon: FileText, badge: 2 },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Posts', href: '/admin/posts', icon: FileText },
      { label: 'Reels', href: '/admin/reels', icon: Film },
      { label: 'Stories', href: '/admin/stories', icon: Clock },
    ],
  },
  {
    title: 'Moderation',
    items: [
      { label: 'Reports', href: '/admin/reports', icon: AlertTriangle, badge: 2 },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
      { label: 'Memberships', href: '/admin/memberships', icon: Star },
      { label: 'Transactions', href: '/admin/transactions', icon: Receipt },
      { label: 'Earnings', href: '/admin/earnings', icon: TrendingUp },
      { label: 'Payouts', href: '/admin/payouts', icon: Wallet, badge: 1 },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Categories', href: '/admin/categories', icon: Layers },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950/40 backdrop-blur-md">
      <div className="flex-1 overflow-y-auto py-5 px-3.5 space-y-5 scrollbar-thin scrollbar-thumb-pink-900">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            {!collapsed && (
              <p className="text-[10px] font-black uppercase tracking-widest text-pink-400/40 px-3 mb-1">
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
                    className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative group ${
                      isActive
                        ? 'bg-pink-500/15 text-rose-300 border border-pink-500/25 shadow-sm shadow-pink-500/5'
                        : 'text-pink-300/60 hover:text-pink-100 hover:bg-pink-950/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 z-10">
                      <Icon
                        size={16}
                        className={`transition-colors duration-200 ${isActive ? 'text-pink-400' : 'text-pink-400/40 group-hover:text-pink-300'}`}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && item.badge > 0 && (
                      <span className="text-[10px] font-bold bg-pink-500/20 text-rose-300 px-1.5 py-0.5 rounded-full border border-pink-500/20 leading-none z-10">
                        {item.badge}
                      </span>
                    )}

                    {/* Glowing indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-pink-500 rounded-r-full shadow-md shadow-pink-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle (Desktop) */}
      <div className="hidden lg:block border-t border-pink-500/10 p-3 bg-slate-900/10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-pink-400/60 hover:text-pink-200 py-2.5 rounded-xl hover:bg-pink-500/10 transition-all cursor-pointer"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
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
        className="lg:hidden fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full gradient-btn text-white shadow-xl shadow-pink-500/30 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full bg-slate-950 border-r border-pink-500/20 z-50 transition-transform duration-300 w-64 shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-4 border-b border-pink-500/20">
          <span className="text-sm font-black text-pink-100 tracking-tight">Admin Console</span>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-pink-500/15 bg-slate-950/80 shrink-0 transition-all duration-300 ${
          collapsed ? 'w-18' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
