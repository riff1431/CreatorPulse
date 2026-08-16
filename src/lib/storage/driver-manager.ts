import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  IStorageDriver,
  StorageConfig,
  StorageDriverType,
  StorageCategoryFolder,
  StoredFile,
  StorageTestResult,
  StorageMigrationRequest,
  StorageMigrationResult,
  StorageMigrationBatchRequest,
  StorageMigrationBatchResult,
  STORAGE_FOLDERS,
} from './storage-types';
import { DEFAULT_STORAGE_CONFIG, sanitizeFilename } from './storage-service';
import { LocalStorageDriver } from './drivers/local-driver';
import { S3StorageDriver } from './drivers/s3-driver';
import { CloudflareR2StorageDriver } from './drivers/r2-driver';

// Private server-side config file (NOT in public/ directory)
const SECURE_CONFIG_PATH = path.join(process.cwd(), '.storage_config.enc');

// Default encryption key fallback derived from machine/env context
function getEncryptionKey(): Buffer {
  const secret = process.env.STORAGE_ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET || 'creatorpulse-storage-master-secret-key-32b!';
  return crypto.createHash('sha256').update(secret).digest();
}

function encryptConfig(plainText: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decryptConfig(cipherText: string): string | null {
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) return null;
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.warn('Failed to decrypt storage config:', err);
    return null;
  }
}

export class StorageDriverManager {
  private static instance: StorageDriverManager | null = null;
  private config: StorageConfig;
  private drivers: Map<StorageDriverType, IStorageDriver> = new Map();

  private constructor() {
    this.config = this.loadPersistentConfig();
    this.initDrivers();
  }

  public static getInstance(): StorageDriverManager {
    if (!StorageDriverManager.instance) {
      StorageDriverManager.instance = new StorageDriverManager();
    }
    return StorageDriverManager.instance;
  }

