

import { type Task } from '../types/task.types.ts';

export const tasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design dashboard layout',
    description: 'Create the initial dashboard structure.',
    status: 'todo',
    priority: 'high',
    assigneeId: 'user-1',
    projectId: 'project-1',
    dueDate: '2026-06-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  },
];