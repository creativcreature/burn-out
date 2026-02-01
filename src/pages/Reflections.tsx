import { useState, CSSProperties } from 'react'
import { AppLayout } from '../components/layout'
import { Modal, Button } from '../components/shared'
import { useTasks } from '../hooks/useTasks'
import { 
  WobblyFlower, 
  WobblyCherries, 
  WobblyTrees, 
  WobblyMushroom,
  WobblyPlus 
} from '../components/icons/HandDrawnIcons'

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

  // Wobbly hand-drawn icons for reflections
  const IconComponents = [WobblyFlower, WobblyCherries, WobblyTrees, WobblyMushroom]
  
  const getIconForTask = (index: number) => {
    const Icon = IconComponents[index % IconComponents.length]
    return <Icon size={40} />
  }

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

        {/* Recent reflection icons - hand-drawn SVGs */}
        {recentReflections.length > 0 ? (
          <div style={iconsRowStyle}>
            {recentReflections.map((task, i) => (
              <div 
                key={task.id} 
                style={{ ...iconStyle, opacity: 0.6 }}
                title={task.taskBody}
              >
                {getIconForTask(i)}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ ...iconsRowStyle, opacity: 0.25 }}>
            <WobblyFlower size={40} />
            <WobblyCherries size={40} />
            <WobblyTrees size={40} />
            <WobblyMushroom size={40} />
          </div>
        )}

        {/* Plant thought button - wobbly hand-drawn circle */}
        <div 
          style={plantButtonStyle}
          onClick={() => setShowPlantModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setShowPlantModal(true)}
        >
          <WobblyPlus size={90} />
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
