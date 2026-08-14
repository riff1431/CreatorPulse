'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserProfile, UserRole, MOCK_USERS } from '../supabase/store';
import { authenticateUser, registerAccount } from './users';
import { createClient, isSupabaseConfigured } from '../supabase/client';
import { getRoleById } from './role-store';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  permissions: Record<string, boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  signup: (fullName: string, username: string, email: string, password: string, role?: UserRole, category?: string) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  hasRole: (allowedRoles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_ROLE_KEY = 'creatorpulse_role';
const COOKIE_SESSION_KEY = 'creatorpulse_session';
const STORAGE_USER_KEY = 'creatorpulse_auth_user';
const STORAGE_ROLE_KEY = 'creatorpulse_active_role';

// Helper to set cookie in browser
function setCookie(name: string, value: string, days?: number) {
  if (typeof document === 'undefined') return;
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax; Secure`;
}

// Helper to remove cookie
function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure`;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('member');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const clearLocalSession = () => {
    deleteCookie(COOKIE_ROLE_KEY);
    deleteCookie(COOKIE_SESSION_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_ROLE_KEY);
  };

  // Sync role permissions dynamically when active role changes
  useEffect(() => {
    if (role && role !== 'guest') {
      // Map super_admin or creator roles from store config
      const mappedRoleId = role === 'super_admin' ? 'admin' : role; // Map to builtin role permission sets if custom role not found
      const roleObj = getRoleById(role) || getRoleById(mappedRoleId);
      setPermissions((roleObj?.permissions || {}) as Record<string, boolean>);
    } else {
      setPermissions({});
    }
  }, [role]);

  // Initialize auth state on mount
  useEffect(() => {
    const isLive = isSupabaseConfigured();

    if (isLive) {
      const supabase = createClient();
      if (!supabase) return;

      // Handle session listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        setIsLoading(true);
        if (session?.user) {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error || !profile) {
              console.error('Error fetching user profile', error);
              setUser(null);
              setRole('guest');
              clearLocalSession();
            } else {
              // Block suspended/banned accounts immediately
              if (profile.status === 'suspended' || profile.status === 'banned') {
                await supabase.auth.signOut();
                setUser(null);
                setRole('guest');
                clearLocalSession();
                router.push('/auth/login?reason=blocked');
                setIsLoading(false);
                return;
              }

              const userProfile: UserProfile = {
                id: profile.id,
                email: profile.email,
                fullName: profile.full_name,
                username: profile.username,
                avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.username}`,
                coverUrl: profile.cover_url,
                bio: profile.bio || '',
                role: (profile.role_id || profile.role || 'member') as UserRole,
                isVerified: profile.is_verified,
                status: (profile.status || 'active') as 'active' | 'suspended' | 'banned',
                createdAt: profile.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : ''
              };

              setUser(userProfile);
              setRole(userProfile.role);
              localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userProfile));
              localStorage.setItem(STORAGE_ROLE_KEY, userProfile.role);
              setCookie(COOKIE_ROLE_KEY, userProfile.role, 30); // Default cookie refresh
              setCookie(COOKIE_SESSION_KEY, userProfile.id, 30);
            }
          } catch (e) {
            console.error('Auth sync exception', e);
          }
        } else {
          setUser(null);
          setRole('guest');
          clearLocalSession();
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Local fallback simulation
      try {
        const storedUser = localStorage.getItem(STORAGE_USER_KEY);
        const storedRole = localStorage.getItem(STORAGE_ROLE_KEY) as UserRole;

        if (storedUser) {
          const parsed = JSON.parse(storedUser) as UserProfile;
          if (!parsed.status) parsed.status = 'active';

          if (parsed.status === 'suspended' || parsed.status === 'banned') {
            setUser(null);
            setRole('guest');
            clearLocalSession();
            router.push('/auth/login?reason=blocked');
          } else {
            setUser(parsed);
            setRole(parsed.role || storedRole || 'member');
            setCookie(COOKIE_ROLE_KEY, parsed.role || storedRole || 'member');
            setCookie(COOKIE_SESSION_KEY, parsed.id);
          }
        } else if (storedRole) {
          const fallback = storedRole === 'admin'
            ? MOCK_USERS['user-admin']
            : storedRole === 'super_admin'
            ? MOCK_USERS['user-superadmin']
            : storedRole === 'moderator'
            ? MOCK_USERS['user-moderator']
            : storedRole === 'creator'
            ? MOCK_USERS['user-creator-1']
            : MOCK_USERS['user-member'];

          if (fallback.status === 'suspended' || fallback.status === 'banned') {
            setUser(null);
            setRole('guest');
            clearLocalSession();
          } else {
            setUser(fallback);
            setRole(storedRole);
            setCookie(COOKIE_ROLE_KEY, storedRole);
            setCookie(COOKIE_SESSION_KEY, fallback.id);
          }
        } else {
          // Default setup for sandbox exploration
          const defaultMember = MOCK_USERS['user-member'];
          setUser(defaultMember);
          setRole('member');
          setCookie(COOKIE_ROLE_KEY, 'member');
          setCookie(COOKIE_SESSION_KEY, defaultMember.id);
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(defaultMember));
          localStorage.setItem(STORAGE_ROLE_KEY, 'member');
        }
      } catch (e) {
        console.error('Failed to parse local auth state', e);
      } finally {
        setIsLoading(false);
      }

      // Role switcher sync trigger
      const handleRoleEvent = (e: CustomEvent<UserRole>) => {
        const newRole = e.detail;
        if (newRole) {
          setRole(newRole);
          const fallbackUser = newRole === 'admin'
            ? MOCK_USERS['user-admin']
            : newRole === 'super_admin'
            ? MOCK_USERS['user-superadmin']
            : newRole === 'moderator'
            ? MOCK_USERS['user-moderator']
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
        window.removeEventListener('creatorpulse_role_changed', handleRoleEvent as EventListener);
      };
    }
  }, [router]);

  const login = async (email: string, password: string, rememberMe = true): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    setIsLoading(true);
    const cookieDays = rememberMe ? 30 : undefined; // undefined results in browser session-scoped cookie

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) return { success: false, error: 'Supabase client failed to load.' };

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
          // Fallback to local mock accounts dynamically for seamless testing when credentials are not seeded yet
          const normalizedEmail = email.trim().toLowerCase();
          const { user: authedUser, error: localErr } = authenticateUser(normalizedEmail, password);
          if (authedUser && !localErr) {
            setUser(authedUser);
            setRole(authedUser.role);
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authedUser));
            localStorage.setItem(STORAGE_ROLE_KEY, authedUser.role);
            setCookie(COOKIE_ROLE_KEY, authedUser.role, cookieDays);
            setCookie(COOKIE_SESSION_KEY, authedUser.id, cookieDays);
            setIsLoading(false);
            return { success: true, user: authedUser };
          }

          setIsLoading(false);
          return { success: false, error: error?.message || 'Login failed.' };
        }

        // Fetch corresponding profile
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileErr || !profile) {
          await supabase.auth.signOut();
          setIsLoading(false);
          return { success: false, error: 'User profile not found.' };
        }

        // Check account status
        if (profile.status === 'suspended' || profile.status === 'banned') {
          await supabase.auth.signOut();
          setIsLoading(false);
          return { success: false, error: 'Your account has been suspended or banned. Please contact support.' };
        }

        const userProfile: UserProfile = {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          username: profile.username,
          avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.username}`,
          coverUrl: profile.cover_url,
          bio: profile.bio || '',
          role: (profile.role_id || profile.role || 'member') as UserRole,
          isVerified: profile.is_verified,
          status: (profile.status || 'active') as 'active' | 'suspended' | 'banned',
          createdAt: profile.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : ''
        };

        setUser(userProfile);
        setRole(userProfile.role);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userProfile));
        localStorage.setItem(STORAGE_ROLE_KEY, userProfile.role);
        setCookie(COOKIE_ROLE_KEY, userProfile.role, cookieDays);
        setCookie(COOKIE_SESSION_KEY, userProfile.id, cookieDays);

        setIsLoading(false);
        return { success: true, user: userProfile };
      } catch (err) {
        setIsLoading(false);
        return { success: false, error: err instanceof Error ? err.message : 'Unexpected authentication error.' };
      }
    } else {
      // Local fallback auth
      try {
        await new Promise((res) => setTimeout(res, 400));
        const { user: authedUser, error } = authenticateUser(email, password);

        if (error || !authedUser) {
          setIsLoading(false);
          return { success: false, error: error || 'Authentication failed' };
        }

        setUser(authedUser);
        setRole(authedUser.role);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authedUser));
        localStorage.setItem(STORAGE_ROLE_KEY, authedUser.role);
        setCookie(COOKIE_ROLE_KEY, authedUser.role, cookieDays);
        setCookie(COOKIE_SESSION_KEY, authedUser.id, cookieDays);

        window.dispatchEvent(new CustomEvent('creatorpulse_role_changed', { detail: authedUser.role }));
        setIsLoading(false);
        return { success: true, user: authedUser };
      } catch (err) {
        setIsLoading(false);
        return { success: false, error: err instanceof Error ? err.message : 'Login error' };
      }
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

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) return { success: false, error: 'Supabase client failed to load.' };

      try {
        // Enforce signup role restrictions on client level (only creator and member registers allowed)
        const allowedSignupRole = userRole === 'creator' ? 'creator' : 'member';

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              fullName: fullName.trim(),
              username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
              role: allowedSignupRole,
              category
            }
          }
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (!data.session) {
          // Email confirmation is enabled in Supabase, user needs to verify first
          setIsLoading(false);
          return { success: true, error: 'Check email' }; // Special signal that registration succeeded but requires verification
        }

        // If directly logged in
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user!.id)
          .single();

        if (profile) {
          const userProfile: UserProfile = {
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            username: profile.username,
            avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.username}`,
            coverUrl: profile.cover_url,
            bio: profile.bio || '',
            role: (profile.role_id || profile.role || 'member') as UserRole,
            isVerified: profile.is_verified,
            status: (profile.status || 'active') as 'active' | 'suspended' | 'banned',
            createdAt: profile.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : ''
          };

          setUser(userProfile);
          setRole(userProfile.role);
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userProfile));
          localStorage.setItem(STORAGE_ROLE_KEY, userProfile.role);
          setCookie(COOKIE_ROLE_KEY, userProfile.role, 30);
          setCookie(COOKIE_SESSION_KEY, userProfile.id, 30);
          setIsLoading(false);
          return { success: true, user: userProfile };
        }

        setIsLoading(false);
        return { success: true };
      } catch (err) {
        setIsLoading(false);
        return { success: false, error: err instanceof Error ? err.message : 'Registration error.' };
      }
    } else {
      // Local fallback signup
      try {
        await new Promise((res) => setTimeout(res, 500));
        const registered = registerAccount(fullName, username, email, password, userRole, category);

        setUser(registered);
        setRole(registered.role);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(registered));
        localStorage.setItem(STORAGE_ROLE_KEY, registered.role);
        setCookie(COOKIE_ROLE_KEY, registered.role, 30);
        setCookie(COOKIE_SESSION_KEY, registered.id, 30);

        window.dispatchEvent(new CustomEvent('creatorpulse_role_changed', { detail: registered.role }));
        setIsLoading(false);
        return { success: true, user: registered };
      } catch (err) {
        setIsLoading(false);
        return { success: false, error: err instanceof Error ? err.message : 'Registration error' };
      }
    }
  };

  const logout = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }

    clearLocalSession();
    setUser(null);
    setRole('guest');

    if (!isSupabaseConfigured()) {
      window.dispatchEvent(new CustomEvent('creatorpulse_role_changed', { detail: 'guest' }));
    }

    setIsLoading(false);
    router.push('/auth/login');
  };

  const switchRole = (newRole: UserRole) => {
    if (isSupabaseConfigured()) {
      console.warn('Sandbox role switching is disabled when connected to a live database.');
      return;
    }

    const roleUser = newRole === 'admin'
      ? MOCK_USERS['user-admin']
      : newRole === 'super_admin'
      ? MOCK_USERS['user-superadmin']
      : newRole === 'moderator'
      ? MOCK_USERS['user-moderator']
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

  const hasPermission = (permission: string): boolean => {
    return Boolean(permissions[permission]);
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) return { success: false, error: 'Supabase client failed to load.' };

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        setIsLoading(false);
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        setIsLoading(false);
        return { success: false, error: err instanceof Error ? err.message : 'Forgot password error.' };
      }
    } else {
      // Local fallback reset token simulation
      await new Promise((res) => setTimeout(res, 500));
      setIsLoading(false);
      return { success: true };
    }
  };

  const resetPassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) return { success: false, error: 'Supabase client failed to load.' };

      try {
        const { error } = await supabase.auth.updateUser({ password });
        setIsLoading(false);
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        setIsLoading(false);
        return { success: false, error: err instanceof Error ? err.message : 'Reset password error.' };
      }
    } else {
      // Local fallback password update simulation
      await new Promise((res) => setTimeout(res, 500));
      setIsLoading(false);
      return { success: true };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permissions,
        isAuthenticated: !!user && role !== 'guest',
        isLoading,
        login,
        signup,
        logout,
        switchRole,
        hasRole,
        hasPermission,
        forgotPassword,
        resetPassword,
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
