'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserProfile, UserRole, MOCK_USERS } from '../supabase/store';
import { authenticateUser, registerAccount, AUTH_ACCOUNTS } from './users';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  signup: (fullName: string, username: string, email: string, password: string, role?: UserRole, category?: string) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  hasRole: (allowedRoles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_ROLE_KEY = 'creatorpulse_role';
const COOKIE_SESSION_KEY = 'creatorpulse_session';
const STORAGE_USER_KEY = 'creatorpulse_auth_user';
const STORAGE_ROLE_KEY = 'creatorpulse_active_role';

// Helper to set cookie in browser
function setCookie(name: string, value: string, days = 30) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = '; expires=' + date.toUTCString();
  document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax`;
}

// Helper to remove cookie
function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Default seed user
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('member');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_USER_KEY);
        const storedRole = localStorage.getItem(STORAGE_ROLE_KEY) as UserRole;

        if (storedUser) {
          const parsed = JSON.parse(storedUser) as UserProfile;
          setUser(parsed);
          setRole(parsed.role || storedRole || 'member');
          setCookie(COOKIE_ROLE_KEY, parsed.role || storedRole || 'member');
          setCookie(COOKIE_SESSION_KEY, parsed.id);
        } else if (storedRole) {
          // Find mock user for role
          const fallback = storedRole === 'admin'
            ? MOCK_USERS['user-admin']
            : storedRole === 'creator'
            ? MOCK_USERS['user-creator-1']
            : MOCK_USERS['user-member'];
          setUser(fallback);
          setRole(storedRole);
          setCookie(COOKIE_ROLE_KEY, storedRole);
          setCookie(COOKIE_SESSION_KEY, fallback.id);
        } else {
          // Default to member
          const defaultMember = MOCK_USERS['user-member'];
          setUser(defaultMember);
          setRole('member');
          setCookie(COOKIE_ROLE_KEY, 'member');
          setCookie(COOKIE_SESSION_KEY, defaultMember.id);
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(defaultMember));
          localStorage.setItem(STORAGE_ROLE_KEY, 'member');
        }
      } catch (e) {
        console.error('Failed to parse auth state', e);
        const defaultMember = MOCK_USERS['user-member'];
        setUser(defaultMember);
        setRole('member');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(initAuth, 0);

    // Listen to cross-component role changes
    const handleRoleEvent = (e: CustomEvent<UserRole>) => {
      const newRole = e.detail;
      if (newRole) {
        setRole(newRole);
        const fallbackUser = newRole === 'admin'
          ? MOCK_USERS['user-admin']
          : newRole === 'creator'
          ? MOCK_USERS['user-creator-1']
          : MOCK_USERS['user-member'];
        setUser(fallbackUser);
        setCookie(COOKIE_ROLE_KEY, newRole);
        setCookie(COOKIE_SESSION_KEY, fallbackUser.id);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(fallbackUser));
        localStorage.setItem(STORAGE_ROLE_KEY, newRole);
      }
    };

    window.addEventListener('creatorpulse_role_changed', handleRoleEvent as EventListener);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('creatorpulse_role_changed', handleRoleEvent as EventListener);
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 400)); // smooth experience
      const { user: authedUser, error } = authenticateUser(email, password);

      if (error || !authedUser) {
        setIsLoading(false);
        return { success: false, error: error || 'Authentication failed' };
      }

      setUser(authedUser);
      setRole(authedUser.role);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authedUser));
      localStorage.setItem(STORAGE_ROLE_KEY, authedUser.role);
      setCookie(COOKIE_ROLE_KEY, authedUser.role);
      setCookie(COOKIE_SESSION_KEY, authedUser.id);

      window.dispatchEvent(new CustomEvent('creatorpulse_role_changed', { detail: authedUser.role }));
      setIsLoading(false);
      return { success: true, user: authedUser };
    } catch (err) {
      setIsLoading(false);
      const errMsg = err instanceof Error ? err.message : 'Login error';
      return { success: false, error: errMsg };
    }
  };

  const signup = async (
    fullName: string,
    username: string,
    email: string,
    password: string,
    userRole: UserRole = 'member',
    category?: string
  ): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 500));
      const registered = registerAccount(fullName, username, email, password, userRole, category);

      setUser(registered);
      setRole(registered.role);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(registered));
      localStorage.setItem(STORAGE_ROLE_KEY, registered.role);
      setCookie(COOKIE_ROLE_KEY, registered.role);
      setCookie(COOKIE_SESSION_KEY, registered.id);

      window.dispatchEvent(new CustomEvent('creatorpulse_role_changed', { detail: registered.role }));
      setIsLoading(false);
      return { success: true, user: registered };
    } catch (err) {
      setIsLoading(false);
      const errMsg = err instanceof Error ? err.message : 'Registration error';
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    deleteCookie(COOKIE_ROLE_KEY);
    deleteCookie(COOKIE_SESSION_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_ROLE_KEY);
    setUser(null);
    setRole('guest');
    window.dispatchEvent(new CustomEvent('creatorpulse_role_changed', { detail: 'guest' }));
    router.push('/auth/login');
  };

  const switchRole = (newRole: UserRole) => {
    const roleUser = newRole === 'admin'
      ? MOCK_USERS['user-admin']
      : newRole === 'creator'
      ? MOCK_USERS['user-creator-1']
      : MOCK_USERS['user-member'];

    setUser(roleUser);
    setRole(newRole);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(roleUser));
    localStorage.setItem(STORAGE_ROLE_KEY, newRole);
    setCookie(COOKIE_ROLE_KEY, newRole);
    setCookie(COOKIE_SESSION_KEY, roleUser.id);
    window.dispatchEvent(new CustomEvent('creatorpulse_role_changed', { detail: newRole }));
  };

  const hasRole = (allowedRoles: UserRole | UserRole[]): boolean => {
    if (!role) return false;
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return allowed.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user && role !== 'guest',
        isLoading,
        login,
        signup,
        logout,
        switchRole,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
