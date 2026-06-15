import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Project, ProjectStatus } from '../shared/types/project'
import type { User } from '../shared/types/user'
import styles from './TaskForm.module.css'

const projectStatusOptions: ProjectStatus[] = [
  'planning',
  'active',
  'paused',
  'completed',
]

const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
}

const projectFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a project name.'),
  description: z.string().trim(),
  status: z
    .string()
    .trim()
    .refine(
      (value): value is ProjectStatus =>
        projectStatusOptions.includes(value as ProjectStatus),
      'Choose a status.',
    ),
  ownerId: z
    .string()
    .trim()
    .transform((value) => value || undefined),
})

type ProjectFormFieldValues = z.input<typeof projectFormSchema>
export type ProjectFormValues = z.output<typeof projectFormSchema>

type ProjectFormProps = {
  users: User[]
  initialProject?: Project
  defaultOwnerId?: string
  onSubmit?: (values: ProjectFormValues) => void
  isSubmitting?: boolean
  submitLabel?: string
}

function getDefaultValues({
  defaultOwnerId,
  initialProject,
}: Pick<ProjectFormProps, 'defaultOwnerId' | 'initialProject'>): ProjectFormFieldValues {
  return {
    name: initialProject?.name ?? '',
    description: initialProject?.description ?? '',
    status: initialProject?.status ?? 'active',
    ownerId: initialProject?.ownerId ?? defaultOwnerId ?? '',
  }
}

function ProjectForm({
  defaultOwnerId,
  initialProject,
  isSubmitting = false,
  onSubmit,
  submitLabel = 'Save project',
  users,
}: ProjectFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ProjectFormFieldValues, unknown, ProjectFormValues>({
    defaultValues: getDefaultValues({ defaultOwnerId, initialProject }),
    mode: 'onBlur',
    resolver: zodResolver(projectFormSchema),
  })

  function handleValidSubmit(values: ProjectFormValues) {
    onSubmit?.(values)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleValidSubmit)} noValidate>
      <div className={styles.formGrid}>
        <label className={styles.fullWidth} htmlFor="project-form-name">
          Name
          <input
            id="project-form-name"
            type="text"
            aria-invalid={errors.name ? 'true' : 'false'}
            {...register('name')}
          />
          {errors.name ? <span className={styles.error}>{errors.name.message}</span> : null}
        </label>

        <label className={styles.fullWidth} htmlFor="project-form-description">
          Description
          <textarea
            id="project-form-description"
            rows={3}
            aria-invalid={errors.description ? 'true' : 'false'}
            {...register('description')}
          />
          {errors.description ? (
            <span className={styles.error}>{errors.description.message}</span>
          ) : null}
        </label>

        <label htmlFor="project-form-status">
          Status
          <select
            id="project-form-status"
            aria-invalid={errors.status ? 'true' : 'false'}
            {...register('status')}
          >
            {projectStatusOptions.map((status) => (
              <option key={status} value={status}>
                {projectStatusLabels[status]}
              </option>
            ))}
          </select>
          {errors.status ? (
            <span className={styles.error}>{errors.status.message}</span>
          ) : null}
        </label>

        <label htmlFor="project-form-owner">
          Owner
          <select
            id="project-form-owner"
            aria-invalid={errors.ownerId ? 'true' : 'false'}
            {...register('ownerId')}
          >
            <option value="">Current user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          {errors.ownerId ? (
            <span className={styles.error}>{errors.ownerId.message}</span>
          ) : null}
        </label>
      </div>

      <div className={styles.actions}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ProjectForm
