# /deploy - Deploy to Production

Build and deploy to Cloudflare Pages.

## Pre-deployment Checklist

- [ ] All tests pass
- [ ] TypeScript check passes
- [ ] ESLint check passes
- [ ] Build succeeds
- [ ] Version updated in VERSION.md
- [ ] CHANGELOG.md updated
- [ ] No console.log statements
- [ ] No TODO comments in critical paths

## Steps

1. **Run All Checks**
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   ```

2. **Build for Production**
   ```bash
   npm run build
   ```

3. **Preview Build (Optional)**
   ```bash
   npm run preview
   ```
   Test locally before deploying.

4. **Deploy to Cloudflare**
   ```bash
   npx wrangler pages deploy dist
   ```
   Or use Cloudflare Pages Git integration.

5. **Verify Deployment**
   - Check live URL
   - Test critical paths
   - Verify PWA installation
   - Check offline mode

6. **Report**
   ```
   ═══════════════════════════════════════
     Deployment Complete
   ═══════════════════════════════════════

   Version:     [version]
   Environment: Production
   URL:         https://burnout.pages.dev

   Deployment verified:
   ✓ App loads
   ✓ Theme toggle works
   ✓ Data persists
   ✓ PWA installs
   ✓ Offline works

   ═══════════════════════════════════════
   ```

## Rollback

If issues discovered post-deploy:
```bash
npx wrangler pages deployment rollback
```

## Notes
- Never deploy on Fridays
- Monitor error rates after deploy
- Keep previous 3 deployments available
- Document any manual steps required
