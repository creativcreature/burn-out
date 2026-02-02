import { useState, useRef, useCallback, useEffect } from 'react'

interface UseBottomSheetReturn {
  isOpen: boolean
  progress: number // 0 = closed, 1 = open
  isDragging: boolean
  open: () => void
  close: () => void
  toggle: () => void
  // For the pull-up trigger area (swipe up to open)
  pullUpProps: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchMove: (e: React.TouchEvent) => void
    onTouchEnd: () => void
    onMouseDown: (e: React.MouseEvent) => void
  }
  // For the sheet's drag handle (swipe down to close)
  handleProps: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchMove: (e: React.TouchEvent) => void
    onTouchEnd: () => void
    onMouseDown: (e: React.MouseEvent) => void
  }
}

/**
 * Hook for managing a bottom sheet with natural swipe gestures
 * - Swipe up from trigger area to open
 * - Swipe down on handle to close
 * - Works on both touch and mouse devices
 */
export function useBottomSheet(): UseBottomSheetReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const progressRef = useRef(0)
  const startY = useRef(0)
  const lastY = useRef(0)
  const velocity = useRef(0)
  const isDraggingRef = useRef(false)
  const animationFrame = useRef<number | null>(null)

  // Keep ref in sync
  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  // Global mouse move/up listeners for desktop drag
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return

      const deltaY = lastY.current - e.clientY // positive = moving up
      velocity.current = deltaY
      lastY.current = e.clientY

      const screenHeight = window.innerHeight * 0.5
      const progressDelta = deltaY / screenHeight
      const newProgress = Math.max(0, Math.min(1, progressRef.current + progressDelta))

      progressRef.current = newProgress
      setProgress(newProgress)
    }

    const handleGlobalMouseUp = () => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      setIsDragging(false)
      snapToNearest()
    }

    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [])

  const animateTo = useCallback((target: number) => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current)
    }

    const startTime = performance.now()
    const startValue = progressRef.current
    const distance = target - startValue
    const duration = 250

    const animate = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic

      const newVal = startValue + distance * eased
      progressRef.current = newVal
      setProgress(newVal)

      if (t < 1) {
        animationFrame.current = requestAnimationFrame(animate)
      } else {
        progressRef.current = target
        setProgress(target)
        setIsOpen(target > 0.5)
      }
    }

    animationFrame.current = requestAnimationFrame(animate)
  }, [])

  const snapToNearest = useCallback(() => {
    const v = velocity.current
    const p = progressRef.current

    // Velocity-based: fast swipe wins
    if (v > 2) {
      animateTo(1)
    } else if (v < -2) {
      animateTo(0)
    } else {
      // Position-based: snap to nearest
      animateTo(p > 0.3 ? 1 : 0)
    }
  }, [animateTo])

  const open = useCallback(() => animateTo(1), [animateTo])
  const close = useCallback(() => animateTo(0), [animateTo])
  const toggle = useCallback(() => animateTo(progressRef.current > 0.5 ? 0 : 1), [animateTo])

  // Handle touch/mouse start
  const handleStart = useCallback((clientY: number) => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current)
      animationFrame.current = null
    }
    startY.current = clientY
    lastY.current = clientY
    velocity.current = 0
    isDraggingRef.current = true
    setIsDragging(true)
  }, [])

  // Handle touch move
  const handleMove = useCallback((clientY: number) => {
    if (!isDraggingRef.current) return

    const deltaY = lastY.current - clientY // positive = moving up
    velocity.current = deltaY
    lastY.current = clientY

    // Calculate progress based on screen height
    const screenHeight = window.innerHeight * 0.5 // 50% of screen = full swipe
    const progressDelta = deltaY / screenHeight
    const newProgress = Math.max(0, Math.min(1, progressRef.current + progressDelta))

    progressRef.current = newProgress
    setProgress(newProgress)
  }, [])

  // Handle touch end
  const handleEnd = useCallback(() => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setIsDragging(false)
    snapToNearest()
  }, [snapToNearest])

  // Touch handlers for pull-up area (swipe up to open from closed state)
  const pullUpProps = {
    onTouchStart: (e: React.TouchEvent) => {
      handleStart(e.touches[0].clientY)
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault()
        handleMove(e.touches[0].clientY)
      }
    },
    onTouchEnd: handleEnd,
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault()
      handleStart(e.clientY)
    }
  }

  // Touch handlers for drag handle (swipe down to close when open)
  const handleProps = {
    onTouchStart: (e: React.TouchEvent) => {
      e.stopPropagation()
      handleStart(e.touches[0].clientY)
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault()
        e.stopPropagation()
        handleMove(e.touches[0].clientY)
      }
    },
    onTouchEnd: () => {
      handleEnd()
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      handleStart(e.clientY)
    }
  }

  return {
    isOpen,
    progress,
    isDragging,
    open,
    close,
    toggle,
    pullUpProps,
    handleProps
  }
}
