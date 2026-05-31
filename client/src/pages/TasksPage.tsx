import { useMemo, useState, type KeyboardEvent } from 'react'
import TaskCard from '../components/TaskCard'
import TaskDetailsModal from '../components/TaskDetailsModal'
import { useGetProjectsQuery } from '../shared/api/projectsApi'
import { useGetTasksQuery } from '../shared/api/tasksApi'
import { useGetUsersQuery } from '../shared/api/usersApi'
import type { Project } from '../shared/types/project'
import type { Task, TaskPriority, TaskStatus } from '../shared/types/task'
import type { User } from '../shared/types/user'
import styles from './TasksPage.module.css'

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

const kanbanColumns: { status: TaskStatus; title: string }[] = [
  { status: 'backlog', title: 'Backlog' },
  { status: 'todo', title: 'Todo' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'in-review', title: 'In Review' },
  { status: 'done', title: 'Done' },
]

function getAssigneeName(task: Task, availableUsers: User[]) {
  return availableUsers.find((user) => user.id === task.assigneeId)?.name ?? 'Unassigned'
}

function getProjectName(task: Task, availableProjects: Project[]) {
  return (
    availableProjects.find((project) => project.id === task.projectId)?.name ??
    'Unknown project'
  )
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

function TasksPage() {
  const {
    data: tasks = [],
    isError: isTasksError,
    isLoading: isTasksLoading,
  } = useGetTasksQuery()
  const {
    data: users = [],
    isError: isUsersError,
    isLoading: isUsersLoading,
  } = useGetUsersQuery()
  const {
    data: projects = [],
    isError: isProjectsError,
    isLoading: isProjectsLoading,
  } = useGetProjectsQuery()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const activeTasks = useMemo(() => tasks.filter((task) => !task.archived), [tasks])
  const isLoading = isTasksLoading || isUsersLoading || isProjectsLoading
  const isError = isTasksError || isUsersError || isProjectsError

  const filteredTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return activeTasks.filter((task) => {
      const matchesSearch =
        !normalizedQuery || task.title.toLowerCase().includes(normalizedQuery)
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesPriority =
        priorityFilter === 'all' || task.priority === priorityFilter
      const matchesAssignee =
        assigneeFilter === 'all' || task.assigneeId === assigneeFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
    })
  }, [activeTasks, assigneeFilter, priorityFilter, searchQuery, statusFilter])

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
    <div className={styles.tasksPage}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div>
            <p className={styles.eyebrow}>Tasks</p>
            <h2>Task list</h2>
            <p>
              Review API tasks by status, priority, owner, project, and due date.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.filters} aria-label="Task filters">
        <label htmlFor="task-search">
          Search tasks
          <input
            id="task-search"
            type="search"
            placeholder="Search by task title"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>

        <label htmlFor="task-status">
          Status
          <select
            id="task-status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as TaskStatus | 'all')}
          >
            <option value="all">All statuses</option>
            {Object.entries(taskStatusLabels).map(([status, label]) => (
              <option key={status} value={status}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="task-priority">
          Priority
          <select
            id="task-priority"
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value as TaskPriority | 'all')
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

        <label htmlFor="task-assignee">
          Assignee
          <select
            id="task-assignee"
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
          >
            <option value="all">All assignees</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      {isLoading ? (
        <section className={styles.emptyState} aria-live="polite">
          <h3>Loading tasks</h3>
          <p>Fetching tasks, users, and projects from the API.</p>
        </section>
      ) : null}

      {isError ? (
        <section className={styles.emptyState} aria-live="polite">
          <h3>Could not load tasks</h3>
          <p>Check that the Express server is running and try again.</p>
        </section>
      ) : null}

      {!isLoading && !isError && filteredTasks.length > 0 ? (
        <section className={styles.tableCard} aria-label="Tasks list">
          <div className={styles.tableSummary}>
            <h3>Tasks</h3>
            <span>
              {filteredTasks.length} of {activeTasks.length} shown
            </span>
          </div>

          <div className={styles.tableScroller}>
            <table className={styles.tasksTable}>
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Status</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Assignee</th>
                  <th scope="col">Project</th>
                  <th scope="col">Due date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
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
                    <td>{getAssigneeName(task, users)}</td>
                    <td>{getProjectName(task, projects)}</td>
                    <td>{formatDate(task.dueDate, 'No due date')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!isLoading && !isError && filteredTasks.length === 0 ? (
        <section className={styles.emptyState}>
          <h3>{activeTasks.length === 0 ? 'No active tasks yet' : 'No tasks found'}</h3>
          <p>
            {activeTasks.length === 0
              ? 'The API returned an empty active task list.'
              : 'Try changing the search query or clearing one of the filters.'}
          </p>
        </section>
      ) : null}

      {!isLoading && !isError ? (
        <section className={styles.boardSection} aria-label="Kanban board">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Board</p>
              <h3>Kanban board</h3>
            </div>
            <span>{activeTasks.length} active tasks</span>
          </div>

          <div className={styles.boardScroller}>
            <div className={styles.kanbanBoard}>
              {kanbanColumns.map((column) => {
                const columnTasks = activeTasks.filter(
                  (task) => task.status === column.status,
                )

                return (
                  <section key={column.status} className={styles.kanbanColumn}>
                    <header className={styles.columnHeader}>
                      <h4>{column.title}</h4>
                      <span>{columnTasks.length}</span>
                    </header>

                    <div className={styles.columnTasks}>
                      {columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          assigneeName={getAssigneeName(task, users)}
                          projectName={getProjectName(task, projects)}
                          onClick={() => setSelectedTask(task)}
                        />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>
          {/* TODO: Re-enable drag-and-drop status updates after updateTask is wired. */}
        </section>
      ) : null}

      {selectedTask ? (
        <TaskDetailsModal
          task={selectedTask}
          assigneeName={getAssigneeName(selectedTask, users)}
          projectName={getProjectName(selectedTask, projects)}
          onClose={() => setSelectedTask(null)}
        />
      ) : null}
    </div>
  )
}

export default TasksPage
