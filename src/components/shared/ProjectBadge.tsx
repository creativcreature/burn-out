import { CSSProperties, MouseEvent } from 'react'
import type { Project } from '../../data/types'

interface ProjectBadgeProps {
  project: Project
  onClick?: () => void
}

export function ProjectBadge({ project, onClick }: ProjectBadgeProps) {
  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    padding: '4px 12px',
    background: 'var(--orb-orange)',
    color: 'white',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)',
    fontWeight: 500,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap'
  }

  const handleClick = (e: MouseEvent) => {
    if (onClick) {
      e.stopPropagation()
      onClick()
    }
  }

  return (
    <span
      style={badgeStyle}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      Project: {project.title}
    </span>
  )
}
