import type { RequestHandler } from 'express';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schemas.ts';
import {
  createTask,
  getTaskById,
  getTasks,
  setTaskArchived,
  updateTask,
} from '../services/tasks.service.ts';
import { AppError } from '../utils/AppError.ts';

function getTaskId(params: { id?: string | string[] }) {
  if (typeof params.id !== 'string') {
    throw new AppError('Task not found', 404);
  }

  return params.id;
}

export const listTasks: RequestHandler = async (req, res) => {
  const tasks = await getTasks({
    includeArchived: req.query.includeArchived === 'true',
    onlyArchived: req.query.archived === 'true',
  });

  return res.json(tasks);
};

export const getTask: RequestHandler = async (req, res) => {
  const task = await getTaskById(getTaskId(req.params));

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return res.json(task);
};

export const createTaskHandler: RequestHandler = async (req, res) => {
  const result = createTaskSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      'Invalid task data',
      400,
      result.error.flatten().fieldErrors,
    );
  }

  const task = await createTask(result.data);

  return res.status(201).json(task);
};

export const updateTaskHandler: RequestHandler = async (req, res) => {
  const result = updateTaskSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      'Invalid task data',
      400,
      result.error.flatten().fieldErrors,
    );
  }

  const task = await updateTask(getTaskId(req.params), result.data);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return res.json(task);
};

export const archiveTask: RequestHandler = async (req, res) => {
  const task = await setTaskArchived(getTaskId(req.params), true);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return res.json(task);
};

export const restoreTask: RequestHandler = async (req, res) => {
  const task = await setTaskArchived(getTaskId(req.params), false);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return res.json(task);
};
