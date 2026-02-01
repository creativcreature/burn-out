import { useState, useRef, useCallback, TouchEvent } from 'react'

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
}

interface UseSwipeReturn {
  swipeX: number // Current swipe offset (-1 to 1)
  isSwiping: boolean
  handlers: SwipeHandlers
  reset: () => void
}

/**
 * Reusable swipe gesture hook
 * Returns normalized swipeX (-1 to 1) and touch handlers
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
  
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const lastTouchX = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)
  const isHorizontalSwipe = useRef(false)

  const reset = useCallback(() => {
    setSwipeX(0)
    setIsSwiping(false)
    isHorizontalSwipe.current = false
    velocity.current = 0
  }, [])

  const onTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    lastTouchX.current = touch.clientX
    lastTime.current = Date.now()
    isHorizontalSwipe.current = false
    setIsSwiping(true)
  }, [])

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwiping) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current
    const now = Date.now()
    const dt = now - lastTime.current

    // Calculate velocity
    if (dt > 0) {
      velocity.current = (touch.clientX - lastTouchX.current) / dt
    }
    lastTouchX.current = touch.clientX
    lastTime.current = now

    // Determine if horizontal swipe (only on first significant movement)
    if (!isHorizontalSwipe.current && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY)
    }

    // Only update swipeX if it's a horizontal swipe
    if (isHorizontalSwipe.current) {
      e.preventDefault() // Prevent scroll
      // Normalize to -1 to 1 (100px = full swipe)
      const normalized = Math.max(-1, Math.min(1, deltaX / 100))
      setSwipeX(normalized)
    }
  }, [isSwiping])

  const onTouchEnd = useCallback(() => {
    if (!isSwiping) return

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

    // Reset after animation
    setTimeout(reset, 200)
  }, [isSwiping, swipeX, threshold, velocityThreshold, onSwipeLeft, onSwipeRight, reset])

  return {
    swipeX,
    isSwiping,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd
    },
    reset
  }
}
