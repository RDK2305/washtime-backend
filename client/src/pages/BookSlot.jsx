import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import TimeSlotGrid, { computeEndTime, toMins, isTaken, HOURS } from '../components/TimeSlotGrid'
import { apiGetAvailableSlots } from '../api'

function getMachineIcon(type) {
  return type === 'Washer' ? '🫧' : '🌀'
}

function fmtDisplay(t) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`
}

function fmtLong(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function BookSlot() {
  const { machines, createBooking } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [selectedMachine, setMachine] = useState(null)
  const [selectedDate, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStart] = useState(null)
  const [endTime, setEnd] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [slotError, setSlotError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const activeMachines = machines.filter((m) => m.is_active)

  // Fetch taken slots from API whenever machine or date changes
  useEffect(() => {
    if (!selectedMachine) {
      setBookedSlots([])
      return
    }
    async function fetchSlots() {
      try {
        const data = await apiGetAvailableSlots(selectedMachine.machine_id, selectedDate)
        const raw = data.booked_slots || []
        // Normalize times because PostgreSQL returns HH:MM:SS but we only need HH:MM
        const normalized = raw.map((b) => ({
          ...b,
          start_time: b.start_time ? b.start_time.substring(0, 5) : b.start_time,
          end_time: b.end_time ? b.end_time.substring(0, 5) : b.end_time,
        }))
        setBookedSlots(normalized)
      } catch {
        setBookedSlots([])
      }
    }
    fetchSlots()
  }, [selectedMachine, selectedDate])

  // Step 1: user picks a machine
  function pickMachine(machine) {
    setMachine(machine)
    setStart(null)
    setEnd(null)
    setSlotError('')
    setSubmitError('')
    setStep(2)
  }

  // Step 2: user changes the date
  function handleDateChange(e) {
    setDate(e.target.value)
    setStart(null)
    setEnd(null)
    setSlotError('')
  }

  // Step 2: user clicks a time slot on the grid
  function handleSlotClick(slot) {
    setSlotError('')

    if (!startTime) {
      setStart(slot)
      setEnd(null)
      return
    }

    if (slot === startTime) {
      setStart(null)
      setEnd(null)
      return
    }

    if (toMins(slot) < toMins(startTime)) {
      setStart(slot)
      setEnd(null)
      return
    }

    const range = HOURS.filter(
      (s) => toMins(s) >= toMins(startTime) && toMins(s) <= toMins(slot)
    )
    if (range.some((s) => isTaken(s, bookedSlots))) {
      setSlotError('Your selection overlaps with a taken slot. Please try a different range.')
      return
    }

    setEnd(slot)
    setStep(3)
  }

  // Step 3: actually submit the booking
  async function handleConfirm() {
    setSubmitError('')
    setSubmitting(true)
    try {
      await createBooking({
        machine_id: selectedMachine.machine_id,
        booking_date: selectedDate,
        start_time: startTime,
        end_time: computeEndTime(endTime),
      })
      setSuccess(true)
    } catch (err) {
      setSubmitError(err.message)
      setStep(2)
    } finally {
      setSubmitting(false)
    }
  }

  // Show a success screen after the booking is saved
  if (success) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Booking Confirmed!</h1>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '.5rem' }}>
              You're all set
            </h2>
            <p className="text-muted mb-2">
              {selectedMachine.machine_type} {selectedMachine.machine_number} — {fmtLong(selectedDate)}<br />
              {fmtDisplay(startTime)} → {fmtDisplay(computeEndTime(endTime))}
            </p>
            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => {
                setStep(1); setMachine(null); setStart(null); setEnd(null); setSuccess(false)
              }}>
                Book Another
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Book a Laundry Slot</h1>
        <p className="page-subtitle">
          Choose your machine, pick a date, then select your time window.
        </p>
      </div>

      {/* Step indicator */}
      <div className="wizard">
        <div className="wizard-step">
          <div className={`step-num ${step > 1 ? 'done' : step === 1 ? 'active' : ''}`}>
            {step > 1 ? '✓' : '1'}
          </div>
          <span className={`step-text ${step === 1 ? 'active' : ''}`}>Machine</span>
        </div>
        <div className={`step-line ${step > 1 ? 'done' : ''}`} />
        <div className="wizard-step">
          <div className={`step-num ${step > 2 ? 'done' : step === 2 ? 'active' : ''}`}>
            {step > 2 ? '✓' : '2'}
          </div>
          <span className={`step-text ${step === 2 ? 'active' : ''}`}>Date &amp; Time</span>
        </div>
        <div className={`step-line ${step > 2 ? 'done' : ''}`} />
        <div className="wizard-step">
          <div className={`step-num ${step === 3 ? 'active' : ''}`}>3</div>
          <span className={`step-text ${step === 3 ? 'active' : ''}`}>Confirm</span>
        </div>
      </div>

      {submitError && <div className="alert alert-error mb-2">{submitError}</div>}

      {/* Step 1: pick machine */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Choose a Machine</h2>
            <span className="badge badge-primary">{activeMachines.length} Available</span>
          </div>
          <div className="card-body">
            {activeMachines.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⚙️</div>
                <div className="empty-title">No machines available</div>
                <div className="empty-desc">All machines are currently offline.</div>
              </div>
            ) : (
              <div className="machines-grid">
                {activeMachines.map((m) => (
                  <button
                    key={m.machine_id}
                    className="machine-card clickable"
                    style={{ border: 'none', width: '100%', background: 'var(--surface)' }}
                    onClick={() => pickMachine(m)}
                    type="button"
                  >
                    <span className="machine-icon">{getMachineIcon(m.machine_type)}</span>
                    <div className="machine-name">
                      {m.machine_type} {m.machine_number}
                    </div>
                    <div className="machine-sub">Click to select</div>
                    <span className="badge badge-success">
                      <span className="status-dot on" />
                      Active
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: pick date and time */}
      {step === 2 && selectedMachine && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                {getMachineIcon(selectedMachine.machine_type)}{' '}
                {selectedMachine.machine_type} {selectedMachine.machine_number}
              </h2>
              <p className="text-sm text-muted">Select your date and time window</p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setStep(1); setMachine(null); setStart(null); setEnd(null) }}
            >
              ← Change Machine
            </button>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label" htmlFor="bk-date">Booking Date</label>
              <input
                id="bk-date"
                className="form-control"
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleDateChange}
                style={{ maxWidth: '200px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Time Slot</label>
              <TimeSlotGrid
                bookedSlots={bookedSlots}
                startTime={startTime}
                endTime={endTime}
                onSlotClick={handleSlotClick}
                error={slotError}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: confirm the booking details before submitting */}
      {step === 3 && selectedMachine && startTime && endTime && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Review &amp; Confirm</h2>
          </div>
          <div className="card-body">
            <div className="confirm-box">
              <div className="confirm-icon">
                {getMachineIcon(selectedMachine.machine_type)}
              </div>
              <div className="confirm-name">
                {selectedMachine.machine_type} {selectedMachine.machine_number}
              </div>
              <div className="confirm-date">{fmtLong(selectedDate)}</div>
              <div className="confirm-time">
                {fmtDisplay(startTime)} → {fmtDisplay(computeEndTime(endTime))}
              </div>
            </div>

            <div className="confirm-btns">
              <button
                className="btn btn-ghost"
                onClick={() => { setStep(2); setEnd(null) }}
              >
                ← Go Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner spinner-white" />
                    Booking…
                  </>
                ) : (
                  '✓ Confirm Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
