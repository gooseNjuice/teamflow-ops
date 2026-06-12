import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetProjectsQuery } from '../shared/api/projectsApi'
import type { ProjectStatus } from '../shared/types/project'
import { EmptyState, ErrorState, LoadingState } from '../shared/ui/ApiState'
import styles from './ProjectsPage.module.css'

const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
}

function formatDate(date: string) {
  const dateValue = date.includes('T') ? date : `${date}T00:00:00`

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateValue))
}

function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const {
    data: projects = [],
    error,
    isError,
    isLoading,
  } = useGetProjectsQuery()

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return projects
    }

    return projects.filter((project) =>
      project.name.toLowerCase().includes(normalizedQuery),
    )
  }, [projects, searchQuery])

  return (
    <div className={styles.projectsPage}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Projects</p>
        <h2>Project portfolio</h2>
        <p>Review active initiatives, ownership, and delivery status from the API.</p>
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

      {isLoading ? (
        <LoadingState
          title="Loading projects"
          description="Fetching the latest project portfolio."
        />
      ) : null}

      {isError ? (
        <ErrorState
          error={error}
          title="Could not load projects"
        />
      ) : null}

      {!isLoading && !isError && filteredProjects.length > 0 ? (
        <section className={styles.projectGrid} aria-label="Projects list">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              className={styles.projectCard}
              to={`/projects/${project.id}`}
            >
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
                  <dt>Owner</dt>
                  <dd>{project.ownerId}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{projectStatusLabels[project.status]}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{formatDate(project.createdAt)}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{formatDate(project.updatedAt)}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </section>
      ) : null}

      {!isLoading && !isError && filteredProjects.length === 0 ? (
        <EmptyState
          title={projects.length === 0 ? 'No projects yet' : 'No projects found'}
          description={
            projects.length === 0
              ? 'The API returned an empty project list.'
              : 'Try searching for another project name.'
          }
        />
      ) : null}
    </div>
  )
}

export default ProjectsPage

