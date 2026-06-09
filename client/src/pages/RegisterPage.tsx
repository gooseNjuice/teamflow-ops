import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useRegisterMutation } from '../shared/api/authApi'
import { getApiErrorMessage } from '../shared/lib/apiErrors'
import { setToken } from '../shared/lib/authToken'
import type { UserRole } from '../shared/types/user'
import styles from './AuthPage.module.css'

const userRoleOptions = ['developer', 'manager', 'viewer', 'admin'] as const

const roleOptions: Array<{ label: string; value: UserRole }> = [
  { label: 'Developer', value: 'developer' },
  { label: 'Manager', value: 'manager' },
  { label: 'Viewer', value: 'viewer' },
  { label: 'Admin', value: 'admin' },
]

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.'),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email.')
    .email('Enter a valid email address.')
    .toLowerCase(),
  password: z.string().min(8, 'Use at least 8 characters.'),
  role: z.enum(userRoleOptions).default('developer'),
})

type RegisterFormFieldValues = z.input<typeof registerSchema>
type RegisterFormValues = z.output<typeof registerSchema>

function RegisterPage() {
  const navigate = useNavigate()
  const [register, { isLoading }] = useRegisterMutation()
  const [errorMessage, setErrorMessage] = useState('')
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register: registerField,
  } = useForm<RegisterFormFieldValues, unknown, RegisterFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'developer',
    },
    mode: 'onBlur',
    resolver: zodResolver(registerSchema),
  })

  const isSubmitDisabled = isLoading || isSubmitting

  async function handleValidSubmit(values: RegisterFormValues) {
    setErrorMessage('')

    try {
      const response = await register(values).unwrap()
      setToken(response.token)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, 'Unable to create that account.'),
      )
    }
  }

  return (
    <section className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <p className={styles.eyebrow}>Get started</p>
          <h2>Create your account</h2>
          <p>Set up access for the demo workspace.</p>
        </div>

        <form
          className={styles.form}
          noValidate
          onSubmit={handleSubmit(handleValidSubmit)}
        >
          {errorMessage ? (
            <div className={styles.errorMessage} role="alert">
              {errorMessage}
            </div>
          ) : null}

          <label htmlFor="register-name">
            Name
            <input
              id="register-name"
              aria-invalid={errors.name ? 'true' : 'false'}
              autoComplete="name"
              type="text"
              {...registerField('name')}
            />
            {errors.name ? (
              <span className={styles.fieldError}>{errors.name.message}</span>
            ) : null}
          </label>

          <label htmlFor="register-email">
            Email
            <input
              id="register-email"
              aria-invalid={errors.email ? 'true' : 'false'}
              autoComplete="email"
              type="email"
              {...registerField('email')}
            />
            {errors.email ? (
              <span className={styles.fieldError}>{errors.email.message}</span>
            ) : null}
          </label>

          <label htmlFor="register-password">
            Password
            <input
              id="register-password"
              aria-invalid={errors.password ? 'true' : 'false'}
              autoComplete="new-password"
              type="password"
              {...registerField('password')}
            />
            {errors.password ? (
              <span className={styles.fieldError}>{errors.password.message}</span>
            ) : null}
          </label>

          <label htmlFor="register-role">
            Role
            <select
              id="register-role"
              aria-invalid={errors.role ? 'true' : 'false'}
              {...registerField('role')}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.role ? (
              <span className={styles.fieldError}>{errors.role.message}</span>
            ) : null}
          </label>

          <button
            className={styles.primaryButton}
            disabled={isSubmitDisabled}
            type="submit"
          >
            {isSubmitDisabled ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  )
}

export default RegisterPage
