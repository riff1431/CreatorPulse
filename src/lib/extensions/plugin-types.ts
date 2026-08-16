export type PluginHookType =
  | 'navbar_actions'
  | 'sidebar_extra_links'
  | 'post_card_footer'
  | 'post_card_header'
  | 'creator_dashboard_widgets'
  | 'member_dashboard_widgets'
  | 'payment_gateway_methods'
  | 'before_post_publish'
  | 'after_user_signup';

export type PluginPermission =
  | 'storage_access'
  | 'payment_hooks'
  | 'network_requests'
  | 'media_transform'
  | 'notifications_send'
  | 'security_audit'
  | 'ai_service';

export type PluginSettingFieldType =
  | 'text'
  | 'password'
  | 'api_key'
  | 'number'
  | 'boolean'
  | 'toggle'
  | 'select'
  | 'radio'
  | 'textarea'
  | 'media'
  | 'color'
  | 'repeater';

export type PluginSettingValidateType = 'nonempty' | 'url' | 'email' | 'domain';

export interface PluginSettingOption {
  label: string;
  value: string;
  description?: string;
  icon?: string;
}

export interface PluginRepeaterSubField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'color';
  placeholder?: string;
  options?: PluginSettingOption[];
  defaultValue?: unknown;
}

export interface PluginSettingField {
  id: string;
  label: string;
  description?: string;
  type: PluginSettingFieldType;
  defaultValue: unknown;
  options?: PluginSettingOption[];
  placeholder?: string;
  required?: boolean;
  validate?: PluginSettingValidateType;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  rows?: number;
  /** Used only for type: 'repeater' — defines the schema for each row */
  repeaterSchema?: PluginRepeaterSubField[];
  /** Used only for type: 'repeater' — max number of rows allowed */
  maxRows?: number;
}

export interface PluginSettingsGroup {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  /** Field IDs that belong to this group */
  fieldIds: string[];
}

export interface PluginSidebarItem {
  /** Display label in the sidebar */
  label: string;
  /** Lucide icon name (e.g. "Star", "Zap") or emoji */
  icon: string;
  /** Route href — if omitted defaults to /admin/plugins/{slug}/settings */
  href?: string;
  /** Badge text */
  badge?: string;
  badgeVariant?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose' | 'slate';
}

export interface PluginAdminSettingsPage {
  /** Custom title for the settings page header */
  title?: string;
  /** Description shown below the header */
  description?: string;
  /** Required admin role to access this settings page */
  requiredPermission?: 'admin' | 'super_admin';
  /** If defined, this plugin appears as a dedicated item in the admin sidebar */
  sidebarItem?: PluginSidebarItem;
  /** Sidebar group to appear under — defaults to "Plugin Settings" */
  sidebarGroup?: string;
}

export interface PluginChangelog {
  version: string;
  date: string;
  changes: string[];
}

export interface PluginDatabaseMigration {
  version: string;
  description: string;
  sql?: string;
}

export interface PluginLifecycleMethods {
  onInstall?: string;
  onActivate?: string;
  onDeactivate?: string;
  onUpdate?: string;
  onUninstall?: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  authorUrl?: string;
  iconUrl: string;
  category: 'Monetization' | 'Security & DRM' | 'Marketing & SEO' | 'AI & Automation' | 'Community & Media';
  tags: string[];
  minAppVersion: string;
  permissions: PluginPermission[];
  hooks: PluginHookType[];
  settingsSchema: PluginSettingField[];
  settingsValues: Record<string, unknown>;
  /** Optional grouping of settings fields into tabs/sections */
  settingsGroups?: PluginSettingsGroup[];
  /** Declares a dedicated admin settings page and optional sidebar entry */
  adminSettingsPage?: PluginAdminSettingsPage;
  changelog: PluginChangelog[];
  lifecycle?: PluginLifecycleMethods;
  dependencies?: { plugins?: string[]; services?: string[] };
  databaseMigrations?: PluginDatabaseMigration[];
  /** Optional custom translations registered by the plugin (locale -> namespace -> key -> string) */
  translations?: Record<string, Record<string, Record<string, string>>>;
  isEnabled: boolean;
  autoUpdate: boolean;
  hasUpdate?: boolean;
  latestVersion?: string;
  installedAt: string;
  updatedAt: string;
  hasError?: boolean;
  errorMessage?: string;
  isLibraryItem?: boolean;
  requiresLicense?: boolean;
  licenseKey?: string;
  licenseStatus?: 'licensed' | 'unlicensed' | 'exempt';
}

export interface AuditLogEntry {
  id: string;
  action: 'THEME_ACTIVATED' | 'THEME_INSTALLED' | 'THEME_CUSTOMIZED' | 'THEME_DELETED' | 'THEME_ROLLBACK' |
          'PLUGIN_ACTIVATED' | 'PLUGIN_DEACTIVATED' | 'PLUGIN_INSTALLED' | 'PLUGIN_UPDATED' | 'PLUGIN_DELETED' | 'PLUGIN_CONFIG_SAVED' | 'PLUGIN_ERROR' |
          'USER_MODERATION' | 'USER_DELETED' | (string & {});
  entityType: 'theme' | 'plugin' | 'system' | 'user' | (string & {});
  entityName: string;
  details: string;
  user: string;
  role: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

export interface PluginBackup {
  id: string;
  pluginId: string;
  pluginName: string;
  version: string;
  backupDate: string;
  manifest: PluginManifest;
}
