// TimeSlotGrid — unique visual slot picker component
// Each block = 1 hour. User clicks start slot then end slot (inclusive).

const HOURS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00',
]

function toMins(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function fmt(t) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour}:${String(m).padStart(2, '0')}\n${ampm}`
}

function isTaken(slot, bookedSlots) {
  const s = toMins(slot)
  const e = s + 60
  return bookedSlots.some((b) => {
    const bs = toMins(b.start_time.substring(0, 5))
    const be = toMins(b.end_time.substring(0, 5))
    return s < be && bs < e
  })
}

export default function TimeSlotGrid({
  bookedSlots = [],
  startTime,
  endTime,
  onSlotClick,
  error,
}) {
  function getState(slot) {
    if (isTaken(slot, bookedSlots)) return 's-taken'
    if (!startTime) return 's-available'
    if (slot === startTime) return 's-selected'
    if (endTime) {
      if (slot === endTime) return 's-selected'
      if (toMins(slot) > toMins(startTime) && toMins(slot) < toMins(endTime))
        return 's-range'
    }
    return 's-available'
  }

  const instruction = !startTime
    ? 'Click a slot to set your start time.'
    : !endTime
    ? 'Now click an end slot (it will be included in your booking).'
    : `Selected: ${fmt(startTime).replace('\n', ' ')} → add 1 hr after end slot.`

  return (
    <div>
      <p className="slot-instruction">{instruction}</p>

      {error && <div className="alert alert-error mb-1">{error}</div>}

      <div className="slot-grid">
        {HOURS.map((slot) => {
          const state = getState(slot)
          return (
            <button
              key={slot}
              className={`time-slot ${state}`}
              onClick={() => onSlotClick(slot)}
              disabled={state === 's-taken'}
              type="button"
            >
              {fmt(slot)}
            </button>
          )
        })}
      </div>

      <div className="slot-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }} />
          Available
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#2563eb', borderColor: '#2563eb' }} />
          Selected
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#dbeafe', borderColor: '#2563eb' }} />
          In Range
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#fee2e2', borderColor: '#fecaca' }} />
          Taken
        </span>
      </div>
    </div>
  )
}

// Export helper so pages can compute the real end time
export function computeEndTime(endSlot) {
  const mins = toMins(endSlot) + 60
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export { HOURS, toMins, isTaken }
