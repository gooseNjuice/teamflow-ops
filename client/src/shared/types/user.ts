export type UserRole = 'admin' | 'manager' | 'developer' | 'viewer'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
}

export type UpdateUserRequest = {
  id: string
  name?: string
  role?: UserRole
  avatarUrl?: string
}
