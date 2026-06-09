import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import TaskCard from '../components/TaskCard'
import TaskDetailsModal from '../components/TaskDetailsModal'
import TaskForm, { type TaskFormValues } from '../components/TaskForm'
import { useGetCurrentUserQuery } from '../shared/api/authApi'
import { useGetProjectsQuery } from '../shared/api/projectsApi'
import {
  useArchiveTaskMutation,
  useCreateTaskMutation,
  useGetTasksQuery,
  useRestoreTaskMutation,
  useUpdateTaskMutation,
} from '../shared/api/tasksApi'
import { useGetUsersQuery } from '../shared/api/usersApi'
import {
  canArchiveTask,
  canCreateTask,
  canEditTask,
  canRestoreTask,
} from '../shared/lib/permissions'
import { getPermissionAwareErrorMessage } from '../shared/lib/apiErrors'
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

const statusColumnIds = new Set<TaskStatus>(
  kanbanColumns.map((column) => column.status),
)

type TaskActivityItem = {
  id: string
  description: string
  taskTitle: string
  createdAt: number
}

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

function formatActivityTime(timestamp: number) {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && statusColumnIds.has(value as TaskStatus)
}

type DraggableTaskCardProps = {
  task: Task
  assigneeName: string
  projectName: string
  isDragDisabled?: boolean
  onClick: () => void
}

function DraggableTaskCard({
  task,
  assigneeName,
  projectName,
  isDragDisabled = false,
  onClick,
}: DraggableTaskCardProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    disabled: isDragDisabled,
    data: {
      taskId: task.id,
      status: task.status,
    },
  })
  const dragStyle = transform
    ? {
        transform: `translate3d(${Math.round(transform.x)}px, ${Math.round(
          transform.y,
        )}px, 0)`,
      }
    : undefined

  return (
    <TaskCard
      ref={setNodeRef}
      style={dragStyle}
      task={task}
      assigneeName={assigneeName}
      projectName={projectName}
      isDragging={isDragging}
      onClick={onClick}
      {...(isDragDisabled ? {} : listeners)}
      {...(isDragDisabled ? {} : attributes)}
    />
  )
}

type KanbanColumnProps = {
  children: ReactNode
  status: TaskStatus
}

function KanbanColumn({ children, status }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
    data: {
      status,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={`${styles.columnTasks} ${isOver ? styles.columnTasksOver : ''}`}
    >
      {children}
    </div>
  )
}

