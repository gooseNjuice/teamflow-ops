import { useEffect } from 'react'
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import { useAppDispatch } from './app/hooks'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import PlaceholderPage from './pages/PlaceholderPage'
import ProjectDetailsPage from './pages/ProjectDetailsPage'
import ProjectsPage from './pages/ProjectsPage'
import RegisterPage from './pages/RegisterPage'
import TeamPage from './pages/TeamPage'
import TasksPage from './pages/TasksPage'
import { baseApi } from './shared/api/baseApi'
import { useGetCurrentUserQuery } from './shared/api/authApi'
import { clearToken } from './shared/lib/authToken'
import { useAuthToken } from './shared/lib/useAuthToken'
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
  if (pathname.startsWith('/projects/')) {
    return 'Project Details'
  }

  return (
    standalonePageTitles[pathname] ??
    navigationItems.find((item) => item.path === pathname)?.label ??
    'Dashboard'
  )
}

function isUnauthorizedError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 401
  )
}

function App() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const token = useAuthToken()
  const {
    data: currentUser,
    error: currentUserError,
    isFetching: isCheckingUser,
  } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  })

  useEffect(() => {
    if (isUnauthorizedError(currentUserError)) {
      clearToken()
      dispatch(baseApi.util.resetApiState())
      navigate('/login', { replace: true })
    }
  }, [currentUserError, dispatch, navigate])

  function handleLogout() {
    clearToken()
    dispatch(baseApi.util.resetApiState())
    navigate('/login', { replace: true })
  }

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
          <div className={styles.userControls}>
            {currentUser ? (
              <div className={styles.userSummary}>
                <span>{currentUser.name}</span>
                <span>{currentUser.role}</span>
              </div>
            ) : token && isCheckingUser ? (
              <span className={styles.userBadge}>Checking session</span>
            ) : null}

            {token ? (
              <button
                className={styles.logoutButton}
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            ) : null}
          </div>
        </header>

        <main className={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              }
            />
            <Route
              path="/projects"
              element={
                <RequireAuth>
                  <ProjectsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <RequireAuth>
                  <ProjectDetailsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/tasks"
              element={
                <RequireAuth>
                  <TasksPage />
                </RequireAuth>
              }
            />
            <Route
              path="/team"
              element={
                <RequireAuth>
                  <TeamPage />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {placeholderPages.map((page) => (
              <Route
                key={page.path}
                path={page.path}
                element={
                  <RequireAuth>
                    <PlaceholderPage
                      eyebrow={page.eyebrow}
                      title={page.title}
                      description={page.description}
                    />
                  </RequireAuth>
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
