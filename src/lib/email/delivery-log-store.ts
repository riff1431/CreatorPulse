// ============================================================================
// Email Delivery Log Store — CreatorPulse Email & SMTP Manager
// ============================================================================

export type DeliveryStatus = 'sent' | 'failed' | 'bounced' | 'deferred' | 'queued';

export interface DeliveryLog {
  id: string;
  providerId: string | null;
  providerName: string;
  templateSlug: string | null;
  templateName: string | null;
  recipientEmail: string;
  subject: string;
  status: DeliveryStatus;
  errorMessage: string | null;
  messageId: string | null;
  sentAt: string;
  deliveredAt: string | null;
  meta: Record<string, unknown>;
}

export interface DeliveryLogFilter {
  status?: DeliveryStatus | 'all';
  providerId?: string | 'all';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

const STORAGE_LOGS_KEY = 'creatorpulse_email_delivery_logs';

// ── Demo seed data ──────────────────────────────────────────────────────────

function makeDate(daysAgo: number, hoursAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

export const DEMO_LOGS_EXPORT: DeliveryLog[] = [
  {
    id: 'log-1',
    providerId: 'smtp-demo-1',
    providerName: 'Primary Gmail SMTP',
    templateSlug: 'signup_welcome',
    templateName: 'Signup Welcome Email',
    recipientEmail: 'sarah@designcode.com',
    subject: 'Welcome to CreatorPulse, Sarah! 🎉',
    status: 'sent',
    errorMessage: null,
    messageId: 'msg_1a2b3c4d5e',
    sentAt: makeDate(0, 2),
    deliveredAt: makeDate(0, 2),
    meta: { latencyMs: 312 },
  },
  {
    id: 'log-2',
    providerId: 'smtp-demo-1',
    providerName: 'Primary Gmail SMTP',
    templateSlug: 'email_verification',
    templateName: 'Email Address Verification',
    recipientEmail: 'mark@techbrand.io',
    subject: 'Verify your email address for CreatorPulse',
    status: 'sent',
    errorMessage: null,
    messageId: 'msg_2b3c4d5e6f',
    sentAt: makeDate(0, 4),
    deliveredAt: makeDate(0, 4),
    meta: { latencyMs: 287 },
  },
  {
    id: 'log-3',
    providerId: 'smtp-demo-1',
    providerName: 'Primary Gmail SMTP',
    templateSlug: 'password_reset',
    templateName: 'Password Reset Instruction',
    recipientEmail: 'user@fakeinbox.xyz',
    subject: 'Reset your password for CreatorPulse',
    status: 'bounced',
    errorMessage: 'Mailbox does not exist — 550 5.1.1 The email account does not exist.',
    messageId: null,
    sentAt: makeDate(1, 1),
    deliveredAt: null,
    meta: { bounceCode: '5.1.1' },
  },
  {
    id: 'log-4',
    providerId: 'smtp-demo-1',
    providerName: 'Primary Gmail SMTP',
    templateSlug: 'membership_activated',
    templateName: 'VIP Membership Activated',
    recipientEmail: 'alex@creatorhub.net',
    subject: 'Your VIP Membership for Sarah Jenkins is Active! 🌟',
    status: 'sent',
    errorMessage: null,
    messageId: 'msg_4d5e6f7g8h',
    sentAt: makeDate(1, 6),
    deliveredAt: makeDate(1, 6),
    meta: { latencyMs: 401 },
  },
  {
    id: 'log-5',
    providerId: 'smtp-demo-1',
    providerName: 'Primary Gmail SMTP',
    templateSlug: 'payout_processed',
    templateName: 'Payout Processed Notice',
    recipientEmail: 'creator1@pulse.app',
    subject: 'Payout Processed: $1,250.00 sent to your bank account',
    status: 'sent',
    errorMessage: null,
    messageId: 'msg_5e6f7g8h9i',
    sentAt: makeDate(2, 0),
    deliveredAt: makeDate(2, 0),
    meta: { latencyMs: 198 },
  },
  {
    id: 'log-6',
    providerId: 'smtp-demo-1',
    providerName: 'Primary Gmail SMTP',
    templateSlug: 'signup_welcome',
    templateName: 'Signup Welcome Email',
    recipientEmail: 'test@tempmail.com',
    subject: 'Welcome to CreatorPulse, TestUser! 🎉',
    status: 'failed',
    errorMessage: 'Connection timeout — SMTP host unreachable after 30s.',
    messageId: null,
    sentAt: makeDate(2, 3),
    deliveredAt: null,
    meta: { retryCount: 3 },
  },
  {
    id: 'log-7',
    providerId: 'smtp-demo-2',
    providerName: 'SendGrid Fallback',
    templateSlug: 'system_notification',
    templateName: 'System Notification Announcement',
    recipientEmail: 'broadcast@creatorpulse.io',
    subject: 'Important System Announcement from CreatorPulse',
    status: 'sent',
    errorMessage: null,
    messageId: 'msg_7g8h9i0j1k',
    sentAt: makeDate(3, 2),
    deliveredAt: makeDate(3, 2),
    meta: { sentViaFallback: true, latencyMs: 523 },
  },
  {
    id: 'log-8',
    providerId: 'smtp-demo-1',
    providerName: 'Primary Gmail SMTP',
    templateSlug: 'email_verification',
    templateName: 'Email Address Verification',
    recipientEmail: 'newmember@gmail.com',
    subject: 'Verify your email address for CreatorPulse',
    status: 'deferred',
    errorMessage: 'Temporary failure — Greylisting delay (retry in 5 min)',
    messageId: 'msg_8h9i0j1k2l',
    sentAt: makeDate(4, 1),
    deliveredAt: makeDate(4, 0),
    meta: { deferredCount: 1 },
  },
  {
    id: 'log-9',
    providerId: 'smtp-demo-1',
    providerName: 'Primary Gmail SMTP',
    templateSlug: null,
    templateName: null,
    recipientEmail: 'admin@creatorpulse.com',
    subject: 'SMTP Test Email from CreatorPulse Admin',
    status: 'sent',
    errorMessage: null,
    messageId: 'msg_test_001',
    sentAt: makeDate(5, 0),
    deliveredAt: makeDate(5, 0),
    meta: { isTestEmail: true, latencyMs: 155 },
  },
  {
    id: 'log-10',
    providerId: 'smtp-demo-1',
    providerName: 'Primary Gmail SMTP',
    templateSlug: 'membership_activated',
    templateName: 'VIP Membership Activated',
    recipientEmail: 'vipfan@pulse.net',
    subject: 'Your VIP Membership for ProDesigns is Active! 🌟',
    status: 'sent',
    errorMessage: null,
    messageId: 'msg_10j1k2l3m',
    sentAt: makeDate(6, 5),
    deliveredAt: makeDate(6, 5),
    meta: { latencyMs: 342 },
  },
];

// ── Store functions ─────────────────────────────────────────────────────────

export function getDeliveryLogs(): DeliveryLog[] {
  if (typeof window === 'undefined') return DEMO_LOGS_EXPORT;
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(DEMO_LOGS_EXPORT));
      return DEMO_LOGS_EXPORT;
    }
    return JSON.parse(raw) as DeliveryLog[];
  } catch {
    return DEMO_LOGS_EXPORT;
  }
}

