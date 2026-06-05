import { z } from 'zod';

const userRoleSchema = z.enum(['admin', 'manager', 'developer', 'viewer']);

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: userRoleSchema.default('developer'),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
