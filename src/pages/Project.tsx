import { useState, CSSProperties } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout, Header } from '../components/layout'
import { Card, Toast, TaskFilter } from '../components/shared'
import { ProjectTaskCard } from '../components/projects'
import { TimerOverlay } from '../components/timer'
import { useProjects } from '../hooks/useProjects'
import { useTasks, TaskFilters } from '../hooks/useTasks'
import { useGoals } from '../hooks/useGoals'
import type { Task } from '../data/types'

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const { getProject, getSubProjects, hasSubProjects } = useProjects()
  const { getTasksByProject, getNextTaskForProject, filterTasks, completeTask } = useTasks()
  const { goals } = useGoals()

  const [filters, setFilters] = useState<TaskFilters>({})
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showTimer, setShowTimer] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', visible: false })

  const project = projectId ? getProject(projectId) : undefined
  const goal = project ? goals.find(g => g.id === project.goalId) : undefined
  const subProjects = projectId ? getSubProjects(projectId) : []
  const allProjectTasks = projectId ? getTasksByProject(projectId) : []
  const nextTask = projectId ? getNextTaskForProject(projectId) : undefined

  // Get upcoming tasks (all pending except next task)
  const pendingTasks = allProjectTasks.filter(t => t.status === 'pending' && t.id !== nextTask?.id)
  const filteredUpcoming = filterTasks(pendingTasks, filters)

  const sectionStyle: CSSProperties = {
    marginBottom: 'var(--space-lg)'
  }

  const sectionHeaderStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-md)'
  }

  const sectionTitleStyle: CSSProperties = {
    fontSize: 'var(--text-md)',
    fontWeight: 600,
    color: 'var(--text)'
  }

  const projectTitleStyle: CSSProperties = {
    fontSize: 'var(--text-xl)',
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
    color: 'var(--text)',
    marginBottom: 'var(--space-xs)'
  }

  const projectDescStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)',
    marginBottom: 'var(--space-md)'
  }

  const subProjectCardStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-sm)'
  }

  const subProjectTitleStyle: CSSProperties = {
    fontWeight: 500,
    color: 'var(--text)'
  }

  const subProjectMetaStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)'
  }

  const emptyStateStyle: CSSProperties = {
    textAlign: 'center',
    padding: 'var(--space-lg)',
    color: 'var(--text-muted)'
  }

  const handleStartTask = (task: Task) => {
    setActiveTask(task)
    setShowTimer(true)
  }

  const handleCompleteTask = async (duration: number) => {
    if (activeTask) {
      await completeTask(activeTask.id, duration)
      setShowTimer(false)
      setActiveTask(null)
      setToast({ message: 'Task completed!', type: 'success', visible: true })
    }
  }

  const handleProjectOverview = () => {
    // Already on project page, could scroll to top or show details modal
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubProjectClick = (subProjectId: string) => {
    navigate(`/project/${subProjectId}`)
  }

  if (!project) {
    return (
      <AppLayout>
        <Header showBack title="Project" />
        <main className="main-area">
          <div style={emptyStateStyle}>
            <p>Project not found</p>
          </div>
        </main>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Header
        showBack
        subtitle={goal ? `Goal: ${goal.title}` : undefined}
        subtitleBadge
      />

      <main className="main-area">
        {/* Project Info */}
        <section style={sectionStyle}>
          <h1 style={projectTitleStyle}>{project.title}</h1>
          {project.description && (
            <p style={projectDescStyle}>{project.description}</p>
          )}
        </section>

        {/* Next Step */}
        {nextTask && (
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <span style={sectionTitleStyle}>Next Step</span>
            </div>
            <ProjectTaskCard
              task={nextTask}
              project={project}
              variant="featured"
              onStart={() => handleStartTask(nextTask)}
              onProjectOverview={handleProjectOverview}
            />
          </section>
        )}

        {/* Upcoming Tasks */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <span style={sectionTitleStyle}>
              Upcoming {filteredUpcoming.length > 0 ? `(${filteredUpcoming.length})` : ''}
            </span>
          </div>

          <TaskFilter
            filters={filters}
            onChange={setFilters}
            showDay
            showTimeOfDay
            showMonth={false}
          />

          {filteredUpcoming.length > 0 ? (
            filteredUpcoming.map(task => (
              <ProjectTaskCard
                key={task.id}
                task={task}
                project={project}
                variant="list"
                onStart={() => handleStartTask(task)}
              />
            ))
          ) : (
            <div style={emptyStateStyle}>
              <p>No upcoming tasks{Object.keys(filters).length > 0 ? ' matching filters' : ''}</p>
            </div>
          )}
        </section>

        {/* Sub-projects */}
        {hasSubProjects(project.id) && (
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <span style={sectionTitleStyle}>Sub-projects ({subProjects.length})</span>
            </div>

            {subProjects.map(subProject => {
              const subProjectTasks = getTasksByProject(subProject.id)
              const pendingCount = subProjectTasks.filter(t => t.status === 'pending').length

              return (
                <Card
                  key={subProject.id}
                  onClick={() => handleSubProjectClick(subProject.id)}
                >
                  <div style={subProjectCardStyle}>
                    <div>
                      <div style={subProjectTitleStyle}>{subProject.title}</div>
                      {subProject.description && (
                        <div style={subProjectMetaStyle}>{subProject.description}</div>
                      )}
                    </div>
                    <div style={subProjectMetaStyle}>
                      {pendingCount} task{pendingCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </Card>
              )
            })}
          </section>
        )}

        {/* Empty state for project with no tasks */}
        {!nextTask && pendingTasks.length === 0 && subProjects.length === 0 && (
          <div style={emptyStateStyle}>
            <p>No tasks yet. Add tasks from the Organize page.</p>
          </div>
        )}
      </main>

      {activeTask && (
        <TimerOverlay
          task={activeTask}
          isOpen={showTimer}
          onComplete={handleCompleteTask}
          onCancel={() => {
            setShowTimer(false)
            setActiveTask(null)
          }}
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(t => ({ ...t, visible: false }))}
      />
    </AppLayout>
  )
}
