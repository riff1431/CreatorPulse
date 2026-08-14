import React, { useState } from 'react';

/**
 * Standardized Plugin SDK Settings Page
 * Demonstrates input fields, settings storage integration, and UI guidelines alignment.
 */
export const PluginSettingsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('sk_test_••••••••••••');
  const [enableBadge, setEnableBadge] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    
    // Simulate API settings save
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus('Settings saved successfully!');
    }, 800);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 text-left font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Starter Plugin Configuration</h2>
          <p className="text-xs text-slate-500 mt-1 font-normal">Configure your plugin keys and toggle feature modules.</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Status: Active
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Settings Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              API Connection Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_test_..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            <p className="text-[10px] text-slate-400 mt-1.5 font-normal">
              Securely stored in the database keychain vault.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Action Badge Overlay
              </label>
              <p className="text-[10px] text-slate-400 mt-1 font-normal">
                Show interactive widgets on active post footers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnableBadge(!enableBadge)}
              className={`w-10 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer border-none ${
                enableBadge ? 'bg-slate-800' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  enableBadge ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
          <p className="font-bold text-slate-700">🔒 System Boundaries & Permissions</p>
          <p className="font-normal">This extension is granted access to the following SDK scopes:</p>
          <ul className="list-disc list-inside space-y-1 font-mono text-[10px] text-slate-500 font-normal">
            <li>notifications_send</li>
            <li>storage_access</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 shadow-sm disabled:opacity-50 cursor-pointer border-none"
          >
            {isSaving ? 'Saving Changes...' : 'Save Settings'}
          </button>
          {saveStatus && (
            <span className="text-xs font-semibold text-emerald-600">
              {saveStatus}
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default PluginSettingsPage;
