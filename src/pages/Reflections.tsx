import { useState, useEffect, CSSProperties } from 'react'
import { AppLayout } from '../components/layout'
import { addJournalEntry, getJournalEntryByDate, getRecentJournalEntries } from '../utils/storage'
import type { JournalEntry } from '../data/types'

/**
 * Reflections Page - One Year App Clone
 *
 * Key features from One Year:
 * - Light gray background (not dark navy)
 * - Horizontal scrollable row of hand-drawn plants for recent days
 * - "today" pill badge at top, centered
 * - Hand-drawn circle + button in center with "plant memory" text
 * - Very minimal, lots of whitespace
 * - Bottom nav with two icons
 */

// Simple hand-drawn plant SVGs - style matches One Year's blue line drawings
const PlantSVGs: Record<string, JSX.Element> = {
  flower: (
    <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 48V28" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="18" r="8" stroke="#4F46E5" strokeWidth="2" fill="none"/>
      <circle cx="20" cy="18" r="3" fill="#4F46E5"/>
      <path d="M12 25c-4-2-5-8-2-12" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M28 25c4-2 5-8 2-12" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  tulip: (
    <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 48V24" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 8c-6 0-10 6-10 14h20c0-8-4-14-10-14z" stroke="#4F46E5" strokeWidth="2" fill="none"/>
      <path d="M14 20c0-6 3-10 6-11" stroke="#4F46E5" strokeWidth="1" opacity="0.5"/>
    </svg>
  ),
  mushroom: (
    <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 48V36h8v12" stroke="#4F46E5" strokeWidth="2"/>
      <path d="M6 36c0-12 6-20 14-20s14 8 14 20H6z" stroke="#4F46E5" strokeWidth="2" fill="none"/>
      <circle cx="14" cy="28" r="2" fill="#4F46E5"/>
      <circle cx="24" cy="26" r="2.5" fill="#4F46E5"/>
      <circle cx="20" cy="32" r="1.5" fill="#4F46E5"/>
    </svg>
  ),
  cherries: (
    <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 10c-4 8-12 12-12 24" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 10c4 8 12 12 12 24" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="8" cy="38" r="6" stroke="#4F46E5" strokeWidth="2" fill="none"/>
      <circle cx="32" cy="38" r="6" stroke="#4F46E5" strokeWidth="2" fill="none"/>
    </svg>
  ),
  tree: (
    <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 48V34h4v14" stroke="#4F46E5" strokeWidth="2"/>
      <path d="M20 6l-14 28h28L20 6z" stroke="#4F46E5" strokeWidth="2" fill="none"/>
      <path d="M20 12l-8 16h16L20 12z" stroke="#4F46E5" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
  fern: (
    <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 48V24" stroke="#4F46E5" strokeWidth="2"/>
      <path d="M20 24c-10-2-14-10-10-18 6 6 10 14 10 18z" stroke="#4F46E5" strokeWidth="2" fill="none"/>
      <path d="M20 30c10-2 14-10 10-18-6 6-10 14-10 18z" stroke="#4F46E5" strokeWidth="2" fill="none"/>
    </svg>
  ),
  sprout: (
    <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 48V32" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 32c-8-4-10-12-6-18 4 4 8 12 6 18z" stroke="#4F46E5" strokeWidth="2" fill="none"/>
      <path d="M20 32c8-4 10-12 6-18-4 4-8 12-6 18z" stroke="#4F46E5" strokeWidth="2" fill="none"/>
    </svg>
  ),
  grass: (
    <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 48c0-20 2-30 8-38" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 48c0-16 1-24 0-36" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
      <path d="M28 48c0-20-2-30-8-38" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

const plantKeys = Object.keys(PlantSVGs)

// Get consistent plant for a day
function getPlantForDay(dayOfYear: number): string {
  return plantKeys[dayOfYear % plantKeys.length]
}

// Get day of year
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Format date for display (like "01.11.2026")
function formatDateDisplay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()
  return `${month}.${day}.${year}`
}

// Get last N days
function getRecentDays(count: number): Date[] {
  const days: Date[] = []
  const today = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return days
}

export function ReflectionsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [entryText, setEntryText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [journalEntries, setJournalEntries] = useState<Record<string, JournalEntry>>({})

  const today = new Date()
  const todayStr = formatDate(today)
  const recentDays = getRecentDays(7) // Show last 7 days in horizontal row

  // Load journal entries
  useEffect(() => {
    getRecentJournalEntries(366).then(entries => {
      const byDate: Record<string, JournalEntry> = {}
      entries.forEach(e => {
        byDate[e.date] = e
      })
      setJournalEntries(byDate)
    })
  }, [])

  // Handle day click
  const handleDayClick = async (date: Date) => {
    const dateStr = formatDate(date)
    setSelectedDate(date)

    const entry = journalEntries[dateStr] || await getJournalEntryByDate(dateStr)
    if (entry) {
      setSelectedEntry(entry)
      setEntryText(entry.content)
    } else {
      setSelectedEntry(null)
      setEntryText('')
    }

    // Only allow editing today
    setIsEditing(dateStr === todayStr)
  }

  // Save entry
  const handleSave = async () => {
    if (!selectedDate || !entryText.trim()) return

    const dateStr = formatDate(selectedDate)
    const entry = await addJournalEntry(entryText.trim(), dateStr)

    setJournalEntries(prev => ({ ...prev, [dateStr]: entry }))
    setSelectedEntry(entry)
    setIsEditing(false)
  }

  // One Year style - light gray background
  const containerStyle: CSSProperties = {
    minHeight: '100vh',
    background: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'var(--space-lg)',
    paddingBottom: 100,
    width: '100%',
    maxWidth: 430,
    margin: '0 auto'
  }

  // "today" pill badge
  const dateBadgeStyle: CSSProperties = {
    background: 'white',
    border: '1px solid #e5e5e5',
    borderRadius: 20,
    padding: '8px 20px',
    fontSize: 'var(--text-sm)',
    color: '#333',
    fontWeight: 500,
    marginBottom: 'var(--space-lg)'
  }

  // Horizontal row of recent plants
  const plantRowStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-md)',
    marginBottom: 'var(--space-3xl)',
    overflowX: 'auto',
    padding: '0 var(--space-md)',
    width: '100%',
    justifyContent: 'center'
  }

  const plantItemStyle = (isSelected: boolean, hasEntry: boolean): CSSProperties => ({
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    opacity: hasEntry ? 1 : 0.3,
    transform: isSelected ? 'scale(1.2)' : 'scale(1)',
    transition: 'transform 0.2s ease'
  })

  // Main add button (hand-drawn circle with +)
  const addButtonContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-md)',
    marginTop: 'auto',
    marginBottom: 'auto'
  }

  const addButtonStyle: CSSProperties = {
    width: 80,
    height: 80,
    borderRadius: '50%',
    border: '2px solid #4F46E5',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 32,
    color: '#4F46E5',
    transition: 'transform 0.2s ease, background 0.2s ease'
  }

  const addButtonLabelStyle: CSSProperties = {
    color: '#4F46E5',
    fontSize: 'var(--text-md)',
    fontWeight: 400
  }

  // Entry panel
  const entryPanelStyle: CSSProperties = {
    position: 'fixed',
    bottom: 80,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - var(--space-md) * 2)',
    maxWidth: 'calc(430px - var(--space-md) * 2)',
    background: 'white',
    borderRadius: 16,
    padding: 'var(--space-lg)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    maxHeight: '50vh',
    overflow: 'auto'
  }

  const entryDateStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: '#666',
    marginBottom: 'var(--space-sm)'
  }

  const textareaStyle: CSSProperties = {
    width: '100%',
    minHeight: 120,
    padding: 'var(--space-md)',
    borderRadius: 12,
    border: '1px solid #e5e5e5',
    background: '#fafafa',
    color: '#333',
    fontSize: 'var(--text-md)',
    fontFamily: 'var(--font-body)',
    resize: 'none',
    outline: 'none'
  }

  const saveButtonStyle: CSSProperties = {
    marginTop: 'var(--space-md)',
    padding: 'var(--space-sm) var(--space-lg)',
    background: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: 24,
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 'var(--text-md)'
  }

  const closeButtonStyle: CSSProperties = {
    marginTop: 'var(--space-sm)',
    padding: 'var(--space-sm) var(--space-lg)',
    background: 'transparent',
    color: '#666',
    border: '1px solid #e5e5e5',
    borderRadius: 24,
    cursor: 'pointer',
    fontSize: 'var(--text-sm)'
  }

  const hasEntryToday = !!journalEntries[todayStr]

  return (
    <AppLayout showOrb={false}>
      <div style={containerStyle}>
        {/* Date badge - shows selected date or "today" */}
        <div style={dateBadgeStyle}>
          {selectedDate ? formatDateDisplay(selectedDate) : 'today'}
        </div>

        {/* Horizontal row of recent days with plants */}
        <div style={plantRowStyle}>
          {recentDays.map((day) => {
            const dateStr = formatDate(day)
            const hasEntry = !!journalEntries[dateStr]
            const isSelected = selectedDate && formatDate(selectedDate) === dateStr
            const dayOfYear = getDayOfYear(day)
            const plantKey = getPlantForDay(dayOfYear)

            return (
              <div
                key={dateStr}
                style={plantItemStyle(!!isSelected, hasEntry)}
                onClick={() => handleDayClick(day)}
                title={day.toLocaleDateString()}
              >
                {PlantSVGs[plantKey]}
              </div>
            )
          })}
        </div>

        {/* Main content area - either add button or entry panel */}
        {!selectedDate ? (
          <div style={addButtonContainerStyle}>
            <button
              style={addButtonStyle}
              onClick={() => handleDayClick(today)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.background = 'rgba(79, 70, 229, 0.05)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              +
            </button>
            <span style={addButtonLabelStyle}>
              {hasEntryToday ? 'no memory' : 'plant memory'}
            </span>
          </div>
        ) : (
          <div style={entryPanelStyle}>
            <div style={entryDateStyle}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </div>

            {isEditing ? (
              <>
                <textarea
                  style={textareaStyle}
                  value={entryText}
                  onChange={(e) => setEntryText(e.target.value)}
                  placeholder="what's on your mind today?"
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button style={saveButtonStyle} onClick={handleSave}>
                    plant memory 🌱
                  </button>
                  <button style={closeButtonStyle} onClick={() => setSelectedDate(null)}>
                    close
                  </button>
                </div>
              </>
            ) : (
              <>
                {selectedEntry ? (
                  <p style={{ color: '#333', fontSize: 'var(--text-md)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {selectedEntry.content}
                  </p>
                ) : (
                  <p style={{ color: '#999', fontSize: 'var(--text-md)' }}>
                    no memory planted this day
                  </p>
                )}
                <button style={closeButtonStyle} onClick={() => setSelectedDate(null)}>
                  close
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
