# CreatorPulse Theme SDK v1.0 — Architecture & Developer Guide

## 1. Overview
CreatorPulse uses a WordPress-inspired, Next.js-native Theme Architecture. Every installed theme lives in its own isolated subfolder within `/themes/{theme-slug}`.

Themes in CreatorPulse are **strictly isolated to frontend and public-facing layouts** (User Feed, Creator Studio, Member Portal, Auth pages, Profiles, and Reels). The Admin Control Panel is permanently sandboxed to dedicated administrative design tokens.

---

## 2. Directory Structure

Every theme package must conform to the following directory layout:

```
/themes/{theme-slug}/
├── manifest.json         # Standardized metadata & default configuration
├── theme.config.ts       # Type-safe exported ThemeManifest object
├── README.md             # Documentation for your theme
├── tokens/               # Design token definitions
│   └── index.ts          # Colors, radii, typography, spacing
├── styles/               # CSS custom properties & overrides
│   └── theme.css         # Theme scoped CSS stylesheet
├── components/           # Custom React component overrides (optional)
│   ├── ThemeBadge.tsx
│   └── ThemeCard.tsx
├── layouts/              # Theme page layouts & shells (optional)
│   ├── ThemeHeader.tsx
│   └── ThemeSidebar.tsx
├── pages/                # Custom page templates (optional)
│   └── HeroSection.tsx
└── preview/              # Theme thumbnail & screenshot assets
    └── preview.png
```

---

## 3. Theme Manifest Specification (`manifest.json`)

```json
{
  "id": "theme-my-theme",
  "name": "My Custom Theme",
  "slug": "my-theme",
  "description": "High-conversion creator theme with dark glass aesthetics.",
  "version": "1.0.0",
  "author": "Your Studio",
  "authorUrl": "https://yourstudio.com",
  "previewImageUrl": "https://yourstudio.com/preview.png",
  "category": "Dark Cyber",
  "tags": ["Dark Mode", "Neon", "Cyberpunk"],
  "minAppVersion": "1.0.0",
  "tokens": {
    "primary": "#EC4899",
    "primaryHover": "#DB2777",
    "softPrimary": "#FCE7F3",
    "lightPrimary": "#FDF2F8",
    "accent": "#F43F5E",
    "background": "#0F172A",
    "surface": "#1E293B",
    "surfaceSecondary": "#334155",
    "border": "#334155",
    "textPrimary": "#F8FAFC",
    "textSecondary": "#94A3B8",
    "textMuted": "#64748B",
    "cardRadius": "16px",
    "buttonRadius": "12px",
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "isDark": true
  },
  "settings": {
    "containerWidth": "max-w-7xl",
    "buttonStyle": "gradient-glow",
    "animationIntensity": "normal",
    "cardShadow": "glow"
  },
  "changelog": [
    { "version": "1.0.0", "date": "2026-08-15", "changes": ["Initial theme release"] }
  ]
}
```

---

## 4. Theme Configuration (`theme.config.ts`)

```typescript
import { ThemeManifest } from '@/lib/extensions/theme-types';
import manifest from './manifest.json';
import { myThemeTokens } from './tokens';

export const themeConfig: ThemeManifest = {
  ...(manifest as unknown as ThemeManifest),
  tokens: myThemeTokens,
};

export default themeConfig;
```

---

## 5. Standard CSS Custom Properties (`styles/theme.css`)

```css
:root[data-theme='theme-my-theme'] {
  --theme-primary: #EC4899;
  --theme-primary-hover: #DB2777;
  --theme-soft-primary: #FCE7F3;
  --theme-light-primary: #FDF2F8;
  --theme-accent: #F43F5E;
  --theme-bg: #0F172A;
  --theme-surface: #1E293B;
  --theme-surface-secondary: #334155;
  --theme-border: #334155;
  --theme-text-primary: #F8FAFC;
  --theme-text-secondary: #94A3B8;
  --theme-text-muted: #64748B;
  --theme-card-radius: 16px;
  --theme-button-radius: 12px;
  --theme-font-family: 'Plus Jakarta Sans', sans-serif;
}
```

---

## 6. How to Package and Publish

1. Compress the contents of your theme folder into a `.zip` file:
   ```bash
   zip -r my-theme.zip ./manifest.json ./theme.config.ts ./tokens ./styles ./components ./layouts ./preview
   ```
2. Navigate to **Admin Panel -> Themes -> Upload ZIP**.
3. The platform validates your manifest and tokens, registers the theme into `/themes/my-theme`, and allows one-click activation.
