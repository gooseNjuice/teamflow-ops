import { randomUUID } from 'node:crypto';
import { TaskActivityModel } from '../models/taskActivity.model.ts';
import type { TaskActivity, TaskActivityType } from '../types/activity.types.ts';

type CreateTaskActivityData = {
  taskId: string;
  actorId: string;
  type: TaskActivityType;
  message: string;
  metadata?: Record<string, unknown>;
};

export async function getTaskActivity(taskId: string) {
  return TaskActivityModel.find({ taskId })
    .select('-_id -__v')
    .sort({ createdAt: -1 })
    .lean<TaskActivity[]>();
}

export async function createTaskActivity(data: CreateTaskActivityData) {
  const activity = await TaskActivityModel.create({
    ...data,
    id: `activity-${randomUUID()}`,
    createdAt: new Date().toISOString(),
  });

  return activity.toJSON();
}
