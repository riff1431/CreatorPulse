import { SignJWT, jwtVerify } from 'jose';
import { UserRole, UserProfile } from '../supabase/store';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'creatorpulse_super_secret_jwt_encryption_key_2026'
);

const JWT_ISSUER = 'creatorpulse-auth';
const JWT_AUDIENCE = 'creatorpulse-app';

export interface AuthSessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  username: string;
  status: 'active' | 'suspended' | 'banned';
  isOnboarded?: boolean;
}

/**
 * Creates a cryptographically signed JWT token compatible with Next.js Edge Runtime.
 */
export async function signSessionToken(payload: AuthSessionPayload, expiresIn: string = '30d'): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT token in Edge Middleware or server routes.
 */
export async function verifySessionToken(token: string): Promise<{
  valid: boolean;
  payload?: AuthSessionPayload;
  error?: string;
}> {
  if (!token) {
    return { valid: false, error: 'Missing token' };
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    return {
      valid: true,
      payload: {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as UserRole,
        username: payload.username as string,
        status: (payload.status as any) || 'active',
        isOnboarded: payload.isOnboarded as boolean | undefined,
      },
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Invalid or expired token',
    };
  }
}
