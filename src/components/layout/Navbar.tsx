'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Search, Bell, Moon, Sun, Shield, LayoutDashboard, 
  User, LogOut, PlusSquare
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { UserRole, MOCK_USERS } from '@/lib/supabase/store';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<UserRole>('member');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('light-mode');
  };

  const currentUser = activeRole === 'admin' 
    ? MOCK_USERS['user-admin'] 
    : activeRole === 'creator' 
    ? MOCK_USERS['user-creator-1'] 
    : MOCK_USERS['user-member'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-slate-950/85 backdrop-blur-xl border-b border-pink-500/15 sticky top-0 z-40 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/feed" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
              Creator<span className="gradient-text">Pulse</span>
            </span>
            <span className="text-[10px] text-pink-300/70 block -mt-1 font-medium tracking-wide">Creator SaaS Platform</span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400/60" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators, topics, vertical shorts, or posts..."
            className="w-full bg-pink-950/20 border border-pink-500/20 focus:border-pink-400 rounded-xl pl-10 pr-4 py-2 text-sm text-pink-100 placeholder-pink-300/40 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all"
          />
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-pink-300/80 hover:text-pink-200 hover:bg-pink-500/10 transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Role specific quick action */}
          {activeRole === 'creator' && (
            <Link href="/creator/dashboard">
              <Button variant="primary" size="sm" leftIcon={<PlusSquare size={16} />}>
                <span className="hidden sm:inline">New Post</span>
              </Button>
            </Link>
          )}

          {activeRole === 'admin' && (
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm" leftIcon={<Shield size={16} className="text-pink-400" />}>
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
          )}

          {/* Notifications Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-pink-300/80 hover:text-pink-200 hover:bg-pink-500/10 transition-colors relative"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-400 animate-ping"></span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-400"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 glass-card p-4 space-y-3 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 border-pink-500/25">
                <div className="flex items-center justify-between border-b border-pink-500/20 pb-2">
                  <h4 className="font-semibold text-sm text-pink-100">Notifications</h4>
                  <span className="text-[10px] text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded-full font-medium">3 New</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-pink-950/40 border border-pink-500/20 flex items-start gap-2.5">
                    <Avatar alt="Sarah Jenkins" size="sm" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" />
                    <div>
                      <p className="text-pink-100"><strong className="text-white">Sarah Jenkins</strong> published a new member post: "Modern Micro-Interactions"</p>
                      <span className="text-[10px] text-pink-300/60 mt-1 block">10 minutes ago</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-pink-950/40 border border-pink-500/20 flex items-start gap-2.5">
                    <Avatar alt="Marcus Vance" size="sm" src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150" />
                    <div>
                      <p className="text-pink-100"><strong className="text-white">Marcus Vance</strong> added a new 24h Story</p>
                      <span className="text-[10px] text-pink-300/60 mt-1 block">1 hour ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-pink-500/10 transition-colors"
            >
              <Avatar
                alt={currentUser.fullName}
                src={currentUser.avatarUrl}
                size="sm"
                isVerified={currentUser.isVerified}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-card p-3 space-y-2 z-50 shadow-2xl border-pink-500/25">
                <div className="px-2 py-1 border-b border-pink-500/20 pb-2">
                  <p className="text-sm font-bold text-pink-100">{currentUser.fullName}</p>
                  <p className="text-xs text-pink-300/70">@{currentUser.username}</p>
                  <span className="inline-block text-[10px] uppercase font-bold text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded mt-1 border border-pink-500/30">
                    Role: {activeRole}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-pink-200">
                  <Link
                    href={`/c/${currentUser.username}`}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-pink-500/15 transition-colors"
                  >
                    <User size={14} className="text-pink-400" /> My Profile
                  </Link>

                  {activeRole === 'creator' && (
                    <Link
                      href="/creator/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-pink-500/15 transition-colors text-pink-300 font-medium"
                    >
                      <LayoutDashboard size={14} className="text-pink-400" /> Creator Dashboard
                    </Link>
                  )}

                  {activeRole === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-pink-500/15 transition-colors text-rose-300 font-medium"
                    >
                      <Shield size={14} className="text-rose-400" /> Admin Portal
                    </Link>
                  )}

                  <Link
                    href="/auth/login"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-pink-500/20 hover:text-pink-200 transition-colors text-pink-300/70 border-t border-pink-500/20 mt-1"
                  >
                    <LogOut size={14} /> Switch Account / Logout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
