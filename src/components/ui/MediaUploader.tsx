'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { 
  Upload, Image as ImageIcon, FileText, X, Check, Copy, 
  FolderOpen, Link as LinkIcon, RefreshCw, AlertCircle, Eye, Sparkles
} from 'lucide-react';
import { useStorageManager } from '@/lib/storage/storage-context';
import { StorageCategoryFolder, StoredFile } from '@/lib/storage/storage-types';
import { formatBytes } from '@/lib/storage/storage-service';
import { MediaLibraryModal } from '@/components/admin/MediaLibraryModal';

export interface MediaUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: StorageCategoryFolder;
  label?: string;
  description?: string;
  accept?: Record<string, string[]> | 'images' | 'icons' | 'videos' | 'all';
  maxSizeMB?: number;
  showMediaLibraryButton?: boolean;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  className?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  value = '',
  onChange,
  folder = 'covers',
  label,
  description,
  accept = 'images',
  maxSizeMB = 20,
  showMediaLibraryButton = true,
  aspectRatio = 'auto',
  className = ''
}) => {
  const { uploadFile, config } = useStorageManager();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [isManualUrlMode, setIsManualUrlMode] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState(value);
  const [copied, setCopied] = useState(false);

  // Configure accepted file types for react-dropzone
  const getAcceptedMimes = (): Accept | undefined => {
    if (typeof accept === 'object') return accept;
    if (accept === 'images') {
      return {
        'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']
      };
    }
    if (accept === 'icons') {
      return {
        'image/x-icon': ['.ico'],
        'image/png': ['.png'],
        'image/svg+xml': ['.svg']
      };
    }
    if (accept === 'videos') {
      return {
        'video/*': ['.mp4', '.webm', '.mov']
      };
    }
    return undefined;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploadError(null);
      setIsUploading(true);

      try {
        const res = await uploadFile(file, folder);
        if (res.success && res.file) {
          onChange(res.file.url);
          setManualUrlInput(res.file.url);
        } else {
          setUploadError(res.error || 'Failed to upload media asset');
        }
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsUploading(false);
      }
    },
    [uploadFile, folder, onChange]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: getAcceptedMimes(),
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
  });

  const handleMediaLibrarySelect = (selectedFiles: StoredFile[]) => {
    if (selectedFiles && selectedFiles.length > 0) {
      const selected = selectedFiles[0];
      onChange(selected.url);
      setManualUrlInput(selected.url);
      setShowLibraryModal(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setManualUrlInput('');
    setUploadError(null);
  };

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) return;
    const fullUrl = value.startsWith('http') ? value : `${window.location.origin}${value}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(manualUrlInput.trim());
    setIsManualUrlMode(false);
  };

  const getAspectClass = () => {
    if (aspectRatio === 'square') return 'aspect-square max-w-[140px]';
    if (aspectRatio === 'banner') return 'aspect-[3/1] max-h-36 w-full';
    if (aspectRatio === 'video') return 'aspect-video max-h-48 w-full';
    return 'h-32 w-full';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Top Actions */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
            <span>{label}</span>
          </label>
        )}

        <div className="flex items-center gap-2">
          {showMediaLibraryButton && (
            <button
              type="button"
              onClick={() => setShowLibraryModal(true)}
              className="text-[11px] font-bold text-[#BE185D] hover:text-[#EC4899] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FolderOpen size={12} />
              <span>Media Library</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsManualUrlMode(!isManualUrlMode)}
            className="text-[11px] font-semibold text-[#71717A] hover:text-[#18181B] flex items-center gap-1 cursor-pointer"
          >
            <LinkIcon size={11} />
            <span>{isManualUrlMode ? 'Upload Mode' : 'Paste URL'}</span>
          </button>
        </div>
      </div>

      {description && (
        <p className="text-[11px] text-[#71717A] font-medium -mt-1">{description}</p>
      )}

      {/* Manual URL Input Mode */}
      {isManualUrlMode ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="https://example.com/asset.png or /uploads/..."
            value={manualUrlInput}
            onChange={(e) => setManualUrlInput(e.target.value)}
            className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-mono"
          />
          <button
            type="button"
            onClick={handleApplyManualUrl}
            className="px-3 py-2 rounded-xl bg-[#EC4899] text-white text-xs font-bold hover:bg-[#DB2777] shrink-0 cursor-pointer shadow-2xs"
          >
            Apply
          </button>
        </div>
      ) : value ? (
        /* Preview State when Image/Asset is present */
        <div className="relative rounded-2xl border border-[#F3DCE8] bg-[#FFF9FC] p-3 space-y-2 group transition-all">
          <div className="flex items-center gap-3">
            {/* Thumbnail Preview */}
            <div className={`relative rounded-xl overflow-hidden bg-white border border-[#F3DCE8] shrink-0 flex items-center justify-center ${
              aspectRatio === 'square' ? 'w-16 h-16' : 'w-24 h-16'
            }`}>
              <img
                src={value}
                alt="Asset Preview"
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* URL & Driver Info */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-xs font-bold text-[#18181B] truncate" title={value}>
                {value.split('/').pop() || value}
              </p>
              <p className="text-[10px] text-[#71717A] font-mono truncate max-w-xs">{value}</p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[9px] font-bold uppercase text-[#BE185D] bg-[#FCE7F3] px-2 py-0.2 rounded-md">
                  Active Driver: {config.activeDriver}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="p-1.5 rounded-lg bg-white border border-[#F3DCE8] text-[#71717A] hover:text-[#EC4899] transition-colors cursor-pointer"
                title="Copy Public URL"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>

              <button
                type="button"
                onClick={() => setShowLibraryModal(true)}
                className="p-1.5 rounded-lg bg-white border border-[#F3DCE8] text-[#71717A] hover:text-[#BE185D] transition-colors cursor-pointer"
                title="Replace from Media Library"
              >
                <FolderOpen size={14} />
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg bg-white border border-[#F3DCE8] text-[#71717A] hover:text-[#F43F5E] hover:bg-rose-50 transition-colors cursor-pointer"
                title="Remove Asset"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone Upload Box */
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 relative ${
            isDragActive
              ? 'border-[#EC4899] bg-[#FFF1F7] scale-[1.01]'
              : isDragReject
              ? 'border-rose-400 bg-rose-50'
              : 'border-[#F3DCE8] hover:border-[#EC4899] bg-[#FFF9FC]/60 hover:bg-white'
          }`}
        >
          <input {...getInputProps()} />

          <div className="w-10 h-10 rounded-2xl bg-[#FCE7F3] text-[#EC4899] flex items-center justify-center shadow-2xs">
            {isUploading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-[#18181B]">
              {isUploading
                ? 'Uploading to storage...'
                : isDragActive
                ? 'Drop the file here to upload'
                : 'Drag & drop file here, or click to browse'}
            </p>
            <p className="text-[10px] text-[#71717A] mt-0.5 font-medium">
              Target folder: <span className="font-mono text-[#BE185D]">/{folder}</span> • Max {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold flex items-center gap-1.5">
          <AlertCircle size={13} className="shrink-0 text-rose-500" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Media Library Selector Modal */}
      {showLibraryModal && (
        <MediaLibraryModal
          isOpen={showLibraryModal}
          onClose={() => setShowLibraryModal(false)}
          onSelect={handleMediaLibrarySelect}
          initialFolder={folder}
          maxFiles={1}
        />
      )}
    </div>
  );
};
