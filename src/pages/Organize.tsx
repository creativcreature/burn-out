import { useState, CSSProperties } from 'react'
import { AppLayout, Header } from '../components/layout'
import { Card, Button, Input, Modal, Toast } from '../components/shared'
import { useTasks } from '../hooks/useTasks'
import { useGoals } from '../hooks/useGoals'
import { useProjects } from '../hooks/useProjects'
import { VERB_LABEL_EXAMPLES, TIME_ESTIMATES, FEED_LEVELS } from '../data/constants'
import type { FeedLevel, TimeOfDay } from '../data/types'

type TabType = 'tasks' | 'goals' | 'projects'

export function OrganizePage() {
  const { pendingTasks, completedTasks, addTask, deleteTask, reorderTasks, isLoading: tasksLoading } = useTasks()
  const { activeGoals, addGoal, deleteGoal, isLoading: goalsLoading } = useGoals()
  const { projects, addProject, deleteProject, isLoading: projectsLoading } = useProjects()

  const [activeTab, setActiveTab] = useState<TabType>('tasks')
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' as const, visible: false })

  // Task form state
  const [newTask, setNewTask] = useState({
    verbLabel: '',
    taskBody: '',
    timeEstimate: 15,
    feedLevel: 'medium' as FeedLevel,
    timeOfDay: 'anytime' as TimeOfDay,
    goalId: '',
    projectId: ''
  })

  // Goal form state
  const [newGoal, setNewGoal] = useState({ title: '', description: '' })

  // Project form state
  const [newProject, setNewProject] = useState({ title: '', description: '', goalId: '' })

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const isLoading = tasksLoading || goalsLoading || projectsLoading

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newTasks = [...pendingTasks]
    const [removed] = newTasks.splice(draggedIndex, 1)
    newTasks.splice(index, 0, removed)
    reorderTasks(newTasks)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleAddTask = async () => {
    if (!newTask.verbLabel || !newTask.taskBody) return

    await addTask({
      verbLabel: newTask.verbLabel,
      taskBody: newTask.taskBody,
      timeEstimate: newTask.timeEstimate,
      feedLevel: newTask.feedLevel,
      timeOfDay: newTask.timeOfDay,
      goalId: newTask.goalId || undefined,
      projectId: newTask.projectId || undefined
    })

    setNewTask({
      verbLabel: '',
      taskBody: '',
      timeEstimate: 15,
      feedLevel: 'medium',
      timeOfDay: 'anytime',
      goalId: '',
      projectId: ''
    })
    setShowAddModal(false)
    setToast({ message: 'Task created!', type: 'success', visible: true })
  }

  const handleAddGoal = async () => {
    if (!newGoal.title) return

    await addGoal({
      title: newGoal.title,
      description: newGoal.description || undefined
    })

    setNewGoal({ title: '', description: '' })
    setShowAddModal(false)
    setToast({ message: 'Goal created!', type: 'success', visible: true })
  }

  const handleAddProject = async () => {
    if (!newProject.title || !newProject.goalId) return

    await addProject({
      title: newProject.title,
      description: newProject.description || undefined,
      goalId: newProject.goalId
    })

    setNewProject({ title: '', description: '', goalId: '' })
    setShowAddModal(false)
    setToast({ message: 'Project created!', type: 'success', visible: true })
  }

  const contentStyle: CSSProperties = {
    padding: 'var(--space-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  }

  const tabsStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-xs)',
    background: 'var(--bg-card)',
    padding: 'var(--space-xs)',
    borderRadius: 'var(--radius-md)'
  }

  const tabStyle = (isActive: boolean): CSSProperties => ({
    flex: 1,
    padding: 'var(--space-sm)',
    background: isActive ? 'var(--accent-primary)' : 'transparent',
    color: isActive ? 'white' : 'var(--text-secondary)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 'var(--text-sm)',
    transition: 'all var(--transition-fast)'
  })

  const sectionStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)'
  }

  const itemStyle = (isDragging: boolean): CSSProperties => ({
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab'
  })

  const selectStyle: CSSProperties = {
    width: '100%',
    padding: 'var(--space-sm) var(--space-md)',
    fontSize: 'var(--text-md)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)'
  }

  const formStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  }

  if (isLoading) {
    return (
      <AppLayout>
        <Header title="Organize" />
        <div style={contentStyle}>
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Header title="Organize" />
      <main style={contentStyle}>
        <div style={tabsStyle}>
          <button style={tabStyle(activeTab === 'tasks')} onClick={() => setActiveTab('tasks')}>
            Tasks ({pendingTasks.length})
          </button>
          <button style={tabStyle(activeTab === 'goals')} onClick={() => setActiveTab('goals')}>
            Goals ({activeGoals.length})
          </button>
          <button style={tabStyle(activeTab === 'projects')} onClick={() => setActiveTab('projects')}>
            Projects ({projects.length})
          </button>
        </div>

        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Add {activeTab === 'tasks' ? 'Task' : activeTab === 'goals' ? 'Goal' : 'Project'}
        </Button>

        {activeTab === 'tasks' && (
          <section style={sectionStyle}>
            {pendingTasks.length === 0 ? (
              <Card>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  No tasks yet. Add one to get started.
                </p>
              </Card>
            ) : (
              pendingTasks.map((task, index) => (
                <div
                  key={task.id}
                  style={itemStyle(draggedIndex === index)}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                          {task.verbLabel}
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                          {task.taskBody}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-xs)' }}>
                          {task.timeEstimate} min · {task.feedLevel} energy
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
                        ×
                      </Button>
                    </div>
                  </Card>
                </div>
              ))
            )}

            {completedTasks.length > 0 && (
              <>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-md)' }}>
                  Completed ({completedTasks.length})
                </h3>
                {completedTasks.slice(0, 3).map(task => (
                  <Card key={task.id}>
                    <div style={{ opacity: 0.6 }}>
                      <span style={{ fontWeight: 600 }}>{task.verbLabel}</span> — {task.taskBody}
                    </div>
                  </Card>
                ))}
              </>
            )}
          </section>
        )}

        {activeTab === 'goals' && (
          <section style={sectionStyle}>
            {activeGoals.length === 0 ? (
              <Card>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  No goals yet. Goals help you stay focused on what matters.
                </p>
              </Card>
            ) : (
              activeGoals.map(goal => (
                <Card key={goal.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{goal.title}</div>
                      {goal.description && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                          {goal.description}
                        </div>
                      )}
                      <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-xs)' }}>
                        {projects.filter(p => p.goalId === goal.id).length} project(s) ·{' '}
                        {pendingTasks.filter(t => t.goalId === goal.id).length} task(s)
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)}>
                      ×
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </section>
        )}

        {activeTab === 'projects' && (
          <section style={sectionStyle}>
            {projects.length === 0 ? (
              <Card>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  No projects yet. Projects are milestones within your goals.
                </p>
              </Card>
            ) : (
              projects.map(project => {
                const goal = activeGoals.find(g => g.id === project.goalId)
                return (
                  <Card key={project.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{project.title}</div>
                        {goal && (
                          <div style={{ color: 'var(--accent-primary)', fontSize: 'var(--text-xs)' }}>
                            {goal.title}
                          </div>
                        )}
                        {project.description && (
                          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                            {project.description}
                          </div>
                        )}
                        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-xs)' }}>
                          {pendingTasks.filter(t => t.projectId === project.id).length} task(s) · {project.status}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteProject(project.id)}>
                        ×
                      </Button>
                    </div>
                  </Card>
                )
              })
            )}
          </section>
        )}
      </main>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add ${activeTab === 'tasks' ? 'Task' : activeTab === 'goals' ? 'Goal' : 'Project'}`}
      >
        {activeTab === 'tasks' && (
          <div style={formStyle}>
            <Input
              label="Verb Label (max 12 chars)"
              placeholder="e.g., Deep Work"
              value={newTask.verbLabel}
              onChange={(value) => setNewTask(prev => ({ ...prev, verbLabel: value.slice(0, 12) }))}
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
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-xs)' }}>
                Time Estimate
              </label>
              <select
                style={selectStyle}
                value={newTask.timeEstimate}
                onChange={(e) => setNewTask(prev => ({ ...prev, timeEstimate: Number(e.target.value) }))}
              >
                {TIME_ESTIMATES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-xs)' }}>
                Energy Required
              </label>
              <select
                style={selectStyle}
                value={newTask.feedLevel}
                onChange={(e) => setNewTask(prev => ({ ...prev, feedLevel: e.target.value as FeedLevel }))}
              >
                {FEED_LEVELS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            {activeGoals.length > 0 && (
              <div>
                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-xs)' }}>
                  Goal (optional)
                </label>
                <select
                  style={selectStyle}
                  value={newTask.goalId}
                  onChange={(e) => setNewTask(prev => ({ ...prev, goalId: e.target.value }))}
                >
                  <option value="">No goal</option>
                  {activeGoals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
            )}
            <Button variant="primary" onClick={handleAddTask}>Create Task</Button>
          </div>
        )}

        {activeTab === 'goals' && (
          <div style={formStyle}>
            <Input
              label="Goal Title"
              placeholder="What do you want to achieve?"
              value={newGoal.title}
              onChange={(value) => setNewGoal(prev => ({ ...prev, title: value }))}
            />
            <Input
              label="Description (optional)"
              placeholder="Why is this important to you?"
              value={newGoal.description}
              onChange={(value) => setNewGoal(prev => ({ ...prev, description: value }))}
            />
            <Button variant="primary" onClick={handleAddGoal}>Create Goal</Button>
          </div>
        )}

        {activeTab === 'projects' && (
          <div style={formStyle}>
            <Input
              label="Project Title"
              placeholder="Name this milestone"
              value={newProject.title}
              onChange={(value) => setNewProject(prev => ({ ...prev, title: value }))}
            />
            <div>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-xs)' }}>
                Goal *
              </label>
              <select
                style={selectStyle}
                value={newProject.goalId}
                onChange={(e) => setNewProject(prev => ({ ...prev, goalId: e.target.value }))}
              >
                <option value="">Select a goal</option>
                {activeGoals.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
            <Input
              label="Description (optional)"
              placeholder="What does this project involve?"
              value={newProject.description}
              onChange={(value) => setNewProject(prev => ({ ...prev, description: value }))}
            />
            <Button variant="primary" onClick={handleAddProject} disabled={!newProject.goalId}>
              Create Project
            </Button>
          </div>
        )}
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(t => ({ ...t, visible: false }))}
      />
    </AppLayout>
  )
}
