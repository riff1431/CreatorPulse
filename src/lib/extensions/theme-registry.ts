'use client';

import React from 'react';
import { 
  ThemeManifest, 
  ThemePageName, 
  ThemeLayoutName, 
  ThemeComponentName, 
  ThemeOverrideValidationResult,
  ThemeOverrideItemReport 
} from './theme-types';

// Default theme base imports
import * as DefaultThemePages from '@themes/default-theme';
import * as DefaultThemeComponents from '@themes/default-theme/components';
import { MainLayout as DefaultMainLayout } from '@themes/default-theme/layouts/MainLayout';
import { CreatorLayout as DefaultCreatorLayout } from '@themes/default-theme/layouts/CreatorLayout';
import { AuthLayout as DefaultAuthLayout } from '@themes/default-theme/layouts/AuthLayout';
import { MinimalLayout as DefaultMinimalLayout } from '@themes/default-theme/layouts/MinimalLayout';

// Starter theme overrides imports
import * as StarterThemePages from '@themes/starter-theme';
import * as StarterThemeComponents from '@themes/starter-theme/components';
import { MainLayout as StarterMainLayout } from '@themes/starter-theme/layouts/MainLayout';
import { CreatorLayout as StarterCreatorLayout } from '@themes/starter-theme/layouts/CreatorLayout';
import { AuthLayout as StarterAuthLayout } from '@themes/starter-theme/layouts/AuthLayout';

export const ALL_THEME_PAGES: ThemePageName[] = [
  'LandingPage',
  'LoginPage',
  'SignupPage',
  'FeedPage',
  'CreatorDashboardPage',
  'CreatorProfilePage',
  'SinglePostPage',
  'MessagesPage',
  'NotificationsPage',
  'ShortsPage',
  'ExplorePage',
  'SavedPage',
  'BalancePage',
  'SettingsPage',
  'MemberDashboardPage',
  'OnboardingPage',
  'ConnectionsPage',
];

export const ALL_THEME_LAYOUTS: ThemeLayoutName[] = [
  'MainLayout',
  'CreatorLayout',
  'AuthLayout',
  'MinimalLayout',
];

export const ALL_THEME_COMPONENTS: ThemeComponentName[] = [
  'Navbar',
  'Sidebar',
  'Footer',
  'MobileNav',
  'PostCard',
  'StoryBar',
  'CreatorHeader',
  'CreatorSidebar',
  'Button',
  'Card',
  'Avatar',
  'Badge',
  'Modal',
  'Toast',
  'Sparkline',
  'RoleSwitcher',
];

export interface ThemeModulePackage {
  id: string;
  slug: string;
  pages?: Partial<Record<ThemePageName, React.ComponentType<any>>>;
  layouts?: Partial<Record<ThemeLayoutName, React.ComponentType<any>>>;
  components?: Partial<Record<ThemeComponentName, React.ComponentType<any>>>;
}

const DEFAULT_THEME_MODULE: ThemeModulePackage = {
  id: 'theme-default-theme',
  slug: 'default-theme',
  pages: {
    LandingPage: (DefaultThemePages as any).LandingPage,
    LoginPage: (DefaultThemePages as any).LoginPage,
    SignupPage: (DefaultThemePages as any).SignupPage,
    FeedPage: (DefaultThemePages as any).FeedPage,
    CreatorDashboardPage: (DefaultThemePages as any).CreatorDashboardPage,
    CreatorProfilePage: (DefaultThemePages as any).CreatorProfilePage,
    SinglePostPage: (DefaultThemePages as any).SinglePostPage,
    MessagesPage: (DefaultThemePages as any).MessagesPage,
    NotificationsPage: (DefaultThemePages as any).NotificationsPage,
    ShortsPage: (DefaultThemePages as any).ShortsPage,
    ExplorePage: (DefaultThemePages as any).ExplorePage,
    SavedPage: (DefaultThemePages as any).SavedPage,
    BalancePage: (DefaultThemePages as any).BalancePage,
    SettingsPage: (DefaultThemePages as any).SettingsPage,
    MemberDashboardPage: (DefaultThemePages as any).MemberDashboardPage,
    OnboardingPage: (DefaultThemePages as any).OnboardingPage,
    ConnectionsPage: (DefaultThemePages as any).ConnectionsPage,
  },
  layouts: {
    MainLayout: DefaultMainLayout,
    CreatorLayout: DefaultCreatorLayout,
    AuthLayout: DefaultAuthLayout,
    MinimalLayout: DefaultMinimalLayout,
  },
  components: {
    Navbar: (DefaultThemeComponents as any).Navbar,
    Sidebar: (DefaultThemeComponents as any).Sidebar,
    Footer: (DefaultThemeComponents as any).Footer,
    MobileNav: (DefaultThemeComponents as any).MobileNav,
    PostCard: (DefaultThemeComponents as any).PostCard,
    StoryBar: (DefaultThemeComponents as any).StoryBar,
    CreatorHeader: (DefaultThemeComponents as any).CreatorHeader,
    CreatorSidebar: (DefaultThemeComponents as any).CreatorSidebar,
    Button: (DefaultThemeComponents as any).Button,
    Card: (DefaultThemeComponents as any).Card,
    Avatar: (DefaultThemeComponents as any).Avatar,
    Badge: (DefaultThemeComponents as any).Badge,
    Modal: (DefaultThemeComponents as any).Modal,
    Toast: (DefaultThemeComponents as any).Toast,
    Sparkline: (DefaultThemeComponents as any).Sparkline,
    RoleSwitcher: (DefaultThemeComponents as any).RoleSwitcher,
  },
};

