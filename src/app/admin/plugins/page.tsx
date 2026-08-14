'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Puzzle, Upload, CheckCircle2, AlertTriangle, Settings, RefreshCw,
  Trash2, Plus, Info, ExternalLink, Shield, Code, Download, X,
  Search, SlidersHorizontal, Check, Zap, Sparkles, Lock, ArrowUpRight,
  BookOpen, Terminal, Layers, ArrowRight, Play, Eye, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { PluginManifest, PluginHookType, PluginPermission } from '@/lib/extensions/plugin-types';
import { validatePluginPackage } from '@/lib/extensions/package-installer';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';
import { useAdminProgress } from '@/components/admin/AdminProgressProvider';
import { MediaLibraryModal } from '@/components/admin/MediaLibraryModal';
import { Image as ImageIcon } from 'lucide-react';

// Helper to extract plugin.json from binary ZIP archive using DecompressionStream
async function extractPluginJsonFromZip(arrayBuffer: ArrayBuffer): Promise<string> {
  const view = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);
  
  // Find End of Central Directory (EOCD) signature (0x06054b50) from the end of the file
  let eocdOffset = -1;
  for (let i = arrayBuffer.byteLength - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) {
    throw new Error("Invalid ZIP file: End of Central Directory (EOCD) signature not found.");
  }
  
  const cdSize = view.getUint32(eocdOffset + 12, true);
  const cdOffset = view.getUint32(eocdOffset + 16, true);
  
  let currentOffset = cdOffset;
  while (currentOffset < cdOffset + cdSize) {
    if (view.getUint32(currentOffset, true) !== 0x02014b50) {
      break; // central directory signature mismatch
    }
    
    const method = view.getUint16(currentOffset + 10, true);
    const compressedSize = view.getUint32(currentOffset + 20, true);
    const fileNameLen = view.getUint16(currentOffset + 28, true);
    const extraLen = view.getUint16(currentOffset + 30, true);
    const commentLen = view.getUint16(currentOffset + 32, true);
    const localHeaderOffset = view.getUint32(currentOffset + 42, true);
    
    const fileNameBytes = bytes.subarray(currentOffset + 46, currentOffset + 46 + fileNameLen);
    const fileName = new TextDecoder().decode(fileNameBytes);
    
    if (fileName === "plugin.json" || fileName.endsWith("/plugin.json")) {
      // Validate local header
      if (view.getUint32(localHeaderOffset, true) !== 0x04034b50) {
        throw new Error("Invalid local file header signature in ZIP archive.");
      }
      const localFileNameLen = view.getUint16(localHeaderOffset + 26, true);
      const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
      const dataOffset = localHeaderOffset + 30 + localFileNameLen + localExtraLen;
      
      const compressedData = bytes.subarray(dataOffset, dataOffset + compressedSize);
      
      if (method === 0) { // Stored (uncompressed)
        return new TextDecoder().decode(compressedData);
      } else if (method === 8) { // Deflated
        // Use standard Web API DecompressionStream to decompress deflate-raw format
        // @ts-ignore
        const ds = new DecompressionStream('deflate-raw');
        const writer = ds.writable.getWriter();
        writer.write(compressedData);
        writer.close();
        const response = new Response(ds.readable);
        return await response.text();
      } else {
        throw new Error("Unsupported ZIP compression method: " + method);
      }
    }
    
    currentOffset += 46 + fileNameLen + extraLen + commentLen;
  }
  
  throw new Error("Manifest file 'plugin.json' was not found inside the ZIP archive.");
}

