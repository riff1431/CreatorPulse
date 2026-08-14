import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

    // Check if they are logged in via local mock fallback (e.g. for test credentials)
    const sessionCookie = request.cookies.get('creatorpulse_session')?.value;
    const roleCookie = request.cookies.get('creatorpulse_role')?.value;
    const isMockSession = sessionCookie && ['user-admin', 'user-superadmin', 'user-moderator', 'user-creator-1', 'user-creator-2', 'user-member', 'user-suspended'].includes(sessionCookie);

    // Guard login/signup from authenticated users
    if ((user || isMockSession) && isAuthRoute) {
      const activeRole = roleCookie || 'member';
      let dest = '/feed';
      if (activeRole === 'admin' || activeRole === 'super_admin') {
        dest = '/admin/dashboard';
      } else if (activeRole === 'creator') {
        dest = '/creator/dashboard';
      }
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // Guard protected app views from guest users
    if (!user && !isMockSession && !isAuthRoute && !isLandingPage) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Perform role-based check for active users
    if ((user || isMockSession) && !isLandingPage && !isAuthRoute) {
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
        userRole = roleCookie || 'member';
        if (sessionCookie === 'user-suspended') {
          userStatus = 'suspended';
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
    const sessionCookie = request.cookies.get('creatorpulse_session')?.value;
    const roleCookie = request.cookies.get('creatorpulse_role')?.value || 'guest';

    // Guard login/signup from authenticated users
    if (sessionCookie && isAuthRoute) {
      let dest = '/feed';
      if (roleCookie === 'admin' || roleCookie === 'super_admin') {
        dest = '/admin/dashboard';
      } else if (roleCookie === 'creator') {
        dest = '/creator/dashboard';
      }
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // Guard protected app views from guest users
    if (!sessionCookie && !isAuthRoute && !isLandingPage) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role restrictions for mock session
    if (sessionCookie && !isLandingPage && !isAuthRoute) {
      // Mock account status check (e.g. check ID of the suspended mock user)
      if (sessionCookie === 'user-suspended') {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('reason', 'blocked');
        const blockResponse = NextResponse.redirect(loginUrl);
        blockResponse.cookies.delete('creatorpulse_role');
        blockResponse.cookies.delete('creatorpulse_session');
        return blockResponse;
      }

      // Restrict Admin portal
      if (pathname.startsWith('/admin')) {
        if (roleCookie !== 'admin' && roleCookie !== 'super_admin') {
          return NextResponse.redirect(new URL('/feed?reason=unauthorized', request.url));
        }
      }

      // Restrict Creator portal
      if (pathname.startsWith('/creator')) {
        if (roleCookie !== 'creator' && roleCookie !== 'admin' && roleCookie !== 'super_admin') {
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
