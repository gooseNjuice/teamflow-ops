export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
