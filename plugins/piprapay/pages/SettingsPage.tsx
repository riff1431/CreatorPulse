'use client';

import React from 'react';
import { PluginSettingsFramework } from '@/components/admin/PluginSettingsFramework';
import { PluginManifest } from '@/lib/extensions/plugin-types';
import manifest from '../manifest.json';

export const PipraPaySettingsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#18181B]">PipraPay Payment Gateway Settings</h1>
        <p className="text-xs text-slate-500">Configure PipraPay API keys, Base URL, Sandbox/Live mode, and webhook secrets.</p>
      </div>
      <PluginSettingsFramework plugin={manifest as unknown as PluginManifest} />
    </div>
  );
};

export default PipraPaySettingsPage;
