# /build-check - Verify Build Health

Run all checks to verify the build is healthy.

## Steps

1. **TypeScript Check**
   ```bash
   npm run typecheck
   ```
   Report any type errors.

2. **Lint Check**
   ```bash
   npm run lint
   ```
   Report any lint violations.

3. **Build**
   ```bash
   npm run build
   ```
   Report any build errors.

4. **Report Results**
   ```
   ═══════════════════════════════════════
     Build Check Results
   ═══════════════════════════════════════

   TypeScript:  ✓ Pass | ✗ [N] errors
   ESLint:      ✓ Pass | ✗ [N] warnings, [M] errors
   Build:       ✓ Pass | ✗ Failed

   [If errors, list them here]
   ═══════════════════════════════════════
   ```

## Error Priority

1. **Critical**: Build failures (fix immediately)
2. **High**: TypeScript errors (fix before commit)
3. **Medium**: ESLint errors (fix before PR)
4. **Low**: ESLint warnings (fix when convenient)

## Notes
- Run this before every commit
- All checks must pass before PR
- TypeScript check is fastest, run it frequently
