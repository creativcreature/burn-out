# Reflect Redesign — One Day Journal Level Craft

> **Reference:** One Day Journal "plant memory" screen
> **Problem:** Reflect looks nothing like the reference — too dense, too corporate
> **Goal:** Organic, warm, inviting journaling experience
> **Created:** 2026-02-01

---

## Design Language Shift

### Current Reflect (Problems)
- Too many elements
- Perfect geometric shapes
- Dense, busy layout
- Standard UI components
- Feels like a form

### Target Reflect (One Day Style)
- Extremely minimal
- Hand-drawn, organic shapes
- Massive whitespace (70% empty)
- Single accent color
- Feels like a personal journal

---

## Reference Analysis

From the One Day "plant memory" screen:

```
┌─────────────────────────────────┐
│           [today]               │  ← pill badge, centered
│                                 │
│  🌷  🍒  🌲🌲🌲  🍄🍄          │  ← hand-drawn icons row
│                                 │
│                                 │
│                                 │
│          (whitespace)           │  ← 60% of screen
│                                 │
│                                 │
│           ╭───────╮             │
│           │   +   │             │  ← organic, imperfect circle
│           ╰───────╯             │
│        plant memory             │  ← lowercase, gentle
│                                 │
│                                 │
│          (whitespace)           │
│                                 │
│    ┌──────────────────┐         │
│    │ 🌱🌻  │ 🌸(sel) │         │  ← tiny bottom nav
│    └──────────────────┘         │
│    trial ends in 03 days        │  ← subtle upsell
└─────────────────────────────────┘
```

---

## Key Design Elements

### 1. Hand-Drawn Aesthetic
- Imperfect circles, wobbly lines
- SVG icons with organic feel
- Nothing perfectly geometric
- Feels human, not machine

### 2. Single Accent Color
- Everything grayscale EXCEPT accent
- One color only (their blue/purple ≈ our orange?)
- Or: keep our orb glow as the only color

### 3. Massive Whitespace
- Center the main action
- Don't fill the space
- Let it breathe
- Empty = calm, not incomplete

### 4. Warm, Inviting Copy
- Lowercase everything
- Gentle verbs ("plant", "grow", "remember")
- No urgency, no pressure
- Personal, like a friend

### 5. Micro-animations
- Icons have subtle life (sway, breathe)
- Transitions are slow, organic
- Nothing snappy or aggressive

---

## Reflect Page Redesign

### Empty State (First Visit)
```
┌─────────────────────────────────┐
│                                 │
│          [today]                │
│                                 │
│                                 │
│                                 │
│                                 │
│           (orb glow)            │
│                                 │
│          ╭─────────╮            │
│          │    +    │            │
│          ╰─────────╯            │
│                                 │
│       capture a thought         │  ← or "plant a memory"
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
│      ◯ ◯ ◯   [reflect]          │  ← nav
└─────────────────────────────────┘
```

### With Entries
```
┌─────────────────────────────────┐
│          [feb 1]                │
│                                 │
│  🔥  ✨  🌙  💭                 │  ← mood/energy icons
│                                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │ feeling tired but okay    │  │  ← journal entry card
│  │ did one task today        │  │
│  │ that's enough             │  │
│  └───────────────────────────┘  │
│                                 │
│          ╭─────────╮            │
│          │    +    │            │
│          ╰─────────╯            │
│        add another              │
│                                 │
│                                 │
│      ◯ ◯ ◯   [reflect]          │
└─────────────────────────────────┘
```

---

## Icon System

Replace standard icons with hand-drawn organic versions:

| Concept | Standard | Hand-drawn |
|---------|----------|------------|
| Add | ➕ | Wobbly circle with + |
| Energy | ⚡ | Wavy flame |
| Complete | ✓ | Scribbled checkmark |
| Mood | 😊 | Simple face doodle |
| Fire | 🔥 | Soft flame sketch |

Consider commissioning or using an organic icon set:
- Phosphor Icons (hand-drawn variant)
- Custom SVGs with wobbly paths

---

## Animation Specs

### Icon Idle
```css
@keyframes gentle-sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}

.icon {
  animation: gentle-sway 4s ease-in-out infinite;
}
```

### Add Button Press
```css
.add-btn:active {
  transform: scale(0.95);
  transition: transform 100ms ease;
}
```

### Entry Appear
```css
@keyframes fade-up {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.entry {
  animation: fade-up 400ms ease-out;
}
```

---

## Copy Changes

### Current → Target

| Current | Target |
|---------|--------|
| "Add Reflection" | "capture a thought" |
| "Today's Entry" | "today" |
| "How are you feeling?" | "how's it going?" |
| "Submit" | (no button, auto-save) |
| "Your Reflections" | "memories" |

---

## Technical Implementation

### 1. Create Organic + Button
```tsx
// Hand-drawn SVG circle with +
<svg viewBox="0 0 100 100">
  <path 
    d="M50,5 C75,5 95,25 95,50 C95,75 75,95 50,95 C25,95 5,75 5,50 C5,25 25,5 50,5" 
    fill="none" 
    stroke="var(--accent)"
    strokeWidth="2"
    strokeLinecap="round"
  />
  <line x1="50" y1="35" x2="50" y2="65" stroke="var(--accent)" strokeWidth="2"/>
  <line x1="35" y1="50" x2="65" y2="50" stroke="var(--accent)" strokeWidth="2"/>
</svg>
```

### 2. Increase Whitespace
```css
.reflect-page {
  padding: var(--space-3xl) var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: var(--space-2xl);
}
```

### 3. Single Accent Color
```css
:root {
  /* Everything else is grayscale */
  --text: #1a1a1a;
  --text-muted: #666;
  --bg: #f5f5f5;
  
  /* Single accent */
  --accent: var(--orb-orange); /* or keep flame color */
}

.reflect-page * {
  color: var(--text);
}

.reflect-page .accent {
  color: var(--accent);
}
```

---

## Priority

### Phase 1: Layout Shift
- [ ] Remove density — massive whitespace
- [ ] Center main CTA
- [ ] Simplify to one action per screen

### Phase 2: Visual Language
- [ ] Replace icons with organic versions
- [ ] Add hand-drawn + button
- [ ] Single accent color

### Phase 3: Micro-interactions
- [ ] Icon animations (gentle sway)
- [ ] Smooth transitions
- [ ] Auto-save (no submit button)

---

## Open Questions

1. **Keep orb or remove?** One Day has no orb equivalent
2. **Accent color?** Blue like One Day, or keep our orange?
3. **Icon style?** Hand-drawn custom, or find an icon set?
4. **Entry format?** Free text, or prompts?

---

*Spec by @miloshh_bot | 2026-02-01*
*"The best interface is no interface" — Golden Krishna*
