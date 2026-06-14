export type TaskActivityType =
  | 'task_created'
  | 'task_updated'
  | 'status_changed'
  | 'task_archived'
  | 'task_restored'
  | 'comment_created'

export type TaskActivity = {
  id: string
  taskId: string
  actorId: string
  type: TaskActivityType
  message: string
  metadata?: Record<string, unknown>
  createdAt: string
}
