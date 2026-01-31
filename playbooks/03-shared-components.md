# Playbook 03: Shared Component Library

## Overview
Extract duplicated components into a shared library to eliminate code duplication.

## Problem Being Solved
Current app has navigation, toast, and styling duplicated across every page. This creates maintenance burden and inconsistency.

## Components to Create

### 1. Layout Components

#### AppLayout
Wraps all pages with consistent structure.
```typescript
// src/components/layout/AppLayout.tsx
interface AppLayoutProps {
  children: ReactNode
  showNav?: boolean
  showHeader?: boolean
}
```

#### Header
Top header with page title and actions.
```typescript
// src/components/layout/Header.tsx
interface HeaderProps {
  title?: string
  showBack?: boolean
  rightAction?: ReactNode
}
```

#### Navigation
Bottom navigation bar.
```typescript
// src/components/layout/Navigation.tsx
// 5 tabs: Now, Organize, Chat, Reflections, Settings
```

### 2. Shared UI Components

#### Button
```typescript
// src/components/shared/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger'
  size: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
}
```

#### Card
Glass morphism card (PRESERVE EXACT DESIGN).
```typescript
// src/components/shared/Card.tsx
interface CardProps {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}
```

#### Input
Text input with label.
```typescript
// src/components/shared/Input.tsx
interface InputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'password' | 'email'
  error?: string
}
```

#### Toast
Notification toasts.
```typescript
// src/components/shared/Toast.tsx
interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}
```

#### Modal
Dialog overlay.
```typescript
// src/components/shared/Modal.tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}
```

### 3. The Orb (CRITICAL - PRESERVE EXACTLY)

```typescript
// src/components/shared/Orb.tsx
interface OrbProps {
  size?: 'sm' | 'md' | 'lg'
  breathing?: boolean
  onClick?: () => void
}
```

The Orb must have:
- Exact gradient (orange → magenta → deep red)
- Breathing animation (scale 1.0 → 1.05 → 1.0)
- Glow effect (box-shadow with accent color)
- Blur effect for depth
- Smooth transitions

CSS for Orb:
```css
.orb {
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    var(--orb-gradient-1),
    var(--orb-gradient-2) 50%,
    var(--orb-gradient-3)
  );
  box-shadow:
    0 0 60px var(--orb-glow),
    0 0 100px var(--orb-glow);
  animation: orb-breathe 4s ease-in-out infinite;
}

@keyframes orb-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

## Implementation Steps

### Step 1: Create Component Files
```bash
touch src/components/layout/AppLayout.tsx
touch src/components/layout/Header.tsx
touch src/components/layout/Navigation.tsx
touch src/components/shared/Button.tsx
touch src/components/shared/Card.tsx
touch src/components/shared/Input.tsx
touch src/components/shared/Toast.tsx
touch src/components/shared/Modal.tsx
touch src/components/shared/Orb.tsx
```

### Step 2: Create Index Files
```typescript
// src/components/layout/index.ts
export { AppLayout } from './AppLayout'
export { Header } from './Header'
export { Navigation } from './Navigation'

// src/components/shared/index.ts
export { Button } from './Button'
export { Card } from './Card'
export { Input } from './Input'
export { Toast } from './Toast'
export { Modal } from './Modal'
export { Orb } from './Orb'
```

### Step 3: Migrate Pages
Update each page to import from shared:
```typescript
// Before (duplicated in each file)
const Card = styled.div`...`
const Button = styled.button`...`

// After (imported from shared)
import { Card, Button } from '../components/shared'
```

## Verification

- [ ] All components exported from index
- [ ] No duplicate component definitions across pages
- [ ] Orb looks identical to original
- [ ] Cards have exact same glass effect
- [ ] Buttons match original styling
- [ ] Navigation consistent on all pages
- [ ] Theme toggle works with all components

## Component Guidelines

### Styling Rules
- Use CSS variables only (no hardcoded colors)
- Use design tokens for spacing
- Support both light and dark themes
- Maintain exact visual appearance

### Accessibility Requirements
- All interactive elements keyboard-accessible
- Proper ARIA labels
- Focus indicators visible
- Color contrast WCAG AA

### No Gamification
Components must NOT include:
- Point displays
- Badge systems
- Streak counters
- Achievement indicators

## Next Steps
Proceed to Playbook 04: Data Layer
