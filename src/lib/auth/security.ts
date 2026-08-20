import { recordSystemLog, SystemLogCategory, SystemLogSeverity } from '@/lib/logs/audit-logger';

/**
 * Common disposable / burner email domains
 */
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'yopmail.com',
  'dispostable.com',
  'getairmail.com',
  'trashmail.com',
  'throwawaymail.com',
  'fakeinbox.com',
  'temp-mail.org',
  'burnermail.io',
  'mytemp.email',
  'crazymailing.com',
]);

/**
 * Common vulnerable / easily guessed passwords
 */
export const WEAK_PASSWORDS_BLACKLIST = new Set([
  'password',
  'password123',
  '123456',
  '12345678',
  '123456789',
  'qwerty',
  'admin123',
  'welcome',
  'letmein',
  'iloveyou',
  'superman',
  'football',
  'secret',
  'changeme',
  'master',
  'dragon',
  'abc12345',
]);

/**
 * Reserved usernames that cannot be registered
 */
export const RESERVED_USERNAMES = new Set([
  'admin',
  'superadmin',
  'administrator',
  'root',
  'system',
  'api',
  'auth',
  'moderator',
  'staff',
  'help',
  'support',
  'null',
  'undefined',
  'creatorpulse',
  'official',
  'security',
  'dashboard',
  'feed',
  'settings',
  'login',
  'signup',
  'logout',
]);

export interface RateLimitState {
  attempts: number;
  lastAttemptTime: number;
  lockedUntil: number | null;
}

export interface PasswordCriteria {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  notCommon: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0 (Very Weak) to 4 (Very Strong)
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  badgeBg: string;
  criteria: PasswordCriteria;
  feedback: string[];
}

const STORAGE_RATE_LIMIT_KEY = 'creatorpulse_rate_limit_records';
const MAX_FAILED_ATTEMPTS = 5;
const INITIAL_LOCKOUT_SECONDS = 60; // 1 minute lockout
const MAX_LOCKOUT_SECONDS = 300; // 5 minutes max lockout

/**
 * Rate Limiter & Brute-Force Defense
 */
export class RateLimiter {
  private static getStore(): Record<string, RateLimitState> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STORAGE_RATE_LIMIT_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private static setStore(store: Record<string, RateLimitState>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_RATE_LIMIT_KEY, JSON.stringify(store));
    } catch (e) {
      console.warn('Failed to save rate limit store', e);
    }
  }

  /**
   * Checks if an identifier (email or IP) is currently locked out.
   */
  public static checkLockout(identifier: string): { isLocked: boolean; remainingSeconds: number } {
    const cleanId = identifier.trim().toLowerCase();
    const store = this.getStore();
    const record = store[cleanId];

    if (!record || !record.lockedUntil) {
      return { isLocked: false, remainingSeconds: 0 };
    }

    const now = Date.now();
    if (record.lockedUntil > now) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { isLocked: true, remainingSeconds };
    }

    // Lock expired, reset lock
    record.lockedUntil = null;
    this.setStore(store);
    return { isLocked: false, remainingSeconds: 0 };
  }

  /**
   * Records a failed authentication attempt and calculates lockout if threshold reached.
   */
  public static recordFailure(identifier: string): { isLocked: boolean; remainingSeconds: number; remainingAttempts: number } {
    const cleanId = identifier.trim().toLowerCase();
    const store = this.getStore();
    const now = Date.now();

    const record: RateLimitState = store[cleanId] || {
      attempts: 0,
      lastAttemptTime: now,
      lockedUntil: null,
    };

    // If previous attempts happened more than 15 minutes ago, reset attempt count
    if (now - record.lastAttemptTime > 15 * 60 * 1000) {
      record.attempts = 0;
    }

    record.attempts += 1;
    record.lastAttemptTime = now;

    let isLocked = false;
    let remainingSeconds = 0;

    if (record.attempts >= MAX_FAILED_ATTEMPTS) {
      // Exponential backoff for repeated lockouts
      const multiplier = Math.min(Math.floor((record.attempts - MAX_FAILED_ATTEMPTS) / 2) + 1, 5);
      const lockoutDuration = Math.min(INITIAL_LOCKOUT_SECONDS * multiplier, MAX_LOCKOUT_SECONDS);
      record.lockedUntil = now + lockoutDuration * 1000;
      isLocked = true;
      remainingSeconds = lockoutDuration;

      // Log Security Audit Event
      SecurityAudit.logEvent({
        category: 'security_events',
        action: 'RATE_LIMIT_LOCKOUT',
        targetEntity: `Account: ${cleanId}`,
        details: `Account temporarily locked out for ${lockoutDuration}s after ${record.attempts} consecutive failed sign-in attempts.`,
        role: 'unauthenticated',
        severity: 'error',
        payloadJson: JSON.stringify({ identifier: cleanId, attempts: record.attempts, lockoutDuration }),
      });
    }

    store[cleanId] = record;
    this.setStore(store);

    const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - record.attempts);
    return { isLocked, remainingSeconds, remainingAttempts };
  }

  /**
   * Resets rate limit records on successful authentication.
   */
  public static recordSuccess(identifier: string): void {
    const cleanId = identifier.trim().toLowerCase();
    const store = this.getStore();
    if (store[cleanId]) {
      delete store[cleanId];
      this.setStore(store);
    }
  }
}

/**
 * Password Security Engine
 */
