import { useState, useEffect, useCallback } from 'react'
import { getData, updateData } from '../../utils/storage'
import { getPlantForDay, getDayOfYear, SEED_SVG } from './plants'
import type { JournalEntry } from '../../data/types'
import './Garden.css'

// Word limit for entries (intentional constraint)
const WORD_LIMIT = 50

type ViewMode = 'dots' | 'garden'
type DaysDisplay = 'passed' | 'left'

// Generate all days of a year with padding for week alignment
function getYearDays(year: number): (string | null)[] {
  const days: (string | null)[] = []
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

// Count words in text
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

export function Garden() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [viewMode, setViewMode] = useState<ViewMode>('garden')
  const [daysDisplay, setDaysDisplay] = useState<DaysDisplay>('left')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const currentYear = new Date().getFullYear()
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  useEffect(() => {
    async function loadEntries() {
      const data = await getData()
      setEntries(data.journalEntries || [])
    }
    loadEntries()
  }, [])

  const yearDays = getYearDays(selectedYear)
  const yearEntries = entries.filter(e => e.date.startsWith(String(selectedYear)))

  // Calculate days passed/left
  const getDaysInfo = useCallback(() => {
    if (selectedYear !== currentYear) {
      return { passed: 365, left: 0 }
    }
    const start = new Date(currentYear, 0, 1)
    const today = new Date()
    const passed = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const totalDays = new Date(currentYear, 11, 31).getDate() === 31 ? 365 : 366
    return { passed, left: totalDays - passed }
  }, [selectedYear, currentYear])

  const daysInfo = getDaysInfo()

  const handleDayClick = (date: string | null) => {
    if (!date || date !== todayStr) return
    const entry = entries.find(e => e.date === date)
    setSelectedDate(date)
    setContent(entry?.content || '')
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!selectedDate || !content.trim()) return

    setIsSaving(true)

    const existingEntry = entries.find(e => e.date === selectedDate)
    const now = new Date().toISOString()

    await updateData(data => {
      const newEntries = [...(data.journalEntries || [])]

      if (existingEntry) {
        const index = newEntries.findIndex(e => e.id === existingEntry.id)
        newEntries[index] = {
          ...existingEntry,
          content: content.trim(),
          updatedAt: now
        }
      } else {
        newEntries.push({
          id: crypto.randomUUID(),
          date: selectedDate,
          content: content.trim(),
          createdAt: now,
          updatedAt: now
        })
      }

      return { ...data, journalEntries: newEntries }
    })

    const data = await getData()
    setEntries(data.journalEntries || [])

    // Brief delay for save animation
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
      setSelectedDate(null)
    }, 400)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedDate(null)
    setContent('')
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    const words = countWords(newContent)
    // Allow typing but enforce limit
    if (words <= WORD_LIMIT) {
      setContent(newContent)
    }
  }

  // Get month label for first day of month
  const getMonthLabel = (index: number): string | null => {
    const date = yearDays[index]
    if (!date) return null
    const d = new Date(date)
    if (d.getDate() === 1) {
      return d.toLocaleDateString('en-US', { month: 'short' })
    }
    return null
  }

  // Get plant for a specific day
  const getPlantSvg = (dateStr: string) => {
    const dayOfYear = getDayOfYear(dateStr)
    const plant = getPlantForDay(dayOfYear)
    return plant.svg
  }

  // Editor view
  if (isEditing && selectedDate) {
    const dateObj = new Date(selectedDate + 'T12:00:00')
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })

    const dayOfYear = getDayOfYear(selectedDate)
    const plant = getPlantForDay(dayOfYear)
    const wordCount = countWords(content)
    const hasEntry = entries.some(e => e.date === selectedDate)

    const getWordCountClass = () => {
      if (wordCount >= WORD_LIMIT) return 'garden-word-counter at-limit'
      if (wordCount >= WORD_LIMIT - 10) return 'garden-word-counter near-limit'
      return 'garden-word-counter'
    }

    return (
      <div className="garden-editor">
        <div className="garden-editor-header">
          <button className="garden-editor-back" onClick={handleCancel}>
            Back
          </button>
          <h2 className="garden-editor-date">{formattedDate}</h2>
        </div>

        <div className="garden-editor-preview">
          <div
            className="garden-editor-plant"
            dangerouslySetInnerHTML={{ __html: plant.svg }}
          />
        </div>

        <p style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 'var(--text-sm)',
          marginTop: 'calc(-1 * var(--space-md))'
        }}>
          {hasEntry ? 'Update your memory' : 'Plant a memory'}
        </p>

        <div className="garden-textarea-container">
          <textarea
            className="garden-textarea"
            value={content}
            onChange={handleContentChange}
            placeholder="What made today meaningful?"
            autoFocus
          />
          <span className={getWordCountClass()}>
            {wordCount}/{WORD_LIMIT}
          </span>
        </div>

        <div className="garden-editor-actions">
          <button className="garden-btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className={`garden-btn-save ${isSaving ? 'saving' : ''}`}
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
          >
            {isSaving ? 'Planting...' : 'Plant Memory'}
          </button>
        </div>
      </div>
    )
  }

  // Year grid view
  const hasTodayEntry = entries.some(e => e.date === todayStr)

  return (
    <div className="garden-container">
      {/* Header */}
      <div className="garden-header">
        <div className="garden-year-nav">
          <button
            className="garden-year-btn"
            onClick={() => setSelectedYear(y => y - 1)}
          >
            &lsaquo;
          </button>
          <span className="garden-year-label">{selectedYear}</span>
          <button
            className="garden-year-btn"
            onClick={() => setSelectedYear(y => Math.min(currentYear, y + 1))}
            disabled={selectedYear >= currentYear}
          >
            &rsaquo;
          </button>
        </div>

        <div className="garden-theme-toggle">
          <button
            className={`garden-theme-btn ${viewMode === 'dots' ? 'active' : ''}`}
            onClick={() => setViewMode('dots')}
          >
            Dots
          </button>
          <button
            className={`garden-theme-btn ${viewMode === 'garden' ? 'active' : ''}`}
            onClick={() => setViewMode('garden')}
          >
            Garden
          </button>
        </div>
      </div>

      {/* Days counter */}
      <div className="garden-days-counter">
        {daysDisplay === 'left' ? (
          <>
            <strong>{daysInfo.left}</strong> days left in {selectedYear}
          </>
        ) : (
          <>
            <strong>{daysInfo.passed}</strong> days passed in {selectedYear}
          </>
        )}
        <button
          className="garden-days-toggle"
          onClick={() => setDaysDisplay(d => d === 'left' ? 'passed' : 'left')}
        >
          (show {daysDisplay === 'left' ? 'passed' : 'left'})
        </button>
      </div>

      {/* Day headers */}
      <div className="garden-grid-header">
        {dayNames.map((day, i) => (
          <div key={i} className="garden-day-label">
            {day}
          </div>
        ))}
      </div>

      {/* Year grid */}
      <div className="garden-grid">
        {yearDays.map((date, i) => {
          const entry = date ? entries.find(e => e.date === date) : undefined
          const isToday = date === todayStr
          const isFuture = date ? date > todayStr : false
          const monthLabel = date ? getMonthLabel(i) : null
          const isEmpty = !date

          // Determine cell state
          let cellState = 'empty'
          if (isEmpty) cellState = 'null'
          else if (isFuture) cellState = 'future'
          else if (entry) cellState = 'filled'
          else if (isToday) cellState = 'today'

          return (
            <div key={i} className="garden-cell">
              {monthLabel && i > 0 && (
                <div className="garden-month-label">{monthLabel}</div>
              )}

              <div
                className={`garden-cell-inner ${viewMode} ${cellState} ${isToday ? 'today' : ''}`}
                onClick={() => handleDayClick(date)}
                role={isToday ? 'button' : undefined}
                tabIndex={isToday ? 0 : undefined}
                onKeyDown={isToday ? (e) => e.key === 'Enter' && handleDayClick(date) : undefined}
              >
                {viewMode === 'garden' && (
                  <>
                    {entry && date && (
                      <div
                        className="garden-plant animated"
                        dangerouslySetInnerHTML={{ __html: getPlantSvg(date) }}
                      />
                    )}
                    {isToday && !entry && (
                      <div
                        className="garden-seed"
                        dangerouslySetInnerHTML={{ __html: SEED_SVG }}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Today prompt */}
      {selectedYear === currentYear && !hasTodayEntry && (
        <button
          className="garden-cta"
          onClick={() => handleDayClick(todayStr)}
        >
          Plant today's memory
        </button>
      )}

      {/* Entries count - subtle, not gamified */}
      {yearEntries.length > 0 && (
        <p style={{
          textAlign: 'center',
          color: 'var(--text-subtle)',
          fontSize: 'var(--text-xs)',
          marginTop: 'var(--space-sm)'
        }}>
          {yearEntries.length} {yearEntries.length === 1 ? 'memory' : 'memories'} planted
        </p>
      )}
    </div>
  )
}
