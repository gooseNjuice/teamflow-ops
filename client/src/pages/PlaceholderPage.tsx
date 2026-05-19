import styles from './PlaceholderPage.module.css'

type PlaceholderPageProps = {
  eyebrow: string
  title: string
  description: string
}

function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  )
}

export default PlaceholderPage