const STARTER_THEME_MODULE: ThemeModulePackage = {
  id: 'theme-starter-theme',
  slug: 'starter-theme',
  pages: {
    LandingPage: (StarterThemePages as any).LandingPage,
  },
  layouts: {
    MainLayout: StarterMainLayout,
    CreatorLayout: StarterCreatorLayout,
    AuthLayout: StarterAuthLayout,
  },
  components: {
    Button: (StarterThemeComponents as any).Button,
    Card: (StarterThemeComponents as any).Card,
    Badge: (StarterThemeComponents as any).Badge,
    Avatar: (StarterThemeComponents as any).Avatar,
  },
};

class ThemeRegistryManager {
  private modules: Map<string, ThemeModulePackage> = new Map();

  constructor() {
    this.registerModule(DEFAULT_THEME_MODULE);
    // Also register under aliases for backwards compatibility
    this.modules.set('theme-default-theme', DEFAULT_THEME_MODULE);
    this.modules.set('default-theme', DEFAULT_THEME_MODULE);
    this.modules.set('theme-blush-core', DEFAULT_THEME_MODULE);
    this.modules.set('blush-core', DEFAULT_THEME_MODULE);

    // Register starter theme module
    this.registerModule(STARTER_THEME_MODULE);
    this.modules.set('theme-starter-theme', STARTER_THEME_MODULE);
    this.modules.set('starter-theme', STARTER_THEME_MODULE);
  }

  public registerModule(module: ThemeModulePackage) {
    this.modules.set(module.id, module);
    if (module.slug) {
      this.modules.set(module.slug, module);
    }
  }

  public getModule(themeIdOrSlug: string): ThemeModulePackage | undefined {
    return this.modules.get(themeIdOrSlug);
  }

  /**
   * Resolve a page component with guaranteed safe fallback to DefaultTheme
   */
  public resolvePage(themeIdOrSlug: string, pageName: ThemePageName): {
    Component: React.ComponentType<any>;
    isOverridden: boolean;
    sourceTheme: string;
  } {
    const mod = this.modules.get(themeIdOrSlug);
    if (mod && mod.pages && mod.pages[pageName]) {
      return {
        Component: mod.pages[pageName]!,
        isOverridden: true,
        sourceTheme: mod.id,
      };
    }

    const def = DEFAULT_THEME_MODULE.pages![pageName];
    return {
      Component: def || (() => null),
      isOverridden: false,
      sourceTheme: 'theme-default-theme',
    };
  }

  /**
   * Resolve a layout component with guaranteed safe fallback to DefaultTheme
   */
  public resolveLayout(themeIdOrSlug: string, layoutName: ThemeLayoutName): {
    Component: React.ComponentType<any>;
    isOverridden: boolean;
    sourceTheme: string;
  } {
    const mod = this.modules.get(themeIdOrSlug);
    if (mod && mod.layouts && mod.layouts[layoutName]) {
      return {
        Component: mod.layouts[layoutName]!,
        isOverridden: true,
        sourceTheme: mod.id,
      };
    }

    const def = DEFAULT_THEME_MODULE.layouts![layoutName];
    return {
      Component: def || (() => null),
      isOverridden: false,
      sourceTheme: 'theme-default-theme',
    };
  }

