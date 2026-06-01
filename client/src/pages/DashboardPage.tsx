import { useMemo } from 'react'
import { getDashboardMetrics } from '../features/dashboard/utils/dashboardMetrics'
import { useGetProjectsQuery } from '../shared/api/projectsApi'
import { useGetTasksQuery } from '../shared/api/tasksApi'
import { useGetUsersQuery } from '../shared/api/usersApi'
import type { Project } from '../shared/types/project'
import type { Task, TaskStatus } from '../shared/types/task'
import type { User } from '../shared/types/user'
import styles from './DashboardPage.module.css'

const taskStatusLabels: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To do',
  'in-progress': 'In progress',
  'in-review': 'In review',
  done: 'Done',
}

function getProjectName(projectId: string, projects: Project[]) {
  return projects.find((project) => project.id === projectId)?.name ?? 'Unknown project'
}

function getAssigneeName(assigneeId: string, users: User[]) {
  return users.find((user) => user.id === assigneeId)?.name ?? 'Unassigned'
}

function formatDate(date: string | undefined, fallback = 'No due date') {
  if (!date) {
    return fallback
  }

  const dateValue = date.includes('T') ? date : `${date}T00:00:00`

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateValue))
}

function StatCard({
  label,
  value,
  helperText,
}: {
  label: string
  value: number
  helperText: string
}) {
  return (
    <article className={styles.statCard}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{helperText}</span>
    </article>
  )
}

function TaskSummaryItem({
  task,
  users,
  projects,
}: {
  task: Task
  users: User[]
  projects: Project[]
}) {
  return (
    <li className={styles.taskItem}>
      <div>
        <strong>{task.title}</strong>
        <p>
          {getProjectName(task.projectId, projects)} - {getAssigneeName(task.assigneeId, users)}
        </p>
      </div>
      <div className={styles.taskMeta}>
        <span className={`${styles.statusPill} ${styles[task.status]}`}>
          {taskStatusLabels[task.status]}
        </span>
        <span>Due {formatDate(task.dueDate)}</span>
      </div>
    </li>
  )
}

function DashboardPage() {
  const {
    data: tasks = [],
    isError: isTasksError,
    isLoading: isTasksLoading,
  } = useGetTasksQuery()
  const {
    data: users = [],
    isError: isUsersError,
    isLoading: isUsersLoading,
  } = useGetUsersQuery()
  const {
    data: projects = [],
    isError: isProjectsError,
    isLoading: isProjectsLoading,
  } = useGetProjectsQuery()

  const metrics = useMemo(
    () => getDashboardMetrics({ tasks, users, projects, recentLimit: 4 }),
    [projects, tasks, users],
  )
  const isLoading = isTasksLoading || isUsersLoading || isProjectsLoading
  const isError = isTasksError || isUsersError || isProjectsError
  const isEmpty = tasks.length === 0 && projects.length === 0
  const statusBreakdown = Object.entries(metrics.tasksByStatus).map(([status, count]) => ({
    status: status as TaskStatus,
    label: taskStatusLabels[status as TaskStatus],
    count,
  }))

  return (
    <div className={styles.dashboard}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Overview</p>
        <h2>Team operations at a glance</h2>
        <p>
          Monitor active work, spot overdue tasks, and keep delivery momentum visible
          from the workspace API.
        </p>
      </section>

      {isLoading ? (
        <section className={styles.stateCard} aria-live="polite">
          <h3>Loading dashboard</h3>
          <p>Fetching tasks, users, and projects from the API.</p>
        </section>
      ) : null}

      {isError ? (
        <section className={styles.stateCard} aria-live="polite">
          <h3>Could not load dashboard</h3>
          <p>Check that the Express server is running and try again.</p>
        </section>
      ) : null}

      {!isLoading && !isError && isEmpty ? (
        <section className={styles.stateCard}>
          <h3>No dashboard data yet</h3>
          <p>The API returned no tasks or projects to summarize.</p>
        </section>
      ) : null}

      {!isLoading && !isError && !isEmpty ? (
        <>
          <section className={styles.statsGrid} aria-label="Dashboard metrics">
            <StatCard
              label="Total projects"
              value={metrics.totalProjects}
              helperText="Portfolio initiatives"
            />
            <StatCard
              label="Active tasks"
              value={metrics.totalActiveTasks}
              helperText="Unarchived work items"
            />
            <StatCard
              label="In progress"
              value={metrics.inProgressTasksCount}
              helperText="Tasks currently moving"
            />
            <StatCard
              label="Completed"
              value={metrics.completedTasksCount}
              helperText="Tasks marked done"
            />
            <StatCard
              label="Overdue"
              value={metrics.overdueTasks.length}
              helperText="Open tasks past due date"
            />
          </section>

          <div className={styles.contentGrid}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3>Recent tasks</h3>
                <span>{metrics.recentlyUpdatedTasks.length} latest updates</span>
              </div>

              {metrics.recentlyUpdatedTasks.length > 0 ? (
                <ul className={styles.taskList}>
                  {metrics.recentlyUpdatedTasks.map((task) => (
                    <TaskSummaryItem
                      key={task.id}
                      task={task}
                      users={users}
                      projects={projects}
                    />
                  ))}
                </ul>
              ) : (
                <p className={styles.panelEmpty}>No recent task updates.</p>
              )}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3>Status breakdown</h3>
                <span>{metrics.totalActiveTasks} active tasks</span>
              </div>

              <div className={styles.breakdownList}>
                {statusBreakdown.map((item) => (
                  <div key={item.status} className={styles.breakdownItem}>
                    <span>{item.label}</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3>Overdue tasks</h3>
                <span>{metrics.overdueTasks.length} open</span>
              </div>

              {metrics.overdueTasks.length > 0 ? (
                <ul className={styles.taskList}>
                  {metrics.overdueTasks.map((task) => (
                    <TaskSummaryItem
                      key={task.id}
                      task={task}
                      users={users}
                      projects={projects}
                    />
                  ))}
                </ul>
              ) : (
                <p className={styles.panelEmpty}>No overdue tasks.</p>
              )}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3>Workload by assignee</h3>
                <span>{metrics.workloadByAssignee.length} people</span>
              </div>

              <div className={styles.breakdownList}>
                {metrics.workloadByAssignee.map((item) => (
                  <div key={item.assigneeId} className={styles.breakdownItem}>
                    <span>{item.assigneeName}</span>
                    <strong>{item.activeTasks}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3>Project progress</h3>
                <span>{metrics.projectProgress.length} projects</span>
              </div>

              <div className={styles.breakdownList}>
                {metrics.projectProgress.map((item) => (
                  <div key={item.projectId} className={styles.progressItem}>
                    <div>
                      <span>{item.projectName}</span>
                      <small>
                        {item.completedTasks} of {item.totalTasks} complete
                      </small>
                    </div>
                    <strong>{item.progressPercent}%</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default DashboardPage
