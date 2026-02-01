import { useState, useCallback, CSSProperties } from 'react'
import { AppLayout, Header } from '../components/layout'
import { Card, Modal, Button, Input, Toast } from '../components/shared'
import { SwipeableTaskCard } from '../components/shared/SwipeableTaskCard'
import { useTasks } from '../hooks/useTasks'
import { useGoals } from '../hooks/useGoals'
import type { Task, Goal } from '../data/types'

// TODO: Add useDragAndDrop for reordering within goal sections

/**
 * OrganizeV2 - Simplified goal-grouped task list
 * 
 * Features:
 * - Single scrollable view with tasks grouped under goal headers
 * - Goal management via modal (gear icon)
 * - Minimal task cards (checkbox + title + optional date)
 * - Swipe to complete/delete
 * - Long-press to drag (future)
 */

export function OrganizeV2Page() {
  const { pendingTasks, completedTasks, completeTask, deleteTask, addTask } = useTasks()
  const { activeGoals, addGoal, deleteGoal } = useGoals()
  const [showCompleted, setShowCompleted] = useState(false)
  
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [collapsedGoals, setCollapsedGoals] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState({ message: '', type: 'success' as const, visible: false })
  
  // New goal form
  const [newGoalTitle, setNewGoalTitle] = useState('')

  // Group tasks by goal
  const tasksByGoal = pendingTasks.reduce((acc, task) => {
    const goalId = task.goalId || 'inbox'
    if (!acc[goalId]) acc[goalId] = []
    acc[goalId].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  // Toggle goal section collapse
  const toggleGoalCollapse = (goalId: string) => {
    setCollapsedGoals(prev => {
      const next = new Set(prev)
      if (next.has(goalId)) {
        next.delete(goalId)
      } else {
        next.add(goalId)
      }
      return next
    })
  }

  // Handle task completion
  const handleComplete = useCallback((taskId: string) => {
    completeTask(taskId)
    setToast({ message: 'Task completed! 🎉', type: 'success', visible: true })
  }, [completeTask])

  // Handle task deletion
  const handleDelete = useCallback((taskId: string) => {
    deleteTask(taskId)
    setToast({ message: 'Task deleted', type: 'success', visible: true })
  }, [deleteTask])

  // Quick add task
  const handleQuickAdd = useCallback(() => {
    if (!newTaskTitle.trim()) return
    
    addTask({
      verbLabel: 'Do',
      taskBody: newTaskTitle.trim(),
      timeEstimate: 15,
      feedLevel: 'medium',
      goalId: selectedGoalId || undefined
    })
    
    setNewTaskTitle('')
    setToast({ message: 'Task added', type: 'success', visible: true })
  }, [newTaskTitle, selectedGoalId, addTask])

  // Add new goal
  const handleAddGoal = useCallback(() => {
    if (!newGoalTitle.trim()) return
    
    addGoal({
      title: newGoalTitle.trim(),
      timeframe: '3m',
      isActive: false
    })
    
    setNewGoalTitle('')
    setToast({ message: 'Goal created', type: 'success', visible: true })
  }, [newGoalTitle, addGoal])

  // Styles
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    paddingBottom: 'var(--space-xl)'
  }

  const goalHeaderStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-sm) var(--space-md)',
    background: 'var(--bg-card-transparent)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    userSelect: 'none'
  }

  const quickAddStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-sm)',
    padding: 'var(--space-md)',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    position: 'sticky',
    bottom: 'calc(var(--nav-height) + var(--safe-bottom) + var(--space-md))',
    boxShadow: 'var(--shadow-card)'
  }

  const renderGoalSection = (goal: Goal | null, tasks: Task[]) => {
    const goalId = goal?.id || 'inbox'
    const goalTitle = goal?.title || '📥 Inbox'
    const isCollapsed = collapsedGoals.has(goalId)
    
    return (
      <div key={goalId}>
        {/* Goal Header */}
        <div 
          style={goalHeaderStyle} 
          onClick={() => toggleGoalCollapse(goalId)}
          onKeyDown={(e) => e.key === 'Enter' && toggleGoalCollapse(goalId)}
          role="button"
          tabIndex={0}
          aria-expanded={!isCollapsed}
          aria-label={`${goalTitle} section, ${tasks.length} tasks`}
        >
          <span style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            ▼
          </span>
          <span style={{ fontWeight: 600 }}>
            {goal ? '🎯 ' : ''}{goalTitle}
          </span>
          <span style={{ color: 'var(--text-subtle)', marginLeft: 'auto' }}>
            {tasks.length}
          </span>
        </div>
        
        {/* Tasks */}
        {!isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)' }}>
            {tasks.map(task => (
              <SwipeableTaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <AppLayout>
      <Header 
        title="Organize" 
        rightAction={
          <button 
            onClick={() => setShowGoalModal(true)}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
            aria-label="Manage goals"
          >
            ⚙️
          </button>
        }
      />
      
      <main style={containerStyle}>
        {/* Goals with tasks */}
        {activeGoals.map(goal => 
          tasksByGoal[goal.id] && renderGoalSection(goal, tasksByGoal[goal.id])
        )}
        
        {/* Goals without tasks (show empty) */}
        {activeGoals
          .filter(goal => !tasksByGoal[goal.id])
          .map(goal => renderGoalSection(goal, []))
        }
        
        {/* Inbox (tasks without goals) */}
        {tasksByGoal['inbox'] && renderGoalSection(null, tasksByGoal['inbox'])}
        
        {/* Completed tasks (collapsible) */}
        {completedTasks.length > 0 && (
          <div>
            <div 
              style={{
                ...goalHeaderStyle,
                opacity: 0.7
              }} 
              onClick={() => setShowCompleted(!showCompleted)}
              onKeyDown={(e) => e.key === 'Enter' && setShowCompleted(!showCompleted)}
              role="button"
              tabIndex={0}
              aria-expanded={showCompleted}
              aria-label={`Completed tasks section, ${completedTasks.length} tasks`}
            >
              <span style={{ transform: showCompleted ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
                ▼
              </span>
              <span style={{ fontWeight: 600 }}>
                ✓ Completed
              </span>
              <span style={{ color: 'var(--text-subtle)', marginLeft: 'auto' }}>
                {completedTasks.length}
              </span>
            </div>
            
            {showCompleted && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)' }}>
                {completedTasks.slice(0, 10).map(task => (
                  <div 
                    key={task.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-sm)',
                      padding: 'var(--space-sm) var(--space-md)',
                      marginLeft: 'var(--space-md)',
                      opacity: 0.6,
                      textDecoration: 'line-through'
                    }}
                  >
                    <span style={{ color: 'var(--success)' }}>✓</span>
                    <span>{task.taskBody}</span>
                  </div>
                ))}
                {completedTasks.length > 10 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                    +{completedTasks.length - 10} more completed
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Empty state */}
        {pendingTasks.length === 0 && (
          <Card>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              No tasks yet. Tap + to add one!
            </p>
          </Card>
        )}
      </main>

      {/* Quick Add Bar */}
      <div style={quickAddStyle}>
        <select
          value={selectedGoalId || ''}
          onChange={(e) => setSelectedGoalId(e.target.value || null)}
          style={{
            padding: 'var(--space-sm)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text)',
            fontSize: 'var(--text-sm)',
            minWidth: 80
          }}
          aria-label="Select goal for new task"
        >
          <option value="">📥 Inbox</option>
          {activeGoals.map(goal => (
            <option key={goal.id} value={goal.id}>🎯 {goal.title}</option>
          ))}
        </select>
        <Input
          value={newTaskTitle}
          onChange={(value) => setNewTaskTitle(value)}
          placeholder="What do you need to do?"
          onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
          style={{ flex: 1 }}
        />
        <Button onClick={handleQuickAdd} disabled={!newTaskTitle.trim()}>
          Add
        </Button>
      </div>

      {/* Goal Management Modal */}
      <Modal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} title="Your Goals">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {activeGoals.map(goal => (
            <div key={goal.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <span style={{ flex: 1 }}>🎯 {goal.title}</span>
              <button
                onClick={() => {
                  deleteGoal(goal.id)
                  setToast({ message: 'Goal deleted', type: 'success', visible: true })
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                🗑️
              </button>
            </div>
          ))}
          
          {activeGoals.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
              No goals yet. Create one below!
            </p>
          )}
          
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
            <Input
              value={newGoalTitle}
              onChange={(value) => setNewGoalTitle(value)}
              placeholder="New goal title"
              onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
              style={{ flex: 1 }}
            />
            <Button onClick={handleAddGoal} disabled={!newGoalTitle.trim()}>
              Add
            </Button>
          </div>
        </div>
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
