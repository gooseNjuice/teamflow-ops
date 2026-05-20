import type { Project, Task, User } from '../types'

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Maya Cohen',
    role: 'Product Lead',
  },
  {
    id: 'user-2',
    name: 'Ethan Brooks',
    role: 'Frontend Engineer',
  },
  {
    id: 'user-3',
    name: 'Nora Patel',
    role: 'Operations Manager',
  },
]

export const projects: Project[] = [
  {
    id: 'project-1',
    name: 'Client Portal Refresh',
    description: 'Improve the self-service experience for portfolio clients.',
    ownerId: 'user-1',
  },
  {
    id: 'project-2',
    name: 'Ops Reporting Hub',
    description: 'Centralize team reporting and weekly operational insights.',
    ownerId: 'user-3',
  },
  {
    id: 'project-3',
    name: 'Workflow Automation',
    description: 'Reduce repetitive task handoffs across delivery teams.',
    ownerId: 'user-2',
  },
]

export const tasks: Task[] = [
  {
    id: 'task-1',
    title: 'Review dashboard requirements',
    projectId: 'project-2',
    assigneeId: 'user-1',
    status: 'done',
    dueDate: '2026-05-12',
    updatedAt: '2026-05-15',
  },
  {
    id: 'task-2',
    title: 'Draft project health summary',
    projectId: 'project-2',
    assigneeId: 'user-3',
    status: 'in-progress',
    dueDate: '2026-05-18',
    updatedAt: '2026-05-18',
  },
  {
    id: 'task-3',
    title: 'Create sidebar navigation states',
    projectId: 'project-1',
    assigneeId: 'user-2',
    status: 'done',
    dueDate: '2026-05-16',
    updatedAt: '2026-05-17',
  },
  {
    id: 'task-4',
    title: 'Map automation handoff steps',
    projectId: 'project-3',
    assigneeId: 'user-3',
    status: 'todo',
    dueDate: '2026-05-21',
    updatedAt: '2026-05-14',
  },
  {
    id: 'task-5',
    title: 'Prepare client feedback notes',
    projectId: 'project-1',
    assigneeId: 'user-1',
    status: 'in-progress',
    dueDate: '2026-05-17',
    updatedAt: '2026-05-19',
  },
  {
    id: 'task-6',
    title: 'Define first reporting metrics',
    projectId: 'project-2',
    assigneeId: 'user-2',
    status: 'todo',
    dueDate: '2026-05-24',
    updatedAt: '2026-05-16',
  },
]

