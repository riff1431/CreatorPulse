'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Search, Filter, Folder, Image as ImageIcon, Video, FileText, 
  Music, Archive, Grid, List, Check, Copy, Trash2, Sliders, ExternalLink, 
  Info, ArrowUpDown, CornerDownRight, Move, Upload, Plus, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useStorageManager } from '@/lib/storage/storage-context';
import { StoredFile, StorageCategoryFolder } from '@/lib/storage/storage-types';
import { formatBytes } from '@/lib/storage/storage-service';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: StoredFile[]) => void;
  allowedTypes?: string[]; // e.g. ['image/*', 'video/*'] or MIME types
  maxFiles?: number; // 1 for single select, >1 for multi select
  initialFolder?: StorageCategoryFolder;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  allowedTypes,
  maxFiles = 1,
  initialFolder = 'posts'
}) => {
  const { files, config, isLoading, deleteMultipleFiles, renameFile, uploadFile, refreshFiles } = useStorageManager();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'upload' | 'browse'>('browse');
  const [selectedFolder, setSelectedFolder] = useState<StorageCategoryFolder | 'all'>('all');
  const [uploadFolder, setUploadFolder] = useState<StorageCategoryFolder>(initialFolder);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Selected files inside the picker
  const [selectedFiles, setSelectedFiles] = useState<StoredFile[]>([]);
  const [focusedFile, setFocusedFile] = useState<StoredFile | null>(null);

  // Edit metadata form states
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editName, setEditName] = useState('');
  const [editFolder, setEditFolder] = useState<StorageCategoryFolder>('posts');
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);

  // Drag & drop upload state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset selection on open
  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]);
      setFocusedFile(null);
      setIsEditingMetadata(false);
      refreshFiles();
    }
  }, [isOpen]);

  // Handle drag and drop files
  const handleFilesToUpload = async (uploadedFileList: FileList | File[]) => {
    if (!uploadedFileList || uploadedFileList.length === 0) return;

    setIsUploading(true);
    const filesArray = Array.from(uploadedFileList);
    let successCount = 0;

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      setUploadProgress(`Uploading ${i + 1} of ${filesArray.length}: ${file.name}...`);
      const res = await uploadFile(file, uploadFolder);
      if (res.success) successCount++;
    }

    setIsUploading(false);
    setUploadProgress('');
    showToast(`Uploaded ${successCount} asset(s) to /${uploadFolder}`, 'success');
    setActiveTab('browse');
    setSelectedFolder(uploadFolder);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesToUpload(e.dataTransfer.files);
    }
  };

  // Filter and sort files
  const filteredAndSortedFiles = useMemo(() => {
    return files
      .filter((file) => {
        // Folder filter
        if (selectedFolder !== 'all' && file.folder !== selectedFolder) {
          return false;
        }

        // Allowed types filter (prop)
        if (allowedTypes && allowedTypes.length > 0) {
          const matchesAllowed = allowedTypes.some((type) => {
            if (type.endsWith('/*')) {
              const prefix = type.replace('/*', '');
              return file.mimeType.startsWith(prefix);
            }
            return file.mimeType === type;
          });
          if (!matchesAllowed) return false;
        }

        // Mime Type selector dropdown filter
        if (typeFilter !== 'all') {
          if (typeFilter === 'image' && !file.mimeType.startsWith('image/')) return false;
          if (typeFilter === 'video' && !file.mimeType.startsWith('video/')) return false;
          if (typeFilter === 'audio' && !file.mimeType.startsWith('audio/')) return false;
          if (typeFilter === 'zip' && !file.mimeType.includes('zip')) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = file.name.toLowerCase().includes(q);
          const matchesOriginal = file.originalName?.toLowerCase().includes(q);
          if (!matchesName && !matchesOriginal) return false;
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
  }, [files, selectedFolder, allowedTypes, typeFilter, searchQuery, sortBy]);

  if (!isOpen) return null;

  // Toggle selection
  const handleToggleSelectFile = (file: StoredFile) => {
    setFocusedFile(file);

    if (maxFiles === 1) {
      setSelectedFiles([file]);
      return;
    }

    const isAlreadySelected = selectedFiles.some((f) => f.id === file.id);
    if (isAlreadySelected) {
      setSelectedFiles(selectedFiles.filter((f) => f.id !== file.id));
    } else {
      if (selectedFiles.length >= maxFiles) {
        showToast(`Maximum selection limit is ${maxFiles} files`, 'info');
        return;
      }
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const handleInsertSelection = () => {
    if (selectedFiles.length === 0) return;
    onSelect(selectedFiles);
    onClose();
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrlId(id);
    showToast('Asset URL copied to clipboard', 'success');
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  const startEditMetadata = (file: StoredFile) => {
    setEditName(file.name);
    setEditFolder(file.folder);
    setIsEditingMetadata(true);
  };

  const saveMetadataChanges = async () => {
    if (!focusedFile) return;
    const res = await renameFile(focusedFile.id, editName, editFolder);
    if (res.success && res.file) {
      showToast('Asset metadata saved', 'success');
      setFocusedFile(res.file);
      setIsEditingMetadata(false);
    } else {
      showToast(res.error || 'Failed to update metadata', 'error');
    }
  };

  const handleDeleteFile = async (file: StoredFile) => {
    if (confirm(`Permanently delete "${file.name}"?`)) {
      const res = await deleteMultipleFiles([file.id]);
      if (res.success) {
        showToast('Asset deleted', 'success');
        if (focusedFile?.id === file.id) setFocusedFile(null);
        setSelectedFiles(selectedFiles.filter((f) => f.id !== file.id));
      }
    }
  };

  const getFileIconComponent = (mime: string) => {
    if (mime.startsWith('image/')) return <ImageIcon size={18} className="text-pink-500" />;
    if (mime.startsWith('video/')) return <Video size={18} className="text-emerald-500" />;
    if (mime.startsWith('audio/')) return <Music size={18} className="text-indigo-500" />;
    if (mime.includes('zip')) return <Archive size={18} className="text-purple-500" />;
    return <FileText size={18} className="text-slate-500" />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[90vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F43F5E] flex items-center justify-center text-white shadow-sm shadow-[#EC4899]/20">
              <Folder size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">Media Asset Library</h2>
              <p className="text-xs text-slate-400 font-medium">
                Active Driver: <span className="text-[#EC4899] font-bold uppercase">{config.activeDriver}</span> | Total Files: {files.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs switcher */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'browse'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Browse Library
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-white text-[#EC4899] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                + Upload New
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 flex overflow-hidden bg-slate-50/50">
          {activeTab === 'upload' ? (
            /* UPLOAD WORKSPACE */
            <div className="flex-1 p-8 flex flex-col items-center justify-center overflow-y-auto">
              <div className="w-full max-w-xl bg-white p-8 rounded-3xl border border-slate-200 shadow-lg text-center space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">Upload Media Assets</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Upload images, videos, audio, or archives to your active storage driver.
                  </p>
                </div>

                {/* Target Folder Selector */}
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <span>Target Destination Folder:</span>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value as StorageCategoryFolder)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#BE185D] font-bold focus:outline-none cursor-pointer"
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

                {/* Dropzone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                    isDragging
                      ? 'border-[#EC4899] bg-[#FFF1F7]/50 scale-[1.01]'
                      : 'border-slate-300 hover:border-[#EC4899] hover:bg-[#FFF9FC]'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#FCE7F3] text-[#EC4899] flex items-center justify-center shadow-xs">
                    <Upload size={28} className={isUploading ? 'animate-bounce' : ''} />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-slate-800">
                      {isUploading ? uploadProgress : 'Click to browse or drag & drop files here'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      Max file size: {config.maxUploadSizeMB}MB • Storage: {config.activeDriver.toUpperCase()}
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  onChange={(e) => e.target.files && handleFilesToUpload(e.target.files)}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            /* BROWSE WORKSPACE */
            <>
              {/* Media Grid / List Viewer */}
              <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
                
                {/* Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-slate-100 rounded-2xl">
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                      <input 
                        type="text"
                        placeholder="Search media assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-[#EC4899] font-medium"
                      />
                    </div>

                    {/* Folder selector */}
                    <select
                      value={selectedFolder}
                      onChange={(e) => setSelectedFolder(e.target.value as any)}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-2 text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Folders</option>
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

                    {/* Format filter */}
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-2 text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Mime Types</option>
                      <option value="image">Images</option>
                      <option value="video">Videos</option>
                      <option value="audio">Audio</option>
                      <option value="zip">Zip Archives</option>
                    </select>

                    {/* Sort selector */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-2 text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="size">File Size</option>
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === 'grid' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400'
                      }`}
                      title="Grid View"
                    >
                      <Grid size={14} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === 'list' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400'
                      }`}
                      title="List View"
                    >
                      <List size={14} />
                    </button>
                  </div>
                </div>

                {/* Media Cards Grid / List */}
                <div className="flex-1 overflow-y-auto pr-1">
                  {filteredAndSortedFiles.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                      <Folder size={36} className="text-slate-300" />
                      <p className="text-xs font-bold text-slate-600">No media assets found</p>
                      <p className="text-[11px] text-slate-400">Try adjusting your search filters or upload a new file.</p>
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                      {filteredAndSortedFiles.map((file) => {
                        const isSelected = selectedFiles.some((f) => f.id === file.id);
                        const isFocused = focusedFile?.id === file.id;

                        return (
                          <div
                            key={file.id}
                            onClick={() => handleToggleSelectFile(file)}
                            className={`group relative rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col bg-white ${
                              isSelected
                                ? 'border-[#EC4899] ring-2 ring-[#EC4899]/30 shadow-md'
                                : isFocused
                                ? 'border-slate-400 shadow-xs'
                                : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                            }`}
                          >
                            {/* Selected Checkmark overlay */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 z-10 w-5 h-5 bg-[#EC4899] text-white rounded-full flex items-center justify-center shadow-md">
                                <Check size={11} className="stroke-[3.5]" />
                              </div>
                            )}

                            {/* Thumbnail Preview Area */}
                            <div className="aspect-square bg-slate-950/5 relative overflow-hidden flex items-center justify-center">
                              {file.mimeType.startsWith('image/') ? (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : file.mimeType.startsWith('video/') ? (
                                <div className="flex flex-col items-center gap-1 text-slate-400">
                                  <Video size={24} className="text-emerald-500" />
                                  <span className="text-[9px] font-bold uppercase">Video</span>
                                </div>
                              ) : file.mimeType.startsWith('audio/') ? (
                                <div className="flex flex-col items-center gap-1 text-slate-400">
                                  <Music size={24} className="text-indigo-500" />
                                  <span className="text-[9px] font-bold uppercase">Audio</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1 text-slate-400">
                                  <FileText size={24} className="text-slate-500" />
                                  <span className="text-[9px] font-bold uppercase">Document</span>
                                </div>
                              )}

                              {/* Folder chip on thumb */}
                              <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-white/90 backdrop-blur-xs text-slate-700 px-1.5 py-0.2 rounded-md shadow-2xs">
                                /{file.folder}
                              </span>
                            </div>

                            {/* Info footer */}
                            <div className="p-2.5 space-y-1">
                              <p className="text-[11px] font-bold text-slate-900 truncate" title={file.name}>
                                {file.name}
                              </p>
                              <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold mt-1.5">
                                <span>{formatBytes(file.sizeBytes)}</span>
                                <span className="capitalize">{file.driver}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* LIST VIEW */
                    <Card className="overflow-hidden border border-slate-100 p-0">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase">
                          <tr>
                            <th className="py-2.5 px-4 w-10">Select</th>
                            <th className="py-2.5 px-4">Asset Name</th>
                            <th className="py-2.5 px-4">Folder</th>
                            <th className="py-2.5 px-4">Type</th>
                            <th className="py-2.5 px-4">Size</th>
                            <th className="py-2.5 px-4">Created At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                          {filteredAndSortedFiles.map((file) => {
                            const isSelected = selectedFiles.some((f) => f.id === file.id);
                            return (
                              <tr 
                                key={file.id}
                                onClick={() => handleToggleSelectFile(file)}
                                className={`hover:bg-slate-50/40 cursor-pointer transition-colors ${isSelected ? 'bg-[#FFF1F7]/30' : ''}`}
                              >
                                <td className="py-2.5 px-4">
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                    isSelected ? 'bg-[#EC4899] border-[#EC4899] text-white' : 'border-slate-300'
                                  }`}>
                                    {isSelected && <Check size={10} className="stroke-[3.5]" />}
                                  </div>
                                </td>
                                <td className="py-2.5 px-4 font-bold text-slate-800">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden">
                                      {file.mimeType.startsWith('image/') ? (
                                        <img src={file.url} className="object-cover w-full h-full" alt="" />
                                      ) : getFileIconComponent(file.mimeType)}
                                    </div>
                                    <span className="truncate max-w-xs">{file.name}</span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-4">
                                  <Badge variant="pink" size="sm">/{file.folder}</Badge>
                                </td>
                                <td className="py-2.5 px-4 text-slate-400 font-mono text-[10px]">{file.mimeType}</td>
                                <td className="py-2.5 px-4 font-mono font-bold">{formatBytes(file.sizeBytes)}</td>
                                <td className="py-2.5 px-4 text-slate-500">{new Date(file.createdAt).toLocaleDateString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </Card>
                  )}
                </div>
              </div>

              {/* Inspector Details Panel on Right */}
              {focusedFile && (
                <div className="w-80 border-l border-slate-100 bg-white overflow-y-auto p-4 flex flex-col justify-between shrink-0">
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Asset Metadata</h3>
                      <button 
                        onClick={() => setFocusedFile(null)} 
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Preview Area */}
                    <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
                      {focusedFile.mimeType.startsWith('image/') ? (
                        <img src={focusedFile.url} alt="" className="max-h-full object-contain" />
                      ) : focusedFile.mimeType.startsWith('video/') ? (
                        <video src={focusedFile.url} controls className="max-h-full w-full" />
                      ) : focusedFile.mimeType.startsWith('audio/') ? (
                        <audio src={focusedFile.url} controls className="w-full px-2" />
                      ) : (
                        getFileIconComponent(focusedFile.mimeType)
                      )}
                    </div>

                    {/* Details list */}
                    {isEditingMetadata ? (
                      /* Rename form */
                      <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-800">Rename Filename:</label>
                          <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-800">Move to Folder:</label>
                          <select 
                            value={editFolder}
                            onChange={(e) => setEditFolder(e.target.value as StorageCategoryFolder)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
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
                        </div>
                        <div className="flex gap-1.5 justify-end pt-1">
                          <Button variant="ghost" size="sm" onClick={() => setIsEditingMetadata(false)}>Cancel</Button>
                          <Button variant="primary" size="sm" onClick={saveMetadataChanges}>Save</Button>
                        </div>
                      </div>
                    ) : (
                      /* Standard metadata fields */
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-slate-50 py-1.5">
                          <span className="text-slate-400 font-bold">Filename</span>
                          <span className="font-bold text-slate-800 text-right truncate max-w-[150px] font-mono" title={focusedFile.name}>
                            {focusedFile.name}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 py-1.5">
                          <span className="text-slate-400 font-bold">Original Name</span>
                          <span className="font-bold text-slate-800 text-right truncate max-w-[150px]" title={focusedFile.originalName}>
                            {focusedFile.originalName}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 py-1.5">
                          <span className="text-slate-400 font-bold">Category Folder</span>
                          <span className="font-bold text-slate-800 uppercase">/{focusedFile.folder}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 py-1.5">
                          <span className="text-slate-400 font-bold">Driver</span>
                          <span className="font-bold text-slate-800 capitalize">{focusedFile.driver}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 py-1.5">
                          <span className="text-slate-400 font-bold">File Size</span>
                          <span className="font-bold text-slate-800 font-mono">{formatBytes(focusedFile.sizeBytes)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 py-1.5">
                          <span className="text-slate-400 font-bold">MIME Type</span>
                          <span className="font-bold text-slate-800 font-mono text-[10px]">{focusedFile.mimeType}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 py-1.5">
                          <span className="text-slate-400 font-bold">Created At</span>
                          <span className="font-bold text-slate-800">{new Date(focusedFile.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {/* Copy Direct URL field */}
                    <div className="flex items-center gap-1 bg-slate-50 p-2 rounded-xl">
                      <input 
                        type="text" 
                        readOnly 
                        value={focusedFile.url}
                        className="bg-transparent border-none text-[10px] text-slate-500 font-mono flex-1 focus:outline-none truncate px-1"
                      />
                      <button 
                        onClick={() => handleCopyUrl(focusedFile.url, focusedFile.id)}
                        className="p-1.5 bg-white border border-slate-100 hover:bg-[#EC4899]/5 rounded-lg text-slate-600 hover:text-[#EC4899] cursor-pointer shrink-0 transition-colors"
                        title="Copy Public URL"
                      >
                        {copiedUrlId === focusedFile.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* Actions Drawer Footer */}
                  <div className="pt-3 border-t border-slate-100 flex gap-2 justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      leftIcon={<Move size={12} />}
                      onClick={() => startEditMetadata(focusedFile)}
                    >
                      Rename/Move
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="px-2"
                      onClick={() => handleDeleteFile(focusedFile)}
                      title="Permanently Delete File"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Selection Bar */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500">
            {selectedFiles.length > 0 ? (
              <span className="text-[#BE185D] font-extrabold">
                {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
              </span>
            ) : (
              <span>Choose files to insert</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="md" 
              onClick={handleInsertSelection}
              disabled={selectedFiles.length === 0}
            >
              Insert Selected Media
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
