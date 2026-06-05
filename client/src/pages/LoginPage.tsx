import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../shared/api/authApi'
import { setToken } from '../shared/lib/authToken'
import styles from './AuthPage.module.css'

function LoginPage() {
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    try {
      const response = await login({ email, password }).unwrap()
      setToken(response.token)
      navigate('/dashboard', { replace: true })
    } catch {
      setErrorMessage('Unable to sign in with those credentials.')
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

        <form className={styles.form} onSubmit={handleSubmit}>
          {errorMessage ? (
            <div className={styles.errorMessage} role="alert">
              {errorMessage}
            </div>
          ) : null}

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
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          <button className={styles.primaryButton} disabled={isLoading} type="submit">
            {isLoading ? 'Signing in...' : 'Sign in'}
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
