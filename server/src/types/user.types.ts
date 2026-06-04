export type UserRole = 'admin' | 'manager' | 'developer' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | undefined;
  passwordHash?: string | undefined;
  createdAt: string;
}
