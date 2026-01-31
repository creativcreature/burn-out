import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { getData } from '../utils/storage'

interface AppContextType {
  isOnboardingComplete: boolean
  setIsOnboardingComplete: (value: boolean) => void
  refreshAppState: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

interface AppProviderProps {
  children: ReactNode
  initialOnboardingComplete: boolean
}

export function AppProvider({ children, initialOnboardingComplete }: AppProviderProps) {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(initialOnboardingComplete)

  const refreshAppState = useCallback(async () => {
    const data = await getData()
    setIsOnboardingComplete(data.onboarding.completed)
  }, [])

  return (
    <AppContext.Provider value={{ isOnboardingComplete, setIsOnboardingComplete, refreshAppState }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
