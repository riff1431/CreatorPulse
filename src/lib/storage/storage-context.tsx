'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  StorageConfig, 
  StorageDriverType, 
  StorageCategoryFolder, 
  StoredFile, 
  StorageStats, 
  StorageTestResult,
  StorageMigrationRequest,
  StorageMigrationResult
} from './storage-types';
import { 
  DEFAULT_STORAGE_CONFIG, 
  computeStorageStats 
} from './storage-service';

interface StorageContextType {
  config: StorageConfig;
  files: StoredFile[];
  stats: StorageStats;
  isLoading: boolean;
  testResult: StorageTestResult | null;
  isTesting: boolean;
  setActiveDriver: (driver: StorageDriverType) => Promise<{ success: boolean; message: string }>;
  updateConfig: (partial: Partial<StorageConfig>) => Promise<{ success: boolean; message: string }>;
  testConnection: (driverToTest?: StorageDriverType) => Promise<StorageTestResult>;
  startMigration: (request: StorageMigrationRequest, onProgress?: (batch: { batchIndex: number; processed: number; total: number; percent: number; log: string }) => void) => Promise<StorageMigrationResult>;
  startBatchMigration: (
    request: { sourceDriver: StorageDriverType; targetDriver: StorageDriverType; folders?: StorageCategoryFolder[]; deleteFromSource?: boolean; overwriteExisting?: boolean },
    onProgress?: (progress: { batchIndex: number; processed: number; total: number; percent: number; log: string }) => void
  ) => Promise<StorageMigrationResult>;
  uploadFile: (file: File, folder: StorageCategoryFolder) => Promise<{ success: boolean; file?: StoredFile; error?: string }>;
  deleteFile: (filePathOrId: string) => Promise<{ success: boolean; error?: string }>;
  deleteMultipleFiles: (filePathsOrIds: string[]) => Promise<{ success: boolean; error?: string }>;
  renameFile: (sourcePathOrId: string, newName: string, newFolder?: StorageCategoryFolder) => Promise<{ success: boolean; file?: StoredFile; error?: string }>;
  moveFile: (sourcePath: string, destinationPath: string) => Promise<{ success: boolean; error?: string }>;
  copyFile: (sourcePath: string, destinationPath: string) => Promise<{ success: boolean; error?: string }>;
  refreshFiles: (driverOverride?: StorageDriverType) => Promise<void>;
  refreshStats: () => Promise<void>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<StorageConfig>(DEFAULT_STORAGE_CONFIG);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [testResult, setTestResult] = useState<StorageTestResult | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // 1. Fetch live config and files from backend on mount
  const fetchConfigAndFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch server config & stats
      const configRes = await fetch('/api/admin/storage');
      const configData = await configRes.json();
      let activeDriver: StorageDriverType = 'local';

      if (configData.success && configData.config) {
        setConfig(configData.config);
        activeDriver = configData.config.activeDriver;
      }

