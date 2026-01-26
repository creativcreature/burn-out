import { useState, useCallback } from 'react'
import { getData, updateData } from '../utils/storage'
import { sendMessage, type ExtractedTask } from '../utils/ai'
import type { ChatMessage } from '../data/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  tasksCreated?: string[]
}

interface UseAIOptions {
  onTasksCreated?: (tasks: ExtractedTask[]) => Promise<string[]>
}

export function useAI(options: UseAIOptions = {}) {
  const { onTasksCreated } = options
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadHistory = useCallback(async () => {
    const data = await getData()
    setMessages(data.chatHistory.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      tasksCreated: m.tasksCreated
    })))
  }, [])

  const saveMessage = useCallback(async (message: Message) => {
    const chatMessage: ChatMessage = {
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString(),
      tasksCreated: message.tasksCreated
    }

    await updateData(data => ({
      ...data,
      chatHistory: [...data.chatHistory, chatMessage]
    }))
  }, [])

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
        tonePreference: data.user.tonePreference
      }

      // Build message history for context
      const history = [...messages, userMessage].slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))

      const response = await sendMessage(history, config)

      // Create tasks via callback if any were extracted
      let createdTaskIds: string[] = []
      if (response.tasks.length > 0 && onTasksCreated) {
        createdTaskIds = await onTasksCreated(response.tasks)
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.message,
        tasksCreated: createdTaskIds.length > 0 ? createdTaskIds : undefined
      }

      setMessages(prev => [...prev, assistantMessage])
      await saveMessage(assistantMessage)
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
  }, [isLoading, messages, saveMessage, onTasksCreated])

  const clearHistory = useCallback(async () => {
    await updateData(data => ({
      ...data,
      chatHistory: []
    }))
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    send,
    loadHistory,
    clearHistory
  }
}
