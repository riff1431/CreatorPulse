import { ThemeManifest } from './theme-types';
import { PluginManifest, AuditLogEntry } from './plugin-types';

export const DEFAULT_THEMES: ThemeManifest[] = [
  {
    id: 'theme-rose-blush',
    name: 'Rose Blush',
    slug: 'rose-blush',
    description: 'The signature modern light pink creator platform style with rose gold accents and soft shadows.',
    version: '1.2.0',
    author: 'CreatorPulse Core Team',
    authorUrl: 'https://creatorpulse.com',
    previewImageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600',
    category: 'Modern Light',
    tags: ['Official', 'Light Pink', 'Pastel', 'Rose'],
    minAppVersion: '1.0.0',
    isActive: true,
    installedAt: '2026-08-01',
    updatedAt: '2026-08-14',
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
      isDark: false
    },
    changelog: [
      { version: '1.2.0', date: '2026-08-14', changes: ['Optimized pink radial glow', 'Added Plus Jakarta Sans editorial weights'] },
      { version: '1.0.0', date: '2026-08-01', changes: ['Initial official release'] }
    ]
  },
  {
    id: 'theme-cyber-neon',
    name: 'Cyber Neon Dark',
    slug: 'cyber-neon',
    description: 'High-energy dark glass aesthetic with vibrant electric pink, neon cyan highlights, and deep charcoal surfaces.',
    version: '1.1.4',
    author: 'Studio Vortex',
    authorUrl: 'https://studiovortex.io',
    previewImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
    category: 'Dark Cyber',
    tags: ['Dark Mode', 'Neon', 'Glassmorphism', 'Cyberpunk'],
    minAppVersion: '1.0.0',
    isActive: false,
    installedAt: '2026-08-05',
    updatedAt: '2026-08-12',
    tokens: {
      primary: '#F43F5E',
      primaryHover: '#E11D48',
      softPrimary: '#3F1728',
      lightPrimary: '#1F111D',
      accent: '#06B6D4',
      background: '#09090B',
      surface: '#18181B',
      surfaceSecondary: '#27272A',
      border: '#3F3F46',
      textPrimary: '#FAFAFA',
      textSecondary: '#A1A1AA',
      textMuted: '#71717A',
      cardRadius: '24px',
      buttonRadius: '16px',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      isDark: true
    },
    changelog: [
      { version: '1.1.4', date: '2026-08-12', changes: ['Deepened background contrast', 'Enhanced glow on active badges'] },
      { version: '1.0.0', date: '2026-08-05', changes: ['Initial release'] }
    ]
  },
  {
    id: 'theme-lavender-frost',
    name: 'Lavender Frost',
    slug: 'lavender-frost',
    description: 'Calm and sophisticated frosted lavender with soft violet highlights and clean minimalist layout.',
    version: '1.0.8',
    author: 'Nordic UI Labs',
    authorUrl: 'https://nordicui.dev',
    previewImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600',
    category: 'Frosted Pastel',
    tags: ['Frosted', 'Lavender', 'Pastel', 'Minimal'],
    minAppVersion: '1.0.0',
    isActive: false,
    installedAt: '2026-08-08',
    updatedAt: '2026-08-10',
    tokens: {
      primary: '#8B5CF6',
      primaryHover: '#7C3AED',
      softPrimary: '#EDE9FE',
      lightPrimary: '#F5F3FF',
      accent: '#EC4899',
      background: '#FAF8FF',
      surface: '#FFFFFF',
      surfaceSecondary: '#F3E8FF',
      border: '#E9D5FF',
      textPrimary: '#1E1B4B',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF',
      cardRadius: '22px',
      buttonRadius: '14px',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      isDark: false
    },
    changelog: [
      { version: '1.0.8', date: '2026-08-10', changes: ['Refined frosted glass card borders'] }
    ]
  },
  {
    id: 'theme-sunset-coral',
    name: 'Sunset Coral',
    slug: 'sunset-coral',
    description: 'Warm and vibrant sunset palette with peach, golden rose, and energizing cream surfaces.',
    version: '1.0.2',
    author: 'Solstice Design',
    authorUrl: 'https://solsticethemes.com',
    previewImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    category: 'Warm Vibrant',
    tags: ['Warm', 'Coral', 'Peach', 'Summer'],
    minAppVersion: '1.0.0',
    isActive: false,
    installedAt: '2026-08-09',
    updatedAt: '2026-08-09',
    tokens: {
      primary: '#FB7185',
      primaryHover: '#F43F5E',
      softPrimary: '#FFE4E6',
      lightPrimary: '#FFF1F2',
      accent: '#F59E0B',
      background: '#FFFBF9',
      surface: '#FFFFFF',
      surfaceSecondary: '#FFF1EE',
      border: '#FED7D7',
      textPrimary: '#29181B',
      textSecondary: '#7A6B6E',
      textMuted: '#AB9B9E',
      cardRadius: '20px',
      buttonRadius: '12px',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      isDark: false
    },
    changelog: [
      { version: '1.0.2', date: '2026-08-09', changes: ['Initial release of Sunset Coral theme'] }
    ]
  },
  {
    id: 'theme-obsidian-gold',
    name: 'Obsidian Gold',
    slug: 'obsidian-gold',
    description: 'High-end luxury aesthetic with deep matte obsidian, subtle champagne gold accents, and sleek borders.',
    version: '1.3.0',
    author: 'Aura Luxury Group',
    authorUrl: 'https://auralux.com',
    previewImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    category: 'Luxury Dark',
    tags: ['Luxury', 'Gold', 'Matte Black', 'Premium'],
    minAppVersion: '1.0.0',
    isActive: false,
    installedAt: '2026-08-02',
    updatedAt: '2026-08-11',
    tokens: {
      primary: '#D97706',
      primaryHover: '#B45309',
      softPrimary: '#451A03',
      lightPrimary: '#1E140C',
      accent: '#FBBF24',
      background: '#0C0A09',
      surface: '#1C1917',
      surfaceSecondary: '#292524',
      border: '#44403C',
      textPrimary: '#FAFAF9',
      textSecondary: '#A8A29E',
      textMuted: '#78716C',
      cardRadius: '16px',
      buttonRadius: '10px',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      isDark: true
    },
    changelog: [
      { version: '1.3.0', date: '2026-08-11', changes: ['Enhanced champagne gold gradients', 'Reduced border blur'] }
    ]
  }
];

export const DEFAULT_PLUGINS: PluginManifest[] = [
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
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    action: 'THEME_ACTIVATED',
    entityType: 'theme',
    entityName: 'Rose Blush',
    details: 'Theme activated as default platform theme.',
    user: 'Elena Rostova',
    role: 'admin',
    timestamp: '2026-08-14 23:30:12',
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
