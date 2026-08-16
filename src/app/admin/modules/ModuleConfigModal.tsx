'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  X, RotateCcw, Save,
  Film, MessageSquare, Star, MessageCircle, FileText, Wallet, Puzzle, Video, Image, Volume2,
} from 'lucide-react';
import { Button } from '@/components/admin/ui/Button';
import {
  FeatureModule, FeatureModuleId, SettingsField, MODULE_CATEGORIES,
} from '@/lib/modules/feature-module-context';

const ICON_MAP: Record<string, React.ElementType> = {
  Film, MessageSquare, Star, MessageCircle, FileText, Wallet, Puzzle, Video, Image, Volume2,
};

interface ModuleConfigModalProps {
  module: FeatureModule | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (moduleId: FeatureModuleId, settings: Record<string, any>) => void;
}

export const ModuleConfigModal: React.FC<ModuleConfigModalProps> = ({
  module, isOpen, onClose, onSave,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form state when module changes
  useEffect(() => {
    if (module) {
      setFormState({ ...module.settings });
    }
  }, [module]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';

      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });

      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        gsap.fromTo(dialogRef.current,
          { y: '100%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.35, ease: 'power3.out' }
        );
      } else {
        gsap.fromTo(dialogRef.current,
          { scale: 0.95, y: 15, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.2)' }
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

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const updateField = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetDefaults = () => {
    const defaults: Record<string, any> = {};
    module.settingsSchema.forEach((field) => {
      defaults[field.key] = field.defaultValue;
    });
    setFormState(defaults);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate a brief save delay for UX polish
    await new Promise((r) => setTimeout(r, 400));
    onSave(module.id, formState);
    setIsSaving(false);
    onClose();
  };

  const renderField = (field: SettingsField) => {
    const value = formState[field.key] ?? field.defaultValue;

    switch (field.type) {
      case 'boolean':
        return (
          <div key={field.key} className="flex items-start justify-between gap-4 py-1">
            <div className="flex-1">
              <label className="text-sm font-semibold text-slate-800">{field.label}</label>
              {field.description && (
                <p className="text-xs text-slate-500 mt-0.5">{field.description}</p>
              )}
            </div>
            <button
              onClick={() => updateField(field.key, !value)}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer shrink-0 mt-0.5 ${
                value ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-5 h-5 bg-white rounded-full shadow-md transition-all" />
            </button>
          </div>
        );

      case 'number':
        return (
          <div key={field.key}>
            <label className="text-sm font-semibold text-slate-800 block mb-1">{field.label}</label>
            {field.description && (
              <p className="text-xs text-slate-500 mb-2">{field.description}</p>
            )}
            <input
              type="number"
              value={value}
              onChange={(e) => updateField(field.key, parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.key}>
            <label className="text-sm font-semibold text-slate-800 block mb-1">{field.label}</label>
            {field.description && (
              <p className="text-xs text-slate-500 mb-2">{field.description}</p>
            )}
            <div className="relative">
              <select
                value={value}
                onChange={(e) => updateField(field.key, e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-medium appearance-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all cursor-pointer pr-10"
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-slate-400">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        );

      case 'text':
      default:
        return (
          <div key={field.key}>
            <label className="text-sm font-semibold text-slate-800 block mb-1">{field.label}</label>
            {field.description && (
              <p className="text-xs text-slate-500 mb-2">{field.description}</p>
            )}
            <input
              type="text"
              value={value}
              onChange={(e) => updateField(field.key, e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
            />
          </div>
        );
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
    >
      <div
        ref={dialogRef}
        className="w-full sm:max-w-[520px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)` }}
              >
                <IconComp size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">{module.name}</h2>
                <p className="text-[11px] text-slate-500 font-medium">Configuration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
          {/* Gradient divider */}
          <div
            className="h-0.5 rounded-full mt-4 opacity-40"
            style={{ background: `linear-gradient(to right, ${cat.color}, transparent)` }}
          />
        </div>

        {/* Form Body */}
        <div className="px-6 pb-4 overflow-y-auto flex-1 space-y-5">
          {module.settingsSchema.map((field) => renderField(field))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              Reset to Defaults
            </button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={isSaving ? undefined : <Save size={13} />}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
