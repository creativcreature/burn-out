import { useState, useEffect, CSSProperties } from 'react'
import { getData } from '../../utils/storage'

interface FlowerData {
  date: string
  count: number
  dayOfWeek: number
}

export function Garden() {
  const [flowers, setFlowers] = useState<FlowerData[]>([])
  const [selectedWeek, setSelectedWeek] = useState(0) // 0 = current week

  useEffect(() => {
    async function loadFlowers() {
      const data = await getData()
      const completedTasks = data.completedTasks

      // Group by date
      const byDate = completedTasks.reduce((acc, task) => {
        const date = task.completedAt.split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Convert to flower data
      const flowerData: FlowerData[] = Object.entries(byDate).map(([date, count]) => ({
        date,
        count,
        dayOfWeek: new Date(date).getDay()
      }))

      setFlowers(flowerData)
    }
    loadFlowers()
  }, [])

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-lg)'
  }

  const weekContainerStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 'var(--space-sm)',
    justifyItems: 'center'
  }

  const dayLabelStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)',
    marginBottom: 'var(--space-xs)'
  }

  const flowerContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-xs)'
  }

  const getFlowerSize = (count: number): number => {
    if (count === 0) return 20
    if (count <= 2) return 30
    if (count <= 5) return 40
    return 50
  }

  const getFlowerColor = (count: number): string => {
    if (count === 0) return 'var(--border-color)'
    if (count <= 2) return 'var(--accent-primary)'
    if (count <= 5) return 'var(--accent-secondary)'
    return 'var(--accent-tertiary)'
  }

  // Get current week dates
  const getWeekDates = (weekOffset: number): string[] => {
    const today = new Date()
    const currentDay = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - currentDay - (weekOffset * 7))

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date.toISOString().split('T')[0]
    })
  }

  const weekDates = getWeekDates(selectedWeek)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const renderFlower = (date: string) => {
    const flower = flowers.find(f => f.date === date)
    const count = flower?.count || 0
    const size = getFlowerSize(count)
    const color = getFlowerColor(count)
    const isToday = date === new Date().toISOString().split('T')[0]

    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--text-xs)',
          color: count > 0 ? 'white' : 'var(--text-muted)',
          border: isToday ? '2px solid var(--text-primary)' : 'none',
          transition: 'all var(--transition-fast)'
        }}
        title={`${date}: ${count} task${count !== 1 ? 's' : ''}`}
      >
        {count > 0 && count}
      </div>
    )
  }

  const navStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  const navButtonStyle: CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-xs) var(--space-sm)',
    cursor: 'pointer',
    color: 'var(--text-primary)'
  }

  const weekLabelStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-secondary)'
  }

  return (
    <div style={containerStyle}>
      <div style={navStyle}>
        <button style={navButtonStyle} onClick={() => setSelectedWeek(w => w + 1)}>
          ← Previous
        </button>
        <span style={weekLabelStyle}>
          {selectedWeek === 0 ? 'This Week' : `${selectedWeek} week${selectedWeek > 1 ? 's' : ''} ago`}
        </span>
        <button
          style={{ ...navButtonStyle, opacity: selectedWeek === 0 ? 0.5 : 1 }}
          onClick={() => setSelectedWeek(w => Math.max(0, w - 1))}
          disabled={selectedWeek === 0}
        >
          Next →
        </button>
      </div>

      <div style={weekContainerStyle}>
        {dayNames.map(day => (
          <div key={day} style={dayLabelStyle}>{day}</div>
        ))}
        {weekDates.map(date => (
          <div key={date} style={flowerContainerStyle}>
            {renderFlower(date)}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
        Each circle represents tasks completed that day.
        <br />
        Bigger circles = more tasks.
      </div>
    </div>
  )
}
