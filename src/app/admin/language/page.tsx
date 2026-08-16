'use client';

import React, { useState } from 'react';
import { 
  Globe, Plus, Search, Upload, Download, RefreshCw, Check, 
  Trash2, Edit3, Shield, CheckCircle2, AlertTriangle, FileText, 
  Sparkles, Layers, ArrowRight, CornerDownRight, Filter, ExternalLink
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { useI18n } from '@/lib/i18n/i18n-context';
import { Language, MissingKeyEntry } from '@/lib/i18n/i18n-types';
import { useToast } from '@/components/ui/Toast';
import { useAdminProgress } from '@/components/admin/AdminProgressProvider';

export default function DynamicLanguagePage() {
  const {
    locale,
    defaultLocale,
    isRtl,
    languages,
    translations,
    missingKeys,
    t,
    setLocale,
    updateTranslationKey,
    bulkUpdateTranslations,
    addLanguage,
    updateLanguage,
    deleteLanguage,
    setDefaultLanguage,
    clearMissingKeys,
    resetToDefaults,
  } = useI18n();

  const { addToast } = useToast();
  const { startProgress, updateProgress, completeProgress, errorProgress } = useAdminProgress();

  const [activeTab, setActiveTab] = useState<'languages' | 'editor' | 'import-export' | 'missing'>('languages');
  const [selectedEditorLocale, setSelectedEditorLocale] = useState<string>('en');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals state
  const [isAddLangOpen, setIsAddLangOpen] = useState<boolean>(false);
  const [newLangForm, setNewLangForm] = useState<Partial<Language>>({
    code: '',
    name: '',
    nativeName: '',
    flag: '🌐',
    isRtl: false,
    isEnabled: true,
  });

  const [isAddKeyOpen, setIsAddKeyOpen] = useState<boolean>(false);
  const [newKeyForm, setNewKeyForm] = useState({
    namespace: 'common',
    key: '',
    value: '',
  });

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLocaleTarget, setImportLocaleTarget] = useState<string>('en');
  const [importSummary, setImportSummary] = useState<any | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Filter namespaces dynamically from existing translations
  const activeDict = translations[selectedEditorLocale] || translations['en'] || {};
  const availableNamespaces = Array.from(new Set(Object.keys(activeDict)));

  // Helper to flattened entries for the Editor tab
  const getEditorEntries = () => {
    const entries: { namespace: string; key: string; value: string; englishValue: string }[] = [];
    
    // We base all keys on English or current locale
    const baseDict = translations['en'] || activeDict;

    Object.entries(baseDict).forEach(([ns, keys]) => {
      if (selectedNamespace !== 'all' && selectedNamespace !== ns) return;

      Object.entries(keys).forEach(([k, defaultVal]) => {
        const currentVal = translations[selectedEditorLocale]?.[ns]?.[k] ?? '';
        
        // Search query filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchKey = k.toLowerCase().includes(query);
          const matchVal = String(currentVal).toLowerCase().includes(query);
          const matchDefault = String(defaultVal).toLowerCase().includes(query);
          if (!matchKey && !matchVal && !matchDefault) return;
        }

        entries.push({
          namespace: ns,
          key: k,
          value: currentVal,
          englishValue: defaultVal,
        });
      });
    });

    return entries;
  };

  const editorEntries = getEditorEntries();

  // Handlers
  const handleCreateLanguage = async () => {
    if (!newLangForm.code || !newLangForm.name) {
      addToast({ title: 'Validation Error', message: 'Language code and name are required.', type: 'error' });
      return;
    }

    const code = newLangForm.code.toLowerCase().trim();
    if (languages.some((l) => l.code === code)) {
      addToast({ title: 'Duplicate Language', message: `Language with code '${code}' already exists.`, type: 'error' });
      return;
    }

    const newLang: Language = {
      code,
      name: newLangForm.name.trim(),
      nativeName: newLangForm.nativeName || newLangForm.name,
      flag: newLangForm.flag || '🌐',
      isRtl: Boolean(newLangForm.isRtl),
      isEnabled: Boolean(newLangForm.isEnabled),
      isDefault: false,
      completionPercentage: 0,
    };

    await addLanguage(newLang);
    setIsAddLangOpen(false);
    setNewLangForm({ code: '', name: '', nativeName: '', flag: '🌐', isRtl: false, isEnabled: true });
    addToast({ title: 'Language Added', message: `${newLang.name} added successfully!`, type: 'success' });
  };

  const handleCreateKey = async () => {
    if (!newKeyForm.key || !newKeyForm.value) {
      addToast({ title: 'Validation Error', message: 'Translation key and default value are required.', type: 'error' });
      return;
    }

    const cleanKey = newKeyForm.key.toLowerCase().trim().replace(/\s+/g, '_');
    await updateTranslationKey(selectedEditorLocale, newKeyForm.namespace, cleanKey, newKeyForm.value);
    setIsAddKeyOpen(false);
    setNewKeyForm({ namespace: 'common', key: '', value: '' });
    addToast({ title: 'Key Created', message: `Key '${cleanKey}' saved.`, type: 'success' });
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      addToast({ title: 'File Missing', message: 'Please select a translation file to upload.', type: 'error' });
      return;
    }

    setIsImporting(true);
    startProgress({
      title: 'Importing Translation File',
      steps: [
        'Parsing file format and encoding...',
        'Validating dictionary keys & namespaces...',
        'Merging translations into application state...',
      ],
    });

    try {
      updateProgress(0, 'running', 25, 'Parsing translation file...');
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('locale', importLocaleTarget);

      const res = await fetch('/api/admin/i18n/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to import file');
      }

      updateProgress(1, 'running', 65, 'Merging translations...');
      await bulkUpdateTranslations(importLocaleTarget, data.translations);
      updateProgress(2, 'success', 100, 'Import completed!');
      
      setImportSummary(data.summary);
      completeProgress('Translations imported successfully!');
      addToast({ title: 'Import Complete', message: `Imported ${data.summary.added} strings for ${importLocaleTarget.toUpperCase()}`, type: 'success' });
    } catch (err: any) {
      errorProgress(1, err.message);
      addToast({ title: 'Import Failed', message: err.message, type: 'error' });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportDownload = (exportLocale: string, format: 'json' | 'csv') => {
    window.open(`/api/admin/i18n/export?locale=${exportLocale}&format=${format}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight">Dynamic Language & Translation Manager</h1>
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
              Live Edge i18n
            </span>
          </div>
          <p className="text-xs text-indigo-200/80 max-w-2xl">
            Enable multi-language support, manage translation strings across frontend & admin, support RTL layout directions dynamically, import/export localized dictionaries without touching codebase files.
          </p>
        </div>

        {/* Global Live Active Locale Selector */}
        <div className="flex items-center gap-3 self-start sm:self-center shrink-0 bg-white/10 p-2 rounded-xl backdrop-blur-xs border border-white/10">
          <span className="text-xs font-semibold text-indigo-200">Active Platform UI:</span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-400/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer shadow-xs"
          >
            {languages
              .filter((l) => l.isEnabled)
              .map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeName} ({l.code.toUpperCase()}) {l.isRtl ? '[RTL]' : ''}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('languages')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'languages'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Languages ({languages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'editor'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Translation Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('import-export')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'import-export'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Import / Export</span>
        </button>

        <button
          onClick={() => setActiveTab('missing')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer relative ${
            activeTab === 'missing'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Missing Keys</span>
          {missingKeys.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500 text-white">
              {missingKeys.length}
            </span>
          )}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset Defaults
          </Button>
        </div>
      </div>

      {/* TAB 1: LANGUAGES MANAGEMENT */}
      {activeTab === 'languages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Configured App Locales
            </h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddLangOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add New Language
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languages.map((lang) => (
              <Card key={lang.code} className="p-4 relative overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                {lang.isDefault && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-extrabold px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    Default System Locale
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl p-1 bg-slate-100 rounded-lg">{lang.flag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      {lang.name}
                      {lang.isRtl && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          RTL
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500">{lang.nativeName} ({lang.code.toUpperCase()})</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[11px] font-medium text-slate-600">
                    <span>Translation Coverage</span>
                    <span className="font-bold text-slate-900">{lang.completionPercentage || (lang.code === 'en' ? 100 : 85)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        lang.isDefault ? 'bg-indigo-600' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${lang.completionPercentage || (lang.code === 'en' ? 100 : 85)}%` }}
                    />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lang.isEnabled}
                      disabled={lang.isDefault}
                      onChange={(e) => updateLanguage(lang.code, { isEnabled: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span>{lang.isEnabled ? 'Enabled' : 'Disabled'}</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    {!lang.isDefault && (
                      <button
                        onClick={() => setDefaultLanguage(lang.code)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline px-2 py-1 cursor-pointer"
                      >
                        Make Default
                      </button>
                    )}

                    {!lang.isDefault && (
                      <button
                        onClick={() => deleteLanguage(lang.code)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Language"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TRANSLATION KEY EDITOR */}
      {activeTab === 'editor' && (
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Target Locale:</span>
                <select
                  value={selectedEditorLocale}
                  onChange={(e) => setSelectedEditorLocale(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg text-xs font-bold px-3 py-1.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name} ({l.code.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Namespace:</span>
                <select
                  value={selectedNamespace}
                  onChange={(e) => setSelectedNamespace(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg text-xs font-bold px-3 py-1.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                >
                  <option value="all">All Namespaces</option>
                  {availableNamespaces.map((ns) => (
                    <option key={ns} value={ns}>
                      {ns.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter keys or string values..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-slate-300 text-xs rounded-lg pl-8 pr-3 py-1.5 w-52 sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddKeyOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Key
            </Button>
          </div>

          {/* Translation Key Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-28">Namespace</th>
                  <th className="py-2.5 px-3 w-56">Translation Key</th>
                  <th className="py-2.5 px-3">Baseline (English)</th>
                  <th className="py-2.5 px-3">
                    Target Translation ({selectedEditorLocale.toUpperCase()})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {editorEntries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400">
                      No translation keys found matching search filters.
                    </td>
                  </tr>
                ) : (
                  editorEntries.map((item) => (
                    <tr key={`${item.namespace}.${item.key}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {item.namespace}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-700 font-medium">
                        {item.key}
                      </td>
                      <td className="py-2 px-3 text-slate-500 italic max-w-xs truncate">
                        {item.englishValue || <span className="text-slate-300">N/A</span>}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          defaultValue={item.value}
                          onBlur={(e) => {
                            if (e.target.value !== item.value) {
                              updateTranslationKey(
                                selectedEditorLocale,
                                item.namespace,
                                item.key,
                                e.target.value
                              );
                              addToast({
                                title: 'Updated',
                                message: `Saved '${item.key}' in ${selectedEditorLocale.toUpperCase()}`,
                                type: 'success',
                              });
                            }
                          }}
                          dir={isRtl && selectedEditorLocale === 'ar' ? 'rtl' : 'ltr'}
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                          placeholder="Type translation here..."
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: IMPORT / EXPORT */}
      {activeTab === 'import-export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Box */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Export Translation Files</h3>
                <p className="text-xs text-slate-500">Download complete localized dictionaries in JSON or CSV format.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {languages.map((lang) => (
                <div key={lang.code} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{lang.flag}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{lang.name}</p>
                      <p className="text-[10px] text-slate-500">{lang.code.toUpperCase()} locale dictionary</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportDownload(lang.code, 'json')}
                    >
                      JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportDownload(lang.code, 'csv')}
                    >
                      CSV
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Import Box */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Import Translation File</h3>
                <p className="text-xs text-slate-500">Upload JSON or CSV files to batch update translations.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Language Locale</label>
                <select
                  value={importLocaleTarget}
                  onChange={(e) => setImportLocaleTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-xs font-bold rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name} ({l.code.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Translation File (.json / .csv)</label>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 rounded-lg"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full mt-2"
                onClick={handleImportSubmit}
                isLoading={isImporting}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Upload & Merge Translations
              </Button>

              {importSummary && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Import Diff Summary
                  </p>
                  <p>Added/Updated Key Strings: <strong>{importSummary.added}</strong></p>
                  {importSummary.details?.map((d: string, i: number) => (
                    <p key={i} className="text-[11px] text-emerald-700">{d}</p>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: MISSING KEYS TRACKER */}
      {activeTab === 'missing' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Missing Key Detector</h3>
                <p className="text-xs text-slate-500">
                  Automatically captures strings requested at runtime via <code>t()</code> that lack a localized definition.
                </p>
              </div>
            </div>

            {missingKeys.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearMissingKeys}
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
              >
                Clear Logged Keys
              </Button>
            )}
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Namespace</th>
                  <th className="py-2.5 px-3">Missing Key String</th>
                  <th className="py-2.5 px-3">Request Frequency</th>
                  <th className="py-2.5 px-3">Last Request Time</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {missingKeys.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                      Awesome! No missing translation keys detected on the platform.
                    </td>
                  </tr>
                ) : (
                  missingKeys.map((item) => (
                    <tr key={`${item.namespace}.${item.key}`} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-700">{item.namespace}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-amber-700">{item.key}</td>
                      <td className="py-2 px-3 font-bold text-slate-800">{item.count} times</td>
                      <td className="py-2 px-3 text-slate-500">{new Date(item.requestedAt).toLocaleTimeString()}</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => {
                            setNewKeyForm({ namespace: item.namespace, key: item.key, value: '' });
                            setIsAddKeyOpen(true);
                          }}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded hover:bg-indigo-100 cursor-pointer text-[11px]"
                        >
                          Fill Translation
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL: ADD NEW LANGUAGE */}
      {isAddLangOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-5 space-y-4 bg-white">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              Add Custom Language Locale
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Language Code (e.g. 'de', 'ja', 'it')</label>
                <input
                  type="text"
                  value={newLangForm.code}
                  onChange={(e) => setNewLangForm({ ...newLangForm, code: e.target.value })}
                  placeholder="e.g. de"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">English Name</label>
                <input
                  type="text"
                  value={newLangForm.name}
                  onChange={(e) => setNewLangForm({ ...newLangForm, name: e.target.value })}
                  placeholder="e.g. German"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Native Display Name</label>
                <input
                  type="text"
                  value={newLangForm.nativeName}
                  onChange={(e) => setNewLangForm({ ...newLangForm, nativeName: e.target.value })}
                  placeholder="e.g. Deutsch"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Flag Emoji</label>
                  <input
                    type="text"
                    value={newLangForm.flag}
                    onChange={(e) => setNewLangForm({ ...newLangForm, flag: e.target.value })}
                    className="w-16 border border-slate-300 rounded-lg px-3 py-2 text-center text-base"
                  />
                </div>

                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer mt-5">
                  <input
                    type="checkbox"
                    checked={newLangForm.isRtl}
                    onChange={(e) => setNewLangForm({ ...newLangForm, isRtl: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>RTL Direction</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsAddLangOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateLanguage}>
                Create Language
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: ADD TRANSLATION KEY */}
      {isAddKeyOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-5 space-y-4 bg-white">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Add Translation Key
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Namespace</label>
                <select
                  value={newKeyForm.namespace}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, namespace: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="common">common</option>
                  <option value="auth">auth</option>
                  <option value="feed">feed</option>
                  <option value="creator">creator</option>
                  <option value="admin">admin</option>
                  <option value="member">member</option>
                  <option value="plugins">plugins</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Identifier (snake_case)</label>
                <input
                  type="text"
                  value={newKeyForm.key}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, key: e.target.value })}
                  placeholder="e.g. hero_subtitle"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Translation Text ({selectedEditorLocale.toUpperCase()})
                </label>
                <textarea
                  rows={3}
                  value={newKeyForm.value}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, value: e.target.value })}
                  placeholder="Enter localized string..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsAddKeyOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateKey}>
                Save Key
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
