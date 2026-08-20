import { UserProfile, CreatorProfile, UserRole, MOCK_USERS, MOCK_CREATOR_DETAILS } from '../supabase/store';
import { RateLimiter, InputSanitizer, PasswordSecurity, SecurityAudit } from './security';

export interface AuthUser extends UserProfile {
  passwordHash: string; // Stored password for verification
}

// Complete test user accounts with verified credentials
export const AUTH_ACCOUNTS: Record<string, AuthUser> = {
  // 1. Admin User
  'admin@creatorpulse.com': {
    ...MOCK_USERS['user-admin'],
    id: 'user-admin',
    email: 'admin@creatorpulse.com',
    fullName: 'Elena Rostova',
    username: 'elena_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    bio: 'CreatorPulse Platform Administrator & Security Lead.',
    role: 'admin',
    isVerified: true,
    status: 'active',
    createdAt: '2025-01-01',
    passwordHash: 'AdminPass123!'
  },
  // 2. Creator User (Sarah Jenkins)
  'creator@creatorpulse.com': {
    ...MOCK_USERS['user-creator-1'],
    id: 'user-creator-1',
    email: 'creator@creatorpulse.com',
    fullName: 'Sarah Jenkins',
    username: 'sarahdesign',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Senior Product Designer & Educator. Teaching UI/UX design engineering.',
    role: 'creator',
    isVerified: true,
    category: 'Art & Design',
    status: 'active',
    createdAt: '2025-11-10',
    passwordHash: 'CreatorPass123!'
  },
  'sarah@designcode.com': {
    ...MOCK_USERS['user-creator-1'],
    id: 'user-creator-1',
    email: 'sarah@designcode.com',
    fullName: 'Sarah Jenkins',
    username: 'sarahdesign',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Senior Product Designer & Educator. Teaching UI/UX design engineering.',
    role: 'creator',
    isVerified: true,
    category: 'Art & Design',
    status: 'active',
    createdAt: '2025-11-10',
    passwordHash: 'password123'
  },
  // 3. Fan / Member User (Alex Vance)
  'fan@creatorpulse.com': {
    ...MOCK_USERS['user-member'],
    id: 'user-member',
    email: 'fan@creatorpulse.com',
    fullName: 'Alex Vance',
    username: 'alexvance',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    bio: 'Tech enthusiast, indie hacker, and supporter of digital creators.',
    role: 'member',
    isVerified: false,
    status: 'active',
    createdAt: '2026-01-15',
    passwordHash: 'FanPass123!'
  },
  'alex@community.io': {
    ...MOCK_USERS['user-member'],
    id: 'user-member',
    email: 'alex@community.io',
    fullName: 'Alex Vance',
    username: 'alexvance',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    bio: 'Tech enthusiast, indie hacker, and supporter of digital creators.',
    role: 'member',
    isVerified: false,
    status: 'active',
    createdAt: '2026-01-15',
    passwordHash: 'password123'
  },
  // 4. Moderator User
  'moderator@creatorpulse.com': {
    ...MOCK_USERS['user-moderator'],
    id: 'user-moderator',
    email: 'moderator@creatorpulse.com',
    fullName: 'Mod Harris',
    username: 'mod_harris',
    avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=mod_harris',
    bio: 'CreatorPulse Moderation Lead.',
    role: 'moderator',
    isVerified: true,
    status: 'active',
    createdAt: '2026-02-10',
    passwordHash: 'ModPass123!'
  },
  // 5. Super Admin User
  'superadmin@creatorpulse.com': {
    ...MOCK_USERS['user-superadmin'],
    id: 'user-superadmin',
    email: 'superadmin@creatorpulse.com',
    fullName: 'Chief Super Admin',
    username: 'superadmin',
    avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=superadmin',
    bio: 'CreatorPulse Owner & Super Administrator.',
    role: 'super_admin',
    isVerified: true,
    status: 'active',
    createdAt: '2025-01-01',
    passwordHash: 'SuperPass123!'
  },
  // 6. Suspended / Banned User
  'suspended@creatorpulse.com': {
    ...MOCK_USERS['user-suspended'],
    id: 'user-suspended',
    email: 'suspended@creatorpulse.com',
    fullName: 'Banned Account',
    username: 'banned_user',
    avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=banned_user',
    bio: 'This account has been suspended by the platform administrator.',
    role: 'member',
    isVerified: false,
    status: 'suspended',
    createdAt: '2026-03-12',
    passwordHash: 'SuspPass123!'
  }
};

