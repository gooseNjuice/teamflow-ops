import { useEffect } from 'react'
import type { Task, TaskPriority, TaskStatus } from '../types'
import styles from './TaskDetailsModal.module.css'

type TaskDetailsModalProps = {
  task: Task
  assigneeName: string
  projectName: string
  onClose: () => void
  onArchive: () => void
  onEdit: () => void
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

function TaskDetailsModal({
  task,
  assigneeName,
  projectName,
  onClose,
  onArchive,
  onEdit,
}: TaskDetailsModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="task-details-title"
        aria-modal="true"
        className={styles.modal}
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Task details</p>
            <h2 id="task-details-title">{task.title}</h2>
          </div>
          <div className={styles.actions}>
            <button className={styles.editButton} type="button" onClick={onEdit}>
              Edit
            </button>
            <button className={styles.archiveButton} type="button" onClick={onArchive}>
              Archive
            </button>
            <button className={styles.closeButton} type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </header>

        <p className={styles.description}>{task.description}</p>

        <dl className={styles.detailsGrid}>
          <div>
            <dt>Status</dt>
            <dd>
              <span className={`${styles.pill} ${styles[task.status]}`}>
                {taskStatusLabels[task.status]}
              </span>
            </dd>
          </div>
          <div>
            <dt>Priority</dt>
            <dd>
              <span className={`${styles.pill} ${styles[task.priority]}`}>
                {taskPriorityLabels[task.priority]}
              </span>
            </dd>
          </div>
          <div>
            <dt>Assignee</dt>
            <dd>{assigneeName}</dd>
          </div>
          <div>
            <dt>Project</dt>
            <dd>{projectName}</dd>
          </div>
          <div>
            <dt>Due date</dt>
            <dd>{formatDate(task.dueDate, 'No due date')}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatDate(task.createdAt)}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{formatDate(task.updatedAt)}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}

export default TaskDetailsModal
