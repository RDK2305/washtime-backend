import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login, navigate } = useApp()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      return setError('Please fill in all fields.')
    }
    setLoading(true)
    // Slight delay to show loading state (simulates async)
    setTimeout(() => {
      try {
        login(form.email, form.password)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }, 400)
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
          <button onClick={() => navigate('register')}>Create one</button>
        </div>
      </div>
    </div>
  )
}
