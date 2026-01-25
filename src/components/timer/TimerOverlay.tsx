import { CSSProperties } from 'react'
import { Orb } from '../shared/Orb'
import { Button } from '../shared/Button'
import { useTimer } from '../../hooks/useTimer'
import type { Task } from '../../data/types'

interface TimerOverlayProps {
  task: Task
  isOpen: boolean
  onComplete: (duration: number) => void
  onCancel: () => void
}

export function TimerOverlay({ task, isOpen, onComplete, onCancel }: TimerOverlayProps) {
  const timer = useTimer({
    initialMinutes: task.timeEstimate,
    onComplete: () => onComplete(task.timeEstimate)
  })

  if (!isOpen) return null

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: 'var(--space-xl)'
  }

  const contentStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-xl)',
    textAlign: 'center',
    maxWidth: 400
  }

  const timerStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '72px',
    fontWeight: 600,
    color: 'var(--text)',
    letterSpacing: '-2px'
  }

  const taskInfoStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)'
  }

  const verbStyle: CSSProperties = {
    color: 'var(--orb-orange)',
    fontSize: 'var(--text-lg)',
    fontWeight: 600
  }

  const bodyStyle: CSSProperties = {
    color: 'var(--text-muted)',
    fontSize: 'var(--text-md)'
  }

  const actionsStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-md)',
    marginTop: 'var(--space-lg)'
  }

  const progressStyle: CSSProperties = {
    width: 200,
    height: 4,
    background: 'var(--border)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden'
  }

  const progressBarStyle: CSSProperties = {
    height: '100%',
    background: 'var(--orb-orange)',
    width: `${timer.progress * 100}%`,
    transition: 'width 1s linear'
  }

  return (
    <div style={overlayStyle}>
      <div style={contentStyle}>
        <Orb size="md" breathing={timer.isRunning && !timer.isPaused} />

        <div style={timerStyle}>{timer.formatted}</div>

        <div style={progressStyle}>
          <div style={progressBarStyle} />
        </div>

        <div style={taskInfoStyle}>
          <span style={verbStyle}>{task.verbLabel}</span>
          <span style={bodyStyle}>{task.taskBody}</span>
        </div>

        <div style={actionsStyle}>
          {!timer.isRunning ? (
            <Button variant="primary" size="lg" onClick={() => timer.start()}>
              Start
            </Button>
          ) : timer.isPaused ? (
            <>
              <Button variant="primary" onClick={() => timer.resume()}>
                Resume
              </Button>
              <Button variant="secondary" onClick={() => onComplete(Math.floor((timer.totalSeconds - timer.remainingSeconds) / 60))}>
                End Early
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => timer.pause()}>
                Pause
              </Button>
              <Button variant="ghost" onClick={() => timer.addMinutes(5)}>
                +5 min
              </Button>
            </>
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
