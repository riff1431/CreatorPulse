'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PluginManifest, PluginHookType } from './plugin-types';
import { DEFAULT_PLUGINS, PLUGIN_LIBRARY_CATALOG } from './default-extensions';
import { logAuditEvent } from './package-installer';
import { PluginLoader } from '@/lib/loaders/plugin-loader';
import { DISCOVERED_PLUGIN_MANIFESTS } from '@/lib/loaders/registry';

interface PluginContextType {
  plugins: PluginManifest[];
  activePlugins: PluginManifest[];
  libraryPlugins: PluginManifest[];
  togglePlugin: (pluginId: string, enabled: boolean) => void;
  updatePluginSettings: (pluginId: string, values: Record<string, unknown>) => void;
  toggleAutoUpdate: (pluginId: string, autoUpdate: boolean) => void;
  updatePluginVersion: (pluginId: string) => void;
  installPlugin: (manifest: PluginManifest) => boolean;
  installFromLibrary: (pluginId: string) => boolean;
  deletePlugin: (pluginId: string) => boolean;
  isHookActive: (hookName: PluginHookType) => boolean;
  getHookPlugins: (hookName: PluginHookType) => PluginManifest[];
  activatePluginWithLicense: (pluginId: string, licenseKey?: string) => Promise<{ success: boolean; error?: string }>;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

const STORAGE_PLUGINS_KEY = 'creatorpulse_plugins';

export const PluginProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plugins, setPlugins] = useState<PluginManifest[]>(DISCOVERED_PLUGIN_MANIFESTS);

  // Load dynamically from /api/admin/plugins and filesystem on mount
  useEffect(() => {
    const initPlugins = async () => {
      try {
        let basePlugins = DISCOVERED_PLUGIN_MANIFESTS;

        // 1. Fetch live scanned plugins from server API
        try {
          const res = await fetch('/api/admin/plugins');
          const data = await res.json();
          if (data.success && Array.isArray(data.plugins) && data.plugins.length > 0) {
            basePlugins = data.plugins;
          }
        } catch (apiErr) {
          console.warn('[PluginEngine] Fallback to local registry', apiErr);
        }

        const storedPluginsRaw = localStorage.getItem(STORAGE_PLUGINS_KEY);
        let storedCustom: PluginManifest[] = [];
        if (storedPluginsRaw) {
          try {
            storedCustom = JSON.parse(storedPluginsRaw);
          } catch (e) {}
        }

        let loadedPlugins = PluginLoader.discoverPlugins(
          basePlugins.map((bp) => {
            const override = storedCustom.find((s) => s.id === bp.id);
            return override ? { ...bp, ...override } : bp;
          })
        );

        // 2. Fetch secure licenses from server
        try {
          const res = await fetch('/api/plugins/license');
          const data = await res.json();
          if (data.success && data.licenses) {
            loadedPlugins = loadedPlugins.map((p: PluginManifest) => {
              const secureLicense = data.licenses[p.id];
              if (secureLicense) {
                return {
                  ...p,
                  licenseKey: secureLicense.licenseKey,
                  licenseStatus: secureLicense.licenseStatus,
                  hasError: false,
                  errorMessage: undefined
                };
              }
              // If it requires license but server doesn't have it, ensure it's unlicensed and disabled
              if (p.requiresLicense && p.licenseStatus === 'licensed') {
                return {
                  ...p,
                  licenseStatus: 'unlicensed' as const,
                  isEnabled: false
                };
              }
              return p;
            });
          }
        } catch (err) {
          console.error('Failed to sync plugin licenses from server vault:', err);
        }

        setPlugins(loadedPlugins);
      } catch (e) {
        console.error('Failed to load plugins from storage', e);
        setPlugins(DISCOVERED_PLUGIN_MANIFESTS);
      }
    };
    const timer = setTimeout(initPlugins, 0);
    return () => clearTimeout(timer);
  }, []);

  const activePlugins = plugins.filter((p) => p.isEnabled && (!p.requiresLicense || p.licenseStatus === 'licensed'));

  const CORE_VERSION = '1.2.0';

  const isVersionCompatible = (minVersion: string): boolean => {
    try {
      const coreParts = CORE_VERSION.split('.').map(Number);
      const minParts = minVersion.split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        const c = coreParts[i] || 0;
        const m = minParts[i] || 0;
        if (c > m) return true;
        if (m > c) return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  const togglePlugin = (pluginId: string, enabled: boolean) => {
    const target = plugins.find((p) => p.id === pluginId);
    if (!target) return;

    // Enforce compatibility and licensing checks upon activation
    if (enabled) {
      if (target.requiresLicense && target.licenseStatus !== 'licensed') {
        alert(`Cannot activate "${target.name}": This plugin requires a valid license key. Please activate it with a license first.`);
        return;
      }

      const minVersion = target.minAppVersion || '1.0.0';
      if (!isVersionCompatible(minVersion)) {
        alert(`Cannot activate "${target.name}": requires core app version v${minVersion} (you have v${CORE_VERSION}).`);
        
        const updated = plugins.map((p) => {
          if (p.id === pluginId) {
            return {
              ...p,
              isEnabled: false,
              hasError: true,
              errorMessage: `Requires Core App version v${minVersion}.`
            };
          }
          return p;
        });
        setPlugins(updated);
        localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(updated));
        return;
      }
    } else {
      // Deactivation Guard: Prevent deactivating the active default payment gateway
      if (target.hooks.includes('payment_gateway_methods') && target.settingsValues.isDefault === true) {
        alert(`Security Guard: Cannot disable "${target.name}" because it is the active default Payment Gateway. Please configure another gateway as default first.`);
        return;
      }
    }

    const updated = plugins.map((p) => {
      if (p.id === pluginId) {
        return { 
          ...p, 
          isEnabled: enabled, 
          hasError: false,
          errorMessage: undefined,
          updatedAt: new Date().toISOString().split('T')[0] 
        };
      }
      return p;
    });

    setPlugins(updated);
    localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(updated));

    // Sync toggle status to server
    fetch('/api/admin/plugins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', pluginId, isEnabled: enabled })
    }).catch(err => console.warn('[PluginEngine] Server sync warning:', err));

    // Execute standard WordPress-like lifecycle hook
    PluginLoader.executeLifecycle(pluginId, enabled ? 'onActivate' : 'onDeactivate');

    logAuditEvent({
      action: enabled ? 'PLUGIN_ACTIVATED' : 'PLUGIN_DEACTIVATED',
      entityType: 'plugin',
      entityName: target.name,
      details: `${enabled ? 'Enabled' : 'Disabled'} add-on version ${target.version}`,
      severity: enabled ? 'success' : 'info'
    });
  };

  const updatePluginSettings = (pluginId: string, values: Record<string, unknown>) => {
    const target = plugins.find((p) => p.id === pluginId);
    if (!target) return;

    // Default Gateway Constraint checks
    const isPaymentGateway = target.hooks.includes('payment_gateway_methods');
    if (isPaymentGateway) {
      const wasDefault = target.settingsValues.isDefault === true;
      const willBeDefault = values.isDefault === true;
      
      if (wasDefault && !willBeDefault) {
        const otherActiveDefault = plugins.some(
          p => p.id !== pluginId && 
               p.isEnabled && 
               p.hooks.includes('payment_gateway_methods') && 
               p.settingsValues.isDefault === true
        );
        if (!otherActiveDefault) {
          alert('Validation Error: There must be at least one active default payment gateway.');
          return;
        }
      }
    }

    // Intercept passwords/secrets to save server-side securely
    const passwordFieldKeys = target.settingsSchema
      .filter((field) => field.type === 'password')
      .map((field) => field.id);

    const secretSecrets: Record<string, string> = {};
    let hasSecretsToUpload = false;

    passwordFieldKeys.forEach((key) => {
      const value = values[key];
      if (value !== undefined && value !== '••••••••' && value !== '••••••••••••••••') {
        secretSecrets[key] = value as string;
        hasSecretsToUpload = true;
        values[key] = '••••••••';
      }
    });

    if (hasSecretsToUpload) {
      fetch('/api/payments/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gatewayId: pluginId, secrets: secretSecrets })
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('[Engine] Secrets sync failed:', data.error);
        } else {
          console.log('[Engine] Secrets synchronized to server vault successfully.');
        }
      })
      .catch((err) => console.error('[Engine] Failed to upload secrets:', err));
    }

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
      
      if (isPaymentGateway && values.isDefault === true && p.hooks.includes('payment_gateway_methods')) {
        return {
          ...p,
          settingsValues: {
            ...p.settingsValues,
            isDefault: false
          }
        };
      }
      
      return p;
    });

    setPlugins(updated);
    localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(updated));

    // Sync settings to server
    fetch('/api/admin/plugins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'settings', pluginId, settingsValues: values })
    }).catch(err => console.warn('[PluginEngine] Server sync warning:', err));

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

    // Execute lifecycle update hook
    PluginLoader.executeLifecycle(pluginId, 'onUpdate', target.version);

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

    // Sync installed plugin to server
    fetch('/api/admin/plugins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'install', manifest })
    }).catch(err => console.warn('[PluginEngine] Server sync warning:', err));

    // Execute lifecycle install hook
    PluginLoader.executeLifecycle(manifest.id, 'onInstall');

    logAuditEvent({
      action: 'PLUGIN_INSTALLED',
      entityType: 'plugin',
      entityName: manifest.name,
      details: `Installed add-on v${manifest.version} (${manifest.category})`,
      severity: 'success'
    });
    return true;
  };

  const installFromLibrary = (pluginId: string): boolean => {
    const catalogItem = PLUGIN_LIBRARY_CATALOG.find((p) => p.id === pluginId);
    if (!catalogItem) return false;

    const manifest: PluginManifest = {
      ...catalogItem,
      isEnabled: false,
      installedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    return installPlugin(manifest);
  };

  const deletePlugin = (pluginId: string): boolean => {
    const target = plugins.find((p) => p.id === pluginId);
    if (!target) return false;

    if (target.hooks.includes('payment_gateway_methods') && target.settingsValues.isDefault === true) {
      alert(`Deletion Lock: Cannot uninstall "${target.name}" because it is currently set as the default Payment Gateway. Please assign another gateway as default first.`);
      return false;
    }

    fetch('/api/payments/secrets', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gatewayId: pluginId })
    }).catch(err => console.error('[Engine] Failed to clean vault secrets', err));

    fetch('/api/plugins/license', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pluginId })
    }).catch(err => console.error('[Engine] Failed to clean secure license', err));

    // Execute lifecycle uninstall hook
    PluginLoader.executeLifecycle(pluginId, 'onUninstall');

    const filtered = plugins.filter((p) => p.id !== pluginId);
    setPlugins(filtered);
    localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(filtered));

    // Sync deletion to server to purge directory from filesystem
    fetch('/api/admin/plugins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', pluginId })
    }).catch(err => console.warn('[PluginEngine] Server delete warning:', err));

    logAuditEvent({
      action: 'PLUGIN_DELETED',
      entityType: 'plugin',
      entityName: target.name,
      details: `Uninstalled and removed plugin package`,
      severity: 'warning'
    });
    return true;
  };

  const activatePluginWithLicense = async (pluginId: string, licenseKey?: string): Promise<{ success: boolean; error?: string }> => {
    const target = plugins.find((p) => p.id === pluginId);
    if (!target) return { success: false, error: 'Plugin not found' };

    try {
      const res = await fetch('/api/plugins/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginId, licenseKey })
      });
      const data = await res.json();
      if (data.error) {
        return { success: false, error: data.error };
      }

      // Update state and storage
      const updated = plugins.map((p) => {
        if (p.id === pluginId) {
          return {
            ...p,
            licenseKey,
            licenseStatus: 'licensed' as const,
            isEnabled: true, // auto enable after successful activation
            hasError: false,
            errorMessage: undefined
          };
        }
        return p;
      });

      setPlugins(updated);
      localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(updated));

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
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
        libraryPlugins: PLUGIN_LIBRARY_CATALOG,
        togglePlugin,
        updatePluginSettings,
        toggleAutoUpdate,
        updatePluginVersion,
        installPlugin,
        installFromLibrary,
        deletePlugin,
        isHookActive,
        getHookPlugins,
        activatePluginWithLicense
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
 * Universal HookPoint Component for extending UI dynamically without modifying core application code.
 */
