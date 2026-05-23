export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done'
export type ProjectStatus = 'planning' | 'active' | 'at-risk'
export type TaskPriority = 'low' | 'medium' | 'high'

export type Project = {
  id: string
  name: string
  description: string
  ownerId: string
  status: ProjectStatus
  updatedAt: string
}

export type User = {
  id: string
  name: string
  role: string
}

export type Task = {
  id: string
  title: string
  description: string
  projectId: string
  assigneeId: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  createdAt: string
  updatedAt: string
}
