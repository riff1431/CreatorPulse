// Domain Types & Models Barrel Export

// Auth & Users
export type { UserProfile, CreatorProfile, UserRole } from '@/lib/supabase/store';

// Feed, Content & Media
export type { Post, Story, Reel, MembershipPlan, SubscriptionItem, Comment, PollOption } from '@/lib/supabase/store';

// Payments, Commerce & Ledger
export type { PayoutRequest, TransactionRecord } from '@/lib/supabase/store';

// Theme Engine & Visual Styling
export type {
  ThemeManifest,
  ThemeTokens,
  ThemeVisualSettings,
  ThemeBackup,
  ThemeAssets
} from '@/lib/extensions/theme-types';

// Plugin Engine & Add-ons
export type {
  PluginManifest,
  PluginPermission,
  PluginSettingField,
  PluginLifecycleMethods
} from '@/lib/extensions/plugin-types';

// Storage & Filesystem
export type {
  StorageDriverType,
  StorageCategoryFolder,
  StorageConfig,
  StoredFile,
  StorageStats,
  StorageTestResult
} from '@/lib/storage/storage-types';

// CMS & Static Pages
export type { CMSPage } from '@/lib/cms/cms-context';

// Navigation & Menus
export type { NavItemDef } from '@/lib/navigation/navigation-context';

// System Announcements
export type { Announcement } from '@/lib/notifications/announcement-context';

// Feature Modules
export type { FeatureModule } from '@/lib/modules/feature-module-context';

// Site Settings
export type { SiteSettings, SocialLinks, SEODefaults } from '@/lib/settings/site-settings-context';
