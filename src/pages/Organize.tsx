import { useState, CSSProperties } from 'react'
import { AppLayout, Header } from '../components/layout'
import { Card, Button, Input } from '../components/shared'
import { useTasks } from '../hooks/useTasks'
import { VERB_LABEL_EXAMPLES, TIME_ESTIMATES, FEED_LEVELS } from '../data/constants'
import type { FeedLevel, TimeOfDay } from '../data/types'

export function OrganizePage() {
  const { pendingTasks, completedTasks, addTask, deleteTask, isLoading } = useTasks()
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({
    verbLabel: '',
    taskBody: '',
    timeEstimate: 15,
    feedLevel: 'medium' as FeedLevel,
    timeOfDay: 'anytime' as TimeOfDay
  })

  const contentStyle: CSSProperties = {
    padding: 'var(--space-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  }

  const sectionStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)'
  }

  const sectionTitleStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-lg)',
    fontWeight: 600,
    color: 'var(--text-primary)'
  }

  const taskItemStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  const taskInfoStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)'
  }

  const verbStyle: CSSProperties = {
    fontWeight: 600,
    color: 'var(--accent-primary)'
  }

  const bodyStyle: CSSProperties = {
    color: 'var(--text-primary)',
    fontSize: 'var(--text-sm)'
  }

  const metaStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-sm)',
    color: 'var(--text-secondary)',
    fontSize: 'var(--text-xs)'
  }

  const formStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  }

  const selectStyle: CSSProperties = {
    padding: 'var(--space-sm) var(--space-md)',
    fontSize: 'var(--text-md)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)'
  }

  const handleAddTask = async () => {
    if (!newTask.verbLabel || !newTask.taskBody) return

    await addTask(newTask)
    setNewTask({
      verbLabel: '',
      taskBody: '',
      timeEstimate: 15,
      feedLevel: 'medium',
      timeOfDay: 'anytime'
    })
    setShowAddTask(false)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <Header title="Organize" />
        <div style={contentStyle}>
          <p>Loading...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Header title="Organize" />
      <main style={contentStyle}>
        <Button variant="primary" onClick={() => setShowAddTask(!showAddTask)}>
          {showAddTask ? 'Cancel' : 'Add Task'}
        </Button>

        {showAddTask && (
          <Card>
            <div style={formStyle}>
              <Input
                label="Verb Label (max 12 chars)"
                placeholder="e.g., Deep Work"
                value={newTask.verbLabel}
                onChange={(value) => setNewTask(prev => ({
                  ...prev,
                  verbLabel: value.slice(0, 12)
                }))}
                maxLength={12}
              />
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Examples: {VERB_LABEL_EXAMPLES.slice(0, 4).join(', ')}
              </div>

              <Input
                label="Task"
                placeholder="What do you need to do?"
                value={newTask.taskBody}
                onChange={(value) => setNewTask(prev => ({ ...prev, taskBody: value }))}
              />

              <div>
                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Time Estimate
                </label>
                <select
                  style={selectStyle}
                  value={newTask.timeEstimate}
                  onChange={(e) => setNewTask(prev => ({
                    ...prev,
                    timeEstimate: Number(e.target.value)
                  }))}
                >
                  {TIME_ESTIMATES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Energy Required
                </label>
                <select
                  style={selectStyle}
                  value={newTask.feedLevel}
                  onChange={(e) => setNewTask(prev => ({
                    ...prev,
                    feedLevel: e.target.value as FeedLevel
                  }))}
                >
                  {FEED_LEVELS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              <Button variant="primary" onClick={handleAddTask}>
                Create Task
              </Button>
            </div>
          </Card>
        )}

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Pending ({pendingTasks.length})</h2>
          {pendingTasks.map(task => (
            <Card key={task.id}>
              <div style={taskItemStyle}>
                <div style={taskInfoStyle}>
                  <span style={verbStyle}>{task.verbLabel}</span>
                  <span style={bodyStyle}>{task.taskBody}</span>
                  <div style={metaStyle}>
                    <span>{task.timeEstimate} min</span>
                    <span>{task.feedLevel} energy</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
          {pendingTasks.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>No pending tasks</p>
          )}
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Completed ({completedTasks.length})</h2>
          {completedTasks.slice(0, 5).map(task => (
            <Card key={task.id}>
              <div style={taskInfoStyle}>
                <span style={{ ...verbStyle, opacity: 0.6 }}>{task.verbLabel}</span>
                <span style={{ ...bodyStyle, opacity: 0.6 }}>{task.taskBody}</span>
              </div>
            </Card>
          ))}
          {completedTasks.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>No completed tasks yet</p>
          )}
        </section>
      </main>
    </AppLayout>
  )
}
