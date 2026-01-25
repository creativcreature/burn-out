# Playbook 06: Production Deployment

## Overview
Deploy BurnOut as a PWA on Cloudflare Pages.

## Pre-Deployment Checklist

### Code Quality
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] `npm run build` succeeds
- [ ] No console.log statements
- [ ] No TODO comments in critical paths

### PWA Requirements
- [ ] manifest.json complete
- [ ] Service worker configured
- [ ] Icons all sizes present
- [ ] Offline page works
- [ ] Install prompt shows

### Visual Verification
- [ ] Orb looks identical
- [ ] Theme works on all pages
- [ ] Cards have glass effect
- [ ] Animations smooth

### Accessibility
- [ ] WCAG AA color contrast
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus indicators visible

## PWA Configuration

### manifest.json
```json
{
  "name": "BurnOut",
  "short_name": "BurnOut",
  "description": "Energy-aware productivity for neurodivergent users",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#ff6b35",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Vite PWA Plugin
```typescript
// vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  },
  manifest: {
    // ... manifest config
  }
})
```

## Cloudflare Pages Setup

### 1. Create Project
```bash
# Login to Cloudflare
npx wrangler login

# Create Pages project
npx wrangler pages project create burnout
```

### 2. Configure Build
In Cloudflare Dashboard → Pages → burnout:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node version | 18 |

### 3. Environment Variables
Set in Cloudflare Dashboard (if needed):
- No secrets should be in code
- API keys are user-provided, stored locally

### 4. Deploy
```bash
# Build
npm run build

# Deploy
npx wrangler pages deploy dist
```

## Deployment Commands

### Preview Deploy (branch)
```bash
npx wrangler pages deploy dist --branch preview
```

### Production Deploy
```bash
npx wrangler pages deploy dist
```

### Check Deployment Status
```bash
npx wrangler pages deployment list
```

### Rollback
```bash
# List deployments
npx wrangler pages deployment list

# Rollback to specific deployment
npx wrangler pages deployment rollback <deployment-id>
```

## Post-Deployment Verification

### 1. Basic Checks
- [ ] App loads at production URL
- [ ] No console errors
- [ ] Theme toggle works
- [ ] Data persists

### 2. PWA Checks
- [ ] Install prompt appears on mobile
- [ ] App installs correctly
- [ ] App works offline
- [ ] Icons display correctly

### 3. Performance Checks
```bash
# Run Lighthouse
npx lighthouse https://burnout.pages.dev --output html
```

Target scores:
- Performance: 90+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- PWA: 100

### 4. Cross-Browser Testing
- [ ] Chrome (desktop & mobile)
- [ ] Safari (desktop & iOS)
- [ ] Firefox
- [ ] Edge

## Monitoring

### Error Tracking
Consider adding:
- Sentry for error tracking
- Or simple console.error logging

### Analytics
If analytics needed:
- Privacy-focused options (Plausible, Simple Analytics)
- Or custom analytics stored locally

**Remember: No gamification in analytics display**

## Rollback Procedure

If issues discovered:

1. **Identify Issue**
   - Check error logs
   - Reproduce issue

2. **Decide Action**
   - Quick fix → Deploy fix
   - Major issue → Rollback

3. **Rollback**
   ```bash
   npx wrangler pages deployment rollback
   ```

4. **Communicate**
   - Document what happened
   - Plan proper fix

## Verification Summary

```
═══════════════════════════════════════
  Deployment Verification
═══════════════════════════════════════

URL: https://burnout.pages.dev

FUNCTIONAL
├─ App loads           ✓
├─ Theme toggle        ✓
├─ Data persistence    ✓
├─ Chat works          ✓
└─ PWA installs        ✓

PERFORMANCE
├─ Performance         [XX]/100
├─ Accessibility       [XX]/100
├─ Best Practices      [XX]/100
├─ SEO                 [XX]/100
└─ PWA                 [XX]/100

VISUAL
├─ Orb correct         ✓
├─ Cards correct       ✓
├─ Theme correct       ✓
└─ Animations smooth   ✓

═══════════════════════════════════════
  DEPLOYMENT: ✓ SUCCESS
═══════════════════════════════════════
```
