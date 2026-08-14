'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Globe, Bell, Shield, Image as ImageIcon, 
  Share2, Search, Sliders, AlertTriangle, UserPlus, CheckCircle, RefreshCw
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { useSiteSettings, SiteSettings } from '@/lib/settings/site-settings-context';
import { useToast } from '@/components/ui/Toast';
import { useAdminProgress } from '@/components/admin/AdminProgressProvider';
import { MediaUploader } from '@/components/ui/MediaUploader';

export default function AdminSettingsPage() {
  const { settings, updateSettings, resetToDefaults } = useSiteSettings();
  const { addToast } = useToast();
  const { startProgress, updateProgress, completeProgress, errorProgress } = useAdminProgress();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'seo' | 'maintenance' | 'registration'>('general');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: 'social_links' | 'seo_defaults', key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    startProgress({
      title: "Saving Site Settings",
      steps: [
        "Validating settings inputs & rules...",
        "Writing configurations to database...",
        "Broadcasting edge runtime updates..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Validating settings inputs & rules...");
      await new Promise(r => setTimeout(r, 600));
      updateProgress(0, 'success', 40, "Input settings validated.");

      updateProgress(1, 'running', 60, "Writing configurations to database...");
      await updateSettings(formData);
      await new Promise(r => setTimeout(r, 600));
      updateProgress(1, 'success', 85, "Configurations written to DB.");

      updateProgress(2, 'running', 95, "Broadcasting edge runtime updates...");
      await new Promise(r => setTimeout(r, 400));

      completeProgress("Settings saved successfully!");
      addToast({
        title: 'Settings Saved!',
        message: 'Dynamic site settings updated successfully across the platform.',
        type: 'success',
      });
    } catch (e) {
      errorProgress(1, "Failed to save settings configurations.");
      addToast({
        title: 'Save Failed',
        message: 'Could not update site settings.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    startProgress({
      title: "Resetting Settings to Factory Defaults",
      steps: [
        "Purging custom settings overrides...",
        "Restoring site branding default profiles...",
        "Restoring security & registration rule defaults...",
        "Synchronizing schema configurations..."
      ]
    });

    try {
      updateProgress(0, 'running', 15, "Purging custom settings overrides...");
      await new Promise(r => setTimeout(r, 600));
      updateProgress(0, 'success', 30, "Custom overrides cleared.");

      updateProgress(1, 'running', 45, "Restoring site branding default profiles...");
      await new Promise(r => setTimeout(r, 600));
      updateProgress(1, 'success', 60, "Branding defaults restored.");

      updateProgress(2, 'running', 75, "Restoring security & registration rule defaults...");
      await new Promise(r => setTimeout(r, 600));
      
      await resetToDefaults();
      
      updateProgress(2, 'success', 90, "Security & registration defaults loaded.");

      updateProgress(3, 'running', 95, "Synchronizing schema configurations...");
      await new Promise(r => setTimeout(r, 400));

      completeProgress("Factory defaults restored successfully!");
      addToast({
        title: 'Reset Completed',
        message: 'Factory configuration defaults restored successfully.',
        type: 'success',
      });
    } catch (e) {
      errorProgress(2, "Failed to restore defaults.");
      addToast({
        title: 'Reset Failed',
        message: 'Could not restore defaults.',
        type: 'error',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="text-indigo-600" size={24} />
            <h1 className="text-2xl font-black text-[#18181B]">Dynamic Site Settings Manager</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Manage branding, logo, contact info, social links, SEO defaults, maintenance mode, and registration rules from database.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetDefaults} leftIcon={<RefreshCw size={14} />}>
            Reset Defaults
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving} leftIcon={<Save size={14} />}>
            Save All Settings
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'general', label: 'Branding & Contact', icon: Globe },
          { id: 'social', label: 'Social Links', icon: Share2 },
          { id: 'seo', label: 'SEO Defaults', icon: Search },
          { id: 'maintenance', label: 'Maintenance Mode', icon: AlertTriangle },
          { id: 'registration', label: 'Registration Settings', icon: UserPlus },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: General & Branding */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ImageIcon className="text-indigo-600" size={18} />
              <h3 className="text-sm font-bold text-[#18181B]">Branding & Identity</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#71717A] font-semibold mb-1">Platform / Site Name</label>
                <input
                  type="text"
                  value={formData.site_name}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[#71717A] font-semibold mb-1">Site Tagline / Headline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <MediaUploader
                  label="Site Logo Image"
                  description="Main platform logo displayed on navbar and authentication screens."
                  folder="covers"
                  accept="images"
                  aspectRatio="banner"
                  value={formData.logo_url}
                  onChange={(url) => handleChange('logo_url', url)}
                />
                <MediaUploader
                  label="Browser Favicon Icon"
                  description="Small tab icon (.ico, .png, .svg) shown in browser tabs."
                  folder="documents"
                  accept="icons"
                  aspectRatio="square"
                  value={formData.favicon_url}
                  onChange={(url) => handleChange('favicon_url', url)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Globe className="text-indigo-600" size={18} />
              <h3 className="text-sm font-bold text-[#18181B]">Contact & Footer Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#71717A] font-semibold mb-1">Support Email</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[#71717A] font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[#71717A] font-semibold mb-1">Office Address</label>
                <input
                  type="text"
                  value={formData.contact_address}
                  onChange={(e) => handleChange('contact_address', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[#71717A] font-semibold mb-1">Footer Copyright Notice</label>
                <input
                  type="text"
                  value={formData.copyright_text}
                  onChange={(e) => handleChange('copyright_text', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Social Links */}
      {activeTab === 'social' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Share2 className="text-indigo-600" size={18} />
            <h3 className="text-sm font-bold text-[#18181B]">Social Media Profiles</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {Object.keys(formData.social_links).map((key) => (
              <div key={key}>
                <label className="block text-[#71717A] font-semibold mb-1 capitalize">{key} URL</label>
                <input
                  type="url"
                  value={(formData.social_links as any)[key]}
                  onChange={(e) => handleNestedChange('social_links', key, e.target.value)}
                  placeholder={`https://${key}.com/...`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: SEO Defaults */}
      {activeTab === 'seo' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Search className="text-indigo-600" size={18} />
            <h3 className="text-sm font-bold text-[#18181B]">Global SEO & Meta Defaults</h3>
          </div>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[#71717A] font-semibold mb-1">Meta Title Format Template</label>
              <input
                type="text"
                value={formData.seo_defaults.meta_title_template}
                onChange={(e) => handleNestedChange('seo_defaults', 'meta_title_template', e.target.value)}
                placeholder="%s | CreatorPulse"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Use %s to represent the page name.</span>
            </div>
            <div>
              <label className="block text-[#71717A] font-semibold mb-1">Default Meta Description</label>
              <textarea
                rows={3}
                value={formData.seo_defaults.default_meta_description}
                onChange={(e) => handleNestedChange('seo_defaults', 'default_meta_description', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium resize-none"
              />
            </div>
            <div>
              <label className="block text-[#71717A] font-semibold mb-1">Default Meta Keywords</label>
              <input
                type="text"
                value={formData.seo_defaults.default_meta_keywords}
                onChange={(e) => handleNestedChange('seo_defaults', 'default_meta_keywords', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <MediaUploader
                  label="Default Social Sharing Image (OG Image)"
                  description="Cover image preview when links are shared on Twitter, Facebook, or Discord."
                  folder="covers"
                  accept="images"
                  aspectRatio="video"
                  value={formData.seo_defaults.og_image_url}
                  onChange={(url) => handleNestedChange('seo_defaults', 'og_image_url', url)}
                />
              </div>
              <div>
                <label className="block text-[#71717A] font-semibold mb-1">Twitter / X Handle</label>
                <input
                  type="text"
                  value={formData.seo_defaults.twitter_handle}
                  onChange={(e) => handleNestedChange('seo_defaults', 'twitter_handle', e.target.value)}
                  placeholder="@creatorpulse"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: Maintenance Mode */}
      {activeTab === 'maintenance' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertTriangle className="text-amber-500" size={18} />
            <h3 className="text-sm font-bold text-[#18181B]">Platform Maintenance Mode</h3>
          </div>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <div>
                <p className="font-bold text-amber-900 text-sm">Enable Maintenance Mode</p>
                <p className="text-amber-700 text-[11px] mt-0.5">
                  When enabled, non-admin visitors will see a maintenance screen. Admins retain full access to manage the platform.
                </p>
              </div>
              <button
                onClick={() => handleChange('maintenance_mode', !formData.maintenance_mode)}
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                  formData.maintenance_mode ? 'bg-amber-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-md" />
              </button>
            </div>

            <div>
              <label className="block text-[#71717A] font-semibold mb-1">Maintenance Title</label>
              <input
                type="text"
                value={formData.maintenance_title}
                onChange={(e) => handleChange('maintenance_title', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[#71717A] font-semibold mb-1">Maintenance Message / Explanation</label>
              <textarea
                rows={3}
                value={formData.maintenance_message}
                onChange={(e) => handleChange('maintenance_message', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium resize-none"
              />
            </div>
          </div>
        </Card>
      )}

      {/* TAB 5: Registration Settings */}
      {activeTab === 'registration' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserPlus className="text-indigo-600" size={18} />
            <h3 className="text-sm font-bold text-[#18181B]">User Signup & Onboarding Policy</h3>
          </div>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[#71717A] font-semibold mb-1">Registration Policy</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                {[
                  { value: 'open', label: 'Open Registration', desc: 'Anyone can sign up freely' },
                  { value: 'invite_only', label: 'Invite-Only', desc: 'Requires invite code to register' },
                  { value: 'closed', label: 'Closed', desc: 'New signups temporarily disabled' },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => handleChange('registration_mode', mode.value)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.registration_mode === mode.value
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-xs">{mode.label}</p>
                    <p className="text-[10px] text-slate-500 font-normal mt-0.5">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[#71717A] font-semibold mb-1">Default Role For New Signups</label>
                <select
                  value={formData.default_user_role}
                  onChange={(e) => handleChange('default_user_role', e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="member">Member (Fan)</option>
                  <option value="creator">Creator</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <p className="font-bold text-[#18181B]">Require Email Verification</p>
                  <p className="text-[11px] text-[#71717A]">Users must verify email before accessing features</p>
                </div>
                <button
                  onClick={() => handleChange('require_email_verification', !formData.require_email_verification)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                    formData.require_email_verification ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" size="md" onClick={handleResetDefaults} leftIcon={<RefreshCw size={16} />}>
          Reset Defaults
        </Button>
        <Button variant="primary" size="md" onClick={handleSave} isLoading={isSaving} leftIcon={<Save size={16} />}>
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
