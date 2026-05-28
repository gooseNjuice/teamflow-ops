import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { tasks } from '../data/tasks.data';
import { createTaskSchema } from '../schemas/task.schemas';
import { Task } from '../types/task.types';

export const tasksRouter = Router();

tasksRouter.get('/', (_req, res) => {
  res.json(tasks);
});

tasksRouter.get('/:id', (req, res) => {
  const task = tasks.find((item) => item.id === req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  return res.json(task);
});

tasksRouter.post('/', (req, res) => {
  const result = createTaskSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Invalid task data',
      errors: result.error.flatten().fieldErrors,
    });
  }

  const now = new Date().toISOString();

  const newTask: Task = {
    id: `task-${randomUUID()}`,
    title: result.data.title,
    description: result.data.description,
    status: result.data.status,
    priority: result.data.priority,
    assigneeId: result.data.assigneeId,
    projectId: result.data.projectId,
    dueDate: result.data.dueDate,
    createdAt: now,
    updatedAt: now,
    archived: false,
  };

  tasks.push(newTask);

  return res.status(201).json(newTask);
});