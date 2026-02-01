import { useState, useRef, useEffect, CSSProperties } from 'react'
import { Orb } from '../shared/Orb'
import { Button } from '../shared/Button'
import { useAI } from '../../hooks/useAI'
import type { BurnoutMode, TonePreference } from '../../data/types'
import type { ExtractedTask } from '../../utils/ai'

interface GuidedSettings {
  burnoutMode: BurnoutMode
  tonePreference: TonePreference
  tasks?: ExtractedTask[]
}

interface OnboardingGuidedProps {
  onComplete: (settings: GuidedSettings) => void
  onBack: () => void
}

interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
}

/**
 * Chat-based brain dump onboarding
 * User dumps everything on their mind, AI extracts tasks
 */
export function OnboardingGuided({ onComplete, onBack }: OnboardingGuidedProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "hey. what's weighing on you right now?\n\njust dump it all out — tasks, worries, half-formed thoughts. i'll help you sort through it."
    }
  ])
  const [input, setInput] = useState('')
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([])
  const [showConfirm, setShowConfirm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleTasksCreated = async (tasks: ExtractedTask[]): Promise<string[]> => {
    setExtractedTasks(prev => [...prev, ...tasks])
    return tasks.map(t => t.taskBody)
  }

  const { isLoading, send } = useAI({ onTasksCreated: handleTasksCreated })

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const containerStyle: CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-primary)'
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
    padding: 'var(--space-lg)',
    borderBottom: '1px solid var(--border)'
  }

  const messagesStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--space-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  }

  const messageStyle = (role: 'assistant' | 'user'): CSSProperties => ({
    maxWidth: '85%',
    padding: 'var(--space-md)',
    borderRadius: 'var(--radius-lg)',
    background: role === 'user' ? 'var(--orb-orange)' : 'var(--bg-card)',
    color: role === 'user' ? 'white' : 'var(--text)',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    whiteSpace: 'pre-wrap',
    lineHeight: 'var(--line-height-relaxed)'
  })

  const inputContainerStyle: CSSProperties = {
    padding: 'var(--space-md)',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg-primary)'
  }

  const textareaStyle: CSSProperties = {
    width: '100%',
    padding: 'var(--space-md)',
    fontSize: 'var(--text-md)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    color: 'var(--text)',
    resize: 'none',
    minHeight: 80,
    fontFamily: 'var(--font-body)',
    lineHeight: 'var(--line-height-normal)'
  }

  const tasksPreviewStyle: CSSProperties = {
    padding: 'var(--space-lg)',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    margin: 'var(--space-md) 0'
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    // Send to AI for task extraction
    await send(input.trim())
    
    // Add acknowledgment message
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: extractedTasks.length > 0 
        ? "got it. anything else on your mind? or we can get started with what we have."
        : "i hear you. keep going — what else is on your plate?"
    }
    setMessages(prev => [...prev, assistantMessage])

    // After first brain dump, show confirm option
    if (messages.length >= 2 && extractedTasks.length > 0) {
      setShowConfirm(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFinish = () => {
    onComplete({
      burnoutMode: 'balanced',
      tonePreference: 'gentle',
      tasks: extractedTasks
    })
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <Button variant="ghost" onClick={onBack}>← back</Button>
        <Orb size="sm" breathing />
        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          brain dump
        </span>
      </div>

      {/* Messages */}
      <div style={messagesStyle}>
        {messages.map(msg => (
          <div key={msg.id} style={messageStyle(msg.role)}>
            {msg.content}
          </div>
        ))}

        {isLoading && (
          <div style={messageStyle('assistant')}>
            <span style={{ opacity: 0.6 }}>thinking...</span>
          </div>
        )}

        {/* Extracted tasks preview */}
        {extractedTasks.length > 0 && showConfirm && (
          <div style={tasksPreviewStyle}>
            <p style={{ 
              fontWeight: 600, 
              marginBottom: 'var(--space-sm)',
              color: 'var(--text)'
            }}>
              i found {extractedTasks.length} tasks:
            </p>
            <ul style={{ 
              margin: 0, 
              paddingLeft: 'var(--space-lg)',
              color: 'var(--text-muted)'
            }}>
              {extractedTasks.slice(0, 5).map((task, i) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  {task.taskBody}
                </li>
              ))}
              {extractedTasks.length > 5 && (
                <li style={{ fontStyle: 'italic' }}>
                  +{extractedTasks.length - 5} more
                </li>
              )}
            </ul>
            <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)' }}>
              <Button variant="primary" onClick={handleFinish}>
                looks good, let's go
              </Button>
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>
                add more
              </Button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={inputContainerStyle}>
        <textarea
          ref={inputRef}
          style={textareaStyle}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="dump everything here..."
          disabled={isLoading}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: 'var(--space-sm)'
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            shift+enter for new line
          </span>
          <Button 
            variant="primary" 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? 'thinking...' : 'send'}
          </Button>
        </div>
      </div>
    </div>
  )
}
