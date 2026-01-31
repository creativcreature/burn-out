import { CSSProperties } from 'react'
import { Card } from '../shared/Card'
import { ProjectBadge } from '../shared/ProjectBadge'
import type { Task, Project } from '../../data/types'

interface ProjectTaskCardProps {
  task: Task
  project?: Project
  variant?: 'featured' | 'list'
  onStart?: () => void
  onProjectOverview?: () => void
  onEdit?: () => void
  onProjectClick?: () => void
}

export function ProjectTaskCard({
  task,
  project,
  variant = 'list',
  onStart,
  onProjectOverview,
  onEdit,
  onProjectClick
}: ProjectTaskCardProps) {
  const isFeatured = variant === 'featured'

  const containerStyle: CSSProperties = {
    marginBottom: isFeatured ? 'var(--space-md)' : 'var(--space-sm)'
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    marginBottom: 'var(--space-sm)'
  }

  const verbStyle: CSSProperties = {
    fontWeight: 600,
    color: 'var(--orb-orange)',
    fontSize: isFeatured ? 'var(--text-lg)' : 'var(--text-md)'
  }

  const bodyStyle: CSSProperties = {
    color: 'var(--text)',
    fontSize: isFeatured ? 'var(--text-md)' : 'var(--text-sm)',
    marginBottom: 'var(--space-sm)'
  }

  const metaStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-md)',
    color: 'var(--text-muted)',
    fontSize: 'var(--text-xs)'
  }

  const tagsStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-xs)',
    marginTop: 'var(--space-sm)'
  }

  const tagStyle: CSSProperties = {
    padding: '2px 8px',
    background: 'var(--bg)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)'
  }

  const actionsStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-sm)',
    marginTop: 'var(--space-md)',
    borderTop: '1px solid var(--border)',
    paddingTop: 'var(--space-md)'
  }

  const actionBtnStyle = (primary: boolean): CSSProperties => ({
    flex: 1,
    padding: isFeatured ? 'var(--space-sm) var(--space-md)' : 'var(--space-xs) var(--space-sm)',
    background: primary ? 'var(--orb-orange)' : 'transparent',
    border: primary ? 'none' : '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: primary ? 'white' : 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: isFeatured ? 'var(--text-md)' : 'var(--text-sm)',
    fontWeight: primary ? 600 : 400,
    transition: 'all var(--transition-fast)'
  })

  const feedLevelColors = {
    low: '#10b981',
    medium: '#fbbf24',
    high: '#ef4444'
  }

  return (
    <div style={containerStyle}>
      <Card padding={isFeatured ? 'lg' : 'md'} onClick={onEdit}>
        <div style={headerStyle}>
          {project && (
            <ProjectBadge project={project} onClick={onProjectClick} />
          )}
          <span style={verbStyle}>{task.verbLabel}</span>
        </div>

        <div style={bodyStyle}>{task.taskBody}</div>

        <div style={metaStyle}>
          <span>{task.timeEstimate} min</span>
          <span style={{ color: feedLevelColors[task.feedLevel] }}>
            {task.feedLevel} energy
          </span>
          {task.scheduledFor && (
            <span>Due: {new Date(task.scheduledFor).toLocaleDateString()}</span>
          )}
        </div>

        {task.timeOfDay && task.timeOfDay !== 'anytime' && (
          <div style={tagsStyle}>
            <span style={tagStyle}>{task.timeOfDay}</span>
          </div>
        )}

        {(onStart || onProjectOverview) && task.status === 'pending' && (
          <div style={actionsStyle} onClick={e => e.stopPropagation()}>
            {onStart && (
              <button style={actionBtnStyle(true)} onClick={onStart}>
                Start Task
              </button>
            )}
            {onProjectOverview && (
              <button style={actionBtnStyle(false)} onClick={onProjectOverview}>
                Project Overview
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
