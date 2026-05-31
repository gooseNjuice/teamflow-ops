import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import type { Task } from '../shared/types/task'
import styles from './TaskCard.module.css'

type TaskCardProps = Omit<ComponentPropsWithoutRef<'button'>, 'className'> & {
  task: Task
  assigneeName: string
  projectName: string
  isDragging?: boolean
}

const taskPriorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} as const

function formatDate(date: string | undefined) {
  if (!date) {
    return 'No due date'
  }

  const dateValue = date.includes('T') ? date : `${date}T00:00:00`

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateValue))
}

const TaskCard = forwardRef<HTMLButtonElement, TaskCardProps>(function TaskCard(
  { task, assigneeName, projectName, isDragging = false, ...buttonProps },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      type="button"
      {...buttonProps}
    >
      <div className={styles.cardHeader}>
        <h4>{task.title}</h4>
        <span className={`${styles.priorityPill} ${styles[task.priority]}`}>
          {taskPriorityLabels[task.priority]}
        </span>
      </div>

      <dl className={styles.metaList}>
        <div>
          <dt>Assignee</dt>
          <dd>{assigneeName}</dd>
        </div>
        <div>
          <dt>Project</dt>
          <dd>{projectName}</dd>
        </div>
        <div>
          <dt>Due</dt>
          <dd>{formatDate(task.dueDate)}</dd>
        </div>
      </dl>
    </button>
  )
})

export default TaskCard
