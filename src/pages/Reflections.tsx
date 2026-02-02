import { useState, useEffect, useRef, CSSProperties, TouchEvent } from 'react'
import { AppLayout } from '../components/layout'
import { Modal } from '../components/shared'
import { addJournalEntry, getRecentJournalEntries } from '../utils/storage'
import type { JournalEntry } from '../data/types'

/**
 * Reflections Page - One Year Journal Clone with Burnout Colors
 *
 * Key features:
 * - 365-day grid showing entire year
 * - Hand-drawn plant illustrations for days with entries
 * - Small dots for empty days
 * - Pinch to zoom in/out
 * - Swipe to navigate
 * - Burnout color palette (orange/red/magenta instead of blue)
 */

// Hand-drawn plant SVGs in Burnout style (warm colors)
const PlantSVGs: Record<string, (color: string) => JSX.Element> = {
  tulip: (color) => (
    <svg viewBox="0 0 24 32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 28V16" />
      <path d="M12 8C8 8 6 12 6 16H18C18 12 16 8 12 8Z" />
      <path d="M9 18C7 20 8 24 12 24C16 24 17 20 15 18" />
    </svg>
  ),
  flower: (color) => (
    <svg viewBox="0 0 24 32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 28V18" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 4V8" />
      <path d="M6 12H8" />
      <path d="M16 12H18" />
      <path d="M8 8L10 10" />
      <path d="M14 10L16 8" />
      <path d="M8 16L10 14" />
      <path d="M14 14L16 16" />
    </svg>
  ),
  mushroom: (color) => (
    <svg viewBox="0 0 24 32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 28V22H14V28" />
      <path d="M4 22C4 14 8 10 12 10C16 10 20 14 20 22H4Z" />
      <circle cx="9" cy="16" r="1.5" fill={color} />
      <circle cx="15" cy="18" r="1" fill={color} />
    </svg>
  ),
  sprout: (color) => (
    <svg viewBox="0 0 24 32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 28V18" />
      <path d="M12 18C8 14 6 10 10 6C12 10 12 14 12 18" />
      <path d="M12 18C16 14 18 10 14 6C12 10 12 14 12 18" />
    </svg>
  ),
  fern: (color) => (
    <svg viewBox="0 0 24 32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 28V12" />
      <path d="M12 20C8 18 6 14 8 10" />
      <path d="M12 20C16 18 18 14 16 10" />
      <path d="M12 16C9 15 7 12 9 9" />
      <path d="M12 16C15 15 17 12 15 9" />
    </svg>
  ),
  daisy: (color) => (
    <svg viewBox="0 0 24 32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 28V16" />
      <circle cx="12" cy="10" r="2" fill={color} />
      <ellipse cx="12" cy="5" rx="2" ry="3" />
      <ellipse cx="12" cy="15" rx="2" ry="3" />
      <ellipse cx="7" cy="10" rx="3" ry="2" />
      <ellipse cx="17" cy="10" rx="3" ry="2" />
      <path d="M8 22C10 20 14 20 16 22" />
    </svg>
  ),
  succulent: (color) => (
    <svg viewBox="0 0 24 32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="24" rx="8" ry="4" />
      <path d="M12 20C12 16 10 14 12 10C14 14 12 16 12 20" />
      <path d="M8 22C6 18 4 16 6 12" />
      <path d="M16 22C18 18 20 16 18 12" />
    </svg>
  ),
  cactus: (color) => (
    <svg viewBox="0 0 24 32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 28V12C10 8 14 8 14 12V28" />
      <path d="M10 18H6C4 18 4 14 6 14H10" />
      <path d="M14 16H18C20 16 20 20 18 20H14" />
    </svg>
  ),
  cherry: (color) => (
    <svg viewBox="0 0 24 32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8C8 12 4 16 6 24" />
      <path d="M12 8C16 12 20 16 18 24" />
      <circle cx="6" cy="26" r="3" />
      <circle cx="18" cy="26" r="3" />
    </svg>
  ),
  herb: (color) => (
    <svg viewBox="0 0 24 32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 28V14" />
      <path d="M8 26L12 22L16 26" />
      <path d="M6 22L12 16L18 22" />
      <path d="M8 18L12 14L16 18" />
      <path d="M10 14L12 10L14 14" />
    </svg>
  ),
  lotus: (color) => (
    <svg viewBox="0 0 24 32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 28V20" />
      <path d="M12 12C12 8 10 6 12 4C14 6 12 8 12 12" />
      <path d="M8 16C4 14 2 12 4 8C8 10 8 14 8 16" />
      <path d="M16 16C20 14 22 12 20 8C16 10 16 14 16 16" />
      <path d="M6 24C4 20 6 16 12 16C18 16 20 20 18 24" />
    </svg>
  ),
  sunflower: (color) => (
    <svg viewBox="0 0 24 32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 28V16" />
      <circle cx="12" cy="10" r="3" fill={color} />
      <path d="M12 3V5" />
      <path d="M12 15V17" />
      <path d="M5 10H7" />
      <path d="M17 10H19" />
      <path d="M7 5L8.5 6.5" />
      <path d="M15.5 13.5L17 15" />
      <path d="M17 5L15.5 6.5" />
      <path d="M8.5 13.5L7 15" />
      <path d="M8 22C10 20 14 20 16 22" />
    </svg>
  )
}

