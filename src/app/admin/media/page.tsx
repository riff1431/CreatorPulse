'use client';

import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, Search, Filter, Trash2, Eye, Grid, List, 
  Copy, Check, ShieldAlert, AlertTriangle, HardDrive, RefreshCw, 
  ExternalLink, FileText, Film, Music, File, Link2, CheckSquare, 
  Square, Info, Download
} from 'lucide-react';
import { 
  getMediaAssets, 
  saveMediaAssets, 
  deleteMediaAssets, 
  formatBytes, 
  MediaAsset, 
  MediaType, 
  MediaCategory 
} from '@/lib/media/media-store';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';
import { Modal } from '@/components/admin/ui/Modal';
import { Avatar } from '@/components/admin/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AdminMediaManagerPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [usageFilter, setUsageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals and selection
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [assetToDelete, setAssetToDelete] = useState<MediaAsset | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);

  const { showToast } = useToast();

  const loadData = () => {
    setAssets(getMediaAssets());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('creatorpulse_media_updated', handleUpdate);
    return () => {
      window.removeEventListener('creatorpulse_media_updated', handleUpdate);
    };
  }, []);

  // Calculate storage metrics
  const totalSizeBytes = assets.reduce((acc, curr) => acc + curr.sizeBytes, 0);
  const imageSizeBytes = assets.filter(a => a.type === 'image').reduce((acc, curr) => acc + curr.sizeBytes, 0);
  const videoSizeBytes = assets.filter(a => a.type === 'video').reduce((acc, curr) => acc + curr.sizeBytes, 0);
  const audioSizeBytes = assets.filter(a => a.type === 'audio').reduce((acc, curr) => acc + curr.sizeBytes, 0);
  const docSizeBytes = assets.filter(a => a.type === 'document').reduce((acc, curr) => acc + curr.sizeBytes, 0);
  const totalQuotaBytes = 100 * 1024 * 1024 * 1024; // 100 GB limit demo
  const usedPercentage = Math.min(100, Math.max(1, (totalSizeBytes / totalQuotaBytes) * 100));

  const filteredAssets = assets.filter((asset) => {
    if (typeFilter !== 'all' && asset.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false;
    if (usageFilter === 'linked' && !asset.isLinked) return false;
    if (usageFilter === 'unused' && asset.isLinked) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = asset.filename.toLowerCase().includes(q);
      const matchUploader = asset.uploadedBy.name.toLowerCase().includes(q) || asset.uploadedBy.username.toLowerCase().includes(q);
      const matchId = asset.id.toLowerCase().includes(q);
      return matchName || matchUploader || matchId;
    }
    return true;
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
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    showToast('Media URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  const handleRequestDeleteSingle = (asset: MediaAsset) => {
    setAssetToDelete(asset);
  };

  const executeDeleteSingle = () => {
    if (!assetToDelete) return;
    deleteMediaAssets([assetToDelete.id]);
    showToast(`Media file "${assetToDelete.filename}" deleted safely.`, 'info');
    setAssetToDelete(null);
    if (selectedAsset && selectedAsset.id === assetToDelete.id) {
      setSelectedAsset(null);
    }
    loadData();
  };

  const executeBulkDelete = () => {
    const res = deleteMediaAssets(selectedAssetIds);
    showToast(`Deleted ${res.deletedCount} selected media assets.`, 'info');
    setSelectedAssetIds([]);
    setIsBulkDeleteConfirmOpen(false);
    loadData();
  };

  const renderMediaTypeIcon = (type: MediaType) => {
    switch (type) {
      case 'image':
        return <ImageIcon size={14} className="text-indigo-600" />;
      case 'video':
        return <Film size={14} className="text-rose-600" />;
      case 'audio':
        return <Music size={14} className="text-amber-600" />;
      case 'document':
        return <FileText size={14} className="text-emerald-600" />;
    }
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
              Browse platform uploaded images, videos, audio, and documents with storage usage metrics and linked content safeguards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={13} />} onClick={loadData}>
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

        {/* Storage Usage Progress Bar */}
        <Card className="p-4 space-y-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <HardDrive className="text-indigo-400" size={18} />
              <span className="font-extrabold text-sm tracking-tight">Platform Storage Capacity</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold border border-indigo-500/30">
                {formatBytes(totalSizeBytes)} / 100 GB Used
              </span>
            </div>
            <span className="text-[11px] text-slate-300 font-bold">
              {assets.length} Total Uploaded Files
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${(imageSizeBytes / totalQuotaBytes) * 100}%` }} 
              className="bg-indigo-500 transition-all duration-500" 
              title={`Images: ${formatBytes(imageSizeBytes)}`}
            />
            <div 
              style={{ width: `${(videoSizeBytes / totalQuotaBytes) * 100}%` }} 
              className="bg-rose-500 transition-all duration-500" 
              title={`Videos: ${formatBytes(videoSizeBytes)}`}
            />
            <div 
              style={{ width: `${(audioSizeBytes / totalQuotaBytes) * 100}%` }} 
              className="bg-amber-500 transition-all duration-500" 
              title={`Audio: ${formatBytes(audioSizeBytes)}`}
            />
            <div 
              style={{ width: `${(docSizeBytes / totalQuotaBytes) * 100}%` }} 
              className="bg-emerald-500 transition-all duration-500" 
              title={`Documents: ${formatBytes(docSizeBytes)}`}
            />
          </div>

          {/* Metric Legend */}
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-300 pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Images ({formatBytes(imageSizeBytes)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Videos ({formatBytes(videoSizeBytes)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Audio ({formatBytes(audioSizeBytes)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Documents ({formatBytes(docSizeBytes)})</span>
            </div>
          </div>
        </Card>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 p-4 border border-slate-200 rounded-2xl">
          <div className="flex flex-wrap items-center gap-3 flex-1">
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
            
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-[#A1A1AA]" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 font-bold shadow-xs cursor-pointer"
              >
                <option value="all">All File Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
              </select>
              
              <select
                value={usageFilter}
                onChange={(e) => setUsageFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 font-bold shadow-xs cursor-pointer"
              >
                <option value="all">All Usage</option>
                <option value="linked">Linked Content Only</option>
                <option value="unused">Unused / Orphaned</option>
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
                    {asset.type === 'image' ? (
                      <img 
                        src={asset.thumbnailUrl || asset.url} 
                        alt={asset.filename} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : asset.type === 'video' ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={asset.thumbnailUrl} 
                          alt={asset.filename} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Film size={28} className="text-white drop-shadow-md" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center space-y-2">
                        {renderMediaTypeIcon(asset.type)}
                        <p className="text-[10px] font-mono text-slate-300 truncate max-w-[150px]">{asset.filename}</p>
                      </div>
                    )}

                    {/* Selection Checkbox Overlay */}
                    <button
                      onClick={() => handleToggleSelect(asset.id)}
                      className="absolute top-2.5 left-2.5 bg-slate-900/70 backdrop-blur-xs text-white p-1 rounded-lg hover:bg-indigo-600 transition-colors cursor-pointer"
                    >
                      {isSelected ? <CheckSquare size={16} className="text-indigo-400" /> : <Square size={16} />}
                    </button>

                    {/* Linked Status Badge Overlay */}
                    <div className="absolute top-2.5 right-2.5">
                      {asset.isLinked ? (
                        <Badge variant="blue" size="sm" className="bg-blue-900/80 text-blue-200 border-blue-700/80 backdrop-blur-xs">
                          Linked
                        </Badge>
                      ) : (
                        <Badge variant="amber" size="sm" className="bg-amber-900/80 text-amber-200 border-amber-700/80 backdrop-blur-xs">
                          Unused
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate" title={asset.filename}>
                        {asset.filename}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mt-1">
                        <span>{formatBytes(asset.sizeBytes)}</span>
                        <span>{asset.dimensions || (asset.durationSeconds ? `${asset.durationSeconds}s` : 'Doc')}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Avatar src={asset.uploadedBy.avatar} alt={asset.uploadedBy.name} size="sm" />
                        <span className="text-[10px] font-extrabold text-slate-700 truncate">@{asset.uploadedBy.username}</span>
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
                No media assets match your active category and type filters.
              </div>
            )}
          </div>
        )}

        {/* View Mode 2: Compact Data Table */}
        {viewMode === 'table' && (
          <Card className="overflow-hidden p-0 border-slate-200/80 shadow-sm">
            <div className="overflow-x-auto relative">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[#71717A] font-bold">
                    <th className="py-3.5 px-4 w-10">
                      <button onClick={handleSelectAll} className="text-indigo-600 hover:opacity-80">
                        {filteredAssets.length > 0 && filteredAssets.every(a => selectedAssetIds.includes(a.id)) ? (
                          <CheckSquare size={15} />
                        ) : (
                          <Square size={15} />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">Filename & Asset</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">File Size</th>
                    <th className="py-3.5 px-4">Uploaded By</th>
                    <th className="py-3.5 px-4">Linked Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-medium">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <button onClick={() => handleToggleSelect(asset.id)} className="text-slate-500">
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
                            {asset.type === 'image' ? (
                              <img src={asset.thumbnailUrl || asset.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              renderMediaTypeIcon(asset.type)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-xs">{asset.filename}</p>
                            <p className="text-[10px] text-slate-400 font-mono">ID: #{asset.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] font-extrabold text-slate-500">
                        {asset.type}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {formatBytes(asset.sizeBytes)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{asset.uploadedBy.name}</span>
                        <span className="text-[10px] text-slate-400 ml-1">(@{asset.uploadedBy.username})</span>
                      </td>
                      <td className="py-3 px-4">
                        {asset.isLinked ? (
                          <Badge variant="blue" size="sm">Linked to {asset.linkedEntity?.type || 'content'}</Badge>
                        ) : (
                          <Badge variant="amber" size="sm">Unused</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(asset)}>
                            Inspect
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
          title={selectedAsset ? `Media Asset: ${selectedAsset.filename}` : ''}
        >
          {selectedAsset && (
            <div className="space-y-4">
              {/* Media Preview Box */}
              <div className="bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center min-h-[220px] max-h-[350px]">
                {selectedAsset.type === 'image' ? (
                  <img src={selectedAsset.url} alt={selectedAsset.filename} className="max-h-[350px] object-contain" />
                ) : selectedAsset.type === 'video' ? (
                  <video src={selectedAsset.url} controls className="max-h-[350px] w-full" />
                ) : selectedAsset.type === 'audio' ? (
                  <div className="p-6 text-center space-y-4 w-full">
                    <Music size={40} className="mx-auto text-amber-400" />
                    <audio src={selectedAsset.url} controls className="w-full" />
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <FileText size={48} className="mx-auto text-emerald-400" />
                    <p className="text-xs text-white font-mono">{selectedAsset.filename}</p>
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
                  <p className="font-bold text-slate-900">{selectedAsset.uploadedBy.name} (@{selectedAsset.uploadedBy.username})</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Upload Timestamp</span>
                  <p className="font-mono font-bold text-slate-900">{selectedAsset.uploadedAt}</p>
                </div>
              </div>

              {/* Linked Entity Details */}
              {selectedAsset.isLinked && selectedAsset.linkedEntity && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider flex items-center gap-1">
                    <Link2 size={13} />
                    Linked Platform Content
                  </span>
                  <p className="font-extrabold text-slate-900">
                    {selectedAsset.linkedEntity.title} <span className="text-[10px] font-mono text-blue-600">({selectedAsset.linkedEntity.type} #{selectedAsset.linkedEntity.id})</span>
                  </p>
                </div>
              )}

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

        {/* Modal: Safety Warning when Deleting Linked Content */}
        <Modal
          isOpen={assetToDelete !== null}
          onClose={() => setAssetToDelete(null)}
          title="Confirm Media File Deletion"
        >
          {assetToDelete && (
            <div className="space-y-4">
              {assetToDelete.isLinked ? (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-900 text-xs">
                  <ShieldAlert className="shrink-0 mt-0.5 text-rose-600" size={20} />
                  <div>
                    <p className="font-extrabold text-rose-950">Safety Safeguard Triggered: Linked Media File</p>
                    <p className="mt-1 leading-snug">
                      This file (<strong>{assetToDelete.filename}</strong>) is currently linked to live content: <strong>"{assetToDelete.linkedEntity?.title}"</strong>. Deleting it will cause broken image links on user feeds.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs">
                  <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-extrabold">Confirm Unused Media Purge</p>
                    <p className="mt-1 leading-snug">
                      Are you sure you want to permanently delete <strong>"{assetToDelete.filename}"</strong> ({formatBytes(assetToDelete.sizeBytes)})?
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <Button variant="outline" size="sm" onClick={() => setAssetToDelete(null)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={executeDeleteSingle}>
                  {assetToDelete.isLinked ? 'Force Un-link & Delete' : 'Confirm Delete'}
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
                  You are about to delete <strong>{selectedAssetIds.length} media files</strong> from platform storage.
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
      </div>
    </RoleGuard>
  );
}
