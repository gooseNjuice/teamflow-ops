export type TaskComment = {
  id: string
  taskId: string
  authorId: string
  body: string
  createdAt: string
  updatedAt: string
}

export type CreateTaskCommentRequest = {
  taskId: string
  body: string
}
