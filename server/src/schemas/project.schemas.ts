import { z } from 'zod';

export const projectStatusSchema = z.enum([
  'planning',
  'active',
  'paused',
  'completed',
]);

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  status: projectStatusSchema.default('active'),
  ownerId: z.string().min(1, 'Owner is required').optional(),
});

export const updateProjectSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().optional(),
    status: projectStatusSchema.optional(),
    ownerId: z.string().min(1, 'Owner is required').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
