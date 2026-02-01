import { useRef, useEffect, useState, useCallback, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout, Header } from '../components/layout'
import { Card, Button, Toast } from '../components/shared'
import { ChatSidebar, TaskPreviewCard, TypingIndicator } from '../components/chat'
import { useAI } from '../hooks/useAI'
import { useConversations } from '../hooks/useConversations'
import { useTasks } from '../hooks/useTasks'
import { useGoals } from '../hooks/useGoals'
import { useProjects } from '../hooks/useProjects'
import type { ExtractedTask } from '../utils/ai'

export function ChatPage() {
  const navigate = useNavigate()
  const { addTask } = useTasks()
  const { goals } = useGoals()
  const { projects } = useProjects()
  const [input, setInput] = useState('')
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', visible: false })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    conversations,
    activeConversationId,
    archiveConversation,
    loadConversation,
    deleteConversation,
    autoArchiveStale,
    startNewChat
  } = useConversations()

  // Handle task save from preview card
  const handleSaveTask = useCallback(async (taskData: ExtractedTask & { goalId?: string; projectId?: string }) => {
    await addTask({
      verbLabel: taskData.verbLabel.slice(0, 12),
      taskBody: taskData.taskBody,
      timeEstimate: taskData.timeEstimate,
      feedLevel: taskData.feedLevel,
      timeOfDay: 'anytime',
      goalId: taskData.suggestedGoalId,
      projectId: taskData.suggestedProjectId
    })
    setToast({
      message: 'Task added! View in Organize',
      type: 'success',
      visible: true
    })
  }, [addTask])

  const {
    messages,
    isLoading,
    send,
    loadHistory,
    pendingTasks,
    clearPendingTasks
  } = useAI({
    autoSaveTasks: false
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    loadHistory()
    autoArchiveStale()
  }, [loadHistory, autoArchiveStale])

  useEffect(() => {
    scrollToBottom()
  }, [messages, pendingTasks])

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden'
  }

  const messagesStyle: CSSProperties = {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--space-md)',
    paddingBottom: 'calc(100px + var(--safe-bottom))',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  }

  const bubbleStyle = (isUser: boolean): CSSProperties => ({
    maxWidth: '80%',
    padding: 'var(--space-md)',
    borderRadius: 'var(--radius-lg)',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    background: isUser ? 'var(--orb-orange)' : 'var(--bg-card)',
    color: isUser ? 'white' : 'var(--text)',
    border: isUser ? 'none' : '1px solid var(--border)',
    whiteSpace: 'pre-wrap',
    animation: isUser ? 'slide-in-right 200ms ease-out' : 'fade-in 200ms ease-out'
  })

  const inputContainerStyle: CSSProperties = {
    position: 'fixed',
    bottom: 'calc(var(--nav-height) + var(--safe-bottom) + var(--space-md))',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - var(--space-md) * 2)',
    maxWidth: '430px',
    display: 'flex',
    gap: 'var(--space-sm)',
    background: 'var(--bg-card-solid)',
    padding: 'var(--space-sm)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    backdropFilter: 'blur(var(--glass-blur))',
    zIndex: 100
  }

  const inputStyle: CSSProperties = {
    flex: 1,
    padding: 'var(--space-sm) var(--space-md)',
    fontSize: 'var(--text-md)',
    background: 'transparent',
    border: 'none',
    color: 'var(--text)',
    outline: 'none'
  }

  const emptyStateStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-lg)',
    padding: 'var(--space-xl)',
    textAlign: 'center'
  }

  const suggestionStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    width: '100%',
    maxWidth: 300
  }

  const headerActionsStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-sm)'
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const message = input
    setInput('')
    await send(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleDiscardTask = () => {
    // Clear all pending tasks when discarding
    clearPendingTasks()
  }

  const handleSaveTaskFromPending = async (taskData: ExtractedTask & { goalId?: string; projectId?: string }) => {
    await handleSaveTask(taskData)
    // Clear pending tasks after saving
    clearPendingTasks()
  }

  const suggestions = [
    'I have too much to do today...',
    'I need to plan my week',
    'Help me break down this project'
  ]

  const headerActions = (
    <div style={headerActionsStyle}>
      <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
        History
      </Button>
      <Button variant="ghost" size="sm" onClick={startNewChat}>
        New
      </Button>
    </div>
  )

  return (
    <AppLayout>
      <Header title="Chat" rightAction={headerActions} />

      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={loadConversation}
        onNewChat={startNewChat}
        onArchive={archiveConversation}
        onDelete={deleteConversation}
      />

      <div style={containerStyle}>
        {messages.length === 0 ? (
          <div style={emptyStateStyle}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                marginBottom: 'var(--space-sm)'
              }}>
                Brain Dump
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Share what's on your mind. I'll help you organize it into tasks.
              </p>
            </div>
            <div style={suggestionStyle}>
              {suggestions.map((suggestion, i) => (
                <Card key={i} onClick={() => setInput(suggestion)} padding="sm">
                  <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                    "{suggestion}"
                  </span>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div style={messagesStyle}>
            {messages.map(msg => (
              <div key={msg.id}>
                <div style={bubbleStyle(msg.role === 'user')}>
                  {msg.content}
                </div>
                {msg.tasksCreated && msg.tasksCreated.length > 0 && (
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--orb-orange)',
                    marginTop: 'var(--space-xs)',
                    paddingLeft: 'var(--space-sm)',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('/organize')}
                  >
                    {msg.tasksCreated.length} task{msg.tasksCreated.length > 1 ? 's' : ''} created - View in Organize
                  </div>
                )}
              </div>
            ))}

            {isLoading && <TypingIndicator />}

            {pendingTasks.length > 0 && pendingTasks.map((task, index) => (
              <TaskPreviewCard
                key={index}
                task={task}
                goals={goals}
                projects={projects}
                onSave={(taskData) => handleSaveTaskFromPending(taskData)}
                onDiscard={handleDiscardTask}
              />
            ))}

            <div ref={messagesEndRef} />
          </div>
        )}

        <div style={inputContainerStyle}>
          <input
            type="text"
            style={inputStyle}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            disabled={isLoading}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            Send
          </Button>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(t => ({ ...t, visible: false }))}
      />
    </AppLayout>
  )
}
