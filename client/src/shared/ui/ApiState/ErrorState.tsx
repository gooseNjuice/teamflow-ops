import type { ReactNode } from 'react'
import styles from './ApiState.module.css'

type ErrorStateProps = {
  error?: unknown
  title?: string
  description?: string
  action?: ReactNode
}

function getErrorStatus(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (typeof error.status === 'number' || typeof error.status === 'string')
  ) {
    return error.status
  }

  return undefined
}

function getDefaultTitle(error: unknown) {
  const status = getErrorStatus(error)

  if (status === 401) {
    return 'Session expired'
  }

  if (status === 403) {
    return 'Permission needed'
  }

  return 'Something went wrong'
}

function getDefaultDescription(error: unknown) {
  const status = getErrorStatus(error)

  if (status === 401) {
    return 'Please sign in again to continue.'
  }

  if (status === 403) {
    return 'You do not have permission to access this data or perform this action.'
  }

  return 'The server could not complete this request. Please try again.'
}

function ErrorState({ action, description, error, title }: ErrorStateProps) {
  return (
    <section
      className={`${styles.stateCard} ${styles.errorCard}`}
      aria-live="polite"
    >
      <h3>{title ?? getDefaultTitle(error)}</h3>
      <p>{description ?? getDefaultDescription(error)}</p>
      {action ? <div className={styles.actions}>{action}</div> : null}
    </section>
  )
}

export default ErrorState