export function appendDeliveryLog(log: Omit<DeliveryLog, 'id' | 'sentAt'>): DeliveryLog {
  const newLog: DeliveryLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sentAt: new Date().toISOString(),
  };
  const all = getDeliveryLogs();
  const updated = [newLog, ...all];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(updated));
  }
  return newLog;
}

export function filterDeliveryLogs(logs: DeliveryLog[], filter: DeliveryLogFilter): DeliveryLog[] {
  return logs.filter((log) => {
    if (filter.status && filter.status !== 'all' && log.status !== filter.status) return false;
    if (filter.providerId && filter.providerId !== 'all' && log.providerId !== filter.providerId) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (
        !log.recipientEmail.toLowerCase().includes(q) &&
        !log.subject.toLowerCase().includes(q) &&
        !(log.templateName?.toLowerCase().includes(q)) &&
        !(log.providerName?.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    if (filter.dateFrom && log.sentAt < filter.dateFrom) return false;
    if (filter.dateTo && log.sentAt > filter.dateTo) return false;
    return true;
  });
}

export function getLogStats(logs: DeliveryLog[]): {
  total: number;
  sent: number;
  failed: number;
  bounced: number;
  deferred: number;
  deliveryRate: number;
} {
  const total = logs.length;
  const sent = logs.filter((l) => l.status === 'sent').length;
  const failed = logs.filter((l) => l.status === 'failed').length;
  const bounced = logs.filter((l) => l.status === 'bounced').length;
  const deferred = logs.filter((l) => l.status === 'deferred').length;
  const deliveryRate = total > 0 ? Math.round((sent / total) * 100) : 0;
  return { total, sent, failed, bounced, deferred, deliveryRate };
}

export const STATUS_META: Record<DeliveryStatus, { label: string; color: string; bg: string; border: string }> = {
  sent: { label: 'Sent', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  failed: { label: 'Failed', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  bounced: { label: 'Bounced', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  deferred: { label: 'Deferred', color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
  queued: { label: 'Queued', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
};
