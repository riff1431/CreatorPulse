export type SystemLogCategory = 
  | 'admin_actions'
  | 'login_activity'
  | 'plugin_theme'
  | 'system_errors'
  | 'payment_events'
  | 'security_events';

export type SystemLogSeverity = 'info' | 'success' | 'warning' | 'error' | 'critical';

export interface SystemLogEntry {
  id: string;
  category: SystemLogCategory;
  action: string;
  targetEntity: string;
  details: string;
  user: string;
  role: string;
  severity: SystemLogSeverity;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  payloadJson?: string;
}

const STORAGE_SYSTEM_LOGS_KEY = 'creatorpulse_system_audit_logs';

export const INITIAL_SYSTEM_LOGS: SystemLogEntry[] = [
  {
    id: 'log-101',
    category: 'admin_actions',
    action: 'ROLE_ASSIGNMENT',
    targetEntity: 'User: @sarahdesign',
    details: 'Elevated user account role permissions from member to creator',
    user: 'Elena Rostova',
    role: 'super_admin',
    severity: 'success',
    timestamp: '2026-08-15 00:45:12',
    ipAddress: '192.168.1.42',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    payloadJson: JSON.stringify({ userId: '2', previousRole: 'member', nextRole: 'creator', actorId: '4' }, null, 2)
  },
  {
    id: 'log-102',
    category: 'login_activity',
    action: 'USER_LOGIN',
    targetEntity: 'User: @marcuscode',
    details: 'Successful multi-factor authentication sign in via WebAuthn session',
    user: 'Marcus Vance',
    role: 'creator',
    severity: 'info',
    timestamp: '2026-08-15 00:30:00',
    ipAddress: '104.28.192.12',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    payloadJson: JSON.stringify({ method: 'passkey', sessionExpiry: '24h', provider: 'supabase' }, null, 2)
  },
  {
    id: 'log-103',
    category: 'plugin_theme',
    action: 'THEME_ACTIVATION',
    targetEntity: 'Theme: Blush Core Premium',
    details: 'Activated theme preset "Blush Core" as default system layout',
    user: 'Elena Rostova',
    role: 'super_admin',
    severity: 'success',
    timestamp: '2026-08-14 22:15:00',
    ipAddress: '192.168.1.42',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    payloadJson: JSON.stringify({ themeId: 'blush-core', version: '2.4.0', cssVariables: 18 }, null, 2)
  },
  {
    id: 'log-104',
    category: 'payment_events',
    action: 'PAYOUT_PROCESSED',
    targetEntity: 'Creator: @sarahdesign ($1,250.00)',
    details: 'Automated bank transfer payout batch cleared by Stripe Connect webhook',
    user: 'Stripe Gateway',
    role: 'system',
    severity: 'success',
    timestamp: '2026-08-14 20:00:15',
    ipAddress: '54.187.205.18',
    userAgent: 'Stripe-Webhook-Dispatcher/v1',
    payloadJson: JSON.stringify({ payoutId: 'po_991823', amount: 1250.00, fee: 12.50, currency: 'usd' }, null, 2)
  },
  {
    id: 'log-105',
    category: 'system_errors',
    action: 'REDIS_CONNECTION_TIMEOUT',
    targetEntity: 'Service: Cache Cluster #2',
    details: 'Cache read request timed out after 3000ms. Fallback to Supabase direct query executed.',
    user: 'System Worker',
    role: 'daemon',
    severity: 'warning',
    timestamp: '2026-08-14 18:12:44',
    ipAddress: '127.0.0.1',
    userAgent: 'Node/20.11.0 Internal Worker',
    payloadJson: JSON.stringify({ service: 'redis', host: 'cache-us-east.db', stack: 'TimeoutError: Connection timed out at Socket.<anonymous>' }, null, 2)
  },
  {
    id: 'log-106',
    category: 'security_events',
    action: 'RATE_LIMIT_EXCEEDED',
    targetEntity: 'Endpoint: /api/auth/login',
    details: 'Blocked 15 rapid consecutive failed authentication attempts from IP 185.220.101.5',
    user: 'Anonymous',
    role: 'unauthenticated',
    severity: 'error',
    timestamp: '2026-08-14 16:45:02',
    ipAddress: '185.220.101.5',
    userAgent: 'Python-requests/2.28.1',
    payloadJson: JSON.stringify({ attemptedUsername: 'admin', lockDurationMinutes: 30, ipReputation: 'suspicious_tor' }, null, 2)
  },
  {
    id: 'log-107',
    category: 'admin_actions',
    action: 'MAINTENANCE_MODE_TOGGLED',
    targetEntity: 'System Config',
    details: 'Enabled temporary maintenance window for database schema migration',
    user: 'Elena Rostova',
    role: 'super_admin',
    severity: 'warning',
    timestamp: '2026-08-14 14:10:00',
    ipAddress: '192.168.1.42',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    payloadJson: JSON.stringify({ maintenanceMode: true, estimatedMinutes: 15, bypassIp: '192.168.1.42' }, null, 2)
  },
  {
    id: 'log-108',
    category: 'security_events',
    action: 'RLS_POLICY_CHECK_FAILED',
    targetEntity: 'Table: public.payout_requests',
    details: 'Unauthorized select query attempt on payout requests by non-admin member ID #1',
    user: 'Alex Vance',
    role: 'member',
    severity: 'critical',
    timestamp: '2026-08-14 11:05:30',
    ipAddress: '172.56.21.99',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
    payloadJson: JSON.stringify({ policyName: 'Only admins view all payout requests', attemptedQuery: 'SELECT * FROM payout_requests;' }, null, 2)
  }
];

export function getSystemLogs(): SystemLogEntry[] {
  if (typeof window === 'undefined') return INITIAL_SYSTEM_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_SYSTEM_LOGS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SYSTEM_LOGS_KEY, JSON.stringify(INITIAL_SYSTEM_LOGS));
      return INITIAL_SYSTEM_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_SYSTEM_LOGS;
  }
}

export function recordSystemLog(entry: Omit<SystemLogEntry, 'id' | 'timestamp'>): SystemLogEntry {
  const newLog: SystemLogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  if (typeof window !== 'undefined') {
    try {
      const current = getSystemLogs();
      const updated = [newLog, ...current.slice(0, 200)]; // retain up to 200 logs
      localStorage.setItem(STORAGE_SYSTEM_LOGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('creatorpulse_system_log_added', { detail: newLog }));
    } catch (e) {
      console.error('Failed to record system log', e);
    }
  }

  return newLog;
}

export function clearSystemLogs(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_SYSTEM_LOGS_KEY);
    window.dispatchEvent(new CustomEvent('creatorpulse_system_log_added'));
  }
}
