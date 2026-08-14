'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Bell, MessageSquare, Search, Shield, User, Compass } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/auth-context';
import { useSiteSettings } from '@/lib/settings/site-settings-context';

export function Navbar() {
  const { user, role, logout } = useAuth();
  const { settings } = useSiteSettings();

  return (
    <header className="w-full bg-[#0F172A]/90 backdrop-blur-xl border-b border-[#334155]/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30 group-hover:scale-105 transition-transform">
            <Sparkles className="text-white" size={20} />
          </div>
          <span className="font-black text-lg text-white tracking-tight">
            {settings.site_name || 'CreatorPulse'}{' '}
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#06B6D4] border border-[#8B5CF6]/40">
              Midnight Cyber
            </span>
          </span>
        </Link>

        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
            <input
              type="text"
              placeholder="Search cyber creators, posts, audio..."
              className="w-full bg-[#1E293B] border border-[#334155] rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#8B5CF6] transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/explore">
            <Button variant="outline" size="sm" className="border-[#334155] text-[#94A3B8] hover:text-white">
              <Compass size={15} /> Explore
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/messages">
                <button className="p-2 rounded-xl bg-[#1E293B] text-[#94A3B8] hover:text-white border border-[#334155] cursor-pointer">
                  <MessageSquare size={16} />
                </button>
              </Link>
              <Link href="/notifications">
                <button className="p-2 rounded-xl bg-[#1E293B] text-[#94A3B8] hover:text-white border border-[#334155] cursor-pointer">
                  <Bell size={16} />
                </button>
              </Link>
              <Link href={role === 'creator' ? '/creator/dashboard' : '/c/sarahdesign'}>
                <Avatar alt={user.fullName} src={user.avatarUrl} size="sm" />
              </Link>
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="primary" size="sm" className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
