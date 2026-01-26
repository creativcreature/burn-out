import { useState, CSSProperties } from 'react'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'
import type { ExtractedTask } from '../../utils/ai'
import type { Goal, Project, FeedLevel } from '../../data/types'
import { FEED_LEVELS, TIME_ESTIMATES } from '../../data/constants'

interface TaskPreviewCardProps {
  task: ExtractedTask
  goals: Goal[]
  projects: Project[]
  onSave: (task: ExtractedTask & { goalId?: string; projectId?: string }) => void
  onDiscard: () => void
}

export function TaskPreviewCard({
  task,
  goals,
  projects,
  onSave,
  onDiscard
}: TaskPreviewCardProps) {
  const [editedTask, setEditedTask] = useState({
    verbLabel: task.verbLabel,
    taskBody: task.taskBody,
    timeEstimate: task.timeEstimate,
    feedLevel: task.feedLevel,
    goalId: task.suggestedGoalId || '',
    projectId: task.suggestedProjectId || ''
  })

  const activeGoals = goals.filter(g => !g.archived)
  const availableProjects = editedTask.goalId
    ? projects.filter(p => p.goalId === editedTask.goalId)
    : []

  const handleSave = () => {
    onSave({
      verbLabel: editedTask.verbLabel,
      taskBody: editedTask.taskBody,
      timeEstimate: editedTask.timeEstimate,
      feedLevel: editedTask.feedLevel,
      suggestedGoalId: editedTask.goalId || undefined,
      suggestedProjectId: editedTask.projectId || undefined
    })
  }

  const containerStyle: CSSProperties = {
    marginTop: 'var(--space-md)',
    animation: 'slideUp 0.3s ease-out'
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--space-md)'
  }

  const labelStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    color: 'var(--orb-orange)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }

  const fieldStyle: CSSProperties = {
    marginBottom: 'var(--space-md)'
  }

  const fieldLabelStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)',
    marginBottom: 'var(--space-xs)',
    display: 'block'
  }

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: 'var(--space-sm)',
    fontSize: 'var(--text-sm)',
    background: 'var(--bg-alt)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)',
    outline: 'none'
  }

  const selectStyle: CSSProperties = {
    ...inputStyle,
    cursor: 'pointer'
  }

  const rowStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-sm)'
  }

  const actionsStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-sm)',
    marginTop: 'var(--space-md)'
  }

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div style={containerStyle}>
        <Card>
          <div style={headerStyle}>
            <span style={labelStyle}>Task Extracted</span>
          </div>

          <div style={fieldStyle}>
            <label style={fieldLabelStyle}>Verb Label (max 12 chars)</label>
            <input
              type="text"
              style={inputStyle}
              value={editedTask.verbLabel}
              onChange={(e) => setEditedTask(prev => ({
                ...prev,
                verbLabel: e.target.value.slice(0, 12)
              }))}
              maxLength={12}
            />
          </div>

          <div style={fieldStyle}>
            <label style={fieldLabelStyle}>Task</label>
            <input
              type="text"
              style={inputStyle}
              value={editedTask.taskBody}
              onChange={(e) => setEditedTask(prev => ({
                ...prev,
                taskBody: e.target.value
              }))}
            />
          </div>

          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label style={fieldLabelStyle}>Time</label>
              <select
                style={selectStyle}
                value={editedTask.timeEstimate}
                onChange={(e) => setEditedTask(prev => ({
                  ...prev,
                  timeEstimate: Number(e.target.value)
                }))}
              >
                {TIME_ESTIMATES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div style={fieldStyle}>
              <label style={fieldLabelStyle}>Energy</label>
              <select
                style={selectStyle}
                value={editedTask.feedLevel}
                onChange={(e) => setEditedTask(prev => ({
                  ...prev,
                  feedLevel: e.target.value as FeedLevel
                }))}
              >
                {FEED_LEVELS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          {activeGoals.length > 0 && (
            <div style={fieldStyle}>
              <label style={fieldLabelStyle}>Goal (optional)</label>
              <select
                style={selectStyle}
                value={editedTask.goalId}
                onChange={(e) => setEditedTask(prev => ({
                  ...prev,
                  goalId: e.target.value,
                  projectId: '' // Reset project when goal changes
                }))}
              >
                <option value="">No goal</option>
                {activeGoals.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
          )}

          {availableProjects.length > 0 && (
            <div style={fieldStyle}>
              <label style={fieldLabelStyle}>Project (optional)</label>
              <select
                style={selectStyle}
                value={editedTask.projectId}
                onChange={(e) => setEditedTask(prev => ({
                  ...prev,
                  projectId: e.target.value
                }))}
              >
                <option value="">No project</option>
                {availableProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          <div style={actionsStyle}>
            <Button variant="primary" onClick={handleSave} fullWidth>
              Save Task
            </Button>
            <Button variant="ghost" onClick={onDiscard}>
              Discard
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}
