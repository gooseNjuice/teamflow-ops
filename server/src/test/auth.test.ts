import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app.ts';
import { TaskModel } from '../models/task.model.ts';

const testUser = {
  name: 'Test Developer',
  email: 'developer@example.com',
  password: 'Password123!',
  role: 'developer',
};

async function registerTestUser(overrides: Partial<typeof testUser> = {}) {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ ...testUser, ...overrides })
    .expect(201);

  return response.body as {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
      passwordHash?: string;
    };
  };
}

describe('auth API', () => {
  it('registers a user and returns a safe user with a token', async () => {
    const response = await registerTestUser();

    expect(response.token).toEqual(expect.any(String));
    expect(response.user).toMatchObject({
      name: testUser.name,
      email: testUser.email,
      role: testUser.role,
    });
    expect(response.user.id).toEqual(expect.any(String));
    expect(response.user.createdAt).toEqual(expect.any(String));
    expect(response.user).not.toHaveProperty('passwordHash');
  });

  it('logs in with valid credentials and returns a safe user with a token', async () => {
    await registerTestUser();

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      name: testUser.name,
      email: testUser.email,
      role: testUser.role,
    });
    expect(response.body.user).not.toHaveProperty('passwordHash');
  });

  it('returns the current user with a valid token', async () => {
    const { token, user } = await registerTestUser();

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('returns 401 for the current user endpoint without a token', async () => {
    const response = await request(app).get('/api/auth/me').expect(401);

    expect(response.body).toEqual({
      message: 'Authentication token is required',
    });
  });
});

describe('protected workspace routes', () => {
  it('returns 401 for tasks without a token', async () => {
    const response = await request(app).get('/api/tasks').expect(401);

    expect(response.body).toEqual({
      message: 'Authentication token is required',
    });
  });

  it('returns tasks with a valid token', async () => {
    const { token, user } = await registerTestUser();
    const now = new Date().toISOString();

    await TaskModel.create({
      id: 'task-test-1',
      title: 'Protected workspace task',
      description: 'Visible to authenticated users.',
      status: 'todo',
      priority: 'medium',
      assigneeId: user.id,
      projectId: 'project-test-1',
      createdAt: now,
      updatedAt: now,
      archived: false,
    });

    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        id: 'task-test-1',
        title: 'Protected workspace task',
        assigneeId: user.id,
        archived: false,
      }),
    ]);
  });
});
