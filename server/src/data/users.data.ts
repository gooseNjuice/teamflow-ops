import { type User } from '../types/user.types.ts';

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Maya Cohen',
    email: 'maya.cohen@teamflow.example',
    role: 'admin',
    avatarUrl: 'https://example.com/avatars/maya-cohen.png',
    createdAt: '2026-05-01T09:00:00.000Z',
  },
  {
    id: 'user-2',
    name: 'Ethan Brooks',
    email: 'ethan.brooks@teamflow.example',
    role: 'developer',
    createdAt: '2026-05-03T10:30:00.000Z',
  },
  {
    id: 'user-3',
    name: 'Nora Patel',
    email: 'nora.patel@teamflow.example',
    role: 'manager',
    createdAt: '2026-05-05T14:15:00.000Z',
  },
  {
    id: 'user-4',
    name: 'Leo Martins',
    email: 'leo.martins@teamflow.example',
    role: 'viewer',
    createdAt: '2026-05-07T08:45:00.000Z',
  },
];
