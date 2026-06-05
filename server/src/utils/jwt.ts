import jwt, { type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '../types/user.types.ts';

type AuthTokenPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

export function validateJwtConfig() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }
}

export function signAuthToken(payload: AuthTokenPayload) {
  validateJwtConfig();

  const expiresIn = (process.env.JWT_EXPIRES_IN || '1d') as NonNullable<
    SignOptions['expiresIn']
  >;
  const options: SignOptions = {
    expiresIn,
  };

  return jwt.sign(payload, process.env.JWT_SECRET as string, options);
}