function TasksPage() {
  const {
    data: currentUser,
    isError: isCurrentUserError,
    isLoading: isCurrentUserLoading,
  } = useGetCurrentUserQuery()
  const {
    data: tasks = [],
    isError: isTasksError,
    isLoading: isTasksLoading,
  } = useGetTasksQuery()
  const {
    data: archivedTasks = [],
    isError: isArchivedTasksError,
    isLoading: isArchivedTasksLoading,
  } = useGetTasksQuery({ archived: true })
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
  const [archiveTask, { isLoading: isArchivingTask }] = useArchiveTaskMutation()
  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation()
  const [restoreTask, { isLoading: isRestoringTask }] = useRestoreTaskMutation()
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [createTaskError, setCreateTaskError] = useState<string | null>(null)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [editTaskError, setEditTaskError] = useState<string | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] = useState<TaskActivityItem[]>([])
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null)
  const [archiveTaskError, setArchiveTaskError] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )
  const currentRole = currentUser?.role
  const userCanCreateTask = canCreateTask(currentRole)
  const userCanEditTask = canEditTask(currentRole)
  const userCanArchiveTask = canArchiveTask(currentRole)
  const userCanRestoreTask = canRestoreTask(currentRole)
  const readOnlyTaskMessage = 'Your role can view tasks, but cannot change them.'
  const activeTask = activeTaskId
    ? tasks.find((task) => task.id === activeTaskId && !task.archived) ?? null
    : null
  const selectedTaskDetails = selectedTask
    ? tasks.find((task) => task.id === selectedTask.id) ?? selectedTask
    : null
  const activeTasks = useMemo(() => tasks.filter((task) => !task.archived), [tasks])
  const isLoading =
    isCurrentUserLoading ||
    isTasksLoading ||
    isArchivedTasksLoading ||
    isUsersLoading ||
    isProjectsLoading
  const isError =
    isCurrentUserError ||
    isTasksError ||
    isArchivedTasksError ||
    isUsersError ||
    isProjectsError

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

  async function handleCreateTask(values: TaskFormValues) {
    if (!userCanCreateTask) {
      setCreateTaskError(readOnlyTaskMessage)
      return
    }

    setCreateTaskError(null)

    try {
      await createTask({
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        assigneeId: values.assigneeId,
        projectId: values.projectId,
        dueDate: values.dueDate || undefined,
      }).unwrap()
      setIsCreateTaskOpen(false)
    } catch (error) {
      setCreateTaskError(
        getPermissionAwareErrorMessage(
          error,
          'Could not create task. Please try again.',
        ),
      )
    }
  }

  async function handleEditTask(values: TaskFormValues) {
    if (!selectedTaskDetails || !userCanEditTask) {
      setEditTaskError(readOnlyTaskMessage)
      return
    }

    setEditTaskError(null)

    try {
      const updatedTask = await updateTask({
        id: selectedTaskDetails.id,
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        assigneeId: values.assigneeId,
        projectId: values.projectId,
        dueDate: values.dueDate || undefined,
      }).unwrap()

      setSelectedTask(updatedTask)
      setIsEditTaskOpen(false)
    } catch (error) {
      setEditTaskError(
        getPermissionAwareErrorMessage(
          error,
          'Could not update task. Please try again.',
        ),
      )
    }
  }

  function addRecentActivity(task: Task, description: string) {
    const activityCreatedAt = Date.now()

    setRecentActivity((currentActivity) =>
      [
        {
          id: `${task.id}-${activityCreatedAt}`,
          description,
          taskTitle: task.title,
          createdAt: activityCreatedAt,
        },
        ...currentActivity,
      ].slice(0, 5),
    )
  }

  async function handleArchiveTask(task: Task) {
    if (!userCanArchiveTask) {
      setArchiveTaskError(readOnlyTaskMessage)
      return
    }

    setArchiveTaskError(null)

    try {
      await archiveTask(task.id).unwrap()
      addRecentActivity(task, 'Archived task')
      setSelectedTask(null)
      setIsEditTaskOpen(false)
    } catch (error) {
      setArchiveTaskError(
        getPermissionAwareErrorMessage(
          error,
          'Could not archive task. Please try again.',
        ),
      )
    }
  }

  async function handleRestoreTask(task: Task) {
    if (!userCanRestoreTask) {
      setArchiveTaskError(readOnlyTaskMessage)
      return
    }

    setArchiveTaskError(null)

    try {
      await restoreTask(task.id).unwrap()
      addRecentActivity(task, 'Restored task')
    } catch (error) {
      setArchiveTaskError(
        getPermissionAwareErrorMessage(
          error,
          'Could not restore task. Please try again.',
        ),
      )
    }
  }

  function handleDragStart(event: DragStartEvent) {
    if (!userCanEditTask) {
      setStatusUpdateError(readOnlyTaskMessage)
      return
    }

    setStatusUpdateError(null)
    setActiveTaskId(String(event.active.id))
  }

  async function handleDragEnd(event: DragEndEvent) {
    if (!userCanEditTask) {
      setActiveTaskId(null)
      setStatusUpdateError(readOnlyTaskMessage)
      return
    }

    const taskId = String(event.active.id)
    const nextStatus = event.over?.data.current?.status
    const currentTask = activeTasks.find((task) => task.id === taskId)

    setActiveTaskId(null)

    if (!currentTask || !isTaskStatus(nextStatus) || currentTask.status === nextStatus) {
      return
    }

    try {
      await updateTask({ id: taskId, status: nextStatus }).unwrap()
      addRecentActivity(
        currentTask,
        `${taskStatusLabels[currentTask.status]} to ${taskStatusLabels[nextStatus]}`,
      )
    } catch (error) {
      setStatusUpdateError(
        getPermissionAwareErrorMessage(
          error,
          'Could not update task status. Please try again.',
        ),
      )
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
          <div className={styles.heroActions}>
            <button
              className={styles.primaryButton}
              type="button"
              disabled={!userCanCreateTask}
              title={!userCanCreateTask ? readOnlyTaskMessage : undefined}
              onClick={() => {
                if (!userCanCreateTask) {
                  return
                }

                setCreateTaskError(null)
                setIsCreateTaskOpen(true)
              }}
            >
              New Task
            </button>
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
          <p>
            Fetching your user, active tasks, archived tasks, users, and projects
            from the API.
          </p>
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
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragCancel={() => setActiveTaskId(null)}
          onDragEnd={handleDragEnd}
        >
          <section className={styles.boardSection} aria-label="Kanban board">
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>Board</p>
                <h3>Kanban board</h3>
              </div>
              <span>
                {isUpdatingTask ? 'Updating status...' : `${activeTasks.length} active tasks`}
              </span>
            </div>

            {!userCanEditTask ? (
              <p className={styles.helperText}>{readOnlyTaskMessage}</p>
            ) : null}

            {statusUpdateError ? (
              <section className={styles.activityPanel} aria-live="polite">
                <div className={styles.activityHeader}>
                  <h4>Status update failed</h4>
                </div>
                <p className={styles.feedbackText}>{statusUpdateError}</p>
              </section>
            ) : null}

            {archiveTaskError ? (
              <section className={styles.activityPanel} aria-live="polite">
                <div className={styles.activityHeader}>
                  <h4>Archive update failed</h4>
                </div>
                <p className={styles.feedbackText}>{archiveTaskError}</p>
              </section>
            ) : null}

            {recentActivity.length > 0 ? (
              <section className={styles.activityPanel} aria-label="Recent task activity">
                <div className={styles.activityHeader}>
                  <h4>Recent activity</h4>
                  <span>Latest {recentActivity.length}</span>
                </div>
                <ul className={styles.activityList}>
                  {recentActivity.map((activity) => (
                    <li key={activity.id} className={styles.activityItem}>
                      <div>
                        <strong>{activity.taskTitle}</strong>
                        <span>{activity.description}</span>
                      </div>
                      <time dateTime={new Date(activity.createdAt).toISOString()}>
                        {formatActivityTime(activity.createdAt)}
                      </time>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

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

                      <KanbanColumn status={column.status}>
                        {columnTasks.map((task) => (
                          <DraggableTaskCard
                            key={task.id}
                            task={task}
                            assigneeName={getAssigneeName(task, users)}
                            projectName={getProjectName(task, projects)}
                            isDragDisabled={!userCanEditTask}
                            onClick={() => setSelectedTask(task)}
                          />
                        ))}
                      </KanbanColumn>
                    </section>
                  )
                })}
              </div>
            </div>
          </section>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                assigneeName={getAssigneeName(activeTask, users)}
                projectName={getProjectName(activeTask, projects)}
                onClick={() => undefined}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : null}

      {!isLoading && !isError ? (
        <section className={styles.archivedSection} aria-label="Archived tasks">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Archive</p>
              <h3>Archived tasks</h3>
            </div>
            <span>
              {isArchivingTask || isRestoringTask
                ? 'Updating archive...'
                : `${archivedTasks.length} archived`}
            </span>
          </div>

          {archivedTasks.length > 0 ? (
            <ul className={styles.archivedList}>
              {archivedTasks.map((task) => (
                <li key={task.id} className={styles.archivedItem}>
                  <div>
                    <strong>{task.title}</strong>
                    <span>
                      {getAssigneeName(task, users)} - {getProjectName(task, projects)}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={
                      isArchivingTask || isRestoringTask || !userCanRestoreTask
                    }
                    title={!userCanRestoreTask ? readOnlyTaskMessage : undefined}
                    onClick={() => handleRestoreTask(task)}
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.archivedEmpty}>No archived tasks yet.</p>
          )}
        </section>
      ) : null}

      {selectedTaskDetails && !isEditTaskOpen ? (
        <TaskDetailsModal
          task={selectedTaskDetails}
          assigneeName={getAssigneeName(selectedTaskDetails, users)}
          projectName={getProjectName(selectedTaskDetails, projects)}
          onClose={() => setSelectedTask(null)}
          onArchive={
            userCanArchiveTask
              ? () => handleArchiveTask(selectedTaskDetails)
              : undefined
          }
          onEdit={
            userCanEditTask
              ? () => {
                  setEditTaskError(null)
                  setIsEditTaskOpen(true)
                }
              : undefined
          }
        />
      ) : null}

      {isCreateTaskOpen ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={() => {
            if (!isCreatingTask) {
              setIsCreateTaskOpen(false)
            }
          }}
        >
          <section
            aria-labelledby="create-task-title"
            aria-modal="true"
            className={styles.createTaskModal}
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>New task</p>
                <h2 id="create-task-title">Create task</h2>
              </div>
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={isCreatingTask}
                onClick={() => setIsCreateTaskOpen(false)}
              >
                Close
              </button>
            </header>

            {createTaskError ? (
              <section className={styles.activityPanel} aria-live="polite">
                <div className={styles.activityHeader}>
                  <h4>Creation failed</h4>
                </div>
                <p className={styles.feedbackText}>{createTaskError}</p>
              </section>
            ) : null}

            <TaskForm
              assignees={users}
              projects={projects}
              isSubmitting={isCreatingTask}
              submitLabel="Create task"
              onSubmit={handleCreateTask}
            />
          </section>
        </div>
      ) : null}

      {selectedTaskDetails && isEditTaskOpen ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={() => {
            if (!isUpdatingTask) {
              setIsEditTaskOpen(false)
            }
          }}
        >
          <section
            aria-labelledby="edit-task-title"
            aria-modal="true"
            className={styles.createTaskModal}
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Edit task</p>
                <h2 id="edit-task-title">Update task</h2>
              </div>
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={isUpdatingTask}
                onClick={() => setIsEditTaskOpen(false)}
              >
                Close
              </button>
            </header>

            {editTaskError ? (
              <section className={styles.activityPanel} aria-live="polite">
                <div className={styles.activityHeader}>
                  <h4>Update failed</h4>
                </div>
                <p className={styles.feedbackText}>{editTaskError}</p>
              </section>
            ) : null}

            <TaskForm
              key={selectedTaskDetails.id}
              assignees={users}
              projects={projects}
              initialTask={selectedTaskDetails}
              isSubmitting={isUpdatingTask}
              submitLabel="Save task"
              onSubmit={handleEditTask}
            />
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default TasksPage
