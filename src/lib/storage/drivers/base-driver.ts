import { 
  IStorageDriver, 
  StorageCategoryFolder, 
  StorageDriverType, 
  StoredFile, 
  StorageTestResult, 
  STORAGE_FOLDERS 
} from '../storage-types';
import { sanitizeFilename } from '../storage-service';

export abstract class BaseStorageDriver implements IStorageDriver {
  abstract name: StorageDriverType;

  abstract upload(
    fileBuffer: Buffer, 
    relativePath: string, 
    mimeType: string,
    isPrivate?: boolean
  ): Promise<{ url: string; path: string; size: number }>;

  abstract download(relativePath: string): Promise<{ buffer: Buffer; mimeType: string }>;

  abstract delete(relativePath: string): Promise<boolean>;

  abstract deleteMany(relativePaths: string[]): Promise<{ deleted: number; errors?: string[] }>;

  abstract move(sourcePath: string, destinationPath: string): Promise<{ url: string; path: string }>;

  abstract copy(sourcePath: string, destinationPath: string): Promise<{ url: string; path: string }>;

  abstract getPublicUrl(relativePath: string): string;

  abstract listFiles(folder?: StorageCategoryFolder): Promise<StoredFile[]>;

  abstract testConnection(): Promise<StorageTestResult>;

  abstract getUsageStats(): Promise<{ 
    totalBytes: number; 
    totalFiles: number; 
    folderBreakdown: Record<string, { count: number; bytes: number }> 
  }>;

  protected validateFolder(folder: string): StorageCategoryFolder {
    if (STORAGE_FOLDERS.includes(folder as StorageCategoryFolder)) {
      return folder as StorageCategoryFolder;
    }
    return 'documents';
  }

  protected generateCleanFilename(originalName: string, folder: StorageCategoryFolder): { cleanName: string; relativePath: string } {
    const timestamp = Date.now();
    const sanitized = sanitizeFilename(originalName);
    const cleanName = `${folder}_${timestamp}_${sanitized}`;
    const relativePath = `${folder}/${cleanName}`;
    return { cleanName, relativePath };
  }

  protected guessMimeType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      pdf: 'application/pdf',
      zip: 'application/zip',
      json: 'application/json',
      txt: 'text/plain',
    };
    return mimeMap[ext] || 'application/octet-stream';
  }
}
