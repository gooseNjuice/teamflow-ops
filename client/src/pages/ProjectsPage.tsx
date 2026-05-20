import { useMemo, useState } from 'react'
import { projects, tasks, users } from '../data/mockData'
import type { ProjectStatus } from '../types'
import styles from './ProjectsPage.module.css'

const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  'at-risk': 'At risk',
}

function getOwnerName(ownerId: string) {
  return users.find((user) => user.id === ownerId)?.name ?? 'Unknown owner'
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return projects
    }

    return projects.filter((project) =>
      project.name.toLowerCase().includes(normalizedQuery),
    )
  }, [searchQuery])

  return (
    <div className={styles.projectsPage}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Projects</p>
        <h2>Project portfolio</h2>
        <p>Review active initiatives, ownership, and task progress from mock data.</p>
      </section>

      <section className={styles.toolbar} aria-label="Project filters">
        <label htmlFor="project-search">Search projects</label>
        <input
          id="project-search"
          type="search"
          placeholder="Search by project name"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </section>

      {filteredProjects.length > 0 ? (
        <section className={styles.projectGrid} aria-label="Projects list">
          {filteredProjects.map((project) => {
            const projectTasks = tasks.filter((task) => task.projectId === project.id)
            const completedTasks = projectTasks.filter((task) => task.status === 'done')

            return (
              <article key={project.id} className={styles.projectCard}>
                <div className={styles.projectHeader}>
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                  </div>
                  <span className={`${styles.statusPill} ${styles[project.status]}`}>
                    {projectStatusLabels[project.status]}
                  </span>
                </div>

                <dl className={styles.projectMeta}>
                  <div>
                    <dt>Tasks</dt>
                    <dd>{projectTasks.length}</dd>
                  </div>
                  <div>
                    <dt>Completed</dt>
                    <dd>{completedTasks.length}</dd>
                  </div>
                  <div>
                    <dt>Owner</dt>
                    <dd>{getOwnerName(project.ownerId)}</dd>
                  </div>
                  <div>
                    <dt>Updated</dt>
                    <dd>{formatDate(project.updatedAt)}</dd>
                  </div>
                </dl>
              </article>
            )
          })}
        </section>
      ) : (
        <section className={styles.emptyState}>
          <h3>No projects found</h3>
          <p>Try searching for another project name.</p>
        </section>
      )}
    </div>
  )
}

export default ProjectsPage