interface HookPointProps {
  name: PluginHookType;
  context?: Record<string, unknown>;
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
          // 1. Post Card Footer Hooks
          if (name === 'post_card_footer') {
            if (plugin.id === 'plugin-drm-watermark') {
              const watermarkText = String(plugin.settingsValues.watermarkText || '© CreatorPulse Protected');
              const postAuthor = String((context as any)?.post?.authorUsername || 'public');
              return (
                <div key={plugin.id} className="pt-2 border-t border-[#F3DCE8]/60 flex items-center justify-between text-[10px] text-[#A1A1AA] select-none">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="text-[#EC4899]">🛡️ DRM</span> {watermarkText}
                  </span>
                  {Boolean(plugin.settingsValues.includeViewerUsername) && (
                    <span className="font-mono bg-[#FFF1F7] px-1.5 py-0.5 rounded text-[#BE185D]">
                      ID: #{postAuthor}
                    </span>
                  )}
                </div>
              );
            }

            if (plugin.id === 'plugin-virtual-gifts') {
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

            if (plugin.id === 'plugin-podcast-audio') {
              return (
                <div key={plugin.id} className="p-2.5 bg-[#FFF9FC] rounded-xl border border-[#F3DCE8] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎙️</span>
                    <div className="text-left">
                      <p className="font-bold text-[#18181B] text-[11px]">Creator Podcast Episode Preview</p>
                      <p className="text-[9px] text-[#71717A]">SonicWave Hi-Res Audio Stream</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert('Playing Hi-Res Audio stream via SonicWave plugin.')}
                    className="px-2.5 py-1 rounded-lg bg-[#EC4899] text-white text-[10px] font-bold shadow-xs hover:bg-[#DB2777]"
                  >
                    ▶ Listen
                  </button>
                </div>
              );
            }

            if (plugin.id === 'plugin-crypto-tips') {
              return (
                <div key={plugin.id} className="pt-1.5 flex items-center justify-end">
                  <button
                    onClick={() => alert('Opening USDC Web3 instant tip checkout.')}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
                  >
                    <span>🪙 Tip USDC</span>
                  </button>
                </div>
              );
            }
          }

