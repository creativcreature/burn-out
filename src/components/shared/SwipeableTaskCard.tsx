import { CSSProperties, memo } from 'react'
import { useSwipe } from '../../hooks/useSwipe'
import type { Task } from '../../data/types'

interface SwipeableTaskCardProps {
  task: Task
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
  onEdit?: (task: Task) => void
}

/**
 * Task card with swipe gestures
 * Swipe right = complete, Swipe left = delete
 * Tap task text to edit
 */
export const SwipeableTaskCard = memo(function SwipeableTaskCard({
  task,
  onComplete,
  onDelete,
  onEdit
}: SwipeableTaskCardProps) {
  const { swipeX, handlers } = useSwipe({
    threshold: 0.3,
    onSwipeRight: () => {
      // Haptic feedback on complete
      if (navigator.vibrate) navigator.vibrate(10)
      onComplete(task.id)
    },
    onSwipeLeft: () => {
      // Haptic feedback on delete
      if (navigator.vibrate) navigator.vibrate([10, 50, 10])
      onDelete(task.id)
    }
  })

  // Card transforms based on swipe
  const cardStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-sm)',
    padding: 'var(--space-md)',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    transform: `translateX(${swipeX * 80}px) scale(${1 - Math.abs(swipeX) * 0.02})`,
    opacity: 1 - Math.abs(swipeX) * 0.1,
    transition: swipeX === 0 ? 'transform 0.2s ease-out, opacity 0.2s ease-out' : 'none',
    touchAction: 'pan-y',
    position: 'relative',
    overflow: 'hidden'
  }

  // Action indicators
  const leftActionStyle: CSSProperties = {
    position: 'absolute',
    right: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'var(--orb-red)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: Math.max(0, -swipeX * 2),
    marginRight: 'var(--space-sm)',
    fontSize: '1.5rem',
    boxShadow: '0 4px 20px rgba(255, 69, 0, 0.4)'
  }

  const rightActionStyle: CSSProperties = {
    position: 'absolute',
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'var(--success)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: Math.max(0, swipeX * 2),
    marginLeft: 'var(--space-sm)',
    fontSize: '1.5rem',
    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)'
  }

  const checkboxStyle: CSSProperties = {
    width: 24,
    height: 24,
    borderRadius: 'var(--radius-sm)',
    border: '2px solid var(--text-subtle)',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const taskTitleStyle: CSSProperties = {
    flex: 1,
    fontSize: 'var(--text-md)',
    color: 'var(--text)',
    cursor: onEdit ? 'pointer' : 'default'
  }

  const dueDateStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)'
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Left action (delete) - shows when swiping left */}
      <div style={leftActionStyle}>
        <span>🗑️</span>
      </div>

      {/* Right action (complete) - shows when swiping right */}
      <div style={rightActionStyle}>
        <span>✓</span>
      </div>

      {/* Card */}
      <div 
        style={cardStyle} 
        {...handlers}
      >
        {/* Checkbox */}
        <div 
          style={checkboxStyle} 
          onClick={() => onComplete(task.id)}
          role="checkbox"
          aria-checked={false}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onComplete(task.id)}
          aria-label={`Mark "${task.taskBody}" as complete`}
        />
        
        {/* Task content - tap to edit */}
        <div style={{ flex: 1 }} onClick={() => onEdit?.(task)}>
          <div style={taskTitleStyle}>
            {task.taskBody}
            {onEdit && <span style={{ color: 'var(--text-subtle)', marginLeft: '4px', fontSize: 'var(--text-sm)' }}>✎</span>}
          </div>
          {task.scheduledFor && (
            <div style={dueDateStyle}>
              📅 {new Date(task.scheduledFor).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
