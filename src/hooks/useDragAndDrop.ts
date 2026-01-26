import { useState, useRef, useCallback, useEffect } from 'react'

export interface DragItem {
  id: string
  index: number
}

export interface UseDragAndDropOptions<T> {
  items: T[]
  onReorder: (items: T[]) => void
}

export interface DragHandlers {
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onPointerCancel: (e: React.PointerEvent) => void
}

export interface UseDragAndDropReturn {
  draggedId: string | null
  draggedIndex: number | null
  targetIndex: number | null
  isDragging: boolean
  getDragHandlers: (id: string, index: number) => DragHandlers
  getItemStyle: (id: string, index: number) => React.CSSProperties
}

const DRAG_THRESHOLD = 8 // pixels before drag starts
const LONG_PRESS_DELAY = 200 // ms before drag activates

export function useDragAndDrop<T>({
  items,
  onReorder
}: UseDragAndDropOptions<T>): UseDragAndDropReturn {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [targetIndex, setTargetIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const containerRef = useRef<HTMLElement | null>(null)
  const itemRectsRef = useRef<Map<string, DOMRect>>(new Map())
  const startPosRef = useRef<{ x: number; y: number } | null>(null)
  const currentPosRef = useRef<{ x: number; y: number } | null>(null)
  const dragTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingDragRef = useRef<{ id: string; index: number } | null>(null)

  // Calculate which index the dragged item should move to
  const calculateTargetIndex = useCallback((clientY: number): number => {
    if (draggedIndex === null) return 0

    const rects = Array.from(itemRectsRef.current.entries())
    if (rects.length === 0) return draggedIndex

    for (let i = 0; i < rects.length; i++) {
      const [, rect] = rects[i]
      const midY = rect.top + rect.height / 2

      if (clientY < midY) {
        return i
      }
    }

    return rects.length - 1
  }, [draggedIndex])

  // Update item rects when drag starts
  const updateItemRects = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const itemElements = container.querySelectorAll('[data-drag-id]')
    itemRectsRef.current.clear()

    itemElements.forEach((el) => {
      const id = el.getAttribute('data-drag-id')
      if (id) {
        itemRectsRef.current.set(id, el.getBoundingClientRect())
      }
    })
  }, [])

  // Start drag
  const startDrag = useCallback((id: string, index: number) => {
    setDraggedId(id)
    setDraggedIndex(index)
    setTargetIndex(index)
    setIsDragging(true)
    updateItemRects()

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }, [updateItemRects])

  // End drag
  const endDrag = useCallback(() => {
    if (draggedIndex !== null && targetIndex !== null && draggedIndex !== targetIndex) {
      const newItems = [...items]
      const [removed] = newItems.splice(draggedIndex, 1)
      newItems.splice(targetIndex, 0, removed)
      onReorder(newItems)
    }

    setDraggedId(null)
    setDraggedIndex(null)
    setTargetIndex(null)
    setIsDragging(false)
    startPosRef.current = null
    currentPosRef.current = null
    pendingDragRef.current = null

    if (dragTimerRef.current) {
      clearTimeout(dragTimerRef.current)
      dragTimerRef.current = null
    }
  }, [items, draggedIndex, targetIndex, onReorder])

  // Cancel pending drag
  const cancelPendingDrag = useCallback(() => {
    pendingDragRef.current = null
    if (dragTimerRef.current) {
      clearTimeout(dragTimerRef.current)
      dragTimerRef.current = null
    }
  }, [])

  // Pointer down handler
  const handlePointerDown = useCallback((
    e: React.PointerEvent,
    id: string,
    index: number
  ) => {
    // Only handle primary button (left click / touch)
    if (e.button !== 0) return

    // Find the container (parent with data-drag-container)
    let el: HTMLElement | null = e.currentTarget as HTMLElement
    while (el && !el.hasAttribute('data-drag-container')) {
      el = el.parentElement
    }
    containerRef.current = el

    startPosRef.current = { x: e.clientX, y: e.clientY }
    currentPosRef.current = { x: e.clientX, y: e.clientY }
    pendingDragRef.current = { id, index }

    // Start long press timer for touch
    dragTimerRef.current = setTimeout(() => {
      if (pendingDragRef.current) {
        startDrag(pendingDragRef.current.id, pendingDragRef.current.index)
      }
    }, LONG_PRESS_DELAY)

    // Capture pointer for tracking
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [startDrag])

  // Pointer move handler
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    currentPosRef.current = { x: e.clientX, y: e.clientY }

    // Check if we should start drag based on movement
    if (pendingDragRef.current && startPosRef.current && !isDragging) {
      const deltaX = Math.abs(e.clientX - startPosRef.current.x)
      const deltaY = Math.abs(e.clientY - startPosRef.current.y)

      if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
        // Cancel long press timer and start drag immediately if moved enough
        cancelPendingDrag()
        startDrag(pendingDragRef.current.id, pendingDragRef.current.index)
        pendingDragRef.current = null
      }
    }

    // Update target index while dragging
    if (isDragging) {
      const newTargetIndex = calculateTargetIndex(e.clientY)
      setTargetIndex(newTargetIndex)
    }
  }, [isDragging, calculateTargetIndex, cancelPendingDrag, startDrag])

  // Pointer up handler
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    cancelPendingDrag()

    if (isDragging) {
      endDrag()
    }
  }, [isDragging, endDrag, cancelPendingDrag])

  // Pointer cancel handler
  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    cancelPendingDrag()

    if (isDragging) {
      // Reset without applying changes
      setDraggedId(null)
      setDraggedIndex(null)
      setTargetIndex(null)
      setIsDragging(false)
    }
  }, [isDragging, cancelPendingDrag])

  // Get handlers for a specific item
  const getDragHandlers = useCallback((id: string, index: number): DragHandlers => ({
    onPointerDown: (e) => handlePointerDown(e, id, index),
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel
  }), [handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel])

  // Get styles for a specific item
  const getItemStyle = useCallback((id: string, index: number): React.CSSProperties => {
    const isDraggedItem = draggedId === id

    if (!isDragging) {
      return {
        transition: 'transform 0.2s ease, opacity 0.2s ease',
        transform: 'translateY(0)',
        opacity: 1,
        touchAction: 'none',
        userSelect: 'none'
      }
    }

    if (isDraggedItem) {
      return {
        position: 'relative',
        zIndex: 1000,
        opacity: 0.9,
        transform: 'scale(1.02)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        transition: 'box-shadow 0.2s ease, transform 0.1s ease',
        touchAction: 'none',
        userSelect: 'none'
      }
    }

    // Calculate offset for other items
    if (draggedIndex !== null && targetIndex !== null) {
      let offset = 0

      if (index >= targetIndex && index < draggedIndex) {
        // Items that need to move down
        offset = 1
      } else if (index <= targetIndex && index > draggedIndex) {
        // Items that need to move up
        offset = -1
      }

      return {
        transition: 'transform 0.2s ease',
        transform: `translateY(${offset * 60}px)`,
        touchAction: 'none',
        userSelect: 'none'
      }
    }

    return {
      touchAction: 'none',
      userSelect: 'none'
    }
  }, [isDragging, draggedId, draggedIndex, targetIndex])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dragTimerRef.current) {
        clearTimeout(dragTimerRef.current)
      }
    }
  }, [])

  return {
    draggedId,
    draggedIndex,
    targetIndex,
    isDragging,
    getDragHandlers,
    getItemStyle
  }
}
