import fs from 'fs';
import path from 'path';
import { BaseStorageDriver } from './base-driver';
import { 
  LocalStorageConfig, 
  StorageCategoryFolder, 
  StorageDriverType, 
  StoredFile, 
  StorageTestResult, 
  STORAGE_FOLDERS 
} from '../storage-types';

export class LocalStorageDriver extends BaseStorageDriver {
  readonly name: StorageDriverType = 'local';
  private uploadsDir: string;
  private metadataPath: string;
  private urlPrefix: string;

  constructor(config?: Partial<LocalStorageConfig>) {
    super();
    const basePath = config?.basePath || 'public/uploads';
    this.uploadsDir = path.join(process.cwd(), basePath);
    this.metadataPath = path.join(this.uploadsDir, 'metadata.json');
    this.urlPrefix = config?.publicUrlPrefix || '/uploads';
    this.ensureFolderStructure();
  }

  public ensureFolderStructure(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    for (const folder of STORAGE_FOLDERS) {
      const folderPath = path.join(this.uploadsDir, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    }
  }

  private loadMetadata(): StoredFile[] {
    this.ensureFolderStructure();
    if (!fs.existsSync(this.metadataPath)) {
      fs.writeFileSync(this.metadataPath, JSON.stringify([]));
      return [];
    }
    try {
      const data = JSON.parse(fs.readFileSync(this.metadataPath, 'utf8'));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  private saveMetadata(files: StoredFile[]): void {
    this.ensureFolderStructure();
    fs.writeFileSync(this.metadataPath, JSON.stringify(files, null, 2));
  }

  public getPublicUrl(relativePath: string): string {
    const normalized = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${this.urlPrefix}${normalized}`;
  }

  public async upload(
    fileBuffer: Buffer, 
    relativePath: string, 
    mimeType: string,
    isPrivate?: boolean
  ): Promise<{ url: string; path: string; size: number }> {
    this.ensureFolderStructure();
    const fullPath = path.join(this.uploadsDir, relativePath);
    const parentDir = path.dirname(fullPath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(fullPath, fileBuffer);
    const size = fileBuffer.length;
    const url = this.getPublicUrl(relativePath);

    // Update metadata
    const metadata = this.loadMetadata();
    const fileName = path.basename(relativePath);
    const folder = this.validateFolder(relativePath.split('/')[0]);

    const newFileEntry: StoredFile = {
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: fileName,
      originalName: fileName,
      folder,
      driver: 'local',
      path: relativePath,
      url,
      sizeBytes: size,
      mimeType: mimeType || this.guessMimeType(fileName),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uploadedBy: {
        id: 'system-admin',
        name: 'System Admin',
        username: 'admin',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      }
    };

    // Remove existing if any with same path, then prepend
    const filtered = metadata.filter((m) => m.path !== relativePath);
    filtered.unshift(newFileEntry);
    this.saveMetadata(filtered);

    return { url, path: relativePath, size };
  }

  public async download(relativePath: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const fullPath = path.join(this.uploadsDir, relativePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found at path: ${relativePath}`);
    }
    const buffer = fs.readFileSync(fullPath);
    const mimeType = this.guessMimeType(relativePath);
    return { buffer, mimeType };
  }

  public async delete(relativePath: string): Promise<boolean> {
    const fullPath = path.join(this.uploadsDir, relativePath);
    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      const metadata = this.loadMetadata();
      const updated = metadata.filter((m) => m.path !== relativePath);
      this.saveMetadata(updated);
      return true;
    } catch (e) {
      console.error(`Failed to delete local file ${relativePath}`, e);
      return false;
    }
  }

  public async deleteMany(relativePaths: string[]): Promise<{ deleted: number; errors?: string[] }> {
    let deleted = 0;
    const errors: string[] = [];
    for (const rel of relativePaths) {
      const ok = await this.delete(rel);
      if (ok) deleted++;
      else errors.push(`Failed to delete ${rel}`);
    }
    return { deleted, errors: errors.length > 0 ? errors : undefined };
  }

  public async move(sourcePath: string, destinationPath: string): Promise<{ url: string; path: string }> {
    const srcFull = path.join(this.uploadsDir, sourcePath);
    const destFull = path.join(this.uploadsDir, destinationPath);

    if (!fs.existsSync(srcFull)) {
      throw new Error(`Source file does not exist: ${sourcePath}`);
    }

    const destDir = path.dirname(destFull);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.renameSync(srcFull, destFull);
    const url = this.getPublicUrl(destinationPath);

    const metadata = this.loadMetadata();
    const itemIdx = metadata.findIndex((m) => m.path === sourcePath);
    const targetFolder = this.validateFolder(destinationPath.split('/')[0]);
    const targetName = path.basename(destinationPath);

    if (itemIdx !== -1) {
      metadata[itemIdx] = {
        ...metadata[itemIdx],
        name: targetName,
        folder: targetFolder,
        path: destinationPath,
        url,
        updatedAt: new Date().toISOString(),
      };
      this.saveMetadata(metadata);
    }

    return { url, path: destinationPath };
  }

