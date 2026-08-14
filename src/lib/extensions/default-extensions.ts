import { ThemeManifest } from './theme-types';
import { PluginManifest, AuditLogEntry } from './plugin-types';

export const DEFAULT_THEMES: ThemeManifest[] = [
  {
    id: 'theme-blush-core',
    name: 'Blush Core',
    slug: 'blush-core',
    description: 'The signature built-in default frontend creator-platform theme with soft rose pink hues, warm blush canvas, and editorial typography.',
    version: '1.2.0',
    author: 'CreatorPulse Core Team',
    authorUrl: 'https://creatorpulse.com',
    previewImageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600',
    category: 'Modern Light',
    tags: ['Built-in Default', 'Blush Core', 'Light Pink', 'Official'],
    minAppVersion: '1.0.0',
    isDefault: true, // Cannot be deleted; serves as the ultimate fallback
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
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      isDark: false
    },
    settings: {
      logoUrl: '',
      faviconUrl: '',
      containerWidth: 'max-w-7xl',
      buttonStyle: 'gradient-glow',
      animationIntensity: 'normal',
      cardShadow: 'soft-pink'
    },
    changelog: [
      { version: '1.2.0', date: '2026-08-14', changes: ['Standardized as official built-in default Blush Core theme', 'Added complete visual customization schema'] },
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
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      isDark: false
    },
    settings: {
      containerWidth: 'max-w-7xl',
      buttonStyle: 'gradient-glow',
      animationIntensity: 'normal',
      cardShadow: 'elevated'
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
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      isDark: true
    },
    settings: {
      containerWidth: 'max-w-7xl',
      buttonStyle: 'flat-solid',
      animationIntensity: 'subtle',
      cardShadow: 'elevated'
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
