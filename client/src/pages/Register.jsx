import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Register() {
  const { register, navigate } = useApp()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: 'Resident',
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function validate() {
    if (!form.name.trim())   return 'Full name is required.'
    if (!form.email.trim())  return 'Email address is required.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (form.password !== form.confirm) return 'Passwords do not match.'
    return null
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const msg = validate()
    if (msg) return setError(msg)
    setLoading(true)
    setTimeout(() => {
      try {
        register(form.name.trim(), form.email.trim(), form.password, form.role)
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
          <h1>Create Account</h1>
          <p>Join WashTime and start booking laundry slots</p>
        </div>

        <div className="auth-body">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                className="form-control"
                name="name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                className="form-control"
                type="email"
                name="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-pass">Password</label>
              <input
                id="reg-pass"
                className="form-control"
                type="password"
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                className="form-control"
                type="password"
                name="confirm"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">Account Role</label>
              <select
                id="role"
                className="form-control"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="Resident">Resident</option>
                <option value="Admin">Admin</option>
              </select>
              <p className="form-hint">Select Admin to access machine management.</p>
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-white" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        <div className="auth-foot">
          Already have an account?{' '}
          <button onClick={() => navigate('login')}>Sign in</button>
        </div>
      </div>
    </div>
  )
}