  public async copy(sourcePath: string, destinationPath: string): Promise<{ url: string; path: string }> {
    const srcFull = path.join(this.uploadsDir, sourcePath);
    const destFull = path.join(this.uploadsDir, destinationPath);

    if (!fs.existsSync(srcFull)) {
      throw new Error(`Source file does not exist: ${sourcePath}`);
    }

    const destDir = path.dirname(destFull);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(srcFull, destFull);
    const stat = fs.statSync(destFull);
    const url = this.getPublicUrl(destinationPath);

    const metadata = this.loadMetadata();
    const sourceMeta = metadata.find((m) => m.path === sourcePath);
    const targetFolder = this.validateFolder(destinationPath.split('/')[0]);
    const targetName = path.basename(destinationPath);

    const newEntry: StoredFile = {
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: targetName,
      originalName: sourceMeta?.originalName || targetName,
      folder: targetFolder,
      driver: 'local',
      path: destinationPath,
      url,
      sizeBytes: stat.size,
      mimeType: sourceMeta?.mimeType || this.guessMimeType(targetName),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uploadedBy: sourceMeta?.uploadedBy || {
        id: 'system-admin',
        name: 'System Admin',
        username: 'admin',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      }
    };

    metadata.unshift(newEntry);
    this.saveMetadata(metadata);

    return { url, path: destinationPath };
  }

  public async listFiles(folder?: StorageCategoryFolder): Promise<StoredFile[]> {
    this.ensureFolderStructure();
    const metadata = this.loadMetadata();
    const physicalFiles: { name: string; folder: StorageCategoryFolder; sizeBytes: number; path: string; modified: Date }[] = [];

    const targetFolders = folder && folder !== ('all' as any) ? [folder] : STORAGE_FOLDERS;

    for (const f of targetFolders) {
      const folderPath = path.join(this.uploadsDir, f);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath).filter((name) => !name.startsWith('.') && name !== 'metadata.json');
        for (const name of files) {
          const filePath = path.join(folderPath, name);
          try {
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
              physicalFiles.push({
                name,
                folder: f,
                sizeBytes: stat.size,
                path: `${f}/${name}`,
                modified: stat.mtime
              });
            }
          } catch {
            // Ignore unreadable files
          }
        }
      }
    }

    // Sync disk with metadata
    let needsSave = false;
    const fileMap = new Map<string, StoredFile>();

    for (const meta of metadata) {
      if (meta.driver === 'local') {
        fileMap.set(meta.path, meta);
      }
    }

    for (const pf of physicalFiles) {
      if (!fileMap.has(pf.path)) {
        needsSave = true;
        const newEntry: StoredFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: pf.name,
          originalName: pf.name,
          folder: pf.folder,
          driver: 'local',
          path: pf.path,
          url: this.getPublicUrl(pf.path),
          sizeBytes: pf.sizeBytes,
          mimeType: this.guessMimeType(pf.name),
          createdAt: pf.modified.toISOString(),
          updatedAt: pf.modified.toISOString(),
          uploadedBy: {
            id: 'system',
            name: 'System Admin',
            username: 'admin',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
          },
          isLinked: false
        };
        metadata.push(newEntry);
        fileMap.set(pf.path, newEntry);
      }
    }

    if (needsSave) {
      this.saveMetadata(metadata);
    }

    const result = Array.from(fileMap.values()).filter((f) => {
      if (folder && folder !== ('all' as any)) {
        return f.folder === folder;
      }
      return true;
    });

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getUsageStats(): Promise<{ 
    totalBytes: number; 
    totalFiles: number; 
    folderBreakdown: Record<string, { count: number; bytes: number }> 
  }> {
    this.ensureFolderStructure();
    let totalBytes = 0;
    let totalFiles = 0;
    const folderBreakdown: Record<string, { count: number; bytes: number }> = {};

    for (const folder of STORAGE_FOLDERS) {
      const folderPath = path.join(this.uploadsDir, folder);
      let count = 0;
      let bytes = 0;

      if (fs.existsSync(folderPath)) {
        try {
          const files = fs.readdirSync(folderPath).filter((f) => !f.startsWith('.') && f !== 'metadata.json');
          for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
              count++;
              bytes += stat.size;
            }
          }
        } catch {
          // ignore error
        }
      }

      folderBreakdown[folder] = { count, bytes };
      totalBytes += bytes;
      totalFiles += count;
    }

    return { totalBytes, totalFiles, folderBreakdown };
  }

  public async testConnection(): Promise<StorageTestResult> {
    const startTime = Date.now();
    try {
      this.ensureFolderStructure();
      const testFile = path.join(this.uploadsDir, 'documents', `.test_${Date.now()}.tmp`);
      const testContent = 'creatorpulse-local-storage-test-ok';

      fs.writeFileSync(testFile, testContent, 'utf8');
      const writeOk = fs.existsSync(testFile);

      const readContent = fs.readFileSync(testFile, 'utf8');
      const readOk = readContent === testContent;

      fs.unlinkSync(testFile);
      const deleteOk = !fs.existsSync(testFile);

      const latencyMs = Date.now() - startTime;

      return {
        driver: 'local',
        success: writeOk && readOk && deleteOk,
        latencyMs,
        message: 'Local storage (public/uploads) is healthy, writable, and responsive.',
        readOk,
        writeOk,
        deleteOk,
        testedAt: new Date().toISOString(),
        details: {
          basePath: this.uploadsDir,
          foldersConfigured: STORAGE_FOLDERS.length,
          freeSpace: 'Available'
        }
      };
    } catch (err: any) {
      return {
        driver: 'local',
        success: false,
        latencyMs: Date.now() - startTime,
        message: `Local filesystem test failed: ${err.message}`,
        readOk: false,
        writeOk: false,
        deleteOk: false,
        testedAt: new Date().toISOString(),
      };
    }
  }
}
