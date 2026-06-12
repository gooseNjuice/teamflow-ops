import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getOverdueTasks,
  getTasksByPriority,
  getTasksByStatus,
} from '../features/dashboard/utils/dashboardMetrics'
import { useGetProjectQuery } from '../shared/api/projectsApi'
import { useGetTasksQuery } from '../shared/api/tasksApi'
import { useGetUsersQuery } from '../shared/api/usersApi'
import type { ProjectStatus } from '../shared/types/project'
import type { TaskPriority, TaskStatus } from '../shared/types/task'
import { EmptyState, ErrorState, LoadingState } from '../shared/ui/ApiState'
import styles from './ProjectDetailsPage.module.css'

const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
}

const taskStatusLabels: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To do',
  'in-progress': 'In progress',
  'in-review': 'In review',
  done: 'Done',
}

const taskPriorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

function formatDate(date: string) {
  const dateValue = date.includes('T') ? date : `${date}T00:00:00`

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateValue))
}

function isNotFoundError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 404
  )
}

function ProjectDetailsPage() {
  const { projectId } = useParams()
  const {
    data: project,
    error: projectError,
    isError: isProjectError,
    isLoading: isProjectLoading,
  } = useGetProjectQuery(projectId ?? '', {
    skip: !projectId,
  })
  const {
    data: users = [],
    error: usersError,
    isError: isUsersError,
    isLoading: isUsersLoading,
  } = useGetUsersQuery()
  const {
    data: activeTasks = [],
    error: activeTasksError,
    isError: isActiveTasksError,
    isLoading: isActiveTasksLoading,
  } = useGetTasksQuery()
  const {
    data: archivedTasks = [],
    error: archivedTasksError,
    isError: isArchivedTasksError,
    isLoading: isArchivedTasksLoading,
  } = useGetTasksQuery({ archived: true })
  const isLoading =
    isProjectLoading ||
    isUsersLoading ||
    isActiveTasksLoading ||
    isArchivedTasksLoading
  const isError =
    isProjectError || isUsersError || isActiveTasksError || isArchivedTasksError
  const apiError = projectError ?? usersError ?? activeTasksError ?? archivedTasksError
  const ownerName = project
    ? users.find((user) => user.id === project.ownerId)?.name ?? project.ownerId
    : ''
  const projectActiveTasks = useMemo(
    () => activeTasks.filter((task) => task.projectId === projectId),
    [activeTasks, projectId],
  )
  const projectArchivedTasks = useMemo(
    () => archivedTasks.filter((task) => task.projectId === projectId),
    [archivedTasks, projectId],
  )
  const projectTasks = useMemo(
    () => [...projectActiveTasks, ...projectArchivedTasks],
    [projectActiveTasks, projectArchivedTasks],
  )
  const completedTasksCount = projectTasks.filter(
    (task) => task.status === 'done',
  ).length
  const inProgressTasksCount = projectTasks.filter(
    (task) => task.status === 'in-progress',
  ).length
  const overdueTasksCount = getOverdueTasks(projectActiveTasks).length
  const completionPercent =
    projectTasks.length > 0
      ? Math.round((completedTasksCount / projectTasks.length) * 100)
      : 0
  const tasksByStatus = getTasksByStatus(projectTasks)
  const tasksByPriority = getTasksByPriority(projectTasks)

  return (
    <div className={styles.projectDetailsPage}>
      <Link className={styles.backLink} to="/projects">
        Back to projects
      </Link>

      {isLoading ? (
        <LoadingState
          title="Loading project"
          description="Fetching project details from the API."
        />
      ) : null}

      {!isLoading && isNotFoundError(projectError) ? (
        <EmptyState
          title="Project not found"
          description="The requested project could not be found."
        />
      ) : null}

      {!isLoading && isError && !isNotFoundError(projectError) ? (
        <ErrorState error={apiError} title="Could not load project" />
      ) : null}

      {!isLoading && !isError && project ? (
        <>
          <section className={styles.detailsCard} aria-labelledby="project-title">
            <header className={styles.header}>
              <div>
                <p className={styles.eyebrow}>Project details</p>
                <h2 id="project-title">{project.name}</h2>
                <p>{project.description}</p>
              </div>
              <span className={`${styles.statusPill} ${styles[project.status]}`}>
                {projectStatusLabels[project.status]}
              </span>
            </header>

            <dl className={styles.detailsGrid}>
              <div>
                <dt>Owner</dt>
                <dd>{ownerName}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{projectStatusLabels[project.status]}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(project.createdAt)}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{formatDate(project.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          {projectTasks.length > 0 ? (
            <>
              <section className={styles.metricsGrid} aria-label="Project task metrics">
                <article className={styles.metricCard}>
                  <span>Total tasks</span>
                  <strong>{projectTasks.length}</strong>
                </article>
                <article className={styles.metricCard}>
                  <span>Completed</span>
                  <strong>{completedTasksCount}</strong>
                </article>
                <article className={styles.metricCard}>
                  <span>In progress</span>
                  <strong>{inProgressTasksCount}</strong>
                </article>
                <article className={styles.metricCard}>
                  <span>Overdue</span>
                  <strong>{overdueTasksCount}</strong>
                </article>
                <article className={styles.metricCard}>
                  <span>Archived</span>
                  <strong>{projectArchivedTasks.length}</strong>
                </article>
                <article className={styles.metricCard}>
                  <span>Completion</span>
                  <strong>{completionPercent}%</strong>
                </article>
              </section>

              <section className={styles.breakdownGrid} aria-label="Project task breakdowns">
                <article className={styles.breakdownCard}>
                  <header>
                    <p className={styles.eyebrow}>Tasks</p>
                    <h3>Status breakdown</h3>
                  </header>
                  <div className={styles.breakdownList}>
                    {Object.entries(tasksByStatus).map(([status, count]) => (
                      <div key={status} className={styles.breakdownItem}>
                        <span>{taskStatusLabels[status as TaskStatus]}</span>
                        <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                </article>

                <article className={styles.breakdownCard}>
                  <header>
                    <p className={styles.eyebrow}>Tasks</p>
                    <h3>Priority breakdown</h3>
                  </header>
                  <div className={styles.breakdownList}>
                    {Object.entries(tasksByPriority).map(([priority, count]) => (
                      <div key={priority} className={styles.breakdownItem}>
                        <span>{taskPriorityLabels[priority as TaskPriority]}</span>
                        <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            </>
          ) : (
            <EmptyState
              title="No tasks for this project yet"
              description="This project does not have active or archived tasks to summarize."
            />
          )}
        </>
      ) : null}
    </div>
  )
}

export default ProjectDetailsPage
