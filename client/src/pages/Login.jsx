import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if the user just finished registering so we can show a success message
  const justRegistered = location.state?.registered === true

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      return setError('Please fill in all fields.')
    }

    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-head">
          <div className="auth-logo">🫧</div>
          <h1>Welcome back</h1>
          <p>Sign in to manage your laundry schedule</p>
        </div>

        <div className="auth-body">
          {justRegistered && (
            <div className="alert alert-success">
              Account created! Sign in below.
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                className="form-control"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="form-control"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-white" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-hint mt-1">
            Demo admin: <code>admin@washtime.com</code> /{' '}
            <code>admin123</code>
          </div>
        </div>

        <div className="auth-foot">
          Don't have an account?{' '}
          <button onClick={() => navigate('/register')}>Create one</button>
        </div>
      </div>
    </div>
  )
}
