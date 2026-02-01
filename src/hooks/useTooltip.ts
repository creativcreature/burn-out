import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'burnout_tooltips'

interface TooltipState {
  seen: Record<string, boolean>
  lastShown: string
}

function getTooltipState(): TooltipState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // Ignore errors
  }
  return { seen: {}, lastShown: '' }
}

function setTooltipState(state: TooltipState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore errors
  }
}

/**
 * Hook for managing tooltip visibility
 * Shows tooltip once per user, tracks in localStorage
 */
export function useTooltip(id: string, delay = 500) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const state = getTooltipState()
    if (!state.seen[id]) {
      // Show tooltip after delay
      const timer = setTimeout(() => {
        setVisible(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [id, delay])

  const dismiss = useCallback(() => {
    const state = getTooltipState()
    state.seen[id] = true
    state.lastShown = new Date().toISOString()
    setTooltipState(state)
    setVisible(false)
  }, [id])

  return { visible, dismiss }
}

/**
 * Reset all tooltip states (for testing)
 */
export function resetTooltips(): void {
  localStorage.removeItem(STORAGE_KEY)
}
