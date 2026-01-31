import { useState, useEffect, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout, Header } from '../components/layout'
import { Card, Button, Input, Modal, Toast } from '../components/shared'
import { useTasks } from '../hooks/useTasks'
import { getData, setPinnedTaskId } from '../utils/storage'
import { useGoals } from '../hooks/useGoals'
import { useProjects } from '../hooks/useProjects'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import { VERB_LABEL_EXAMPLES, TIME_ESTIMATES, FEED_LEVELS, GOAL_TIMEFRAMES } from '../data/constants'
import type { FeedLevel, TimeOfDay, Task, Goal, GoalTimeframe } from '../data/types'

type TabType = 'goals' | 'projects' | 'tasks' | 'inbox'

export function OrganizePage() {
  const navigate = useNavigate()
  const {
    pendingTasks,
    completedTasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    isLoading: tasksLoading
  } = useTasks()
  const {
    activeGoals,
    addGoal,
    deleteGoal,
    setActiveGoal,
    reorderGoals,
    isLoading: goalsLoading
  } = useGoals()
  const {
    projects,
    addProject,
    deleteProject,
    getSubProjects,
    isLoading: projectsLoading
  } = useProjects()

  const [activeTab, setActiveTab] = useState<TabType>('goals')
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' as const, visible: false })
  const [pinnedTaskId, setPinnedTaskIdState] = useState<string | undefined>(undefined)

  // Load pinned task
  useEffect(() => {
    getData().then(data => {
      setPinnedTaskIdState(data.settings.pinnedTaskId)
    })
  }, [])

  const handlePinTask = async (taskId: string) => {
    const newPinnedId = pinnedTaskId === taskId ? undefined : taskId
    await setPinnedTaskId(newPinnedId)
    setPinnedTaskIdState(newPinnedId)
    setToast({
      message: newPinnedId ? 'Task pinned! View it in Now.' : 'Task unpinned.',
      type: 'success',
      visible: true
    })
  }

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
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    timeframe: '1y' as GoalTimeframe
  })

  // Project form state
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    goalId: '',
    parentProjectId: ''
  })

  // Drag and drop for each tab
  const taskDrag = useDragAndDrop<Task>({
    items: pendingTasks,
    onReorder: reorderTasks
  })

  const goalDrag = useDragAndDrop<Goal>({
    items: activeGoals,
    onReorder: reorderGoals
  })

  // Orphan tasks: tasks with no goal and no project
  const orphanTasks = pendingTasks.filter(t => !t.goalId && !t.projectId)

  const isLoading = tasksLoading || goalsLoading || projectsLoading

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
      description: newGoal.description || undefined,
      timeframe: newGoal.timeframe,
      isActive: activeGoals.length === 0  // First goal is active by default
    })

    setNewGoal({ title: '', description: '', timeframe: '1y' })
    setShowAddModal(false)
    setToast({ message: 'Goal created!', type: 'success', visible: true })
  }

  const handleAddProject = async () => {
    if (!newProject.title || !newProject.goalId) return

    await addProject({
      title: newProject.title,
      description: newProject.description || undefined,
      goalId: newProject.goalId,
      parentProjectId: newProject.parentProjectId || undefined
    })

    setNewProject({ title: '', description: '', goalId: '', parentProjectId: '' })
    setShowAddModal(false)
    setToast({ message: 'Project created!', type: 'success', visible: true })
  }

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`)
  }

  // Render project with optional indentation for sub-projects
  const renderProject = (project: typeof projects[0], indentLevel: number = 0) => {
    const goal = activeGoals.find(g => g.id === project.goalId)
    const subProjects = getSubProjects(project.id)
    const projectTasks = pendingTasks.filter(t => t.projectId === project.id)
    const completedProjectTasks = completedTasks.filter(t => t.projectId === project.id)
    const totalTasks = projectTasks.length + completedProjectTasks.length

    return (
      <div key={project.id}>
        <div style={{ marginLeft: `${indentLevel * 20}px` }}>
          <Card onClick={() => handleProjectClick(project.id)}>
            <div style={itemContentStyle}>
              <div style={itemMainStyle}>
                <div style={projectHeaderStyle}>
                  {goal && !project.parentProjectId && (
                    <span style={goalBadgeStyle}>{goal.title}</span>
                  )}
                  <span style={statusBadgeStyle(project.status)}>{project.status}</span>
                </div>
                <div style={itemTitleStyle}>{project.title}</div>
                {project.parentProjectId && (
                  <div style={itemMetaStyle}>Sub-project</div>
                )}
                {project.description && (
                  <div style={{ ...itemDescStyle, marginTop: 'var(--space-xs)' }}>
                    {project.description.length > 100
                      ? project.description.slice(0, 100) + '...'
                      : project.description}
                  </div>
                )}
                <div style={taskProgressStyle}>
                  {totalTasks > 0
                    ? `${completedProjectTasks.length}/${totalTasks} tasks done`
                    : 'No tasks yet'}
                  {subProjects.length > 0 && ` · ${subProjects.length} sub-project(s)`}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteProject(project.id)
                }}
              >
                ×
              </Button>
            </div>
          </Card>
        </div>
        {subProjects.map(sub => renderProject(sub, indentLevel + 1))}
      </div>
    )
  }

  // Styles
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
    background: isActive ? 'var(--orb-orange)' : 'transparent',
    color: isActive ? 'white' : 'var(--text-muted)',
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

  const selectStyle: CSSProperties = {
    width: '100%',
    padding: 'var(--space-sm) var(--space-md)',
    fontSize: 'var(--text-md)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text)'
  }

  const formStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  }

  const dragHandleStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    color: 'var(--text-subtle)',
    cursor: 'grab',
    flexShrink: 0
  }

  const itemContentStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 'var(--space-sm)'
  }

  const itemMainStyle: CSSProperties = {
    flex: 1,
    minWidth: 0
  }

  const itemTitleStyle: CSSProperties = {
    fontWeight: 600,
    color: 'var(--text)'
  }

  const itemVerbStyle: CSSProperties = {
    fontWeight: 600,
    color: 'var(--orb-orange)'
  }

  const itemDescStyle: CSSProperties = {
    color: 'var(--text)',
    fontSize: 'var(--text-sm)'
  }

  const itemMetaStyle: CSSProperties = {
    color: 'var(--text-muted)',
    fontSize: 'var(--text-xs)',
    marginTop: 'var(--space-xs)'
  }

  const dragHintStyle: CSSProperties = {
    textAlign: 'center',
    color: 'var(--text-subtle)',
    fontSize: 'var(--text-xs)',
    padding: 'var(--space-sm) 0'
  }

  const timeframeBadgeStyle: CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    background: 'var(--bg-elevated)',
    color: 'var(--text-muted)',
    borderRadius: 'var(--radius-sm)',
    marginRight: 'var(--space-xs)'
  }

  const activeBadgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    background: 'var(--orb-orange)',
    color: 'white',
    borderRadius: 'var(--radius-sm)'
  }

  const goalHeaderStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    marginBottom: 'var(--space-xs)'
  }

  const starButtonStyle = (isActive: boolean): CSSProperties => ({
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: isActive ? 'var(--orb-orange)' : 'var(--text-subtle)',
    padding: 0,
    flexShrink: 0
  })

  const statusBadgeStyle = (status: string): CSSProperties => {
    const bgColors: Record<string, string> = {
      active: 'rgba(34, 197, 94, 0.15)',
      paused: 'rgba(234, 179, 8, 0.15)',
      completed: 'rgba(34, 197, 94, 0.25)'
    }
    const textColors: Record<string, string> = {
      active: 'var(--success, #22c55e)',
      paused: 'var(--warning, #eab308)',
      completed: 'var(--success, #22c55e)'
    }
    return {
      display: 'inline-block',
      padding: '2px 8px',
      fontSize: 'var(--text-xs)',
      fontWeight: 500,
      background: bgColors[status] || bgColors.active,
      color: textColors[status] || textColors.active,
      borderRadius: 'var(--radius-sm)',
      marginLeft: 'var(--space-xs)',
      textTransform: 'capitalize'
    }
  }

  const projectHeaderStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--space-xs)',
    marginBottom: 'var(--space-xs)'
  }

  const goalBadgeStyle: CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: 'var(--text-xs)',
    fontWeight: 500,
    background: 'rgba(255, 107, 53, 0.15)',
    color: 'var(--orb-orange)',
    borderRadius: 'var(--radius-sm)'
  }

  const taskProgressStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)'
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
          <button style={tabStyle(activeTab === 'goals')} onClick={() => setActiveTab('goals')}>
            Goals
          </button>
          <button style={tabStyle(activeTab === 'projects')} onClick={() => setActiveTab('projects')}>
            Projects
          </button>
          <button style={tabStyle(activeTab === 'tasks')} onClick={() => setActiveTab('tasks')}>
            Tasks
          </button>
          <button style={tabStyle(activeTab === 'inbox')} onClick={() => setActiveTab('inbox')}>
            Inbox {orphanTasks.length > 0 && `(${orphanTasks.length})`}
          </button>
        </div>

        {activeTab !== 'inbox' && (
          <Button variant="cta" onClick={() => setShowAddModal(true)}>
            Add {activeTab === 'goals' ? 'Goal' :
              activeTab === 'projects' ? 'Project' : 'Task'}
          </Button>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <section style={sectionStyle} data-drag-container>
            {pendingTasks.length === 0 ? (
              <Card>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  No tasks yet. Add one to get started.
                </p>
              </Card>
            ) : (
              <>
                <div style={dragHintStyle}>Hold and drag to reorder</div>
                {pendingTasks.map((task, index) => {
                  const handlers = taskDrag.getDragHandlers(task.id, index)
                  const style = taskDrag.getItemStyle(task.id, index)

                  return (
                    <div
                      key={task.id}
                      data-drag-id={task.id}
                      style={style}
                      {...handlers}
                    >
                      <Card>
                        <div style={itemContentStyle}>
                          <div style={dragHandleStyle}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <circle cx="5" cy="3" r="1.5" />
                              <circle cx="11" cy="3" r="1.5" />
                              <circle cx="5" cy="8" r="1.5" />
                              <circle cx="11" cy="8" r="1.5" />
                              <circle cx="5" cy="13" r="1.5" />
                              <circle cx="11" cy="13" r="1.5" />
                            </svg>
                          </div>
                          <div style={itemMainStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                              <span style={itemVerbStyle}>{task.verbLabel}</span>
                              {pinnedTaskId === task.id && (
                                <span style={{ color: 'var(--orb-orange)', fontSize: 'var(--text-xs)' }}>★ pinned</span>
                              )}
                            </div>
                            <div style={itemDescStyle}>{task.taskBody}</div>
                            <div style={itemMetaStyle}>
                              {task.timeEstimate} min · {task.feedLevel} energy
                            </div>
                          </div>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              color: pinnedTaskId === task.id ? 'var(--orb-orange)' : 'var(--text-subtle)',
                              fontSize: 'var(--text-lg)'
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePinTask(task.id)
                            }}
                            title={pinnedTaskId === task.id ? 'Unpin task' : 'Pin as current task'}
                          >
                            {pinnedTaskId === task.id ? '★' : '☆'}
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteTask(task.id)
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      </Card>
                    </div>
                  )
                })}
              </>
            )}

            {completedTasks.length > 0 && (
              <>
                <h3 style={{
                  color: 'var(--text-muted)',
                  fontSize: 'var(--text-sm)',
                  marginTop: 'var(--space-md)'
                }}>
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

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <section style={sectionStyle} data-drag-container>
            {activeGoals.length === 0 ? (
              <Card>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  No goals yet. Goals help you stay focused on what matters.
                </p>
              </Card>
            ) : (
              <>
                <div style={dragHintStyle}>Hold and drag to reorder · Tap star to set active goal</div>
                {activeGoals.map((goal, index) => {
                  const handlers = goalDrag.getDragHandlers(goal.id, index)
                  const style = goalDrag.getItemStyle(goal.id, index)
                  const timeframeLabel = GOAL_TIMEFRAMES.find(t => t.value === goal.timeframe)?.shortLabel || goal.timeframe

                  return (
                    <div
                      key={goal.id}
                      data-drag-id={goal.id}
                      style={style}
                      {...handlers}
                    >
                      <Card>
                        <div style={itemContentStyle}>
                          <div style={dragHandleStyle}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <circle cx="5" cy="3" r="1.5" />
                              <circle cx="11" cy="3" r="1.5" />
                              <circle cx="5" cy="8" r="1.5" />
                              <circle cx="11" cy="8" r="1.5" />
                              <circle cx="5" cy="13" r="1.5" />
                              <circle cx="11" cy="13" r="1.5" />
                            </svg>
                          </div>
                          <button
                            style={starButtonStyle(goal.isActive)}
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveGoal(goal.id)
                            }}
                            aria-label={goal.isActive ? 'Active goal' : 'Set as active goal'}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={goal.isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </button>
                          <div style={itemMainStyle}>
                            <div style={goalHeaderStyle}>
                              <span style={timeframeBadgeStyle}>{timeframeLabel}</span>
                              {goal.isActive && (
                                <span style={activeBadgeStyle}>Active</span>
                              )}
                            </div>
                            <div style={itemTitleStyle}>{goal.title}</div>
                            {goal.description && (
                              <div style={itemDescStyle}>{goal.description}</div>
                            )}
                            <div style={itemMetaStyle}>
                              {projects.filter(p => p.goalId === goal.id).length} project(s) ·{' '}
                              {pendingTasks.filter(t => t.goalId === goal.id).length} task(s)
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteGoal(goal.id)
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      </Card>
                    </div>
                  )
                })}
              </>
            )}
          </section>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <section style={sectionStyle}>
            {projects.length === 0 ? (
              <Card>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  No projects yet. Projects are milestones within your goals.
                </p>
              </Card>
            ) : (
              projects
                .filter(p => !p.parentProjectId)
                .map(project => renderProject(project))
            )}
          </section>
        )}

        {/* Inbox Tab - Orphan tasks without goal or project */}
        {activeTab === 'inbox' && (
          <section style={sectionStyle}>
            {orphanTasks.length === 0 ? (
              <Card>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  No orphan tasks. All your tasks are linked to goals or projects.
                </p>
              </Card>
            ) : (
              <>
                <div style={dragHintStyle}>
                  These tasks need to be organized. Link them to a goal or project.
                </div>
                {orphanTasks.map((task) => (
                  <Card key={task.id}>
                    <div style={itemContentStyle}>
                      <div style={itemMainStyle}>
                        <div style={itemVerbStyle}>{task.verbLabel}</div>
                        <div style={itemDescStyle}>{task.taskBody}</div>
                        <div style={itemMetaStyle}>
                          {task.timeEstimate} min · {task.feedLevel} energy
                        </div>
                        {activeGoals.length > 0 && (
                          <div style={{ marginTop: 'var(--space-sm)' }}>
                            <select
                              style={{
                                ...selectStyle,
                                padding: 'var(--space-xs) var(--space-sm)',
                                fontSize: 'var(--text-sm)'
                              }}
                              value=""
                              onChange={async (e) => {
                                if (e.target.value) {
                                  await updateTask(task.id, { goalId: e.target.value })
                                  setToast({ message: 'Task assigned to goal!', type: 'success', visible: true })
                                }
                              }}
                            >
                              <option value="">Assign to goal...</option>
                              {activeGoals.map(g => (
                                <option key={g.id} value={g.id}>{g.title}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTask(task.id)
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </section>
        )}
      </main>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add ${activeTab === 'goals' ? 'Goal' :
          activeTab === 'projects' ? 'Project' : 'Task'}`}
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
              <label style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: 'var(--space-xs)'
              }}>
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
              <label style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: 'var(--space-xs)'
              }}>
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
            {activeGoals.length > 0 && (
              <div>
                <label style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: 'var(--space-xs)'
                }}>
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
            <div>
              <label style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: 'var(--space-xs)'
              }}>
                Timeframe
              </label>
              <select
                style={selectStyle}
                value={newGoal.timeframe}
                onChange={(e) => setNewGoal(prev => ({
                  ...prev,
                  timeframe: e.target.value as GoalTimeframe
                }))}
              >
                {GOAL_TIMEFRAMES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
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
              <label style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: 'var(--space-xs)'
              }}>
                Goal *
              </label>
              <select
                style={selectStyle}
                value={newProject.goalId}
                onChange={(e) => setNewProject(prev => ({
                  ...prev,
                  goalId: e.target.value,
                  parentProjectId: ''
                }))}
              >
                <option value="">Select a goal</option>
                {activeGoals.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
            {newProject.goalId && projects.filter(p => p.goalId === newProject.goalId).length > 0 && (
              <div>
                <label style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: 'var(--space-xs)'
                }}>
                  Parent Project (optional - for sub-projects)
                </label>
                <select
                  style={selectStyle}
                  value={newProject.parentProjectId}
                  onChange={(e) => setNewProject(prev => ({
                    ...prev,
                    parentProjectId: e.target.value
                  }))}
                >
                  <option value="">No parent (root project)</option>
                  {projects
                    .filter(p => p.goalId === newProject.goalId)
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))
                  }
                </select>
              </div>
            )}
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
