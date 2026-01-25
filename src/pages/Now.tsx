import { useState, CSSProperties } from 'react'
import { AppLayout } from '../components/layout'
import { Orb, Card, Button, Toast } from '../components/shared'
import { TimerOverlay } from '../components/timer'
import { useThemeContext } from '../components/shared/ThemeProvider'
import { useTasks } from '../hooks/useTasks'
import { useEnergy } from '../hooks/useEnergy'
import type { Task } from '../data/types'

export function NowPage() {
  const { toggleTheme, isDark } = useThemeContext()
  const { pendingTasks, completeTask, deferTask } = useTasks()
  const { currentEnergy, setEnergy, getSuggestedTask } = useEnergy()

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showTimer, setShowTimer] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', visible: false })

  // Get energy-sorted task
  const suggestedTask = getSuggestedTask(pendingTasks)

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
    }
  }

  const handleDeferTask = async (taskId: string) => {
    await deferTask(taskId)
    setToast({ message: 'Task moved to tomorrow.', type: 'info', visible: true })
  }

  const containerStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-lg)',
    gap: 'var(--space-xl)',
    textAlign: 'center'
  }

  const energyBarStyle: CSSProperties = {
    position: 'absolute',
    top: 'calc(var(--safe-top) + var(--space-md))',
    left: 'var(--space-md)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)'
  }

  const energyBtnStyle = (level: number): CSSProperties => ({
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-sm)',
    border: `2px solid ${currentEnergy === level ? 'var(--accent-primary)' : 'var(--border-color)'}`,
    background: currentEnergy === level ? 'var(--accent-primary)' : 'transparent',
    color: currentEnergy === level ? 'white' : 'var(--text-secondary)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 'var(--text-xs)'
  })

  const themeButtonStyle: CSSProperties = {
    position: 'absolute',
    top: 'calc(var(--safe-top) + var(--space-md))',
    right: 'var(--space-md)',
    width: 40,
    height: 40,
    borderRadius: 'var(--radius-full)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-primary)'
  }

  const taskContainerStyle: CSSProperties = {
    width: '100%',
    maxWidth: 400
  }

  const verbLabelStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-lg)',
    fontWeight: 600,
    color: 'var(--accent-primary)',
    marginBottom: 'var(--space-xs)'
  }

  const taskBodyStyle: CSSProperties = {
    fontSize: 'var(--text-md)',
    color: 'var(--text-primary)',
    marginBottom: 'var(--space-md)'
  }

  const timeStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-secondary)'
  }

  const actionsStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-md)',
    marginTop: 'var(--space-lg)'
  }

  const emptyStateStyle: CSSProperties = {
    color: 'var(--text-secondary)',
    fontSize: 'var(--text-lg)'
  }

  const energyLabelStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)'
  }

  return (
    <AppLayout>
      <div style={energyBarStyle}>
        <span style={energyLabelStyle}>Energy:</span>
        {[1, 2, 3, 4, 5].map(level => (
          <button
            key={level}
            style={energyBtnStyle(level)}
            onClick={() => setEnergy(level as 1|2|3|4|5)}
            title={`Set energy to ${level}`}
          >
            {level}
          </button>
        ))}
      </div>

      <button
        style={themeButtonStyle}
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      <div style={containerStyle}>
        <Orb
          size="lg"
          breathing={true}
          onClick={suggestedTask ? () => handleStartTask(suggestedTask) : undefined}
        />

        {suggestedTask ? (
          <div style={taskContainerStyle}>
            <Card>
              <div style={verbLabelStyle}>{suggestedTask.verbLabel}</div>
              <div style={taskBodyStyle}>{suggestedTask.taskBody}</div>
              <div style={timeStyle}>
                {suggestedTask.timeEstimate} min · {suggestedTask.feedLevel} energy
              </div>
              <div style={actionsStyle}>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleStartTask(suggestedTask)}
                >
                  Start Now
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => handleDeferTask(suggestedTask.id)}
                >
                  Not Today
                </Button>
              </div>
            </Card>

            {pendingTasks.length > 1 && (
              <p style={{ ...emptyStateStyle, fontSize: 'var(--text-sm)', marginTop: 'var(--space-md)' }}>
                {pendingTasks.length - 1} more task{pendingTasks.length > 2 ? 's' : ''} waiting
              </p>
            )}
          </div>
        ) : (
          <div>
            <p style={emptyStateStyle}>No tasks for now.</p>
            <p style={{ ...emptyStateStyle, fontSize: 'var(--text-sm)', marginTop: 'var(--space-sm)' }}>
              Take a breath. You deserve it.
            </p>
          </div>
        )}
      </div>

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
