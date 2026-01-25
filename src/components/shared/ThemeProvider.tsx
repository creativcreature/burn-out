import { createContext, useContext, ReactNode } from 'react'
import { useTheme } from '../../hooks/useTheme'

type ThemeContextType = ReturnType<typeof useTheme>

const ThemeContext = createContext<ThemeContextType | null>(null)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useTheme()

  // Don't render children until theme is loaded to prevent flash
  if (!theme.isLoaded) {
    return null
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider')
  }
  return context
}
