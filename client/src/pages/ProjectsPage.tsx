import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProjectForm, { type ProjectFormValues } from '../components/ProjectForm'
import { useGetCurrentUserQuery } from '../shared/api/authApi'
import {
  useCreateProjectMutation,
  useGetProjectsQuery,
} from '../shared/api/projectsApi'
import { useGetUsersQuery } from '../shared/api/usersApi'
import { getPermissionAwareErrorMessage } from '../shared/lib/apiErrors'
import { canCreateProject } from '../shared/lib/permissions'
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
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [createProjectError, setCreateProjectError] = useState<string | null>(null)
  const { data: currentUser } = useGetCurrentUserQuery()
  const {
    data: projects = [],
    error,
    isError,
    isLoading,
  } = useGetProjectsQuery()
  const { data: users = [] } = useGetUsersQuery()
  const [createProject, { isLoading: isCreatingProject }] =
    useCreateProjectMutation()
  const userCanCreateProject = canCreateProject(currentUser?.role)
  const readOnlyProjectMessage =
    'Your role can view projects, but cannot change them.'

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return projects
    }

    return projects.filter((project) =>
      project.name.toLowerCase().includes(normalizedQuery),
    )
  }, [projects, searchQuery])

  function getOwnerName(ownerId: string) {
    return users.find((user) => user.id === ownerId)?.name ?? ownerId
  }

  async function handleCreateProject(values: ProjectFormValues) {
    if (!userCanCreateProject) {
      setCreateProjectError(readOnlyProjectMessage)
      return
    }

    setCreateProjectError(null)

    try {
      await createProject({
        name: values.name,
        description: values.description,
        status: values.status,
        ownerId: values.ownerId,
      }).unwrap()
      setIsCreateProjectOpen(false)
    } catch (projectError) {
      setCreateProjectError(
        getPermissionAwareErrorMessage(
          projectError,
          'Could not create project. Please try again.',
        ),
      )
    }
  }

  return (
    <div className={styles.projectsPage}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div>
            <p className={styles.eyebrow}>Projects</p>
            <h2>Project portfolio</h2>
            <p>Review active initiatives, ownership, and delivery status from the API.</p>
          </div>
          <button
            className={styles.primaryButton}
            type="button"
            disabled={!userCanCreateProject}
            title={!userCanCreateProject ? readOnlyProjectMessage : undefined}
            onClick={() => {
              if (!userCanCreateProject) {
                return
              }

              setCreateProjectError(null)
              setIsCreateProjectOpen(true)
            }}
          >
            New Project
          </button>
        </div>
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
                  <dd>{getOwnerName(project.ownerId)}</dd>
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

      {isCreateProjectOpen ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={() => {
            if (!isCreatingProject) {
              setIsCreateProjectOpen(false)
            }
          }}
        >
          <section
            aria-labelledby="create-project-title"
            aria-modal="true"
            className={styles.projectModal}
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>New project</p>
                <h2 id="create-project-title">Create project</h2>
              </div>
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={isCreatingProject}
                onClick={() => setIsCreateProjectOpen(false)}
              >
                Close
              </button>
            </header>

            {createProjectError ? (
              <section className={styles.feedbackPanel} aria-live="polite">
                <h4>Creation failed</h4>
                <p>{createProjectError}</p>
              </section>
            ) : null}

            <ProjectForm
              users={users}
              defaultOwnerId={currentUser?.id}
              isSubmitting={isCreatingProject}
              submitLabel="Create project"
              onSubmit={handleCreateProject}
            />
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default ProjectsPage

