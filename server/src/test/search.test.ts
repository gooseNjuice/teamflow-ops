import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app.ts';
import { ProjectModel } from '../models/project.model.ts';
import { TaskModel } from '../models/task.model.ts';

const password = 'Password123!';

async function registerTestUser({
  email,
  name = 'Search Test User',
}: {
  email: string;
  name?: string;
}) {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name,
      email,
      password,
      role: 'developer',
    })
    .expect(201);

  return response.body as {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

async function seedSearchData(ownerId: string) {
  const now = new Date().toISOString();

  await ProjectModel.create({
    id: 'project-search-1',
    name: 'Customer Launch',
    description: 'Portal rollout planning',
    status: 'active',
    ownerId,
    createdAt: now,
    updatedAt: now,
  });
  await TaskModel.create([
    {
      id: 'task-search-1',
      title: 'Launch checklist',
      description: 'Prepare customer release checklist',
      status: 'todo',
      priority: 'high',
      assigneeId: ownerId,
      projectId: 'project-search-1',
      createdAt: now,
      updatedAt: now,
      archived: false,
    },
    {
      id: 'task-search-archived',
      title: 'Launch archived task',
      description: 'This should not appear by default',
      status: 'done',
      priority: 'medium',
      assigneeId: ownerId,
      projectId: 'project-search-1',
      createdAt: now,
      updatedAt: now,
      archived: true,
    },
  ]);
}

describe('global search API', () => {
  it('requires authentication', async () => {
    const response = await request(app).get('/api/search?q=launch').expect(401);

    expect(response.body).toEqual({
      message: 'Authentication token is required',
    });
  });

  it('returns an empty array for empty or very short queries', async () => {
    const { token } = await registerTestUser({
      email: 'short-search@example.com',
    });

    const response = await request(app)
      .get('/api/search?q=l')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('returns normalized task, project, and user results without passwordHash', async () => {
    const { token, user } = await registerTestUser({
      email: 'launch-search@example.com',
      name: 'Launch Coordinator',
    });
    await seedSearchData(user.id);

    const response = await request(app)
      .get('/api/search?q=launch')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'task:task-search-1',
          type: 'task',
          title: 'Launch checklist',
          targetId: 'task-search-1',
          url: '/tasks',
        }),
        expect.objectContaining({
          id: 'project:project-search-1',
          type: 'project',
          title: 'Customer Launch',
          targetId: 'project-search-1',
          url: '/projects/project-search-1',
        }),
        expect.objectContaining({
          id: `user:${user.id}`,
          type: 'user',
          title: 'Launch Coordinator',
          subtitle: 'launch-search@example.com',
          targetId: user.id,
          url: '/team',
        }),
      ]),
    );
    expect(response.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'task:task-search-archived' }),
      ]),
    );
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });
});
