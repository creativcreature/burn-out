import { useState, CSSProperties } from 'react'
import { AppLayout, Header } from '../components/layout'
import { Button, Toast } from '../components/shared'
import { TimerOverlay } from '../components/timer'
import { useTasks } from '../hooks/useTasks'
import { useEnergy } from '../hooks/useEnergy'
import type { Task, EnergyLevel } from '../data/types'

export function NowPage() {
  const { pendingTasks, completeTask, deferTask } = useTasks()
  const {
    currentEnergy,
    setEnergy,
    getSuggestedTask,
    sortTasksByEnergy,
    getGreeting,
    getMomentumMessage
  } = useEnergy()

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showTimer, setShowTimer] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', visible: false })

  // Sort tasks by energy-aware scoring
  const sortedTasks = sortTasksByEnergy(pendingTasks)
  const suggestedTask = getSuggestedTask(pendingTasks)
  const upcomingTasks = sortedTasks.filter(t => t.id !== suggestedTask?.id).slice(0, 3)

  const handleStartTask = (task: Task) => {
    setActiveTask(task)
    setShowTimer(true)
  }

  const handleCompleteTask = async (duration: number) => {
    if (activeTask) {
      await completeTask(activeTask.id, duration)
      setShowTimer(false)
      setActiveTask(null)
      setToast({ message: 'Nice work! Task completed.', type: 'success', visible: true })
      // Refresh the page to update momentum
      window.location.reload()
    }
  }

  const handleDeferTask = async (task: Task) => {
    await deferTask(task.id)
    setToast({ message: 'Task moved to tomorrow.', type: 'info', visible: true })
  }

  const getEnergyBolts = (level: string) => {
    const num = level === 'low' ? 1 : level === 'medium' ? 2 : 3
    return Array(3).fill(0).map((_, i) => (
      <span key={i} className={`energy-bolt ${i >= num ? 'empty' : ''}`}>*</span>
    ))
  }

  const energySelectorStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-sm) var(--space-md)',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-full)',
    marginBottom: 'var(--space-md)'
  }

  const energyButtonStyle = (level: EnergyLevel): CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: currentEnergy === level ? '2px solid var(--orb-orange)' : '1px solid var(--border)',
    background: currentEnergy === level ? 'var(--orb-orange)' : 'transparent',
    color: currentEnergy === level ? 'white' : 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    transition: 'all var(--transition-fast)'
  })

  const momentumMessage = getMomentumMessage()

  return (
    <AppLayout>
      <Header showLogo showDate />

      <main className="main-area">
        {/* Energy Selector */}
        <div style={energySelectorStyle}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginRight: 'var(--space-xs)' }}>
            Energy:
          </span>
          {([1, 2, 3, 4, 5] as EnergyLevel[]).map(level => (
            <button
              key={level}
              style={energyButtonStyle(level)}
              onClick={() => setEnergy(level)}
              title={`Energy level ${level}`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Momentum Message */}
        {momentumMessage && (
          <div style={{
            textAlign: 'center',
            fontSize: 'var(--text-sm)',
            color: 'var(--orb-orange)',
            marginBottom: 'var(--space-md)'
          }}>
            {momentumMessage}
          </div>
        )}

        <div className="task-display">
          {suggestedTask ? (
            <div className="glass-card-transparent task-card">
              <div className="task-header">
                <h1 className="task-title">{suggestedTask.verbLabel}.</h1>
                <p className="task-subtitle">{suggestedTask.taskBody}</p>
              </div>

              <div className="due-row">
                <div className="due-item">
                  <span className="due-label">Energy</span>
                  <div className="energy-display">
                    {getEnergyBolts(suggestedTask.feedLevel)}
                  </div>
                </div>
                <div className="due-item">
                  <span className="due-label">Duration</span>
                  <span className="due-value">{suggestedTask.timeEstimate}m</span>
                </div>
              </div>

              <div className="task-actions">
                <Button variant="primary" onClick={() => handleStartTask(suggestedTask)}>
                  Start Task
                </Button>
                <Button variant="ghost" onClick={() => handleDeferTask(suggestedTask)}>
                  Not Today
                </Button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h2 className="empty-title">{getGreeting()}.</h2>
              <p className="empty-text">Nothing to do right now. Enjoy the moment.</p>
            </div>
          )}
        </div>

        {/* Upcoming section */}
        {upcomingTasks.length > 0 && (
          <section className="upcoming-section">
            <div className="upcoming-header">
              <span className="upcoming-toggle">
                Up Next ({upcomingTasks.length})
              </span>
            </div>
            <div className="upcoming-list">
              {upcomingTasks.map((task, i) => (
                <div key={task.id} className="upcoming-card" onClick={() => handleStartTask(task)}>
                  <div className="priority-num">{i + 2}</div>
                  <div className="upcoming-info">
                    <div className="upcoming-title">{task.verbLabel}</div>
                    <div className="upcoming-meta">
                      {task.timeEstimate}m · {task.feedLevel} energy
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {activeTask && (
        <TimerOverlay
          task={activeTask}
          isOpen={showTimer}
          onComplete={handleCompleteTask}
          onCancel={() => {
            setShowTimer(false)
            setActiveTask(null)
          }}
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(t => ({ ...t, visible: false }))}
      />
    </AppLayout>
  )
}