  private loadPersistentConfig(): StorageConfig {
    // 1. Check if legacy public file exists and remove it for security
    const legacyPath = path.join(process.cwd(), 'public', 'uploads', '.storage_config.json');
    try {
      if (fs.existsSync(legacyPath)) {
        const legacyData = fs.readFileSync(legacyPath, 'utf8');
        // Encrypt and relocate to secure storage
        fs.writeFileSync(SECURE_CONFIG_PATH, encryptConfig(legacyData));
        fs.unlinkSync(legacyPath);
      }
    } catch {
      // Ignore legacy cleanup errors
    }

    // 2. Read encrypted secure storage
    try {
      if (fs.existsSync(SECURE_CONFIG_PATH)) {
        const rawEnc = fs.readFileSync(SECURE_CONFIG_PATH, 'utf8').trim();
        const decrypted = decryptConfig(rawEnc);
        if (decrypted) {
          const parsed = JSON.parse(decrypted);
          return {
            ...DEFAULT_STORAGE_CONFIG,
            ...parsed,
            local: { ...DEFAULT_STORAGE_CONFIG.local, ...(parsed.local || {}) },
            s3: { ...DEFAULT_STORAGE_CONFIG.s3, ...(parsed.s3 || {}) },
            r2: { ...DEFAULT_STORAGE_CONFIG.r2, ...(parsed.r2 || {}) },
            supabase: { ...DEFAULT_STORAGE_CONFIG.supabase, ...(parsed.supabase || {}) },
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load encrypted storage config, falling back to defaults/env:', e);
    }

    return DEFAULT_STORAGE_CONFIG;
  }

  public saveConfig(newConfig: Partial<StorageConfig>): StorageConfig {
    this.config = {
      ...this.config,
      ...newConfig,
      local: { ...this.config.local, ...(newConfig.local || {}) },
      s3: { ...this.config.s3, ...(newConfig.s3 || {}) },
      r2: { ...this.config.r2, ...(newConfig.r2 || {}) },
      supabase: { ...this.config.supabase, ...(newConfig.supabase || {}) },
    };

    try {
      const encrypted = encryptConfig(JSON.stringify(this.config));
      fs.writeFileSync(SECURE_CONFIG_PATH, encrypted, 'utf8');
    } catch (e) {
      console.error('Failed to securely persist storage config:', e);
    }

    this.initDrivers();
    return this.config;
  }

  public getConfig(maskSecrets: boolean = true): StorageConfig {
    if (!maskSecrets) {
      return this.config;
    }

    // Mask sensitive keys for client responses
    return {
      ...this.config,
      s3: {
        ...this.config.s3,
        secretAccessKey: this.maskSecret(this.config.s3.secretAccessKey),
      },
      r2: {
        ...this.config.r2,
        secretAccessKey: this.maskSecret(this.config.r2.secretAccessKey),
      },
      supabase: {
        ...this.config.supabase,
        supabaseAnonKey: this.maskSecret(this.config.supabase.supabaseAnonKey),
      },
    };
  }

  private maskSecret(val: string): string {
    if (!val) return '';
    if (val.length <= 6) return '••••••••';
    return `${val.substring(0, 3)}••••••••${val.substring(val.length - 3)}`;
  }

  private initDrivers(): void {
    this.drivers.set('local', new LocalStorageDriver(this.config.local));
    this.drivers.set('s3', new S3StorageDriver(this.config.s3));
    this.drivers.set('r2', new CloudflareR2StorageDriver(this.config.r2));
  }

  public getDriver(driverType?: StorageDriverType): IStorageDriver {
    const type = driverType || this.config.activeDriver || 'local';
    const driver = this.drivers.get(type);

    if (!driver) {
      return this.drivers.get('local') || new LocalStorageDriver(this.config.local);
    }
    return driver;
  }

  public getActiveDriver(): IStorageDriver {
    return this.getDriver(this.config.activeDriver);
  }

  public async validateFile(
    fileBuffer: Buffer, 
    fileName: string, 
    mimeType: string
  ): Promise<{ valid: boolean; error?: string }> {
    if (fileBuffer.length > this.config.maxUploadSizeBytes) {
      return {
        valid: false,
        error: `File size (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds maximum permitted limit of ${this.config.maxUploadSizeMB} MB.`,
      };
    }

    if (this.config.allowedMimeTypes.length > 0) {
      const isAllowed = this.config.allowedMimeTypes.some((allowed) => {
        if (allowed.endsWith('/*')) {
          const prefix = allowed.split('/')[0];
          return mimeType.startsWith(`${prefix}/`);
        }
        return allowed.toLowerCase() === mimeType.toLowerCase();
      });

      if (!isAllowed) {
        const ext = fileName.split('.').pop()?.toLowerCase();
        const extAllowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'mp4', 'webm', 'mov', 'mp3', 'wav', 'pdf', 'zip'].includes(ext || '');
        if (!extAllowed) {
          return {
            valid: false,
            error: `File type "${mimeType}" is not permitted on this server.`,
          };
        }
      }
    }

    return { valid: true };
  }

  public async getPresignedUploadUrl(
    originalName: string,
    folder: StorageCategoryFolder,
    mimeType: string,
    isPrivate: boolean = false,
    preferredDriver?: StorageDriverType
  ): Promise<{
    uploadUrl: string;
    fileUrl: string;
    path: string;
    driver: StorageDriverType;
    isDirectUpload: boolean;
    headers?: Record<string, string>;
  }> {
    const targetFolder: StorageCategoryFolder = STORAGE_FOLDERS.includes(folder) ? folder : 'documents';
    const timestamp = Date.now();
    const cleanFileName = this.config.preserveOriginalFilenames
      ? `${targetFolder}_${timestamp}_${sanitizeFilename(originalName)}`
      : `${targetFolder}_${timestamp}_${Math.random().toString(36).substring(2, 8)}_${sanitizeFilename(originalName)}`;

    const relativePath = `${targetFolder}/${cleanFileName}`;
    const driverType = preferredDriver || this.config.activeDriver || 'local';
    const driver = this.getDriver(driverType);

    if (driver.getPresignedUploadUrl) {
      try {
        const result = await driver.getPresignedUploadUrl(relativePath, mimeType, isPrivate, 900);
        return {
          uploadUrl: result.uploadUrl,
          fileUrl: result.fileUrl,
          path: relativePath,
          driver: driverType,
          isDirectUpload: true,
          headers: result.headers,
        };
      } catch (e) {
        console.warn(`Driver ${driverType} presigned URL failed, fallback to direct API:`, e);
      }
    }

    // Fallback: Return proxied API upload URL
    const fileUrl = driver.getPublicUrl(relativePath);
    return {
      uploadUrl: '/api/storage/upload',
      fileUrl,
      path: relativePath,
      driver: driverType,
      isDirectUpload: false,
    };
  }

  public async getPresignedDownloadUrl(
    relativePath: string,
    driverType?: StorageDriverType,
    expiresInSeconds: number = 900
  ): Promise<string> {
    const driver = this.getDriver(driverType);
    if (driver.getPresignedDownloadUrl) {
      try {
        return await driver.getPresignedDownloadUrl(relativePath, expiresInSeconds);
      } catch (e) {
        console.warn(`Presigned download url failed for ${relativePath}:`, e);
      }
    }
    return driver.getPublicUrl(relativePath);
  }

  public async upload(
    fileBuffer: Buffer,
    originalName: string,
    folder: StorageCategoryFolder,
    mimeType: string,
    preferredDriver?: StorageDriverType,
    isPrivate: boolean = false
  ): Promise<{ file: StoredFile; driver: StorageDriverType; fallbackUsed?: boolean }> {
    const validation = await this.validateFile(fileBuffer, originalName, mimeType);
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed');
    }

    const targetFolder: StorageCategoryFolder = STORAGE_FOLDERS.includes(folder) ? folder : 'documents';
    const timestamp = Date.now();
    const cleanFileName = this.config.preserveOriginalFilenames
      ? `${targetFolder}_${timestamp}_${sanitizeFilename(originalName)}`
      : `${targetFolder}_${timestamp}_${Math.random().toString(36).substring(2, 8)}_${sanitizeFilename(originalName)}`;
    
    const relativePath = `${targetFolder}/${cleanFileName}`;
    const driverType = preferredDriver || this.config.activeDriver || 'local';
    let driver = this.getDriver(driverType);

    let fallbackUsed = false;
    let uploadResult: { url: string; path: string; size: number };

    try {
      uploadResult = await driver.upload(fileBuffer, relativePath, mimeType, isPrivate);
    } catch (primaryErr) {
      console.error(`Upload to driver [${driverType}] failed:`, primaryErr);

      if (driverType !== 'local' && this.config.enableFallbackToLocal) {
        console.warn(`Falling back to Local Storage driver for upload...`);
        const localDriver = this.getDriver('local');
        uploadResult = await localDriver.upload(fileBuffer, relativePath, mimeType, isPrivate);
        fallbackUsed = true;
        driver = localDriver;
      } else {
        throw primaryErr;
      }
    }

    const storedFile: StoredFile = {
      id: `file_${timestamp}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanFileName,
      originalName,
      folder: targetFolder,
      driver: fallbackUsed ? 'local' : driverType,
      path: uploadResult.path,
      url: uploadResult.url,
      sizeBytes: uploadResult.size,
      mimeType,
      isPrivate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uploadedBy: {
        id: 'system-admin',
        name: 'System Admin',
        username: 'admin',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      },
      isLinked: false,
    };

    return {
      file: storedFile,
      driver: fallbackUsed ? 'local' : driverType,
      fallbackUsed,
    };
  }

  public async deleteFile(relativePath: string, driverType?: StorageDriverType): Promise<boolean> {
    const driver = this.getDriver(driverType);
    return driver.delete(relativePath);
  }

  public async deleteMultipleFiles(
    relativePaths: string[],
    driverType?: StorageDriverType
  ): Promise<{ deleted: number; errors?: string[] }> {
    const driver = this.getDriver(driverType);
    return driver.deleteMany(relativePaths);
  }

  public async moveFile(
    sourcePath: string,
    destinationPath: string,
    driverType?: StorageDriverType
  ): Promise<{ url: string; path: string }> {
    const driver = this.getDriver(driverType);
    return driver.move(sourcePath, destinationPath);
  }

  public async copyFile(
    sourcePath: string,
    destinationPath: string,
    driverType?: StorageDriverType
  ): Promise<{ url: string; path: string }> {
    const driver = this.getDriver(driverType);
    return driver.copy(sourcePath, destinationPath);
  }

  public async listFiles(
    folder?: StorageCategoryFolder,
    driverType?: StorageDriverType
  ): Promise<StoredFile[]> {
    const driver = this.getDriver(driverType);
    return driver.listFiles(folder);
  }

  public async testConnection(driverType?: StorageDriverType): Promise<StorageTestResult> {
    const targetType = driverType || this.config.activeDriver || 'local';
    const driver = this.getDriver(targetType);
    return driver.testConnection();
  }

  public async getAggregatedUsage(): Promise<{
    activeDriver: StorageDriverType;
    totalFiles: number;
    totalBytes: number;
    driverBreakdown: Record<StorageDriverType, { totalFiles: number; totalBytes: number }>;
  }> {
    const driverBreakdown: Record<StorageDriverType, { totalFiles: number; totalBytes: number }> = {
      local: { totalFiles: 0, totalBytes: 0 },
      s3: { totalFiles: 0, totalBytes: 0 },
      r2: { totalFiles: 0, totalBytes: 0 },
      supabase: { totalFiles: 0, totalBytes: 0 },
    };

    let totalFiles = 0;
    let totalBytes = 0;

    for (const [type, driver] of this.drivers.entries()) {
      try {
        const stats = await driver.getUsageStats();
        driverBreakdown[type] = {
          totalFiles: stats.totalFiles,
          totalBytes: stats.totalBytes,
        };
        if (type === this.config.activeDriver) {
          totalFiles = stats.totalFiles;
          totalBytes = stats.totalBytes;
        }
      } catch {
        // Skip unconfigured drivers
      }
    }

    return {
      activeDriver: this.config.activeDriver,
      totalFiles,
      totalBytes,
      driverBreakdown,
    };
  }

  public async migrateBatch(request: StorageMigrationBatchRequest): Promise<StorageMigrationBatchResult> {
    const sourceDriver = this.getDriver(request.sourceDriver);
    const targetDriver = this.getDriver(request.targetDriver);

    const sourceFiles = await sourceDriver.listFiles();
    const targetFolders = request.folders && request.folders.length > 0 ? request.folders : STORAGE_FOLDERS;
    const matchingFiles = sourceFiles.filter((f) => targetFolders.includes(f.folder));
    const totalFiles = matchingFiles.length;

    const offset = request.offset || 0;
    const limit = request.limit || 15;
    const batchFiles = matchingFiles.slice(offset, offset + limit);

    let migratedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const errors: { file: string; error: string }[] = [];

    for (const file of batchFiles) {
      try {
        const { buffer, mimeType } = await sourceDriver.download(file.path);
        await targetDriver.upload(buffer, file.path, mimeType || file.mimeType, file.isPrivate);
        migratedCount++;

        if (request.deleteFromSource) {
          await sourceDriver.delete(file.path);
        }
      } catch (err: any) {
        failedCount++;
        errors.push({ file: file.path, error: err.message || String(err) });
      }
    }

    const processedCount = batchFiles.length;
    const hasMore = offset + limit < totalFiles;
    const batchIndex = Math.floor(offset / limit) + 1;

    return {
      success: failedCount === 0,
      batchIndex,
      processedCount,
      migratedCount,
      skippedCount,
      failedCount,
      hasMore,
      totalFiles,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  public async migrateFiles(
    request: StorageMigrationRequest,
    onProgress?: (progress: { current: number; total: number; file: string; log: string }) => void
  ): Promise<StorageMigrationResult> {
    const startTime = Date.now();
    const sourceDriver = this.getDriver(request.sourceDriver);
    const targetDriver = this.getDriver(request.targetDriver);

    const sourceFiles = await sourceDriver.listFiles();
    const targetFolders = request.folders && request.folders.length > 0 ? request.folders : STORAGE_FOLDERS;
    
    const filesToMigrate = sourceFiles.filter((f) => targetFolders.includes(f.folder));
    const totalFiles = filesToMigrate.length;

    let migratedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const errors: { file: string; error: string }[] = [];

    for (let i = 0; i < filesToMigrate.length; i++) {
      const file = filesToMigrate[i];
      const logMsg = `[${i + 1}/${totalFiles}] Migrating ${file.path} (${(file.sizeBytes / 1024).toFixed(1)} KB)...`;
      if (onProgress) {
        onProgress({ current: i + 1, total: totalFiles, file: file.path, log: logMsg });
      }

      try {
        const { buffer, mimeType } = await sourceDriver.download(file.path);
        await targetDriver.upload(buffer, file.path, mimeType || file.mimeType, file.isPrivate);
        migratedCount++;

        if (request.deleteFromSource) {
          await sourceDriver.delete(file.path);
        }
      } catch (err: any) {
        failedCount++;
        errors.push({ file: file.path, error: err.message || String(err) });
      }
    }

    const durationMs = Date.now() - startTime;

    return {
      success: failedCount === 0,
      totalFiles,
      migratedCount,
      skippedCount,
      failedCount,
      errors: errors.length > 0 ? errors : undefined,
      durationMs,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
    };
  }
}
