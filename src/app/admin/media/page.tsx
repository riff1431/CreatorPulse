'use client';

import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, Search, Filter, Trash2, Eye, Grid, List, 
  Copy, Check, ShieldAlert, AlertTriangle, HardDrive, RefreshCw, 
  ExternalLink, FileText, Film, Music, File, Link2, CheckSquare, 
  Square, Info, Download, Upload, Plus, X, Move
} from 'lucide-react';
import { useStorageManager } from '@/lib/storage/storage-context';
import { StoredFile, StorageCategoryFolder } from '@/lib/storage/storage-types';
import { formatBytes } from '@/lib/storage/storage-service';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';
import { Modal } from '@/components/admin/ui/Modal';
import { Avatar } from '@/components/admin/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AdminMediaManagerPage() {
  const { 
    files, 
    stats, 
    isLoading, 
    config, 
    deleteMultipleFiles, 
    renameFile, 
    uploadFile,
    refreshFiles 
  } = useStorageManager();

  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');

  // Inline uploader panel toggle
  const [showUploader, setShowUploader] = useState(false);
  const [uploadFolder, setUploadFolder] = useState<StorageCategoryFolder>('posts');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const mediaFileInputRef = React.useRef<HTMLInputElement>(null);

  // Modals and selection
  const [selectedAsset, setSelectedAsset] = useState<StoredFile | null>(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [assetToDelete, setAssetToDelete] = useState<StoredFile | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);

  // Rename/Move modal states
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [assetToRename, setAssetToRename] = useState<StoredFile | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [folderInput, setFolderInput] = useState<StorageCategoryFolder>('posts');

  // Trigger manual refresh
  const handleSyncData = async () => {
    await refreshFiles();
    showToast('Media library refreshed from storage.', 'success');
  };

  const handleFilesUpload = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;
    setIsUploading(true);
    const filesArray = Array.from(fileList);
    let count = 0;
    for (const f of filesArray) {
      const res = await uploadFile(f, uploadFolder);
      if (res.success) count++;
    }
    setIsUploading(false);
    showToast(`Successfully uploaded ${count} file(s) to /${uploadFolder}`, 'success');
    refreshFiles();
  };

  // Storage Stats from API
  const totalQuotaBytes = 100 * 1024 * 1024 * 1024; // 100 GB platform quota
  const totalSizeBytes = stats.totalSizeBytes;
  const usedPercentage = Math.min(100, Math.max(1, (totalSizeBytes / totalQuotaBytes) * 100));

  // Filter & Sort
  const filteredAssets = files
    .filter((asset) => {
      if (categoryFilter !== 'all' && asset.folder !== categoryFilter) return false;
      
      let matchesType = true;
      if (typeFilter !== 'all') {
        if (typeFilter === 'image') matchesType = asset.mimeType.startsWith('image/');
        else if (typeFilter === 'video') matchesType = asset.mimeType.startsWith('video/');
        else if (typeFilter === 'audio') matchesType = asset.mimeType.startsWith('audio/');
        else if (typeFilter === 'document') matchesType = asset.mimeType.startsWith('application/pdf') || asset.mimeType.startsWith('text/');
      }
      if (!matchesType) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = asset.name.toLowerCase().includes(q) || asset.originalName.toLowerCase().includes(q);
        const matchUploader = asset.uploadedBy?.name.toLowerCase().includes(q) || asset.uploadedBy?.username.toLowerCase().includes(q);
        const matchId = asset.id.toLowerCase().includes(q);
        return matchName || matchUploader || matchId;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return b.sizeBytes - a.sizeBytes;
      return 0;
    });

  const handleToggleSelect = (id: string) => {
    setSelectedAssetIds(prev =>
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const filteredIds = filteredAssets.map(a => a.id);
    const allSelected = filteredIds.every(id => selectedAssetIds.includes(id));
    if (allSelected) {
      setSelectedAssetIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedAssetIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrlId(id);
    showToast('Media URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  const handleRequestDeleteSingle = (asset: StoredFile) => {
    setAssetToDelete(asset);
  };

  const executeDeleteSingle = async () => {
    if (!assetToDelete) return;
    const res = await deleteMultipleFiles([assetToDelete.id]);
    if (res.success) {
      showToast(`Media file "${assetToDelete.name}" deleted safely.`, 'info');
      if (selectedAsset && selectedAsset.id === assetToDelete.id) {
        setSelectedAsset(null);
      }
    } else {
      showToast(res.error || 'Failed to delete file', 'error');
    }
    setAssetToDelete(null);
  };

  const executeBulkDelete = async () => {
    const res = await deleteMultipleFiles(selectedAssetIds);
    if (res.success) {
      showToast(`Deleted ${selectedAssetIds.length} selected media assets.`, 'info');
    } else {
      showToast(res.error || 'Failed to delete selected assets', 'error');
    }
    setSelectedAssetIds([]);
    setIsBulkDeleteConfirmOpen(false);
  };

  // Open Rename / Move Dialog
  const handleOpenRename = (asset: StoredFile) => {
    setAssetToRename(asset);
    setRenameInput(asset.name);
    setFolderInput(asset.folder);
    setIsRenameOpen(true);
  };

  const executeRename = async () => {
    if (!assetToRename) return;
    const res = await renameFile(assetToRename.id, renameInput, folderInput);
    if (res.success) {
      showToast('Media asset moved/renamed successfully!', 'success');
      setIsRenameOpen(false);
      setAssetToRename(null);
      if (selectedAsset?.id === assetToRename.id) {
        setSelectedAsset(null);
      }
    } else {
      showToast(res.error || 'Failed to rename asset', 'error');
    }
  };

  const renderMediaTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon size={14} className="text-indigo-600" />;
    }
    if (mimeType.startsWith('video/')) {
      return <Film size={14} className="text-rose-600" />;
    }
    if (mimeType.startsWith('audio/')) {
      return <Music size={14} className="text-amber-600" />;
    }
    return <FileText size={14} className="text-emerald-600" />;
  };

  return (
    <RoleGuard
      requiredPermission="manage_content"
      fallbackTitle="Media Storage Clearance Required"
      fallbackMessage="You need administrative content management permissions to inspect or purge system media storage."
    >
      <div className="max-w-7xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <HardDrive className="text-indigo-600" size={24} />
              <h1 className="text-xl font-black text-[#18181B] tracking-tight">Dynamic Media Manager</h1>
            </div>
            <p className="text-xs text-[#71717A] mt-1 font-medium">
              Browse platform uploaded images, videos, audio, and documents with storage usage metrics and live drivers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              leftIcon={<Upload size={13} />} 
              onClick={() => setShowUploader(!showUploader)}
            >
              {showUploader ? 'Close Uploader' : 'Add New File'}
            </Button>
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={13} />} onClick={handleSyncData}>
              Sync Media
            </Button>
            {selectedAssetIds.length > 0 && (
              <Button 
                variant="danger" 
                size="sm" 
                leftIcon={<Trash2 size={13} />}
                onClick={() => setIsBulkDeleteConfirmOpen(true)}
              >
                Delete Selected ({selectedAssetIds.length})
              </Button>
            )}
          </div>
        </div>

        {/* Collapsible Inline Uppy Uploader */}
        {showUploader && (
          <Card className="p-5 border-[#EC4899]/30 bg-[#FFF9FC]/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">Uppy Folder Organizer</span>
                <p className="text-xs text-slate-700 font-extrabold flex items-center gap-1">
                  <Plus size={14} className="text-[#EC4899]" />
                  Select Default Target Category Folder:
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value as StorageCategoryFolder)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none"
                >
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
                <button onClick={() => setShowUploader(false)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleFilesUpload(e.dataTransfer.files);
                }
              }}
              onClick={() => mediaFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragging ? 'border-[#EC4899] bg-[#FFF1F7]/60' : 'border-slate-300 hover:border-[#EC4899] bg-white'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FCE7F3] text-[#EC4899] flex items-center justify-center">
                <Upload size={24} className={isUploading ? 'animate-bounce' : ''} />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800">
                  {isUploading ? 'Uploading selected assets...' : 'Click to browse or drag & drop files here'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Uploading to /{uploadFolder} • Storage: {config.activeDriver.toUpperCase()}
                </p>
              </div>
              <input
                type="file"
                ref={mediaFileInputRef}
                multiple
                onChange={(e) => e.target.files && handleFilesUpload(e.target.files)}
                className="hidden"
              />
            </div>
          </Card>
        )}

        {/* Storage Usage Progress Bar */}
        <Card className="p-4 space-y-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <HardDrive className="text-indigo-400" size={18} />
              <span className="font-extrabold text-sm tracking-tight">Platform Storage Capacity ({config.activeDriver.toUpperCase()})</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold border border-indigo-500/30">
                {stats.formattedTotalSize} / 100 GB Used
              </span>
            </div>
            <span className="text-[11px] text-slate-300 font-bold">
              {files.length} Total Registered Files
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            {stats.categories.map((cat) => (
              <div 
                key={cat.folder}
                className="transition-all duration-500" 
                style={{
                  width: `${(cat.totalSizeBytes / totalQuotaBytes) * 100}%`,
                  backgroundColor: cat.color
                }}
                title={`${cat.label}: ${formatBytes(cat.totalSizeBytes)}`}
              />
            ))}
          </div>

          {/* Metric Legend */}
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-300 pt-1">
            {stats.categories.map((cat) => (
              <div key={cat.folder} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span>{cat.label} ({formatBytes(cat.totalSizeBytes)})</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 p-4 border border-slate-200 rounded-2xl">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search query */}
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={13} />
              <input
                type="text"
                placeholder="Search by filename, uploader, or media ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-indigo-500 font-medium shadow-xs"
              />
            </div>
            
            {/* Folder / Category filter */}
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-[#A1A1AA]" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 font-bold shadow-xs cursor-pointer"
              >
                <option value="all">All Folders</option>
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
              
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 font-bold shadow-xs cursor-pointer"
              >
                <option value="all">All Media Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
              </select>

              {/* Sort by */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 font-bold shadow-xs cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="size">Size (Large)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* View Mode 1: Responsive Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAssetIds.includes(asset.id);

              return (
                <div 
                  key={asset.id} 
                  className={`bg-white border rounded-2xl overflow-hidden group hover:shadow-md transition-all flex flex-col ${
                    isSelected ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200'
                  }`}
                >
                  {/* Thumbnail / Media Container */}
                  <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                    {asset.mimeType.startsWith('image/') ? (
                      <img 
                        src={asset.url} 
                        alt={asset.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400';
                        }}
                      />
                    ) : asset.mimeType.startsWith('video/') ? (
                      <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                        <video src={asset.url} className="w-full h-full object-cover opacity-60" muted />
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                          <Film size={28} className="text-white drop-shadow-md" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center space-y-2">
                        {renderMediaTypeIcon(asset.mimeType)}
                        <p className="text-[10px] font-mono text-slate-300 truncate max-w-[150px]">{asset.name}</p>
                      </div>
                    )}

                    {/* Selection Checkbox Overlay */}
                    <button
                      onClick={() => handleToggleSelect(asset.id)}
                      className="absolute top-2.5 left-2.5 bg-slate-900/70 backdrop-blur-xs text-white p-1 rounded-lg hover:bg-indigo-600 transition-colors cursor-pointer border-none"
                    >
                      {isSelected ? <CheckSquare size={16} className="text-indigo-400" /> : <Square size={16} />}
                    </button>

                    {/* Folder Category Badge Overlay */}
                    <div className="absolute top-2.5 right-2.5">
                      <Badge variant="pink" size="sm" className="bg-pink-900/80 text-pink-200 border-pink-700/80 backdrop-blur-xs">
                        /{asset.folder}
                      </Badge>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate" title={asset.name}>
                        {asset.name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mt-1">
                        <span>{formatBytes(asset.sizeBytes)}</span>
                        <span>{asset.mimeType.split('/').pop()?.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {asset.uploadedBy && (
                          <>
                            <Avatar src={asset.uploadedBy.avatar} alt={asset.uploadedBy.name} size="sm" />
                            <span className="text-[10px] font-extrabold text-slate-700 truncate">@{asset.uploadedBy.username}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-1.5 py-1 text-slate-500 hover:text-indigo-600"
                          onClick={() => setSelectedAsset(asset)}
                          title="Inspect Metadata"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-1.5 py-1 text-slate-500 hover:text-indigo-600"
                          onClick={() => handleOpenRename(asset)}
                          title="Rename or Move File"
                        >
                          <Move size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-1.5 py-1 text-slate-500 hover:text-rose-600"
                          onClick={() => handleRequestDeleteSingle(asset)}
                          title="Delete File"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredAssets.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500 font-bold bg-white border border-slate-200 rounded-2xl">
                No storage media assets found matching the selected filters.
              </div>
            )}
          </div>
        )}

        {/* View Mode 2: Compact Data Table */}
        {viewMode === 'table' && (
          <Card className="overflow-hidden p-0 border-slate-200/80 shadow-sm bg-white">
            <div className="overflow-x-auto relative">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[#71717A] font-bold">
                    <th className="py-3.5 px-4 w-10">
                      <button onClick={handleSelectAll} className="text-indigo-600 hover:opacity-80 bg-transparent border-none cursor-pointer">
                        {filteredAssets.length > 0 && filteredAssets.every(a => selectedAssetIds.includes(a.id)) ? (
                          <CheckSquare size={15} />
                        ) : (
                          <Square size={15} />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">Filename & Asset</th>
                    <th className="py-3.5 px-4">Folder</th>
                    <th className="py-3.5 px-4">Driver</th>
                    <th className="py-3.5 px-4">File Size</th>
                    <th className="py-3.5 px-4">Mime Type</th>
                    <th className="py-3.5 px-4">Uploaded By</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-medium">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <button onClick={() => handleToggleSelect(asset.id)} className="text-slate-500 bg-transparent border-none cursor-pointer">
                          {selectedAssetIds.includes(asset.id) ? (
                            <CheckSquare size={15} className="text-indigo-600" />
                          ) : (
                            <Square size={15} />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center shrink-0">
                            {asset.mimeType.startsWith('image/') ? (
                              <img src={asset.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              renderMediaTypeIcon(asset.mimeType)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-xs">{asset.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Original: {asset.originalName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="pink" size="sm">/{asset.folder}</Badge>
                      </td>
                      <td className="py-3 px-4 font-mono uppercase text-[10px] text-slate-500 font-extrabold">
                        {asset.driver}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {formatBytes(asset.sizeBytes)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                        {asset.mimeType}
                      </td>
                      <td className="py-3 px-4">
                        {asset.uploadedBy && (
                          <>
                            <span className="font-bold text-slate-900">{asset.uploadedBy.name}</span>
                            <span className="text-[10px] text-slate-400 ml-1">(@{asset.uploadedBy.username})</span>
                          </>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(asset)}>
                            Inspect
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenRename(asset)}>
                            Move
                          </Button>
                          <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => handleRequestDeleteSingle(asset)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Modal: Detailed Asset Preview & Metadata Inspector */}
        <Modal
          isOpen={selectedAsset !== null}
          onClose={() => setSelectedAsset(null)}
          title={selectedAsset ? `Media Asset: ${selectedAsset.name}` : ''}
        >
          {selectedAsset && (
            <div className="space-y-4">
              {/* Media Preview Box */}
              <div className="bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center min-h-[220px] max-h-[350px]">
                {selectedAsset.mimeType.startsWith('image/') ? (
                  <img src={selectedAsset.url} alt={selectedAsset.name} className="max-h-[350px] object-contain" />
                ) : selectedAsset.mimeType.startsWith('video/') ? (
                  <video src={selectedAsset.url} controls className="max-h-[350px] w-full" />
                ) : selectedAsset.mimeType.startsWith('audio/') ? (
                  <div className="p-6 text-center space-y-4 w-full">
                    <Music size={40} className="mx-auto text-amber-400" />
                    <audio src={selectedAsset.url} controls className="w-full" />
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <FileText size={48} className="mx-auto text-emerald-400" />
                    <p className="text-xs text-white font-mono">{selectedAsset.name}</p>
                  </div>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">File Size</span>
                  <p className="font-mono font-bold text-slate-900">{formatBytes(selectedAsset.sizeBytes)}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">MIME Content Type</span>
                  <p className="font-mono font-bold text-slate-900">{selectedAsset.mimeType}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Uploader Profile</span>
                  <p className="font-bold text-slate-900">
                    {selectedAsset.uploadedBy?.name} (@{selectedAsset.uploadedBy?.username})
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Storage Folder</span>
                  <p className="font-mono font-bold text-slate-900">/{selectedAsset.folder}</p>
                </div>
              </div>

              {/* Direct Copy URL */}
              <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl">
                <input
                  type="text"
                  readOnly
                  value={selectedAsset.url}
                  className="bg-transparent border-none text-[11px] font-mono text-slate-600 flex-1 focus:outline-none px-2 truncate"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(selectedAsset.url, selectedAsset.id)}
                  leftIcon={copiedUrlId === selectedAsset.id ? <Check size={13} /> : <Copy size={13} />}
                >
                  {copiedUrlId === selectedAsset.id ? 'Copied' : 'Copy Link'}
                </Button>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <Button variant="outline" size="sm" onClick={() => setSelectedAsset(null)}>
                  Close
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleRequestDeleteSingle(selectedAsset)}>
                  Delete File
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal: Safety Warning when Deleting Content */}
        <Modal
          isOpen={assetToDelete !== null}
          onClose={() => setAssetToDelete(null)}
          title="Confirm Media File Deletion"
        >
          {assetToDelete && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs">
                <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-extrabold">Confirm Permanent Deletion</p>
                  <p className="mt-1 leading-snug">
                    Are you sure you want to permanently delete <strong>"{assetToDelete.name}"</strong> ({formatBytes(assetToDelete.sizeBytes)}) from {config.activeDriver} storage?
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <Button variant="outline" size="sm" onClick={() => setAssetToDelete(null)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={executeDeleteSingle}>
                  Confirm Delete
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal: Confirm Bulk Media Delete */}
        <Modal
          isOpen={isBulkDeleteConfirmOpen}
          onClose={() => setIsBulkDeleteConfirmOpen(false)}
          title="Confirm Bulk Media Deletion"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-900 text-xs">
              <ShieldAlert className="shrink-0 mt-0.5 text-rose-600" size={18} />
              <div>
                <p className="font-extrabold">Permanent Bulk Media Purge</p>
                <p className="mt-1 leading-snug">
                  You are about to delete <strong>{selectedAssetIds.length} media files</strong> from {config.activeDriver} storage.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsBulkDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={executeBulkDelete}>
                Delete {selectedAssetIds.length} Files
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Rename and Move Media Asset */}
        <Modal
          isOpen={isRenameOpen}
          onClose={() => setIsRenameOpen(false)}
          title="Rename or Move Media File"
        >
          {assetToRename && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">New Filename:</label>
                <input 
                  type="text"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Move to Folder Location:</label>
                <select 
                  value={folderInput}
                  onChange={(e) => setFolderInput(e.target.value as StorageCategoryFolder)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none font-bold"
                >
                  <option value="avatars">/avatars</option>
                  <option value="covers">/covers</option>
                  <option value="posts">/posts</option>
                  <option value="reels">/reels</option>
                  <option value="stories">/stories</option>
                  <option value="messages">/messages</option>
                  <option value="themes">/themes</option>
                  <option value="plugins">/plugins</option>
                  <option value="documents">/documents</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <Button variant="outline" size="sm" onClick={() => setIsRenameOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={executeRename}>
                  Apply Changes
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </RoleGuard>
  );
}
