import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import PlaceholderPage from './pages/PlaceholderPage'
import styles from './App.module.css'

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Projects', path: '/projects' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Team', path: '/team' },
  { label: 'Settings', path: '/settings' },
]

const pages = [
  {
    path: '/dashboard',
    eyebrow: 'Overview',
    title: 'Dashboard',
    description:
      'Track team activity, project health, and operational priorities from one place.',
  },
  {
    path: '/projects',
    eyebrow: 'Projects',
    title: 'Projects',
    description: 'Project lists and planning views will live here in a future iteration.',
  },
  {
    path: '/tasks',
    eyebrow: 'Tasks',
    title: 'Tasks',
    description: 'Task boards, assignments, and progress tracking will live here.',
  },
  {
    path: '/team',
    eyebrow: 'Team',
    title: 'Team',
    description: 'Team member profiles, roles, and availability will live here.',
  },
  {
    path: '/settings',
    eyebrow: 'Settings',
    title: 'Settings',
    description: 'Workspace preferences and configuration options will live here.',
  },
]

function getPageTitle(pathname: string) {
  return pages.find((page) => page.path === pathname)?.title ?? 'Dashboard'
}

function App() {
  const location = useLocation()

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>TeamFlow Ops</div>

        <nav aria-label="Primary navigation">
          <ul className={styles.navigationList}>
            {navigationItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.navigationLink} ${styles.activeNavigationLink}`
                      : styles.navigationLink
                  }
                  to={item.path}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topBar}>
          <h1>{getPageTitle(location.pathname)}</h1>
          <span className={styles.userBadge}>TeamFlow Admin</span>
        </header>

        <main className={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {pages.map((page) => (
              <Route
                key={page.path}
                path={page.path}
                element={
                  <PlaceholderPage
                    eyebrow={page.eyebrow}
                    title={page.title}
                    description={page.description}
                  />
                }
              />
            ))}
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
