import { useEffect, useState, type FormEvent } from 'react'
import { useGetTaskActivityQuery } from '../shared/api/activityApi'
import {
  useCreateTaskCommentMutation,
  useGetTaskCommentsQuery,
} from '../shared/api/commentsApi'
import { getPermissionAwareErrorMessage } from '../shared/lib/apiErrors'
import { canCommentOnTask } from '../shared/lib/permissions'
import type { TaskActivityType } from '../shared/types/activity'
import type { Task, TaskPriority, TaskStatus } from '../shared/types/task'
import type { User, UserRole } from '../shared/types/user'
import styles from './TaskDetailsModal.module.css'

type TaskDetailsModalProps = {
  task: Task
  assigneeName: string
  projectName: string
  users?: User[]
  currentUserRole?: UserRole
  onClose: () => void
  onArchive?: () => void
  onEdit?: () => void
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

const taskActivityTypeLabels: Record<TaskActivityType, string> = {
  task_created: 'Created',
  task_updated: 'Updated',
  status_changed: 'Status changed',
  task_archived: 'Archived',
  task_restored: 'Restored',
  comment_created: 'Commented',
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

function TaskDetailsModal({
  task,
  assigneeName,
  currentUserRole,
  projectName,
  users = [],
  onClose,
  onArchive,
  onEdit,
}: TaskDetailsModalProps) {
  const [commentBody, setCommentBody] = useState('')
  const [commentError, setCommentError] = useState<string | null>(null)
  const {
    data: comments = [],
    error: commentsError,
    isError: isCommentsError,
    isLoading: isCommentsLoading,
  } = useGetTaskCommentsQuery(task.id)
  const {
    data: activity = [],
    error: activityError,
    isError: isActivityError,
    isLoading: isActivityLoading,
  } = useGetTaskActivityQuery(task.id)
  const [createTaskComment, { isLoading: isCreatingComment }] =
    useCreateTaskCommentMutation()
  const userCanComment = canCommentOnTask(currentUserRole)
  const trimmedCommentBody = commentBody.trim()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    setCommentBody('')
    setCommentError(null)
  }, [task.id])

  function getUserName(userId: string, fallback: string) {
    return users.find((user) => user.id === userId)?.name ?? fallback
  }

  async function handleCreateComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!userCanComment || !trimmedCommentBody) {
      return
    }

    setCommentError(null)

    try {
      await createTaskComment({
        taskId: task.id,
        body: trimmedCommentBody,
      }).unwrap()
      setCommentBody('')
    } catch (error) {
      setCommentError(
        getPermissionAwareErrorMessage(
          error,
          'Could not add comment. Please try again.',
        ),
      )
    }
  }

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
            {onEdit ? (
              <button className={styles.editButton} type="button" onClick={onEdit}>
                Edit
              </button>
            ) : null}
            {onArchive ? (
              <button className={styles.archiveButton} type="button" onClick={onArchive}>
                Archive
              </button>
            ) : null}
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

        <section className={styles.commentsSection} aria-labelledby="task-comments-title">
          <div className={styles.commentsHeader}>
            <div>
              <p className={styles.eyebrow}>Comments</p>
              <h3 id="task-comments-title">Task discussion</h3>
            </div>
            <span>{comments.length} comments</span>
          </div>

          {isCommentsLoading ? (
            <p className={styles.commentsState}>Loading comments...</p>
          ) : null}

          {isCommentsError ? (
            <p className={styles.commentsError} role="alert">
              {getPermissionAwareErrorMessage(
                commentsError,
                'Could not load comments. Please try again.',
              )}
            </p>
          ) : null}

          {!isCommentsLoading && !isCommentsError && comments.length === 0 ? (
            <p className={styles.commentsState}>No comments yet.</p>
          ) : null}

          {!isCommentsLoading && !isCommentsError && comments.length > 0 ? (
            <ul className={styles.commentsList}>
              {comments.map((comment) => (
                <li key={comment.id} className={styles.commentItem}>
                  <p>{comment.body}</p>
                  <div>
                    <span>{getUserName(comment.authorId, 'Unknown author')}</span>
                    <time dateTime={comment.createdAt}>
                      {formatDate(comment.createdAt)}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {userCanComment ? (
            <form className={styles.commentForm} onSubmit={handleCreateComment}>
              <label htmlFor={`comment-${task.id}`}>
                Add a comment
                <textarea
                  id={`comment-${task.id}`}
                  rows={3}
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder="Write a short update or note"
                />
              </label>

              {commentError ? (
                <p className={styles.commentsError} role="alert">
                  {commentError}
                </p>
              ) : null}

              <button
                className={styles.commentSubmitButton}
                type="submit"
                disabled={isCreatingComment || !trimmedCommentBody}
              >
                {isCreatingComment ? 'Adding...' : 'Add comment'}
              </button>
            </form>
          ) : (
            <p className={styles.commentsState}>
              Your role can read comments, but cannot add them.
            </p>
          )}
        </section>

        <section className={styles.activitySection} aria-labelledby="task-activity-title">
          <div className={styles.activityHeader}>
            <div>
              <p className={styles.eyebrow}>Activity</p>
              <h3 id="task-activity-title">Task activity log</h3>
            </div>
            <span>{activity.length} events</span>
          </div>

          {isActivityLoading ? (
            <p className={styles.activityState}>Loading activity...</p>
          ) : null}

          {isActivityError ? (
            <p className={styles.activityError} role="alert">
              {getPermissionAwareErrorMessage(
                activityError,
                'Could not load activity. Please try again.',
              )}
            </p>
          ) : null}

          {!isActivityLoading && !isActivityError && activity.length === 0 ? (
            <p className={styles.activityState}>No activity recorded yet.</p>
          ) : null}

          {!isActivityLoading && !isActivityError && activity.length > 0 ? (
            <ol className={styles.activityList}>
              {activity.map((item) => (
                <li key={item.id} className={styles.activityItem}>
                  <div className={styles.activityMeta}>
                    <span className={styles.activityType}>
                      {taskActivityTypeLabels[item.type]}
                    </span>
                    <span>{getUserName(item.actorId, 'Unknown actor')}</span>
                    <time dateTime={item.createdAt}>
                      {formatDate(item.createdAt)}
                    </time>
                  </div>
                  <p>{item.message}</p>
                </li>
              ))}
            </ol>
          ) : null}
        </section>
      </section>
    </div>
  )
}

export default TaskDetailsModal
