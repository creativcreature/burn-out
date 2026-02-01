import { useState, CSSProperties } from 'react'
import { AppLayout } from '../components/layout'
import { Modal, Button } from '../components/shared'
import { useTasks } from '../hooks/useTasks'

/**
 * Reflections Page - One Day Journal inspired
 * Minimal, whimsical, lots of whitespace
 * "plant a thought" instead of stats-heavy dashboard
 */
export function ReflectionsPage() {
  const { completedTasks } = useTasks()
  const [showPlantModal, setShowPlantModal] = useState(false)
  const [thought, setThought] = useState('')

  // Get recent reflections (last 7 days of completed tasks with notes)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const recentReflections = completedTasks
    .filter(t => {
      const date = new Date(t.updatedAt)
      return date >= weekAgo
    })
    .slice(0, 4)

  // Whimsical icons for reflections (like One Day's plant icons)
  const icons = ['🌸', '🍒', '🌲', '🍄', '🌻', '🌿', '🌱', '✨']
  
  const getIconForTask = (index: number) => icons[index % icons.length]

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '70vh',
    padding: 'var(--space-xl) var(--space-md)',
    gap: 'var(--space-xl)'
  }

  const todayPillStyle: CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-full)',
    padding: 'var(--space-xs) var(--space-md)',
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)'
  }

  const iconsRowStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-lg)',
    justifyContent: 'center',
    flexWrap: 'wrap',
    maxWidth: 280
  }

  const iconStyle: CSSProperties = {
    fontSize: '2rem',
    opacity: 0.6,
    cursor: 'pointer',
    transition: 'all 200ms var(--spring-smooth)'
  }

  const plantButtonStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    cursor: 'pointer',
    marginTop: 'auto',
    marginBottom: 'auto'
  }

  const plantCircleStyle: CSSProperties = {
    width: 80,
    height: 80,
    borderRadius: '50%',
    border: '2px solid var(--orb-orange)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    color: 'var(--orb-orange)',
    background: 'transparent',
    transition: 'all 200ms var(--spring-smooth)'
  }

  const plantTextStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-md)',
    color: 'var(--text)',
    fontWeight: 500
  }

  const handlePlantThought = () => {
    if (thought.trim()) {
      // TODO: Save thought as journal entry
      console.log('Planting thought:', thought)
      setThought('')
      setShowPlantModal(false)
    }
  }

  return (
    <AppLayout showOrb={false}>
      <main style={containerStyle}>
        {/* Today pill */}
        <div style={todayPillStyle}>today</div>

        {/* Recent reflection icons */}
        {recentReflections.length > 0 ? (
          <div style={iconsRowStyle}>
            {recentReflections.map((task, i) => (
              <span 
                key={task.id} 
                style={iconStyle}
                title={task.taskBody}
              >
                {getIconForTask(i)}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ ...iconsRowStyle, opacity: 0.3 }}>
            <span style={iconStyle}>🌸</span>
            <span style={iconStyle}>🍒</span>
            <span style={iconStyle}>🌲</span>
            <span style={iconStyle}>🍄</span>
          </div>
        )}

        {/* Plant thought button */}
        <div 
          style={plantButtonStyle}
          onClick={() => setShowPlantModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setShowPlantModal(true)}
        >
          <div style={plantCircleStyle}>+</div>
          <span style={plantTextStyle}>plant thought</span>
        </div>

        {/* Gentle message */}
        {recentReflections.length === 0 && (
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: 'var(--text-sm)',
            textAlign: 'center',
            maxWidth: 250,
            lineHeight: 'var(--line-height-relaxed)'
          }}>
            your thoughts grow here.
            <br />
            plant one when you're ready.
          </p>
        )}
      </main>

      {/* Plant thought modal */}
      <Modal 
        isOpen={showPlantModal} 
        onClose={() => setShowPlantModal(false)}
        title="plant a thought"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="what's on your mind?"
            style={{
              width: '100%',
              minHeight: 120,
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text)',
              fontSize: 'var(--text-md)',
              fontFamily: 'var(--font-body)',
              resize: 'vertical'
            }}
          />
          <Button 
            variant="primary" 
            onClick={handlePlantThought}
            disabled={!thought.trim()}
          >
            plant 🌱
          </Button>
        </div>
      </Modal>
    </AppLayout>
  )
}
