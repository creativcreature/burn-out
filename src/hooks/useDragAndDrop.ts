import { useState, useRef, useCallback, useEffect, TouchEvent, MouseEvent } from 'react'

interface UseDragAndDropConfig<T> {
  items: T[]
  onReorder: (fromIndex: number, toIndex: number, fromGroup?: string, toGroup?: string) => void
}

interface DragState {
  isDragging: boolean
  draggedId: string | null
  draggedIndex: number | null
  dropTargetIndex: number | null
  draggedGroup: string | undefined
  dropTargetGroup: string | undefined
  offsetY: number
}

interface UseDragAndDropReturn {
  dragState: DragState
  getDragHandleProps: (id: string, index: number, groupId?: string) => {
    onTouchStart: (e: TouchEvent) => void
    onTouchMove: (e: TouchEvent) => void
    onTouchEnd: (e: TouchEvent) => void
    onMouseDown: (e: MouseEvent) => void
    style: React.CSSProperties
  }
  getDropTargetProps: (index: number, groupId?: string) => {
    onTouchMove: (e: TouchEvent) => void
    onMouseMove: (e: MouseEvent) => void
    style: React.CSSProperties
  }
}

/**
 * Hook for drag-to-reorder functionality
 * Works with touch (long press to drag) and mouse
 */
export function useDragAndDrop<T>({
  items,
  onReorder
}: UseDragAndDropConfig<T>): UseDragAndDropReturn {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedId: null,
    draggedIndex: null,
    dropTargetIndex: null,
    draggedGroup: undefined,
    dropTargetGroup: undefined,
    offsetY: 0
  })

  // Use refs for values that need to be accessed in callbacks without stale closures
  const dragStateRef = useRef(dragState)
  const itemsRef = useRef(items)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const startY = useRef(0)
  const isMouseDown = useRef(false)

  // Keep refs in sync
  useEffect(() => {
    dragStateRef.current = dragState
  }, [dragState])

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const startDrag = useCallback((id: string, index: number, clientY: number, groupId?: string) => {
    startY.current = clientY
    setDragState({
      isDragging: true,
      draggedId: id,
      draggedIndex: index,
      dropTargetIndex: index,
      draggedGroup: groupId,
      dropTargetGroup: groupId,
      offsetY: 0
    })

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(20)
  }, [])

  const updateDrag = useCallback((clientY: number) => {
    const state = dragStateRef.current
    if (!state.isDragging || state.draggedIndex === null) return

    const offsetY = clientY - startY.current

    // Calculate drop target based on position
    const itemHeight = 60 // Approximate item height
    const moveSteps = Math.round(offsetY / itemHeight)
    const newDropIndex = Math.max(0, Math.min(itemsRef.current.length - 1, state.draggedIndex + moveSteps))

    setDragState(prev => ({
      ...prev,
      offsetY,
      dropTargetIndex: newDropIndex
    }))
  }, [])

  const endDrag = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    const state = dragStateRef.current
    if (state.isDragging && state.draggedIndex !== null && state.dropTargetIndex !== null) {
      if (state.draggedIndex !== state.dropTargetIndex) {
        onReorder(
          state.draggedIndex,
          state.dropTargetIndex,
          state.draggedGroup,
          state.dropTargetGroup
        )
      }
    }

    setDragState({
      isDragging: false,
      draggedId: null,
      draggedIndex: null,
      dropTargetIndex: null,
      draggedGroup: undefined,
      dropTargetGroup: undefined,
      offsetY: 0
    })
  }, [onReorder])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  const getDragHandleProps = useCallback((id: string, index: number, groupId?: string) => {
    return {
      onTouchStart: (e: TouchEvent) => {
        e.stopPropagation()
        const clientY = e.touches[0].clientY
        startY.current = clientY

        // Long press to start drag (300ms)
        longPressTimer.current = setTimeout(() => {
          startDrag(id, index, clientY, groupId)
        }, 300)
      },
      onTouchMove: (e: TouchEvent) => {
        const state = dragStateRef.current

        // If moved before long press, cancel drag initiation
        if (longPressTimer.current && !state.isDragging) {
          const moveDistance = Math.abs(e.touches[0].clientY - startY.current)
          if (moveDistance > 10) {
            clearTimeout(longPressTimer.current)
            longPressTimer.current = null
            return
          }
        }

        if (state.isDragging && state.draggedId === id) {
          e.preventDefault()
          e.stopPropagation()
          updateDrag(e.touches[0].clientY)
        }
      },
      onTouchEnd: (e: TouchEvent) => {
        e.stopPropagation()
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current)
          longPressTimer.current = null
        }
        const state = dragStateRef.current
        if (state.isDragging && state.draggedId === id) {
          endDrag()
        }
      },
      onMouseDown: (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        isMouseDown.current = true
        const clientY = e.clientY
        startY.current = clientY

        // Immediate drag on mouse (no long press needed)
        startDrag(id, index, clientY, groupId)

        // Add global mouse listeners
        const handleMouseMove = (e: globalThis.MouseEvent) => {
          if (isMouseDown.current) {
            updateDrag(e.clientY)
          }
        }
        const handleMouseUp = () => {
          isMouseDown.current = false
          endDrag()
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      },
      style: {
        cursor: dragState.isDragging && dragState.draggedId === id ? 'grabbing' : 'grab',
        touchAction: 'none' as const,
        ...(dragState.draggedId === id ? {
          opacity: 0.9,
          transform: `translateY(${dragState.offsetY}px) scale(1.02)`,
          zIndex: 100,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          transition: 'none',
          background: 'var(--bg-card)'
        } : {
          transition: 'transform 0.2s ease'
        })
      } as React.CSSProperties
    }
  }, [dragState.isDragging, dragState.draggedId, dragState.offsetY, startDrag, updateDrag, endDrag])

  const getDropTargetProps = useCallback((index: number, _groupId?: string) => {
    const isAboveDropTarget = dragState.isDragging &&
      dragState.dropTargetIndex !== null &&
      dragState.draggedIndex !== null &&
      index === dragState.dropTargetIndex &&
      index !== dragState.draggedIndex

    const isBelowDraggedItem = dragState.isDragging &&
      dragState.draggedIndex !== null &&
      dragState.dropTargetIndex !== null &&
      dragState.dropTargetIndex > dragState.draggedIndex &&
      index > dragState.draggedIndex &&
      index <= dragState.dropTargetIndex

    const isAboveDraggedItem = dragState.isDragging &&
      dragState.draggedIndex !== null &&
      dragState.dropTargetIndex !== null &&
      dragState.dropTargetIndex < dragState.draggedIndex &&
      index < dragState.draggedIndex &&
      index >= dragState.dropTargetIndex

    return {
      onTouchMove: (e: TouchEvent) => {
        const state = dragStateRef.current
        if (state.isDragging) {
          e.preventDefault()
          updateDrag(e.touches[0].clientY)
        }
      },
      onMouseMove: (e: MouseEvent) => {
        if (isMouseDown.current) {
          updateDrag(e.clientY)
        }
      },
      style: {
        transition: dragState.isDragging ? 'transform 0.15s ease' : 'none',
        ...(isBelowDraggedItem ? {
          transform: 'translateY(-60px)'
        } : {}),
        ...(isAboveDraggedItem ? {
          transform: 'translateY(60px)'
        } : {}),
        ...(isAboveDropTarget ? {
          borderTop: '3px solid var(--orb-orange)'
        } : {})
      } as React.CSSProperties
    }
  }, [dragState, updateDrag])

  return {
    dragState,
    getDragHandleProps,
    getDropTargetProps
  }
}
