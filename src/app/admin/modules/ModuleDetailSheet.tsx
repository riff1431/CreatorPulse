'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  X, CheckCircle2, Settings, AlertTriangle, Link2, Tag,
  Film, MessageSquare, Star, MessageCircle, FileText, Wallet, Puzzle, Video, Image, Volume2,
} from 'lucide-react';
import { Button } from '@/components/admin/ui/Button';
import {
  FeatureModule, FeatureModuleId, MODULE_CATEGORIES,
} from '@/lib/modules/feature-module-context';

const ICON_MAP: Record<string, React.ElementType> = {
  Film, MessageSquare, Star, MessageCircle, FileText, Wallet, Puzzle, Video, Image, Volume2,
};

interface ModuleDetailSheetProps {
  module: FeatureModule | null;
  isOpen: boolean;
  onClose: () => void;
  onConfigure: (module: FeatureModule) => void;
  onToggle: (id: FeatureModuleId) => void;
  allModules: FeatureModule[];
}

export const ModuleDetailSheet: React.FC<ModuleDetailSheetProps> = ({
  module, isOpen, onClose, onConfigure, onToggle, allModules,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';

      // Animate in
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        gsap.fromTo(panelRef.current,
          { y: '100%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.35, ease: 'power3.out' }
        );
      } else {
        gsap.fromTo(panelRef.current,
          { x: '100%', opacity: 0 },
          { x: '0%', opacity: 1, duration: 0.35, ease: 'power3.out' }
        );
      }
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !module) return null;

  const IconComp = ICON_MAP[module.icon] || Puzzle;
  const cat = MODULE_CATEGORIES[module.category];
  const dependsOn = allModules.filter((m) => module.dependencies.includes(m.id));
  const dependedBy = allModules.filter((m) => m.dependencies.includes(module.id));

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
    >
      {/* Panel — right side on desktop, bottom sheet on mobile */}
      <div
        ref={panelRef}
        className="
          fixed bg-white shadow-2xl overflow-y-auto
          bottom-0 left-0 right-0 max-h-[90vh] rounded-t-2xl
          sm:bottom-auto sm:top-0 sm:left-auto sm:right-0 sm:max-h-full sm:h-full sm:w-[440px] sm:rounded-t-none sm:rounded-l-2xl sm:border-l sm:border-slate-200
        "
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)` }}
              >
                <IconComp size={22} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">{module.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.label}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <Tag size={9} /> v{module.version}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-700">Module Status</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {module.isEnabled ? 'Active and running across the platform' : 'Disabled — not available to users'}
              </p>
            </div>
            <button
              onClick={() => onToggle(module.id)}
              className={`w-12 h-7 rounded-full transition-colors flex items-center px-0.5 cursor-pointer shrink-0 ${
                module.isEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-6 h-6 bg-white rounded-full shadow-md" />
            </button>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">About</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{module.detailDescription}</p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Features</h3>
            <div className="space-y-2.5">
              {module.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dependencies */}
          {(dependsOn.length > 0 || dependedBy.length > 0) && (
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Dependencies</h3>
              <div className="space-y-2">
                {dependsOn.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-amber-700 uppercase mb-1.5 flex items-center gap-1">
                      <AlertTriangle size={10} /> Requires
                    </p>
                    {dependsOn.map((dep) => (
                      <div key={dep.id} className="flex items-center gap-2 mt-1">
                        <Link2 size={12} className="text-amber-600" />
                        <span className="text-xs font-medium text-amber-800">{dep.name}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${dep.isEnabled ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      </div>
                    ))}
                  </div>
                )}
                {dependedBy.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-blue-700 uppercase mb-1.5 flex items-center gap-1">
                      <Link2 size={10} /> Required By
                    </p>
                    {dependedBy.map((dep) => (
                      <div key={dep.id} className="flex items-center gap-2 mt-1">
                        <Link2 size={12} className="text-blue-600" />
                        <span className="text-xs font-medium text-blue-800">{dep.name}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${dep.isEnabled ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Settings Preview */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Current Settings</h3>
            <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
              {module.settingsSchema.map((field) => {
                const val = module.settings[field.key] ?? field.defaultValue;
                return (
                  <div key={field.key} className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs font-medium text-slate-600">{field.label}</span>
                    <span className="text-xs font-bold text-slate-800">
                      {typeof val === 'boolean' ? (val ? 'Enabled' : 'Disabled') : String(val)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Settings size={14} />}
              onClick={() => onConfigure(module)}
              className="flex-1"
            >
              Configure Settings
            </Button>
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