  /**
   * Resolve a UI component with guaranteed safe fallback to DefaultTheme
   */
  public resolveComponent(themeIdOrSlug: string, componentName: ThemeComponentName): {
    Component: React.ComponentType<any>;
    isOverridden: boolean;
    sourceTheme: string;
  } {
    const mod = this.modules.get(themeIdOrSlug);
    if (mod && mod.components && mod.components[componentName]) {
      return {
        Component: mod.components[componentName]!,
        isOverridden: true,
        sourceTheme: mod.id,
      };
    }

    const def = DEFAULT_THEME_MODULE.components![componentName];
    return {
      Component: def || (() => null),
      isOverridden: false,
      sourceTheme: 'theme-default-theme',
    };
  }

  /**
   * Validate all overrides for a theme before activation
   */
  public validateThemeOverrides(manifest: ThemeManifest): ThemeOverrideValidationResult {
    const themeId = manifest.id;
    const themeSlug = manifest.slug;
    const mod = this.modules.get(themeId) || this.modules.get(themeSlug);

    const errors: string[] = [];
    const warnings: string[] = [];

    // Page Overrides Audit
    const pageReports: ThemeOverrideItemReport<ThemePageName>[] = ALL_THEME_PAGES.map((pageName) => {
      const isOverridden = Boolean(mod?.pages && mod.pages[pageName]);
      const comp = mod?.pages?.[pageName];
      let hasError = false;
      let errorMessage: string | undefined;

      if (isOverridden) {
        if (typeof comp !== 'function' && typeof comp !== 'object') {
          hasError = true;
          errorMessage = `Overridden page "${pageName}" is not a valid React component.`;
          errors.push(errorMessage);
        }
      }

      return {
        name: pageName,
        status: isOverridden && !hasError ? 'overridden' : 'fallback_default',
        isCustom: isOverridden,
        hasError,
        errorMessage,
      };
    });

    // Layout Overrides Audit
    const layoutReports: ThemeOverrideItemReport<ThemeLayoutName>[] = ALL_THEME_LAYOUTS.map((layoutName) => {
      const isOverridden = Boolean(mod?.layouts && mod.layouts[layoutName]);
      const comp = mod?.layouts?.[layoutName];
      let hasError = false;
      let errorMessage: string | undefined;

      if (isOverridden) {
        if (typeof comp !== 'function' && typeof comp !== 'object') {
          hasError = true;
          errorMessage = `Overridden layout "${layoutName}" is not a valid React component.`;
          errors.push(errorMessage);
        }
      }

      return {
        name: layoutName,
        status: isOverridden && !hasError ? 'overridden' : 'fallback_default',
        isCustom: isOverridden,
        hasError,
        errorMessage,
      };
    });

    // Component Overrides Audit
    const componentReports: ThemeOverrideItemReport<ThemeComponentName>[] = ALL_THEME_COMPONENTS.map((compName) => {
      const isOverridden = Boolean(mod?.components && mod.components[compName]);
      const comp = mod?.components?.[compName];
      let hasError = false;
      let errorMessage: string | undefined;

      if (isOverridden) {
        if (typeof comp !== 'function' && typeof comp !== 'object') {
          hasError = true;
          errorMessage = `Overridden component "${compName}" is not a valid React component.`;
          errors.push(errorMessage);
        }
      }

      return {
        name: compName,
        status: isOverridden && !hasError ? 'overridden' : 'fallback_default',
        isCustom: isOverridden,
        hasError,
        errorMessage,
      };
    });

    const totalOverridden =
      pageReports.filter((p) => p.status === 'overridden').length +
      layoutReports.filter((l) => l.status === 'overridden').length +
      componentReports.filter((c) => c.status === 'overridden').length;

    const totalFallback =
      pageReports.filter((p) => p.status === 'fallback_default').length +
      layoutReports.filter((l) => l.status === 'fallback_default').length +
      componentReports.filter((c) => c.status === 'fallback_default').length;

    if (totalOverridden === 0 && !manifest.isDefault) {
      warnings.push(`Theme "${manifest.name}" does not override any pages, layouts, or components; it will use 100% Default Theme templates with custom tokens/CSS.`);
    }

    return {
      isValid: errors.length === 0,
      themeId: manifest.id,
      themeSlug: manifest.slug,
      themeName: manifest.name,
      overrides: {
        pages: pageReports,
        layouts: layoutReports,
        components: componentReports,
      },
      summary: {
        totalOverridden,
        totalFallback,
        hasErrors: errors.length > 0,
      },
      errors,
      warnings,
    };
  }
}

export const themeRegistry = new ThemeRegistryManager();