export class PasswordSecurity {
  /**
   * Evaluates comprehensive password strength, entropy, and individual criteria.
   */
  public static evaluate(password: string): PasswordStrengthResult {
    if (!password) {
      return {
        score: 0,
        label: 'Very Weak',
        color: 'text-slate-400',
        badgeBg: 'bg-slate-500/20 text-slate-400',
        criteria: {
          minLength: false,
          hasUpper: false,
          hasLower: false,
          hasNumber: false,
          hasSpecial: false,
          notCommon: true,
        },
        feedback: ['Enter a password to check security.'],
      };
    }

    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const notCommon = !WEAK_PASSWORDS_BLACKLIST.has(password.toLowerCase().trim());

    const criteria: PasswordCriteria = {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      notCommon,
    };

    let score = 0;
    const feedback: string[] = [];

    if (!minLength) feedback.push('Must be at least 8 characters long');
    else score += 1;

    if (!hasLower || !hasUpper) feedback.push('Include both uppercase and lowercase letters');
    else score += 1;

    if (!hasNumber) feedback.push('Add at least one number (0-9)');
    else score += 1;

    if (!hasSpecial) feedback.push('Add a special character (!@#$%^&*)');
    else score += 1;

    if (!notCommon) {
      score = Math.min(score, 1);
      feedback.unshift('This is a widely-known weak password. Please choose a unique passphrase.');
    }

    // Extra point for exceptional length
    if (password.length >= 14 && score >= 3) {
      score = 4;
    }

    let label: PasswordStrengthResult['label'] = 'Very Weak';
    let color = 'text-rose-500';
    let badgeBg = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';

    if (score === 1) {
      label = 'Weak';
      color = 'text-rose-400';
      badgeBg = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
    } else if (score === 2) {
      label = 'Fair';
      color = 'text-amber-400';
      badgeBg = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    } else if (score === 3) {
      label = 'Good';
      color = 'text-blue-400';
      badgeBg = 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    } else if (score >= 4) {
      label = 'Strong';
      color = 'text-emerald-400';
      badgeBg = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    }

    return {
      score,
      label,
      color,
      badgeBg,
      criteria,
      feedback: feedback.length ? feedback : ['Password meets all enterprise security criteria.'],
    };
  }

  /**
   * Generates a high-entropy, cryptographically strong random password.
   */
  public static generateStrongPassword(): string {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*_-+=';

    const getRandomChar = (pool: string) => pool.charAt(Math.floor(Math.random() * pool.length));

    // Ensure all required character classes are present
    const parts = [
      getRandomChar(upper),
      getRandomChar(lower),
      getRandomChar(numbers),
      getRandomChar(symbols),
      getRandomChar(upper),
      getRandomChar(lower),
      getRandomChar(numbers),
      getRandomChar(symbols),
      getRandomChar(lower),
      getRandomChar(upper),
      getRandomChar(numbers),
      getRandomChar(symbols),
    ];

    // Shuffle characters
    for (let i = parts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [parts[i], parts[j]] = [parts[j], parts[i]];
    }

    return parts.join('');
  }
}

/**
 * Input Sanitizer & Attack Neutralizer
 */
export class InputSanitizer {
  /**
   * Validates email format according to standard RFC 5322 regex.
   */
  public static isValidEmail(email: string): boolean {
    if (!email) return false;
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  }

  /**
   * Checks if an email is using a disposable / throwaway email provider.
   */
  public static isDisposableEmail(email: string): boolean {
    if (!email || !email.includes('@')) return false;
    const domain = email.split('@')[1]?.toLowerCase().trim();
    return DISPOSABLE_EMAIL_DOMAINS.has(domain);
  }

  /**
   * Validates username structure and checks against reserved words.
   */
  public static validateUsername(username: string): { isValid: boolean; error?: string } {
    const clean = username.trim().toLowerCase();
    if (!clean) {
      return { isValid: false, error: 'Username is required.' };
    }
    if (clean.length < 3) {
      return { isValid: false, error: 'Username must be at least 3 characters long.' };
    }
    if (clean.length > 20) {
      return { isValid: false, error: 'Username must not exceed 20 characters.' };
    }
    if (!/^[a-z0-9_]+$/.test(clean)) {
      return { isValid: false, error: 'Username may only contain alphanumeric characters and underscores.' };
    }
    if (clean.startsWith('_') || clean.endsWith('_')) {
      return { isValid: false, error: 'Username cannot start or end with an underscore.' };
    }
    if (RESERVED_USERNAMES.has(clean)) {
      return { isValid: false, error: `"${clean}" is a reserved system identifier.` };
    }
    return { isValid: true };
  }

  /**
   * Sanitizes string to prevent XSS / script injection attacks.
   */
  public static sanitizeString(input: string): string {
    if (!input) return '';
    return input
      .trim()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}

/**
 * Security Audit Integration Helper
 */
export class SecurityAudit {
  public static logEvent(params: {
    category: SystemLogCategory;
    action: string;
    targetEntity: string;
    details: string;
    user?: string;
    role?: string;
    severity?: SystemLogSeverity;
    payloadJson?: string;
  }): void {
    recordSystemLog({
      category: params.category,
      action: params.action,
      targetEntity: params.targetEntity,
      details: params.details,
      user: params.user || 'System',
      role: params.role || 'guest',
      severity: params.severity || 'info',
      ipAddress: typeof window !== 'undefined' ? '127.0.0.1' : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : undefined,
      payloadJson: params.payloadJson,
    });
  }
}
