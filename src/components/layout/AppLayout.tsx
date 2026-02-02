import { ReactNode } from 'react'
import { Navigation } from './Navigation'
import { GlobalFAB } from '../shared/GlobalFAB'
import { DynamicOrb } from '../shared/DynamicOrb'

interface AppLayoutProps {
  children: ReactNode
  showNav?: boolean
  showOrb?: boolean
  showFAB?: boolean
}

export function AppLayout({ children, showNav = true, showOrb = true, showFAB = true }: AppLayoutProps) {
  return (
    <>
      {/* Full-screen Dynamic Orb Background - changes with time of day */}
      {showOrb && <DynamicOrb />}

      {/* App Shell with page transition */}
      <div className="app-shell page-transition">
        {children}
      </div>

      {showNav && <Navigation />}
      {showFAB && <GlobalFAB />}
    </>
  )
}
