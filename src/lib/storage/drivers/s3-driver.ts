import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BaseStorageDriver } from './base-driver';
import {
  S3StorageConfig,
  StorageCategoryFolder,
  StorageDriverType,
  StoredFile,
  StorageTestResult,
  STORAGE_FOLDERS,
} from '../storage-types';

export class S3StorageDriver extends BaseStorageDriver {
  readonly name: StorageDriverType = 's3';
  private client: S3Client | null = null;
  private config: S3StorageConfig;

  constructor(config: S3StorageConfig) {
    super();
    this.config = config;
    this.initClient();
  }

  private initClient(): void {
    if (!this.config.bucket || !this.config.accessKeyId || !this.config.secretAccessKey) {
      this.client = null;
      return;
    }

    const clientParams: any = {
      region: this.config.region || 'us-east-1',
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    };

    if (this.config.endpoint) {
      clientParams.endpoint = this.config.endpoint;
    }

    if (this.config.forcePathStyle !== undefined) {
      clientParams.forcePathStyle = this.config.forcePathStyle;
    }

    this.client = new S3Client(clientParams);
  }

  public isConfigured(): boolean {
    return Boolean(this.config.bucket && this.config.accessKeyId && this.config.secretAccessKey);
  }

  private getS3Client(): S3Client {
    if (!this.client) {
      this.initClient();
    }
    if (!this.client) {
      throw new Error('Amazon S3 driver is not fully configured (missing bucket, accessKeyId, or secretAccessKey).');
    }
    return this.client;
  }

  public getPublicUrl(relativePath: string): string {
    const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;

    // 1. Custom CDN / CloudFront URL
    if (this.config.cdnUrl) {
      const base = this.config.cdnUrl.endsWith('/') ? this.config.cdnUrl.slice(0, -1) : this.config.cdnUrl;
      return `${base}/${cleanPath}`;
    }

    // 2. Custom Endpoint URL
    if (this.config.endpoint) {
      const endpoint = this.config.endpoint.endsWith('/') ? this.config.endpoint.slice(0, -1) : this.config.endpoint;
      if (this.config.forcePathStyle) {
        return `${endpoint}/${this.config.bucket}/${cleanPath}`;
      }
      return `${endpoint}/${cleanPath}`;
    }

    // 3. Standard AWS S3 URL
    const region = this.config.region || 'us-east-1';
    if (region === 'us-east-1') {
      return `https://${this.config.bucket}.s3.amazonaws.com/${cleanPath}`;
    }
    return `https://${this.config.bucket}.s3.${region}.amazonaws.com/${cleanPath}`;
  }

  public async getPresignedUploadUrl(
    relativePath: string,
    mimeType: string,
    isPrivate: boolean = false,
    expiresInSeconds: number = 900
  ): Promise<{ uploadUrl: string; fileUrl: string; headers?: Record<string, string> }> {
    const client = this.getS3Client();
    const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    const contentType = mimeType || this.guessMimeType(cleanPath);

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: cleanPath,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    const fileUrl = isPrivate 
      ? await this.getPresignedDownloadUrl(cleanPath, expiresInSeconds)
      : this.getPublicUrl(cleanPath);

    return {
      uploadUrl,
      fileUrl,
      headers: { 'Content-Type': contentType },
    };
  }

