'use client';

import React, { useState } from 'react';
import { UserRole } from '@/lib/supabase/store';
import { Shield, Sparkles, UserCheck, Eye, Key, Crown, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export const RoleSwitcher: React.FC = () => {
  const { role, switchRole } = useAuth();
  const isLive = isSupabaseConfigured();
  const [isOpen, setIsOpen] = useState(false);

  // Hide entirely in live production database mode
  if (isLive) return null;

  const roles: { key: UserRole; label: string; icon: React.ReactNode }[] = [
    { key: 'member', label: 'Member', icon: <UserCheck size={12} /> },
    { key: 'creator', label: 'Creator', icon: <Eye size={12} /> },
    { key: 'moderator', label: 'Moderator', icon: <Key size={12} /> },
    { key: 'admin', label: 'Admin', icon: <Shield size={12} /> },
    { key: 'super_admin', label: 'Super Admin', icon: <Crown size={12} /> },
  ];

  const currentRoleObj = roles.find((r) => r.key === role) || roles[0];

  return (
    <div className="relative z-50 bg-[#FFF9FC] dark:bg-[#150D1C] border-b border-[#F3DCE8] dark:border-[#3A2A4C] px-3 sm:px-4 py-1.5 text-xs transition-colors select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Role Sandbox Label */}
        <div className="flex items-center gap-1.5 text-[#71717A] dark:text-[#D4B8D0] shrink-0">
          <Sparkles size={13} className="text-[#EC4899] animate-pulse" />
          <span className="font-bold text-[#18181B] dark:text-[#FDF2F8]">Role Sandbox:</span>
          <span className="text-[#71717A] dark:text-[#D4B8D0] hidden sm:inline font-medium text-[11px]">
            Switch demo role
          </span>
        </div>

        {/* Mobile Dropdown Trigger */}
        <div className="relative sm:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] text-[11px] font-bold text-[#EC4899] shadow-2xs"
          >
            {currentRoleObj.icon}
            <span>{currentRoleObj.label}</span>
            <ChevronDown size={11} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl p-1.5 shadow-xl z-50 space-y-1">
              {roles.map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    switchRole(r.key);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-[11px] font-bold transition-colors ${
                    role === r.key
                      ? 'bg-[#FFF1F7] dark:bg-[#381A2B] text-[#EC4899]'
                      : 'text-[#71717A] dark:text-[#D4B8D0] hover:bg-[#FFF9FC] dark:hover:bg-[#241A30]'
                  }`}
                >
                  {r.icon}
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop / Tablet Horizontal Role Pill Buttons */}
        <div className="hidden sm:flex items-center gap-1 bg-white/70 dark:bg-[#1A1222]/70 p-0.5 rounded-xl border border-[#F3DCE8] dark:border-[#3A2A4C] overflow-x-auto">
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => switchRole(r.key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                role === r.key
                  ? 'bg-[#FFF1F7] dark:bg-[#381A2B] text-[#BE185D] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] shadow-2xs'
                  : 'text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-[#FDF2F8]'
              }`}
            >
              {r.icon}
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSwitcher;
