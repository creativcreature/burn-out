# Playbook 02: Global Theme System

## Overview
Implement a unified theme system that works across ALL pages.

## Problem Being Solved
Current app has theme working only on 1/7 pages. This playbook creates a single `useTheme` hook that all pages will use.

## Design Requirements (PRESERVE EXACTLY)

### Light Theme
- Background: Warm cream (#faf8f5)
- Text: Dark charcoal (#2d2d2d)
- Cards: White with subtle shadow

### Dark Theme
- Background: Pure black (#000000)
- Text: Off-white (#f5f5f5)
- Cards: Dark glass effect

### Accent Colors (Both Themes)
- Primary: Orange (#ff6b35)
- Secondary: Magenta (#e91e63)
- Tertiary: Deep red (#c62828)

## Implementation

### Step 1: Create CSS Variables

Create `src/styles/variables.css`:
```css
:root {
  /* Light Theme (default) */
  --bg-primary: #faf8f5;
  --bg-secondary: #ffffff;
  --bg-card: rgba(255, 255, 255, 0.8);

  --text-primary: #2d2d2d;
  --text-secondary: #666666;
  --text-muted: #999999;

  --accent-primary: #ff6b35;
  --accent-secondary: #e91e63;
  --accent-tertiary: #c62828;

  --border-color: rgba(0, 0, 0, 0.1);
  --shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  --glass-blur: blur(20px);

  /* Orb Colors */
  --orb-gradient-1: #ff6b35;
  --orb-gradient-2: #e91e63;
  --orb-gradient-3: #c62828;
  --orb-glow: rgba(255, 107, 53, 0.4);

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Typography */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;

  --text-xs: 12px;
  --text-sm: 14px;
  --text-md: 16px;
  --text-lg: 20px;
  --text-xl: 24px;
  --text-2xl: 32px;
  --text-3xl: 40px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 400ms ease;

  /* Safe Areas */
  --safe-top: env(safe-area-inset-top);
  --safe-bottom: env(safe-area-inset-bottom);
  --nav-height: 72px;
}

[data-theme="dark"] {
  --bg-primary: #000000;
  --bg-secondary: #111111;
  --bg-card: rgba(30, 30, 30, 0.8);

  --text-primary: #f5f5f5;
  --text-secondary: #aaaaaa;
  --text-muted: #666666;

  --border-color: rgba(255, 255, 255, 0.1);
  --shadow: 0 4px 20px rgba(0, 0, 0, 0.4);

  --orb-glow: rgba(255, 107, 53, 0.6);
}
```

### Step 2: Create Theme Hook

Create `src/hooks/useTheme.ts`:
```typescript
import { useState, useEffect, useCallback } from 'react'
import { get, set } from 'idb-keyval'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'burnout_v4'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load theme from storage on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        const data = await get(STORAGE_KEY)
        if (data?.theme) {
          setThemeState(data.theme)
          document.documentElement.setAttribute('data-theme', data.theme)
        }
      } catch (error) {
        console.error('Failed to load theme:', error)
      } finally {
        setIsLoaded(true)
      }
    }
    loadTheme()
  }, [])

  // Update DOM and storage when theme changes
  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)

    try {
      const data = await get(STORAGE_KEY) || {}
      await set(STORAGE_KEY, { ...data, theme: newTheme })
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLoaded
  }
}
```

### Step 3: Create Theme Provider

Create `src/components/shared/ThemeProvider.tsx`:
```typescript
import { createContext, useContext, ReactNode } from 'react'
import { useTheme } from '../../hooks/useTheme'

type ThemeContextType = ReturnType<typeof useTheme>

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme()

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider')
  }
  return context
}
```

### Step 4: Wrap App with Provider

Update `src/App.tsx`:
```typescript
import { ThemeProvider } from './components/shared/ThemeProvider'
import { Router } from './Router'

export default function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  )
}
```

### Step 5: Use in Pages

Every page should use:
```typescript
import { useThemeContext } from '../components/shared/ThemeProvider'

export function NowPage() {
  const { theme, toggleTheme, isDark } = useThemeContext()

  return (
    // ... page content
    <button onClick={toggleTheme}>
      {isDark ? 'Light' : 'Dark'} Mode
    </button>
  )
}
```

## Verification

- [ ] Theme toggle works on Now page
- [ ] Theme toggle works on Organize page
- [ ] Theme toggle works on Chat page
- [ ] Theme toggle works on Reflections page
- [ ] Theme toggle works on Settings page
- [ ] Theme persists after refresh
- [ ] Colors match design spec exactly
- [ ] Orb looks identical in both themes

## Next Steps
Proceed to Playbook 03: Shared Components
