# Content Scheduling & Auto-Publishing Add-on Plugin

A standalone Add-on Plugin for CreatorPulse built using **Plugin SDK v1.0**.

## Key Features
- **Multi-Format Scheduling**: Schedule Feed Posts (text, image, video), Video Reels, and 24h Ephemeral Stories.
- **Calendar & Queue Management**: Interactive monthly calendar grid and filtered queue list view.
- **Timezone Awareness**: Full support for UTC and local target creator timezones with conversion previews.
- **Background Jobs & Worker Engine**: Automated polling worker for auto-publishing scheduled items at due times.
- **Failure Retries & Error Tracing**: Automatic retry handling with backoff delay, manual force-publish override, and retry buttons.
- **Audit Execution Logging**: Audit history tracking every schedule creation, edit, reschedule, cancellation, publish event, and failure.
- **Plugin Lifecycle & Permissions**: Fully compliant with `PluginSDK v1.0` permissions (`storage_access`, `notifications_send`, `security_audit`) and hooks. Runs only while plugin is active (`isEnabled`).

## Folder Structure (SDK v1.0 Compliant)
```
plugins/content-scheduling/
├── client/
├── server/
├── api/
├── components/
│   ├── CreatorScheduleDashboard.tsx
│   └── AdminScheduleQueueManager.tsx
├── pages/
├── routes/
├── hooks/
├── services/
│   └── scheduling-service.ts
├── database/
├── migrations/
│   └── 001_init.sql
├── settings/
├── permissions/
├── icons/
├── images/
├── css/
├── js/
├── assets/
├── locales/
├── jobs/
├── events/
├── webhooks/
├── tests/
├── docs/
├── manifest.json
├── plugin.config.ts
├── index.ts
└── README.md
```
