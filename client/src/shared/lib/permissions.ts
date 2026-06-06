import type { UserRole } from '../types/user'

const taskEditorRoles: UserRole[] = ['admin', 'manager', 'developer']
const taskArchiveRoles: UserRole[] = ['admin', 'manager']

export function canCreateTask(role: UserRole | undefined) {
  return !!role && taskEditorRoles.includes(role)
}

export function canEditTask(role: UserRole | undefined) {
  return canCreateTask(role)
}

export function canArchiveTask(role: UserRole | undefined) {
  return !!role && taskArchiveRoles.includes(role)
}

export function canRestoreTask(role: UserRole | undefined) {
  return canArchiveTask(role)
}
