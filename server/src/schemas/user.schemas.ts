import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'manager', 'developer', 'viewer']);

export const updateUserSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    role: userRoleSchema.optional(),
    avatarUrl: z.string().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
