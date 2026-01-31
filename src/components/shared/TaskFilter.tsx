import { CSSProperties } from 'react'
import type { TimeOfDay } from '../../data/types'
import type { TaskFilters } from '../../hooks/useTasks'

interface TaskFilterProps {
  filters: TaskFilters
  onChange: (filters: TaskFilters) => void
  showDay?: boolean
  showTimeOfDay?: boolean
  showMonth?: boolean
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const DAY_OPTIONS: { value: TaskFilters['day']; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'week', label: 'This Week' }
]

const TIME_OPTIONS: { value: TimeOfDay | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' }
]

export function TaskFilter({
  filters,
  onChange,
  showDay = true,
  showTimeOfDay = true,
  showMonth = false
}: TaskFilterProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-sm)',
    marginBottom: 'var(--space-md)'
  }

  const groupStyle: CSSProperties = {
    display: 'flex',
    gap: '4px',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    padding: '4px',
    border: '1px solid var(--border)'
  }

  const chipStyle = (isActive: boolean): CSSProperties => ({
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-xs)',
    fontWeight: 500,
    background: isActive ? 'var(--orb-orange)' : 'transparent',
    color: isActive ? 'white' : 'var(--text-muted)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap'
  })

  const currentMonth = new Date().getMonth()

  return (
    <div style={containerStyle}>
      {showDay && (
        <div style={groupStyle}>
          {DAY_OPTIONS.map(option => (
            <button
              key={option.label}
              style={chipStyle(filters.day === option.value)}
              onClick={() => onChange({ ...filters, day: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {showTimeOfDay && (
        <div style={groupStyle}>
          {TIME_OPTIONS.map(option => (
            <button
              key={option.label}
              style={chipStyle(filters.timeOfDay === option.value)}
              onClick={() => onChange({ ...filters, timeOfDay: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {showMonth && (
        <div style={groupStyle}>
          <button
            style={chipStyle(filters.month === undefined)}
            onClick={() => onChange({ ...filters, month: undefined })}
          >
            All
          </button>
          {[-1, 0, 1].map(offset => {
            const monthIndex = (currentMonth + offset + 12) % 12
            return (
              <button
                key={monthIndex}
                style={chipStyle(filters.month === monthIndex)}
                onClick={() => onChange({ ...filters, month: monthIndex })}
              >
                {MONTHS[monthIndex]}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
