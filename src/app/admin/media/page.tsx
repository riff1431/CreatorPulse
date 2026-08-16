'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Image as ImageIcon, Search, Filter, Trash2, Eye, Grid, List,
  Copy, Check, HardDrive, RefreshCw, ExternalLink, FileText,
  Film, Music, File, Upload, Plus, X, ArrowRight, Download,
  Layers, Cloud, Globe, Folder, Calendar, CheckSquare, Square,
  AlertTriangle, CheckCircle2, ChevronRight, SlidersHorizontal,
  Info, Sparkles, FolderOpen, ArrowUpDown, Replace
} from 'lucide-react';
import { useStorageManager } from '@/lib/storage/storage-context';
import { StoredFile, StorageCategoryFolder, StorageDriverType, STORAGE_FOLDERS } from '@/lib/storage/storage-types';
import { formatBytes, STORAGE_FOLDER_INFO } from '@/lib/storage/storage-service';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';
import { Modal } from '@/components/admin/ui/Modal';
import { Avatar } from '@/components/admin/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AdminMediaLibraryPage() {
  const {
    files,
    stats,
    isLoading,
    config,
    deleteMultipleFiles,
    renameFile,
    moveFile,
    uploadFile,
    refreshFiles,
  } = useStorageManager();

  const { showToast } = useToast();

  // Layout & View Mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploader, setShowUploader] = useState(false);
  const [uploadFolder, setUploadFolder] = useState<StorageCategoryFolder>('posts');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all'); // all, image, video, audio, document, archive
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [driverFilter, setDriverFilter] = useState<string>('all'); // all, local, s3, r2
  const [dateFilter, setDateFilter] = useState<string>('all'); // all, 24h, 30d, 1y
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');

  // Selected Assets & Detail Drawer Modal (WordPress Attachment Details)
  const [selectedAsset, setSelectedAsset] = useState<StoredFile | null>(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeleteSingleModalOpen, setIsDeleteSingleModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<StoredFile | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);

  // Rename & Edit Attachment Form inside Drawer
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editFilename, setEditFilename] = useState('');
  const [editTargetFolder, setEditTargetFolder] = useState<StorageCategoryFolder>('posts');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Refresh
  const handleSyncData = async () => {
    await refreshFiles();
    showToast('Media library refreshed from storage driver.', 'success');
  };

  // Upload handler
  const handleFilesUpload = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;
    setIsUploading(true);
    const filesArray = Array.from(fileList);
    let count = 0;

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      setUploadProgress(`Uploading ${i + 1} of ${filesArray.length}: ${file.name}...`);
      const res = await uploadFile(file, uploadFolder);
      if (res.success) count++;
    }

    setIsUploading(false);
    setUploadProgress('');
    showToast(`Successfully uploaded ${count} file(s) to /${uploadFolder}`, 'success');
    await refreshFiles();
  };

  // Replace file handler
  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !selectedAsset) return;

    const file = fileList[0];
    setIsUploading(true);
    try {
      const res = await uploadFile(file, selectedAsset.folder);
      if (res.success && res.file) {
        showToast(`Asset "${selectedAsset.name}" replaced successfully!`, 'success');
        setSelectedAsset(res.file);
      } else {
        showToast(res.error || 'Failed to replace file', 'error');
      }
    } finally {
      setIsUploading(false);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  // Copy URL with clipboard API
  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrlId(id);
    showToast('Media URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  // Trigger Download
  const handleDownloadAsset = (file: StoredFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Download started for ${file.name}`, 'info');
  };

  // Filtered & Sorted Assets
  const filteredAssets = useMemo(() => {
    return files
      .filter((asset) => {
        // Folder filter
        if (folderFilter !== 'all' && asset.folder !== folderFilter) return false;

        // Driver filter
        if (driverFilter !== 'all' && asset.driver !== driverFilter) return false;

        // Type filter
        if (typeFilter !== 'all') {
          if (typeFilter === 'image' && !asset.mimeType.startsWith('image/')) return false;
          if (typeFilter === 'video' && !asset.mimeType.startsWith('video/')) return false;
          if (typeFilter === 'audio' && !asset.mimeType.startsWith('audio/')) return false;
          if (typeFilter === 'document' && !asset.mimeType.includes('pdf') && !asset.mimeType.startsWith('text/')) return false;
          if (typeFilter === 'archive' && !asset.mimeType.includes('zip') && !asset.mimeType.includes('compressed')) return false;
        }

        // Date filter
        if (dateFilter !== 'all') {
          const fileDate = new Date(asset.createdAt).getTime();
          const now = Date.now();
          if (dateFilter === '24h' && now - fileDate > 24 * 3600000) return false;
          if (dateFilter === '30d' && now - fileDate > 30 * 86400000) return false;
          if (dateFilter === '1y' && now - fileDate > 365 * 86400000) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = asset.name.toLowerCase().includes(q) || asset.originalName?.toLowerCase().includes(q);
          const matchUploader = asset.uploadedBy?.name.toLowerCase().includes(q) || asset.uploadedBy?.username.toLowerCase().includes(q);
          const matchPath = asset.path.toLowerCase().includes(q);
          return matchName || matchUploader || matchPath;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'size') return (b.sizeBytes || 0) - (a.sizeBytes || 0);
        return 0;
      });
  }, [files, folderFilter, driverFilter, typeFilter, dateFilter, searchQuery, sortBy]);

  // Selection handlers
  const handleToggleSelect = (pathOrId: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(pathOrId) ? prev.filter((id) => id !== pathOrId) : [...prev, pathOrId]
    );
  };

  const handleSelectAll = () => {
    const allFiltered = filteredAssets.map((a) => a.path || a.id);
    const areAllSelected = allFiltered.every((id) => selectedAssetIds.includes(id));
    if (areAllSelected) {
      setSelectedAssetIds((prev) => prev.filter((id) => !allFiltered.includes(id)));
    } else {
      setSelectedAssetIds((prev) => Array.from(new Set([...prev, ...allFiltered])));
    }
  };

  // Delete single
  const executeDeleteSingle = async () => {
    if (!assetToDelete) return;
    const res = await deleteMultipleFiles([assetToDelete.path || assetToDelete.id]);
    if (res.success) {
      showToast(`Asset "${assetToDelete.name}" permanently deleted.`, 'info');
      if (selectedAsset?.id === assetToDelete.id || selectedAsset?.path === assetToDelete.path) {
        setSelectedAsset(null);
      }
    } else {
      showToast(res.error || 'Failed to delete asset', 'error');
    }
    setAssetToDelete(null);
    setIsDeleteSingleModalOpen(false);
  };

  // Bulk Delete
  const executeBulkDelete = async () => {
    const res = await deleteMultipleFiles(selectedAssetIds);
    if (res.success) {
      showToast(`Permanently deleted ${selectedAssetIds.length} media item(s).`, 'info');
      setSelectedAsset(null);
    } else {
      showToast(res.error || 'Failed to delete selected assets', 'error');
    }
    setSelectedAssetIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  // Save metadata / rename / move
  const handleSaveMetadata = async () => {
    if (!selectedAsset || !editFilename) return;
    setIsSavingEdit(true);

    try {
      const res = await renameFile(selectedAsset.path || selectedAsset.id, editFilename, editTargetFolder);
      if (res.success) {
        showToast('Asset metadata saved and file organized!', 'success');
        setIsEditingMetadata(false);
        if (res.file) {
          setSelectedAsset(res.file);
        } else {
          setSelectedAsset((prev) =>
            prev
              ? {
                  ...prev,
                  name: editFilename,
                  folder: editTargetFolder,
                  path: `${editTargetFolder}/${editFilename}`,
                }
              : null
          );
        }
      } else {
        showToast(res.error || 'Failed to update metadata', 'error');
      }
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Helper icons
  const getMediaTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon size={16} className="text-pink-500" />;
    if (mimeType.startsWith('video/')) return <Film size={16} className="text-emerald-500" />;
    if (mimeType.startsWith('audio/')) return <Music size={16} className="text-indigo-500" />;
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return <FileText size={16} className="text-purple-500" />;
    return <FileText size={16} className="text-slate-500" />;
  };

  const totalQuotaBytes = 100 * 1024 * 1024 * 1024; // 100 GB platform quota

  return (
    <RoleGuard
      requiredPermission="manage_content"
      fallbackTitle="Media Storage Clearance Required"
      fallbackMessage="You need administrative content management permissions to inspect or manage system media storage."
    >
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3DCE8] pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 text-pink-600 border border-pink-200">
                <FolderOpen size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Media Library</h1>
                  <Badge variant="pink" className="uppercase font-bold tracking-wider text-[10px]">
                    {config.activeDriver.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-[#71717A] font-medium">
                  WordPress-style media asset library with centralized cloud drivers, auto-organized folders, and attachment inspector.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload size={14} />}
              onClick={() => setShowUploader(!showUploader)}
            >
              {showUploader ? 'Hide Uploader' : 'Add New Media'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={13} />}
              onClick={handleSyncData}
            >
              Refresh
            </Button>
            {selectedAssetIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold"
                leftIcon={<Trash2 size={13} />}
                onClick={() => setIsBulkDeleteModalOpen(true)}
              >
                Delete Selected ({selectedAssetIds.length})
              </Button>
            )}
          </div>
        </div>

        {/* Collapsible WordPress-Style Drag & Drop Uploader */}
        {showUploader && (
          <div className="p-6 rounded-3xl border-2 border-dashed border-pink-300 bg-gradient-to-b from-pink-50/50 to-white shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 border border-[#F3DCE8] rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-pink-100 text-pink-600">
                  <Folder size={16} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Target Storage Category Folder</h4>
                  <p className="text-[11px] text-slate-400">Files will be placed into this organized subdirectory</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value as StorageCategoryFolder)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/20 cursor-pointer"
                >
                  {STORAGE_FOLDERS.map((f) => (
                    <option key={f} value={f}>
                      /{f} ({STORAGE_FOLDER_INFO[f]?.label || f})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowUploader(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleFilesUpload(e.dataTransfer.files);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragging ? 'border-pink-500 bg-pink-100/50' : 'border-slate-300 hover:border-pink-400 bg-white'
              }`}
            >
              <div className="w-16 h-16 rounded-3xl bg-pink-100 text-pink-600 flex items-center justify-center shadow-xs">
                <Upload size={28} className={isUploading ? 'animate-bounce' : ''} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  {isUploading
                    ? uploadProgress || 'Uploading selected assets...'
                    : 'Drop files anywhere to upload, or click to browse'}
                </p>
                <p className="text-xs text-slate-400">
                  Target: <span className="font-mono text-pink-600 font-bold">/{uploadFolder}</span> • Active Driver: <span className="uppercase font-bold text-slate-700">{config.activeDriver}</span> • Max size: {config.maxUploadSizeMB} MB
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={(e) => e.target.files && handleFilesUpload(e.target.files)}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Storage Capacity Status Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-md space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5">
              <HardDrive className="text-pink-400" size={18} />
              <span className="font-extrabold text-sm tracking-tight">Platform Storage Capacity</span>
              <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-bold border border-pink-500/30 uppercase">
                {config.activeDriver} Storage
              </span>
            </div>
            <span className="text-[11px] text-slate-300 font-bold font-mono">
              {stats.formattedTotalSize} used • {files.length} registered files
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
            {stats.categories.map((cat) => (
              <div
                key={cat.folder}
                className="transition-all duration-500"
                style={{
                  width: `${(cat.totalSizeBytes / totalQuotaBytes) * 100}%`,
                  backgroundColor: cat.color,
                }}
                title={`${cat.label}: ${formatBytes(cat.totalSizeBytes)}`}
              />
            ))}
          </div>

          {/* Category Metrics Legend */}
          <div className="flex flex-wrap items-center gap-3.5 text-[10px] font-bold text-slate-300 pt-0.5">
            {stats.categories.map((cat) => (
              <div key={cat.folder} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-300">
                  {cat.label} ({formatBytes(cat.totalSizeBytes)})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* WordPress-Style Toolbar & Filters Bar */}
        <div className="p-4 rounded-2xl bg-white border border-[#F3DCE8] shadow-xs space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Left Controls: View Mode & Filters */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* View Switcher */}
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white shadow-2xs text-pink-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grid View"
                >
                  <Grid size={15} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'list' ? 'bg-white shadow-2xs text-pink-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="List View"
                >
                  <List size={15} />
                </button>
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value="all">All media items</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
                <option value="archive">Zip Archives</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value="all">All dates</option>
                <option value="24h">Last 24 hours</option>
                <option value="30d">This month</option>
                <option value="1y">This year</option>
              </select>

              {/* Folder Category Filter */}
              <select
                value={folderFilter}
                onChange={(e) => setFolderFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value="all">All Folders</option>
                {STORAGE_FOLDERS.map((f) => (
                  <option key={f} value={f}>
                    /{f}
                  </option>
                ))}
              </select>

              {/* Storage Provider Filter */}
              <select
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value="all">All Storage Drivers</option>
                <option value="local">Local Storage</option>
                <option value="s3">Amazon S3</option>
                <option value="r2">Cloudflare R2</option>
              </select>

              {/* Sort By Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="size">Sort: File Size</option>
              </select>
            </div>

            {/* Right Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search media items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Bulk Selection Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="font-bold text-slate-700 hover:text-pink-600 flex items-center gap-1.5 cursor-pointer"
              >
                {selectedAssetIds.length === filteredAssets.length && filteredAssets.length > 0 ? (
                  <CheckSquare size={15} className="text-pink-600" />
                ) : (
                  <Square size={15} className="text-slate-400" />
                )}
                <span>Select All ({filteredAssets.length})</span>
              </button>

              {selectedAssetIds.length > 0 && (
                <span className="text-[11px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                  {selectedAssetIds.length} item(s) selected
                </span>
              )}
            </div>

            <span className="text-slate-400 text-[11px]">
              Showing {filteredAssets.length} of {files.length} total media items
            </span>
          </div>
        </div>

        {/* Media Asset Presentation */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw size={28} className="animate-spin text-pink-500 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading media assets from storage driver...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-white border border-[#F3DCE8] space-y-3">
            <ImageIcon size={40} className="text-pink-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No media items found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No files matched your active filters or search query. Upload files or adjust your filter options.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowUploader(true)}
              leftIcon={<Upload size={14} />}
            >
              Upload New Media
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          /* ========================================================================= */
          /* WORDPRESS-STYLE THUMBNAIL TILE GRID                                       */
          /* ========================================================================= */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAssetIds.includes(asset.path || asset.id);
              const isFocused = selectedAsset?.id === asset.id || selectedAsset?.path === asset.path;

              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setEditFilename(asset.name);
                    setEditTargetFolder(asset.folder);
                    setIsEditingMetadata(false);
                  }}
                  className={`group relative rounded-2xl border bg-white overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md ${
                    isFocused
                      ? 'border-pink-600 ring-2 ring-pink-500/30'
                      : isSelected
                      ? 'border-pink-500 ring-1 ring-pink-400'
                      : 'border-[#F3DCE8] hover:border-pink-300'
                  }`}
                >
                  {/* Square Aspect Ratio Thumbnail */}
                  <div className="aspect-square w-full bg-slate-100 relative flex items-center justify-center overflow-hidden">
                    {asset.mimeType.startsWith('image/') ? (
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : asset.mimeType.startsWith('video/') ? (
                      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center gap-1 text-emerald-400">
                        <Film size={32} />
                        <span className="text-[9px] font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded text-white">
                          VIDEO
                        </span>
                      </div>
                    ) : asset.mimeType.startsWith('audio/') ? (
                      <div className="w-full h-full bg-indigo-900 flex flex-col items-center justify-center gap-1 text-indigo-300">
                        <Music size={32} />
                        <span className="text-[9px] font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded text-white">
                          AUDIO
                        </span>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        {getMediaTypeIcon(asset.mimeType)}
                        <span className="text-[10px] font-mono text-slate-400 block mt-1 uppercase truncate max-w-[80px]">
                          {asset.mimeType.split('/')[1] || 'DOC'}
                        </span>
                      </div>
                    )}

                    {/* Selection Checkbox Pill */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(asset.path || asset.id);
                      }}
                      className={`absolute top-2 left-2 p-1.5 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'bg-white/80 text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-white'
                      }`}
                    >
                      <Check size={12} />
                    </button>

                    {/* Driver Tag */}
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-mono font-bold uppercase backdrop-blur-xs">
                      {asset.driver}
                    </span>
                  </div>

                  {/* Caption & Category */}
                  <div className="p-2.5 border-t border-[#F3DCE8] bg-white">
                    <h4 className="text-xs font-bold text-slate-800 truncate" title={asset.name}>
                      {asset.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>/{asset.folder}</span>
                      <span>{formatBytes(asset.sizeBytes)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================================= */
          /* WORDPRESS-STYLE COMPACT LIST TABLE VIEW                                   */
          /* ========================================================================= */
          <div className="rounded-2xl border border-[#F3DCE8] bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#71717A] border-b border-[#F3DCE8]">
                <tr>
                  <th className="p-3.5 w-8">
                    <input
                      type="checkbox"
                      checked={selectedAssetIds.length === filteredAssets.length && filteredAssets.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                    />
                  </th>
                  <th className="p-3.5 font-bold">File</th>
                  <th className="p-3.5 font-bold">Folder Category</th>
                  <th className="p-3.5 font-bold">Storage Driver</th>
                  <th className="p-3.5 font-bold">Size</th>
                  <th className="p-3.5 font-bold">Date Uploaded</th>
                  <th className="p-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAssetIds.includes(asset.path || asset.id);
                  const isCopied = copiedUrlId === asset.id;

                  return (
                    <tr
                      key={asset.id}
                      onClick={() => {
                        setSelectedAsset(asset);
                        setEditFilename(asset.name);
                        setEditTargetFolder(asset.folder);
                        setIsEditingMetadata(false);
                      }}
                      className={`hover:bg-pink-50/20 transition-colors cursor-pointer ${
                        isSelected ? 'bg-pink-50/40' : ''
                      }`}
                    >
                      <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(asset.path || asset.id)}
                          className="rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                        />
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {asset.mimeType.startsWith('image/') ? (
                              <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                            ) : (
                              getMediaTypeIcon(asset.mimeType)
                            )}
                          </div>
                          <div className="truncate max-w-sm">
                            <span className="truncate block font-bold text-slate-900">{asset.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{asset.path}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px]">
                          /{asset.folder}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-pink-100 text-pink-700">
                          {asset.driver}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{formatBytes(asset.sizeBytes)}</td>
                      <td className="p-3.5 text-slate-500">{new Date(asset.createdAt).toLocaleDateString()}</td>
                      <td className="p-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleCopyUrl(asset.url, asset.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                          title="Copy Direct URL"
                        >
                          {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                        <button
                          onClick={() => handleDownloadAsset(asset)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                          title="Download File"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setAssetToDelete(asset);
                            setIsDeleteSingleModalOpen(true);
                          }}
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

        {/* ========================================================================= */}
        {/* WORDPRESS-STYLE ATTACHMENT DETAILS MODAL / DRAWER                         */}
        {/* ========================================================================= */}
        {selectedAsset && (
          <Modal
            isOpen={Boolean(selectedAsset)}
            onClose={() => setSelectedAsset(null)}
            title="Attachment Details"
          >
            <div className="space-y-6 text-xs">
              {/* Top: Large Preview Window */}
              <div className="aspect-video w-full rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center relative shadow-inner">
                {selectedAsset.mimeType.startsWith('image/') ? (
                  <img
                    src={selectedAsset.url}
                    alt={selectedAsset.name}
                    className="w-full h-full object-contain"
                  />
                ) : selectedAsset.mimeType.startsWith('video/') ? (
                  <video
                    src={selectedAsset.url}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : selectedAsset.mimeType.startsWith('audio/') ? (
                  <div className="w-full p-8 flex flex-col items-center gap-4 text-white">
                    <Music size={48} className="text-pink-400" />
                    <audio src={selectedAsset.url} controls className="w-full max-w-md" />
                  </div>
                ) : (
                  <div className="text-center p-8 text-white space-y-2">
                    {getMediaTypeIcon(selectedAsset.mimeType)}
                    <p className="font-mono text-xs">{selectedAsset.name}</p>
                  </div>
                )}

                {/* Storage Driver Watermark */}
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[10px] font-bold uppercase backdrop-blur-xs">
                  Driver: {selectedAsset.driver}
                </span>
              </div>

              {/* Middle: Attachment Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">File Name</span>
                  <p className="font-bold text-slate-900 break-all">{selectedAsset.name}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">File Type / MIME</span>
                  <p className="font-mono text-slate-800">{selectedAsset.mimeType}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Folder Category</span>
                  <p className="font-mono text-pink-600 font-bold">/{selectedAsset.folder}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">File Size</span>
                  <p className="font-mono text-slate-800">{formatBytes(selectedAsset.sizeBytes)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Uploaded Date</span>
                  <p className="text-slate-800">{new Date(selectedAsset.createdAt).toLocaleString()}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Uploaded By</span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Avatar
                      src={selectedAsset.uploadedBy?.avatar}
                      alt={selectedAsset.uploadedBy?.name || 'Admin'}
                      size="sm"
                    />
                    <span className="font-bold text-slate-800">{selectedAsset.uploadedBy?.name || 'System Admin'}</span>
                  </div>
                </div>

                {/* Direct URL input with Copy button */}
                <div className="col-span-1 md:col-span-2 space-y-1 pt-2 border-t border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">File URL</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedAsset.url}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-mono text-[11px] text-slate-700"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyUrl(selectedAsset.url, selectedAsset.id)}
                      className="shrink-0"
                      leftIcon={<Copy size={13} />}
                    >
                      Copy URL
                    </Button>
                  </div>
                </div>
              </div>

              {/* Inline Metadata Editing / Rename / Reorganize */}
              {isEditingMetadata ? (
                <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-200 space-y-3">
                  <h4 className="font-bold text-pink-900 flex items-center gap-1.5">
                    <SlidersHorizontal size={14} className="text-pink-600" />
                    Rename & Move Media Asset
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1 text-[11px]">New Filename</label>
                      <input
                        type="text"
                        value={editFilename}
                        onChange={(e) => setEditFilename(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1 text-[11px]">Move to Folder</label>
                      <select
                        value={editTargetFolder}
                        onChange={(e) => setEditTargetFolder(e.target.value as StorageCategoryFolder)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      >
                        {STORAGE_FOLDERS.map((f) => (
                          <option key={f} value={f}>
                            /{f} ({STORAGE_FOLDER_INFO[f]?.label || f})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingMetadata(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveMetadata}
                      isLoading={isSavingEdit}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                /* Action Toolbar */
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingMetadata(true)}
                    >
                      Rename / Move
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => replaceFileInputRef.current?.click()}
                      leftIcon={<Replace size={13} />}
                    >
                      Replace File
                    </Button>
                    <input
                      type="file"
                      ref={replaceFileInputRef}
                      onChange={handleReplaceFile}
                      className="hidden"
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadAsset(selectedAsset)}
                      leftIcon={<Download size={13} />}
                    >
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      leftIcon={<Trash2 size={13} />}
                      onClick={() => {
                        setAssetToDelete(selectedAsset);
                        setIsDeleteSingleModalOpen(true);
                      }}
                    >
                      Delete Permanently
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Single Delete Confirmation Modal */}
        {isDeleteSingleModalOpen && assetToDelete && (
          <Modal
            isOpen={isDeleteSingleModalOpen}
            onClose={() => setIsDeleteSingleModalOpen(false)}
            title="Delete Media Permanently"
          >
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-red-900 space-y-1">
                  <p className="font-bold">Are you sure you want to permanently delete this media item?</p>
                  <p className="font-mono text-[11px] opacity-90 break-all">{assetToDelete.name}</p>
                  <p className="text-[11px] text-red-700 pt-1">
                    This file will be deleted from your active {config.activeDriver.toUpperCase()} storage driver.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteSingleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={executeDeleteSingle}
                >
                  Permanently Delete
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {isBulkDeleteModalOpen && (
          <Modal
            isOpen={isBulkDeleteModalOpen}
            onClose={() => setIsBulkDeleteModalOpen(false)}
            title="Delete Selected Media Items"
          >
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-red-900 space-y-1">
                  <p className="font-bold">
                    Permanently delete {selectedAssetIds.length} selected media item(s)?
                  </p>
                  <p className="text-[11px] text-red-700">
                    This action cannot be undone. All selected binary files will be removed from {config.activeDriver.toUpperCase()} storage.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={executeBulkDelete}
                >
                  Delete {selectedAssetIds.length} Items
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </RoleGuard>
  );
}
