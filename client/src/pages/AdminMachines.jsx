import { useState } from 'react'
import { useApp } from '../context/AppContext'

function getMachineIcon(type) {
  return type === 'Washer' ? '🫧' : '🌀'
}

export default function AdminMachines() {
  const { machines, addMachine, toggleMachine, deleteMachine } = useApp()

  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ machine_type: 'Washer', machine_number: '' })
  const [formError, setFormError] = useState('')
  const [toast, setToast]         = useState('')

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  function handleAdd(e) {
    e.preventDefault()
    setFormError('')

    const num = form.machine_number.trim()
    if (!num) return setFormError('Machine number is required.')
    if (machines.find(
      (m) => m.machine_number === num && m.machine_type === form.machine_type
    )) {
      return setFormError(`${form.machine_type} ${num} already exists.`)
    }

    addMachine(form.machine_type, num)
    setForm({ machine_type: 'Washer', machine_number: '' })
    setShowForm(false)
    showToast(`${form.machine_type} ${num} added successfully.`)
  }

  function handleToggle(machine) {
    toggleMachine(machine.machine_id)
    showToast(
      `${machine.machine_type} ${machine.machine_number} is now ${
        machine.is_active ? 'offline' : 'active'
      }.`
    )
  }

  function handleDelete(machine) {
    if (
      !window.confirm(
        `Delete ${machine.machine_type} ${machine.machine_number}? This cannot be undone.`
      )
    )
      return
    deleteMachine(machine.machine_id)
    showToast(`${machine.machine_type} ${machine.machine_number} deleted.`)
  }

  const activeCount   = machines.filter((m) => m.is_active).length
  const offlineCount  = machines.filter((m) => !m.is_active).length

  return (
    <div>
      {/* Header */}
      <div
        className="page-header flex flex-between flex-center flex-wrap gap-md"
        style={{ marginBottom: '1.75rem' }}
      >
        <div>
          <h1 className="page-title">Machine Management</h1>
          <p className="page-subtitle">
            Admin panel — add, configure, and manage laundry machines.
          </p>
        </div>
        <button
          className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => { setShowForm((v) => !v); setFormError('') }}
        >
          {showForm ? '✕ Close Form' : '+ Add Machine'}
        </button>
      </div>

      {/* Toast */}
      {toast && <div className="alert alert-success mb-2">{toast}</div>}

      {/* Add Machine Panel */}
      {showForm && (
        <div className="add-machine-panel mb-2">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>New Machine</h3>
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handleAdd} noValidate>
            <div className="add-machine-row">
              <div className="form-group">
                <label className="form-label" htmlFor="am-type">Machine Type</label>
                <select
                  id="am-type"
                  className="form-control"
                  name="machine_type"
                  value={form.machine_type}
                  onChange={handleChange}
                >
                  <option value="Washer">Washer</option>
                  <option value="Dryer">Dryer</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="am-num">Machine Number</label>
                <input
                  id="am-num"
                  className="form-control"
                  name="machine_number"
                  placeholder="e.g. W3, D3"
                  value={form.machine_number}
                  onChange={handleChange}
                />
              </div>
              <button className="btn btn-success" type="submit">
                Add Machine
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Machine Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Machines ({machines.length})</h2>
          <div className="flex gap-sm">
            <span className="badge badge-success">{activeCount} Active</span>
            <span className="badge badge-muted">{offlineCount} Offline</span>
          </div>
        </div>

        {machines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚙️</div>
            <div className="empty-title">No machines yet</div>
            <div className="empty-desc">
              Add your first laundry machine using the button above.
            </div>
          </div>
        ) : (
          <table className="bk-table">
            <thead>
              <tr>
                <th>Machine</th>
                <th>Type</th>
                <th>Number</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((m) => (
                <tr key={m.machine_id}>
                  <td>
                    <div className="bk-machine-cell">
                      <span className="bk-machine-icon">
                        {getMachineIcon(m.machine_type)}
                      </span>
                      <div>
                        <div className="fw-700">
                          {m.machine_type} {m.machine_number}
                        </div>
                        <div className="text-xs text-muted">ID: {m.machine_id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{m.machine_type}</td>
                  <td>{m.machine_number}</td>
                  <td>
                    {/* Toggle switch — demonstrates controlled form input */}
                    <label className="toggle" title="Toggle active status">
                      <input
                        type="checkbox"
                        checked={m.is_active}
                        onChange={() => handleToggle(m)}
                      />
                      <span className="toggle-track" />
                      <span className="toggle-thumb" />
                    </label>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(m)}
                    >
                      Delete
                    </button>
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
