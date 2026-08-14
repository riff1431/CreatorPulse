'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PluginManifest, PluginHookType } from './plugin-types';
import { DEFAULT_PLUGINS } from './default-extensions';
import { logAuditEvent } from './package-installer';

interface PluginContextType {
  plugins: PluginManifest[];
  activePlugins: PluginManifest[];
  togglePlugin: (pluginId: string, enabled: boolean) => void;
  updatePluginSettings: (pluginId: string, values: Record<string, any>) => void;
  toggleAutoUpdate: (pluginId: string, autoUpdate: boolean) => void;
  updatePluginVersion: (pluginId: string) => void;
  installPlugin: (manifest: PluginManifest) => boolean;
  deletePlugin: (pluginId: string) => boolean;
  isHookActive: (hookName: PluginHookType) => boolean;
  getHookPlugins: (hookName: PluginHookType) => PluginManifest[];
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

const STORAGE_PLUGINS_KEY = 'creatorpulse_plugins';

export const PluginProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plugins, setPlugins] = useState<PluginManifest[]>(DEFAULT_PLUGINS);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedPluginsRaw = localStorage.getItem(STORAGE_PLUGINS_KEY);
      if (storedPluginsRaw) {
        setPlugins(JSON.parse(storedPluginsRaw));
      }
    } catch (e) {
      console.error('Failed to load plugins from storage', e);
    }
  }, []);

  const activePlugins = plugins.filter((p) => p.isEnabled);

  const togglePlugin = (pluginId: string, enabled: boolean) => {
    const target = plugins.find((p) => p.id === pluginId);
    if (!target) return;

    const updated = plugins.map((p) => {
      if (p.id === pluginId) {
        return { ...p, isEnabled: enabled, updatedAt: new Date().toISOString().split('T')[0] };
      }
      return p;
    });

    setPlugins(updated);
    localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(updated));

    logAuditEvent({
      action: enabled ? 'PLUGIN_ACTIVATED' : 'PLUGIN_DEACTIVATED',
      entityType: 'plugin',
      entityName: target.name,
      details: `${enabled ? 'Enabled' : 'Disabled'} add-on version ${target.version}`,
      severity: enabled ? 'success' : 'info'
    });
  };

  const updatePluginSettings = (pluginId: string, values: Record<string, any>) => {
    const target = plugins.find((p) => p.id === pluginId);
    if (!target) return;

    const updated = plugins.map((p) => {
      if (p.id === pluginId) {
        return {
          ...p,
          settingsValues: {
            ...p.settingsValues,
            ...values
          },
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    });

    setPlugins(updated);
    localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(updated));

    logAuditEvent({
      action: 'PLUGIN_CONFIG_SAVED',
      entityType: 'plugin',
      entityName: target.name,
      details: `Saved updated configuration parameters`,
      severity: 'info'
    });
  };

  const toggleAutoUpdate = (pluginId: string, autoUpdate: boolean) => {
    const updated = plugins.map((p) => (p.id === pluginId ? { ...p, autoUpdate } : p));
    setPlugins(updated);
    localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(updated));
  };

  const updatePluginVersion = (pluginId: string) => {
    const target = plugins.find((p) => p.id === pluginId);
    if (!target || !target.latestVersion) return;

    const updated = plugins.map((p) => {
      if (p.id === pluginId) {
        return {
          ...p,
          version: p.latestVersion!,
          hasUpdate: false,
          updatedAt: new Date().toISOString().split('T')[0],
          changelog: [
            {
              version: p.latestVersion!,
              date: new Date().toISOString().split('T')[0],
              changes: ['Automatic security and performance upgrade']
            },
            ...p.changelog
          ]
        };
      }
      return p;
    });

    setPlugins(updated);
    localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(updated));

    logAuditEvent({
      action: 'PLUGIN_UPDATED',
      entityType: 'plugin',
      entityName: target.name,
      details: `Updated from v${target.version} to v${target.latestVersion}`,
      severity: 'success'
    });
  };

  const installPlugin = (manifest: PluginManifest): boolean => {
    const exists = plugins.some((p) => p.id === manifest.id);
    let updated: PluginManifest[];

    if (exists) {
      updated = plugins.map((p) => (p.id === manifest.id ? manifest : p));
    } else {
      updated = [...plugins, manifest];
    }

    setPlugins(updated);
    localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(updated));

    logAuditEvent({
      action: 'PLUGIN_INSTALLED',
      entityType: 'plugin',
      entityName: manifest.name,
      details: `Installed add-on v${manifest.version} (${manifest.category})`,
      severity: 'success'
    });
    return true;
  };

  const deletePlugin = (pluginId: string): boolean => {
    const target = plugins.find((p) => p.id === pluginId);
    if (!target) return false;

    const filtered = plugins.filter((p) => p.id !== pluginId);
    setPlugins(filtered);
    localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(filtered));

    logAuditEvent({
      action: 'PLUGIN_DEACTIVATED',
      entityType: 'plugin',
      entityName: target.name,
      details: `Uninstalled and removed plugin package`,
      severity: 'warning'
    });
    return true;
  };

  const isHookActive = (hookName: PluginHookType): boolean => {
    return activePlugins.some((p) => p.hooks.includes(hookName));
  };

  const getHookPlugins = (hookName: PluginHookType): PluginManifest[] => {
    return activePlugins.filter((p) => p.hooks.includes(hookName));
  };

  return (
    <PluginContext.Provider
      value={{
        plugins,
        activePlugins,
        togglePlugin,
        updatePluginSettings,
        toggleAutoUpdate,
        updatePluginVersion,
        installPlugin,
        deletePlugin,
        isHookActive,
        getHookPlugins
      }}
    >
      {children}
    </PluginContext.Provider>
  );
};

