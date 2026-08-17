'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, Wallet, LayoutDashboard, Shield, Settings, 
  Sun, Moon, LogOut, ChevronDown, ChevronRight
} from 'lucide-react';
import { Avatar } from './Avatar';
import { useAuth } from '@/lib/auth/auth-context';
import { useTheme } from '@/lib/extensions/theme-engine';
import { MOCK_USERS } from '@/lib/supabase/store';

export const UserNavDropdown: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { isDarkMode, toggleDarkMode, setDarkMode } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fallback user if not fully populated
  const currentUser = user || (role === 'admin' 
    ? MOCK_USERS['user-admin'] 
    : role === 'creator' 
    ? MOCK_USERS['user-creator-1'] 
    : MOCK_USERS['user-member']);

  // Handle click outside & Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggleTheme = () => {
    if (toggleDarkMode) {
      toggleDarkMode();
    } else if (setDarkMode) {
      setDarkMode(!isDarkMode);
    } else if (typeof document !== 'undefined') {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme-mode', 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme-mode', 'dark');
      }
    }
  };


  const formattedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member';

  return (
    <div className="relative" ref={userMenuRef} data-tour="user-menu">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className={`h-9 px-1.5 sm:px-2 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer select-none shrink-0 ${
          showUserMenu
            ? 'bg-[#FFF1F7] dark:bg-[#381A2B] border-[#EC4899] shadow-sm shadow-pink-500/10 scale-102'
            : 'bg-white dark:bg-[#1A1222] border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#EC4899] hover:bg-[#FFF9FC] dark:hover:bg-[#241A30]'
        }`}
        aria-label="User Account Menu"
        title={currentUser?.fullName || 'User Profile'}
      >
        <Avatar
          alt={currentUser?.fullName || 'User'}
          src={currentUser?.avatarUrl}
          size="sm"
          isVerified={currentUser?.isVerified}
        />
        <ChevronDown 
          size={14} 
          className={`text-[#71717A] dark:text-[#D4B8D0] transition-transform duration-200 ${
            showUserMenu ? 'rotate-180 text-[#EC4899]' : ''
          }`} 
        />
      </button>

      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white/95 dark:bg-[#1A1222]/95 backdrop-blur-2xl border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-3xl p-3 space-y-2.5 z-50 shadow-2xl shadow-pink-500/15 animate-in fade-in zoom-in-95 duration-150">
          {/* User Header Profile Card */}
          <div className="p-3 rounded-2xl bg-[#FFF9FC] dark:bg-[#241A30] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center gap-3">
            <Avatar
              alt={currentUser?.fullName || 'User'}
              src={currentUser?.avatarUrl}
              size="md"
              isVerified={currentUser?.isVerified}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-[#18181B] dark:text-[#FDF2F8] truncate">
                {currentUser?.fullName || 'User'}
              </p>
              <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] truncate">
                @{currentUser?.username || 'user'}
              </p>
              <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white">
                {formattedRole}
              </span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-0.5 text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
            <Link
              href={`/c/${currentUser?.username || 'user'}`}
              onClick={() => setShowUserMenu(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#EC4899] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <User size={15} className="text-[#EC4899]" />
                <span>My Profile</span>
              </div>
              <ChevronRight size={13} className="text-[#A1A1AA]" />
            </Link>

            <Link
              href="/balance"
              onClick={() => setShowUserMenu(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#EC4899] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Wallet size={15} className="text-emerald-500" />
                <span>Wallet & Payouts</span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold">$2,450.00</span>
            </Link>

            {(role === 'creator' || role === 'admin') && (
              <Link
                href="/creator/dashboard"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#EC4899] transition-colors text-[#BE185D] dark:text-[#F472B6]"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard size={15} />
                  <span>Creator Studio</span>
                </div>
                <ChevronRight size={13} />
              </Link>
            )}

            {role === 'admin' && (
              <Link
                href="/admin/dashboard"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#EC4899] transition-colors text-[#BE185D] dark:text-[#F472B6]"
              >
                <div className="flex items-center gap-2.5">
                  <Shield size={15} />
                  <span>Admin Console</span>
                </div>
                <ChevronRight size={13} />
              </Link>
            )}

            <Link
              href="/settings"
              onClick={() => setShowUserMenu(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] hover:text-[#EC4899] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Settings size={15} className="text-[#71717A]" />
                <span>Account Settings</span>
              </div>
              <ChevronRight size={13} className="text-[#A1A1AA]" />
            </Link>

            <button
              type="button"
              onClick={handleToggleTheme}
              className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] transition-colors text-xs font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
              <span className="text-[10px] text-[#A1A1AA] uppercase">{isDarkMode ? 'Dark' : 'Light'}</span>
            </button>
          </div>

          {/* Logout Button */}
          <div className="pt-1 border-t border-[#F3DCE8] dark:border-[#3A2A4C]">
            <button
              onClick={() => {
                setShowUserMenu(false);
                logout();
              }}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors text-rose-600 dark:text-rose-400 cursor-pointer font-bold"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
