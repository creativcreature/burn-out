import { useState, useCallback, useEffect, CSSProperties, useRef, TouchEvent } from 'react'
import { AppLayout, Header } from '../components/layout'
import { Button, Toast, FloatingActionButton, QuickAddPanel, Tag } from '../components/shared'
import { TimerOverlay } from '../components/timer'
import { useTasks } from '../hooks/useTasks'
import { useEnergy } from '../hooks/useEnergy'
import { useAI } from '../hooks/useAI'
import { useGoals } from '../hooks/useGoals'
import { getData } from '../utils/storage'
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
  const [showTodayView, setShowTodayView] = useState(false)
  const [snoozeCount] = useState(1)
  const [pushCount] = useState(1)
  const [cardSettings, setCardSettings] = useState<Pick<Settings, 'cardBackgroundImage' | 'cardBackgroundBrightness'> | null>(null)

  // Load background image settings
  useEffect(() => {
    getData().then(data => {
      if (data.settings) {
        setCardSettings({
          cardBackgroundImage: data.settings.cardBackgroundImage,
          cardBackgroundBrightness: data.settings.cardBackgroundBrightness
        })
      }
    })
  }, [])

  // Swipe handling
  const touchStartY = useRef<number>(0)
  const touchEndY = useRef<number>(0)

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: TouchEvent) => {
    touchEndY.current = e.touches[0].clientY
  }

  const handleTouchEnd = () => {
    const diff = touchStartY.current - touchEndY.current
    // Swipe up threshold (50px)
    if (diff > 50 && !showTodayView) {
      setShowTodayView(true)
    }
    // Swipe down threshold
    if (diff < -50 && showTodayView) {
      setShowTodayView(false)
    }
  }

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
  const suggestedTask = getSuggestedTask(pendingTasks)
  const upcomingTasks = sortedTasks.filter(t => t.id !== suggestedTask?.id).slice(0, 3)

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
          {suggestedTask ? (
            <div
              className={`glass-card-transparent task-card ${showTodayView ? 'blurred' : ''} ${cardSettings?.cardBackgroundImage ? (cardSettings.cardBackgroundBrightness === 'light' ? 'bg-light' : 'bg-dark') : ''}`}
              style={cardSettings?.cardBackgroundImage ? {
                backgroundImage: `url(${cardSettings.cardBackgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              } : undefined}
            >
              <div className="task-header">
                <h1 className="task-title">{suggestedTask.verbLabel}.</h1>
                <p className="task-subtitle">{suggestedTask.taskBody}</p>
              </div>

              {/* Due row */}
              <div className="due-row">
                <div className="due-item">
                  <span className="due-label">due</span>
                  <span className="due-value">today</span>
                </div>
                <div className="due-item" style={{ flexDirection: 'row', gap: 'var(--space-md)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {getEnergyBolts(suggestedTask.feedLevel)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: 'var(--text-sm)' }}>◷</span>
                    <span>{suggestedTask.timeEstimate} mins</span>
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
              {suggestedTask.taskBody && (
                <div className="notes-section">
                  <div className="notes-label">Notes:</div>
                  <div className="notes-text">{suggestedTask.taskBody}</div>
                </div>
              )}

              {/* Action row with snooze/push */}
              <div className="task-actions-row">
                <button className="action-link" onClick={() => handleDeferTask(suggestedTask)}>
                  ← snooze ({snoozeCount})
                </button>
                <Button variant="primary" onClick={() => handleStartTask(suggestedTask)}>
                  Start Task.
                </Button>
                <button className="action-link" onClick={() => handleDeferTask(suggestedTask)}>
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

        {/* Upcoming section (visible when not in Today view) */}
        {upcomingTasks.length > 0 && !showTodayView && (
          <section className="upcoming-section">
            <div className="upcoming-header">
              <span className="upcoming-toggle">upcoming</span>
            </div>
            <div className="upcoming-list">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="upcoming-card" onClick={() => handleStartTask(task)}>
                  <div className="upcoming-card-header">
                    <span className="upcoming-time">2:30pm</span>
                    <div className="upcoming-energy">
                      <span>{getEnergyBolts(task.feedLevel)}</span>
                      <span>◷ {task.timeEstimate} mins</span>
                    </div>
                  </div>
                  <div className="upcoming-title">{task.taskBody || task.verbLabel}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Today View (slides up on swipe) */}
      <div className={`today-view ${showTodayView ? 'visible' : ''}`}>
        <h1 className="today-heading">Today</h1>

        {suggestedTask && (
          <>
            <div className="today-section-label">now</div>
            <div className="upcoming-card" onClick={() => { setShowTodayView(false); handleStartTask(suggestedTask) }}>
              <div className="upcoming-card-header">
                <span className="upcoming-time">◷ {suggestedTask.timeEstimate} min</span>
                <div className="upcoming-energy">
                  <span>{getEnergyBolts(suggestedTask.feedLevel)}</span>
                  <span>{suggestedTask.feedLevel === 'high' ? 'High Energy' : suggestedTask.feedLevel === 'medium' ? 'Med Energy' : 'Low Energy'}</span>
                </div>
              </div>
              <div className="upcoming-title">{suggestedTask.verbLabel}.</div>
              <div className="tags-row" style={{ justifyContent: 'flex-start' }}>
                <Tag variant="energy">Energy</Tag>
                <Tag variant="focus">Focus</Tag>
                <Tag variant="call">Call</Tag>
              </div>
            </div>
          </>
        )}

        {upcomingTasks.length > 0 && (
          <>
            <div className="today-section-label" style={{ marginTop: 'var(--space-xl)' }}>upcoming</div>
            <div className="upcoming-list">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="upcoming-card" onClick={() => { setShowTodayView(false); handleStartTask(task) }}>
                  <div className="upcoming-card-header">
                    <span className="upcoming-time">2:30pm</span>
                    <div className="upcoming-energy">
                      <span>{getEnergyBolts(task.feedLevel)}</span>
                      <span>◷ {task.timeEstimate} mins</span>
                    </div>
                  </div>
                  <div className="upcoming-title">{task.taskBody || task.verbLabel}</div>
                  <div className="upcoming-tags">
                    <Tag variant="love">Love</Tag>
                    <Tag variant="love">Love</Tag>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tap to close */}
        <button
          style={{
            position: 'fixed',
            bottom: 'calc(var(--nav-height) + var(--safe-bottom) + var(--space-md))',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-sm)',
            cursor: 'pointer'
          }}
          onClick={() => setShowTodayView(false)}
        >
          ↓ swipe down to close
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
