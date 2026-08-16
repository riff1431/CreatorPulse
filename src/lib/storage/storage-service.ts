import { 
  StorageConfig, 
  StorageDriverType, 
  StorageCategoryFolder, 
  StoredFile, 
  StorageStats, 
  STORAGE_FOLDERS 
} from './storage-types';

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
  enableFallbackToLocal: true,
  local: {
    basePath: 'public/uploads',
    publicUrlPrefix: '/uploads',
    isWritable: true,
  },
  s3: {
    bucket: process.env.AWS_S3_BUCKET || '',
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    endpoint: process.env.AWS_S3_ENDPOINT || '',
    cdnUrl: process.env.AWS_S3_CDN_URL || '',
    forcePathStyle: false,
  },
  r2: {
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID || '',
    bucket: process.env.CLOUDFLARE_R2_BUCKET || '',
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || '',
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || '',
  },
  supabase: {
    bucketName: 'creatorpulse-media',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key-token',
    isPublic: true,
  }
};

export const STORAGE_FOLDER_INFO: Record<StorageCategoryFolder, { label: string; description: string; color: string; iconName: string }> = {
  avatars: {
    label: 'User Avatars',
    description: 'Profile photos and user avatars',
    color: '#EC4899',
    iconName: 'User'
  },
  covers: {
    label: 'Cover Banners',
    description: 'Profile headers and page cover banners',
    color: '#8B5CF6',
    iconName: 'Image'
  },
  posts: {
    label: 'Feed & Media Posts',
    description: 'Images and videos shared in posts and feeds',
    color: '#3B82F6',
    iconName: 'FileImage'
  },
  reels: {
    label: 'Reels & Videos',
    description: 'Short video reels and media clips',
    color: '#10B981',
    iconName: 'Film'
  },
  stories: {
    label: '24h Stories',
    description: 'Ephemeral stories and temporary media',
    color: '#F59E0B',
    iconName: 'Clock'
  },
  messages: {
    label: 'Direct Messages',
    description: 'Private message attachments and audio clips',
    color: '#6366F1',
    iconName: 'MessageSquare'
  },
  themes: {
    label: 'Theme Packages',
    description: 'Custom frontend theme ZIP bundles and previews',
    color: '#D946EF',
    iconName: 'Palette'
  },
  plugins: {
    label: 'Plugin Add-ons',
    description: 'Installable plugin ZIP archives and assets',
    color: '#14B8A6',
    iconName: 'Plug'
  },
  documents: {
    label: 'Documents & Payouts',
    description: 'Invoices, payout statements and PDF documents',
    color: '#64748B',
    iconName: 'FileText'
  }
};

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function sanitizeFilename(filename: string): string {
  return filename
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_');
}

export function computeStorageStats(
  files: StoredFile[], 
  activeDriver: StorageDriverType,
  driverStatuses?: Record<StorageDriverType, { isConfigured: boolean; isOnline: boolean; lastTested?: string }>
): StorageStats {
  const totalSizeBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);

  const categories = STORAGE_FOLDERS.map((folder) => {
    const info = STORAGE_FOLDER_INFO[folder];
    const matchingFiles = files.filter((f) => f.folder === folder);
    const size = matchingFiles.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    const percentage = totalSizeBytes > 0 ? Math.round((size / totalSizeBytes) * 100) : 0;

    return {
      folder,
      label: info?.label || folder,
      fileCount: matchingFiles.length,
      totalSizeBytes: size,
      percentage,
      color: info?.color || '#6B7280',
    };
  });

  return {
    activeDriver,
    totalFiles: files.length,
    totalSizeBytes,
    formattedTotalSize: formatBytes(totalSizeBytes),
    categories,
    lastCheckedAt: new Date().toISOString(),
    driverStatuses: driverStatuses || {
      local: { isConfigured: true, isOnline: true },
      s3: { isConfigured: false, isOnline: false },
      r2: { isConfigured: false, isOnline: false },
      supabase: { isConfigured: false, isOnline: false },
    }
  };
}
