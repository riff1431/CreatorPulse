export type StorageDriverType = 'local' | 'supabase';

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

export interface StorageConfig {
  activeDriver: StorageDriverType;
  maxUploadSizeBytes: number; // e.g. 52428800 (50MB)
  maxUploadSizeMB: number;
  allowedMimeTypes: string[];
  autoOptimizeImages: boolean;
  preserveOriginalFilenames: boolean;
  local: {
    basePath: string; // 'public/uploads'
    publicUrlPrefix: string; // '/uploads'
    isWritable: boolean;
  };
  supabase: {
    bucketName: string; // 'creatorpulse-media'
    supabaseUrl: string;
    supabaseAnonKey: string;
    isPublic: boolean;
  };
}

export interface StoredFile {
  id: string;
  name: string;
  originalName: string;
  folder: StorageCategoryFolder;
  driver: StorageDriverType;
  path: string;
  url: string;
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
  isLinked?: boolean;
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
}
