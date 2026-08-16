'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Save, RotateCcw, Eye, EyeOff, Copy, Check, AlertCircle, Plus, Trash2,
  ChevronUp, ChevronDown, Lock, Image as ImageIcon, X, Info,
  Settings, Shield
} from 'lucide-react';
import { PluginManifest, PluginSettingField, PluginSettingsGroup, PluginSettingFieldType } from '@/lib/extensions/plugin-types';
import { usePlugins } from '@/lib/extensions/plugin-engine';
import { MediaUploader } from '@/components/ui/MediaUploader';
import { Button } from '@/components/admin/ui/Button';

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function buildDefaults(schema: PluginSettingField[]): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const field of schema) {
    defaults[field.id] = field.defaultValue;
  }
  return defaults;
}

function validateField(field: PluginSettingField, value: unknown): string | null {
  if (field.required) {
    if (value === undefined || value === null || value === '') return `"${field.label}" is required.`;
    if (Array.isArray(value) && value.length === 0) return `"${field.label}" must have at least one entry.`;
  }
  if (value === undefined || value === null || value === '') return null;

  if (field.type === 'number') {
    const n = Number(value);
    if (isNaN(n)) return `"${field.label}" must be a valid number.`;
    if (field.min !== undefined && n < field.min) return `"${field.label}" must be ≥ ${field.min}.`;
    if (field.max !== undefined && n > field.max) return `"${field.label}" must be ≤ ${field.max}.`;
  }
  if ((field.type === 'text' || field.type === 'textarea') && field.maxLength) {
    if (String(value).length > field.maxLength) return `Max ${field.maxLength} characters.`;
  }
  if (field.validate === 'nonempty' && String(value).trim() === '') return `"${field.label}" must not be empty.`;
  if (field.validate === 'url') {
    try { new URL(String(value)); } catch { return `"${field.label}" must be a valid URL (include https://).`; }
  }
  if (field.validate === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) return `"${field.label}" must be a valid email.`;
  }
  if (field.validate === 'domain') {
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(value))) return `"${field.label}" must be a valid domain.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Sub-field renderers
// ---------------------------------------------------------------------------

interface FieldRendererProps {
  field: PluginSettingField;
  value: unknown;
  onChange: (val: unknown) => void;
  error?: string;
}

function TextField({ field, value, onChange, error }: FieldRendererProps) {
  const str = String(value ?? '');
  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          type="text"
          value={str}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium transition-all ${error ? 'border-red-400 bg-red-50/30' : 'border-slate-200'}`}
        />
        {field.maxLength && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
            {str.length}/{field.maxLength}
          </span>
        )}
      </div>
      {error && <p className="text-[10px] text-red-600 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
    </div>
  );
}

