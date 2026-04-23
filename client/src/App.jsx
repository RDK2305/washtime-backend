import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import BookSlot from './pages/BookSlot'
import MyBookings from './pages/MyBookings'
import AdminMachines from './pages/AdminMachines'
import NotFound from './pages/NotFound'

// Sends the user to /login if they are not logged in
function ProtectedRoute({ children }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}

// Only admins can access this route, everyone else goes to dashboard
function AdminRoute({ children }) {
  const { currentUser, isAdmin } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

// If the user is already logged in, skip login/register pages
function PublicRoute({ children }) {
  const { currentUser } = useApp()
  if (currentUser) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <div className="page-wrap">
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/book" element={<ProtectedRoute><BookSlot /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

          <Route
            path="/admin/machines"
            element={<AdminRoute><AdminMachines /></AdminRoute>}
          />

          {/* Default: root goes to dashboard, anything else shows the 404 page */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  )
}

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
