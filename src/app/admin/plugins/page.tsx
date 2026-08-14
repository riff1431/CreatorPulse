'use client';

import React, { useState } from 'react';
import { 
  Puzzle, Upload, Sparkles, Check, RefreshCw, Settings, 
  Trash2, ShieldCheck, ArrowUpCircle, Info, X, CheckCircle2, AlertTriangle, Key, Search, ToggleLeft, ToggleRight
} from 'lucide-react';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { PluginManifest, PluginSettingField } from '@/lib/extensions/plugin-types';
import { validatePluginPackage } from '@/lib/extensions/package-installer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AdminPluginsPage() {
  const { 
    plugins, 
    activePlugins, 
    togglePlugin, 
    updatePluginSettings, 
    toggleAutoUpdate, 
    updatePluginVersion, 
    installPlugin, 
    deletePlugin 
  } = usePlugins();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [configuringPlugin, setConfiguringPlugin] = useState<PluginManifest | null>(null);
  const [configDraft, setConfigDraft] = useState<Record<string, unknown>>({});
  const [permissionsPlugin, setPermissionsPlugin] = useState<PluginManifest | null>(null);
  const [changelogPlugin, setChangelogPlugin] = useState<PluginManifest | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const categories = ['All', 'Monetization', 'Security & DRM', 'Marketing & SEO', 'AI & Automation', 'Community & Media'];

  const filteredPlugins = plugins.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const openConfigModal = (plugin: PluginManifest) => {
    setConfiguringPlugin(plugin);
    setConfigDraft({ ...plugin.settingsValues });
  };

  const handleSaveConfig = () => {
    if (!configuringPlugin) return;
    updatePluginSettings(configuringPlugin.id, configDraft);
    setConfiguringPlugin(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        installPlugin(result.plugin);
        setUploadSuccess(true);
        setTimeout(() => {
          setIsUploadOpen(false);
          setUploadSuccess(false);
        }, 1200);
      } catch (err) {
        setUploadError('Invalid file format. Please upload a valid JSON plugin manifest or ZIP package.');
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
      installPlugin(result.plugin);
      setUploadSuccess(true);
      setTimeout(() => {
        setIsUploadOpen(false);
        setUploadSuccess(false);
        setUploadText('');
      }, 1200);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Unknown syntax error';
      setUploadError('JSON syntax error: ' + errMsg);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3DCE8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Puzzle className="text-[#EC4899]" size={24} />
            <h1 className="text-2xl font-black text-[#18181B]">Plugins & Add-on Engine</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Extend platform monetization, DRM security, AI assistants, and analytics without modifying core code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Upload size={14} />}
            onClick={() => setIsUploadOpen(true)}
          >
            Upload Add-on (ZIP / JSON)
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#71717A] font-bold uppercase tracking-wider">Installed Add-ons</span>
            <p className="text-2xl font-black text-[#18181B] mt-1">{plugins.length}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#FFF1F7] text-[#EC4899] flex items-center justify-center font-bold">
            <Puzzle size={20} />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#71717A] font-bold uppercase tracking-wider">Active Hooks & Extenders</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{activePlugins.length}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#71717A] font-bold uppercase tracking-wider">Updates Available</span>
            <p className="text-2xl font-black text-[#BE185D] mt-1">
              {plugins.filter(p => p.hasUpdate).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#FCE7F3] text-[#BE185D] flex items-center justify-center font-bold">
            <ArrowUpCircle size={20} />
          </div>
        </Card>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
                  : 'bg-white text-[#71717A] border border-[#F3DCE8] hover:text-[#18181B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search add-ons or hooks..."
            className="w-full bg-white border border-[#F3DCE8] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
          />
        </div>
      </div>

      {/* Plugins Table & Grid */}
      <div className="space-y-4">
        {filteredPlugins.map((plugin) => {
          return (
            <Card key={plugin.id} className="p-5 transition-all duration-300 hover:border-[#F472B6]/40">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Plugin Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF9FC] border border-[#F3DCE8] flex items-center justify-center text-2xl shrink-0 shadow-xs">
                    {plugin.iconUrl}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-[#18181B]">{plugin.name}</h3>
                      <Badge variant="pink" size="sm">v{plugin.version}</Badge>
                      <span className="text-[10px] text-[#71717A] bg-[#FFF9FC] px-2 py-0.5 rounded-full border border-[#F3DCE8] font-bold">
                        {plugin.category}
                      </span>
                      {plugin.hasUpdate && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold flex items-center gap-1">
                          <ArrowUpCircle size={10} /> Update to v{plugin.latestVersion}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#71717A] leading-relaxed max-w-2xl font-medium">{plugin.description}</p>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#A1A1AA]">
                      <span>By <strong className="text-[#71717A]">{plugin.author}</strong></span>
                      <span>•</span>
                      <span>Hooks: <strong className="text-[#EC4899]">{plugin.hooks.join(', ')}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Controls & Actions */}
                <div className="flex flex-wrap items-center gap-3 border-t lg:border-t-0 border-[#F3DCE8] pt-3 lg:pt-0">
                  {/* Settings Button */}
                  {plugin.settingsSchema.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Settings size={13} />}
                      onClick={() => openConfigModal(plugin)}
                    >
                      Configure
                    </Button>
                  )}

                  {/* Permissions Inspector */}
                  <button
                    onClick={() => setPermissionsPlugin(plugin)}
                    className="p-2 rounded-xl text-[#71717A] hover:text-[#EC4899] hover:bg-[#FFF1F7] transition-colors cursor-pointer"
                    title="Permissions & Security"
                  >
                    <ShieldCheck size={16} />
                  </button>

                  {/* Changelog */}
                  <button
                    onClick={() => setChangelogPlugin(plugin)}
                    className="p-2 rounded-xl text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7] transition-colors cursor-pointer"
                    title="Version Changelog"
                  >
                    <Info size={16} />
                  </button>

                  {/* Auto Update Checkbox */}
                  <label className="flex items-center gap-1.5 text-xs text-[#71717A] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={plugin.autoUpdate}
                      onChange={(e) => toggleAutoUpdate(plugin.id, e.target.checked)}
                      className="accent-[#EC4899] rounded"
                    />
                    <span>Auto-update</span>
                  </label>

                  {/* Update action */}
                  {plugin.hasUpdate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePluginVersion(plugin.id)}
                      className="text-amber-700 border-amber-300 hover:bg-amber-50"
                      leftIcon={<RefreshCw size={12} />}
                    >
                      Update
                    </Button>
                  )}

                  {/* Active Toggle Switch */}
                  <div className="flex items-center gap-2 pl-2 border-l border-[#F3DCE8]">
                    <span className={`text-xs font-bold ${plugin.isEnabled ? 'text-emerald-600' : 'text-[#A1A1AA]'}`}>
                      {plugin.isEnabled ? 'Active' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => togglePlugin(plugin.id, !plugin.isEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        plugin.isEnabled ? 'bg-[#EC4899]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          plugin.isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Dynamic Plugin Configuration Modal */}
      {configuringPlugin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#F3DCE8] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#18181B] flex items-center gap-2">
                  <Settings size={18} className="text-[#EC4899]" />
                  <span>Configure {configuringPlugin.name}</span>
                </h3>
                <p className="text-xs text-[#71717A]">Update add-on runtime settings and keys</p>
              </div>
              <button
                onClick={() => setConfiguringPlugin(null)}
                className="p-1 rounded-xl text-[#71717A] hover:text-[#18181B]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-1">
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
                      className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={configDraft[field.id] !== undefined ? Number(configDraft[field.id]) : ''}
                      onChange={(e) => setConfigDraft({ ...configDraft, [field.id]: parseFloat(e.target.value) })}
                      className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                    />
                  )}

                  {field.type === 'boolean' && (
                    <label className="flex items-center gap-2 cursor-pointer pt-1 font-bold text-[#18181B]">
                      <input
                        type="checkbox"
                        checked={Boolean(configDraft[field.id])}
                        onChange={(e) => setConfigDraft({ ...configDraft, [field.id]: e.target.checked })}
                        className="accent-[#EC4899] rounded"
                      />
                      <span>Enabled</span>
                    </label>
                  )}

                  {field.type === 'select' && (
                    <select
                      value={String(configDraft[field.id] ?? '')}
                      onChange={(e) => setConfigDraft({ ...configDraft, [field.id]: e.target.value })}
                      className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none font-medium"
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
                      className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl p-3 text-xs font-mono text-[#18181B] focus:outline-none focus:border-[#EC4899]"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3DCE8]">
              <Button variant="ghost" size="sm" onClick={() => setConfiguringPlugin(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveConfig}>
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Inspector Modal */}
      {permissionsPlugin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#F3DCE8] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#18181B] flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#EC4899]" />
                  <span>Security & Permissions: {permissionsPlugin.name}</span>
                </h3>
                <p className="text-xs text-[#71717A]">Sandboxed capabilities and execution hooks</p>
              </div>
              <button onClick={() => setPermissionsPlugin(null)} className="p-1 rounded-xl text-[#71717A]">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-[#18181B] mb-1.5">Declared Permissions</h4>
                <div className="flex flex-wrap gap-1.5">
                  {permissionsPlugin.permissions.map((perm) => (
                    <span key={perm} className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-semibold">
                      ✓ {perm}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#18181B] mb-1.5">Registered Execution Hooks</h4>
                <div className="flex flex-wrap gap-1.5">
                  {permissionsPlugin.hooks.map((hook) => (
                    <span key={hook} className="px-2.5 py-1 rounded-xl bg-[#FFF1F7] text-[#BE185D] border border-[#FBCFE8] font-mono text-[11px] font-bold">
                      ⚓ {hook}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#F3DCE8]">
              <Button variant="outline" size="sm" onClick={() => setPermissionsPlugin(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Changelog Modal */}
      {changelogPlugin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#F3DCE8] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#18181B]">{changelogPlugin.name}</h3>
                <p className="text-xs text-[#71717A]">Version {changelogPlugin.version} • By {changelogPlugin.author}</p>
              </div>
              <button onClick={() => setChangelogPlugin(null)} className="p-1 rounded-xl text-[#71717A]">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-64 overflow-y-auto pr-1">
              {changelogPlugin.changelog.map((c) => (
                <div key={c.version} className="p-3 bg-[#FFF9FC] rounded-xl border border-[#F3DCE8] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#BE185D]">v{c.version}</span>
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

            <div className="flex items-center justify-end pt-3 border-t border-[#F3DCE8]">
              <Button variant="outline" size="sm" onClick={() => setChangelogPlugin(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Plugin Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#F3DCE8] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#18181B] flex items-center gap-2">
                  <Upload size={18} className="text-[#EC4899]" />
                  <span>Upload Add-on Package</span>
                </h3>
                <p className="text-xs text-[#71717A]">Install custom plugins via JSON manifest or ZIP package</p>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="p-1 rounded-xl text-[#71717A]">
                <X size={18} />
              </button>
            </div>

            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Add-on verified and installed into registry successfully!</span>
              </div>
            )}

            {uploadError && (
              <div className="p-3 bg-[#FFE4E6] border border-[#FECDD3] rounded-2xl text-xs text-[#BE123C] flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="border-2 border-dashed border-[#F3DCE8] hover:border-[#EC4899] rounded-2xl p-6 text-center space-y-2 bg-[#FFF9FC] transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".json,.zip"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] text-[#EC4899] flex items-center justify-center mx-auto">
                  <Upload size={22} />
                </div>
                <p className="font-bold text-[#18181B]">Click to browse or drop plugin ZIP/JSON here</p>
                <p className="text-[11px] text-[#71717A]">Valid formats: plugin.json, addon-package.zip</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#18181B]">Or Paste Raw Plugin Manifest:</label>
                <textarea
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  rows={4}
                  placeholder={`{\n  "name": "Custom Addon",\n  "version": "1.0.0",\n  "hooks": ["navbar_actions"],\n  "permissions": ["storage_access"]\n}`}
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl p-3 font-mono text-[11px] text-[#18181B] focus:outline-none focus:border-[#EC4899]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3DCE8]">
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
    </div>
  );
}
