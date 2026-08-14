# CreatorPulse Theme SDK v1.0 Developer Guide

Welcome to the **CreatorPulse Theme SDK**. This document provides the complete specification, directory architecture, styling guidelines, and packaging rules for developing frontend themes.

---

## 1. Directory Architecture

Every theme installed in CreatorPulse lives inside `/themes/{theme-slug}/` and adheres to this standardized directory structure:

```text
/themes/{theme-slug}/
├── manifest.json            # Theme metadata, version, SDK compatibility, token defaults
├── theme.config.ts          # TypeScript theme configuration and lifecycle hooks
├── index.ts                 # Main theme export entry point
├── README.md                # Developer documentation and usage notes
├── pages/                   # Theme-specific full-page overrides
│   ├── LandingPage.tsx
│   ├── FeedPage.tsx
│   └── ProfilePage.tsx
├── layouts/                 # Layout wrapper components
│   ├── MainLayout.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── components/              # Theme custom UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── PostCard.tsx
├── icons/                   # Custom SVG / icon set
│   └── index.ts
├── images/                  # Custom theme images, hero graphics, banners
│   └── hero-banner.png
├── fonts/                   # Web fonts or @font-face configuration
│   └── fonts.css
├── styles/                  # Core token CSS variables & global stylesheet
│   └── theme.css
├── css/                     # Component-specific CSS stylesheets
│   └── components.css
├── js/                      # Interactive client-side scripts / canvas / canvas effects
│   └── client-effects.ts
├── animations/              # GSAP / Framer Motion / CSS keyframe definitions
│   └── transitions.ts
├── assets/                  # Bundled static media & assets
│   └── asset-manifest.json
├── templates/               # Reusable page & email templates
│   └── welcome-template.html
├── partials/                # UI partial snippets (widgets, badge ribbons, tickers)
│   └── CreatorBadge.tsx
├── hooks/                   # Custom theme React hooks
│   └── useThemeEffects.ts
├── config/                  # Theme token definition schemas & color palette rules
│   └── theme.tokens.ts
├── locales/                 # Theme i18n translations
│   ├── en.json
│   └── es.json
└── preview/                 # Visual thumbnail and screenshot previews for admin panel
    ├── screenshot.png
    └── preview.json
```

---

## 2. Manifest Specification (`manifest.json`)

The `manifest.json` file is required in every theme package:

```json
{
  "id": "theme-rose-flow",
  "name": "Rose Flow Premium",
  "slug": "rose-flow",
  "version": "1.0.0",
  "description": "Elegant luxury dark theme tailored for high-end creators.",
  "author": "CreatorPulse Studio",
  "authorUrl": "https://creatorpulse.io",
  "previewImageUrl": "/previews/rose-flow.png",
  "category": "Luxury Dark",
  "tags": ["Dark Mode", "Luxury", "Glassmorphism", "Gradients"],
  "minAppVersion": "1.2.0",
  "isDefault": false,
  "tokens": {
    "primary": "#F43F5E",
    "primaryHover": "#E11D48",
    "softPrimary": "#FFE4E6",
    "lightPrimary": "#FFF1F2",
    "accent": "#FB7185",
    "background": "#0F0B15",
    "surface": "#1A1424",
    "surfaceSecondary": "#241D32",
    "border": "#2E243F",
    "textPrimary": "#FAF5FF",
    "textSecondary": "#D8B4FE",
    "textMuted": "#9333EA",
    "cardRadius": "24px",
    "buttonRadius": "16px",
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "fontHeading": "Cinzel, serif",
    "isDark": true
  },
  "settings": {
    "logoUrl": "",
    "faviconUrl": "",
    "containerWidth": "max-w-7xl",
    "buttonStyle": "gradient-glow",
    "animationIntensity": "subtle",
    "cardShadow": "glow"
  }
}
```

---

## 3. Theme Configuration (`theme.config.ts`)

```typescript
import { ThemePackageConfig } from '@/lib/loaders/theme-loader';
import manifest from './manifest.json';

export const themeConfig: ThemePackageConfig = {
  manifest,
  onInit: () => {
    console.log(`[Theme] Initialized ${manifest.name}`);
  },
  onActivate: () => {
    console.log(`[Theme] Activated ${manifest.name}`);
  },
  onDeactivate: () => {
    console.log(`[Theme] Deactivated ${manifest.name}`);
  }
};

export default themeConfig;
```

---

## 4. Theme Design Tokens & CSS Variables

When a theme is active, CreatorPulse applies its tokens directly to `:root[data-theme="..."]`:

```css
:root[data-theme="theme-rose-flow"] {
  --theme-primary: #F43F5E;
  --theme-primary-hover: #E11D48;
  --theme-soft-primary: #FFE4E6;
  --theme-light-primary: #FFF1F2;
  --theme-accent: #FB7185;
  --theme-bg: #0F0B15;
  --theme-surface: #1A1424;
  --theme-surface-secondary: #241D32;
  --theme-border: #2E243F;
  --theme-text-primary: #FAF5FF;
  --theme-text-secondary: #D8B4FE;
  --theme-text-muted: #9333EA;
  --theme-card-radius: 24px;
  --theme-button-radius: 16px;
  --theme-font-family: 'Plus Jakarta Sans', sans-serif;
}
```

---

## 5. ZIP Packaging & Installation

To distribute a theme:
1. Ensure `manifest.json` and `theme.config.ts` are at the package root.
2. Zip the theme folder contents:
   ```bash
   zip -r theme-rose-flow.zip manifest.json theme.config.ts index.ts README.md pages layouts components icons images fonts styles css js animations assets templates partials hooks config locales preview
   ```
3. In the Admin Panel, navigate to **Themes &rarr; Upload Theme (.ZIP / JSON)** to install and activate dynamically.
