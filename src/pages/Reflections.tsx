import { useState, useEffect, CSSProperties } from 'react'
import { addJournalEntry, getJournalEntryByDate, getRecentJournalEntries } from '../utils/storage'
import type { JournalEntry } from '../data/types'

/**
 * Reflections Page - One Year App Clone
 * A garden that grows with your memories
 * - Dark navy background
 * - 365 day grid (one cell per day)
 * - Hand-drawn plants on days with entries
 * - Tap to view/edit memories
 */

// Simple hand-drawn plant SVGs
const PlantSVGs = {
  flower1: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 38V22" stroke="#8B9A46" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="15" r="6" fill="#F4A261"/>
      <circle cx="20" cy="15" r="3" fill="#E9C46A"/>
      <path d="M14 22c-3-2-4-6-2-9" stroke="#8B9A46" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M26 22c3-2 4-6 2-9" stroke="#8B9A46" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  tulip: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 38V20" stroke="#6B8E23" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 8c-4 0-7 4-7 10h14c0-6-3-10-7-10z" fill="#E76F51"/>
      <path d="M15 18c0-4 2-7 5-8" stroke="#E76F51" strokeWidth="1" opacity="0.5"/>
    </svg>
  ),
  sprout: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 38V28" stroke="#6B8E23" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 28c-5-3-6-8-4-12 3 2 6 6 4 12z" fill="#8B9A46"/>
      <path d="M20 28c5-3 6-8 4-12-3 2-6 6-4 12z" fill="#9CAF45"/>
    </svg>
  ),
  daisy: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 38V22" stroke="#6B8E23" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="14" r="4" fill="#E9C46A"/>
      <ellipse cx="20" cy="6" rx="3" ry="5" fill="white"/>
      <ellipse cx="12" cy="14" rx="5" ry="3" fill="white"/>
      <ellipse cx="28" cy="14" rx="5" ry="3" fill="white"/>
      <ellipse cx="20" cy="22" rx="3" ry="5" fill="white"/>
    </svg>
  ),
  mushroom: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 38V28h6v10" stroke="#D4A574" strokeWidth="2" fill="#E8D4B8"/>
      <path d="M8 28c0-8 5-14 12-14s12 6 12 14H8z" fill="#E76F51"/>
      <circle cx="14" cy="22" r="2" fill="white" opacity="0.8"/>
      <circle cx="24" cy="20" r="2.5" fill="white" opacity="0.8"/>
      <circle cx="20" cy="25" r="1.5" fill="white" opacity="0.8"/>
    </svg>
  ),
  cactus: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="14" width="8" height="24" rx="4" fill="#6B8E23"/>
      <rect x="6" y="22" width="10" height="6" rx="3" fill="#8B9A46"/>
      <rect x="24" y="18" width="10" height="6" rx="3" fill="#8B9A46"/>
    </svg>
  ),
  tree: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 38V26h4v12" fill="#8B7355"/>
      <path d="M20 6l-12 20h24L20 6z" fill="#6B8E23"/>
      <path d="M20 10l-8 12h16L20 10z" fill="#8B9A46"/>
    </svg>
  ),
  fern: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 38V20" stroke="#6B8E23" strokeWidth="2"/>
      <path d="M20 20c-8-2-10-8-8-14 4 4 8 10 8 14z" fill="#8B9A46"/>
      <path d="M20 25c8-2 10-8 8-14-4 4-8 10-8 14z" fill="#6B8E23"/>
      <path d="M20 30c-6-1-8-5-6-10 3 3 6 7 6 10z" fill="#9CAF45"/>
    </svg>
  )
}

const plantKeys = Object.keys(PlantSVGs) as (keyof typeof PlantSVGs)[]

// Get a consistent plant for a given day
function getPlantForDay(dayOfYear: number): keyof typeof PlantSVGs {
  return plantKeys[dayOfYear % plantKeys.length]
}

