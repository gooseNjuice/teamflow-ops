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
import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import TaskCard from '../components/TaskCard'
import TaskDetailsModal from '../components/TaskDetailsModal'
import TaskForm, { type TaskFormValues } from '../components/TaskForm'
import { projects, tasks as mockTasks, users } from '../data/mockData'
import type { Project, Task, TaskPriority, TaskStatus, User } from '../types'
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
const demoTasksStorageKey = 'teamflow-ops:tasks'
const demoActivityStorageKey = 'teamflow-ops:recent-activity'

type TaskActivityItem = {
  id: string
  description: string
  taskTitle: string
  createdAt: number
}

type LocalTask = Task & {
  isArchived?: boolean
}

function getInitialTasks(): LocalTask[] {
  try {
    const storedTasks = localStorage.getItem(demoTasksStorageKey)

    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks)

      if (Array.isArray(parsedTasks)) {
        return parsedTasks
      }
    }
  } catch {
    return mockTasks.map((task) => ({ ...task }))
  }

  return mockTasks.map((task) => ({ ...task }))
}

function getInitialRecentActivity(): TaskActivityItem[] {
  try {
    const storedActivity = localStorage.getItem(demoActivityStorageKey)

    if (storedActivity) {
      const parsedActivity = JSON.parse(storedActivity)

      if (Array.isArray(parsedActivity)) {
        return parsedActivity
      }
    }
  } catch {
    return []
  }

  return []
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

function formatDate(date: string, fallback = 'No date') {
  if (!date) {
    return fallback
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function formatActivityTime(timestamp: number) {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function getDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && statusColumnIds.has(value as TaskStatus)
}

type DraggableTaskCardProps = {
  task: Task
  assigneeName: string
  projectName: string
  onClick: () => void
}

function DraggableTaskCard({
  task,
  assigneeName,
  projectName,
  onClick,
}: DraggableTaskCardProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
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
      {...listeners}
      {...attributes}
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
  const [taskItems, setTaskItems] = useState<LocalTask[]>(getInitialTasks)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] =
    useState<TaskActivityItem[]>(getInitialRecentActivity)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )
  const activeTask = activeTaskId
    ? taskItems.find((task) => task.id === activeTaskId && !task.isArchived) ?? null
    : null
  const activeTasks = useMemo(
    () => taskItems.filter((task) => !task.isArchived),
    [taskItems],
  )
  const archivedTasks = useMemo(
    () => taskItems.filter((task) => task.isArchived),
    [taskItems],
  )

  useEffect(() => {
    try {
      localStorage.setItem(demoTasksStorageKey, JSON.stringify(taskItems))
    } catch {
      // Ignore storage write failures so the demo still works in memory.
    }
  }, [taskItems])

  useEffect(() => {
    try {
      localStorage.setItem(demoActivityStorageKey, JSON.stringify(recentActivity))
    } catch {
      // Ignore storage write failures so the demo still works in memory.
    }
  }, [recentActivity])

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

  function updateTaskStatus(taskId: string, nextStatus: TaskStatus) {
    const currentTask = activeTasks.find((task) => task.id === taskId)

    if (!currentTask || currentTask.status === nextStatus) {
      return
    }

    const activityCreatedAt = Date.now()

    setTaskItems((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task,
      ),
    )
    setSelectedTask((currentTask) =>
      currentTask?.id === taskId ? { ...currentTask, status: nextStatus } : currentTask,
    )
    setRecentActivity((currentActivity) =>
      [
        {
          id: `${taskId}-${activityCreatedAt}`,
          description: `${taskStatusLabels[currentTask.status]} to ${taskStatusLabels[nextStatus]}`,
          taskTitle: currentTask.title,
          createdAt: activityCreatedAt,
        },
        ...currentActivity,
      ].slice(0, 5),
    )
  }

  function handleCreateTask(values: TaskFormValues) {
    const currentDate = getDateInputValue(new Date())
    const newTask: LocalTask = {
      id: `task-${Date.now()}`,
      title: values.title,
      description: values.description,
      projectId: values.projectId,
      assigneeId: values.assigneeId,
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate,
      createdAt: currentDate,
      updatedAt: currentDate,
    }

    setTaskItems((currentTasks) => [newTask, ...currentTasks])
    setIsCreateTaskOpen(false)
  }

  function handleEditTask(values: TaskFormValues) {
    if (!editingTask) {
      return
    }

    const updatedTask: Task = {
      ...editingTask,
      title: values.title,
      description: values.description,
      projectId: values.projectId,
      assigneeId: values.assigneeId,
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate,
      updatedAt: getDateInputValue(new Date()),
    }

    setTaskItems((currentTasks) =>
      currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    )
    setSelectedTask((currentTask) =>
      currentTask?.id === updatedTask.id ? updatedTask : currentTask,
    )
    setEditingTask(null)
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

  function handleArchiveTask(task: Task) {
    const updatedAt = getDateInputValue(new Date())

    setTaskItems((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? { ...currentTask, isArchived: true, updatedAt }
          : currentTask,
      ),
    )
    setSelectedTask(null)
    setEditingTask(null)
    addRecentActivity(task, 'Archived')
  }

  function handleRestoreTask(task: Task) {
    const updatedAt = getDateInputValue(new Date())

    setTaskItems((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? { ...currentTask, isArchived: false, updatedAt }
          : currentTask,
      ),
    )
    addRecentActivity(task, 'Restored')
  }

  function handleResetDemoData() {
    setTaskItems(mockTasks.map((task) => ({ ...task })))
    setRecentActivity([])
    setSelectedTask(null)
    setEditingTask(null)
    setIsCreateTaskOpen(false)
    setActiveTaskId(null)
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id)
    const nextStatus = event.over?.data.current?.status

    if (isTaskStatus(nextStatus)) {
      updateTaskStatus(taskId, nextStatus)
    }

    setActiveTaskId(null)
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
    <div className={styles.tasksPage}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div>
            <p className={styles.eyebrow}>Tasks</p>
            <h2>Task list</h2>
            <p>
              Review current mock tasks by status, priority, owner, project, and due
              date.
            </p>
          </div>
          <div className={styles.heroActions}>
            <button
              className={styles.secondaryActionButton}
              type="button"
              onClick={handleResetDemoData}
            >
              Reset demo data
            </button>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => setIsCreateTaskOpen(true)}
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

      {filteredTasks.length > 0 ? (
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
      ) : (
        <section className={styles.emptyState}>
          <h3>No tasks found</h3>
          <p>Try changing the search query or clearing one of the filters.</p>
        </section>
      )}

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
            <span>{activeTasks.length} active tasks</span>
          </div>

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
                      <span>
                        {activity.description}
                      </span>
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

      <section className={styles.archivedSection} aria-labelledby="archived-tasks-title">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Archive</p>
            <h3 id="archived-tasks-title">Archived tasks</h3>
          </div>
          <span>{archivedTasks.length} archived</span>
        </div>

        {archivedTasks.length > 0 ? (
          <ul className={styles.archivedList}>
            {archivedTasks.map((task) => (
              <li key={task.id} className={styles.archivedItem}>
                <div>
                  <strong>{task.title}</strong>
                  <span>
                    {getProjectName(task, projects)} - {getAssigneeName(task, users)}
                  </span>
                </div>
                <button type="button" onClick={() => handleRestoreTask(task)}>
                  Restore
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.archivedEmpty}>No archived tasks yet.</p>
        )}
      </section>

      {selectedTask && !editingTask ? (
        <TaskDetailsModal
          task={selectedTask}
          assigneeName={getAssigneeName(selectedTask, users)}
          projectName={getProjectName(selectedTask, projects)}
          onClose={() => setSelectedTask(null)}
          onArchive={() => handleArchiveTask(selectedTask)}
          onEdit={() => setEditingTask(selectedTask)}
        />
      ) : null}

      {isCreateTaskOpen ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={() => setIsCreateTaskOpen(false)}
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
                onClick={() => setIsCreateTaskOpen(false)}
              >
                Close
              </button>
            </header>
            <TaskForm
              assignees={users}
              projects={projects}
              submitLabel="Create task"
              onSubmit={handleCreateTask}
            />
          </section>
        </div>
      ) : null}

      {editingTask ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={() => setEditingTask(null)}
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
                onClick={() => setEditingTask(null)}
              >
                Close
              </button>
            </header>
            <TaskForm
              key={editingTask.id}
              assignees={users}
              projects={projects}
              initialTask={editingTask}
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
