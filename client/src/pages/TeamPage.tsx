import { useMemo, useState } from 'react'
import UserProfileForm, {
  type UserProfileFormValues,
} from '../components/UserProfileForm'
import { useGetCurrentUserQuery } from '../shared/api/authApi'
import { useGetProjectsQuery } from '../shared/api/projectsApi'
import { useGetTasksQuery } from '../shared/api/tasksApi'
import { useGetUsersQuery, useUpdateUserMutation } from '../shared/api/usersApi'
import { getPermissionAwareErrorMessage } from '../shared/lib/apiErrors'
import { canManageUsers } from '../shared/lib/permissions'
import type { Task } from '../shared/types/task'
import type { User, UserRole } from '../shared/types/user'
import { EmptyState, ErrorState, LoadingState } from '../shared/ui/ApiState'
import styles from './TeamPage.module.css'

const userRoleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  developer: 'Developer',
  viewer: 'Viewer',
}

type WorkloadFilter = 'all' | 'active' | 'overloaded'

const overloadedActiveTaskThreshold = 4

function isOverdue(task: Task) {
  if (!task.dueDate || task.status === 'done' || task.archived) {
    return false
  }

  const dueDate = new Date(task.dueDate.includes('T') ? task.dueDate : `${task.dueDate}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return dueDate < today
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function TeamPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [workloadFilter, setWorkloadFilter] = useState<WorkloadFilter>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editUserError, setEditUserError] = useState<string | null>(null)
  const {
    data: currentUser,
    error: currentUserError,
    isError: isCurrentUserError,
    isLoading: isCurrentUserLoading,
  } = useGetCurrentUserQuery()
  const {
    data: users = [],
    error: usersError,
    isError: isUsersError,
    isLoading: isUsersLoading,
  } = useGetUsersQuery()
  const {
    data: tasks = [],
    error: tasksError,
    isError: isTasksError,
    isLoading: isTasksLoading,
  } = useGetTasksQuery({ includeArchived: true })
  const {
    data: projects = [],
    error: projectsError,
    isError: isProjectsError,
    isLoading: isProjectsLoading,
  } = useGetProjectsQuery()
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation()
  const userCanManageUsers = canManageUsers(currentUser?.role)
  const isLoading =
    isCurrentUserLoading || isUsersLoading || isTasksLoading || isProjectsLoading
  const isError = isCurrentUserError || isUsersError || isTasksError || isProjectsError
  const apiError = currentUserError ?? usersError ?? tasksError ?? projectsError

  const teamMembers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return users
      .map((user) => {
        const assignedTasks = tasks.filter((task) => task.assigneeId === user.id)
        const activeTasks = assignedTasks.filter(
          (task) => !task.archived && task.status !== 'done',
        )

        return {
          user,
          assignedTasksCount: assignedTasks.length,
          completedTasksCount: assignedTasks.filter((task) => task.status === 'done').length,
          activeTasksCount: activeTasks.length,
          overdueTasksCount: activeTasks.filter(isOverdue).length,
          ownedProjectsCount: projects.filter((project) => project.ownerId === user.id).length,
        }
      })
      .filter((member) => {
        const matchesSearch =
          !normalizedQuery ||
          member.user.name.toLowerCase().includes(normalizedQuery) ||
          member.user.email.toLowerCase().includes(normalizedQuery)
        const matchesRole = roleFilter === 'all' || member.user.role === roleFilter
        const matchesWorkload =
          workloadFilter === 'all' ||
          (workloadFilter === 'active' && member.activeTasksCount > 0) ||
          (workloadFilter === 'overloaded' &&
            member.activeTasksCount >= overloadedActiveTaskThreshold)

        return matchesSearch && matchesRole && matchesWorkload
      })
  }, [projects, roleFilter, searchQuery, tasks, users, workloadFilter])

  async function handleEditUser(values: UserProfileFormValues) {
    if (!selectedUser || !userCanManageUsers) {
      setEditUserError('Only admins can manage team users.')
      return
    }

    setEditUserError(null)

    try {
      await updateUser({
        id: selectedUser.id,
        name: values.name,
        role: values.role,
        avatarUrl: values.avatarUrl,
      }).unwrap()
      setSelectedUser(null)
    } catch (error) {
      setEditUserError(
        getPermissionAwareErrorMessage(
          error,
          'Could not update user. Please try again.',
        ),
      )
    }
  }

  return (
    <div className={styles.teamPage}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Team</p>
        <h2>Team workspace</h2>
        <p>Review team ownership, role coverage, and task workload from API data.</p>
      </section>

      <section className={styles.filters} aria-label="Team filters">
        <label htmlFor="team-search">
          Search team
          <input
            id="team-search"
            type="search"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>

        <label htmlFor="team-role">
          Role
          <select
            id="team-role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as UserRole | 'all')}
          >
            <option value="all">All roles</option>
            {Object.entries(userRoleLabels).map(([role, label]) => (
              <option key={role} value={role}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="team-workload">
          Workload
          <select
            id="team-workload"
            value={workloadFilter}
            onChange={(event) => setWorkloadFilter(event.target.value as WorkloadFilter)}
          >
            <option value="all">All workloads</option>
            <option value="active">Has active tasks</option>
            <option value="overloaded">Overloaded</option>
          </select>
        </label>
      </section>

      {isLoading ? (
        <LoadingState
          title="Loading team"
          description="Fetching users, tasks, projects, and your permissions."
        />
      ) : null}

      {isError ? <ErrorState error={apiError} title="Could not load team" /> : null}

      {!isLoading && !isError && teamMembers.length > 0 ? (
        <section className={styles.memberGrid} aria-label="Team members">
          {teamMembers.map((member) => (
            <article key={member.user.id} className={styles.memberCard}>
              <header className={styles.memberHeader}>
                {member.user.avatarUrl ? (
                  <img
                    className={styles.avatar}
                    src={member.user.avatarUrl}
                    alt=""
                  />
                ) : (
                  <span className={styles.initials}>{getInitials(member.user.name)}</span>
                )}
                <div>
                  <h3>{member.user.name}</h3>
                  <p>{member.user.email}</p>
                </div>
                <span className={`${styles.rolePill} ${styles[member.user.role]}`}>
                  {userRoleLabels[member.user.role]}
                </span>
              </header>

              <dl className={styles.memberStats}>
                <div>
                  <dt>Assigned</dt>
                  <dd>{member.assignedTasksCount}</dd>
                </div>
                <div>
                  <dt>Completed</dt>
                  <dd>{member.completedTasksCount}</dd>
                </div>
                <div>
                  <dt>Active</dt>
                  <dd>{member.activeTasksCount}</dd>
                </div>
                <div>
                  <dt>Overdue</dt>
                  <dd>{member.overdueTasksCount}</dd>
                </div>
                <div>
                  <dt>Owned projects</dt>
                  <dd>{member.ownedProjectsCount}</dd>
                </div>
              </dl>

              {userCanManageUsers ? (
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => {
                    setEditUserError(null)
                    setSelectedUser(member.user)
                  }}
                >
                  Edit user
                </button>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {!isLoading && !isError && teamMembers.length === 0 ? (
        <EmptyState
          title={users.length === 0 ? 'No team members yet' : 'No team members found'}
          description={
            users.length === 0
              ? 'The API returned an empty team list.'
              : 'Try changing the search query or clearing one of the filters.'
          }
        />
      ) : null}

      {selectedUser ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={() => {
            if (!isUpdatingUser) {
              setSelectedUser(null)
            }
          }}
        >
          <section
            aria-labelledby="edit-user-title"
            aria-modal="true"
            className={styles.userModal}
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Team member</p>
                <h2 id="edit-user-title">Edit user</h2>
              </div>
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={isUpdatingUser}
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </header>

            {editUserError ? (
              <section className={styles.feedbackPanel} aria-live="polite">
                <h4>Update failed</h4>
                <p>{editUserError}</p>
              </section>
            ) : null}

            <UserProfileForm
              key={selectedUser.id}
              initialUser={selectedUser}
              isSubmitting={isUpdatingUser}
              onSubmit={handleEditUser}
            />
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default TeamPage
