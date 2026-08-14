'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Palette, Upload, Check, Download, RotateCcw, Trash2, Sliders,
  ExternalLink, ShieldCheck, Info, X, CheckCircle2, AlertTriangle,
  Layers, Eye, Copy, RefreshCw, Lock, Heart, MessageSquare, Star,
  BookOpen, Terminal, Plus, Search, Sparkles, SlidersHorizontal, Image as ImageIcon,
  Key, ShieldAlert, CheckCircle, ArrowRight, ArrowUpDown
} from 'lucide-react';
import { useTheme } from '@/lib/extensions/theme-engine';
import { ThemeManifest, ThemeTokens, ThemeVisualSettings } from '@/lib/extensions/theme-types';
import { validateThemePackage } from '@/lib/extensions/package-installer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AdminThemesPage() {
  const {
    themes,
    activeTheme,
    libraryThemes,
    activateTheme,
    activateThemeWithLicense,
    deactivateTheme,
    updateThemeVersion,
    installTheme,
    installFromLibrary,
    duplicateTheme,
    deleteTheme,
    customizeTheme,
    rollbackTheme,
    exportTheme
  } = useTheme();

  // Navigation Tabs: 'installed' | 'activation' | 'updates' | 'library'
  const [activeTab, setActiveTab] = useState<'installed' | 'activation' | 'updates' | 'library'>('installed');
  
  // Search, Filter & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'newest' | 'category'>('name_asc');

  // Modals & Drawers
  const [selectedThemeForDetails, setSelectedThemeForDetails] = useState<ThemeManifest | null>(null);
  const [customizerTheme, setCustomizerTheme] = useState<ThemeManifest | null>(null);
  const [livePreviewTheme, setLivePreviewTheme] = useState<ThemeManifest | null>(null);
  const [previewTab, setPreviewTab] = useState<'feed' | 'profile' | 'landing'>('feed');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // License & Activation Modal
  const [licenseTargetTheme, setLicenseTargetTheme] = useState<ThemeManifest | null>(null);
  const [licenseInputKey, setLicenseInputKey] = useState('');
  const [activationError, setActivationError] = useState('');
  const [activationSuccess, setActivationSuccess] = useState(false);

  // Delete Confirmation Modal
  const [themeToDelete, setThemeToDelete] = useState<ThemeManifest | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

  // Upload state
  const [uploadText, setUploadText] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Customizer state
  const [customPrimary, setCustomPrimary] = useState(activeTheme.tokens.primary);
  const [customAccent, setCustomAccent] = useState(activeTheme.tokens.accent);
  const [customBg, setCustomBg] = useState(activeTheme.tokens.background);
  const [customSurface, setCustomSurface] = useState(activeTheme.tokens.surface);
  const [customBorder, setCustomBorder] = useState(activeTheme.tokens.border);
  const [customCardRadius, setCustomCardRadius] = useState(activeTheme.tokens.cardRadius || '20px');
  const [customButtonRadius, setCustomButtonRadius] = useState(activeTheme.tokens.buttonRadius || '14px');
  const [customLogoUrl, setCustomLogoUrl] = useState(activeTheme.settings?.logoUrl || '');
  const [customContainerWidth, setCustomContainerWidth] = useState<'max-w-6xl' | 'max-w-7xl' | 'max-w-full'>(activeTheme.settings?.containerWidth || 'max-w-7xl');
  const [customButtonStyle, setCustomButtonStyle] = useState<'gradient-glow' | 'flat-solid' | 'soft-glass' | 'outline-neo'>(activeTheme.settings?.buttonStyle || 'gradient-glow');
  const [customAnimationIntensity, setCustomAnimationIntensity] = useState<'off' | 'subtle' | 'normal' | 'playful'>(activeTheme.settings?.animationIntensity || 'normal');

  const triggerNotice = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(''), 3500);
  };

  const openCustomizer = (theme: ThemeManifest) => {
    setCustomizerTheme(theme);
    setCustomPrimary(theme.tokens.primary);
    setCustomAccent(theme.tokens.accent);
    setCustomBg(theme.tokens.background);
    setCustomSurface(theme.tokens.surface);
    setCustomBorder(theme.tokens.border);
    setCustomCardRadius(theme.tokens.cardRadius || '20px');
    setCustomButtonRadius(theme.tokens.buttonRadius || '14px');
    setCustomLogoUrl(theme.settings?.logoUrl || '');
    setCustomContainerWidth(theme.settings?.containerWidth || 'max-w-7xl');
    setCustomButtonStyle(theme.settings?.buttonStyle || 'gradient-glow');
    setCustomAnimationIntensity(theme.settings?.animationIntensity || 'normal');
  };

  const handleSaveCustomization = () => {
    if (!customizerTheme) return;
    customizeTheme(
      customizerTheme.id,
      {
        primary: customPrimary,
        primaryHover: customPrimary,
        accent: customAccent,
        background: customBg,
        surface: customSurface,
        border: customBorder,
        cardRadius: customCardRadius,
        buttonRadius: customButtonRadius
      },
      {
        logoUrl: customLogoUrl,
        containerWidth: customContainerWidth,
        buttonStyle: customButtonStyle,
        animationIntensity: customAnimationIntensity
      }
    );
    setCustomizerTheme(null);
    triggerNotice(`Saved customizations for "${customizerTheme.name}"!`);
  };

  const handleDuplicate = (theme: ThemeManifest) => {
    const cloned = duplicateTheme(theme.id);
    if (cloned) {
      triggerNotice(`Duplicated "${theme.name}" as "${cloned.name}"`);
    }
  };

  const handleOpenActivation = (theme: ThemeManifest) => {
    setLicenseTargetTheme(theme);
    setLicenseInputKey(theme.licenseKey || '');
    setActivationError('');
    setActivationSuccess(false);
  };

  const handleConfirmActivation = () => {
    if (!licenseTargetTheme) return;
    setActivationError('');
    setActivationSuccess(false);

    const result = activateThemeWithLicense(licenseTargetTheme.id, licenseInputKey);
    if (!result.success) {
      setActivationError(result.error || 'Failed to activate theme.');
      return;
    }

    setActivationSuccess(true);
    triggerNotice(`Activated theme "${licenseTargetTheme.name}" successfully!`);
    setTimeout(() => {
      setLicenseTargetTheme(null);
      setActivationSuccess(false);
    }, 1200);
  };

  const handleConfirmDelete = () => {
    if (!themeToDelete) return;
    setDeleteErrorMessage('');

    const res = deleteTheme(themeToDelete.id);
    if (!res.success) {
      setDeleteErrorMessage(res.error || 'Failed to delete theme.');
      return;
    }

    triggerNotice(`Theme "${themeToDelete.name}" deleted successfully.`);
    setThemeToDelete(null);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setUploadSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const result = validateThemePackage(parsed);

        if (!result.valid || !result.theme) {
          setUploadError(result.error || 'Failed to validate theme package.');
          return;
        }

        if (themes.some((t) => t.id === result.theme!.id)) {
          setUploadError(`A theme with ID "${result.theme!.id}" is already installed.`);
          return;
        }

        installTheme(result.theme);
        setUploadSuccess(true);
        triggerNotice(`Installed theme "${result.theme.name}"! Opening Activation view...`);
        setTimeout(() => {
          setIsUploadOpen(false);
          setUploadSuccess(false);
          setActiveTab('activation');
        }, 1200);
      } catch (err: any) {
        setUploadError('Invalid file format. Please upload a valid JSON theme manifest or ZIP package.');
      }
    };
    reader.readAsText(file);
  };

  const handleManualJsonInstall = () => {
    setUploadError('');
    setUploadSuccess(false);
    try {
      const parsed = JSON.parse(uploadText);
      const result = validateThemePackage(parsed);
      if (!result.valid || !result.theme) {
        setUploadError(result.error || 'Validation error');
        return;
      }

      if (themes.some((t) => t.id === result.theme!.id)) {
        setUploadError(`A theme with ID "${result.theme!.id}" is already installed.`);
        return;
      }

      installTheme(result.theme);
      setUploadSuccess(true);
      triggerNotice(`Installed theme "${result.theme.name}"! Opening Activation view...`);
      setTimeout(() => {
        setIsUploadOpen(false);
        setUploadSuccess(false);
        setUploadText('');
        setActiveTab('activation');
      }, 1200);
    } catch (e: any) {
      setUploadError('JSON syntax error: ' + e.message);
    }
  };

  const handleExportTheme = (theme: ThemeManifest) => {
    const jsonStr = exportTheme(theme.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.slug}-theme-v${theme.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerNotice(`Exported ${theme.name} JSON package`);
  };

  const handleDownloadStarter = () => {
    const starterTheme = {
      id: 'theme-starter-template',
      name: 'CreatorPulse Starter Theme',
      slug: 'starter-template',
      description: 'Official template demonstrating Theme SDK v1.0 with color tokens, corner geometry, container layout, and component styling.',
      version: '1.0.0',
      author: 'Your Design Studio',
      authorUrl: 'https://yourdesignstudio.com',
      previewImageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600',
      category: 'Modern Light',
      tags: ['Starter', 'SDK v1.0', 'Template'],
      minAppVersion: '1.0.0',
      requiresLicense: true,
      licenseKey: 'CP-THEME-DEMO-2026-OK',
      tokens: {
        primary: '#EC4899',
        primaryHover: '#DB2777',
        softPrimary: '#FCE7F3',
        lightPrimary: '#FDF2F8',
        accent: '#F43F5E',
        background: '#FFF9FC',
        surface: '#FFFFFF',
        surfaceSecondary: '#FFF1F7',
        border: '#F3DCE8',
        textPrimary: '#18181B',
        textSecondary: '#71717A',
        textMuted: '#A1A1AA',
        cardRadius: '20px',
        buttonRadius: '14px',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontHeading: 'Plus Jakarta Sans, sans-serif',
        isDark: false
      },
      settings: {
        logoUrl: '',
        faviconUrl: '',
        containerWidth: 'max-w-7xl',
        buttonStyle: 'gradient-glow',
        animationIntensity: 'normal',
        cardShadow: 'soft-pink'
      },
      changelog: [
        { version: '1.0.0', date: new Date().toISOString().split('T')[0], changes: ['Initial starter release'] }
      ]
    };

    const blob = new Blob([JSON.stringify(starterTheme, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'creatorpulse-theme-starter-v1.0.json';
    a.click();
    URL.revokeObjectURL(url);
    triggerNotice('Downloaded CreatorPulse Theme SDK v1.0 Starter Template!');
  };

  // Sort helper
  const sortThemes = (list: ThemeManifest[]) => {
    return [...list].sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'newest') return (b.installedAt || '').localeCompare(a.installedAt || '');
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return 0;
    });
  };

  // Filter themes based on tab, search, and category
  const filteredInstalledThemes = sortThemes(
    themes.filter((t) => {
      if (activeTab === 'updates' && !t.hasUpdate) return false;

      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
  );

  const filteredLibraryThemes = sortThemes(
    libraryThemes.filter((t) => {
      const isAlreadyInstalled = themes.some((installed) => installed.id === t.id);
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;

      return !isAlreadyInstalled && matchesSearch && matchesCategory;
    })
  );

  const updateCount = themes.filter((t) => t.hasUpdate).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3DCE8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="text-[#EC4899]" size={24} />
            <h1 className="text-2xl font-black text-[#18181B]">Theme Management</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Manage frontend themes and visual styles. Active Theme: <strong className="text-[#BE185D]">{activeTheme.name}</strong>. Built-in default: <strong className="text-[#BE185D]">Blush Core</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<BookOpen size={14} />}
            onClick={() => setIsDocsOpen(true)}
          >
            Theme SDK Docs
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Upload size={14} />}
            onClick={() => setIsUploadOpen(true)}
          >
            Upload Theme (.ZIP / JSON)
          </Button>
        </div>
      </div>

      {/* Toast Notification Alert */}
      {notificationMsg && (
        <div className="p-3.5 bg-[#FFF1F7] border border-[#FBCFE8] rounded-2xl text-xs text-[#BE185D] font-bold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#EC4899]" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg('')} className="text-[#A1A1AA] hover:text-[#18181B]">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Admin Panel Isolation Guarantee Banner */}
      <div className="p-4 bg-white border border-[#F3DCE8] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#18181B] flex items-center gap-2">
              <span>Frontend-Only Isolation Architecture</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                Permanently Independent
              </span>
            </h4>
            <p className="text-[11px] text-[#71717A] mt-0.5">
              Active themes exclusively style the public website, user feeds, creator profiles, and member portals. The Admin Panel is sandboxed to dedicated administrative tokens.
            </p>
          </div>
        </div>

        <Link href="/feed" target="_blank" className="shrink-0">
          <Button variant="outline" size="sm" leftIcon={<ExternalLink size={13} />}>
            View Live Public Site
          </Button>
        </Link>
      </div>

      {/* 4 Main Standard Navigation Sections */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F3DCE8] pb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'installed'
                ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <span>Installed Themes</span>
            <span className="text-[10px] bg-white text-[#BE185D] px-1.5 py-0.5 rounded-full border border-[#F3DCE8]">
              {themes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('activation')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'activation'
                ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <Key size={13} className="text-[#EC4899]" />
            <span>Theme Activation</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200">
              1 Active
            </span>
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'updates'
                ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <span>Updates</span>
            {updateCount > 0 && (
              <span className="text-[10px] bg-[#F43F5E] text-white px-1.5 py-0.5 rounded-full font-bold">
                {updateCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'library'
                ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <Sparkles size={13} className="text-[#EC4899]" />
            <span>Theme Library</span>
            <span className="text-[10px] bg-gradient-to-r from-[#EC4899] to-[#F43F5E] text-white px-1.5 py-0.5 rounded-full">
              Discover
            </span>
          </button>
        </div>

        {/* Search, Filter & Sort Bar */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={13} />
            <input
              type="text"
              placeholder="Search themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] font-medium"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-2.5 py-1.5 text-xs text-[#18181B] focus:outline-none font-medium"
          >
            <option value="all">All Categories</option>
            <option value="Modern Light">Modern Light</option>
            <option value="Dark Cyber">Dark Cyber</option>
            <option value="Frosted Pastel">Frosted Pastel</option>
            <option value="Warm Vibrant">Warm Vibrant</option>
            <option value="Luxury Dark">Luxury Dark</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-2.5 py-1.5 text-xs text-[#18181B] focus:outline-none font-medium"
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="newest">Newest First</option>
            <option value="category">By Category</option>
          </select>
        </div>
      </div>

      {/* SECTION 1: INSTALLED THEMES & UPDATES */}
      {(activeTab === 'installed' || activeTab === 'updates') && (
        <div className="space-y-4">
          {filteredInstalledThemes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#F3DCE8] p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1F7] text-[#EC4899] flex items-center justify-center mx-auto text-xl">
                🎨
              </div>
              <h3 className="font-bold text-sm text-[#18181B]">No Themes Found</h3>
              <p className="text-xs text-[#71717A] max-w-sm mx-auto">
                No installed themes match your search or filter. You can browse the Theme Library to discover and install new aesthetics.
              </p>
              <Button variant="primary" size="sm" onClick={() => setActiveTab('library')}>
                Browse Theme Library
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstalledThemes.map((theme) => {
                const isActive = theme.id === activeTheme.id;
                return (
                  <Card
                    key={theme.id}
                    className={`p-0 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${
                      isActive ? 'border-2 border-[#EC4899] ring-2 ring-[#EC4899]/20' : 'hover:border-[#F472B6]/50'
                    }`}
                  >
                    <div>
                      {/* Card Thumbnail */}
                      <div className="relative h-40 w-full overflow-hidden bg-slate-900 group">
                        <img
                          src={theme.previewImageUrl}
                          alt={theme.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                            {theme.category}
                          </span>
                          {theme.isDefault && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white flex items-center gap-1">
                              <Lock size={9} /> Default
                            </span>
                          )}
                          {theme.isCustom && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EC4899] text-white">
                              Custom
                            </span>
                          )}
                        </div>

                        {isActive && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EC4899] text-white text-[11px] font-extrabold shadow-lg shadow-[#EC4899]/40">
                            <Check size={12} strokeWidth={3} /> Active
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                          <div>
                            <h4 className="font-extrabold text-sm text-white drop-shadow-sm">{theme.name}</h4>
                            <p className="text-[10px] text-white/80 font-medium">By {theme.author}</p>
                          </div>
                          <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">v{theme.version}</span>
                        </div>
                      </div>

                      {/* Details & Token Preview */}
                      <div className="p-4 space-y-3">
                        <p className="text-xs text-[#71717A] leading-relaxed line-clamp-2 font-medium">{theme.description}</p>

                        <div className="flex items-center gap-1.5 pt-1">
                          <div className="h-3.5 flex-1 rounded" style={{ backgroundColor: theme.tokens.primary }} title={`Primary: ${theme.tokens.primary}`} />
                          <div className="h-3.5 flex-1 rounded" style={{ backgroundColor: theme.tokens.accent }} title={`Accent: ${theme.tokens.accent}`} />
                          <div className="h-3.5 flex-1 rounded border border-[#F3DCE8]" style={{ backgroundColor: theme.tokens.background }} title={`Background: ${theme.tokens.background}`} />
                          <div className="h-3.5 flex-1 rounded border border-[#F3DCE8]" style={{ backgroundColor: theme.tokens.surface }} title={`Surface: ${theme.tokens.surface}`} />
                          <span className="text-[10px] text-[#A1A1AA] font-mono ml-1">{theme.tokens.isDark ? '🌙 Dark' : '☀️ Light'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="p-4 pt-0">
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#F3DCE8]">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setLivePreviewTheme(theme)}
                            className="p-1.5 rounded-xl text-[#71717A] hover:text-[#EC4899] hover:bg-[#FFF1F7] transition-colors cursor-pointer"
                            title="Live Preview"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openCustomizer(theme)}
                            className="p-1.5 rounded-xl text-[#71717A] hover:text-[#EC4899] hover:bg-[#FFF1F7] transition-colors cursor-pointer"
                            title="Configure & Customize"
                          >
                            <Sliders size={15} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(theme)}
                            className="p-1.5 rounded-xl text-[#71717A] hover:text-[#EC4899] hover:bg-[#FFF1F7] transition-colors cursor-pointer"
                            title="Duplicate Theme"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            onClick={() => handleExportTheme(theme)}
                            className="p-1.5 rounded-xl text-[#71717A] hover:text-[#EC4899] hover:bg-[#FFF1F7] transition-colors cursor-pointer"
                            title="Export JSON"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            onClick={() => setSelectedThemeForDetails(theme)}
                            className="p-1.5 rounded-xl text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7] transition-colors cursor-pointer"
                            title="Specs & Changelog"
                          >
                            <Info size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteErrorMessage('');
                              setThemeToDelete(theme);
                            }}
                            className="p-1.5 rounded-xl text-[#71717A] hover:text-[#F43F5E] hover:bg-[#FFE4E6] transition-colors cursor-pointer"
                            title="Delete Theme"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {!isActive ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenActivation(theme)}
                          >
                            Activate
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              deactivateTheme(theme.id);
                              triggerNotice(`Deactivated "${theme.name}", rolled back to Blush Core.`);
                            }}
                            disabled={theme.id === 'theme-blush-core'}
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: DEDICATED THEME ACTIVATION VIEW */}
      {activeTab === 'activation' && (
        <div className="space-y-6">
          <div className="p-5 bg-white border border-[#F3DCE8] rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FCE7F3] text-[#EC4899] flex items-center justify-center font-bold">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#18181B]">Dedicated Theme Activation & Licensing Center</h3>
                  <p className="text-xs text-[#71717A]">
                    Activate installed frontend themes with license key validation. Only 1 theme can be active at a time.
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle size={14} /> Currently Active: {activeTheme.name}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map((theme) => {
                const isActive = theme.id === activeTheme.id;
                return (
                  <div
                    key={theme.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      isActive
                        ? 'bg-[#FFF1F7] border-[#EC4899] shadow-sm'
                        : 'bg-[#FFF9FC] border-[#F3DCE8] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={theme.previewImageUrl}
                        alt={theme.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#F3DCE8]"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-[#18181B] flex items-center gap-1.5">
                          <span>{theme.name}</span>
                          {isActive && (
                            <span className="text-[9px] font-extrabold text-[#EC4899] bg-white px-1.5 py-0.5 rounded border border-[#FBCFE8]">
                              ACTIVE
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-[#71717A]">v{theme.version} • {theme.category}</p>
                        {theme.licenseKey && (
                          <p className="text-[10px] font-mono text-emerald-700 mt-0.5">
                            License: ••••••••{theme.licenseKey.slice(-4)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLivePreviewTheme(theme)}
                        className="p-2 rounded-xl text-[#71717A] hover:text-[#EC4899] hover:bg-white transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                      >
                        <Eye size={14} />
                      </button>

                      {isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={theme.id === 'theme-blush-core'}
                          onClick={() => {
                            deactivateTheme(theme.id);
                            triggerNotice(`Reverted to Blush Core default theme.`);
                          }}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenActivation(theme)}
                          leftIcon={<Key size={13} />}
                        >
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: THEME LIBRARY / DISCOVERY HUB */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-[#FFF1F7] to-white border border-[#FBCFE8] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EC4899] text-white flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#18181B]">CreatorPulse Official Theme Library & Marketplace</h4>
                <p className="text-[11px] text-[#71717A] mt-0.5">
                  Browse and install verified creator-platform themes with 1-click. Installing routes newly added themes directly to Activation.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={13} />}
              onClick={handleDownloadStarter}
            >
              Download Theme SDK Starter
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLibraryThemes.map((theme) => (
              <Card
                key={theme.id}
                className="p-0 overflow-hidden flex flex-col justify-between border-[#F3DCE8] bg-white transition-all duration-300 hover:shadow-xl hover:border-[#F472B6]/50"
              >
                <div>
                  <div className="relative h-36 w-full overflow-hidden bg-slate-900 group">
                    <img
                      src={theme.previewImageUrl}
                      alt={theme.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                        {theme.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-extrabold text-sm drop-shadow-sm">{theme.name}</h4>
                      <p className="text-[10px] text-white/80">By {theme.author}</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <p className="text-xs text-[#71717A] leading-relaxed line-clamp-2 font-medium">{theme.description}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="h-3 flex-1 rounded" style={{ backgroundColor: theme.tokens.primary }} />
                      <div className="h-3 flex-1 rounded" style={{ backgroundColor: theme.tokens.accent }} />
                      <div className="h-3 flex-1 rounded border border-[#F3DCE8]" style={{ backgroundColor: theme.tokens.background }} />
                      <div className="h-3 flex-1 rounded border border-[#F3DCE8]" style={{ backgroundColor: theme.tokens.surface }} />
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-[#F3DCE8] mt-2 pt-3">
                  <button
                    onClick={() => setLivePreviewTheme(theme)}
                    className="text-xs font-bold text-[#EC4899] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Eye size={13} /> Live Preview
                  </button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      installFromLibrary(theme.id);
                      triggerNotice(`Installed theme "${theme.name}"! Opening Activation...`);
                      setActiveTab('activation');
                    }}
                    leftIcon={<Plus size={13} />}
                  >
                    Install Theme
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: LICENSE ACTIVATION MODAL */}
      {licenseTargetTheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#F3DCE8] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FCE7F3] text-[#EC4899] flex items-center justify-center font-bold">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#18181B]">Activate {licenseTargetTheme.name}</h3>
                  <p className="text-xs text-[#71717A]">Theme License & Version Verification</p>
                </div>
              </div>
              <button
                onClick={() => setLicenseTargetTheme(null)}
                className="p-1 rounded-xl text-[#71717A] hover:text-[#18181B]"
              >
                <X size={18} />
              </button>
            </div>

            {activationSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 font-bold">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Theme successfully verified and activated as active frontend theme!</span>
              </div>
            )}

            {activationError && (
              <div className="p-3 bg-[#FFE4E6] border border-[#FECDD3] rounded-2xl text-xs text-[#BE123C] flex items-center gap-2 font-medium">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{activationError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8]">
                <img
                  src={licenseTargetTheme.previewImageUrl}
                  alt={licenseTargetTheme.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#F3DCE8]"
                />
                <div>
                  <h4 className="font-bold text-xs text-[#18181B]">{licenseTargetTheme.name} v{licenseTargetTheme.version}</h4>
                  <p className="text-[11px] text-[#71717A]">Category: {licenseTargetTheme.category}</p>
                  <p className="text-[11px] text-[#71717A]">By: {licenseTargetTheme.author}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#18181B]">License Key / Purchase Code</label>
                <input
                  type="text"
                  placeholder="e.g. CP-THEME-7X89-KL22-901B"
                  value={licenseInputKey}
                  onChange={(e) => setLicenseInputKey(e.target.value)}
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 font-mono text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899]"
                />
                <p className="text-[10px] text-[#A1A1AA]">
                  Required for premium and custom third-party themes. Enter any valid license code to activate.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3DCE8]">
              <Button variant="ghost" size="sm" onClick={() => setLicenseTargetTheme(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmActivation} leftIcon={<Check size={14} />}>
                Verify & Activate Theme
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE CONFIRMATION POPUP */}
      {themeToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#FECDD3] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-[#F3DCE8] pb-3 text-[#F43F5E]">
              <div className="w-10 h-10 rounded-2xl bg-[#FFE4E6] flex items-center justify-center font-bold">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#18181B]">Delete Theme Confirmation</h3>
                <p className="text-xs text-[#71717A]">Permanently uninstall theme package</p>
              </div>
            </div>

            {deleteErrorMessage && (
              <div className="p-3 bg-[#FFE4E6] border border-[#FECDD3] rounded-2xl text-xs text-[#BE123C] flex items-center gap-2 font-bold">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{deleteErrorMessage}</span>
              </div>
            )}

            <div className="space-y-2 text-xs text-[#71717A] leading-relaxed">
              <p>
                Are you sure you want to permanently delete <strong className="text-[#18181B]">{themeToDelete.name}</strong> (v{themeToDelete.version})?
              </p>
              <div className="p-3 bg-[#FFF9FC] rounded-xl border border-[#F3DCE8] text-[11px] space-y-1">
                <p className="font-bold text-[#18181B]">Safety Constraints:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Built-in default theme (Blush Core) is protected and cannot be deleted.</li>
                  <li>Currently active theme cannot be deleted until another theme is activated.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3DCE8]">
              <Button variant="ghost" size="sm" onClick={() => setThemeToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmDelete} leftIcon={<Trash2 size={13} />}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: LIVE FRONTEND VIEWPORT PREVIEW */}
      {livePreviewTheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#F3DCE8] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FCE7F3] text-[#EC4899] flex items-center justify-center font-bold">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#18181B]">
                    Frontend Live Preview: {livePreviewTheme.name}
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Simulating public website appearance under {livePreviewTheme.name} design tokens
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLivePreviewTheme(null)}
                className="p-1.5 rounded-xl text-[#71717A] hover:text-[#18181B] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Viewport View Switcher Tabs */}
            <div className="flex items-center justify-between gap-3 shrink-0 border-b border-[#F3DCE8] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold">
                <button
                  onClick={() => setPreviewTab('feed')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    previewTab === 'feed'
                      ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                      : 'text-[#71717A] hover:text-[#18181B]'
                  }`}
                >
                  Community Feed Post View
                </button>
                <button
                  onClick={() => setPreviewTab('profile')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    previewTab === 'profile'
                      ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                      : 'text-[#71717A] hover:text-[#18181B]'
                  }`}
                >
                  Creator Profile View
                </button>
                <button
                  onClick={() => setPreviewTab('landing')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    previewTab === 'landing'
                      ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                      : 'text-[#71717A] hover:text-[#18181B]'
                  }`}
                >
                  Landing Page Hero View
                </button>
              </div>

              {livePreviewTheme.id !== activeTheme.id && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleOpenActivation(livePreviewTheme);
                    setLivePreviewTheme(null);
                  }}
                  leftIcon={<Check size={14} />}
                >
                  Activate This Theme
                </Button>
              )}
            </div>

            {/* Simulated Live Viewport Container */}
            <div
              className="flex-1 overflow-y-auto p-6 rounded-2xl border transition-all space-y-6"
              style={{
                backgroundColor: livePreviewTheme.tokens.background,
                borderColor: livePreviewTheme.tokens.border,
                color: livePreviewTheme.tokens.textPrimary
              }}
            >
              {previewTab === 'feed' && (
                <div className="max-w-lg mx-auto space-y-4">
                  <div
                    className="p-5 border shadow-sm space-y-4"
                    style={{
                      backgroundColor: livePreviewTheme.tokens.surface,
                      borderColor: livePreviewTheme.tokens.border,
                      borderRadius: livePreviewTheme.tokens.cardRadius
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full p-0.5"
                          style={{ background: `linear-gradient(135deg, ${livePreviewTheme.tokens.primary}, ${livePreviewTheme.tokens.accent})` }}
                        >
                          <img
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                            alt="Creator"
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm" style={{ color: livePreviewTheme.tokens.textPrimary }}>Sarah Jenkins</h4>
                          <span className="text-xs" style={{ color: livePreviewTheme.tokens.textSecondary }}>@sarahdesign • 15m ago</span>
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: livePreviewTheme.tokens.softPrimary,
                          color: livePreviewTheme.tokens.primary
                        }}
                      >
                        VIP Update
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed" style={{ color: livePreviewTheme.tokens.textSecondary }}>
                      Excited to unveil our new masterclass series on UI tokens and responsive styling. Click below to download exclusive resources!
                    </p>

                    <div
                      className="p-4 rounded-xl text-center space-y-2 border"
                      style={{
                        backgroundColor: livePreviewTheme.tokens.surfaceSecondary,
                        borderColor: livePreviewTheme.tokens.border
                      }}
                    >
                      <span className="text-xs font-bold" style={{ color: livePreviewTheme.tokens.primary }}>
                        ✨ VIP Member Exclusive Download
                      </span>
                      <p className="text-[11px]" style={{ color: livePreviewTheme.tokens.textSecondary }}>
                        Available to active Pro Tier subscribers.
                      </p>
                      <button
                        className="px-4 py-2 text-xs font-bold text-white shadow-sm"
                        style={{
                          backgroundColor: livePreviewTheme.tokens.primary,
                          borderRadius: livePreviewTheme.tokens.buttonRadius
                        }}
                      >
                        Unlock Resource ($9.99/mo)
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3 text-xs" style={{ borderColor: livePreviewTheme.tokens.border }}>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 font-bold" style={{ color: livePreviewTheme.tokens.primary }}>
                          <Heart size={15} fill={livePreviewTheme.tokens.primary} /> 342
                        </span>
                        <span className="flex items-center gap-1" style={{ color: livePreviewTheme.tokens.textSecondary }}>
                          <MessageSquare size={15} /> 28
                        </span>
                      </div>
                      <span className="text-[11px]" style={{ color: livePreviewTheme.tokens.textMuted }}>1.2k views</span>
                    </div>
                  </div>
                </div>
              )}

              {previewTab === 'profile' && (
                <div className="max-w-xl mx-auto space-y-4">
                  <div
                    className="p-6 border shadow-sm space-y-4 text-center relative overflow-hidden"
                    style={{
                      backgroundColor: livePreviewTheme.tokens.surface,
                      borderColor: livePreviewTheme.tokens.border,
                      borderRadius: livePreviewTheme.tokens.cardRadius
                    }}
                  >
                    <div
                      className="w-20 h-20 rounded-full mx-auto p-1 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${livePreviewTheme.tokens.primary}, ${livePreviewTheme.tokens.accent})` }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                        alt="Creator"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-black text-lg" style={{ color: livePreviewTheme.tokens.textPrimary }}>Sarah Jenkins</h3>
                      <p className="text-xs" style={{ color: livePreviewTheme.tokens.textSecondary }}>UI/UX Design Engineering Educator</p>
                    </div>

                    <div className="flex items-center justify-center gap-6 py-2 border-y" style={{ borderColor: livePreviewTheme.tokens.border }}>
                      <div>
                        <p className="font-extrabold text-sm" style={{ color: livePreviewTheme.tokens.primary }}>14.2k</p>
                        <span className="text-[10px]" style={{ color: livePreviewTheme.tokens.textSecondary }}>Followers</span>
                      </div>
                      <div>
                        <p className="font-extrabold text-sm" style={{ color: livePreviewTheme.tokens.primary }}>840</p>
                        <span className="text-[10px]" style={{ color: livePreviewTheme.tokens.textSecondary }}>VIP Members</span>
                      </div>
                      <div>
                        <p className="font-extrabold text-sm" style={{ color: livePreviewTheme.tokens.primary }}>$12.99</p>
                        <span className="text-[10px]" style={{ color: livePreviewTheme.tokens.textSecondary }}>Starting/mo</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <button
                        className="px-5 py-2.5 text-xs font-bold text-white shadow-md"
                        style={{
                          backgroundColor: livePreviewTheme.tokens.primary,
                          borderRadius: livePreviewTheme.tokens.buttonRadius
                        }}
                      >
                        Subscribe to Tier
                      </button>
                      <button
                        className="px-4 py-2.5 text-xs font-bold border"
                        style={{
                          backgroundColor: livePreviewTheme.tokens.surface,
                          borderColor: livePreviewTheme.tokens.border,
                          color: livePreviewTheme.tokens.textPrimary,
                          borderRadius: livePreviewTheme.tokens.buttonRadius
                        }}
                      >
                        Tip Creator
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {previewTab === 'landing' && (
                <div className="max-w-2xl mx-auto text-center space-y-5 py-6">
                  <span
                    className="text-[11px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full border inline-block"
                    style={{
                      backgroundColor: livePreviewTheme.tokens.softPrimary,
                      borderColor: livePreviewTheme.tokens.border,
                      color: livePreviewTheme.tokens.primary
                    }}
                  >
                    🚀 Next-Gen Creator Platform
                  </span>
                  <h2 className="text-3xl font-black" style={{ color: livePreviewTheme.tokens.textPrimary }}>
                    Monetize Your Passion With Zero Code
                  </h2>
                  <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: livePreviewTheme.tokens.textSecondary }}>
                    Empower your community with recurring memberships, direct paywalled posts, and live vertical shorts.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      className="px-6 py-3 text-xs font-bold text-white shadow-lg"
                      style={{
                        backgroundColor: livePreviewTheme.tokens.primary,
                        borderRadius: livePreviewTheme.tokens.buttonRadius
                      }}
                    >
                      Get Started Free
                    </button>
                    <button
                      className="px-5 py-3 text-xs font-bold border"
                      style={{
                        backgroundColor: livePreviewTheme.tokens.surface,
                        borderColor: livePreviewTheme.tokens.border,
                        color: livePreviewTheme.tokens.textPrimary,
                        borderRadius: livePreviewTheme.tokens.buttonRadius
                      }}
                    >
                      Explore Creators
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F3DCE8] shrink-0">
              <span className="text-xs text-[#71717A]">
                Theme Category: <strong className="text-[#18181B]">{livePreviewTheme.category}</strong>
              </span>
              <Button variant="outline" size="sm" onClick={() => setLivePreviewTheme(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: THEME CUSTOMIZER MODAL */}
      {customizerTheme && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-[#F3DCE8] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#18181B] flex items-center gap-2">
                  <Sliders size={18} className="text-[#EC4899]" />
                  <span>Customize Theme: {customizerTheme.name}</span>
                </h3>
                <p className="text-xs text-[#71717A]">Fine-tune branding, design tokens, and layout geometry</p>
              </div>
              <button
                onClick={() => setCustomizerTheme(null)}
                className="p-1 rounded-xl text-[#71717A] hover:text-[#18181B] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] space-y-3">
                <h4 className="font-bold text-xs text-[#18181B] flex items-center gap-2">
                  <ImageIcon size={14} className="text-[#EC4899]" />
                  <span>Brand Assets</span>
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block font-bold text-[#18181B] mb-1">Custom Logo URL (Optional)</label>
                    <input
                      type="text"
                      value={customLogoUrl}
                      onChange={(e) => setCustomLogoUrl(e.target.value)}
                      placeholder="https://yourdomain.com/logo.svg"
                      className="w-full bg-white border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#18181B] flex items-center gap-2">
                  <Palette size={14} className="text-[#EC4899]" />
                  <span>Color Tokens</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#18181B] mb-1">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customPrimary}
                        onChange={(e) => setCustomPrimary(e.target.value)}
                        className="w-9 h-9 rounded-xl border border-[#F3DCE8] cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={customPrimary}
                        onChange={(e) => setCustomPrimary(e.target.value)}
                        className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#18181B] mb-1">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customAccent}
                        onChange={(e) => setCustomAccent(e.target.value)}
                        className="w-9 h-9 rounded-xl border border-[#F3DCE8] cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={customAccent}
                        onChange={(e) => setCustomAccent(e.target.value)}
                        className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#18181B] mb-1">Canvas Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customBg}
                        onChange={(e) => setCustomBg(e.target.value)}
                        className="w-9 h-9 rounded-xl border border-[#F3DCE8] cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={customBg}
                        onChange={(e) => setCustomBg(e.target.value)}
                        className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#18181B] mb-1">Card Surface</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customSurface}
                        onChange={(e) => setCustomSurface(e.target.value)}
                        className="w-9 h-9 rounded-xl border border-[#F3DCE8] cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={customSurface}
                        onChange={(e) => setCustomSurface(e.target.value)}
                        className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#18181B] flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-[#EC4899]" />
                  <span>Geometry & Layout Width</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#18181B] mb-1">Card Radius ({customCardRadius})</label>
                    <input
                      type="range"
                      min="8"
                      max="32"
                      step="2"
                      value={parseInt(customCardRadius) || 20}
                      onChange={(e) => setCustomCardRadius(`${e.target.value}px`)}
                      className="w-full accent-[#EC4899] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#18181B] mb-1">Button Radius ({customButtonRadius})</label>
                    <input
                      type="range"
                      min="6"
                      max="24"
                      step="2"
                      value={parseInt(customButtonRadius) || 14}
                      onChange={(e) => setCustomButtonRadius(`${e.target.value}px`)}
                      className="w-full accent-[#EC4899] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#18181B] mb-1">Container Width</label>
                    <select
                      value={customContainerWidth}
                      onChange={(e) => setCustomContainerWidth(e.target.value as any)}
                      className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 font-medium"
                    >
                      <option value="max-w-6xl">Compact (max-w-6xl)</option>
                      <option value="max-w-7xl">Standard (max-w-7xl)</option>
                      <option value="max-w-full">Fluid Full Width</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#18181B] mb-1">Button Visual Style</label>
                    <select
                      value={customButtonStyle}
                      onChange={(e) => setCustomButtonStyle(e.target.value as any)}
                      className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 font-medium"
                    >
                      <option value="gradient-glow">Glow Gradient</option>
                      <option value="flat-solid">Flat Solid</option>
                      <option value="soft-glass">Soft Glass</option>
                      <option value="outline-neo">Outline Neo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3DCE8]">
              <Button variant="ghost" size="sm" onClick={() => setCustomizerTheme(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveCustomization}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: SPECS & CHANGELOG MODAL */}
      {selectedThemeForDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#F3DCE8] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#18181B]">{selectedThemeForDetails.name}</h3>
                <p className="text-xs text-[#71717A]">Version {selectedThemeForDetails.version} • By {selectedThemeForDetails.author}</p>
              </div>
              <button
                onClick={() => setSelectedThemeForDetails(null)}
                className="p-1 rounded-xl text-[#71717A] hover:text-[#18181B]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-[#71717A] leading-relaxed font-medium">{selectedThemeForDetails.description}</p>

              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] space-y-2">
                <h4 className="font-bold text-[#18181B]">SDK Manifest Specifications</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#A1A1AA] block">Theme ID:</span>
                    <span className="font-mono text-[#18181B] font-bold">{selectedThemeForDetails.id}</span>
                  </div>
                  <div>
                    <span className="text-[#A1A1AA] block">Min App Version:</span>
                    <span className="font-mono text-[#18181B] font-bold">v{selectedThemeForDetails.minAppVersion}</span>
                  </div>
                  <div>
                    <span className="text-[#A1A1AA] block">Category:</span>
                    <span className="font-bold text-[#BE185D]">{selectedThemeForDetails.category}</span>
                  </div>
                  <div>
                    <span className="text-[#A1A1AA] block">Color Mode:</span>
                    <span className="font-bold text-[#18181B]">{selectedThemeForDetails.tokens.isDark ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#18181B] mb-2">Version Changelog</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedThemeForDetails.changelog.map((c) => (
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
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#F3DCE8]">
              <Button variant="outline" size="sm" onClick={() => setSelectedThemeForDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: UPLOAD THEME PACKAGE (.ZIP / JSON) */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#F3DCE8] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#18181B] flex items-center gap-2">
                  <Upload size={18} className="text-[#EC4899]" />
                  <span>Upload Theme Package (.ZIP / JSON)</span>
                </h3>
                <p className="text-xs text-[#71717A]">Install custom public themes via JSON manifest or ZIP file</p>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-xl text-[#71717A] hover:text-[#18181B]"
              >
                <X size={18} />
              </button>
            </div>

            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Frontend theme package verified! Sending to Activation...</span>
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
                  onChange={handleUploadFile}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] text-[#EC4899] flex items-center justify-center mx-auto">
                  <Upload size={22} />
                </div>
                <p className="font-bold text-[#18181B]">Click to browse or drop theme JSON/ZIP here</p>
                <p className="text-[11px] text-[#71717A]">Manifest compliant with Theme SDK v1.0 standard</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#18181B]">Or Paste Raw Theme JSON Manifest:</label>
                <textarea
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  rows={4}
                  placeholder={`{\n  "id": "theme-custom-style",\n  "name": "Custom Style",\n  "version": "1.0.0",\n  "tokens": { "primary": "#EC4899", "background": "#FFF9FC", "surface": "#FFFFFF" }\n}`}
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

      {/* MODAL 7: DEVELOPER SDK DOCS */}
      {isDocsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#F3DCE8] shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FCE7F3] text-[#EC4899] flex items-center justify-center font-bold">
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#18181B]">Theme SDK v1.0 Developer Guide</h3>
                  <p className="text-xs text-[#71717A]">Authoring custom frontend themes for CreatorPulse</p>
                </div>
              </div>
              <button
                onClick={() => setIsDocsOpen(false)}
                className="p-1 rounded-xl text-[#71717A] hover:text-[#18181B]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1 leading-relaxed">
              <div>
                <h4 className="font-bold text-[#18181B] text-sm mb-1">Standard Manifest Structure (`theme.json`)</h4>
                <p className="text-[#71717A]">
                  Every theme package is packaged as a `.zip` or `.json` file containing design tokens and layout geometry rules.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 text-pink-200 rounded-2xl font-mono text-[11px] space-y-1">
                <p className="text-[#A1A1AA]">// Example theme.json</p>
                <p>{`{`}</p>
                <p className="pl-3">{`"id": "theme-custom-glow",`}</p>
                <p className="pl-3">{`"name": "Custom Glow",`}</p>
                <p className="pl-3">{`"version": "1.0.0",`}</p>
                <p className="pl-3">{`"minAppVersion": "1.0.0",`}</p>
                <p className="pl-3">{`"requiresLicense": true,`}</p>
                <p className="pl-3">{`"tokens": {`}</p>
                <p className="pl-6">{`"primary": "#EC4899",`}</p>
                <p className="pl-6">{`"background": "#FFF9FC",`}</p>
                <p className="pl-6">{`"surface": "#FFFFFF",`}</p>
                <p className="pl-6">{`"cardRadius": "20px"`}</p>
                <p className="pl-3">{`},`}</p>
                <p className="pl-3">{`"settings": {`}</p>
                <p className="pl-6">{`"containerWidth": "max-w-7xl",`}</p>
                <p className="pl-6">{`"buttonStyle": "gradient-glow"`}</p>
                <p className="pl-3">{`}`}</p>
                <p>{`}`}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#18181B]">Theming Rules & Admin Isolation</h4>
                <ul className="list-disc list-inside text-[#71717A] space-y-1">
                  <li><strong className="text-[#18181B]">Frontend Scoped:</strong> Themes exclusively control landing pages, user feeds, creator profiles, reels, and member portals.</li>
                  <li><strong className="text-[#18181B]">Admin Panel Immune:</strong> The Admin Panel is permanently sandboxed to administrative tokens and never affected by theme changes.</li>
                  <li><strong className="text-[#18181B]">Rollback Safe:</strong> If an invalid token or missing property is detected, the engine safely rolls back to Blush Core.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F3DCE8] shrink-0">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Download size={13} />}
                onClick={handleDownloadStarter}
              >
                Download Starter Theme Template
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsDocsOpen(false)}>
                Close Docs
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
