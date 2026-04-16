import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { currentUser, isAdmin, logout } = useApp()
  const navigate   = useNavigate()
  const { pathname } = useLocation()

  if (!currentUser) return null

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/dashboard')}>
        <span className="brand-bubble">🫧</span>
        WashTime
      </div>

      <ul className="nav-links">
        <li>
          <button
            className={pathname === '/dashboard' ? 'active' : ''}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>
        </li>
        <li>
          <button
            className={pathname === '/book' ? 'active' : ''}
            onClick={() => navigate('/book')}
          >
            Book a Slot
          </button>
        </li>
        <li>
          <button
            className={pathname === '/my-bookings' ? 'active' : ''}
            onClick={() => navigate('/my-bookings')}
          >
            My Bookings
          </button>
        </li>
        {isAdmin && (
          <li>
            <button
              className={`nav-admin ${pathname === '/admin/machines' ? 'active' : ''}`}
              onClick={() => navigate('/admin/machines')}
            >
              ⚙ Machines
            </button>
          </li>
        )}
      </ul>

      <div className="navbar-right">
        <span>Hi, {currentUser.name.split(' ')[0]}</span>
        <button className="btn-signout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  )
}
