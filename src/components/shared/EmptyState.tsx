import { CSSProperties, ReactNode } from 'react'

interface EmptyStateProps {
  variant?: 'tasks' | 'goals' | 'completed' | 'reflect' | 'default'
  action?: ReactNode
}

const messages = {
  tasks: {
    title: 'all clear',
    subtitle: 'nothing on your plate right now',
    emoji: '✨'
  },
  goals: {
    title: 'no goals yet',
    subtitle: 'what matters to you?',
    emoji: '🎯'
  },
  completed: {
    title: 'nothing completed yet',
    subtitle: 'small steps count',
    emoji: '🌱'
  },
  reflect: {
    title: 'no reflections yet',
    subtitle: 'take a moment to pause',
    emoji: '🌙'
  },
  default: {
    title: 'nothing here',
    subtitle: 'and that\'s okay',
    emoji: '💫'
  }
}

/**
 * Warm, encouraging empty state component
 * Matches One Day Journal humanist feel
 */
export function EmptyState({ variant = 'default', action }: EmptyStateProps) {
  const { title, subtitle, emoji } = messages[variant]

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-xl) var(--space-md)',
    gap: 'var(--space-sm)',
    textAlign: 'center',
    minHeight: 200
  }

  const emojiStyle: CSSProperties = {
    fontSize: '2.5rem',
    marginBottom: 'var(--space-sm)',
    opacity: 0.8
  }

  const titleStyle: CSSProperties = {
    fontSize: 'var(--text-lg)',
    fontWeight: 600,
    color: 'var(--text)',
    margin: 0
  }

  const subtitleStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)',
    margin: 0,
    fontStyle: 'italic'
  }

  return (
    <div style={containerStyle}>
      <span style={emojiStyle}>{emoji}</span>
      <h3 style={titleStyle}>{title}</h3>
      <p style={subtitleStyle}>{subtitle}</p>
      {action && <div style={{ marginTop: 'var(--space-md)' }}>{action}</div>}
    </div>
  )
}
