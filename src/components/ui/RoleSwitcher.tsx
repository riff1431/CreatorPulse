'use client';

import React from 'react';
import { UserRole } from '@/lib/supabase/store';
import { Shield, Sparkles, UserCheck, Eye } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export const RoleSwitcher: React.FC = () => {
  const { role, switchRole } = useAuth();

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-[#F3DCE8] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-xs">
      <div className="flex items-center gap-2 text-[#71717A]">
        <Sparkles size={14} className="text-[#EC4899] animate-pulse" />
        <span className="font-bold text-[#18181B]">CreatorPulse Role Sandbox:</span>
        <span className="text-[#71717A] hidden md:inline font-medium">Switch active demo role & permissions</span>
      </div>

      <div className="flex items-center gap-1.5 bg-[#FFF9FC] p-1 rounded-2xl border border-[#F3DCE8]">
        <button
          onClick={() => switchRole('member')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
            role === 'member'
              ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
              : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          <UserCheck size={13} />
          <span>Member View</span>
        </button>

        <button
          onClick={() => switchRole('creator')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
            role === 'creator'
              ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
              : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          <Eye size={13} />
          <span>Creator Studio</span>
        </button>

        <button
          onClick={() => switchRole('admin')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
            role === 'admin'
              ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
              : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          <Shield size={13} />
          <span>Admin Portal</span>
        </button>
      </div>
    </div>
  );
};
