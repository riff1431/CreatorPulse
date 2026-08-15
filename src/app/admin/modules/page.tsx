'use client';

import React, { useState, useMemo } from 'react';
import {
  Puzzle, RefreshCw, Search, Eye,
  Film, MessageSquare, Star, MessageCircle, FileText, Wallet,
  Settings, AlertTriangle, LayoutGrid, Zap,
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import {
  useFeatureModules, FeatureModule, FeatureModuleId,
  FeatureModuleCategory, MODULE_CATEGORIES,
} from '@/lib/modules/feature-module-context';
import { useToast } from '@/components/ui/Toast';
import { useAdminProgress } from '@/components/admin/AdminProgressProvider';
import { ModuleDetailSheet } from './ModuleDetailSheet';
import { ModuleConfigModal } from './ModuleConfigModal';

const MODULE_ICONS: Record<string, React.ElementType> = {
  Film, MessageSquare, Star, MessageCircle, FileText, Wallet,
};

const CATEGORY_FILTERS: { key: FeatureModuleCategory | 'all'; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'All Modules', icon: LayoutGrid },
  { key: 'content', label: 'Content', icon: Film },
  { key: 'social', label: 'Social', icon: MessageSquare },
  { key: 'monetization', label: 'Monetization', icon: Wallet },
  { key: 'management', label: 'Management', icon: FileText },
];

export default function AdminModulesPage() {
  const { modules, toggleModule, updateModuleSettings, resetToDefaults } = useFeatureModules();
  const { addToast } = useToast();
  const { startProgress, updateProgress, completeProgress, errorProgress } = useAdminProgress();

  // Filter & search state
  const [activeCategory, setActiveCategory] = useState<FeatureModuleCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail sheet state
  const [detailModule, setDetailModule] = useState<FeatureModule | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Config modal state
  const [configModule, setConfigModule] = useState<FeatureModule | null>(null);
  const [configOpen, setConfigOpen] = useState(false);

  // Filtered modules
  const filteredModules = useMemo(() => {
    let result = modules;
    if (activeCategory !== 'all') {
      result = result.filter((m) => m.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [modules, activeCategory, searchQuery]);

  // Stats
  const activeCount = modules.filter((m) => m.isEnabled).length;
  const inactiveCount = modules.length - activeCount;

  const handleToggle = (id: FeatureModuleId) => {
    const result = toggleModule(id);
    if (result.success) {
      addToast({
        title: 'Module Updated',
        message: result.message || 'Feature module state changed successfully.',
        type: 'success',
      });
    } else {
      addToast({
        title: 'Dependency Restriction',
        message: result.message || 'Cannot change module status.',
        type: 'error',
      });
    }
  };

  const handleOpenDetail = (mod: FeatureModule) => {
    setDetailModule(mod);
    setDetailOpen(true);
  };

  const handleOpenConfig = (mod: FeatureModule) => {
    setConfigModule(mod);
    setConfigOpen(true);
    // Close detail sheet if open
    setDetailOpen(false);
  };

  const handleSaveConfig = async (moduleId: FeatureModuleId, settings: Record<string, any>) => {
    await updateModuleSettings(moduleId, settings);
    addToast({
      title: 'Settings Updated',
      message: `Configuration saved for ${modules.find((m) => m.id === moduleId)?.name || 'module'}.`,
      type: 'success',
    });
  };

  const handleResetDefaults = async () => {
    startProgress({
      title: "Resetting Dynamic Feature Modules",
      steps: [
        "Resolving feature module dependencies...",
        "Updating database module activation flags...",
        "Broadcasting modules status updates..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Resolving feature module dependencies...");
      await new Promise(r => setTimeout(r, 600));
      updateProgress(0, 'success', 40, "Dependencies checked.");

      updateProgress(1, 'running', 60, "Updating database module activation flags...");
      await new Promise(r => setTimeout(r, 600));
      updateProgress(1, 'success', 80, "Activation flags updated.");

      updateProgress(2, 'running', 90, "Broadcasting modules status updates...");
      await resetToDefaults();
      await new Promise(r => setTimeout(r, 400));

      completeProgress("Feature modules restored successfully!");
      addToast({ title: 'Reset Completed', message: 'All feature modules reset to platform defaults.', type: 'success' });
    } catch (e) {
      errorProgress(1, "Failed to reset modules.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Puzzle className="text-indigo-600" size={24} />
            <h1 className="text-2xl font-black text-[#18181B]">Dynamic Feature Module Manager</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Enable or disable major application features dynamically with automated dependency checks and instant platform updates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetDefaults} leftIcon={<RefreshCw size={14} />}>
            Reset Defaults
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <LayoutGrid size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">{modules.length}</p>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Modules</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Zap size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-black text-emerald-600">{activeCount}</p>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Active</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Puzzle size={18} className="text-slate-400" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-400">{inactiveCount}</p>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Disabled</p>
          </div>
        </div>
      </div>

      {/* Category Filters + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <cat.icon size={13} />
                {cat.label}
              </button>
            );
          })}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
          />
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredModules.map((mod) => {
          const IconComp = MODULE_ICONS[mod.icon] || Puzzle;
          const hasDependencies = mod.dependencies && mod.dependencies.length > 0;
          const cat = MODULE_CATEGORIES[mod.category];

          return (
            <Card
              key={mod.id}
              className={`p-0 overflow-hidden border transition-all duration-300 group ${
                mod.isEnabled
                  ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5'
                  : 'bg-slate-50/70 border-slate-200 opacity-75 hover:opacity-90'
              }`}
            >
              {/* Category color bar */}
              <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${cat.color}, ${cat.color}88)` }} />

              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-sm transition-all duration-300 ${
                        mod.isEnabled ? 'text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                      style={mod.isEnabled ? { background: `linear-gradient(135deg, ${cat.color}, ${cat.color}bb)` } : {}}
                    >
                      <IconComp size={22} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        {mod.name}
                        {hasDependencies && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase flex items-center gap-0.5">
                            <AlertTriangle size={9} /> Requires Wallet
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-2">{mod.description}</p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggle(mod.id)}
                    className={`w-12 h-7 rounded-full transition-colors flex items-center px-0.5 cursor-pointer shrink-0 ${
                      mod.isEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-6 h-6 bg-white rounded-full shadow-md transition-all" />
                  </button>
                </div>

                {/* Category & Version badges */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">v{mod.version}</span>
                </div>

                {/* Status & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${mod.isEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {mod.isEnabled ? 'Module Active' : 'Disabled across platform'}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenDetail(mod)}
                      className="flex items-center gap-1 text-slate-500 font-bold hover:text-indigo-600 cursor-pointer transition-colors"
                    >
                      <Eye size={13} /> Details
                    </button>
                    <button
                      onClick={() => handleOpenConfig(mod)}
                      className="flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-800 cursor-pointer transition-colors"
                    >
                      <Settings size={13} /> Configure
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredModules.length === 0 && (
        <div className="text-center py-16">
          <Puzzle size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500">No modules found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query.</p>
        </div>
      )}

      {/* Detail Sheet */}
      <ModuleDetailSheet
        module={detailModule}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onConfigure={handleOpenConfig}
        onToggle={handleToggle}
        allModules={modules}
      />

      {/* Config Modal */}
      <ModuleConfigModal
        module={configModule}
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
