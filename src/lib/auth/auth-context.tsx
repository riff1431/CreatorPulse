'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  logout: (targetRedirect?: string) => Promise<void> | void;
  switchRole: (newRole: UserRole) => void;
  hasRole: (allowedRoles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  saveOnboardingProgress: (step: number, data: Partial<any>) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: (finalData?: Partial<any>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_ROLE_KEY = 'creatorpulse_role';
const COOKIE_SESSION_KEY = 'creatorpulse_session';
const COOKIE_PROFILE_KEY = 'creatorpulse_user_profile';
const STORAGE_USER_KEY = 'creatorpulse_auth_user';
const STORAGE_ROLE_KEY = 'creatorpulse_active_role';
const CHANNEL_NAME = 'creatorpulse_auth_sync';

// BroadcastChannel message type for cross-tab sync
type SyncMessage = 
  | { type: 'LOGIN' | 'ROLE_SWITCH' | 'UPDATE_PROFILE'; user: UserProfile }
  | { type: 'LOGOUT' };

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

// Compute permissions synchronously from role to prevent state tearing
function computePermissions(userRole: UserRole): Record<string, boolean> {
  if (!userRole || userRole === 'guest') return {};
  const mappedRoleId = userRole === 'super_admin' ? 'admin' : userRole;
  const roleObj = getRoleById(userRole) || getRoleById(mappedRoleId);
  return (roleObj?.permissions || {}) as Record<string, boolean>;
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
  
  const [user, setUserState] = useState<UserProfile | null>(initialUser);
  const [role, setRoleState] = useState<UserRole>(initialRole);
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() => computePermissions(initialRole));
  const [isLoading, setIsLoading] = useState<boolean>(initialUser === null && initialRole === 'guest' ? false : !initialUser);

  // Maintain ref to avoid stale closures in listeners
  const userRef = useRef<UserProfile | null>(user);
  userRef.current = user;

  // Broadcast Channel ref for cross-tab sync
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Internal helper to update state & permissions synchronously
  const setAuthState = (newUser: UserProfile | null, newRole?: UserRole) => {
    const resolvedRole = newUser ? (newUser.role || newRole || 'member') : 'guest';
    setUserState(newUser);
    setRoleState(resolvedRole);
    setPermissions(computePermissions(resolvedRole));
    userRef.current = newUser;
  };

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

  // Broadcast cross-tab authentication events
  const broadcastSync = (message: SyncMessage) => {
    try {
      if (channelRef.current) {
        channelRef.current.postMessage(message);
      }
    } catch (e) {
      console.warn('BroadcastChannel postMessage failed', e);
    }
  };

  // Setup BroadcastChannel & Storage Event Listeners for Cross-Tab Auth Synchronization
  useEffect(() => {
    // 1. Initialize BroadcastChannel if available
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current.onmessage = (event: MessageEvent<SyncMessage>) => {
        const msg = event.data;
        if (!msg) return;

        if (msg.type === 'LOGIN' || msg.type === 'ROLE_SWITCH' || msg.type === 'UPDATE_PROFILE') {
          setAuthState(msg.user);
          setIsLoading(false);
        } else if (msg.type === 'LOGOUT') {
          setAuthState(null, 'guest');
          setIsLoading(false);
        }
      };
    }

    // 2. Storage event listener fallback for cross-tab sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_USER_KEY) {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue) as UserProfile;
            setAuthState(parsed);
          } catch (err) {}
        } else {
          setAuthState(null, 'guest');
        }
      }
    };

    // 3. Global custom events listener for single-tab events
    const handleRoleEvent = (e: CustomEvent<UserRole>) => {
      const newRole = e.detail;
      if (newRole) {
        const fallbackUser = newRole === 'admin'
          ? MOCK_USERS['user-admin']
          : newRole === 'super_admin'
          ? MOCK_USERS['user-superadmin']
          : newRole === 'moderator'
          ? MOCK_USERS['user-moderator']
          : newRole === 'creator'
          ? MOCK_USERS['user-creator-1']
          : MOCK_USERS['user-member'];

        setAuthState(fallbackUser, newRole);
        syncCookiesAndStorage(fallbackUser, true);
        broadcastSync({ type: 'ROLE_SWITCH', user: fallbackUser });
      }
    };

    const handleUserUpdateEvent = (e: CustomEvent<UserProfile>) => {
      if (e.detail) {
        setAuthState(e.detail);
        broadcastSync({ type: 'UPDATE_PROFILE', user: e.detail });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('creatorpulse_role_changed', handleRoleEvent as EventListener);
    window.addEventListener('creatorpulse_user_updated', handleUserUpdateEvent as EventListener);

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('creatorpulse_role_changed', handleRoleEvent as EventListener);
      window.removeEventListener('creatorpulse_user_updated', handleUserUpdateEvent as EventListener);
    };
  }, []);

  // Primary auth state initialization & Supabase session listener
  useEffect(() => {
    const isLive = isSupabaseConfigured();

    if (isLive) {
      const supabase = createClient();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          // Skip redundant fetch if user is already hydrated with matching ID
          if (userRef.current && userRef.current.id === session.user.id) {
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
              setAuthState(null, 'guest');
              clearLocalSession();
              broadcastSync({ type: 'LOGOUT' });
            } else {
              // Block suspended/banned accounts immediately
              if (profile.status === 'suspended' || profile.status === 'banned') {
                await supabase.auth.signOut();
                setAuthState(null, 'guest');
                clearLocalSession();
                broadcastSync({ type: 'LOGOUT' });
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

              setAuthState(userProfile);
              syncCookiesAndStorage(userProfile, true);
              broadcastSync({ type: 'LOGIN', user: userProfile });
            }
          } catch (e) {
            console.error('Auth sync exception', e);
          }
        } else {
          // Check for active mock session before clearing
          const sessionCookieVal = typeof document !== 'undefined' 
            ? document.cookie.split('; ').find(row => row.trim().startsWith('creatorpulse_session='))?.split('=')[1]
            : undefined;
          const storedUser = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_USER_KEY) : null;

          if (sessionCookieVal && sessionCookieVal.startsWith('user-') && storedUser) {
            try {
              const parsed = JSON.parse(storedUser) as UserProfile;
              setAuthState(parsed);
              setIsLoading(false);
              return;
            } catch (e) {}
          }

          setAuthState(null, 'guest');
          clearLocalSession();
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Sandbox / Local Simulation Engine
      try {
        const storedUser = localStorage.getItem(STORAGE_USER_KEY);
        const storedRole = localStorage.getItem(STORAGE_ROLE_KEY) as UserRole;

        if (storedUser) {
          const parsed = JSON.parse(storedUser) as UserProfile;
          if (!parsed.status) parsed.status = 'active';

          if (parsed.status === 'suspended' || parsed.status === 'banned') {
            setAuthState(null, 'guest');
            clearLocalSession();
            router.push('/auth/login?reason=blocked');
          } else {
            setAuthState(parsed, parsed.role || storedRole || 'member');
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
            setAuthState(null, 'guest');
            clearLocalSession();
          } else {
            setAuthState(fallback, storedRole);
            syncCookiesAndStorage(fallback, true);
          }
        } else {
          const loggedOut = typeof document !== 'undefined'
            ? document.cookie.split('; ').find(row => row.trim().startsWith('creatorpulse_logged_out='))?.split('=')[1]
            : undefined;
          
          if (loggedOut === 'true') {
            setAuthState(null, 'guest');
          } else {
            const defaultMember = MOCK_USERS['user-member'];
            setAuthState(defaultMember, 'member');
            syncCookiesAndStorage(defaultMember, true);
          }
        }
      } catch (e) {
        console.error('Failed to parse local auth state', e);
      } finally {
        setIsLoading(false);
      }
    }
  }, [router]);

  const login = async (email: string, password: string, rememberMe = true): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    setIsLoading(true);

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) return { success: false, error: 'Supabase client failed to load.' };

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
          const normalizedEmail = email.trim().toLowerCase();
          const { user: authedUser, error: localErr } = authenticateUser(normalizedEmail, password);
          if (authedUser && !localErr) {
            setAuthState(authedUser);
            syncCookiesAndStorage(authedUser, rememberMe);
            broadcastSync({ type: 'LOGIN', user: authedUser });
            setIsLoading(false);
            return { success: true, user: authedUser };
          }

          setIsLoading(false);
          return { success: false, error: error?.message || 'Login failed.' };
        }

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

        setAuthState(userProfile);
        syncCookiesAndStorage(userProfile, rememberMe);
        broadcastSync({ type: 'LOGIN', user: userProfile });

        setIsLoading(false);
        return { success: true, user: userProfile };
      } catch (err) {
        setIsLoading(false);
        return { success: false, error: err instanceof Error ? err.message : 'Unexpected authentication error.' };
      }
    } else {
      try {
        await new Promise((res) => setTimeout(res, 400));
        const { user: authedUser, error } = authenticateUser(email, password);

        if (error || !authedUser) {
          setIsLoading(false);
          return { success: false, error: error || 'Authentication failed' };
        }

        setAuthState(authedUser);
        syncCookiesAndStorage(authedUser, rememberMe);
        broadcastSync({ type: 'LOGIN', user: authedUser });

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

    // Strictly disallow administrative role registration via public signup
    if (userRole === 'admin' || userRole === 'super_admin' || userRole === 'moderator') {
      setIsLoading(false);
      return { success: false, error: 'Administrative and moderator accounts cannot be registered via public registration.' };
    }

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

          setAuthState(userProfile);
          syncCookiesAndStorage(userProfile, true);
          broadcastSync({ type: 'LOGIN', user: userProfile });
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

        setAuthState(registered);
        syncCookiesAndStorage(registered, true);
        broadcastSync({ type: 'LOGIN', user: registered });

        window.dispatchEvent(new CustomEvent('creatorpulse_role_changed', { detail: registered.role }));
        setIsLoading(false);
        return { success: true, user: registered };
      } catch (err) {
        setIsLoading(false);
        return { success: false, error: err instanceof Error ? err.message : 'Registration error' };
      }
    }
  };

  const logout = async (targetRedirect?: string) => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }

    clearLocalSession();
    setCookie('creatorpulse_logged_out', 'true', 30);
    setAuthState(null, 'guest');
    broadcastSync({ type: 'LOGOUT' });

    if (!isSupabaseConfigured()) {
      window.dispatchEvent(new CustomEvent('creatorpulse_role_changed', { detail: 'guest' }));
    }

    setIsLoading(false);

    if (targetRedirect) {
      router.push(targetRedirect);
    } else if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      router.push('/admin/login');
    } else {
      router.push('/auth/login');
    }
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

    setAuthState(roleUser, newRole);
    syncCookiesAndStorage(roleUser, true);
    broadcastSync({ type: 'ROLE_SWITCH', user: roleUser });
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
      await new Promise((res) => setTimeout(res, 500));
      setIsLoading(false);
      return { success: true };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No active user session found.' };

    const updatedUser: UserProfile = {
      ...user,
      ...updates,
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              full_name: updates.fullName ?? user.fullName,
              username: updates.username ?? user.username,
              avatar_url: updates.avatarUrl ?? user.avatarUrl,
              bio: updates.bio ?? user.bio,
              email: updates.email ?? user.email,
            })
            .eq('id', user.id);

          if (error) {
            console.error('Supabase profile update error:', error);
            return { success: false, error: error.message };
          }
        } catch (err) {
          console.error('Supabase profile update exception:', err);
          return { success: false, error: err instanceof Error ? err.message : 'Profile update failed' };
        }
      }
    }

    if (MOCK_USERS[user.id]) {
      MOCK_USERS[user.id] = updatedUser;
    }

    setAuthState(updatedUser);
    syncCookiesAndStorage(updatedUser, true);
    broadcastSync({ type: 'UPDATE_PROFILE', user: updatedUser });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('creatorpulse_user_updated', { detail: updatedUser }));
    }
    return { success: true };
  };

  const saveOnboardingProgress = async (step: number, data: Partial<any>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No active user session found.' };

    const mergedOnboardingData = {
      ...(user.onboardingData || {}),
      ...data
    };

    const updates: Partial<UserProfile> = {
      onboardingStep: step,
      onboardingData: mergedOnboardingData,
      // If data has profile fields, update them directly as well
      fullName: data.fullName ?? user.fullName,
      bio: data.bio ?? user.bio,
      avatarUrl: data.avatarUrl ?? user.avatarUrl,
      coverUrl: data.coverImageUrl ?? user.coverUrl,
      category: data.category ?? user.category,
    };

    return updateProfile(updates);
  };

  const completeOnboarding = async (finalData?: Partial<any>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No active user session found.' };

    const mergedOnboardingData = {
      ...(user.onboardingData || {}),
      ...(finalData || {})
    };

    const updates: Partial<UserProfile> = {
      isOnboarded: true,
      onboardingStep: 4,
      onboardingData: mergedOnboardingData,
      profileCompletionScore: user.role === 'creator' ? 95 : 90,
      fullName: finalData?.fullName ?? user.fullName,
      bio: finalData?.bio ?? user.bio,
      avatarUrl: finalData?.avatarUrl ?? user.avatarUrl,
      coverUrl: finalData?.coverImageUrl ?? user.coverUrl,
      category: finalData?.category ?? user.category,
    };

    return updateProfile(updates);
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
        updateProfile,
        saveOnboardingProgress,
        completeOnboarding,
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
