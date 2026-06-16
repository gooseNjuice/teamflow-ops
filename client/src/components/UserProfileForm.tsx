import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { User, UserRole } from '../shared/types/user'
import styles from './TaskForm.module.css'

const userRoleOptions: UserRole[] = ['admin', 'manager', 'developer', 'viewer']

const userRoleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  developer: 'Developer',
  viewer: 'Viewer',
}

const userProfileFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name.'),
  role: z
    .string()
    .trim()
    .refine(
      (value): value is UserRole => userRoleOptions.includes(value as UserRole),
      'Choose a role.',
    ),
  avatarUrl: z.string().trim(),
})

type UserProfileFormFieldValues = z.input<typeof userProfileFormSchema>
export type UserProfileFormValues = z.output<typeof userProfileFormSchema>

type UserProfileFormProps = {
  initialUser: User
  isSubmitting?: boolean
  onSubmit?: (values: UserProfileFormValues) => void
}

function getDefaultValues(user: User): UserProfileFormFieldValues {
  return {
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl ?? '',
  }
}

function UserProfileForm({
  initialUser,
  isSubmitting = false,
  onSubmit,
}: UserProfileFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<UserProfileFormFieldValues, unknown, UserProfileFormValues>({
    defaultValues: getDefaultValues(initialUser),
    mode: 'onBlur',
    resolver: zodResolver(userProfileFormSchema),
  })

  function handleValidSubmit(values: UserProfileFormValues) {
    onSubmit?.(values)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleValidSubmit)} noValidate>
      <div className={styles.formGrid}>
        <label className={styles.fullWidth} htmlFor="user-form-name">
          Name
          <input
            id="user-form-name"
            type="text"
            aria-invalid={errors.name ? 'true' : 'false'}
            {...register('name')}
          />
          {errors.name ? <span className={styles.error}>{errors.name.message}</span> : null}
        </label>

        <label htmlFor="user-form-role">
          Role
          <select
            id="user-form-role"
            aria-invalid={errors.role ? 'true' : 'false'}
            {...register('role')}
          >
            {userRoleOptions.map((role) => (
              <option key={role} value={role}>
                {userRoleLabels[role]}
              </option>
            ))}
          </select>
          {errors.role ? <span className={styles.error}>{errors.role.message}</span> : null}
        </label>

        <label htmlFor="user-form-avatar">
          Avatar URL
          <input
            id="user-form-avatar"
            type="url"
            aria-invalid={errors.avatarUrl ? 'true' : 'false'}
            {...register('avatarUrl')}
          />
          {errors.avatarUrl ? (
            <span className={styles.error}>{errors.avatarUrl.message}</span>
          ) : null}
        </label>
      </div>

      <div className={styles.actions}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save user'}
        </button>
      </div>
    </form>
  )
}

export default UserProfileForm
