export interface ThemeTokens {
  primary: string;         // e.g. #EC4899
  primaryHover: string;    // e.g. #DB2777
  softPrimary: string;     // e.g. #FCE7F3
  lightPrimary: string;    // e.g. #FDF2F8
  accent: string;          // e.g. #F43F5E
  background: string;      // e.g. #FFF9FC
  surface: string;         // e.g. #FFFFFF
  surfaceSecondary: string;// e.g. #FFF1F7
  border: string;          // e.g. #F3DCE8
  textPrimary: string;     // e.g. #18181B
  textSecondary: string;   // e.g. #71717A
  textMuted: string;       // e.g. #A1A1AA
  cardRadius: string;      // e.g. 20px
  buttonRadius: string;    // e.g. 14px
  fontFamily: string;      // e.g. 'Plus Jakarta Sans', sans-serif
  fontHeading?: string;    // e.g. 'Plus Jakarta Sans', sans-serif
  isDark: boolean;
}

export interface ThemeVisualSettings {
  logoUrl?: string;
  faviconUrl?: string;
  containerWidth: 'max-w-6xl' | 'max-w-7xl' | 'max-w-full';
  buttonStyle: 'gradient-glow' | 'flat-solid' | 'soft-glass' | 'outline-neo';
  animationIntensity: 'off' | 'subtle' | 'normal' | 'playful';
  cardShadow: 'soft-pink' | 'elevated' | 'glow' | 'flat';
  spacing?: 'compact' | 'standard' | 'cozy' | 'spacious';
  sidebarPlacement?: 'left' | 'right';
  headerStyle?: 'fixed' | 'floating' | 'simple';
}

export interface ThemeChangelog {
  version: string;
  date: string;
  changes: string[];
}

export interface ThemeAssets {
  fonts?: string[];
  cssOverrides?: string;
}

export type ThemePageName =
  | 'LandingPage'
  | 'LoginPage'
  | 'SignupPage'
  | 'FeedPage'
  | 'CreatorDashboardPage'
  | 'CreatorProfilePage'
  | 'SinglePostPage'
  | 'MessagesPage'
  | 'NotificationsPage'
  | 'ShortsPage'
  | 'ExplorePage'
  | 'SavedPage'
  | 'BalancePage';

export type ThemeLayoutName =
  | 'MainLayout'
  | 'CreatorLayout'
  | 'AuthLayout'
  | 'MinimalLayout';

export type ThemeComponentName =
  | 'Navbar'
  | 'Sidebar'
  | 'Footer'
  | 'MobileNav'
  | 'PostCard'
  | 'StoryBar'
  | 'CreatorHeader'
  | 'CreatorSidebar'
  | 'Button'
  | 'Card'
  | 'Avatar'
  | 'Badge'
  | 'Modal'
  | 'Toast'
  | 'Sparkline'
  | 'RoleSwitcher';

export interface ThemeOverridesManifest {
  pages?: ThemePageName[];
  layouts?: ThemeLayoutName[];
  components?: ThemeComponentName[];
}

export interface ThemeOverrideItemReport<T extends string = string> {
  name: T;
  status: 'overridden' | 'fallback_default';
  isCustom?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export interface ThemeOverrideValidationResult {
  isValid: boolean;
  themeId: string;
  themeSlug: string;
  themeName: string;
  overrides: {
    pages: ThemeOverrideItemReport<ThemePageName>[];
    layouts: ThemeOverrideItemReport<ThemeLayoutName>[];
    components: ThemeOverrideItemReport<ThemeComponentName>[];
  };
  summary: {
    totalOverridden: number;
    totalFallback: number;
    hasErrors: boolean;
  };
  errors: string[];
  warnings: string[];
}

export interface ThemeManifest {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  authorUrl?: string;
  previewImageUrl: string;
  category: 'Modern Light' | 'Dark Cyber' | 'Frosted Pastel' | 'Warm Vibrant' | 'Luxury Dark';
  tags: string[];
  minAppVersion: string;
  tokens: ThemeTokens;
  settings: ThemeVisualSettings;
  assets?: ThemeAssets;
  overrides?: ThemeOverridesManifest;
  changelog: ThemeChangelog[];
  isDefault?: boolean;     // True for "Default Theme" / "Blush Core" (permanently protected)
  isCustom?: boolean;
  isActive?: boolean;
  hasUpdate?: boolean;
  latestVersion?: string;
  isLibraryItem?: boolean;
  requiresLicense?: boolean;
  licenseKey?: string;
  dependencies?: { plugins?: Record<string, string> };
  licenseStatus?: 'licensed' | 'unlicensed' | 'exempt';
  installedAt: string;
  updatedAt: string;
  customizations?: {
    tokens?: Partial<ThemeTokens>;
    settings?: Partial<ThemeVisualSettings>;
  };
}

export interface ThemeBackup {
  id: string;
  themeId: string;
  themeName: string;
  version: string;
  timestamp: string;
  tokens: ThemeTokens;
  settings: ThemeVisualSettings;
  manifest: ThemeManifest;
}

export interface ThemeCustomizerDraft {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  cardRadius: string;
  buttonRadius: string;
  fontFamily: string;
  logoUrl?: string;
  faviconUrl?: string;
  containerWidth: 'max-w-6xl' | 'max-w-7xl' | 'max-w-full';
  buttonStyle: 'gradient-glow' | 'flat-solid' | 'soft-glass' | 'outline-neo';
  animationIntensity: 'off' | 'subtle' | 'normal' | 'playful';
  cardShadow: 'soft-pink' | 'elevated' | 'glow' | 'flat';
  spacing: 'compact' | 'standard' | 'cozy' | 'spacious';
  sidebarPlacement: 'left' | 'right';
  headerStyle: 'fixed' | 'floating' | 'simple';
}
