# Tooltips Specification

> **Purpose:** Guide first-time users through features without a formal onboarding
> **Style:** Subtle, non-intrusive, dismissible
> **Created:** 2026-02-01

---

## Design Principles

### 1. Just-in-Time
Show tooltips when user first encounters a feature, not all at once.

### 2. Non-Blocking
User can ignore and interact normally — tooltips shouldn't prevent actions.

### 3. One-Time
Show each tooltip once. Track with localStorage.

### 4. Warm Tone
Friendly, lowercase, encouraging.

---

## Tooltip Triggers

### Now Page (First Visit)

**Trigger:** First time user lands on Now page
**Target:** Task card
**Message:**
```
swipe right to complete
swipe left for later
```
**Position:** Below card
**Dismiss:** Tap anywhere or after first swipe

---

### Organize Page (First Visit)

**Trigger:** First time user visits Organize
**Target:** Goal header
**Message:**
```
tap to collapse · drag to reorder
```
**Position:** Below first goal header
**Dismiss:** Tap anywhere or after interaction

---

### Quick Add (First Use)

**Trigger:** User taps quick add input for first time
**Target:** Quick add bar
**Message:**
```
type a task · pick a goal · press enter
```
**Position:** Above input
**Dismiss:** After first task added

---

### FAB (First Encounter)

**Trigger:** User scrolls past FAB for first time
**Target:** FAB button
**Message:**
```
need help? tap to chat
```
**Position:** Left of FAB
**Dismiss:** After 5 seconds or tap

---

### Settings (First Visit)

**Trigger:** First time user visits Settings
**Target:** "Load Sample Data" button
**Message:**
```
want to see how it works?
load 73 example tasks
```
**Position:** Below button
**Dismiss:** Tap button or anywhere

---

### Chat (First Use)

**Trigger:** First time user opens Chat
**Target:** Message input
**Message:**
```
tell me what's on your mind
i'll help you break it into tasks
```
**Position:** Above input
**Dismiss:** After first message sent

---

## Visual Design

### Tooltip Component
```
┌─────────────────────────────────┐
│  message text here              │
│              ▼ (arrow pointing) │
└─────────────────────────────────┘
```

### Styling
```css
.tooltip {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-sm);
  color: var(--text-muted);
  box-shadow: var(--shadow-tooltip);
  max-width: 200px;
  text-align: center;
  animation: tooltip-fade-in 200ms ease;
}

.tooltip-arrow {
  /* CSS triangle pointing to target */
}

@keyframes tooltip-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## State Management

### Storage Key
```typescript
interface TooltipState {
  seen: {
    nowSwipe: boolean
    organizeCollapse: boolean
    quickAdd: boolean
    fab: boolean
    settings: boolean
    chat: boolean
  }
  lastShown: string // ISO date
}

// Key: 'burnout_tooltips'
```

### Hook
```typescript
function useTooltip(id: string) {
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    const state = getTooltipState()
    if (!state.seen[id]) {
      setVisible(true)
    }
  }, [id])
  
  const dismiss = () => {
    markTooltipSeen(id)
    setVisible(false)
  }
  
  return { visible, dismiss }
}
```

---

## Component API

```typescript
interface TooltipProps {
  id: string           // Unique ID for tracking
  message: string      // Tooltip text
  targetRef: RefObject // Element to point at
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number       // ms before showing
  autoDismiss?: number // ms before auto-hide (0 = manual only)
}

// Usage
<Tooltip
  id="now-swipe"
  message="swipe right to complete"
  targetRef={taskCardRef}
  position="bottom"
  autoDismiss={5000}
/>
```

---

## Implementation Priority

### Phase 1: Core Component
- [ ] Create `<Tooltip>` component
- [ ] Create `useTooltip` hook
- [ ] Add localStorage state management

### Phase 2: Key Tooltips
- [ ] Now page swipe hint
- [ ] FAB introduction
- [ ] Quick add guidance

### Phase 3: Secondary Tooltips
- [ ] Organize collapse/drag
- [ ] Chat first use
- [ ] Settings sample data

---

## Accessibility

- Tooltips should be `role="tooltip"`
- Target element should have `aria-describedby` pointing to tooltip
- Dismiss on Escape key
- Don't rely on hover (touch-friendly)

---

## Testing

```typescript
describe('Tooltips', () => {
  it('shows tooltip on first visit', () => {})
  it('does not show tooltip on second visit', () => {})
  it('dismisses on tap', () => {})
  it('dismisses after autoDismiss timer', () => {})
  it('tracks seen state in localStorage', () => {})
})
```

---

*Spec by @miloshh_bot | 2026-02-01*
