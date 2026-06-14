import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app.ts';
import { ProjectModel } from '../models/project.model.ts';

const password = 'Password123!';

async function registerTestUser({
  email,
  role = 'manager',
}: {
  email: string;
  role?: 'admin' | 'manager' | 'developer' | 'viewer';
}) {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Project Test User',
      email,
      password,
      role,
    })
    .expect(201);

  return response.body as {
    token: string;
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
}

async function createExistingProject(ownerId: string) {
  const now = new Date().toISOString();

  await ProjectModel.create({
    id: 'project-mutations-1',
    name: 'Existing project',
    description: 'Used for project mutation tests.',
    status: 'planning',
    ownerId,
    createdAt: now,
    updatedAt: now,
  });
}

describe('project mutation API', () => {
  it('creates a project for managers using the current user as default owner', async () => {
    const { token, user } = await registerTestUser({
      email: 'project-manager-create@example.com',
      role: 'manager',
    });

    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Customer portal',
        description: 'Build the customer-facing workspace.',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      name: 'Customer portal',
      description: 'Build the customer-facing workspace.',
      status: 'active',
      ownerId: user.id,
    });
    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.createdAt).toEqual(expect.any(String));
    expect(response.body.updatedAt).toEqual(expect.any(String));
    expect(response.body).not.toHaveProperty('_id');
    expect(response.body).not.toHaveProperty('__v');
  });

  it('updates a project for admins', async () => {
    const { token, user } = await registerTestUser({
      email: 'project-admin-update@example.com',
      role: 'admin',
    });
    await createExistingProject(user.id);

    const response = await request(app)
      .patch('/api/projects/project-mutations-1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated project',
        status: 'paused',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      id: 'project-mutations-1',
      name: 'Updated project',
      status: 'paused',
      ownerId: user.id,
    });
    expect(response.body.updatedAt).toEqual(expect.any(String));
  });

  it('rejects project mutations for read-only roles', async () => {
    const { token } = await registerTestUser({
      email: 'project-developer-readonly@example.com',
      role: 'developer',
    });

    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Unauthorized project',
        description: 'Developers cannot create projects.',
      })
      .expect(403);

    expect(response.body).toEqual({
      message: 'You do not have permission to perform this action',
    });
  });

  it('returns 400 when the provided owner does not exist', async () => {
    const { token } = await registerTestUser({
      email: 'project-invalid-owner@example.com',
      role: 'manager',
    });

    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Missing owner project',
        description: 'This should not be created.',
        ownerId: 'missing-user',
      })
      .expect(400);

    expect(response.body).toEqual({ message: 'Project owner not found' });
  });

  it('returns 404 when updating a missing project', async () => {
    const { token } = await registerTestUser({
      email: 'project-missing-update@example.com',
      role: 'manager',
    });

    const response = await request(app)
      .patch('/api/projects/missing-project')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Still missing' })
      .expect(404);

    expect(response.body).toEqual({ message: 'Project not found' });
  });
});
