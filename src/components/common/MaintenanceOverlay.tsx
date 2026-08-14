'use client';

import React from 'react';
import { ShieldAlert, Wrench, Sparkles } from 'lucide-react';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { useAuth } from '@/lib/auth/auth-context';

export const MaintenanceOverlay: React.FC = () => {
  const { settings } = useSiteSettings();
  const { role } = useAuth();

  const isMaintenance = settings.maintenance_mode;
  const isAdmin = role === 'admin' || role === 'super_admin';

  if (!isMaintenance || isAdmin) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-2xl">
          <Wrench size={36} />
        </div>

        <div className="space-y-2">
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Scheduled System Maintenance
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white">{settings.maintenance_title}</h1>
          <p className="text-slate-400 text-xs leading-relaxed font-medium">{settings.maintenance_message}</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-left text-xs space-y-1 text-slate-300">
          <p className="font-bold text-white flex items-center gap-1.5">
            <Sparkles size={14} className="text-pink-400" /> Platform Status
          </p>
          <p className="text-[11px] text-slate-400">
            Our engineers are upgrading database indexes and core services. Access will resume automatically shortly.
          </p>
        </div>
      </div>
    </div>
  );
};
