import { ReactNode, CSSProperties } from 'react'
import { Navigation } from './Navigation'

interface AppLayoutProps {
  children: ReactNode
  showNav?: boolean
  fullHeight?: boolean
}

export function AppLayout({ children, showNav = true, fullHeight = true }: AppLayoutProps) {
  const layoutStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: fullHeight ? '100vh' : 'auto',
    paddingBottom: showNav ? 'var(--nav-height)' : 0,
    background: 'var(--bg-primary)'
  }

  return (
    <div style={layoutStyle}>
      {children}
      {showNav && <Navigation />}
    </div>
  )
}
