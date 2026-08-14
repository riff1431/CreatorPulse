# CreatorPulse Plugin SDK v1.0 — Architecture & Developer Guide

## 1. Overview
CreatorPulse uses a WordPress-inspired, Next.js-native Plugin Architecture. Every installed plugin or add-on lives in its own isolated subfolder within `/plugins/{plugin-slug}`.

Plugins allow developers to safely extend features, inject widgets into UI hooks, run database migrations, declare administrative settings, and attach server-side logic without modifying core platform source files.

---

## 2. Directory Structure

```
/plugins/{plugin-slug}/
├── manifest.json         # Standardized metadata, permissions, hooks, settings schema
├── plugin.config.ts      # Lifecycle handlers (onInstall, onActivate, etc.)
├── README.md             # Documentation for developers
├── client/               # Client-side UI widgets and components
│   └── index.ts
├── server/               # Server actions & API endpoint handlers
│   └── actions.ts
├── components/           # Reusable plugin React components
│   └── CustomWidget.tsx
├── routes/               # Custom plugin page routes (optional)
├── hooks/                # Hook subscriber functions
│   └── index.ts
├── migrations/           # SQL database migrations (optional)
│   └── 001_initial_schema.sql
├── settings/             # Settings definitions & defaults
└── assets/               # Plugin icons and badges
    └── icon.svg
```

---

## 3. Plugin Manifest Specification (`manifest.json`)

```json
{
  "id": "plugin-my-addon",
  "name": "My Custom Add-on",
  "slug": "my-addon",
  "description": "Adds high-performance automated analytics to creator profiles.",
  "version": "1.0.0",
  "author": "Your Studio",
  "authorUrl": "https://yourstudio.com",
  "iconUrl": "⚡",
  "category": "Marketing & SEO",
  "tags": ["Analytics", "Automation"],
  "minAppVersion": "1.0.0",
  "permissions": ["storage_access", "notifications_send"],
  "hooks": ["navbar_actions", "creator_dashboard_widgets", "post_card_footer"],
  "isEnabled": false,
  "autoUpdate": true,
  "settingsSchema": [
    {
      "id": "apiKey",
      "label": "API Key",
      "type": "password",
      "defaultValue": "",
      "placeholder": "sk_live_..."
    },
    {
      "id": "enableTelemetry",
      "label": "Enable Telemetry",
      "type": "boolean",
      "defaultValue": true
    }
  ],
  "settingsValues": {
    "apiKey": "",
    "enableTelemetry": true
  },
  "changelog": [
    { "version": "1.0.0", "date": "2026-08-15", "changes": ["Initial release"] }
  ]
}
```

---

## 4. Plugin Configuration & Lifecycle Handlers (`plugin.config.ts`)

```typescript
import { PluginManifest } from '@/lib/extensions/plugin-types';
import manifest from './manifest.json';

export interface PluginLifecycleContext {
  pluginId: string;
  version: string;
}

export const pluginConfig = {
  manifest: manifest as unknown as PluginManifest,

  // Executed once when the plugin package is first installed
  onInstall: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin ${ctx.pluginId}] Installed v${ctx.version}`);
    return { success: true };
  },

  // Executed whenever the plugin is enabled in Admin Console
  onActivate: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin ${ctx.pluginId}] Activated`);
    return { success: true };
  },

  // Executed whenever the plugin is disabled
  onDeactivate: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin ${ctx.pluginId}] Deactivated`);
    return { success: true };
  },

  // Executed during version updates
  onUpdate: async (ctx: PluginLifecycleContext, fromVersion: string) => {
    console.log(`[Plugin ${ctx.pluginId}] Updated from ${fromVersion} to ${ctx.version}`);
    return { success: true };
  },

  // Executed when the plugin is removed
  onUninstall: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin ${ctx.pluginId}] Uninstalled and cleaned up`);
    return { success: true };
  }
};

export default pluginConfig;
```

---

## 5. Supported Extension Hooks

| Hook Identifier | Placement Location | Description |
| :--- | :--- | :--- |
| `navbar_actions` | Top Navigation Header | Injects icons, quick actions, and status badges |
| `sidebar_extra_links` | Main & Creator Sidebars | Appends custom navigation links and shortcuts |
| `post_card_footer` | Post / Reel Card Bottom | Injects gift buttons, tips, DRM stamps, reactions |
| `post_card_header` | Post / Reel Card Header | Injects social badges, verification icons |
| `creator_dashboard_widgets` | Creator Studio Home | Renders rich analytical and management cards |
| `member_dashboard_widgets` | Fan / Member Dashboard | Renders membership perks, VIP badges |
| `payment_gateway_methods` | Checkout Drawer | Registers custom credit, crypto, or local payment channels |

---

## 6. How to Package and Publish

1. Compress your plugin root directory into a `.zip` archive:
   ```bash
   zip -r my-addon.zip ./manifest.json ./plugin.config.ts ./client ./server ./components ./hooks ./migrations ./settings
   ```
2. In the Admin Panel, navigate to **Plugins -> Upload ZIP**.
3. The platform validates your manifest, permissions, and hooks, registers the plugin into `/plugins/my-addon`, and prepares it for activation.
