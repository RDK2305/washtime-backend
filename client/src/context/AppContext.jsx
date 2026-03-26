import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { INITIAL_MACHINES, INITIAL_USERS, STORAGE_KEYS } from '../data/mockData'

const AppContext = createContext(null)

// ─── localStorage helpers ────────────────────────────────────────────────────

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Ensure seed data exists on first visit
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS))    save(STORAGE_KEYS.USERS,    INITIAL_USERS)
  if (!localStorage.getItem(STORAGE_KEYS.MACHINES)) save(STORAGE_KEYS.MACHINES, INITIAL_MACHINES)
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) save(STORAGE_KEYS.BOOKINGS, [])
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  initStorage()

  const [view, setView]         = useState('login')
  const [currentUser, setCurrentUser] = useState(() => load(STORAGE_KEYS.SESSION, null))
  const [machines, setMachinesState]  = useState(() => load(STORAGE_KEYS.MACHINES, INITIAL_MACHINES))
  const [bookings, setBookingsState]  = useState(() => load(STORAGE_KEYS.BOOKINGS, []))

  // Persist machines & bookings whenever they change
  useEffect(() => { save(STORAGE_KEYS.MACHINES, machines) }, [machines])
  useEffect(() => { save(STORAGE_KEYS.BOOKINGS, bookings) }, [bookings])

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser) setView('dashboard')
  }, [])

  // ── Navigation ─────────────────────────────────────────────────────────────
  const navigate = useCallback((target) => setView(target), [])

  // ── Auth ───────────────────────────────────────────────────────────────────
  const login = useCallback((email, password) => {
    const users = load(STORAGE_KEYS.USERS, [])
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!found) throw new Error('Invalid email or password.')
    const { password: _, ...safeUser } = found
    save(STORAGE_KEYS.SESSION, safeUser)
    setCurrentUser(safeUser)
    setView('dashboard')
  }, [])

  const register = useCallback((name, email, password, role) => {
    const users = load(STORAGE_KEYS.USERS, [])
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.')
    }
    const newUser = {
      user_id: Date.now(),
      name,
      email,
      password,
      role: role || 'Resident',
    }
    const updated = [...users, newUser]
    save(STORAGE_KEYS.USERS, updated)
    const { password: _, ...safeUser } = newUser
    save(STORAGE_KEYS.SESSION, safeUser)
    setCurrentUser(safeUser)
    setView('dashboard')
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.SESSION)
    setCurrentUser(null)
    setView('login')
  }, [])

  // ── Machines (Admin) ───────────────────────────────────────────────────────
  const addMachine = useCallback((machine_type, machine_number) => {
    const newMachine = {
      machine_id: Date.now(),
      machine_type,
      machine_number,
      is_active: true,
    }
    setMachinesState((prev) => [...prev, newMachine])
  }, [])

  const toggleMachine = useCallback((machine_id) => {
    setMachinesState((prev) =>
      prev.map((m) =>
        m.machine_id === machine_id ? { ...m, is_active: !m.is_active } : m
      )
    )
  }, [])

  const deleteMachine = useCallback((machine_id) => {
    setMachinesState((prev) => prev.filter((m) => m.machine_id !== machine_id))
  }, [])

  // ── Bookings ───────────────────────────────────────────────────────────────
  const createBooking = useCallback(
    ({ machine_id, booking_date, start_time, end_time }) => {
      const machine = machines.find((m) => m.machine_id === machine_id)
      if (!machine || !machine.is_active)
        throw new Error('Machine not found or offline.')

      // Check for time conflicts on the same machine + date
      const conflict = bookings.find(
        (b) =>
          b.machine_id === machine_id &&
          b.booking_date === booking_date &&
          b.status === 'Booked' &&
          b.start_time < end_time &&
          b.end_time > start_time
      )
      if (conflict) throw new Error('This time slot overlaps with an existing booking.')

      const newBooking = {
        booking_id: Date.now(),
        user_id: currentUser.user_id,
        machine_id,
        machine_type: machine.machine_type,
        machine_number: machine.machine_number,
        booking_date,
        start_time,
        end_time,
        status: 'Booked',
        created_at: new Date().toISOString(),
      }
      setBookingsState((prev) => [newBooking, ...prev])
    },
    [machines, bookings, currentUser]
  )

  const cancelBooking = useCallback((booking_id) => {
    setBookingsState((prev) =>
      prev.map((b) =>
        b.booking_id === booking_id ? { ...b, status: 'Cancelled' } : b
      )
    )
  }, [])

  // ── Derived data ───────────────────────────────────────────────────────────
  const myBookings = currentUser
    ? bookings.filter((b) => b.user_id === currentUser.user_id)
    : []

  const getBookedSlots = useCallback(
    (machine_id, date) =>
      bookings.filter(
        (b) =>
          b.machine_id === machine_id &&
          b.booking_date === date &&
          b.status === 'Booked'
      ),
    [bookings]
  )

  return (
    <AppContext.Provider
      value={{
        view,
        navigate,
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
        getBookedSlots,
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