          // 2. Navbar Action Hooks
          if (name === 'navbar_actions') {
            if (plugin.id === 'plugin-virtual-gifts') {
              return (
                <button
                  key={plugin.id}
                  onClick={() => alert('Virtual Gift Wallet & Store — Powered by Virtual Gifts plugin.')}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 text-amber-700 border border-amber-300 text-xs font-bold hover:scale-105 transition-transform cursor-pointer"
                  title="Virtual Gifts Store"
                >
                  <span>🎁 Gifts</span>
                </button>
              );
            }
          }

          // 3. Creator Dashboard Widget Hooks
          if (name === 'creator_dashboard_widgets') {
            if (plugin.id === 'plugin-gemini-ai') {
              return (
                <div key={plugin.id} className="p-4 bg-gradient-to-br from-[#FFF1F7] to-white border border-[#F3DCE8] rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💬</span>
                      <h4 className="font-bold text-xs text-[#18181B]">Gemini AI Assistant</h4>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FCE7F3] text-[#BE185D]">
                      Active Model: {String(plugin.settingsValues.aiModel || 'gemini-1.5-flash')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] leading-relaxed">
                    AI Auto-Suggest is active with {String(plugin.settingsValues.defaultTone || 'energetic')} tone. Trending hashtags will automatically attach to your new posts.
                  </p>
                </div>
              );
            }

            if (plugin.id === 'plugin-discord-sync') {
              return (
                <div key={plugin.id} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💬</span>
                      <h4 className="font-bold text-xs text-[#1E293B]">Discord Role Sync</h4>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Connected
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    Active VIP subscribers are automatically synced to your Discord Guild roles.
                  </p>
                </div>
              );
            }
          }

          // 4. Sidebar Extra Links
          if (name === 'sidebar_extra_links') {
            if (plugin.id === 'plugin-podcast-audio') {
              return (
                <div key={plugin.id} className="px-3 py-1.5 text-xs text-[#71717A] font-semibold flex items-center gap-2">
                  <span>🎙️</span>
                  <span>Audio Podcasts Active</span>
                </div>
              );
            }
          }

          // Generic fallback for custom third-party SDK plugins
          return (
            <div key={plugin.id} className="inline-block p-1 text-[10px] text-[#71717A]">
              <span className="font-mono bg-[#FFF1F7] text-[#BE185D] px-1.5 py-0.5 rounded border border-[#FBCFE8]">
                {plugin.name}
              </span>
            </div>
          );
        } catch (err) {
          console.error(`[Plugin Engine] Error executing hook "${name}" in plugin "${plugin.id}":`, err);
          return null;
        }
      })}
    </div>
  );
};
