'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Sparkles, Search, Bell, Shield, LayoutDashboard, 
  User, LogOut, PlusSquare, Compass, LogIn 
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { useAuth } from '@/lib/auth/auth-context';
import { MOCK_USERS } from '@/lib/supabase/store';
import { HookPoint } from '@/lib/extensions/plugin-engine';
import { useTheme } from '@/lib/extensions/theme-engine';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { activeTheme } = useTheme();
  const { user, role, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentUser = user || (role === 'admin' 
    ? MOCK_USERS['user-admin'] 
    : role === 'creator' 
    ? MOCK_USERS['user-creator-1'] 
    : MOCK_USERS['user-member']);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isAdminRoute = pathname?.startsWith('/admin');
  const logoUrl = activeTheme?.settings?.logoUrl;
  const headerStyle = activeTheme?.settings?.headerStyle || 'fixed';
  const headerStyleClass = !isAdminRoute && headerStyle === 'floating'
    ? 'theme-header-floating'
    : !isAdminRoute && headerStyle === 'simple'
    ? 'theme-header-simple'
    : 'theme-header-fixed';

  return (
    <header className={`bg-white/85 backdrop-blur-xl border-b border-[#F3DCE8] ${headerStyleClass} z-40 px-4 lg:px-8 py-3 transition-all duration-300 ${
      isScrolled ? 'shadow-md shadow-[#EC4899]/5 py-2.5 bg-white/95' : ''
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/feed" className="flex items-center gap-2.5 group">
          {!isAdminRoute && logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-9 w-auto max-w-[150px] object-contain rounded-xl" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-2xl gradient-btn flex items-center justify-center shadow-md shadow-[#EC4899]/25 group-hover:scale-105 transition-transform">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-[#18181B] flex items-center gap-1">
                  Creator<span className="gradient-text">Pulse</span>
                </span>
                <span className="text-[10px] text-[#71717A] block -mt-1 font-medium tracking-wide">Creator SaaS Platform</span>
              </div>
            </>
          )}
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators, topics, vertical shorts, or posts..."
            className="w-full bg-[#FFF9FC] border border-[#F3DCE8] focus:border-[#EC4899] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-sm text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:ring-3 focus:ring-[#EC4899]/15 transition-all shadow-inner font-medium"
          />
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dynamic Plugin Actions Hook */}
          <HookPoint name="navbar_actions" />

          {/* Role specific quick action */}
          {role === 'creator' && (
            <Link href="/creator/dashboard">
              <Button variant="primary" size="sm" leftIcon={<PlusSquare size={16} />}>
                <span className="hidden sm:inline">New Post</span>
              </Button>
            </Link>
          )}

          {role === 'admin' && (
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm" leftIcon={<Shield size={16} className="text-[#EC4899]" />}>
                <span className="hidden sm:inline">Admin Panel</span>
              </Button>
            </Link>
          )}

          {/* Notifications Dropdown Toggle */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl text-[#71717A] hover:text-[#DB2777] hover:bg-[#FDF2F8] transition-colors relative border border-transparent hover:border-[#F3DCE8] cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EC4899] ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#F3DCE8] rounded-2xl p-4 space-y-3 z-50 shadow-xl shadow-[#EC4899]/10 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-2">
                  <h4 className="font-bold text-sm text-[#18181B]">Notifications</h4>
                  <span className="text-[10px] text-[#DB2777] bg-[#FCE7F3] px-2 py-0.5 rounded-full font-bold">3 New</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#FFF9FC] border border-[#F3DCE8] flex items-start gap-2.5 hover:border-[#F472B6]/40 transition-colors">
                    <Avatar alt="Sarah Jenkins" size="sm" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" />
                    <div>
                      <p className="text-[#18181B]"><strong className="text-[#18181B]">Sarah Jenkins</strong> published a new member post: &quot;Modern Micro-Interactions&quot;</p>
                      <span className="text-[10px] text-[#A1A1AA] mt-1 block">10 minutes ago</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFF9FC] border border-[#F3DCE8] flex items-start gap-2.5 hover:border-[#F472B6]/40 transition-colors">
                    <Avatar alt="Marcus Vance" size="sm" src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150" />
                    <div>
                      <p className="text-[#18181B]"><strong className="text-[#18181B]">Marcus Vance</strong> added a new 24h Story</p>
                      <span className="text-[10px] text-[#A1A1AA] mt-1 block">1 hour ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#EC4899]/30 transition-all cursor-pointer"
            >
              <Avatar
                alt={currentUser.fullName}
                src={currentUser.avatarUrl}
                size="sm"
                isVerified={currentUser.isVerified}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#F3DCE8] rounded-2xl p-3 space-y-2 z-50 shadow-xl shadow-[#EC4899]/10">
                <div className="px-2.5 py-1.5 border-b border-[#F3DCE8] pb-2">
                  <p className="text-sm font-bold text-[#18181B]">{currentUser.fullName}</p>
                  <p className="text-xs text-[#71717A]">@{currentUser.username}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="inline-block text-[10px] uppercase font-bold text-[#BE185D] bg-[#FCE7F3] px-2.5 py-0.5 rounded-full border border-[#FBCFE8]">
                      Role: {role}
                    </span>
                    {currentUser.isVerified && (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-[#18181B] font-medium">
                  <Link
                    href={`/c/${currentUser.username}`}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FFF1F7] text-[#18181B] hover:text-[#DB2777] transition-colors"
                  >
                    <User size={15} className="text-[#EC4899]" /> My Profile
                  </Link>

                  {role === 'creator' && (
                    <Link
                      href="/creator/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FFF1F7] text-[#BE185D] transition-colors"
                    >
                      <LayoutDashboard size={15} className="text-[#EC4899]" /> Creator Studio
                    </Link>
                  )}

                  {role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FFF1F7] text-[#BE123C] transition-colors"
                    >
                      <Shield size={15} className="text-[#F43F5E]" /> Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FFE4E6] hover:text-[#BE123C] transition-colors text-[#71717A] border-t border-[#F3DCE8] mt-1 pt-2 cursor-pointer font-bold"
                  >
                    <LogOut size={15} className="text-[#F43F5E]" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
