import { ReactNode } from 'react'
import { Navigation } from './Navigation'

interface AppLayoutProps {
  children: ReactNode
  showNav?: boolean
  showOrb?: boolean
}

export function AppLayout({ children, showNav = true, showOrb = true }: AppLayoutProps) {
  return (
    <>
      {/* Full-screen Orb Background */}
      {showOrb && (
        <div className="orb-background">
          <div className="orb-main" />
        </div>
      )}

      {/* App Shell */}
      <div className="app-shell">
        {children}
      </div>

      {showNav && <Navigation />}
    </>
  )
}
