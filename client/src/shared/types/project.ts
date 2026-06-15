export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed'

export type Project = {
  id: string
  name: string
  description: string
  status: ProjectStatus
  ownerId: string
  createdAt: string
  updatedAt: string
}

export type CreateProjectRequest = {
  name: string
  description?: string
  status?: ProjectStatus
  ownerId?: string
}

export type UpdateProjectRequest = {
  id: string
  name?: string
  description?: string
  status?: ProjectStatus
  ownerId?: string
}
