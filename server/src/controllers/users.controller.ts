import type { RequestHandler } from 'express';
import { updateUserSchema } from '../schemas/user.schemas.ts';
import { getUserById, getUsers, updateUser } from '../services/users.service.ts';
import { AppError } from '../utils/AppError.ts';

function getUserId(params: { id?: string | string[] }) {
  if (typeof params.id !== 'string') {
    throw new AppError('User not found', 404);
  }

  return params.id;
}

export const listUsers: RequestHandler = async (_req, res) => {
  const users = await getUsers();

  return res.json(users);
};

export const getUser: RequestHandler = async (req, res) => {
  const user = await getUserById(getUserId(req.params));

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return res.json(user);
};

export const updateUserHandler: RequestHandler = async (req, res) => {
  const result = updateUserSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      'Invalid user data',
      400,
      result.error.flatten().fieldErrors,
    );
  }

  const user = await updateUser(getUserId(req.params), result.data);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return res.json(user);
};
