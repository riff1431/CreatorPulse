import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { AUTH_ACCOUNTS } from "./lib/auth/users";
import { getRouteAccess, isRoleAllowed, getRoleDefaultDestination } from "./lib/auth/route-config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseKey &&
    !supabaseUrl.includes('your-supabase')
  );
};

/**
 * Resolve user role & account status from cookies or AUTH_ACCOUNTS.
 */
function resolveUserIdentity(request: NextRequest, sessionCookie: string | undefined, roleCookie: string | undefined): { role: string; status: string } {
  const profileCookieVal = request.cookies.get('creatorpulse_user_profile')?.value;
  let mockProfile = null;
  if (profileCookieVal) {
    try {
      mockProfile = JSON.parse(decodeURIComponent(profileCookieVal));
    } catch (e) {}
  }

  if (mockProfile && mockProfile.id === sessionCookie) {
    return {
      role: mockProfile.role || 'member',
      status: mockProfile.status || 'active',
    };
  }

  const matchedAccount = Object.values(AUTH_ACCOUNTS).find(u => u.id === sessionCookie);
  if (matchedAccount) {
    return {
      role: matchedAccount.role || 'member',
      status: matchedAccount.status || 'active',
    };
  }

  return {
    role: roleCookie || 'member',
    status: 'active',
  };
}

// ==========================================================================
// Next.js 16 Proxy (formerly Middleware)
// Server-side boundary interceptor using centralized Route Configuration.
// ==========================================================================
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Instantly pass static files, Next.js assets, API routes, and favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Resolve access level from centralized route config
  const access = getRouteAccess(pathname);

  // If public route (e.g., /c/[username], /p/[slug], /explore), bypass auth checks immediately
  if (access === 'public') {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const sessionCookie = request.cookies.get('creatorpulse_session')?.value;
  const roleCookie = request.cookies.get('creatorpulse_role')?.value;
  const isMockSession = Boolean(sessionCookie && sessionCookie.startsWith('user-'));

  let isAuthenticated = false;
  let userRole = 'guest';
  let userStatus = 'active';

  // 3. Resolve auth status via Supabase SSR or Mock Engine
  if (isSupabaseConfigured()) {
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseKey!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      isAuthenticated = true;
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single();
      userRole = profile?.role || 'member';
      userStatus = profile?.status || 'active';
    } else if (isMockSession) {
      isAuthenticated = true;
      const identity = resolveUserIdentity(request, sessionCookie, roleCookie);
      userRole = identity.role;
      userStatus = identity.status;
    }
  } else {
    // Sandbox / Mock Engine
    if (isMockSession) {
      isAuthenticated = true;
      const identity = resolveUserIdentity(request, sessionCookie, roleCookie);
      userRole = identity.role;
      userStatus = identity.status;
    }
  }

  // 4. Handle Account Blockage (suspended / banned)
  if (isAuthenticated && (userStatus === 'suspended' || userStatus === 'banned')) {
    const isTargetingAdmin = pathname.startsWith('/admin');
    const loginUrl = new URL(isTargetingAdmin ? '/admin/login' : '/auth/login', request.url);
    loginUrl.searchParams.set('reason', 'blocked');
    const blockResponse = NextResponse.redirect(loginUrl);
    blockResponse.cookies.delete('creatorpulse_role');
    blockResponse.cookies.delete('creatorpulse_session');
    blockResponse.cookies.delete('creatorpulse_user_profile');
    return blockResponse;
  }

  // 5. Handle Guest-Only Routes (e.g. /, /auth/login, /auth/signup, /login, /signup)
  if (access === 'guest') {
    if (isAuthenticated) {
      const destination = getRoleDefaultDestination(userRole);
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return response;
  }

  // 6. Handle Protected Routes (authenticated, creator, moderator, admin, super_admin)
  if (!isAuthenticated) {
    const isTargetingAdmin = pathname.startsWith('/admin');
    const loginUrl = new URL(isTargetingAdmin ? '/admin/login' : '/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role authorization against route access rule
  if (!isRoleAllowed(access, userRole)) {
    const forbiddenUrl = new URL('/403', request.url);
    forbiddenUrl.searchParams.set('required', access);
    forbiddenUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(forbiddenUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
