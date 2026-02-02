# BurnOut Brand Guidelines

Version 1.0 | January 2026

---

## Table of Contents

1. [Brand Philosophy](#brand-philosophy)
2. [Logo & Wordmark](#logo--wordmark)
3. [The Orb](#the-orb)
4. [Color System](#color-system)
5. [Typography](#typography)
6. [Spacing & Layout](#spacing--layout)
7. [Components](#components)
8. [Iconography](#iconography)
9. [Motion & Animation](#motion--animation)
10. [Voice & Tone](#voice--tone)
11. [Anti-Patterns](#anti-patterns)
12. [Accessibility](#accessibility)

---

## Brand Philosophy

### Mission
Help neurodivergent users work with their energy, not against it.

### Core Promise
Productivity without punishment.

### Brand Attributes
- **Warm** - Never cold, clinical, or harsh
- **Calm** - Reduces anxiety, doesn't create it
- **Supportive** - Encourages without pressuring
- **Honest** - Direct communication, no manipulation
- **Human** - Designed for real people with fluctuating energy

### Design Principles

1. **Warmth Over Gamification**
   No points, badges, streaks, or achievements. We celebrate through gentle encouragement, not dopamine manipulation.

2. **Clarity Over Cleverness**
   Simple, intuitive interfaces that don't drain cognitive energy. If a user has to think about how to use it, we've failed.

3. **Breathing Room**
   Generous spacing, smooth animations, and visual calm. Every screen should feel like a deep breath.

4. **Energy Awareness**
   The interface adapts to and respects the user's current energy state. No guilt, no pressure.

---

## Logo & Wordmark

### Primary Wordmark

The BurnOut wordmark uses **Calluna** (or fallback: Playfair Display) with a distinctive flame icon integrated into the "O".

```
BurnOut
     ^
     └── Flame icon replaces the dot/center of "O"
```

### Logo Construction

- **Typeface**: Calluna Bold (display) or Playfair Display Bold
- **Flame**: Custom icon, sits inside the "O" letterform
- **Capitalization**: "Burn" + "Out" as one word, capital B and O

### Color Variants

| Variant | Logo Color | Background | Use Case |
|---------|------------|------------|----------|
| Primary | Purple `#7C3AED` | Light/Cream | Default, headers |
| Light | Cream `#F5EFE6` | Dark/Black | Dark mode |
| Dark | Black `#0A0A0A` | Light backgrounds | Print, contrast |
| Coral | Coral `#E53935` | Various | Marketing, accents |
| Orange | Orange `#FF6D00` | Various | Energy, highlights |
| Mint | Mint `#69F0AE` | Various | Success states |
| White | White `#FFFFFF` | Dark backgrounds | Overlays |

### Clear Space

Minimum clear space around the logo equals the height of the "B" in BurnOut on all sides.

### Minimum Sizes

- **Digital**: 80px width minimum
- **Print**: 20mm width minimum
- **Favicon/Icon**: Flame icon only at small sizes (< 32px)

### Logo Don'ts

- Never stretch or distort
- Never change the flame position
- Never add effects (drop shadows, gradients, outlines)
- Never place on busy backgrounds without contrast overlay
- Never rotate or flip

---

## The Orb

The Orb is BurnOut's signature visual element—a warm, glowing gradient sphere that represents energy, warmth, and focus.

### Orb Specifications

#### Gradient Colors (center to edge)
```css
--orb-orange: #FF4500;   /* Core - bright orange */
--orb-red: #FF2200;      /* Middle - warm red */
--orb-magenta: #FF00FF;  /* Outer - magenta */
--orb-purple: #8000FF;   /* Edge - purple (optional) */
```

#### CSS Implementation
```css
.orb {
  background: radial-gradient(
    circle at 50% 50%,
    #FF4500 0%,
    #FF2200 30%,
    #FF00FF 60%,
    transparent 70%
  );
  filter: blur(40px);
  animation: orb-breathe 4s ease-in-out infinite;
}
```

### Breathing Animation

The Orb should always have a subtle "breathing" animation—a gentle pulse that conveys life and energy.

```css
@keyframes orb-breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.85;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}
```

- **Duration**: 4 seconds
- **Easing**: ease-in-out
- **Scale range**: 1.0 to 1.08
- **Opacity range**: 0.85 to 1.0

### Orb Placement

| Context | Position | Size | Opacity |
|---------|----------|------|---------|
| Home screen (hero) | Upper-center | 200-300px | 85-100% |
| Task card background | Behind card | 150-200px | 60-70% |
| Login/splash | Center | 300-400px | 90% |
| Mini indicator | Inline | 24-32px | 80% |

### Orb on Different Backgrounds

The Orb works on any background but requires adjustment:

| Background | Orb Opacity | Blur Amount |
|------------|-------------|-------------|
| Light cream `#FDF8F3` | 70-85% | 40-60px |
| Pure white `#FFFFFF` | 60-75% | 50-70px |
| Pure black `#0A0A0A` | 85-100% | 30-50px |
| Purple `#7C3AED` | 80-90% | 40px |
| Mint `#69F0AE` | 75-85% | 45px |
| Photo backgrounds | 70-80% | 50-60px |

### Orb Energy States (Future)

The Orb can represent user energy levels:

| Energy State | Core Color | Brightness | Animation Speed |
|--------------|------------|------------|-----------------|
| High | Bright orange | 100% | 3s |
| Medium | Orange-red | 80% | 4s |
| Low | Deep red | 60% | 6s |
| Recovery | Soft magenta | 50% | 8s |

---

## Color System

### Primary Palette

#### Brand Purple
The primary brand color for logos, headers, and key UI elements.
```css
--purple-500: #7C3AED;  /* Primary */
--purple-400: #9F67FF;  /* Hover */
--purple-600: #6D28D9;  /* Pressed */
--purple-100: #EDE9FE;  /* Background tint */
```

#### Brand Coral/Red
For primary actions, energy indicators, and warmth.
```css
--coral-500: #E53935;   /* Primary action buttons */
--coral-400: #EF5350;   /* Hover */
--coral-600: #C62828;   /* Pressed */
--coral-100: #FFEBEE;   /* Background tint */
```

#### Brand Orange
For energy, highlights, and The Orb.
```css
--orange-500: #FF6D00;  /* High energy, accents */
--orange-400: #FF8A00;  /* Hover */
--orange-600: #E65100;  /* Pressed */
--orange-100: #FFF3E0;  /* Background tint */
```

### Semantic Colors

#### Functional Palette
```css
/* Success - Mint Green */
--success-500: #69F0AE;
--success-600: #00E676;

/* Warning - Amber */
--warning-500: #FFB300;
--warning-600: #FFA000;

/* Error - Red */
--error-500: #EF5350;
--error-600: #E53935;

/* Info - Purple */
--info-500: #7C3AED;
--info-600: #6D28D9;
```

### Theme Colors

#### Light Theme
```css
[data-theme="light"] {
  --bg: #FDF8F3;                    /* Warm cream - primary background */
  --bg-alt: #FCF9F4;                /* Slightly lighter cream */
  --bg-card: rgba(255,255,255,0.75); /* Glass card background */
  --bg-card-solid: #FFFFFF;          /* Solid card background */

  --text: #3A2C25;                  /* Warm dark brown - primary text */
  --text-muted: #7A6B63;            /* Medium brown - secondary text */
  --text-subtle: #A89B93;           /* Light brown - tertiary text */

  --border: rgba(232,226,220,0.6);  /* Warm gray border */
  --shadow-card: 0 8px 32px rgba(0,0,0,0.08);
}
```

#### Dark Theme
```css
[data-theme="dark"] {
  --bg: #0A0A0A;                    /* Pure black - primary background */
  --bg-alt: #0A0A0A;                /* Same black for consistency */
  --bg-card: rgba(20,20,20,0.75);   /* Near-black glass */
  --bg-card-solid: #141414;          /* Solid dark card */

  --text: #F5EFE6;                  /* Warm off-white - primary text */
  --text-muted: #A89B93;            /* Warm gray - secondary text */
  --text-subtle: #6B5F58;           /* Dark gray - tertiary text */

  --border: rgba(42,36,32,0.6);     /* Warm dark border */
  --shadow-card: 0 8px 32px rgba(0,0,0,0.4);
}
```

### Extended Palette (Design System)

Full 11-step scales from Figma (50-950):

#### Purple Scale
| Step | Hex | Usage |
|------|-----|-------|
| 50 | `#F5F3FF` | Lightest tint |
| 100 | `#EDE9FE` | Background |
| 200 | `#DDD6FE` | Hover background |
| 300 | `#C4B5FD` | Border |
| 400 | `#A78BFA` | Icon |
| 500 | `#7C3AED` | Primary |
| 600 | `#6D28D9` | Hover |
| 700 | `#5B21B6` | Pressed |
| 800 | `#4C1D95` | Dark |
| 900 | `#3B0764` | Darker |
| 950 | `#1E0533` | Darkest |

#### Red/Coral Scale
| Step | Hex | Usage |
|------|-----|-------|
| 50 | `#FFF5F5` | Lightest tint |
| 100 | `#FFE3E3` | Background |
| 200 | `#FFC9C9` | Hover background |
| 300 | `#FFA8A8` | Border |
| 400 | `#FF8787` | Icon |
| 500 | `#E53935` | Primary |
| 600 | `#C62828` | Hover |
| 700 | `#B71C1C` | Pressed |
| 800 | `#8B1A1A` | Dark |
| 900 | `#5C1212` | Darker |
| 950 | `#2D0909` | Darkest |

#### Orange Scale
| Step | Hex | Usage |
|------|-----|-------|
| 50 | `#FFF8F0` | Lightest tint |
| 100 | `#FFEDD5` | Background |
| 200 | `#FED7AA` | Hover background |
| 300 | `#FDBA74` | Border |
| 400 | `#FB923C` | Icon |
| 500 | `#FF6D00` | Primary |
| 600 | `#E65100` | Hover |
| 700 | `#C2410C` | Pressed |
| 800 | `#7C2D12` | Dark |
| 900 | `#5C1F0C` | Darker |
| 950 | `#2D0F06` | Darkest |

#### Green/Mint Scale
| Step | Hex | Usage |
|------|-----|-------|
| 50 | `#F0FFF4` | Lightest tint |
| 100 | `#C8F7D6` | Background |
| 200 | `#9AE6B4` | Hover background |
| 300 | `#68D391` | Border |
| 400 | `#48BB78` | Icon |
| 500 | `#69F0AE` | Primary (mint) |
| 600 | `#00E676` | Hover |
| 700 | `#00C853` | Pressed |
| 800 | `#2E7D32` | Dark |
| 900 | `#1B5E20` | Darker |
| 950 | `#0D2E10` | Darkest |

#### Neutral/Gray Scale
| Step | Hex | Usage |
|------|-----|-------|
| 50 | `#FAFAFA` | Lightest |
| 100 | `#F5F5F5` | Background |
| 200 | `#E5E5E5` | Border light |
| 300 | `#D4D4D4` | Border |
| 400 | `#A3A3A3` | Placeholder |
| 500 | `#0A0A0A` | Primary dark |
| 600 | `#0A0A0A` | Text dark |
| 700 | `#0A0A0A` | — |
| 800 | `#0A0A0A` | — |
| 900 | `#0A0A0A` | — |
| 950 | `#0A0A0A` | Darkest |

### Color Usage Guidelines

#### Do
- Use purple for the logo and headers
- Use coral/red for primary action buttons (Login, Start Task)
- Use orange for energy-related indicators
- Use mint green for success states and completion
- Use warm cream backgrounds in light mode
- Use pure black backgrounds in dark mode

#### Don't
- Never use harsh/cold whites (`#FFFFFF` only for cards, not backgrounds)
- Never use cold blues as primary colors
- Never use neon or fluorescent colors
- Never use more than 3 accent colors on one screen

---

## Typography

### Font Families

#### Display Font: Calluna (Primary) / Playfair Display (Fallback)
Used for headlines, hero text, and the wordmark.

```css
--font-display: 'Calluna', 'Playfair Display', Georgia, serif;
```

- **Character**: Elegant, warm, sophisticated
- **Weights**: Regular (400), Bold (700)
- **Use**: Headlines, task titles, hero statements

#### Body Font: Aktiv Grotesk (Primary) / Inter (Fallback)
Used for body text, UI labels, and functional text.

```css
--font-body: 'Aktiv Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

- **Character**: Clean, readable, modern
- **Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)
- **Use**: Body copy, labels, buttons, navigation

### Type Scale

```css
--text-xs: 11px;   /* Tiny labels, timestamps */
--text-sm: 13px;   /* Captions, helper text */
--text-md: 15px;   /* Body text default */
--text-lg: 18px;   /* Large body, subheadings */
--text-xl: 24px;   /* Section headings */
--text-2xl: 32px;  /* Page titles */
--text-3xl: 40px;  /* Hero headlines */
--text-4xl: 48px;  /* Display headlines */
--text-5xl: 64px;  /* Jumbo display */
```

### Typography Hierarchy

| Level | Font | Size | Weight | Line Height | Use |
|-------|------|------|--------|-------------|-----|
| Headline 1 | Calluna | 48-64px | Bold | 1.1 | Hero task title |
| Headline 2 | Calluna | 40px | Bold | 1.15 | Page title |
| Headline 3 | Calluna | 32px | Bold | 1.2 | Section title |
| Headline 4 | Aktiv | 24px | Semibold | 1.25 | Card title |
| Headline 5 | Aktiv | 20px | Semibold | 1.3 | Subsection |
| Headline 6 | Aktiv | 18px | Semibold | 1.35 | Small heading |
| Headline 7 | Aktiv | 16px | Medium | 1.4 | Mini heading |
| Body 1 | Aktiv | 16px | Regular | 1.5 | Default body |
| Body 2 | Aktiv | 14px | Regular | 1.5 | Smaller body |
| Caption | Aktiv | 12px | Regular | 1.4 | Labels, metadata |
| Tiny | Aktiv | 11px | Regular | 1.3 | Timestamps |

### Text Styling

#### Headlines (Calluna/Playfair)
```css
.headline {
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
}
```

#### Body Text (Aktiv/Inter)
```css
.body {
  font-family: var(--font-body);
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1.5;
}
```

### Special Text Treatments

#### Task Action Verbs
Large, serif, commanding—these are the imperative verbs that prompt action.

```css
.task-verb {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--text);
}
```

Examples: "Make a Call.", "Investigate.", "Do it now.", "Nothing."

#### Task Descriptions
Smaller, sans-serif, supporting text.

```css
.task-description {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 400;
  color: var(--text-muted);
}
```

---

## Spacing & Layout

### Spacing Scale

```css
--space-xs: 4px;    /* Tight spacing, inline elements */
--space-sm: 8px;    /* Small gaps, icon padding */
--space-md: 16px;   /* Default spacing, card padding */
--space-lg: 24px;   /* Section spacing */
--space-xl: 32px;   /* Large sections */
--space-2xl: 48px;  /* Page sections */
--space-3xl: 64px;  /* Major divisions */
```

### Border Radius

```css
--radius-sm: 8px;     /* Small buttons, tags */
--radius-md: 12px;    /* Cards, inputs */
--radius-lg: 16px;    /* Large cards, modals */
--radius-xl: 24px;    /* Hero elements */
--radius-full: 9999px; /* Pills, circular buttons */
```

### Layout Grid

#### Mobile (< 768px)
- **Container**: 100% width, 16px side padding
- **Columns**: Single column
- **Gutter**: 16px

#### Tablet (768px - 1024px)
- **Container**: 100% width, 24px side padding
- **Columns**: 2 columns where appropriate
- **Gutter**: 24px

#### Desktop (> 1024px)
- **Container**: Max 480px (mobile-first app)
- **Columns**: Single column centered
- **Gutter**: 24px

### Safe Areas

```css
--safe-top: env(safe-area-inset-top, 0px);
--safe-bottom: env(safe-area-inset-bottom, 0px);
--safe-left: env(safe-area-inset-left, 0px);
--safe-right: env(safe-area-inset-right, 0px);
--nav-height: 64px;
```

---

## Components

### Cards

#### Glass Card (Default)
```css
.card {
  background: var(--bg-card);
  backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
  padding: var(--space-md);
}
```

#### Task Card (Featured)
```css
.task-card {
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.9) 0%,
    rgba(255,255,255,0.7) 100%
  );
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}
```

#### Upcoming Task Card
```css
.upcoming-card {
  background: #FEF9E7; /* Warm yellow tint */
  border-radius: var(--radius-md);
  padding: var(--space-md);
  border: none;
}
```

### Buttons

#### Primary Button (CTA)
```css
.btn-primary {
  background: var(--coral-500);
  color: white;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 16px;
  padding: 14px 32px;
  border-radius: var(--radius-full);
  border: none;
  box-shadow: 0 4px 12px rgba(229, 57, 53, 0.3);
}

.btn-primary:hover {
  background: var(--coral-400);
}

.btn-primary:active {
  background: var(--coral-600);
}
```

#### Secondary Button (Start Task)
```css
.btn-secondary {
  background: rgba(255, 255, 255, 0.8);
  color: var(--coral-500);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 16px;
  padding: 14px 32px;
  border-radius: var(--radius-full);
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: var(--text-muted);
  font-weight: 500;
  padding: 8px 16px;
  border: none;
}
```

#### Icon Button (FAB)
```css
.btn-fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: white;
  color: var(--purple-500);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Tags / Pills

#### Tag Variants
| Type | Background | Text | Border |
|------|------------|------|--------|
| Energy | `#FEF9E7` | `#92400E` | `#FDE68A` |
| Focus | `#E53935` | `#FFFFFF` | none |
| Call | `transparent` | `#6B7280` | `#D1D5DB` |
| Meeting | `#FEF3C7` | `#92400E` | `#FDE68A` |
| Writing | `#DBEAFE` | `#1E40AF` | `#BFDBFE` |
| Love | `#FCE7F3` | `#9D174D` | `#FBCFE8` |

```css
.tag {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: var(--radius-full);
}
```

### Navigation Pills

```css
.nav-pill {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-muted);
}

.nav-pill.active {
  background: var(--purple-500);
  color: white;
}
```

Navigation items: Goals, Tasks, Habits, BackBurn

### Input Fields

```css
.input {
  font-family: var(--font-body);
  font-size: 16px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card-solid);
  color: var(--text);
}

.input:focus {
  border-color: var(--purple-500);
  outline: none;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}
```

### Timer Component

```css
.timer-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    var(--purple-500) var(--progress),
    var(--bg-card) var(--progress)
  );
}

.timer-text {
  font-family: var(--font-body);
  font-size: 32px;
  font-weight: 600;
  color: var(--text);
}
```

### Bottom Navigation

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  padding-bottom: var(--safe-bottom);
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.nav-icon {
  color: var(--text-muted);
}

.nav-icon.active {
  color: var(--purple-500);
}
```

Icons (left to right):
1. Organize (link/chain icon)
2. Chat (speech bubble)
3. Complete (checkmark)
4. More (three dots)

---

## Iconography

### Icon Style

- **Style**: Outlined, 1.5-2px stroke
- **Corners**: Rounded
- **Size**: 24px default, 20px small, 32px large
- **Color**: Inherits from text color

### Core Icons

| Icon | Usage | Description |
|------|-------|-------------|
| Flame | Brand, header | BurnOut flame mark |
| Lightning (x2-3) | Energy level | Double/triple bolt for energy |
| Clock | Duration | Time estimate |
| Checkmark | Complete | Task completion |
| Arrow left | Snooze | Defer task |
| Arrow right | Push | Move to later |
| Plus | Add | Create new item |
| Chat bubble | Reflect/Chat | AI conversation |
| Link/Chain | Organize | Connect items |
| Three dots | More | Additional options |

### Energy Indicators

```
⚡⚡ = Medium Energy (2 bolts)
⚡⚡⚡ = High Energy (3 bolts)
```

---

## Motion & Animation

### Timing

```css
--transition-fast: 150ms ease;    /* Micro-interactions */
--transition-normal: 250ms ease;  /* Standard transitions */
--transition-slow: 400ms ease;    /* Emphasis, reveals */
```

### Easing

- **Default**: `ease` or `ease-in-out`
- **Enter**: `ease-out`
- **Exit**: `ease-in`
- **Bounce** (sparingly): `cubic-bezier(0.34, 1.56, 0.64, 1)`

### Animation Types

#### The Orb Breathing
```css
@keyframes orb-breathe {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.08); opacity: 1; }
}
/* Duration: 4s, infinite */
```

#### Fade In
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Duration: 250ms */
```

#### Slide Up (Cards entering)
```css
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Duration: 300ms */
```

### Reduced Motion

Always respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Animation Guidelines

#### Do
- Use subtle, calming animations
- Keep durations under 400ms for UI
- Use breathing animations for ambient elements
- Fade content in smoothly
- Provide visual feedback on interactions

#### Don't
- No jarring or sudden movements
- No bouncy/playful animations (too gamified)
- No animations longer than 1s for UI elements
- No animations that block user interaction
- No excessive use of motion

---

## Voice & Tone

### Brand Voice Attributes

- **Warm**: Like a supportive friend
- **Direct**: Clear, not verbose
- **Encouraging**: Without being pushy
- **Honest**: Acknowledges reality
- **Calm**: Never urgent or anxiety-inducing

### Tone by Context

| Context | Tone | Example |
|---------|------|---------|
| Welcome | Warm, inviting | "Welcome back. Let's focus." |
| Task prompt | Direct, encouraging | "Make a Call." |
| Empty state | Gentle, neutral | "Nothing. Create a new task." |
| Completion | Quietly satisfied | "Done." |
| Error | Understanding | "That didn't work. Let's try again." |

### Writing Guidelines

#### Do
- Use imperative verbs for task titles
- Keep labels short (max 12 characters for verbs)
- Speak in second person ("you")
- Acknowledge energy fluctuations
- End task verbs with a period for finality

#### Don't
- No exclamation marks (too urgent)
- No "Great job!" or celebratory language
- No guilt-inducing phrases ("You haven't...")
- No time pressure language ("Hurry", "Quick")
- No gamification language ("Streak", "Points", "Level up")

### Example Copy

#### Good
- "Do it now."
- "Nothing. Create a new task."
- "Investigate."
- "Make a Call."
- "Welcome back. Let's focus."

#### Bad
- "Great job completing that task!"
- "You're on a 5-day streak!"
- "Don't break your streak!"
- "Hurry, this is due soon!"
- "You haven't completed anything today."

---

## Anti-Patterns

### Absolutely Prohibited

1. **Gamification Elements**
   - No points or scores
   - No badges or achievements
   - No streaks or streak counters
   - No levels or leveling up
   - No leaderboards
   - No progress bars toward "rewards"

2. **Punishing Language**
   - No guilt-tripping
   - No shame for incomplete tasks
   - No negative reinforcement
   - No "you failed" messaging

3. **Anxiety-Inducing Design**
   - No urgent color alerts (red warnings)
   - No countdown timers with pressure
   - No notification badges with counts
   - No "overdue" shaming

4. **Addictive Patterns**
   - No infinite scroll
   - No pull-to-refresh dopamine hits
   - No variable reward schedules
   - No social comparison features

5. **Visual No-Gos**
   - No harsh white backgrounds
   - No cold blue color schemes
   - No neon or fluorescent colors
   - No busy, cluttered layouts
   - No tiny, hard-to-read text

---

## Accessibility

### WCAG 2.1 AA Compliance

All designs must meet WCAG 2.1 Level AA standards.

### Color Contrast

| Element | Minimum Ratio |
|---------|---------------|
| Body text | 4.5:1 |
| Large text (18px+) | 3:1 |
| UI components | 3:1 |
| Focus indicators | 3:1 |

### Touch Targets

- **Minimum**: 44x44px
- **Recommended**: 48x48px
- **Spacing between targets**: 8px minimum

### Focus States

All interactive elements must have visible focus states:

```css
:focus-visible {
  outline: 2px solid var(--purple-500);
  outline-offset: 2px;
}
```

### Screen Reader Support

- All images must have alt text
- All form inputs must have labels
- All buttons must have accessible names
- Use semantic HTML elements
- Provide skip links for navigation

### Motion Sensitivity

- Respect `prefers-reduced-motion`
- Provide controls to pause animations
- No auto-playing videos with sound
- No flashing content (< 3 flashes/second)

### Text Scaling

- Support up to 200% text scaling
- Use relative units (rem, em) for typography
- Ensure layouts don't break at larger sizes

---

## File Naming & Assets

### Asset Naming Convention

```
[component]-[variant]-[state]-[size].[ext]

Examples:
logo-purple-default.svg
btn-primary-hover.png
icon-flame-24.svg
orb-high-energy.png
```

### Export Formats

| Asset Type | Format | Notes |
|------------|--------|-------|
| Logo | SVG | Vector, scalable |
| Icons | SVG | 24px artboard |
| Orb | PNG | With transparency |
| UI mockups | PNG | 2x resolution |
| Photos | JPG | Optimized, < 200KB |

### Asset Locations

```
/public
  /icons         # App icons, favicons
  /images        # Static images

/src
  /assets        # Imported assets
    /icons       # SVG icons
    /images      # Component images
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial brand guidelines |

---

*These guidelines are maintained by the BurnOut Design Agency. For questions or clarifications, contact the Creative Director.*
