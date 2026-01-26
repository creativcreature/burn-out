import { CSSProperties } from 'react'
import { Card } from '../shared/Card'
import { ProjectBadge } from '../shared/ProjectBadge'
import type { Task, Project } from '../../data/types'

interface TaskCardProps {
  task: Task
  project?: Project
  onStart?: () => void
  onDefer?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onProjectClick?: () => void
  showActions?: boolean
  showProjectBadge?: boolean
  isDragging?: boolean
}

export function TaskCard({
  task,
  project,
  onStart,
  onDefer,
  onEdit,
  onDelete,
  onProjectClick,
  showActions = true,
  showProjectBadge = false,
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
    color: 'var(--orb-orange)',
    fontSize: 'var(--text-md)'
  }

  const bodyStyle: CSSProperties = {
    color: 'var(--text)',
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
    borderTop: '1px solid var(--border)',
    paddingTop: 'var(--space-sm)'
  }

  const actionBtnStyle: CSSProperties = {
    flex: 1,
    padding: 'var(--space-xs) var(--space-sm)',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 'var(--text-xs)',
    transition: 'all var(--transition-fast)'
  }

  const feedLevelColors = {
    low: 'var(--success-500)',
    medium: 'var(--warning-500)',
    high: 'var(--error-500)'
  }

  const statusBadgeStyle: CSSProperties = {
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)',
    background: task.status === 'completed' ? 'var(--success-500)' :
      task.status === 'deferred' ? 'var(--warning-500)' : 'var(--border)',
    color: task.status === 'pending' ? 'var(--text-muted)' : 'white'
  }

  return (
    <div style={containerStyle}>
      <Card onClick={onEdit}>
        {showProjectBadge && project && (
          <div style={{ marginBottom: 'var(--space-sm)' }}>
            <ProjectBadge project={project} onClick={onProjectClick} />
          </div>
        )}

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
              <button style={{ ...actionBtnStyle, background: 'var(--orb-orange)', color: 'white', border: 'none' }} onClick={onStart}>
                Start
              </button>
            )}
            {onDefer && (
              <button style={actionBtnStyle} onClick={onDefer}>
                Not Today
              </button>
            )}
            {onDelete && (
              <button style={{ ...actionBtnStyle, color: 'var(--error-500)' }} onClick={onDelete}>
                Delete
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
