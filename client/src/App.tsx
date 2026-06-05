import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import PlaceholderPage from './pages/PlaceholderPage'
import ProjectsPage from './pages/ProjectsPage'
import RegisterPage from './pages/RegisterPage'
import TasksPage from './pages/TasksPage'
import styles from './App.module.css'

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Projects', path: '/projects' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Team', path: '/team' },
  { label: 'Settings', path: '/settings' },
]

const placeholderPages = [
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

const standalonePageTitles: Record<string, string> = {
  '/login': 'Login',
  '/register': 'Register',
}

function getPageTitle(pathname: string) {
  return (
    standalonePageTitles[pathname] ??
    navigationItems.find((item) => item.path === pathname)?.label ??
    'Dashboard'
  )
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {placeholderPages.map((page) => (
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
