import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useLoginMutation } from '../shared/api/authApi'
import { getApiErrorMessage } from '../shared/lib/apiErrors'
import { setToken } from '../shared/lib/authToken'
import styles from './AuthPage.module.css'

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email.')
    .email('Enter a valid email address.')
    .toLowerCase(),
  password: z.string().min(1, 'Enter your password.'),
})

type LoginFormFieldValues = z.input<typeof loginSchema>
type LoginFormValues = z.output<typeof loginSchema>

function LoginPage() {
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()
  const [errorMessage, setErrorMessage] = useState('')
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormFieldValues, unknown, LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
    resolver: zodResolver(loginSchema),
  })

  const isSubmitDisabled = isLoading || isSubmitting

  async function handleValidSubmit(values: LoginFormValues) {
    setErrorMessage('')

    try {
      const response = await login(values).unwrap()
      setToken(response.token)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, 'Unable to sign in with those credentials.'),
      )
    }
  }

  return (
    <section className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <p className={styles.eyebrow}>Welcome back</p>
          <h2>Sign in to TeamFlow Ops</h2>
          <p>Use your workspace account to continue.</p>
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

          <label htmlFor="login-email">
            Email
            <input
              id="login-email"
              aria-invalid={errors.email ? 'true' : 'false'}
              autoComplete="email"
              type="email"
              {...register('email')}
            />
            {errors.email ? (
              <span className={styles.fieldError}>{errors.email.message}</span>
            ) : null}
          </label>

          <label htmlFor="login-password">
            Password
            <input
              id="login-password"
              aria-invalid={errors.password ? 'true' : 'false'}
              autoComplete="current-password"
              type="password"
              {...register('password')}
            />
            {errors.password ? (
              <span className={styles.fieldError}>{errors.password.message}</span>
            ) : null}
          </label>

          <button
            className={styles.primaryButton}
            disabled={isSubmitDisabled}
            type="submit"
          >
            {isSubmitDisabled ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className={styles.switchText}>
          New to TeamFlow Ops? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  )
}

export default LoginPage
