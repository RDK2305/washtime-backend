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

// PostgreSQL sends dates as full ISO strings and times as HH:MM:SS
// This function strips them down to just the parts we actually need
function normalizeBooking(b) {
  return {
    ...b,
    booking_date: b.booking_date ? String(b.booking_date).split('T')[0] : b.booking_date,
    start_time: b.start_time ? b.start_time.substring(0, 5) : b.start_time,
    end_time: b.end_time ? b.end_time.substring(0, 5) : b.end_time,
  }
}

export function AppProvider({ children }) {
  // Try to restore the session from localStorage so the user stays logged in on refresh
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

  const loadMachines = useCallback(async () => {
    try {
      const data = await apiGetMachines()
      setMachines(data.machines || [])
    } catch {
      // if the token expired just leave the list as-is
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

  // Load data whenever a user logs in, clear it when they log out
  useEffect(() => {
    if (currentUser) {
      loadMachines()
      loadBookings()
    } else {
      setMachines([])
      setBookings([])
    }
  }, [currentUser, loadMachines, loadBookings])

  // auth functions

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password)
    localStorage.setItem('wt_token', data.token)
    localStorage.setItem('wt_session', JSON.stringify(data.user))
    setCurrentUser(data.user)
  }, [])

  const register = useCallback(async (name, email, password, role) => {
    await apiRegister(name, email, password, role)
    // after registering the caller redirects to /login
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('wt_token')
    localStorage.removeItem('wt_session')
    setCurrentUser(null)
  }, [])

  // machine functions

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

  // booking functions

  const createBooking = useCallback(async ({ machine_id, booking_date, start_time, end_time }) => {
    await apiCreateBooking(machine_id, booking_date, start_time, end_time)
    await loadBookings()
  }, [loadBookings])

  const cancelBooking = useCallback(async (booking_id) => {
    await apiCancelBooking(booking_id)
    await loadBookings()
  }, [loadBookings])

  // the API already filters bookings by the logged-in user
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
