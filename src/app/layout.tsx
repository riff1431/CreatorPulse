import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ThemeProvider } from "@/lib/extensions/theme-engine";
import { PluginProvider } from "@/lib/extensions/plugin-engine";
import { SiteSettingsProvider } from "@/lib/settings/site-settings-context";
import { NavigationProvider } from "@/lib/navigation/navigation-context";
import { CMSProvider } from "@/lib/cms/cms-context";
import { AnnouncementProvider } from "@/lib/notifications/announcement-context";
import { FeatureModuleProvider } from "@/lib/modules/feature-module-context";
import { ToastProvider } from "@/components/ui/Toast";
import { AnnouncementBanner } from "@/components/announcements/AnnouncementBanner";
import { AnnouncementModal } from "@/components/announcements/AnnouncementModal";
import { MaintenanceOverlay } from "@/components/common/MaintenanceOverlay";
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AUTH_ACCOUNTS } from "@/lib/auth/users";
import { UserProfile } from "@/lib/supabase/store";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CreatorPulse — Premium Creator Platform & Community",
  description: "A modern, elegant membership-based platform for creators, educators, coaches, and communities.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const profileCookieVal = cookieStore.get('creatorpulse_user_profile')?.value;
  const sessionCookieVal = cookieStore.get('creatorpulse_session')?.value;

  let initialUser: UserProfile | null = null;
  let initialRole = 'guest';

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
        initialUser = {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          username: profile.username,
          avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.username}`,
          coverUrl: profile.cover_url,
          bio: profile.bio || '',
          role: profile.role || 'member',
          isVerified: profile.is_verified,
          status: (profile.status || 'active') as 'active' | 'suspended' | 'banned',
          createdAt: profile.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : ''
        };
        initialRole = profile.role || 'member';
      }
    }
  }

  // 2. If no live user, check if we have a mock session cookie
  if (!initialUser && sessionCookieVal && sessionCookieVal.startsWith('user-')) {
    if (profileCookieVal) {
      try {
        const mockProfile = JSON.parse(decodeURIComponent(profileCookieVal)) as UserProfile;
        if (mockProfile && mockProfile.id === sessionCookieVal) {
          initialUser = mockProfile;
          initialRole = mockProfile.role || 'member';
        }
      } catch (e) {}
    }
    
    if (!initialUser) {
      const matchedAccount = Object.values(AUTH_ACCOUNTS).find(u => u.id === sessionCookieVal);
      if (matchedAccount) {
        initialUser = {
          id: matchedAccount.id,
          email: matchedAccount.email,
          fullName: matchedAccount.fullName,
          username: matchedAccount.username,
          avatarUrl: matchedAccount.avatarUrl,
          coverUrl: matchedAccount.coverUrl,
          bio: matchedAccount.bio,
          role: matchedAccount.role,
          isVerified: matchedAccount.isVerified,
          status: matchedAccount.status,
          createdAt: matchedAccount.createdAt
        };
        initialRole = matchedAccount.role;
      }
    }
  }

  // 3. Fallback to default member autologin (mock mode sandbox only)
  if (!initialUser) {
    const loggedOut = cookieStore.get('creatorpulse_logged_out')?.value;
    const hasSupabase = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase')
    );

    if (!hasSupabase && loggedOut !== 'true') {
      const defaultMember = AUTH_ACCOUNTS['fan@creatorpulse.com'] || AUTH_ACCOUNTS['alex@community.io'];
      if (defaultMember) {
        initialUser = {
          id: defaultMember.id,
          email: defaultMember.email,
          fullName: defaultMember.fullName,
          username: defaultMember.username,
          avatarUrl: defaultMember.avatarUrl,
          coverUrl: defaultMember.coverUrl,
          bio: defaultMember.bio,
          role: defaultMember.role,
          isVerified: defaultMember.isVerified,
          status: defaultMember.status,
          createdAt: defaultMember.createdAt
        };
        initialRole = defaultMember.role;
      }
    }
  }

  return (
    <html lang="en" className={`${plusJakartaSans.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FFF9FC] text-[#18181B] selection:bg-[#FCE7F3] selection:text-[#DB2777]">
        <SiteSettingsProvider>
          <NavigationProvider>
            <CMSProvider>
              <AnnouncementProvider>
                <FeatureModuleProvider>
                  <ThemeProvider>
                    <PluginProvider>
                      <AuthProvider initialUser={initialUser} initialRole={initialRole}>
                        <ToastProvider>
                          <AnnouncementBanner />
                          <MaintenanceOverlay />
                          <AnnouncementModal />
                          {children}
                        </ToastProvider>
                      </AuthProvider>
                    </PluginProvider>
                  </ThemeProvider>
                </FeatureModuleProvider>
              </AnnouncementProvider>
            </CMSProvider>
          </NavigationProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
