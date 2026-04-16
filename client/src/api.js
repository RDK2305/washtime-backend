// api.js — thin wrapper around native fetch
// All requests go to /api (proxied to :3000 in dev, same-origin in production)

const BASE = '/api'

function getToken() {
  return localStorage.getItem('wt_token')
}

function buildHeaders() {
  const h = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

async function request(method, path, body) {
  const options = {
    method,
    headers: buildHeaders(),
  }
  if (body !== undefined) {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(BASE + path, options)
  const data = await res.json()

  if (!res.ok) {
    // Prefer a message field, fall back to generic
    const msg = data.message || (data.errors && data.errors[0]?.msg) || 'Something went wrong.'
    throw new Error(msg)
  }

  return data
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export function apiLogin(email, password) {
  return request('POST', '/auth/login', { email, password })
}

export function apiRegister(name, email, password, role) {
  return request('POST', '/auth/register', { name, email, password, role })
}

// ── Machines ─────────────────────────────────────────────────────────────────

export function apiGetMachines() {
  return request('GET', '/machines')
}

export function apiAddMachine(machine_type, machine_number) {
  return request('POST', '/machines', { machine_type, machine_number })
}

export function apiUpdateMachine(id, updates) {
  return request('PUT', `/machines/${id}`, updates)
}

export function apiDeleteMachine(id) {
  return request('DELETE', `/machines/${id}`)
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export function apiGetBookings() {
  return request('GET', '/bookings')
}

export function apiGetAvailableSlots(machine_id, date) {
  return request('GET', `/bookings/available?machine_id=${machine_id}&date=${date}`)
}

export function apiCreateBooking(machine_id, booking_date, start_time, end_time) {
  return request('POST', '/bookings', { machine_id, booking_date, start_time, end_time })
}

export function apiCancelBooking(id) {
  return request('DELETE', `/bookings/${id}`)
}
