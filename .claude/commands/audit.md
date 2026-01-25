# /audit - Full Application Audit

Perform a comprehensive audit of the application.

## Audit Categories

### 1. Accessibility (WCAG AA)
- Color contrast ratios
- Keyboard navigation
- Screen reader compatibility
- Focus indicators
- Alt text for images
- ARIA labels

### 2. Performance
- Bundle size analysis
- Lighthouse scores
- Render performance
- Memory usage
- Network requests

### 3. Security
- Dependency vulnerabilities
- XSS prevention
- CSP headers
- Sensitive data exposure
- API key management

### 4. Code Quality
- TypeScript strict mode compliance
- ESLint violations
- Dead code detection
- Duplicate code
- Complex functions

### 5. PWA Compliance
- Service worker status
- Manifest validity
- Offline functionality
- Install prompt
- App icons

### 6. Visual Consistency
- Theme system coverage
- Design token usage
- Component library adoption
- Responsive breakpoints

## Report Format

```
═══════════════════════════════════════════════════════
  BurnOut Audit Report
  Generated: [DATE]
═══════════════════════════════════════════════════════

ACCESSIBILITY                           [SCORE]/100
├─ Color Contrast      ✓ Pass | ✗ [N] issues
├─ Keyboard Nav        ✓ Pass | ✗ [N] issues
├─ Screen Reader       ✓ Pass | ✗ [N] issues
└─ ARIA Labels         ✓ Pass | ✗ [N] issues

PERFORMANCE                             [SCORE]/100
├─ Bundle Size         [X] KB (limit: 500KB)
├─ Lighthouse          [X]/100
└─ Render Time         [X] ms

SECURITY                                [SCORE]/100
├─ Dependencies        ✓ 0 vulnerabilities | ✗ [N] found
├─ XSS Prevention      ✓ Pass | ✗ Issues
└─ API Keys            ✓ Secured | ✗ Exposed

CODE QUALITY                            [SCORE]/100
├─ TypeScript          ✓ 0 errors | ✗ [N] errors
├─ ESLint              ✓ 0 errors | ✗ [N] errors
└─ Duplicates          ✓ None | ✗ [N] found

PWA                                     [SCORE]/100
├─ Service Worker      ✓ Active | ✗ Missing
├─ Manifest            ✓ Valid | ✗ Invalid
└─ Offline             ✓ Works | ✗ Broken

═══════════════════════════════════════════════════════
  OVERALL SCORE: [SCORE]/100
═══════════════════════════════════════════════════════

[Detailed findings below]
```

## Notes
- Run full audit before major releases
- Address critical issues immediately
- Track audit scores over time
- Target: 90+ on all categories