// Get day of year (1-366)
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// Generate all days of the year
function generateYearDays(year: number): Date[] {
  const days: Date[] = []
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d))
  }
  return days
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function ReflectionsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [entryText, setEntryText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [journalEntries, setJournalEntries] = useState<Record<string, JournalEntry>>({})
  const [year] = useState(new Date().getFullYear())

  const today = new Date()
  const todayStr = formatDate(today)
  const yearDays = generateYearDays(year)

  // Load all journal entries
  useEffect(() => {
    getRecentJournalEntries(366).then(entries => {
      const byDate: Record<string, JournalEntry> = {}
      entries.forEach(e => {
        byDate[e.date] = e
      })
      setJournalEntries(byDate)
    })
  }, [])

  // Handle day selection
  const handleDayClick = async (date: Date) => {
    const dateStr = formatDate(date)
    setSelectedDate(date)
    
    // Check if entry exists
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

  // Container style - dark navy background like One Year
  const containerStyle: CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #1a1f3c 0%, #0f1225 100%)',
    padding: 'var(--space-md)',
    paddingBottom: 100 // Space for nav
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-lg)',
    color: 'white'
  }

  const titleStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.9)'
  }

  const yearStyle: CSSProperties = {
    fontSize: 'var(--text-lg)',
    color: 'rgba(255, 255, 255, 0.6)'
  }

  // Grid style - 7 columns for days of week, rows for weeks
  const gridContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginBottom: 'var(--space-lg)'
  }

  const weekRowStyle: CSSProperties = {
    display: 'flex',
    gap: '2px',
    justifyContent: 'center'
  }

  const dayStyle = (isToday: boolean, isSelected: boolean): CSSProperties => ({
    width: 40,
    height: 40,
    borderRadius: 8,
    background: isSelected 
      ? 'rgba(244, 162, 97, 0.3)' 
      : isToday 
        ? 'rgba(244, 162, 97, 0.2)'
        : 'rgba(255, 255, 255, 0.05)',
    border: isToday ? '2px solid var(--orb-orange)' : '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    overflow: 'hidden'
  })

  const dotStyle: CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)'
  }

  const plantContainerStyle: CSSProperties = {
    width: 32,
    height: 32
  }

  // Entry display at bottom
  const entryPanelStyle: CSSProperties = {
    position: 'fixed',
    bottom: 80,
    left: 'var(--space-md)',
    right: 'var(--space-md)',
    background: 'rgba(26, 31, 60, 0.95)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-md)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    maxHeight: '40vh',
    overflow: 'auto'
  }

  const entryDateStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 'var(--space-sm)'
  }

  const entryTextStyle: CSSProperties = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 'var(--text-md)',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap'
  }

  const textareaStyle: CSSProperties = {
    width: '100%',
    minHeight: 100,
    padding: 'var(--space-sm)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'white',
    fontSize: 'var(--text-md)',
    fontFamily: 'var(--font-body)',
    resize: 'vertical'
  }

  const buttonStyle: CSSProperties = {
    marginTop: 'var(--space-sm)',
    padding: 'var(--space-sm) var(--space-md)',
    background: 'var(--orb-orange)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: 500
  }

  // Plant today button (always visible)
  const plantButtonStyle: CSSProperties = {
    position: 'fixed',
    bottom: selectedDate ? 'calc(40vh + 100px)' : 100,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: 'var(--space-sm) var(--space-lg)',
    background: 'var(--orb-orange)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 'var(--text-sm)',
    boxShadow: '0 4px 20px rgba(244, 162, 97, 0.4)',
    transition: 'all 0.2s ease'
  }

  // Group days by week
  const weeks: Date[][] = []
  let currentWeek: Date[] = []
  
  yearDays.forEach((day, i) => {
    currentWeek.push(day)
    if (day.getDay() === 6 || i === yearDays.length - 1) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <span style={titleStyle}>your garden</span>
        <span style={yearStyle}>{year}</span>
      </header>

      <div style={gridContainerStyle}>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} style={weekRowStyle}>
            {week.map((day) => {
              const dateStr = formatDate(day)
              const hasEntry = !!journalEntries[dateStr]
              const isToday = dateStr === todayStr
              const isSelected = selectedDate && formatDate(selectedDate) === dateStr
              const dayOfYear = getDayOfYear(day)
              
              return (
                <div
                  key={dateStr}
                  style={dayStyle(isToday, !!isSelected)}
                  onClick={() => handleDayClick(day)}
                  title={day.toLocaleDateString()}
                >
                  {hasEntry ? (
                    <div style={plantContainerStyle}>
                      {PlantSVGs[getPlantForDay(dayOfYear)]}
                    </div>
                  ) : (
                    <div style={dotStyle} />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Entry panel - shows when day selected */}
      {selectedDate && (
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
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button style={buttonStyle} onClick={handleSave}>
                  plant memory 🌱
                </button>
                <button 
                  style={{ ...buttonStyle, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
                  onClick={() => setSelectedDate(null)}
                >
                  close
                </button>
              </div>
            </>
          ) : (
            <>
              {selectedEntry ? (
                <p style={entryTextStyle}>{selectedEntry.content}</p>
              ) : (
                <p style={{ ...entryTextStyle, opacity: 0.5 }}>
                  no memory planted this day
                </p>
              )}
              <button 
                style={{ ...buttonStyle, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
                onClick={() => setSelectedDate(null)}
              >
                close
              </button>
            </>
          )}
        </div>
      )}

      {/* Plant today button - only show if not already viewing entry */}
      {!selectedDate && !journalEntries[todayStr] && (
        <button 
          style={plantButtonStyle}
          onClick={() => handleDayClick(today)}
        >
          plant today's memory 🌱
        </button>
      )}
    </div>
  )
}
