'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ActivityCategory, ActivityLogItem } from '@/types/history';

interface HistoryContextType {
  historyItems: ActivityLogItem[];
  isTrackingPaused: boolean;
  togglePauseTracking: () => void;
  logActivity: (item: Omit<ActivityLogItem, 'id' | 'timestamp'>) => void;
  removeActivityItem: (id: string) => void;
  clearCategoryHistory: (category: ActivityCategory) => void;
  clearAllHistory: () => void;
  getHistoryByCategory: (category?: ActivityCategory) => ActivityLogItem[];
}

const INITIAL_HISTORY: ActivityLogItem[] = [
  {
    id: 'act-1',
    category: 'post',
    title: 'Viewed Post: Crafting High-Converting Creator Landing Pages',
    subtitle: 'By @sarah_designs • 12 mins read',
    targetUrl: '/feed#post-1',
    targetId: 'post-1',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300',
    actionType: 'view',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'act-2',
    category: 'reel',
    title: 'Watched Reel: 60s Micro-Interaction Workflow in Next.js 16',
    subtitle: 'By @alex_vance • 45s video',
    targetUrl: '/shorts?id=short-1',
    targetId: 'short-1',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300',
    actionType: 'view',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'act-3',
    category: 'search',
    title: 'Searched for "Figma design system templates"',
    subtitle: 'Search query in Explore & Search',
    targetUrl: '/explore?q=Figma+design+system+templates',
    actionType: 'search',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'act-4',
    category: 'profile',
    title: 'Visited Creator Profile: Sarah Jenkins',
    subtitle: 'UI/UX Specialist & Digital Creator (@sarah_designs)',
    targetUrl: '/c/sarah_designs',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    actionType: 'view',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: 'act-5',
    category: 'interaction',
    title: 'Liked Post & Left Comment',
    subtitle: '"This micro-interaction trick completely transformed our landing page!"',
    targetUrl: '/feed#post-1',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    actionType: 'like',
    timestamp: new Date(Date.now() - 1000 * 3600 * 5).toISOString(),
  },
  {
    id: 'act-6',
    category: 'account',
    title: 'Security Login from MacOS (Chrome 128.0)',
    subtitle: 'IP: 192.168.1.45 • Location: San Francisco, CA',
    actionType: 'login',
    timestamp: new Date(Date.now() - 1000 * 3600 * 24).toISOString(),
  },
];

const STORAGE_KEY_HISTORY = 'creatorpulse_activity_history_v2';
const STORAGE_KEY_PAUSED = 'creatorpulse_history_paused_v2';

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [historyItems, setHistoryItems] = useState<ActivityLogItem[]>(INITIAL_HISTORY);
  const [isTrackingPaused, setIsTrackingPaused] = useState<boolean>(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedHist = localStorage.getItem(STORAGE_KEY_HISTORY);
      const storedPaused = localStorage.getItem(STORAGE_KEY_PAUSED);

      if (storedHist) {
        setHistoryItems(JSON.parse(storedHist));
      } else {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(INITIAL_HISTORY));
      }

      if (storedPaused) {
        setIsTrackingPaused(JSON.parse(storedPaused));
      }
    } catch (e) {
      console.error('Failed to load history state from localStorage:', e);
    }
  }, []);

  const saveHistory = useCallback((items: ActivityLogItem[]) => {
    setHistoryItems(items);
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }, []);

  const togglePauseTracking = useCallback(() => {
    setIsTrackingPaused((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_PAUSED, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const logActivity = useCallback(
    (item: Omit<ActivityLogItem, 'id' | 'timestamp'>) => {
      if (isTrackingPaused) return; // Do not log if tracking is paused

      // Prevent duplicate logging of exact same item within last 1 minute
      const now = new Date().toISOString();
      setHistoryItems((prev) => {
        const isRecentDup = prev.some(
          (p) =>
            p.category === item.category &&
            p.title === item.title &&
            Date.now() - new Date(p.timestamp).getTime() < 60000
        );
        if (isRecentDup) return prev;

        const newLog: ActivityLogItem = {
          ...item,
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: now,
        };

        const updated = [newLog, ...prev].slice(0, 200); // Keep max 200 activity records
        try {
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [isTrackingPaused]
  );

  const removeActivityItem = useCallback((id: string) => {
    setHistoryItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearCategoryHistory = useCallback((category: ActivityCategory) => {
    setHistoryItems((prev) => {
      const updated = prev.filter((item) => item.category !== category);
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearAllHistory = useCallback(() => {
    setHistoryItems([]);
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify([]));
    } catch {}
  }, []);

  const getHistoryByCategory = useCallback(
    (category?: ActivityCategory) => {
      if (!category) return historyItems;
      return historyItems.filter((item) => item.category === category);
    },
    [historyItems]
  );

  return (
    <HistoryContext.Provider
      value={{
        historyItems,
        isTrackingPaused,
        togglePauseTracking,
        logActivity,
        removeActivityItem,
        clearCategoryHistory,
        clearAllHistory,
        getHistoryByCategory,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
