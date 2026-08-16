import { ThemeManifest } from './theme-types';
import { PluginManifest, AuditLogEntry } from './plugin-types';
import contentModerationManifest from '@plugins/content-moderation/manifest.json';
import creatorVerificationManifest from '@plugins/creator-verification/manifest.json';
import seoSocialManifest from '@plugins/seo-social/manifest.json';
import telegramSyncManifest from '@plugins/telegram-sync/manifest.json';
import starterPluginManifest from '@plugins/starter-plugin/manifest.json';

export const DEFAULT_THEMES: ThemeManifest[] = [
  {
    id: 'theme-default-theme',
    name: 'Official Default Theme',
    slug: 'default-theme',
    description: 'The official built-in creator-platform default theme featuring radiant blush hues, editorial typography, full responsive layouts, and rich interactive components.',
    version: '1.0.0',
    author: 'CreatorPulse Core Team',
    authorUrl: 'https://creatorpulse.com',
    previewImageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600',
    category: 'Modern Light',
    tags: ['Official', 'Default Theme', 'Built-in', 'Responsive', 'Blush'],
    minAppVersion: '1.0.0',
    isDefault: true, // Permanently protected default theme
    isActive: true,
    installedAt: '2026-08-01',
    updatedAt: '2026-08-15',
    tokens: {
      primary: '#EC4899',
      primaryHover: '#DB2777',
      softPrimary: '#FCE7F3',
      lightPrimary: '#FDF2F8',
      accent: '#F43F5E',
      background: '#FFF9FC',
      surface: '#FFFFFF',
      surfaceSecondary: '#FFF1F7',
      border: '#F3DCE8',
      textPrimary: '#18181B',
      textSecondary: '#71717A',
      textMuted: '#A1A1AA',
      cardRadius: '20px',
      buttonRadius: '14px',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      isDark: false
    },
    settings: {
      containerWidth: 'max-w-7xl',
      buttonStyle: 'gradient-glow',
      animationIntensity: 'normal',
      cardShadow: 'soft-pink'
    },
    changelog: [
      { version: '1.0.0', date: '2026-08-15', changes: ['Converted entire frontend UI into the official built-in Default Theme'] }
    ]
  },
  {
    id: 'theme-starter-theme',
    name: 'Starter Theme Template',
    slug: 'starter-theme',
    description: 'Clean, fully commented official Theme SDK starter template for creating custom CreatorPulse themes.',
    version: '1.0.0',
    author: 'Your Studio / Developer Name',
    authorUrl: 'https://yourwebsite.com',
    previewImageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600',
    category: 'Modern Light',
    tags: ['Starter', 'Developer', 'Template', 'SDK'],
    minAppVersion: '1.0.0',
    isDefault: false,
    isActive: false,
    installedAt: '2026-08-15',
    updatedAt: '2026-08-15',
    tokens: {
      primary: '#3B82F6',
      primaryHover: '#2563EB',
      softPrimary: '#DBEAFE',
      lightPrimary: '#EFF6FF',
      accent: '#F59E0B',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceSecondary: '#F1F5F9',
      border: '#E2E8F0',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      textMuted: '#94A3B8',
      cardRadius: '16px',
      buttonRadius: '10px',
      fontFamily: 'Inter, sans-serif',
      fontHeading: 'Inter, sans-serif',
      isDark: false
    },
    settings: {
      containerWidth: 'max-w-7xl',
      buttonStyle: 'gradient-glow',
      animationIntensity: 'normal',
      cardShadow: 'elevated'
    },
    changelog: [
      { version: '1.0.0', date: '2026-08-15', changes: ['Initial starter theme template'] }
    ]
  }
];

export const THEME_LIBRARY_CATALOG: ThemeManifest[] = [
  {
    id: 'theme-emerald-oasis',
    name: 'Emerald Oasis',
    slug: 'emerald-oasis',
    description: 'Refreshing botanical aesthetic with lush mint greens, emerald highlights, and crisp organic surfaces.',
    version: '1.2.0',
    author: 'Botanica Design Co',
    authorUrl: 'https://botanica.design',
    previewImageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600',
    category: 'Modern Light',
    tags: ['Emerald', 'Mint', 'Nature', 'Organic'],
    minAppVersion: '1.0.0',
    isLibraryItem: true,
    installedAt: '2026-08-14',
    updatedAt: '2026-08-14',
    tokens: {
      primary: '#10B981',
      primaryHover: '#059669',
      softPrimary: '#D1FAE5',
      lightPrimary: '#ECFDF5',
      accent: '#06B6D4',
      background: '#F7FDF9',
      surface: '#FFFFFF',
      surfaceSecondary: '#ECFDF5',
      border: '#A7F3D0',
      textPrimary: '#064E3B',
      textSecondary: '#047857',
      textMuted: '#6EE7B7',
      cardRadius: '22px',
      buttonRadius: '14px',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      isDark: false
    },
    settings: {
      containerWidth: 'max-w-7xl',
      buttonStyle: 'gradient-glow',
      animationIntensity: 'normal',
      cardShadow: 'soft-pink'
    },
    changelog: [
      { version: '1.2.0', date: '2026-08-14', changes: ['Initial official catalog release'] }
    ]
  },
  {
    id: 'theme-midnight-amethyst',
    name: 'Midnight Amethyst',
    slug: 'midnight-amethyst',
    description: 'Mystical dark UI with royal purple hues, glowing violet accents, and frosted glass cards.',
    version: '2.0.0',
    author: 'Aetheria Studio',
    authorUrl: 'https://aetheria.art',
    previewImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600',
    category: 'Dark Cyber',
    tags: ['Purple', 'Dark Mode', 'Violet', 'Cyber'],
    minAppVersion: '1.0.0',
    isLibraryItem: true,
    installedAt: '2026-08-14',
    updatedAt: '2026-08-14',
    tokens: {
      primary: '#A855F7',
      primaryHover: '#9333EA',
      softPrimary: '#3B0764',
      lightPrimary: '#1E0338',
      accent: '#F43F5E',
      background: '#0F0A1A',
      surface: '#1E1433',
      surfaceSecondary: '#2C1B4D',
      border: '#4C1D95',
      textPrimary: '#FAF5FF',
      textSecondary: '#D8B4FE',
      textMuted: '#A855F7',
      cardRadius: '24px',
      buttonRadius: '16px',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      isDark: true
    },
    settings: {
      containerWidth: 'max-w-7xl',
      buttonStyle: 'gradient-glow',
      animationIntensity: 'playful',
      cardShadow: 'glow'
    },
    changelog: [
      { version: '2.0.0', date: '2026-08-14', changes: ['High-contrast violet glow borders'] }
    ]
  },
  {
    id: 'theme-cherry-blossom',
    name: 'Sakura Blossom',
    slug: 'sakura-blossom',
    description: 'Delicate and serene Japanese cherry blossom aesthetic with pastel pink petals and warm white surfaces.',
    version: '1.1.0',
    author: 'Tokyo UI Guild',
    authorUrl: 'https://tokyoui.jp',
    previewImageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600',
    category: 'Frosted Pastel',
    tags: ['Sakura', 'Pastel', 'Japanese', 'Floral'],
    minAppVersion: '1.0.0',
    isLibraryItem: true,
    installedAt: '2026-08-14',
    updatedAt: '2026-08-14',
    tokens: {
      primary: '#FB7185',
      primaryHover: '#F43F5E',
      softPrimary: '#FFE4E6',
      lightPrimary: '#FFF1F2',
      accent: '#FDA4AF',
      background: '#FFF8FA',
      surface: '#FFFFFF',
      surfaceSecondary: '#FFF1F5',
      border: '#FECDD3',
      textPrimary: '#4C0519',
      textSecondary: '#9F1239',
      textMuted: '#E11D48',
      cardRadius: '20px',
      buttonRadius: '14px',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      isDark: false
    },
    settings: {
      containerWidth: 'max-w-6xl',
      buttonStyle: 'soft-glass',
      animationIntensity: 'subtle',
      cardShadow: 'soft-pink'
    },
    changelog: [
      { version: '1.1.0', date: '2026-08-14', changes: ['Enhanced soft petal gradients'] }
    ]
  }
];

