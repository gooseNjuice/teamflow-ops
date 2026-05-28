import { z } from 'zod';

export const taskStatusSchema = z.enum([
  'backlog',
  'todo',
  'in-progress',
  'in-review',
  'done',
]);

export const taskPrioritySchema = z.enum(['low', 'medium', 'high']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema,
  assigneeId: z.string().min(1, 'Assignee is required'),
  projectId: z.string().min(1, 'Project is required'),
  dueDate: z.string().optional(),
});