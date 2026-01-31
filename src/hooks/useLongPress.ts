import { useRef, useCallback } from 'react'

interface UseLongPressOptions {
  onPress: () => void
  onLongPress: () => void
  threshold?: number
}

interface UseLongPressReturn {
  onPointerDown: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onPointerLeave: (e: React.PointerEvent) => void
  onContextMenu: (e: React.MouseEvent) => void
}

export function useLongPress({
  onPress,
  onLongPress,
  threshold = 500
}: UseLongPressOptions): UseLongPressReturn {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLongPressRef = useRef(false)
  const startPosRef = useRef<{ x: number; y: number } | null>(null)

  const start = useCallback((e: React.PointerEvent) => {
    isLongPressRef.current = false
    startPosRef.current = { x: e.clientX, y: e.clientY }

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      onLongPress()
    }, threshold)
  }, [onLongPress, threshold])

  const cancel = useCallback((e: React.PointerEvent, shouldTriggerPress: boolean) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (shouldTriggerPress && !isLongPressRef.current && startPosRef.current) {
      const moved = Math.abs(e.clientX - startPosRef.current.x) > 10 ||
                    Math.abs(e.clientY - startPosRef.current.y) > 10
      if (!moved) {
        onPress()
      }
    }
  }, [onPress])

  return {
    onPointerDown: start,
    onPointerUp: (e) => cancel(e, true),
    onPointerLeave: (e) => cancel(e, false),
    onContextMenu: (e) => e.preventDefault()
  }
}
