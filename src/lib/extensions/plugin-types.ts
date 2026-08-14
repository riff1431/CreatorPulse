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

export interface PluginSettingField {
  id: string;
  label: string;
  description?: string;
  type: 'text' | 'password' | 'number' | 'boolean' | 'select' | 'textarea';
  defaultValue: any;
  options?: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
}

export interface PluginChangelog {
  version: string;
  date: string;
  changes: string[];
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
  settingsValues: Record<string, any>;
  changelog: PluginChangelog[];
  isEnabled: boolean;
  autoUpdate: boolean;
  hasUpdate?: boolean;
  latestVersion?: string;
  installedAt: string;
  updatedAt: string;
  hasError?: boolean;
  errorMessage?: string;
}

export interface AuditLogEntry {
  id: string;
  action: 'THEME_ACTIVATED' | 'THEME_INSTALLED' | 'THEME_CUSTOMIZED' | 'THEME_DELETED' | 'THEME_ROLLBACK' |
          'PLUGIN_ACTIVATED' | 'PLUGIN_DEACTIVATED' | 'PLUGIN_INSTALLED' | 'PLUGIN_UPDATED' | 'PLUGIN_CONFIG_SAVED' | 'PLUGIN_ERROR';
  entityType: 'theme' | 'plugin' | 'system';
  entityName: string;
  details: string;
  user: string;
  role: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}
