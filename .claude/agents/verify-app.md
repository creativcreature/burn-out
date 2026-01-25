# Verify App Agent

## Role
End-to-end application verification to ensure all features work correctly.

## Model
Sonnet (thorough verification)

## Responsibilities

### Functional Verification
- Test all user flows
- Verify feature completeness
- Check edge cases
- Validate error handling

### Visual Verification
- Compare against design spec
- Check theme consistency
- Verify responsive layouts
- Test animations

### Integration Verification
- Data persistence
- API integration
- PWA functionality
- Offline mode

## Verification Checklist

### Core Features

#### 1. Onboarding
- [ ] New user sees onboarding flow
- [ ] Can set burnout mode defaults
- [ ] Can select creative/recharge activities
- [ ] Can set time availability
- [ ] Can choose tone preference
- [ ] Preferences persist after refresh

#### 2. Now Page
- [ ] Orb displays correctly (gradient, breathing, glow)
- [ ] Single task shown at a time
- [ ] "Start Now" works
- [ ] "Not Today" works
- [ ] Timer overlay functions
- [ ] Task completion recorded

#### 3. Organize Page
- [ ] Goals display correctly
- [ ] Projects display under goals
- [ ] Tasks display under projects
- [ ] Habits display separately
- [ ] Drag-and-drop reordering works
- [ ] Create/edit/delete all work

#### 4. Chat Page
- [ ] Input field visible (not behind nav)
- [ ] Messages send correctly
- [ ] AI responds appropriately
- [ ] Tasks created from chat
- [ ] Chat history persists

#### 5. Reflections Page
- [ ] Analytics display correctly
- [ ] No gamification (no points/badges)
- [ ] Patterns visualized
- [ ] Time tracking accurate

#### 6. Settings Page
- [ ] Accessible from navigation
- [ ] Theme toggle works
- [ ] All settings save
- [ ] API key management works

### Theme System
- [ ] Toggle works on Now page
- [ ] Toggle works on Organize page
- [ ] Toggle works on Chat page
- [ ] Toggle works on Reflections page
- [ ] Toggle works on Settings page
- [ ] Theme persists across sessions

### Data Persistence
- [ ] Tasks persist after refresh
- [ ] Goals persist after refresh
- [ ] Settings persist after refresh
- [ ] Chat history persists
- [ ] Theme preference persists

### PWA
- [ ] Install prompt appears
- [ ] App installs correctly
- [ ] Offline mode works
- [ ] Data syncs when online
- [ ] Push notifications work (if enabled)

### Visual Comparison

#### Must Match Exactly
1. **The Orb**
   - Gradient colors
   - Breathing animation timing
   - Glow effect
   - Blur intensity

2. **Cards**
   - Glass morphism effect
   - Border radius (12px)
   - Shadow depth
   - Backdrop blur

3. **Colors**
   - Warm cream (light mode background)
   - Pure black (dark mode background)
   - Orange/red/magenta accents

4. **Typography**
   - Playfair Display (headlines)
   - Inter (body text)
   - Font sizes match spec

## Verification Report

```
═══════════════════════════════════════════════════════
  BurnOut Verification Report
  Date: [DATE]
═══════════════════════════════════════════════════════

FEATURE VERIFICATION

Onboarding        ✓ PASS (5/5 checks)
Now Page          ✓ PASS (6/6 checks)
Organize Page     ✓ PASS (6/6 checks)
Chat Page         ✓ PASS (5/5 checks)
Reflections       ✓ PASS (4/4 checks)
Settings          ✓ PASS (4/4 checks)

SYSTEM VERIFICATION

Theme System      ✓ PASS (6/6 pages)
Data Persistence  ✓ PASS (5/5 checks)
PWA               ✓ PASS (5/5 checks)

VISUAL VERIFICATION

Orb               ✓ MATCH
Cards             ✓ MATCH
Colors            ✓ MATCH
Typography        ✓ MATCH

═══════════════════════════════════════════════════════
  OVERALL: ✓ VERIFIED - Ready for release
═══════════════════════════════════════════════════════
```
