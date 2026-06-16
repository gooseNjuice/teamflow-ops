import { ProjectModel } from '../models/project.model.ts';
import { TaskModel } from '../models/task.model.ts';
import { UserModel } from '../models/user.model.ts';
import type { Project } from '../types/project.types.ts';
import type { SearchResult } from '../types/search.types.ts';
import type { Task } from '../types/task.types.ts';
import type { PublicUser } from '../types/user.types.ts';

const defaultSearchLimit = 15;
const minimumQueryLength = 2;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeQuery(query: string) {
  return query.trim();
}

function buildSearchRegex(query: string) {
  return new RegExp(escapeRegex(query), 'i');
}

function taskToSearchResult(task: Task): SearchResult {
  return {
    id: `task:${task.id}`,
    type: 'task',
    title: task.title,
    subtitle: task.description || 'Task',
    targetId: task.id,
    url: `/tasks`,
    metadata: {
      status: task.status,
      priority: task.priority,
      archived: task.archived,
    },
  };
}

function projectToSearchResult(project: Project): SearchResult {
  return {
    id: `project:${project.id}`,
    type: 'project',
    title: project.name,
    subtitle: project.description || 'Project',
    targetId: project.id,
    url: `/projects/${project.id}`,
    metadata: {
      status: project.status,
      ownerId: project.ownerId,
    },
  };
}

function userToSearchResult(user: PublicUser): SearchResult {
  return {
    id: `user:${user.id}`,
    type: 'user',
    title: user.name,
    subtitle: user.email,
    targetId: user.id,
    url: `/team`,
    metadata: {
      role: user.role,
    },
  };
}

export async function searchWorkspace(query: string, limit = defaultSearchLimit) {
  const normalizedQuery = normalizeQuery(query);

  if (normalizedQuery.length < minimumQueryLength) {
    return [];
  }

  const regex = buildSearchRegex(normalizedQuery);
  const perCollectionLimit = limit;
  const [tasks, projects, users] = await Promise.all([
    TaskModel.find({
      archived: false,
      $or: [{ title: regex }, { description: regex }],
    })
      .select('-_id -__v')
      .sort({ updatedAt: -1 })
      .limit(perCollectionLimit)
      .lean<Task[]>(),
    ProjectModel.find({
      $or: [{ name: regex }, { description: regex }],
    })
      .select('-_id -__v')
      .sort({ updatedAt: -1 })
      .limit(perCollectionLimit)
      .lean<Project[]>(),
    UserModel.find({
      $or: [{ name: regex }, { email: regex }],
    })
      .select('-_id -__v -passwordHash')
      .sort({ name: 1 })
      .limit(perCollectionLimit)
      .lean<PublicUser[]>(),
  ]);

  return [
    ...tasks.map(taskToSearchResult),
    ...projects.map(projectToSearchResult),
    ...users.map(userToSearchResult),
  ].slice(0, limit);
}
