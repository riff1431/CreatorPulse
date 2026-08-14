'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Puzzle, Upload, CheckCircle2, AlertTriangle, Settings, RefreshCw,
  Trash2, Plus, Info, ExternalLink, Shield, Code, Download, X,
  Search, SlidersHorizontal, Check, Zap, Sparkles, Lock, ArrowUpRight,
  BookOpen, Terminal, Layers, ArrowRight, Play, Eye
} from 'lucide-react';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { PluginManifest, PluginHookType, PluginPermission } from '@/lib/extensions/plugin-types';
import { validatePluginPackage } from '@/lib/extensions/package-installer';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';

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
    deletePlugin
  } = usePlugins();

  const [activeTab, setActiveTab] = useState<'installed' | 'active' | 'inactive' | 'updates' | 'library'>('installed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [configuringPlugin, setConfiguringPlugin] = useState<PluginManifest | null>(null);
  const [configDraft, setConfigDraft] = useState<Record<string, unknown>>({});
  const [detailsPlugin, setDetailsPlugin] = useState<PluginManifest | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

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
    const isAlreadyInstalled = plugins.some((installed) => installed.id === p.id);
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    return !isAlreadyInstalled && matchesSearch && matchesCategory;
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

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setUploadSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const result = validatePluginPackage(parsed);

        if (!result.valid || !result.plugin) {
          setUploadError(result.error || 'Failed to validate plugin package.');
          return;
        }

        // Check duplicate ID
        if (plugins.some((p) => p.id === result.plugin!.id)) {
          setUploadError(`A plugin with ID "${result.plugin!.id}" is already installed.`);
          return;
        }

        installPlugin(result.plugin);
        setUploadSuccess(true);
        triggerNotice(`Installed "${result.plugin.name}" successfully!`);
        setTimeout(() => {
          setIsUploadOpen(false);
          setUploadSuccess(false);
        }, 1200);
      } catch (err: any) {
        setUploadError('Invalid package format. Please provide a valid plugin JSON manifest or ZIP.');
      }
    };
    reader.readAsText(file);
  };

  const handleManualJsonInstall = () => {
    setUploadError('');
    setUploadSuccess(false);
    try {
      const parsed = JSON.parse(uploadText);
      const result = validatePluginPackage(parsed);
      if (!result.valid || !result.plugin) {
        setUploadError(result.error || 'Validation error');
        return;
      }

      if (plugins.some((p) => p.id === result.plugin!.id)) {
        setUploadError(`A plugin with ID "${result.plugin!.id}" is already installed.`);
        return;
      }

      installPlugin(result.plugin);
      setUploadSuccess(true);
      triggerNotice(`Installed "${result.plugin.name}"!`);
      setTimeout(() => {
        setIsUploadOpen(false);
        setUploadSuccess(false);
        setUploadText('');
      }, 1200);
    } catch (e: any) {
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
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

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<BookOpen size={14} />}
            onClick={() => setIsDocsOpen(true)}
          >
            Developer SDK Docs
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Upload size={14} />}
            onClick={() => setIsUploadOpen(true)}
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
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
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
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
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
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
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
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
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'library'
                ? 'bg-indigo-50 text-indigo-700 border border-slate-300 shadow-xs'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <Sparkles size={13} className="text-indigo-600" />
            <span>Plugin Library</span>
            <span className="text-[10px] bg-gradient-to-r from-[#4F46E5] to-[#EF4444] text-white px-1.5 py-0.5 rounded-full">
              New
            </span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
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
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#18181B] focus:outline-none font-medium"
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
                  className={`p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${
                    plugin.isEnabled ? 'border-slate-200 bg-white' : 'border-slate-200/60 bg-slate-50/50 opacity-90'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon & Status Toggle */}
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

                      {/* Active Toggle Switch */}
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={plugin.isEnabled}
                          onChange={(e) => togglePlugin(plugin.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 bg-[#E4E4E7] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E4E4E7] after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                      </label>
                    </div>

                    <p className="text-xs text-[#71717A] leading-relaxed line-clamp-2 font-medium">
                      {plugin.description}
                    </p>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-indigo-700 border border-slate-300">
                        {plugin.category}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A]">
                        v{plugin.version}
                      </span>
                      {plugin.hasUpdate && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-[#FECDD3] flex items-center gap-1">
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
                        onClick={() => deletePlugin(plugin.id)}
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
                        onClick={() => updatePluginVersion(plugin.id)}
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
                  Browse and install verified add-ons with 1-click. All plugins are sandboxed and adhere to Plugin SDK v1.0.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={13} />}
              onClick={handleDownloadStarter}
            >
              Download Plugin SDK Starter
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLibraryPlugins.map((plugin) => (
              <Card
                key={plugin.id}
                className="p-5 flex flex-col justify-between border-slate-200 bg-white transition-all duration-300 hover:shadow-lg hover:border-slate-300/50"
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
                    <Badge variant="pink" size="sm">Available</Badge>
                  </div>

                  <p className="text-xs text-[#71717A] leading-relaxed line-clamp-3 font-medium">
                    {plugin.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-indigo-700 border border-slate-300">
                      {plugin.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A]">
                      v{plugin.version}
                    </span>
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
                    onClick={() => {
                      installFromLibrary(plugin.id);
                      triggerNotice(`Installed "${plugin.name}"! You can now activate and configure it.`);
                    }}
                    leftIcon={<Plus size={13} />}
                  >
                    Install Add-on
                  </Button>
                </div>
              </Card>
            ))}
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
    </div>
  );
}
