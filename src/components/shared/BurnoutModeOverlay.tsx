import { useState, CSSProperties } from 'react'
import type { Task } from '../../data/types'
import { Orb } from './Orb'
import { Button } from './Button'

interface BurnoutModeOverlayProps {
  isActive: boolean
  tasks: Task[]
  onComplete: (taskId: string) => void
  onSkip: (taskId: string) => void
  onRest: () => void
  onExit: () => void
}

type OverlayState = 'task' | 'completed' | 'rest'

/**
 * Burnout Mode Overlay
 * Full-screen simplified interface when user is overwhelmed
 * Shows one gentle task at a time with supportive messaging
 */
export function BurnoutModeOverlay({
  isActive,
  tasks,
  onComplete,
  onSkip,
  onRest,
  onExit
}: BurnoutModeOverlayProps) {
  const [state, setState] = useState<OverlayState>('task')
  const [tasksCompletedInSession, setTasksCompletedInSession] = useState(0)

  if (!isActive) return null

  // Get the most gentle task (already filtered by useEnergy, but we take first 3 max)
  const currentTask = tasks[0]

  const handleDone = () => {
    if (currentTask) {
      onComplete(currentTask.id)
      setTasksCompletedInSession(prev => prev + 1)
      setState('completed')
    }
  }

  const handleNotNow = () => {
    if (currentTask) {
      onSkip(currentTask.id)
    }
  }

  const handleOneMore = () => {
    setState('task')
  }

  const handleImDone = () => {
    onExit()
    setState('task')
    setTasksCompletedInSession(0)
  }

  const handleRestInstead = () => {
    onRest()
    setState('rest')
  }

  const handleImReady = () => {
    setState('task')
  }

  // Styles
  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'var(--bg-primary)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-xl)',
    filter: 'grayscale(30%)',
    animation: 'fadeIn 0.5s ease'
  }

  const orbContainerStyle: CSSProperties = {
    opacity: 0.5,
    transform: 'scale(0.7)',
    marginBottom: 'var(--space-xl)'
  }

  const messageStyle: CSSProperties = {
    fontSize: 'var(--text-xl)',
    color: 'var(--text)',
    textAlign: 'center',
    marginBottom: 'var(--space-lg)',
    fontFamily: 'var(--font-display)',
    fontWeight: 400
  }

  const subMessageStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginBottom: 'var(--space-xl)',
    maxWidth: '280px'
  }

  const taskCardStyle: CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-lg)',
    width: '100%',
    maxWidth: '320px',
    marginBottom: 'var(--space-xl)',
    textAlign: 'center'
  }

  const taskTitleStyle: CSSProperties = {
    fontSize: 'var(--text-lg)',
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: 'var(--space-xs)'
  }

  const taskBodyStyle: CSSProperties = {
    fontSize: 'var(--text-md)',
    color: 'var(--text-muted)'
  }

  const buttonsRowStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-md)',
    marginBottom: 'var(--space-xl)'
  }

  const restLinkStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-subtle)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: '4px'
  }

  // Supportive messages
  const messages = {
    task: {
      main: 'hey, it\'s okay',
      sub: 'one thing at a time. no pressure at all.'
    },
    completed: {
      main: 'you did it ♡',
      sub: tasksCompletedInSession >= 3
        ? 'you\'re doing great. ready to see more options?'
        : 'that\'s enough for now, or keep going if you want.'
    },
    rest: {
      main: 'take all the time you need',
      sub: 'nothing is urgent. rest is productive too.'
    },
    noTasks: {
      main: 'nothing gentle enough right now',
      sub: 'let\'s just rest. the tasks will be here when you\'re ready.'
    }
  }

  // TASK VIEW
  if (state === 'task') {
    if (!currentTask) {
      return (
        <div style={overlayStyle}>
          <div style={orbContainerStyle}>
            <Orb size="md" breathing={true} />
          </div>
          <h2 style={messageStyle}>{messages.noTasks.main}</h2>
          <p style={subMessageStyle}>{messages.noTasks.sub}</p>
          <div style={buttonsRowStyle}>
            <Button variant="secondary" onClick={handleRestInstead}>
              rest for now
            </Button>
            <Button variant="secondary" onClick={onExit}>
              exit burnout mode
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div style={overlayStyle}>
        <div style={orbContainerStyle}>
          <Orb size="md" breathing={true} />
        </div>

        <h2 style={messageStyle}>{messages.task.main}</h2>
        <p style={subMessageStyle}>{messages.task.sub}</p>

        <div style={taskCardStyle}>
          <div style={taskTitleStyle}>{currentTask.verbLabel}</div>
          <div style={taskBodyStyle}>{currentTask.taskBody}</div>
        </div>

        <div style={buttonsRowStyle}>
          <Button variant="primary" onClick={handleDone}>
            done
          </Button>
          <Button variant="secondary" onClick={handleNotNow}>
            not right now
          </Button>
        </div>

        <button style={restLinkStyle} onClick={handleRestInstead}>
          need a break? rest instead
        </button>
      </div>
    )
  }

  // COMPLETED VIEW
  if (state === 'completed') {
    return (
      <div style={overlayStyle}>
        <div style={orbContainerStyle}>
          <Orb size="md" breathing={true} />
        </div>

        <h2 style={messageStyle}>{messages.completed.main}</h2>
        <p style={subMessageStyle}>{messages.completed.sub}</p>

        <div style={buttonsRowStyle}>
          {tasks.length > 0 && (
            <Button variant="secondary" onClick={handleOneMore}>
              one more
            </Button>
          )}
          <Button
            variant={tasksCompletedInSession >= 3 ? 'primary' : 'secondary'}
            onClick={handleImDone}
          >
            {tasksCompletedInSession >= 3 ? 'yes, show me more' : 'i\'m done'}
          </Button>
        </div>

        {tasksCompletedInSession < 3 && (
          <button style={restLinkStyle} onClick={handleRestInstead}>
            or rest instead
          </button>
        )}
      </div>
    )
  }

  // REST VIEW
  return (
    <div style={overlayStyle}>
      <div style={{ ...orbContainerStyle, opacity: 0.3 }}>
        <Orb size="md" breathing={true} />
      </div>

      <h2 style={messageStyle}>{messages.rest.main}</h2>
      <p style={subMessageStyle}>{messages.rest.sub}</p>

      <Button variant="secondary" onClick={handleImReady}>
        i'm ready
      </Button>
    </div>
  )
}
