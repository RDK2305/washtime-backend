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
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { currentUser, machines, myBookings, navigate } = useApp()

  const today       = new Date().toISOString().split('T')[0]
  const active      = myBookings.filter((b) => b.status === 'Booked')
  const todaySlots  = active.filter((b) => b.booking_date === today)
  const activeMachines = machines.filter((m) => m.is_active)

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">
          {greeting()}, {currentUser.name.split(' ')[0]}!
        </h1>
        <p className="page-subtitle">
          Here's your laundry schedule at a glance.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Machines</div>
          <div className="stat-value c-primary">{activeMachines.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Your Active Bookings</div>
          <div className="stat-value c-success">{active.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today's Bookings</div>
          <div className="stat-value">{todaySlots.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Machines</div>
          <div className="stat-value">{machines.length}</div>
        </div>
      </div>

      {/* Machine Status */}
      <div className="card mb-2">
        <div className="card-header">
          <h2 className="card-title">Machine Status</h2>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('book')}>
            + Book a Slot
          </button>
        </div>
        <div className="card-body">
          {machines.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⚙️</div>
              <div className="empty-title">No machines configured</div>
            </div>
          ) : (
            <div className="machines-grid">
              {machines.map((m) => (
                <div
                  key={m.machine_id}
                  className={`machine-card ${!m.is_active ? 'offline' : ''}`}
                >
                  <span className="machine-icon">{getMachineIcon(m.machine_type)}</span>
                  <div className="machine-name">
                    {m.machine_type} {m.machine_number}
                  </div>
                  <div className="machine-sub">Machine ID: {m.machine_id}</div>
                  <span className={`badge ${m.is_active ? 'badge-success' : 'badge-muted'}`}>
                    <span className={`status-dot ${m.is_active ? 'on' : 'off'}`} />
                    {m.is_active ? 'Available' : 'Offline'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Today's Schedule</h2>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('myBookings')}
          >
            View All
          </button>
        </div>

        {todaySlots.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <div className="empty-title">No bookings today</div>
            <div className="empty-desc">
              You have no laundry scheduled for today.
            </div>
            <button className="btn btn-primary" onClick={() => navigate('book')}>
              Book a Slot Now
            </button>
          </div>
        ) : (
          <table className="bk-table">
            <thead>
              <tr>
                <th>Machine</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {todaySlots.map((b) => (
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
                      </div>
                    </div>
                  </td>
                  <td>{fmtDate(b.booking_date)}</td>
                  <td>
                    {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
                  </td>
                  <td>
                    <span className="badge badge-success">{b.status}</span>
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
