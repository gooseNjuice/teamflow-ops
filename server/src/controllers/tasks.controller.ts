import type { RequestHandler } from 'express';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schemas.ts';
import { createTaskActivity } from '../services/activity.service.ts';
import {
  createTask,
  getTaskById,
  getTasks,
  setTaskArchived,
  updateTask,
} from '../services/tasks.service.ts';
import { AppError } from '../utils/AppError.ts';
import type { Task } from '../types/task.types.ts';

function getTaskId(params: { id?: string | string[] }) {
  if (typeof params.id !== 'string') {
    throw new AppError('Task not found', 404);
  }

  return params.id;
}

function getActorId(req: Parameters<RequestHandler>[0]) {
  return req.user?.id ?? 'system';
}

function getChangedFields(
  previousTask: Task,
  updatedTask: Task,
  fields: string[],
) {
  return fields.filter((field) => {
    const key = field as keyof Task;

    return previousTask[key] !== updatedTask[key];
  });
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
  await createTaskActivity({
    taskId: task.id,
    actorId: getActorId(req),
    type: 'task_created',
    message: `Created task "${task.title}"`,
  });

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

  const taskId = getTaskId(req.params);
  const previousTask = await getTaskById(taskId);

  if (!previousTask) {
    throw new AppError('Task not found', 404);
  }

  const task = await updateTask(taskId, result.data);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const changedFields = getChangedFields(
    previousTask,
    task,
    Object.keys(result.data),
  );
  const nonStatusChangedFields = changedFields.filter((field) => field !== 'status');

  if (previousTask.status !== task.status) {
    await createTaskActivity({
      taskId: task.id,
      actorId: getActorId(req),
      type: 'status_changed',
      message: `Changed status from ${previousTask.status} to ${task.status}`,
      metadata: {
        previousStatus: previousTask.status,
        nextStatus: task.status,
      },
    });
  }

  if (nonStatusChangedFields.length > 0) {
    await createTaskActivity({
      taskId: task.id,
      actorId: getActorId(req),
      type: 'task_updated',
      message: `Updated task "${task.title}"`,
      metadata: {
        changedFields: nonStatusChangedFields,
      },
    });
  }

  return res.json(task);
};

export const archiveTask: RequestHandler = async (req, res) => {
  const task = await setTaskArchived(getTaskId(req.params), true);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  await createTaskActivity({
    taskId: task.id,
    actorId: getActorId(req),
    type: 'task_archived',
    message: `Archived task "${task.title}"`,
  });

  return res.json(task);
};

export const restoreTask: RequestHandler = async (req, res) => {
  const task = await setTaskArchived(getTaskId(req.params), false);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  await createTaskActivity({
    taskId: task.id,
    actorId: getActorId(req),
    type: 'task_restored',
    message: `Restored task "${task.title}"`,
  });

  return res.json(task);
};
