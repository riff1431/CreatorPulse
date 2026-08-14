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

    // Guard login/signup from authenticated users
    if (user && isAuthRoute) {
      // Fetch user profile to route to correct dashboard
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      const role = profile?.role || 'member';
      let dest = '/feed';
      if (role === 'admin' || role === 'super_admin') {
        dest = '/admin/dashboard';
      } else if (role === 'creator') {
        dest = '/creator/dashboard';
      }
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // Guard protected app views from guest users
    if (!user && !isAuthRoute && !isLandingPage) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Perform role-based check for active users
    if (user && !isLandingPage && !isAuthRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single();

      const userRole = profile?.role || 'member';
      const userStatus = profile?.status || 'active';

      // Block suspended or banned accounts
      if (userStatus === 'suspended' || userStatus === 'banned') {
        // Sign out on backend
        await supabase.auth.signOut();
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
