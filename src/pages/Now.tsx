import { useState, useCallback, useEffect, CSSProperties, useRef, TouchEvent as ReactTouchEvent, WheelEvent } from 'react'
import { AppLayout, Header } from '../components/layout'
import { Button, Toast, FloatingActionButton, QuickAddPanel, Tag, Tooltip, EmptyState, Celebration, Modal, EnergySelector } from '../components/shared'
import { TimerOverlay } from '../components/timer'
import { useTasks } from '../hooks/useTasks'
import { useEnergy } from '../hooks/useEnergy'
import { useAI } from '../hooks/useAI'
import { useGoals } from '../hooks/useGoals'
import { getData, setPinnedTaskId } from '../utils/storage'
import type { Task, Settings, FeedLevel } from '../data/types'
import type { ExtractedTask } from '../utils/ai'

export function NowPage() {
  const { pendingTasks, completeTask, deferTask, snoozeTask, addTask, updateTask } = useTasks()
  const { activeGoals, currentActiveGoal, setActiveGoal } = useGoals()
  const {
    currentEnergy,
    setEnergy,
    getSuggestedTask,
    sortTasksByEnergy,
    getMomentumMessage,
    getBurnoutModeMessage,
    refreshMomentum
  } = useEnergy()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showTimer, setShowTimer] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', visible: false })
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [cardSettings, setCardSettings] = useState<Pick<Settings, 'cardBackgroundImage' | 'cardBackgroundBrightness'> | null>(null)
  const [pinnedTaskId, setPinnedTaskIdState] = useState<string | undefined>(undefined)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showGoalPicker, setShowGoalPicker] = useState(false)
  const [showTaskTypeEditor, setShowTaskTypeEditor] = useState(false)
  const [editingVerbLabel, setEditingVerbLabel] = useState('')
  const [editingFeedLevel, setEditingFeedLevel] = useState<FeedLevel>('medium')

  // Load settings including pinned task
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

  // Handle unpinning task
  const handleUnpinTask = async () => {
    await setPinnedTaskId(undefined)
    setPinnedTaskIdState(undefined)
  }

  // Scroll/swipe progress for upcoming sheet animation
  const [scrollProgress, setScrollProgress] = useState(0)
  const progressRef = useRef<number>(0) // Track current progress for touch handlers
  const touchStartY = useRef<number>(0)
  const lastTouchY = useRef<number>(0)
  const velocity = useRef<number>(0)
  const isDragging = useRef<boolean>(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const animationFrame = useRef<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const isAtScrollTop = useRef<boolean>(true)

  // Horizontal swipe state for task card actions
  const [taskSwipeX, setTaskSwipeX] = useState(0)
  const touchStartX = useRef<number>(0)
  const lastTouchX = useRef<number>(0)
  const horizontalVelocity = useRef<number>(0)
  const isHorizontalDrag = useRef<boolean>(false)
  const taskCardRef = useRef<HTMLDivElement>(null)

  // Keep progressRef in sync with state
  useEffect(() => {
    progressRef.current = scrollProgress
  }, [scrollProgress])

  // Smart touch handlers that route to vertical or horizontal gestures
  const handleTouchStart = (e: ReactTouchEvent) => {
    // Don't prevent default - allow normal scrolling
    // e.preventDefault()
    // e.stopPropagation()
    
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current)
      animationFrame.current = null
    }
    
    // Reset all touch tracking
    touchStartY.current = e.touches[0].clientY
    touchStartX.current = e.touches[0].clientX
    lastTouchY.current = e.touches[0].clientY
    lastTouchX.current = e.touches[0].clientX
    velocity.current = 0
    horizontalVelocity.current = 0
    isDragging.current = true
    isHorizontalDrag.current = false
  }

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (!isDragging.current) return

    // Don't prevent default - allow normal scrolling
    // e.preventDefault()
    // e.stopPropagation()

    const currentY = e.touches[0].clientY
    const currentX = e.touches[0].clientX
    const deltaY = lastTouchY.current - currentY
    const deltaX = currentX - lastTouchX.current

    // Determine gesture direction on first significant movement
    // Higher threshold to avoid conflicting with natural scroll
    if (!isHorizontalDrag.current && (Math.abs(deltaX) > 15 || Math.abs(deltaY) > 15)) {
      isHorizontalDrag.current = Math.abs(deltaX) > Math.abs(deltaY)
      // Only capture gesture if it's clearly intentional
      if (!isHorizontalDrag.current && scrollProgress > 0.1) {
        // Let vertical scroll happen naturally when sheet is closed
        isDragging.current = false
        return
      }
    }

    if (isHorizontalDrag.current) {
      // Handle horizontal swipe for task actions
      if (Math.abs(deltaX) < 2) return
      
      horizontalVelocity.current = deltaX
      lastTouchX.current = currentX
      
      const sensitivity = 120
      const swipeDistance = (currentX - touchStartX.current) / sensitivity
      const clampedDistance = Math.max(-1, Math.min(1, swipeDistance))
      
      setTaskSwipeX(clampedDistance)
    } else {
      // Handle vertical swipe for upcoming sheet
      if (Math.abs(deltaY) < 2) return

      velocity.current = deltaY
      lastTouchY.current = currentY

      const sensitivity = 150
      const progressDelta = deltaY / sensitivity
      const newProgress = Math.max(0, Math.min(1, progressRef.current + progressDelta))

      progressRef.current = newProgress
      setScrollProgress(newProgress)
    }
  }

  const handleTouchEnd = (_e: ReactTouchEvent) => {
    // Don't prevent default - allow normal scrolling
    // e.preventDefault()
    // e.stopPropagation()
    isDragging.current = false

    if (isHorizontalDrag.current) {
      // Mark for swipe action processing (will be handled by useEffect)
      setTaskSwipeX(prev => prev) // Trigger re-render to process swipe
    } else {
      // Handle vertical swipe snap
      animateToSnap()
    }
  }

  // Drag zone handlers - always work for closing (touch-action: none in CSS)
  const handleDragZoneTouchStart = (e: ReactTouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current)
      animationFrame.current = null
    }
    touchStartY.current = e.touches[0].clientY
    lastTouchY.current = e.touches[0].clientY
    velocity.current = 0
    isDragging.current = true
  }

  const handleDragZoneTouchMove = (e: ReactTouchEvent) => {
    if (!isDragging.current) return

    e.preventDefault()
    e.stopPropagation()

    const currentY = e.touches[0].clientY
    const deltaY = lastTouchY.current - currentY // positive = up, negative = down

    // Only handle significant movement
    if (Math.abs(deltaY) < 2) return

    velocity.current = deltaY
    lastTouchY.current = currentY

    const sensitivity = 150 // More sensitive for easier scrolling
    const progressDelta = deltaY / sensitivity
    const newProgress = Math.max(0, Math.min(1, progressRef.current + progressDelta))

    progressRef.current = newProgress
    setScrollProgress(newProgress)
  }

  const handleDragZoneTouchEnd = (e: ReactTouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.current = false
    animateToSnap()
  }

  // Content area pull-to-close handlers
  const handleContentTouchStart = (e: ReactTouchEvent) => {
    if (scrollProgress < 0.95) return // Only when sheet is open

    const content = contentRef.current
    if (!content) return

    isAtScrollTop.current = content.scrollTop <= 0

    if (isAtScrollTop.current) {
      // Prepare for potential close gesture
      touchStartY.current = e.touches[0].clientY
      lastTouchY.current = e.touches[0].clientY
      velocity.current = 0
    }
  }

  const handleContentTouchMove = (e: ReactTouchEvent) => {
    if (scrollProgress < 0.95) return

    const content = contentRef.current
    if (!content) return

    const currentY = e.touches[0].clientY
    const deltaFromStart = currentY - touchStartY.current // positive = pulling down

    // Only intercept if pulling DOWN from scroll top
    if (deltaFromStart > 10 && isAtScrollTop.current && content.scrollTop <= 0) {
      e.preventDefault()
      isDragging.current = true

      const deltaY = lastTouchY.current - currentY
      velocity.current = deltaY
      lastTouchY.current = currentY

      const sensitivity = 300
      const progressDelta = deltaY / sensitivity
      const newProgress = Math.max(0, Math.min(1, progressRef.current + progressDelta))

      progressRef.current = newProgress
      setScrollProgress(newProgress)
    }
  }

  const handleContentTouchEnd = () => {
    if (isDragging.current) {
      isDragging.current = false
      animateToSnap()
    }
  }

  const animateToSnap = useCallback(() => {
    const currentProgress = progressRef.current
    const currentVelocity = velocity.current

    const animateToTarget = (target: number) => {
      const animate = () => {
        const current = progressRef.current
        const diff = target - current
        // Use faster animation for more responsive feel
        const step = diff * 0.3

        if (Math.abs(diff) < 0.01) {
          progressRef.current = target
          setScrollProgress(target)
          return
        }

        const newVal = current + step
        progressRef.current = newVal
        setScrollProgress(newVal)
        animationFrame.current = requestAnimationFrame(animate)
      }
      animationFrame.current = requestAnimationFrame(animate)
    }

    // Ultra-responsive threshold for mobile
    const velocityThreshold = 0.8

    // Velocity is negative when moving down (closing), positive when moving up (opening)
    if (currentVelocity > velocityThreshold) {
      // Moving up - open fully
      animateToTarget(1)
    } else if (currentVelocity < -velocityThreshold) {
      // Moving down - close
      animateToTarget(0)
    } else {
      // Use position-based decision with mobile-friendly thresholds
      // When mostly open (0.8+), make it easier to close
      if (currentProgress >= 0.8) {
        animateToTarget(0)
      } else if (currentProgress > 0.3) {
        animateToTarget(1)
      } else {
        animateToTarget(0)
      }
    }
  }, [])

  // Handle mouse wheel for desktop
  const handleWheel = (e: WheelEvent) => {
    // When sheet is fully closed (progress === 0), let native scrolling work
    if (progressRef.current === 0) {
      return
    }

    // Only handle wheel if sheet is not scrollable or at boundaries
    const sheet = sheetRef.current
    if (sheet && progressRef.current >= 1) {
      const atTop = sheet.scrollTop <= 0
      const atBottom = sheet.scrollTop >= sheet.scrollHeight - sheet.clientHeight

      // If scrolling down and at top, close sheet
      if (e.deltaY < 0 && atTop) {
        e.preventDefault()
        const delta = e.deltaY * 0.003
        const newProgress = Math.max(0, Math.min(1, progressRef.current + delta))
        progressRef.current = newProgress
        setScrollProgress(newProgress)
        return
      }

      // If at bottom and scrolling up, don't interfere
      if (e.deltaY > 0 && !atBottom) {
        return
      }
    }

    // Normal wheel handling for opening (only when sheet is partially visible)
    if (progressRef.current > 0 && progressRef.current < 1) {
      e.preventDefault()
      const delta = e.deltaY * 0.003
      const newProgress = Math.max(0, Math.min(1, progressRef.current + delta))
      progressRef.current = newProgress
      setScrollProgress(newProgress)
    }
  }

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [])

  // Calculate dynamic styles based on scroll progress and swipe state
  const taskCardStyle: CSSProperties = {
    filter: `blur(${scrollProgress * 12}px)`,
    opacity: 1 - (scrollProgress * 0.6),
    transform: `
      scale(${1 - (scrollProgress * 0.08)}) 
      translateY(${scrollProgress * -20}px)
      translateX(${taskSwipeX * 120}px)
    `,
    transition: isDragging.current ? 'none' : 'filter 150ms ease-out, opacity 150ms ease-out, transform 200ms ease-out'
  }

  // Action reveal styles
  const leftActionStyle: CSSProperties = {
    position: 'absolute',
    right: 'calc(100% + 20px)',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'var(--text-muted)',
    color: 'white',
    borderRadius: '50%',
    width: 60,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: Math.max(0, -taskSwipeX * 2),
    fontSize: 24,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
  }

  const rightActionStyle: CSSProperties = {
    position: 'absolute',
    left: 'calc(100% + 20px)',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'var(--success, #22c55e)',
    color: 'white',
    borderRadius: '50%',
    width: 60,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: Math.max(0, taskSwipeX * 2),
    fontSize: 28,
    boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)'
  }

  const upcomingSheetStyle: CSSProperties = {
    '--sheet-progress': scrollProgress
  } as CSSProperties

  // Get current objective from active goal
  const currentObjective = currentActiveGoal?.title

  // Handle tasks created by AI - uses this component's addTask instance
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

  // Sort tasks by energy-aware scoring
  const sortedTasks = sortTasksByEnergy(pendingTasks)
  // Use pinned task if set, otherwise use AI suggestion
  const pinnedTask = pinnedTaskId ? pendingTasks.find(t => t.id === pinnedTaskId) : undefined
  const currentTask = pinnedTask || getSuggestedTask(pendingTasks)
  const upcomingTasks = sortedTasks.filter(t => t.id !== currentTask?.id)

  // Handle swipe actions when swipe completes
  useEffect(() => {
    if (!isDragging.current && isHorizontalDrag.current && currentTask) {
      const swipeThreshold = 0.3
      const velocityThreshold = 0.5

      if (Math.abs(taskSwipeX) > swipeThreshold || Math.abs(horizontalVelocity.current) > velocityThreshold) {
        if (taskSwipeX > 0 || horizontalVelocity.current > velocityThreshold) {
          // Swipe right = COMPLETE ✓
          completeTask(currentTask.id, 0)
          setShowCelebration(true)
          refreshMomentum()
          setTaskSwipeX(0)
        } else if (taskSwipeX < 0 || horizontalVelocity.current < -velocityThreshold) {
          // Swipe left = defer/later
          handleSnoozeTask(currentTask)
          setTaskSwipeX(0)
        }
      } else if (scrollProgress === 0 && taskSwipeX === 0) {
        // Swipe down from normal state = shuffle
        const totalDeltaY = touchStartY.current - lastTouchY.current
        if (totalDeltaY > 50) {
          deferTask(currentTask.id)
          setToast({ message: 'Shuffled to next task', type: 'info', visible: true })
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskSwipeX, currentTask, scrollProgress])

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
      // Refresh momentum count from storage
      await refreshMomentum()
    }
  }

  const handleSnoozeTask = async (task: Task) => {
    await snoozeTask(task.id)
    setToast({ message: 'Task snoozed. Will appear later.', type: 'info', visible: true })
  }

  // Handle goal selection from picker
  const handleSelectGoal = async (goalId: string) => {
    await setActiveGoal(goalId)
    setShowGoalPicker(false)
    setToast({ message: 'Active goal updated', type: 'success', visible: true })
  }

  // Handle task type editing
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

  const getEnergyBolts = (level: string) => {
    const num = level === 'low' ? 1 : level === 'medium' ? 2 : 3
    return Array(3).fill(0).map((_, i) => (
      <span key={i} className={`energy-bolt ${i >= num ? 'empty' : ''}`}>⚡</span>
    ))
  }

  const momentumMessage = getMomentumMessage()
  const burnoutModeMessage = getBurnoutModeMessage()

  return (
    <AppLayout>
      <Header 
        showLogo 
        showDate 
        objective={currentObjective} 
        onObjectiveClick={() => setShowGoalPicker(true)}
      />

      <main
        className="main-area"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Energy Selector - Battery Style */}
        <EnergySelector value={currentEnergy} onChange={setEnergy} />

        {/* Burnout Mode Indicator */}
        {burnoutModeMessage && (
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

        <div className="task-display">
          {currentTask ? (
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
              {/* Left action reveal (delete) */}
              <div style={leftActionStyle}>
                <span>💤</span>
              </div>
              
              {/* Right action reveal (complete) */}
              <div style={rightActionStyle}>
                <span>✓</span>
              </div>

              <div
                ref={taskCardRef}
                className={`glass-card-transparent task-card ${cardSettings?.cardBackgroundImage ? (cardSettings.cardBackgroundBrightness === 'light' ? 'bg-light' : 'bg-dark') : ''}`}
                style={{
                  ...taskCardStyle,
                  ...(cardSettings?.cardBackgroundImage ? {
                    backgroundImage: `url(${cardSettings.cardBackgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {})
                }}
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

              {/* Due row */}
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

              {/* Tags row - show task metadata (tappable to edit) */}
              <div className="tags-row">
                <div onClick={() => handleEditTaskType(currentTask)} style={{ cursor: 'pointer' }}>
                  <Tag variant="energy">{currentTask.feedLevel} energy ✎</Tag>
                </div>
                {currentTask.timeOfDay !== 'anytime' && (
                  <Tag variant="focus">{currentTask.timeOfDay}</Tag>
                )}
              </div>

              {/* Unpin indicator if task is pinned */}
              {pinnedTask && (
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
                  <button
                    className="action-link"
                    onClick={handleUnpinTask}
                    style={{ color: 'var(--orb-orange)' }}
                  >
                    ★ Pinned — tap to unpin
                  </button>
                </div>
              )}

              {/* Start button */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
                <Button variant="primary" onClick={() => handleStartTask(currentTask)}>
                  Start Task.
                </Button>
              </div>

              {/* Swipe hints */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-subtle)',
                padding: '0 var(--space-sm)'
              }}>
                <span>← later</span>
                <span>↓ shuffle</span>
                <span>done →</span>
              </div>
            </div>
            </div>
          ) : (
            <EmptyState variant="tasks" />
          )}
          
          {/* First-time tooltip for swipe hint */}
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

        {/* Upcoming tasks available via scroll up */}
      </main>

      {/* Upcoming Sheet Overlay */}
      <div
        ref={sheetRef}
        className={`upcoming-sheet ${scrollProgress > 0.95 ? 'sheet-visible' : ''}`}
        style={upcomingSheetStyle}
      >
        {/* Drag zone - always controls sheet position, has touch-action: none */}
        <div
          className="sheet-drag-zone"
          onTouchStart={handleDragZoneTouchStart}
          onTouchMove={handleDragZoneTouchMove}
          onTouchEnd={handleDragZoneTouchEnd}
        >
          <div className="sheet-handle">
            <div className="sheet-handle-bar" />
          </div>
          <h2 className="sheet-title">Upcoming</h2>
        </div>

        {/* Scrollable content area */}
        <div
          ref={contentRef}
          className="sheet-content"
          onTouchStart={handleContentTouchStart}
          onTouchMove={handleContentTouchMove}
          onTouchEnd={handleContentTouchEnd}
        >
          {currentTask && (
            <div className="sheet-section">
              <div className="sheet-section-label">current</div>
              <div className="upcoming-card sheet-card" onClick={() => { setScrollProgress(0); handleStartTask(currentTask) }}>
                <div className="upcoming-card-header">
                  <span className="upcoming-time">Now</span>
                  <div className="upcoming-energy">
                    <span>{getEnergyBolts(currentTask.feedLevel)}</span>
                    <span>◷ {currentTask.timeEstimate} min</span>
                  </div>
                </div>
                <div className="upcoming-title">{currentTask.verbLabel}.</div>
                <div className="tags-row" style={{ justifyContent: 'flex-start' }}>
                  <Tag variant="energy">Energy</Tag>
                  <Tag variant="focus">Focus</Tag>
                </div>
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
                    onClick={() => { setScrollProgress(0); handleStartTask(task) }}
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

          {/* Close indicator */}
          <button
            className="sheet-close-hint"
            onClick={() => setScrollProgress(0)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
            <span>swipe down to close</span>
          </button>
        </div>
      </div>

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

      <FloatingActionButton
        onQuickAdd={() => setIsQuickAddOpen(true)}
        isQuickAddOpen={isQuickAddOpen}
      />

      <QuickAddPanel
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={handleQuickAdd}
        placeholder="What's on your mind?"
        isLoading={isAILoading}
      />

      {/* Celebration on task complete */}
      <Celebration 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)} 
      />

      {/* Goal Picker Modal */}
      <Modal
        isOpen={showGoalPicker}
        onClose={() => setShowGoalPicker(false)}
        title="Change Active Goal"
      >
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
                  <div style={{ fontSize: 'var(--text-xs)', marginTop: '8px' }}>
                    ✓ Currently Active
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* Task Type Editor Modal */}
      <Modal
        isOpen={showTaskTypeEditor}
        onClose={() => setShowTaskTypeEditor(false)}
        title="Edit Task"
      >
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