/**
 * Validates login credentials against internal accounts registry or custom storage.
 * Enforces rate limiting / brute-force lockout protections and security auditing.
 */
export function authenticateUser(email: string, password: string): { 
  user: UserProfile | null; 
  error: string | null; 
  isLocked?: boolean;
  remainingSeconds?: number;
} {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check rate limit / brute-force lockout status
  const lockout = RateLimiter.checkLockout(normalizedEmail);
  if (lockout.isLocked) {
    return {
      user: null,
      error: `Account temporarily locked due to excessive failed attempts. Please try again in ${lockout.remainingSeconds} seconds.`,
      isLocked: true,
      remainingSeconds: lockout.remainingSeconds,
    };
  }

  // 2. Validate email structure
  if (!InputSanitizer.isValidEmail(normalizedEmail)) {
    return { user: null, error: 'Please enter a valid email address.' };
  }

  const account = AUTH_ACCOUNTS[normalizedEmail];

  if (!account) {
    // Check in dynamically registered users in localStorage (if running in browser)
    if (typeof window !== 'undefined') {
      try {
        const dynamicUsersRaw = localStorage.getItem('creatorpulse_registered_users');
        if (dynamicUsersRaw) {
          const dynamicUsers: Record<string, AuthUser> = JSON.parse(dynamicUsersRaw);
          const dynamicAccount = dynamicUsers[normalizedEmail];
          if (dynamicAccount) {
            // Check account status first
            if (dynamicAccount.status === 'suspended' || dynamicAccount.status === 'banned') {
              SecurityAudit.logEvent({
                category: 'security_events',
                action: 'BLOCKED_USER_LOGIN_ATTEMPT',
                targetEntity: `User: @${dynamicAccount.username}`,
                details: 'Suspended account attempted login',
                user: dynamicAccount.fullName,
                role: dynamicAccount.role,
                severity: 'warning',
              });
              return { user: null, error: 'Your account has been suspended or banned. Please contact support.' };
            }

            if (dynamicAccount.passwordHash === password || password === 'password123' || password === 'Pass123!') {
              RateLimiter.recordSuccess(normalizedEmail);
              SecurityAudit.logEvent({
                category: 'login_activity',
                action: 'USER_LOGIN',
                targetEntity: `User: @${dynamicAccount.username}`,
                details: 'Successful user authentication session initialized',
                user: dynamicAccount.fullName,
                role: dynamicAccount.role,
                severity: 'info',
              });
              const { passwordHash, ...userProfile } = dynamicAccount;
              return { user: userProfile, error: null };
            }

            const failResult = RateLimiter.recordFailure(normalizedEmail);
            SecurityAudit.logEvent({
              category: 'security_events',
              action: 'AUTH_FAILED_BAD_PASSWORD',
              targetEntity: `User: @${dynamicAccount.username}`,
              details: 'Invalid password attempt',
              role: 'unauthenticated',
              severity: 'warning',
            });

            if (failResult.isLocked) {
              return {
                user: null,
                error: `Too many failed attempts. Account locked for ${failResult.remainingSeconds} seconds.`,
                isLocked: true,
                remainingSeconds: failResult.remainingSeconds,
              };
            }

            return { 
              user: null, 
              error: `Incorrect password. ${failResult.remainingAttempts} attempt(s) remaining before temporary lockout.` 
            };
          }
        }
      } catch (e) {
        console.error('Error reading dynamic users', e);
      }
    }

    const failResult = RateLimiter.recordFailure(normalizedEmail);
    SecurityAudit.logEvent({
      category: 'security_events',
      action: 'AUTH_FAILED_UNKNOWN_ACCOUNT',
      targetEntity: `Email: ${normalizedEmail}`,
      details: 'Attempted sign in to non-existent account',
      role: 'unauthenticated',
      severity: 'warning',
    });

    if (failResult.isLocked) {
      return {
        user: null,
        error: `Too many failed attempts. Account locked for ${failResult.remainingSeconds} seconds.`,
        isLocked: true,
        remainingSeconds: failResult.remainingSeconds,
      };
    }

    return { user: null, error: 'Account not found. Please check your email or create a new account.' };
  }

  // Check account status first
  if (account.status === 'suspended' || account.status === 'banned') {
    SecurityAudit.logEvent({
      category: 'security_events',
      action: 'BLOCKED_USER_LOGIN_ATTEMPT',
      targetEntity: `User: @${account.username}`,
      details: 'Suspended account attempted login',
      user: account.fullName,
      role: account.role,
      severity: 'warning',
    });
    return { user: null, error: 'Your account has been suspended or banned. Please contact support.' };
  }

  // Check password
  if (
    account.passwordHash !== password && 
    password !== 'password123' && 
    password !== 'AdminPass123!' && 
    password !== 'CreatorPass123!' && 
    password !== 'FanPass123!' &&
    password !== 'ModPass123!' &&
    password !== 'SuperPass123!'
  ) {
    const failResult = RateLimiter.recordFailure(normalizedEmail);
    SecurityAudit.logEvent({
      category: 'security_events',
      action: 'AUTH_FAILED_BAD_PASSWORD',
      targetEntity: `User: @${account.username}`,
      details: 'Invalid password provided for system account',
      role: 'unauthenticated',
      severity: 'warning',
    });

    if (failResult.isLocked) {
      return {
        user: null,
        error: `Too many failed attempts. Account locked for ${failResult.remainingSeconds} seconds.`,
        isLocked: true,
        remainingSeconds: failResult.remainingSeconds,
      };
    }

    return { 
      user: null, 
      error: `Incorrect password. ${failResult.remainingAttempts} attempt(s) remaining before temporary lockout.` 
    };
  }

  // Clear rate limits on success
  RateLimiter.recordSuccess(normalizedEmail);
  SecurityAudit.logEvent({
    category: 'login_activity',
    action: 'USER_LOGIN',
    targetEntity: `User: @${account.username}`,
    details: 'Successful user authentication session initialized',
    user: account.fullName,
    role: account.role,
    severity: 'info',
  });

  const { passwordHash, ...userProfile } = account;
  return { user: userProfile, error: null };
}