export const DEFAULT_PLUGINS: PluginManifest[] = [
  contentModerationManifest as unknown as PluginManifest,
  creatorVerificationManifest as unknown as PluginManifest,
  seoSocialManifest as unknown as PluginManifest,
  telegramSyncManifest as unknown as PluginManifest,
  starterPluginManifest as unknown as PluginManifest,
  {
    id: 'plugin-content-scheduling',
    name: 'Content Scheduling & Auto-Publishing',
    slug: 'content-scheduling',
    description: 'Comprehensive auto-publishing and scheduling suite for creators to schedule posts, video reels, and 24h stories with calendar & queue views, timezone controls, background job processing, failure retries, notifications, and granular permission controls.',
    version: '1.0.0',
    author: 'CreatorPulse Core Team',
    authorUrl: 'https://creatorpulse.com',
    iconUrl: '📅',
    category: 'AI & Automation',
    tags: ['Scheduling', 'Auto-Publish', 'Calendar', 'Queue', 'Posts', 'Reels', 'Stories', 'Timezone', 'Background Jobs', 'Retries'],
    minAppVersion: '1.0.0',
    permissions: ['storage_access', 'notifications_send', 'security_audit'],
    hooks: ['creator_dashboard_widgets', 'member_dashboard_widgets', 'sidebar_extra_links', 'navbar_actions', 'before_post_publish'],
    isEnabled: true,
    autoUpdate: true,
    hasUpdate: false,
    installedAt: '2026-08-16',
    updatedAt: '2026-08-16',
    adminSettingsPage: {
      title: 'Content Scheduling & Auto-Publishing Settings',
      description: 'Configure publication worker check intervals, queue capacity limits, retry policies, default timezones, and automated notifications.',
      requiredPermission: 'admin',
      sidebarItem: {
        label: 'Content Scheduling',
        icon: 'Calendar',
        badge: 'Queue',
        badgeVariant: 'indigo',
        href: '/admin/plugins/content-scheduling/settings'
      }
    },
    settingsSchema: [
      { id: 'defaultTimezone', label: 'Default System Timezone', type: 'select', defaultValue: 'UTC', options: [{ label: 'UTC', value: 'UTC' }, { label: 'America/New_York', value: 'America/New_York' }, { label: 'Europe/London', value: 'Europe/London' }, { label: 'Asia/Tokyo', value: 'Asia/Tokyo' }, { label: 'Asia/Dhaka', value: 'Asia/Dhaka' }] },
      { id: 'maxQueueItemsPerCreator', label: 'Maximum Scheduled Items Per Creator', type: 'number', defaultValue: 50 },
      { id: 'cronCheckIntervalSeconds', label: 'Background Worker Check Interval (Seconds)', type: 'number', defaultValue: 30 },
      { id: 'maxRetryAttempts', label: 'Maximum Job Retry Attempts on Failure', type: 'number', defaultValue: 3 },
      { id: 'retryDelayMinutes', label: 'Retry Backoff Delay (Minutes)', type: 'number', defaultValue: 5 },
      { id: 'enableInAppNotifications', label: 'Send In-App Notifications on Publish / Failure', type: 'boolean', defaultValue: true }
    ],
    settingsValues: {
      defaultTimezone: 'UTC',
      maxQueueItemsPerCreator: 50,
      cronCheckIntervalSeconds: 30,
      maxRetryAttempts: 3,
      retryDelayMinutes: 5,
      enableInAppNotifications: true
    },
    databaseMigrations: [
      {
        version: '1.0.0',
        description: 'Creates plugin_scheduled_content and plugin_schedule_logs tables.',
        sql: '001_init.sql'
      }
    ],
    changelog: [
      {
        version: '1.0.0',
        date: '2026-08-16',
        changes: ['Initial release of Content Scheduling & Auto-Publishing Add-on Plugin.']
      }
    ]
  },
  {
    id: 'plugin-creator-analytics',
    name: 'Creator Analytics & Insights',
    slug: 'creator-analytics',
    description: 'Comprehensive analytics and insights add-on for creators and admins featuring profile views, follower growth, post/reel/story metrics, revenue trends, top content, date filters, SVG charts, exports, and aggregated admin analytics.',
    version: '1.0.0',
    author: 'CreatorPulse Analytics Studio',
    authorUrl: 'https://creatorpulse.com',
    iconUrl: '📊',
    category: 'Monetization',
    tags: ['Analytics', 'Insights', 'Profile Views', 'Followers', 'Subscribers', 'Revenue', 'Charts', 'Exports'],
    minAppVersion: '1.0.0',
    permissions: ['storage_access', 'notifications_send', 'security_audit'],
    hooks: ['creator_dashboard_widgets', 'sidebar_extra_links', 'navbar_actions'],
    isEnabled: true,
    autoUpdate: true,
    hasUpdate: false,
    installedAt: '2026-08-16',
    updatedAt: '2026-08-16',
    adminSettingsPage: {
      title: 'Creator Analytics & Insights Settings',
      description: 'Configure analytics tracking resolution, default date filters, CSV/JSON export defaults, and automated threshold alerts.',
      requiredPermission: 'admin',
      sidebarItem: {
        label: 'Creator Analytics',
        icon: 'BarChart3',
        badge: 'Analytics',
        badgeVariant: 'indigo',
        href: '/admin/plugins/creator-analytics/settings'
      }
    },
    settingsSchema: [
      {
        id: 'defaultDateRange',
        label: 'Default Dashboard Time Period',
        type: 'select',
        defaultValue: '30d',
        options: [
          { label: 'Last 7 Days', value: '7d', description: '7 day quick window' },
          { label: 'Last 30 Days', value: '30d', description: '30 day standard monthly window' },
          { label: 'Last 90 Days', value: '90d', description: 'Quarterly view' },
          { label: 'Last 12 Months', value: '12m', description: 'Annual overall view' }
        ]
      },
      {
        id: 'trackingResolution',
        label: 'Analytics Data Aggregation Resolution',
        type: 'select',
        defaultValue: 'daily',
        options: [
          { label: 'Real-time Hourly Tracking', value: 'hourly' },
          { label: 'Daily Snapshot Summary', value: 'daily' },
          { label: 'Weekly Batch Aggregation', value: 'weekly' }
        ]
      },
      {
        id: 'enableAdminAlerts',
        label: 'Enable High Traffic / Spike Notifications for Admins',
        type: 'toggle',
        defaultValue: true,
        description: 'Sends system notices when creator traffic or revenue spikes over 200%.'
      },
      {
        id: 'defaultExportFormat',
        label: 'Default Report Export Format',
        type: 'select',
        defaultValue: 'csv',
        options: [
          { label: 'CSV Spreadsheet File (.csv)', value: 'csv' },
          { label: 'Structured JSON Data (.json)', value: 'json' },
          { label: 'Print / PDF Report View', value: 'pdf' }
        ]
      },
      {
        id: 'cacheTTLSeconds',
        label: 'Analytics Cache Duration (Seconds)',
        type: 'number',
        defaultValue: 300,
        min: 0,
        max: 86400,
        description: 'Duration in seconds to cache aggregated chart data to optimize database load.'
      }
    ],
    settingsValues: {
      defaultDateRange: '30d',
      trackingResolution: 'daily',
      enableAdminAlerts: true,
      defaultExportFormat: 'csv',
      cacheTTLSeconds: 300
    },
    databaseMigrations: [
      {
        version: '1.0.0',
        description: 'Creates plugin_creator_analytics_events, daily_stats, and content_metrics tables.',
        sql: '001_init.sql'
      }
    ],
    changelog: [
      {
        version: '1.0.0',
        date: '2026-08-16',
        changes: [
          'Initial release of Creator Analytics & Insights Add-on Plugin.',
          'Implemented creator analytics dashboard (profile views, followers, subscribers, post/reel/story metrics, engagement rate, revenue trends, top content).',
          'Implemented admin aggregated analytics dashboard & creator leaderboards.',
          'Added interactive date filters, SVG visual charts, CSV/JSON report exports, database migrations, lifecycle hooks, and active status guards.'
        ]
      }
    ]
  },
  {
    id: 'plugin-drm-watermark',
    name: 'Digital Watermark & DRM Guard',
    slug: 'drm-watermark',
    description: 'Automatically applies dynamic copyright watermarks, username overlay stamps, and right-click protection to creator media.',
    version: '2.1.0',
    author: 'CreatorPulse Security Labs',
    authorUrl: 'https://creatorpulse.com',
    iconUrl: '🛡️',
    category: 'Security & DRM',
    tags: ['Security', 'Watermark', 'DRM', 'Anti-piracy'],
    minAppVersion: '1.0.0',
    permissions: ['media_transform', 'storage_access'],
    hooks: ['post_card_footer', 'creator_dashboard_widgets'],
    isEnabled: true,
    autoUpdate: true,
    hasUpdate: false,
    installedAt: '2026-08-01',
    updatedAt: '2026-08-13',
    settingsSchema: [
      { id: 'watermarkText', label: 'Default Watermark Text', type: 'text', defaultValue: '© CreatorPulse Protected', placeholder: '© CreatorPulse Protected' },
      { id: 'watermarkOpacity', label: 'Watermark Opacity (0.1 - 1.0)', type: 'number', defaultValue: 0.4 },
      { id: 'includeViewerUsername', label: 'Include Viewer Username Stamp', type: 'boolean', defaultValue: true, description: 'Disincentivizes screen recording by stamping active subscriber username.' },
      { id: 'blockRightClick', label: 'Disable Right Click on Media', type: 'boolean', defaultValue: true }
    ],
    settingsValues: {
      watermarkText: '© CreatorPulse Protected',
      watermarkOpacity: 0.4,
      includeViewerUsername: true,
      blockRightClick: true
    },
    changelog: [
      { version: '2.1.0', date: '2026-08-13', changes: ['Added dynamic viewer username stamping', 'Optimized rendering performance'] },
      { version: '1.0.0', date: '2026-08-01', changes: ['Initial release'] }
    ]
  },
  {
    id: 'plugin-virtual-gifts',
    name: 'Virtual Gifts & Animated Reactions',
    slug: 'virtual-gifts',
    description: 'Empowers fans to send colorful 3D animated gifts (Diamonds, Roses, Rocket) directly on posts and video reels.',
    version: '1.4.2',
    author: 'StreamEngine Tech',
    authorUrl: 'https://streamengine.io',
    iconUrl: '🎁',
    category: 'Monetization',
    tags: ['Monetization', 'Gifts', 'Animations', 'Tips'],
    minAppVersion: '1.0.0',
    permissions: ['payment_hooks', 'notifications_send'],
    hooks: ['post_card_footer', 'navbar_actions', 'creator_dashboard_widgets'],
    isEnabled: true,
    autoUpdate: true,
    hasUpdate: true,
    latestVersion: '1.5.0',
    installedAt: '2026-08-03',
    updatedAt: '2026-08-10',
    settingsSchema: [
      { id: 'minGiftValue', label: 'Minimum Gift Value ($)', type: 'number', defaultValue: 1.00 },
      { id: 'enableConfetti', label: 'Trigger Confetti on High-Value Gifts (>$20)', type: 'boolean', defaultValue: true },
      { id: 'creatorSplitPercentage', label: 'Creator Revenue Split (%)', type: 'number', defaultValue: 85, description: 'Percentage of gift price credited to creator wallet.' },
      { id: 'featuredGifts', label: 'Active Gift Types', type: 'select', defaultValue: 'all', options: [
        { label: 'All Gifts (Roses, Gems, Rockets)', value: 'all' },
        { label: 'Standard Only (Roses & Gems)', value: 'standard' },
        { label: 'VIP Premium (Gems & Rockets)', value: 'vip' }
      ]}
    ],
    settingsValues: {
      minGiftValue: 1.00,
      enableConfetti: true,
      creatorSplitPercentage: 85,
      featuredGifts: 'all'
    },
    changelog: [
      { version: '1.5.0', date: '2026-08-14', changes: ['New Animated Diamond Rain gift', 'Added sound effects trigger'] },
      { version: '1.4.2', date: '2026-08-10', changes: ['Improved gift modal responsiveness'] }
    ]
  },
  {
    id: 'plugin-analytics-hub',
    name: 'SEO & Analytics Pixel Hub',
    slug: 'analytics-hub',
    description: 'Integrates Google Analytics 4, Meta Facebook Pixel, and custom conversion tracking header scripts seamlessly.',
    version: '1.0.5',
    author: 'AdTrack Pro',
    authorUrl: 'https://adtrackpro.com',
    iconUrl: '📊',
    category: 'Marketing & SEO',
    tags: ['Marketing', 'Google Analytics', 'Pixel', 'Conversions'],
    minAppVersion: '1.0.0',
    permissions: ['network_requests'],
    hooks: ['after_user_signup'],
    isEnabled: true,
    autoUpdate: false,
    hasUpdate: false,
    installedAt: '2026-08-04',
    updatedAt: '2026-08-04',
    settingsSchema: [
      { id: 'gaMeasurementId', label: 'Google Analytics 4 Measurement ID', type: 'text', defaultValue: 'G-CPULSE9982', placeholder: 'G-XXXXXXXXXX' },
      { id: 'metaPixelId', label: 'Meta (Facebook) Pixel ID', type: 'text', defaultValue: '', placeholder: '123456789012345' },
      { id: 'trackSubscriptionEvents', label: 'Track Subscription Conversions', type: 'boolean', defaultValue: true },
      { id: 'customHeaderScript', label: 'Custom Header JavaScript', type: 'textarea', defaultValue: '', placeholder: '// Custom tracking script' }
    ],
    settingsValues: {
      gaMeasurementId: 'G-CPULSE9982',
      metaPixelId: '',
      trackSubscriptionEvents: true,
      customHeaderScript: ''
    },
    changelog: [
      { version: '1.0.5', date: '2026-08-04', changes: ['Initial tracking hub release'] }
    ]
  },
  {
    id: 'plugin-gemini-ai',
    name: 'Gemini AI Post Assistant',
    slug: 'gemini-ai',
    description: 'Supercharges creator workflows with automatic viral caption suggestions, multi-language translation, and smart community auto-replies.',
    version: '2.0.0',
    author: 'AI Pulse Solutions',
    authorUrl: 'https://aipulse.dev',
    iconUrl: '💬',
    category: 'AI & Automation',
    tags: ['AI', 'Gemini', 'Automation', 'Captions'],
    minAppVersion: '1.0.0',
    permissions: ['ai_service', 'network_requests'],
    hooks: ['before_post_publish', 'creator_dashboard_widgets'],
    isEnabled: true,
    autoUpdate: true,
    hasUpdate: false,
    installedAt: '2026-08-06',
    updatedAt: '2026-08-14',
    settingsSchema: [
      { id: 'aiModel', label: 'Gemini AI Model', type: 'select', defaultValue: 'gemini-1.5-flash', options: [
        { label: 'Gemini 1.5 Flash (Ultra Fast)', value: 'gemini-1.5-flash' },
        { label: 'Gemini 1.5 Pro (Deep Creative Reasoning)', value: 'gemini-1.5-pro' }
      ]},
      { id: 'defaultTone', label: 'Default Writing Tone', type: 'select', defaultValue: 'energetic', options: [
        { label: 'Energetic & Social 🚀', value: 'energetic' },
        { label: 'Educational & Thoughtful 💡', value: 'educational' },
        { label: 'Direct & Professional 💼', value: 'professional' },
        { label: 'Casual & Friendly ✨', value: 'casual' }
      ]},
      { id: 'autoHashtags', label: 'Auto-Generate Trending Hashtags', type: 'boolean', defaultValue: true },
      { id: 'allowAutoReplies', label: 'Allow Creators to Enable Smart Auto-Reply', type: 'boolean', defaultValue: true }
    ],
    settingsValues: {
      aiModel: 'gemini-1.5-flash',
      defaultTone: 'energetic',
      autoHashtags: true,
      allowAutoReplies: true
    },
    changelog: [
      { version: '2.0.0', date: '2026-08-14', changes: ['Upgraded to Gemini 1.5 Flash', 'Added smart tone selector'] }
    ]
  },
  {
    id: 'plugin-2fa-shield',
    name: 'Two-Factor IP & Security Shield',
    slug: '2fa-shield',
    description: 'Enforces mandatory 2FA authentication for verified creators, rate-limiting on wallet top-ups, and anomaly detection.',
    version: '1.2.1',
    author: 'CyberVault Systems',
    authorUrl: 'https://cybervault.net',
    iconUrl: '🔐',
    category: 'Security & DRM',
    tags: ['Security', '2FA', 'Rate Limit', 'Fraud Prevention'],
    minAppVersion: '1.0.0',
    permissions: ['security_audit', 'notifications_send'],
    hooks: ['after_user_signup', 'payment_gateway_methods'],
    isEnabled: false,
    autoUpdate: true,
    hasUpdate: false,
    installedAt: '2026-08-07',
    updatedAt: '2026-08-11',
    settingsSchema: [
      { id: 'require2faForPayouts', label: 'Require 2FA Verification for Payout Requests', type: 'boolean', defaultValue: true },
      { id: 'rateLimitAttempts', label: 'Max Login Attempts before Lockout (per 15 min)', type: 'number', defaultValue: 5 },
      { id: 'notifyOnNewDevice', label: 'Email Creator upon New Device Login', type: 'boolean', defaultValue: true }
    ],
    settingsValues: {
      require2faForPayouts: true,
      rateLimitAttempts: 5,
      notifyOnNewDevice: true
    },
    changelog: [
      { version: '1.2.1', date: '2026-08-11', changes: ['Added payout 2FA challenge'] }
    ]
  },
  {
    id: 'plugin-piprapay',
    name: 'PipraPay Payment Gateway',
    slug: 'piprapay',
    description: 'Seamlessly accept bKash, Nagad, Rocket, Upay, Cards, and multi-currency payments via PipraPay with instant webhook validation and auto-settlement.',
    version: '1.0.0',
    author: 'PipraPay Labs',
    authorUrl: 'https://piprapay.com',
    iconUrl: '💳',
    category: 'Monetization',
    tags: ['Payments', 'PipraPay', 'bKash', 'Nagad', 'Rocket', 'Credit Card', 'Bangladesh', 'Multi-Currency'],
    minAppVersion: '1.0.0',
    permissions: ['payment_hooks', 'network_requests'],
    hooks: ['payment_gateway_methods'],
    isEnabled: true,
    autoUpdate: true,
    hasUpdate: false,
    installedAt: '2026-08-16',
    updatedAt: '2026-08-16',
    adminSettingsPage: {
      title: 'PipraPay Gateway Settings',
      description: 'Configure PipraPay API credentials, webhook verification keys, sandbox/live mode, supported currencies, and connection diagnostics.',
      requiredPermission: 'admin',
      sidebarItem: {
        label: 'PipraPay Gateway',
        icon: 'CreditCard',
        badge: 'Payment',
        badgeVariant: 'emerald'
      }
    },
    settingsSchema: [
      {
        id: 'mode',
        label: 'Operating Mode',
        type: 'select',
        defaultValue: 'sandbox',
        options: [
          { label: 'Sandbox (Simulation & Test Checkout)', value: 'sandbox', description: 'Safe test environment for simulated bKash, Nagad, Rocket, and card transactions.' },
          { label: 'Live (Production Transactions)', value: 'live', description: 'Connect to live PipraPay API for real customer transactions.' }
        ]
      },
      {
        id: 'baseUrl',
        label: 'PipraPay API Base URL',
        type: 'text',
        defaultValue: 'https://sandbox.piprapay.com/api',
        placeholder: 'https://sandbox.piprapay.com/api or https://piprapay.com/api',
        required: true,
        description: 'Base REST API endpoint. Use https://sandbox.piprapay.com/api for testing or https://piprapay.com/api for production.'
      },
      {
        id: 'apiKey',
        label: 'PipraPay API Key',
        type: 'api_key',
        defaultValue: 'pk_test_piprapay_demo_key',
        placeholder: 'pk_test_... or pk_live_...',
        required: true,
        description: 'Confidential API Key issued by PipraPay Merchant Dashboard. Kept securely in the server vault.'
      },
      {
        id: 'secretKey',
        label: 'Webhook / Signature Secret Key',
        type: 'password',
        defaultValue: 'whsec_piprapay_demo_secret',
        placeholder: 'whsec_...',
        required: true,
        description: 'Secret key used for HMAC-SHA256 verification of incoming webhook IPN notifications.'
      },
      {
        id: 'supportedCurrencies',
        label: 'Supported Checkout Currencies',
        type: 'select',
        defaultValue: 'BDT',
        options: [
          { label: 'BDT (৳ Bangladeshi Taka - bKash, Nagad, Rocket)', value: 'BDT' },
          { label: 'USD ($ US Dollar)', value: 'USD' },
          { label: 'EUR (€ Euro)', value: 'EUR' },
          { label: 'GBP (£ British Pound)', value: 'GBP' },
          { label: 'Multi-Currency (All Supported)', value: 'ALL' }
        ]
      },
      {
        id: 'transactionFeePercentage',
        label: 'Transaction Surcharge / Processing Fee (%)',
        type: 'number',
        defaultValue: 0.0,
        min: 0,
        max: 15,
        step: 0.1,
        description: 'Optional merchant processing fee percentage added to customer total at checkout (0 for no surcharge).'
      },
      {
        id: 'isDefault',
        label: 'Set as Default Payment Gateway',
        type: 'boolean',
        defaultValue: false,
        description: 'Automatically pre-selects PipraPay in customer checkout modals.'
      },
      {
        id: 'displayOrder',
        label: 'Display Priority Order',
        type: 'number',
        defaultValue: 1,
        min: 1,
        max: 100,
        description: 'Ordering priority in checkout modal list (1 = top).'
      },
      {
        id: 'webhookUrl',
        label: 'IPN Webhook Listener URL',
        type: 'text',
        defaultValue: '/api/payments/webhook/piprapay',
        description: 'Copy this endpoint into your PipraPay Merchant Webhook settings.'
      },
      {
        id: 'transactionStatusMapping',
        label: 'Status Mapping Rules (JSON)',
        type: 'textarea',
        defaultValue: '{\n  "completed": "Completed",\n  "paid": "Completed",\n  "success": "Completed",\n  "pending": "Pending",\n  "processing": "Pending",\n  "failed": "Failed",\n  "cancelled": "Failed",\n  "refunded": "Refunded"\n}',
        description: 'Maps gateway IPN statuses to platform transaction ledger statuses.'
      },
      {
        id: 'enableLogging',
        label: 'Enable Diagnostic & Webhook Audit Logging',
        type: 'boolean',
        defaultValue: true,
        description: 'Persists all gateway requests, webhook deliveries, and API errors to the central payment audit ledger.'
      }
    ],
    settingsValues: {
      mode: 'sandbox',
      baseUrl: 'https://sandbox.piprapay.com/api',
      apiKey: 'pk_test_piprapay_demo_key',
      secretKey: 'whsec_piprapay_demo_secret',
      supportedCurrencies: 'BDT',
      transactionFeePercentage: 0.0,
      isDefault: false,
      displayOrder: 1,
      webhookUrl: '/api/payments/webhook/piprapay',
      transactionStatusMapping: '{\n  "completed": "Completed",\n  "paid": "Completed",\n  "success": "Completed",\n  "pending": "Pending",\n  "processing": "Pending",\n  "failed": "Failed",\n  "cancelled": "Failed",\n  "refunded": "Refunded"\n}',
      enableLogging: true
    },
    changelog: [
      {
        version: '1.0.0',
        date: '2026-08-16',
        changes: [
          'Initial release of the standalone PipraPay Payment Gateway Add-on Plugin.',
          'Integrated bKash, Nagad, Rocket, Upay, Cards, and multi-currency checkout redirect flow.',
          'Full server-side secret management with HMAC-SHA256 webhook validation.',
          'Idempotency protection preventing duplicate charge completions.'
        ]
      }
    ]
  },
  {
    id: 'plugin-stripe',
    name: 'Stripe Payment Gateway',
    slug: 'stripe-payments',
    description: 'Enables fans to check out with credit cards, dynamic billing subscriptions, and direct wallet deposits via Stripe.',
    version: '1.2.0',
    author: 'Stripe Labs',
    authorUrl: 'https://stripe.com',
    iconUrl: '💳',
    category: 'Monetization',
    tags: ['Payments', 'Stripe', 'Credit Card', 'Subscriptions'],
    minAppVersion: '1.0.0',
    permissions: ['payment_hooks', 'network_requests'],
    hooks: ['payment_gateway_methods'],
    isEnabled: true,
    autoUpdate: true,
    hasUpdate: false,
    installedAt: '2026-08-10',
    updatedAt: '2026-08-14',
    settingsSchema: [
      { id: 'mode', label: 'Stripe Mode', type: 'select', defaultValue: 'sandbox', options: [
        { label: 'Sandbox (Testing)', value: 'sandbox' },
        { label: 'Live (Production)', value: 'live' }
      ]},
      { id: 'publishableKey', label: 'Stripe Publishable Key', type: 'text', defaultValue: 'pk_test_stripe_pub_key_123', placeholder: 'pk_test_...' },
      { id: 'secretKey', label: 'Stripe Secret Key (Confidential Server-Side Only)', type: 'password', defaultValue: '••••••••', placeholder: 'sk_test_...' },
      { id: 'webhookSecret', label: 'Stripe Webhook Signing Secret (Confidential Server-Side Only)', type: 'password', defaultValue: '••••••••', placeholder: 'whsec_...' },
      { id: 'supportedCurrencies', label: 'Supported Currencies', type: 'select', defaultValue: 'USD', options: [
        { label: 'USD ($)', value: 'USD' },
        { label: 'EUR (€)', value: 'EUR' },
        { label: 'GBP (£)', value: 'GBP' }
      ]},
      { id: 'isDefault', label: 'Set as Default Payment Gateway', type: 'boolean', defaultValue: true },
      { id: 'transactionStatusMapping', label: 'Stripe-to-Ledger Status Mapping Rules (JSON)', type: 'textarea', defaultValue: '{\n  "succeeded": "Completed",\n  "processing": "Pending",\n  "failed": "Failed"\n}' }
    ],
    settingsValues: {
      mode: 'sandbox',
      publishableKey: 'pk_test_stripe_pub_key_123',
      secretKey: '••••••••',
      webhookSecret: '••••••••',
      supportedCurrencies: 'USD',
      isDefault: true,
      transactionStatusMapping: '{\n  "succeeded": "Completed",\n  "processing": "Pending",\n  "failed": "Failed"\n}'
    },
    changelog: [
      { version: '1.2.0', date: '2026-08-14', changes: ['Added full subscription webhook handling', 'Optimized sandbox card decline simulation'] }
    ]
  },
  {
    id: 'plugin-paypal',
    name: 'PayPal Smart Buttons',
    slug: 'paypal-payments',
    description: 'Integrates PayPal checkout, credit/debit smart buttons, recurring billing agreements, and payouts.',
    version: '1.1.0',
    author: 'PayPal Inc.',

    authorUrl: 'https://paypal.com',
    iconUrl: '🅿️',
    category: 'Monetization',
    tags: ['Payments', 'PayPal', 'Smart Buttons', 'Billing'],
    minAppVersion: '1.0.0',
    permissions: ['payment_hooks', 'network_requests'],
    hooks: ['payment_gateway_methods'],
    isEnabled: false,
    autoUpdate: true,
    hasUpdate: false,
    installedAt: '2026-08-11',
    updatedAt: '2026-08-14',
    settingsSchema: [
      { id: 'mode', label: 'PayPal Mode', type: 'select', defaultValue: 'sandbox', options: [
        { label: 'Sandbox (Testing)', value: 'sandbox' },
        { label: 'Live (Production)', value: 'live' }
      ]},
      { id: 'clientId', label: 'PayPal Client ID', type: 'text', defaultValue: 'paypal_client_id_abc', placeholder: 'PayPal Client ID' },
      { id: 'clientSecret', label: 'PayPal Client Secret (Confidential Server-Side Only)', type: 'password', defaultValue: '••••••••', placeholder: 'PayPal Secret' },
      { id: 'supportedCurrencies', label: 'Supported Currencies', type: 'select', defaultValue: 'USD', options: [
        { label: 'USD ($)', value: 'USD' },
        { label: 'EUR (€)', value: 'EUR' }
      ]},
      { id: 'isDefault', label: 'Set as Default Payment Gateway', type: 'boolean', defaultValue: false },
      { id: 'transactionStatusMapping', label: 'PayPal-to-Ledger Status Mapping Rules (JSON)', type: 'textarea', defaultValue: '{\n  "COMPLETED": "Completed",\n  "PENDING": "Pending",\n  "FAILED": "Failed"\n}' }
    ],
    settingsValues: {
      mode: 'sandbox',
      clientId: 'paypal_client_id_abc',
      clientSecret: '••••••••',
      supportedCurrencies: 'USD',
      isDefault: false,
      transactionStatusMapping: '{\n  "COMPLETED": "Completed",\n  "PENDING": "Pending",\n  "FAILED": "Failed"\n}'
    },
    changelog: [
      { version: '1.1.0', date: '2026-08-14', changes: ['Upgraded to PayPal Smart Buttons API v2'] }
    ]
  },
  {
    id: 'plugin-mock',
    name: 'Developer Sandbox (Mock)',
    slug: 'mock-payments',
    description: 'Instant sandbox gateway for local testing. Requires zero credentials and completes simulated charges immediately.',
    version: '1.0.0',
    author: 'CreatorPulse Core Team',
    authorUrl: 'https://creatorpulse.com',
    iconUrl: '🔌',
    category: 'Monetization',
    tags: ['Payments', 'Mock', 'Testing', 'Offline'],
    minAppVersion: '1.0.0',
    permissions: ['payment_hooks'],
    hooks: ['payment_gateway_methods'],
    isEnabled: true,
    autoUpdate: false,
    hasUpdate: false,
    installedAt: '2026-08-14',
    updatedAt: '2026-08-14',
    settingsSchema: [
      { id: 'isDefault', label: 'Set as Default Payment Gateway', type: 'boolean', defaultValue: false },
      { id: 'supportedCurrencies', label: 'Supported Currencies', type: 'select', defaultValue: 'USD', options: [
        { label: 'USD ($)', value: 'USD' },
        { label: 'EUR (€)', value: 'EUR' }
      ]}
    ],
    settingsValues: {
      isDefault: false,
      supportedCurrencies: 'USD'
    },
    changelog: [
      { version: '1.0.0', date: '2026-08-14', changes: ['Initial release for developer tests'] }
    ]
  }
];


