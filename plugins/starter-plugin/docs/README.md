# CreatorPulse Plugin Development Reference

This document outlines the capabilities, boundaries, and best practices for developing Next.js modular extensions for CreatorPulse using Plugin SDK v1.0.

## Plugin Lifecycle Handlers
All extensions must implement and export the core lifecycle hooks within `plugin.config.ts`. The platform triggers these events automatically:

1. **`onInstall(ctx)`**: Called once when the ZIP package is successfully uploaded and extracted. Perfect for running database migrations or initializing setting defaults.
2. **`onActivate(ctx)`**: Called when the administrator toggles the plugin to an enabled state. Used to register runtime events, hooks, and dynamic listeners.
3. **`onDeactivate(ctx)`**: Called when disabled. Clean up event emitters and disable custom filters.
4. **`onUpdate(ctx, fromVersion)`**: Executed when upgrading files to a higher version. Use to run database schema upgrades.
5. **`onUninstall(ctx)`**: Triggered when deleted from the system. Completely purge table structures and credentials to keep system footprint clean.

## Hooks Integration
The manifest declares hooks subscriptions:
- **`navbar_actions`**: Render quick utility buttons or balance display widgets in the main portal navigation.
- **`post_card_footer`**: Inject badges, DRM watermarks, quick gifting triggers, or player overlays.
- **`creator_dashboard_widgets`**: Inject custom graphs, statistics tracking, or AI generation templates into the creator admin panel.

## Database Migrations
Migrations sit under the `/migrations/` directory. All files named `*.sql` will be read and executed in sequence against the database during `onInstall` / `onUpdate`. Keep SQL statements idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).

## REST & Dynamic APIs
API routes declared inside `/api/` are automatically served dynamically under:
`/api/plugins/[plugin-slug]/[...route]`

Example: POST requests sent to `/api/plugins/starter-plugin/submit` will resolve inside `/api/handler.ts` or custom controllers.