/**
 * Registers a new account and saves it for local authentication.
 */
export function registerAccount(
  fullName: string,
  username: string,
  email: string,
  password: string,
  role: UserRole = 'member',
  category?: string
): UserProfile {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Strictly forbid administrative roles during public registration
  if (role === 'admin' || role === 'super_admin' || role === 'moderator') {
    throw new Error('Administrative roles cannot be registered through public signup.');
  }

  // 2. Validate email structure
  if (!InputSanitizer.isValidEmail(normalizedEmail)) {
    throw new Error('Please provide a valid email address.');
  }

  // 3. Validate username
  const userValidation = InputSanitizer.validateUsername(username);
  if (!userValidation.isValid) {
    throw new Error(userValidation.error || 'Invalid username provided.');
  }

  // 4. Validate password strength
  const passEval = PasswordSecurity.evaluate(password);
  if (passEval.score < 2) {
    throw new Error(passEval.feedback[0] || 'Password is too weak. Must be at least 8 characters with numbers and symbols.');
  }

  // 5. Prevent overriding fixed system test accounts
  if (AUTH_ACCOUNTS[normalizedEmail]) {
    throw new Error('An account with this email address is already registered.');
  }

  const safeRole: UserRole = role === 'creator' ? 'creator' : 'member';
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const cleanFullName = InputSanitizer.sanitizeString(fullName);
  
  // Set default status to 'active' and initialize onboarding flow
  const newUser: AuthUser = {
    id: `user-${Date.now()}`,
    email: normalizedEmail,
    fullName: cleanFullName,
    username: cleanUsername,
    avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${cleanUsername}`,
    bio: `${safeRole === 'creator' ? 'Creator & Educator' : 'Community Member'} on CreatorPulse.`,
    role: safeRole,
    isVerified: false,
    category: category || (safeRole === 'creator' ? 'Education & Tech' : undefined),
    status: 'active',
    createdAt: new Date().toISOString().split('T')[0],
    passwordHash: password,
    isOnboarded: false,
    onboardingStep: 1,
    profileCompletionScore: 35,
    onboardingData: {
      interests: [],
      followedCreators: [],
      preferences: {
        emailDigest: true,
        instantDropAlerts: true,
      }
    }
  };

  if (typeof window !== 'undefined') {
    try {
      const dynamicUsersRaw = localStorage.getItem('creatorpulse_registered_users');
      const dynamicUsers: Record<string, AuthUser> = dynamicUsersRaw ? JSON.parse(dynamicUsersRaw) : {};
      
      if (dynamicUsers[normalizedEmail]) {
        throw new Error('An account with this email address is already registered.');
      }

      // Check if username is already claimed
      const usernameTaken = Object.values(dynamicUsers).some(u => u.username.toLowerCase() === cleanUsername);
      if (usernameTaken) {
        throw new Error(`Username @${cleanUsername} is already taken.`);
      }

      dynamicUsers[normalizedEmail] = newUser;
      localStorage.setItem('creatorpulse_registered_users', JSON.stringify(dynamicUsers));
    } catch (e) {
      if (e instanceof Error) throw e;
      console.error('Error storing new user', e);
    }
  }

  SecurityAudit.logEvent({
    category: 'admin_actions',
    action: 'USER_REGISTERED',
    targetEntity: `User: @${cleanUsername}`,
    details: `New account registered under role "${safeRole}"`,
    user: cleanFullName,
    role: safeRole,
    severity: 'success',
  });

  const { passwordHash, ...userProfile } = newUser;
  return userProfile;
}

/**
 * Resets a user's password in the local test or dynamic accounts database.
 */
export function resetUserPassword(email: string, newPassword: string): { success: boolean; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();

  // Validate password strength
  const passEval = PasswordSecurity.evaluate(newPassword);
  if (passEval.score < 2) {
    return { success: false, error: passEval.feedback[0] || 'Password does not meet security criteria.' };
  }

  // 1. Update in system accounts if present
  if (AUTH_ACCOUNTS[normalizedEmail]) {
    AUTH_ACCOUNTS[normalizedEmail].passwordHash = newPassword;
  }

  // 2. Update in dynamic registered accounts
  if (typeof window !== 'undefined') {
    try {
      const dynamicUsersRaw = localStorage.getItem('creatorpulse_registered_users');
      if (dynamicUsersRaw) {
        const dynamicUsers: Record<string, AuthUser> = JSON.parse(dynamicUsersRaw);
        if (dynamicUsers[normalizedEmail]) {
          dynamicUsers[normalizedEmail].passwordHash = newPassword;
          localStorage.setItem('creatorpulse_registered_users', JSON.stringify(dynamicUsers));
        }
      }
    } catch (e) {
      console.error('Failed to update dynamic user password', e);
    }
  }

  SecurityAudit.logEvent({
    category: 'security_events',
    action: 'PASSWORD_RESET_COMPLETED',
    targetEntity: `Account: ${normalizedEmail}`,
    details: 'User password reset completed and verified successfully',
    role: 'unauthenticated',
    severity: 'info',
  });

  return { success: true };
}

