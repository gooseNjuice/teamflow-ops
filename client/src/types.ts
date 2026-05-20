export type TaskStatus = 'todo' | 'in-progress' | 'done'

export type Project = {
  id: string
  name: string
  description: string
  ownerId: string
}

export type User = {
  id: string
  name: string
  role: string
}

export type Task = {
  id: string
  title: string
  projectId: string
  assigneeId: string
  status: TaskStatus
  dueDate: string
  updatedAt: string
}

