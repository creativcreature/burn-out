import { useState, useCallback, useEffect } from 'react'
import { getData, updateData } from '../utils/storage'
import type { Conversation } from '../data/types'

const STALE_THRESHOLD_MS = 60 * 60 * 1000 // 1 hour

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadConversations = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getData()
      setConversations(data.conversations)

      // Find active (non-archived) conversation
      const active = data.conversations.find(c => !c.isArchived)
      setActiveConversationId(active?.id || null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const activeConversation = conversations.find(c => c.id === activeConversationId)

  const createConversation = useCallback(async (firstMessage?: string): Promise<Conversation> => {
    const now = new Date().toISOString()
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: firstMessage
        ? firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '')
        : 'New conversation',
      createdAt: now,
      lastMessageAt: now,
      isArchived: false,
      messages: []
    }

    await updateData(data => ({
      ...data,
      conversations: [...data.conversations, newConversation]
    }))

    setConversations(prev => [...prev, newConversation])
    setActiveConversationId(newConversation.id)

    return newConversation
  }, [])

  const archiveConversation = useCallback(async (conversationId: string) => {
    await updateData(data => ({
      ...data,
      conversations: data.conversations.map(c =>
        c.id === conversationId ? { ...c, isArchived: true } : c
      )
    }))

    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, isArchived: true } : c)
    )

    // If we archived the active conversation, clear it
    if (activeConversationId === conversationId) {
      setActiveConversationId(null)
    }
  }, [activeConversationId])

  const unarchiveConversation = useCallback(async (conversationId: string) => {
    await updateData(data => ({
      ...data,
      conversations: data.conversations.map(c =>
        c.id === conversationId ? { ...c, isArchived: false } : c
      )
    }))

    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, isArchived: false } : c)
    )
  }, [])

  const loadConversation = useCallback(async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (conversation) {
      // If it was archived, unarchive it
      if (conversation.isArchived) {
        await unarchiveConversation(conversationId)
      }
      setActiveConversationId(conversationId)
    }
  }, [conversations, unarchiveConversation])

  const deleteConversation = useCallback(async (conversationId: string) => {
    await updateData(data => ({
      ...data,
      conversations: data.conversations.filter(c => c.id !== conversationId)
    }))

    setConversations(prev => prev.filter(c => c.id !== conversationId))

    if (activeConversationId === conversationId) {
      setActiveConversationId(null)
    }
  }, [activeConversationId])

  const autoArchiveStale = useCallback(async () => {
    const now = Date.now()
    const staleConversations = conversations.filter(c => {
      if (c.isArchived) return false
      const lastMessage = new Date(c.lastMessageAt).getTime()
      return now - lastMessage > STALE_THRESHOLD_MS
    })

    if (staleConversations.length === 0) return

    await updateData(data => ({
      ...data,
      conversations: data.conversations.map(c => {
        const isStale = staleConversations.some(sc => sc.id === c.id)
        return isStale ? { ...c, isArchived: true } : c
      })
    }))

    setConversations(prev =>
      prev.map(c => {
        const isStale = staleConversations.some(sc => sc.id === c.id)
        return isStale ? { ...c, isArchived: true } : c
      })
    )

    // Clear active if it was stale
    if (activeConversationId && staleConversations.some(c => c.id === activeConversationId)) {
      setActiveConversationId(null)
    }
  }, [conversations, activeConversationId])

  const startNewChat = useCallback(async () => {
    // Archive current active conversation if it has messages
    if (activeConversation && activeConversation.messages.length > 0) {
      await archiveConversation(activeConversation.id)
    }
    setActiveConversationId(null)
  }, [activeConversation, archiveConversation])

  // Sort conversations: active first, then by lastMessageAt
  const sortedConversations = [...conversations].sort((a, b) => {
    // Active (non-archived) first
    if (!a.isArchived && b.isArchived) return -1
    if (a.isArchived && !b.isArchived) return 1
    // Then by most recent
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  })

  const archivedConversations = sortedConversations.filter(c => c.isArchived)
  const recentConversations = sortedConversations.filter(c => !c.isArchived)

  return {
    conversations: sortedConversations,
    archivedConversations,
    recentConversations,
    activeConversation,
    activeConversationId,
    isLoading,
    createConversation,
    archiveConversation,
    unarchiveConversation,
    loadConversation,
    deleteConversation,
    autoArchiveStale,
    startNewChat,
    refresh: loadConversations
  }
}
