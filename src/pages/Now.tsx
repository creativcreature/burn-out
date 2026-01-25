import { CSSProperties } from 'react'
import { AppLayout } from '../components/layout'
import { Orb, Card, Button } from '../components/shared'
import { useThemeContext } from '../components/shared/ThemeProvider'
import { useTasks } from '../hooks/useTasks'

export function NowPage() {
  const { toggleTheme, isDark } = useThemeContext()
  const { pendingTasks, completeTask, deferTask, isLoading } = useTasks()

  // Get the first pending task to show
  const currentTask = pendingTasks[0]

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

  const orbContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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

  const themeButtonStyle: CSSProperties = {
    position: 'absolute' as const,
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

  if (isLoading) {
    return (
      <AppLayout>
        <div style={containerStyle}>
          <Orb size="lg" breathing={true} />
          <p style={emptyStateStyle}>Loading...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
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
        <div style={orbContainerStyle}>
          <Orb
            size="lg"
            breathing={true}
            onClick={currentTask ? () => completeTask(currentTask.id) : undefined}
          />
        </div>

        {currentTask ? (
          <div style={taskContainerStyle}>
            <Card>
              <div style={verbLabelStyle}>{currentTask.verbLabel}</div>
              <div style={taskBodyStyle}>{currentTask.taskBody}</div>
              <div style={timeStyle}>
                {currentTask.timeEstimate} min
              </div>
              <div style={actionsStyle}>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => completeTask(currentTask.id)}
                >
                  Start Now
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => deferTask(currentTask.id)}
                >
                  Not Today
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <p style={emptyStateStyle}>
            No tasks for now. Take a breath.
          </p>
        )}
      </div>
    </AppLayout>
  )
}
