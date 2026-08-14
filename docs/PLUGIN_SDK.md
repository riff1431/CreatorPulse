# CreatorPulse Plugin SDK v1.0 Developer Guide

Welcome to the **CreatorPulse Plugin SDK**. This guide provides the complete specification, directory architecture, hooks, lifecycle handlers, database migrations, and packaging instructions for creating plugins.

---

## 1. Standardized Directory Architecture

Every plugin installed in CreatorPulse lives inside `/plugins/{plugin-slug}/` and follows this standardized structure:

```text
/plugins/{plugin-slug}/
├── manifest.json            # Plugin metadata, permissions, hooks, settings schema, dependencies
├── plugin.config.ts         # TypeScript lifecycle hooks (onInstall, onActivate, onDeactivate, onUpdate, onUninstall)
├── index.ts                 # Main plugin export entry point
├── README.md                # Developer documentation and installation notes
├── client/                  # Client-side React components & UI injection points
│   └── index.tsx
├── server/                  # Server-side controllers, middleware, and logic
│   └── index.ts
├── api/                     # Custom API endpoints & route handlers
│   └── handler.ts
├── components/              # UI widgets and modal components
│   └── PluginWidget.tsx
├── pages/                   # Admin panel / Creator dashboard dedicated sub-pages
│   └── SettingsPage.tsx
├── routes/                  # Dynamic route declarations
│   └── routes.ts
├── hooks/                   # Hook handler registrations (filters, actions, lifecycle)
│   └── usePluginHook.ts
├── services/                # Business logic services & third-party API SDK wrappers
│   └── plugin.service.ts
├── database/                # Database models and query helpers
│   └── schema.ts
├── migrations/              # Database schema migrations
│   └── 001_init.sql
├── settings/                # Settings schema and default configuration values
│   └── schema.json
├── permissions/             # Role-based capabilities and access control
│   └── permissions.json
├── icons/                   # Plugin icon and badge SVG assets
│   └── icon.svg
├── images/                  # Plugin preview screenshots and promotional graphics
│   └── banner.png
├── css/                     # Plugin stylesheet overrides and widget CSS
│   └── plugin.css
├── js/                      # Client-side JavaScript bundles
│   └── runtime.js
├── assets/                  # Static media, icons, and audio/video files
│   └── assets.json
├── locales/                 # Internationalization strings (i18n)
│   ├── en.json
│   └── es.json
├── jobs/                    # Background scheduled tasks / crons
│   └── sync-job.ts
├── events/                  # Event listeners & dispatchers
│   └── event-handlers.ts
├── webhooks/                # External webhook endpoints & verification logic
│   └── webhook-receiver.ts
├── tests/                   # Automated unit / integration tests
│   └── plugin.test.ts
└── docs/                    # Developer guides, API docs, and release notes
    └── README.md
```

---

## 2. Plugin Manifest (`manifest.json`)

The `manifest.json` defines all capabilities, permissions, hooks, and settings form fields:

```json
{
  "id": "plugin-telegram-sync",
  "name": "Telegram VIP Channel Sync",
  "slug": "telegram-sync",
  "version": "1.0.0",
  "description": "Automatically invites active subscribers to private VIP Telegram channels and revokes access upon expiry.",
  "author": "CreatorPulse Studio",
  "authorUrl": "https://creatorpulse.io",
  "category": "Integrations",
  "tags": ["Telegram", "VIP", "Sync", "Automation"],
  "minAppVersion": "1.2.0",
  "isEnabled": false,
  "hooks": [
    "creator_subscription_created",
    "creator_subscription_cancelled",
    "creator_dashboard_menu"
  ],
  "permissions": [
    "read:subscribers",
    "write:integrations",
    "manage:settings"
  ],
  "settingsSchema": [
    {
      "key": "botToken",
      "label": "Telegram Bot Token",
      "type": "password",
      "required": true,
      "description": "Obtain from @BotFather on Telegram."
    },
    {
      "key": "vipChannelId",
      "label": "VIP Telegram Channel ID",
      "type": "text",
      "required": true,
      "description": "Numeric Telegram channel ID (e.g. -1001234567890)."
    }
  ],
  "settingsValues": {
    "botToken": "",
    "vipChannelId": ""
  }
}
```

---

## 3. Plugin Configuration & Lifecycle Hooks (`plugin.config.ts`)

```typescript
import { PluginPackageConfig } from '@/lib/loaders/plugin-loader';
import manifest from './manifest.json';

export const pluginConfig: PluginPackageConfig = {
  manifest,
  onInstall: async () => {
    console.log(`[Plugin] Installed ${manifest.name}`);
  },
  onActivate: async () => {
    console.log(`[Plugin] Activated ${manifest.name}`);
  },
  onDeactivate: async () => {
    console.log(`[Plugin] Deactivated ${manifest.name}`);
  },
  onUpdate: async (ctx, prevVer) => {
    console.log(`[Plugin] Updated ${manifest.name} from v${prevVer} to v${manifest.version}`);
  },
  onUninstall: async () => {
    console.log(`[Plugin] Uninstalled ${manifest.name}`);
  }
};

export default pluginConfig;
```

---

## 4. Hook Subscriptions

Plugins can hook into any platform events:
- **`creator_subscription_created`**: Triggers when a fan subscribes.
- **`creator_subscription_cancelled`**: Triggers when a subscription expires.
- **`feed_post_action`**: Adds custom actions under feed posts.
- **`dashboard_widget`**: Injects custom metric widgets into the Creator Dashboard.
- **`payment_gateway_methods`**: Adds new checkout payment processors.

---

## 5. ZIP Packaging & Installation

To package and distribute a plugin:
1. Ensure `manifest.json` and `plugin.config.ts` are located at the root of the plugin archive.
2. Zip the plugin folder:
   ```bash
   zip -r plugin-telegram-sync.zip manifest.json plugin.config.ts index.ts README.md client server api components pages routes hooks services database migrations settings permissions icons images css js assets locales jobs events webhooks tests docs
   ```
3. Upload the `.zip` in Admin Panel under **Plugins &rarr; Upload Plugin (.ZIP / JSON)**.