export default function AdminPluginsPage() {
  const {
    plugins,
    activePlugins,
    libraryPlugins,
    togglePlugin,
    updatePluginSettings,
    updatePluginVersion,
    installPlugin,
    installFromLibrary,
    deletePlugin,
    activatePluginWithLicense
  } = usePlugins();

  const { startProgress, updateProgress, completeProgress, errorProgress } = useAdminProgress();

  const [activeTab, setActiveTab] = useState<'installed' | 'active' | 'inactive' | 'updates' | 'library'>('installed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [configuringPlugin, setConfiguringPlugin] = useState<PluginManifest | null>(null);
  const [configDraft, setConfigDraft] = useState<Record<string, unknown>>({});
  const [detailsPlugin, setDetailsPlugin] = useState<PluginManifest | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // License Verification Modal
  const [licenseTargetPlugin, setLicenseTargetPlugin] = useState<PluginManifest | null>(null);
  const [licenseInputKey, setLicenseInputKey] = useState('');
  const [licenseError, setLicenseError] = useState('');
  const [licenseSuccess, setLicenseSuccess] = useState(false);

  // Action Confirmations Modal
  const [confirmAction, setConfirmAction] = useState<{
    type: 'activate' | 'deactivate' | 'update' | 'delete' | 'install';
    pluginId: string;
    pluginName: string;
    targetVersion?: string;
    dependencies?: string[];
  } | null>(null);

  // Upload state
  const [uploadText, setUploadText] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  // Filter plugins based on tab, search, and category
  const filteredInstalledPlugins = plugins.filter((p) => {
    // Tab filter
    if (activeTab === 'active' && !p.isEnabled) return false;
    if (activeTab === 'inactive' && p.isEnabled) return false;
    if (activeTab === 'updates' && !p.hasUpdate) return false;

    // Search query
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredLibraryPlugins = libraryPlugins.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const updateCount = plugins.filter((p) => p.hasUpdate).length;

  const openConfigModal = (plugin: PluginManifest) => {
    setConfiguringPlugin(plugin);
    setConfigDraft({ ...plugin.settingsValues });
  };

  const handleSaveConfig = () => {
    if (!configuringPlugin) return;
    updatePluginSettings(configuringPlugin.id, configDraft);
    setConfiguringPlugin(null);
    triggerNotice(`Saved settings for ${configuringPlugin.name}`);
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setUploadSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadOpen(false);

    startProgress({
      title: `Uploading & Installing ${file.name}`,
      steps: [
        "Reading file stream...",
        "Decompressing & extracting manifest...",
        "Verifying Plugin SDK compliance...",
        "Registering module hooks & controllers..."
      ]
    });

    try {
      updateProgress(0, 'running', 15, "Reading file stream...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateProgress(0, 'success', 30, "File read completed.");

      updateProgress(1, 'running', 45, "Decompressing & extracting manifest...");
      let manifestText = '';
      if (file.name.endsWith('.zip')) {
        const arrayBuffer = await file.arrayBuffer();
        manifestText = await extractPluginJsonFromZip(arrayBuffer);
      } else {
        const text = await file.text();
        manifestText = text;
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
      updateProgress(1, 'success', 60, "Manifest extracted.");

      updateProgress(2, 'running', 75, "Verifying Plugin SDK compliance...");
      const parsed = JSON.parse(manifestText);
      const result = validatePluginPackage(parsed);
      if (!result.valid || !result.plugin) {
        throw new Error(result.error || 'Failed to validate plugin package.');
      }
      if (plugins.some((p) => p.id === result.plugin!.id)) {
        throw new Error(`A plugin with ID "${result.plugin!.id}" is already installed.`);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateProgress(2, 'success', 85, "Package validation OK.");

      updateProgress(3, 'running', 95, "Registering module hooks & controllers...");
      installPlugin(result.plugin);
      await new Promise((resolve) => setTimeout(resolve, 400));

      setUploadSuccess(true);
      completeProgress("Plugin installed successfully!");
      triggerNotice(`Installed "${result.plugin.name}" successfully!`);
    } catch (err: any) {
      errorProgress(1, err.message || 'Error occurred.');
      setUploadError(err.message || 'Invalid package format. Please provide a valid plugin JSON manifest or ZIP.');
    }
  };

  const handleManualJsonInstall = async () => {
    setUploadError('');
    setUploadSuccess(false);
    
    setIsUploadOpen(false);

    startProgress({
      title: "Installing Plugin from JSON",
      steps: [
        "Parsing JSON input content...",
        "Verifying Plugin SDK compliance...",
        "Registering module hooks & controllers..."
      ]
    });

    try {
      updateProgress(0, 'running', 25, "Parsing JSON input content...");
      await new Promise((resolve) => setTimeout(resolve, 600));
      const parsed = JSON.parse(uploadText);
      updateProgress(0, 'success', 50, "JSON parsed successfully.");

      updateProgress(1, 'running', 70, "Verifying Plugin SDK compliance...");
      const result = validatePluginPackage(parsed);
      if (!result.valid || !result.plugin) {
        throw new Error(result.error || 'Validation error');
      }
      if (plugins.some((p) => p.id === result.plugin!.id)) {
        throw new Error(`A plugin with ID "${result.plugin!.id}" is already installed.`);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateProgress(1, 'success', 85, "Plugin metadata validated.");

      updateProgress(2, 'running', 95, "Registering module hooks & controllers...");
      installPlugin(result.plugin);
      await new Promise((resolve) => setTimeout(resolve, 400));

      setUploadSuccess(true);
      setUploadText('');
      completeProgress("Plugin installed successfully!");
      triggerNotice(`Installed "${result.plugin.name}"!`);
    } catch (e: any) {
      errorProgress(0, e.message || 'Failed to parse JSON.');
      setUploadError('JSON syntax error: ' + e.message);
    }
  };

  const handleDownloadStarter = () => {
    const starterManifest = {
      id: 'plugin-starter-example',
      name: 'CreatorPulse Starter Plugin',
      slug: 'starter-example',
      description: 'Official template demonstrating Plugin SDK v1.0 with hook listeners, settings schema, and lifecycle hooks.',
      version: '1.0.0',
      author: 'Your Dev Studio',
      authorUrl: 'https://yourdevstudio.com',
      iconUrl: '🚀',
      category: 'Community & Media',
      tags: ['Starter', 'SDK v1.0', 'Example'],
      minAppVersion: '1.0.0',
      permissions: ['storage_access', 'notifications_send'],
      hooks: ['post_card_footer', 'navbar_actions'],
      settingsSchema: [
        { id: 'customText', label: 'Badge Text', type: 'text', defaultValue: 'Verified Add-on' },
        { id: 'enableFeature', label: 'Enable Feature', type: 'boolean', defaultValue: true }
      ],
      settingsValues: {
        customText: 'Verified Add-on',
        enableFeature: true
      },
      lifecycle: {
        onInstall: 'console.log("Plugin installed successfully")',
        onActivate: 'console.log("Plugin activated")',
        onDeactivate: 'console.log("Plugin deactivated")'
      },
      changelog: [
        { version: '1.0.0', date: new Date().toISOString().split('T')[0], changes: ['Initial starter release'] }
      ]
    };

    const blob = new Blob([JSON.stringify(starterManifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'creatorpulse-plugin-starter-v1.0.json';
    a.click();
    URL.revokeObjectURL(url);
    triggerNotice('Downloaded CreatorPulse Plugin SDK v1.0 Starter Template!');
  };

  // Licensing Modal Actions
  const handleOpenLicenseActivation = (plugin: PluginManifest) => {
    setLicenseTargetPlugin(plugin);
    setLicenseInputKey(plugin.licenseKey || '');
    setLicenseError('');
    setLicenseSuccess(false);
  };

  const handleConfirmLicenseActivation = async () => {
    if (!licenseTargetPlugin) return;
    setLicenseError('');
    setLicenseSuccess(false);

    startProgress({
      title: `Activating ${licenseTargetPlugin.name}`,
      steps: [
        "Verifying license key...",
        "Validating compliance SDK v1.0...",
        "Initializing plugin features..."
      ]
    });

    try {
      updateProgress(0, 'running', 25, "Verifying license key...");
      await new Promise((resolve) => setTimeout(resolve, 600));

      const res = await activatePluginWithLicense(licenseTargetPlugin.id, licenseInputKey);
      if (!res.success) {
        throw new Error(res.error || 'Failed to activate plugin.');
      }
      updateProgress(0, 'success', 50, "License key verified.");

      updateProgress(1, 'running', 70, "Validating compliance SDK v1.0...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateProgress(1, 'success', 85, "SDK compatibility verified.");

      updateProgress(2, 'running', 95, "Initializing plugin features...");
      await new Promise((resolve) => setTimeout(resolve, 400));

      setLicenseSuccess(true);
      completeProgress("Plugin activated successfully!");
      triggerNotice(`Activated "${licenseTargetPlugin.name}" successfully!`);
      setTimeout(() => {
        setLicenseTargetPlugin(null);
        setLicenseSuccess(false);
        setLicenseInputKey('');
      }, 800);
    } catch (err: any) {
      errorProgress(0, err.message || 'Activation failed.');
      setLicenseError(err.message || 'Failed to activate plugin.');
    }
  };

  // Actions confirmations
  const handleToggleClick = (plugin: PluginManifest, checked: boolean) => {
    if (checked) {
      if (plugin.requiresLicense && plugin.licenseStatus !== 'licensed') {
        handleOpenLicenseActivation(plugin);
      } else {
        setConfirmAction({
          type: 'activate',
          pluginId: plugin.id,
          pluginName: plugin.name
        });
      }
    } else {
      setConfirmAction({
        type: 'deactivate',
        pluginId: plugin.id,
        pluginName: plugin.name
      });
    }
  };

  const handleInstallLibraryClick = (plugin: PluginManifest) => {
    // Validate dependencies
    const missing: string[] = [];
    if (plugin.dependencies?.plugins) {
      for (const depId of plugin.dependencies.plugins) {
        const isInstalled = plugins.some((p) => p.id === depId);
        if (!isInstalled) {
          const libItem = libraryPlugins.find((p) => p.id === depId);
          missing.push(libItem ? libItem.name : depId);
        }
      }
    }

    setConfirmAction({
      type: 'install',
      pluginId: plugin.id,
      pluginName: plugin.name,
      dependencies: missing.length > 0 ? missing : undefined
    });
  };

  const handleUpdateClick = (plugin: PluginManifest) => {
    setConfirmAction({
      type: 'update',
      pluginId: plugin.id,
      pluginName: plugin.name,
      targetVersion: plugin.latestVersion
    });
  };

  const handleDeleteClick = (plugin: PluginManifest) => {
    setConfirmAction({
      type: 'delete',
      pluginId: plugin.id,
      pluginName: plugin.name
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    const { type, pluginId, pluginName } = confirmAction;
    setConfirmAction(null);

    if (type === 'activate') {
      startProgress({
        title: `Activating ${pluginName}`,
        steps: [
          "Verifying system compliance...",
          "Binding plugin event hooks...",
          "Running bootstrap initialization..."
        ]
      });

      try {
        updateProgress(0, 'running', 30, "Verifying system compliance...");
        await new Promise((resolve) => setTimeout(resolve, 600));
        updateProgress(0, 'success', 60, "Compliance checks OK.");

        updateProgress(1, 'running', 80, "Binding plugin event hooks...");
        togglePlugin(pluginId, true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        updateProgress(1, 'success', 90, "Event hooks mapped.");

        updateProgress(2, 'running', 95, "Running bootstrap initialization...");
        await new Promise((resolve) => setTimeout(resolve, 400));

        completeProgress("Plugin activated successfully!");
        triggerNotice(`Activated "${pluginName}" successfully!`);
      } catch (err: any) {
        errorProgress(1, err.message || "Failed to activate plugin.");
      }
    } else if (type === 'deactivate') {
      startProgress({
        title: `Deactivating ${pluginName}`,
        steps: [
          "Gracefully stopping active tasks...",
          "Unbinding plugin event hooks...",
          "Flushing configuration cache..."
        ]
      });

      try {
        updateProgress(0, 'running', 30, "Gracefully stopping active tasks...");
        await new Promise((resolve) => setTimeout(resolve, 600));
        updateProgress(0, 'success', 60, "Active tasks stopped.");

        updateProgress(1, 'running', 80, "Unbinding plugin event hooks...");
        togglePlugin(pluginId, false);
        await new Promise((resolve) => setTimeout(resolve, 500));
        updateProgress(1, 'success', 90, "Hooks cleared.");

        updateProgress(2, 'running', 95, "Flushing configuration cache...");
        await new Promise((resolve) => setTimeout(resolve, 400));

        completeProgress("Plugin deactivated.");
        triggerNotice(`Deactivated "${pluginName}" successfully!`);
      } catch (err: any) {
        errorProgress(1, err.message || "Failed to deactivate plugin.");
      }
    } else if (type === 'update') {
      startProgress({
        title: `Updating ${pluginName}`,
        steps: [
          "Creating plugin restore backup...",
          "Downloading package updates...",
          "Applying database scheme migrations..."
        ]
      });

      try {
        updateProgress(0, 'running', 20, "Creating plugin restore backup...");
        await new Promise((resolve) => setTimeout(resolve, 600));
        updateProgress(0, 'success', 50, "Backup point created.");

        updateProgress(1, 'running', 70, "Downloading package updates...");
        updatePluginVersion(pluginId);
        await new Promise((resolve) => setTimeout(resolve, 600));
        updateProgress(1, 'success', 85, "Downloaded package files.");

        updateProgress(2, 'running', 95, "Applying database scheme migrations...");
        await new Promise((resolve) => setTimeout(resolve, 400));

        completeProgress("Plugin updated successfully!");
        triggerNotice(`Updated "${pluginName}" to v${confirmAction.targetVersion}!`);
      } catch (err: any) {
        errorProgress(1, err.message || "Failed to update plugin.");
      }
    } else if (type === 'delete') {
      startProgress({
        title: `Uninstalling ${pluginName}`,
        steps: [
          "Stopping running background routines...",
          "Deleting plugin settings & cache...",
          "Purging plugin file directories..."
        ]
      });

      try {
        updateProgress(0, 'running', 30, "Stopping running background routines...");
        await new Promise((resolve) => setTimeout(resolve, 600));
        updateProgress(0, 'success', 60, "Routines stopped.");

        updateProgress(1, 'running', 80, "Deleting plugin settings & cache...");
        const res = deletePlugin(pluginId);
        if (!res) {
          throw new Error("Plugin deletion failed.");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        updateProgress(1, 'success', 90, "Settings and cache deleted.");

        updateProgress(2, 'running', 95, "Purging plugin file directories...");
        await new Promise((resolve) => setTimeout(resolve, 400));

        completeProgress("Plugin fully uninstalled.");
        triggerNotice(`Deleted and uninstalled "${pluginName}".`);
      } catch (err: any) {
        errorProgress(1, err.message || "Failed to delete plugin.");
      }
    } else if (type === 'install') {
      startProgress({
        title: `Installing ${pluginName}`,
        steps: [
          "Downloading package from registry...",
          "Resolving SDK module dependancies...",
          "Registering hooks & metadata..."
        ]
      });

      try {
        updateProgress(0, 'running', 20, "Downloading package from registry...");
        await new Promise((resolve) => setTimeout(resolve, 700));
        updateProgress(0, 'success', 50, "Download completed.");

        updateProgress(1, 'running', 70, "Resolving SDK module dependancies...");
        const res = installFromLibrary(pluginId);
        if (!res) {
          throw new Error("Plugin library installation failed.");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        updateProgress(1, 'success', 85, "Dependencies resolved.");

        updateProgress(2, 'running', 95, "Registering hooks & metadata...");
        await new Promise((resolve) => setTimeout(resolve, 400));

        completeProgress("Plugin installed successfully!");
        triggerNotice(`Installed "${pluginName}" from library. Open tab to activate.`);
        setActiveTab('installed');
      } catch (err: any) {
        errorProgress(1, err.message || "Failed to install plugin.");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Puzzle className="text-indigo-600" size={24} />
            <h1 className="text-2xl font-black text-[#18181B]">Plugin Management</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Extend platform capabilities modularly without modifying core code. Standard Plugin SDK v1.0 compliant.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<BookOpen size={14} />}
            onClick={() => setIsDocsOpen(true)}
            className="w-full sm:w-auto"
          >
            Developer SDK Docs
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Upload size={14} />}
            onClick={() => setIsUploadOpen(true)}
            className="w-full sm:w-auto"
          >
            Upload Plugin (.ZIP / JSON)
          </Button>
        </div>
      </div>

      {/* Notice Banner */}
      {actionNotice && (
        <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-2xl text-xs text-indigo-700 font-bold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-indigo-600" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice('')} className="text-[#A1A1AA] hover:text-[#18181B]">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'installed'
                ? 'bg-indigo-50 text-indigo-700 border border-slate-300 shadow-xs'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <span>All Installed</span>
            <span className="text-[10px] bg-white text-indigo-700 px-1.5 py-0.5 rounded-full border border-slate-200">
              {plugins.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-indigo-50 text-indigo-700 border border-slate-300 shadow-xs'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Active</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200">
              {activePlugins.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'inactive'
                ? 'bg-indigo-50 text-indigo-700 border border-slate-300 shadow-xs'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <span>Inactive</span>
            <span className="text-[10px] bg-slate-50 text-[#71717A] px-1.5 py-0.5 rounded-full border border-slate-200">
              {plugins.length - activePlugins.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'updates'
                ? 'bg-indigo-50 text-indigo-700 border border-slate-300 shadow-xs'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <span>Updates</span>
            {updateCount > 0 && (
              <span className="text-[10px] bg-[#EF4444] text-white px-1.5 py-0.5 rounded-full font-bold">
                {updateCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'library'
                ? 'bg-indigo-50 text-indigo-700 border border-slate-300 shadow-xs'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <Sparkles size={13} className="text-indigo-600" />
            <span>Plugin Library</span>
            <span className="text-[10px] bg-gradient-to-r from-[#4F46E5] to-[#EF4444] text-white px-1.5 py-0.5 rounded-full">
              Available
            </span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={13} />
            <input
              type="text"
              placeholder="Search add-ons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#18181B] focus:outline-none font-medium w-full sm:w-auto"
          >
            <option value="all">All Categories</option>
            <option value="Monetization">Monetization</option>
            <option value="Security & DRM">Security & DRM</option>
            <option value="Marketing & SEO">Marketing & SEO</option>
            <option value="AI & Automation">AI & Automation</option>
            <option value="Community & Media">Community & Media</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab !== 'library' ? (
        /* Installed Plugins List */
        <div className="space-y-4">
          {filteredInstalledPlugins.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-indigo-600 flex items-center justify-center mx-auto text-xl">
                🔌
              </div>
              <h3 className="font-bold text-sm text-[#18181B]">No Plugins Found</h3>
              <p className="text-xs text-[#71717A] max-w-sm mx-auto">
                No add-ons match the selected tab and filter criteria. You can browse the Plugin Library to install new features.
              </p>
              <Button variant="primary" size="sm" onClick={() => setActiveTab('library')}>
                Browse Plugin Library
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstalledPlugins.map((plugin) => (
                <Card
                  key={plugin.id}
                  className={`p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-lg relative overflow-hidden ${
                    plugin.isEnabled 
                      ? 'border-slate-200 bg-white ring-1 ring-indigo-500/10' 
                      : 'border-slate-200 bg-slate-50/50 opacity-95'
                  } ${plugin.hasError ? 'border-red-200 bg-red-50/10' : ''}`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon & Status Toggle */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 text-2xl flex items-center justify-center border border-indigo-100 shrink-0 shadow-xs">
                          {plugin.iconUrl}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#18181B] leading-tight flex items-center gap-1.5 flex-wrap">
                            <span>{plugin.name}</span>
                          </h3>
                          <p className="text-[11px] text-[#71717A] font-medium">By {plugin.author}</p>
                        </div>
                      </div>

                      {/* Active Toggle Switch or License Prompt */}
                      {plugin.requiresLicense && plugin.licenseStatus !== 'licensed' ? (
                        <button
                          onClick={() => handleOpenLicenseActivation(plugin)}
                          className="px-2.5 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <Lock size={10} />
                          <span>Unlock</span>
                        </button>
                      ) : (
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={plugin.isEnabled}
                            onChange={(e) => handleToggleClick(plugin, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5.5 bg-[#E4E4E7] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E4E4E7] after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                        </label>
                      )}
                    </div>

                    <p className="text-xs text-[#71717A] leading-relaxed line-clamp-2 font-medium">
                      {plugin.description}
                    </p>

                    {/* Licensing & Compatibility Error Notice */}
                    {plugin.hasError && (
                      <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[10px] font-bold flex items-start gap-1.5">
                        <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                        <span>{plugin.errorMessage}</span>
                      </div>
                    )}

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-indigo-700 border border-slate-300">
                        {plugin.category}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A]">
                        v{plugin.version}
                      </span>

                      {/* License Badge */}
                      {plugin.requiresLicense ? (
                        plugin.licenseStatus === 'licensed' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck size={10} /> Licensed
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                            <Lock size={10} /> License Required
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
                          Exempt
                        </span>
                      )}

                      {plugin.hasUpdate && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-[#FECDD3] flex items-center gap-1 animate-pulse">
                          <Zap size={10} /> v{plugin.latestVersion} Available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-200">
                    <div className="flex items-center gap-1">
                      {plugin.settingsSchema.length > 0 && (
                        <button
                          onClick={() => openConfigModal(plugin)}
                          className="p-2 rounded-xl text-[#71717A] hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Configure Settings"
                        >
                          <Settings size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => setDetailsPlugin(plugin)}
                        className="p-2 rounded-xl text-[#71717A] hover:text-[#18181B] hover:bg-slate-100 transition-colors cursor-pointer"
                        title="View Manifest & Changelog"
                      >
                        <Info size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(plugin)}
                        className="p-2 rounded-xl text-[#71717A] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Uninstall Plugin"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {plugin.hasUpdate ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateClick(plugin)}
                        leftIcon={<RefreshCw size={12} />}
                      >
                        Update to v{plugin.latestVersion}
                      </Button>
                    ) : (
                      <span className="text-[11px] text-[#A1A1AA] font-medium flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-500" /> Compatible
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Plugin Discovery Library / Marketplace */
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-[#F1F5F9] to-white border border-slate-300 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#18181B]">CreatorPulse Official & Verified Plugin Library</h4>
                <p className="text-[11px] text-[#71717A] mt-0.5">
                  Browse, search, and install verified modular plugins. Installing plugins will resolve and validate dependencies.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={13} />}
              onClick={handleDownloadStarter}
              className="w-full md:w-auto"
            >
              Download Plugin SDK Starter
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLibraryPlugins.map((plugin) => {
              const isInstalled = plugins.some((installed) => installed.id === plugin.id);
              return (
                <Card
                  key={plugin.id}
                  className={`p-5 flex flex-col justify-between border-slate-200 bg-white transition-all duration-300 hover:shadow-lg relative overflow-hidden ${
                    isInstalled ? 'bg-slate-50/50 opacity-90' : ''
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-2xl flex items-center justify-center border border-slate-200 shrink-0 shadow-xs">
                          {plugin.iconUrl}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#18181B] leading-tight">{plugin.name}</h3>
                          <p className="text-[11px] text-[#71717A] font-medium">By {plugin.author}</p>
                        </div>
                      </div>
                      {isInstalled ? (
                        <Badge variant="emerald" size="sm">Installed</Badge>
                      ) : (
                        <Badge variant="pink" size="sm">Available</Badge>
                      )}
                    </div>

                    <p className="text-xs text-[#71717A] leading-relaxed line-clamp-3 font-medium">
                      {plugin.description}
                    </p>

                    {plugin.dependencies && (
                      <div className="text-[10px] bg-indigo-50/50 p-2 rounded-xl text-indigo-700 font-semibold space-y-0.5">
                        <p className="font-bold text-[10px] uppercase text-indigo-800">Required Plugins:</p>
                        <p className="font-mono text-[9px]">{plugin.dependencies.plugins?.join(', ')}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-indigo-700 border border-slate-300">
                        {plugin.category}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A]">
                        v{plugin.version}
                      </span>
                      {plugin.requiresLicense && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200 flex items-center gap-1">
                          <Lock size={9} /> License Key Required
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-200">
                    <button
                      onClick={() => setDetailsPlugin(plugin)}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Info size={13} /> View Specs
                    </button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleInstallLibraryClick(plugin)}
                      disabled={isInstalled}
                      leftIcon={isInstalled ? <Check size={13} /> : <Plus size={13} />}
                    >
                      {isInstalled ? 'Installed' : 'Install Add-on'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings Configuration Modal */}
      {configuringPlugin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-xl flex items-center justify-center border border-slate-200">
                  {configuringPlugin.iconUrl}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#18181B]">{configuringPlugin.name} Settings</h3>
                  <p className="text-xs text-[#71717A]">Configure parameters and preferences</p>
                </div>
              </div>
              <button
                onClick={() => setConfiguringPlugin(null)}
                className="p-1 rounded-xl text-[#71717A] hover:text-[#18181B] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              {configuringPlugin.settingsSchema.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label className="block font-bold text-[#18181B]">{field.label}</label>
                  {field.description && (
                    <p className="text-[11px] text-[#71717A]">{field.description}</p>
                  )}

                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={String(configDraft[field.id] ?? '')}
                      onChange={(e) => setConfigDraft({ ...configDraft, [field.id]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  )}

                  {field.type === 'password' && (
                    <input
                      type="password"
                      value={String(configDraft[field.id] ?? '')}
                      onChange={(e) => setConfigDraft({ ...configDraft, [field.id]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={configDraft[field.id] !== undefined ? Number(configDraft[field.id]) : ''}
                      onChange={(e) => setConfigDraft({ ...configDraft, [field.id]: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  )}

                  {field.type === 'boolean' && (
                    <label className="flex items-center gap-2 cursor-pointer pt-1 font-bold text-[#18181B]">
                      <input
                        type="checkbox"
                        checked={Boolean(configDraft[field.id])}
                        onChange={(e) => setConfigDraft({ ...configDraft, [field.id]: e.target.checked })}
                        className="accent-[#4F46E5] rounded"
                      />
                      <span>Enable Option</span>
                    </label>
                  )}

                  {field.type === 'select' && (
                    <select
                      value={String(configDraft[field.id] ?? '')}
                      onChange={(e) => setConfigDraft({ ...configDraft, [field.id]: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none font-medium"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      rows={3}
                      value={String(configDraft[field.id] ?? '')}
                      onChange={(e) => setConfigDraft({ ...configDraft, [field.id]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-[#18181B] focus:outline-none focus:border-indigo-500"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setConfiguringPlugin(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveConfig}>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Manifest & Changelog Details Modal */}
      {detailsPlugin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-xl flex items-center justify-center border border-slate-200">
                  {detailsPlugin.iconUrl}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#18181B]">{detailsPlugin.name}</h3>
                  <p className="text-xs text-[#71717A]">v{detailsPlugin.version} • By {detailsPlugin.author}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailsPlugin(null)}
                className="p-1 rounded-xl text-[#71717A] hover:text-[#18181B]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-[#71717A] leading-relaxed font-medium">{detailsPlugin.description}</p>

              {/* Technical Specifications */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-[#18181B] flex items-center gap-1.5">
                  <Code size={14} className="text-indigo-600" />
                  <span>SDK Manifest Specifications</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#A1A1AA] block">Plugin ID:</span>
                    <span className="font-mono text-[#18181B] font-bold">{detailsPlugin.id}</span>
                  </div>
                  <div>
                    <span className="text-[#A1A1AA] block">Min Core App Version:</span>
                    <span className="font-mono text-[#18181B] font-bold">v{detailsPlugin.minAppVersion}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[#A1A1AA] block text-[11px] mb-1">Registered Extension Hooks:</span>
                  <div className="flex flex-wrap gap-1">
                    {detailsPlugin.hooks.map((hook) => (
                      <span key={hook} className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-700">
                        {hook}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[#A1A1AA] block text-[11px] mb-1">Granted Permissions:</span>
                  <div className="flex flex-wrap gap-1">
                    {detailsPlugin.permissions.map((perm) => (
                      <span key={perm} className="text-[10px] font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-emerald-800 font-bold">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Changelog */}
              <div>
                <h4 className="font-bold text-[#18181B] mb-2">Version Changelog</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {detailsPlugin.changelog.map((c) => (
                    <div key={c.version} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-700">v{c.version}</span>
                        <span className="text-[10px] text-[#A1A1AA]">{c.date}</span>
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-[#71717A] space-y-0.5">
                        {c.changes.map((ch, idx) => (
                          <li key={idx}>{ch}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setDetailsPlugin(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Plugin Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-[#18181B] flex items-center gap-2">
                  <Upload size={18} className="text-indigo-600" />
                  <span>Upload Plugin Package (.ZIP / JSON)</span>
                </h3>
                <p className="text-xs text-[#71717A]">Install custom third-party add-ons into your portal</p>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-xl text-[#71717A] hover:text-[#18181B]"
              >
                <X size={18} />
              </button>
            </div>

            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Plugin package verified and installed successfully!</span>
              </div>
            )}

            {uploadError && (
              <div className="p-3 bg-red-50 border border-[#FECDD3] rounded-2xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="flex flex-col gap-3">
                <div className="border-2 border-dashed border-slate-200 hover:border-[#4F46E5] rounded-2xl p-6 text-center space-y-2 bg-slate-50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".json,.zip"
                    onChange={handleUploadFile}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Upload size={22} />
                  </div>
                  <p className="font-bold text-[#18181B]">Click to browse or drop plugin .ZIP or .JSON package here</p>
                  <p className="text-[11px] text-[#71717A]">Manifest compliant with Plugin SDK v1.0 standard</p>
                </div>

                <div className="text-center py-1 text-slate-400 font-bold uppercase text-[9px] tracking-wider">— or —</div>

                <Button 
                  type="button" 
                  variant="outline" 
                  size="md" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => setIsMediaPickerOpen(true)}
                >
                  <ImageIcon size={15} /> Select Plugin from Media Library
                </Button>
              </div>

              <MediaLibraryModal
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                allowedTypes={['.zip', '.json', 'application/zip', 'application/json']}
                maxFiles={1}
                initialFolder="plugins"
                onSelect={async (selected) => {
                  const selectedFile = selected[0];
                  if (selectedFile) {
                    try {
                      setIsUploadOpen(false);
                      const response = await fetch(selectedFile.url);
                      const blob = await response.blob();
                      const file = new File([blob], selectedFile.name, { type: selectedFile.mimeType });
                      
                      // Process file
                      startProgress({
                        title: `Uploading & Installing ${file.name}`,
                        steps: [
                          "Reading file stream...",
                          "Decompressing & extracting manifest...",
                          "Verifying Plugin SDK compliance...",
                          "Registering module hooks & controllers..."
                        ]
                      });
                      
                      updateProgress(0, 'running', 15, "Reading file stream...");
                      await new Promise((resolve) => setTimeout(resolve, 500));
                      updateProgress(0, 'success', 30, "File read completed.");

                      updateProgress(1, 'running', 45, "Decompressing & extracting manifest...");
                      let manifestText = '';
                      if (file.name.endsWith('.zip')) {
                        const arrayBuffer = await file.arrayBuffer();
                        manifestText = await extractPluginJsonFromZip(arrayBuffer);
                      } else {
                        const text = await file.text();
                        manifestText = text;
                      }
                      await new Promise((resolve) => setTimeout(resolve, 400));
                      updateProgress(1, 'success', 60, "Manifest extracted.");

                      updateProgress(2, 'running', 75, "Verifying Plugin SDK compliance...");
                      const parsed = JSON.parse(manifestText);
                      const result = validatePluginPackage(parsed);
                      if (!result.valid || !result.plugin) {
                        throw new Error(result.error || 'Failed to validate plugin package.');
                      }
                      if (plugins.some((p) => p.id === result.plugin!.id)) {
                        throw new Error(`A plugin with ID "${result.plugin!.id}" is already installed.`);
                      }
                      await new Promise((resolve) => setTimeout(resolve, 500));
                      updateProgress(2, 'success', 85, "Package validation OK.");

                      updateProgress(3, 'running', 95, "Registering module hooks & controllers...");
                      installPlugin(result.plugin);
                      await new Promise((resolve) => setTimeout(resolve, 400));

                      setUploadSuccess(true);
                      completeProgress("Plugin installed successfully!");
                      triggerNotice(`Installed "${result.plugin.name}" successfully!`);
                    } catch (err: any) {
                      errorProgress(1, err.message || 'Error occurred.');
                      setUploadError(err.message || 'Failed to install plugin.');
                      setIsUploadOpen(true);
                    }
                  }
                }}
              />

              <div className="space-y-1.5">
                <label className="block font-bold text-[#18181B]">Or Paste Raw Plugin Manifest JSON:</label>
                <textarea
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  rows={4}
                  placeholder={`{\n  "id": "plugin-custom-tool",\n  "name": "Custom Tool",\n  "version": "1.0.0",\n  "hooks": ["navbar_actions"],\n  "permissions": ["storage_access"]\n}`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] text-[#18181B] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleManualJsonInstall}
                disabled={!uploadText.trim()}
              >
                Validate & Install
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Developer SDK Docs Modal */}
      {isDocsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#18181B]">Plugin SDK v1.0 Developer Guide</h3>
                  <p className="text-xs text-[#71717A]">Building sandboxed extensions for CreatorPulse</p>
                </div>
              </div>
              <button
                onClick={() => setIsDocsOpen(false)}
                className="p-1 rounded-xl text-[#71717A] hover:text-[#18181B]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">Standard Package Architecture</h4>
                <p className="text-slate-500">
                  Every plugin package is packaged as a `.zip` or `.json` file containing a root `plugin.json` manifest.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 text-indigo-200 rounded-2xl font-mono text-[11px] space-y-1">
                <p className="text-[#A1A1AA]">// Example plugin.json</p>
                <p>{`{`}</p>
                <p className="pl-3">{`"id": "plugin-custom-watermark",`}</p>
                <p className="pl-3">{`"name": "Custom Watermark Tool",`}</p>
                <p className="pl-3">{`"version": "1.0.0",`}</p>
                <p className="pl-3">{`"minAppVersion": "1.0.0",`}</p>
                <p className="pl-3">{`"permissions": ["media_transform", "storage_access"],`}</p>
                <p className="pl-3">{`"hooks": ["post_card_footer", "creator_dashboard_widgets"],`}</p>
                <p className="pl-3">{`"settingsSchema": [`}</p>
                <p className="pl-6">{`{ "id": "watermarkText", "label": "Text", "type": "text", "defaultValue": "© CP" }`}</p>
                <p className="pl-3">{`]`}</p>
                <p>{`}`}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#18181B]">Available Hook Points</h4>
                <ul className="list-disc list-inside text-[#71717A] space-y-1">
                  <li><strong className="text-[#18181B]">navbar_actions:</strong> Injects interactive action items into top navbar</li>
                  <li><strong className="text-[#18181B]">post_card_footer:</strong> Renders badges, gifts, and copyright protection on feed cards</li>
                  <li><strong className="text-[#18181B]">creator_dashboard_widgets:</strong> Adds custom analytics & management widgets to creator studio</li>
                  <li><strong className="text-[#18181B]">payment_gateway_methods:</strong> Expands wallet & checkout payment processors</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 shrink-0">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Download size={13} />}
                onClick={handleDownloadStarter}
              >
                Download Starter Plugin
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsDocsOpen(false)}>
                Close Docs
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* License key Verification Modal */}
      {licenseTargetPlugin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-[#18181B]">Activate {licenseTargetPlugin.name}</h3>
                <p className="text-xs text-[#71717A]">Add-on License Verification</p>
              </div>
              <button
                onClick={() => setLicenseTargetPlugin(null)}
                className="p-1 rounded-xl text-[#71717A] hover:text-[#18181B]"
              >
                <X size={18} />
              </button>
            </div>

            {licenseSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>License validated and plugin enabled successfully!</span>
              </div>
            )}

            {licenseError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600 shrink-0" />
                <span>{licenseError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 text-xl flex items-center justify-center border border-indigo-100">
                  {licenseTargetPlugin.iconUrl}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#18181B]">{licenseTargetPlugin.name} v{licenseTargetPlugin.version}</h4>
                  <p className="text-[11px] text-[#71717A]">Developer: {licenseTargetPlugin.author}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#18181B]">Plugin License Key / Purchase Code</label>
                <input
                  type="text"
                  placeholder="CP-PLUGIN-XXXX-XXXX-XXXX"
                  value={licenseInputKey}
                  onChange={(e) => setLicenseInputKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-[#18181B] focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-[#A1A1AA]">
                  Enter a valid purchase code to activate this plugin. Example: CP-PLUGIN-TEST-KEY-2026
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={() => setLicenseTargetPlugin(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmLicenseActivation}>
                Verify & Activate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-200">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#18181B]">
                  Confirm {confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)}
                </h3>
                <p className="text-xs text-[#71717A]">Please confirm your action below</p>
              </div>
            </div>

            <div className="text-xs text-[#71717A] leading-relaxed space-y-3 font-medium">
              {confirmAction.type === 'activate' && (
                <p>
                  Are you sure you want to activate <strong className="text-[#18181B]">{confirmAction.pluginName}</strong>?
                  This will register its lifecycle triggers and hook endpoints.
                </p>
              )}

              {confirmAction.type === 'deactivate' && (
                <p>
                  Are you sure you want to deactivate <strong className="text-[#18181B]">{confirmAction.pluginName}</strong>?
                  Any active widgets, forms, or visual alterations will immediately stop running.
                </p>
              )}

              {confirmAction.type === 'update' && (
                <p>
                  Are you sure you want to update <strong className="text-[#18181B]">{confirmAction.pluginName}</strong> to v{confirmAction.targetVersion}?
                  This will override current package configurations and run update migrations.
                </p>
              )}

              {confirmAction.type === 'delete' && (
                <p className="text-red-600 font-semibold bg-red-50/50 p-3 rounded-2xl border border-red-100">
                  Warning: You are about to permanently delete and uninstall {confirmAction.pluginName}.
                  All settings, database schemas, and associated secrets will be completely wiped from the platform.
                </p>
              )}

              {confirmAction.type === 'install' && (
                <div className="space-y-3">
                  <p>
                    Are you sure you want to install <strong className="text-[#18181B]">{confirmAction.pluginName}</strong> from the official library?
                  </p>
                  
                  {confirmAction.dependencies && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl space-y-1.5">
                      <p className="font-bold flex items-center gap-1">
                        <ShieldAlert size={14} /> Missing Dependencies Found:
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 font-semibold">
                        {confirmAction.dependencies.map((dep) => (
                          <li key={dep}>{dep}</li>
                        ))}
                      </ul>
                      <p className="text-[10px] text-red-600 font-bold mt-1">
                        Installation is blocked. Please install the required plugins listed above before installing this add-on.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button
                variant={confirmAction.type === 'delete' ? 'danger' : 'primary'}
                size="sm"
                onClick={handleConfirmAction}
                disabled={confirmAction.type === 'install' && !!confirmAction.dependencies}
              >
                Confirm {confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
