import { useState, useCallback, useEffect, CSSProperties, useRef, TouchEvent as ReactTouchEvent, WheelEvent } from 'react'
import { AppLayout, Header } from '../components/layout'
import { Button, Toast, FloatingActionButton, QuickAddPanel, Tag } from '../components/shared'
import { TimerOverlay } from '../components/timer'
import { useTasks } from '../hooks/useTasks'
import { useEnergy } from '../hooks/useEnergy'
import { useAI } from '../hooks/useAI'
import { useGoals } from '../hooks/useGoals'
import { getData, setPinnedTaskId } from '../utils/storage'
import type { Task, EnergyLevel, Settings } from '../data/types'
import type { ExtractedTask } from '../utils/ai'

export function NowPage() {
  const { pendingTasks, completeTask, deferTask, addTask } = useTasks()
  const { goals } = useGoals()
  const {
    currentEnergy,
    setEnergy,
    getSuggestedTask,
    sortTasksByEnergy,
    getMomentumMessage,
    refreshMomentum
  } = useEnergy()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showTimer, setShowTimer] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', visible: false })
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [snoozeCount] = useState(1)
  const [pushCount] = useState(1)
  const [cardSettings, setCardSettings] = useState<Pick<Settings, 'cardBackgroundImage' | 'cardBackgroundBrightness'> | null>(null)
  const [pinnedTaskId, setPinnedTaskIdState] = useState<string | undefined>(undefined)

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
  const canDragSheet = useRef<boolean>(false) // Whether sheet drag should control progress
  const sheetRef = useRef<HTMLDivElement>(null)
  const animationFrame = useRef<number | null>(null)

  // Keep progressRef in sync with state
  useEffect(() => {
    progressRef.current = scrollProgress
  }, [scrollProgress])

  // Touch handlers for the main area (opening the sheet)
  const handleTouchStart = (e: ReactTouchEvent) => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current)
      animationFrame.current = null
    }
    touchStartY.current = e.touches[0].clientY
    lastTouchY.current = e.touches[0].clientY
    velocity.current = 0
    isDragging.current = true
    canDragSheet.current = false
  }

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (!isDragging.current) return

    const currentY = e.touches[0].clientY
    const deltaY = lastTouchY.current - currentY // positive = moving up, negative = moving down

    velocity.current = deltaY
    lastTouchY.current = currentY

    const sensitivity = 300
    const progressDelta = deltaY / sensitivity
    const newProgress = Math.max(0, Math.min(1, progressRef.current + progressDelta))

    progressRef.current = newProgress
    setScrollProgress(newProgress)
  }

  const handleTouchEnd = () => {
    isDragging.current = false
    animateToSnap()
  }

  // Track if we're in "drag to close" mode
  const dragToCloseActive = useRef<boolean>(false)
  const totalDragDistance = useRef<number>(0)

  const animateToSnap = useCallback(() => {
    const currentProgress = progressRef.current
    const currentVelocity = velocity.current

    const animateToTarget = (target: number) => {
      const animate = () => {
        const current = progressRef.current
        const diff = target - current
        // Use faster animation for more responsive feel
        const step = diff * 0.2

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

    // Lower threshold for more responsive snapping
    const velocityThreshold = 3

    // Velocity is negative when moving down (closing), positive when moving up (opening)
    if (currentVelocity > velocityThreshold) {
      // Moving up - open fully
      animateToTarget(1)
    } else if (currentVelocity < -velocityThreshold) {
      // Moving down - close
      animateToTarget(0)
    } else {
      // Use position-based decision with lower threshold for closing
      if (currentProgress > 0.4) {
        animateToTarget(1)
      } else {
        animateToTarget(0)
      }
    }
  }, [])

  // Handle mouse wheel for desktop
  const handleWheel = (e: WheelEvent) => {
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

    // Normal wheel handling for opening
    if (progressRef.current < 1) {
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

  // Attach touch listeners with { passive: false } to allow preventDefault
  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return

    const onTouchStart = (e: globalThis.TouchEvent) => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
        animationFrame.current = null
      }
      touchStartY.current = e.touches[0].clientY
      lastTouchY.current = e.touches[0].clientY
      velocity.current = 0
      isDragging.current = true
      totalDragDistance.current = 0

      const atTop = sheet.scrollTop <= 1
      canDragSheet.current = atTop
      dragToCloseActive.current = false
    }

    const onTouchMove = (e: globalThis.TouchEvent) => {
      if (!isDragging.current) return

      const currentY = e.touches[0].clientY
      const deltaFromStart = currentY - touchStartY.current
      const deltaFromLast = currentY - lastTouchY.current
      const isMovingDown = deltaFromLast > 0
      const atTop = sheet.scrollTop <= 1

      totalDragDistance.current += Math.abs(deltaFromLast)

      // Key fix: activate drag-to-close mode early when at top and moving down
      if (canDragSheet.current && isMovingDown && deltaFromStart > 2) {
        dragToCloseActive.current = true
      }

      if (dragToCloseActive.current) {
        // CRITICAL: prevent default to stop browser scroll
        e.preventDefault()
        e.stopPropagation()

        velocity.current = -deltaFromLast
        lastTouchY.current = currentY

        const sensitivity = 300
        const progressDelta = -deltaFromLast / sensitivity
        const newProgress = Math.max(0, Math.min(1, progressRef.current + progressDelta))

        progressRef.current = newProgress
        setScrollProgress(newProgress)
      } else {
        velocity.current = -deltaFromLast
        lastTouchY.current = currentY
        if (atTop) canDragSheet.current = true
      }
    }

    const onTouchEnd = () => {
      const wasActive = dragToCloseActive.current
      isDragging.current = false
      dragToCloseActive.current = false
      if (wasActive || progressRef.current < 0.98) {
        animateToSnap()
      }
    }

    // Add listeners with passive: false so preventDefault works
    sheet.addEventListener('touchstart', onTouchStart, { passive: true })
    sheet.addEventListener('touchmove', onTouchMove, { passive: false })
    sheet.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      sheet.removeEventListener('touchstart', onTouchStart)
      sheet.removeEventListener('touchmove', onTouchMove)
      sheet.removeEventListener('touchend', onTouchEnd)
    }
  }, [animateToSnap])

  // Calculate dynamic styles based on scroll progress
  const taskCardStyle: CSSProperties = {
    filter: `blur(${scrollProgress * 12}px)`,
    opacity: 1 - (scrollProgress * 0.6),
    transform: `scale(${1 - (scrollProgress * 0.08)}) translateY(${scrollProgress * -20}px)`,
    transition: 'filter 0.1s ease-out, opacity 0.1s ease-out, transform 0.1s ease-out'
  }

  const upcomingSheetStyle: CSSProperties = {
    '--sheet-progress': scrollProgress
  } as CSSProperties

  // Get current objective from goals
  const currentObjective = goals.length > 0 ? goals[0].title : undefined

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

  const handleStartTask = (task: Task) => {
    setActiveTask(task)
    setShowTimer(true)
  }

  const handleCompleteTask = async (duration: number) => {
    if (activeTask) {
      await completeTask(activeTask.id, duration)
      setShowTimer(false)
      setActiveTask(null)
      setToast({ message: 'Nice work! Task completed.', type: 'success', visible: true })
      // Refresh momentum count from storage
      await refreshMomentum()
    }
  }

  const handleDeferTask = async (task: Task) => {
    await deferTask(task.id)
    setToast({ message: 'Task moved to tomorrow.', type: 'info', visible: true })
  }

  const getEnergyBolts = (level: string) => {
    const num = level === 'low' ? 1 : level === 'medium' ? 2 : 3
    return Array(3).fill(0).map((_, i) => (
      <span key={i} className={`energy-bolt ${i >= num ? 'empty' : ''}`}>*</span>
    ))
  }

  const energySelectorStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-sm) var(--space-md)',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-full)',
    marginBottom: 'var(--space-md)'
  }

  const energyButtonStyle = (level: EnergyLevel): CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: currentEnergy === level ? '2px solid var(--orb-orange)' : '1px solid var(--border)',
    background: currentEnergy === level ? 'var(--orb-orange)' : 'transparent',
    color: currentEnergy === level ? 'white' : 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    transition: 'all var(--transition-fast)'
  })

  const momentumMessage = getMomentumMessage()

  return (
    <AppLayout>
      <Header showLogo showDate objective={currentObjective} />

      <main
        className="main-area"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Energy Selector */}
        <div style={energySelectorStyle}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginRight: 'var(--space-xs)' }}>
            Energy:
          </span>
          {([1, 2, 3, 4, 5] as EnergyLevel[]).map(level => (
            <button
              key={level}
              style={energyButtonStyle(level)}
              onClick={() => setEnergy(level)}
              title={`Energy level ${level}`}
            >
              {level}
            </button>
          ))}
        </div>

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
            >
              <div className="task-header">
                <h1 className="task-title">{currentTask.verbLabel}.</h1>
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

              {/* Tags row */}
              <div className="tags-row">
                <Tag variant="energy">Energy</Tag>
                <Tag variant="focus">Focus</Tag>
                <Tag variant="call">Call</Tag>
                <Tag variant="meeting">Meeting</Tag>
                <Tag variant="writing">Writing</Tag>
              </div>

              {/* Notes section */}
              {currentTask.taskBody && (
                <div className="notes-section">
                  <div className="notes-label">Notes:</div>
                  <div className="notes-text">{currentTask.taskBody}</div>
                </div>
              )}

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

              {/* Action row with snooze/push */}
              <div className="task-actions-row">
                <button className="action-link" onClick={() => handleDeferTask(currentTask)}>
                  ← snooze ({snoozeCount})
                </button>
                <Button variant="primary" onClick={() => handleStartTask(currentTask)}>
                  Start Task.
                </Button>
                <button className="action-link" onClick={() => handleDeferTask(currentTask)}>
                  push ({pushCount}) →
                </button>
              </div>

              {/* Swipe indicator */}
              <div className="swipe-indicator">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                <span>upcoming</span>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h2 className="task-title">Nothing.</h2>
              <p className="empty-text">Create a new task.</p>
            </div>
          )}
        </div>

        {/* Scroll/swipe hint */}
        {upcomingTasks.length > 0 && scrollProgress < 0.1 && (
          <div className="scroll-hint" style={{
            position: 'absolute',
            bottom: 'var(--space-lg)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-subtle)',
            fontSize: 'var(--text-xs)',
            animation: 'float 2s ease-in-out infinite'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            <span>scroll for upcoming</span>
          </div>
        )}
      </main>

      {/* Upcoming Sheet Overlay - native touch handlers attached via useEffect */}
      <div
        ref={sheetRef}
        className={`upcoming-sheet ${scrollProgress > 0.95 ? 'sheet-visible' : ''}`}
        style={upcomingSheetStyle}
      >
        {/* Sheet handle - always draggable, starts drag immediately */}
        <div
          className="sheet-handle"
          onTouchStart={() => {
            canDragSheet.current = true
            dragToCloseActive.current = true
          }}
        >
          <div className="sheet-handle-bar" />
        </div>

        <h2 className="sheet-title">Upcoming</h2>

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
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>close</span>
        </button>
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
    </AppLayout>
  )
}
