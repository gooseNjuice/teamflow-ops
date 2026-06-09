import type { ReactNode } from 'react'
import styles from './ApiState.module.css'

type EmptyStateProps = {
  title: string
  description: string
  action?: ReactNode
}

function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <section className={styles.stateCard}>
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div className={styles.actions}>{action}</div> : null}
    </section>
  )
}

export default EmptyState
