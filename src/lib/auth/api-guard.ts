import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserRole, UserProfile } from '../supabase/store';
import { AUTH_ACCOUNTS } from './users';
import { isRoleAllowed, RouteAccess } from './route-config';
import { createServerSupabaseClient } from '../supabase/server';

export interface ApiAuthContext {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
}

/**
 * Resolves the authenticated user session on the server for API routes.
 */
export async function getAuthenticatedApiSession(): Promise<ApiAuthContext> {
  const cookieStore = await cookies();
  const sessionCookieVal = cookieStore.get('creatorpulse_session')?.value;
  const roleCookieVal = cookieStore.get('creatorpulse_role')?.value;
  const profileCookieVal = cookieStore.get('creatorpulse_user_profile')?.value;

  // 1. Try live Supabase if configured
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile && profile.status !== 'suspended' && profile.status !== 'banned') {
        return {
          user: {
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            username: profile.username,
            avatarUrl: profile.avatar_url,
            coverUrl: profile.cover_url,
            bio: profile.bio || '',
            role: profile.role || 'member',
            isVerified: profile.is_verified,
            status: profile.status || 'active',
            createdAt: profile.created_at || '',
          },
          role: profile.role || 'member',
          isAuthenticated: true,
        };
      }
    }
  }

  // 2. Sandbox / Mock Session Resolution
  if (profileCookieVal) {
    try {
      const parsed = JSON.parse(decodeURIComponent(profileCookieVal)) as UserProfile;
      if (parsed && (parsed.status !== 'suspended' && parsed.status !== 'banned')) {
        return {
          user: parsed,
          role: parsed.role || 'member',
          isAuthenticated: true,
        };
      }
    } catch {}
  }

  if (sessionCookieVal && sessionCookieVal.startsWith('user-')) {
    const matched = Object.values(AUTH_ACCOUNTS).find((a) => a.id === sessionCookieVal);
    if (matched && matched.status !== 'suspended' && matched.status !== 'banned') {
      return {
        user: {
          id: matched.id,
          email: matched.email,
          fullName: matched.fullName,
          username: matched.username,
          avatarUrl: matched.avatarUrl,
          coverUrl: matched.coverUrl,
          bio: matched.bio,
          role: matched.role,
          isVerified: matched.isVerified,
          status: matched.status,
          createdAt: matched.createdAt,
        },
        role: matched.role,
        isAuthenticated: true,
      };
    }
  }

  if (roleCookieVal && roleCookieVal !== 'guest') {
    const roleAccount =
      roleCookieVal === 'creator'
        ? AUTH_ACCOUNTS['creator@creatorpulse.com']
        : roleCookieVal === 'admin'
        ? AUTH_ACCOUNTS['admin@creatorpulse.com']
        : roleCookieVal === 'super_admin'
        ? AUTH_ACCOUNTS['superadmin@creatorpulse.com']
        : roleCookieVal === 'moderator'
        ? AUTH_ACCOUNTS['moderator@creatorpulse.com']
        : AUTH_ACCOUNTS['fan@creatorpulse.com'];

    if (roleAccount) {
      return {
        user: {
          id: roleAccount.id,
          email: roleAccount.email,
          fullName: roleAccount.fullName,
          username: roleAccount.username,
          avatarUrl: roleAccount.avatarUrl,
          coverUrl: roleAccount.coverUrl,
          bio: roleAccount.bio,
          role: roleAccount.role,
          isVerified: roleAccount.isVerified,
          status: roleAccount.status,
          createdAt: roleAccount.createdAt,
        },
        role: roleAccount.role,
        isAuthenticated: true,
      };
    }
  }

  return {
    user: null,
    role: 'guest',
    isAuthenticated: false,
  };
}

/**
 * Standardized API Route protection wrapper.
 * Returns 401 if unauthenticated or 403 if required role is missing.
 */
export function withApiAuth(
  requiredAccess: RouteAccess,
  handler: (req: NextRequest, authContext: ApiAuthContext, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any) => {
    const auth = await getAuthenticatedApiSession();

    if (!auth.isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Valid authentication session is required.',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    if (!isRoleAllowed(requiredAccess, auth.role)) {
      return NextResponse.json(
        {
          success: false,
          error: `Forbidden: Access requires ${requiredAccess} privileges.`,
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    return handler(req, auth, context);
  };
}
