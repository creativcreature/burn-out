import { useState, useEffect, useRef, useCallback, CSSProperties, TouchEvent } from 'react'
import { AppLayout } from '../components/layout'
import { Modal } from '../components/shared'
import { addJournalEntry, getRecentJournalEntries } from '../utils/storage'
import type { JournalEntry } from '../data/types'

/**
 * Reflections Page - One Year Journal Clone with Burnout Colors
 *
 * POLA-style fluid gesture physics:
 * - Smooth pinch-to-zoom with momentum
 * - Fluid panning with inertia/momentum
 * - Gentle spring-based snap-to-center
 * - Responsive, immediate feedback
 */

// Physics constants for fluid feel
const FRICTION = 0.92 // How quickly momentum decays (higher = more slide)
const SPRING_TENSION = 0.15 // How strongly it snaps back (lower = gentler)
const SPRING_DAMPING = 0.8 // Reduces spring oscillation
const MIN_VELOCITY = 0.5 // Stop animating below this velocity
const ZOOM_SPEED = 0.008 // How responsive zoom feels

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

  // Transform state - using refs for animation frame updates
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })

  const containerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Touch tracking refs
  const lastTouchDistance = useRef<number>(0)
  const lastTouchCenter = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const lastTouchPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const lastTouchTime = useRef<number>(0)
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Velocity tracking for momentum
  const velocity = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Animation state
  const isGesturing = useRef(false)
  const isPinching = useRef(false)
  const animationFrame = useRef<number>(0)

  // Current transform (for animation frames without re-render)
  const currentTransform = useRef({ x: 0, y: 0, scale: 1 })

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

  // Get bounds for panning (how far can user pan at current zoom)
  const getBounds = useCallback(() => {
    if (!containerRef.current || !gridRef.current) return { minX: 0, maxX: 0, minY: 0, maxY: 0 }

    const container = containerRef.current.getBoundingClientRect()
    const scale = currentTransform.current.scale

    // Grid dimensions
    const cols = 15
    const cellSize = 28
    const gap = 8
    const gridWidth = cols * cellSize + (cols - 1) * gap + 32 // +padding
    const gridHeight = Math.ceil(365 / cols) * (cellSize + 8) + (Math.ceil(365 / cols) - 1) * gap + 32

    const scaledWidth = gridWidth * scale
    const scaledHeight = gridHeight * scale

    // Allow panning only if content is larger than container
    const overflowX = Math.max(0, (scaledWidth - container.width) / 2)
    const overflowY = Math.max(0, (scaledHeight - container.height) / 2)

    return {
      minX: -overflowX,
      maxX: overflowX,
      minY: -overflowY,
      maxY: overflowY
    }
  }, [])

  // Spring animation to gently snap back within bounds
  const animateSpring = useCallback(() => {
    const bounds = getBounds()
    const t = currentTransform.current

    let needsAnimation = false
    let newX = t.x
    let newY = t.y
    let newScale = t.scale

    // Apply momentum (friction decay)
    if (Math.abs(velocity.current.x) > MIN_VELOCITY || Math.abs(velocity.current.y) > MIN_VELOCITY) {
      newX += velocity.current.x
      newY += velocity.current.y
      velocity.current.x *= FRICTION
      velocity.current.y *= FRICTION
      needsAnimation = true
    }

    // Spring back if out of bounds
    if (newX < bounds.minX) {
      const diff = bounds.minX - newX
      newX += diff * SPRING_TENSION
      velocity.current.x *= SPRING_DAMPING
      needsAnimation = true
    } else if (newX > bounds.maxX) {
      const diff = bounds.maxX - newX
      newX += diff * SPRING_TENSION
      velocity.current.x *= SPRING_DAMPING
      needsAnimation = true
    }

    if (newY < bounds.minY) {
      const diff = bounds.minY - newY
      newY += diff * SPRING_TENSION
      velocity.current.y *= SPRING_DAMPING
      needsAnimation = true
    } else if (newY > bounds.maxY) {
      const diff = bounds.maxY - newY
      newY += diff * SPRING_TENSION
      velocity.current.y *= SPRING_DAMPING
      needsAnimation = true
    }

    // Spring zoom back to 1 if below
    if (newScale < 1) {
      newScale += (1 - newScale) * SPRING_TENSION * 2
      needsAnimation = true
    }

    // Snap to center when zoom is ~1
    if (newScale < 1.05 && newScale > 0.95) {
      newScale = 1
      if (Math.abs(newX) > 1) {
        newX *= 0.85
        needsAnimation = true
      } else {
        newX = 0
      }
      if (Math.abs(newY) > 1) {
        newY *= 0.85
        needsAnimation = true
      } else {
        newY = 0
      }
    }

    currentTransform.current = { x: newX, y: newY, scale: newScale }
    setTransform({ x: newX, y: newY, scale: newScale })

    if (needsAnimation && !isGesturing.current) {
      animationFrame.current = requestAnimationFrame(animateSpring)
    }
  }, [getBounds])

  // Start momentum animation after gesture ends
  const startMomentumAnimation = useCallback(() => {
    cancelAnimationFrame(animationFrame.current)
    animationFrame.current = requestAnimationFrame(animateSpring)
  }, [animateSpring])

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    cancelAnimationFrame(animationFrame.current)
    isGesturing.current = true

    if (e.touches.length === 2) {
      // Pinch gesture start
      isPinching.current = true
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy)
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      }
    } else if (e.touches.length === 1) {
      // Single finger pan start
      isPinching.current = false
      touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      lastTouchTime.current = Date.now()
      velocity.current = { x: 0, y: 0 }
    }
  }, [])

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault()
      isPinching.current = true

      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const center = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      }

      if (lastTouchDistance.current > 0) {
        const scaleDelta = (distance - lastTouchDistance.current) * ZOOM_SPEED
        const newScale = Math.max(0.5, Math.min(4, currentTransform.current.scale + scaleDelta))

        // Zoom towards pinch center
        const scaleRatio = newScale / currentTransform.current.scale
        const newX = center.x - (center.x - currentTransform.current.x) * scaleRatio
        const newY = center.y - (center.y - currentTransform.current.y) * scaleRatio

        // Also track pan during pinch
        const panX = center.x - lastTouchCenter.current.x
        const panY = center.y - lastTouchCenter.current.y

        currentTransform.current = {
          x: newX + panX,
          y: newY + panY,
          scale: newScale
        }
        setTransform({ ...currentTransform.current })
      }

      lastTouchDistance.current = distance
      lastTouchCenter.current = center

    } else if (e.touches.length === 1 && !isPinching.current && currentTransform.current.scale > 1) {
      // Single finger pan (only when zoomed in)
      const now = Date.now()
      const dt = Math.max(1, now - lastTouchTime.current)

      const dx = e.touches[0].clientX - lastTouchPos.current.x
      const dy = e.touches[0].clientY - lastTouchPos.current.y

      // Track velocity for momentum
      velocity.current = {
        x: dx / dt * 16, // Normalize to ~60fps
        y: dy / dt * 16
      }

      currentTransform.current = {
        ...currentTransform.current,
        x: currentTransform.current.x + dx,
        y: currentTransform.current.y + dy
      }
      setTransform({ ...currentTransform.current })

      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      lastTouchTime.current = now
    }
  }, [])

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length === 0) {
      isGesturing.current = false
      isPinching.current = false

      // Start momentum/spring animation
      startMomentumAnimation()
    } else if (e.touches.length === 1) {
      // Transitioned from pinch to single finger
      isPinching.current = false
      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      lastTouchTime.current = Date.now()
      velocity.current = { x: 0, y: 0 }
    }
  }, [startMomentumAnimation])

  // Cleanup animation on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(animationFrame.current)
  }, [])

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

  // Grid configuration - base sizes (scale applied via transform)
  const cols = 15
  const baseCellSize = 28
  const baseGap = 8

  // Styles - transparent to show orb
  const containerStyle: CSSProperties = {
    position: 'relative',
    minHeight: '100vh',
    background: 'transparent',
    overflow: 'hidden',
    touchAction: 'none' // We handle all touch
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
    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
    transformOrigin: 'center center',
    willChange: 'transform' // GPU acceleration
  }

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${baseCellSize}px)`,
    gap: `${baseGap}px`,
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
      width: baseCellSize,
      height: baseCellSize + 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      opacity: isPast || isToday ? 1 : 0.3
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
          <div style={{ width: baseCellSize, height: baseCellSize + 8 }}>
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
          <div ref={gridRef} style={gridStyle}>
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
          opacity: transform.scale > 1.5 ? 0 : 1,
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
        {transform.scale < 1.1 && (
          <div style={{
            position: 'fixed',
            bottom: 'calc(var(--nav-height) + var(--safe-bottom) + 170px)',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-subtle)',
            textAlign: 'center',
            opacity: transform.scale < 1.05 ? 1 : 0,
            transition: 'opacity 0.2s ease'
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
