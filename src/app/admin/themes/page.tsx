'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Palette, Upload, Sparkles, Check, Download, RotateCcw, 
  Trash2, Sliders, ExternalLink, ShieldCheck, Info, X, CheckCircle2, 
  AlertTriangle, Layers, Eye, Monitor, Smartphone, User, Lock, Heart, MessageSquare, Star
} from 'lucide-react';
import { useTheme } from '@/lib/extensions/theme-engine';
import { ThemeManifest } from '@/lib/extensions/theme-types';
import { validateThemePackage } from '@/lib/extensions/package-installer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AdminThemesPage() {
  const { 
    themes, 
    activeTheme, 
    activateTheme, 
    installTheme, 
    deleteTheme, 
    customizeTheme, 
    rollbackTheme, 
    exportTheme 
  } = useTheme();

  const [selectedThemeForDetails, setSelectedThemeForDetails] = useState<ThemeManifest | null>(null);
  const [customizerTheme, setCustomizerTheme] = useState<ThemeManifest | null>(null);
  const [livePreviewTheme, setLivePreviewTheme] = useState<ThemeManifest | null>(null);
  const [previewTab, setPreviewTab] = useState<'feed' | 'profile' | 'landing'>('feed');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Customizer state
  const [customPrimary, setCustomPrimary] = useState(activeTheme.tokens.primary);
  const [customAccent, setCustomAccent] = useState(activeTheme.tokens.accent);
  const [customBg, setCustomBg] = useState(activeTheme.tokens.background);
  const [customSurface, setCustomSurface] = useState(activeTheme.tokens.surface);
  const [customRadius, setCustomRadius] = useState(activeTheme.tokens.cardRadius || '20px');

  const openCustomizer = (theme: ThemeManifest) => {
    setCustomizerTheme(theme);
    setCustomPrimary(theme.tokens.primary);
    setCustomAccent(theme.tokens.accent);
    setCustomBg(theme.tokens.background);
    setCustomSurface(theme.tokens.surface);
    setCustomRadius(theme.tokens.cardRadius || '20px');
  };

  const handleSaveCustomization = () => {
    if (!customizerTheme) return;
    customizeTheme(customizerTheme.id, {
      primary: customPrimary,
      primaryHover: customPrimary,
      accent: customAccent,
      background: customBg,
      surface: customSurface,
      cardRadius: customRadius
    });
    setCustomizerTheme(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        installTheme(result.theme);
        setUploadSuccess(true);
        setTimeout(() => {
          setIsUploadOpen(false);
          setUploadSuccess(false);
        }, 1200);
      } catch (err) {
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
      installTheme(result.theme);
      setUploadSuccess(true);
      setTimeout(() => {
        setIsUploadOpen(false);
        setUploadSuccess(false);
        setUploadText('');
      }, 1200);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Unknown syntax error';
      setUploadError('JSON syntax error: ' + errMsg);
    }
  };

  const handleExportTheme = (theme: ThemeManifest) => {
    const jsonStr = exportTheme(theme.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.slug}-frontend-theme-v${theme.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3DCE8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="text-[#EC4899]" size={24} />
            <h1 className="text-2xl font-black text-[#18181B]">Frontend Theme System</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Control the visual appearance of public landing pages, user feeds, creator profiles, reels, and member dashboards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Upload size={14} />}
            onClick={() => setIsUploadOpen(true)}
          >
            Upload Theme (ZIP / JSON)
          </Button>
        </div>
      </div>

      {/* Admin Panel Isolation Guarantee Banner */}
      <div className="p-4 bg-white border border-[#F3DCE8] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#18181B] flex items-center gap-2">
              <span>Admin Panel Isolation Guarantee</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                Protected & Locked
              </span>
            </h4>
            <p className="text-[11px] text-[#71717A] mt-0.5">
              Frontend themes exclusively modify public website styling, creator profiles, and member portals. The Admin Panel is strictly isolated and maintains its dedicated control room layout.
            </p>
          </div>
        </div>

        <Link href="/feed" target="_blank" className="shrink-0">
          <Button variant="outline" size="sm" leftIcon={<ExternalLink size={13} />}>
            Open Public Website
          </Button>
        </Link>
      </div>

      {/* Active Frontend Theme Banner */}
      <Card className="p-6 bg-gradient-to-br from-white to-[#FFF1F7] border border-[#F3DCE8] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-[#F3DCE8] shadow-md">
              <img src={activeTheme.previewImageUrl} alt={activeTheme.name} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FCE7F3] text-[#BE185D] px-2.5 py-0.5 rounded-full border border-[#FBCFE8]">
                  Active Frontend Theme
                </span>
                <Badge variant="emerald" size="sm">v{activeTheme.version}</Badge>
              </div>
              <h2 className="text-xl font-black text-[#18181B]">{activeTheme.name}</h2>
              <p className="text-xs text-[#71717A] max-w-xl leading-relaxed font-medium">{activeTheme.description}</p>
            </div>
          </div>

          {/* Palette Swatches */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#F3DCE8] shadow-xs">
            <div className="text-center">
              <div className="w-8 h-8 rounded-xl border border-black/10 shadow-xs" style={{ backgroundColor: activeTheme.tokens.primary }}></div>
              <span className="text-[9px] text-[#71717A] font-bold block mt-1">Primary</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-xl border border-black/10 shadow-xs" style={{ backgroundColor: activeTheme.tokens.accent }}></div>
              <span className="text-[9px] text-[#71717A] font-bold block mt-1">Accent</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-xl border border-black/10 shadow-xs" style={{ backgroundColor: activeTheme.tokens.background }}></div>
              <span className="text-[9px] text-[#71717A] font-bold block mt-1">Canvas</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-xl border border-black/10 shadow-xs" style={{ backgroundColor: activeTheme.tokens.surface }}></div>
              <span className="text-[9px] text-[#71717A] font-bold block mt-1">Card</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye size={14} className="text-[#EC4899]" />}
              onClick={() => setLivePreviewTheme(activeTheme)}
              className="ml-2"
            >
              Live Preview
            </Button>
          </div>
        </div>
      </Card>

      {/* Installed Themes Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-[#18181B] flex items-center gap-2">
            <Layers size={18} className="text-[#EC4899]" />
            <span>Installed Frontend Themes ({themes.length})</span>
          </h3>
          <span className="text-xs text-[#71717A] font-medium">Activate to update public visitor and member styling</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => {
            const isActive = theme.id === activeTheme.id;
            return (
              <Card
                key={theme.id}
                className={`p-0 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-[#EC4899]/10 ${
                  isActive ? 'border-2 border-[#EC4899] ring-2 ring-[#EC4899]/20' : 'hover:border-[#F472B6]/50'
                }`}
              >
                {/* Thumbnail Header */}
                <div className="relative h-36 w-full overflow-hidden bg-slate-900 group">
                  <img
                    src={theme.previewImageUrl}
                    alt={theme.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {theme.category}
                    </span>
                    {theme.isCustom && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EC4899] text-white">
                        Custom
                      </span>
                    )}
                  </div>

                  {isActive && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EC4899] text-white text-[11px] font-extrabold shadow-lg shadow-[#EC4899]/40">
                      <Check size={12} strokeWidth={3} /> Active Frontend Theme
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

                {/* Body Details */}
                <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-[#71717A] leading-relaxed line-clamp-2 font-medium">{theme.description}</p>

                  {/* Token Color Bar Preview */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="h-4 flex-1 rounded-md" style={{ backgroundColor: theme.tokens.primary }} title={`Primary: ${theme.tokens.primary}`} />
                    <div className="h-4 flex-1 rounded-md" style={{ backgroundColor: theme.tokens.accent }} title={`Accent: ${theme.tokens.accent}`} />
                    <div className="h-4 flex-1 rounded-md border border-[#F3DCE8]" style={{ backgroundColor: theme.tokens.background }} title={`Background: ${theme.tokens.background}`} />
                    <div className="h-4 flex-1 rounded-md border border-[#F3DCE8]" style={{ backgroundColor: theme.tokens.surface }} title={`Surface: ${theme.tokens.surface}`} />
                    <span className="text-[10px] text-[#A1A1AA] font-mono ml-1">{theme.tokens.isDark ? '🌙 Dark' : '☀️ Light'}</span>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#F3DCE8]">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setLivePreviewTheme(theme)}
                        className="p-2 rounded-xl text-[#71717A] hover:text-[#EC4899] hover:bg-[#FFF1F7] transition-colors cursor-pointer"
                        title="Live Frontend Preview"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openCustomizer(theme)}
                        className="p-2 rounded-xl text-[#71717A] hover:text-[#EC4899] hover:bg-[#FFF1F7] transition-colors cursor-pointer"
                        title="Customize Tokens"
                      >
                        <Sliders size={15} />
                      </button>
                      <button
                        onClick={() => handleExportTheme(theme)}
                        className="p-2 rounded-xl text-[#71717A] hover:text-[#EC4899] hover:bg-[#FFF1F7] transition-colors cursor-pointer"
                        title="Export JSON"
                      >
                        <Download size={15} />
                      </button>
                      <button
                        onClick={() => setSelectedThemeForDetails(theme)}
                        className="p-2 rounded-xl text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7] transition-colors cursor-pointer"
                        title="Changelog & Details"
                      >
                        <Info size={15} />
                      </button>
                      {theme.isCustom && (
                        <button
                          onClick={() => deleteTheme(theme.id)}
                          className="p-2 rounded-xl text-[#71717A] hover:text-[#F43F5E] hover:bg-[#FFE4E6] transition-colors cursor-pointer"
                          title="Delete Theme"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    {!isActive ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => activateTheme(theme.id)}
                      >
                        Activate Theme
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rollbackTheme(theme.id)}
                        leftIcon={<RotateCcw size={12} />}
                      >
                        Reset Defaults
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Interactive Frontend Live Preview Modal */}
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
                    Simulating public website appearance under {livePreviewTheme.name} tokens
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLivePreviewTheme(null)}
                  className="p-1.5 rounded-xl text-[#71717A] hover:text-[#18181B] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
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
                    activateTheme(livePreviewTheme.id);
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
                  {/* Simulated Post Card */}
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
                  {/* Creator Cover & Profile Card */}
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

      {/* Live Customizer Modal */}
      {customizerTheme && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#F3DCE8] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#18181B] flex items-center gap-2">
                  <Sliders size={18} className="text-[#EC4899]" />
                  <span>Customize Frontend Tokens: {customizerTheme.name}</span>
                </h3>
                <p className="text-xs text-[#71717A]">Fine-tune public palette, canvas, and card radius</p>
              </div>
              <button
                onClick={() => setCustomizerTheme(null)}
                className="p-1 rounded-xl text-[#71717A] hover:text-[#18181B] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div>
                <label className="block font-bold text-[#18181B] mb-1">Card Border Radius ({customRadius})</label>
                <input
                  type="range"
                  min="8"
                  max="32"
                  step="2"
                  value={parseInt(customRadius) || 20}
                  onChange={(e) => setCustomRadius(`${e.target.value}px`)}
                  className="w-full accent-[#EC4899] cursor-pointer"
                />
              </div>

              {/* Real-time Preview Mock Card */}
              <div
                className="p-4 border transition-all space-y-2"
                style={{
                  backgroundColor: customSurface,
                  borderColor: customPrimary,
                  borderRadius: customRadius
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs" style={{ color: customPrimary }}>Live Token Preview</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold" style={{ backgroundColor: customAccent }}>
                    Accent Badge
                  </span>
                </div>
                <p className="text-[11px] text-[#71717A]">
                  This preview renders in real time using the updated CSS color and corner tokens.
                </p>
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

      {/* Details & Changelog Modal */}
      {selectedThemeForDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#F3DCE8] shadow-2xl p-6 space-y-4">
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

            <div className="space-y-3 text-xs">
              <p className="text-[#71717A] leading-relaxed font-medium">{selectedThemeForDetails.description}</p>

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

      {/* Upload Theme Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#F3DCE8] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#18181B] flex items-center gap-2">
                  <Upload size={18} className="text-[#EC4899]" />
                  <span>Upload Frontend Theme Package</span>
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
                <span>Frontend theme package verified and installed successfully!</span>
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
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] text-[#EC4899] flex items-center justify-center mx-auto">
                  <Upload size={22} />
                </div>
                <p className="font-bold text-[#18181B]">Click to browse or drop theme JSON/ZIP here</p>
                <p className="text-[11px] text-[#71717A]">Valid formats: theme.json, package.zip (manifest-compliant)</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#18181B]">Or Paste Raw Theme JSON Manifest:</label>
                <textarea
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  rows={4}
                  placeholder={`{\n  "name": "Custom Glow",\n  "version": "1.0.0",\n  "tokens": { "primary": "#EC4899", "background": "#FFF9FC", "surface": "#FFFFFF" }\n}`}
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
    </div>
  );
}
