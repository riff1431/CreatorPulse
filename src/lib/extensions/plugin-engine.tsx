'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PluginManifest, PluginHookType, PluginBackup } from './plugin-types';
import { PLUGIN_LIBRARY_CATALOG } from './default-extensions';
import { logAuditEvent } from './package-installer';
import { PluginLoader } from '@/lib/loaders/plugin-loader';
import { DISCOVERED_PLUGIN_MANIFESTS } from '@/lib/loaders/registry';
import { CompatibilityChecker } from '@/lib/loaders/compatibility-checker';
import { useI18n } from '@/lib/i18n/i18n-context';

interface PluginContextType {
  plugins: PluginManifest[];
  activePlugins: PluginManifest[];
  libraryPlugins: PluginManifest[];
  togglePlugin: (pluginId: string, enabled: boolean) => void;
  updatePluginSettings: (pluginId: string, values: Record<string, unknown>) => void;
  resetPluginSettings: (pluginId: string) => void;
  getPluginSettingsPageUrl: (plugin: PluginManifest) => string;
  toggleAutoUpdate: (pluginId: string, autoUpdate: boolean) => void;
  updatePluginVersion: (pluginId: string) => void;
  installPlugin: (manifest: PluginManifest) => boolean;
  installFromLibrary: (pluginId: string) => boolean;
  deletePlugin: (pluginId: string) => boolean;
  isHookActive: (hookName: PluginHookType) => boolean;
  getHookPlugins: (hookName: PluginHookType) => PluginManifest[];
  activatePluginWithLicense: (pluginId: string, licenseKey?: string) => Promise<{ success: boolean; error?: string }>;
  updatePluginWithBackup: (pluginId: string) => Promise<{ success: boolean; error?: string }>;
  rollbackToPluginBackup: (backupId: string) => { success: boolean; error?: string };
  backups: PluginBackup[];
  deleteBackup: (backupId: string) => void;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

const STORAGE_PLUGINS_KEY = 'creatorpulse_plugins';

export const PluginProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plugins, setPlugins] = useState<PluginManifest[]>(DISCOVERED_PLUGIN_MANIFESTS);
  const [backups, setBackups] = useState<PluginBackup[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('creatorpulse_plugin_backups');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error('Failed to load plugin backups from localStorage', e);
      }
    }
    return [];
  });

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
          } catch {
            // ignore error
          }
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

  const { registerPluginTranslations } = useI18n();

  useEffect(() => {
    activePlugins.forEach((plugin) => {
      if (plugin.translations) {
        registerPluginTranslations(plugin.id, plugin.translations);
      }
    });
  }, [activePlugins, registerPluginTranslations]);

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
    } catch {
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

      // Dependencies Check:
      if (target.dependencies && typeof target.dependencies === 'object') {
        const deps = target.dependencies as Record<string, unknown>;
        if (deps.plugins && typeof deps.plugins === 'object') {
          const pluginsToEnable: string[] = [];
          for (const [depId, minVer] of Object.entries(deps.plugins)) {
            const dep = plugins.find(p => p.id === depId || p.slug === depId);
            if (!dep) {
              alert(`Cannot activate "${target.name}": Required dependency plugin "${depId}" (v${minVer}+) is not installed.`);
              return;
            }
            if (dep.version && minVer) {
              const hasCompatibleVersion = CompatibilityChecker.compareVersions(dep.version, minVer as string);
              if (!hasCompatibleVersion) {
                alert(`Cannot activate "${target.name}": Dependency "${dep.name}" version is v${dep.version}, but v${minVer} or higher is required.`);
                return;
              }
            }
            if (!dep.isEnabled) {
              pluginsToEnable.push(dep.id);
            }
          }

          if (pluginsToEnable.length > 0) {
            const depNames = pluginsToEnable.map(id => plugins.find(p => p.id === id)?.name || id).join(', ');
            if (window.confirm(`"${target.name}" requires the following dependency plugin(s) to be enabled: ${depNames}. Enable them automatically now?`)) {
              // Enable dependencies first
              let updatedPlugins = [...plugins];
              pluginsToEnable.forEach(depId => {
                updatedPlugins = updatedPlugins.map(p => p.id === depId ? { ...p, isEnabled: true, updatedAt: new Date().toISOString().split('T')[0] } : p);
                PluginLoader.executeLifecycle(depId, 'onActivate');
              });
              // Enable target plugin
              updatedPlugins = updatedPlugins.map(p => p.id === pluginId ? { ...p, isEnabled: true, updatedAt: new Date().toISOString().split('T')[0] } : p);
              setPlugins(updatedPlugins);
              localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(updatedPlugins));
              
              // Run lifecycle on target
              PluginLoader.executeLifecycle(pluginId, 'onActivate');

              logAuditEvent({
                action: 'PLUGIN_ACTIVATED',
                entityType: 'plugin',
                entityName: target.name,
                details: `Activated plugin and its dependencies (${depNames})`,
                severity: 'success'
              });
              return;
            } else {
              // Abort activation
              return;
            }
          }
        }
      }
    } else {
      // Deactivation Guard: Prevent deactivating the active default payment gateway
      if (target.hooks.includes('payment_gateway_methods') && target.settingsValues.isDefault === true) {
        alert(`Security Guard: Cannot disable "${target.name}" because it is the active default Payment Gateway. Please configure another gateway as default first.`);
        return;
      }

      // Dependents check: find other active plugins that depend on this plugin
      const activeDependents = plugins.filter(p => {
        if (!p.isEnabled || p.id === pluginId) return false;
        if (p.dependencies && typeof p.dependencies === 'object') {
          const deps = p.dependencies as Record<string, unknown>;
          if (deps.plugins && typeof deps.plugins === 'object') {
            return Object.keys(deps.plugins).some(depId => depId === target.id || depId === target.slug);
          }
        }
        return false;
      });

      if (activeDependents.length > 0) {
        const depNames = activeDependents.map(d => d.name).join(', ');
        if (window.confirm(`Warning: The following active plugin(s) depend on "${target.name}": ${depNames}. Disabling it will break them. Disable "${target.name}" and all dependent plugins together?`)) {
          // Disable dependents and target plugin
          const idsToDisable = [pluginId, ...activeDependents.map(d => d.id)];
          let updatedPlugins = [...plugins];
          idsToDisable.forEach(id => {
            updatedPlugins = updatedPlugins.map(p => p.id === id ? { ...p, isEnabled: false, updatedAt: new Date().toISOString().split('T')[0] } : p);
            PluginLoader.executeLifecycle(id, 'onDeactivate');
          });
          setPlugins(updatedPlugins);
          localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(updatedPlugins));

          logAuditEvent({
            action: 'PLUGIN_DEACTIVATED',
            entityType: 'plugin',
            entityName: target.name,
            details: `Deactivated plugin and its dependent plugins (${depNames})`,
            severity: 'info'
          });
          return;
        } else {
          // Abort deactivation
          return;
        }
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

    // Sync settings to server legacy endpoint
    fetch('/api/admin/plugins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'settings', pluginId, settingsValues: values })
    }).catch(err => console.warn('[PluginEngine] Server sync warning:', err));

    // Persist settings to disk via dedicated settings API
    fetch('/api/admin/plugins/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pluginId, settingsValues: values })
    }).catch(err => console.warn('[PluginEngine] Disk settings persist warning:', err));

    logAuditEvent({
      action: 'PLUGIN_CONFIG_SAVED',
      entityType: 'plugin',
      entityName: target.name,
      details: `Saved updated configuration parameters`,
      severity: 'info'
    });
  };

  const resetPluginSettings = (pluginId: string) => {
    const target = plugins.find((p) => p.id === pluginId);
    if (!target) return;

    // Build defaults from schema
    const defaultValues: Record<string, unknown> = {};
    for (const field of target.settingsSchema) {
      defaultValues[field.id] = field.defaultValue;
    }

    const updated = plugins.map((p) =>
      p.id === pluginId
        ? { ...p, settingsValues: defaultValues, updatedAt: new Date().toISOString().split('T')[0] }
        : p
    );
    setPlugins(updated);
    localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(updated));

    // Reset on disk too
    fetch(`/api/admin/plugins/settings?pluginId=${encodeURIComponent(pluginId)}`, {
      method: 'DELETE'
    }).catch(err => console.warn('[PluginEngine] Reset to defaults disk sync warning:', err));

    logAuditEvent({
      action: 'PLUGIN_CONFIG_SAVED',
      entityType: 'plugin',
      entityName: target.name,
      details: `Reset all settings to default values`,
      severity: 'info'
    });
  };

  const getPluginSettingsPageUrl = (plugin: PluginManifest): string => {
    const customHref = plugin.adminSettingsPage?.sidebarItem?.href;
    if (customHref) return customHref;
    return `/admin/plugins/${plugin.slug}/settings`;
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
    } catch (e: unknown) {
      return { success: false, error: (e as Error).message };
    }
  };

  const updatePluginWithBackup = async (pluginId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const target = plugins.find((p) => p.id === pluginId);
      if (!target || !target.latestVersion) {
        return { success: false, error: 'Plugin or update version not found.' };
      }

      // Create restore point (Backup)
      const backupId = `backup-${pluginId}-${Date.now()}`;
      const newBackup: PluginBackup = {
        id: backupId,
        pluginId,
        pluginName: target.name,
        version: target.version,
        backupDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
        manifest: { ...target }
      };

      const updatedBackups = [newBackup, ...backups];
      setBackups(updatedBackups);
      localStorage.setItem('creatorpulse_plugin_backups', JSON.stringify(updatedBackups));

      // Simulate download & check integrity
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Run compatibility checker (simulating standard next manifest check)
      const simulatedNextManifest = {
        ...target,
        version: target.latestVersion,
        minAppVersion: '1.2.0'
      };

      const report = CompatibilityChecker.checkPlugin(
        simulatedNextManifest,
        [], // folder structures are verified on upload
        plugins,
        []
      );

      if (!report.isValid) {
        const firstError = report.issues.find(i => i.type === 'error')?.message || 'Plugin compatibility check failed.';
        // Revert backup immediately
        const rolledBackBackups = updatedBackups.filter(b => b.id !== backupId);
        setBackups(rolledBackBackups);
        localStorage.setItem('creatorpulse_plugin_backups', JSON.stringify(rolledBackBackups));
        return { success: false, error: `Compatibility check failed: ${firstError}` };
      }

      // Perform update version
      const updated = plugins.map((p) => {
        if (p.id === pluginId) {
          return {
            ...p,
            version: p.latestVersion!,
            hasUpdate: false,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return p;
      });

      setPlugins(updated);
      localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(updated));

      // Execute onUpdate lifecycle hook
      PluginLoader.executeLifecycle(pluginId, 'onUpdate', target.version);

      logAuditEvent({
        action: 'PLUGIN_UPDATED',
        entityType: 'plugin',
        entityName: target.name,
        details: `Updated from v${target.version} to v${target.latestVersion} (Settings preserved. Restore point ${backupId} created).`,
        severity: 'success'
      });

      return { success: true };
    } catch (e: unknown) {
      return { success: false, error: (e as Error).message };
    }
  };

  const rollbackToPluginBackup = (backupId: string): { success: boolean; error?: string } => {
    try {
      const backup = backups.find((b) => b.id === backupId);
      if (!backup) return { success: false, error: 'Backup restore point not found.' };

      const targetPluginExists = plugins.some((p) => p.id === backup.pluginId);
      let updatedPlugins: PluginManifest[];

      if (targetPluginExists) {
        updatedPlugins = plugins.map((p) => (p.id === backup.pluginId ? backup.manifest : p));
      } else {
        updatedPlugins = [...plugins, backup.manifest];
      }

      setPlugins(updatedPlugins);
      localStorage.setItem(STORAGE_PLUGINS_KEY, JSON.stringify(updatedPlugins));

      const remainingBackups = backups.filter((b) => b.id !== backupId);
      setBackups(remainingBackups);
      localStorage.setItem('creatorpulse_plugin_backups', JSON.stringify(remainingBackups));

      logAuditEvent({
        action: 'PLUGIN_UPDATED',
        entityType: 'plugin',
        entityName: backup.pluginName,
        details: `Rolled back to v${backup.version} using restore point ${backupId}.`,
        severity: 'info'
      });

      return { success: true };
    } catch (err: unknown) {
      console.error('Backup rollback failed:', err);
      return { success: false, error: (err as Error).message };
    }
  };

  const deleteBackup = (backupId: string) => {
    const updated = backups.filter((b) => b.id !== backupId);
    setBackups(updated);
    localStorage.setItem('creatorpulse_plugin_backups', JSON.stringify(updated));
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
        resetPluginSettings,
        getPluginSettingsPageUrl,
        toggleAutoUpdate,
        updatePluginVersion,
        installPlugin,
        installFromLibrary,
        deletePlugin,
        isHookActive,
        getHookPlugins,
        activatePluginWithLicense,
        updatePluginWithBackup,
        rollbackToPluginBackup,
        backups,
        deleteBackup
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
          // 1. Post Card Header Hooks
          if (name === 'post_card_header') {
            if (plugin.id === 'plugin-creator-verification') {
              return (
                <div key={plugin.id} className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span>✅ Verified Creator</span>
                </div>
              );
            }
            if (plugin.id === 'plugin-seo-social') {
              return (
                <span key={plugin.id} className="text-[10px] text-blue-600 font-semibold">
                  📈 OpenGraph
                </span>
              );
            }
          }

          // 2. Post Card Footer Hooks
          if (name === 'post_card_footer') {
            if (plugin.id === 'plugin-drm-watermark') {
              const watermarkText = String(plugin.settingsValues?.watermarkText || '© CreatorPulse Protected');
              const postAuthor = String(((context as Record<string, unknown>)?.post as Record<string, unknown>)?.authorUsername || 'public');
              return (
                <div key={plugin.id} className="pt-2 border-t border-[#F3DCE8]/60 flex items-center justify-between text-[10px] text-[#A1A1AA] select-none">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="text-[#EC4899]">🛡️ DRM</span> {watermarkText}
                  </span>
                  {Boolean(plugin.settingsValues?.includeViewerUsername) && (
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

            if (plugin.id === 'plugin-seo-social') {
              return (
                <div key={plugin.id} className="pt-1.5 flex items-center gap-2 text-[10px] text-slate-500">
                  <span>✨ Social Share Cards Active</span>
                </div>
              );
            }
          }

          // 3. Navbar Action Hooks
          if (name === 'navbar_actions') {
            if (plugin.id === 'plugin-virtual-gifts') {
              return (
                <button
                  key={plugin.id}
                  onClick={() => alert('Virtual Gift Wallet & Store — Powered by Virtual Gifts plugin.')}
                  className="h-9 px-3 rounded-full bg-white dark:bg-[#1A1222] text-amber-700 dark:text-amber-400 border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-amber-400 text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-2xs flex items-center gap-1.5"
                  title="Virtual Gifts Store"
                >
                  <span>🎁 Gifts</span>
                </button>
              );
            }

            if (plugin.id === 'plugin-creator-stories') {
              return (
                <button
                  key={plugin.id}
                  onClick={() => alert('Creator 24h Stories Feed — Powered by Creator Stories plugin.')}
                  className="h-9 px-3 rounded-full bg-white dark:bg-[#1A1222] text-indigo-700 dark:text-indigo-400 border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-indigo-400 text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-2xs flex items-center gap-1.5"
                  title="24h Ephemeral Stories"
                >
                  <span>✨ Stories</span>
                </button>
              );
            }

            if (plugin.id === 'plugin-creator-verification') {
              return (
                <button
                  key={plugin.id}
                  onClick={() => window.location.href = '/creator/verification'}
                  className="h-9 px-3 rounded-full bg-white dark:bg-[#1A1222] text-emerald-700 dark:text-emerald-400 border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-emerald-400 text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-2xs flex items-center gap-1.5"
                  title="Creator Verification Status"
                >
                  <span>✅ Verification</span>
                </button>
              );
            }

            return null;
          }

          // 4. Creator Dashboard Widget Hooks
          if (name === 'creator_dashboard_widgets') {
            if (plugin.id === 'plugin-creator-verification') {
              return (
                <div key={plugin.id} className="p-4 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      <h4 className="font-bold text-xs text-[#18181B]">Creator Identity Verification</h4>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] leading-relaxed">
                    Identity verification application workflow enabled. Submit government ID and selfie to earn the trusted creator badge.
                  </p>
                </div>
              );
            }

            if (plugin.id === 'plugin-content-moderation') {
              return (
                <div key={plugin.id} className="p-4 bg-gradient-to-br from-rose-50 to-white border border-rose-200 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🛡️</span>
                      <h4 className="font-bold text-xs text-[#18181B]">AI Content Moderation Guard</h4>
                    </div>
                    <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                      Scanning
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] leading-relaxed">
                    Real-time AI toxicity scanner and blocked keyword filter active. Posts are verified prior to public publishing.
                  </p>
                </div>
              );
            }

            if (plugin.id === 'plugin-content-scheduling') {
              return (
                <div key={plugin.id} className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      <h4 className="font-bold text-xs text-[#18181B]">Content Scheduling Engine</h4>
                    </div>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
                      Auto-Publish
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] leading-relaxed">
                    Automated publication calendar active. Posts and reels trigger automatically at scheduled release timestamps.
                  </p>
                </div>
              );
            }

            if (plugin.id === 'plugin-creator-analytics') {
              return (
                <div key={plugin.id} className="p-4 bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📊</span>
                      <h4 className="font-bold text-xs text-[#18181B]">Real-Time Audience Analytics</h4>
                    </div>
                    <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-300">
                      Live Stats
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] leading-relaxed">
                    Audience retention maps, engagement funnels, and revenue metrics updating in real-time.
                  </p>
                </div>
              );
            }

            if (plugin.id === 'plugin-telegram-sync') {
              return (
                <div key={plugin.id} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✈️</span>
                      <h4 className="font-bold text-xs text-[#1E293B]">Telegram Channel Sync</h4>
                    </div>
                    <span className="text-[9px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                      Connected
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    Posts are automatically broadcasted to your private VIP Telegram subscribers.
                  </p>
                </div>
              );
            }
          }

          // 5. Sidebar Extra Links
          if (name === 'sidebar_extra_links') {
            if (plugin.id === 'plugin-creator-verification') {
              return (
                <div key={plugin.id} className="px-3.5 py-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2">
                  <span>✅</span>
                  <span>Verified Creator</span>
                </div>
              );
            }
            return null;
          }

          // Generic fallback for custom third-party SDK plugins on non-sidebar hooks
          return null;
        } catch (err: unknown) {
          console.error(`[Plugin Engine] Error executing hook "${name}" in plugin "${plugin.id}":`, err);
          return null;
        }
      })}
    </div>
  );
};
