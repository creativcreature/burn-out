import { useState, useEffect, useCallback } from 'react'
import { getTheme, setTheme as saveTheme } from '../utils/storage'
import type { Theme } from '../data/types'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load theme from storage on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await getTheme()
        setThemeState(savedTheme)
        document.documentElement.setAttribute('data-theme', savedTheme)
      } catch (error) {
        console.error('Failed to load theme:', error)
      } finally {
        setIsLoaded(true)
      }
    }
    loadTheme()
  }, [])

  // Update DOM and storage when theme changes
  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)

    try {
      await saveTheme(newTheme)
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }, [theme, setTheme])

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isLoaded
  }
}
