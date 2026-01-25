import { useState, useEffect, useCallback, useRef } from 'react'

interface UseTimerOptions {
  initialMinutes?: number
  onComplete?: () => void
}

export function useTimer({ initialMinutes = 25, onComplete }: UseTimerOptions = {}) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60)
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            setIsRunning(false)
            onComplete?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused, onComplete])

  const start = useCallback((durationMinutes?: number) => {
    if (durationMinutes) {
      const totalSecs = durationMinutes * 60
      setTotalSeconds(totalSecs)
      setRemainingSeconds(totalSecs)
    }
    setIsRunning(true)
    setIsPaused(false)
  }, [])

  const pause = useCallback(() => {
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    setIsPaused(false)
  }, [])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsRunning(false)
    setIsPaused(false)
  }, [])

  const reset = useCallback((durationMinutes?: number) => {
    stop()
    const totalSecs = (durationMinutes || initialMinutes) * 60
    setTotalSeconds(totalSecs)
    setRemainingSeconds(totalSecs)
  }, [stop, initialMinutes])

  const addMinutes = useCallback((mins: number) => {
    setRemainingSeconds(prev => Math.max(0, prev + mins * 60))
    setTotalSeconds(prev => prev + mins * 60)
  }, [])

  return {
    minutes,
    seconds,
    remainingSeconds,
    totalSeconds,
    progress,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
    addMinutes,
    formatted: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
}
