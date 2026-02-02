import { useState, useEffect, useRef, CSSProperties } from 'react'
import { AppLayout } from '../components/layout'
import { Modal } from '../components/shared'
import { addJournalEntry, getRecentJournalEntries } from '../utils/storage'
import type { JournalEntry } from '../data/types'

/**
 * Reflections Page - POLA-inspired floating memories
 *
 * Key features:
 * - Warm cream background with Burnout accent colors
 * - Floating memory icons scattered across the screen
 * - Tap a memory to view/edit
 * - Parallax-style scroll effect
 * - Large "plant memory" button for today
 */

// Memory icon SVGs - abstract shapes in Burnout colors
const MemoryIcons: Record<string, (color: string) => JSX.Element> = {
  circle: (color) => (
    <svg viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="28" fill={color} />
    </svg>
  ),
  blob1: (color) => (
    <svg viewBox="0 0 60 60" fill="none">
      <path d="M30 5C45 5 55 15 55 30C55 45 45 55 30 55C15 55 5 45 5 30C5 15 20 5 30 5Z" fill={color} />
    </svg>
  ),
  blob2: (color) => (
    <svg viewBox="0 0 60 60" fill="none">
      <path d="M15 10C35 5 55 15 55 35C55 55 35 55 20 50C5 45 -5 15 15 10Z" fill={color} />
    </svg>
  ),
  heart: (color) => (
    <svg viewBox="0 0 60 60" fill="none">
      <path d="M30 55C30 55 5 35 5 20C5 10 15 5 25 10C28 12 30 15 30 15C30 15 32 12 35 10C45 5 55 10 55 20C55 35 30 55 30 55Z" fill={color} />
    </svg>
  ),
  star: (color) => (
    <svg viewBox="0 0 60 60" fill="none">
      <path d="M30 5L35 22L55 22L40 35L45 55L30 42L15 55L20 35L5 22L25 22L30 5Z" fill={color} />
    </svg>
  ),
  drop: (color) => (
    <svg viewBox="0 0 60 60" fill="none">
      <path d="M30 5C30 5 50 25 50 38C50 50 41 55 30 55C19 55 10 50 10 38C10 25 30 5 30 5Z" fill={color} />
    </svg>
  ),
  leaf: (color) => (
    <svg viewBox="0 0 60 60" fill="none">
      <path d="M10 50C10 50 10 20 30 10C50 0 55 30 45 45C35 60 10 50 10 50Z" fill={color} />
      <path d="M10 50C15 40 25 30 40 25" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
    </svg>
  ),
  cloud: (color) => (
    <svg viewBox="0 0 60 60" fill="none">
      <ellipse cx="30" cy="35" rx="25" ry="15" fill={color} />
      <circle cx="20" cy="28" r="12" fill={color} />
      <circle cx="38" cy="25" r="14" fill={color} />
    </svg>
  )
}

const iconKeys = Object.keys(MemoryIcons)

// Burnout color palette
const colors = [
  '#FF4500', // orb-orange
  '#FF6B35', // warm orange
  '#FF2200', // orb-red
  '#E84393', // magenta/pink
  '#9B59B6', // purple
  '#FF9F43', // gold
  '#6C5CE7', // indigo
  '#FFA07A', // light salmon
]

