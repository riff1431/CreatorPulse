'use client';

import React, { useState } from 'react';
import { 
  Puzzle, CheckCircle2, AlertTriangle, ShieldAlert, Settings, 
  RefreshCw, Clock, Film, MessageSquare, Star, MessageCircle, FileText, Wallet
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { useFeatureModules, FeatureModule, FeatureModuleId } from '@/lib/modules/feature-module-context';
import { useToast } from '@/components/ui/Toast';

const MODULE_ICONS: Record<string, React.ElementType> = {
  Clock,
  Film,
  MessageSquare,
  Star,
  MessageCircle,
  FileText,
  Wallet,
};

export default function AdminModulesPage() {
  const { modules, toggleModule, updateModuleSettings, resetToDefaults } = useFeatureModules();
  const { addToast } = useToast();
  const [selectedModule, setSelectedModule] = useState<FeatureModule | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState<Record<string, any>>({});

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

  const handleOpenSettings = (mod: FeatureModule) => {
    setSelectedModule(mod);
    setTempSettings({ ...mod.settings });
    setSettingsModalOpen(true);
  };

  const handleSaveSettings = async () => {
    if (!selectedModule) return;
    await updateModuleSettings(selectedModule.id, tempSettings);
    addToast({
      title: 'Settings Updated',
      message: `Configuration updated for ${selectedModule.name}.`,
      type: 'success',
    });
    setSettingsModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
          <Button variant="outline" size="sm" onClick={resetToDefaults} leftIcon={<RefreshCw size={14} />}>
            Reset Defaults
          </Button>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((mod) => {
          const IconComp = MODULE_ICONS[mod.icon] || Puzzle;
          const hasDependencies = mod.dependencies && mod.dependencies.length > 0;
          return (
            <Card
              key={mod.id}
              className={`p-6 space-y-4 border transition-all ${
                mod.isEnabled ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50/70 border-slate-200 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
                      mod.isEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <IconComp size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      {mod.name}
                      {hasDependencies && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase flex items-center gap-1">
                          <AlertTriangle size={10} /> Requires Wallet
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-2">{mod.description}</p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => handleToggle(mod.id)}
                  className={`w-12 h-6.5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer shrink-0 ${
                    mod.isEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-5.5 h-5.5 bg-white rounded-full shadow-md" />
                </button>
              </div>

              {/* Dependency Status & Settings */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${mod.isEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {mod.isEnabled ? 'Module Active' : 'Disabled across platform'}
                </span>

                <button
                  onClick={() => handleOpenSettings(mod)}
                  className="flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-800 cursor-pointer"
                >
                  <Settings size={14} /> Configure Settings
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* MODULE SETTINGS MODAL */}
      {settingsModalOpen && selectedModule && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Configure {selectedModule.name}</h3>
              <button onClick={() => setSettingsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {Object.keys(tempSettings).map((key) => (
                <div key={key}>
                  <label className="block text-slate-700 font-semibold mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="text"
                    value={tempSettings[key]}
                    onChange={(e) => setTempSettings({ ...tempSettings, [key]: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSettingsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
