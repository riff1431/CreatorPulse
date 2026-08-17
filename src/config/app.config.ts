export interface AppConfig {
  app: {
    name: string;
    version: string;
    description: string;
    tagline: string;
    url: string;
    environment: 'development' | 'production' | 'test';
    isProduction: boolean;
  };
  auth: {
    cookieRoleKey: string;
    cookieSessionKey: string;
    cookieProfileKey: string;
    sessionDurationDays: number;
    defaultRedirectRoute: string;
    adminRedirectRoute: string;
    creatorRedirectRoute: string;
    moderatorRedirectRoute: string;
  };
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
  storage: {
    defaultDriver: 'local' | 'supabase';
    uploadsDirectory: string;
    publicUrlPrefix: string;
    maxFileSizeMB: number;
  };
  themes: {
    defaultThemeId: string;
    defaultThemeName: string;
  };
  plugins: {
    engineVersion: string;
    defaultActivePlugins: string[];
  };
  monetization: {
    platformFeePercentage: number; // 5%
    minPayoutThresholdUsd: number;
  };
}

export const APP_CONFIG: AppConfig = {
  app: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'CreatorPulse',
    version: '1.0.0',
    description: 'A modern, elegant SaaS platform for creators, educators, coaches, and communities.',
    tagline: 'Empowering Creators Everywhere',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: (process.env.NODE_ENV as any) || 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
  auth: {
    cookieRoleKey: 'creatorpulse_role',
    cookieSessionKey: 'creatorpulse_session',
    cookieProfileKey: 'creatorpulse_user_profile',
    sessionDurationDays: 30,
    defaultRedirectRoute: '/feed',
    adminRedirectRoute: '/admin/dashboard',
    creatorRedirectRoute: '/feed',
    moderatorRedirectRoute: '/admin/dashboard',
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  storage: {
    defaultDriver: 'local',
    uploadsDirectory: 'public/uploads',
    publicUrlPrefix: '/uploads',
    maxFileSizeMB: 50,
  },
  themes: {
    defaultThemeId: 'theme-default-theme',
    defaultThemeName: 'Official Default Theme',
  },
  plugins: {
    engineVersion: '1.0.0',
    defaultActivePlugins: [
      'plugin-drm-watermark',
      'plugin-virtual-gifts',
      'plugin-gemini-ai',
      'plugin-audio-waveform',
      'plugin-discord-sync',
    ],
  },
  monetization: {
    platformFeePercentage: 5,
    minPayoutThresholdUsd: 50,
  },
};
