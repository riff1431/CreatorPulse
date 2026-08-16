# CreatorPulse Starter Theme SDK v1.1.0

Welcome to the official CreatorPulse Theme SDK starter template! This boilerplate allows developers to build, test, and distribute custom themes for the CreatorPulse platform.

## Standard Directory Structure (Theme SDK compliance)
To be recognized and loaded correctly, your theme package must contain only the following 17 folders. Unrecognized folder names will fail validation checks during admin ZIP uploads.

- `/pages/`: Page template overrides (e.g. `LandingPage.tsx`, `FeedPage.tsx`, `CreatorProfilePage.tsx`).
- `/layouts/`: Layout wrappers (e.g. `MainLayout.tsx`, `CreatorLayout.tsx`, `AuthLayout.tsx`).
- `/components/`: Atomic UI component overrides (e.g. `Button.tsx`, `Card.tsx`, `Badge.tsx`, `Avatar.tsx`).
- `/icons/`: Custom SVG or React icon components.
- `/images/`: Static image assets (PNG, JPG, SVG, WebP).
- `/fonts/`: Local font files. Import them using `@font-face` in `styles/theme.css`.
- `/styles/`: CSS stylesheets. `theme.css` is processed dynamically to apply theme variables.
- `/css/`: Supporting stylesheet assets (e.g. `components.css`).
- `/js/`: Client-side script behaviors and utilities.
- `/animations/`: Shared CSS transition configurations and GSAP motion presets.
- `/assets/`: Supporting resource/media files.
- `/templates/`: Structural templates.
- `/partials/`: Reusable sub-components (e.g. `CreatorBadge.tsx`, `PricingCard.tsx`).
- `/hooks/`: React state hooks (e.g. `useThemeEffects.ts`, `useThemeMotion.ts`).
- `/config/`: Configuration values. Core tokens must reside in `config/theme.tokens.ts`.
- `/locales/`: Internationalization translation files (e.g. `en.json`).
- `/preview/`: Administrative preview manifest and thumbnail graphics.

## Core Files
- `manifest.json`: Configuration manifest defining version, author, preview image, category, tags, design tokens, and override declarations.
- `theme.config.ts`: Entry configuration type binding the manifest to runtime design tokens.
- `index.ts`: Standard JS module entry point exporting all overridden components, layouts, and pages.

## How to Package as a ZIP Archive
To install custom themes via the CreatorPulse Admin Dashboard (**Themes -> Upload ZIP**), package your theme inside a single root folder matching your theme slug (e.g., `/starter-theme/`). The ZIP archive must contain this single root folder as its only top-level element.

From the parent directory of your theme:
```bash
zip -r starter-theme.zip starter-theme/ -x "*.git*"
```
