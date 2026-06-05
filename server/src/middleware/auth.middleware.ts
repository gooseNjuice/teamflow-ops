import type { RequestHandler } from 'express';
import { getUserById } from '../services/users.service.ts';
import { AppError } from '../utils/AppError.ts';
import { verifyAuthToken } from '../utils/jwt.ts';

function getBearerToken(authorizationHeader: string | undefined) {
  if (!authorizationHeader) {
    throw new AppError('Authentication token is required', 401);
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Authentication token is invalid', 401);
  }

  return token;
}

export const authenticate: RequestHandler = async (req, _res, next) => {
  const token = getBearerToken(req.headers.authorization);
  const payload = verifyAuthToken(token);
  const user = await getUserById(payload.userId);

  if (!user) {
    throw new AppError('Authenticated user was not found', 401);
  }

  req.user = user;
  next();
};
