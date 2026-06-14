import type { RequestHandler } from 'express';
import { getTaskActivity } from '../services/activity.service.ts';
import { getTaskById } from '../services/tasks.service.ts';
import { AppError } from '../utils/AppError.ts';

function getTaskId(params: { taskId?: string | string[] }) {
  if (typeof params.taskId !== 'string') {
    throw new AppError('Task not found', 404);
  }

  return params.taskId;
}

export const listTaskActivity: RequestHandler = async (req, res) => {
  const taskId = getTaskId(req.params);
  const task = await getTaskById(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const activity = await getTaskActivity(taskId);

  return res.json(activity);
};
