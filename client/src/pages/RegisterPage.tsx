import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from '../shared/api/authApi'
import { setToken } from '../shared/lib/authToken'
import type { UserRole } from '../shared/types/user'
import styles from './AuthPage.module.css'

const roleOptions: Array<{ label: string; value: UserRole }> = [
  { label: 'Developer', value: 'developer' },
  { label: 'Manager', value: 'manager' },
  { label: 'Viewer', value: 'viewer' },
  { label: 'Admin', value: 'admin' },
]

function RegisterPage() {
  const navigate = useNavigate()
  const [register, { isLoading }] = useRegisterMutation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('developer')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    try {
      const response = await register({ name, email, password, role }).unwrap()
      setToken(response.token)
      navigate('/dashboard', { replace: true })
    } catch {
      setErrorMessage('Unable to create that account.')
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

        <form className={styles.form} onSubmit={handleSubmit}>
          {errorMessage ? (
            <div className={styles.errorMessage} role="alert">
              {errorMessage}
            </div>
          ) : null}

          <label>
            Name
            <input
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
              required
              type="text"
              value={name}
            />
          </label>

          <label>
            Email
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label>
            Password
            <input
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          <label>
            Role
            <select
              onChange={(event) => setRole(event.target.value as UserRole)}
              value={role}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button className={styles.primaryButton} disabled={isLoading} type="submit">
            {isLoading ? 'Creating account...' : 'Create account'}
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
