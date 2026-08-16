// ============================================================================
// SMTP Provider Store — CreatorPulse Email & SMTP Manager
// ============================================================================

export type SmtpProviderType =
  | 'gmail'
  | 'outlook'
  | 'sendgrid'
  | 'mailgun'
  | 'ses'
  | 'resend'
  | 'custom';

export type EncryptionType = 'none' | 'tls' | 'ssl';
export type TestStatus = 'ok' | 'fail' | null;
export type ProviderStatus = 'active' | 'fallback' | 'inactive';

export interface SmtpProvider {
  id: string;
  name: string;
  provider: SmtpProviderType;

  // SMTP connection
  host: string;
  port: number;
  encryption: EncryptionType;
  username: string;
  password: string;         // Masked in UI

  // API-based providers
  apiKey: string;
  apiRegion: string;

  // Sender identity
  fromName: string;
  fromEmail: string;
  replyTo: string;

  // Routing
  isActive: boolean;
  isFallback: boolean;
  priority: number;

  // Health
  lastTestedAt: string | null;
  lastTestStatus: TestStatus;
  lastTestMessage: string | null;
  lastTestLatencyMs: number | null;

  createdAt: string;
  updatedAt: string;
}

export type SmtpProviderCreate = Omit<
  SmtpProvider,
  'id' | 'lastTestedAt' | 'lastTestStatus' | 'lastTestMessage' | 'lastTestLatencyMs' | 'createdAt' | 'updatedAt'
>;

// ── Provider presets ────────────────────────────────────────────────────────

export interface ProviderPreset {
  label: string;
  host: string;
  port: number;
  encryption: EncryptionType;
  isApiProvider: boolean;
  docs: string;
  color: string;
}

export const PROVIDER_PRESETS: Record<SmtpProviderType, ProviderPreset> = {
  gmail: {
    label: 'Gmail / Google Workspace',
    host: 'smtp.gmail.com',
    port: 587,
    encryption: 'tls',
    isApiProvider: false,
    docs: 'https://support.google.com/mail/answer/7126229',
    color: '#EA4335',
  },
  outlook: {
    label: 'Outlook / Microsoft 365',
    host: 'smtp.office365.com',
    port: 587,
    encryption: 'tls',
    isApiProvider: false,
    docs: 'https://learn.microsoft.com/en-us/exchange/mail-flow-best-practices/how-to-set-up-a-multifunction-device-or-application-to-send-email-using-microsoft-365-or-office-365',
    color: '#0078D4',
  },
  sendgrid: {
    label: 'SendGrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    encryption: 'tls',
    isApiProvider: true,
    docs: 'https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp',
    color: '#1A82E2',
  },
  mailgun: {
    label: 'Mailgun',
    host: 'smtp.mailgun.org',
    port: 587,
    encryption: 'tls',
    isApiProvider: true,
    docs: 'https://documentation.mailgun.com/en/latest/user_manual.html#smtp-relay',
    color: '#F06B26',
  },
  ses: {
    label: 'Amazon SES',
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    encryption: 'tls',
    isApiProvider: true,
    docs: 'https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html',
    color: '#FF9900',
  },
  resend: {
    label: 'Resend',
    host: 'smtp.resend.com',
    port: 465,
    encryption: 'ssl',
    isApiProvider: true,
    docs: 'https://resend.com/docs/send-with-smtp',
    color: '#000000',
  },
  custom: {
    label: 'Custom SMTP',
    host: '',
    port: 587,
    encryption: 'tls',
    isApiProvider: false,
    docs: '',
    color: '#6366F1',
  },
};

// ── Default demo providers ──────────────────────────────────────────────────