// Get consistent icon and color for a day
function getMemoryStyle(dayOfYear: number): { icon: string; color: string; rotation: number; scale: number } {
  return {
    icon: iconKeys[dayOfYear % iconKeys.length],
    color: colors[dayOfYear % colors.length],
    rotation: ((dayOfYear * 37) % 60) - 30, // -30 to 30 degrees
    scale: 0.8 + ((dayOfYear * 13) % 40) / 100 // 0.8 to 1.2
  }
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

// Grid position for scattered layout
function getGridPosition(index: number): { x: number; y: number } {
  // Create a flowing, organic layout
  const cols = 4
  const row = Math.floor(index / cols)
  const col = index % cols

  // Stagger positions for organic feel
  const baseX = 10 + (col * 22) + ((row % 2) * 11)
  const baseY = row * 120

  // Add some randomness based on index
  const offsetX = ((index * 17) % 10) - 5
  const offsetY = ((index * 23) % 20) - 10

  return {
    x: Math.max(5, Math.min(75, baseX + offsetX)),
    y: baseY + offsetY
  }
}

export function ReflectionsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [entryText, setEntryText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  const todayStr = formatDate(today)

  // Load journal entries
  useEffect(() => {
    getRecentJournalEntries(60).then(entries => {
      setJournalEntries(entries)
    })
  }, [])

  // Track scroll for parallax
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollY(container.scrollTop)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle memory click
  const handleMemoryClick = async (entry: JournalEntry) => {
    const date = new Date(entry.date)
    setSelectedDate(date)
    setSelectedEntry(entry)
    setEntryText(entry.content)
    setIsEditing(entry.date === todayStr)
  }

  // Handle today click
  const handleTodayClick = async () => {
    setSelectedDate(today)
    const existing = journalEntries.find(e => e.date === todayStr)
    if (existing) {
      setSelectedEntry(existing)
      setEntryText(existing.content)
    } else {
      setSelectedEntry(null)
      setEntryText('')
    }
    setIsEditing(true)
  }

  // Save entry
  const handleSave = async () => {
    if (!selectedDate || !entryText.trim()) return

    const dateStr = formatDate(selectedDate)
    const entry = await addJournalEntry(entryText.trim(), dateStr)

    // Update local state
    setJournalEntries(prev => {
      const filtered = prev.filter(e => e.date !== dateStr)
      return [entry, ...filtered]
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

  const hasEntryToday = journalEntries.some(e => e.date === todayStr)

  // Container style - warm cream background
  const containerStyle: CSSProperties = {
    position: 'relative',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF0E6 50%, #FFE8DC 100%)',
    overflowY: 'auto',
    overflowX: 'hidden'
  }

  // Header style
  const headerStyle: CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: 'var(--space-lg) var(--space-md)',
    background: 'linear-gradient(180deg, #FFF8F0 0%, rgba(255,248,240,0.9) 100%)',
    backdropFilter: 'blur(10px)'
  }

  const titleStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 600,
    color: '#2D2D2D',
    marginBottom: 'var(--space-xs)'
  }

  const subtitleStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: '#666'
  }

  // Plant memory button
  const plantButtonStyle: CSSProperties = {
    position: 'fixed',
    bottom: 'calc(var(--nav-height) + var(--safe-bottom) + 80px)',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-sm)'
  }

  const buttonCircleStyle: CSSProperties = {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)',
    border: 'none',
    boxShadow: '0 8px 32px rgba(255, 69, 0, 0.35)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: 'white',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  }

  const buttonLabelStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    color: '#FF4500'
  }

  // Memory icon style
  const getMemoryIconStyle = (index: number, entry: JournalEntry): CSSProperties => {
    const dayOfYear = getDayOfYear(new Date(entry.date))
    const style = getMemoryStyle(dayOfYear)
    const pos = getGridPosition(index)

    // Parallax offset based on scroll
    const parallaxFactor = 0.1 + (index % 3) * 0.05
    const yOffset = scrollY * parallaxFactor

    return {
      position: 'absolute',
      left: `${pos.x}%`,
      top: `${pos.y + 150 - yOffset}px`,
      width: 60 * style.scale,
      height: 60 * style.scale,
      transform: `rotate(${style.rotation}deg)`,
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
      opacity: 0.9,
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
    }
  }

  // Modal styles
  const modalContentStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  }

  const textareaStyle: CSSProperties = {
    width: '100%',
    minHeight: 150,
    padding: 'var(--space-md)',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid #FFE0D0',
    background: '#FFF8F4',
    color: '#2D2D2D',
    fontSize: 'var(--text-md)',
    fontFamily: 'var(--font-body)',
    resize: 'none',
    outline: 'none',
    lineHeight: 1.6
  }

  const readOnlyTextStyle: CSSProperties = {
    padding: 'var(--space-md)',
    background: '#FFF8F4',
    borderRadius: 'var(--radius-lg)',
    color: '#2D2D2D',
    fontSize: 'var(--text-md)',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap'
  }

  const saveButtonStyle: CSSProperties = {
    padding: 'var(--space-md) var(--space-xl)',
    background: 'linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 'var(--text-md)',
    boxShadow: '0 4px 16px rgba(255, 69, 0, 0.3)'
  }

  // Calculate content height based on entries
  const contentHeight = Math.max(600, journalEntries.length * 100 + 300)

  return (
    <AppLayout showOrb={false}>
      <div ref={containerRef} style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Reflections</h1>
          <p style={subtitleStyle}>
            {journalEntries.length} memories planted
          </p>
        </div>

        {/* Floating memories area */}
        <div style={{ position: 'relative', height: contentHeight, width: '100%' }}>
          {journalEntries.map((entry, index) => {
            const dayOfYear = getDayOfYear(new Date(entry.date))
            const style = getMemoryStyle(dayOfYear)
            const IconComponent = MemoryIcons[style.icon]

            return (
              <div
                key={entry.id}
                style={getMemoryIconStyle(index, entry)}
                onClick={() => handleMemoryClick(entry)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleMemoryClick(entry)}
                aria-label={`Memory from ${new Date(entry.date).toLocaleDateString()}`}
              >
                {IconComponent(style.color)}
              </div>
            )
          })}

          {/* Empty state */}
          {journalEntries.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#999',
              padding: 'var(--space-xl)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>
                🌱
              </div>
              <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-sm)' }}>
                No memories yet
              </p>
              <p style={{ fontSize: 'var(--text-sm)' }}>
                Tap the button below to plant your first memory
              </p>
            </div>
          )}
        </div>

        {/* Plant memory button */}
        <div style={plantButtonStyle}>
          <button
            style={buttonCircleStyle}
            onClick={handleTodayClick}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 69, 0, 0.45)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 69, 0, 0.35)'
            }}
            aria-label="Plant a memory"
          >
            +
          </button>
          <span style={buttonLabelStyle}>
            {hasEntryToday ? 'edit today' : 'plant memory'}
          </span>
        </div>
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
        <div style={modalContentStyle}>
          {isEditing ? (
            <>
              <textarea
                style={textareaStyle}
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                placeholder="What's on your mind today?"
                autoFocus
              />
              <button
                style={saveButtonStyle}
                onClick={handleSave}
                disabled={!entryText.trim()}
              >
                Plant Memory 🌱
              </button>
            </>
          ) : (
            <div style={readOnlyTextStyle}>
              {selectedEntry?.content || 'No memory for this day'}
            </div>
          )}
        </div>
      </Modal>
    </AppLayout>
  )
}
