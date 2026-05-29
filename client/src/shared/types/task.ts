export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string
  projectId: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  archived: boolean
}
