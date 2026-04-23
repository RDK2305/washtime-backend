import { useNavigate } from 'react-router-dom'

// Simple 404 page for any URL that doesn't match a real route
export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{ textAlign: 'center', marginTop: '5rem', padding: '2rem' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🫧</div>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, margin: '0 0 .5rem' }}>404</h1>
      <h2 style={{ fontWeight: 600, marginBottom: '.75rem' }}>Page Not Found</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Hmm, that page doesn't exist. Maybe you typed the wrong URL?
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
        Take Me Home
      </button>
    </div>
  )
}
