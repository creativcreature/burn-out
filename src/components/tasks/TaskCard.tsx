import { CSSProperties } from 'react'
import { Card } from '../shared/Card'
import type { Task } from '../../data/types'

interface TaskCardProps {
  task: Task
  onStart?: () => void
  onDefer?: () => void
  onEdit?: () => void
  onDelete?: () => void
  showActions?: boolean
  isDragging?: boolean
}

export function TaskCard({
  task,
  onStart,
  onDefer,
  onEdit,
  onDelete,
  showActions = true,
  isDragging = false
}: TaskCardProps) {
  const containerStyle: CSSProperties = {
    opacity: isDragging ? 0.5 : 1,
    transform: isDragging ? 'scale(1.02)' : 'none',
    transition: 'all var(--transition-fast)'
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 'var(--space-sm)'
  }

  const verbStyle: CSSProperties = {
    fontWeight: 600,
    color: 'var(--accent-primary)',
    fontSize: 'var(--text-md)'
  }

  const bodyStyle: CSSProperties = {
    color: 'var(--text-primary)',
    fontSize: 'var(--text-sm)',
    marginBottom: 'var(--space-sm)'
  }

  const metaStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-md)',
    color: 'var(--text-muted)',
    fontSize: 'var(--text-xs)'
  }

  const actionsStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-sm)',
    marginTop: 'var(--space-md)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: 'var(--space-sm)'
  }

  const actionBtnStyle: CSSProperties = {
    flex: 1,
    padding: 'var(--space-xs) var(--space-sm)',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: 'var(--text-xs)',
    transition: 'all var(--transition-fast)'
  }

  const feedLevelColors = {
    low: '#10b981',
    medium: '#fbbf24',
    high: '#ef4444'
  }

  const statusBadgeStyle: CSSProperties = {
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)',
    background: task.status === 'completed' ? '#10b981' :
                task.status === 'deferred' ? '#fbbf24' : 'var(--border-color)',
    color: task.status === 'pending' ? 'var(--text-secondary)' : 'white'
  }

  return (
    <div style={containerStyle}>
      <Card onClick={onEdit}>
        <div style={headerStyle}>
          <span style={verbStyle}>{task.verbLabel}</span>
          {task.status !== 'pending' && (
            <span style={statusBadgeStyle}>{task.status}</span>
          )}
        </div>

        <div style={bodyStyle}>{task.taskBody}</div>

        <div style={metaStyle}>
          <span>{task.timeEstimate} min</span>
          <span style={{ color: feedLevelColors[task.feedLevel] }}>
            {task.feedLevel} energy
          </span>
          {task.timeOfDay && task.timeOfDay !== 'anytime' && (
            <span>{task.timeOfDay}</span>
          )}
        </div>

        {showActions && task.status === 'pending' && (
          <div style={actionsStyle} onClick={e => e.stopPropagation()}>
            {onStart && (
              <button style={{ ...actionBtnStyle, background: 'var(--accent-primary)', color: 'white', border: 'none' }} onClick={onStart}>
                Start
              </button>
            )}
            {onDefer && (
              <button style={actionBtnStyle} onClick={onDefer}>
                Not Today
              </button>
            )}
            {onDelete && (
              <button style={{ ...actionBtnStyle, color: 'var(--accent-tertiary)' }} onClick={onDelete}>
                Delete
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
