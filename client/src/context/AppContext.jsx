import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  apiLogin,
  apiRegister,
  apiGetMachines,
  apiAddMachine,
  apiUpdateMachine,
  apiDeleteMachine,
  apiGetBookings,
  apiCreateBooking,
  apiCancelBooking,
} from '../api'

const AppContext = createContext(null)

// Normalize a booking row coming from the database.
// PostgreSQL returns dates as ISO timestamps and times as HH:MM:SS — strip them down.
function normalizeBooking(b) {
  return {
    ...b,
    booking_date: b.booking_date
      ? String(b.booking_date).split('T')[0]
      : b.booking_date,
    start_time: b.start_time ? b.start_time.substring(0, 5) : b.start_time,
    end_time:   b.end_time   ? b.end_time.substring(0, 5)   : b.end_time,
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('wt_session')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [machines, setMachines] = useState([])
  const [bookings, setBookings] = useState([])

  // ── Load machines and bookings whenever a user is logged in ─────────────────

  const loadMachines = useCallback(async () => {
    try {
      const data = await apiGetMachines()
      setMachines(data.machines || [])
    } catch {
      // token may have expired; leave the existing list in place
    }
  }, [])

  const loadBookings = useCallback(async () => {
    try {
      const data = await apiGetBookings()
      const normalized = (data.bookings || []).map(normalizeBooking)
      setBookings(normalized)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadMachines()
      loadBookings()
    } else {
      setMachines([])
      setBookings([])
    }
  }, [currentUser, loadMachines, loadBookings])

  // ── Auth ────────────────────────────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password)
    localStorage.setItem('wt_token', data.token)
    localStorage.setItem('wt_session', JSON.stringify(data.user))
    setCurrentUser(data.user)
  }, [])

  const register = useCallback(async (name, email, password, role) => {
    await apiRegister(name, email, password, role)
    // Registration succeeds — caller should redirect to /login
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('wt_token')
    localStorage.removeItem('wt_session')
    setCurrentUser(null)
  }, [])

  // ── Machines ────────────────────────────────────────────────────────────────

  const addMachine = useCallback(async (machine_type, machine_number) => {
    await apiAddMachine(machine_type, machine_number)
    await loadMachines()
  }, [loadMachines])

  const toggleMachine = useCallback(async (machine) => {
    await apiUpdateMachine(machine.machine_id, { is_active: !machine.is_active })
    await loadMachines()
  }, [loadMachines])

  const deleteMachine = useCallback(async (machine_id) => {
    await apiDeleteMachine(machine_id)
    await loadMachines()
  }, [loadMachines])

  // ── Bookings ─────────────────────────────────────────────────────────────────

  const createBooking = useCallback(async ({ machine_id, booking_date, start_time, end_time }) => {
    await apiCreateBooking(machine_id, booking_date, start_time, end_time)
    await loadBookings()
  }, [loadBookings])

  const cancelBooking = useCallback(async (booking_id) => {
    await apiCancelBooking(booking_id)
    await loadBookings()
  }, [loadBookings])

  // myBookings == all bookings (API already filters by logged-in user)
  const myBookings = bookings

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAdmin: currentUser?.role === 'Admin',
        login,
        register,
        logout,
        machines,
        addMachine,
        toggleMachine,
        deleteMachine,
        bookings,
        myBookings,
        createBooking,
        cancelBooking,
        refreshBookings: loadBookings,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
