'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AdminTheme = 'light' | 'dark' | 'system';

interface AdminThemeContextType {
  adminTheme: AdminTheme;
  setAdminTheme: (theme: AdminTheme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
};

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminTheme, setAdminThemeState] = useState<AdminTheme>('system');

  // Load theme preference on mount safely
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('creatorpulse_admin_theme_preference') as AdminTheme;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setAdminThemeState(savedTheme);
      }
    } catch (e) {
      console.error('Failed to load admin theme from localStorage:', e);
    }
  }, []);

  const setAdminTheme = (theme: AdminTheme) => {
    setAdminThemeState(theme);
    try {
      localStorage.setItem('creatorpulse_admin_theme_preference', theme);
    } catch (e) {
      console.error('Failed to save admin theme to localStorage:', e);
    }
  };

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      let isDark = false;

      if (adminTheme === 'dark') {
        isDark = true;
      } else if (adminTheme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        root.classList.add('admin-dark');
      } else {
        root.classList.remove('admin-dark');
      }
    };

    applyTheme();

    if (adminTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = () => {
        const root = document.documentElement;
        if (mediaQuery.matches) {
          root.classList.add('admin-dark');
        } else {
          root.classList.remove('admin-dark');
        }
      };

      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }
  }, [adminTheme]);

  return (
    <AdminThemeContext.Provider value={{ adminTheme, setAdminTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
};
