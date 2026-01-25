import { useState, useEffect, CSSProperties } from 'react'
import { getData, updateData } from '../../utils/storage'
import type { JournalEntry } from '../../data/types'

const MOODS = [
  { value: 'struggling', label: 'Struggling', color: '#94a3b8' },
  { value: 'okay', label: 'Okay', color: '#fbbf24' },
  { value: 'good', label: 'Good', color: '#4ade80' },
  { value: 'great', label: 'Great', color: '#f97316' }
] as const

type ViewMode = 'dots' | 'garden'

// Generate all days of a year with padding for week alignment
function getYearDays(year: number): (string | null)[] {
  const days: (string | null)[] = []

  // Get first day of year and its weekday
  const firstDay = new Date(year, 0, 1)
  const startWeekday = firstDay.getDay()

  // Pad start with nulls to align Jan 1 to correct column
  for (let i = 0; i < startWeekday; i++) {
    days.push(null)
  }

  // Add all days of the year
  const date = new Date(year, 0, 1)
  while (date.getFullYear() === year) {
    days.push(date.toISOString().split('T')[0])
    date.setDate(date.getDate() + 1)
  }

  return days
}

// Get month label for a given week row
function getMonthForRow(year: number, rowIndex: number): string | null {
  const firstDayOfRow = new Date(year, 0, 1)
  const startWeekday = firstDayOfRow.getDay()

  // Calculate the date range for this row
  const daysFromYearStart = rowIndex * 7 - startWeekday
  const rowStartDate = new Date(year, 0, 1 + daysFromYearStart)

  // Only show label if this row contains the 1st of a month
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(rowStartDate)
    checkDate.setDate(rowStartDate.getDate() + i)
    if (checkDate.getFullYear() === year && checkDate.getDate() === 1) {
      return checkDate.toLocaleDateString('en-US', { month: 'short' })
    }
  }
  return null
}

