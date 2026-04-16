import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Navbar        from './components/Navbar'
import Login         from './pages/Login'
import Register      from './pages/Register'
import Dashboard     from './pages/Dashboard'
import BookSlot      from './pages/BookSlot'
import MyBookings    from './pages/MyBookings'
import AdminMachines from './pages/AdminMachines'

// Redirect to /login if not logged in
function ProtectedRoute({ children }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}

// Redirect non-admin users away from admin pages
function AdminRoute({ children }) {
  const { currentUser, isAdmin } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  if (!isAdmin)     return <Navigate to="/dashboard" replace />
  return children
}

// Redirect already-logged-in users away from /login and /register
function PublicRoute({ children }) {
  const { currentUser } = useApp()
  if (currentUser) return <Navigate to="/dashboard" replace />
  return children
}

// ── Route tree ────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <>
      <Navbar />
      <div className="page-wrap">
        <Routes>
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/book"      element={<ProtectedRoute><BookSlot /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

          <Route
            path="/admin/machines"
            element={<AdminRoute><AdminMachines /></AdminRoute>}
          />

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="layout">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
