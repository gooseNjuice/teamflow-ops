import { projects, tasks, users } from '../data/mockData'
import type { Task, TaskStatus } from '../types'
import styles from './DashboardPage.module.css'

const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

const today = new Date('2026-05-19T00:00:00')

function isOverdue(task: Task) {
  return task.status !== 'done' && new Date(`${task.dueDate}T00:00:00`) < today
}

function getProjectName(projectId: string) {
  return projects.find((project) => project.id === projectId)?.name ?? 'Unknown project'
}

function getAssigneeName(assigneeId: string) {
  return users.find((user) => user.id === assigneeId)?.name ?? 'Unassigned'
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
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

function DashboardPage() {
  const tasksInProgress = tasks.filter((task) => task.status === 'in-progress')
  const overdueTasks = tasks.filter(isOverdue)
  const recentTasks = [...tasks]
    .sort((firstTask, secondTask) => secondTask.updatedAt.localeCompare(firstTask.updatedAt))
    .slice(0, 4)

  const statusBreakdown = Object.entries(taskStatusLabels).map(([status, label]) => ({
    status: status as TaskStatus,
    label,
    count: tasks.filter((task) => task.status === status).length,
  }))

  return (
    <div className={styles.dashboard}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Overview</p>
        <h2>Team operations at a glance</h2>
        <p>
          Monitor active work, spot overdue tasks, and keep delivery momentum visible
          before connecting real project data.
        </p>
      </section>

      <section className={styles.statsGrid} aria-label="Dashboard metrics">
        <StatCard
          label="Total projects"
          value={projects.length}
          helperText="Active portfolio initiatives"
        />
        <StatCard label="Total tasks" value={tasks.length} helperText="Tracked work items" />
        <StatCard
          label="In progress"
          value={tasksInProgress.length}
          helperText="Tasks currently moving"
        />
        <StatCard
          label="Overdue"
          value={overdueTasks.length}
          helperText="Open tasks past due date"
        />
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Recent tasks</h3>
            <span>{recentTasks.length} latest updates</span>
          </div>

          <ul className={styles.taskList}>
            {recentTasks.map((task) => (
              <li key={task.id} className={styles.taskItem}>
                <div>
                  <strong>{task.title}</strong>
                  <p>
                    {getProjectName(task.projectId)} · {getAssigneeName(task.assigneeId)}
                  </p>
                </div>
                <div className={styles.taskMeta}>
                  <span className={`${styles.statusPill} ${styles[task.status]}`}>
                    {taskStatusLabels[task.status]}
                  </span>
                  <span>Due {formatDate(task.dueDate)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Status breakdown</h3>
            <span>{tasks.length} tasks</span>
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
      </div>
    </div>
  )
}

export default DashboardPage

