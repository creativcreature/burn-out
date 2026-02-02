/**
 * Page Template
 *
 * Usage:
 * 1. Copy this file to src/pages/[PageName].tsx
 * 2. Replace PAGE_NAME with your page name
 * 3. Import and use shared components
 * 4. Use the theme context
 */

import { useState, useEffect } from 'react'
import { AppLayout, Header } from '../components/layout'
import { Card, Button } from '../components/shared'
import { useThemeContext } from '../components/shared/ThemeProvider'
import styles from './PAGE_NAME.module.css'

export function PAGE_NAMEPage() {
  const { theme, toggleTheme } = useThemeContext()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load page data
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <AppLayout>
        <div className={styles.loading}>Loading...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Header title="PAGE_NAME" />

      <main className={styles.content}>
        <Card>
          <h2>PAGE_NAME Content</h2>
          <p>Add your page content here.</p>
        </Card>

        <Button variant="secondary" onClick={toggleTheme}>
          Toggle Theme
        </Button>
      </main>
    </AppLayout>
  )
}

/*
 * Corresponding CSS Module: PAGE_NAME.module.css
 *
 * .content {
 *   padding: var(--space-md);
 *   display: flex;
 *   flex-direction: column;
 *   gap: var(--space-md);
 * }
 *
 * .loading {
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   height: 100vh;
 *   color: var(--text-secondary);
 * }
 */
