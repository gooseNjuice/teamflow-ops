import type { Project } from '../../../shared/types/project'
import type { Task, TaskPriority, TaskStatus } from '../../../shared/types/task'
import type { User } from '../../../shared/types/user'

const taskStatuses: TaskStatus[] = [
  'backlog',
  'todo',
  'in-progress',
  'in-review',
  'done',
]

const taskPriorities: TaskPriority[] = ['low', 'medium', 'high']

export type DashboardMetricsInput = {
  tasks: Task[]
  users: User[]
  projects: Project[]
  today?: Date
  recentLimit?: number
}

export type WorkloadByAssigneeItem = {
  assigneeId: string
  assigneeName: string
  totalTasks: number
  completedTasks: number
  activeTasks: number
}

export type ProjectProgressItem = {
  projectId: string
  projectName: string
  totalTasks: number
  completedTasks: number
  progressPercent: number
}

export type DashboardMetrics = {
  totalActiveTasks: number
  totalProjects: number
  tasksByStatus: Record<TaskStatus, number>
  tasksByPriority: Record<TaskPriority, number>
  overdueTasks: Task[]
  recentlyUpdatedTasks: Task[]
  completedTasksCount: number
  inProgressTasksCount: number
  workloadByAssignee: WorkloadByAssigneeItem[]
  projectProgress: ProjectProgressItem[]
}

function getActiveTasks(tasks: Task[]) {
  return tasks.filter((task) => !task.archived)
}

function getDateStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseTaskDate(date: string | undefined) {
  if (!date) {
    return null
  }

  const dateValue = date.includes('T') ? date : `${date}T00:00:00`
  const parsedDate = new Date(dateValue)

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

export function getTasksByStatus(tasks: Task[]): Record<TaskStatus, number> {
  return taskStatuses.reduce(
    (counts, status) => ({
      ...counts,
      [status]: tasks.filter((task) => task.status === status).length,
    }),
    {} as Record<TaskStatus, number>,
  )
}

export function getTasksByPriority(tasks: Task[]): Record<TaskPriority, number> {
  return taskPriorities.reduce(
    (counts, priority) => ({
      ...counts,
      [priority]: tasks.filter((task) => task.priority === priority).length,
    }),
    {} as Record<TaskPriority, number>,
  )
}

export function getOverdueTasks(tasks: Task[], today = new Date()) {
  const todayStart = getDateStart(today)

  return tasks.filter((task) => {
    const dueDate = parseTaskDate(task.dueDate)

    return Boolean(dueDate && task.status !== 'done' && dueDate < todayStart)
  })
}

export function getRecentlyUpdatedTasks(tasks: Task[], limit = 5) {
  return [...tasks]
    .sort((firstTask, secondTask) => {
      const firstUpdatedAt = parseTaskDate(firstTask.updatedAt)?.getTime() ?? 0
      const secondUpdatedAt = parseTaskDate(secondTask.updatedAt)?.getTime() ?? 0

      return secondUpdatedAt - firstUpdatedAt
    })
    .slice(0, limit)
}

export function getWorkloadByAssignee(
  tasks: Task[],
  users: User[],
): WorkloadByAssigneeItem[] {
  return users.map((user) => {
    const assignedTasks = tasks.filter((task) => task.assigneeId === user.id)
    const completedTasks = assignedTasks.filter((task) => task.status === 'done').length

    return {
      assigneeId: user.id,
      assigneeName: user.name,
      totalTasks: assignedTasks.length,
      completedTasks,
      activeTasks: assignedTasks.length - completedTasks,
    }
  })
}

export function getProjectProgress(
  tasks: Task[],
  projects: Project[],
): ProjectProgressItem[] {
  return projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id)
    const completedTasks = projectTasks.filter((task) => task.status === 'done').length
    const progressPercent =
      projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0

    return {
      projectId: project.id,
      projectName: project.name,
      totalTasks: projectTasks.length,
      completedTasks,
      progressPercent,
    }
  })
}

export function getDashboardMetrics({
  tasks,
  users,
  projects,
  today = new Date(),
  recentLimit = 5,
}: DashboardMetricsInput): DashboardMetrics {
  const activeTasks = getActiveTasks(tasks)

  return {
    totalActiveTasks: activeTasks.length,
    totalProjects: projects.length,
    tasksByStatus: getTasksByStatus(activeTasks),
    tasksByPriority: getTasksByPriority(activeTasks),
    overdueTasks: getOverdueTasks(activeTasks, today),
    recentlyUpdatedTasks: getRecentlyUpdatedTasks(activeTasks, recentLimit),
    completedTasksCount: activeTasks.filter((task) => task.status === 'done').length,
    inProgressTasksCount: activeTasks.filter(
      (task) => task.status === 'in-progress',
    ).length,
    workloadByAssignee: getWorkloadByAssignee(activeTasks, users),
    projectProgress: getProjectProgress(activeTasks, projects),
  }
}
