# iOS Deployment Roadmap

> **Status:** Research & Planning (DO NOT IMPLEMENT YET)
> **Priority:** Future milestone
> **Last Updated:** 2026-02-01

---

## Current State

BurnOut is a **Progressive Web App (PWA)** built with:
- React 18 + TypeScript
- Vite build system
- Service Worker for offline support
- Already installable on iOS via "Add to Home Screen"

### PWA Limitations on iOS
- No push notifications (iOS 16.4+ has partial support)
- No background sync
- Limited storage (50MB quota)
- No App Store distribution
- Safari-only (no browser choice)

---

## iOS Deployment Options

### Option 1: Capacitor (Recommended)
**What:** Wrap existing React app in native iOS shell
**Effort:** Low-Medium (1-2 weeks)
**Pros:**
- Reuse 95%+ of existing codebase
- Full native API access (push notifications, storage, etc.)
- App Store distribution
- Same codebase for web + iOS + Android

**Cons:**
- Requires Xcode + Apple Developer account ($99/year)
- Some native UI doesn't feel 100% native
- Debugging can be complex

**Setup Steps:**
```bash
# 1. Install Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init BurnOut com.burnout.app

# 2. Add iOS platform
npm install @capacitor/ios
npx cap add ios

# 3. Build web app and sync
npm run build
npx cap sync ios

# 4. Open in Xcode
npx cap open ios
```

### Option 2: Expo (React Native)
**What:** Rebuild using React Native with Expo framework
**Effort:** High (4-8 weeks)
**Pros:**
- True native performance
- Native UI components
- Large ecosystem
- OTA updates without App Store review

**Cons:**
- Significant rewrite required
- Different component library
- Two codebases to maintain (unless abandoning web)

### Option 3: Native iOS (Swift/SwiftUI)
**What:** Full native rebuild
**Effort:** Very High (8-16 weeks)
**Pros:**
- Best possible iOS experience
- Latest iOS features immediately
- No framework overhead

**Cons:**
- Complete rewrite
- iOS-only (no Android/web reuse)
- Requires iOS development expertise

### Option 4: Enhanced PWA
**What:** Maximize current PWA capabilities
**Effort:** Low (days)
**Pros:**
- No native development required
- Already works
- Single codebase

**Cons:**
- Still limited by iOS Safari restrictions
- No App Store presence
- Limited push notification support

---

## Recommended Path

### Phase 1: PWA Enhancement (Now)
- [x] Service Worker caching
- [x] Offline support
- [x] Add to Home Screen support
- [ ] Web Push Notifications (iOS 16.4+)
- [ ] Better iOS PWA splash screens

### Phase 2: Capacitor Preparation (Next)
- [ ] Set up Apple Developer account
- [ ] Configure app bundle ID
- [ ] Add Capacitor to project (but don't release)
- [ ] Test on iOS Simulator
- [ ] Document native plugin requirements

### Phase 3: App Store Submission (Future)
- [ ] App Store assets (icons, screenshots)
- [ ] Privacy policy & terms
- [ ] App Review guidelines compliance
- [ ] TestFlight beta testing
- [ ] Production release

---

## Apple Developer Requirements

### Account Setup
1. **Apple Developer Program** - $99/year
2. **D-U-N-S Number** (if publishing as organization)
3. **Apple ID** with two-factor authentication

### App Store Requirements
- App icon (1024x1024)
- Screenshots for each device size
- Privacy policy URL
- App description & keywords
- Age rating questionnaire
- Contact information

### Technical Requirements
- Xcode (latest stable)
- macOS (for building)
- iOS Simulator or physical device
- Code signing certificates
- Provisioning profiles

---

## Files to Create (When Ready)

```
ios/                          # Capacitor iOS project
├── App/
│   ├── App/
│   │   ├── Info.plist       # iOS app configuration
│   │   ├── Assets.xcassets/ # App icons
│   │   └── ...
│   └── App.xcodeproj/
capacitor.config.ts           # Capacitor configuration
```

---

## Notes

- **DO NOT** add Capacitor dependencies until explicitly approved
- **DO NOT** create Apple Developer account without approval
- This document is for planning only
- Update this document as requirements become clearer

---

*Documented by MiloX | 2026-02-01*
