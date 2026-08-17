'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SavedCollection, SavedItem } from '@/types/saved';
import { MOCK_POSTS, MOCK_SHORTS, Post, ShortVideo } from '@/lib/supabase/store';

interface SavedContextType {
  collections: SavedCollection[];
  savedItems: SavedItem[];
  isSaved: (targetId: string) => boolean;
  getItemCollections: (targetId: string) => string[];
  toggleQuickSave: (item: { id: string; type: 'post' | 'reel'; post?: Post; short?: ShortVideo }) => boolean;
  saveItemToCollections: (
    item: { id: string; type: 'post' | 'reel'; post?: Post; short?: ShortVideo },
    collectionIds: string[]
  ) => void;
  createCollection: (data: {
    title: string;
    description?: string;
    color?: string;
    coverUrl?: string;
    isPrivate?: boolean;
    icon?: string;
  }) => SavedCollection;
  updateCollection: (id: string, data: Partial<SavedCollection>) => void;
  deleteCollection: (id: string) => void;
  removeFromCollection: (targetId: string, collectionId: string) => void;
  moveItemBetweenCollections: (targetId: string, sourceColId: string, targetColId: string) => void;
  unsaveItem: (targetId: string) => void;
  refreshSavedData: () => void;
}

const DEFAULT_COLLECTIONS: SavedCollection[] = [
  {
    id: 'col-all',
    title: 'All Bookmarks',
    description: 'System collection containing all your saved posts and reels.',
    color: 'from-pink-500 to-rose-500',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    isPrivate: true,
    icon: '📂',
    itemIds: ['post-1', 'post-2', 'short-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'col-design',
    title: 'Design & Tech Inspo',
    description: 'UI/UX designs, landing page prototypes, and tech reels.',
    color: 'from-purple-500 to-indigo-500',
    coverUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600',
    isPrivate: true,
    icon: '🎨',
    itemIds: ['post-1', 'short-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'col-vip',
    title: 'VIP Masterclasses',
    description: 'Exclusive subscriber tutorials, code snippets, and creator tips.',
    color: 'from-amber-500 to-pink-500',
    coverUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600',
    isPrivate: true,
    icon: '⭐',
    itemIds: ['post-2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_SAVED_ITEMS: SavedItem[] = [
  {
    id: 'save-1',
    targetId: 'post-1',
    itemType: 'post',
    collectionIds: ['col-all', 'col-design'],
    savedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    post: MOCK_POSTS.find((p) => p.id === 'post-1'),
  },
  {
    id: 'save-2',
    targetId: 'post-2',
    itemType: 'post',
    collectionIds: ['col-all', 'col-vip'],
    savedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    post: MOCK_POSTS.find((p) => p.id === 'post-2'),
  },
  {
    id: 'save-3',
    targetId: 'short-1',
    itemType: 'reel',
    collectionIds: ['col-all', 'col-design'],
    savedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    short: MOCK_SHORTS.find((s) => s.id === 'short-1'),
  },
];

const STORAGE_KEY_COLLECTIONS = 'creatorpulse_saved_collections_v2';
const STORAGE_KEY_ITEMS = 'creatorpulse_saved_items_v2';

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export const SavedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collections, setCollections] = useState<SavedCollection[]>(DEFAULT_COLLECTIONS);
  const [savedItems, setSavedItems] = useState<SavedItem[]>(INITIAL_SAVED_ITEMS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedCols = localStorage.getItem(STORAGE_KEY_COLLECTIONS);
      const storedItems = localStorage.getItem(STORAGE_KEY_ITEMS);

      if (storedCols) {
        setCollections(JSON.parse(storedCols));
      } else {
        localStorage.setItem(STORAGE_KEY_COLLECTIONS, JSON.stringify(DEFAULT_COLLECTIONS));
      }

      if (storedItems) {
        setSavedItems(JSON.parse(storedItems));
      } else {
        localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_SAVED_ITEMS));
      }
    } catch (e) {
      console.error('Failed to load saved state from localStorage:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to LocalStorage helper
  const saveState = useCallback(
    (newCols: SavedCollection[], newItems: SavedItem[]) => {
      setCollections(newCols);
      setSavedItems(newItems);
      try {
        localStorage.setItem(STORAGE_KEY_COLLECTIONS, JSON.stringify(newCols));
        localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(newItems));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    },
    []
  );

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_COLLECTIONS && e.newValue) {
        try { setCollections(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === STORAGE_KEY_ITEMS && e.newValue) {
        try { setSavedItems(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isSaved = useCallback(
    (targetId: string) => {
      return savedItems.some((item) => item.targetId === targetId);
    },
    [savedItems]
  );

  const getItemCollections = useCallback(
    (targetId: string) => {
      const item = savedItems.find((i) => i.targetId === targetId);
      return item ? item.collectionIds : [];
    },
    [savedItems]
  );

  const toggleQuickSave = useCallback(
    (item: { id: string; type: 'post' | 'reel'; post?: Post; short?: ShortVideo }) => {
      const exists = savedItems.some((i) => i.targetId === item.id);

      if (exists) {
        // Unsave completely
        const newItems = savedItems.filter((i) => i.targetId !== item.id);
        const newCols = collections.map((col) => ({
          ...col,
          itemIds: col.itemIds.filter((id) => id !== item.id),
        }));
        saveState(newCols, newItems);
        return false;
      } else {
        // Quick save to "col-all" (All Bookmarks)
        const newItem: SavedItem = {
          id: `save-${Date.now()}`,
          targetId: item.id,
          itemType: item.type,
          collectionIds: ['col-all'],
          savedAt: new Date().toISOString(),
          post: item.post || MOCK_POSTS.find((p) => p.id === item.id),
          short: item.short || MOCK_SHORTS.find((s) => s.id === item.id),
        };

        const newItems = [newItem, ...savedItems];
        const newCols = collections.map((col) =>
          col.id === 'col-all' ? { ...col, itemIds: [item.id, ...col.itemIds] } : col
        );
        saveState(newCols, newItems);
        return true;
      }
    },
    [collections, savedItems, saveState]
  );

  const saveItemToCollections = useCallback(
    (
      item: { id: string; type: 'post' | 'reel'; post?: Post; short?: ShortVideo },
      collectionIds: string[]
    ) => {
      // Ensure 'col-all' is included if at least 1 collection is selected
      const finalColIds = Array.from(
        new Set(collectionIds.length > 0 ? ['col-all', ...collectionIds] : [])
      );

      let newItems: SavedItem[];

      if (finalColIds.length === 0) {
        // Unsave item completely if no collection selected
        newItems = savedItems.filter((i) => i.targetId !== item.id);
      } else {
        const existingIdx = savedItems.findIndex((i) => i.targetId === item.id);
        if (existingIdx >= 0) {
          newItems = [...savedItems];
          newItems[existingIdx] = {
            ...newItems[existingIdx],
            collectionIds: finalColIds,
          };
        } else {
          const newItem: SavedItem = {
            id: `save-${Date.now()}`,
            targetId: item.id,
            itemType: item.type,
            collectionIds: finalColIds,
            savedAt: new Date().toISOString(),
            post: item.post || MOCK_POSTS.find((p) => p.id === item.id),
            short: item.short || MOCK_SHORTS.find((s) => s.id === item.id),
          };
          newItems = [newItem, ...savedItems];
        }
      }

      // Update collections itemIds
      const newCols = collections.map((col) => {
        const isAssigned = finalColIds.includes(col.id);
        const hasId = col.itemIds.includes(item.id);

        if (isAssigned && !hasId) {
          return { ...col, itemIds: [item.id, ...col.itemIds], updatedAt: new Date().toISOString() };
        } else if (!isAssigned && hasId) {
          return { ...col, itemIds: col.itemIds.filter((id) => id !== item.id), updatedAt: new Date().toISOString() };
        }
        return col;
      });

      saveState(newCols, newItems);
    },
    [collections, savedItems, saveState]
  );

  const createCollection = useCallback(
    (data: {
      title: string;
      description?: string;
      color?: string;
      coverUrl?: string;
      isPrivate?: boolean;
      icon?: string;
    }) => {
      const newCol: SavedCollection = {
        id: `col-${Date.now()}`,
        title: data.title.trim(),
        description: data.description?.trim() || '',
        color: data.color || 'from-pink-500 to-rose-500',
        coverUrl:
          data.coverUrl ||
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        isPrivate: data.isPrivate !== undefined ? data.isPrivate : true,
        icon: data.icon || '📁',
        itemIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newCols = [...collections, newCol];
      saveState(newCols, savedItems);
      return newCol;
    },
    [collections, savedItems, saveState]
  );

  const updateCollection = useCallback(
    (id: string, data: Partial<SavedCollection>) => {
      const newCols = collections.map((col) =>
        col.id === id
          ? { ...col, ...data, updatedAt: new Date().toISOString() }
          : col
      );
      saveState(newCols, savedItems);
    },
    [collections, savedItems, saveState]
  );

  const deleteCollection = useCallback(
    (id: string) => {
      if (id === 'col-all') return; // Cannot delete All Bookmarks

      const newCols = collections.filter((c) => c.id !== id);
      // Remove collection id from saved items
      const newItems = savedItems.map((item) => ({
        ...item,
        collectionIds: item.collectionIds.filter((colId) => colId !== id),
      }));

      saveState(newCols, newItems);
    },
    [collections, savedItems, saveState]
  );

  const removeFromCollection = useCallback(
    (targetId: string, collectionId: string) => {
      const newItems = savedItems
        .map((item) => {
          if (item.targetId === targetId) {
            const nextCols = item.collectionIds.filter((cId) => cId !== collectionId);
            return { ...item, collectionIds: nextCols };
          }
          return item;
        })
        .filter((item) => item.collectionIds.length > 0);

      const newCols = collections.map((col) => {
        if (col.id === collectionId) {
          return {
            ...col,
            itemIds: col.itemIds.filter((id) => id !== targetId),
            updatedAt: new Date().toISOString(),
          };
        }
        return col;
      });

      saveState(newCols, newItems);
    },
    [collections, savedItems, saveState]
  );

  const moveItemBetweenCollections = useCallback(
    (targetId: string, sourceColId: string, targetColId: string) => {
      const newItems = savedItems.map((item) => {
        if (item.targetId === targetId) {
          const nextCols = item.collectionIds
            .filter((cId) => cId !== sourceColId)
            .concat(targetColId);
          return { ...item, collectionIds: Array.from(new Set(nextCols)) };
        }
        return item;
      });

      const newCols = collections.map((col) => {
        if (col.id === sourceColId) {
          return {
            ...col,
            itemIds: col.itemIds.filter((id) => id !== targetId),
            updatedAt: new Date().toISOString(),
          };
        }
        if (col.id === targetColId) {
          return {
            ...col,
            itemIds: Array.from(new Set([targetId, ...col.itemIds])),
            updatedAt: new Date().toISOString(),
          };
        }
        return col;
      });

      saveState(newCols, newItems);
    },
    [collections, savedItems, saveState]
  );

  const unsaveItem = useCallback(
    (targetId: string) => {
      const newItems = savedItems.filter((i) => i.targetId !== targetId);
      const newCols = collections.map((col) => ({
        ...col,
        itemIds: col.itemIds.filter((id) => id !== targetId),
      }));
      saveState(newCols, newItems);
    },
    [collections, savedItems, saveState]
  );

  const refreshSavedData = useCallback(() => {
    try {
      const storedCols = localStorage.getItem(STORAGE_KEY_COLLECTIONS);
      const storedItems = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (storedCols) setCollections(JSON.parse(storedCols));
      if (storedItems) setSavedItems(JSON.parse(storedItems));
    } catch {}
  }, []);

  return (
    <SavedContext.Provider
      value={{
        collections,
        savedItems,
        isSaved,
        getItemCollections,
        toggleQuickSave,
        saveItemToCollections,
        createCollection,
        updateCollection,
        deleteCollection,
        removeFromCollection,
        moveItemBetweenCollections,
        unsaveItem,
        refreshSavedData,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = () => {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
};
