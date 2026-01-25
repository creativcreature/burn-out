import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './components/shared/ThemeProvider'
import { Onboarding } from './components/onboarding'
import { NowPage } from './pages/Now'
import { OrganizePage } from './pages/Organize'
import { ChatPage } from './pages/Chat'
import { ReflectionsPage } from './pages/Reflections'
import { SettingsPage } from './pages/Settings'
import { getData, migrateFromLocalStorage } from './utils/storage'

export function App() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function init() {
      // Migrate from localStorage if needed
      await migrateFromLocalStorage()

      // Check onboarding status
      const data = await getData()
      setIsOnboardingComplete(data.onboarding.completed)
      setIsLoading(false)
    }
    init()
  }, [])

  if (isLoading) {
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

  if (!isOnboardingComplete) {
    return (
      <ThemeProvider>
        <Onboarding />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/now" replace />} />
          <Route path="/now" element={<NowPage />} />
          <Route path="/organize" element={<OrganizePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/reflections" element={<ReflectionsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
