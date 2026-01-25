import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './components/shared/ThemeProvider'
import { NowPage } from './pages/Now'
import { OrganizePage } from './pages/Organize'
import { ChatPage } from './pages/Chat'
import { ReflectionsPage } from './pages/Reflections'
import { SettingsPage } from './pages/Settings'

export function App() {
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
