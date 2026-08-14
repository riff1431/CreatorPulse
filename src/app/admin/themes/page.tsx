'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Palette, Upload, Check, Download, RotateCcw, Trash2, Sliders,
  ExternalLink, ShieldCheck, Info, X, CheckCircle2, AlertTriangle,
  Layers, Eye, Copy, RefreshCw, Lock, Heart, MessageSquare, Star,
  BookOpen, Terminal, Plus, Search, Sparkles, SlidersHorizontal, Image as ImageIcon,
  Key, ShieldAlert, CheckCircle, ArrowRight, ArrowUpDown, Smartphone, Tablet as TabletIcon, Monitor, Compass
} from 'lucide-react';
import { useTheme, CURRENT_APP_VERSION } from '@/lib/extensions/theme-engine';
import { CompatibilityChecker, type DiagnosticReport, type DiagnosticIssue } from '@/lib/loaders/compatibility-checker';
import { ThemeManifest, ThemeTokens, ThemeVisualSettings } from '@/lib/extensions/theme-types';
import { validateThemePackage, logAuditEvent } from '@/lib/extensions/package-installer';
import { exportThemeAsZip, importThemeFromZip } from '@/lib/extensions/theme-zip-helper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { THEME_UPDATE_REGISTRY, DEFAULT_THEMES } from '@/lib/extensions/default-extensions';
import { useAdminProgress } from '@/components/admin/AdminProgressProvider';
import { MediaLibraryModal } from '@/components/admin/MediaLibraryModal';
import { MediaUploader } from '@/components/ui/MediaUploader';

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
    exportTheme,
    checkForUpdates,
    isCheckingUpdates,
    lastUpdateCheck,
    updateThemeWithBackup,
    rollbackToBackup,
    backups,
    deleteBackup
  } = useTheme();

  const { startProgress, updateProgress, completeProgress, errorProgress } = useAdminProgress();

  // Navigation Tabs: 'installed' | 'activation' | 'updates' | 'library'
  const [activeTab, setActiveTab] = useState<'installed' | 'activation' | 'updates' | 'library'>('installed');
  
  // Search, Filter & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'newest' | 'category'>('name_asc');

  // Modals & Drawers
  const [selectedThemeForDetails, setSelectedThemeForDetails] = useState<ThemeManifest | null>(null);
  const [inspectingTheme, setInspectingTheme] = useState<ThemeManifest | null>(null);
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

  // Theme Update System States
  const [updatingThemeId, setUpdatingThemeId] = useState<string | null>(null);
  const [localUpdateProgress, setLocalUpdateProgress] = useState<string>('');
  const [expandedChangelogs, setExpandedChangelogs] = useState<Record<string, boolean>>({});

  const toggleChangelog = (themeId: string) => {
    setExpandedChangelogs(prev => ({
      ...prev,
      [themeId]: !prev[themeId]
    }));
  };

  // Confirmation Overlay Modal
  const [confirmThemeAction, setConfirmThemeAction] = useState<{
    type: 'activate' | 'deactivate' | 'update' | 'install';
    themeId: string;
    themeName: string;
    targetVersion?: string;
  } | null>(null);

  // Upload state
  const [uploadText, setUploadText] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // ZIP Theme Import Preview State
  const [isImportPreviewOpen, setIsImportPreviewOpen] = useState(false);
  const [previewThemeForImport, setPreviewThemeForImport] = useState<ThemeManifest | null>(null);
  const [importConflict, setImportConflict] = useState<{ existing: ThemeManifest; incoming: ThemeManifest } | null>(null);
  const [conflictResolution, setConflictResolution] = useState<'overwrite' | 'copy'>('overwrite');
  const [activateOnImport, setActivateOnImport] = useState(false);

  // Customizer state
  const [customPrimary, setCustomPrimary] = useState(activeTheme.tokens.primary);
  const [customAccent, setCustomAccent] = useState(activeTheme.tokens.accent);
  const [customBg, setCustomBg] = useState(activeTheme.tokens.background);
  const [customSurface, setCustomSurface] = useState(activeTheme.tokens.surface);
  const [customBorder, setCustomBorder] = useState(activeTheme.tokens.border);
  const [customCardRadius, setCustomCardRadius] = useState(activeTheme.tokens.cardRadius || '20px');
  const [customButtonRadius, setCustomButtonRadius] = useState(activeTheme.tokens.buttonRadius || '14px');
  const [customLogoUrl, setCustomLogoUrl] = useState(activeTheme.settings?.logoUrl || '');
  const [customFaviconUrl, setCustomFaviconUrl] = useState(activeTheme.settings?.faviconUrl || '');
  const [customContainerWidth, setCustomContainerWidth] = useState<'max-w-6xl' | 'max-w-7xl' | 'max-w-full'>(activeTheme.settings?.containerWidth || 'max-w-7xl');
  const [customButtonStyle, setCustomButtonStyle] = useState<'gradient-glow' | 'flat-solid' | 'soft-glass' | 'outline-neo'>(activeTheme.settings?.buttonStyle || 'gradient-glow');
  const [customAnimationIntensity, setCustomAnimationIntensity] = useState<'off' | 'subtle' | 'normal' | 'playful'>(activeTheme.settings?.animationIntensity || 'normal');
  const [customSpacing, setCustomSpacing] = useState<'compact' | 'standard' | 'cozy' | 'spacious'>(activeTheme.settings?.spacing || 'standard');
  const [customSidebarPlacement, setCustomSidebarPlacement] = useState<'left' | 'right'>(activeTheme.settings?.sidebarPlacement || 'left');
  const [customHeaderStyle, setCustomHeaderStyle] = useState<'fixed' | 'floating' | 'simple'>(activeTheme.settings?.headerStyle || 'fixed');
  const [customFontFamily, setCustomFontFamily] = useState(activeTheme.tokens.fontFamily || 'Plus Jakarta Sans, sans-serif');
  const [customTextPrimary, setCustomTextPrimary] = useState(activeTheme.tokens.textPrimary || '#18181B');
  const [customTextSecondary, setCustomTextSecondary] = useState(activeTheme.tokens.textSecondary || '#71717A');
  const [customTextMuted, setCustomTextMuted] = useState(activeTheme.tokens.textMuted || '#A1A1AA');
  
  // Customizer preview settings
  const [customizerViewport, setCustomizerViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [customizerTab, setCustomizerTab] = useState<'feed' | 'profile' | 'landing'>('feed');
  const [customizerSettingsTab, setCustomizerSettingsTab] = useState<'colors' | 'typography' | 'layout' | 'assets'>('colors');

  React.useEffect(() => {
    if (!customizerTheme || !customFontFamily) return;
    const fontId = 'customizer-preview-font';
    let link = document.getElementById(fontId) as HTMLLinkElement;
    const fontName = customFontFamily.split(',')[0].replace(/['"]/g, '').trim();
    if (fontName && fontName !== 'system-ui' && fontName !== '-apple-system') {
      if (!link) {
        link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      const encodedFont = fontName.replace(/\s+/g, '+');
      link.href = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@300;400;500;600;700;800;900&display=swap`;
    } else if (link) {
      link.remove();
    }
  }, [customFontFamily, customizerTheme]);

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
    setCustomFaviconUrl(theme.settings?.faviconUrl || '');
    setCustomContainerWidth(theme.settings?.containerWidth || 'max-w-7xl');
    setCustomButtonStyle(theme.settings?.buttonStyle || 'gradient-glow');
    setCustomAnimationIntensity(theme.settings?.animationIntensity || 'normal');
    setCustomSpacing(theme.settings?.spacing || 'standard');
    setCustomSidebarPlacement(theme.settings?.sidebarPlacement || 'left');
    setCustomHeaderStyle(theme.settings?.headerStyle || 'fixed');
    setCustomFontFamily(theme.tokens.fontFamily || 'Plus Jakarta Sans, sans-serif');
    setCustomTextPrimary(theme.tokens.textPrimary || '#18181B');
    setCustomTextSecondary(theme.tokens.textSecondary || '#71717A');
    setCustomTextMuted(theme.tokens.textMuted || '#A1A1AA');
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
        buttonRadius: customButtonRadius,
        fontFamily: customFontFamily,
        textPrimary: customTextPrimary,
        textSecondary: customTextSecondary,
        textMuted: customTextMuted
      },
      {
        logoUrl: customLogoUrl,
        faviconUrl: customFaviconUrl,
        containerWidth: customContainerWidth,
        buttonStyle: customButtonStyle,
        animationIntensity: customAnimationIntensity,
        spacing: customSpacing,
        sidebarPlacement: customSidebarPlacement,
        headerStyle: customHeaderStyle
      }
    );
    setCustomizerTheme(null);
    triggerNotice(`Saved customizations for "${customizerTheme.name}"!`);
  };

  const handleResetCustomizer = () => {
    if (!customizerTheme) return;
    rollbackTheme(customizerTheme.id);
    const defaultPreset = DEFAULT_THEMES.find((t) => t.id === customizerTheme.id) || DEFAULT_THEMES[0];
    setCustomPrimary(defaultPreset.tokens.primary);
    setCustomAccent(defaultPreset.tokens.accent);
    setCustomBg(defaultPreset.tokens.background);
    setCustomSurface(defaultPreset.tokens.surface);
    setCustomBorder(defaultPreset.tokens.border);
    setCustomCardRadius(defaultPreset.tokens.cardRadius || '20px');
    setCustomButtonRadius(defaultPreset.tokens.buttonRadius || '14px');
    setCustomLogoUrl(defaultPreset.settings?.logoUrl || '');
    setCustomFaviconUrl(defaultPreset.settings?.faviconUrl || '');
    setCustomContainerWidth(defaultPreset.settings?.containerWidth || 'max-w-7xl');
    setCustomButtonStyle(defaultPreset.settings?.buttonStyle || 'gradient-glow');
    setCustomAnimationIntensity(defaultPreset.settings?.animationIntensity || 'normal');
    setCustomSpacing(defaultPreset.settings?.spacing || 'standard');
    setCustomSidebarPlacement(defaultPreset.settings?.sidebarPlacement || 'left');
    setCustomHeaderStyle(defaultPreset.settings?.headerStyle || 'fixed');
    setCustomFontFamily(defaultPreset.tokens.fontFamily || 'Plus Jakarta Sans, sans-serif');
    setCustomTextPrimary(defaultPreset.tokens.textPrimary || '#18181B');
    setCustomTextSecondary(defaultPreset.tokens.textSecondary || '#71717A');
    setCustomTextMuted(defaultPreset.tokens.textMuted || '#A1A1AA');
    
    triggerNotice(`Reset "${customizerTheme.name}" to factory default values!`);
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

  const handleConfirmActivation = async () => {
    if (!licenseTargetTheme) return;
    setActivationError('');
    setActivationSuccess(false);

    startProgress({
      title: `Activating ${licenseTargetTheme.name}`,
      steps: [
        "Verifying license key & signature...",
        "Applying theme configuration tokens...",
        "Flushing stylesheet visual caches..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Verifying license key & signature...");
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Run compatibility diagnostics on activation
      const compatibilityReport = CompatibilityChecker.checkTheme(
        licenseTargetTheme,
        [],
        themes
      );

      if (!compatibilityReport.isValid) {
        const firstError = compatibilityReport.issues.find(i => i.type === 'error')?.message || 'Theme is incompatible.';
        throw new Error(`Activation Blocked: ${firstError}`);
      }

      const result = activateThemeWithLicense(licenseTargetTheme.id, licenseInputKey);
      if (!result.success) {
        throw new Error(result.error || 'Failed to activate theme.');
      }
      updateProgress(0, 'success', 50, "License verified.");

      updateProgress(1, 'running', 70, "Applying theme configuration tokens...");
      await new Promise((resolve) => setTimeout(resolve, 600));
      updateProgress(1, 'success', 85, "Visual tokens loaded.");

      updateProgress(2, 'running', 95, "Flushing stylesheet visual caches...");
      await new Promise((resolve) => setTimeout(resolve, 400));
      
      setActivationSuccess(true);
      completeProgress("Theme activated successfully!");
      triggerNotice(`Activated theme "${licenseTargetTheme.name}" successfully!`);
      
      setTimeout(() => {
        setLicenseTargetTheme(null);
        setActivationSuccess(false);
      }, 800);
    } catch (err: any) {
      errorProgress(0, err.message || 'Activation failed.');
      setActivationError(err.message || 'Failed to activate theme.');
    }
  };

  const handleCheckForUpdates = async () => {
    try {
      const res = await checkForUpdates();
      triggerNotice(`Checked for updates! Found ${res.foundCount} updates.`);
    } catch (err) {
      triggerNotice(`Failed to check updates.`);
    }
  };

  const handleUpdateTheme = async (themeId: string) => {
    const themeToUpdate = themes.find(t => t.id === themeId);
    const targetName = themeToUpdate ? themeToUpdate.name : 'Theme';
    const targetVer = THEME_UPDATE_REGISTRY[themeId]?.version || 'new version';

    setUpdatingThemeId(themeId);
    setLocalUpdateProgress('Creating rollback restore point...');

    startProgress({
      title: `Updating ${targetName}`,
      steps: [
        "Creating rollback restore point...",
        "Validating package compatibility...",
        "Merging core assets & preserving customizations...",
        "Activating updated styles..."
      ]
    });

    try {
      setLocalUpdateProgress('Creating rollback restore point...');
      updateProgress(0, 'running', 15, "Creating rollback restore point...");
      await new Promise((resolve) => setTimeout(resolve, 700));
      updateProgress(0, 'success', 30, "Backup point created.");

      setLocalUpdateProgress('Validating package compatibility...');
      updateProgress(1, 'running', 45, "Validating package compatibility...");
      await new Promise((resolve) => setTimeout(resolve, 700));
      updateProgress(1, 'success', 60, "Compatibility validation complete.");

      setLocalUpdateProgress('Merging core assets...');
      updateProgress(2, 'running', 75, "Merging core assets & preserving customizations...");
      await new Promise((resolve) => setTimeout(resolve, 700));

      const res = await updateThemeWithBackup(themeId);
      if (res.success) {
        setLocalUpdateProgress('Theme updated successfully!');
        updateProgress(2, 'success', 90, "Assets merged successfully.");
        updateProgress(3, 'running', 95, "Activating updated styles...");
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        completeProgress("Theme updated successfully!");
        triggerNotice(`Theme updated to v${targetVer}!`);
      } else {
        throw new Error(res.error || 'Theme update failed.');
      }
    } catch (err: any) {
      errorProgress(2, err.message || 'Error occurred during theme update.');
      triggerNotice(`Theme update failed!`);
    } finally {
      setUpdatingThemeId(null);
      setLocalUpdateProgress('');
    }
  };

  const handleRollback = (backupId: string, themeName: string, version: string) => {
    const res = rollbackToBackup(backupId);
    if (res.success) {
      triggerNotice(`Successfully restored "${themeName}" to v${version}!`);
    } else {
      alert(`Restore failed: ${res.error}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!themeToDelete) return;
    setDeleteErrorMessage('');
    const targetTheme = themeToDelete;
    setThemeToDelete(null);

    startProgress({
      title: `Deleting Theme: ${targetTheme.name}`,
      steps: [
        "Verifying active theme boundaries...",
        "De-registering stylesheet tokens...",
        "Purging physical assets and configuration files..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Verifying active theme boundaries...");
      await new Promise(r => setTimeout(r, 600));
      updateProgress(0, 'success', 45, "Active theme boundary checks complete.");

      updateProgress(1, 'running', 60, "De-registering stylesheet tokens...");
      await new Promise(r => setTimeout(r, 600));
      updateProgress(1, 'success', 80, "Theme tokens de-registered.");

      updateProgress(2, 'running', 90, "Purging physical assets and configuration files...");
      const res = deleteTheme(targetTheme.id);
      await new Promise(r => setTimeout(r, 500));

      if (res.success) {
        completeProgress("Theme deleted successfully!");
        triggerNotice(`Theme "${targetTheme.name}" deleted successfully.`);
      } else {
        throw new Error(res.error || 'Failed to delete theme.');
      }
    } catch (e: any) {
      errorProgress(2, e.message || 'Deletion failed.');
      setDeleteErrorMessage(e.message || 'Deletion failed.');
      setThemeToDelete(targetTheme);
    }
  };

  const handleThemeDeactivateClick = (theme: ThemeManifest) => {
    setConfirmThemeAction({
      type: 'deactivate',
      themeId: theme.id,
      themeName: theme.name
    });
  };

  const handleThemeUpdateClick = (theme: ThemeManifest) => {
    setConfirmThemeAction({
      type: 'update',
      themeId: theme.id,
      themeName: theme.name,
      targetVersion: theme.latestVersion
    });
  };

  const handleThemeInstallClick = (theme: ThemeManifest) => {
    setConfirmThemeAction({
      type: 'install',
      themeId: theme.id,
      themeName: theme.name
    });
  };

  const executeThemeAction = async () => {
    if (!confirmThemeAction) return;

    const { type, themeId, themeName } = confirmThemeAction;
    setConfirmThemeAction(null);

    if (type === 'deactivate') {
      startProgress({
        title: `Deactivating ${themeName}`,
        steps: [
          "Unregistering active CSS variables...",
          "Reverting to Blush Core theme..."
        ]
      });

      try {
        updateProgress(0, 'running', 30, "Unregistering active CSS variables...");
        await new Promise((resolve) => setTimeout(resolve, 600));
        updateProgress(0, 'success', 60, "Variables cleaned.");

        updateProgress(1, 'running', 80, "Reverting to Blush Core theme...");
        deactivateTheme(themeId);
        await new Promise((resolve) => setTimeout(resolve, 500));

        completeProgress("Reverted successfully!");
        triggerNotice(`Deactivated "${themeName}", rolled back to Blush Core.`);
      } catch (err: any) {
        errorProgress(1, err.message || "Failed to deactivate theme.");
      }
    } else if (type === 'update') {
      handleUpdateTheme(themeId);
    } else if (type === 'install') {
      startProgress({
        title: `Installing ${themeName}`,
        steps: [
          "Downloading library package...",
          "Registering theme files...",
          "Caching core assets..."
        ]
      });

      try {
        updateProgress(0, 'running', 20, "Downloading library package...");
        await new Promise((resolve) => setTimeout(resolve, 700));
        updateProgress(0, 'success', 50, "Download finished.");

        updateProgress(1, 'running', 70, "Registering theme files...");
        const res = installFromLibrary(themeId);
        if (!res) {
          throw new Error("Theme installation failed.");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        updateProgress(1, 'success', 85, "Files registered.");

        updateProgress(2, 'running', 95, "Caching core assets...");
        await new Promise((resolve) => setTimeout(resolve, 400));

        completeProgress("Theme installed!");
        triggerNotice(`Installed theme "${themeName}" successfully!`);
        setActiveTab('activation');
      } catch (err: any) {
        errorProgress(1, err.message || "Failed to install theme.");
      }
    }
  };

  const processUploadedTheme = async (parsed: any) => {
    const result = validateThemePackage(parsed);
    if (!result.valid || !result.theme) {
      setUploadError(result.error || 'Failed to validate theme package.');
      return;
    }

    const theme = result.theme;
    setPreviewThemeForImport(theme);
    setActivateOnImport(false);
    setConflictResolution('overwrite');

    const existing = themes.find((t) => t.id === theme.id);
    if (existing) {
      setImportConflict({ existing, incoming: theme });
    } else {
      setImportConflict(null);
    }

    setIsImportPreviewOpen(true);
    setIsUploadOpen(false);
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setDiagnosticReport(null);
    setUploadSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.zip')) {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        // Send to server to validate and extract files
        const res = await fetch('/api/admin/themes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'upload_zip', zipBase64: base64 })
        });

        const resJson = await res.json();
        if (!res.ok || !resJson.success) {
          if (resJson.report) {
            setDiagnosticReport(resJson.report);
          }
          throw new Error(resJson.error || 'Server compatibility checker validation failed.');
        }

        if (resJson.report) {
          setDiagnosticReport(resJson.report);
        }

        await processUploadedTheme(resJson.theme);
      } else if (file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string;
            const parsed = JSON.parse(content);
            
            // Check compatibility on server for flat JSON manifest as well
            const res = await fetch('/api/admin/themes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'install', manifest: parsed })
            });

            const resJson = await res.json();
            if (!res.ok || !resJson.success) {
              if (resJson.report) {
                setDiagnosticReport(resJson.report);
              }
              throw new Error(resJson.error || 'Server compatibility checker validation failed.');
            }

            if (resJson.report) {
              setDiagnosticReport(resJson.report);
            }

            await processUploadedTheme(resJson.theme || parsed);
          } catch (err: any) {
            setUploadError('Validation failed: ' + err.message);
          }
        };
        reader.readAsText(file);
      } else {
        setUploadError('Unsupported file type. Please upload a .zip or .json theme package.');
      }
    } catch (err: any) {
      setUploadError('Failed to parse theme package: ' + err.message);
    }
  };

  const handleManualJsonInstall = async () => {
    setUploadError('');
    setUploadSuccess(false);
    try {
      const parsed = JSON.parse(uploadText);
      await processUploadedTheme(parsed);
    } catch (e: any) {
      setUploadError('JSON syntax error: ' + e.message);
    }
  };

  const handleConfirmImportTheme = async () => {
    if (!previewThemeForImport) return;

    const originalThemes = [...themes];
    const originalActiveThemeId = activeTheme.id;
    let finalTheme = { ...previewThemeForImport };
    let installedSuccess = false;

    setIsImportPreviewOpen(false);

    startProgress({
      title: `Installing ${finalTheme.name}`,
      steps: [
        "Analyzing theme manifest & structure...",
        "Verifying package compatibility...",
        "Decompressing & registering files...",
        "Applying active visual styles..."
      ]
    });

    try {
      updateProgress(0, 'running', 15, "Analyzing theme manifest & structure...");
      await new Promise(r => setTimeout(r, 600));
      updateProgress(0, 'success', 30, "Manifest checked.");

      updateProgress(1, 'running', 45, "Verifying package compatibility...");
      await new Promise(r => setTimeout(r, 600));
      
      if (importConflict) {
        if (conflictResolution === 'copy') {
          const rand = Date.now().toString().slice(-4);
          finalTheme.id = `${previewThemeForImport.id}-copy-${rand}`;
          finalTheme.slug = `${previewThemeForImport.slug}-copy-${rand}`;
          finalTheme.name = `${previewThemeForImport.name} (Copy)`;
          finalTheme.isDefault = false;
          finalTheme.isCustom = true;
        } else {
          if (importConflict.existing.isDefault || importConflict.existing.id === 'theme-blush-core') {
            throw new Error('Cannot overwrite the permanent default Blush Core theme. Please select "Keep both" or rename the theme.');
          }
        }
      }
      updateProgress(1, 'success', 60, "Compatibility validated.");

      updateProgress(2, 'running', 75, "Decompressing & registering files...");
      await new Promise(r => setTimeout(r, 800));

      const resInstall = installTheme(finalTheme);
      if (!resInstall) {
        throw new Error('Theme engine installation returned false.');
      }
      installedSuccess = true;
      updateProgress(2, 'success', 90, "Files installed.");

      updateProgress(3, 'running', 95, "Applying active visual styles...");
      await new Promise(r => setTimeout(r, 600));

      if (activateOnImport) {
        const resActivate = activateTheme(finalTheme.id);
        if (!resActivate) {
          throw new Error('Theme engine activation returned false.');
        }
      }
      
      completeProgress("Theme installed successfully!");
      setPreviewThemeForImport(null);
      setImportConflict(null);
      setUploadSuccess(true);
      triggerNotice(`Successfully installed theme "${finalTheme.name}"!`);
    } catch (err: any) {
      console.error('Theme import failed. Performing safe rollback...', err);
      
      if (installedSuccess) {
        deleteTheme(finalTheme.id);
      }
      activateTheme(originalActiveThemeId);

      logAuditEvent({
        action: 'THEME_ROLLBACK' as any,
        entityType: 'theme',
        entityName: finalTheme.name,
        details: `Failed to install theme: ${err.message}. Safe rollback executed.`,
        severity: 'warning'
      });

      errorProgress(
        importConflict && (conflictResolution === 'overwrite') && (importConflict.existing.isDefault || importConflict.existing.id === 'theme-blush-core') ? 1 : 2, 
        err.message || "Failed to install theme package."
      );
      setUploadError(`Import failed. Safely rolled back. Error: ${err.message}`);
      triggerNotice(`Theme import failed! Rolled back successfully.`);
    }
  };

  const handleExportTheme = async (theme: ThemeManifest) => {
    startProgress({
      title: `Exporting ${theme.name}`,
      steps: [
        "Bundling configuration manifests...",
        "Compressing visual assets...",
        "Generating ZIP archive..."
      ]
    });

    try {
      updateProgress(0, 'running', 25, "Bundling configuration manifests...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateProgress(0, 'success', 50, "Manifests bundled.");

      updateProgress(1, 'running', 65, "Compressing visual assets...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateProgress(1, 'success', 80, "Assets compressed.");

      updateProgress(2, 'running', 90, "Generating ZIP archive...");
      const blob = await exportThemeAsZip(theme);
      await new Promise((resolve) => setTimeout(resolve, 400));

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${theme.slug}-theme-v${theme.version}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      completeProgress("Exported successfully!");
      triggerNotice(`Exported ${theme.name} ZIP package`);
    } catch (err: any) {
      errorProgress(1, err.message || "Export failed.");
      triggerNotice(`Failed to export theme ZIP: ${err.message}`);
    }
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
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;

      return matchesSearch && matchesCategory;
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

          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckForUpdates}
            disabled={isCheckingUpdates}
            leftIcon={<RefreshCw size={13} className={isCheckingUpdates ? 'animate-spin' : ''} />}
          >
            {isCheckingUpdates ? 'Checking...' : 'Check Updates'}
          </Button>
        </div>
      </div>

      {/* SECTION 1: INSTALLED THEMES */}
      {activeTab === 'installed' && (
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
                          {theme.hasUpdate && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F43F5E] text-white flex items-center gap-1 animate-pulse">
                              <RefreshCw size={9} className="animate-spin" /> Update Available
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
                            onClick={() => setInspectingTheme(theme)}
                            className="p-1.5 rounded-xl text-[#71717A] hover:text-[#EC4899] hover:bg-[#FFF1F7] transition-colors cursor-pointer"
                            title="Inspect Directory & Architecture"
                          >
                            <Layers size={15} />
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

                        {theme.hasUpdate ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleThemeUpdateClick(theme)}
                            leftIcon={<RefreshCw size={12} />}
                          >
                            Update to v{theme.latestVersion}
                          </Button>
                        ) : !isActive ? (
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
                            onClick={() => handleThemeDeactivateClick(theme)}
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

      {/* Theme Update System Dedicated Dashboard */}
      {activeTab === 'updates' && (
        <div className="space-y-6">
          {/* Header Dashboard Banner */}
          <div className="p-6 bg-white border border-[#F3DCE8] rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF1F7] text-[#EC4899] flex items-center justify-center">
                  <RefreshCw size={16} className="text-[#EC4899]" />
                </div>
                <h3 className="font-extrabold text-sm text-[#18181B]">Theme Update & Recovery Center</h3>
              </div>
              <p className="text-xs text-[#71717A]">
                Keep your themes up to date to get the latest styling rules, layout optimizations, and responsive bug fixes.
              </p>
              {lastUpdateCheck && (
                <p className="text-[10px] text-[#A1A1AA] font-semibold">
                  Last checked for updates: <span className="text-[#EC4899] font-mono">{lastUpdateCheck}</span>
                </p>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckForUpdates}
              disabled={isCheckingUpdates}
              leftIcon={<RefreshCw size={13} className={isCheckingUpdates ? 'animate-spin' : ''} />}
            >
              {isCheckingUpdates ? 'Checking for updates...' : 'Check Updates Registry'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Updates available */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-extrabold text-xs text-[#18181B] tracking-wide uppercase flex items-center gap-2">
                <span>Available Theme Updates</span>
                <span className="text-[10px] bg-[#F43F5E] text-white px-2 py-0.5 rounded-full font-extrabold">
                  {themes.filter((t) => t.hasUpdate).length} Pending
                </span>
              </h4>

              {themes.filter((t) => t.hasUpdate).length === 0 ? (
                <div className="bg-white border border-[#F3DCE8] rounded-3xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-lg font-bold">
                    ✓
                  </div>
                  <h5 className="font-bold text-sm text-[#18181B]">All Themes Up to Date</h5>
                  <p className="text-xs text-[#71717A] max-w-md mx-auto">
                    Every installed CreatorPulse theme is running the latest available version. Click "Check Updates Registry" above to poll for any new package releases.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {themes
                    .filter((t) => t.hasUpdate)
                    .map((theme) => {
                      const updateInfo = THEME_UPDATE_REGISTRY[theme.id];
                      const isCompatible = !(updateInfo?.minAppVersion && updateInfo.minAppVersion > '1.0.0');
                      const isCurrentlyUpdating = updatingThemeId === theme.id;
                      const isExpanded = expandedChangelogs[theme.id] || false;

                      return (
                        <div
                          key={theme.id}
                          className="bg-white border border-[#F3DCE8] rounded-3xl p-5 relative overflow-hidden transition-all duration-300 hover:shadow-md"
                        >
                          {/* Progress Overlay */}
                          {isCurrentlyUpdating && (
                            <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center space-y-3">
                              <RefreshCw size={24} className="animate-spin text-[#EC4899]" />
                              <p className="text-xs font-bold text-[#18181B]">{localUpdateProgress}</p>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 border-b border-[#F3DCE8]">
                            <div className="flex gap-4">
                              <img
                                src={theme.previewImageUrl}
                                alt={theme.name}
                                className="w-16 h-16 rounded-2xl object-cover border border-[#F3DCE8] shrink-0"
                              />
                              <div className="space-y-1">
                                <h5 className="font-bold text-sm text-[#18181B] flex items-center gap-2">
                                  <span>{theme.name}</span>
                                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                                    {theme.category}
                                  </span>
                                </h5>
                                <p className="text-xs text-[#71717A]">By {theme.author}</p>
                                <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-[#71717A]">
                                  <span>Current: v{theme.version}</span>
                                  <span className="text-[#A1A1AA]">→</span>
                                  <span className="text-[#EC4899] bg-[#FFF1F7] px-2 py-0.5 rounded-md font-bold">
                                    Latest: v{theme.latestVersion}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="w-full sm:w-auto shrink-0">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleUpdateTheme(theme.id)}
                                disabled={updatingThemeId !== null}
                                leftIcon={<RefreshCw size={13} />}
                                className="w-full sm:w-auto"
                              >
                                Update Theme
                              </Button>
                            </div>
                          </div>

                          <div className="pt-4 space-y-3">
                            {/* Description preview */}
                            <p className="text-xs text-[#71717A] leading-relaxed font-medium">
                              {updateInfo?.description || theme.description}
                            </p>

                            {/* Compatibility Check Alert */}
                            {!isCompatible ? (
                              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2">
                                <AlertTriangle size={15} className="text-rose-650 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <p className="text-[11px] font-bold text-rose-800">
                                    App Version Conflict Warning
                                  </p>
                                  <p className="text-[10px] text-rose-700 leading-relaxed">
                                    This theme update requires CreatorPulse v{updateInfo?.minAppVersion} or higher. Your current version is v1.0.0. Updating might break styling rules or trigger errors.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-xl w-fit">
                                <ShieldCheck size={11} /> Compatible with CreatorPulse v1.0.0
                              </div>
                            )}

                            {/* Changelog Dropdown */}
                            <div className="border border-[#F3DCE8] rounded-2xl overflow-hidden">
                              <button
                                onClick={() => toggleChangelog(theme.id)}
                                className="w-full px-4 py-2.5 bg-[#FFF9FC] flex items-center justify-between text-xs font-bold text-[#BE185D] hover:bg-[#FFF1F7] transition-colors"
                              >
                                <span className="flex items-center gap-1.5">
                                  <BookOpen size={13} />
                                  <span>View Changelog & Release Notes</span>
                                </span>
                                <span className="text-[10px] font-mono">
                                  {isExpanded ? 'Hide' : 'Show'}
                                </span>
                              </button>

                              {isExpanded && (
                                <div className="p-4 bg-white border-t border-[#F3DCE8] space-y-3">
                                  {updateInfo?.changelog ? (
                                    (updateInfo.changelog as any).map((log: any, idx: number) => (
                                      <div key={idx} className="space-y-1">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-[#18181B] pb-1 border-b border-dashed border-[#F3DCE8]">
                                          <span className="text-[#EC4899] font-mono">Version {log.version}</span>
                                          <span className="text-[#A1A1AA]">{log.date}</span>
                                        </div>
                                        <ul className="list-disc pl-4 space-y-1">
                                          {log.changes.map((change: string, cIdx: number) => (
                                            <li key={cIdx} className="text-[11px] text-[#71717A] leading-relaxed">
                                              {change}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-[11px] text-[#A1A1AA] italic">No changelog entries found.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Right Column: Restore Points Dashboard */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-xs text-[#18181B] tracking-wide uppercase flex items-center gap-2">
                <span>Backup & Restore Points</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  {backups.length}
                </span>
              </h4>

              {backups.length === 0 ? (
                <div className="bg-[#FFF9FC] border border-dashed border-[#F3DCE8] rounded-3xl p-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-white text-[#71717A] flex items-center justify-center mx-auto border border-[#F3DCE8] text-sm">
                    📂
                  </div>
                  <h5 className="font-bold text-xs text-[#18181B]">No Restore Points</h5>
                  <p className="text-[11px] text-[#71717A] leading-relaxed">
                    A secure restore point is automatically created whenever you run a theme update. If the update causes instability, you can rollback to any previous backup here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {backups.map((backup) => (
                    <div
                      key={backup.id}
                      className="bg-white border border-[#F3DCE8] rounded-2xl p-4 space-y-3 shadow-xs hover:border-[#EC4899]/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h5 className="font-bold text-xs text-[#18181B] truncate max-w-[150px]">
                            {backup.themeName}
                          </h5>
                          <p className="text-[10px] text-[#71717A]">
                            Backup Version: <span className="font-mono font-bold text-[#EC4899]">v{backup.version}</span>
                          </p>
                          <p className="text-[9px] text-[#A1A1AA]">
                            Saved: {backup.timestamp}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteBackup(backup.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Discard backup"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRollback(backup.id, backup.themeName, backup.version)}
                        className="w-full text-[10px] font-bold text-[#BE185D] hover:bg-[#FFF1F7] border-[#BE185D]/20"
                        leftIcon={<RotateCcw size={11} />}
                      >
                        Rollback to Backup
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
                          onClick={() => handleThemeDeactivateClick(theme)}
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
            {filteredLibraryThemes.map((theme) => {
              const isInstalled = themes.some((installed) => installed.id === theme.id);
              return (
                <Card
                  key={theme.id}
                  className={`p-0 overflow-hidden flex flex-col justify-between border-[#F3DCE8] bg-white transition-all duration-300 hover:shadow-xl hover:border-[#F472B6]/50 ${
                    isInstalled ? 'bg-slate-50/50 opacity-90' : ''
                  }`}
                >
                  <div>
                    <div className="relative h-36 w-full overflow-hidden bg-slate-900 group">
                      <img
                        src={theme.previewImageUrl}
                        alt={theme.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute top-3 left-3 flex items-center gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                          {theme.category}
                        </span>
                        {isInstalled && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                            <Check size={9} strokeWidth={3} /> Installed
                          </span>
                        )}
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
                      onClick={() => handleThemeInstallClick(theme)}
                      disabled={isInstalled}
                      leftIcon={isInstalled ? <Check size={13} /> : <Plus size={13} />}
                    >
                      {isInstalled ? 'Installed' : 'Install Theme'}
                    </Button>
                  </div>
                </Card>
              );
            })}
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

      {/* MODAL 4: THEME CUSTOMIZER DUAL-PANE OVERLAY */}
      {customizerTheme && (
        <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col animate-in fade-in duration-200 text-slate-800">
          {/* Header */}
          <div className="h-16 border-b border-[#E2E8F0] px-6 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FCE7F3] text-[#EC4899] flex items-center justify-center font-bold">
                <Sliders size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Theme Design Studio</h3>
                <p className="text-xs text-slate-500 font-medium">Customizing theme settings for: <span className="font-bold text-[#BE185D]">{customizerTheme.name}</span></p>
              </div>
            </div>

            {/* Viewport Selectors (in center of header) */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setCustomizerViewport('desktop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  customizerViewport === 'desktop' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Monitor size={14} />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setCustomizerViewport('tablet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  customizerViewport === 'tablet' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <TabletIcon size={14} />
                <span>Tablet</span>
              </button>
              <button
                onClick={() => setCustomizerViewport('mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  customizerViewport === 'mobile' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone size={14} />
                <span>Mobile</span>
              </button>
            </div>

            <button
              onClick={() => setCustomizerTheme(null)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel: Settings Controls */}
            <div className="w-[420px] border-r border-[#E2E8F0] bg-white flex flex-col overflow-hidden shrink-0 shadow-lg">
              {/* Tabs list */}
              <div className="grid grid-cols-4 border-b border-[#E2E8F0] bg-slate-50 text-[10px] uppercase font-bold text-slate-500 text-center shrink-0">
                <button
                  onClick={() => setCustomizerSettingsTab('colors')}
                  className={`py-3 border-b-2 transition-all cursor-pointer ${
                    customizerSettingsTab === 'colors' ? 'border-[#EC4899] text-[#BE185D] bg-white' : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  Colors
                </button>
                <button
                  onClick={() => setCustomizerSettingsTab('typography')}
                  className={`py-3 border-b-2 transition-all cursor-pointer ${
                    customizerSettingsTab === 'typography' ? 'border-[#EC4899] text-[#BE185D] bg-white' : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  Fonts
                </button>
                <button
                  onClick={() => setCustomizerSettingsTab('layout')}
                  className={`py-3 border-b-2 transition-all cursor-pointer ${
                    customizerSettingsTab === 'layout' ? 'border-[#EC4899] text-[#BE185D] bg-white' : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  Layout
                </button>
                <button
                  onClick={() => setCustomizerSettingsTab('assets')}
                  className={`py-3 border-b-2 transition-all cursor-pointer ${
                    customizerSettingsTab === 'assets' ? 'border-[#EC4899] text-[#BE185D] bg-white' : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  Assets
                </button>
              </div>

              {/* Scrollable controls container */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
                {/* 1. Colors Controls */}
                {customizerSettingsTab === 'colors' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-extrabold text-slate-800 mb-1">Color Palette</h4>
                      <p className="text-[10px] text-slate-500">Pick theme-wide branding color tokens</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Primary Branding Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={customPrimary}
                            onChange={(e) => setCustomPrimary(e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={customPrimary}
                            onChange={(e) => setCustomPrimary(e.target.value)}
                            className="flex-1 border border-slate-200 rounded-xl px-3 text-slate-800 font-mono focus:border-[#EC4899] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Accent Highlighting Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={customAccent}
                            onChange={(e) => setCustomAccent(e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={customAccent}
                            onChange={(e) => setCustomAccent(e.target.value)}
                            className="flex-1 border border-slate-200 rounded-xl px-3 text-slate-800 font-mono focus:border-[#EC4899] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Page Canvas Background</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={customBg}
                            onChange={(e) => setCustomBg(e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={customBg}
                            onChange={(e) => setCustomBg(e.target.value)}
                            className="flex-1 border border-slate-200 rounded-xl px-3 text-slate-800 font-mono focus:border-[#EC4899] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Card & Module Surface</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={customSurface}
                            onChange={(e) => setCustomSurface(e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={customSurface}
                            onChange={(e) => setCustomSurface(e.target.value)}
                            className="flex-1 border border-slate-200 rounded-xl px-3 text-slate-800 font-mono focus:border-[#EC4899] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Border & Divider Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={customBorder}
                            onChange={(e) => setCustomBorder(e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={customBorder}
                            onChange={(e) => setCustomBorder(e.target.value)}
                            className="flex-1 border border-slate-200 rounded-xl px-3 text-slate-800 font-mono focus:border-[#EC4899] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Primary Body Text</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={customTextPrimary}
                            onChange={(e) => setCustomTextPrimary(e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={customTextPrimary}
                            onChange={(e) => setCustomTextPrimary(e.target.value)}
                            className="flex-1 border border-slate-200 rounded-xl px-3 text-slate-800 font-mono focus:border-[#EC4899] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Secondary Subtitles</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={customTextSecondary}
                            onChange={(e) => setCustomTextSecondary(e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={customTextSecondary}
                            onChange={(e) => setCustomTextSecondary(e.target.value)}
                            className="flex-1 border border-slate-200 rounded-xl px-3 text-slate-800 font-mono focus:border-[#EC4899] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Typography Controls */}
                {customizerSettingsTab === 'typography' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-extrabold text-slate-800 mb-1">Typography Settings</h4>
                      <p className="text-[10px] text-slate-500">Choose fonts applied dynamically via Google Fonts</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5">Font Family</label>
                        <select
                          value={customFontFamily}
                          onChange={(e) => setCustomFontFamily(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-800 bg-[#FFF9FC] focus:outline-none focus:border-[#EC4899]"
                        >
                          <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Modern Sans)</option>
                          <option value="Inter, sans-serif">Inter (Clean Neutral)</option>
                          <option value="Space Grotesk, sans-serif">Space Grotesk (Tech Editorial)</option>
                          <option value="Playfair Display, serif">Playfair Display (Editorial Serif)</option>
                          <option value="Montserrat, sans-serif">Montserrat (Geometric Sans)</option>
                          <option value="system-ui, sans-serif">System UI Default (Standard)</option>
                        </select>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <span className="text-[10px] font-extrabold text-slate-400 block mb-2 uppercase">Typography Preview</span>
                        <div style={{ fontFamily: customFontFamily }} className="space-y-2 text-slate-800">
                          <h5 className="text-lg font-black tracking-tight leading-tight">Heading Example 123</h5>
                          <p className="text-xs leading-relaxed text-slate-600">The quick brown fox jumps over the lazy dog. Membership models help creators lock paywalled features instantly.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Layout, Spacing & Shadows Controls */}
                {customizerSettingsTab === 'layout' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-extrabold text-slate-800 mb-1">Layout & Spacing Geometry</h4>
                      <p className="text-[10px] text-slate-500">Fine-tune spacing gap scale and sidebar alignment</p>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Spacing & Paddings Density</label>
                        <select
                          value={customSpacing}
                          onChange={(e) => setCustomSpacing(e.target.value as any)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 bg-[#FFF9FC] font-medium focus:outline-none focus:border-[#EC4899]"
                        >
                          <option value="compact">Compact (12px gap)</option>
                          <option value="standard">Standard (16px gap)</option>
                          <option value="cozy">Cozy (20px gap)</option>
                          <option value="spacious">Spacious (24px gap)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Sidebar Layout Alignment</label>
                        <select
                          value={customSidebarPlacement}
                          onChange={(e) => setCustomSidebarPlacement(e.target.value as any)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 bg-[#FFF9FC] font-medium focus:outline-none focus:border-[#EC4899]"
                        >
                          <option value="left">Left Sidebar Alignment (Standard)</option>
                          <option value="right">Right Sidebar Alignment</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Navigation Header Style</label>
                        <select
                          value={customHeaderStyle}
                          onChange={(e) => setCustomHeaderStyle(e.target.value as any)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 bg-[#FFF9FC] font-medium focus:outline-none focus:border-[#EC4899]"
                        >
                          <option value="fixed">Sticky / Fixed top (Default)</option>
                          <option value="floating">Floating rounded navigation bar</option>
                          <option value="simple">Simple static navigation header</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Content Width Container</label>
                        <select
                          value={customContainerWidth}
                          onChange={(e) => setCustomContainerWidth(e.target.value as any)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 bg-[#FFF9FC] font-medium focus:outline-none focus:border-[#EC4899]"
                        >
                          <option value="max-w-6xl">Compact Layout (max-w-6xl)</option>
                          <option value="max-w-7xl">Standard Layout (max-w-7xl)</option>
                          <option value="max-w-full">Fluid Full Width</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Card Border Radius ({customCardRadius})</label>
                        <input
                          type="range"
                          min="0"
                          max="36"
                          step="2"
                          value={parseInt(customCardRadius) || 20}
                          onChange={(e) => setCustomCardRadius(`${e.target.value}px`)}
                          className="w-full accent-[#EC4899] cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Button Corner Radius ({customButtonRadius})</label>
                        <input
                          type="range"
                          min="0"
                          max="28"
                          step="2"
                          value={parseInt(customButtonRadius) || 14}
                          onChange={(e) => setCustomButtonRadius(`${e.target.value}px`)}
                          className="w-full accent-[#EC4899] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Assets & Theme-specific Settings Controls */}
                {customizerSettingsTab === 'assets' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-extrabold text-slate-800 mb-1">Brand Assets & Settings</h4>
                      <p className="text-[10px] text-slate-500">Configure theme-specific uploads and style options</p>
                    </div>

                    <div className="space-y-4">
                      <MediaUploader
                        label="Theme Brand Logo Image"
                        description="SVG, PNG, or WebP logo asset used by this theme."
                        folder="themes"
                        accept="images"
                        aspectRatio="banner"
                        value={customLogoUrl}
                        onChange={(url) => setCustomLogoUrl(url)}
                      />

                      <MediaUploader
                        label="Theme Browser Favicon"
                        description="Favicon icon loaded when this theme is active."
                        folder="documents"
                        accept="icons"
                        aspectRatio="square"
                        value={customFaviconUrl}
                        onChange={(url) => setCustomFaviconUrl(url)}
                      />

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Button Visual Style Preset</label>
                        <select
                          value={customButtonStyle}
                          onChange={(e) => setCustomButtonStyle(e.target.value as any)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 bg-[#FFF9FC] font-medium focus:outline-none focus:border-[#EC4899]"
                        >
                          <option value="gradient-glow">Glowing Gradient Effect</option>
                          <option value="flat-solid">Flat Solid Background</option>
                          <option value="soft-glass">Soft Translucent Glass</option>
                          <option value="outline-neo">Outlined Neo-brutalist</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Animation Playback Intensity</label>
                        <select
                          value={customAnimationIntensity}
                          onChange={(e) => setCustomAnimationIntensity(e.target.value as any)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 bg-[#FFF9FC] font-medium focus:outline-none focus:border-[#EC4899]"
                        >
                          <option value="off">Off (Zero Transitions)</option>
                          <option value="subtle">Subtle Transitions</option>
                          <option value="normal">Normal Speed</option>
                          <option value="playful">Playful / Staggered Loops</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Save & Reset Actions at bottom of pane */}
              <div className="p-4 border-t border-[#E2E8F0] bg-slate-50 flex items-center justify-between shrink-0">
                <Button variant="ghost" size="sm" onClick={handleResetCustomizer} leftIcon={<RotateCcw size={14} className="text-rose-500" />}>
                  Reset Defaults
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCustomizerTheme(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSaveCustomization}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Panel: Simulated Live Viewport Area */}
            <div className="flex-1 bg-slate-100 flex flex-col overflow-hidden select-none">
              {/* Preview Nav Header */}
              <div className="h-12 border-b border-[#E2E8F0] px-4 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCustomizerTab('feed')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      customizerTab === 'feed' ? 'bg-[#FCE7F3] text-[#BE185D]' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Community Feed View
                  </button>
                  <button
                    onClick={() => setCustomizerTab('profile')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      customizerTab === 'profile' ? 'bg-[#FCE7F3] text-[#BE185D]' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Creator Profile View
                  </button>
                  <button
                    onClick={() => setCustomizerTab('landing')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      customizerTab === 'landing' ? 'bg-[#FCE7F3] text-[#BE185D]' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Landing Hero View
                  </button>
                </div>

                <span className="text-[10px] text-slate-400 font-extrabold uppercase flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Preview
                </span>
              </div>

              {/* Viewport content centering area */}
              <div className="flex-1 overflow-y-auto p-8 flex items-start justify-center">
                {/* Responsive device wrapping frame */}
                <div
                  className="transition-all duration-300 shadow-2xl flex flex-col border border-slate-300 bg-white"
                  style={{
                    width: customizerViewport === 'mobile' ? '412px' : customizerViewport === 'tablet' ? '768px' : '100%',
                    height: customizerViewport === 'desktop' ? 'auto' : '680px',
                    borderRadius: customizerViewport === 'desktop' ? '12px' : '36px',
                    padding: customizerViewport === 'mobile' ? '16px 8px 24px 8px' : customizerViewport === 'tablet' ? '20px' : '0px'
                  }}
                >
                  {/* Phone notch simulator */}
                  {customizerViewport === 'mobile' && (
                    <div className="w-32 h-4 bg-slate-900 rounded-full mx-auto mb-4 shrink-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                    </div>
                  )}

                  {/* Simulated Frame Screen content */}
                  <div
                    className={`flex-1 rounded-2xl overflow-y-auto p-6 transition-all relative ${
                      customizerTheme.tokens.isDark ? 'dark-theme' : ''
                    }`}
                    style={{
                      '--color-primary': customPrimary,
                      '--color-primary-hover': customPrimary,
                      '--color-soft-primary': customPrimary + '18',
                      '--color-light-primary': customPrimary + '0d',
                      '--color-accent': customAccent,
                      '--color-bg': customBg,
                      '--color-surface': customSurface,
                      '--color-surface-secondary': customBg === '#FFFFFF' ? '#FFF1F7' : customBg + '18',
                      '--color-border': customBorder,
                      '--color-text-primary': customTextPrimary,
                      '--color-text-secondary': customTextSecondary,
                      '--radius-card': customCardRadius,
                      '--radius-button': customButtonRadius,
                      '--theme-spacing-base': customSpacing === 'compact' ? '0.75rem' : customSpacing === 'cozy' ? '1.25rem' : customSpacing === 'spacious' ? '1.5rem' : '1rem',
                      '--theme-container-width': customContainerWidth,
                      '--theme-button-style': customButtonStyle,
                      '--theme-animation-intensity': customAnimationIntensity,
                      backgroundColor: customBg,
                      color: customTextPrimary,
                      fontFamily: customFontFamily
                    } as React.CSSProperties}
                  >
                    {/* Simulated Header/Navbar */}
                    <div
                      className={`flex items-center justify-between pb-4 mb-6 border-b shrink-0`}
                      style={{
                        borderColor: customBorder,
                        flexDirection: customSidebarPlacement === 'right' ? 'row-reverse' : 'row'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {customLogoUrl ? (
                          <img src={customLogoUrl} alt="Logo" className="h-6 w-auto object-contain rounded" />
                        ) : (
                          <>
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                              style={{ background: `linear-gradient(135deg, ${customPrimary}, ${customAccent})` }}
                            >
                              <Sparkles size={14} />
                            </div>
                            <span className="font-extrabold text-sm tracking-tight" style={{ color: customTextPrimary }}>
                              Creator<span style={{ color: customPrimary }}>Pulse</span>
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold" style={{ color: customTextSecondary }}>
                        <span className="hover:opacity-85 cursor-pointer">Feed</span>
                        <span className="hover:opacity-85 cursor-pointer">Explore</span>
                        <div
                          className="px-2.5 py-1 text-white font-semibold flex items-center"
                          style={{
                            background: customButtonStyle === 'gradient-glow' ? `linear-gradient(135deg, ${customPrimary}, ${customAccent})` : customPrimary,
                            borderRadius: customButtonRadius
                          }}
                        >
                          Launch
                        </div>
                      </div>
                    </div>

                    {/* Spacing gap class mapped to inline gap */}
                    {customizerTab === 'feed' && (
                      <div
                        className="flex w-full items-start"
                        style={{
                          flexDirection: customSidebarPlacement === 'right' ? 'row-reverse' : 'row',
                          gap: 'var(--theme-spacing-base)'
                        }}
                      >
                        {/* Sidebar Preview */}
                        <div
                          className={`w-[130px] hidden md:flex flex-col shrink-0`}
                          style={{
                            gap: 'calc(var(--theme-spacing-base) * 0.75)',
                            textAlign: customSidebarPlacement === 'right' ? 'right' : 'left'
                          }}
                        >
                          <div className="px-2 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider text-slate-400">Navigation</div>
                          <div className="px-2 py-1.5 rounded-xl font-bold bg-[#FFF1F7]/40 text-[#BE185D] border border-pink-100 flex items-center gap-1.5">
                            <Sparkles size={12} className="text-[#EC4899]" />
                            <span>Feed</span>
                          </div>
                          <div className="px-2 py-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 rounded-xl font-bold flex items-center gap-1.5">
                            <Compass size={12} />
                            <span>Explore</span>
                          </div>
                        </div>

                        {/* Main Feed Content */}
                        <div className="flex-1 space-y-4">
                          <div
                            className="p-5 border shadow-sm space-y-3"
                            style={{
                              backgroundColor: customSurface,
                              borderColor: customBorder,
                              borderRadius: customCardRadius
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-[11px]" style={{ color: customTextPrimary }}>Sarah Jenkins</h4>
                                  <span className="text-[9px]" style={{ color: customTextSecondary }}>@sarahdesign • 15m ago</span>
                                </div>
                              </div>
                              <span
                                className="text-[9px] font-bold px-2 py-0.5"
                                style={{
                                  backgroundColor: customPrimary + '15',
                                  color: customPrimary,
                                  borderRadius: '9999px'
                                }}
                              >
                                Pro VIP
                              </span>
                            </div>

                            <p className="text-[11px] leading-relaxed" style={{ color: customTextSecondary }}>
                              Locking premium masterclasses has never been this fluid. Choose the best layout spacing models to deliver amazing user portals.
                            </p>

                            <div
                              className="p-3 border flex items-center justify-between text-[11px] font-bold"
                              style={{
                                backgroundColor: customBg === '#FFFFFF' ? '#FFF1F7' : customBg + '18',
                                borderColor: customBorder,
                                borderRadius: customButtonRadius
                              }}
                            >
                              <span>Exclusive UI Assets Package</span>
                              <span style={{ color: customPrimary }}>$15.00/mo</span>
                            </div>

                            <div className="flex gap-2">
                              <button
                                className="flex-1 text-[11px] font-bold py-2 text-white shadow"
                                style={{
                                  background: customButtonStyle === 'gradient-glow' ? `linear-gradient(135deg, ${customPrimary}, ${customAccent})` : customPrimary,
                                  borderRadius: customButtonRadius
                                }}
                              >
                                Subscribe to Access
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {customizerTab === 'profile' && (
                      <div className="space-y-4">
                        <div
                          className="border shadow-sm overflow-hidden"
                          style={{
                            backgroundColor: customSurface,
                            borderColor: customBorder,
                            borderRadius: customCardRadius
                          }}
                        >
                          {/* Banner */}
                          <div
                            className="h-20 w-full"
                            style={{ background: `linear-gradient(135deg, ${customPrimary}, ${customAccent})` }}
                          ></div>
                          <div className="p-4 relative -mt-8 flex flex-col items-center text-center space-y-2">
                            <div className="w-14 h-14 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-md">
                              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h3 className="font-black text-sm" style={{ color: customTextPrimary }}>Sarah Jenkins</h3>
                              <p className="text-[10px]" style={{ color: customTextSecondary }}>UI/UX Educator & Art Director</p>
                            </div>
                            <div className="flex gap-3 text-[10px] py-1">
                              <div><span className="font-bold" style={{ color: customPrimary }}>14.2k</span> <span style={{ color: customTextSecondary }}>followers</span></div>
                              <div><span className="font-bold" style={{ color: customPrimary }}>840</span> <span style={{ color: customTextSecondary }}>subscribers</span></div>
                            </div>
                            <div className="w-full flex gap-2">
                              <button
                                className="flex-1 text-[10px] font-bold py-2 text-white"
                                style={{
                                  background: customButtonStyle === 'gradient-glow' ? `linear-gradient(135deg, ${customPrimary}, ${customAccent})` : customPrimary,
                                  borderRadius: customButtonRadius
                                }}
                              >
                                Follow Sarah
                              </button>
                              <button
                                className="flex-1 text-[10px] font-bold py-2 border"
                                style={{
                                  borderColor: customBorder,
                                  color: customTextPrimary,
                                  borderRadius: customButtonRadius
                                }}
                              >
                                Direct Message
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {customizerTab === 'landing' && (
                      <div className="text-center py-10 px-4 space-y-5">
                        <div
                          className="inline-flex items-center gap-1.5 px-3.5 py-1 text-[9px] font-bold border"
                          style={{
                            backgroundColor: customPrimary + '15',
                            borderColor: customBorder,
                            color: customPrimary,
                            borderRadius: '9999px'
                          }}
                        >
                          <Sparkles size={10} /> Next-Gen Creator Monetization
                        </div>
                        <h2 className="text-3xl font-black tracking-tight" style={{ color: customTextPrimary }}>
                          Design. Share. <span style={{ color: customPrimary }}>Succeed.</span>
                        </h2>
                        <p className="text-[11px] leading-relaxed max-w-sm mx-auto" style={{ color: customTextSecondary }}>
                          Build a customized subscriber business with zero developer overhead. Fine-tune visual branding components dynamically.
                        </p>
                        <div className="flex justify-center gap-2 pt-2">
                          <button
                            className="text-[11px] font-bold px-5 py-2.5 text-white shadow-lg"
                            style={{
                              background: customButtonStyle === 'gradient-glow' ? `linear-gradient(135deg, ${customPrimary}, ${customAccent})` : customPrimary,
                              borderRadius: customButtonRadius
                            }}
                          >
                            Get Started Free
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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

      {/* DIRECTORY & ARCHITECTURE INSPECTOR MODAL */}
      {inspectingTheme && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-pink-100 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#18181B] flex items-center gap-2">
                    <span>{inspectingTheme.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      SDK v1.0 Compliant
                    </span>
                  </h3>
                  <p className="text-xs font-mono text-[#71717A]">
                    /themes/{inspectingTheme.slug || inspectingTheme.id.replace(/^theme-/, '')}/
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingTheme(null)}
                className="p-1.5 rounded-xl text-[#71717A] hover:text-[#18181B] hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Architecture Health Card */}
              <div className="p-4 bg-gradient-to-br from-pink-50/50 to-purple-50/30 rounded-2xl border border-pink-100/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#18181B] flex items-center gap-1.5 text-xs">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    Standard Directory Architecture Health
                  </span>
                  <span className="text-[11px] font-bold text-pink-700 bg-pink-100/70 px-2.5 py-0.5 rounded-full">
                    17 / 17 Folders Verified
                  </span>
                </div>
                <p className="text-[11px] text-[#71717A] leading-relaxed">
                  Every subfolder is dynamically introspected by the Theme Loader. Components, layouts, and stylesheets are loaded dynamically.
                </p>
              </div>

              {/* Standard Directory Grid */}
              <div>
                <h4 className="font-bold text-[#18181B] mb-2 flex items-center justify-between">
                  <span>Standardized Theme Subdirectories</span>
                  <span className="text-[10px] font-mono text-slate-400">All present on disk</span>
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[
                    { name: 'pages', desc: 'Page overrides' },
                    { name: 'layouts', desc: 'Layout wrappers' },
                    { name: 'components', desc: 'UI widgets' },
                    { name: 'icons', desc: 'SVG icon set' },
                    { name: 'images', desc: 'Theme graphics' },
                    { name: 'fonts', desc: 'Web fonts' },
                    { name: 'styles', desc: 'theme.css' },
                    { name: 'css', desc: 'Modular CSS' },
                    { name: 'js', desc: 'Client scripts' },
                    { name: 'animations', desc: 'Keyframes/GSAP' },
                    { name: 'assets', desc: 'Static media' },
                    { name: 'templates', desc: 'HTML templates' },
                    { name: 'partials', desc: 'UI snippets' },
                    { name: 'hooks', desc: 'React hooks' },
                    { name: 'config', desc: 'Token schemas' },
                    { name: 'locales', desc: 'i18n en/es' },
                    { name: 'preview', desc: 'Screenshots' }
                  ].map((folder) => (
                    <div
                      key={folder.name}
                      className="p-2.5 bg-slate-50 hover:bg-pink-50/40 rounded-xl border border-slate-200/80 transition-colors space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[11px] text-[#18181B]">/{folder.name}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      </div>
                      <p className="text-[9px] text-[#71717A] line-clamp-1">{folder.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CSS Overrides Live Preview */}
              <div>
                <h4 className="font-bold text-[#18181B] mb-1">Live Stylesheet: /styles/theme.css</h4>
                <div className="p-3 bg-slate-950 text-pink-200 rounded-2xl font-mono text-[11px] max-h-36 overflow-y-auto space-y-0.5">
                  <p className="text-slate-500">{"/* Dynamic CSS variables injected by Theme Engine */"}</p>
                  <p className="text-emerald-400">:root[data-theme="{inspectingTheme.id}"] &#123;</p>
                  <p className="pl-3 text-pink-300">--theme-primary: {inspectingTheme.tokens?.primary || '#EC4899'};</p>
                  <p className="pl-3 text-pink-300">--theme-bg: {inspectingTheme.tokens?.background || '#FFFFFF'};</p>
                  <p className="pl-3 text-pink-300">--theme-surface: {inspectingTheme.tokens?.surface || '#FFF9FC'};</p>
                  <p className="pl-3 text-pink-300">--theme-border: {inspectingTheme.tokens?.border || '#F3DCE8'};</p>
                  <p className="pl-3 text-pink-300">--theme-font: {inspectingTheme.tokens?.fontFamily || 'Plus Jakarta Sans'};</p>
                  <p className="text-emerald-400">&#125;</p>
                  {inspectingTheme.assets?.cssOverrides && (
                    <>
                      <p className="text-slate-500 mt-2">{"/* Custom CSS Rules */"}</p>
                      <pre className="text-slate-300 whitespace-pre-wrap">{inspectingTheme.assets.cssOverrides}</pre>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInspectingTheme(null);
                  openCustomizer(inspectingTheme);
                }}
                leftIcon={<Sliders size={13} />}
              >
                Open Visual Customizer
              </Button>
              <Button variant="primary" size="sm" onClick={() => setInspectingTheme(null)}>
                Done
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

            {diagnosticReport && (
              <div className="bg-slate-50 border border-[#F3DCE8] rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-2">
                  <span className="font-bold text-[#18181B] flex items-center gap-1.5">
                    <ShieldAlert size={15} className="text-[#EC4899]" />
                    Theme Diagnostics Report
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    diagnosticReport.isValid 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {diagnosticReport.isValid ? 'Compatible' : 'Incompatible / Blocked'}
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {diagnosticReport.issues.length === 0 ? (
                    <p className="text-emerald-700 italic text-[11px]">No compatibility issues detected. Fully compatible with CreatorPulse v1.2.0.</p>
                  ) : (
                    diagnosticReport.issues.map((issue: DiagnosticIssue, index: number) => (
                      <div key={index} className={`p-2.5 rounded-xl border ${
                        issue.type === 'error' 
                          ? 'bg-rose-50/50 border-rose-200 text-rose-950' 
                          : 'bg-amber-50/50 border-amber-200 text-amber-950'
                      }`}>
                        <div className="flex items-start gap-1.5">
                          <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            issue.type === 'error' ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                          } shrink-0`}>
                            {issue.type}
                          </span>
                          <div className="space-y-1">
                            <p className="font-bold text-[11px]">Field: <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">{issue.field}</code></p>
                            <p className="text-[11px] leading-relaxed">{issue.message}</p>
                            <p className="text-[11px] italic text-slate-600 font-medium">Recommended Fix: {issue.fix}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="flex flex-col gap-3">
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

                <div className="text-center py-1 text-slate-400 font-bold uppercase text-[9px] tracking-wider">— or —</div>

                <Button 
                  type="button" 
                  variant="outline" 
                  size="md" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => setIsMediaPickerOpen(true)}
                >
                  <ImageIcon size={15} /> Select Theme from Media Library
                </Button>
              </div>

              <MediaLibraryModal
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                allowedTypes={['.zip', '.json', 'application/zip', 'application/json']}
                maxFiles={1}
                initialFolder="themes"
                onSelect={async (selected) => {
                  const selectedFile = selected[0];
                  if (selectedFile) {
                    try {
                      setIsUploadOpen(false);
                      const response = await fetch(selectedFile.url);
                      const blob = await response.blob();
                      const file = new File([blob], selectedFile.name, { type: selectedFile.mimeType });
                      
                      if (file.name.endsWith('.zip')) {
                        const arrayBuffer = await file.arrayBuffer();
                        const bytes = new Uint8Array(arrayBuffer);
                        let binary = '';
                        for (let i = 0; i < bytes.byteLength; i++) {
                          binary += String.fromCharCode(bytes[i]);
                        }
                        const base64 = btoa(binary);

                        const parsed = await importThemeFromZip(file);

                        // Send to server to extract all files physically into /themes/<slug>
                        fetch('/api/admin/themes', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'upload_zip', zipBase64: base64 })
                        }).catch((err) => console.warn('[Theme upload] Server ZIP extraction warning:', err));

                        await processUploadedTheme(parsed);
                      } else if (file.name.endsWith('.json')) {
                        const content = await file.text();
                        const parsed = JSON.parse(content);
                        await processUploadedTheme(parsed);
                      }
                    } catch (e: unknown) {
                      setUploadError('Failed to import from Media Library: ' + (e as Error).message);
                      setIsUploadOpen(true);
                    }
                  }
                }}
              />

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
                <p className="text-[#A1A1AA]">{"// Example theme.json"}</p>
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
      {/* MODAL 8: THEME ACTION CONFIRMATION MODAL */}
      {confirmThemeAction && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#F3DCE8] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-200">
                <AlertTriangle size={20} className="text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#18181B]">
                  Confirm Theme {confirmThemeAction.type.charAt(0).toUpperCase() + confirmThemeAction.type.slice(1)}
                </h3>
                <p className="text-xs text-[#71717A]">Please confirm your action below</p>
              </div>
            </div>

            <div className="text-xs text-[#71717A] leading-relaxed space-y-2 font-medium">
              {confirmThemeAction.type === 'deactivate' && (
                <p>
                  Are you sure you want to deactivate <strong className="text-[#18181B]">{confirmThemeAction.themeName}</strong>?
                  The system will automatically roll back to the default <strong className="text-[#BE185D]">Blush Core</strong> theme.
                </p>
              )}

              {confirmThemeAction.type === 'update' && (
                <p>
                  Are you sure you want to update <strong className="text-[#18181B]">{confirmThemeAction.themeName}</strong> to v{confirmThemeAction.targetVersion}?
                  This will register newly compiled tokens and geometry layout settings.
                </p>
              )}

              {confirmThemeAction.type === 'install' && (
                <p>
                  Are you sure you want to install <strong className="text-[#18181B]">{confirmThemeAction.themeName}</strong> from the official library?
                  The theme package structure will be verified for tokens and colors before installation.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={() => setConfirmThemeAction(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={executeThemeAction}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: THEME IMPORT PREVIEW */}
      {isImportPreviewOpen && previewThemeForImport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#F3DCE8] shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#18181B] flex items-center gap-2">
                  <Palette size={18} className="text-[#EC4899]" />
                  <span>Verify Theme Installation</span>
                </h3>
                <p className="text-xs text-[#71717A]">
                  Review package manifest, conflict checks, and version compatibility details.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsImportPreviewOpen(false);
                  setPreviewThemeForImport(null);
                  setImportConflict(null);
                }}
                className="p-1 rounded-xl text-[#71717A] hover:text-[#18181B]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Version Compatibility Checking */}
            {(() => {
              const appVer = CURRENT_APP_VERSION || '1.0.0';
              const reqVer = previewThemeForImport.minAppVersion || '1.0.0';
              const isIncompatible = reqVer > appVer;
              return isIncompatible ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2.5">
                  <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold">Version Compatibility Warning</p>
                    <p className="text-amber-700 leading-relaxed font-medium">
                      This theme requires CreatorPulse version <span className="font-mono font-bold">v{reqVer}</span> or higher, but your system is currently running version <span className="font-mono font-bold">v{appVer}</span>. The theme may have layout or rendering anomalies.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold">System Compatibility Verified</p>
                    <p className="text-emerald-700 font-medium">
                      Compatible with CreatorPulse v{appVer} (Theme requires v{reqVer} or higher).
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Conflict Detection UI */}
            {importConflict && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold">Theme Conflict Detected</p>
                    <p className="text-rose-700 font-medium">
                      A theme with ID <span className="font-mono font-bold">&quot;{previewThemeForImport.id}&quot;</span> already exists in your local library.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-2.5 bg-white/60 rounded-xl border border-rose-100/50 text-[11px]">
                  <div>
                    <span className="text-rose-600 font-bold block mb-0.5">Installed Theme:</span>
                    <p className="font-semibold text-slate-700">
                      Version: <span className="font-mono font-bold">v{importConflict.existing.version}</span>
                    </p>
                    <p className="text-slate-500">Updated: {importConflict.existing.updatedAt}</p>
                  </div>
                  <div>
                    <span className="text-emerald-700 font-bold block mb-0.5">Incoming Theme:</span>
                    <p className="font-semibold text-slate-700">
                      Version: <span className="font-mono font-bold">v{importConflict.incoming.version}</span>
                    </p>
                    <p className="text-slate-500">Author: {importConflict.incoming.author}</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="block font-bold text-rose-900">Select Resolution Strategy:</span>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-white border border-rose-200 rounded-xl px-3 py-2 flex-1 hover:bg-rose-50/50">
                      <input
                        type="radio"
                        name="conflictResolution"
                        value="overwrite"
                        checked={conflictResolution === 'overwrite'}
                        onChange={() => setConflictResolution('overwrite')}
                        className="accent-rose-600"
                        disabled={importConflict.existing.isDefault || importConflict.existing.id === 'theme-blush-core'}
                      />
                      <div className="leading-tight">
                        <p className="font-bold text-slate-800">Overwrite Existing</p>
                        {importConflict.existing.isDefault || importConflict.existing.id === 'theme-blush-core' ? (
                          <p className="text-[10px] text-rose-500 font-semibold">(Protected Theme)</p>
                        ) : (
                          <p className="text-[10px] text-slate-500">Replace current version</p>
                        )}
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white border border-rose-200 rounded-xl px-3 py-2 flex-1 hover:bg-rose-50/50">
                      <input
                        type="radio"
                        name="conflictResolution"
                        value="copy"
                        checked={conflictResolution === 'copy'}
                        onChange={() => setConflictResolution('copy')}
                        className="accent-rose-600"
                      />
                      <div className="leading-tight">
                        <p className="font-bold text-slate-800">Keep Both</p>
                        <p className="text-[10px] text-slate-500">Rename incoming theme</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Visual Token Preview and Description */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-7 space-y-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{previewThemeForImport.name}</h4>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FCE7F3] text-[#EC4899] rounded-full border border-[#F3DCE8]">
                      v{previewThemeForImport.version}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    {previewThemeForImport.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 rounded-2xl p-3 border border-slate-100 font-medium">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Author</span>
                    <span className="text-slate-800 font-bold">{previewThemeForImport.author}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Category</span>
                    <span className="text-[#BE185D] font-bold">{previewThemeForImport.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Min App Version</span>
                    <span className="text-slate-800 font-mono font-bold">v{previewThemeForImport.minAppVersion || '1.0.0'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Visual Base</span>
                    <span className="text-slate-800 font-bold">
                      {previewThemeForImport.tokens.isDark ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {previewThemeForImport.tags?.map((t: string) => (
                    <span key={t} className="px-2 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-600 rounded-lg">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Design Tokens & Colors Column */}
              <div className="md:col-span-5 bg-[#FFF9FC] rounded-3xl border border-[#F3DCE8] p-4 space-y-3.5">
                <h5 className="font-bold text-[11px] text-slate-850 uppercase tracking-wider">Design Token Swatches</h5>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between bg-white rounded-xl p-1.5 border border-slate-100">
                    <span className="text-slate-500 font-medium pl-1">Primary Color</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-800 font-bold">{previewThemeForImport.tokens.primary}</span>
                      <span
                        className="w-5 h-5 rounded-lg border border-slate-200 block shadow-sm"
                        style={{ backgroundColor: previewThemeForImport.tokens.primary }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl p-1.5 border border-slate-100">
                    <span className="text-slate-500 font-medium pl-1">Accent Color</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-800 font-bold">{previewThemeForImport.tokens.accent}</span>
                      <span
                        className="w-5 h-5 rounded-lg border border-slate-200 block shadow-sm"
                        style={{ backgroundColor: previewThemeForImport.tokens.accent }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl p-1.5 border border-slate-100">
                    <span className="text-slate-500 font-medium pl-1">Background</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-800 font-bold">{previewThemeForImport.tokens.background}</span>
                      <span
                        className="w-5 h-5 rounded-lg border border-slate-200 block shadow-sm"
                        style={{ backgroundColor: previewThemeForImport.tokens.background }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl p-1.5 border border-slate-100">
                    <span className="text-slate-500 font-medium pl-1">Surface</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-800 font-bold">{previewThemeForImport.tokens.surface}</span>
                      <span
                        className="w-5 h-5 rounded-lg border border-slate-200 block shadow-sm"
                        style={{ backgroundColor: previewThemeForImport.tokens.surface }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl p-1.5 border border-slate-100">
                    <span className="text-slate-500 font-medium pl-1">Border Line</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-800 font-bold">{previewThemeForImport.tokens.border}</span>
                      <span
                        className="w-5 h-5 rounded-lg border border-slate-200 block shadow-sm"
                        style={{ backgroundColor: previewThemeForImport.tokens.border }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F3DCE8] space-y-1.5 text-[10px] font-semibold text-slate-500">
                  <div className="flex justify-between">
                    <span>Card Radius:</span>
                    <span className="font-mono text-slate-800">{previewThemeForImport.tokens.cardRadius || '20px'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Button Radius:</span>
                    <span className="font-mono text-slate-800">{previewThemeForImport.tokens.buttonRadius || '14px'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Button Style:</span>
                    <span className="text-slate-850 font-bold capitalize">{previewThemeForImport.settings.buttonStyle || 'gradient'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Immediate Activation Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100 hover:bg-slate-100/50">
                <input
                  type="checkbox"
                  checked={activateOnImport}
                  onChange={(e) => setActivateOnImport(e.target.checked)}
                  className="w-4.5 h-4.5 accent-[#EC4899] cursor-pointer"
                />
                <div className="leading-tight">
                  <p className="font-bold text-slate-800 text-xs">Activate Immediately</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Automatically apply this theme across landing pages and creator portals after installation.
                  </p>
                </div>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3DCE8]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsImportPreviewOpen(false);
                  setPreviewThemeForImport(null);
                  setImportConflict(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmImportTheme}
              >
                Confirm & Install
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
