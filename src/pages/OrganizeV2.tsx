import { useState, useCallback, useRef, CSSProperties } from 'react'
import { AppLayout, Header } from '../components/layout'
import { Modal, Button, Input, Toast, EmptyState } from '../components/shared'
import { SwipeableTaskCard } from '../components/shared/SwipeableTaskCard'
import { useTasks } from '../hooks/useTasks'
import { useGoals } from '../hooks/useGoals'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import type { Task } from '../data/types'

/**
 * OrganizeV2 - Pill-based list selection
 *
 * Features:
 * - Horizontal scrollable pill toggles for list selection (Inbox, Goals, Completed)
 * - Single list view at a time
 * - Swipe to complete/delete
 * - Long-press to drag reorder (mobile) / click-drag (desktop)
 * - Tap task text to edit
 */

export function OrganizeV2Page() {
  const { pendingTasks, completedTasks, completeTask, deleteTask, updateTask, reorderTask } = useTasks()
  const { activeGoals, addGoal, deleteGoal } = useGoals()

  // Selected list - 'inbox' | goalId | 'completed'
  const [selectedList, setSelectedList] = useState<string>('inbox')
  const pillScrollRef = useRef<HTMLDivElement>(null)

  const [showGoalModal, setShowGoalModal] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' as const, visible: false })

  // Edit task state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  // New goal form
  const [newGoalTitle, setNewGoalTitle] = useState('')

  // Group tasks by goal
  const tasksByGoal = pendingTasks.reduce((acc, task) => {
    const goalId = task.goalId || 'inbox'
    if (!acc[goalId]) acc[goalId] = []
    acc[goalId].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  // Get tasks for currently selected list
  const getSelectedTasks = (): Task[] => {
    if (selectedList === 'completed') {
      return completedTasks
    }
    return tasksByGoal[selectedList] || []
  }

  const selectedTasks = getSelectedTasks()

  // Drag and drop
  const { getDragHandleProps, getDropTargetProps } = useDragAndDrop({
    items: selectedTasks,
    onReorder: (fromIndex, toIndex) => {
      if (reorderTask && selectedList !== 'completed') {
        const task = selectedTasks[fromIndex]
        reorderTask(task.id, toIndex)
        setToast({ message: 'Task reordered', type: 'success', visible: true })
      }
    }
  })

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

  // Handle tap to edit
  const handleStartEdit = useCallback((task: Task) => {
    setEditingTaskId(task.id)
    setEditingText(task.taskBody)
  }, [])

  // Handle save edit
  const handleSaveEdit = useCallback(() => {
    if (editingTaskId && editingText.trim()) {
      updateTask(editingTaskId, { taskBody: editingText.trim() })
      setToast({ message: 'Task updated', type: 'success', visible: true })
    }
    setEditingTaskId(null)
    setEditingText('')
  }, [editingTaskId, editingText, updateTask])

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingTaskId(null)
    setEditingText('')
  }, [])

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

  // Build list of pills
  const pills: { id: string; label: string; count: number; icon?: string }[] = [
    { id: 'inbox', label: 'Inbox', count: tasksByGoal['inbox']?.length || 0, icon: '📥' },
    ...activeGoals.map(goal => ({
      id: goal.id,
      label: goal.title,
      count: tasksByGoal[goal.id]?.length || 0,
      icon: '🎯'
    })),
    { id: 'completed', label: 'Done', count: completedTasks.length, icon: '✓' }
  ]

  // Get selected list name
  const getSelectedListName = () => {
    if (selectedList === 'inbox') return '📥 Inbox'
    if (selectedList === 'completed') return '✓ Completed'
    const goal = activeGoals.find(g => g.id === selectedList)
    return goal ? `🎯 ${goal.title}` : 'Tasks'
  }

  // Styles
  const pillContainerStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-sm)',
    overflowX: 'auto',
    padding: 'var(--space-sm) var(--space-xs)',
    marginBottom: 'var(--space-md)',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch'
  }

  const pillStyle = (isSelected: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    padding: 'var(--space-sm) var(--space-md)',
    borderRadius: 'var(--radius-full)',
    background: isSelected ? 'var(--orb-orange)' : 'var(--bg-card)',
    color: isSelected ? 'white' : 'var(--text)',
    border: isSelected ? 'none' : '1px solid var(--border)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: 'var(--text-sm)',
    fontWeight: isSelected ? 600 : 400,
    transition: 'all 0.2s ease',
    flexShrink: 0
  })

  const countBadgeStyle = (isSelected: boolean): CSSProperties => ({
    background: isSelected ? 'rgba(255,255,255,0.3)' : 'var(--bg-elevated)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)',
    fontWeight: 500
  })

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
    paddingBottom: 'var(--space-xl)'
  }

  const listHeaderStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-sm) var(--space-md)',
    marginBottom: 'var(--space-sm)'
  }

  const dragHintStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-subtle)',
    textAlign: 'center',
    padding: 'var(--space-sm)',
    marginBottom: 'var(--space-sm)'
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

      <main>
        {/* Pill Toggle Bar */}
        <div
          ref={pillScrollRef}
          style={pillContainerStyle}
          className="hide-scrollbar"
        >
          {pills.map(pill => (
            <button
              key={pill.id}
              style={pillStyle(selectedList === pill.id)}
              onClick={() => setSelectedList(pill.id)}
              aria-pressed={selectedList === pill.id}
            >
              {pill.icon && <span>{pill.icon}</span>}
              <span>{pill.label}</span>
              {pill.count > 0 && (
                <span style={countBadgeStyle(selectedList === pill.id)}>
                  {pill.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List Header */}
        <div style={listHeaderStyle}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text)' }}>
            {getSelectedListName()}
          </h2>
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            {selectedTasks.length} {selectedTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {/* Drag hint */}
        {selectedTasks.length > 1 && selectedList !== 'completed' && (
          <div style={dragHintStyle}>
            💡 Drag the ⋮⋮ handle to reorder
          </div>
        )}

        {/* Task List */}
        <div style={containerStyle}>
          {selectedTasks.map((task, index) => {
            const dragProps = getDragHandleProps(task.id, index, selectedList)
            const dropProps = getDropTargetProps(index, selectedList)
            const isEditing = editingTaskId === task.id

            return (
              <div
                key={task.id}
                style={{
                  ...dropProps.style,
                  ...dragProps.style,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onTouchMove={dropProps.onTouchMove}
                onMouseMove={dropProps.onMouseMove}
              >
                {/* Drag handle (not for completed) */}
                {selectedList !== 'completed' && (
                  <div
                    style={{
                      width: 44,
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'grab',
                      color: 'var(--text-subtle)',
                      fontSize: 'var(--text-lg)',
                      flexShrink: 0,
                      touchAction: 'none',
                      userSelect: 'none'
                    }}
                    onTouchStart={dragProps.onTouchStart}
                    onTouchMove={dragProps.onTouchMove}
                    onTouchEnd={dragProps.onTouchEnd}
                    onMouseDown={dragProps.onMouseDown}
                  >
                    ⋮⋮
                  </div>
                )}

                {/* Task card or edit mode */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isEditing ? (
                    <div style={{
                      display: 'flex',
                      gap: 'var(--space-sm)',
                      padding: 'var(--space-md)',
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border)'
                    }}>
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit()
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: 'var(--space-sm)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          fontSize: 'var(--text-md)'
                        }}
                      />
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          padding: 'var(--space-sm)',
                          background: 'var(--orb-orange)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer'
                        }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          padding: 'var(--space-sm)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : selectedList === 'completed' ? (
                    <div
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
                  ) : (
                    <SwipeableTaskCard
                      task={task}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      onEdit={handleStartEdit}
                    />
                  )}
                </div>
              </div>
            )
          })}

          {/* Empty state */}
          {selectedTasks.length === 0 && (
            <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
              {selectedList === 'completed' ? (
                <p style={{ color: 'var(--text-muted)' }}>
                  No completed tasks yet
                </p>
              ) : selectedList === 'inbox' ? (
                <EmptyState variant="tasks" />
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>
                  No tasks for this goal yet.<br />
                  <span style={{ fontSize: 'var(--text-sm)' }}>Use the + button to add one!</span>
                </p>
              )}
            </div>
          )}
        </div>
      </main>

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
                  // Switch to inbox if we deleted the selected goal
                  if (selectedList === goal.id) {
                    setSelectedList('inbox')
                  }
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
