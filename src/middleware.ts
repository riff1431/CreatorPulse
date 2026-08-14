import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { AUTH_ACCOUNTS } from "./lib/auth/users";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseKey &&
    !supabaseUrl.includes('your-supabase')
  );
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets immediately
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isAuthRoute = pathname.startsWith('/auth');
  const isLandingPage = pathname === '/';
  
  // Create Response object so we can append cookies if needed
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const sessionCookie = request.cookies.get('creatorpulse_session')?.value;
  const roleCookie = request.cookies.get('creatorpulse_role')?.value;
  const isMockSession = Boolean(sessionCookie && sessionCookie.startsWith('user-'));

  if (isSupabaseConfigured()) {
    // ==========================================
    // LIVE SUPABASE AUTH GUARD
    // ==========================================
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseKey!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Retrieve authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    const isAuthenticated = Boolean(user || isMockSession);

    // Guard login/signup from authenticated users
    if (isAuthenticated && isAuthRoute) {
      let userRole = 'member';
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        userRole = profile?.role || 'member';
      } else {
        const profileCookieVal = request.cookies.get('creatorpulse_user_profile')?.value;
        let mockProfile = null;
        if (profileCookieVal) {
          try {
            mockProfile = JSON.parse(decodeURIComponent(profileCookieVal));
          } catch (e) {}
        }
        userRole = mockProfile?.role || roleCookie || 'member';
      }

      let dest = '/feed';
      if (userRole === 'admin' || userRole === 'super_admin') {
        dest = '/admin/dashboard';
      } else if (userRole === 'creator') {
        dest = '/creator/dashboard';
      }
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // Guard protected app views from guest users
    if (!isAuthenticated && !isAuthRoute && !isLandingPage) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Perform role-based check for active users
    if (isAuthenticated && !isLandingPage && !isAuthRoute) {
      let userRole = 'member';
      let userStatus = 'active';

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status')
          .eq('id', user.id)
          .single();
        userRole = profile?.role || 'member';
        userStatus = profile?.status || 'active';
      } else {
        // Read role from user profile cookie or AUTH_ACCOUNTS to prevent role spoofing
        const profileCookieVal = request.cookies.get('creatorpulse_user_profile')?.value;
        let mockProfile = null;
        if (profileCookieVal) {
          try {
            mockProfile = JSON.parse(decodeURIComponent(profileCookieVal));
          } catch (e) {}
        }

        if (mockProfile && mockProfile.id === sessionCookie) {
          userRole = mockProfile.role || 'member';
          userStatus = mockProfile.status || 'active';
        } else {
          const matchedAccount = Object.values(AUTH_ACCOUNTS).find(u => u.id === sessionCookie);
          if (matchedAccount) {
            userRole = matchedAccount.role || 'member';
            userStatus = matchedAccount.status || 'active';
          } else {
            userRole = roleCookie || 'member';
          }
        }
      }

      // Block suspended or banned accounts
      if (userStatus === 'suspended' || userStatus === 'banned') {
        if (user) await supabase.auth.signOut();
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('reason', 'blocked');
        
        // Clean session cookies
        const blockResponse = NextResponse.redirect(loginUrl);
        blockResponse.cookies.delete('creatorpulse_role');
        blockResponse.cookies.delete('creatorpulse_session');
        blockResponse.cookies.delete('creatorpulse_user_profile');
        return blockResponse;
      }

      // Restrict Admin portal
      if (pathname.startsWith('/admin')) {
        if (userRole !== 'admin' && userRole !== 'super_admin') {
          return NextResponse.redirect(new URL('/feed?reason=unauthorized', request.url));
        }
      }

      // Restrict Creator portal
      if (pathname.startsWith('/creator')) {
        if (userRole !== 'creator' && userRole !== 'admin' && userRole !== 'super_admin') {
          return NextResponse.redirect(new URL('/feed?reason=unauthorized', request.url));
        }
      }
    }
  } else {
    // ==========================================
    // MOCK REACTIVE AUTH ENGINE GUARD (SANDBOX)
    // ==========================================
    const isAuthenticated = isMockSession;

    // Guard login/signup from authenticated users
    if (isAuthenticated && isAuthRoute) {
      const profileCookieVal = request.cookies.get('creatorpulse_user_profile')?.value;
      let mockProfile = null;
      if (profileCookieVal) {
        try {
          mockProfile = JSON.parse(decodeURIComponent(profileCookieVal));
        } catch (e) {}
      }
      const userRole = mockProfile?.role || roleCookie || 'member';

      let dest = '/feed';
      if (userRole === 'admin' || userRole === 'super_admin') {
        dest = '/admin/dashboard';
      } else if (userRole === 'creator') {
        dest = '/creator/dashboard';
      }
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // Guard protected app views from guest users
    if (!isAuthenticated && !isAuthRoute && !isLandingPage) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role restrictions for mock session
    if (isAuthenticated && !isLandingPage && !isAuthRoute) {
      let userRole = 'member';
      let userStatus = 'active';

      // Read role from user profile cookie or AUTH_ACCOUNTS to prevent role spoofing
      const profileCookieVal = request.cookies.get('creatorpulse_user_profile')?.value;
      let mockProfile = null;
      if (profileCookieVal) {
        try {
          mockProfile = JSON.parse(decodeURIComponent(profileCookieVal));
        } catch (e) {}
      }

      if (mockProfile && mockProfile.id === sessionCookie) {
        userRole = mockProfile.role || 'member';
        userStatus = mockProfile.status || 'active';
      } else {
        const matchedAccount = Object.values(AUTH_ACCOUNTS).find(u => u.id === sessionCookie);
        if (matchedAccount) {
          userRole = matchedAccount.role || 'member';
          userStatus = matchedAccount.status || 'active';
        } else {
          userRole = roleCookie || 'member';
        }
      }

      // Mock account status check
      if (userStatus === 'suspended' || userStatus === 'banned') {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('reason', 'blocked');
        const blockResponse = NextResponse.redirect(loginUrl);
        blockResponse.cookies.delete('creatorpulse_role');
        blockResponse.cookies.delete('creatorpulse_session');
        blockResponse.cookies.delete('creatorpulse_user_profile');
        return blockResponse;
      }

      // Restrict Admin portal
      if (pathname.startsWith('/admin')) {
        if (userRole !== 'admin' && userRole !== 'super_admin') {
          return NextResponse.redirect(new URL('/feed?reason=unauthorized', request.url));
        }
      }

      // Restrict Creator portal
      if (pathname.startsWith('/creator')) {
        if (userRole !== 'creator' && userRole !== 'admin' && userRole !== 'super_admin') {
          return NextResponse.redirect(new URL('/feed?reason=unauthorized', request.url));
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
