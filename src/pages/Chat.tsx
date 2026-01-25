import { useState, useRef, useEffect, CSSProperties } from 'react'
import { AppLayout, Header } from '../components/layout'
import { Card, Button } from '../components/shared'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
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
    border: isUser ? 'none' : '1px solid var(--border-color)'
  })

  // Input container positioned above navigation
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

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response (replace with actual Claude API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I hear you. Let me help you break that down into manageable tasks. What feels most urgent or important right now?

(Note: AI integration coming soon. For now, use the Organize page to add tasks manually.)`
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestions = [
    'I have too much to do today...',
    'I need to plan my week',
    'Help me break down this project'
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
              <div key={msg.id} style={bubbleStyle(msg.role === 'user')}>
                {msg.content}
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
    </AppLayout>
  )
}
