import { ReactNode } from 'react'
import { DynamicOrb } from '../shared/DynamicOrb'

interface AppLayoutProps {
  children: ReactNode
  showOrb?: boolean
}

export function AppLayout({ children, showOrb = true }: AppLayoutProps) {
  return (
    <>
      {/* Background layer: Figma bg image + orb */}
      {showOrb && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'var(--bg)',
          pointerEvents: 'none',
        }}>
          {/* Figma background image — subtle, behind everything */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'var(--app-bg-image)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.35,
          }} />
          <DynamicOrb />
        </div>
      )}
      <div className="app-shell page-transition">
        {children}
      </div>
    </>
  )
}
