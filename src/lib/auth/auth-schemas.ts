import { z } from 'zod';
import { RESERVED_USERNAMES, DISPOSABLE_EMAIL_DOMAINS } from './security';

/**
 * Common Zod Schemas for Authentication & User Registration
 */

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'Email address is required.' })
  .email({ message: 'Please enter a valid email address.' })
  .max(100, { message: 'Email cannot exceed 100 characters.' })
  .refine(
    (email) => {
      const domain = email.split('@')[1]?.toLowerCase();
      return !DISPOSABLE_EMAIL_DOMAINS.has(domain);
    },
    { message: 'Temporary burner emails are not allowed for account security.' }
  );

export const usernameSchema = z
  .string()
  .trim()
  .min(3, { message: 'Username must be at least 3 characters long.' })
  .max(20, { message: 'Username cannot exceed 20 characters.' })
  .regex(/^[a-z0-9_]+$/, { message: 'Username may only contain letters, numbers, and underscores.' })
  .refine((u) => !u.startsWith('_') && !u.endsWith('_'), {
    message: 'Username cannot start or end with an underscore.',
  })
  .refine((u) => !RESERVED_USERNAMES.has(u.toLowerCase()), {
    message: 'This username is a reserved system identifier.',
  });

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long.' })
  .max(128, { message: 'Password cannot exceed 128 characters.' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter (A-Z).' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter (a-z).' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number (0-9).' })
  .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character (!@#$%^&*).' });

export const loginSchema = z.object({
  email: z.string().trim().min(1, { message: 'Email address is required.' }).email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  rememberMe: z.boolean().default(true),
});

export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: 'Full name must be at least 2 characters.' })
    .max(60, { message: 'Full name cannot exceed 60 characters.' }),
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['member', 'creator']).default('member'),
  category: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: 'Please confirm your new password.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
