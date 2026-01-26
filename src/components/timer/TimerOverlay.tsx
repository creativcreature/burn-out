import { CSSProperties } from 'react'
import { Tag } from '../shared'
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
    zIndex: 2000,
    padding: 'var(--space-xl)',
    paddingTop: 'calc(var(--safe-top) + 80px)',
    overflowY: 'auto'
  }

  const backButtonStyle: CSSProperties = {
    position: 'absolute',
    top: 'calc(var(--safe-top) + 70px)',
    left: 'var(--space-lg)',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  }

  const contentStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: 400,
    margin: '0 auto',
    width: '100%'
  }

  const taskTitleStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '56px',
    fontWeight: 400,
    color: 'var(--text)',
    marginBottom: 'var(--space-xs)'
  }

  const taskSubtitleStyle: CSSProperties = {
    fontSize: 'var(--text-lg)',
    color: 'var(--text)',
    marginBottom: 'var(--space-xl)'
  }

  const timerStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '48px',
    fontWeight: 400,
    color: 'var(--text)',
    letterSpacing: '-1px',
    marginBottom: 'var(--space-lg)'
  }

  const controlsStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-md)',
    alignItems: 'center',
    marginBottom: 'var(--space-2xl)'
  }

  const controlButtonStyle = (isActive: boolean = false): CSSProperties => ({
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: '2px solid var(--purple-500, #7C3AED)',
    background: isActive ? 'var(--purple-500, #7C3AED)' : 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)'
  })

  const iconStyle = (isActive: boolean = false): CSSProperties => ({
    color: isActive ? 'white' : 'var(--purple-500, #7C3AED)',
    width: 20,
    height: 20
  })

  const dueSectionStyle: CSSProperties = {
    width: '100%',
    textAlign: 'left',
    borderTop: '1px solid var(--border)',
    paddingTop: 'var(--space-lg)',
    marginBottom: 'var(--space-md)'
  }

  const dueHeaderStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 'var(--space-md)'
  }

  const dueLabelStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)',
    textTransform: 'lowercase'
  }

  const dueValueStyle: CSSProperties = {
    fontSize: 'var(--text-xl)',
    fontWeight: 500,
    color: 'var(--text)'
  }

  const metaStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
    color: 'var(--text-muted)',
    fontSize: 'var(--text-sm)'
  }

  const tagsRowStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-xs)',
    marginBottom: 'var(--space-lg)'
  }

  const notesSectionStyle: CSSProperties = {
    width: '100%',
    textAlign: 'left'
  }

  const notesLabelStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)',
    marginBottom: 'var(--space-xs)'
  }

  const notesTextStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    lineHeight: 1.6
  }

  // Format time as HH:MM:SS
  const formatTimeHMS = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getEnergyBolts = (level: string) => {
    const num = level === 'low' ? 1 : level === 'medium' ? 2 : 3
    return Array(3).fill(0).map((_, i) => (
      <span key={i} style={{ opacity: i >= num ? 0.3 : 1 }}>⚡</span>
    ))
  }

  const handleStop = () => {
    const elapsed = Math.floor((timer.totalSeconds - timer.remainingSeconds) / 60)
    onComplete(elapsed > 0 ? elapsed : 1)
  }

  const handlePlayPause = () => {
    if (!timer.isRunning) {
      timer.start()
    } else if (timer.isPaused) {
      timer.resume()
    } else {
      timer.pause()
    }
  }

  const isPlaying = timer.isRunning && !timer.isPaused

  return (
    <div style={overlayStyle}>
      <button style={backButtonStyle} onClick={onCancel}>
        ← Back
      </button>

      <div style={contentStyle}>
        <h1 style={taskTitleStyle}>Task.</h1>
        <p style={taskSubtitleStyle}>{task.taskBody || task.verbLabel}</p>

        <div style={timerStyle}>{formatTimeHMS(timer.remainingSeconds)}</div>

        <div style={controlsStyle}>
          {/* Stop button */}
          <button
            style={controlButtonStyle(false)}
            onClick={handleStop}
            title="Stop and complete"
          >
            <svg style={iconStyle(false)} viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>

          {/* Play/Pause toggle */}
          <button
            style={controlButtonStyle(isPlaying)}
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg style={iconStyle(true)} viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg style={iconStyle(false)} viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" />
              </svg>
            )}
          </button>

          {/* Pause button (always visible) */}
          <button
            style={controlButtonStyle(false)}
            onClick={() => timer.isPaused ? timer.resume() : timer.pause()}
            title="Pause"
            disabled={!timer.isRunning}
          >
            <svg style={{ ...iconStyle(false), opacity: timer.isRunning ? 1 : 0.4 }} viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          </button>
        </div>

        {/* Due section */}
        <div style={dueSectionStyle}>
          <div style={dueHeaderStyle}>
            <div>
              <div style={dueLabelStyle}>due</div>
              <div style={dueValueStyle}>today, 2:30pm</div>
            </div>
            <div style={metaStyle}>
              <span>{getEnergyBolts(task.feedLevel)}</span>
              <span>◷ {task.timeEstimate} mins</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div style={tagsRowStyle}>
          <Tag variant="energy">Energy</Tag>
          <Tag variant="focus">Focus</Tag>
          <Tag variant="call">Call</Tag>
          <Tag variant="meeting">Meeting</Tag>
          <Tag variant="writing">Writing</Tag>
        </div>

        {/* Notes section */}
        {task.taskBody && (
          <div style={notesSectionStyle}>
            <div style={notesLabelStyle}>Notes:</div>
            <div style={notesTextStyle}>{task.taskBody}</div>
          </div>
        )}
      </div>
    </div>
  )
}
