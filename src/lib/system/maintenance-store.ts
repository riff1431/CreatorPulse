export interface MaintenanceConfig {
  maintenanceMode: boolean;
  message: string;
  allowedIps: string[];
  estimatedCompletion: string;
  updatedAt: string;
}

export interface ScheduledCronJob {
  id: string;
  name: string;
  schedule: string; // e.g. "Every 15 min"
  lastRun: string;
  nextRun: string;
  status: 'active' | 'running' | 'failed' | 'disabled';
  description: string;
}

export interface SystemDiagnosticCheck {
  id: string;
  label: string;
  value: string;
  status: 'optimal' | 'warning' | 'error';
  details: string;
}

const STORAGE_MAINTENANCE_CONFIG_KEY = 'creatorpulse_maintenance_config';
const STORAGE_SCHEDULED_JOBS_KEY = 'creatorpulse_scheduled_jobs';

export const DEFAULT_MAINTENANCE_CONFIG: MaintenanceConfig = {
  maintenanceMode: false,
  message: 'CreatorPulse is undergoing scheduled system upgrades. We will return online shortly.',
  allowedIps: ['192.168.1.42', '127.0.0.1'],
  estimatedCompletion: '2026-08-15 02:00 UTC',
  updatedAt: '2026-08-15 00:00:00'
};

export const DEFAULT_SCHEDULED_JOBS: ScheduledCronJob[] = [
  {
    id: 'job-1',
    name: 'Subscription Auto-Renewal Check',
    schedule: 'Every hour',
    lastRun: '2026-08-15 00:00:00',
    nextRun: '2026-08-15 01:00:00',
    status: 'active',
    description: 'Processes recurring membership billing and renews active creator subscriptions'
  },
  {
    id: 'job-2',
    name: '24h Story Expiration Cleaner',
    schedule: 'Every 15 minutes',
    lastRun: '2026-08-15 00:45:00',
    nextRun: '2026-08-15 01:00:00',
    status: 'active',
    description: 'Archive stories that have passed the 24-hour publication window'
  },
  {
    id: 'job-3',
    name: 'Daily Payout Batch Processing',
    schedule: 'Daily at 00:00 UTC',
    lastRun: '2026-08-15 00:00:00',
    nextRun: '2026-08-16 00:00:00',
    status: 'active',
    description: 'Consolidate cleared earnings and initiate automated creator payout transfers'
  },
  {
    id: 'job-4',
    name: 'Database Audit Log Pruning',
    schedule: 'Weekly on Sunday',
    lastRun: '2026-08-10 00:00:00',
    nextRun: '2026-08-17 00:00:00',
    status: 'active',
    description: 'Compress and archive historical system audit log entries older than 90 days'
  }
];

export const SYSTEM_DIAGNOSTICS: SystemDiagnosticCheck[] = [
  { id: 'node_version', label: 'Node.js Engine', value: 'v20.11.0', status: 'optimal', details: 'Long Term Support (LTS) release' },
  { id: 'next_framework', label: 'Next.js Framework', value: 'v16.3.0', status: 'optimal', details: 'App Router architecture' },
  { id: 'supabase_db', label: 'PostgreSQL Database', value: 'Connected (12ms latency)', status: 'optimal', details: '25 Tables active with RLS policies' },
  { id: 'storage_buckets', label: 'Storage Engine', value: 'Supabase S3 Bucket', status: 'optimal', details: 'Public & Private buckets healthy' },
  { id: 'plugins_active', label: 'Active Add-on Extensions', value: '5 Extensions Active', status: 'optimal', details: 'All hook listeners initialized' },
  { id: 'ssl_status', label: 'TLS / SSL Certificate', value: 'Valid (Expires in 280 days)', status: 'optimal', details: 'Let\'s Encrypt TLS 1.3' }
];

export function getMaintenanceConfig(): MaintenanceConfig {
  if (typeof window === 'undefined') return DEFAULT_MAINTENANCE_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_MAINTENANCE_CONFIG_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_MAINTENANCE_CONFIG_KEY, JSON.stringify(DEFAULT_MAINTENANCE_CONFIG));
      return DEFAULT_MAINTENANCE_CONFIG;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MAINTENANCE_CONFIG;
  }
}

export function saveMaintenanceConfig(config: MaintenanceConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_MAINTENANCE_CONFIG_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent('creatorpulse_maintenance_updated'));
}

export function getScheduledJobs(): ScheduledCronJob[] {
  if (typeof window === 'undefined') return DEFAULT_SCHEDULED_JOBS;
  try {
    const raw = localStorage.getItem(STORAGE_SCHEDULED_JOBS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SCHEDULED_JOBS_KEY, JSON.stringify(DEFAULT_SCHEDULED_JOBS));
      return DEFAULT_SCHEDULED_JOBS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SCHEDULED_JOBS;
  }
}

export function triggerScheduledJob(jobId: string): ScheduledCronJob | undefined {
  const jobs = getScheduledJobs();
  const target = jobs.find(j => j.id === jobId);
  if (!target) return undefined;

  const updatedJob: ScheduledCronJob = {
    ...target,
    lastRun: new Date().toISOString().replace('T', ' ').substring(0, 19),
    status: 'active'
  };

  const updatedList = jobs.map(j => (j.id === jobId ? updatedJob : j));
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_SCHEDULED_JOBS_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('creatorpulse_jobs_updated'));
  }
  return updatedJob;
}
