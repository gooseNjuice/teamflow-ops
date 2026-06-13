import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Comment body is required')
    .max(1000, 'Comment body must be 1000 characters or less'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