  public async getPresignedDownloadUrl(relativePath: string, expiresInSeconds: number = 900): Promise<string> {
    const client = this.getS3Client();
    const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;

    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: cleanPath,
    });

    return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  }

  public async upload(
    fileBuffer: Buffer,
    relativePath: string,
    mimeType: string,
    isPrivate: boolean = false
  ): Promise<{ url: string; path: string; size: number }> {
    const client = this.getS3Client();
    const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: cleanPath,
      Body: fileBuffer,
      ContentType: mimeType || this.guessMimeType(cleanPath),
    });

    await client.send(command);

    const url = isPrivate
      ? await this.getPresignedDownloadUrl(cleanPath, 900)
      : this.getPublicUrl(cleanPath);

    return { url, path: cleanPath, size: fileBuffer.length };
  }

  public async download(relativePath: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const client = this.getS3Client();
    const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;

    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: cleanPath,
    });

    const response = await client.send(command);
    if (!response.Body) {
      throw new Error(`S3 GetObject returned empty body for key: ${cleanPath}`);
    }

    const chunks: Uint8Array[] = [];
    const stream = response.Body as any;
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const mimeType = response.ContentType || this.guessMimeType(cleanPath);

    return { buffer, mimeType };
  }

  public async delete(relativePath: string): Promise<boolean> {
    const client = this.getS3Client();
    const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: cleanPath,
      });
      await client.send(command);
      return true;
    } catch (err) {
      console.error(`S3 delete failed for ${cleanPath}:`, err);
      return false;
    }
  }

  public async deleteMany(relativePaths: string[]): Promise<{ deleted: number; errors?: string[] }> {
    const client = this.getS3Client();
    if (relativePaths.length === 0) return { deleted: 0 };

    try {
      const objects = relativePaths.map((p) => ({
        Key: p.startsWith('/') ? p.substring(1) : p,
      }));

      const command = new DeleteObjectsCommand({
        Bucket: this.config.bucket,
        Delete: { Objects: objects, Quiet: false },
      });

      const response = await client.send(command);
      const deletedCount = response.Deleted?.length || 0;
      const errors = response.Errors?.map((e) => `Key: ${e.Key}, Error: ${e.Message}`) || [];

      return {
        deleted: deletedCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (err: any) {
      return { deleted: 0, errors: [err.message] };
    }
  }

  public async copy(sourcePath: string, destinationPath: string): Promise<{ url: string; path: string }> {
    const client = this.getS3Client();
    const cleanSrc = sourcePath.startsWith('/') ? sourcePath.substring(1) : sourcePath;
    const cleanDest = destinationPath.startsWith('/') ? destinationPath.substring(1) : destinationPath;

    const copySource = `${this.config.bucket}/${cleanSrc}`;

    const command = new CopyObjectCommand({
      Bucket: this.config.bucket,
      CopySource: encodeURIComponent(copySource),
      Key: cleanDest,
    });

    await client.send(command);
    const url = this.getPublicUrl(cleanDest);
    return { url, path: cleanDest };
  }

  public async move(sourcePath: string, destinationPath: string): Promise<{ url: string; path: string }> {
    const copyRes = await this.copy(sourcePath, destinationPath);
    await this.delete(sourcePath);
    return copyRes;
  }

  public async listFiles(folder?: StorageCategoryFolder): Promise<StoredFile[]> {
    if (!this.isConfigured()) return [];

    const client = this.getS3Client();
    const prefix = folder && folder !== ('all' as any) ? `${folder}/` : '';

    const command = new ListObjectsV2Command({
      Bucket: this.config.bucket,
      Prefix: prefix,
      MaxKeys: 1000,
    });

    const response = await client.send(command);
    const files: StoredFile[] = [];

    if (response.Contents) {
      for (const item of response.Contents) {
        if (!item.Key || item.Key.endsWith('/') || item.Key.startsWith('.test_')) continue;

        const parts = item.Key.split('/');
        const detectedFolder = this.validateFolder(parts[0]);
        const fileName = parts.slice(1).join('/') || parts[0];

        files.push({
          id: `s3_${item.ETag?.replace(/"/g, '') || item.Key}`,
          name: fileName,
          originalName: fileName,
          folder: detectedFolder,
          driver: 's3',
          path: item.Key,
          url: this.getPublicUrl(item.Key),
          sizeBytes: item.Size || 0,
          mimeType: this.guessMimeType(item.Key),
          createdAt: item.LastModified ? item.LastModified.toISOString() : new Date().toISOString(),
          updatedAt: item.LastModified ? item.LastModified.toISOString() : new Date().toISOString(),
          uploadedBy: {
            id: 'system',
            name: 'Amazon S3',
            username: 's3_admin',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          },
          isLinked: false,
        });
      }
    }

    return files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getUsageStats(): Promise<{
    totalBytes: number;
    totalFiles: number;
    folderBreakdown: Record<string, { count: number; bytes: number }>;
  }> {
    const folderBreakdown: Record<string, { count: number; bytes: number }> = {};
    for (const f of STORAGE_FOLDERS) {
      folderBreakdown[f] = { count: 0, bytes: 0 };
    }

    if (!this.isConfigured()) {
      return { totalBytes: 0, totalFiles: 0, folderBreakdown };
    }

    try {
      const files = await this.listFiles();
      let totalBytes = 0;

      for (const file of files) {
        totalBytes += file.sizeBytes;
        if (folderBreakdown[file.folder]) {
          folderBreakdown[file.folder].count++;
          folderBreakdown[file.folder].bytes += file.sizeBytes;
        }
      }

      return {
        totalBytes,
        totalFiles: files.length,
        folderBreakdown,
      };
    } catch {
      return { totalBytes: 0, totalFiles: 0, folderBreakdown };
    }
  }

  public async testConnection(): Promise<StorageTestResult> {
    const startTime = Date.now();

    if (!this.isConfigured()) {
      return {
        driver: 's3',
        success: false,
        latencyMs: 0,
        message: 'Amazon S3 credentials or bucket name are missing. Please complete the configuration.',
        readOk: false,
        writeOk: false,
        deleteOk: false,
        testedAt: new Date().toISOString(),
      };
    }

    try {
      const client = this.getS3Client();
      const testKey = `documents/.diag_test_${Date.now()}.tmp`;
      const testPayload = Buffer.from('creatorpulse-s3-test-ok', 'utf8');

      // 1. Test Write (PutObject)
      const putCmd = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: testKey,
        Body: testPayload,
        ContentType: 'text/plain',
      });
      await client.send(putCmd);
      const writeOk = true;

      // 2. Test Read (GetObject)
      const getCmd = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: testKey,
      });
      const getRes = await client.send(getCmd);
      let readOk = false;
      if (getRes.Body) {
        const chunks: Uint8Array[] = [];
        const stream = getRes.Body as any;
        for await (const chunk of stream) chunks.push(chunk);
        const downloaded = Buffer.concat(chunks).toString('utf8');
        readOk = downloaded === 'creatorpulse-s3-test-ok';
      }

      // 3. Test Delete (DeleteObject)
      const delCmd = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: testKey,
      });
      await client.send(delCmd);
      const deleteOk = true;

      const latencyMs = Date.now() - startTime;

      return {
        driver: 's3',
        success: writeOk && readOk && deleteOk,
        latencyMs,
        message: `Amazon S3 connection verified successfully in ${latencyMs}ms! Read, Write & Delete operations operational.`,
        readOk,
        writeOk,
        deleteOk,
        testedAt: new Date().toISOString(),
        details: {
          bucket: this.config.bucket,
          region: this.config.region || 'us-east-1',
          endpoint: this.config.endpoint || 'AWS Standard',
          cdnUrl: this.config.cdnUrl || 'Default S3 URL',
        },
      };
    } catch (err: any) {
      return {
        driver: 's3',
        success: false,
        latencyMs: Date.now() - startTime,
        message: `Amazon S3 connection test failed: ${err.message}`,
        readOk: false,
        writeOk: false,
        deleteOk: false,
        testedAt: new Date().toISOString(),
      };
    }
  }
}
