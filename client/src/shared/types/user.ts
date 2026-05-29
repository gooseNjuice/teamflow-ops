export type UserRole = 'admin' | 'manager' | 'developer' | 'viewer'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
}
