# Polish Specification — Premium App Feel

> **Reference:** One Day Journal, Headspace, Reflect
> **Goal:** Every pixel considered. Super smooth. Delightful.
> **Created:** 2026-02-01

---

## Design Principles

### 1. Generous Whitespace
- Let the UI breathe
- More padding than you think you need
- Negative space is a feature, not waste

### 2. Intimate Typography
- Lowercase for warmth ("welcome friend" not "Welcome Friend")
- Softer weight hierarchy
- Line height: 1.5-1.8 for readability

### 3. Butter-Smooth Animations
- 60fps always
- Spring physics (not linear easing)
- Micro-delays for stagger effects
- Nothing should "snap" — everything glides

### 4. Personal Warmth
- First-person voice
- Friendly, not corporate
- Celebrate small wins with delight

### 5. Attention to Detail
- Every corner radius consistent
- Every shadow intentional
- Every transition timed perfectly

---

## Animation Standards

### Timing
```css
/* Base durations */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
--duration-slower: 600ms;

/* Spring easing (use for most UI) */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Smooth easing (use for fades) */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);

/* Exit easing (use for dismissals) */
--ease-exit: cubic-bezier(0.4, 0, 1, 1);
```

### What to Animate
- ✅ Modal entrances (scale + fade)
- ✅ Button presses (subtle scale down)
- ✅ List item additions (slide + fade)
- ✅ Page transitions (cross-fade or slide)
- ✅ Success states (checkmark with overshoot)
- ❌ Don't animate everything — be selective

### Haptic Feedback
```typescript
// Light tap
navigator.vibrate?.(10)

// Success
navigator.vibrate?.([10, 50, 10])

// Error
navigator.vibrate?.([50, 30, 50])
```

---

## Typography Refinements

### Current vs. Target

| Element | Current | Target |
|---------|---------|--------|
| Headers | Title Case, Bold | lowercase, medium weight |
| Body | Standard line-height | 1.6-1.8 line-height |
| Buttons | ALL CAPS | Sentence case |
| Labels | Uppercase | lowercase or Sentence case |

### Font Stack
Keep current fonts, but adjust weights:
- Display: Playfair Display (for special moments only)
- Body: Inter (softer weights: 400, 500)

---

## Spacing System

### Current Issue
Spacing feels cramped in places.

### Target
```css
--space-xs: 4px;   /* Tight grouping */
--space-sm: 8px;   /* Related items */
--space-md: 16px;  /* Section padding */
--space-lg: 24px;  /* Between sections */
--space-xl: 32px;  /* Major sections */
--space-2xl: 48px; /* Page-level breathing room */
--space-3xl: 64px; /* Hero spacing */
```

### Rule of Thumb
When in doubt, add more space.

---

## Micro-interactions

### Button Press
```css
.btn:active {
  transform: scale(0.97);
  transition: transform 100ms ease;
}
```

### Checkbox Complete
1. Scale down slightly (anticipation)
2. Checkmark draws in with overshoot
3. Light haptic
4. Item fades/slides out after 300ms delay

### Swipe Gesture
1. Drag reveals action with resistance (rubber-band feel)
2. Past threshold: snap to action
3. Below threshold: bounce back
4. Success: haptic + brief color flash

### Card Hover (Desktop)
```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevated);
  transition: all 200ms var(--ease-spring);
}
```

---

## Empty States

### Current
Generic text: "No tasks yet."

### Target
Personal, encouraging:
```
nothing here yet — and that's okay

when you're ready, tap + to add
something you care about

no pressure. take your time.
```

---

## Success Moments

### Task Completed
Current: Task disappears
Target: 
1. Checkmark animates in with bounce
2. Confetti particles (subtle, few)
3. Brief encouraging message appears
4. Task slides out gracefully

### Goal Achieved
Current: Nothing special
Target:
1. Full-screen celebration overlay
2. Animated badge/icon
3. Personal message: "you did it. proud of you."
4. Share option

---

## Onboarding Flow

### First Launch Experience
Inspired by One Day Journal:

**Screen 1: Welcome**
```
[flame icon, animated glow]

hey there

burnout was made for people like us
who sometimes feel overwhelmed
by everything they need to do

[continue]
```

**Screen 2: Philosophy**
```
we believe in doing less, better
one task at a time
no guilt, no pressure

[continue]
```

**Screen 3: Get Started**
```
ready when you are

try it for 3 days
see if it helps

[let's go]
```

---

## Sound Design (Optional)

If adding sounds:
- Soft, organic tones
- Not "notification" sounds — more like ASMR
- Complete: gentle chime
- Add task: soft click
- Swipe: whoosh

Volume: Very low, or off by default

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Animation FPS | 60fps always |
| Touch response | < 100ms |

---

## Implementation Priority

### Phase 1: Quick Wins (This Week)
- [ ] Increase padding throughout
- [ ] Soften button styles (no all-caps)
- [ ] Add spring easing to modals
- [ ] Improve empty states copy

### Phase 2: Interactions (Next Week)
- [ ] Polish task completion animation
- [ ] Add haptic feedback consistently
- [ ] Smooth swipe gestures (rubber-band feel)
- [ ] Card hover effects (desktop)

### Phase 3: Delight (Following Week)
- [ ] Onboarding flow
- [ ] Success celebrations
- [ ] Sound design (optional)
- [ ] Loading states with personality

---

## Reference Apps to Study

1. **One Day Journal** — Warmth, personal touch
2. **Headspace** — Playful animations
3. **Reflect** — Smooth interactions
4. **Things 3** — Task completion feel
5. **Linear** — Premium desktop feel

---

*Polish spec by @miloshh_bot | 2026-02-01*
*"Details are not the details. Details are the design." — Charles Eames*
