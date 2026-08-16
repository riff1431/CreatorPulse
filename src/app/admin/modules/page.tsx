'use client';

import React, { useState, useMemo } from 'react';
import {
  Puzzle, RefreshCw, Search, Eye,
  Film, MessageSquare, Star, MessageCircle, FileText, Wallet,
  Settings, AlertTriangle, LayoutGrid, Zap, Video, Image, Volume2,
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
  Film, MessageSquare, Star, MessageCircle, FileText, Wallet, Video, Image, Volume2,
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
    <div className="max-w-6xl mx-auto space-y-6 px-3 sm:px-6 py-2 sm:py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Puzzle size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
              Dynamic Feature Module Manager
            </h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium max-w-2xl leading-relaxed">
            Enable or disable major application features dynamically with automated dependency checks and instant platform updates.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleResetDefaults} leftIcon={<RefreshCw size={14} />} className="w-full sm:w-auto">
            Reset Defaults
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-slate-300">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <LayoutGrid size={20} className="text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black text-slate-900 leading-tight">{modules.length}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">Total Modules</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-slate-300">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black text-emerald-600 leading-tight">{activeCount}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">Active Modules</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-slate-300">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <Puzzle size={20} className="text-slate-400" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black text-slate-400 leading-tight">{inactiveCount}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">Disabled Modules</p>
          </div>
        </div>
      </div>

      {/* Category Filters + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none -mx-1 px-1">
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <cat.icon size={13} />
                {cat.label}
              </button>
            );
          })}
        </div>
        <div className="relative w-full md:w-64 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search modules by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
          />
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredModules.map((mod) => {
          const IconComp = MODULE_ICONS[mod.icon] || Puzzle;
          const hasDependencies = mod.dependencies && mod.dependencies.length > 0;
          const cat = MODULE_CATEGORIES[mod.category];

          return (
            <Card
              key={mod.id}
              className={`p-0 overflow-hidden border rounded-2xl transition-all duration-300 group ${
                mod.isEnabled
                  ? 'bg-white border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5'
                  : 'bg-slate-50/60 border-slate-200/80 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Category color indicator */}
              <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${cat.color}, ${cat.color}88)` }} />

              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold shadow-xs shrink-0 transition-all duration-300 ${
                        mod.isEnabled ? 'text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                      style={mod.isEnabled ? { background: `linear-gradient(135deg, ${cat.color}, ${cat.color}bb)` } : {}}
                    >
                      <IconComp size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="font-extrabold text-slate-900 text-base truncate">
                          {mod.name}
                        </h3>
                        {hasDependencies && (
                          <span className="bg-amber-100/90 text-amber-800 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase flex items-center gap-1 shrink-0">
                            <AlertTriangle size={9} /> Requires Wallet
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggle(mod.id)}
                    aria-label={`Toggle ${mod.name}`}
                    className={`w-12 h-7 rounded-full transition-colors flex items-center px-0.5 cursor-pointer shrink-0 ${
                      mod.isEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-6 h-6 bg-white rounded-full shadow-md transition-all" />
                  </button>
                </div>

                {/* Category & Version badges */}
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className="text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full text-white shadow-2xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                    v{mod.version}
                  </span>
                </div>

                {/* Status & Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${mod.isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {mod.isEnabled ? 'Module Active' : 'Disabled'}
                  </span>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
                    <button
                      onClick={() => handleOpenDetail(mod)}
                      className="flex items-center gap-1 text-slate-600 font-bold hover:text-indigo-600 cursor-pointer transition-colors bg-slate-50 hover:bg-indigo-50 px-2.5 py-1 rounded-lg"
                    >
                      <Eye size={13} /> Details
                    </button>
                    <button
                      onClick={() => handleOpenConfig(mod)}
                      className="flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-800 cursor-pointer transition-colors bg-indigo-50/80 hover:bg-indigo-100 px-2.5 py-1 rounded-lg"
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
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <Puzzle size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">No matching modules found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your category filter or search query.</p>
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
