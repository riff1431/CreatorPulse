'use client';

import React from 'react';

/**
 * Creator Verification Manager — Settings Page
 * Rendered at /admin/plugins/creator-verification/settings
 * Settings are automatically managed by the PluginSettingsFramework
 * using the settingsSchema defined in manifest.json.
 */
const VerificationSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg">
          ✅
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#18181B]">Creator Verification Manager</h2>
          <p className="text-[11px] text-[#71717A]">Configure verification requirements, document policies, badge styles, and notification preferences.</p>
        </div>
      </div>
      <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50">
        <p className="text-xs text-emerald-800 font-semibold">ℹ️ Settings are managed through the Plugin Settings Framework. Changes are auto-saved and take effect immediately.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 bg-white">
          <h3 className="font-bold text-sm text-[#18181B] mb-1">📋 General</h3>
          <p className="text-[11px] text-[#71717A]">Master enable/disable, auto-approve, and SLA targets.</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 bg-white">
          <h3 className="font-bold text-sm text-[#18181B] mb-1">📄 Requirements</h3>
          <p className="text-[11px] text-[#71717A]">Document requirements, follower thresholds, upload limits.</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 bg-white">
          <h3 className="font-bold text-sm text-[#18181B] mb-1">🔔 Notifications</h3>
          <p className="text-[11px] text-[#71717A]">Admin and creator notification preferences.</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 bg-white">
          <h3 className="font-bold text-sm text-[#18181B] mb-1">🏅 Badges</h3>
          <p className="text-[11px] text-[#71717A]">Badge style, color, and expiry configuration.</p>
        </div>
      </div>
    </div>
  );
};

export default VerificationSettingsPage;
