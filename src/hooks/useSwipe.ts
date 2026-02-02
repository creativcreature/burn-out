import { useState, useRef, useCallback, TouchEvent, MouseEvent } from 'react'

interface SwipeConfig {
  threshold?: number // How far to swipe before triggering action (0-1)
  velocityThreshold?: number // Velocity to trigger action
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void
  onTouchMove: (e: TouchEvent) => void
  onTouchEnd: (e: TouchEvent) => void
  onMouseDown: (e: MouseEvent) => void
  onMouseMove: (e: MouseEvent) => void
  onMouseUp: (e: MouseEvent) => void
  onMouseLeave: (e: MouseEvent) => void
}

interface UseSwipeReturn {
  swipeX: number // Current swipe offset (-1 to 1)
  isSwiping: boolean
  handlers: SwipeHandlers
  reset: () => void
}

/**
 * Reusable swipe gesture hook with mouse + touch support
 * Returns normalized swipeX (-1 to 1) and handlers
 */
export function useSwipe(config: SwipeConfig = {}): UseSwipeReturn {
  const {
    threshold = 0.3,
    velocityThreshold = 0.5,
    onSwipeLeft,
    onSwipeRight
  } = config

  const [swipeX, setSwipeX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  const startX = useRef(0)
  const startY = useRef(0)
  const lastX = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)
  const isHorizontal = useRef<boolean | null>(null)
  const isActive = useRef(false)

  const reset = useCallback(() => {
    setSwipeX(0)
    setIsSwiping(false)
    isHorizontal.current = null
    velocity.current = 0
    isActive.current = false
  }, [])

  const handleStart = useCallback((clientX: number, clientY: number) => {
    startX.current = clientX
    startY.current = clientY
    lastX.current = clientX
    lastTime.current = Date.now()
    isHorizontal.current = null
    isActive.current = true
    setIsSwiping(true)
  }, [])

  const handleMove = useCallback((clientX: number, clientY: number, preventDefault?: () => void) => {
    if (!isActive.current) return

    const deltaX = clientX - startX.current
    const deltaY = clientY - startY.current
    const now = Date.now()
    const dt = now - lastTime.current

    // Calculate velocity
    if (dt > 0) {
      velocity.current = (clientX - lastX.current) / dt
    }
    lastX.current = clientX
    lastTime.current = now

    // Determine direction on first significant movement
    if (isHorizontal.current === null && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      isHorizontal.current = Math.abs(deltaX) > Math.abs(deltaY)
    }

    // Only handle horizontal swipes
    if (isHorizontal.current) {
      preventDefault?.()
      const normalized = Math.max(-1, Math.min(1, deltaX / 100))
      setSwipeX(normalized)
    }
  }, [])

  const handleEnd = useCallback(() => {
    if (!isActive.current) return
    isActive.current = false

    const absSwipe = Math.abs(swipeX)
    const absVelocity = Math.abs(velocity.current)

    // Trigger action if threshold reached
    if (absSwipe > threshold || absVelocity > velocityThreshold) {
      if (swipeX > 0 || velocity.current > velocityThreshold) {
        onSwipeRight?.()
      } else if (swipeX < 0 || velocity.current < -velocityThreshold) {
        onSwipeLeft?.()
      }
    }

    // Reset after brief delay
    setTimeout(reset, 150)
  }, [swipeX, threshold, velocityThreshold, onSwipeLeft, onSwipeRight, reset])

  const handlers: SwipeHandlers = {
    // Touch events
    onTouchStart: useCallback((e: TouchEvent) => {
      handleStart(e.touches[0].clientX, e.touches[0].clientY)
    }, [handleStart]),

    onTouchMove: useCallback((e: TouchEvent) => {
      handleMove(e.touches[0].clientX, e.touches[0].clientY, () => e.preventDefault())
    }, [handleMove]),

    onTouchEnd: useCallback(() => {
      handleEnd()
    }, [handleEnd]),

    // Mouse events (for desktop)
    onMouseDown: useCallback((e: MouseEvent) => {
      e.preventDefault()
      handleStart(e.clientX, e.clientY)
    }, [handleStart]),

    onMouseMove: useCallback((e: MouseEvent) => {
      if (isActive.current) {
        handleMove(e.clientX, e.clientY)
      }
    }, [handleMove]),

    onMouseUp: useCallback(() => {
      handleEnd()
    }, [handleEnd]),

    onMouseLeave: useCallback(() => {
      if (isActive.current) {
        handleEnd()
      }
    }, [handleEnd])
  }

  return {
    swipeX,
    isSwiping,
    handlers,
    reset
  }
}