export const PLUGIN_LIBRARY_CATALOG: PluginManifest[] = [
  {
    id: 'plugin-discord-sync',
    name: 'Discord VIP Community Role Sync',
    slug: 'discord-sync',
    description: 'Instantly grants or revokes Discord server VIP roles when members subscribe, upgrade, or cancel their tiers.',
    version: '1.2.0',
    author: 'BotForge Labs',
    authorUrl: 'https://botforge.dev',
    iconUrl: '💬',
    category: 'Community & Media',
    tags: ['Discord', 'Roles', 'Automation', 'Community'],
    minAppVersion: '1.0.0',
    permissions: ['network_requests', 'notifications_send'],
    hooks: ['after_user_signup', 'creator_dashboard_widgets'],
    isEnabled: false,
    autoUpdate: true,
    hasUpdate: false,
    installedAt: '2026-08-14',
    updatedAt: '2026-08-14',
    isLibraryItem: true,
    requiresLicense: true,
    licenseStatus: 'unlicensed',
    dependencies: { plugins: ['plugin-gemini-ai'] },
    settingsSchema: [
      { id: 'botToken', label: 'Discord Bot Token', type: 'password', defaultValue: '', placeholder: 'Bot token from Discord Developer Portal' },
      { id: 'guildId', label: 'Discord Server (Guild) ID', type: 'text', defaultValue: '', placeholder: '123456789012345678' },
      { id: 'autoKickExpired', label: 'Automatically Remove Role on Subscription Expiration', type: 'boolean', defaultValue: true }
    ],
    settingsValues: {
      botToken: '',
      guildId: '',
      autoKickExpired: true
    },
    changelog: [
      { version: '1.2.0', date: '2026-08-14', changes: ['Added instant role sync webhook handler', 'Multi-guild support'] }
    ]
  },
  {
    id: 'plugin-podcast-audio',
    name: 'Audio Waveform & Podcast Master',
    slug: 'podcast-audio',
    description: 'Embeds interactive audio waveform players, background playback, and chapter markers on creator audio posts.',
    version: '2.0.1',
    author: 'SonicWave Audio',
    authorUrl: 'https://sonicwave.io',
    iconUrl: '🎙️',
    category: 'Community & Media',
    tags: ['Audio', 'Podcast', 'Waveform', 'Music'],
    minAppVersion: '1.0.0',
    permissions: ['media_transform', 'storage_access'],
    hooks: ['post_card_footer', 'member_dashboard_widgets'],
    isEnabled: false,
    autoUpdate: true,
    hasUpdate: false,
    installedAt: '2026-08-14',
    updatedAt: '2026-08-14',
    isLibraryItem: true,
    requiresLicense: true,
    licenseStatus: 'unlicensed',
    settingsSchema: [
      { id: 'waveformColor', label: 'Waveform Accent Color', type: 'text', defaultValue: '#EC4899' },
      { id: 'enableDownloadForVIP', label: 'Allow MP3 Download for VIP Members', type: 'boolean', defaultValue: true }
    ],
    settingsValues: {
      waveformColor: '#EC4899',
      enableDownloadForVIP: true
    },
    changelog: [
      { version: '2.0.1', date: '2026-08-14', changes: ['High-precision audio scrubbing', 'FLAC lossless support'] }
    ]
  },
  {
    id: 'plugin-zapier-webhooks',
    name: 'Zapier & Webhook Payload Dispatcher',
    slug: 'zapier-webhooks',
    description: 'Sends real-time JSON webhooks to Zapier, Make, and custom HTTP endpoints on signups, tips, and purchases.',
    version: '1.3.4',
    author: 'IntegrateCloud',
    authorUrl: 'https://integratecloud.net',
    iconUrl: '⚡',
    category: 'Marketing & SEO',
    tags: ['Webhooks', 'Zapier', 'Integrations', 'Automation'],
    minAppVersion: '1.0.0',
    permissions: ['network_requests', 'security_audit'],
    hooks: ['after_user_signup', 'before_post_publish'],
    isEnabled: false,
    autoUpdate: true,
    hasUpdate: false,
    installedAt: '2026-08-14',
    updatedAt: '2026-08-14',
    isLibraryItem: true,
    settingsSchema: [
      { id: 'webhookUrl', label: 'Webhook Endpoint Target URL', type: 'text', defaultValue: '', placeholder: 'https://hooks.zapier.com/hooks/catch/...' },
      { id: 'retryAttempts', label: 'Max Retry Attempts on Failure', type: 'number', defaultValue: 3 },
      { id: 'secretKey', label: 'HMAC Signing Secret Key', type: 'password', defaultValue: '' }
    ],
    settingsValues: {
      webhookUrl: '',
      retryAttempts: 3,
      secretKey: ''
    },
    changelog: [
      { version: '1.3.4', date: '2026-08-14', changes: ['HMAC SHA-256 header signatures added'] }
    ]
  },
  {
    id: 'plugin-crypto-tips',
    name: 'USDC & Web3 Instant Tipping',
    slug: 'crypto-tips',
    description: 'Enables zero-commission fan tips via USDC, Solana, and Ethereum directly to creator wallets with on-chain proofs.',
    version: '1.0.8',
    author: 'ChainPay Protocol',
    authorUrl: 'https://chainpay.xyz',
    iconUrl: '🪙',
    category: 'Monetization',
    tags: ['Web3', 'Crypto', 'USDC', 'Solana'],
    minAppVersion: '1.0.0',
    permissions: ['payment_hooks', 'network_requests'],
    hooks: ['post_card_footer', 'payment_gateway_methods'],
    isEnabled: false,
    autoUpdate: false,
    hasUpdate: false,
    installedAt: '2026-08-14',
    updatedAt: '2026-08-14',
    isLibraryItem: true,
    settingsSchema: [
      { id: 'acceptedCurrencies', label: 'Accepted Currencies', type: 'select', defaultValue: 'usdc', options: [
        { label: 'USDC Only (Zero Volatility)', value: 'usdc' },
        { label: 'USDC + Solana (SOL)', value: 'usdc_sol' },
        { label: 'Multi-Chain (USDC, SOL, ETH)', value: 'all' }
      ]},
      { id: 'minTipUsdc', label: 'Minimum Tip in USDC ($)', type: 'number', defaultValue: 1.00 }
    ],
    settingsValues: {
      acceptedCurrencies: 'usdc',
      minTipUsdc: 1.00
    },
    changelog: [
      { version: '1.0.8', date: '2026-08-14', changes: ['Solana Pay QR code integration'] }
    ]
  },
  {
    id: 'plugin-creator-stories',
    name: '24-Hour Creator Stories & Ephemeral Updates',
    slug: 'creator-stories',
    description: 'Empowers creators to share text, image, and video stories that disappear after 24 hours. Includes seen/unseen states, viewer tracking, replies, reactions, and customizable settings.',
    version: '1.0.0',
    author: 'CreatorPulse Core Team',
    authorUrl: 'https://creatorpulse.com',
    iconUrl: '📸',
    category: 'Community & Media',
    tags: ['Stories', 'Ephemeral', 'Community', 'Engagement'],
    minAppVersion: '1.0.0',
    permissions: ['storage_access', 'notifications_send'],
    hooks: ['member_dashboard_widgets', 'creator_dashboard_widgets'],
    isEnabled: false,
    autoUpdate: true,
    hasUpdate: false,
    installedAt: '2026-08-15',
    updatedAt: '2026-08-15',
    isLibraryItem: true,
    requiresLicense: true,
    licenseStatus: 'unlicensed',
    settingsSchema: [
      { id: 'maxDuration', label: 'Maximum Story Duration (hours)', type: 'number', defaultValue: 24, required: true },
      { id: 'allowedTypes', label: 'Allowed Media Types', type: 'select', defaultValue: 'all', options: [
        { label: 'All Media (Image, Video, Text)', value: 'all' },
        { label: 'Images & Text Only', value: 'image_text' },
        { label: 'Images Only', value: 'images' },
        { label: 'Text Only', value: 'text' }
      ]},
      { id: 'enableViewerTracking', label: 'Enable Viewer Tracking', type: 'boolean', defaultValue: true, description: 'Allow creators to see who viewed their stories.' },
      { id: 'enableRepliesReactions', label: 'Enable Replies & Reactions', type: 'boolean', defaultValue: true, description: 'Allow fans to reply or react with emojis to stories.' },
      { id: 'cleanupInterval', label: 'Expired Story Cleanup Check (hours)', type: 'number', defaultValue: 24, description: 'Interval for auto-purging expired stories.' },
      { id: 'requireSubscriptionForStories', label: 'Require Subscription to View', type: 'boolean', defaultValue: false, description: 'Only paid subscribers can view creator stories.' }
    ],
    settingsValues: {
      maxDuration: 24,
      allowedTypes: 'all',
      enableViewerTracking: true,
      enableRepliesReactions: true,
      cleanupInterval: 24,
      requireSubscriptionForStories: false
    },
    changelog: [
      { version: '1.0.0', date: '2026-08-15', changes: ['Initial release of the 24-Hour Creator Stories modular plugin.'] }
    ],
    databaseMigrations: [
      {
        version: '1.0.0',
        description: 'Initialize story reactions and story replies tables with RLS and index optimizations.',
        sql: `CREATE TABLE IF NOT EXISTS public.story_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TABLE IF NOT EXISTS public.story_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read reactions" ON public.story_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert reactions" ON public.story_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow authenticated read replies" ON public.story_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert replies" ON public.story_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS story_reactions_story_id_idx ON public.story_reactions(story_id);
CREATE INDEX IF NOT EXISTS story_replies_story_id_idx ON public.story_replies(story_id);`
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    action: 'THEME_ACTIVATED',
    entityType: 'theme',
    entityName: 'Blush Core',
    details: 'Set as the official active default frontend theme.',
    user: 'Elena Rostova',
    role: 'admin',
    timestamp: '2026-08-14 23:50:00',
    severity: 'success'
  },
  {
    id: 'log-002',
    action: 'PLUGIN_ACTIVATED',
    entityType: 'plugin',
    entityName: 'Digital Watermark & DRM Guard',
    details: 'Plugin enabled with dynamic subscriber watermark stamping.',
    user: 'Elena Rostova',
    role: 'admin',
    timestamp: '2026-08-14 23:25:40',
    severity: 'info'
  },
  {
    id: 'log-003',
    action: 'PLUGIN_CONFIG_SAVED',
    entityType: 'plugin',
    entityName: 'Gemini AI Post Assistant',
    details: 'Updated AI model to Gemini 1.5 Flash and enabled viral hashtag generation.',
    user: 'Elena Rostova',
    role: 'admin',
    timestamp: '2026-08-14 22:45:10',
    severity: 'info'
  },
  {
    id: 'log-004',
    action: 'THEME_INSTALLED',
    entityType: 'theme',
    entityName: 'Obsidian Gold',
    details: 'Installed package obsidian-gold-v1.3.0.zip successfully.',
    user: 'Elena Rostova',
    role: 'admin',
    timestamp: '2026-08-14 21:10:05',
    severity: 'success'
  }
];

export const THEME_UPDATE_REGISTRY: Record<string, Partial<ThemeManifest>> = {
  'theme-default-theme': {
    version: '1.0.1',
    minAppVersion: '1.0.0',
    description: 'The official built-in creator-platform default theme featuring radiant blush hues, editorial typography, and full responsive layouts.',
    tokens: {
      primary: '#EC4899',
      primaryHover: '#DB2777',
      softPrimary: '#FCE7F3',
      lightPrimary: '#FDF2F8',
      accent: '#F43F5E',
      background: '#FFF9FC',
      surface: '#FFFFFF',
      surfaceSecondary: '#FFF1F7',
      border: '#F3DCE8',
      textPrimary: '#18181B',
      textSecondary: '#71717A',
      textMuted: '#A1A1AA',
      cardRadius: '20px',
      buttonRadius: '14px',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      isDark: false
    },
    changelog: [
      { version: '1.0.1', date: '2026-08-15', changes: ['Optimized responsive viewport calculations and theme token performance'] },
      { version: '1.0.0', date: '2026-08-15', changes: ['Initial official Default Theme release'] }
    ]
  },
  'theme-starter-theme': {
    version: '1.0.1',
    minAppVersion: '1.0.0',
    description: 'Clean, fully commented official Theme SDK starter template for creating custom CreatorPulse themes.',
    tokens: {
      primary: '#3B82F6',
      primaryHover: '#2563EB',
      softPrimary: '#DBEAFE',
      lightPrimary: '#EFF6FF',
      accent: '#F59E0B',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceSecondary: '#F1F5F9',
      border: '#E2E8F0',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      textMuted: '#94A3B8',
      cardRadius: '16px',
      buttonRadius: '10px',
      fontFamily: 'Inter, sans-serif',
      fontHeading: 'Inter, sans-serif',
      isDark: false
    },
    changelog: [
      { version: '1.0.1', date: '2026-08-15', changes: ['Added extended SDK documentation examples'] },
      { version: '1.0.0', date: '2026-08-15', changes: ['Initial starter theme template'] }
    ]
  }
};

