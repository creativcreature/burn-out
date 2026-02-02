# Burn Out Mode — When You're Overwhelmed

> **Purpose:** A refuge for when everything feels like too much
> **Trigger:** Manual activation or detected stress signals
> **Philosophy:** Less is more. Simplify to survive.
> **Created:** 2026-02-01

---

## What is Burn Out Mode?

When a user is overwhelmed, the normal task view can make things worse. Burn Out Mode strips away everything non-essential and focuses on **one thing at a time** with maximum gentleness.

---

## Triggers

### Manual Activation
- Tap flame icon → "Feeling overwhelmed?" → Activate
- Long-press flame icon → Instant activation
- Tell AI: "I'm burnt out" / "I can't do this" / "too much"

### Smart Detection (Optional/Future)
- Multiple skipped tasks in a row
- Frequent app opens without completing anything
- User explicitly marks energy as "empty"

---

## What Changes in Burn Out Mode

### Visual
| Normal | Burn Out Mode |
|--------|---------------|
| Multiple tasks visible | ONE task visible |
| Full navigation | Minimal/hidden nav |
| Bright orb glow | Dimmed, calming orb |
| Normal colors | Softer, muted palette |
| All UI elements | Only essential elements |

### Functional
| Normal | Burn Out Mode |
|--------|---------------|
| Task list | Single task focus |
| Swipe complete/skip | Just "Done" or "Not now" |
| Quick add | Disabled (no new stress) |
| Goals visible | Hidden |
| Time estimates | Hidden |
| Energy levels | Hidden |

### Messaging
Warm, supportive copy:
- "one thing at a time"
- "no pressure"  
- "it's okay to rest"
- "you don't have to do everything"

---

## UI Design

### Burn Out Mode Screen

```
┌─────────────────────────────────┐
│                                 │
│     (dimmed orb, slow pulse)    │
│                                 │
│                                 │
│       hey, it's okay            │
│                                 │
│   ┌─────────────────────────┐   │
│   │                         │   │
│   │    [single task here]   │   │
│   │                         │   │
│   └─────────────────────────┘   │
│                                 │
│    [done]     [not right now]   │
│                                 │
│                                 │
│         need a break?           │
│         [rest instead]          │
│                                 │
└─────────────────────────────────┘
```

### After Completing a Task

```
┌─────────────────────────────────┐
│                                 │
│     (gentle pulse animation)    │
│                                 │
│                                 │
│        you did it ♡             │
│                                 │
│    that's enough for now        │
│    or keep going if you want    │
│                                 │
│   [one more]     [i'm done]     │
│                                 │
└─────────────────────────────────┘
```

### Rest Mode (From "rest instead")

```
┌─────────────────────────────────┐
│                                 │
│     (very slow breathing orb)   │
│                                 │
│                                 │
│      take all the time          │
│         you need                │
│                                 │
│       nothing is urgent         │
│                                 │
│                                 │
│         [i'm ready]             │
│                                 │
└─────────────────────────────────┘
```

---

## Task Selection in Burn Out Mode

When in Burn Out Mode, the app picks ONE task based on:

1. **Lowest energy requirement** — Don't ask for what they don't have
2. **Shortest time estimate** — Quick wins build momentum
3. **No deadlines** — Remove time pressure
4. **Already in progress** — Continuity over context switching

If no suitable task exists:
```
there's nothing gentle enough right now
let's just rest
```

---

## Exiting Burn Out Mode

### Manual Exit
- "I'm feeling better" button (appears after completing 1-3 tasks)
- Long-press flame icon
- Tell AI: "I'm okay now"

### Gradual Transition
After 3-5 completed tasks in Burn Out Mode:
```
you're doing great
ready to see more options?

[yes, show me more]    [stay here]
```

### Automatic (Optional)
- After 2 hours of rest
- Next day (fresh start)

---

## AI Integration

The AI should recognize burn out signals:

**Trigger phrases:**
- "I can't"
- "too much"
- "overwhelmed"
- "burnt out"
- "I give up"
- "stressed"
- "everything is too hard"

**AI Response:**
```
hey, i hear you.
let's slow everything down.

[enter burn out mode]
```

In Burn Out Mode, AI is extra gentle:
- Shorter responses
- No suggestions unless asked
- Encouragement focused
- "it's okay" energy

---

## Sound Design (If Applicable)

- Slower, softer notification sounds
- Optional: Ambient breathing/meditation background
- Success sounds: Gentle chime, not celebration

---

## Data Tracking (Private)

Track (for improving the feature, not gamification):
- How often activated
- Duration of sessions
- Tasks completed in mode
- Exit reason (manual, gradual, rest)

**Never show this to user.** This is for improving the feature.

---

## Implementation Priority

### Phase 1: Core Mode
- [ ] Flame icon → "Overwhelmed?" flow
- [ ] Single task view
- [ ] Done / Not now buttons
- [ ] Dimmed visual treatment
- [ ] Exit flow

### Phase 2: Polish
- [ ] Rest mode
- [ ] AI integration
- [ ] Gradual exit prompt
- [ ] Softer animations

### Phase 3: Smart Features
- [ ] Auto-detection
- [ ] Time-based exit
- [ ] Analytics (private)

---

## Copy Bank

### Entering
- "let's slow down"
- "one thing at a time"
- "no pressure at all"
- "just breathe"

### During
- "whenever you're ready"
- "this is the only thing that matters right now"
- "everything else can wait"

### Completing Task
- "you did it"
- "that's amazing"
- "one step at a time"
- "proud of you"

### Rest Mode
- "rest is productive too"
- "take all the time you need"
- "the tasks will be here when you're ready"
- "it's okay to stop"

### Exiting
- "welcome back"
- "feeling better?"
- "you've got this"

---

## Anti-Patterns to Avoid

❌ "You've been in burn out mode for 2 hours!" (shame)
❌ Showing task count remaining (pressure)
❌ Notifications while in mode (interruption)
❌ "Are you sure?" when choosing rest (judgment)
❌ Any gamification (points, streaks)

---

## Accessibility

- Larger touch targets
- High contrast (even in dimmed mode)
- Screen reader: "Burn out mode active. One task shown: [task]. Options: Done, or Not right now."
- Respect reduced motion preferences

---

*Spec by @miloshh_bot | 2026-02-01*
*"You are not your productivity."*
