# iOS App Store Deployment Roadmap

> **Status:** 📋 PLANNING — Do not execute yet
> **Purpose:** Document the proper, buttoned-up path to iOS App Store
> **Created:** 2026-02-01 by @miloshh_bot

---

## Executive Summary

BurnOut is currently a **Progressive Web App (PWA)**. To get on the iOS App Store, we need to wrap it with **Capacitor** (recommended) and go through Apple's submission process.

**Timeline estimate:** 2-4 weeks (first submission)
**Cost:** $99/year (Apple Developer Program)

---

## Two Paths to iOS

### Path A: PWA Only (Current State)
✅ Already works — users can "Add to Home Screen"

**Pros:**
- No App Store fees
- Instant updates (no review process)
- Already deployed

**Cons:**
- No App Store discoverability
- Limited push notifications on iOS
- No access to some native APIs
- Users must manually add to home screen

### Path B: Capacitor → App Store (Recommended)
Wrap the React app in a native iOS shell.

**Pros:**
- App Store presence and discoverability
- Full push notification support
- Access to native APIs (haptics, camera, etc.)
- Professional presence

**Cons:**
- $99/year developer fee
- 1-7 day review times for updates
- Must follow Apple's guidelines strictly

---

## Prerequisites Checklist

### 1. Apple Developer Account
- [ ] **Enroll in Apple Developer Program** — $99/year
  - URL: https://developer.apple.com/programs/enroll/
  - Requires Apple ID
  - Individual or Organization (org needs D-U-N-S number)
- [ ] **Verify enrollment** — Can take 24-48 hours

### 2. Development Environment
- [ ] **Mac computer required** — Xcode only runs on macOS
  - Alternative: Mac in cloud (MacStadium, AWS EC2 Mac)
- [ ] **Xcode installed** — Latest version from App Store
- [ ] **CocoaPods installed** — `sudo gem install cocoapods`

### 3. App Identity
- [ ] **Bundle ID** — e.g., `com.burnout.app`
- [ ] **App Name** — "BurnOut" (check availability)
- [ ] **App Icon** — 1024x1024px required
- [ ] **Screenshots** — Multiple device sizes required

---

## Technical Setup (Capacitor)

### Step 1: Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "BurnOut" "com.burnout.app"
```

### Step 2: Add iOS Platform
```bash
npm install @capacitor/ios
npx cap add ios
```

### Step 3: Build & Sync
```bash
npm run build
npx cap sync ios
```

### Step 4: Open in Xcode
```bash
npx cap open ios
```

---

## App Store Requirements

### Privacy Manifest (Required since May 2024)
Capacitor apps must include privacy manifest file declaring:
- Data collection practices
- API usage reasons (filesystem, preferences, etc.)

**File:** `ios/App/PrivacyInfo.xcprivacy`

Reference: https://capacitorjs.com/docs/ios/privacy-manifest

### App Store Connect Metadata
- [ ] App description (4000 chars max)
- [ ] Keywords (100 chars)
- [ ] Support URL
- [ ] Privacy Policy URL (required)
- [ ] Marketing URL (optional)
- [ ] Screenshots for each device size
- [ ] App preview video (optional)

### Review Guidelines Compliance
- [ ] No placeholder content
- [ ] No broken links
- [ ] Functional offline mode OR graceful error handling
- [ ] No private API usage
- [ ] Content appropriate for age rating

---

## Certificates & Provisioning

### Certificates Needed
1. **iOS Distribution Certificate** — Signs the app
2. **Push Notification Certificate** — If using push (optional)

### Provisioning Profiles
1. **Development** — For testing on devices
2. **App Store Distribution** — For submission

All managed in Apple Developer Portal → Certificates, IDs & Profiles

---

## Submission Process

### 1. Archive Build
In Xcode: Product → Archive

### 2. Upload to App Store Connect
Use Xcode Organizer or `xcrun altool`

### 3. Submit for Review
- Select build in App Store Connect
- Complete all metadata
- Submit

### 4. Review Timeline
- **First submission:** 1-7 days (often 24-48 hours)
- **Updates:** Usually 24 hours
- **Rejections:** Common for first-timers, fixable

---

## Common Rejection Reasons

1. **Crashes or bugs** — Test thoroughly
2. **Incomplete metadata** — Fill everything out
3. **Placeholder content** — No lorem ipsum
4. **Privacy policy missing** — Required
5. **Login required without demo account** — Provide test credentials
6. **Guideline 4.2** — "Minimum functionality" (app must do something useful)

---

## Estimated Timeline

| Phase | Duration | Notes |
|-------|----------|-------|
| Apple Developer enrollment | 1-2 days | Verification time |
| Capacitor setup | 1-2 hours | Technical setup |
| Certificates & provisioning | 1-2 hours | First time is confusing |
| App icons & screenshots | 2-4 hours | Design work |
| Privacy policy | 1-2 hours | Legal boilerplate |
| First build & test | 2-4 hours | Debug iOS-specific issues |
| Submission | 1-2 hours | Metadata entry |
| Review wait | 1-7 days | Apple's queue |
| **TOTAL** | **2-4 weeks** | First submission |

---

## Cost Breakdown

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer Program | $99 | Annual |
| Mac (if needed) | $999+ or $50-100/mo cloud | One-time or monthly |
| Domain for privacy policy | ~$12 | Annual |
| **TOTAL YEAR 1** | **~$110-150** | (if you have a Mac) |

---

## Recommended Preparation (Do Now)

### Phase 0: Pre-work (No Apple account needed)

1. **Create Privacy Policy page**
   - Host at burnoutapp.vercel.app/privacy
   - Use a template, customize for your data practices

2. **Design App Icon**
   - 1024x1024px master
   - Simple, recognizable
   - Test at small sizes (60x60)

3. **Prepare Screenshots**
   - iPhone 6.7" (1290 x 2796)
   - iPhone 6.5" (1284 x 2778)
   - iPhone 5.5" (1242 x 2208)
   - iPad Pro 12.9" (2048 x 2732)

4. **Write App Store Description**
   - Tagline (30 chars)
   - Description (4000 chars)
   - Keywords (100 chars)

5. **Add Capacitor to project**
   - Can do without Mac
   - iOS build requires Mac later

---

## File Structure After Capacitor

```
burnout-app/
├── src/                    # React app (unchanged)
├── public/
├── ios/                    # NEW - Xcode project
│   ├── App/
│   │   ├── App.xcodeproj
│   │   ├── PrivacyInfo.xcprivacy
│   │   └── ...
│   └── Pods/
├── capacitor.config.ts     # NEW - Capacitor config
└── package.json
```

---

## Next Steps

1. ⏳ **Wait for X approval** to proceed
2. 📋 Complete "Phase 0: Pre-work" items
3. 💳 When ready, enroll in Apple Developer Program
4. 🔧 Set up Capacitor and build
5. 🚀 Submit to App Store

---

## References

- [Capacitor iOS Docs](https://capacitorjs.com/docs/ios)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Privacy Manifest Requirements](https://capacitorjs.com/docs/ios/privacy-manifest)

---

*Roadmap by @miloshh_bot | 2026-02-01*
*Status: PLANNING — Awaiting X approval to proceed*
