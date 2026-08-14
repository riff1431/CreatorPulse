# CreatorPulse Starter Theme v1.0

Welcome to the official CreatorPulse Theme SDK starter template! This folder serves as a boilerplate for creating fully custom public themes.

## Standard Directory Structure (Theme SDK compliance)
To be recognized and loaded correctly, your theme package must contain only the following 17 folders. Unrecognized folder names will fail validation checks.

- `/pages/`: Page template overrides (e.g. `LandingPage.tsx` for custom landing layout).
- `/layouts/`: Layout wrappers (e.g. `MainLayout.tsx` for header/sidebar/footer frames).
- `/components/`: Atomic UI component overrides (e.g. `Button.tsx`).
- `/icons/`: Custom SVG or React icon components.
- `/images/`: Static image files (PNG/JPG/SVG).
- `/fonts/`: Local font files. Import them using `@font-face` in `styles/theme.css`.
- `/styles/`: CSS sheets. `theme.css` is processed dynamically to apply theme variables.
- `/css/`: Supporting stylesheet assets (e.g. `components.css`).
- `/js/`: Client side script behaviors (e.g. `client-effects.ts`).
- `/animations/`: Shared CSS transition configurations.
- `/assets/`: Supporting resource/media files.
- `/templates/`: Structural templates (HTML/Handlebars/TSX).
- `/partials/`: Reusable sub-components (e.g. `CreatorBadge.tsx`).
- `/hooks/`: React state hooks (e.g. `useThemeEffects.ts`).
- `/config/`: Configuration values. Core tokens must reside in `config/theme.tokens.ts`.
- `/locales/`: Internationalization files (e.g. `en.json`).
- `/preview/`: Administrative preview manifest and thumbnails.

## Core Files
- `manifest.json`: Configuration manifest defining version, author, preview image, and token defaults.
- `theme.config.ts`: Entry configuration type binding the manifest to runtime design tokens.
- `index.ts`: Standard JS module entry point exporting configurations.

## How to Package as a ZIP Archive
To install custom themes via the CreatorPulse Admin Dashboard (**Themes -> Upload ZIP**), you must package your theme inside a single root folder matching your theme slug (e.g., `/starter-theme/`). The ZIP archive must contain this single root folder as its only top-level element.

From the parent directory of your theme:
```bash
zip -r starter-theme.zip starter-theme/ -x "*.git*"
```
