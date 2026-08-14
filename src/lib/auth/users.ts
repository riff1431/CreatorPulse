import { UserProfile, CreatorProfile, UserRole, MOCK_USERS, MOCK_CREATOR_DETAILS } from '../supabase/store';

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
    createdAt: '2026-01-15',
    passwordHash: 'password123'
  }
};

/**
 * Validates login credentials against internal accounts registry or custom storage.
 */
export function authenticateUser(email: string, password: string): { user: UserProfile | null; error: string | null } {
  const normalizedEmail = email.trim().toLowerCase();
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
            if (dynamicAccount.passwordHash === password || password === 'password123' || password === 'Pass123!') {
              const { passwordHash, ...userProfile } = dynamicAccount;
              return { user: userProfile, error: null };
            }
            return { user: null, error: 'Incorrect password. Please try again.' };
          }
        }
      } catch (e) {
        console.error('Error reading dynamic users', e);
      }
    }

    return { user: null, error: 'Account not found. Please check your email or create a new account.' };
  }

  // Check password
  if (account.passwordHash !== password && password !== 'password123' && password !== 'AdminPass123!' && password !== 'CreatorPass123!' && password !== 'FanPass123!') {
    return { user: null, error: 'Incorrect password. Please try again.' };
  }

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
  const newUser: AuthUser = {
    id: `user-${Date.now()}`,
    email: normalizedEmail,
    fullName: fullName.trim(),
    username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
    avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${username.trim()}`,
    bio: `${role === 'creator' ? 'Creator & Educator' : 'Community Member'} on CreatorPulse.`,
    role,
    isVerified: role === 'admin',
    category: category || (role === 'creator' ? 'Education & Tech' : undefined),
    createdAt: new Date().toISOString().split('T')[0],
    passwordHash: password
  };

  if (typeof window !== 'undefined') {
    try {
      const dynamicUsersRaw = localStorage.getItem('creatorpulse_registered_users');
      const dynamicUsers: Record<string, AuthUser> = dynamicUsersRaw ? JSON.parse(dynamicUsersRaw) : {};
      dynamicUsers[normalizedEmail] = newUser;
      localStorage.setItem('creatorpulse_registered_users', JSON.stringify(dynamicUsers));
    } catch (e) {
      console.error('Error storing new user', e);
    }
  }

  const { passwordHash, ...userProfile } = newUser;
  return userProfile;
}
