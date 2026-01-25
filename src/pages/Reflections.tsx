import { CSSProperties } from 'react'
import { AppLayout, Header } from '../components/layout'
import { Card } from '../components/shared'
import { Garden } from '../components/garden'
import { useTasks } from '../hooks/useTasks'

export function ReflectionsPage() {
  const { tasks, completedTasks } = useTasks()

  const contentStyle: CSSProperties = {
    padding: 'var(--space-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-lg)'
  }

  const statsGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 'var(--space-md)'
  }

  const statCardStyle: CSSProperties = {
    textAlign: 'center'
  }

  const statNumberStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-3xl)',
    fontWeight: 600,
    color: 'var(--orb-orange)'
  }

  const statLabelStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)'
  }

  const sectionTitleStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-lg)',
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: 'var(--space-sm)'
  }

  const noteStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 'var(--space-lg)'
  }

  // Calculate stats (informational, NOT gamified)
  const totalCompleted = completedTasks.length
  const totalPending = tasks.filter(t => t.status === 'pending').length
  const thisWeekCompleted = completedTasks.filter(t => {
    const completedDate = new Date(t.updatedAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return completedDate >= weekAgo
  }).length

  const avgTime = completedTasks.length > 0
    ? Math.round(completedTasks.reduce((sum, t) => sum + (t.timeEstimate || 0), 0) / completedTasks.length)
    : 0

  return (
    <AppLayout>
      <Header title="Reflections" />
      <main style={contentStyle}>
        <section>
          <h2 style={sectionTitleStyle}>Your Progress</h2>
          <div style={statsGridStyle}>
            <Card>
              <div style={statCardStyle}>
                <div style={statNumberStyle}>{totalCompleted}</div>
                <div style={statLabelStyle}>Tasks Completed</div>
              </div>
            </Card>
            <Card>
              <div style={statCardStyle}>
                <div style={statNumberStyle}>{totalPending}</div>
                <div style={statLabelStyle}>In Progress</div>
              </div>
            </Card>
            <Card>
              <div style={statCardStyle}>
                <div style={statNumberStyle}>{thisWeekCompleted}</div>
                <div style={statLabelStyle}>This Week</div>
              </div>
            </Card>
            <Card>
              <div style={statCardStyle}>
                <div style={statNumberStyle}>{avgTime}</div>
                <div style={statLabelStyle}>Avg. Minutes</div>
              </div>
            </Card>
          </div>
        </section>

        <section>
          <h2 style={sectionTitleStyle}>Journal</h2>
          <Card>
            <Garden />
          </Card>
        </section>

        <p style={noteStyle}>
          This is a place to reflect on your journey, not to compete.
          <br />
          Take time to check in with yourself.
        </p>
      </main>
    </AppLayout>
  )
}
