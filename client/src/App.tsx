import styles from './App.module.css'

const navigationItems = ['Dashboard', 'Projects', 'Tasks', 'Team', 'Settings']

function App() {
  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>TeamFlow Ops</div>

        <nav aria-label="Primary navigation">
          <ul className={styles.navigationList}>
            {navigationItems.map((item) => (
              <li key={item}>
                <a className={styles.navigationLink} href="#">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topBar}>
          <h1>Dashboard</h1>
          <span className={styles.userBadge}>TeamFlow Admin</span>
        </header>

        <main className={styles.mainContent}>
          <section className={styles.welcomeCard}>
            <p className={styles.eyebrow}>Overview</p>
            <h2>Welcome to TeamFlow Ops</h2>
            <p>
              Your project workspace is ready. Future iterations can add real
              dashboards, project data, and task workflows here.
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App

