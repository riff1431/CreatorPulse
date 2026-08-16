export type StorageDriverType = 'local' | 's3' | 'r2' | 'supabase';

export type StorageCategoryFolder = 
  | 'avatars' 
  | 'covers' 
  | 'posts' 
  | 'reels' 
  | 'stories' 
  | 'messages' 
  | 'themes' 
  | 'plugins' 
  | 'documents';

export const STORAGE_FOLDERS: StorageCategoryFolder[] = [
  'avatars',
  'covers',
  'posts',
  'reels',
  'stories',
  'messages',
  'themes',
  'plugins',
  'documents'
];

export interface LocalStorageConfig {
  basePath: string; // 'public/uploads'
  publicUrlPrefix: string; // '/uploads'
  isWritable: boolean;
}

export interface S3StorageConfig {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string; // Optional custom endpoint for S3 compatible
  cdnUrl?: string; // Optional CloudFront or custom CDN URL (e.g., https://cdn.example.com)
  forcePathStyle?: boolean;
}

export interface R2StorageConfig {
  accountId: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region?: string; // default 'auto'
  endpoint?: string; // https://<accountId>.r2.cloudflarestorage.com
  publicUrl?: string; // e.g. https://pub-xxxx.r2.dev or custom domain
}

export interface SupabaseStorageConfig {
  bucketName: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  isPublic: boolean;
}

export interface StorageConfig {
  activeDriver: StorageDriverType;
  maxUploadSizeBytes: number; // e.g. 52428800 (50MB)
  maxUploadSizeMB: number;
  allowedMimeTypes: string[];
  autoOptimizeImages: boolean;
  preserveOriginalFilenames: boolean;
  enableFallbackToLocal: boolean;
  local: LocalStorageConfig;
  s3: S3StorageConfig;
  r2: R2StorageConfig;
  supabase: SupabaseStorageConfig;
}

export interface StoredFile {
  id: string;
  name: string;
  originalName: string;
  folder: StorageCategoryFolder;
  driver: StorageDriverType;
  path: string; // relative path e.g. 'posts/post_123.jpg'
  url: string; // full accessible URL
  sizeBytes: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  isPrivate?: boolean;
  isLinked?: boolean;
  linkedEntity?: {
    type?: string;
    id?: string;
    title?: string;
  };
}

export interface PresignedUploadRequest {
  filename: string;
  folder: StorageCategoryFolder;
  mimeType: string;
  sizeBytes?: number;
  isPrivate?: boolean;
  driver?: StorageDriverType;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  fileUrl: string;
  path: string;
  driver: StorageDriverType;
  expiresInSeconds: number;
  headers?: Record<string, string>;
  isDirectUpload: boolean;
}

export interface StorageMigrationBatchRequest {
  sourceDriver: StorageDriverType;
  targetDriver: StorageDriverType;
  folders?: StorageCategoryFolder[];
  offset: number;
  limit: number;
  deleteFromSource?: boolean;
  overwriteExisting?: boolean;
}

export interface StorageMigrationBatchResult {
  success: boolean;
  batchIndex: number;
  processedCount: number;
  migratedCount: number;
  skippedCount: number;
  failedCount: number;
  hasMore: boolean;
  totalFiles: number;
  errors?: { file: string; error: string }[];
}

export interface CategoryUsageStat {
  folder: StorageCategoryFolder;
  label: string;
  fileCount: number;
  totalSizeBytes: number;
  percentage: number;
  color: string;
}

export interface StorageStats {
  activeDriver: StorageDriverType;
  totalFiles: number;
  totalSizeBytes: number;
  formattedTotalSize: string;
  categories: CategoryUsageStat[];
  lastCheckedAt: string;
  driverStatuses?: Record<StorageDriverType, {
    isConfigured: boolean;
    isOnline: boolean;
    lastTested?: string;
  }>;
}

export interface StorageTestResult {
  driver: StorageDriverType;
  success: boolean;
  latencyMs: number;
  message: string;
  readOk: boolean;
  writeOk: boolean;
  deleteOk: boolean;
  testedAt: string;
  details?: Record<string, any>;
}

export interface StorageMigrationRequest {
  sourceDriver: StorageDriverType;
  targetDriver: StorageDriverType;
  folders?: StorageCategoryFolder[];
  overwriteExisting?: boolean;
  deleteFromSource?: boolean;
}

export interface StorageMigrationResult {
  success: boolean;
  totalFiles: number;
  migratedCount: number;
  skippedCount: number;
  failedCount: number;
  errors?: { file: string; error: string }[];
  durationMs: number;
  startedAt: string;
  completedAt: string;
}

export interface StorageMigrationProgress {
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentFile?: string;
  currentIndex: number;
  totalFiles: number;
  percentage: number;
  logs: string[];
}

export interface IStorageDriver {
  name: StorageDriverType;
  upload(fileBuffer: Buffer, relativePath: string, mimeType: string, isPrivate?: boolean): Promise<{ url: string; path: string; size: number }>;
  download(relativePath: string): Promise<{ buffer: Buffer; mimeType: string }>;
  delete(relativePath: string): Promise<boolean>;
  deleteMany(relativePaths: string[]): Promise<{ deleted: number; errors?: string[] }>;
  move(sourcePath: string, destinationPath: string): Promise<{ url: string; path: string }>;
  copy(sourcePath: string, destinationPath: string): Promise<{ url: string; path: string }>;
  getPublicUrl(relativePath: string): string;
  getPresignedUploadUrl?(relativePath: string, mimeType: string, isPrivate?: boolean, expiresInSeconds?: number): Promise<{ uploadUrl: string; fileUrl: string; headers?: Record<string, string> }>;
  getPresignedDownloadUrl?(relativePath: string, expiresInSeconds?: number): Promise<string>;
  listFiles(folder?: StorageCategoryFolder): Promise<StoredFile[]>;
  testConnection(): Promise<StorageTestResult>;
  getUsageStats(): Promise<{ totalBytes: number; totalFiles: number; folderBreakdown: Record<string, { count: number; bytes: number }> }>;
}

