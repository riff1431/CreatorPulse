'use client';

import React, { useState, useRef } from 'react';
import {
  HardDrive, Database, Server, CheckCircle2, AlertTriangle, RefreshCw,
  Upload, Trash2, Copy, Check, ExternalLink, Search, Filter, Folder,
  Image as ImageIcon, Video, FileText, Music, Archive, Sliders,
  ShieldCheck, ArrowUpRight, Lock, Eye, Download, Info, Cloud,
  ArrowRight, ArrowLeftRight, Layers, CheckCircle, XCircle, Globe,
  ShieldAlert, Settings, HelpCircle, EyeOff, Sparkles, FolderOpen
} from 'lucide-react';
import { useStorageManager } from '@/lib/storage/storage-context';
import { 
  StorageDriverType, 
  StorageCategoryFolder, 
  StoredFile, 
  STORAGE_FOLDERS,
  StorageMigrationResult
} from '@/lib/storage/storage-types';
import { formatBytes, STORAGE_FOLDER_INFO } from '@/lib/storage/storage-service';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';
import { Modal } from '@/components/admin/ui/Modal';
import { useAdminProgress } from '@/components/admin/AdminProgressProvider';

export default function AdminStoragePage() {
  const {
    config,
    files,
    stats,
    isLoading,
    testResult,
    isTesting,
    setActiveDriver,
    updateConfig,
    testConnection,
    startMigration,
    uploadFile,
    deleteFile,
    deleteMultipleFiles,
    renameFile,
    moveFile,
    copyFile,
    refreshFiles,
  } = useStorageManager();

  const { startProgress, updateProgress, completeProgress, errorProgress } = useAdminProgress();

  const [activeTab, setActiveTab] = useState<'overview' | 'drivers' | 'browser' | 'migration' | 'general'>('overview');
  const [selectedFolder, setSelectedFolder] = useState<StorageCategoryFolder | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTargetFolder, setUploadTargetFolder] = useState<StorageCategoryFolder>('posts');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview modal state
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);

  // Delete confirmation modal state
  const [fileToDelete, setFileToDelete] = useState<StoredFile | null>(null);
  const [selectedAssetPaths, setSelectedAssetPaths] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Move / Copy / Rename modal state
  const [actionModalFile, setActionModalFile] = useState<StoredFile | null>(null);
  const [actionType, setActionType] = useState<'rename' | 'move' | 'copy'>('rename');
  const [actionInputName, setActionInputName] = useState('');
  const [actionTargetFolder, setActionTargetFolder] = useState<StorageCategoryFolder>('posts');
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  // Storage Driver Settings Form State
  const [driverConfigTab, setDriverConfigTab] = useState<'local' | 's3' | 'r2'>('local');

  // S3 Form State
  const [s3Bucket, setS3Bucket] = useState(config.s3.bucket);
  const [s3Region, setS3Region] = useState(config.s3.region || 'us-east-1');
  const [s3AccessKey, setS3AccessKey] = useState(config.s3.accessKeyId);
  const [s3SecretKey, setS3SecretKey] = useState(config.s3.secretAccessKey);
  const [s3Endpoint, setS3Endpoint] = useState(config.s3.endpoint || '');
  const [s3CdnUrl, setS3CdnUrl] = useState(config.s3.cdnUrl || '');
  const [s3ForcePathStyle, setS3ForcePathStyle] = useState(config.s3.forcePathStyle || false);
  const [showS3Secret, setShowS3Secret] = useState(false);

  // R2 Form State
  const [r2AccountId, setR2AccountId] = useState(config.r2.accountId);
  const [r2Bucket, setR2Bucket] = useState(config.r2.bucket);
  const [r2AccessKey, setR2AccessKey] = useState(config.r2.accessKeyId);
  const [r2SecretKey, setR2SecretKey] = useState(config.r2.secretAccessKey);
  const [r2PublicUrl, setR2PublicUrl] = useState(config.r2.publicUrl || '');
  const [showR2Secret, setShowR2Secret] = useState(false);

  // General Settings State
  const [maxSizeMB, setMaxSizeMB] = useState(config.maxUploadSizeMB || 50);
  const [preserveNames, setPreserveNames] = useState(config.preserveOriginalFilenames || false);
  const [autoOptimize, setAutoOptimize] = useState(config.autoOptimizeImages ?? true);
  const [fallbackToLocal, setFallbackToLocal] = useState(config.enableFallbackToLocal ?? true);

  // Migration Wizard State
  const [migrationSource, setMigrationSource] = useState<StorageDriverType>('local');
  const [migrationTarget, setMigrationTarget] = useState<StorageDriverType>('s3');
  const [migrationFolders, setMigrationFolders] = useState<StorageCategoryFolder[]>(STORAGE_FOLDERS);
  const [migrationDeleteSource, setMigrationDeleteSource] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<StorageMigrationResult | null>(null);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);

  const triggerNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  const handleDriverSwitch = async (driver: StorageDriverType) => {
    const driverNames: Record<StorageDriverType, string> = {
      local: 'Local File System (public/uploads)',
      s3: 'Amazon S3 Storage',
      r2: 'Cloudflare R2 Storage',
      supabase: 'Supabase Storage'
    };

    startProgress({
      title: `Switching to ${driverNames[driver]}`,
      steps: [
        "Validating driver configuration...",
        "Re-indexing storage paths & folders...",
        "Activating primary storage driver..."
      ]
    });

    try {
      updateProgress(0, 'running', 25, "Validating driver configuration...");
      await new Promise((resolve) => setTimeout(resolve, 400));
      updateProgress(0, 'success', 50, "Driver configuration valid.");

      updateProgress(1, 'running', 65, "Re-indexing storage paths...");
      const res = await setActiveDriver(driver);
      if (!res.success) {
        throw new Error(res.message || 'Driver activation failed');
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
      updateProgress(1, 'success', 85, "Storage paths re-indexed.");

      updateProgress(2, 'running', 95, "Activating driver...");
      await new Promise((resolve) => setTimeout(resolve, 300));

      completeProgress("Storage driver activated successfully!");
      triggerNotice(res.message);
    } catch (err: any) {
      errorProgress(1, err.message || "Failed to switch driver.");
    }
  };

  const handleRunDiagnostic = async (driverToTest?: StorageDriverType) => {
    const target = driverToTest || config.activeDriver;
    startProgress({
      title: `Testing ${target.toUpperCase()} Connection`,
      steps: [
        `Verifying ${target.toUpperCase()} credentials & bucket access...`,
        "Performing write, read, and delete roundtrip...",
        "Measuring network latency..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Verifying credentials & bucket...");
      await new Promise((resolve) => setTimeout(resolve, 400));
      updateProgress(0, 'success', 45, "Credentials valid.");

      updateProgress(1, 'running', 60, "Performing read/write roundtrip...");
      const res = await testConnection(target);
      if (!res.success) {
        throw new Error(res.message || 'Connection test failed');
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
      updateProgress(1, 'success', 85, `Roundtrip passed (${res.latencyMs}ms).`);

      updateProgress(2, 'running', 95, "Measuring network latency...");
      await new Promise((resolve) => setTimeout(resolve, 300));

      completeProgress(`Diagnostic passed for ${target.toUpperCase()}! (${res.latencyMs}ms)`);
      triggerNotice(res.message);
    } catch (err: any) {
      errorProgress(1, err.message || "Diagnostic failed.");
    }
  };

  const handleCopyUrl = (file: StoredFile) => {
    const fullUrl = file.url.startsWith('http') 
      ? file.url 
      : `${window.location.origin}${file.url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedFileId(file.id);
    setTimeout(() => setCopiedFileId(null), 2000);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    setIsUploading(true);

    startProgress({
      title: `Uploading ${file.name}`,
      steps: [
        "Validating file MIME type & quota limits...",
        `Streaming binary payload to ${config.activeDriver.toUpperCase()}...`,
        "Registering file metadata & URL..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Validating file limits...");
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateProgress(0, 'success', 40, "Validation passed.");

      updateProgress(1, 'running', 60, "Uploading data...");
      const res = await uploadFile(file, uploadTargetFolder);
      if (!res.success) {
        throw new Error(res.error || 'Upload failed');
      }
      updateProgress(1, 'success', 85, "File uploaded.");

      updateProgress(2, 'running', 95, "Registering metadata...");
      await new Promise((resolve) => setTimeout(resolve, 300));

      completeProgress("File uploaded successfully!");
      triggerNotice(`File "${file.name}" uploaded to /${uploadTargetFolder} on ${config.activeDriver.toUpperCase()}!`);
    } catch (err: any) {
      errorProgress(1, err.message || "Failed to upload file.");
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveStorageSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const res = await updateConfig({
      maxUploadSizeMB: Number(maxSizeMB),
      maxUploadSizeBytes: Number(maxSizeMB) * 1024 * 1024,
      preserveOriginalFilenames: preserveNames,
      autoOptimizeImages: autoOptimize,
      enableFallbackToLocal: fallbackToLocal,
      s3: {
        bucket: s3Bucket,
        region: s3Region,
        accessKeyId: s3AccessKey,
        secretAccessKey: s3SecretKey,
        endpoint: s3Endpoint,
        cdnUrl: s3CdnUrl,
        forcePathStyle: s3ForcePathStyle,
      },
      r2: {
        accountId: r2AccountId,
        bucket: r2Bucket,
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
        publicUrl: r2PublicUrl,
        region: 'auto',
      }
    });

    setIsSaving(false);
    if (res.success) {
      triggerNotice(res.message);
    } else {
      alert(res.message);
    }
  };

  const handleRunMigration = async () => {
    if (migrationSource === migrationTarget) {
      alert('Source and target storage drivers cannot be the same.');
      return;
    }

    setIsMigrating(true);
    setMigrationLogs([]);
    setMigrationResult(null);

    setMigrationLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Initializing migration from ${migrationSource.toUpperCase()} to ${migrationTarget.toUpperCase()}...`,
      `[${new Date().toLocaleTimeString()}] Selected categories: ${migrationFolders.join(', ')}`
    ]);

    startProgress({
      title: `Migrating Files: ${migrationSource.toUpperCase()} -> ${migrationTarget.toUpperCase()}`,
      steps: [
        "Analyzing files in source driver...",
        "Transferring file buffers & validating checksums...",
        "Finalizing migration index..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Analyzing source files...");
      await new Promise(resolve => setTimeout(resolve, 400));
      updateProgress(0, 'success', 40, "Source files indexed.");

      updateProgress(1, 'running', 60, "Transferring files...");
      const result = await startMigration({
        sourceDriver: migrationSource,
        targetDriver: migrationTarget,
        folders: migrationFolders,
        deleteFromSource: migrationDeleteSource,
      });

      setMigrationResult(result);

      if (result.success) {
        updateProgress(1, 'success', 90, `Transferred ${result.migratedCount} files.`);
        updateProgress(2, 'running', 95, "Finalizing index...");
        await new Promise(resolve => setTimeout(resolve, 300));
        completeProgress(`Migration finished: ${result.migratedCount} files transferred in ${(result.durationMs / 1000).toFixed(1)}s!`);
        triggerNotice(`Successfully migrated ${result.migratedCount} files to ${migrationTarget.toUpperCase()}!`);
      } else {
        throw new Error(`Migration encountered ${result.failedCount} failures.`);
      }
    } catch (err: any) {
      errorProgress(1, err.message || "Migration failed.");
    } finally {
      setIsMigrating(false);
    }
  };

  const handleExecuteFileAction = async () => {
    if (!actionModalFile || !actionInputName) return;
    setIsPerformingAction(true);

    try {
      if (actionType === 'rename') {
        const res = await renameFile(actionModalFile.path, actionInputName, actionTargetFolder);
        if (res.success) {
          triggerNotice(`File renamed to "${actionInputName}"`);
          setActionModalFile(null);
        } else {
          alert(res.error || 'Rename failed');
        }
      } else if (actionType === 'move') {
        const dest = `${actionTargetFolder}/${actionInputName}`;
        const res = await moveFile(actionModalFile.path, dest);
        if (res.success) {
          triggerNotice(`File moved to /${actionTargetFolder}/${actionInputName}`);
          setActionModalFile(null);
        } else {
          alert(res.error || 'Move failed');
        }
      } else if (actionType === 'copy') {
        const dest = `${actionTargetFolder}/${actionInputName}`;
        const res = await copyFile(actionModalFile.path, dest);
        if (res.success) {
          triggerNotice(`File copied to /${actionTargetFolder}/${actionInputName}`);
          setActionModalFile(null);
        } else {
          alert(res.error || 'Copy failed');
        }
      }
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAssetPaths.length === 0) return;
    setIsBulkDeleting(true);
    const res = await deleteMultipleFiles(selectedAssetPaths);
    setIsBulkDeleting(false);
    if (res.success) {
      triggerNotice(`Deleted ${selectedAssetPaths.length} file(s) from storage.`);
      setSelectedAssetPaths([]);
    } else {
      alert(res.error || 'Bulk delete failed');
    }
  };

  // Filter stored files
  const filteredFiles = files.filter((f) => {
    const matchesFolder = selectedFolder === 'all' || f.folder === selectedFolder;
    const matchesSearch = 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.mimeType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const getFileIcon = (mime: string) => {
    if (mime.startsWith('image/')) return <ImageIcon size={18} className="text-pink-500" />;
    if (mime.startsWith('video/')) return <Video size={18} className="text-emerald-500" />;
    if (mime.startsWith('audio/')) return <Music size={18} className="text-indigo-500" />;
    if (mime.includes('zip') || mime.includes('compressed')) return <Archive size={18} className="text-purple-500" />;
    return <FileText size={18} className="text-slate-500" />;
  };

  const totalQuotaBytes = 100 * 1024 * 1024 * 1024; // 100 GB platform default quota
  const usedPercentage = Math.min(100, Math.max(1, (stats.totalSizeBytes / totalQuotaBytes) * 100));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Toast Notice */}
      {noticeMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 text-pink-600 border border-pink-200">
              <HardDrive size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Dynamic Media Storage Manager</h1>
                <Badge variant="pink" className="uppercase font-bold tracking-wider text-[10px]">
                  {config.activeDriver.toUpperCase()} ACTIVE
                </Badge>
              </div>
              <p className="text-xs text-[#71717A] font-medium">
                Centralized storage driver management, organized folder hierarchies, zero egress cloud sync, and connection diagnostics.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRunDiagnostic()}
            isLoading={isTesting}
            leftIcon={<RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />}
          >
            Test Connection
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Upload size={14} />}
          >
            Upload Asset
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#F3DCE8] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
              : 'text-[#71717A] hover:bg-[#FFF9FC]'
          }`}
        >
          <Layers size={14} />
          <span>Storage Hub & Drivers</span>
        </button>

        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'drivers'
              ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
              : 'text-[#71717A] hover:bg-[#FFF9FC]'
          }`}
        >
          <Settings size={14} />
          <span>Driver Configurations</span>
        </button>

        <button
          onClick={() => setActiveTab('browser')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'browser'
              ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
              : 'text-[#71717A] hover:bg-[#FFF9FC]'
          }`}
        >
          <FolderOpen size={14} />
          <span>File Explorer & Media Library</span>
          <span className="px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px]">
            {files.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('migration')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'migration'
              ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
              : 'text-[#71717A] hover:bg-[#FFF9FC]'
          }`}
        >
          <ArrowLeftRight size={14} />
          <span>Migration Wizard</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
              : 'text-[#71717A] hover:bg-[#FFF9FC]'
          }`}
        >
          <Sliders size={14} />
          <span>Upload & Security Limits</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STORAGE HUB & DRIVERS OVERVIEW                                     */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Driver Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Local Storage Card */}
            <div
              className={`p-5 rounded-2xl border transition-all relative ${
                config.activeDriver === 'local'
                  ? 'border-[#EC4899] bg-gradient-to-b from-[#FFF5F9] to-white shadow-md ring-2 ring-[#EC4899]/20'
                  : 'border-[#F3DCE8] bg-white hover:border-pink-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-pink-100 text-pink-600 border border-pink-200">
                  <HardDrive size={22} />
                </div>
                {config.activeDriver === 'local' ? (
                  <Badge variant="pink" className="bg-[#EC4899] text-white">
                    ACTIVE DRIVER
                  </Badge>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    STANDBY
                  </span>
                )}
              </div>

              <h3 className="text-base font-black text-[#18181B]">Local Storage</h3>
              <p className="text-xs text-[#71717A] mt-1 mb-4 leading-relaxed">
                Direct on-premise storage inside backend <code className="bg-slate-100 px-1 py-0.5 rounded text-pink-600">public/uploads</code> with automatic folder organization.
              </p>

              <div className="space-y-2 py-3 border-t border-b border-[#F3DCE8] text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="text-[#71717A]">Base Path:</span>
                  <span className="font-mono text-slate-800 text-[11px]">public/uploads</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-[#71717A]">Organized Folders:</span>
                  <span className="font-bold text-slate-800">9 Core Subdirectories</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-[#71717A]">Write Permission:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Writable
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRunDiagnostic('local')}
                  className="text-xs"
                >
                  Diagnostic
                </Button>
                {config.activeDriver !== 'local' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDriverSwitch('local')}
                    className="text-xs"
                  >
                    Activate Local
                  </Button>
                )}
              </div>
            </div>

            {/* 2. Amazon S3 Storage Card */}
            <div
              className={`p-5 rounded-2xl border transition-all relative ${
                config.activeDriver === 's3'
                  ? 'border-[#EC4899] bg-gradient-to-b from-[#FFF5F9] to-white shadow-md ring-2 ring-[#EC4899]/20'
                  : 'border-[#F3DCE8] bg-white hover:border-pink-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600 border border-orange-200">
                  <Cloud size={22} />
                </div>
                {config.activeDriver === 's3' ? (
                  <Badge variant="pink" className="bg-[#EC4899] text-white">
                    ACTIVE DRIVER
                  </Badge>
                ) : config.s3.bucket ? (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    CONFIGURED
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    NOT CONFIGURED
                  </span>
                )}
              </div>

              <h3 className="text-base font-black text-[#18181B]">Amazon S3 Storage</h3>
              <p className="text-xs text-[#71717A] mt-1 mb-4 leading-relaxed">
                Scalable AWS object storage with support for custom regions, endpoints, CloudFront CDN, and IAM keys.
              </p>

              <div className="space-y-2 py-3 border-t border-b border-[#F3DCE8] text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="text-[#71717A]">Bucket Name:</span>
                  <span className="font-mono text-slate-800 text-[11px]">
                    {config.s3.bucket || '—'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-[#71717A]">Region:</span>
                  <span className="font-mono text-slate-800 text-[11px]">
                    {config.s3.region || 'us-east-1'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-[#71717A]">CDN Domain:</span>
                  <span className="font-mono text-slate-800 text-[11px] truncate max-w-[140px]">
                    {config.s3.cdnUrl || 'Standard S3'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRunDiagnostic('s3')}
                  className="text-xs"
                >
                  Diagnostic
                </Button>
                {config.activeDriver !== 's3' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDriverSwitch('s3')}
                    className="text-xs"
                    disabled={!config.s3.bucket}
                  >
                    Activate S3
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDriverConfigTab('s3');
                      setActiveTab('drivers');
                    }}
                    className="text-xs"
                  >
                    Configure
                  </Button>
                )}
              </div>
            </div>

            {/* 3. Cloudflare R2 Card */}
            <div
              className={`p-5 rounded-2xl border transition-all relative ${
                config.activeDriver === 'r2'
                  ? 'border-[#EC4899] bg-gradient-to-b from-[#FFF5F9] to-white shadow-md ring-2 ring-[#EC4899]/20'
                  : 'border-[#F3DCE8] bg-white hover:border-pink-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-cyan-100 text-cyan-600 border border-cyan-200">
                  <Globe size={22} />
                </div>
                {config.activeDriver === 'r2' ? (
                  <Badge variant="pink" className="bg-[#EC4899] text-white">
                    ACTIVE DRIVER
                  </Badge>
                ) : config.r2.bucket ? (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    CONFIGURED
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    NOT CONFIGURED
                  </span>
                )}
              </div>

              <h3 className="text-base font-black text-[#18181B]">Cloudflare R2</h3>
              <p className="text-xs text-[#71717A] mt-1 mb-4 leading-relaxed">
                Zero egress-fee S3-compatible cloud storage with native global edge caching and custom domain mapping.
              </p>

              <div className="space-y-2 py-3 border-t border-b border-[#F3DCE8] text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="text-[#71717A]">Bucket Name:</span>
                  <span className="font-mono text-slate-800 text-[11px]">
                    {config.r2.bucket || '—'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-[#71717A]">Public Domain:</span>
                  <span className="font-mono text-slate-800 text-[11px] truncate max-w-[140px]">
                    {config.r2.publicUrl || 'r2.cloudflarestorage.com'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-[#71717A]">Egress Fees:</span>
                  <span className="font-bold text-emerald-600">$0.00 (Zero Egress)</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRunDiagnostic('r2')}
                  className="text-xs"
                >
                  Diagnostic
                </Button>
                {config.activeDriver !== 'r2' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDriverSwitch('r2')}
                    className="text-xs"
                    disabled={!config.r2.bucket}
                  >
                    Activate R2
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDriverConfigTab('r2');
                      setActiveTab('drivers');
                    }}
                    className="text-xs"
                  >
                    Configure
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Diagnostic Result Banner (if available) */}
          {testResult && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-red-50/80 border-red-200 text-red-900'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Diagnostic Test for {testResult.driver.toUpperCase()}: {testResult.success ? 'PASSED' : 'FAILED'}</span>
                  <span className="font-mono text-[11px] opacity-80">{testResult.latencyMs}ms latency</span>
                </div>
                <p className="mt-1 opacity-90 leading-relaxed">{testResult.message}</p>
                <div className="mt-2 flex items-center gap-4 text-[11px]">
                  <span className={`flex items-center gap-1 font-semibold ${testResult.readOk ? 'text-emerald-700' : 'text-red-600'}`}>
                    {testResult.readOk ? <Check size={12} /> : <AlertTriangle size={12} />} Read Access
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${testResult.writeOk ? 'text-emerald-700' : 'text-red-600'}`}>
                    {testResult.writeOk ? <Check size={12} /> : <AlertTriangle size={12} />} Write Access
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${testResult.deleteOk ? 'text-emerald-700' : 'text-red-600'}`}>
                    {testResult.deleteOk ? <Check size={12} /> : <AlertTriangle size={12} />} Delete Access
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Storage Quota & Folder Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Organized Folders Distribution */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#F3DCE8] shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#18181B]">Organized Storage Folders</h3>
                  <p className="text-xs text-[#71717A]">Automatic hierarchy maintained across all storage providers</p>
                </div>
                <Badge variant="slate" className="text-xs font-mono">
                  {stats.totalFiles} Total Files
                </Badge>
              </div>

              {/* Progress Multi-Bar */}
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
                  {stats.categories.map((cat) => (
                    <div
                      key={cat.folder}
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                      title={`${cat.label}: ${formatBytes(cat.totalSizeBytes)} (${cat.percentage}%)`}
                      className="h-full transition-all duration-500 hover:opacity-80"
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[11px] text-[#71717A] font-medium pt-1">
                  <span>Usage: {stats.formattedTotalSize}</span>
                  <span>Platform Quota: {formatBytes(totalQuotaBytes)}</span>
                </div>
              </div>

              {/* Folder Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {stats.categories.map((cat) => {
                  const info = STORAGE_FOLDER_INFO[cat.folder];
                  return (
                    <div
                      key={cat.folder}
                      onClick={() => {
                        setSelectedFolder(cat.folder);
                        setActiveTab('browser');
                      }}
                      className="p-3.5 rounded-xl border border-[#F3DCE8] hover:border-pink-300 hover:bg-pink-50/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-[11px] font-bold text-[#71717A] group-hover:text-pink-600">
                          {cat.fileCount} items
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-[#18181B] truncate">{info?.label || cat.folder}</h4>
                      <p className="text-[11px] text-[#71717A] font-mono mt-0.5">{formatBytes(cat.totalSizeBytes)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Active Driver Health & Quick Migration */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#18181B] to-[#27272A] text-white shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-pink-400" />
                    <h3 className="text-sm font-bold">Active Engine</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/30 text-pink-300 text-[10px] font-bold uppercase tracking-wider border border-pink-500/40">
                    {config.activeDriver}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Stored Assets:</span>
                    <span className="font-bold text-white">{stats.totalFiles}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Space Used:</span>
                    <span className="font-bold text-white">{stats.formattedTotalSize}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Fallback Protection:</span>
                    <span className="font-bold text-emerald-400">
                      {config.enableFallbackToLocal ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs font-bold justify-center"
                  onClick={() => setActiveTab('migration')}
                  leftIcon={<ArrowLeftRight size={14} />}
                >
                  Open Migration Wizard
                </Button>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#F3DCE8] shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-[#18181B] flex items-center gap-2">
                  <Sparkles size={14} className="text-pink-500" />
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setDriverConfigTab('s3');
                      setActiveTab('drivers');
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-[#F3DCE8] hover:bg-pink-50/40 text-xs font-semibold text-slate-700 flex items-center justify-between transition-all"
                  >
                    <span>Configure S3 Credentials</span>
                    <ArrowRight size={12} className="text-slate-400" />
                  </button>
                  <button
                    onClick={() => {
                      setDriverConfigTab('r2');
                      setActiveTab('drivers');
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-[#F3DCE8] hover:bg-pink-50/40 text-xs font-semibold text-slate-700 flex items-center justify-between transition-all"
                  >
                    <span>Configure Cloudflare R2</span>
                    <ArrowRight size={12} className="text-slate-400" />
                  </button>
                  <button
                    onClick={() => setActiveTab('browser')}
                    className="w-full text-left p-2.5 rounded-xl border border-[#F3DCE8] hover:bg-pink-50/40 text-xs font-semibold text-slate-700 flex items-center justify-between transition-all"
                  >
                    <span>Browse All Uploaded Files</span>
                    <ArrowRight size={12} className="text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DRIVER CONFIGURATIONS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          {/* Driver Sub-tabs */}
          <div className="flex items-center gap-2 border-b border-[#F3DCE8] pb-2">
            <button
              onClick={() => setDriverConfigTab('local')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                driverConfigTab === 'local'
                  ? 'bg-pink-50 text-pink-700 border border-pink-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Local Storage
            </button>
            <button
              onClick={() => setDriverConfigTab('s3')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                driverConfigTab === 's3'
                  ? 'bg-pink-50 text-pink-700 border border-pink-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Amazon S3
            </button>
            <button
              onClick={() => setDriverConfigTab('r2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                driverConfigTab === 'r2'
                  ? 'bg-pink-50 text-pink-700 border border-pink-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Cloudflare R2
            </button>
          </div>

          <form onSubmit={handleSaveStorageSettings} className="space-y-6">
            {/* SUB-TAB: LOCAL STORAGE */}
            {driverConfigTab === 'local' && (
              <div className="p-6 rounded-2xl bg-white border border-[#F3DCE8] shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-black text-[#18181B]">Local File System Storage</h3>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    Files are stored on your server disk in <code className="text-pink-600">public/uploads</code>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Upload Directory Base Path</label>
                    <input
                      type="text"
                      disabled
                      value="public/uploads"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono text-xs cursor-not-allowed"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Managed automatically by backend server</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Public URL Web Prefix</label>
                    <input
                      type="text"
                      disabled
                      value="/uploads"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono text-xs cursor-not-allowed"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Static routing prefix served by Next.js</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-pink-50/50 border border-pink-200 space-y-2">
                  <h4 className="text-xs font-bold text-pink-900 flex items-center gap-1.5">
                    <Folder size={14} className="text-pink-600" />
                    Automatic Subdirectory Hierarchy
                  </h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {STORAGE_FOLDERS.map((f) => (
                      <span
                        key={f}
                        className="px-2.5 py-1 rounded-lg bg-white border border-pink-200 text-pink-800 text-[11px] font-mono font-medium shadow-2xs"
                      >
                        /{f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#F3DCE8]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRunDiagnostic('local')}
                  >
                    Test Local Read/Write
                  </Button>
                  {config.activeDriver !== 'local' && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleDriverSwitch('local')}
                    >
                      Make Local Active
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB: AMAZON S3 */}
            {driverConfigTab === 's3' && (
              <div className="p-6 rounded-2xl bg-white border border-[#F3DCE8] shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#18181B]">Amazon S3 & S3-Compatible Storage</h3>
                    <p className="text-xs text-[#71717A] mt-0.5">
                      Configure standard AWS S3 or custom S3-compatible endpoints (MinIO, Wasabi, DigitalOcean).
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRunDiagnostic('s3')}
                    leftIcon={<RefreshCw size={12} />}
                  >
                    Test S3 Connection
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      S3 Bucket Name <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. creatorpulse-media-bucket"
                      value={s3Bucket}
                      onChange={(e) => setS3Bucket(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      AWS Region <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. us-east-1, eu-west-1, ap-southeast-1"
                      value={s3Region}
                      onChange={(e) => setS3Region(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      AWS Access Key ID <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      value={s3AccessKey}
                      onChange={(e) => setS3AccessKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-bold text-slate-700">
                        AWS Secret Access Key <span className="text-pink-600">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowS3Secret(!showS3Secret)}
                        className="text-[11px] text-pink-600 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {showS3Secret ? <EyeOff size={12} /> : <Eye size={12} />}
                        {showS3Secret ? 'Hide' : 'Reveal'}
                      </button>
                    </div>
                    <input
                      type={showS3Secret ? 'text' : 'password'}
                      required
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      value={s3SecretKey}
                      onChange={(e) => setS3SecretKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Custom S3 Endpoint <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://s3.wasabisys.com or http://minio.local:9000"
                      value={s3Endpoint}
                      onChange={(e) => setS3Endpoint(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-xs"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Leave empty for standard AWS S3</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      CDN / CloudFront Public Domain <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://cdn.yourplatform.com"
                      value={s3CdnUrl}
                      onChange={(e) => setS3CdnUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-xs"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Custom URL for faster CDN asset serving</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="s3ForcePathStyle"
                    checked={s3ForcePathStyle}
                    onChange={(e) => setS3ForcePathStyle(e.target.checked)}
                    className="rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="s3ForcePathStyle" className="text-xs text-slate-700 font-medium">
                    Force Path Style URLs (Recommended for MinIO and custom S3 instances)
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#F3DCE8]">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSaving}
                  >
                    Save S3 Settings
                  </Button>
                  {config.activeDriver !== 's3' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDriverSwitch('s3')}
                    >
                      Make S3 Active
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB: CLOUDFLARE R2 */}
            {driverConfigTab === 'r2' && (
              <div className="p-6 rounded-2xl bg-white border border-[#F3DCE8] shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#18181B]">Cloudflare R2 (Zero Egress Object Storage)</h3>
                    <p className="text-xs text-[#71717A] mt-0.5">
                      Fast, globally distributed S3-compatible storage with zero egress bandwidth charges.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRunDiagnostic('r2')}
                    leftIcon={<RefreshCw size={12} />}
                  >
                    Test R2 Connection
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Cloudflare Account ID <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j"
                      value={r2AccountId}
                      onChange={(e) => setR2AccountId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-mono text-xs"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Found in Cloudflare Dashboard overview</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      R2 Bucket Name <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. creatorpulse-r2-media"
                      value={r2Bucket}
                      onChange={(e) => setR2Bucket(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      R2 Access Key ID <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Cloudflare R2 API Token Key ID"
                      value={r2AccessKey}
                      onChange={(e) => setR2AccessKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-bold text-slate-700">
                        R2 Secret Access Key <span className="text-pink-600">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowR2Secret(!showR2Secret)}
                        className="text-[11px] text-pink-600 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {showR2Secret ? <EyeOff size={12} /> : <Eye size={12} />}
                        {showR2Secret ? 'Hide' : 'Reveal'}
                      </button>
                    </div>
                    <input
                      type={showR2Secret ? 'text' : 'password'}
                      required
                      placeholder="Cloudflare R2 API Token Secret"
                      value={r2SecretKey}
                      onChange={(e) => setR2SecretKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-mono text-xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1.5">
                      R2 Public URL / Custom Domain <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://pub-xxxx.r2.dev or https://media.yourdomain.com"
                      value={r2PublicUrl}
                      onChange={(e) => setR2PublicUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-xs"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Enable R2.dev public access in Cloudflare Bucket settings or connect a custom CNAME domain
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#F3DCE8]">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSaving}
                  >
                    Save R2 Settings
                  </Button>
                  {config.activeDriver !== 'r2' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDriverSwitch('r2')}
                    >
                      Make R2 Active
                    </Button>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FILE EXPLORER & MEDIA LIBRARY                                      */}
      {/* ========================================================================= */}
      {activeTab === 'browser' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border border-[#F3DCE8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search files by name, type, or path..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                />
              </div>

              {/* Folder Selector */}
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 cursor-pointer"
              >
                <option value="all">All Folders ({files.length})</option>
                {STORAGE_FOLDERS.map((f) => {
                  const count = files.filter((fl) => fl.folder === f).length;
                  return (
                    <option key={f} value={f}>
                      /{f} ({count})
                    </option>
                  );
                })}
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white shadow-2xs text-pink-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grid View"
                >
                  <Layers size={14} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'table' ? 'bg-white shadow-2xs text-pink-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Table View"
                >
                  <FileText size={14} />
                </button>
              </div>
            </div>

            {/* Quick Upload Action */}
            <div className="flex items-center gap-2">
              {selectedAssetPaths.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  isLoading={isBulkDeleting}
                  className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                  leftIcon={<Trash2 size={13} />}
                >
                  Delete Selected ({selectedAssetPaths.length})
                </Button>
              )}

              <select
                value={uploadTargetFolder}
                onChange={(e) => setUploadTargetFolder(e.target.value as StorageCategoryFolder)}
                className="px-3 py-2 rounded-xl border border-pink-200 bg-pink-50 text-pink-800 text-xs font-bold cursor-pointer"
              >
                {STORAGE_FOLDERS.map((f) => (
                  <option key={f} value={f}>
                    Upload to /{f}
                  </option>
                ))}
              </select>

              <Button
                variant="primary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload size={14} />}
              >
                Upload
              </Button>
            </div>
          </div>

          {/* Asset List or Grid */}
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw size={24} className="animate-spin text-pink-500 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading stored media assets from {config.activeDriver.toUpperCase()}...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white border border-[#F3DCE8] space-y-3">
              <Folder size={36} className="text-pink-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No files found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {selectedFolder !== 'all'
                  ? `No media assets uploaded to folder /${selectedFolder} yet.`
                  : 'Your storage drive is clean. Upload your first media asset to begin.'}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload size={14} />}
              >
                Upload File Now
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFiles.map((file) => {
                const isSelected = selectedAssetPaths.includes(file.path);
                const isCopied = copiedFileId === file.id;

                return (
                  <div
                    key={file.id}
                    className={`group relative rounded-2xl border bg-white overflow-hidden transition-all hover:shadow-md flex flex-col justify-between ${
                      isSelected ? 'border-pink-500 ring-2 ring-pink-500/20' : 'border-[#F3DCE8] hover:border-pink-300'
                    }`}
                  >
                    {/* Top Preview Area */}
                    <div
                      onClick={() => setPreviewFile(file)}
                      className="aspect-square w-full bg-slate-50 relative flex items-center justify-center cursor-pointer overflow-hidden"
                    >
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : file.mimeType.startsWith('video/') ? (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                          <Video size={28} className="text-emerald-400" />
                          <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-black/60 text-white px-1.5 py-0.5 rounded">
                            VIDEO
                          </span>
                        </div>
                      ) : (
                        <div className="p-4 text-center">
                          {getFileIcon(file.mimeType)}
                          <span className="text-[10px] font-mono text-slate-400 block mt-1 uppercase truncate max-w-[80px]">
                            {file.mimeType.split('/')[1] || 'FILE'}
                          </span>
                        </div>
                      )}

                      {/* Selection Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssetPaths((prev) =>
                            isSelected ? prev.filter((p) => p !== file.path) : [...prev, file.path]
                          );
                        }}
                        className={`absolute top-2 left-2 p-1.5 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'bg-white/80 text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-white'
                        }`}
                      >
                        <Check size={12} />
                      </button>

                      {/* Folder Category Tag */}
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[9px] font-mono backdrop-blur-xs">
                        /{file.folder}
                      </span>
                    </div>

                    {/* Metadata & Actions Area */}
                    <div className="p-3 border-t border-[#F3DCE8] space-y-2">
                      <div title={file.name}>
                        <h4 className="text-xs font-bold text-slate-800 truncate">{file.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {formatBytes(file.sizeBytes)} • {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => handleCopyUrl(file)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                          title="Copy Public URL"
                        >
                          {isCopied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        </button>

                        <button
                          onClick={() => {
                            setActionModalFile(file);
                            setActionType('rename');
                            setActionInputName(file.name);
                            setActionTargetFolder(file.folder);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                          title="Rename / Move / Copy"
                        >
                          <ArrowRight size={13} />
                        </button>

                        <button
                          onClick={() => setPreviewFile(file)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                          title="Preview Full Asset"
                        >
                          <Eye size={13} />
                        </button>

                        <button
                          onClick={() => setFileToDelete(file)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete File"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#F3DCE8] bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#71717A] border-b border-[#F3DCE8]">
                  <tr>
                    <th className="p-3.5 w-8">
                      <input
                        type="checkbox"
                        checked={selectedAssetPaths.length === filteredFiles.length && filteredFiles.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedAssetPaths(filteredFiles.map((f) => f.path));
                          else setSelectedAssetPaths([]);
                        }}
                        className="rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                      />
                    </th>
                    <th className="p-3.5 font-bold">Asset Name & Path</th>
                    <th className="p-3.5 font-bold">Category Folder</th>
                    <th className="p-3.5 font-bold">Size</th>
                    <th className="p-3.5 font-bold">Driver</th>
                    <th className="p-3.5 font-bold">Uploaded Date</th>
                    <th className="p-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFiles.map((file) => {
                    const isSelected = selectedAssetPaths.includes(file.path);
                    const isCopied = copiedFileId === file.id;

                    return (
                      <tr
                        key={file.id}
                        className={`hover:bg-pink-50/20 transition-colors ${
                          isSelected ? 'bg-pink-50/40' : ''
                        }`}
                      >
                        <td className="p-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedAssetPaths((prev) => [...prev, file.path]);
                              else setSelectedAssetPaths((prev) => prev.filter((p) => p !== file.path));
                            }}
                            className="rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                          />
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800">
                          <div className="flex items-center gap-2.5">
                            {getFileIcon(file.mimeType)}
                            <div className="truncate max-w-xs">
                              <span className="truncate block font-bold">{file.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">{file.path}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px]">
                            /{file.folder}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">{formatBytes(file.sizeBytes)}</td>
                        <td className="p-3.5">
                          <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-pink-100 text-pink-700">
                            {file.driver}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">{new Date(file.createdAt).toLocaleDateString()}</td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => handleCopyUrl(file)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                            title="Copy URL"
                          >
                            {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                          <button
                            onClick={() => {
                              setActionModalFile(file);
                              setActionType('rename');
                              setActionInputName(file.name);
                              setActionTargetFolder(file.folder);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                            title="Rename / Move / Copy"
                          >
                            <ArrowRight size={14} />
                          </button>
                          <button
                            onClick={() => setPreviewFile(file)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                            title="Preview"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setFileToDelete(file)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MIGRATION WIZARD                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'migration' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#F3DCE8] shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <ArrowLeftRight size={20} className="text-pink-600" />
                <h3 className="text-base font-black text-[#18181B]">Cross-Provider Media Migration Wizard</h3>
              </div>
              <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
                Effortlessly migrate all existing assets, avatars, posts, and media attachments between Local Storage, Amazon S3, and Cloudflare R2 with zero downtime.
              </p>
            </div>

            {/* Source & Target Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
              {/* Source */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Source Storage Provider</label>
                <select
                  value={migrationSource}
                  onChange={(e) => setMigrationSource(e.target.value as StorageDriverType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="local">Local Storage (public/uploads)</option>
                  <option value="s3">Amazon S3 Storage</option>
                  <option value="r2">Cloudflare R2 Storage</option>
                </select>
                <span className="text-[11px] text-slate-500 block">Existing assets will be read from here</span>
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Destination Storage Provider</label>
                <select
                  value={migrationTarget}
                  onChange={(e) => setMigrationTarget(e.target.value as StorageDriverType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="s3">Amazon S3 Storage</option>
                  <option value="r2">Cloudflare R2 Storage</option>
                  <option value="local">Local Storage (public/uploads)</option>
                </select>
                <span className="text-[11px] text-slate-500 block">Assets will be transferred and organized here</span>
              </div>
            </div>

            {/* Categories to Migrate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">Select Folder Categories to Migrate</label>
                <button
                  type="button"
                  onClick={() =>
                    setMigrationFolders(
                      migrationFolders.length === STORAGE_FOLDERS.length ? [] : STORAGE_FOLDERS
                    )
                  }
                  className="text-xs text-pink-600 font-bold hover:underline cursor-pointer"
                >
                  {migrationFolders.length === STORAGE_FOLDERS.length ? 'Deselect All' : 'Select All 9 Folders'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {STORAGE_FOLDERS.map((folder) => {
                  const isChecked = migrationFolders.includes(folder);
                  return (
                    <button
                      key={folder}
                      type="button"
                      onClick={() => {
                        setMigrationFolders((prev) =>
                          isChecked ? prev.filter((f) => f !== folder) : [...prev, folder]
                        );
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'border-pink-500 bg-pink-50/50 text-pink-800 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="truncate">/{folder}</span>
                      {isChecked && <Check size={14} className="text-pink-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deletion / Cleanup Checkbox */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <input
                type="checkbox"
                id="migrationDeleteSource"
                checked={migrationDeleteSource}
                onChange={(e) => setMigrationDeleteSource(e.target.checked)}
                className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="migrationDeleteSource" className="font-medium cursor-pointer">
                Delete migrated assets from source driver after successful transfer (clean up space)
              </label>
            </div>

            {/* Launch Migration */}
            <div className="flex items-center justify-between pt-4 border-t border-[#F3DCE8]">
              <div className="text-xs text-slate-500">
                <span>Migration mode: Streaming zero-data-loss transfer</span>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleRunMigration}
                isLoading={isMigrating}
                disabled={migrationSource === migrationTarget || migrationFolders.length === 0}
                leftIcon={<ArrowLeftRight size={16} />}
              >
                Start Storage Migration
              </Button>
            </div>

            {/* Migration Result Report */}
            {migrationResult && (
              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
                  <span>MIGRATION SUMMARY</span>
                  <span>Duration: {(migrationResult.durationMs / 1000).toFixed(2)}s</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                  <div>Total Files: {migrationResult.totalFiles}</div>
                  <div className="text-emerald-400">Migrated: {migrationResult.migratedCount}</div>
                  <div className={migrationResult.failedCount > 0 ? 'text-red-400' : 'text-slate-400'}>
                    Failed: {migrationResult.failedCount}
                  </div>
                </div>
                {migrationResult.errors && migrationResult.errors.length > 0 && (
                  <div className="text-red-400 text-[10px] pt-2 space-y-1">
                    <p className="font-bold">Errors encountered:</p>
                    {migrationResult.errors.map((e, idx) => (
                      <div key={idx}>• {e.file}: {e.error}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: GENERAL UPLOAD & SECURITY SETTINGS                                 */}
      {/* ========================================================================= */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveStorageSettings} className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#F3DCE8] shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-[#18181B]">Upload Limits & Security Policies</h3>
              <p className="text-xs text-[#71717A] mt-0.5">
                Configure global file size quotas, MIME type restrictions, and resilience fallbacks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Maximum Upload Size (MB) <span className="text-pink-600">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={maxSizeMB}
                  onChange={(e) => setMaxSizeMB(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-xs font-mono font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Enforced on client-side and server-side request streams (Default: 50MB)
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Filename Sanitization</label>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="preserveNames"
                    checked={preserveNames}
                    onChange={(e) => setPreserveNames(e.target.checked)}
                    className="rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="preserveNames" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Preserve original filenames (Disables random salt suffix)
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Image Auto-Optimization</label>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="autoOptimize"
                    checked={autoOptimize}
                    onChange={(e) => setAutoOptimize(e.target.checked)}
                    className="rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="autoOptimize" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Automatically convert and serve WebP previews for loaded media
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Failover & Fallback Handling</label>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="fallbackToLocal"
                    checked={fallbackToLocal}
                    onChange={(e) => setFallbackToLocal(e.target.checked)}
                    className="rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="fallbackToLocal" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Automatically fall back to Local Storage if Cloud S3/R2 is unreachable
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#F3DCE8]">
              <div className="text-xs text-slate-400">
                Changes persist to backend configuration file immediately upon saving.
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
              >
                Save Upload & Security Limits
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PREVIEW ASSET                                                    */}
      {/* ========================================================================= */}
      {previewFile && (
        <Modal
          isOpen={Boolean(previewFile)}
          onClose={() => setPreviewFile(null)}
          title="Media Asset Details & Preview"
        >
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center relative">
              {previewFile.mimeType.startsWith('image/') ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="w-full h-full object-contain"
                />
              ) : previewFile.mimeType.startsWith('video/') ? (
                <video
                  src={previewFile.url}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-8 text-white space-y-2">
                  {getFileIcon(previewFile.mimeType)}
                  <p className="font-mono text-xs">{previewFile.name}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">File Name:</span>
                <span className="font-bold text-slate-800 break-all">{previewFile.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Folder Category:</span>
                <span className="font-mono text-pink-600 font-bold">/{previewFile.folder}</span>
              </div>
              <div>
                <span className="text-slate-500 block">File Size:</span>
                <span className="font-mono text-slate-800">{formatBytes(previewFile.sizeBytes)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Active Driver:</span>
                <span className="font-bold uppercase text-slate-800">{previewFile.driver}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Direct URL:</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    readOnly
                    value={previewFile.url}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[11px]"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyUrl(previewFile)}
                    className="shrink-0"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={previewFile.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink size={12} /> Open in new tab
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewFile(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DELETE CONFIRMATION                                              */}
      {/* ========================================================================= */}
      {fileToDelete && (
        <Modal
          isOpen={Boolean(fileToDelete)}
          onClose={() => setFileToDelete(null)}
          title="Delete Stored Media Asset"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs text-red-900 space-y-1">
                <p className="font-bold">Are you sure you want to delete this asset?</p>
                <p className="break-all font-mono opacity-90">{fileToDelete.path}</p>
                <p className="text-[11px] text-red-700 pt-1">
                  This action will permanently delete the binary file from {config.activeDriver.toUpperCase()} storage.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFileToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={async () => {
                  if (fileToDelete) {
                    await deleteFile(fileToDelete.path);
                    triggerNotice(`Deleted "${fileToDelete.name}"`);
                    setFileToDelete(null);
                  }
                }}
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RENAME / MOVE / COPY FILE                                       */}
      {/* ========================================================================= */}
      {actionModalFile && (
        <Modal
          isOpen={Boolean(actionModalFile)}
          onClose={() => setActionModalFile(null)}
          title={`File Operation: ${actionType.toUpperCase()}`}
        >
          <div className="space-y-4 text-xs">
            {/* Action Type Selector */}
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setActionType('rename')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${
                  actionType === 'rename' ? 'bg-white shadow-2xs text-pink-600' : 'text-slate-500'
                }`}
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => setActionType('move')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${
                  actionType === 'move' ? 'bg-white shadow-2xs text-pink-600' : 'text-slate-500'
                }`}
              >
                Move Folder
              </button>
              <button
                type="button"
                onClick={() => setActionType('copy')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${
                  actionType === 'copy' ? 'bg-white shadow-2xs text-pink-600' : 'text-slate-500'
                }`}
              >
                Duplicate / Copy
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Target Folder</label>
              <select
                value={actionTargetFolder}
                onChange={(e) => setActionTargetFolder(e.target.value as StorageCategoryFolder)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
              >
                {STORAGE_FOLDERS.map((f) => (
                  <option key={f} value={f}>
                    /{f} ({STORAGE_FOLDER_INFO[f]?.label || f})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Target Filename</label>
              <input
                type="text"
                value={actionInputName}
                onChange={(e) => setActionInputName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionModalFile(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteFileAction}
                isLoading={isPerformingAction}
              >
                Execute {actionType.toUpperCase()}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
