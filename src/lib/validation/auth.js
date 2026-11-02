import { z } from 'zod';
import { pkPhone } from './common';

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address')).pipe(z.string().max(160));

const password = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Use 72 characters or fewer')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/\d/, 'Include at least one number');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password').max(200),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  email,
  phone: pkPhone.optional().or(z.literal('').transform(() => undefined)),
  password,
});

// Client-only: adds the confirmation field.
export const registerFormSchema = registerSchema
  .extend({ confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: password,
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  phone: pkPhone.optional().or(z.literal('').transform(() => undefined)),
});
