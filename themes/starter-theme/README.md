# CreatorPulse Starter Theme v1.0

Welcome to the CreatorPulse Theme Development Kit!

## Directory Structure
- `manifest.json`: Defines theme metadata, category, version, and default visual tokens.
- `theme.config.ts`: Type-safe theme configuration export.
- `tokens/index.ts`: Design token palette (colors, radii, fonts, dark/light modes).
- `styles/theme.css`: Theme-specific CSS custom properties.
- `components/`: Optional custom component overrides.
- `layouts/`: Custom layout definitions for public frontend pages.
- `pages/`: Custom hero templates or custom profile headers.
- `preview/`: Preview screenshots and promotional assets.

## How to Package
1. Zip the contents of your theme folder:
   ```bash
   zip -r my-theme.zip ./manifest.json ./theme.config.ts ./tokens ./styles ./components ./layouts ./preview
   ```
2. In the Admin Panel, navigate to **Themes -> Upload ZIP** to install and activate your theme.
