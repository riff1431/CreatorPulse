# CreatorPulse Starter Plugin v1.0

Build powerful, Next.js-native modular extensions for the CreatorPulse ecosystem.

## Standard Directory Structure (Plugin SDK compliance)
To pass validation, plugins must conform strictly to the standard folder structure:

- `/client/`: Frontend entry points and layout overrides (e.g. `index.tsx`).
- `/server/`: Node/Server Actions and database execution scripts.
- `/api/`: Custom backend endpoint routes (e.g. `handler.ts`).
- `/components/`: Interactive React components (e.g. `PluginWidget.tsx`).
- `/pages/`: Full dashboard page overrides (e.g. `SettingsPage.tsx`).
- `/routes/`: Routing tables linking paths to plugin views.
- `/hooks/`: React state hooks or custom hook interceptors.
- `/services/`: Business logic files (e.g. `plugin.service.ts`).
- `/database/`: Database type schemas (e.g. `schema.ts`).
- `/migrations/`: Idempotent SQL setup scripts (e.g. `001_init.sql`).
- `/settings/`: Settings structure JSON definition schemas.
- `/permissions/`: Required execution permission arrays (e.g. `permissions.json`).
- `/icons/`: Custom icons.
- `/images/`: Static images.
- `/css/`: Supporting stylesheets (e.g. `plugin.css`).
- `/js/`: Supporting javascript/typescript utilities (e.g. `runtime.js`).
- `/assets/`: Static raw assets.
- `/locales/`: Localized text files (e.g. `en.json`).
- `/jobs/`: Cron jobs or scheduled tasks (e.g. `sync-job.ts`).
- `/events/`: Event handlers listening to core platform triggers (e.g. `event-handlers.ts`).
- `/webhooks/`: Outgoing event dispatchers and webhook handlers.
- `/tests/`: Automated test suites (e.g. `plugin.test.ts`).
- `/docs/`: Developer documentation and guides.

## Manifest Configuration
`manifest.json` defines settings schemas, permission boundaries, and active hooks. The system uses this declaration for rendering configurations.

## How to Package as a ZIP Archive
To install custom plugins via the CreatorPulse Admin Dashboard (**Plugins -> Upload ZIP**), you must package your plugin inside a single root folder matching your plugin slug (e.g., `/starter-plugin/`). The ZIP archive must contain this single root folder as its only top-level element.

From the parent directory of your plugin:
```bash
zip -r starter-plugin.zip starter-plugin/ -x "*.git*"
```
Upload via the Admin Dashboard (**Plugins -> Upload ZIP**) to install.