function SecretField({ field, value, onChange, error }: FieldRendererProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const isApiKey = field.type === 'api_key';
  const str = String(value ?? '');

  const handleCopy = () => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-1">
      <div className={`flex items-center border rounded-xl overflow-hidden ${error ? 'border-red-400 bg-red-50/30' : 'border-slate-200 bg-slate-50'}`}>
        {isApiKey && (
          <div className="px-2.5 border-r border-slate-200 text-slate-400 text-[10px] font-bold shrink-0 py-2 bg-white">
            KEY
          </div>
        )}
        <input
          type={revealed ? 'text' : 'password'}
          value={str}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || (isApiKey ? 'sk-...' : '••••••••')}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-[#18181B] focus:outline-none font-mono"
          autoComplete="new-password"
        />
        <div className="flex items-center gap-0.5 px-2 shrink-0">
          <button
            type="button"
            onClick={() => setRevealed(v => !v)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={revealed ? 'Hide' : 'Show'}
          >
            {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          {str && (
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Copy"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </button>
          )}
        </div>
      </div>
      <p className="text-[10px] text-slate-500 flex items-center gap-1">
        <Shield size={9} className="text-emerald-500" />
        {isApiKey ? 'Stored securely in server vault — never exposed in the client.' : 'Value is encrypted at rest in the server vault.'}
      </p>
      {error && <p className="text-[10px] text-red-600 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
    </div>
  );
}

function NumberField({ field, value, onChange, error }: FieldRendererProps) {
  return (
    <div className="space-y-1">
      <input
        type="number"
        value={value !== undefined ? Number(value) : ''}
        onChange={e => onChange(parseFloat(e.target.value))}
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium transition-all ${error ? 'border-red-400 bg-red-50/30' : 'border-slate-200'}`}
      />
      {error && <p className="text-[10px] text-red-600 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
    </div>
  );
}

function ToggleField({ field, value, onChange }: FieldRendererProps) {
  const checked = Boolean(value);
  return (
    <div className="flex items-center gap-3 pt-1">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
      <span className={`text-xs font-semibold transition-colors ${checked ? 'text-indigo-700' : 'text-slate-500'}`}>
        {checked ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  );
}

function SelectField({ field, value, onChange, error }: FieldRendererProps) {
  const str = String(value ?? '');
  return (
    <div className="space-y-1">
      <select
        value={str}
        onChange={e => onChange(e.target.value)}
        className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium transition-all ${error ? 'border-red-400 bg-red-50/30' : 'border-slate-200'}`}
      >
        {field.options?.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {/* Show description for selected option */}
      {field.options?.find(o => o.value === str)?.description && (
        <p className="text-[10px] text-slate-500 flex items-center gap-1">
          <Info size={9} />{field.options.find(o => o.value === str)!.description}
        </p>
      )}
      {error && <p className="text-[10px] text-red-600 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
    </div>
  );
}

function RadioField({ field, value, onChange, error }: FieldRendererProps) {
  const str = String(value ?? '');
  return (
    <div className="space-y-1">
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
        {field.options?.map(opt => {
          const isSelected = str === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
            >
              <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-indigo-600' : 'border-slate-300'}`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
              </div>
              <div>
                <p className={`text-xs font-semibold ${isSelected ? 'text-indigo-700' : 'text-[#18181B]'}`}>
                  {opt.icon && <span className="mr-1">{opt.icon}</span>}{opt.label}
                </p>
                {opt.description && <p className="text-[10px] text-slate-500 mt-0.5">{opt.description}</p>}
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="text-[10px] text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={10} />{error}</p>}
    </div>
  );
}

function TextareaField({ field, value, onChange, error }: FieldRendererProps) {
  const str = String(value ?? '');
  return (
    <div className="space-y-1">
      <textarea
        rows={field.rows ?? 3}
        value={str}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-mono text-[#18181B] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none ${error ? 'border-red-400 bg-red-50/30' : 'border-slate-200'}`}
      />
      {field.maxLength && (
        <p className="text-[10px] text-slate-400 text-right font-mono">{str.length}/{field.maxLength}</p>
      )}
      {error && <p className="text-[10px] text-red-600 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
    </div>
  );
}

function MediaField({ field, value, onChange }: FieldRendererProps) {
  return (
    <div>
      <MediaUploader
        folder="plugins"
        accept="all"
        value={String(value ?? '')}
        onChange={url => onChange(url)}
      />
    </div>
  );
}

function ColorField({ field, value, onChange, error }: FieldRendererProps) {
  const str = String(value ?? '#4F46E5');
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-xl border-2 border-slate-200 shadow-xs overflow-hidden cursor-pointer">
            <input
              type="color"
              value={str}
              onChange={e => onChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ transform: 'scale(2)' }}
            />
            <div className="w-full h-full" style={{ backgroundColor: str }} />
          </div>
        </div>
        <input
          type="text"
          value={str}
          onChange={e => onChange(e.target.value)}
          placeholder="#4F46E5"
          maxLength={7}
          className={`flex-1 bg-slate-50 border rounded-xl px-3 py-2 text-xs text-[#18181B] font-mono focus:outline-none focus:border-indigo-500 transition-all ${error ? 'border-red-400' : 'border-slate-200'}`}
        />
      </div>
      {error && <p className="text-[10px] text-red-600 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
    </div>
  );
}

function RepeaterField({ field, value, onChange, error }: FieldRendererProps) {
  const rows = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
  const schema = field.repeaterSchema ?? [];
  const maxRows = field.maxRows ?? 20;

  const addRow = () => {
    const newRow: Record<string, unknown> = {};
    for (const sub of schema) newRow[sub.id] = sub.defaultValue ?? '';
    onChange([...rows, newRow]);
  };

  const removeRow = (idx: number) => onChange(rows.filter((_, i) => i !== idx));

  const moveRow = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= rows.length) return;
    const arr = [...rows];
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    onChange(arr);
  };

  const updateCell = (rowIdx: number, fieldId: string, val: unknown) => {
    const arr = [...rows];
    arr[rowIdx] = { ...arr[rowIdx], [fieldId]: val };
    onChange(arr);
  };

  return (
    <div className="space-y-2">
      {rows.length === 0 && (
        <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
          No entries yet. Click <span className="font-bold text-indigo-600">+ Add Row</span> to begin.
        </div>
      )}
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="border border-slate-200 bg-slate-50/50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Row {rowIdx + 1}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => moveRow(rowIdx, -1)} disabled={rowIdx === 0}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors">
                <ChevronUp size={13} />
              </button>
              <button type="button" onClick={() => moveRow(rowIdx, 1)} disabled={rowIdx === rows.length - 1}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors">
                <ChevronDown size={13} />
              </button>
              <button type="button" onClick={() => removeRow(rowIdx)}
                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
            {schema.map(sub => (
              <div key={sub.id} className="space-y-0.5">
                <label className="text-[10px] font-bold text-slate-600">{sub.label}</label>
                {sub.type === 'boolean' ? (
                  <ToggleField
                    field={{ ...sub, type: 'toggle', defaultValue: sub.defaultValue ?? false }}
                    value={row[sub.id]}
                    onChange={v => updateCell(rowIdx, sub.id, v)}
                  />
                ) : sub.type === 'select' ? (
                  <select
                    value={String(row[sub.id] ?? '')}
                    onChange={e => updateCell(rowIdx, sub.id, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-[#18181B] focus:outline-none"
                  >
                    {sub.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : sub.type === 'color' ? (
                  <div className="flex items-center gap-2">
                    <input type="color" value={String(row[sub.id] ?? '#000000')}
                      onChange={e => updateCell(rowIdx, sub.id, e.target.value)}
                      className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer" />
                    <input type="text" value={String(row[sub.id] ?? '')}
                      onChange={e => updateCell(rowIdx, sub.id, e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono" />
                  </div>
                ) : (
                  <input
                    type={sub.type === 'number' ? 'number' : 'text'}
                    value={String(row[sub.id] ?? '')}
                    onChange={e => updateCell(rowIdx, sub.id, sub.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                    placeholder={sub.placeholder}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {rows.length < maxRows && (
        <button type="button" onClick={addRow}
          className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all w-full justify-center">
          <Plus size={13} /> Add Row
        </button>
      )}
      {rows.length >= maxRows && (
        <p className="text-[10px] text-slate-500 text-center">Maximum of {maxRows} rows reached.</p>
      )}
      {error && <p className="text-[10px] text-red-600 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field dispatcher
// ---------------------------------------------------------------------------

function FieldRenderer(props: FieldRendererProps) {
  const { field } = props;
  switch (field.type) {
    case 'text': return <TextField {...props} />;
    case 'password':
    case 'api_key': return <SecretField {...props} />;
    case 'number': return <NumberField {...props} />;
    case 'boolean':
    case 'toggle': return <ToggleField {...props} />;
    case 'select': return <SelectField {...props} />;
    case 'radio': return <RadioField {...props} />;
    case 'textarea': return <TextareaField {...props} />;
    case 'media': return <MediaField {...props} />;
    case 'color': return <ColorField {...props} />;
    case 'repeater': return <RepeaterField {...props} />;
    default: return <TextField {...props} />;
  }
}

// ---------------------------------------------------------------------------
// Single field wrapper (label + description + field)
// ---------------------------------------------------------------------------

interface SettingFieldRowProps {
  field: PluginSettingField;
  value: unknown;
  onChange: (val: unknown) => void;
  error?: string;
}

function SettingFieldRow({ field, value, onChange, error }: SettingFieldRowProps) {
  const isInline = field.type === 'boolean' || field.type === 'toggle';
  return (
    <div className={`py-3.5 border-b border-slate-100 last:border-b-0 ${isInline ? 'flex items-center justify-between gap-4' : 'space-y-2'}`}>
      <div className={isInline ? 'flex-1 min-w-0' : ''}>
        <div className="flex items-center gap-1.5">
          <label className="block text-xs font-bold text-[#18181B]">
            {field.label}
            {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          {(field.type === 'api_key' || field.type === 'password') && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex items-center gap-0.5">
              <Shield size={8} />VAULT
            </span>
          )}
        </div>
        {field.description && (
          <p className="text-[11px] text-[#71717A] mt-0.5 leading-relaxed">{field.description}</p>
        )}
      </div>
      {!isInline && (
        <FieldRenderer field={field} value={value} onChange={onChange} error={error} />
      )}
      {isInline && (
        <div className="shrink-0">
          <FieldRenderer field={field} value={value} onChange={onChange} error={error} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main PluginSettingsFramework
// ---------------------------------------------------------------------------

interface PluginSettingsFrameworkProps {
  plugin: PluginManifest;
  /** Called after successful save */
  onSaved?: () => void;
  /** If true, renders in compact (modal-like) mode */
  compact?: boolean;
}

const ROLE_HIERARCHY: Record<string, number> = { admin: 1, super_admin: 2 };

export const PluginSettingsFramework: React.FC<PluginSettingsFrameworkProps> = ({
  plugin,
  onSaved,
  compact = false,
}) => {
  const { updatePluginSettings, resetPluginSettings } = usePlugins();

  // --- Permission guard ---
  const [adminRole, setAdminRole] = useState<string>('admin');
  useEffect(() => {
    // Read role from cookie
    const match = document.cookie.match(/creatorpulse_role=([^;]+)/);
    if (match) setAdminRole(decodeURIComponent(match[1]));
  }, []);

  const requiredPerm = plugin.adminSettingsPage?.requiredPermission;
  const isLocked = requiredPerm
    ? (ROLE_HIERARCHY[adminRole] ?? 0) < (ROLE_HIERARCHY[requiredPerm] ?? 0)
    : false;

  // --- State ---
  const [draft, setDraft] = useState<Record<string, unknown>>(() => ({ ...plugin.settingsValues }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // Sync draft when plugin settingsValues change externally
  useEffect(() => {
    setDraft({ ...plugin.settingsValues });
    setIsDirty(false);
  }, [plugin.id]);

  // --- Groups ---
  const groups: PluginSettingsGroup[] = plugin.settingsGroups ?? [];
  const hasGroups = groups.length > 0;

  // All field IDs not assigned to any group
  const assignedFieldIds = new Set(groups.flatMap(g => g.fieldIds));
  const ungroupedFields = plugin.settingsSchema.filter(f => !assignedFieldIds.has(f.id));

  // Determine visible fields based on active group
  const visibleFields = hasGroups
    ? activeGroup
      ? (plugin.settingsSchema.filter(f => groups.find(g => g.id === activeGroup)?.fieldIds.includes(f.id)) ?? [])
      : ungroupedFields
    : plugin.settingsSchema;

  // Set default active group
  useEffect(() => {
    if (hasGroups && !activeGroup && groups.length > 0) {
      setActiveGroup(groups[0].id);
    }
  }, [hasGroups, groups, activeGroup]);

  // --- Handlers ---
  const handleChange = (fieldId: string, val: unknown) => {
    setDraft(prev => ({ ...prev, [fieldId]: val }));
    setIsDirty(true);
    // Clear error on change
    if (errors[fieldId]) setErrors(prev => { const n = { ...prev }; delete n[fieldId]; return n; });
    setSaveSuccess(false);
  };

  const validateAll = (): boolean => {
    const errs: Record<string, string> = {};
    for (const field of plugin.settingsSchema) {
      const err = validateField(field, draft[field.id]);
      if (err) errs[field.id] = err;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateAll()) return;
    setIsSaving(true);
    setSaveSuccess(false);

    // Split secrets from safe values
    const secretFieldIds = plugin.settingsSchema
      .filter(f => f.type === 'password' || f.type === 'api_key')
      .map(f => f.id);

    const secrets: Record<string, string> = {};
    const safeValues = { ...draft };
    for (const id of secretFieldIds) {
      const v = draft[id];
      if (v && v !== '••••••••' && v !== '••••••••••••••••') {
        secrets[id] = String(v);
        safeValues[id] = '••••••••';
      }
    }

    // Save secrets to vault
    if (Object.keys(secrets).length > 0) {
      await fetch('/api/payments/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gatewayId: plugin.id, secrets }),
      }).catch(console.warn);
    }

    // Update via engine (localStorage + server disk)
    updatePluginSettings(plugin.id, safeValues);

    await new Promise(r => setTimeout(r, 350));
    setIsSaving(false);
    setIsDirty(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onSaved?.();
  };

  const handleReset = () => {
    setShowResetConfirm(false);
    const defaults = buildDefaults(plugin.settingsSchema);
    setDraft(defaults);
    resetPluginSettings(plugin.id);
    setIsDirty(false);
    setErrors({});
  };

  // --- Locked state ---
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
          <Lock size={28} className="text-slate-400" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-[#18181B]">Access Restricted</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Configuring <span className="font-semibold">{plugin.name}</span> requires{' '}
            <span className="font-bold text-indigo-600">{requiredPerm?.replace('_', ' ')}</span> privileges.
          </p>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-1">
          <Shield size={10} />Your current role: <span className="font-bold">{adminRole}</span>
        </div>
      </div>
    );
  }

  // --- No settings state ---
  if (plugin.settingsSchema.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">
          {plugin.iconUrl}
        </div>
        <div>
          <h3 className="font-bold text-sm text-[#18181B]">No Settings Available</h3>
          <p className="text-xs text-slate-500 mt-1">
            {plugin.name} does not expose any configurable settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Dirty state banner */}
      {isDirty && (
        <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
          <span className="font-bold text-amber-700 flex items-center gap-1.5">
            <AlertCircle size={13} />Unsaved changes
          </span>
          <button onClick={() => { setDraft({ ...plugin.settingsValues }); setIsDirty(false); setErrors({}); }}
            className="text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer">
            <X size={12} /> Discard
          </button>
        </div>
      )}

      {/* Group tabs */}
      {hasGroups && (
        <div className="flex gap-1 mb-4 border-b border-slate-200 pb-0 overflow-x-auto scrollbar-none">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all -mb-px ${
                activeGroup === group.id
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {group.icon && <span>{group.icon}</span>}
              {group.label}
            </button>
          ))}
          {ungroupedFields.length > 0 && (
            <button
              onClick={() => setActiveGroup(null)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all -mb-px ${
                activeGroup === null
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Other
            </button>
          )}
        </div>
      )}

      {/* Group description */}
      {hasGroups && activeGroup && (
        (() => {
          const g = groups.find(g => g.id === activeGroup);
          return g?.description ? (
            <p className="text-[11px] text-slate-500 mb-3 px-0.5">{g.description}</p>
          ) : null;
        })()
      )}

      {/* Fields */}
      <div className={`flex-1 ${compact ? '' : 'overflow-y-auto'} min-h-0`}>
        <div className="divide-y-0">
          {visibleFields.length === 0 && (
            <p className="text-xs text-slate-400 py-4 text-center">No settings in this section.</p>
          )}
          {visibleFields.map(field => (
            <SettingFieldRow
              key={field.id}
              field={field}
              value={draft[field.id]}
              onChange={val => handleChange(field.id, val)}
              error={errors[field.id]}
            />
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-200 shrink-0">
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 font-semibold transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />Reset to Defaults
        </button>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
              <Check size={13} />Saved!
            </span>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            leftIcon={isSaving ? (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : <Save size={13} />}
          >
            {isSaving ? 'Saving…' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Reset confirmation dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                <RotateCcw size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#18181B]">Reset to Defaults?</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  All settings for <span className="font-semibold">{plugin.name}</span> will be restored to their original default values. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleReset} leftIcon={<RotateCcw size={13} />}>
                Reset Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
