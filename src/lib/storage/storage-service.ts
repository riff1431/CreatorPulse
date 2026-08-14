import { StorageConfig, StorageDriverType, StorageCategoryFolder, StoredFile, StorageStats, StorageTestResult } from './storage-types';

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  activeDriver: 'local',
  maxUploadSizeBytes: 50 * 1024 * 1024, // 50MB
  maxUploadSizeMB: 50,
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    'audio/mp3',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed'
  ],
  autoOptimizeImages: true,
  preserveOriginalFilenames: false,
  local: {
    basePath: 'public/uploads',
    publicUrlPrefix: '/uploads',
    isWritable: true,
  },
  supabase: {
    bucketName: 'creatorpulse-media',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key-token',
    isPublic: true,
  }
};

export const INITIAL_STORED_FILES: StoredFile[] = [
  {
    id: 'file-1',
    name: 'avatar-elena.jpg',
    originalName: 'elena_profile.jpg',
    folder: 'avatars',
    driver: 'local',
    path: 'avatars/avatar-elena.jpg',
    url: '/uploads/avatars/avatar-elena.jpg',
    sizeBytes: 245760, // 240 KB
    mimeType: 'image/jpeg',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'file-2',
    name: 'cover-sarah-gradient.webp',
    originalName: 'banner_header.webp',
    folder: 'covers',
    driver: 'local',
    path: 'covers/cover-sarah-gradient.webp',
    url: '/uploads/covers/cover-sarah-gradient.webp',
    sizeBytes: 1048576, // 1 MB
    mimeType: 'image/webp',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'file-3',
    name: 'post-ui-figma-mastery.png',
    originalName: 'figma_preview.png',
    folder: 'posts',
    driver: 'local',
    path: 'posts/post-ui-figma-mastery.png',
    url: '/uploads/posts/post-ui-figma-mastery.png',
    sizeBytes: 3145728, // 3 MB
    mimeType: 'image/png',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'file-4',
    name: 'reel-cyber-motion-4k.mp4',
    originalName: 'cyber_reel_final.mp4',
    folder: 'reels',
    driver: 'local',
    path: 'reels/reel-cyber-motion-4k.mp4',
    url: '/uploads/reels/reel-cyber-motion-4k.mp4',
    sizeBytes: 15728640, // 15 MB
    mimeType: 'video/mp4',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'file-5',
    name: 'theme-blush-core-v1.0.zip',
    originalName: 'blush-core-theme-bundle.zip',
    folder: 'themes',
    driver: 'local',
    path: 'themes/theme-blush-core-v1.0.zip',
    url: '/uploads/themes/theme-blush-core-v1.0.zip',
    sizeBytes: 2097152, // 2 MB
    mimeType: 'application/zip',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'file-6',
    name: 'plugin-drm-watermark.zip',
    originalName: 'drm-guard-v2.1.zip',
    folder: 'plugins',
    driver: 'local',
    path: 'plugins/plugin-drm-watermark.zip',
    url: '/uploads/plugins/plugin-drm-watermark.zip',
    sizeBytes: 1572864, // 1.5 MB
    mimeType: 'application/zip',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  }
];

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function computeStorageStats(files: StoredFile[], activeDriver: StorageDriverType): StorageStats {
  const folders: { folder: StorageCategoryFolder; label: string; color: string }[] = [
    { folder: 'avatars', label: 'User Avatars', color: '#EC4899' },
    { folder: 'covers', label: 'Cover Banners', color: '#8B5CF6' },
    { folder: 'posts', label: 'Feed & Media Posts', color: '#3B82F6' },
    { folder: 'reels', label: 'Reels & Videos', color: '#10B981' },
    { folder: 'stories', label: '24h Stories', color: '#F59E0B' },
    { folder: 'messages', label: 'Direct Messages', color: '#6366F1' },
    { folder: 'themes', label: 'Themes Packages', color: '#D946EF' },
    { folder: 'plugins', label: 'Plugin Add-ons', color: '#14B8A6' },
    { folder: 'documents', label: 'Documents & Payouts', color: '#64748B' },
  ];

  const totalSizeBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);

  const categories = folders.map((item) => {
    const matchingFiles = files.filter((f) => f.folder === item.folder);
    const size = matchingFiles.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    const percentage = totalSizeBytes > 0 ? Math.round((size / totalSizeBytes) * 100) : 0;

    return {
      folder: item.folder,
      label: item.label,
      fileCount: matchingFiles.length,
      totalSizeBytes: size,
      percentage,
      color: item.color,
    };
  });

  return {
    activeDriver,
    totalFiles: files.length,
    totalSizeBytes,
    formattedTotalSize: formatBytes(totalSizeBytes),
    categories,
    lastCheckedAt: new Date().toISOString(),
  };
}
