import { useRef, useEffect, useState, CSSProperties } from 'react'
import { AppLayout, Header } from '../components/layout'
import { Card, Button, Toast } from '../components/shared'
import { useAI } from '../hooks/useAI'

export function ChatPage() {
  const { messages, isLoading, send, loadHistory } = useAI()
  const [input, setInput] = useState('')
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', visible: false })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Show toast when tasks are created
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'assistant' && lastMessage.tasksCreated?.length) {
      const count = lastMessage.tasksCreated.length
      setToast({
        message: `${count} task${count > 1 ? 's' : ''} added to your list`,
        type: 'success',
        visible: true
      })
    }
  }, [messages])

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flex: 1
  }

  const messagesStyle: CSSProperties = {
    flex: 1,
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
    background: isUser ? 'var(--accent-primary)' : 'var(--bg-card)',
    color: isUser ? 'white' : 'var(--text-primary)',
    border: isUser ? 'none' : '1px solid var(--border-color)',
    whiteSpace: 'pre-wrap'
  })

  const inputContainerStyle: CSSProperties = {
    position: 'fixed',
    bottom: 'calc(var(--nav-height) + var(--safe-bottom) + var(--space-md))',
    left: 'var(--space-md)',
    right: 'var(--space-md)',
    display: 'flex',
    gap: 'var(--space-sm)',
    background: 'var(--bg-card)',
    padding: 'var(--space-sm)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    backdropFilter: 'var(--glass-blur)',
    zIndex: 100
  }

  const inputStyle: CSSProperties = {
    flex: 1,
    padding: 'var(--space-sm) var(--space-md)',
    fontSize: 'var(--text-md)',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
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

  const suggestions = [
    "I have too much to do today...",
    "I need to plan my week",
    "Help me break down this project"
  ]

  return (
    <AppLayout>
      <Header title="Chat" />
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
              <p style={{ color: 'var(--text-secondary)' }}>
                Share what's on your mind. I'll help you organize it into tasks.
              </p>
            </div>
            <div style={suggestionStyle}>
              {suggestions.map((suggestion, i) => (
                <Card key={i} onClick={() => setInput(suggestion)} padding="sm">
                  <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
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
                    color: 'var(--accent-primary)',
                    marginTop: 'var(--space-xs)',
                    paddingLeft: 'var(--space-sm)'
                  }}>
                    {msg.tasksCreated.length} task{msg.tasksCreated.length > 1 ? 's' : ''} created
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div style={bubbleStyle(false)}>
                <span style={{ color: 'var(--text-muted)' }}>Thinking...</span>
              </div>
            )}
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
