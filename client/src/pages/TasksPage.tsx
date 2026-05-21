import { useMemo, useState } from 'react'
import { projects, tasks, users } from '../data/mockData'
import type { TaskPriority, TaskStatus } from '../types'
import styles from './TasksPage.module.css'

const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

const taskPriorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

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
              <article key={task.id} className={styles.taskRow}>
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
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className={styles.emptyState}>
          <h3>No tasks found</h3>
          <p>Try changing the search query or clearing one of the filters.</p>
        </section>
      )}
    </div>
  )
}

export default TasksPage

