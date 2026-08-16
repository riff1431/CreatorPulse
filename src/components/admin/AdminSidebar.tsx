'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCheck, FileText, Clapperboard, Sparkles,
  ShieldAlert, CreditCard, Crown, Receipt, TrendingUp, Wallet,
  Layers, Settings, ChevronLeft, ChevronRight, Menu, Palette,
  Puzzle, ShieldCheck, Database, Compass, Radio, Search, ExternalLink,
  Shield, Mail, Image as ImageIcon, Wrench, Bell, HardDrive, RefreshCw,
  ClipboardCheck, Newspaper, Globe, Tag, Share2, Percent, ShoppingBag, Calendar
} from 'lucide-react';

import { AdminIcon } from '@/components/admin/ui/AdminIcon';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeVariant?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose' | 'slate';
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
    title: 'Dynamic Managers',
    items: [
      { label: 'Site Settings', href: '/admin/settings', icon: Settings, badge: 'Dynamic', badgeVariant: 'indigo' },
      { label: 'Payment Gateways', href: '/admin/payment-gateways', icon: CreditCard, badge: 'Dynamic', badgeVariant: 'emerald' },
      { label: 'Checkout & Paywalls', href: '/admin/checkout', icon: ShoppingBag, badge: 'Dynamic', badgeVariant: 'emerald' },
      { label: 'Language & Translations', href: '/admin/language', icon: Globe, badge: 'Dynamic', badgeVariant: 'indigo' },
      { label: 'Email & SMTP', href: '/admin/email-manager', icon: Mail, badge: 'Dynamic', badgeVariant: 'emerald' },
      { label: 'Storage & Drives', href: '/admin/storage', icon: HardDrive, badge: 'Dynamic', badgeVariant: 'emerald' },
      { label: 'Menu & Navigation', href: '/admin/navigation', icon: Menu },
      { label: 'Pages & CMS', href: '/admin/cms', icon: FileText },
      { label: 'Announcements', href: '/admin/announcements', icon: Bell, badge: 'Live', badgeVariant: 'emerald' },
      { label: 'Feature Modules', href: '/admin/modules', icon: Puzzle, badge: 'New', badgeVariant: 'amber' },
    ],
  },


  {
    title: 'User Management',
    items: [
      { label: 'All Users', href: '/admin/users', icon: Users },
      { label: 'Roles & Permissions', href: '/admin/roles', icon: Shield },
      { label: 'Creators', href: '/admin/creators', icon: UserCheck },
      { label: 'Creator Applications', href: '/admin/applications', icon: ClipboardCheck, badge: 2, badgeVariant: 'blue' },
    ],
  },
  {
    title: 'Content & Media',
    items: [
      { label: 'Media', href: '/admin/media', icon: ImageIcon, badge: 'Library', badgeVariant: 'indigo' },
      { label: 'Email Templates', href: '/admin/email-templates', icon: Mail },
      { label: 'Posts', href: '/admin/posts', icon: Newspaper },
      { label: 'Reels & Shorts', href: '/admin/reels', icon: Clapperboard },
      { label: '24h Stories', href: '/admin/stories', icon: Sparkles },
      { label: 'Schedule Queue', href: '/admin/schedule-queue', icon: Calendar, badge: 'Queue', badgeVariant: 'indigo' },
      { label: 'AI Moderation Hub', href: '/admin/moderation', icon: ShieldAlert, badge: 'AI Guard', badgeVariant: 'rose' },
      { label: 'Abuse Reports', href: '/admin/reports', icon: ShieldAlert, badge: 2, badgeVariant: 'amber' },
    ],
  },
  {
    title: 'Themes & Add-ons',
    items: [
      { label: 'Frontend Themes', href: '/admin/themes', icon: Palette, badge: 'Blush Core', badgeVariant: 'indigo' },
      { label: 'Plugins & Add-ons', href: '/admin/plugins', icon: Puzzle, badge: '5 Active', badgeVariant: 'emerald' },
      { label: 'Update Center', href: '/admin/updates', icon: RefreshCw }
    ],
  },
  {
    title: 'Finance & Commerce',
    items: [
      { label: 'Coupons & Promos', href: '/admin/promotions', icon: Tag, badge: 'Dynamic', badgeVariant: 'emerald' },
      { label: 'Referrals & Affiliates', href: '/admin/referrals', icon: Share2, badge: 'New', badgeVariant: 'indigo' },
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
      { label: 'Invoices & Receipts', href: '/admin/invoices', icon: FileText, badge: 'New', badgeVariant: 'indigo' },
      { label: 'Platform Fees & Taxes', href: '/admin/tax-fees', icon: Percent, badge: 'Dynamic', badgeVariant: 'emerald' },
      { label: 'VIP Memberships', href: '/admin/memberships', icon: Crown },
      { label: 'Transactions', href: '/admin/transactions', icon: Receipt },
      { label: 'Payout Requests', href: '/admin/payouts', icon: Wallet, badge: 1, badgeVariant: 'emerald' },
    ],
  },
  {
    title: 'System & Maintenance',
    items: [
      { label: 'System Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
      { label: 'Maintenance & Tools', href: '/admin/maintenance', icon: Wrench, badge: 'Live', badgeVariant: 'emerald' },
      { label: 'Categories & Tags', href: '/admin/categories', icon: Layers },
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

import { usePlugins } from '@/lib/extensions/plugin-engine';
import { useSiteSettings } from '@/lib/settings/site-settings-context';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { settings } = useSiteSettings();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navFilter, setNavFilter] = useState('');
  const { activePlugins } = usePlugins();
  const siteName = settings.site_name || 'CreatorPulse';
  const siteInitials = siteName.substring(0, 2).toUpperCase();

  const filteredGroups = (() => {
    // Collect dynamic plugin sidebar items from active plugins
    const dynamicPluginItems: NavItem[] = activePlugins
      .filter(p => p.adminSettingsPage?.sidebarItem)
      .map(p => {
        const si = p.adminSettingsPage!.sidebarItem!;
        return {
          label: si.label,
          href: si.href ?? `/admin/plugins/${p.slug}/settings`,
          icon: Settings, // fallback icon — plugins may use an emoji via badge
          badge: si.badge,
          badgeVariant: si.badgeVariant,
        };
      });

    // Build base groups, filtering legacy hardcoded entries
    const base = allAdminNavGroups.map(group => ({
      ...group,
      items: group.items.filter(item => {
        // Keep entries only if plugin is active
        if (item.href === '/admin/stories') {
          return activePlugins.some(p => p.id === 'plugin-creator-stories');
        }
        if (item.href === '/admin/schedule-queue') {
          return activePlugins.some(p => p.id === 'plugin-content-scheduling' || p.slug === 'content-scheduling');
        }
        if (item.href === '/admin/moderation') {
          return activePlugins.some(p => p.id === 'plugin-content-moderation' || p.slug === 'content-moderation' || p.id === 'plugin-ai-content-moderation' || p.slug === 'ai-content-moderation');
        }
        return item.label.toLowerCase().includes(navFilter.toLowerCase());
      }),
    })).filter(group => group.items.length > 0);

    // Append dynamic plugin settings group if any plugins expose sidebar items
    if (dynamicPluginItems.length > 0) {
      const filteredPluginItems = dynamicPluginItems.filter(item =>
        item.label.toLowerCase().includes(navFilter.toLowerCase())
      );
      if (filteredPluginItems.length > 0) {
        base.push({
          title: 'Plugin Settings',
          items: filteredPluginItems,
        });
      }
    }

    return base;
  })();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Quick Menu Filter */}
      {!collapsed && (
        <div className="p-3 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="relative">
            <AdminIcon icon={Search} size="xs" variant="neutral" className="absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter menu items..."
              value={navFilter}
              onChange={(e) => setNavFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-medium shadow-xs"
            />
          </div>
        </div>
      )}

      {/* Navigation Links Scrollable Area */}
      <div className={`flex-1 overflow-y-auto py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 ${
        collapsed ? 'px-2' : 'px-3'
      }`}>
        {filteredGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
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
                    className={`flex items-center rounded-lg text-xs font-semibold transition-all relative group ${
                      collapsed
                        ? 'justify-center py-2 px-0 mx-auto w-10 h-10'
                        : 'justify-between px-3 py-1.5'
                    } ${
                      isActive
                        ? 'bg-indigo-50/60 text-indigo-700 shadow-3xs border border-indigo-100/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`flex items-center z-10 ${collapsed ? 'justify-center' : 'gap-2.5 min-w-0'}`}>
                      <AdminIcon
                        icon={Icon as any}
                        size="xs"
                        variant={isActive ? 'primary' : 'neutral'}
                        active={isActive}
                        container
                        rounded="sm"
                        className="shrink-0 transition-transform duration-200 shadow-4xs"
                      />
                      {!collapsed && (
                        <span className="font-semibold truncate flex items-center gap-1.5">
                          {item.label}
                          {item.isExternal && <AdminIcon icon={ExternalLink} size="xs" variant="neutral" className="opacity-60" />}
                        </span>
                      )}
                    </div>

                    {!collapsed && item.badge !== undefined && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none z-10 shrink-0 ml-1 ${
                          item.badgeVariant === 'emerald'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : item.badgeVariant === 'amber'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : item.badgeVariant === 'blue'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : item.badgeVariant === 'rose'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Active left indicator pill */}
                    {isActive && !collapsed && (
                      <div className="absolute left-1 top-2 bottom-2 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle (Desktop) */}
      <div className="hidden lg:block border-t border-slate-100 p-3 bg-slate-50/50 shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer shadow-2xs"
        >
          {collapsed ? (
            <AdminIcon icon={ChevronRight} size="xs" variant="slate" />
          ) : (
            <AdminIcon icon={ChevronLeft} size="xs" variant="slate" />
          )}
          {!collapsed && <span>Collapse Menu</span>}
        </button>
      </div>
    </div>
  );


  return (
    <>
      {/* Mobile Floating Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 w-11 h-11 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center cursor-pointer active:scale-95 transition-all hover:bg-indigo-700"
        aria-label="Open Admin Menu"
      >
        <AdminIcon icon={Menu} size="sm" className="text-white" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-50 transition-transform duration-300 w-64 shadow-xl flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={siteName} className="h-6.5 w-auto max-w-[100px] object-contain rounded-md shrink-0" />
            ) : (
              <div className="w-6.5 h-6.5 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-[11px] shrink-0">
                {siteInitials}
              </div>
            )}
            <span className="text-xs font-extrabold text-slate-800 tracking-tight">{siteName}</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
            <AdminIcon icon={ChevronLeft} size="sm" variant="slate" />
          </button>
        </div>
        <div className="flex-1 min-h-0">
          {sidebarContent}
        </div>
      </aside>

      {/* Desktop Sidebar (Sticky to full height) */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 shrink-0 sticky top-16 h-[calc(100vh-64px)] transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
