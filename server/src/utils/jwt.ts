import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '../types/user.types.ts';
import { AppError } from './AppError.ts';

const userRoles: UserRole[] = ['admin', 'manager', 'developer', 'viewer'];

export type AuthTokenPayload = {
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

function isAuthTokenPayload(payload: string | JwtPayload): payload is AuthTokenPayload {
  return (
    typeof payload !== 'string' &&
    typeof payload.userId === 'string' &&
    typeof payload.email === 'string' &&
    typeof payload.role === 'string' &&
    userRoles.includes(payload.role as UserRole)
  );
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  validateJwtConfig();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);

    if (!isAuthTokenPayload(payload)) {
      throw new AppError('Invalid authentication token', 401);
    }

    return payload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Invalid authentication token', 401);
  }
}
