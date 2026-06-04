import { randomUUID } from 'node:crypto';
import { TaskModel } from '../models/task.model.ts';
import type { Task, TaskPriority, TaskStatus } from '../types/task.types.ts';

type GetTasksOptions = {
  includeArchived: boolean;
  onlyArchived: boolean;
};

export type CreateTaskData = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  projectId: string;
  dueDate?: string | undefined;
};

export type UpdateTaskData = {
  [Property in keyof CreateTaskData]?: CreateTaskData[Property] | undefined;
};

export async function getTasks(options: GetTasksOptions) {
  const filter = options.includeArchived ? {} : { archived: options.onlyArchived };

  return TaskModel.find(filter)
    .select('-_id -__v')
    .sort({ createdAt: 1 })
    .lean<Task[]>();
}

export async function getTaskById(id: string) {
  return TaskModel.findOne({ id }).select('-_id -__v').lean<Task>();
}

export async function createTask(data: CreateTaskData) {
  const now = new Date().toISOString();

  const task = await TaskModel.create({
    ...data,
    id: `task-${randomUUID()}`,
    createdAt: now,
    updatedAt: now,
    archived: false,
  });

  return task.toJSON();
}

export async function updateTask(id: string, data: UpdateTaskData) {
  return TaskModel.findOneAndUpdate(
    { id },
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    { new: true, runValidators: true },
  )
    .select('-_id -__v')
    .lean<Task>();
}

export async function setTaskArchived(id: string, archived: boolean) {
  return TaskModel.findOneAndUpdate(
    { id },
    {
      archived,
      updatedAt: new Date().toISOString(),
    },
    { new: true, runValidators: true },
  )
    .select('-_id -__v')
    .lean<Task>();
}
