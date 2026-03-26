import { AppProvider, useApp } from './context/AppContext'
import Navbar        from './components/Navbar'
import Login         from './pages/Login'
import Register      from './pages/Register'
import Dashboard     from './pages/Dashboard'
import BookSlot      from './pages/BookSlot'
import MyBookings    from './pages/MyBookings'
import AdminMachines from './pages/AdminMachines'

// ── Router: state-based page switching (no external router library) ──────────
function Router() {
  const { view, currentUser, isAdmin } = useApp()

  // Guard: unauthenticated users only see login / register
  if (!currentUser) {
    if (view === 'register') return <Register />
    return <Login />
  }

  // Guard: non-admins cannot reach the admin page
  if (view === 'adminMachines' && !isAdmin) return <Dashboard />

  switch (view) {
    case 'dashboard':     return <Dashboard />
    case 'book':          return <BookSlot />
    case 'myBookings':    return <MyBookings />
    case 'adminMachines': return <AdminMachines />
    default:              return <Dashboard />
  }
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <div className="layout">
        <Navbar />
        <div className="page-wrap">
          <Router />
        </div>
      </div>
    </AppProvider>
  )
}
