import { UserProfile, UserRole, MOCK_USERS } from '@/lib/supabase/store';
import { AUTH_ACCOUNTS, authenticateUser } from '@/lib/auth/users';
import { APP_CONFIG } from '@/config/app.config';

export class AuthService {
  static async validateCredentials(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const result = authenticateUser(email, password);
    if (!result.user) {
      return { success: false, error: result.error || 'Invalid email or password' };
    }

    if (result.user.status === 'suspended' || result.user.status === 'banned') {
      return { success: false, error: 'Your account has been suspended by an administrator.' };
    }

    return { success: true, user: result.user };
  }

  static getRedirectPathForRole(role: UserRole): string {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return APP_CONFIG.auth.adminRedirectRoute;
      case 'creator':
        return APP_CONFIG.auth.creatorRedirectRoute;
      default:
        return APP_CONFIG.auth.defaultRedirectRoute;
    }
  }

  static hasRequiredRole(userRole: UserRole, allowedRoles: UserRole | UserRole[]): boolean {
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (allowed.includes('guest') || allowed.length === 0) return true;
    if (userRole === 'admin' || userRole === 'super_admin') return true; // Super admin bypass
    return allowed.includes(userRole);
  }

  static getAvailableTestAccounts() {
    return Object.values(AUTH_ACCOUNTS).map((acc) => ({
      email: acc.email,
      role: acc.role,
      fullName: acc.fullName,
      username: acc.username,
      description: acc.bio,
    }));
  }
}
