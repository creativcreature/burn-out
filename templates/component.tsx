/**
 * Component Template
 *
 * Usage:
 * 1. Copy this file to src/components/[category]/[ComponentName].tsx
 * 2. Replace COMPONENT_NAME with your component name
 * 3. Define props interface
 * 4. Implement component logic
 * 5. Add styles using CSS variables
 */

import { ReactNode } from 'react'
import styles from './COMPONENT_NAME.module.css'

interface COMPONENT_NAMEProps {
  children?: ReactNode
  className?: string
}

export function COMPONENT_NAME({ children, className }: COMPONENT_NAMEProps) {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      {children}
    </div>
  )
}

/*
 * Corresponding CSS Module: COMPONENT_NAME.module.css
 *
 * .container {
 *   // Use CSS variables from src/styles/variables.css
 *   background: var(--bg-card);
 *   border-radius: var(--radius-md);
 *   padding: var(--space-md);
 * }
 */
