'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCheck, FileText, Film, Clock,
  AlertTriangle, CreditCard, Star, Receipt, TrendingUp, Wallet,
  Layers, Settings, ChevronLeft, ChevronRight, Menu, Palette,
  Puzzle, ShieldCheck, Database, Compass, Radio, Search, ExternalLink,
  Sparkles, Shield
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeVariant?: 'pink' | 'emerald' | 'amber';
  isExternal?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const allAdminNavGroups: NavGroup[] = [
  {
    title: 'Core Overview',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Platform Earnings', href: '/admin/earnings', icon: TrendingUp },
    ],
  },
  {
    title: 'Themes & Plugins',
    items: [
      { label: 'Frontend Themes', href: '/admin/themes', icon: Palette, badge: 'Blush Core', badgeVariant: 'pink' },
      { label: 'Plugins & Add-ons', href: '/admin/plugins', icon: Puzzle, badge: '5 Active', badgeVariant: 'emerald' },
      { label: 'System Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
    ],
  },
  {
    title: 'User Management',
    items: [
      { label: 'All Users', href: '/admin/users', icon: Users },
      { label: 'Creators', href: '/admin/creators', icon: UserCheck },
      { label: 'Creator Applications', href: '/admin/applications', icon: FileText, badge: 2, badgeVariant: 'pink' },
    ],
  },
  {
    title: 'Content & Moderation',
    items: [
      { label: 'Posts', href: '/admin/posts', icon: FileText },
      { label: 'Reels & Shorts', href: '/admin/reels', icon: Film },
      { label: '24h Stories', href: '/admin/stories', icon: Clock },
      { label: 'Abuse Reports', href: '/admin/reports', icon: AlertTriangle, badge: 2, badgeVariant: 'amber' },
    ],
  },
  {
    title: 'Finance & Commerce',
    items: [
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
      { label: 'VIP Memberships', href: '/admin/memberships', icon: Star },
      { label: 'Transactions', href: '/admin/transactions', icon: Receipt },
      { label: 'Payout Requests', href: '/admin/payouts', icon: Wallet, badge: 1, badgeVariant: 'emerald' },
    ],
  },
  {
    title: 'System & Database',
    items: [
      { label: 'Categories & Tags', href: '/admin/categories', icon: Layers },
      { label: 'Platform Settings', href: '/admin/settings', icon: Settings },
      { label: 'Database Schema', href: '/database', icon: Database },
    ],
  },
  {
    title: 'Live Portals',
    items: [
      { label: 'View Public Feed', href: '/feed', icon: Compass, isExternal: true },
      { label: 'Creator Studio', href: '/creator/dashboard', icon: Radio, isExternal: true },
    ],
  },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navFilter, setNavFilter] = useState('');

  // Filter items by search query if admin types in filter
  const filteredGroups = allAdminNavGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.label.toLowerCase().includes(navFilter.toLowerCase())
    ),
  })).filter((group) => group.items.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#F3DCE8]">
      {/* Quick Menu Filter (Desktop Only when not collapsed) */}
      {!collapsed && (
        <div className="p-3 border-b border-[#F3DCE8] shrink-0 bg-[#FFF9FC]/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={13} />
            <input
              type="text"
              placeholder="Filter menu items..."
              value={navFilter}
              onChange={(e) => setNavFilter(e.target.value)}
              className="w-full bg-white border border-[#F3DCE8] rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] font-medium shadow-xs"
            />
          </div>
        </div>
      )}

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 scrollbar-thin scrollbar-thumb-[#FCE7F3]">
        {filteredGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <p className="text-[10px] font-black uppercase tracking-wider text-[#A1A1AA] px-3 mb-1">
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
                    target={item.isExternal ? '_blank' : undefined}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all relative group ${
                      isActive
                        ? 'bg-[#FCE7F3] text-[#BE185D] shadow-xs'
                        : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 z-10 min-w-0">
                      <Icon
                        size={16}
                        className={`shrink-0 transition-colors duration-200 ${
                          isActive ? 'text-[#EC4899]' : 'text-[#A1A1AA] group-hover:text-[#EC4899]'
                        }`}
                      />
                      {!collapsed && (
                        <span className="font-semibold truncate flex items-center gap-1.5">
                          {item.label}
                          {item.isExternal && <ExternalLink size={10} className="text-[#A1A1AA] shrink-0" />}
                        </span>
                      )}
                    </div>

                    {!collapsed && item.badge !== undefined && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none z-10 shrink-0 ml-1 ${
                          item.badgeVariant === 'emerald'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.badgeVariant === 'amber'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-[#FFF1F7] text-[#BE185D] border border-[#FBCFE8]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Active left indicator pill */}
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#EC4899] rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle (Desktop) */}
      <div className="hidden lg:block border-t border-[#F3DCE8] p-3 bg-[#FFF9FC] shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#71717A] hover:text-[#18181B] py-2 rounded-xl hover:bg-white border border-transparent hover:border-[#F3DCE8] transition-all cursor-pointer"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Floating Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-[#EC4899] text-white shadow-xl shadow-[#EC4899]/30 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
        aria-label="Open Admin Menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full bg-white border-r border-[#F3DCE8] z-50 transition-transform duration-300 w-72 shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#F3DCE8] bg-[#FFF9FC]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EC4899] flex items-center justify-center text-white font-black text-xs">
              CP
            </div>
            <span className="text-sm font-black text-[#18181B] tracking-tight">Admin Console</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg text-[#71717A] hover:text-[#18181B]">
            <ChevronLeft size={18} />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar (Sticky to full height) */}
      <aside
        className={`hidden lg:flex flex-col bg-white shrink-0 sticky top-16 h-[calc(100vh-64px)] transition-all duration-300 ${
          collapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
