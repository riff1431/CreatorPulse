'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface NavItemDef {
  id: string;
  location: 'header' | 'footer' | 'sidebar';
  title: string;
  url: string;
  icon?: string;
  target?: '_self' | '_blank';
  parentId?: string | null;
  orderIndex: number;
  allowedRoles: string[]; // e.g. ['all'], ['guest'], ['member'], ['creator'], ['admin']
  isEnabled: boolean;
}

export const DEFAULT_NAV_ITEMS: NavItemDef[] = [
  // Header Nav Items
  { id: 'h-1', location: 'header', title: 'Feed', url: '/feed', icon: 'Compass', orderIndex: 0, allowedRoles: ['all'], isEnabled: true },
  { id: 'h-2', location: 'header', title: 'Explore Creators', url: '/explore', icon: 'Search', orderIndex: 1, allowedRoles: ['all'], isEnabled: true },
  { id: 'h-3', location: 'header', title: 'Shorts & Reels', url: '/shorts', icon: 'Film', orderIndex: 2, allowedRoles: ['all'], isEnabled: true },
  { id: 'h-4', location: 'header', title: 'Messages', url: '/messages', icon: 'MessageSquare', orderIndex: 3, allowedRoles: ['member', 'creator', 'admin', 'super_admin'], isEnabled: true },
  { id: 'h-5', location: 'header', title: 'Become a Creator', url: '/creator/apply', icon: 'Sparkles', orderIndex: 4, allowedRoles: ['member', 'guest'], isEnabled: true },

  // Footer Nav Items
  { id: 'f-1', location: 'footer', title: 'About Us', url: '/p/about-us', orderIndex: 0, allowedRoles: ['all'], isEnabled: true },
  { id: 'f-2', location: 'footer', title: 'Terms of Service', url: '/p/terms', orderIndex: 1, allowedRoles: ['all'], isEnabled: true },
  { id: 'f-3', location: 'footer', title: 'Privacy Policy', url: '/p/privacy', orderIndex: 2, allowedRoles: ['all'], isEnabled: true },
  { id: 'f-4', location: 'footer', title: 'Creator Guidelines', url: '/p/creator-guidelines', orderIndex: 3, allowedRoles: ['all'], isEnabled: true },
  { id: 'f-5', location: 'footer', title: 'Help & Support', url: '/p/help', orderIndex: 4, allowedRoles: ['all'], isEnabled: true },

  // Sidebar Nav Items
  { id: 's-1', location: 'sidebar', title: 'Home Feed', url: '/feed', icon: 'Home', orderIndex: 0, allowedRoles: ['all'], isEnabled: true },
  { id: 's-2', location: 'sidebar', title: 'Explore', url: '/explore', icon: 'Compass', orderIndex: 1, allowedRoles: ['all'], isEnabled: true },
  { id: 's-3', location: 'sidebar', title: 'Saved Posts', url: '/saved', icon: 'Bookmark', orderIndex: 2, allowedRoles: ['member', 'creator', 'admin', 'super_admin'], isEnabled: true },
  { id: 's-4', location: 'sidebar', title: 'Wallet & Balance', url: '/balance', icon: 'Wallet', orderIndex: 3, allowedRoles: ['member', 'creator', 'admin', 'super_admin'], isEnabled: true },
  { id: 's-5', location: 'sidebar', title: 'Creator Studio', url: '/creator/dashboard', icon: 'Radio', orderIndex: 4, allowedRoles: ['creator', 'admin', 'super_admin'], isEnabled: true },
  { id: 's-6', location: 'sidebar', title: 'Admin Console', url: '/admin/dashboard', icon: 'Shield', orderIndex: 5, allowedRoles: ['admin', 'super_admin'], isEnabled: true },
];

interface NavigationContextType {
  items: NavItemDef[];
  getHeaderItems: (userRole?: string) => NavItemDef[];
  getFooterItems: (userRole?: string) => NavItemDef[];
  getSidebarItems: (userRole?: string) => NavItemDef[];
  addItem: (item: Omit<NavItemDef, 'id'>) => Promise<void>;
  updateItem: (id: string, item: Partial<NavItemDef>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  reorderItems: (location: 'header' | 'footer' | 'sidebar', orderedIds: string[]) => Promise<void>;
  resetToDefaults: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);
const STORAGE_KEY = 'creatorpulse_navigation_items';

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<NavItemDef[]>(DEFAULT_NAV_ITEMS);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse nav items from local storage', e);
      }
    }

    const fetchNav = async () => {
      try {
        const res = await fetch('/api/admin/navigation');
        if (res.ok) {
          const data = await res.json();
          if (data && data.items && data.items.length > 0) {
            setItems(data.items);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.items));
          }
        }
      } catch (e) {
        // Fallback to local state
      }
    };

    fetchNav();
  }, []);

  const saveItems = (newItems: NavItemDef[]) => {
    setItems(newItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    fetch('/api/admin/navigation', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: newItems }),
    }).catch((err) => console.error('Failed to sync nav items', err));
  };

  const filterByRole = (navItems: NavItemDef[], role: string = 'guest') => {
    return navItems
      .filter((item) => item.isEnabled)
      .filter((item) => {
        if (item.allowedRoles.includes('all')) return true;
        if (role === 'guest') return item.allowedRoles.includes('guest');
        if (role === 'super_admin') return true;
        return item.allowedRoles.includes(role);
      })
      .sort((a, b) => a.orderIndex - b.orderIndex);
  };

  const getHeaderItems = (userRole: string = 'guest') => {
    return filterByRole(items.filter((i) => i.location === 'header'), userRole);
  };

  const getFooterItems = (userRole: string = 'guest') => {
    return filterByRole(items.filter((i) => i.location === 'footer'), userRole);
  };

  const getSidebarItems = (userRole: string = 'guest') => {
    return filterByRole(items.filter((i) => i.location === 'sidebar'), userRole);
  };

  const addItem = async (item: Omit<NavItemDef, 'id'>) => {
    const newItem: NavItemDef = {
      ...item,
      id: `nav-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    saveItems([...items, newItem]);
  };

  const updateItem = async (id: string, updatedFields: Partial<NavItemDef>) => {
    const updated = items.map((item) => (item.id === id ? { ...item, ...updatedFields } : item));
    saveItems(updated);
  };

  const deleteItem = async (id: string) => {
    const updated = items.filter((item) => item.id !== id && item.parentId !== id);
    saveItems(updated);
  };

  const reorderItems = async (location: 'header' | 'footer' | 'sidebar', orderedIds: string[]) => {
    const updated = items.map((item) => {
      if (item.location === location) {
        const index = orderedIds.indexOf(item.id);
        if (index !== -1) {
          return { ...item, orderIndex: index };
        }
      }
      return item;
    });
    saveItems(updated);
  };

  const resetToDefaults = () => {
    setItems(DEFAULT_NAV_ITEMS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <NavigationContext.Provider
      value={{
        items,
        getHeaderItems,
        getFooterItems,
        getSidebarItems,
        addItem,
        updateItem,
        deleteItem,
        reorderItems,
        resetToDefaults,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
