import type { UserRole } from './user'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
  role?: UserRole
}

export type AuthResponse = {
  user: AuthUser
  token: string
}