export const DEFAULT_SMTP_PROVIDERS: SmtpProvider[] = [
  {
    id: 'smtp-demo-1',
    name: 'Primary Gmail SMTP',
    provider: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    encryption: 'tls',
    username: 'admin@creatorpulse.com',
    password: 'app-password-here',
    apiKey: '',
    apiRegion: '',
    fromName: 'CreatorPulse',
    fromEmail: 'noreply@creatorpulse.com',
    replyTo: 'support@creatorpulse.com',
    isActive: true,
    isFallback: false,
    priority: 0,
    lastTestedAt: null,
    lastTestStatus: null,
    lastTestMessage: null,
    lastTestLatencyMs: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'smtp-demo-2',
    name: 'SendGrid Fallback',
    provider: 'sendgrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    encryption: 'tls',
    username: 'apikey',
    password: 'SG.your-api-key-here',
    apiKey: 'SG.your-api-key-here',
    apiRegion: '',
    fromName: 'CreatorPulse',
    fromEmail: 'noreply@creatorpulse.com',
    replyTo: '',
    isActive: false,
    isFallback: true,
    priority: 1,
    lastTestedAt: null,
    lastTestStatus: null,
    lastTestMessage: null,
    lastTestLatencyMs: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ── LocalStorage store ──────────────────────────────────────────────────────

const STORAGE_SMTP_KEY = 'creatorpulse_smtp_providers';
const STORAGE_GLOBAL_EMAIL_KEY = 'creatorpulse_email_global_settings';

export interface EmailGlobalSettings {
  serviceEnabled: boolean;
  useFallbackChain: boolean;
  defaultFromName: string;
  defaultFromEmail: string;
  defaultReplyTo: string;
  globalSignatureHtml: string;
  bounceHandlingEmail: string;
}

export const DEFAULT_EMAIL_GLOBAL: EmailGlobalSettings = {
  serviceEnabled: true,
  useFallbackChain: true,
  defaultFromName: 'CreatorPulse',
  defaultFromEmail: 'noreply@creatorpulse.com',
  defaultReplyTo: 'support@creatorpulse.com',
  globalSignatureHtml: '',
  bounceHandlingEmail: '',
};

export function getSmtpProviders(): SmtpProvider[] {
  if (typeof window === 'undefined') return DEFAULT_SMTP_PROVIDERS;
  try {
    const raw = localStorage.getItem(STORAGE_SMTP_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SMTP_KEY, JSON.stringify(DEFAULT_SMTP_PROVIDERS));
      return DEFAULT_SMTP_PROVIDERS;
    }
    return JSON.parse(raw) as SmtpProvider[];
  } catch {
    return DEFAULT_SMTP_PROVIDERS;
  }
}

export function saveSmtpProviders(providers: SmtpProvider[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_SMTP_KEY, JSON.stringify(providers));
  window.dispatchEvent(new CustomEvent('creatorpulse_smtp_providers_updated'));
}

export function createSmtpProvider(data: SmtpProviderCreate): SmtpProvider {
  const now = new Date().toISOString();
  const provider: SmtpProvider = {
    ...data,
    id: `smtp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    lastTestedAt: null,
    lastTestStatus: null,
    lastTestMessage: null,
    lastTestLatencyMs: null,
    createdAt: now,
    updatedAt: now,
  };
  const all = getSmtpProviders();
  saveSmtpProviders([...all, provider]);
  return provider;
}

export function updateSmtpProvider(id: string, patch: Partial<SmtpProvider>): SmtpProvider | null {
  const all = getSmtpProviders();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  all[idx] = updated;
  saveSmtpProviders(all);
  return updated;
}

export function deleteSmtpProvider(id: string): void {
  const all = getSmtpProviders().filter((p) => p.id !== id);
  saveSmtpProviders(all);
}

export function getActiveProvider(): SmtpProvider | null {
  const providers = getSmtpProviders();
  return providers.find((p) => p.isActive) ?? null;
}

export function getFallbackChain(): SmtpProvider[] {
  return getSmtpProviders()
    .filter((p) => p.isFallback)
    .sort((a, b) => a.priority - b.priority);
}

// Global email settings
export function getEmailGlobalSettings(): EmailGlobalSettings {
  if (typeof window === 'undefined') return DEFAULT_EMAIL_GLOBAL;
  try {
    const raw = localStorage.getItem(STORAGE_GLOBAL_EMAIL_KEY);
    if (!raw) return DEFAULT_EMAIL_GLOBAL;
    return { ...DEFAULT_EMAIL_GLOBAL, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_EMAIL_GLOBAL;
  }
}

export function saveEmailGlobalSettings(settings: EmailGlobalSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_GLOBAL_EMAIL_KEY, JSON.stringify(settings));
}

// ── Provider status helper ──────────────────────────────────────────────────

export function getProviderStatus(p: SmtpProvider): ProviderStatus {
  if (p.isActive) return 'active';
  if (p.isFallback) return 'fallback';
  return 'inactive';
}

export function getProviderStatusLabel(status: ProviderStatus): string {
  switch (status) {
    case 'active': return 'Active Primary';
    case 'fallback': return 'Fallback';
    case 'inactive': return 'Inactive';
  }
}
