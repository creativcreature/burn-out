import { ReactNode } from 'react'
import { Navigation } from './Navigation'
import { GlobalFAB } from '../shared/GlobalFAB'

interface AppLayoutProps {
  children: ReactNode
  showNav?: boolean
  showOrb?: boolean
  showFAB?: boolean
}

export function AppLayout({ children, showNav = true, showOrb = true, showFAB = true }: AppLayoutProps) {
  return (
    <>
      {/* Full-screen Orb Background */}
      {showOrb && (
        <div className="orb-background">
          <div className="orb-main" />
        </div>
      )}

      {/* App Shell with page transition */}
      <div className="app-shell page-transition">
        {children}
      </div>

      {showNav && <Navigation />}
      {showFAB && <GlobalFAB />}
    </>
  )
}
