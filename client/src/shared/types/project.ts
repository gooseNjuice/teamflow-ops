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
