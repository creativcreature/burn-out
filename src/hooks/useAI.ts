import { useState, useCallback } from 'react'
import { getData, updateData } from '../utils/storage'
import { sendMessage, type ExtractedTask } from '../utils/ai'
import type { ChatMessage, Conversation } from '../data/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  tasksCreated?: string[]
}

interface UseAIOptions {
  onTasksExtracted?: (tasks: ExtractedTask[]) => void
  autoSaveTasks?: boolean
  onTasksCreated?: (tasks: ExtractedTask[]) => Promise<string[]>
}

export function useAI(options: UseAIOptions = {}) {
  const { onTasksExtracted, autoSaveTasks = false, onTasksCreated } = options
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pendingTasks, setPendingTasks] = useState<ExtractedTask[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  const loadHistory = useCallback(async () => {
    const data = await getData()

    // Check for active (non-archived) conversation
    const activeConvo = data.conversations.find(c => !c.isArchived)
    if (activeConvo) {
      setActiveConversationId(activeConvo.id)
      setMessages(activeConvo.messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        tasksCreated: m.tasksCreated
      })))
    } else {
      // Fall back to legacy chatHistory for migration
      setMessages(data.chatHistory.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        tasksCreated: m.tasksCreated
      })))
    }
  }, [])

  const saveMessage = useCallback(async (message: Message) => {
    const chatMessage: ChatMessage = {
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString(),
      tasksCreated: message.tasksCreated
    }

    await updateData(data => {
      // If we have an active conversation, add to it
      if (activeConversationId) {
        const conversations = data.conversations.map(c => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              messages: [...c.messages, chatMessage],
              lastMessageAt: chatMessage.timestamp
            }
          }
          return c
        })
        return { ...data, conversations }
      }

      // Otherwise create a new conversation
      const newConversation: Conversation = {
        id: crypto.randomUUID(),
        title: message.role === 'user'
          ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
          : 'New conversation',
        createdAt: chatMessage.timestamp,
        lastMessageAt: chatMessage.timestamp,
        isArchived: false,
        messages: [chatMessage]
      }

      setActiveConversationId(newConversation.id)

      return {
        ...data,
        conversations: [...data.conversations, newConversation]
      }
    })
  }, [activeConversationId])

  const send = useCallback(async (input: string): Promise<void> => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    await saveMessage(userMessage)
    setIsLoading(true)

    try {
      const data = await getData()
      const config = {
        burnoutMode: data.user.burnoutMode,
        tonePreference: data.user.tonePreference,
        goals: data.goals,
        projects: data.projects
      }

      // Build message history for context
      const history = [...messages, userMessage].slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))

      const response = await sendMessage(history, config)

      // Handle extracted tasks
      if (response.tasks.length > 0) {
        onTasksExtracted?.(response.tasks)

        if (autoSaveTasks && onTasksCreated) {
          // Auto-save tasks (old behavior)
          const createdIds = await onTasksCreated(response.tasks)
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: response.message,
            tasksCreated: createdIds.length > 0 ? createdIds : undefined
          }
          setMessages(prev => [...prev, assistantMessage])
          await saveMessage(assistantMessage)
        } else {
          // Store pending tasks for confirmation
          setPendingTasks(response.tasks)
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: response.message
          }
          setMessages(prev => [...prev, assistantMessage])
          await saveMessage(assistantMessage)
        }
      } else {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.message
        }
        setMessages(prev => [...prev, assistantMessage])
        await saveMessage(assistantMessage)
      }
    } catch (error) {
      console.error('AI send error:', error)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Something went wrong. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages, saveMessage, onTasksExtracted, onTasksCreated, autoSaveTasks])

  const clearPendingTasks = useCallback(() => {
    setPendingTasks([])
  }, [])

  const startNewConversation = useCallback(async () => {
    // Archive current conversation if it has messages
    if (activeConversationId) {
      await updateData(data => ({
        ...data,
        conversations: data.conversations.map(c =>
          c.id === activeConversationId ? { ...c, isArchived: true } : c
        )
      }))
    }
    setActiveConversationId(null)
    setMessages([])
    setPendingTasks([])
  }, [activeConversationId])

  const loadConversation = useCallback(async (conversationId: string) => {
    const data = await getData()
    const conversation = data.conversations.find(c => c.id === conversationId)
    if (conversation) {
      setActiveConversationId(conversation.id)
      setMessages(conversation.messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        tasksCreated: m.tasksCreated
      })))
      setPendingTasks([])
    }
  }, [])

  const clearHistory = useCallback(async () => {
    await updateData(data => ({
      ...data,
      chatHistory: [],
      conversations: data.conversations.map(c =>
        c.id === activeConversationId ? { ...c, messages: [] } : c
      )
    }))
    setMessages([])
    setPendingTasks([])
  }, [activeConversationId])

  return {
    messages,
    isLoading,
    send,
    loadHistory,
    clearHistory,
    pendingTasks,
    clearPendingTasks,
    activeConversationId,
    startNewConversation,
    loadConversation
  }
}