const plantKeys = Object.keys(PlantSVGs)

// Burnout color palette for plants
const burnoutColors = [
  '#FF4500', // orange
  '#FF6B35', // warm orange
  '#FF2200', // red
  '#E84393', // magenta
  '#FF9F43', // gold
  '#D63031', // dark red
  '#FD79A8', // pink
  '#E17055', // coral
]

// Get consistent plant and color for a day
function getPlantForDay(dayOfYear: number): { plant: string; color: string } {
  return {
    plant: plantKeys[dayOfYear % plantKeys.length],
    color: burnoutColors[dayOfYear % burnoutColors.length]
  }
}

// Get day of year (1-365)
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Get date from day of year
function getDateFromDayOfYear(dayOfYear: number, year: number): Date {
  const date = new Date(year, 0, 1)
  date.setDate(dayOfYear)
  return date
}

export function ReflectionsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [entryText, setEntryText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [journalEntries, setJournalEntries] = useState<Map<string, JournalEntry>>(new Map())
  const [zoom, setZoom] = useState(1) // 1 = full year, 2 = zoomed in
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const lastTouchDistance = useRef<number | null>(null)
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const today = new Date()
  const todayStr = formatDate(today)
  const currentYear = today.getFullYear()
  const todayDayOfYear = getDayOfYear(today)

  // Load journal entries
  useEffect(() => {
    getRecentJournalEntries(366).then(entries => {
      const map = new Map<string, JournalEntry>()
      entries.forEach(e => map.set(e.date, e))
      setJournalEntries(map)
    })
  }, [])

  // Handle pinch zoom
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy)
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      }
    } else if (e.touches.length === 1 && zoom > 1) {
      isDragging.current = true
      dragStart.current = {
        x: e.touches[0].clientX - viewOffset.x,
        y: e.touches[0].clientY - viewOffset.y
      }
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current) {
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const scale = distance / lastTouchDistance.current

      setZoom(prev => Math.max(1, Math.min(3, prev * scale)))
      lastTouchDistance.current = distance
    } else if (e.touches.length === 1 && isDragging.current && zoom > 1) {
      const newX = e.touches[0].clientX - dragStart.current.x
      const newY = e.touches[0].clientY - dragStart.current.y
      setViewOffset({ x: newX, y: newY })
    }
  }

  const handleTouchEnd = () => {
    lastTouchDistance.current = null
    lastTouchCenter.current = null
    isDragging.current = false
  }

  // Handle day tap
  const handleDayTap = async (dayOfYear: number) => {
    const date = getDateFromDayOfYear(dayOfYear, currentYear)
    const dateStr = formatDate(date)

    setSelectedDate(date)
    const entry = journalEntries.get(dateStr)

    if (entry) {
      setSelectedEntry(entry)
      setEntryText(entry.content)
      setIsEditing(dateStr === todayStr)
    } else {
      setSelectedEntry(null)
      setEntryText('')
      setIsEditing(dateStr === todayStr)
    }
  }

  // Save entry
  const handleSave = async () => {
    if (!selectedDate || !entryText.trim()) return

    const dateStr = formatDate(selectedDate)
    const entry = await addJournalEntry(entryText.trim(), dateStr)

    setJournalEntries(prev => {
      const newMap = new Map(prev)
      newMap.set(dateStr, entry)
      return newMap
    })
    setSelectedEntry(entry)
    setIsEditing(false)
    setSelectedDate(null)
  }

  // Close modal
  const handleClose = () => {
    setSelectedDate(null)
    setSelectedEntry(null)
    setEntryText('')
    setIsEditing(false)
  }

  // Grid configuration
  const cols = 15
  const cellSize = 28 * zoom
  const gap = 8 * zoom

  // Styles - transparent to show orb
  const containerStyle: CSSProperties = {
    position: 'relative',
    minHeight: '100vh',
    background: 'transparent',
    overflow: 'hidden',
    touchAction: zoom > 1 ? 'none' : 'auto'
  }

  const headerStyle: CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: 'var(--space-md)',
    background: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-sm)'
  }

  const yearPillStyle: CSSProperties = {
    padding: '8px 20px',
    background: 'var(--bg-card)',
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    color: 'var(--text)'
  }

  const gridContainerStyle: CSSProperties = {
    padding: 'var(--space-md)',
    display: 'flex',
    justifyContent: 'center',
    transform: `scale(${zoom}) translate(${viewOffset.x / zoom}px, ${viewOffset.y / zoom}px)`,
    transformOrigin: 'top center',
    transition: isDragging.current ? 'none' : 'transform 0.2s ease'
  }

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gap: `${gap}px`,
    padding: 'var(--space-md)'
  }

  const plantButtonStyle: CSSProperties = {
    position: 'fixed',
    bottom: 'calc(var(--nav-height) + var(--safe-bottom) + 24px)',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-xs)'
  }

  const addButtonStyle: CSSProperties = {
    width: 56,
    height: 56,
    borderRadius: '50%',
    border: '2px solid var(--orb-orange)',
    background: 'var(--bg-card)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: 'var(--orb-orange)',
    boxShadow: '0 4px 12px rgba(255, 69, 0, 0.2)'
  }

  const buttonLabelStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    color: 'var(--orb-orange)',
    fontWeight: 500
  }

  // Render a single day cell
  const renderDayCell = (dayOfYear: number) => {
    if (dayOfYear > 365) return null

    const date = getDateFromDayOfYear(dayOfYear, currentYear)
    const dateStr = formatDate(date)
    const hasEntry = journalEntries.has(dateStr)
    const isToday = dayOfYear === todayDayOfYear
    const isPast = dayOfYear < todayDayOfYear
    const { plant, color } = getPlantForDay(dayOfYear)

    const cellStyle: CSSProperties = {
      width: cellSize,
      height: cellSize + 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      opacity: isPast || isToday ? 1 : 0.3,
      transition: 'transform 0.2s ease'
    }

    const dotStyle: CSSProperties = {
      width: 4,
      height: 4,
      borderRadius: '50%',
      background: isToday ? 'var(--orb-orange)' : 'var(--text-subtle)'
    }

    return (
      <div
        key={dayOfYear}
        style={cellStyle}
        onClick={() => handleDayTap(dayOfYear)}
        role="button"
        tabIndex={0}
        aria-label={`${date.toLocaleDateString()} ${hasEntry ? '- has memory' : ''}`}
      >
        {hasEntry ? (
          <div style={{ width: cellSize, height: cellSize + 8 }}>
            {PlantSVGs[plant](color)}
          </div>
        ) : (
          <div style={dotStyle} />
        )}
      </div>
    )
  }

  // Generate all days
  const days = Array.from({ length: 365 }, (_, i) => i + 1)

  // Count memories
  const memoryCount = journalEntries.size

  return (
    <AppLayout showOrb={true}>
      <div
        ref={containerRef}
        style={containerStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div style={headerStyle}>
          <div style={yearPillStyle}>{currentYear}</div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'} planted
          </p>
        </div>

        {/* 365-day grid */}
        <div style={gridContainerStyle}>
          <div style={gridStyle}>
            {days.map(day => renderDayCell(day))}
          </div>
        </div>

        {/* Horizontal scroll nav - recent days */}
        <div style={{
          position: 'fixed',
          bottom: 'calc(var(--nav-height) + var(--safe-bottom) + 90px)',
          left: 0,
          right: 0,
          zIndex: 50,
          opacity: zoom > 1.5 ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: 'var(--space-sm)',
            padding: '0 var(--space-md)',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory'
          }}>
            {/* Show last 14 days */}
            {Array.from({ length: 14 }, (_, i) => {
              const day = todayDayOfYear - 13 + i
              if (day < 1) return null
              const date = getDateFromDayOfYear(day, currentYear)
              const dateStr = formatDate(date)
              const { plant, color } = getPlantForDay(day)
              const hasEntry = journalEntries.has(dateStr)
              const isToday = day === todayDayOfYear

              return (
                <div
                  key={day}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 'var(--space-sm)',
                    background: isToday ? 'var(--bg-card)' : 'transparent',
                    backdropFilter: isToday ? 'blur(10px)' : 'none',
                    borderRadius: 'var(--radius-lg)',
                    border: isToday ? '1px solid var(--orb-orange)' : 'none',
                    minWidth: 48,
                    cursor: 'pointer',
                    scrollSnapAlign: 'center'
                  }}
                  onClick={() => handleDayTap(day)}
                >
                  <div style={{
                    width: 32,
                    height: 40,
                    opacity: hasEntry ? 1 : 0.4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {hasEntry ? PlantSVGs[plant](color) : (
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: isToday ? 'var(--orb-orange)' : 'var(--text-muted)'
                      }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: '10px',
                    color: isToday ? 'var(--orb-orange)' : 'var(--text-muted)',
                    fontWeight: isToday ? 600 : 400
                  }}>
                    {isToday ? 'today' : date.getDate()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Plant memory button */}
        <div style={plantButtonStyle}>
          <button
            style={addButtonStyle}
            onClick={() => handleDayTap(todayDayOfYear)}
            aria-label="Plant a memory"
          >
            +
          </button>
          <span style={buttonLabelStyle}>
            {journalEntries.has(todayStr) ? 'edit today' : 'plant memory'}
          </span>
        </div>

        {/* Zoom hint */}
        {zoom === 1 && (
          <div style={{
            position: 'fixed',
            bottom: 'calc(var(--nav-height) + var(--safe-bottom) + 170px)',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-subtle)',
            textAlign: 'center'
          }}>
            pinch to zoom
          </div>
        )}
      </div>

      {/* Entry Modal */}
      <Modal
        isOpen={selectedDate !== null}
        onClose={handleClose}
        title={selectedDate?.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        })}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {isEditing ? (
            <>
              <textarea
                style={{
                  width: '100%',
                  minHeight: 150,
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px solid #FFE0D0',
                  background: '#FFFAF8',
                  color: '#2D2D2D',
                  fontSize: 'var(--text-md)',
                  fontFamily: 'var(--font-body)',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 1.6
                }}
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                placeholder="What's on your mind today?"
                autoFocus
              />
              <button
                style={{
                  padding: 'var(--space-md) var(--space-xl)',
                  background: '#FF4500',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 'var(--text-md)'
                }}
                onClick={handleSave}
                disabled={!entryText.trim()}
              >
                plant memory
              </button>
            </>
          ) : (
            <div style={{
              padding: 'var(--space-md)',
              background: '#FFFAF8',
              borderRadius: 'var(--radius-lg)',
              color: '#2D2D2D',
              fontSize: 'var(--text-md)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              minHeight: 100
            }}>
              {selectedEntry?.content || 'no memory'}
            </div>
          )}
        </div>
      </Modal>
    </AppLayout>
  )
}
