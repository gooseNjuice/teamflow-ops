import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app.ts';

const password = 'Password123!';

async function registerTestUser({
  email,
  role = 'developer',
}: {
  email: string;
  role?: 'admin' | 'manager' | 'developer' | 'viewer';
}) {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'User Mutation Test',
      email,
      password,
      role,
    })
    .expect(201);

  return response.body as {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      passwordHash?: string;
    };
  };
}

describe('user mutation API', () => {
  it('updates a user profile and role for admins without exposing passwordHash', async () => {
    const { token } = await registerTestUser({
      email: 'user-admin-update@example.com',
      role: 'admin',
    });
    const { user } = await registerTestUser({
      email: 'user-target-update@example.com',
      role: 'developer',
    });

    const response = await request(app)
      .patch(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated User',
        role: 'manager',
        avatarUrl: 'https://example.com/avatar.png',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      id: user.id,
      name: 'Updated User',
      role: 'manager',
      avatarUrl: 'https://example.com/avatar.png',
    });
    expect(response.body).not.toHaveProperty('passwordHash');
    expect(response.body).not.toHaveProperty('_id');
    expect(response.body).not.toHaveProperty('__v');
  });

  it('rejects user updates from non-admin roles', async () => {
    const { token, user } = await registerTestUser({
      email: 'user-manager-update@example.com',
      role: 'manager',
    });

    const response = await request(app)
      .patch(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Not Allowed' })
      .expect(403);

    expect(response.body).toEqual({
      message: 'You do not have permission to perform this action',
    });
  });

  it('returns 400 for invalid user update data', async () => {
    const { token, user } = await registerTestUser({
      email: 'user-invalid-admin@example.com',
      role: 'admin',
    });

    const response = await request(app)
      .patch(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'owner' })
      .expect(400);

    expect(response.body).toMatchObject({
      message: 'Invalid user data',
    });
  });

  it('returns 404 when updating a missing user', async () => {
    const { token } = await registerTestUser({
      email: 'user-missing-admin@example.com',
      role: 'admin',
    });

    const response = await request(app)
      .patch('/api/users/missing-user')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Still Missing' })
      .expect(404);

    expect(response.body).toEqual({ message: 'User not found' });
  });
});
