'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  StorageConfig, 
  StorageDriverType, 
  StorageCategoryFolder, 
  StoredFile, 
  StorageStats, 
  StorageTestResult 
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
  uploadFile: (file: File, folder: StorageCategoryFolder) => Promise<{ success: boolean; file?: StoredFile; error?: string }>;
  deleteFile: (fileId: string) => Promise<{ success: boolean; error?: string }>;
  deleteMultipleFiles: (fileIds: string[]) => Promise<{ success: boolean; error?: string }>;
  renameFile: (fileId: string, newName: string, newFolder?: StorageCategoryFolder) => Promise<{ success: boolean; file?: StoredFile; error?: string }>;
  refreshFiles: () => Promise<void>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

const STORAGE_CONFIG_KEY = 'creatorpulse_storage_config_v1';

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<StorageConfig>(DEFAULT_STORAGE_CONFIG);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [testResult, setTestResult] = useState<StorageTestResult | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // 1. Initialize config from localStorage (or defaults)
  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (storedConfig) {
        setConfig(JSON.parse(storedConfig));
      }
    } catch (e) {
      console.error('Failed to load storage config from localStorage', e);
    }
  }, []);

  // 2. Load files from API when driver config changes
  const fetchFiles = async (driver: StorageDriverType) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/storage/files?driver=${driver}`);
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

  useEffect(() => {
    fetchFiles(config.activeDriver);
  }, [config.activeDriver]);

  // Sync config helper
  const saveConfig = (newConfig: StorageConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.error('Failed to save storage config', e);
    }
  };

  const setActiveDriver = async (driver: StorageDriverType) => {
    const updated = { ...config, activeDriver: driver };
    saveConfig(updated);
    return { 
      success: true, 
      message: `Active storage driver switched to ${driver === 'local' ? 'Local Storage (public/uploads)' : 'Supabase Storage'}` 
    };
  };

  const updateConfig = async (partial: Partial<StorageConfig>) => {
    const updated = { ...config, ...partial };
    saveConfig(updated);
    return { success: true, message: 'Storage settings saved successfully' };
  };

  const testConnection = async (driverToTest?: StorageDriverType): Promise<StorageTestResult> => {
    setIsTesting(true);
    const targetDriver = driverToTest || config.activeDriver;
    const startTime = Date.now();

    try {
      const res = await fetch('/api/admin/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection', driver: targetDriver })
      });
      const data = await res.json();
      const latency = Date.now() - startTime;

      const result: StorageTestResult = {
        driver: targetDriver,
        success: data.success,
        latencyMs: latency,
        message: data.message || `Tested connection to ${targetDriver}.`,
        readOk: data.readOk ?? false,
        writeOk: data.writeOk ?? false,
        deleteOk: data.deleteOk ?? false,
        testedAt: new Date().toISOString(),
      };

      setTestResult(result);
      return result;
    } catch (err) {
      const latency = Date.now() - startTime;
      const result: StorageTestResult = {
        driver: targetDriver,
        success: false,
        latencyMs: latency,
        message: `Diagnostic connection failed: ${err instanceof Error ? err.message : String(err)}`,
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

  const uploadFile = async (file: File, folder: StorageCategoryFolder) => {
    // Client-side quick size validation
    if (file.size > config.maxUploadSizeBytes) {
      return { 
        success: false, 
        error: `File size exceeds the maximum allowed limit of ${config.maxUploadSizeMB} MB.` 
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('driver', config.activeDriver);

      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success && data.file) {
        setFiles(prev => [data.file, ...prev]);
        return { success: true, file: data.file };
      }
      return { success: false, error: data.error || 'Upload failed' };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Network error during upload' };
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const res = await fetch(`/api/storage/files?ids=${fileId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        return { success: true };
      }
      return { success: false, error: data.error || 'Delete failed' };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Network error during delete' };
    }
  };

  const deleteMultipleFiles = async (fileIds: string[]) => {
    try {
      const res = await fetch(`/api/storage/files?ids=${fileIds.join(',')}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setFiles(prev => prev.filter(f => !fileIds.includes(f.id)));
        return { success: true };
      }
      return { success: false, error: data.error || 'Bulk delete failed' };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Network error during bulk delete' };
    }
  };

  const renameFile = async (fileId: string, newName: string, newFolder?: StorageCategoryFolder) => {
    try {
      const res = await fetch('/api/storage/files', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileId, newName, newFolder })
      });
      const data = await res.json();

      if (data.success) {
        // Refresh full lists to ensure URLs/paths align
        await fetchFiles(config.activeDriver);
        return { success: true, file: data.file };
      }
      return { success: false, error: data.error || 'Rename failed' };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Network error during rename' };
    }
  };

  const refreshFiles = async () => {
    await fetchFiles(config.activeDriver);
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
        uploadFile,
        deleteFile,
        deleteMultipleFiles,
        renameFile,
        refreshFiles,
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
