import { type Project } from '../types/project.types.ts';

export const projects: Project[] = [
  {
    id: 'project-1',
    name: 'Client Portal Refresh',
    description: 'Improve the self-service experience for portfolio clients.',
    status: 'active',
    ownerId: 'user-1',
    createdAt: '2026-05-01T09:00:00.000Z',
    updatedAt: '2026-05-19T12:00:00.000Z',
  },
  {
    id: 'project-2',
    name: 'Ops Reporting Hub',
    description: 'Centralize team reporting and weekly operational insights.',
    status: 'planning',
    ownerId: 'user-3',
    createdAt: '2026-05-04T10:30:00.000Z',
    updatedAt: '2026-05-18T15:45:00.000Z',
  },
  {
    id: 'project-3',
    name: 'Workflow Automation',
    description: 'Reduce repetitive task handoffs across delivery teams.',
    status: 'paused',
    ownerId: 'user-2',
    createdAt: '2026-05-07T08:15:00.000Z',
    updatedAt: '2026-05-16T11:20:00.000Z',
  },
  {
    id: 'project-4',
    name: 'Support Knowledge Base',
    description: 'Organize internal support guidance for recurring customer issues.',
    status: 'completed',
    ownerId: 'user-4',
    createdAt: '2026-04-22T13:00:00.000Z',
    updatedAt: '2026-05-14T16:10:00.000Z',
  },
];
