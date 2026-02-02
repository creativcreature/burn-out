import { useState, useCallback, useEffect, CSSProperties } from 'react'
import { AppLayout, Header } from '../components/layout'
import { Button, Toast, QuickAddPanel, Tag, Tooltip, EmptyState, Celebration, Modal, EnergyPicker } from '../components/shared'
import { TimerOverlay } from '../components/timer'
import { useTasks } from '../hooks/useTasks'
import { useEnergy } from '../hooks/useEnergy'
import { useAI } from '../hooks/useAI'
import { useGoals } from '../hooks/useGoals'
import { useSwipe } from '../hooks/useSwipe'
import { useBottomSheet } from '../hooks/useBottomSheet'
import { getData, setPinnedTaskId } from '../utils/storage'
import type { Task, Settings, FeedLevel, BurnoutMode } from '../data/types'
import type { ExtractedTask } from '../utils/ai'

export function NowPage() {
  const { pendingTasks, completeTask, snoozeTask, addTask, updateTask } = useTasks()
  const { activeGoals, currentActiveGoal, setActiveGoal } = useGoals()
  const {
    currentEnergy,
    setEnergy,
    burnoutMode,
    setBurnoutMode,
    getSuggestedTask,
    sortTasksByEnergy,
    getMomentumMessage,
    getBurnoutModeMessage,
    refreshMomentum,
    getBurnoutTasks
  } = useEnergy()

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showTimer, setShowTimer] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', visible: false })
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [cardSettings, setCardSettings] = useState<Pick<Settings, 'cardBackgroundImage' | 'cardBackgroundBrightness'> | null>(null)
  const [pinnedTaskId, setPinnedTaskIdState] = useState<string | undefined>(undefined)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showGoalPicker, setShowGoalPicker] = useState(false)
  const [showEnergyPicker, setShowEnergyPicker] = useState(false)
  const [showTaskTypeEditor, setShowTaskTypeEditor] = useState(false)
  const [editingVerbLabel, setEditingVerbLabel] = useState('')
  const [editingFeedLevel, setEditingFeedLevel] = useState<FeedLevel>('medium')

  // Bottom sheet for upcoming tasks
  const sheet = useBottomSheet()

  // Load settings
  useEffect(() => {
    getData().then(data => {
      if (data.settings) {
        setCardSettings({
          cardBackgroundImage: data.settings.cardBackgroundImage,
          cardBackgroundBrightness: data.settings.cardBackgroundBrightness
        })
        setPinnedTaskIdState(data.settings.pinnedTaskId)
      }
    })
  }, [])

  // Listen for GlobalFAB quick-add event
  useEffect(() => {
    const handleOpenQuickAdd = () => setIsQuickAddOpen(true)
    window.addEventListener('open-quick-add', handleOpenQuickAdd)
    return () => window.removeEventListener('open-quick-add', handleOpenQuickAdd)
  }, [])

  // Get current objective from active goal
  const currentObjective = currentActiveGoal?.title

  // Get gentle tasks for recovery mode
  const burnoutTasks = getBurnoutTasks(pendingTasks, 3)
  const tasksToShow = burnoutMode === 'recovery'
    ? (burnoutTasks.length > 0 ? burnoutTasks : pendingTasks)
    : pendingTasks

  // Sort tasks by energy-aware scoring
  const sortedTasks = sortTasksByEnergy(tasksToShow)
  const pinnedTask = pinnedTaskId ? tasksToShow.find(t => t.id === pinnedTaskId) : undefined
  const currentTask = pinnedTask || getSuggestedTask(tasksToShow)
  const upcomingTasks = sortedTasks.filter(t => t.id !== currentTask?.id)

  // Swipe handler for current task card
  const { swipeX, handlers: swipeHandlers } = useSwipe({
    threshold: 0.3,
    onSwipeRight: () => {
      if (currentTask) {
        completeTask(currentTask.id, 0)
        setShowCelebration(true)
        refreshMomentum()
      }
    },
    onSwipeLeft: () => {
      if (currentTask) {
        snoozeTask(currentTask.id)
        setToast({ message: 'Task snoozed. Will appear later.', type: 'info', visible: true })
      }
    }
  })

  // Handle AI task creation
  const handleTasksCreated = useCallback(async (tasks: ExtractedTask[]): Promise<string[]> => {
    const createdIds: string[] = []
    for (const taskData of tasks) {
      const task = await addTask({
        verbLabel: taskData.verbLabel.slice(0, 12),
        taskBody: taskData.taskBody,
        timeEstimate: taskData.timeEstimate,
        feedLevel: taskData.feedLevel,
        timeOfDay: 'anytime'
      })
      createdIds.push(task.id)
    }
    if (createdIds.length > 0) {
      setToast({
        message: `${createdIds.length} task${createdIds.length > 1 ? 's' : ''} added`,
        type: 'success',
        visible: true
      })
    }
    return createdIds
  }, [addTask])

  const { isLoading: isAILoading, send } = useAI({ onTasksCreated: handleTasksCreated })

  const handleQuickAdd = async (text: string) => {
    await send(text)
  }

  const handleUnpinTask = async () => {
    await setPinnedTaskId(undefined)
    setPinnedTaskIdState(undefined)
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
      setShowCelebration(true)
      await refreshMomentum()
    }
  }

  const handleSelectGoal = async (goalId: string) => {
    await setActiveGoal(goalId)
    setShowGoalPicker(false)
    setToast({ message: 'Active goal updated', type: 'success', visible: true })
  }

  const handleExitBurnoutMode = async () => {
    await setBurnoutMode('balanced')
  }

  const handleEditTaskType = (task: Task) => {
    setEditingVerbLabel(task.verbLabel)
    setEditingFeedLevel(task.feedLevel)
    setShowTaskTypeEditor(true)
  }

  const handleSaveTaskType = async () => {
    if (currentTask && editingVerbLabel.trim()) {
      await updateTask(currentTask.id, {
        verbLabel: editingVerbLabel.trim().slice(0, 12),
        feedLevel: editingFeedLevel
      })
      setShowTaskTypeEditor(false)
      setToast({ message: 'Task updated', type: 'success', visible: true })
    }
  }

  const handleBurnoutModeChange = async (mode: BurnoutMode) => {
    await setBurnoutMode(mode)
  }

  const getEnergyBolts = (level: string) => {
    const num = level === 'low' ? 1 : level === 'medium' ? 2 : 3
    return Array(3).fill(0).map((_, i) => (
      <span key={i} className={`energy-bolt ${i >= num ? 'empty' : ''}`}>⚡</span>
    ))
  }

  const momentumMessage = getMomentumMessage()
  const burnoutModeMessage = getBurnoutModeMessage()

  // Dynamic styles - full screen task card with content at bottom
  const taskCardStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end', // Content at bottom
    paddingBottom: 'var(--space-xl)',
    filter: `blur(${sheet.progress * 12}px)`,
    opacity: 1 - (sheet.progress * 0.6),
    transform: `
      scale(${1 - (sheet.progress * 0.08)})
      translateY(${sheet.progress * -20}px)
      translateX(${swipeX * 80}px)
    `,
    transition: sheet.isDragging ? 'none' : 'filter 150ms ease-out, opacity 150ms ease-out, transform 150ms ease-out'
  }

  const leftActionStyle: CSSProperties = {
    position: 'fixed',
    left: 20,
    top: '50%',
    transform: `translateY(-50%) scale(${Math.min(1, -swipeX * 2)})`,
    background: 'var(--text-muted)',
    color: 'white',
    borderRadius: '50%',
    width: 70,
    height: 70,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: Math.max(0, -swipeX * 2.5),
    fontSize: 28,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    zIndex: 100
  }

  const rightActionStyle: CSSProperties = {
    position: 'fixed',
    right: 20,
    top: '50%',
    transform: `translateY(-50%) scale(${Math.min(1, swipeX * 2)})`,
    background: 'var(--success, #22c55e)',
    color: 'white',
    borderRadius: '50%',
    width: 70,
    height: 70,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: Math.max(0, swipeX * 2.5),
    fontSize: 32,
    boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)',
    zIndex: 100
  }

  const sheetStyle: CSSProperties = {
    '--sheet-progress': sheet.progress
  } as CSSProperties

  return (
    <AppLayout>
      <Header
        showLogo
        showDate
        objective={currentObjective}
        onObjectiveClick={() => setShowGoalPicker(true)}
        burnoutMode={burnoutMode}
        energyLevel={currentEnergy}
        onFlameClick={() => setShowEnergyPicker(true)}
      />

      <main
        className="main-area"
        style={{
          ...(burnoutMode === 'recovery' ? { filter: 'grayscale(30%)', opacity: 0.95 } : {}),
          touchAction: 'pan-x', // Allow horizontal swipe, vertical handled by sheet
          userSelect: 'none'
        }}
        {...sheet.pullUpProps}
      >
        {/* Recovery Mode Banner */}
        {burnoutMode === 'recovery' && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-md)',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
              🌱 Recovery mode — only gentle tasks shown
            </div>
            <button
              onClick={handleExitBurnoutMode}
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--orb-orange)',
                background: 'none',
                border: '1px solid var(--orb-orange)',
                borderRadius: 'var(--radius-full)',
                padding: 'var(--space-xs) var(--space-md)',
                cursor: 'pointer'
              }}
            >
              Exit recovery mode
            </button>
          </div>
        )}

        {/* Burnout Mode Indicator */}
        {burnoutModeMessage && burnoutMode !== 'recovery' && (
          <div style={{
            textAlign: 'center',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-sm)',
            padding: 'var(--space-xs) var(--space-md)',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-full)',
            display: 'inline-block',
            margin: '0 auto var(--space-sm)'
          }}>
            {burnoutModeMessage}
          </div>
        )}

        {/* Momentum Message */}
        {momentumMessage && (
          <div style={{
            textAlign: 'center',
            fontSize: 'var(--text-sm)',
            color: 'var(--orb-orange)',
            marginBottom: 'var(--space-md)'
          }}>
            {momentumMessage}
          </div>
        )}

        {/* Task Display - Full Screen */}
        <div className="task-display" style={{ flex: 1, padding: 0 }}>
          {currentTask ? (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              {/* Swipe action indicators */}
              <div style={leftActionStyle}><span>💤</span></div>
              <div style={rightActionStyle}><span>✓</span></div>

              {/* Task Card */}
              <div
                className={`glass-card-transparent task-card ${cardSettings?.cardBackgroundImage ? (cardSettings.cardBackgroundBrightness === 'light' ? 'bg-light' : 'bg-dark') : ''}`}
                style={{
                  ...taskCardStyle,
                  ...(cardSettings?.cardBackgroundImage ? {
                    backgroundImage: `url(${cardSettings.cardBackgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {})
                }}
                {...swipeHandlers}
              >
                <div className="task-header">
                  <h1
                    className="task-title"
                    onClick={() => handleEditTaskType(currentTask)}
                    style={{ cursor: 'pointer' }}
                    title="Tap to edit"
                  >
                    {currentTask.verbLabel}. ✎
                  </h1>
                  <p className="task-subtitle">{currentTask.taskBody}</p>
                </div>

                <div className="due-row">
                  <div className="due-item">
                    <span className="due-label">due</span>
                    <span className="due-value">today</span>
                  </div>
                  <div className="due-item" style={{ flexDirection: 'row', gap: 'var(--space-md)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {getEnergyBolts(currentTask.feedLevel)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: 'var(--text-sm)' }}>◷</span>
                      <span>{currentTask.timeEstimate} mins</span>
                    </span>
                  </div>
                </div>

                <div className="tags-row">
                  <div onClick={() => handleEditTaskType(currentTask)} style={{ cursor: 'pointer' }}>
                    <Tag variant="energy">{currentTask.feedLevel} energy ✎</Tag>
                  </div>
                  {currentTask.timeOfDay !== 'anytime' && (
                    <Tag variant="focus">{currentTask.timeOfDay}</Tag>
                  )}
                </div>

                {pinnedTask && (
                  <div style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
                    <button className="action-link" onClick={handleUnpinTask} style={{ color: 'var(--orb-orange)' }}>
                      ★ Pinned — tap to unpin
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                  <Button variant="secondary" onClick={() => {
                    completeTask(currentTask.id, 0)
                    setShowCelebration(true)
                    refreshMomentum()
                  }}>
                    Done ✓
                  </Button>
                  <Button variant="primary" onClick={() => handleStartTask(currentTask)}>
                    Start Timer
                  </Button>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-subtle)',
                  padding: '0 var(--space-sm)'
                }}>
                  <span>← later</span>
                  <span>done →</span>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState variant="tasks" />
          )}

          {currentTask && (
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: 'var(--space-sm)' }}>
              <Tooltip
                id="now-swipe"
                message="swipe right to complete · swipe left for later"
                position="top"
                delay={1500}
                autoDismiss={6000}
              />
            </div>
          )}
        </div>

        {/* Subtle hint at bottom - swipe works from anywhere */}
        {upcomingTasks.length > 0 && sheet.progress < 0.3 && (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-sm)',
              color: 'var(--text-subtle)',
              fontSize: 'var(--text-xs)',
              opacity: 0.6,
              pointerEvents: 'none'
            }}
          >
            <span style={{ fontSize: '16px' }}>⌃</span>
            <span style={{ marginLeft: '6px' }}>{upcomingTasks.length} more</span>
          </div>
        )}
      </main>

      {/* Upcoming Sheet - swipe down anywhere to close */}
      <div
        className={`upcoming-sheet ${sheet.isOpen ? 'sheet-visible' : ''}`}
        style={{
          ...sheetStyle,
          touchAction: sheet.isOpen ? 'none' : 'auto'
        }}
        {...sheet.handleProps}
      >
        <div className="sheet-drag-zone">
          <div className="sheet-handle">
            <div className="sheet-handle-bar" />
          </div>
          <h2 className="sheet-title">Upcoming</h2>
        </div>

        <div className="sheet-content" style={{ pointerEvents: sheet.isDragging ? 'none' : 'auto' }}>
          {currentTask && (
            <div className="sheet-section">
              <div className="sheet-section-label">current</div>
              <div className="upcoming-card sheet-card" onClick={() => { sheet.close(); handleStartTask(currentTask) }}>
                <div className="upcoming-card-header">
                  <span className="upcoming-time">Now</span>
                  <div className="upcoming-energy">
                    <span>{getEnergyBolts(currentTask.feedLevel)}</span>
                    <span>◷ {currentTask.timeEstimate} min</span>
                  </div>
                </div>
                <div className="upcoming-title">{currentTask.verbLabel}.</div>
              </div>
            </div>
          )}

          {upcomingTasks.length > 0 && (
            <div className="sheet-section">
              <div className="sheet-section-label">next up</div>
              <div className="upcoming-list">
                {upcomingTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="upcoming-card sheet-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => { sheet.close(); handleStartTask(task) }}
                  >
                    <div className="upcoming-card-header">
                      <span className="upcoming-time">Later</span>
                      <div className="upcoming-energy">
                        <span>{getEnergyBolts(task.feedLevel)}</span>
                        <span>◷ {task.timeEstimate} mins</span>
                      </div>
                    </div>
                    <div className="upcoming-title">{task.taskBody || task.verbLabel}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="sheet-close-hint" onClick={sheet.close}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
            <span>swipe down to close</span>
          </button>
        </div>
      </div>

      {/* Timer Overlay */}
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

      <QuickAddPanel
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={handleQuickAdd}
        placeholder="What's on your mind?"
        isLoading={isAILoading}
      />

      <Celebration show={showCelebration} onComplete={() => setShowCelebration(false)} />

      {/* Goal Picker Modal */}
      <Modal isOpen={showGoalPicker} onClose={() => setShowGoalPicker(false)} title="Change Active Goal">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {activeGoals.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
              No goals yet. Create one in Organize → Goals.
            </p>
          ) : (
            activeGoals.map(goal => (
              <button
                key={goal.id}
                onClick={() => handleSelectGoal(goal.id)}
                style={{
                  padding: 'var(--space-md)',
                  background: goal.isActive ? 'var(--orb-orange)' : 'var(--bg-card)',
                  color: goal.isActive ? 'white' : 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ fontWeight: 600 }}>{goal.title}</div>
                {goal.description && (
                  <div style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginTop: '4px' }}>
                    {goal.description}
                  </div>
                )}
                {goal.isActive && (
                  <div style={{ fontSize: 'var(--text-xs)', marginTop: '8px' }}>✓ Currently Active</div>
                )}
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* Energy Picker Modal */}
      <EnergyPicker
        isOpen={showEnergyPicker}
        onClose={() => setShowEnergyPicker(false)}
        currentEnergy={currentEnergy}
        burnoutMode={burnoutMode}
        onEnergyChange={setEnergy}
        onBurnoutModeChange={handleBurnoutModeChange}
      />

      {/* Task Type Editor Modal */}
      <Modal isOpen={showTaskTypeEditor} onClose={() => setShowTaskTypeEditor(false)} title="Edit Task">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              Verb Label (max 12 chars)
            </label>
            <input
              type="text"
              value={editingVerbLabel}
              onChange={(e) => setEditingVerbLabel(e.target.value.slice(0, 12))}
              maxLength={12}
              style={{
                width: '100%',
                padding: 'var(--space-sm)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text)',
                fontSize: 'var(--text-md)'
              }}
              placeholder="e.g., Call, Email, Review"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              Energy Level
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              {(['low', 'medium', 'high'] as FeedLevel[]).map(level => (
                <button
                  key={level}
                  onClick={() => setEditingFeedLevel(level)}
                  style={{
                    flex: 1,
                    padding: 'var(--space-sm)',
                    borderRadius: 'var(--radius-md)',
                    border: editingFeedLevel === level ? '2px solid var(--orb-orange)' : '1px solid var(--border)',
                    background: editingFeedLevel === level ? 'var(--orb-orange)' : 'var(--bg-card)',
                    color: editingFeedLevel === level ? 'white' : 'var(--text)',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" onClick={handleSaveTaskType}>
            Save Changes
          </Button>
        </div>
      </Modal>
    </AppLayout>
  )
}
