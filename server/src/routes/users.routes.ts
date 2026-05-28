import { Router } from 'express';
import { users } from '../data/users.data.ts';

export const usersRouter = Router();

usersRouter.get('/', (_req, res) => {
  return res.json(users);
});

usersRouter.get('/:id', (req, res) => {
  const user = users.find((item) => item.id === req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json(user);
});
