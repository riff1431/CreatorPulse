# Creator Verification Manager Plugin v1.0.0

Enterprise-grade identity verification system for creators on CreatorPulse.

## Standard Directory Structure (Plugin SDK compliance)
- `/client/`: Frontend entry points and layout overrides (`index.tsx`).
- `/server/`: Node/Server Actions (`index.ts`).
- `/api/`: Custom backend endpoint handler (`handler.ts`).
- `/components/`: Interactive React components (`VerificationDashboard.tsx`, `VerificationBadge.tsx`, `VerificationApplicationForm.tsx`, `VerificationStatusWidget.tsx`).
- `/pages/`: Full dashboard page overrides (`SettingsPage.tsx`).
- `/routes/`: Routing tables linking paths to plugin views (`routes.ts`).
- `/hooks/`: React state hooks (`useVerification.ts`).
- `/services/`: Business logic service layer (`plugin.service.ts`).
- `/database/`: Database type schemas (`schema.ts`).
- `/migrations/`: Idempotent SQL setup scripts (`001_init.sql`).
- `/settings/`: Settings structure JSON definition schemas (`schema.json`).
- `/permissions/`: Required execution permission arrays (`permissions.json`).
- `/icons/`: Custom icons.
- `/images/`: Static images.
- `/css/`: Supporting stylesheets (`plugin.css`).
- `/js/`: Supporting javascript/typescript utilities.
- `/assets/`: Static raw assets.
- `/locales/`: Localized text files (`en.json`).
- `/jobs/`: Cron jobs or scheduled tasks.
- `/events/`: Event handlers listening to platform triggers (`event-handlers.ts`).
- `/webhooks/`: Outgoing event dispatchers and webhook handlers.
- `/tests/`: Automated test suites.
- `/docs/`: Developer documentation and guides (`README.md`).

## How to Package as a ZIP Archive
From the `plugins/` directory:
```bash
zip -r creator-verification.zip creator-verification/ -x "*.git*"
```
Upload via Admin Dashboard (**Plugins -> Upload ZIP**) to install.
