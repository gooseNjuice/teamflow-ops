import styles from './ApiState.module.css'

type LoadingStateProps = {
  title?: string
  description?: string
}

function LoadingState({
  title = 'Loading',
  description = 'Fetching the latest data.',
}: LoadingStateProps) {
  return (
    <section className={styles.stateCard} aria-live="polite">
      <h3>{title}</h3>
      <p>{description}</p>
    </section>
  )
}

export default LoadingState
