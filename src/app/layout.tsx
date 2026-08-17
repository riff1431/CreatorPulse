import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ThemeProvider } from "@/lib/extensions/theme-engine";
import { PluginProvider } from "@/lib/extensions/plugin-engine";
import { SiteSettingsProvider } from "@/lib/settings/site-settings-context";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { NavigationProvider } from "@/lib/navigation/navigation-context";
import { CMSProvider } from "@/lib/cms/cms-context";
import { AnnouncementProvider } from "@/lib/notifications/announcement-context";
import { NotificationPreferencesProvider } from "@/lib/notifications/notification-preferences-context";
import { FeatureModuleProvider } from "@/lib/modules/feature-module-context";
import { StorageProvider } from "@/lib/storage/storage-context";
import { ToastProvider } from "@/components/ui/Toast";
import { AnnouncementBanner } from "@/components/announcements/AnnouncementBanner";
import { AnnouncementModal } from "@/components/announcements/AnnouncementModal";
import { MaintenanceOverlay } from "@/components/common/MaintenanceOverlay";
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AUTH_ACCOUNTS } from "@/lib/auth/users";
import { UserProfile } from "@/lib/supabase/store";

import { AutoRouteGuard } from "@/components/auth/RouteGuards";
import { RequireAuthProvider } from "@/components/auth/LoginRequiredModal";
import { SavedProvider } from "@/lib/saved/saved-context";
import { HistoryProvider } from "@/lib/history/history-context";

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = '/favicon.ico';
  let siteName = 'CreatorPulse';
  let tagline = 'A premium creator membership and community platform.';

  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data: settings } = await supabase
        .from('site_settings')
        .select('favicon_url, site_name, tagline')
        .eq('id', 1)
        .single();
      
      if (settings) {
        if (settings.favicon_url) {
          faviconUrl = settings.favicon_url;
        }
        if (settings.site_name) {
          siteName = settings.site_name;
        }
        if (settings.tagline) {
          tagline = settings.tagline;
        }
      }
    }
  } catch (e) {
    console.error('Error in generateMetadata:', e);
  }

  return {
    title: {
      default: `${siteName} — ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description: "A modern, elegant membership-based platform for creators, educators, coaches, and communities.",
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    }
  };
}


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
    <html lang="en" className="font-sans h-full antialiased">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var isAd = window.location.pathname.startsWith('/admin');
                  if (isAd) {
                    var pref = localStorage.getItem('creatorpulse_admin_theme_preference') || 'system';
                    var dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                    if (dark) {
                      document.documentElement.classList.add('admin-dark');
                    } else {
                      document.documentElement.classList.remove('admin-dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col selection:bg-[var(--color-soft-primary)] selection:text-[var(--color-primary-hover)]">
        <I18nProvider>
          <SiteSettingsProvider>
            <StorageProvider>
              <NavigationProvider>
                <CMSProvider>
                  <AnnouncementProvider>
                    <FeatureModuleProvider>
                      <ThemeProvider>
                        <PluginProvider>
                          <AuthProvider initialUser={initialUser} initialRole={initialRole}>
                            <NotificationPreferencesProvider>
                              <RequireAuthProvider>
                                <SavedProvider>
                                  <HistoryProvider>
                                    <ToastProvider>
                                      <AnnouncementBanner />
                                      <MaintenanceOverlay />
                                      <AnnouncementModal />
                                      <AutoRouteGuard>
                                        {children}
                                      </AutoRouteGuard>
                                    </ToastProvider>
                                  </HistoryProvider>
                                </SavedProvider>
                              </RequireAuthProvider>
                            </NotificationPreferencesProvider>
                          </AuthProvider>
                        </PluginProvider>
                      </ThemeProvider>
                    </FeatureModuleProvider>
                  </AnnouncementProvider>
                </CMSProvider>
              </NavigationProvider>
            </StorageProvider>
          </SiteSettingsProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
