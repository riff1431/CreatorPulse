'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Film, Clock, Users, Star,
  DollarSign, Wallet, BarChart3, Layers, Settings,
  ChevronLeft, ChevronRight, Menu, Share2, Calendar
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
      { label: 'Schedule Queue', href: '/creator/schedule', icon: Calendar },
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
      { label: 'Referrals', href: '/creator/referrals', icon: Share2 },
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

import { usePlugins } from '@/lib/extensions/plugin-engine';

export const CreatorSidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activePlugins } = usePlugins();
  const hasStoriesPlugin = activePlugins.some((p) => p.id === 'plugin-creator-stories' || p.slug === 'creator-stories');
  const hasSchedulingPlugin = activePlugins.some((p) => p.id === 'plugin-content-scheduling' || p.slug === 'content-scheduling');
  const hasAnalyticsPlugin = activePlugins.some((p) => p.id === 'plugin-creator-analytics' || p.slug === 'creator-analytics');

  const filteredGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.href === '/creator/stories' && !hasStoriesPlugin) return false;
      if (item.href === '/creator/schedule' && !hasSchedulingPlugin) return false;
      if (item.href === '/creator/analytics' && !hasAnalyticsPlugin) return false;
      return true;
    })
  })).filter((group) => group.items.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/40 backdrop-blur-md">
      <div className={`flex-1 overflow-y-auto py-5 space-y-5 scrollbar-thin scrollbar-thumb-pink-200 ${
        collapsed ? 'px-2' : 'px-3.5'
      }`}>
        {filteredGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            {!collapsed && (
              <p className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA] px-3 mb-1">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center rounded-2xl text-xs font-bold transition-all relative group ${
                      collapsed
                        ? 'justify-center py-2.5 px-0 mx-auto w-11 h-11'
                        : 'justify-between px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-[#FCE7F3]/90 text-[#BE185D] border border-[#FBCFE8] shadow-sm shadow-[#EC4899]/10'
                        : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]/70'
                    }`}
                  >
                    <div className={`flex items-center z-10 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
                      <Icon
                        size={16}
                        className={`transition-colors duration-200 shrink-0 ${isActive ? 'text-[#EC4899]' : 'text-[#71717A] group-hover:text-[#EC4899]'}`}
                      />
                      {!collapsed && <span className="transition-opacity duration-200">{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && item.badge > 0 && (
                      <span className="text-[10px] font-black bg-[#FFF1F7] text-[#BE185D] px-2 py-0.5 rounded-full leading-none border border-[#F3DCE8] z-10 shadow-xs">
                        {formatBadge(item.badge)}
                      </span>
                    )}

                    {/* Active side indicator glow */}
                    {isActive && !collapsed && (
                      <div className="absolute left-1 top-1/4 bottom-1/4 w-1 bg-[#EC4899] rounded-full shadow-lg shadow-[#EC4899]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle (Desktop) */}
      <div className="hidden lg:block border-t border-[#F3DCE8]/80 p-3 bg-white/20">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#71717A] hover:text-[#18181B] py-2.5 rounded-xl hover:bg-[#FFF1F7]/70 transition-all cursor-pointer"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full gradient-btn text-white shadow-xl shadow-[#EC4899]/30 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full bg-white border-r border-[#F3DCE8] z-50 transition-transform duration-300 w-64 shadow-2xl flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-4 border-b border-[#F3DCE8] shrink-0">
          <span className="text-sm font-black text-[#18181B] tracking-tight">Creator Studio</span>
        </div>
        <div className="flex-1 min-h-0">
          {sidebarContent}
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-[#F3DCE8] bg-white/40 shrink-0 h-full overflow-hidden transition-all duration-300 ${
          collapsed ? 'w-18' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
