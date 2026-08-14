'use client';

import React, { useState, useEffect } from 'react';
import { UserRole } from '@/lib/supabase/store';
import { Shield, Sparkles, UserCheck, Eye } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>('member');

  useEffect(() => {
    const savedRole = localStorage.getItem('creatorpulse_active_role') as UserRole;
    if (savedRole) {
      setActiveRole(savedRole);
    }
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    localStorage.setItem('creatorpulse_active_role', role);
    window.dispatchEvent(new CustomEvent('creatorpulse_role_changed', { detail: role }));
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-[#F3DCE8] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-xs">
      <div className="flex items-center gap-2 text-[#71717A]">
        <Sparkles size={14} className="text-[#EC4899] animate-pulse" />
        <span className="font-bold text-[#18181B]">CreatorPulse Sandbox:</span>
        <span className="text-[#71717A] hidden md:inline font-medium">Switch between Member, Creator Studio & Admin Portal</span>
      </div>

      <div className="flex items-center gap-1.5 bg-[#FFF9FC] p-1 rounded-2xl border border-[#F3DCE8]">
        <button
          onClick={() => handleRoleChange('member')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
            activeRole === 'member'
              ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
              : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          <UserCheck size={13} />
          <span>Member View</span>
        </button>

        <button
          onClick={() => handleRoleChange('creator')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
            activeRole === 'creator'
              ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
              : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          <Eye size={13} />
          <span>Creator Studio</span>
        </button>

        <button
          onClick={() => handleRoleChange('admin')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
            activeRole === 'admin'
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