export function Garden() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [viewMode, setViewMode] = useState<ViewMode>('dots')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<JournalEntry['mood']>()
  const [isEditing, setIsEditing] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    async function loadEntries() {
      const data = await getData()
      setEntries(data.journalEntries || [])
    }
    loadEntries()
  }, [])

  const yearDays = getYearDays(selectedYear)
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const handleDayClick = (date: string | null) => {
    if (!date || date > todayStr) return
    const entry = entries.find(e => e.date === date)
    setSelectedDate(date)
    setContent(entry?.content || '')
    setMood(entry?.mood)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!selectedDate || !content.trim()) return

    const existingEntry = entries.find(e => e.date === selectedDate)
    const now = new Date().toISOString()

    await updateData(data => {
      const newEntries = [...(data.journalEntries || [])]

      if (existingEntry) {
        const index = newEntries.findIndex(e => e.id === existingEntry.id)
        newEntries[index] = {
          ...existingEntry,
          content: content.trim(),
          mood,
          updatedAt: now
        }
      } else {
        newEntries.push({
          id: crypto.randomUUID(),
          date: selectedDate,
          content: content.trim(),
          mood,
          createdAt: now,
          updatedAt: now
        })
      }

      return { ...data, journalEntries: newEntries }
    })

    const data = await getData()
    setEntries(data.journalEntries || [])
    setIsEditing(false)
    setSelectedDate(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedDate(null)
    setContent('')
    setMood(undefined)
  }

  // Styles
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    maxWidth: 400,
    margin: '0 auto'
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--space-sm)'
  }

  const yearNavStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)'
  }

  const navButtonStyle: CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-xs)',
    cursor: 'pointer',
    color: 'var(--text)',
    fontSize: 'var(--text-sm)',
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const viewToggleStyle: CSSProperties = {
    display: 'flex',
    gap: 2,
    background: 'var(--bg-alt)',
    borderRadius: 'var(--radius-sm)',
    padding: 2
  }

  const toggleButtonStyle = (active: boolean): CSSProperties => ({
    background: active ? 'var(--bg-card)' : 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-xs)',
    padding: 'var(--space-xs) var(--space-sm)',
    cursor: 'pointer',
    color: active ? 'var(--text)' : 'var(--text-muted)',
    fontSize: 'var(--text-xs)',
    fontWeight: active ? 500 : 400,
    transition: 'all var(--transition-fast)'
  })

  const gridContainerStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-xs)'
  }

  const monthLabelsStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    paddingTop: 20, // Offset for day headers
    width: 28,
    flexShrink: 0
  }

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 1,
    flex: 1
  }

  const dayHeaderStyle: CSSProperties = {
    fontSize: 9,
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '2px 0 4px'
  }

  const getCellStyle = (date: string | null): CSSProperties => {
    if (!date) {
      return {
        aspectRatio: '1',
        background: 'transparent'
      }
    }

    const entry = entries.find(e => e.date === date)
    const isToday = date === todayStr
    const isFuture = date > todayStr
    const moodData = entry?.mood ? MOODS.find(m => m.value === entry.mood) : null

    return {
      aspectRatio: '1',
      borderRadius: viewMode === 'dots' ? '50%' : 2,
      background: isFuture
        ? 'transparent'
        : entry
          ? moodData?.color || 'var(--orb-orange)'
          : 'var(--bg-alt)',
      border: isToday
        ? '2px solid var(--orb-orange)'
        : 'none',
      boxShadow: isToday
        ? '0 0 6px var(--orb-orange)'
        : 'none',
      cursor: isFuture ? 'default' : 'pointer',
      opacity: isFuture ? 0.15 : entry ? 1 : 0.3,
      transition: 'all var(--transition-fast)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 8
    }
  }

  const getPlantEmoji = (entry: JournalEntry | undefined): string => {
    if (!entry) return ''
    const mood = entry.mood
    if (mood === 'great') return '\u{1F33B}' // sunflower
    if (mood === 'good') return '\u{1F331}' // seedling
    if (mood === 'okay') return '\u{1F33F}' // herb
    if (mood === 'struggling') return '\u{1FAB4}' // potted plant
    return '\u{1F33F}' // default herb
  }

  const monthLabelRowStyle = (hasLabel: boolean): CSSProperties => ({
    height: 'calc((100% - 20px) / ' + Math.ceil(yearDays.length / 7) + ')',
    display: 'flex',
    alignItems: 'center',
    fontSize: 9,
    color: hasLabel ? 'var(--text-muted)' : 'transparent'
  })

  // Calculate number of rows for month labels
  const numRows = Math.ceil(yearDays.length / 7)

  // Editor view
  if (isEditing && selectedDate) {
    const dateObj = new Date(selectedDate + 'T12:00:00')
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })

    const textareaStyle: CSSProperties = {
      width: '100%',
      minHeight: 120,
      padding: 'var(--space-md)',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--text)',
      fontSize: 'var(--text-md)',
      fontFamily: 'var(--font-body)',
      resize: 'vertical',
      outline: 'none'
    }

    const moodSelectorStyle: CSSProperties = {
      display: 'flex',
      gap: 'var(--space-sm)',
      justifyContent: 'center',
      flexWrap: 'wrap'
    }

    const moodButtonStyle = (isSelected: boolean, color: string): CSSProperties => ({
      padding: 'var(--space-xs) var(--space-sm)',
      borderRadius: 'var(--radius-full)',
      border: `2px solid ${isSelected ? color : 'var(--border)'}`,
      background: isSelected ? color : 'transparent',
      color: isSelected ? 'white' : 'var(--text-muted)',
      cursor: 'pointer',
      fontSize: 'var(--text-sm)',
      transition: 'all var(--transition-fast)'
    })

    const actionButtonsStyle: CSSProperties = {
      display: 'flex',
      gap: 'var(--space-sm)',
      justifyContent: 'flex-end'
    }

    const buttonStyle = (variant: 'primary' | 'ghost'): CSSProperties => ({
      padding: 'var(--space-sm) var(--space-md)',
      borderRadius: 'var(--radius-md)',
      border: variant === 'primary' ? '2px solid var(--orb-orange)' : 'none',
      background: 'transparent',
      color: variant === 'primary' ? 'var(--orb-orange)' : 'var(--text-muted)',
      cursor: 'pointer',
      fontSize: 'var(--text-md)',
      fontFamily: 'var(--font-display)'
    })

    return (
      <div style={{ ...containerStyle, gap: 'var(--space-lg)' }}>
        <div style={{ textAlign: 'center' }}>
          <button
            style={{ ...navButtonStyle, width: 'auto', padding: 'var(--space-xs) var(--space-sm)' }}
            onClick={handleCancel}
          >
            Back to Year
          </button>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
            {formattedDate}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-xs)' }}>
            How are you feeling?
          </div>
          <div style={moodSelectorStyle}>
            {MOODS.map(m => (
              <button
                key={m.value}
                style={moodButtonStyle(mood === m.value, m.color)}
                onClick={() => setMood(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          style={textareaStyle}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? How was your day?"
          autoFocus
        />

        <div style={actionButtonsStyle}>
          <button style={buttonStyle('ghost')} onClick={handleCancel}>
            Cancel
          </button>
          <button style={buttonStyle('primary')} onClick={handleSave}>
            Save Entry
          </button>
        </div>
      </div>
    )
  }

  // Year grid view
  return (
    <div style={containerStyle}>
      {/* Header with year nav and view toggle */}
      <div style={headerStyle}>
        <div style={yearNavStyle}>
          <button
            style={navButtonStyle}
            onClick={() => setSelectedYear(y => y - 1)}
          >
            {'<'}
          </button>
          <span style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)', minWidth: 50, textAlign: 'center' }}>
            {selectedYear}
          </span>
          <button
            style={{ ...navButtonStyle, opacity: selectedYear >= currentYear ? 0.3 : 1 }}
            onClick={() => setSelectedYear(y => Math.min(currentYear, y + 1))}
            disabled={selectedYear >= currentYear}
          >
            {'>'}
          </button>
        </div>

        <div style={viewToggleStyle}>
          <button
            style={toggleButtonStyle(viewMode === 'dots')}
            onClick={() => setViewMode('dots')}
          >
            Dots
          </button>
          <button
            style={toggleButtonStyle(viewMode === 'garden')}
            onClick={() => setViewMode('garden')}
          >
            Garden
          </button>
        </div>
      </div>

      {/* Grid with month labels */}
      <div style={gridContainerStyle}>
        {/* Month labels column */}
        <div style={monthLabelsStyle}>
          {Array.from({ length: numRows }, (_, rowIndex) => {
            const monthLabel = getMonthForRow(selectedYear, rowIndex)
            return (
              <div key={rowIndex} style={monthLabelRowStyle(!!monthLabel)}>
                {monthLabel || '.'}
              </div>
            )
          })}
        </div>

        {/* Day grid */}
        <div style={gridStyle}>
          {/* Day headers */}
          {dayNames.map((day, i) => (
            <div key={i} style={dayHeaderStyle}>{day}</div>
          ))}

          {/* Day cells */}
          {yearDays.map((date, i) => {
            const entry = date ? entries.find(e => e.date === date) : undefined
            return (
              <div
                key={i}
                style={getCellStyle(date)}
                onClick={() => handleDayClick(date)}
                title={date || ''}
              >
                {viewMode === 'garden' && entry && (
                  <span style={{ fontSize: 8, lineHeight: 1 }}>
                    {getPlantEmoji(entry)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats summary */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        padding: '0 var(--space-sm)'
      }}>
        <span>
          {entries.filter(e => e.date.startsWith(String(selectedYear))).length} entries
        </span>
        <span>
          Tap any past day to write
        </span>
      </div>
    </div>
  )
}
