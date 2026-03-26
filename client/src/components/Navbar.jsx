import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { view, navigate, currentUser, isAdmin, logout } = useApp()

  if (!currentUser) return null

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('dashboard')}>
        <span className="brand-bubble">🫧</span>
        WashTime
      </div>

      <ul className="nav-links">
        <li>
          <button
            className={view === 'dashboard' ? 'active' : ''}
            onClick={() => navigate('dashboard')}
          >
            Dashboard
          </button>
        </li>
        <li>
          <button
            className={view === 'book' ? 'active' : ''}
            onClick={() => navigate('book')}
          >
            Book a Slot
          </button>
        </li>
        <li>
          <button
            className={view === 'myBookings' ? 'active' : ''}
            onClick={() => navigate('myBookings')}
          >
            My Bookings
          </button>
        </li>
        {isAdmin && (
          <li>
            <button
              className={`nav-admin ${view === 'adminMachines' ? 'active' : ''}`}
              onClick={() => navigate('adminMachines')}
            >
              ⚙ Machines
            </button>
          </li>
        )}
      </ul>

      <div className="navbar-right">
        <span>Hi, {currentUser.name.split(' ')[0]}</span>
        <button className="btn-signout" onClick={logout}>
          Sign Out
        </button>
      </div>
    </nav>
  )
}
