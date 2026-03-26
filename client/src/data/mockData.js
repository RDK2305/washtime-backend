// Initial seed data — loaded into localStorage on first run

export const INITIAL_MACHINES = [
  { machine_id: 1, machine_type: 'Washer', machine_number: 'W1', is_active: true },
  { machine_id: 2, machine_type: 'Washer', machine_number: 'W2', is_active: true },
  { machine_id: 3, machine_type: 'Dryer',  machine_number: 'D1', is_active: true },
  { machine_id: 4, machine_type: 'Dryer',  machine_number: 'D2', is_active: false },
]

// Pre-seeded admin account — password stored as plain text for demo purposes only
export const INITIAL_USERS = [
  {
    user_id: 1,
    name: 'Admin User',
    email: 'admin@washtime.com',
    password: 'admin123',
    role: 'Admin',
  },
]

export const STORAGE_KEYS = {
  USERS:    'wt_users',
  MACHINES: 'wt_machines',
  BOOKINGS: 'wt_bookings',
  SESSION:  'wt_session',
}
