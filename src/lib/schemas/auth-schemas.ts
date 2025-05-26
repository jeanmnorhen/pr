
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});
export type LoginFormData = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters' }).optional(),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, {message: 'Password must be at least 6 characters'}),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});
export type RegisterFormData = z.infer<typeof RegisterSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});
export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;

export const ProfileUpdateSchema = z.object({
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters' }),
});
export type ProfileUpdateFormData = z.infer<typeof ProfileUpdateSchema>;

// User Profile Data stored in Realtime Database
export interface UserProfileData {
  displayName?: string | null;
  email?: string | null;
  isStoreOwner?: boolean;
  credits?: number;
}
