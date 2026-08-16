# Creator Verification Manager Plugin

## Overview
Enterprise-grade identity verification system for creators on CreatorPulse.

## Features
- Configurable verification requirements (Government ID, Selfie, Proof of Address, Social Media)
- Secure document uploads via platform Storage Service
- Multi-step admin review workflow: Approve / Reject / Request Changes
- Verification badges (Standard, Premium, Animated)
- Internal admin notes system
- Complete status history & audit trail
- Automated notifications for all status changes
- Configurable verification expiry
- Role-based access control (Admin/Super Admin only)

## Database Tables
- `cp_verification_applications` — Stores all verification applications
- `cp_verification_history` — Immutable audit trail of status changes
- `cp_verification_notes` — Internal and external notes on applications

## API Endpoints
All endpoints are accessible via `/api/plugins/creator-verification/`:

| Method | Route | Description | Role |
|--------|-------|-------------|------|
| GET | /stats | Dashboard statistics | Admin |
| GET | /applications | List all applications | Admin |
| GET | /applications/:id | Application detail | Admin |
| GET | /applications/:id/history | Status history | Admin |
| GET | /applications/:id/notes | Application notes | Admin |
| GET | /my-application | Current user's application | Creator |
| POST | /applications | Submit application | Creator |
| POST | /applications/:id/approve | Approve application | Admin |
| POST | /applications/:id/reject | Reject application | Admin |
| POST | /applications/:id/request-changes | Request changes | Admin |
| POST | /applications/:id/revoke | Revoke verification | Admin |
| POST | /applications/:id/notes | Add note | Admin |
| POST | /upload | Upload document | Creator |

## Settings
Configurable via Admin → Plugins → Verification Manager → Settings.

## Version History
- v1.0.0 (2026-08-16): Initial release