export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  return context;
};

/**
 * Universal HookPoint Component for extending UI dynamically without modifying core files.
 */
interface HookPointProps {
  name: PluginHookType;
  context?: Record<string, any>;
  className?: string;
}

export const HookPoint: React.FC<HookPointProps> = ({ name, context = {}, className = '' }) => {
  const { getHookPlugins } = usePlugins();
  const registeredPlugins = getHookPlugins(name);

  if (registeredPlugins.length === 0) return null;

  return (
    <div className={`plugin-hook-point plugin-hook-${name} ${className}`}>
      {registeredPlugins.map((plugin) => {
        try {
          // Render specific built-in add-on behavior based on plugin id
          if (plugin.id === 'plugin-drm-watermark' && name === 'post_card_footer') {
            const watermarkText = plugin.settingsValues.watermarkText || '© CreatorPulse Protected';
            return (
              <div key={plugin.id} className="pt-2 border-t border-[#F3DCE8]/60 flex items-center justify-between text-[10px] text-[#A1A1AA] select-none">
                <span className="flex items-center gap-1 font-semibold">
                  <span className="text-[#EC4899]">🛡️ DRM</span> {watermarkText}
                </span>
                {plugin.settingsValues.includeViewerUsername && (
                  <span className="font-mono bg-[#FFF1F7] px-1.5 py-0.5 rounded text-[#BE185D]">
                    ID: #{context.post?.authorUsername || 'public'}
                  </span>
                )}
              </div>
            );
          }

          if (plugin.id === 'plugin-virtual-gifts' && name === 'post_card_footer') {
            return (
              <div key={plugin.id} className="pt-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[10px] text-[#71717A] font-bold shrink-0">🎁 Quick Gift:</span>
                {['🌹 Rose ($1)', '💎 Diamond ($5)', '🚀 Rocket ($20)'].map((gift) => (
                  <button
                    key={gift}
                    onClick={() => alert(`Gift sent: ${gift}! Handled by Virtual Gifts plugin.`)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF1F7] text-[#BE185D] border border-[#FBCFE8] hover:bg-[#FCE7F3] transition-all shrink-0 cursor-pointer shadow-xs"
                  >
                    {gift}
                  </button>
                ))}
              </div>
            );
          }

          if (plugin.id === 'plugin-virtual-gifts' && name === 'navbar_actions') {
            return (
              <button
                key={plugin.id}
                onClick={() => alert('Virtual Gift Wallet & Store - Powered by Virtual Gifts & Animated Reactions add-on.')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 text-amber-700 border border-amber-300 text-xs font-bold hover:scale-105 transition-transform cursor-pointer"
                title="Virtual Gifts Store"
              >
                <span>🎁 Gifts</span>
              </button>
            );
          }

          return null;
        } catch (err: any) {
          console.error(`Error executing plugin ${plugin.name} on hook ${name}:`, err);
          return null;
        }
      })}
    </div>
  );
};
