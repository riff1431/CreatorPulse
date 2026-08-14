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
    <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
      <div className="flex items-center gap-2 text-slate-300">
        <Sparkles size={14} className="text-cyan-400 animate-pulse" />
        <span className="font-semibold text-slate-200">CreatorPulse Sandbox Mode:</span>
        <span className="text-slate-400 hidden md:inline">Test all 3 platform roles & dashboards instantly</span>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => handleRoleChange('member')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
            activeRole === 'member'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck size={13} />
          <span>Member View</span>
        </button>

        <button
          onClick={() => handleRoleChange('creator')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
            activeRole === 'creator'
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye size={13} />
          <span>Creator Studio</span>
        </button>

        <button
          onClick={() => handleRoleChange('admin')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
            activeRole === 'admin'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield size={13} />
          <span>Admin Portal</span>
        </button>
      </div>
    </div>
  );
};
