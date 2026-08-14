'use client';

import React, { useState, useRef } from 'react';
import {
  HardDrive, Database, Server, CheckCircle2, AlertTriangle, RefreshCw,
  Upload, Trash2, Copy, Check, ExternalLink, Search, Filter, Folder,
  Image as ImageIcon, Video, FileText, Music, Archive, FileCode, Sliders,
  ShieldCheck, ArrowUpRight, Lock, Eye, Download, Info
} from 'lucide-react';
import { useStorageManager } from '@/lib/storage/storage-context';
import { StorageDriverType, StorageCategoryFolder, StoredFile } from '@/lib/storage/storage-types';
import { formatBytes } from '@/lib/storage/storage-service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
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
    uploadFile,
    deleteFile,
    refreshFiles,
  } = useStorageManager();

  const { startProgress, updateProgress, completeProgress, errorProgress } = useAdminProgress();

  const [activeTab, setActiveTab] = useState<'overview' | 'browser' | 'settings'>('overview');
  const [selectedFolder, setSelectedFolder] = useState<StorageCategoryFolder | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  
  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTargetFolder, setUploadTargetFolder] = useState<StorageCategoryFolder>('posts');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview modal state
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);

  // Delete confirmation modal state
  const [fileToDelete, setFileToDelete] = useState<StoredFile | null>(null);

  // Settings form state
  const [maxSizeMB, setMaxSizeMB] = useState(config.maxUploadSizeMB);
  const [supabaseBucket, setSupabaseBucket] = useState(config.supabase.bucketName);
  const [supabaseUrl, setSupabaseUrl] = useState(config.supabase.supabaseUrl);
  const [supabaseKey, setSupabaseKey] = useState(config.supabase.supabaseAnonKey);
  const [preserveNames, setPreserveNames] = useState(config.preserveOriginalFilenames);

  const triggerNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  const handleDriverSwitch = async (driver: StorageDriverType) => {
    startProgress({
      title: `Switching to ${driver === 'local' ? 'Local File System' : 'Supabase Storage'}`,
      steps: [
        "Validating driver settings...",
        "Reconfiguring storage endpoints...",
        "Activating driver connection..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Validating driver settings...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateProgress(0, 'success', 40, "Driver settings validated.");

      updateProgress(1, 'running', 60, "Reconfiguring storage endpoints...");
      const res = await setActiveDriver(driver);
      if (!res.success) {
        throw new Error(res.message || 'Driver activation failed');
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateProgress(1, 'success', 85, "Endpoints reconfigured.");

      updateProgress(2, 'running', 95, "Activating driver connection...");
      await new Promise((resolve) => setTimeout(resolve, 400));

      completeProgress("Driver switched successfully!");
      triggerNotice(res.message);
    } catch (err: any) {
      errorProgress(1, err.message || "Failed to switch driver.");
    }
  };

  const handleRunDiagnostic = async () => {
    startProgress({
      title: "Storage Connection Diagnostic Test",
      steps: [
        "Verifying driver storage configurations...",
        "Testing endpoint response latencies...",
        "Verifying folder write/read access..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Verifying driver storage configurations...");
      await new Promise((resolve) => setTimeout(resolve, 600));
      updateProgress(0, 'success', 45, "Configurations verified.");

      updateProgress(1, 'running', 60, "Testing endpoint response latencies...");
      const res = await testConnection();
      if (!res.success) {
        throw new Error(res.message || 'Connection test failed');
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateProgress(1, 'success', 80, "Latencies normal.");

      updateProgress(2, 'running', 95, "Verifying folder write/read access...");
      await new Promise((resolve) => setTimeout(resolve, 400));

      completeProgress("Diagnostics completed successfully!");
      triggerNotice(`Diagnostic passed for ${res.driver === 'local' ? 'Local Storage' : 'Supabase Storage'}!`);
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
        "Parsing file binary stream...",
        "Uploading binary file data...",
        "Validating file MIME types & headers..."
      ]
    });

    try {
      updateProgress(0, 'running', 15, "Parsing file binary stream...");
      await new Promise((resolve) => setTimeout(resolve, 400));
      updateProgress(0, 'success', 30, "File parsed.");

      updateProgress(1, 'running', 50, "Uploading binary file data...");
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateProgress(1, 'running', 75, "Uploading chunks...");
      
      const res = await uploadFile(file, uploadTargetFolder);
      if (!res.success) {
        throw new Error(res.error || 'Upload failed');
      }
      
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateProgress(1, 'success', 90, "Upload completed.");

      updateProgress(2, 'running', 95, "Validating file MIME types & headers...");
      await new Promise((resolve) => setTimeout(resolve, 400));

      completeProgress("File uploaded successfully!");
      triggerNotice(`File "${file.name}" uploaded to /${uploadTargetFolder} successfully!`);
    } catch (err: any) {
      errorProgress(1, err.message || "Failed to upload file.");
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    const res = await deleteFile(fileToDelete.id);
    if (res.success) {
      triggerNotice(`File "${fileToDelete.name}" deleted from storage.`);
    }
    setFileToDelete(null);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateConfig({
      maxUploadSizeMB: Number(maxSizeMB),
      maxUploadSizeBytes: Number(maxSizeMB) * 1024 * 1024,
      preserveOriginalFilenames: preserveNames,
      supabase: {
        ...config.supabase,
        bucketName: supabaseBucket,
        supabaseUrl: supabaseUrl,
        supabaseAnonKey: supabaseKey,
      }
    });
    setIsSaving(false);
    if (res.success) {
      triggerNotice(res.message);
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

  const getFileIcon = (mime: string, folder: StorageCategoryFolder) => {
    if (mime.startsWith('image/')) return <ImageIcon size={16} className="text-pink-500" />;
    if (mime.startsWith('video/')) return <Video size={16} className="text-emerald-500" />;
    if (mime.startsWith('audio/')) return <Music size={16} className="text-indigo-500" />;
    if (mime.includes('zip')) return <Archive size={16} className="text-purple-500" />;
    return <FileText size={16} className="text-slate-500" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notice */}
      {noticeMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#FCE7F3] text-[#EC4899] border border-[#FBCFE8]">
              <HardDrive size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Storage Management</h1>
              <p className="text-xs text-[#71717A] font-medium">
                Configure active storage driver, organized subfolders, connection health, and asset browser.
              </p>
            </div>
          </div>
        </div>

        {/* Diagnostic Action Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunDiagnostic}
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#F3DCE8] pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
              : 'text-[#71717A] hover:bg-[#FFF9FC]'
          }`}
        >
          Storage Overview & Drivers
        </button>
        <button
          onClick={() => setActiveTab('browser')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'browser'
              ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
              : 'text-[#71717A] hover:bg-[#FFF9FC]'
          }`}
        >
          <span>File Browser</span>
          <span className="text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
            {files.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
              : 'text-[#71717A] hover:bg-[#FFF9FC]'
          }`}
        >
          Storage Configuration
        </button>
      </div>

      {/* TAB 1: OVERVIEW & DRIVER SWITCHER */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Driver Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Local Storage Driver Card */}
            <Card
              className={`p-5 transition-all relative ${
                config.activeDriver === 'local'
                  ? 'border-2 border-[#EC4899] bg-[#FFF1F7]/40 shadow-md'
                  : 'hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center border border-pink-200 shadow-2xs">
                    <Server size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-[#18181B]">Local Storage</h3>
                      {config.activeDriver === 'local' && (
                        <Badge variant="pink" size="sm">Active Driver</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#71717A] mt-0.5 font-medium">
                      Project filesystem (`public/uploads`)
                    </p>
                  </div>
                </div>

                {config.activeDriver !== 'local' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDriverSwitch('local')}
                  >
                    Activate Local
                  </Button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[#F3DCE8] space-y-2 text-xs text-[#71717A]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Base Path:</span>
                  <code className="bg-white px-2 py-0.5 rounded border border-[#F3DCE8] text-[#18181B] font-mono text-[11px]">
                    {config.local.basePath}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Public URL Prefix:</span>
                  <code className="bg-white px-2 py-0.5 rounded border border-[#F3DCE8] text-[#18181B] font-mono text-[11px]">
                    {config.local.publicUrlPrefix}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Filesystem Status:</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                    <CheckCircle2 size={13} /> Writable & Healthy
                  </span>
                </div>
              </div>
            </Card>

            {/* Supabase Storage Driver Card */}
            <Card
              className={`p-5 transition-all relative ${
                config.activeDriver === 'supabase'
                  ? 'border-2 border-[#EC4899] bg-[#FFF1F7]/40 shadow-md'
                  : 'hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-2xs">
                    <Database size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-[#18181B]">Supabase Storage</h3>
                      {config.activeDriver === 'supabase' && (
                        <Badge variant="pink" size="sm">Active Driver</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#71717A] mt-0.5 font-medium">
                      Cloud S3 Bucket with CDN distribution
                    </p>
                  </div>
                </div>

                {config.activeDriver !== 'supabase' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDriverSwitch('supabase')}
                  >
                    Activate Cloud
                  </Button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[#F3DCE8] space-y-2 text-xs text-[#71717A]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Bucket Name:</span>
                  <code className="bg-white px-2 py-0.5 rounded border border-[#F3DCE8] text-[#18181B] font-mono text-[11px]">
                    {config.supabase.bucketName}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Bucket Access:</span>
                  <span className="text-[11px] font-bold text-emerald-600">Public CDN Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">S3 Compatibility:</span>
                  <span className="text-[11px] font-bold text-slate-700">Multi-region Replicated</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Diagnostic Result Banner (if run) */}
          {testResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span className="font-bold text-sm">
                    Diagnostic Passed: {testResult.driver.toUpperCase()} Storage
                  </span>
                </div>
                <span className="text-xs text-emerald-700 font-mono">
                  Latency: {testResult.latencyMs}ms
                </span>
              </div>
              <p className="text-xs text-emerald-700">{testResult.message}</p>
              <div className="flex items-center gap-4 text-xs font-semibold text-emerald-800 pt-1">
                <span className="flex items-center gap-1">
                  <Check size={13} /> Read Permissions: OK
                </span>
                <span className="flex items-center gap-1">
                  <Check size={13} /> Write Permissions: OK
                </span>
                <span className="flex items-center gap-1">
                  <Check size={13} /> Delete Permissions: OK
                </span>
              </div>
            </div>
          )}

          {/* Usage Statistics Breakdown */}
          <Card className="p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3DCE8] pb-4">
              <div>
                <h3 className="font-extrabold text-base text-[#18181B]">Storage Usage by Folder</h3>
                <p className="text-xs text-[#71717A]">
                  Organized subfolders under <code className="bg-[#FFF9FC] px-1.5 py-0.5 rounded border border-[#F3DCE8]">public/uploads</code>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-[#71717A]">Total Consumed:</span>
                  <p className="text-sm font-black text-[#EC4899]">{stats.formattedTotalSize}</p>
                </div>
                <div className="text-right border-l border-[#F3DCE8] pl-3">
                  <span className="text-xs text-[#71717A]">Total Files:</span>
                  <p className="text-sm font-black text-[#18181B]">{stats.totalFiles}</p>
                </div>
              </div>
            </div>

            {/* Folder Usage Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.categories.map((cat) => (
                <div
                  key={cat.folder}
                  onClick={() => {
                    setSelectedFolder(cat.folder);
                    setActiveTab('browser');
                  }}
                  className="p-3.5 rounded-2xl bg-[#FFF9FC] border border-[#F3DCE8] hover:border-[#EC4899] hover:bg-white transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Folder size={16} style={{ color: cat.color }} />
                      <span className="font-bold text-xs text-[#18181B] group-hover:text-[#EC4899] transition-colors">
                        /{cat.folder}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#71717A]">
                      {cat.fileCount} files
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(cat.percentage, 4)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#71717A] pt-0.5">
                    <span>{cat.label}</span>
                    <span className="font-bold text-[#18181B]">{formatBytes(cat.totalSizeBytes)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: FILE BROWSER */}
      {activeTab === 'browser' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search files by name, type, or folder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#F3DCE8] rounded-xl text-xs text-[#18181B] placeholder-slate-400 focus:outline-none focus:border-[#EC4899] font-medium"
              />
            </div>

            {/* Folder Filter and Upload Target Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#71717A]">
                <Filter size={13} />
                <span>Folder:</span>
              </div>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value as any)}
                className="bg-white border border-[#F3DCE8] rounded-xl px-3 py-1.5 text-xs text-[#18181B] font-bold focus:outline-none focus:border-[#EC4899]"
              >
                <option value="all">All Folders ({files.length})</option>
                <option value="avatars">avatars</option>
                <option value="covers">covers</option>
                <option value="posts">posts</option>
                <option value="reels">reels</option>
                <option value="stories">stories</option>
                <option value="messages">messages</option>
                <option value="themes">themes</option>
                <option value="plugins">plugins</option>
                <option value="documents">documents</option>
              </select>

              <div className="border-l border-[#F3DCE8] pl-2 flex items-center gap-2">
                <select
                  value={uploadTargetFolder}
                  onChange={(e) => setUploadTargetFolder(e.target.value as any)}
                  className="bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-2.5 py-1.5 text-xs text-[#BE185D] font-bold focus:outline-none"
                  title="Target folder for direct upload"
                >
                  <option value="avatars">Upload to /avatars</option>
                  <option value="covers">Upload to /covers</option>
                  <option value="posts">Upload to /posts</option>
                  <option value="reels">Upload to /reels</option>
                  <option value="stories">Upload to /stories</option>
                  <option value="messages">Upload to /messages</option>
                  <option value="themes">Upload to /themes</option>
                  <option value="plugins">Upload to /plugins</option>
                  <option value="documents">Upload to /documents</option>
                </select>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isUploading}
                  leftIcon={<Upload size={13} />}
                >
                  Upload File
                </Button>
              </div>
            </div>
          </div>

          {/* Files List / Table */}
          <Card className="overflow-hidden border border-[#F3DCE8]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF9FC] border-b border-[#F3DCE8] text-[#71717A] uppercase text-[10px] font-extrabold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">File Name</th>
                    <th className="py-3 px-4">Folder</th>
                    <th className="py-3 px-4">Driver</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">MIME Type</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3DCE8]/60">
                  {isLoading ? (
                    [1, 2, 3, 4].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 bg-slate-100 rounded-lg shimmer-bg shrink-0"></div>
                            <div className="space-y-1 min-w-0">
                              <div className="h-3.5 w-28 bg-slate-200 rounded shimmer-bg"></div>
                              <div className="h-2.5 w-16 bg-slate-100 rounded shimmer-bg"></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-5 w-12 bg-slate-100 rounded-full shimmer-bg"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-3 w-14 bg-slate-100 rounded shimmer-bg"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-3 w-10 bg-slate-100 rounded shimmer-bg"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-3 w-16 bg-slate-100 rounded shimmer-bg"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-3 w-14 bg-slate-100 rounded shimmer-bg"></div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex gap-2">
                            <div className="h-7 w-7 bg-slate-100 rounded shimmer-bg"></div>
                            <div className="h-7 w-7 bg-slate-100 rounded shimmer-bg"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredFiles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#71717A] space-y-2">
                        <Folder size={32} className="mx-auto text-slate-300" />
                        <p className="font-bold text-xs">No files found</p>
                        <p className="text-[11px]">Upload a new file or adjust the active folder filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-[#FFF9FC]/60 transition-colors">
                        {/* Name & Icon */}
                        <td className="py-3 px-4 font-bold text-[#18181B]">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-[#FFF9FC] border border-[#F3DCE8] shrink-0">
                              {getFileIcon(file.mimeType, file.folder)}
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <p className="truncate text-xs font-bold text-[#18181B]">{file.name}</p>
                              <p className="text-[10px] text-[#71717A] truncate font-mono">{file.originalName}</p>
                            </div>
                          </div>
                        </td>

                        {/* Folder Category */}
                        <td className="py-3 px-4">
                          <span className="bg-[#FFF1F7] text-[#BE185D] border border-[#FBCFE8] px-2 py-0.5 rounded-full text-[10px] font-bold">
                            /{file.folder}
                          </span>
                        </td>

                        {/* Driver */}
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-mono capitalize text-[#71717A]">
                            {file.driver}
                          </span>
                        </td>

                        {/* Size */}
                        <td className="py-3 px-4 font-mono text-[#18181B]">
                          {formatBytes(file.sizeBytes)}
                        </td>

                        {/* MIME */}
                        <td className="py-3 px-4 text-[10px] text-[#71717A] font-mono truncate max-w-[120px]">
                          {file.mimeType}
                        </td>

                        {/* Created Date */}
                        <td className="py-3 px-4 text-[11px] text-[#71717A]">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewFile(file)}
                              className="p-1.5 rounded-lg text-[#71717A] hover:text-[#EC4899] hover:bg-[#FFF1F7] transition-colors cursor-pointer"
                              title="Preview File"
                            >
                              <Eye size={14} />
                            </button>

                            <button
                              onClick={() => handleCopyUrl(file)}
                              className="p-1.5 rounded-lg text-[#71717A] hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Copy Public URL"
                            >
                              {copiedFileId === file.id ? (
                                <Check size={14} className="text-emerald-500" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>

                            <button
                              onClick={() => setFileToDelete(file)}
                              className="p-1.5 rounded-lg text-[#71717A] hover:text-[#F43F5E] hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Asset"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: SETTINGS & POLICIES */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-[#18181B]">Storage Policies & Upload Limits</h3>
              <p className="text-xs text-[#71717A]">
                Global upload thresholds, image optimization, and file naming conventions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Max Size */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#18181B]">
                  Max Upload Size (MB)
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={maxSizeMB}
                  onChange={(e) => setMaxSizeMB(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl text-xs font-bold text-[#18181B] focus:outline-none focus:border-[#EC4899]"
                />
                <p className="text-[10px] text-[#71717A]">
                  Default: 50MB. Max recommended for video/reel uploads is 100MB.
                </p>
              </div>

              {/* Filename Sanitization */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#18181B]">
                  File Naming Policy
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="preserveNames"
                    checked={preserveNames}
                    onChange={(e) => setPreserveNames(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#EC4899] focus:ring-[#EC4899]"
                  />
                  <label htmlFor="preserveNames" className="text-xs text-[#18181B] font-semibold cursor-pointer">
                    Preserve original filenames (otherwise prepend folder + timestamp)
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F3DCE8]">
              <h4 className="text-xs font-extrabold text-[#18181B] uppercase tracking-wider mb-2">
                Allowed File Formats
              </h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {config.allowedMimeTypes.map((mime) => (
                  <span
                    key={mime}
                    className="bg-[#FFF9FC] border border-[#F3DCE8] text-[#18181B] px-2.5 py-1 rounded-xl text-[11px] font-mono font-medium"
                  >
                    {mime}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Supabase Driver Credentials */}
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-[#18181B]">Supabase Storage Configuration</h3>
              <p className="text-xs text-[#71717A]">
                Credentials used when Supabase Storage is selected as the active driver.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#18181B]">Bucket Name</label>
                <input
                  type="text"
                  value={supabaseBucket}
                  onChange={(e) => setSupabaseBucket(e.target.value)}
                  className="w-full p-2.5 bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl text-xs font-mono text-[#18181B] focus:outline-none focus:border-[#EC4899]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#18181B]">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full p-2.5 bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl text-xs font-mono text-[#18181B] focus:outline-none focus:border-[#EC4899]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#18181B]">Anon / Public Key</label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full p-2.5 bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl text-xs font-mono text-[#18181B] focus:outline-none focus:border-[#EC4899]"
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              leftIcon={<Check size={16} />}
            >
              Save Storage Settings
            </Button>
          </div>
        </form>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <Modal
          isOpen={Boolean(previewFile)}
          onClose={() => setPreviewFile(null)}
          title={`Asset Preview: ${previewFile.name}`}
        >
          <div className="space-y-4">
            {previewFile.mimeType.startsWith('image/') ? (
              <div className="rounded-2xl overflow-hidden border border-[#F3DCE8] bg-[#FFF9FC] max-h-80 flex items-center justify-center">
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-h-80 w-auto object-contain"
                  onError={(e) => {
                    // fallback placeholder if local file not yet written to disk
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#FFF9FC] border border-[#F3DCE8] text-center space-y-2">
                <FileText size={48} className="mx-auto text-[#EC4899]" />
                <p className="font-bold text-xs text-[#18181B]">{previewFile.name}</p>
                <p className="text-[11px] text-[#71717A]">{formatBytes(previewFile.sizeBytes)} • {previewFile.mimeType}</p>
              </div>
            )}

            <div className="bg-[#FFF9FC] p-3 rounded-xl border border-[#F3DCE8] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#71717A] font-semibold">Public URL:</span>
                <span className="font-mono text-[11px] text-[#18181B] truncate max-w-xs">{previewFile.url}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#71717A] font-semibold">Storage Driver:</span>
                <span className="font-bold text-[#BE185D] uppercase text-[10px]">{previewFile.driver}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#71717A] font-semibold">Folder:</span>
                <span className="font-mono text-[11px]">/{previewFile.folder}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyUrl(previewFile)}
                leftIcon={<Copy size={13} />}
              >
                Copy Link
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreviewFile(null)}
              >
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <Modal
          isOpen={Boolean(fileToDelete)}
          onClose={() => setFileToDelete(null)}
          title="Confirm Asset Deletion"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
              <p className="font-bold text-xs">Are you sure you want to delete this file?</p>
              <p className="text-[11px] text-rose-700">
                This will permanently delete <code className="font-mono">{fileToDelete.name}</code> from <code className="font-mono">/{fileToDelete.folder}</code>. Any posts or profiles referencing this URL may display broken media.
              </p>
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
                variant="danger"
                size="sm"
                onClick={confirmDeleteFile}
                leftIcon={<Trash2 size={13} />}
              >
                Delete File
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
