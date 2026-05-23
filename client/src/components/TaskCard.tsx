import type { Task } from '../types'
import styles from './TaskCard.module.css'

type TaskCardProps = {
  task: Task
  assigneeName: string
  projectName: string
  onClick: () => void
}

const taskPriorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} as const

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function TaskCard({ task, assigneeName, projectName, onClick }: TaskCardProps) {
  return (
    <button className={styles.card} type="button" onClick={onClick}>
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
}

export default TaskCard
