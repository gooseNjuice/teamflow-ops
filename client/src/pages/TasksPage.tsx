import { useMemo, useState } from 'react'
import TaskCard from '../components/TaskCard'
import TaskDetailsModal from '../components/TaskDetailsModal'
import { projects, tasks, users } from '../data/mockData'
import type { Task, TaskPriority, TaskStatus } from '../types'
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

function getAssigneeName(assigneeId: string) {
  return users.find((user) => user.id === assigneeId)?.name ?? 'Unassigned'
}

function getProjectName(projectId: string) {
  return projects.find((project) => project.id === projectId)?.name ?? 'Unknown project'
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function TasksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const filteredTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return tasks.filter((task) => {
      const matchesSearch =
        !normalizedQuery || task.title.toLowerCase().includes(normalizedQuery)
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesPriority =
        priorityFilter === 'all' || task.priority === priorityFilter
      const matchesAssignee =
        assigneeFilter === 'all' || task.assigneeId === assigneeFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
    })
  }, [assigneeFilter, priorityFilter, searchQuery, statusFilter])

  return (
    <div className={styles.tasksPage}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Tasks</p>
        <h2>Task workspace</h2>
        <p>
          Filter mock tasks by ownership, status, priority, and title before real task
          workflows are connected.
        </p>
      </section>

      <section className={styles.filters} aria-label="Task filters">
        <label>
          Search
          <input
            type="search"
            placeholder="Search by task title"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>

        <label>
          Status
          <select
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

        <label>
          Priority
          <select
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

        <label>
          Assignee
          <select
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
          <div className={styles.tableHeader}>
            <span>Task</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Assignee</span>
            <span>Project</span>
            <span>Due date</span>
          </div>

          <div className={styles.tableBody}>
            {filteredTasks.map((task) => (
              <button
                key={task.id}
                className={styles.taskRow}
                type="button"
                onClick={() => setSelectedTask(task)}
              >
                <strong>{task.title}</strong>
                <span className={`${styles.pill} ${styles[task.status]}`}>
                  {taskStatusLabels[task.status]}
                </span>
                <span className={`${styles.pill} ${styles[task.priority]}`}>
                  {taskPriorityLabels[task.priority]}
                </span>
                <span>{getAssigneeName(task.assigneeId)}</span>
                <span>{getProjectName(task.projectId)}</span>
                <span>{formatDate(task.dueDate)}</span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className={styles.emptyState}>
          <h3>No tasks found</h3>
          <p>Try changing the search query or clearing one of the filters.</p>
        </section>
      )}

      <section className={styles.boardSection} aria-label="Kanban board">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Board</p>
            <h3>Kanban view</h3>
          </div>
          <span>{tasks.length} total tasks</span>
        </div>

        <div className={styles.boardScroller}>
          <div className={styles.kanbanBoard}>
            {kanbanColumns.map((column) => {
              const columnTasks = tasks.filter((task) => task.status === column.status)

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
                        assigneeName={getAssigneeName(task.assigneeId)}
                        projectName={getProjectName(task.projectId)}
                        onClick={() => setSelectedTask(task)}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </section>

      {selectedTask ? (
        <TaskDetailsModal
          task={selectedTask}
          assigneeName={getAssigneeName(selectedTask.assigneeId)}
          projectName={getProjectName(selectedTask.projectId)}
          onClose={() => setSelectedTask(null)}
        />
      ) : null}
    </div>
  )
}

export default TasksPage
