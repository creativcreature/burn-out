import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTheme } from './useTheme'

// Mock storage functions
const mockGetTheme = vi.fn()
const mockSetTheme = vi.fn()

vi.mock('../utils/storage', () => ({
  getTheme: () => mockGetTheme(),
  setTheme: (theme: string) => mockSetTheme(theme)
}))

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTheme.mockResolvedValue('light')
    mockSetTheme.mockResolvedValue(undefined)
    document.documentElement.removeAttribute('data-theme')
  })

  describe('initialization', () => {
    it('loads theme from storage on mount', async () => {
      mockGetTheme.mockResolvedValue('dark')

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true)
      })

      expect(result.current.theme).toBe('dark')
      expect(mockGetTheme).toHaveBeenCalledTimes(1)
    })

    it('sets data-theme attribute on document', async () => {
      mockGetTheme.mockResolvedValue('dark')

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true)
      })

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('defaults to light theme if storage is empty', async () => {
      mockGetTheme.mockResolvedValue('light')

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true)
      })

      expect(result.current.theme).toBe('light')
    })

    it('sets isLoaded to false initially', () => {
      const { result } = renderHook(() => useTheme())

      // Initially isLoaded should be false (before async load completes)
      expect(result.current.isLoaded).toBe(false)
    })
  })

  describe('toggleTheme', () => {
    it('toggles from light to dark', async () => {
      mockGetTheme.mockResolvedValue('light')

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true)
      })

      await act(async () => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe('dark')
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('toggles from dark to light', async () => {
      mockGetTheme.mockResolvedValue('dark')

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true)
      })

      await act(async () => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe('light')
      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })

    it('updates DOM data-theme attribute when toggling', async () => {
      mockGetTheme.mockResolvedValue('light')

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true)
      })

      await act(async () => {
        result.current.toggleTheme()
      })

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('persists theme change to storage', async () => {
      mockGetTheme.mockResolvedValue('light')

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true)
      })

      await act(async () => {
        result.current.toggleTheme()
      })

      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })
  })

  describe('setTheme', () => {
    it('sets theme directly to dark', async () => {
      mockGetTheme.mockResolvedValue('light')

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true)
      })

      await act(async () => {
        result.current.setTheme('dark')
      })

      expect(result.current.theme).toBe('dark')
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('sets theme directly to light', async () => {
      mockGetTheme.mockResolvedValue('dark')

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true)
      })

      await act(async () => {
        result.current.setTheme('light')
      })

      expect(result.current.theme).toBe('light')
      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })
  })

  describe('derived state', () => {
    it('returns isDark as true when theme is dark', async () => {
      mockGetTheme.mockResolvedValue('dark')

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true)
      })

      expect(result.current.isDark).toBe(true)
      expect(result.current.isLight).toBe(false)
    })

    it('returns isLight as true when theme is light', async () => {
      mockGetTheme.mockResolvedValue('light')

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true)
      })

      expect(result.current.isDark).toBe(false)
      expect(result.current.isLight).toBe(true)
    })
  })

  describe('error handling', () => {
    it('handles storage read errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockGetTheme.mockRejectedValue(new Error('Storage error'))

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true)
      })

      // Should still mark as loaded even on error
      expect(result.current.isLoaded).toBe(true)
      consoleSpy.mockRestore()
    })

    it('handles storage write errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockGetTheme.mockResolvedValue('light')
      mockSetTheme.mockRejectedValue(new Error('Storage error'))

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true)
      })

      // Should not throw when toggling fails to save
      await act(async () => {
        result.current.toggleTheme()
      })

      // State should still update locally
      expect(result.current.theme).toBe('dark')
      consoleSpy.mockRestore()
    })
  })
})
