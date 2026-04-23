// api.js — all fetch calls to the backend go through here
// The base URL is /api which Vite proxies to port 3000 in dev

const BASE = '/api'

function getToken() {
  return localStorage.getItem('wt_token')
}

// Attaches the JWT so the server knows who is making the request
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
    // Try to grab a useful message from the response, otherwise fall back
    const msg = data.message || (data.errors && data.errors[0]?.msg) || 'Something went wrong.'
    throw new Error(msg)
  }

  return data
}

// auth

export function apiLogin(email, password) {
  return request('POST', '/auth/login', { email, password })
}

export function apiRegister(name, email, password, role) {
  return request('POST', '/auth/register', { name, email, password, role })
}

// machines

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

// bookings

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
