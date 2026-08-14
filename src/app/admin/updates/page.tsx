'use client';

import React, { useState } from 'react';
import {
  RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, Download, 
  ArrowLeftRight, Trash2, Check,
  Zap, Clock, PackageCheck, AlertCircle, Sparkles, Server
} from 'lucide-react';
import { useTheme } from '@/lib/extensions/theme-engine';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { CompatibilityChecker } from '@/lib/loaders/compatibility-checker';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';

interface ProgressStep {
  label: string;
  status: 'idle' | 'running' | 'success' | 'error';
  percentage: number;
}

export default function AdminUpdateCenterPage() {
  const { 
    themes, 
    updateThemeWithBackup, 
    rollbackToBackup: rollbackTheme, 
    backups: themeBackups, 
    deleteBackup: deleteThemeBackup,
    setPreviewTheme // to trigger state refresh/mock
  } = useTheme();

  const { 
    plugins, 
    updatePluginWithBackup, 
    rollbackToPluginBackup, 
    backups: pluginBackups, 
    deleteBackup: deletePluginBackup 
  } = usePlugins();

  // Settings
  const [autoBackup, setAutoBackup] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedAuto = localStorage.getItem('cp_auto_backups_enabled');
      return savedAuto !== null ? savedAuto === 'true' : true;
    }
    return true;
  });
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedCheck = localStorage.getItem('cp_last_update_check');
      return savedCheck || 'Never';
    }
    return 'Never';
  });

  // Multi-Selection
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // holds id of themes or plugins

  // Dialog / Modal State
  const [inspectItem, setInspectItem] = useState<{
    id: string;
    type: 'theme' | 'plugin';
    name: string;
    version: string;
    latestVersion: string;
    changelog: { version: string; date: string; changes: string[] }[];
    minAppVersion?: string;
    maxAppVersion?: string;
  } | null>(null);

  // Update Execution State
  const [activeUpdate, setActiveUpdate] = useState<{
    items: { id: string; name: string; type: 'theme' | 'plugin' }[];
    currentIndex: number;
    steps: ProgressStep[];
    logMessages: string[];
    isCompleted: boolean;
    hasFailed: boolean;
  } | null>(null);

  // Toggle AutoBackup option
  const handleToggleAutoBackup = () => {
    const nextVal = !autoBackup;
    setAutoBackup(nextVal);
    localStorage.setItem('cp_auto_backups_enabled', String(nextVal));
  };

  // Run Simulated Scan for Updates
  const handleCheckForUpdates = async () => {
    setCheckingUpdates(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Force set 'hasUpdate: true' mock parameters to test features
    // Let's mock a starter-theme update and plugin updates
    const starterTheme = themes.find(t => t.id === 'theme-starter');
    if (starterTheme) {
      starterTheme.hasUpdate = true;
      starterTheme.latestVersion = '1.1.0';
      starterTheme.changelog = [
        { version: '1.1.0', date: new Date().toISOString().split('T')[0], changes: ['Added dynamic design token variables', 'Standardized folder layout rules', 'Optimized font rendering'] },
        ...(starterTheme.changelog || [])
      ];
    }

    const watermarkPlugin = plugins.find(p => p.id === 'plugin-drm-watermark');
    if (watermarkPlugin) {
      watermarkPlugin.hasUpdate = true;
      watermarkPlugin.latestVersion = '2.2.0';
      watermarkPlugin.changelog = [
        { version: '2.2.0', date: new Date().toISOString().split('T')[0], changes: ['Added full-screen diagonal watermarking option', 'Fixed user session hook leaks'] },
        ...(watermarkPlugin.changelog || [])
      ];
    }

    const giftsPlugin = plugins.find(p => p.id === 'plugin-virtual-gifts');
    if (giftsPlugin) {
      giftsPlugin.hasUpdate = true;
      giftsPlugin.latestVersion = '1.5.0';
      giftsPlugin.changelog = [
        { version: '1.5.0', date: new Date().toISOString().split('T')[0], changes: ['3D confetti triggers on high-value rocket gifts', 'Wallet payment gateway validation checks'] },
        ...(giftsPlugin.changelog || [])
      ];
    }

    // Refresh state using mock setter to force re-render
    setPreviewTheme(null);
    setCheckingUpdates(false);
    const dateStr = new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString();
    setLastCheckTime(dateStr);
    localStorage.setItem('cp_last_update_check', dateStr);
  };

  // Select/Deselect items for bulk action
  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(x => x !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = (updatables: { id: string }[]) => {
    if (selectedItems.length === updatables.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(updatables.map(x => x.id));
    }
  };

  // Run Update Sequence (Single or Bulk)
  const executeUpdates = async (itemsToUpdate: { id: string; name: string; type: 'theme' | 'plugin' }[]) => {
    if (itemsToUpdate.length === 0) return;

    // Set initial steps
    const steps: ProgressStep[] = [
      { label: 'Creating restore backup point...', status: 'idle', percentage: 15 },
      { label: 'Downloading package releases...', status: 'idle', percentage: 35 },
      { label: 'Verifying compatibility boundaries...', status: 'idle', percentage: 55 },
      { label: 'Preserving license & local configuration settings...', status: 'idle', percentage: 75 },
      { label: 'Finalizing installation & executing lifecycle hooks...', status: 'idle', percentage: 100 }
    ];

    setActiveUpdate({
      items: itemsToUpdate,
      currentIndex: 0,
      steps,
      logMessages: ['[Update Engine] Starting update sequence...'],
      isCompleted: false,
      hasFailed: false
    });

    for (let index = 0; index < itemsToUpdate.length; index++) {
      const activeItem = itemsToUpdate[index];
      
      setActiveUpdate(prev => {
        if (!prev) return null;
        return {
          ...prev,
          currentIndex: index,
          steps: prev.steps.map((s, idx) => idx === 0 ? { ...s, status: 'running' } : { ...s, status: 'idle' }),
          logMessages: [...prev.logMessages, `[Update] Processing ${activeItem.name} (${index + 1}/${itemsToUpdate.length})...`]
        };
      });

      try {
        // Step 1: Backup
        if (autoBackup) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          setActiveUpdate(prev => {
            if (!prev) return null;
            return {
              ...prev,
              steps: prev.steps.map((s, idx) => idx === 0 ? { ...s, status: 'success' } : idx === 1 ? { ...s, status: 'running' } : s),
              logMessages: [...prev.logMessages, `[Backup] Created restore point snapshot for ${activeItem.name}.`]
            };
          });
        } else {
          setActiveUpdate(prev => {
            if (!prev) return null;
            return {
              ...prev,
              steps: prev.steps.map((s, idx) => idx === 0 ? { ...s, status: 'success', label: 'Backup disabled. Skipped restore point.' } : idx === 1 ? { ...s, status: 'running' } : s),
              logMessages: [...prev.logMessages, `[Backup] Restore point skipped by administrator configuration.`]
            };
          });
        }

        // Step 2: Download
        await new Promise((resolve) => setTimeout(resolve, 700));
        setActiveUpdate(prev => {
          if (!prev) return null;
          return {
            ...prev,
            steps: prev.steps.map((s, idx) => idx === 1 ? { ...s, status: 'success' } : idx === 2 ? { ...s, status: 'running' } : s),
            logMessages: [...prev.logMessages, `[Integrity] Release binary packages downloaded successfully.`]
          };
        });

        // Step 3: Compatibility & Boundaries
        await new Promise((resolve) => setTimeout(resolve, 600));
        // Check mock manifest version compatibility
        const isTheme = activeItem.type === 'theme';
        const rawItem = isTheme ? themes.find(t => t.id === activeItem.id) : plugins.find(p => p.id === activeItem.id);
        const nextMinVer = rawItem?.minAppVersion || '1.0.0';
        
        const appVer = '1.2.0';
        const isCompatible = CompatibilityChecker.compareVersions(appVer, nextMinVer);

        if (!isCompatible) {
          throw new Error(`Platform Incompatibility: Package requires CreatorPulse v${nextMinVer} or higher.`);
        }

        setActiveUpdate(prev => {
          if (!prev) return null;
          return {
            ...prev,
            steps: prev.steps.map((s, idx) => idx === 2 ? { ...s, status: 'success' } : idx === 3 ? { ...s, status: 'running' } : s),
            logMessages: [...prev.logMessages, `[Compatibility] Passes core platform boundaries checklist.`]
          };
        });

        // Step 4: Settings & License Preservation
        await new Promise((resolve) => setTimeout(resolve, 700));
        setActiveUpdate(prev => {
          if (!prev) return null;
          return {
            ...prev,
            steps: prev.steps.map((s, idx) => idx === 3 ? { ...s, status: 'success' } : idx === 4 ? { ...s, status: 'running' } : s),
            logMessages: [...prev.logMessages, `[License] Preserved configurations and license keys successfully.`]
          };
        });

        // Step 5: Version apply & hooks execution
        let res: { success: boolean; error?: string };
        if (isTheme) {
          res = await updateThemeWithBackup(activeItem.id);
        } else {
          res = await updatePluginWithBackup(activeItem.id);
        }

        if (!res.success) {
          throw new Error(res.error || 'Disk installation write error.');
        }

        setActiveUpdate(prev => {
          if (!prev) return null;
          return {
            ...prev,
            steps: prev.steps.map((s, idx) => idx === 4 ? { ...s, status: 'success' } : s),
            logMessages: [...prev.logMessages, `[Success] ${activeItem.name} updated to latest release version.`]
          };
        });

      } catch (err: unknown) {
        const errorMsg = (err as Error).message;
        setActiveUpdate(prev => {
          if (!prev) return null;
          const currentRunningIndex = prev.steps.findIndex(s => s.status === 'running');
          return {
            ...prev,
            hasFailed: true,
            isCompleted: true,
            steps: prev.steps.map((s, idx) => idx === currentRunningIndex ? { ...s, status: 'error' } : s),
            logMessages: [...prev.logMessages, `[Error] ${activeItem.name} update aborted: ${errorMsg}`, `[Rollback] Triggering automated restore point reversion...`]
          };
        });

        // Handle auto-rollback
        if (autoBackup) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (activeItem.type === 'theme') {
            const lastBackup = themeBackups.find(b => b.themeId === activeItem.id);
            if (lastBackup) rollbackTheme(lastBackup.id);
          } else {
            const lastBackup = pluginBackups.find(b => b.pluginId === activeItem.id);
            if (lastBackup) rollbackToPluginBackup(lastBackup.id);
          }
          setActiveUpdate(prev => {
            if (!prev) return null;
            return {
              ...prev,
              logMessages: [...prev.logMessages, `[Rollback] Successfully reverted ${activeItem.name} to its backup restore point.`]
            };
          });
        }
        return; // Abort whole sequence on failure
      }
    }

    // Success close
    setActiveUpdate(prev => {
      if (!prev) return null;
      return {
        ...prev,
        isCompleted: true,
        logMessages: [...prev.logMessages, `[Finished] Update sequence completed successfully.`]
      };
    });
    setSelectedItems([]);
  };

  // Collect All Updatable packages
  const updatableThemes = themes.filter(t => t.hasUpdate);
  const updatablePlugins = plugins.filter(p => p.hasUpdate);
  const allUpdatables = [
    ...updatableThemes.map(t => ({ id: t.id, name: t.name, version: t.version, latestVersion: t.latestVersion!, type: 'theme' as const })),
    ...updatablePlugins.map(p => ({ id: p.id, name: p.name, version: p.version, latestVersion: p.latestVersion!, type: 'plugin' as const }))
  ];

  // Up-to-date packages
  const upToDateThemes = themes.filter(t => !t.hasUpdate);
  const upToDatePlugins = plugins.filter(p => !p.hasUpdate);

  const allBackups = [
    ...themeBackups.map(tb => ({ id: tb.id, packageId: tb.themeId, name: tb.themeName, version: tb.version, date: tb.timestamp, type: 'theme' as const })),
    ...pluginBackups.map(pb => ({ id: pb.id, packageId: pb.pluginId, name: pb.pluginName, version: pb.version, date: pb.backupDate, type: 'plugin' as const }))
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#F3DCE8]/80 p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#EC4899] uppercase tracking-wider">
            <Sparkles size={14} className="animate-pulse" /> Centralized Platforms Services
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Theme & Plugin Update Center</h1>
          <p className="text-slate-500 text-sm">
            Maintain package health. Verify compatibility, run secure backups, and upgrade active modules.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button 
            onClick={handleCheckForUpdates}
            disabled={checkingUpdates}
            className="flex items-center gap-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            <RefreshCw size={16} className={checkingUpdates ? 'animate-spin' : ''} />
            {checkingUpdates ? 'Checking Registry...' : 'Check for Updates'}
          </Button>
          <button
            onClick={handleToggleAutoBackup}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 select-none hover:bg-slate-100/80 transition-colors"
          >
            {autoBackup ? (
              <>
                <ShieldCheck size={16} className="text-emerald-600" />
                <span className="text-emerald-700">Auto-Backups Active</span>
              </>
            ) : (
              <>
                <AlertTriangle size={16} className="text-slate-400" />
                <span className="text-slate-500">Backups Disabled</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Summary Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between border-slate-200/60 bg-white shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 block">Updates Pending</span>
            <span className="text-2xl font-black text-slate-800">{allUpdatables.length}</span>
          </div>
          <div className={`p-3 rounded-2xl ${allUpdatables.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
            <Download size={22} />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-slate-200/60 bg-white shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 block">Backups Restore Points</span>
            <span className="text-2xl font-black text-slate-800">{allBackups.length} Saved</span>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
            <Clock size={22} />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-slate-200/60 bg-white shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 block">Last Verification Scan</span>
            <span className="text-xs font-mono font-bold text-slate-800 block mt-1 bg-slate-100 px-2 py-1 rounded inline-block">
              {lastCheckTime}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 text-slate-500">
            <Server size={22} />
          </div>
        </Card>
      </div>

      {/* Bulk actions banner */}
      {allUpdatables.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2.5 items-start">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900 text-sm">Package Updates Available</p>
              <p className="text-slate-600 text-xs">
                Select specific packages to run a bulk update with automatic restore point protection.
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              onClick={() => handleSelectAll(allUpdatables)}
              className="px-3.5 py-1.5 bg-white border border-amber-300 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-100/50 cursor-pointer"
            >
              {selectedItems.length === allUpdatables.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button
              disabled={selectedItems.length === 0}
              onClick={() => {
                const targets = allUpdatables.filter(u => selectedItems.includes(u.id));
                executeUpdates(targets);
              }}
              className="px-4 py-1.5 bg-[#EC4899] text-white rounded-xl text-xs font-bold hover:bg-[#DB2777] shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Selected ({selectedItems.length})
            </Button>
          </div>
        </div>
      )}

      {/* 2. Main Updates Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Available updates & current packages */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Pending updates */}
          <Card className="overflow-hidden border-[#F3DCE8]/80 bg-white shadow-xs">
            <div className="p-4 bg-[#FFF9FC] border-b border-[#F3DCE8]/50 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 flex items-center gap-1.5 text-sm">
                <Download size={16} className="text-[#EC4899]" /> Pending Package Updates ({allUpdatables.length})
              </h3>
            </div>
            
            <div className="divide-y divide-slate-100">
              {allUpdatables.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <PackageCheck size={36} className="mx-auto text-slate-300" />
                  <p className="font-bold text-sm text-slate-600">All themes and plugins are fully up to date.</p>
                  <p className="text-xs text-slate-400">Click &quot;Check for Updates&quot; to query registry servers.</p>
                </div>
              ) : (
                allUpdatables.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-4 h-4 text-[#EC4899] border-slate-300 rounded focus:ring-[#EC4899] cursor-pointer"
                      />
                      <div className="w-10 h-10 bg-[#FFF1F7] text-[#BE185D] border border-[#FBCFE8] rounded-xl flex items-center justify-center font-bold text-base select-none shrink-0 shadow-xs">
                        {item.type === 'theme' ? '🎨' : '🔌'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {item.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-xs">
                          <span className="font-medium text-slate-500">v{item.version}</span>
                          <ArrowLeftRight size={12} className="text-slate-400" />
                          <span className="font-bold text-[#EC4899] bg-[#FFF1F7] px-1.5 py-0.5 rounded">v{item.latestVersion}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          const raw = item.type === 'theme' ? themes.find(t => t.id === item.id) : plugins.find(p => p.id === item.id);
                          if (raw) {
                            setInspectItem({
                              id: item.id,
                              type: item.type,
                              name: item.name,
                              version: item.version,
                              latestVersion: item.latestVersion,
                              changelog: raw.changelog || [],
                              minAppVersion: raw.minAppVersion,
                              maxAppVersion: (raw as unknown as Record<string, unknown>).maxAppVersion as string | undefined
                            });
                          }
                        }}
                        className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        Changelog & Health
                      </Button>
                      <Button
                        onClick={() => executeUpdates([{ id: item.id, name: item.name, type: item.type }])}
                        className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Section: Installed & Up-to-date */}
          <Card className="overflow-hidden border-slate-200/60 bg-white shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 flex items-center gap-1.5 text-sm">
                <CheckCircle size={16} className="text-emerald-600" /> Up-To-Date Packages
              </h3>
            </div>
            
            <div className="divide-y divide-slate-100">
              {[...upToDateThemes, ...upToDatePlugins].length === 0 ? (
                <p className="p-6 text-center text-slate-400 text-xs">No current packages resolved.</p>
              ) : (
                [
                  ...upToDateThemes.map(t => ({ id: t.id, name: t.name, version: t.version, type: 'theme' as const })),
                  ...upToDatePlugins.map(p => ({ id: p.id, name: p.name, version: p.version, type: 'plugin' as const }))
                ].map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg flex items-center justify-center font-bold text-sm select-none">
                        {item.type === 'theme' ? '🎨' : '🔌'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Running stable v{item.version}</p>
                      </div>
                    </div>
                    
                    <Badge variant="emerald" className="text-[10px] font-extrabold flex items-center gap-1 px-2.5 py-1">
                      <Check size={12} /> Stable
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>

        {/* Right Column - Backup Points list */}
        <div className="space-y-6">
          
          <Card className="overflow-hidden border-slate-200/60 bg-white shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200/50">
              <h3 className="font-bold text-slate-700 flex items-center gap-1.5 text-sm">
                <Clock size={16} className="text-slate-600" /> Package Restore Points ({allBackups.length})
              </h3>
            </div>
            
            <div className="p-4 divide-y divide-slate-100 max-h-[500px] overflow-y-auto space-y-3">
              {allBackups.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-1">
                  <ShieldCheck size={28} className="mx-auto text-slate-300" />
                  <p className="font-bold text-xs text-slate-600">No restore points saved.</p>
                  <p className="text-[10px] text-slate-400">Backups are automatically created before updates run.</p>
                </div>
              ) : (
                allBackups.map((backup) => (
                  <div key={backup.id} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 mb-1 inline-block">
                          {backup.type} Backup
                        </span>
                        <h4 className="font-bold text-slate-800 text-xs">{backup.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Point: {backup.id}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (backup.type === 'theme') {
                            deleteThemeBackup(backup.id);
                          } else {
                            deletePluginBackup(backup.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Delete restore point"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Version</span>
                        <span className="font-bold text-slate-700">v{backup.version}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Created</span>
                        <span className="font-medium text-slate-600">{backup.date}</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => {
                        let res;
                        if (backup.type === 'theme') {
                          res = rollbackTheme(backup.id);
                        } else {
                          res = rollbackToPluginBackup(backup.id);
                        }
                        if (res.success) {
                          alert(`Successfully restored ${backup.name} to version v${backup.version}.`);
                        } else {
                          alert(`Rollback failed: ${res.error}`);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1 py-1.5 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50 text-[11px] font-extrabold rounded-lg transition-colors cursor-pointer"
                    >
                      <Zap size={12} /> Rollback to restore point
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>

      </div>

      {/* 3. Modal: Detailed inspect, Version Comparison & Diagnostics */}
      {inspectItem && (() => {
        const appVer = '1.2.0';
        const reqVer = inspectItem.minAppVersion || '1.0.0';
        const isCompatible = CompatibilityChecker.compareVersions(appVer, reqVer);

        // Run checker diagnostics
        const mockManifest = { 
          id: inspectItem.id, 
          slug: inspectItem.id.replace('theme-', '').replace('plugin-', ''),
          version: inspectItem.latestVersion,
          minAppVersion: reqVer,
          maxAppVersion: inspectItem.maxAppVersion
        };
        const report = inspectItem.type === 'theme' 
          ? CompatibilityChecker.checkTheme(mockManifest, ['pages', 'layouts', 'components', 'icons', 'images', 'fonts', 'styles', 'css', 'js', 'animations', 'assets', 'templates', 'partials', 'hooks', 'config', 'locales', 'preview'], themes, plugins)
          : CompatibilityChecker.checkPlugin(mockManifest, ['client', 'server', 'api', 'components', 'pages', 'routes', 'hooks', 'services', 'database', 'migrations', 'settings', 'permissions', 'icons', 'images', 'css', 'js', 'assets', 'locales', 'jobs', 'events', 'webhooks', 'tests', 'docs'], plugins, []);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-white border-slate-200 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                    {inspectItem.type === 'theme' ? '🎨' : '🔌'} Package Update Analysis
                  </h3>
                </div>
                <button
                  onClick={() => setInspectItem(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} /> {/* Close symbol */}
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                
                {/* Header detail */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-800">{inspectItem.name}</h2>
                    <p className="text-slate-400 text-xs">Path: /{inspectItem.type}s/{inspectItem.id}</p>
                  </div>
                  <Badge variant={isCompatible ? 'emerald' : 'rose'} className="text-[10px] font-extrabold uppercase px-2.5 py-1">
                    {isCompatible ? 'Compatible' : 'Incompatible'}
                  </Badge>
                </div>

                {/* Grid Comparison */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200/60 p-3 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-slate-500 font-extrabold block">Installed Version</span>
                    <span className="font-bold text-slate-800 text-sm">v{inspectItem.version}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-extrabold block">Upgrade Target</span>
                    <span className="font-bold text-[#EC4899] text-sm">v{inspectItem.latestVersion}</span>
                  </div>
                </div>

                {/* Compatibility Diagnostics Report Cards */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wide">Compatibility Diagnostics</h4>
                  
                  <div className={`p-3.5 rounded-2xl border text-xs ${
                    report.isValid 
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}>
                    <div className="flex items-start gap-2">
                      {report.isValid ? (
                        <ShieldCheck size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <AlertCircle size={18} className="text-rose-600 mt-0.5 shrink-0" />
                      )}
                      <div className="space-y-1">
                        <p className="font-bold">
                          {report.isValid ? 'Platform Boundary Check Passed' : 'Incompatible API Boundaries'}
                        </p>
                        <p className="leading-relaxed">
                          {report.isValid 
                            ? `Package v${inspectItem.latestVersion} meets core platform requirements. (Verified CreatorPulse v${appVer}).`
                            : 'This package demands dependencies or platform versions not satisfied locally.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {report.issues.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {report.issues.map((issue, idx) => (
                        <div key={idx} className="p-2 border border-slate-100 rounded-xl bg-slate-50 text-[11px] flex gap-2">
                          <span className={`px-1 rounded uppercase text-[9px] font-extrabold shrink-0 ${
                            issue.type === 'error' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {issue.type}
                          </span>
                          <div>
                            <span className="font-bold text-slate-700 block">Field: {issue.field}</span>
                            <p className="text-slate-600">{issue.message}</p>
                            <p className="italic text-slate-500 mt-0.5">Fix: {issue.fix}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Changelog details */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wide">Version Release Notes</h4>
                  <div className="space-y-3">
                    {inspectItem.changelog.length === 0 ? (
                      <p className="text-slate-400 italic text-xs">No release notes documented.</p>
                    ) : (
                      inspectItem.changelog.map((log, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs">v{log.version}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({log.date})</span>
                          </div>
                          <ul className="list-disc pl-4 space-y-1 text-slate-600 text-xs">
                            {log.changes.map((change, cIdx) => (
                              <li key={cIdx}>{change}</li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <Button
                  onClick={() => setInspectItem(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  disabled={!isCompatible}
                  onClick={() => {
                    setInspectItem(null);
                    executeUpdates([{ id: inspectItem.id, name: inspectItem.name, type: inspectItem.type }]);
                  }}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed with Upgrade
                </Button>
              </div>
            </Card>
          </div>
        );
      })()}

      {/* 4. Modal: Update Execution Progress Overlay */}
      {activeUpdate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white border-slate-200 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-4 bg-slate-950 text-white">
              <h3 className="font-bold text-xs flex items-center gap-1.5 uppercase">
                <RefreshCw size={14} className="animate-spin" /> Platform Upgrade Engine
              </h3>
            </div>

            <div className="p-6 space-y-5">
              
              {/* Target Package Status */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Upgrading Package</span>
                <h3 className="font-extrabold text-slate-800 text-base">
                  {activeUpdate.items[activeUpdate.currentIndex]?.name || 'Bulk Package Execution'}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Package {activeUpdate.currentIndex + 1} of {activeUpdate.items.length} in queue.
                </p>
              </div>

              {/* Progress Bar steps */}
              <div className="space-y-3">
                {activeUpdate.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      {step.status === 'idle' && (
                        <div className="w-4 h-4 rounded-full border border-slate-300 bg-white" />
                      )}
                      {step.status === 'running' && (
                        <RefreshCw size={14} className="text-[#EC4899] animate-spin" />
                      )}
                      {step.status === 'success' && (
                        <CheckCircle size={14} className="text-emerald-600" />
                      )}
                      {step.status === 'error' && (
                        <AlertCircle size={14} className="text-rose-600" />
                      )}
                      <span className={`font-semibold ${
                        step.status === 'running' ? 'text-[#EC4899] font-bold' : 'text-slate-700'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {step.status === 'running' && (
                      <span className="text-[10px] font-mono text-[#EC4899] font-bold animate-pulse">
                        {step.percentage}%
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Log Messages Console */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Engine Log Outputs</span>
                <div className="bg-slate-900 text-pink-200 p-3 rounded-xl font-mono text-[10px] h-28 overflow-y-auto space-y-1.5 border border-slate-800 select-all scrollbar-thin">
                  {activeUpdate.logMessages.map((log, idx) => (
                    <p key={idx} className={
                      log.includes('[Error]') ? 'text-rose-400 font-bold' : 
                      log.includes('[Success]') ? 'text-emerald-400 font-bold' : 'text-slate-300'
                    }>
                      {log}
                    </p>
                  ))}
                </div>
              </div>

            </div>

            {/* Complete action footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <Button
                disabled={!activeUpdate.isCompleted}
                onClick={() => setActiveUpdate(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activeUpdate.hasFailed ? 'Acknowledge Failures' : 'Complete & Close'}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
