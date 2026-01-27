import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './components/shared/ThemeProvider'
import { AppProvider, useAppContext } from './contexts/AppContext'
import { Onboarding } from './components/onboarding'
import { NowPage } from './pages/Now'
import { OrganizePage } from './pages/Organize'
import { ProjectPage } from './pages/Project'
import { ChatPage } from './pages/Chat'
import { ReflectionsPage } from './pages/Reflections'
import { SettingsPage } from './pages/Settings'
import { getData, migrateFromLocalStorage } from './utils/storage'

function AppContent() {
  const { isOnboardingComplete, setIsOnboardingComplete } = useAppContext()

  if (!isOnboardingComplete) {
    return <Onboarding onComplete={() => setIsOnboardingComplete(true)} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/now" replace />} />
        <Route path="/now" element={<NowPage />} />
        <Route path="/organize" element={<OrganizePage />} />
        <Route path="/project/:projectId" element={<ProjectPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/reflections" element={<ReflectionsPage />} />
        <Route path="/reflect" element={<Navigate to="/reflections" replace />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export function App() {
  const [initialOnboardingComplete, setInitialOnboardingComplete] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let didComplete = false

    async function init() {
      try {
        // Migrate from localStorage if needed
        await migrateFromLocalStorage()

        // Check onboarding status
        const data = await getData()
        if (!didComplete) {
          didComplete = true
          setInitialOnboardingComplete(data.onboarding.completed)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Init error:', error)
        if (!didComplete) {
          didComplete = true
          // Default to showing onboarding if storage fails
          setInitialOnboardingComplete(false)
          setIsLoading(false)
        }
      }
    }

    // Add timeout to prevent infinite loading on mobile
    const timeout = setTimeout(() => {
      if (!didComplete) {
        console.warn('Init timeout - defaulting to onboarding')
        didComplete = true
        setInitialOnboardingComplete(false)
        setIsLoading(false)
      }
    }, 5000)

    init()

    return () => clearTimeout(timeout)
  }, [])

  if (isLoading || initialOnboardingComplete === null) {
    return (
      <ThemeProvider>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)'
        }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, var(--orb-gradient-1), var(--orb-gradient-2) 50%, var(--orb-gradient-3))',
            animation: 'orb-breathe 2s ease-in-out infinite'
          }} />
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <AppProvider initialOnboardingComplete={initialOnboardingComplete}>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  )
}
