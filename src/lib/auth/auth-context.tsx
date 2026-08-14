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
const COOKIE_PROFILE_KEY = 'creatorpulse_user_profile';
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

export const AuthProvider: React.FC<{
  children: ReactNode;
  initialUser?: UserProfile | null;
  initialRole?: UserRole;
}> = ({
  children,
  initialUser = null,
  initialRole = 'guest'
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(initialUser === null && initialRole === 'guest' ? false : !initialUser);

  const syncCookiesAndStorage = (userProfile: UserProfile, rememberMe = true) => {
    const days = rememberMe ? 30 : undefined;
    setCookie(COOKIE_ROLE_KEY, userProfile.role, days);
    setCookie(COOKIE_SESSION_KEY, userProfile.id, days);
    setCookie(COOKIE_PROFILE_KEY, encodeURIComponent(JSON.stringify(userProfile)), days);
    deleteCookie('creatorpulse_logged_out');
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userProfile));
    localStorage.setItem(STORAGE_ROLE_KEY, userProfile.role);
  };

  const clearLocalSession = () => {
    deleteCookie(COOKIE_ROLE_KEY);
    deleteCookie(COOKIE_SESSION_KEY);
    deleteCookie(COOKIE_PROFILE_KEY);
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
        if (session?.user) {
          // If we already have the matching user hydrated from SSR, skip re-fetching
          if (user && user.id === session.user.id) {
            setIsLoading(false);
            return;
          }

          setIsLoading(true);
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
              syncCookiesAndStorage(userProfile, true);
            }
          } catch (e) {
            console.error('Auth sync exception', e);
          }
        } else {
          // Check if a mock session is currently active
          const sessionCookieVal = document.cookie.split('; ').find(row => row.trim().startsWith('creatorpulse_session='))?.split('=')[1];
          const storedUser = localStorage.getItem(STORAGE_USER_KEY);

          if (sessionCookieVal && sessionCookieVal.startsWith('user-') && storedUser) {
            try {
              const parsed = JSON.parse(storedUser) as UserProfile;
              setUser(parsed);
              setRole(parsed.role || 'member');
              setIsLoading(false);
              return;
            } catch (e) {}
          }

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
            syncCookiesAndStorage(parsed, true);
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
            syncCookiesAndStorage(fallback, true);
          }
        } else {
          // If we explicitly logged out, remain guest. Otherwise auto-login as member for sandbox.
          const loggedOut = document.cookie.split('; ').find(row => row.trim().startsWith('creatorpulse_logged_out='))?.split('=')[1];
          if (loggedOut === 'true') {
            setUser(null);
            setRole('guest');
          } else {
            const defaultMember = MOCK_USERS['user-member'];
            setUser(defaultMember);
            setRole('member');
            syncCookiesAndStorage(defaultMember, true);
          }
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
          syncCookiesAndStorage(fallbackUser, true);
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
    const cookieDays = rememberMe ? 30 : undefined;

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
            syncCookiesAndStorage(authedUser, rememberMe);
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
        syncCookiesAndStorage(userProfile, rememberMe);

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
        syncCookiesAndStorage(authedUser, rememberMe);

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
          setIsLoading(false);
          return { success: true, error: 'Check email' };
        }

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
          syncCookiesAndStorage(userProfile, true);
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
      try {
        await new Promise((res) => setTimeout(res, 500));
        const registered = registerAccount(fullName, username, email, password, userRole, category);

        setUser(registered);
        setRole(registered.role);
        syncCookiesAndStorage(registered, true);

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
    setCookie('creatorpulse_logged_out', 'true', 30);
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
    syncCookiesAndStorage(roleUser, true);
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
