import { Link, useParams } from 'react-router-dom'
import { useGetProjectQuery } from '../shared/api/projectsApi'
import { useGetUsersQuery } from '../shared/api/usersApi'
import type { ProjectStatus } from '../shared/types/project'
import { EmptyState, ErrorState, LoadingState } from '../shared/ui/ApiState'
import styles from './ProjectDetailsPage.module.css'

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
    year: 'numeric',
  }).format(new Date(dateValue))
}

function isNotFoundError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 404
  )
}

function ProjectDetailsPage() {
  const { projectId } = useParams()
  const {
    data: project,
    error: projectError,
    isError: isProjectError,
    isLoading: isProjectLoading,
  } = useGetProjectQuery(projectId ?? '', {
    skip: !projectId,
  })
  const {
    data: users = [],
    error: usersError,
    isError: isUsersError,
    isLoading: isUsersLoading,
  } = useGetUsersQuery()
  const isLoading = isProjectLoading || isUsersLoading
  const isError = isProjectError || isUsersError
  const apiError = projectError ?? usersError
  const ownerName = project
    ? users.find((user) => user.id === project.ownerId)?.name ?? project.ownerId
    : ''

  return (
    <div className={styles.projectDetailsPage}>
      <Link className={styles.backLink} to="/projects">
        Back to projects
      </Link>

      {isLoading ? (
        <LoadingState
          title="Loading project"
          description="Fetching project details from the API."
        />
      ) : null}

      {!isLoading && isNotFoundError(projectError) ? (
        <EmptyState
          title="Project not found"
          description="The requested project could not be found."
        />
      ) : null}

      {!isLoading && isError && !isNotFoundError(projectError) ? (
        <ErrorState error={apiError} title="Could not load project" />
      ) : null}

      {!isLoading && !isError && project ? (
        <section className={styles.detailsCard} aria-labelledby="project-title">
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Project details</p>
              <h2 id="project-title">{project.name}</h2>
              <p>{project.description}</p>
            </div>
            <span className={`${styles.statusPill} ${styles[project.status]}`}>
              {projectStatusLabels[project.status]}
            </span>
          </header>

          <dl className={styles.detailsGrid}>
            <div>
              <dt>Owner</dt>
              <dd>{ownerName}</dd>
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
        </section>
      ) : null}
    </div>
  )
}

export default ProjectDetailsPage
