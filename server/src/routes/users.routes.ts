import { Router } from 'express';
import { UserModel } from '../models/user.model.ts';
import type { User } from '../types/user.types.ts';

export const usersRouter = Router();

usersRouter.get('/', async (_req, res, next) => {
  try {
    const users = await UserModel.find({})
      .select('-_id -__v')
      .sort({ createdAt: 1 })
      .lean<User[]>();

    return res.json(users);
  } catch (error) {
    return next(error);
  }
});

usersRouter.get('/:id', async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ id: req.params.id })
      .select('-_id -__v')
      .lean<User>();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
});
