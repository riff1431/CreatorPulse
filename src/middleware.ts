import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get('creatorpulse_role')?.value;

  // Let static assets, auth routes, and public landing pass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname === '/'
  ) {
    return await updateSession(request);
  }

  // Update session
  const response = await updateSession(request);

  // If no role cookie exists yet, set default to member for seamless exploration
  if (!roleCookie) {
    response.cookies.set('creatorpulse_role', 'member', {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
