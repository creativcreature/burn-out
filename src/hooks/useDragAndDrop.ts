import { useState, useRef, useCallback, useEffect } from 'react'

export interface UseDragAndDropOptions<T> {
  items: T[]
  onReorder: (items: T[]) => void
  itemHeight?: number
}

export interface DragHandlers {
  onPointerDown: (e: React.PointerEvent) => void
}

export interface UseDragAndDropReturn {
  draggedId: string | null
  draggedIndex: number | null
  targetIndex: number | null
  isDragging: boolean
  dragOffset: number
  getDragHandlers: (id: string, index: number) => DragHandlers
  getItemStyle: (id: string, index: number) => React.CSSProperties
}

const DRAG_THRESHOLD = 3 // Very low threshold for instant feel

export function useDragAndDrop<T>({
  items,
  onReorder,
  itemHeight = 72
}: UseDragAndDropOptions<T>): UseDragAndDropReturn {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [targetIndex, setTargetIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  const startYRef = useRef<number>(0)
  const pendingRef = useRef<{ id: string; index: number } | null>(null)

  // Calculate target index based on current drag position
  const calculateTargetIndex = useCallback((currentY: number, startIndex: number): number => {
    const deltaY = currentY - startYRef.current
    const indexDelta = Math.round(deltaY / itemHeight)
    const newIndex = startIndex + indexDelta
    return Math.max(0, Math.min(items.length - 1, newIndex))
  }, [items.length, itemHeight])

  // Start drag
  const startDrag = useCallback((id: string, index: number, clientY: number) => {
    setDraggedId(id)
    setDraggedIndex(index)
    setTargetIndex(index)
    setIsDragging(true)
    setDragOffset(0)
    startYRef.current = clientY

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }, [])

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
    setDragOffset(0)
    pendingRef.current = null
  }, [items, draggedIndex, targetIndex, onReorder])

  // Global pointer move handler
  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: PointerEvent) => {
      const deltaY = e.clientY - startYRef.current
      setDragOffset(deltaY)

      if (draggedIndex !== null) {
        const newTarget = calculateTargetIndex(e.clientY, draggedIndex)
        setTargetIndex(newTarget)
      }
    }

    const handleUp = () => {
      endDrag()
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleUp)
    }
  }, [isDragging, draggedIndex, calculateTargetIndex, endDrag])

  // Pointer down handler
  const handlePointerDown = useCallback((
    e: React.PointerEvent,
    id: string,
    index: number
  ) => {
    if (e.button !== 0) return
    e.preventDefault()

    startYRef.current = e.clientY
    pendingRef.current = { id, index }

    // Start drag immediately on any movement
    const handleFirstMove = (moveEvent: PointerEvent) => {
      const deltaY = Math.abs(moveEvent.clientY - startYRef.current)
      const deltaX = Math.abs(moveEvent.clientX - e.clientX)

      if (deltaY > DRAG_THRESHOLD || deltaX > DRAG_THRESHOLD) {
        if (pendingRef.current && deltaY >= deltaX) {
          startDrag(pendingRef.current.id, pendingRef.current.index, startYRef.current)
        }
        pendingRef.current = null
        window.removeEventListener('pointermove', handleFirstMove)
        window.removeEventListener('pointerup', handleFirstUp)
      }
    }

    const handleFirstUp = () => {
      pendingRef.current = null
      window.removeEventListener('pointermove', handleFirstMove)
      window.removeEventListener('pointerup', handleFirstUp)
    }

    window.addEventListener('pointermove', handleFirstMove)
    window.addEventListener('pointerup', handleFirstUp)
  }, [startDrag])

  // Get handlers for a specific item
  const getDragHandlers = useCallback((id: string, index: number): DragHandlers => ({
    onPointerDown: (e) => handlePointerDown(e, id, index)
  }), [handlePointerDown])

  // Get styles for a specific item
  const getItemStyle = useCallback((id: string, index: number): React.CSSProperties => {
    const isDraggedItem = draggedId === id

    if (!isDragging) {
      return {
        transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
        transform: 'translateY(0) scale(1)',
        touchAction: 'pan-x',
        userSelect: 'none',
        cursor: 'grab'
      }
    }

    if (isDraggedItem) {
      return {
        position: 'relative',
        zIndex: 1000,
        transform: `translateY(${dragOffset}px) scale(1.03)`,
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2)',
        transition: 'box-shadow 0.15s ease, scale 0.15s ease',
        touchAction: 'none',
        userSelect: 'none',
        cursor: 'grabbing',
        willChange: 'transform'
      }
    }

    // Calculate offset for other items
    if (draggedIndex !== null && targetIndex !== null) {
      let offset = 0

      if (draggedIndex < targetIndex) {
        if (index > draggedIndex && index <= targetIndex) {
          offset = -itemHeight
        }
      } else if (draggedIndex > targetIndex) {
        if (index >= targetIndex && index < draggedIndex) {
          offset = itemHeight
        }
      }

      return {
        transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
        transform: `translateY(${offset}px)`,
        touchAction: 'pan-x',
        userSelect: 'none',
        cursor: 'grab'
      }
    }

    return {
      touchAction: 'pan-x',
      userSelect: 'none',
      cursor: 'grab'
    }
  }, [isDragging, draggedId, draggedIndex, targetIndex, dragOffset, itemHeight])

  return {
    draggedId,
    draggedIndex,
    targetIndex,
    isDragging,
    dragOffset,
    getDragHandlers,
    getItemStyle
  }
}
