import { useMemo, useState, type KeyboardEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import TaskDetailsModal from '../components/TaskDetailsModal'
import {
  getOverdueTasks,
  getTasksByPriority,
  getTasksByStatus,
} from '../features/dashboard/utils/dashboardMetrics'
import { useGetProjectQuery } from '../shared/api/projectsApi'
import { useGetTasksQuery } from '../shared/api/tasksApi'
import { useGetUsersQuery } from '../shared/api/usersApi'
import type { ProjectStatus } from '../shared/types/project'
import type { Task, TaskPriority, TaskStatus } from '../shared/types/task'
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

function formatDate(date: string | undefined, fallback = 'No date') {
  if (!date) {
    return fallback
  }

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
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
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
  const filteredProjectTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return projectTasks.filter((task) => {
      const matchesSearch =
        !normalizedQuery || task.title.toLowerCase().includes(normalizedQuery)
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesPriority =
        priorityFilter === 'all' || task.priority === priorityFilter
      const matchesAssignee =
        assigneeFilter === 'all' || task.assigneeId === assigneeFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
    })
  }, [assigneeFilter, priorityFilter, projectTasks, searchQuery, statusFilter])
  const projectAssignees = useMemo(
    () =>
      users.filter((user) =>
        projectTasks.some((task) => task.assigneeId === user.id),
      ),
    [projectTasks, users],
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

  function getAssigneeName(task: Task) {
    return users.find((user) => user.id === task.assigneeId)?.name ?? 'Unassigned'
  }

  function handleTaskRowKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    task: Task,
  ) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelectedTask(task)
    }
  }

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

              <section className={styles.tasksSection} aria-label="Project tasks">
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.eyebrow}>Tasks</p>
                    <h3>Project task list</h3>
                  </div>
                  <span>
                    {filteredProjectTasks.length} of {projectTasks.length} shown
                  </span>
                </div>

                <div className={styles.filters} aria-label="Project task filters">
                  <label htmlFor="project-task-search">
                    Search tasks
                    <input
                      id="project-task-search"
                      type="search"
                      placeholder="Search by task title"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                    />
                  </label>

                  <label htmlFor="project-task-status">
                    Status
                    <select
                      id="project-task-status"
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(event.target.value as TaskStatus | 'all')
                      }
                    >
                      <option value="all">All statuses</option>
                      {Object.entries(taskStatusLabels).map(([status, label]) => (
                        <option key={status} value={status}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label htmlFor="project-task-priority">
                    Priority
                    <select
                      id="project-task-priority"
                      value={priorityFilter}
                      onChange={(event) =>
                        setPriorityFilter(
                          event.target.value as TaskPriority | 'all',
                        )
                      }
                    >
                      <option value="all">All priorities</option>
                      {Object.entries(taskPriorityLabels).map(([priority, label]) => (
                        <option key={priority} value={priority}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label htmlFor="project-task-assignee">
                    Assignee
                    <select
                      id="project-task-assignee"
                      value={assigneeFilter}
                      onChange={(event) => setAssigneeFilter(event.target.value)}
                    >
                      <option value="all">All assignees</option>
                      {projectAssignees.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {filteredProjectTasks.length > 0 ? (
                  <div className={styles.tableScroller}>
                    <table className={styles.tasksTable}>
                      <thead>
                        <tr>
                          <th scope="col">Title</th>
                          <th scope="col">Status</th>
                          <th scope="col">Priority</th>
                          <th scope="col">Assignee</th>
                          <th scope="col">Due date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjectTasks.map((task) => (
                          <tr
                            key={task.id}
                            className={styles.clickableRow}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedTask(task)}
                            onKeyDown={(event) => handleTaskRowKeyDown(event, task)}
                          >
                            <td>
                              <strong>{task.title}</strong>
                            </td>
                            <td>
                              <span className={`${styles.pill} ${styles[task.status]}`}>
                                {taskStatusLabels[task.status]}
                              </span>
                            </td>
                            <td>
                              <span className={`${styles.pill} ${styles[task.priority]}`}>
                                {taskPriorityLabels[task.priority]}
                              </span>
                            </td>
                            <td>{getAssigneeName(task)}</td>
                            <td>{formatDate(task.dueDate, 'No due date')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    title="No tasks match these filters"
                    description="Try changing the search query or clearing one of the filters."
                  />
                )}
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

      {selectedTask && project ? (
        <TaskDetailsModal
          task={selectedTask}
          assigneeName={getAssigneeName(selectedTask)}
          projectName={project.name}
          onClose={() => setSelectedTask(null)}
        />
      ) : null}
    </div>
  )
}

export default ProjectDetailsPage
