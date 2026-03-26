import { useState } from 'react'
import { useApp } from '../context/AppContext'

function getMachineIcon(type) {
  return type === 'Washer' ? '🫧' : '🌀'
}

function fmtTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`
}

function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function MyBookings() {
  const { myBookings, cancelBooking, navigate } = useApp()
  const [filter, setFilter]   = useState('All')
  const [cancelling, setCancelling] = useState(null)

  const counts = {
    All:       myBookings.length,
    Booked:    myBookings.filter((b) => b.status === 'Booked').length,
    Cancelled: myBookings.filter((b) => b.status === 'Cancelled').length,
  }

  const displayed =
    filter === 'All' ? myBookings : myBookings.filter((b) => b.status === filter)

  function handleCancel(id) {
    if (!window.confirm('Cancel this booking?')) return
    setCancelling(id)
    setTimeout(() => {
      cancelBooking(id)
      setCancelling(null)
    }, 300)
  }

  return (
    <div>
      {/* Header */}
      <div
        className="page-header flex flex-between flex-center flex-wrap gap-md"
        style={{ marginBottom: '1.75rem' }}
      >
        <div>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Manage all your laundry slot reservations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('book')}>
          + New Booking
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['All', 'Booked', 'Cancelled'].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        {displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No bookings found</div>
            <div className="empty-desc">
              {filter === 'All'
                ? "You haven't made any bookings yet."
                : `No ${filter.toLowerCase()} bookings.`}
            </div>
            {filter === 'All' && (
              <button className="btn btn-primary" onClick={() => navigate('book')}>
                Book Your First Slot
              </button>
            )}
          </div>
        ) : (
          <table className="bk-table">
            <thead>
              <tr>
                <th>Machine</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((b) => (
                <tr key={b.booking_id}>
                  <td>
                    <div className="bk-machine-cell">
                      <span className="bk-machine-icon">
                        {getMachineIcon(b.machine_type)}
                      </span>
                      <div>
                        <div className="fw-700">
                          {b.machine_type} {b.machine_number}
                        </div>
                        <div className="text-xs text-muted">ID: {b.machine_id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{fmtDate(b.booking_date)}</td>
                  <td>
                    <span className="fw-700">{fmtTime(b.start_time)}</span>
                    <span className="text-muted"> – </span>
                    <span className="fw-700">{fmtTime(b.end_time)}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        b.status === 'Booked' ? 'badge-success' : 'badge-muted'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td>
                    {b.status === 'Booked' ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(b.booking_id)}
                        disabled={cancelling === b.booking_id}
                      >
                        {cancelling === b.booking_id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    ) : (
                      <span className="text-muted text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
