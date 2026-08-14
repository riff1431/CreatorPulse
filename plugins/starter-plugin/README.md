# CreatorPulse Starter Plugin v1.0

Build powerful Next.js-native add-ons for the CreatorPulse ecosystem.

## Directory Structure
- `manifest.json`: Defines plugin metadata, version, category, permissions, hooks, and settings schema.
- `plugin.config.ts`: Type-safe configuration with lifecycle hooks (`onInstall`, `onActivate`, `onDeactivate`, `onUpdate`, `onUninstall`).
- `client/`: Client-side UI widgets and interactive components.
- `server/`: Server actions and backend logic.
- `components/`: Reusable React components.
- `hooks/`: Subscriber functions for platform hooks (`navbar_actions`, `post_card_footer`, `creator_dashboard_widgets`, etc.).
- `migrations/`: Optional SQL migration scripts for database extensions.
- `settings/`: Default settings schema.
- `assets/`: Plugin icons, images, and resources.

## Lifecycle Methods
- `onInstall(ctx)`: Executed once when the plugin package is installed.
- `onActivate(ctx)`: Executed whenever the admin activates the plugin.
- `onDeactivate(ctx)`: Executed when the plugin is deactivated.
- `onUpdate(ctx, fromVersion)`: Executed during version upgrades.
- `onUninstall(ctx)`: Executed when deleting the plugin.

## Packaging
Zip your plugin root folder and upload it via the Admin Panel under **Plugins -> Upload ZIP**.