      // Fetch files for active driver
      const filesRes = await fetch(`/api/storage/files?driver=${activeDriver}`);
      const filesData = await filesRes.json();
      if (filesData.success && Array.isArray(filesData.files)) {
        setFiles(filesData.files);
      }
    } catch (e) {
      console.error('Failed to fetch storage setup from server:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigAndFiles();
  }, [fetchConfigAndFiles]);

  const fetchFiles = async (driver?: StorageDriverType) => {
    setIsLoading(true);
    const targetDriver = driver || config.activeDriver;
    try {
      const res = await fetch(`/api/storage/files?driver=${targetDriver}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        setFiles(data.files);
      }
    } catch (e) {
      console.error('Failed to fetch files from API', e);
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveDriver = async (driver: StorageDriverType) => {
    try {
      const res = await fetch('/api/admin/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'switch_driver', driver }),
      });
      const data = await res.json();

      if (data.success) {
        setConfig((prev) => ({ ...prev, activeDriver: driver }));
        await fetchFiles(driver);
        return {
          success: true,
          message: data.message || `Active storage driver switched to ${driver.toUpperCase()}`,
        };
      }
      return { success: false, message: data.error || 'Failed to switch driver' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network error switching driver' };
    }
  };

  const updateConfig = async (partial: Partial<StorageConfig>) => {
    try {
      const updated = { ...config, ...partial };
      const res = await fetch('/api/admin/storage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();

      if (data.success && data.config) {
        setConfig(data.config);
        return { success: true, message: data.message || 'Storage settings saved successfully' };
      }
      return { success: false, message: data.error || 'Failed to save storage settings' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network error saving configuration' };
    }
  };

  const testConnection = async (driverToTest?: StorageDriverType): Promise<StorageTestResult> => {
    setIsTesting(true);
    const targetDriver = driverToTest || config.activeDriver;
    const startTime = Date.now();

    try {
      const res = await fetch('/api/admin/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection', driver: targetDriver }),
      });
      const data: StorageTestResult = await res.json();

      setTestResult(data);
      return data;
    } catch (err: any) {
      const latency = Date.now() - startTime;
      const result: StorageTestResult = {
        driver: targetDriver,
        success: false,
        latencyMs: latency,
        message: `Diagnostic connection failed: ${err.message || String(err)}`,
        readOk: false,
        writeOk: false,
        deleteOk: false,
        testedAt: new Date().toISOString(),
      };
      setTestResult(result);
      return result;
    } finally {
      setIsTesting(false);
    }
  };

  const startMigration = async (request: StorageMigrationRequest): Promise<StorageMigrationResult> => {
    return startBatchMigration(request);
  };

  const startBatchMigration = async (
    request: { sourceDriver: StorageDriverType; targetDriver: StorageDriverType; folders?: StorageCategoryFolder[]; deleteFromSource?: boolean; overwriteExisting?: boolean },
    onProgress?: (progress: { batchIndex: number; processed: number; total: number; percent: number; log: string }) => void
  ): Promise<StorageMigrationResult> => {
    const startTime = Date.now();
    let offset = 0;
    const limit = 15;
    let hasMore = true;
    let totalFiles = 0;
    let totalMigrated = 0;
    let totalSkipped = 0;
    let totalFailed = 0;
    const allErrors: { file: string; error: string }[] = [];

    try {
      while (hasMore) {
        const res = await fetch('/api/admin/storage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'migrate_batch',
            migration: {
              ...request,
              offset,
              limit,
            },
          }),
        });

        const data = await res.json();
        if (!data.success || !data.batch) {
          throw new Error(data.error || `Batch at offset ${offset} failed`);
        }

        const batch = data.batch;
        totalFiles = batch.totalFiles;
        totalMigrated += batch.migratedCount;
        totalSkipped += batch.skippedCount;
        totalFailed += batch.failedCount;
        if (batch.errors) {
          allErrors.push(...batch.errors);
        }

        const processed = offset + batch.processedCount;
        const percent = totalFiles > 0 ? Math.min(100, Math.round((processed / totalFiles) * 100)) : 100;
        const logMsg = `[Batch ${batch.batchIndex}] Migrated ${batch.migratedCount} files (${processed}/${totalFiles})...`;

        if (onProgress) {
          onProgress({
            batchIndex: batch.batchIndex,
            processed,
            total: totalFiles,
            percent,
            log: logMsg,
          });
        }

        hasMore = batch.hasMore;
        offset += limit;

        if (batch.processedCount === 0) break;
      }

      await fetchFiles(config.activeDriver);

      return {
        success: totalFailed === 0,
        totalFiles,
        migratedCount: totalMigrated,
        skippedCount: totalSkipped,
        failedCount: totalFailed,
        errors: allErrors.length > 0 ? allErrors : undefined,
        durationMs: Date.now() - startTime,
        startedAt: new Date(startTime).toISOString(),
        completedAt: new Date().toISOString(),
      };
    } catch (e: any) {
      return {
        success: false,
        totalFiles,
        migratedCount: totalMigrated,
        skippedCount: totalSkipped,
        failedCount: totalFailed + 1,
        errors: [...allErrors, { file: 'Batch Migration Loop', error: e.message || 'Unknown batch error' }],
        durationMs: Date.now() - startTime,
        startedAt: new Date(startTime).toISOString(),
        completedAt: new Date().toISOString(),
      };
    }
  };

  const uploadFile = async (file: File, folder: StorageCategoryFolder) => {
    if (file.size > config.maxUploadSizeBytes) {
      return {
        success: false,
        error: `File size exceeds the maximum allowed limit of ${config.maxUploadSizeMB} MB.`,
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('driver', config.activeDriver);

      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.file) {
        setFiles((prev) => [data.file, ...prev]);
        return { success: true, file: data.file };
      }
      return { success: false, error: data.error || 'Upload failed' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error during upload' };
    }
  };

  const deleteFile = async (filePathOrId: string) => {
    const targetFile = files.find((f) => f.id === filePathOrId || f.path === filePathOrId);
    const targetPath = targetFile ? targetFile.path : filePathOrId;

    try {
      const res = await fetch(`/api/storage/files?paths=${encodeURIComponent(targetPath)}&driver=${config.activeDriver}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setFiles((prev) => prev.filter((f) => f.path !== targetPath && f.id !== filePathOrId));
        return { success: true };
      }
      return { success: false, error: data.error || 'Delete failed' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error during delete' };
    }
  };

  const deleteMultipleFiles = async (filePathsOrIds: string[]) => {
    const targetPaths = filePathsOrIds.map((item) => {
      const match = files.find((f) => f.id === item || f.path === item);
      return match ? match.path : item;
    });

    try {
      const encoded = targetPaths.map((p) => encodeURIComponent(p)).join(',');
      const res = await fetch(`/api/storage/files?paths=${encoded}&driver=${config.activeDriver}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setFiles((prev) =>
          prev.filter(
            (f) => !targetPaths.includes(f.path) && !filePathsOrIds.includes(f.id)
          )
        );
        return { success: true };
      }
      return { success: false, error: data.error || 'Bulk delete failed' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error during bulk delete' };
    }
  };

  const moveFile = async (sourcePath: string, destinationPath: string) => {
    try {
      const res = await fetch('/api/storage/files', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move', sourcePath, destinationPath, driver: config.activeDriver }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchFiles(config.activeDriver);
        return { success: true };
      }
      return { success: false, error: data.error || 'Move failed' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error moving file' };
    }
  };

  const copyFile = async (sourcePath: string, destinationPath: string) => {
    try {
      const res = await fetch('/api/storage/files', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'copy', sourcePath, destinationPath, driver: config.activeDriver }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchFiles(config.activeDriver);
        return { success: true };
      }
      return { success: false, error: data.error || 'Copy failed' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error copying file' };
    }
  };

  const renameFile = async (sourcePathOrId: string, newName: string, newFolder?: StorageCategoryFolder) => {
    const targetFile = files.find((f) => f.id === sourcePathOrId || f.path === sourcePathOrId);
    const sourcePath = targetFile ? targetFile.path : sourcePathOrId;
    const parts = sourcePath.split('/');
    const currentFolder = parts[0] as StorageCategoryFolder;
    const targetFolder = newFolder || currentFolder;
    const destinationPath = `${targetFolder}/${newName}`;

    const res = await moveFile(sourcePath, destinationPath);
    if (res.success) {
      const updatedFile: StoredFile | undefined = targetFile
        ? {
            ...targetFile,
            name: newName,
            folder: targetFolder,
            path: destinationPath,
          }
        : undefined;
      return { success: true, file: updatedFile };
    }
    return { success: false, error: res.error };
  };

  const refreshFiles = async (driverOverride?: StorageDriverType) => {
    await fetchFiles(driverOverride || config.activeDriver);
  };

  const refreshStats = async () => {
    await fetchConfigAndFiles();
  };

  const stats = computeStorageStats(files, config.activeDriver);

  return (
    <StorageContext.Provider
      value={{
        config,
        files,
        stats,
        isLoading,
        testResult,
        isTesting,
        setActiveDriver,
        updateConfig,
        testConnection,
        startMigration,
        startBatchMigration,
        uploadFile,
        deleteFile,
        deleteMultipleFiles,
        renameFile,
        moveFile,
        copyFile,
        refreshFiles,
        refreshStats,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorageManager = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorageManager must be used within a StorageProvider');
  }
  return context;
};
